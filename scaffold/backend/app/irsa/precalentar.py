"""Precalienta la caché con los 5 campos de prueba: python -m app.irsa.precalentar [--cutouts N]."""
from __future__ import annotations

import argparse

from .config import SIZE_CUTOUT_DEG
from .cutouts import cutouts_para
from .posicion import cargar_campos, posicion_en
from .sia2 import buscar_epocas

MJD_REFERENCIA = 61000.0   # 2025-11-10, mitad de la misión hasta hoy (como el EDA)


def precalentar(max_cutouts: int = 0) -> dict:
    """Épocas de los 5 campos y, si `max_cutouts` > 0, los primeros N cutouts de cada uno."""
    resumen = {}
    for campo in cargar_campos():
        ra, dec = posicion_en(campo, MJD_REFERENCIA)
        epocas = buscar_epocas(ra, dec, SIZE_CUTOUT_DEG)
        if max_cutouts:
            cutouts_para(epocas[:max_cutouts], ra, dec, SIZE_CUTOUT_DEG)
        resumen[campo["id"]] = {"ra": ra, "dec": dec, "epocas": len(epocas)}
        print(f"{campo['id']}: {len(epocas)} épocas")
    return resumen


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--cutouts", type=int, default=0, help="cutouts a bajar por campo")
    precalentar(p.parse_args().cutouts)
