"""`/api/spectrum`: el espectro de una posición armado con las exposiciones de nivel 2 (D2).

Por el filtro lineal variable, cada exposición mide el objeto a una λ distinta (la del píxel donde cae,
según WCS-WAVE). Con fotometría de apertura en cada una se obtiene un punto (λ, flujo) por exposición:
juntas forman el espectro de 0,75 a 5 µm. El cubo HiPS no sirve: son PNG ya ajustados, sin flujos.

Hay cientos de exposiciones por objeto: por defecto se toman hasta `max_points` repartidas en el tiempo
dentro de cada banda, con presupuesto de tiempo y `pending`, igual que `/api/frames`.
"""

from __future__ import annotations

import math
import time
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait

import numpy as np

from app.frames import rangos
from app.frames.procesar import ESCALA_ARCSEC, lambda_en
from app.frames.servicio import banda_de, repartir
from app.irsa.config import CUTOUTS_EN_PARALELO
from app.irsa.sia2 import buscar_epocas, filtrar_fechas

from .fotometria import fotometria

MJD_J2000 = 51544.5
CAVEAT = (
    "Valores indicativos, no fotometría científica: apertura simple sobre imágenes de nivel 2, sin "
    "restar la luz zodiacal (se resta el fondo local en un anillo), sin máscara de FLAGS, sin corrección "
    "de apertura por la PSF. Ver docs/02 y docs/09."
)


def posicion_en(ra: float, dec: float, pmra: float, pmdec: float, epoca_ref: float, mjd: float):
    """Propaga (ra, dec) dados en `epoca_ref` (año decimal) hasta `mjd`. pm en mas/año, pmra con cos δ."""
    dt = 2000.0 + (mjd - MJD_J2000) / 365.25 - epoca_ref
    dec_t = dec + pmdec * dt / 3.6e6
    ra_t = ra + pmra * dt / 3.6e6 / math.cos(math.radians(dec))
    return ra_t % 360, dec_t


def punto(e: dict, ra: float, dec: float, aperture_arcsec: float) -> dict:
    """Fotometría del objeto en una exposición (lector por rangos: IMAGE + VARIANCE + WCS-WAVE)."""
    url = e["access_url"]
    est = rangos.estructura(url, con_varianza=True)
    nx, ny = est.cab["NAXIS1"], est.cab["NAXIS2"]
    xt, yt = est.wcs.all_world2pix([[ra, dec]], 0)[0]
    escala = math.sqrt(est.wcs.proj_plane_pixel_area().to_value("arcsec2"))
    r_ap = aperture_arcsec / escala
    r_in, r_out = r_ap + 2.0, r_ap + 5.0
    h = int(math.ceil(r_out)) + 1
    x0, x1 = max(0, int(round(xt)) - h), min(nx - 1, int(round(xt)) + h)
    y0, y1 = max(0, int(round(yt)) - h), min(ny - 1, int(round(yt)) + h)
    if x1 - x0 < 2 * h or y1 - y0 < 2 * h:
        raise ValueError("el objeto cae en el borde del detector")
    img, var = rangos.leer_cajas(url, est, x0, x1, y0, y1, con_varianza=True)
    omega_sr = est.wcs.proj_plane_pixel_area().to_value("sr")
    f = fotometria(img, var, xt - x0, yt - y0, r_ap, r_in, r_out, omega_sr)
    lam, ancho = lambda_en(est.cab, est.xs, est.ys, est.vals, xt, yt)
    return {**f, "wavelength_um": lam, "bandwidth_um": ancho, "pixel_arcsec": escala}


def espectro(
    ra: float,
    dec: float,
    aperture: float = 12.0,
    desde: str | None = None,
    hasta: str | None = None,
    bandas: list[int] | None = None,
    max_points: int = 120,
    budget_s: float = 8.0,
    epochs: list[str] | None = None,
    pmra: float | None = None,
    pmdec: float | None = None,
    epoch: float = 2000.0,
) -> dict:
    t_inicio = time.monotonic()
    todas = filtrar_fechas(buscar_epocas(ra, dec, 0.1), desde, hasta)
    t0 = time.monotonic()
    bandas = bandas or [1, 2, 3, 4, 5, 6]
    por_banda = max(1, max_points // len(bandas))
    elegidas = []
    for b in bandas:
        de_b = sorted((e for e in todas if banda_de(e["detector"]) == b), key=lambda e: e["t_mjd"])
        elegidas += [(f"{e['id']}D{b}", b, e) for e in repartir(de_b, por_banda)]
    if epochs:
        elegidas = [x for x in elegidas if x[0] in set(epochs)]

    def tarea(e: dict) -> dict:
        r, d = ra, dec
        if pmra is not None and pmdec is not None:
            r, d = posicion_en(ra, dec, pmra, pmdec, epoch, e["t_mjd"])
        return punto(e, r, d, aperture)

    puntos, omitidos, avisos = [], {}, []
    ex = ThreadPoolExecutor(CUTOUTS_EN_PARALELO)
    futuros = {ex.submit(tarea, e): (k, b, e) for k, b, e in elegidas}
    restantes = set(futuros)
    while restantes:
        quedan = budget_s - (time.monotonic() - t0)
        if quedan <= 0:
            break
        hechos, restantes = wait(restantes, timeout=quedan, return_when=FIRST_COMPLETED)
        for fu in hechos:
            k, b, e = futuros[fu]
            try:
                p = fu.result()
            except Exception as ex_:
                omitidos[type(ex_).__name__] = omitidos.get(type(ex_).__name__, 0) + 1
                continue
            if p["flux_mjy"] is None:
                omitidos[p["motivo"]] = omitidos.get(p["motivo"], 0) + 1
                continue
            puntos.append(
                {
                    "wavelength_um": round(p["wavelength_um"], 4),
                    "bandwidth_um": round(p["bandwidth_um"], 4),
                    "flux_mjy": float(np.round(p["flux_mjy"], 6)),
                    "err_mjy": float(np.round(p["err_mjy"], 6)),
                    "band": b,
                    "t": e["t"],
                    "epoch_id": k,
                    "collection": e["collection"],
                }
            )
    ex.shutdown(wait=False, cancel_futures=True)
    for motivo, cuantos in omitidos.items():
        avisos.append(f"{cuantos} exposiciones omitidas: {motivo}.")
    puntos.sort(key=lambda p: p["wavelength_um"])
    return {
        "ra": ra,
        "dec": dec,
        "aperture_arcsec": aperture,
        "pixel_scale_arcsec": ESCALA_ARCSEC,
        "n_points": len(puntos),
        "n_candidates": len(elegidas),
        "spectrum": puntos,
        "pending": [futuros[fu][0] for fu in restantes],
        "method": "aperture photometry on level-2 images (local background annulus), HTTP range reads",
        "caveat": CAVEAT,
        "elapsed_s": round(time.monotonic() - t_inicio, 2),
        "warnings": avisos,
    }
