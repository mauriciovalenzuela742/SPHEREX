"""Posición propagada por movimiento propio y lectura de los campos de prueba."""
from __future__ import annotations

import math

import yaml

from .config import CAMPOS_YML

MJD_J2000 = 51544.5


def cargar_campos() -> list[dict]:
    with open(CAMPOS_YML, encoding="utf-8") as f:
        return yaml.safe_load(f)["campos"]


def mjd_a_anio(mjd: float) -> float:
    return 2000.0 + (mjd - MJD_J2000) / 365.25


def posicion_en(campo: dict, mjd: float) -> tuple[float, float]:
    """Propaga la posición J2000 a `mjd` (lineal, sin paralaje; portada de eda/comun.py).

    Basta para ubicar el objeto en el recorte: el paralaje mayor (Barnard, 0,55") es menos de
    una décima de píxel de SPHEREx (6,15"/px).
    """
    dt = (mjd - MJD_J2000) / 365.25
    dec0 = campo["dec_deg"]
    ddec = campo["pmdec"] * dt / 3.6e6
    dra = campo["pmra"] * dt / 3.6e6 / math.cos(math.radians(dec0))
    return campo["ra_deg"] + dra, dec0 + ddec
