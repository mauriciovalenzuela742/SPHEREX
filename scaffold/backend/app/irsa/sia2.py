"""Búsqueda de épocas por SIA2 (IRSA). Solo metadatos: no baja imágenes."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC

from . import cache
from .config import COLECCIONES, RADIO_BUSQUEDA_DEG, SIA2_URL

MJD_UNIX = 40587.0   # MJD de 1970-01-01


def mjd_a_iso(mjd: float) -> str:
    from datetime import datetime
    return datetime.fromtimestamp((mjd - MJD_UNIX) * 86400, UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def _consultar(coleccion: str, ra: float, dec: float) -> list[dict]:
    import time

    import pyvo

    for intento in range(4):      # IRSA devuelve 502 transitorios (visto el 14-nov)
        try:
            tabla = pyvo.dal.SIA2Service(SIA2_URL).search(
                pos=(ra, dec, RADIO_BUSQUEDA_DEG), collection=coleccion).to_table()
            break
        except pyvo.dal.DALServiceError:
            if intento == 3:
                raise
            time.sleep(2 * (intento + 1))
    filas = []
    for f in tabla:
        filas.append({
            "id": str(f["obs_id"]),
            "t": mjd_a_iso(float(f["t_min"])),
            "t_mjd": float(f["t_min"]),
            "detector": str(f["energy_bandpassname"]),
            "collection": coleccion,
            "access_url": str(f["access_url"]),
            "pixel_scale_arcsec": float(f["s_pixel_scale"]),
        })
    return filas


def buscar_epocas(ra: float, dec: float, size: float,
                  colecciones: tuple[str, ...] = COLECCIONES) -> list[dict]:
    """Épocas de SPHEREx sobre (ra, dec), DR1 y QR3 en paralelo, ordenadas por tiempo."""
    nombre = f"{cache.clave_posicion(ra, dec, size)}_{'-'.join(colecciones)}.json"
    en_cache = cache.leer_json("epocas", nombre)      # lanza FueraDeCache si OFFLINE=1
    if en_cache is not None:
        return en_cache
    with ThreadPoolExecutor(max_workers=len(colecciones)) as ex:
        partes = list(ex.map(lambda c: _consultar(c, ra, dec), colecciones))
    epocas = sorted((e for p in partes for e in p), key=lambda e: e["t_mjd"])
    cache.guardar_json("epocas", nombre, epocas)
    return epocas


def filtrar_fechas(epocas: list[dict], desde: str | None, hasta: str | None) -> list[dict]:
    """`desde`/`hasta` ISO 8601 UTC; la comparación de cadenas ISO equivale a la de fechas."""
    return [e for e in epocas
            if (desde is None or e["t"] >= desde) and (hasta is None or e["t"] <= hasta)]
