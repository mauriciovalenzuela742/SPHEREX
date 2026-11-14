"""Lector rápido: solo los píxeles necesarios, por rangos HTTP (D2).

El servicio de recortes manda ~4 MB por imagen y casi todo es la PSF (EPSF), que el visor no usa.
Aquí se pide al archivo original solo lo necesario:
  1. La cabecera de IMAGE (0–28 KB) y la tabla WCS-WAVE de la cola (últimos 22 KB), en paralelo.
  2. Si hace falta la varianza: la cabecera de FLAGS (justo después de los datos de IMAGE; viene
     comprimida, ocupa NAXIS1·NAXIS2 + PCOUNT) y luego la de VARIANCE. Verificado el 14-nov-2026.
  3. Las filas de IMAGE (y de VARIANCE) que cubren el recorte, en un solo pedido multi-rango.
La estructura de cada archivo (pasos 1–2) queda en caché: volver a leerlo cuesta un solo pedido.

Medido el 14-nov-2026 (Barnard, 6 bandas, 28 imágenes, sin caché): 11,1 s y 2,1 MB frente a 97,7 s
y 112 MB con recortes; misma imagen (correlación ≥ 0,9996). Sin ZODI: se resta la mediana del
recorte (diferencia medida en 200 recortes: 0,07 veces el ruido). Sin FLAGS: contaminación en None.
"""

from __future__ import annotations

import io
import re
import threading
from concurrent.futures import ThreadPoolExecutor

import httpx
import numpy as np
from astropy.io import fits
from astropy.wcs import WCS

from app.irsa import cache
from app.irsa.config import CUTOUTS_EN_PARALELO
from app.irsa.descarga import pedir

from .procesar import Fotograma, coordenadas_entrada, lambda_en, reproyectar

BLOQUE = 2880
# IRSA ignora el pedido multi-rango si trae demasiados rangos y manda el archivo entero (65 MB):
# con 152 rangos pasó (14-nov-2026); con 76 no. Se parte en tandas de este tamaño, en paralelo.
MAX_RANGOS_POR_PEDIDO = 64
_SEMAFORO = threading.BoundedSemaphore(CUTOUTS_EN_PARALELO)


def _rango(url: str, rango: str) -> httpx.Response:
    with _SEMAFORO:
        r = pedir(url, headers={"Range": rango})
    if r.status_code != 206:  # un 200 sería el archivo entero (65 MB): no se acepta
        raise RuntimeError(f"IRSA no sirvió el rango ({r.status_code})")
    return r


def _bloques(nbytes: int) -> int:
    return (nbytes + BLOQUE - 1) // BLOQUE * BLOQUE


def separar_cabeceras(b: bytes, cuantas: int = 2) -> tuple[list[fits.Header], int]:
    """Lee `cuantas` cabeceras seguidas sin datos entre ellas. Devuelve las cabeceras y el byte
    donde termina la última (relativo al inicio de `b`)."""
    off, cabs = 0, []
    for _ in range(cuantas):
        fin = next(
            (
                k + BLOQUE
                for k in range(off, len(b), BLOQUE)
                if any(b[k + c : k + c + 8] == b"END     " for c in range(0, BLOQUE, 80))
            ),
            None,
        )
        if fin is None:
            raise RuntimeError("cabecera más larga de lo leído")
        cabs.append(fits.Header.fromstring(b[off:fin].decode("ascii")))
        off = fin
    return cabs, off


def tamano_datos(cab: fits.Header) -> int:
    """Bytes de datos de una extensión (imagen o tabla binaria), sin el relleno."""
    n = abs(cab["BITPIX"]) // 8
    for i in range(1, cab.get("NAXIS", 0) + 1):
        n *= cab[f"NAXIS{i}"]
    return n + cab.get("PCOUNT", 0)


def leer_wcs_wave(cola: bytes) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    i = cola.rfind(b"XTENSION= 'BINTABLE'")
    if i < 0:
        raise RuntimeError("no se encontró WCS-WAVE en la cola del archivo")
    primaria = fits.PrimaryHDU().header.tostring().encode()
    with fits.open(io.BytesIO(primaria + cola[i:])) as h:
        if h[1].name != "WCS-WAVE":
            raise RuntimeError("la última extensión no es WCS-WAVE")
        t = h[1].data
        x, y, v = t["X"][0], t["Y"][0], t["VALUES"][0]
        return np.asarray(x, float), np.asarray(y, float), np.asarray(v, float)


def separar_multipart(
    contenido: bytes, content_type: str, rangos: list[tuple[int, int]]
) -> list[bytes]:
    """Cuerpo multipart/byteranges -> una porción de bytes por rango, en el orden pedido."""
    if len(rangos) == 1 and "multipart" not in content_type:
        return [contenido]
    m = re.search(r"boundary=([^\s;]+)", content_type)
    if not m:
        raise RuntimeError(f"respuesta sin multipart ({content_type})")
    partes = {}
    for parte in contenido.split(b"--" + m.group(1).strip('"').encode()):
        cab, _, cuerpo = parte.partition(b"\r\n\r\n")
        cr = re.search(rb"Content-Range:\s*bytes (\d+)-(\d+)/", cab, re.I)
        if cr:
            a, z = int(cr.group(1)), int(cr.group(2))
            partes[a] = cuerpo[: z - a + 1]
    return [partes[a] for a, _ in rangos]


# ---------------------------------------------------------------------------------------------
# Estructura del archivo (dónde empieza cada parte), guardada en caché
# ---------------------------------------------------------------------------------------------


class Estructura:
    def __init__(self, d: dict):
        self.d = d
        self.cab = fits.Header.fromstring(d["cab_img"])
        self.wcs = WCS(self.cab)
        self.xs, self.ys, self.vals = np.array(d["xs"]), np.array(d["ys"]), np.array(d["vals"])

    @property
    def tiene_varianza(self) -> bool:
        return "off_var" in self.d


def _ubicar_varianza(url: str, d: dict) -> None:
    cab = fits.Header.fromstring(d["cab_img"])
    off_flags = d["off_img"] + _bloques(tamano_datos(cab))
    cf, fin = separar_cabeceras(_rango(url, f"bytes={off_flags}-{off_flags + 28799}").content, 1)
    if cf[0].get("EXTNAME", "").strip() != "FLAGS":
        raise RuntimeError("después de IMAGE no viene FLAGS")
    off_vcab = off_flags + fin + _bloques(tamano_datos(cf[0]))
    cv, finv = separar_cabeceras(_rango(url, f"bytes={off_vcab}-{off_vcab + 28799}").content, 1)
    if cv[0].get("EXTNAME", "").strip() != "VARIANCE":
        raise RuntimeError("después de FLAGS no viene VARIANCE")
    d.update(
        off_var=off_vcab + finv,
        bitpix_var=cv[0]["BITPIX"],
        bscale_var=cv[0].get("BSCALE", 1.0),
        bzero_var=cv[0].get("BZERO", 0.0),
    )


def estructura(url: str, con_varianza: bool = False) -> Estructura:
    nombre = f"{cache.clave(url, 'estructura')}.json"
    d = cache.leer_json("estructura", nombre)
    nuevo = d is None
    if nuevo:
        with ThreadPoolExecutor(2) as ex:
            f_cab = ex.submit(_rango, url, "bytes=0-28799")
            f_cola = ex.submit(_rango, url, "bytes=-23040")
            cabs, off = separar_cabeceras(f_cab.result().content, 2)
            xs, ys, vals = leer_wcs_wave(f_cola.result().content)
        if cabs[1].get("EXTNAME", "").strip() != "IMAGE":
            raise RuntimeError("la 2.ª extensión no es IMAGE")
        d = {
            "cab_img": cabs[1].tostring(),
            "off_img": off,
            "xs": xs.tolist(),
            "ys": ys.tolist(),
            "vals": vals.tolist(),
        }
    if con_varianza and "off_var" not in d:
        _ubicar_varianza(url, d)
        nuevo = True
    if nuevo:
        cache.guardar_json("estructura", nombre, d)
    return Estructura(d)


def leer_cajas(
    url: str, est: Estructura, x0: int, x1: int, y0: int, y1: int, con_varianza: bool = False
) -> tuple[np.ndarray, np.ndarray | None]:
    """Píxeles de IMAGE (y VARIANCE) en [y0..y1] × [x0..x1], en un solo pedido multi-rango."""
    cab = est.cab
    nx, bpp = cab["NAXIS1"], abs(cab["BITPIX"]) // 8
    partes = [
        ("img", est.d["off_img"], cab["BITPIX"], cab.get("BSCALE", 1.0), cab.get("BZERO", 0.0))
    ]
    if con_varianza:
        d = est.d
        partes.append(("var", d["off_var"], d["bitpix_var"], d["bscale_var"], d["bzero_var"]))
    rangos, quien = [], []
    for nombre, off, *_ in partes:
        for y in range(y0, y1 + 1):
            rangos.append((off + (y * nx + x0) * bpp, off + (y * nx + x1 + 1) * bpp - 1))
            quien.append(nombre)
    tandas = [
        rangos[i : i + MAX_RANGOS_POR_PEDIDO] for i in range(0, len(rangos), MAX_RANGOS_POR_PEDIDO)
    ]

    def pedir_tanda(tanda: list[tuple[int, int]]) -> list[bytes]:
        r = _rango(url, "bytes=" + ",".join(f"{a}-{b}" for a, b in tanda))
        return separar_multipart(r.content, r.headers.get("content-type", ""), tanda)

    with ThreadPoolExecutor(len(tandas)) as ex:
        trozos = [t for parte in ex.map(pedir_tanda, tandas) for t in parte]
    salida = {}
    for nombre, _, bitpix, bscale, bzero in partes:
        tipo = {-32: ">f4", -64: ">f8"}[bitpix]
        filas = [np.frombuffer(t, tipo) for t, q in zip(trozos, quien, strict=True) if q == nombre]
        salida[nombre] = np.stack(filas).astype(float) * bscale + bzero
    return salida["img"], salida.get("var")


# ---------------------------------------------------------------------------------------------
# Fotograma reproyectado (para /api/frames)
# ---------------------------------------------------------------------------------------------


def leer(
    epoca: dict, banda: int, ra: float, dec: float, n: int, con_varianza: bool = False
) -> Fotograma:
    url = epoca["access_url"]
    clave = cache.clave(url, round(ra, 6), round(dec, 6), n, con_varianza)
    ruta = cache.ruta("rapido", f"{clave}.npz")
    epoch_id = f"{epoca['id']}D{banda}"
    if ruta.exists():
        z = np.load(ruta)
        lam, ancho = float(z["lam"]), float(z["ancho"])
        return Fotograma(
            epoch_id,
            epoca["t"],
            epoca["t_mjd"],
            epoca["collection"],
            z["datos"],
            z["cob"],
            lam if np.isfinite(lam) else None,
            ancho if np.isfinite(ancho) else None,
            None,
            "rangos",
            varianza=z["var"] if "var" in z.files else None,
        )

    est = estructura(url, con_varianza)
    nx, ny = est.cab["NAXIS1"], est.cab["NAXIS2"]
    xi, yi = coordenadas_entrada(est.wcs, ra, dec, n)
    x0, x1 = max(0, int(np.floor(np.nanmin(xi))) - 1), min(nx - 1, int(np.ceil(np.nanmax(xi))) + 1)
    y0, y1 = max(0, int(np.floor(np.nanmin(yi))) - 1), min(ny - 1, int(np.ceil(np.nanmax(yi))) + 1)
    if x0 > x1 or y0 > y1:
        raise ValueError("el punto cae fuera del detector")
    sub, var = leer_cajas(url, est, x0, x1, y0, y1, con_varianza)

    rep, cob = reproyectar(sub, xi, yi, x0, y0, forma_total=(ny, nx))
    rep -= np.nanmedian(rep)  # en lugar de ZODI
    var_rep = None
    if var is not None:
        var_rep = reproyectar(var, xi, yi, x0, y0, forma_total=(ny, nx))[0]
    xt, yt = est.wcs.all_world2pix([[ra, dec]], 0)[0]
    lam, ancho = lambda_en(est.cab, est.xs, est.ys, est.vals, xt, yt)

    extra = {"var": var_rep} if var_rep is not None else {}
    buf = io.BytesIO()
    np.savez_compressed(buf, datos=rep, cob=cob, lam=lam, ancho=ancho, **extra)
    cache.escribir_atomico(ruta, buf.getvalue())
    return Fotograma(
        epoch_id,
        epoca["t"],
        epoca["t_mjd"],
        epoca["collection"],
        rep,
        cob,
        lam,
        ancho,
        None,
        "rangos",
        varianza=var_rep,
    )
