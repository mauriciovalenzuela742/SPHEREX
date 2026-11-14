"""Cutouts FITS de IRSA con caché en disco y máximo 4 en paralelo."""
from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from . import cache
from .config import CUTOUTS_EN_PARALELO, REINTENTOS_CUTOUT, SIZE_CUTOUT_DEG, offline
from .descarga import pedir

_SEMAFORO = threading.BoundedSemaphore(CUTOUTS_EN_PARALELO)


def ruta_cutout(epoca: dict, ra: float, dec: float, size: float) -> Path:
    nombre = f"{epoca['id']}_{epoca['detector']}_{cache.clave_posicion(ra, dec, size)}.fits"
    return cache.ruta("fits", nombre)


def cutout(epoca: dict, ra: float, dec: float, size: float = SIZE_CUTOUT_DEG) -> Path:
    """Ruta del FITS recortado; lo baja de IRSA solo si no está en caché."""
    destino = ruta_cutout(epoca, ra, dec, size)
    if destino.exists():
        return destino
    if offline():
        raise cache.FueraDeCache(f"OFFLINE=1 y no hay {destino.name} en caché")
    with _SEMAFORO:
        if destino.exists():            # otro hilo pudo bajarlo mientras esperábamos
            return destino
        r = pedir(epoca["access_url"], reintentos=REINTENTOS_CUTOUT,
                  params={"center": f"{ra},{dec}", "size": size})
        cache.escribir_atomico(destino, r.content)
    return destino


def cutouts_para(epocas: list[dict], ra: float, dec: float,
                 size: float = SIZE_CUTOUT_DEG) -> list[Path]:
    """Punto de entrada para D2: un cutout por época, en el mismo orden."""
    with ThreadPoolExecutor(max_workers=CUTOUTS_EN_PARALELO) as ex:
        return list(ex.map(lambda e: cutout(e, ra, dec, size), epocas))
