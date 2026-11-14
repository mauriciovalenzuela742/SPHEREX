"""Lector rápido: solo los píxeles de IMAGE alrededor del objeto, por rangos HTTP (D2).

El servicio de recortes manda ~4 MB por imagen y casi todo es la PSF (extensión EPSF), que el visor no usa.
Aquí se pide al archivo original: la cabecera (0–28 KB), la tabla WCS-WAVE de la cola (últimos 22 KB) y, en
un solo pedido multi-rango, las filas de IMAGE que cubren el recorte.

Medido el 14-nov-2026 (Barnard, 6 bandas, 28 imágenes, sin caché, 3 en paralelo): 11,1 s y 2,1 MB frente a
97,7 s y 112 MB con recortes; misma imagen (correlación ≥ 0,9996).
Sin ZODI: se resta la mediana del recorte (diferencia medida en 200 recortes: 0,07 veces el ruido).
Sin FLAGS: viene comprimida en el archivo original; `flagged_fraction` queda en None.
"""

from __future__ import annotations

import io
import re
import threading

import httpx
import numpy as np
from astropy.io import fits
from astropy.wcs import WCS

from app.irsa import cache
from app.irsa.config import CUTOUTS_EN_PARALELO
from app.irsa.descarga import pedir

from .procesar import Fotograma, coordenadas_entrada, lambda_en, reproyectar

BLOQUE = 2880
_SEMAFORO = threading.BoundedSemaphore(CUTOUTS_EN_PARALELO)


def _rango(url: str, rango: str) -> httpx.Response:
    with _SEMAFORO:
        r = pedir(url, headers={"Range": rango})
    if r.status_code != 206:  # un 200 sería el archivo entero (65 MB): no se acepta
        raise RuntimeError(f"IRSA no sirvió el rango ({r.status_code})")
    return r


def separar_cabeceras(b: bytes, cuantas: int = 2) -> tuple[list[fits.Header], int]:
    """Lee `cuantas` cabeceras seguidas (la PRIMARY no tiene datos). Devuelve las cabeceras y el byte
    donde termina la última (= inicio de los datos de IMAGE)."""
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


def cabecera_image(url: str) -> tuple[fits.Header, int]:
    cabs, off = separar_cabeceras(_rango(url, "bytes=0-28799").content)
    if cabs[1].get("EXTNAME", "").strip() != "IMAGE":
        raise RuntimeError("la 2.ª extensión no es IMAGE")
    return cabs[1], off


def leer_wcs_wave(cola: bytes) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    i = cola.rfind(b"XTENSION= 'BINTABLE'")
    if i < 0:
        raise RuntimeError("no se encontró WCS-WAVE en la cola del archivo")
    primaria = fits.PrimaryHDU().header.tostring().encode()
    with fits.open(io.BytesIO(primaria + cola[i:])) as h:
        if h[1].name != "WCS-WAVE":
            raise RuntimeError("la última extensión no es WCS-WAVE")
        t = h[1].data
        return (
            np.asarray(t["X"][0], float),
            np.asarray(t["Y"][0], float),
            np.asarray(t["VALUES"][0], float),
        )


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


def leer(epoca: dict, banda: int, ra: float, dec: float, n: int) -> Fotograma:
    url = epoca["access_url"]
    ruta = cache.ruta("rapido", f"{cache.clave(url, round(ra, 6), round(dec, 6), n)}.npz")
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
        )

    from concurrent.futures import ThreadPoolExecutor

    with ThreadPoolExecutor(2) as ex:
        f_cab = ex.submit(cabecera_image, url)
        f_cola = ex.submit(_rango, url, "bytes=-23040")
        cab, off = f_cab.result()
        xs, ys, vals = leer_wcs_wave(f_cola.result().content)

    nx, ny, bpp = cab["NAXIS1"], cab["NAXIS2"], abs(cab["BITPIX"]) // 8
    w_in = WCS(cab)
    xi, yi = coordenadas_entrada(w_in, ra, dec, n)
    x0, x1 = max(0, int(np.floor(np.nanmin(xi))) - 1), min(nx - 1, int(np.ceil(np.nanmax(xi))) + 1)
    y0, y1 = max(0, int(np.floor(np.nanmin(yi))) - 1), min(ny - 1, int(np.ceil(np.nanmax(yi))) + 1)
    if x0 > x1 or y0 > y1:
        raise ValueError("el punto cae fuera del detector")
    rangos = [
        (off + (y * nx + x0) * bpp, off + (y * nx + x1 + 1) * bpp - 1) for y in range(y0, y1 + 1)
    ]
    r = _rango(url, "bytes=" + ",".join(f"{a}-{b}" for a, b in rangos))
    filas = separar_multipart(r.content, r.headers.get("content-type", ""), rangos)
    tipo = {-32: ">f4", -64: ">f8"}[cab["BITPIX"]]
    sub = np.stack([np.frombuffer(f, dtype=tipo) for f in filas]).astype(float)
    sub = sub * cab.get("BSCALE", 1.0) + cab.get("BZERO", 0.0)

    rep, cob = reproyectar(sub, xi, yi, x0, y0, forma_total=(ny, nx))
    rep -= np.nanmedian(rep)  # en lugar de ZODI
    xt, yt = w_in.all_world2pix([[ra, dec]], 0)[0]
    lam, ancho = lambda_en(cab, xs, ys, vals, xt, yt)

    ruta.parent.mkdir(parents=True, exist_ok=True)
    buf = io.BytesIO()
    np.savez_compressed(buf, datos=rep, cob=cob, lam=lam, ancho=ancho)
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
    )
