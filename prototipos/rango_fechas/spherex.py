"""Lógica del prototipo: buscar en IRSA, pedir recortes, alinear y renderizar.

Flujo para una coordenada, una banda y un rango de fechas:
  1. SIA2 (spherex_dr1 + spherex_qr3) filtrado por POS, BAND y TIME.  -> lista de archivos
  2. Agrupar en visitas (observaciones a menos de HUECO_VISITA_DIAS).  -> 1 fotograma por visita
  3. Pedir SOLO el recorte de cada fotograma al servicio de cutouts de IRSA (en paralelo, con caché).
  4. IMAGE - ZODI, reproyectar a una rejilla común norte-arriba centrada en la coordenada.
  5. Escala común, PNG del blink, PNG de la resta (última - primera) y composición en color.

No se descarga ningún MEF completo: solo recortes de unos pocos MB.
"""

from __future__ import annotations

import base64
import hashlib
import io
import math
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path

import httpx
import numpy as np
from astropy.io import fits, votable
from astropy.time import Time
from astropy.wcs import WCS, FITSFixedWarning
from PIL import Image
from scipy.ndimage import map_coordinates

import warnings

warnings.simplefilter("ignore", FITSFixedWarning)

SIA_URL = "https://irsa.ipac.caltech.edu/SIA"
COLECCIONES = ("spherex_dr1", "spherex_qr3")

# Rango de cada detector en micras (skill spherex-datos, tabla de bandas).
BANDAS_UM = {
    1: (0.75, 1.09),
    2: (1.10, 1.62),
    3: (1.63, 2.41),
    4: (2.42, 3.82),
    5: (3.83, 4.41),
    6: (4.42, 5.00),
}

ESCALA_ARCSEC = 6.15  # s_pixel_scale que devuelve SIA2 para SPHEREx (verificado 14-nov-2026)
HUECO_VISITA_DIAS = 5.0
PARALELO = 3  # con 6 en paralelo IRSA respondió 503 (14-nov-2026)
REINTENTOS = 4

# Bits de FLAGS que NO indican contaminación (definiciones en la propia cabecera, MSKNnnnn).
# SOURCE marca píxeles cerca de una fuente conocida: en un campo poblado sale en el 100 %.
BITS_INFORMATIVOS = {"SOURCE", "FULLSAMPLE", "DICHROIC", "PHANMISS"}
# Bits que se ENMASCARAN antes de mostrar: defectos de un píxel (rayos cósmicos, calientes...).
# No se enmascaran BLOOM/HALO/GHOST/OVERFLOW porque vaciarían el centro de las estrellas brillantes.
BITS_ENMASCARAR = {"TRANSIENT", "SUR_ERROR", "NONFUNC", "MISSING_DATA", "HOT", "COLD", "OUTLIER"}

RAIZ = Path(__file__).resolve().parents[2]
CACHE = Path(os.getenv("SPHEREX_CACHE", RAIZ / "data" / "cache" / "prototipo"))
(CACHE / "cutouts").mkdir(parents=True, exist_ok=True)

_cliente = httpx.Client(timeout=httpx.Timeout(180.0, connect=20.0), follow_redirects=True)

# A IRSA nunca le llegan más de PARALELO descargas a la vez, aunque el navegador pida más.
_semaforo = threading.Semaphore(PARALELO)

# Caché de búsquedas SIA2: el explorador pide fotograma por fotograma y no debe repetir la consulta.
_cache_busquedas: dict[tuple, tuple[float, list, list]] = {}
_CACHE_TTL_S = 600


# --------------------------------------------------------------------------------------
# 1. Búsqueda
# --------------------------------------------------------------------------------------

@dataclass
class Observacion:
    obs_id: str
    detector: int
    coleccion: str
    mjd: float
    access_url: str
    em_min_um: float
    em_max_um: float

    @property
    def iso(self) -> str:
        return Time(self.mjd, format="mjd").isot[:19] + "Z"


def fecha_a_mjd(fecha_iso: str) -> float:
    return float(Time(fecha_iso, format="isot" if "T" in fecha_iso else "iso").mjd)


def buscar(ra: float, dec: float, banda: int, inicio: str, fin: str) -> tuple[list[Observacion], list[str]]:
    """Consulta SIA2 en las dos colecciones vigentes. Devuelve observaciones y avisos."""
    clave = (round(ra, 5), round(dec, 5), banda, inicio, fin)
    hit = _cache_busquedas.get(clave)
    if hit and time.time() - hit[0] < _CACHE_TTL_S:
        return list(hit[1]), list(hit[2])
    obs, avisos = _buscar_sin_cache(ra, dec, banda, inicio, fin)
    _cache_busquedas[clave] = (time.time(), obs, avisos)
    return list(obs), list(avisos)


def _buscar_sin_cache(ra: float, dec: float, banda: int, inicio: str, fin: str) -> tuple[list[Observacion], list[str]]:
    lo, hi = BANDAS_UM[banda]
    t0, t1 = fecha_a_mjd(inicio), fecha_a_mjd(fin)
    avisos: list[str] = []
    obs: list[Observacion] = []

    def una(col: str):
        params = {
            "COLLECTION": col,
            "POS": f"circle {ra} {dec} 0.01",
            # Un pelo hacia dentro para no arrastrar al detector vecino por el borde.
            "BAND": f"{(lo + 0.01) * 1e-6} {(hi - 0.01) * 1e-6}",
            "TIME": f"{t0} {t1}",
        }
        r = _cliente.get(SIA_URL, params=params)
        r.raise_for_status()
        return col, r.content

    with ThreadPoolExecutor(len(COLECCIONES)) as ex:
        respuestas = list(ex.map(una, COLECCIONES))

    for col, contenido in respuestas:
        vot = votable.parse(io.BytesIO(contenido))
        # La respuesta trae un RESOURCE 'meta' (autodescripción) y uno 'results' (los datos).
        tablas = [t for r in vot.resources if r.type == "results" for t in r.tables]
        if not tablas:
            avisos.append(f"{col}: respuesta de IRSA sin tabla de resultados.")
            continue
        tabla = tablas[0].to_table(use_names_over_ids=True)  # IRSA pone ID="col_N"
        for fila in tabla:
            nombre = str(fila["energy_bandpassname"])  # 'SPHEREx-D3'
            det = int(nombre.rsplit("D", 1)[-1])
            if det != banda:
                continue
            obs.append(
                Observacion(
                    obs_id=f"{fila['obs_id']}D{det}",
                    detector=det,
                    coleccion=col,
                    mjd=float(fila["t_min"]),
                    access_url=str(fila["access_url"]),
                    em_min_um=float(fila["em_min"]) * 1e6,
                    em_max_um=float(fila["em_max"]) * 1e6,
                )
            )
    # Un mismo obs_id puede aparecer en las dos colecciones: nos quedamos con uno.
    unicos = {o.obs_id: o for o in sorted(obs, key=lambda o: o.coleccion)}
    obs = sorted(unicos.values(), key=lambda o: o.mjd)
    if not obs:
        avisos.append(
            "IRSA no devolvió observaciones con esos filtros. Prueba otro rango de fechas u otra banda: "
            "un resultado vacío no significa que no haya datos en otra combinación."
        )
    return obs, avisos


def agrupar_visitas(obs: list[Observacion], hueco: float = HUECO_VISITA_DIAS) -> list[list[Observacion]]:
    visitas: list[list[Observacion]] = []
    for o in obs:
        if visitas and o.mjd - visitas[-1][-1].mjd <= hueco:
            visitas[-1].append(o)
        else:
            visitas.append([o])
    return visitas


def elegir_fotogramas(
    visitas: list[list[Observacion]], max_visitas: int, por_visita: int = 1
) -> list[list[Observacion]]:
    """Hasta `por_visita` observaciones de cada visita (las más cercanas a su centro), que luego
    se suman en un solo fotograma. Si sobran visitas, se reparten uniformemente manteniendo
    siempre la primera y la última, que dan la máxima base temporal."""
    if len(visitas) > max_visitas >= 2:
        idx = np.unique(np.round(np.linspace(0, len(visitas) - 1, max_visitas)).astype(int))
        visitas = [visitas[i] for i in idx]
    elegidas = []
    for v in visitas:
        c = len(v) // 2
        orden = sorted(range(len(v)), key=lambda i: abs(i - c))[: max(1, por_visita)]
        elegidas.append([v[i] for i in sorted(orden)])
    return elegidas


# --------------------------------------------------------------------------------------
# 2. Recortes
# --------------------------------------------------------------------------------------

def bajar_recorte(o: Observacion, ra: float, dec: float, size: float) -> Path:
    clave = hashlib.sha1(f"{o.access_url}|{ra:.6f}|{dec:.6f}|{size:.4f}".encode()).hexdigest()
    destino = CACHE / "cutouts" / f"{clave}.fits"
    if destino.exists() and destino.stat().st_size > 0:
        return destino
    for intento in range(REINTENTOS):
        with _semaforo:
            r = _cliente.get(o.access_url, params={"center": f"{ra},{dec}", "size": f"{size}"})
        if r.status_code in (429, 500, 502, 503, 504) and intento < REINTENTOS - 1:
            time.sleep(2 * 2**intento)  # 2, 4, 8 s (fuera del semáforo: deja pasar a otros)
            continue
        r.raise_for_status()
        break
    if not r.content.startswith(b"SIMPLE"):
        raise ValueError(f"La respuesta de IRSA para {o.obs_id} no es un FITS")
    tmp = destino.with_suffix(".part")
    tmp.write_bytes(r.content)
    tmp.replace(destino)
    return destino


# --------------------------------------------------------------------------------------
# 3. Procesado
# --------------------------------------------------------------------------------------

def longitud_onda_centro(hdul: fits.HDUList) -> tuple[float | None, float | None]:
    """λ y ancho de banda (µm) en el centro del recorte, desde la tabla WCS-WAVE.

    La cabecera de IMAGE trae un WCS alternativo 'W' de tipo WAVE-TAB:
      coordenada en la tabla = (píxel 1-based - CRPIXnW) * CDELTnW + CRVALnW
    y la tabla trae una rejilla de puntos de control X, Y con VALUES[y, x, (λ, ancho)].
    Interpolamos bilinealmente (la documentación de IRSA da ~1 nm de precisión así).
    """
    try:
        h = hdul["IMAGE"].header
        tab = hdul["WCS-WAVE"].data
        xs = np.asarray(tab["X"][0], dtype=float)
        ys = np.asarray(tab["Y"][0], dtype=float)
        vals = np.asarray(tab["VALUES"][0], dtype=float)  # (ny, nx, 2)
        ny, nx = hdul["IMAGE"].data.shape
        px = (nx + 1) / 2.0  # centro en convención 1-based
        py = (ny + 1) / 2.0
        cx = (px - h["CRPIX1W"]) * h.get("CDELT1W", 1) + h.get("CRVAL1W", 1)
        cy = (py - h["CRPIX2W"]) * h.get("CDELT2W", 1) + h.get("CRVAL2W", 1)
        # Índice fraccionario dentro de la rejilla de control.
        fx = np.interp(cx, xs, np.arange(len(xs)))
        fy = np.interp(cy, ys, np.arange(len(ys)))
        out = map_coordinates(vals[..., 0], [[fy], [fx]], order=1)[0], map_coordinates(
            vals[..., 1], [[fy], [fx]], order=1
        )[0]
        return float(out[0]), float(out[1])
    except Exception:
        return None, None


def definiciones_flags(cab) -> dict[int, str]:
    """{bit: nombre} desde las claves MSKNnnnn de la cabecera de FLAGS."""
    out = {}
    for k in cab:
        if k.startswith("MSKN") and k[4:].isdigit():
            out[int(k[4:])] = str(cab[k]).strip()
    return out


def wcs_destino(ra: float, dec: float, n: int) -> WCS:
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2.0, (n + 1) / 2.0]
    s = ESCALA_ARCSEC / 3600.0
    w.wcs.cdelt = [-s, s]  # este a la izquierda, norte arriba
    return w


@dataclass
class Fotograma:
    obs: Observacion
    datos: np.ndarray  # reproyectado, IMAGE - ZODI, MJy/sr, NaN fuera de cobertura o enmascarado
    cobertura: np.ndarray  # True donde el recorte tiene detector (aunque el píxel esté enmascarado)
    lambda_um: float | None
    ancho_um: float | None
    fraccion_flags: float
    detalle_flags: dict[str, float]
    avisos: list[str] = field(default_factory=list)
    n_apiladas: int = 1
    lambdas: list[float] = field(default_factory=list)


def procesar(ruta: Path, o: Observacion, ra: float, dec: float, n: int) -> Fotograma:
    with fits.open(ruta) as hdul:
        img = hdul["IMAGE"].data.astype(float)
        zodi = hdul["ZODI"].data.astype(float) if "ZODI" in hdul else 0.0
        flags = hdul["FLAGS"].data if "FLAGS" in hdul else None
        cab_flags = hdul["FLAGS"].header if "FLAGS" in hdul else None
        w_in = WCS(hdul["IMAGE"].header)  # incluye SIP (CTYPE = RA---TAN-SIP)
        lam, ancho = longitud_onda_centro(hdul)

    datos = img - zodi
    frac, detalle = 0.0, {}
    if flags is not None:
        defs = definiciones_flags(cab_flags)
        f64 = flags.astype(np.int64)
        contaminado = np.zeros(flags.shape, bool)
        enmascarar = np.zeros(flags.shape, bool)
        for bit, nombre in defs.items():
            m = (f64 >> bit) & 1 == 1
            if m.any():
                detalle[nombre] = round(float(m.mean()), 4)
            if nombre not in BITS_INFORMATIVOS:
                contaminado |= m
            if nombre in BITS_ENMASCARAR:
                enmascarar |= m
        frac = float(contaminado.mean())
        datos = np.where(enmascarar, np.nan, datos)
    cobertura_in = np.ones(datos.shape)
    valido = np.isfinite(datos)
    relleno = np.where(valido, datos, 0.0)

    w_out = wcs_destino(ra, dec, n)
    yy, xx = np.mgrid[0:n, 0:n]
    ra_o, dec_o = w_out.wcs_pix2world(xx, yy, 0)
    xi, yi = w_in.all_world2pix(ra_o, dec_o, 0)  # 0-based en los dos lados
    coords = [yi.ravel(), xi.ravel()]
    rep = map_coordinates(relleno, coords, order=1, cval=np.nan).reshape(n, n)
    peso = map_coordinates(valido.astype(float), coords, order=1, cval=0.0).reshape(n, n)
    rep[peso < 0.99] = np.nan
    cob = map_coordinates(cobertura_in, coords, order=0, cval=0.0).reshape(n, n) > 0
    avisos = [] if lam is not None else [f"{o.obs_id}: no se pudo leer la longitud de onda (WCS-WAVE)."]
    return Fotograma(o, rep, cob, lam, ancho, frac, detalle, avisos)


def apilar(fs: list[Fotograma]) -> Fotograma:
    """Mediana de varias exposiciones de una misma visita: más señal, sin rayos cósmicos."""
    if len(fs) == 1:
        return fs[0]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)  # columnas todo-NaN
        datos = np.nanmedian(np.stack([f.datos for f in fs]), axis=0)
    lams = [f.lambda_um for f in fs if f.lambda_um is not None]
    anchos = [f.ancho_um for f in fs if f.ancho_um is not None]
    detalle: dict[str, float] = {}
    for f in fs:
        for k, v in f.detalle_flags.items():
            detalle[k] = round(max(detalle.get(k, 0.0), v), 4)
    centro = fs[len(fs) // 2]
    return Fotograma(
        obs=centro.obs,
        datos=datos,
        cobertura=np.logical_or.reduce([f.cobertura for f in fs]),
        lambda_um=float(np.mean(lams)) if lams else None,
        ancho_um=float(np.mean(anchos)) if anchos else None,
        fraccion_flags=float(np.mean([f.fraccion_flags for f in fs])),
        detalle_flags=detalle,
        avisos=sum((f.avisos for f in fs), []),
        n_apiladas=len(fs),
        lambdas=lams,
    )


# --------------------------------------------------------------------------------------
# 4. Render
# --------------------------------------------------------------------------------------

def _png(rgb_o_gris: np.ndarray) -> str:
    arr = np.clip(rgb_o_gris, 0, 255).astype(np.uint8)
    arr = np.flipud(arr)  # FITS tiene el píxel (0,0) abajo; PNG arriba
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _quitar_fondo(d: np.ndarray) -> np.ndarray:
    return d - np.nanmedian(d)


def _asinh(d: np.ndarray, vmin: float, vmax: float) -> np.ndarray:
    x = np.clip((d - vmin) / (vmax - vmin), 0, 1)
    a = 0.1
    return np.arcsinh(x / a) / np.arcsinh(1 / a)


def render(fotogramas: list[Fotograma]) -> dict:
    planos = [_quitar_fondo(f.datos) for f in fotogramas]
    todo = np.concatenate([p[np.isfinite(p)] for p in planos]) if planos else np.array([0.0])
    vmin, vmax = np.percentile(todo, [1.0, 99.7]) if todo.size else (0.0, 1.0)
    if vmax <= vmin:
        vmax = vmin + 1.0

    frames = []
    for f, p in zip(fotogramas, planos):
        g = _asinh(np.where(np.isfinite(p) | ~f.cobertura, p, 0.0), vmin, vmax) * 255
        g = np.where(np.isfinite(g), g, 40)  # sin cobertura: gris oscuro
        frames.append(
            {
                "t": f.obs.iso,
                "mjd": f.obs.mjd,
                "epoch_id": f.obs.obs_id,
                "collection": f.obs.coleccion,
                "detector": f.obs.detector,
                "wavelength_um": None if f.lambda_um is None else round(f.lambda_um, 4),
                "bandwidth_um": None if f.ancho_um is None else round(f.ancho_um, 4),
                "n_stacked": f.n_apiladas,
                "wavelengths_um": [round(x, 4) for x in f.lambdas] if f.lambdas else None,
                "flagged_fraction": round(f.fraccion_flags, 4),
                "flags_detail": f.detalle_flags,
                "png": _png(g),
            }
        )

    resultado = {"frames": frames, "vmin": float(vmin), "vmax": float(vmax)}
    if len(planos) >= 2:
        resultado.update(_resta_y_color(planos[0], planos[-1], vmin, vmax))
    return resultado


def _resta_y_color(primera: np.ndarray, ultima: np.ndarray, vmin: float, vmax: float) -> dict:
    """Resta última - primera. Como las dos épocas suelen estar a λ algo distintas (filtro
    lineal variable), se escala la última para que las fuentes brillantes coincidan en flujo
    antes de restar; así lo que queda es sobre todo lo que CAMBIÓ DE SITIO."""
    ambos = np.isfinite(primera) & np.isfinite(ultima)
    escala = 1.0
    if ambos.sum() > 20:
        umbral = np.percentile(primera[ambos], 95)
        sel = ambos & (primera > umbral) & (ultima > 0)
        if sel.sum() > 5:
            escala = float(np.median(primera[sel] / ultima[sel]))
            if not (0.2 < escala < 5):
                escala = 1.0
    diff = ultima * escala - primera
    lim = np.nanpercentile(np.abs(diff[ambos]), 99.5) if ambos.any() else 1.0
    lim = lim or 1.0
    x = np.clip(diff / lim, -1, 1)
    # Divergente: azul = había brillo y ya no (primera), rojo = brillo nuevo (última), gris = igual.
    r = np.where(x > 0, 128 + 127 * x, 128 * (1 + x))
    g = 128 * (1 - np.abs(x))
    b = np.where(x < 0, 128 - 127 * x, 128 * (1 - x))
    rgb = np.stack([r, g, b], axis=-1)
    rgb[~ambos] = 40

    # Composición en color: primera en rojo, última en cian. Quieto = blanco.
    a = _asinh(primera, vmin, vmax)
    c = _asinh(ultima * escala, vmin, vmax)
    color = np.stack([a, c, c], axis=-1) * 255
    color[~ambos] = 40

    return {
        "diff_png": _png(rgb),
        "diff_scale_factor": round(escala, 4),
        "diff_limit": float(lim),
        "color_png": _png(color),
    }


# --------------------------------------------------------------------------------------
# 5. Orquestación
# --------------------------------------------------------------------------------------

def epocas(ra: float, dec: float, banda: int, inicio: str, fin: str) -> dict:
    obs, avisos = buscar(ra, dec, banda, inicio, fin)
    visitas = agrupar_visitas(obs)
    return {
        "ra": ra,
        "dec": dec,
        "band": banda,
        "n_observations": len(obs),
        "n_visits": len(visitas),
        "visits": [
            {
                "start": v[0].iso,
                "end": v[-1].iso,
                "n": len(v),
                "collections": sorted({o.coleccion for o in v}),
            }
            for v in visitas
        ],
        "warnings": avisos,
    }


def fotogramas(
    ra: float,
    dec: float,
    banda: int,
    inicio: str,
    fin: str,
    size: float = 0.1,
    max_visitas: int = 8,
    por_visita: int = 1,
) -> dict:
    obs, avisos = buscar(ra, dec, banda, inicio, fin)
    visitas = agrupar_visitas(obs)
    grupos = elegir_fotogramas(visitas, max_visitas, por_visita)
    elegidos = [o for g in grupos for o in g]
    n = max(8, int(math.ceil(size * 3600 / ESCALA_ARCSEC)))

    def tarea(o: Observacion):
        try:
            return procesar(bajar_recorte(o, ra, dec, size), o, ra, dec, n)
        except Exception as e:  # una época mala no tumba la petición
            return f"{o.obs_id}: se omitió ({type(e).__name__}: {e})"

    with ThreadPoolExecutor(PARALELO) as ex:
        res = list(ex.map(tarea, elegidos))

    avisos += [r for r in res if isinstance(r, str)]
    por_obs = {r.obs.obs_id: r for r in res if isinstance(r, Fotograma)}
    ok = []
    for g in grupos:
        fs = [por_obs[o.obs_id] for o in g if o.obs_id in por_obs]
        if fs:
            ok.append(apilar(fs))
    for f in ok:
        avisos += f.avisos
        if np.isnan(f.datos).mean() > 0.5:
            avisos.append(f"{f.obs.obs_id}: más de la mitad del recorte cae fuera del detector.")
    lams = [f.lambda_um for f in ok if f.lambda_um is not None]
    if len(lams) >= 2 and max(lams) - min(lams) > 0.1:
        avisos.append(
            f"Las épocas están a longitudes de onda distintas ({min(lams):.2f}–{max(lams):.2f} µm): "
            "parte del cambio de brillo puede deberse al filtro, no al objeto."
        )

    salida = {
        "ra": ra,
        "dec": dec,
        "size": size,
        "band": banda,
        "range": [inicio, fin],
        "pixel_scale_arcsec": ESCALA_ARCSEC,
        "n_pixels": n,
        "n_visits_available": len(visitas),
        "n_frames": len(ok),
        "per_visit": por_visita,
        "n_cutouts": len(elegidos),
        "warnings": avisos,
    }
    salida.update(render(ok) if ok else {"frames": []})
    return salida


# --------------------------------------------------------------------------------------
# 6. Explorador: rejilla bandas × fechas, un fotograma por petición
# --------------------------------------------------------------------------------------

def rejilla(ra: float, dec: float, bandas: list[int], inicio: str, fin: str) -> dict:
    """Visitas por banda y columnas globales (fechas de todas las bandas agrupadas). No baja imágenes."""
    with ThreadPoolExecutor(min(6, len(bandas))) as ex:
        res = dict(zip(bandas, ex.map(lambda b: buscar(ra, dec, b, inicio, fin), bandas)))

    por_banda, inicios, avisos = {}, [], []
    for b in bandas:
        obs, av = res[b]
        avisos += [f"Banda {b}: {a}" for a in av]
        vis = agrupar_visitas(obs)
        por_banda[b] = [
            {"i": i, "start": v[0].iso, "end": v[-1].iso, "mjd": v[len(v) // 2].mjd, "n": len(v)}
            for i, v in enumerate(vis)
        ]
        inicios += [(v[len(v) // 2].mjd, b, i) for i, v in enumerate(vis)]

    # Columnas: agrupar las visitas de todas las bandas con el mismo hueco que las visitas.
    columnas: list[dict] = []
    for mjd, b, i in sorted(inicios):
        if columnas and mjd - columnas[-1]["_ultimo"] <= HUECO_VISITA_DIAS:
            col = columnas[-1]
        else:
            col = {"mjd": mjd, "_ultimo": mjd, "celdas": {}}
            columnas.append(col)
        col["_ultimo"] = mjd
        col["celdas"].setdefault(str(b), i)  # si una banda cae dos veces en la misma columna, la primera
    for c in columnas:
        c.pop("_ultimo")
        c["date"] = Time(c["mjd"], format="mjd").isot[:10]

    return {
        "ra": ra, "dec": dec, "bands": bandas, "range": [inicio, fin],
        "visits": {str(b): v for b, v in por_banda.items()},
        "columns": columnas,
        "pixel_scale_arcsec": ESCALA_ARCSEC,
        "warnings": avisos,
    }


def fotograma_visita(
    ra: float, dec: float, banda: int, inicio: str, fin: str, i_visita: int, size: float = 0.1, por_visita: int = 1
) -> dict:
    """Un fotograma (mediana de hasta `por_visita` exposiciones) de la visita `i_visita`, como floats crudos."""
    obs, _ = buscar(ra, dec, banda, inicio, fin)
    visitas = agrupar_visitas(obs)
    if not (0 <= i_visita < len(visitas)):
        raise IndexError(f"La banda {banda} tiene {len(visitas)} visitas en ese rango; no existe la {i_visita}.")
    grupo = elegir_fotogramas([visitas[i_visita]], max_visitas=1, por_visita=por_visita)[0]
    n = max(8, int(math.ceil(size * 3600 / ESCALA_ARCSEC)))

    def una(o: Observacion):
        try:
            return procesar(bajar_recorte(o, ra, dec, size), o, ra, dec, n)
        except Exception as e:
            return f"{o.obs_id}: {type(e).__name__}: {e}"

    with ThreadPoolExecutor(min(PARALELO, len(grupo))) as ex:
        res = list(ex.map(una, grupo))
    fs = [r for r in res if isinstance(r, Fotograma)]
    errores = [r for r in res if isinstance(r, str)]
    if not fs:
        raise RuntimeError("; ".join(errores) or "sin fotogramas")
    f = apilar(fs)

    datos = f.datos - np.nanmedian(f.datos)          # fondo a 0
    datos = np.where(np.isnan(datos) & f.cobertura, 0.0, datos)  # enmascarado dentro del detector -> fondo
    plano = np.ascontiguousarray(datos.astype("<f4"))  # NaN = fuera del detector
    return {
        "band": banda,
        "visit": i_visita,
        "t": f.obs.iso,
        "epoch_id": f.obs.obs_id,
        "collection": f.obs.coleccion,
        "wavelength_um": None if f.lambda_um is None else round(f.lambda_um, 4),
        "n_stacked": f.n_apiladas,
        "flagged_fraction": round(f.fraccion_flags, 4),
        "flags_detail": f.detalle_flags,
        "n_px": n,
        "data": base64.b64encode(plano.tobytes()).decode(),  # float32 little-endian, fila 0 = sur
        "warnings": errores + f.avisos,
    }
