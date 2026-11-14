"""Utilidades compartidas por los scripts del EDA.

Nada de aquí es código de producción: es lo mínimo para explorar los datos y dejar las
respuestas escritas. El backend real se escribe en `backend/app/irsa/` cuando el equipo lo decida.
"""
from __future__ import annotations

import math
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "data" / "cache" / "eda"          # ignorado por git
RESULTADOS = Path(__file__).resolve().parent / "resultados"
FIGURAS = Path(__file__).resolve().parent / "figuras"

SIA2_URL = "https://irsa.ipac.caltech.edu/SIA"
COLECCIONES = ["spherex_dr1", "spherex_dr1_deep", "spherex_qr3", "spherex_qr3_deep"]

MJD_J2000 = 51544.5


def asegurar_carpetas() -> None:
    for c in (CACHE, RESULTADOS, FIGURAS):
        c.mkdir(parents=True, exist_ok=True)


def cargar_campos() -> list[dict]:
    """Los cinco campos del enunciado, tal como están en data/campos_de_prueba.yml."""
    with open(RAIZ / "data" / "campos_de_prueba.yml", encoding="utf-8") as f:
        return yaml.safe_load(f)["campos"]


def mjd_a_anio(mjd: float) -> float:
    return 2000.0 + (mjd - MJD_J2000) / 365.25


def posicion_en(campo: dict, mjd: float) -> tuple[float, float]:
    """Propaga la posición J2000 de SIMBAD a la fecha `mjd` con el movimiento propio.

    Propagación lineal, sin paralaje. El paralaje mayor de la lista (Barnard, 0,55") es
    menos de una décima de píxel de SPHEREx (6,15"/px), así que para ubicar el objeto en el
    recorte basta. Para ciencia habría que usar astropy SkyCoord.apply_space_motion.
    """
    dt_anios = (mjd - MJD_J2000) / 365.25
    dec0 = campo["dec_deg"]
    ddec = campo["pmdec"] * dt_anios / 3.6e6
    dra = campo["pmra"] * dt_anios / 3.6e6 / math.cos(math.radians(dec0))
    return campo["ra_deg"] + dra, dec0 + ddec
