"""Paquete de la demo: respuestas ya calculadas de los 5 campos, servidas sin tocar IRSA.

Se genera una vez con red (`python -m app.irsa.precalcular_demo`) y se versiona en `data/demo/`
(PNG de 58×58 px: pesan poco). Si la consulta cae sobre uno de los 5 campos con los parámetros de
la demo, `/api/epochs` y `/api/frames` responden de aquí; cualquier otra coordenada sigue el flujo
normal (caché → IRSA). Ver docs/07 R4 y docs/10 (D1: «los 5 campos se sirven sin internet»).
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

from .irsa.config import RAIZ

DIR = Path(os.getenv("SPHEREX_DEMO", RAIZ / "data" / "demo"))
RADIO_DEG = 0.01        # 36": cubre la propagación a otra fecha (Barnard se mueve 10"/año)
TOL_SIZE = 1e-6
MODOS = ("zodi_subtracted", "raw", "diff_first", "diff_prev")


def _leer(ruta: Path):
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def manifiesto() -> list[dict]:
    """Campos precalculados; lista vacía si el paquete no existe (p. ej. en CI)."""
    m = _leer(DIR / "manifest.json")
    return m["campos"] if isinstance(m, dict) else []


def _sep_deg(ra1: float, dec1: float, ra2: float, dec2: float) -> float:
    dra = (ra1 - ra2 + 180) % 360 - 180
    return math.hypot(dra * math.cos(math.radians((dec1 + dec2) / 2)), dec1 - dec2)


def campo_para(ra: float, dec: float, size: float) -> tuple[dict, bool] | None:
    """Campo del paquete al que apunta la consulta y si lo hizo con la coordenada J2000.

    Acepta tanto el centro propagado como el J2000 (el visor aún manda J2000: docs traspaso V2).
    """
    for c in manifiesto():
        if abs(c["size"] - size) > TOL_SIZE:
            continue
        if _sep_deg(ra, dec, c["ra"], c["dec"]) <= RADIO_DEG:
            return c, False
        if _sep_deg(ra, dec, c["ra_j2000"], c["dec_j2000"]) <= RADIO_DEG:
            return c, True
    return None


def epocas(ra: float, dec: float, size: float) -> list[dict] | None:
    """Épocas precalculadas (mismo formato que `sia2.buscar_epocas`) o None si no aplica."""
    hit = campo_para(ra, dec, size)
    if hit is None:
        return None
    return _leer(DIR / hit[0]["id"] / "epochs.json")


def fotogramas(ra: float, dec: float, size: float, band: int, mode: str) -> dict | None:
    """Respuesta de `/api/frames` precalculada o None si no aplica."""
    hit = campo_para(ra, dec, size)
    if hit is None or mode not in hit[0].get("modes", ()) or band not in hit[0]["bands"]:
        return None
    resp = _leer(DIR / hit[0]["id"] / f"frames_b{band}_{mode}.json")
    if resp is None:
        return None
    resp["source"] = "precalculado"
    if hit[1]:
        resp["warnings"] = [*resp.get("warnings", []), (
            "El campo se centró en la posición propagada por movimiento propio, no en la J2000 "
            "pedida.")]
    return resp
