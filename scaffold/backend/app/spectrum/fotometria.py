"""Fotometría de apertura en píxeles nativos del detector (sin reproyectar: no correlaciona el ruido).

flujo = Σ w·(I − fondo) · Ω_pix, con fondo = mediana de un anillo y Ω_pix el ángulo sólido del píxel
(del WCS). I viene en MJy/sr, así que MJy/sr · sr = MJy; se devuelve en mJy.
error² = Σ w²·σ² + (Σw)²·σ²_fondo, con σ² de la extensión VARIANCE y σ²_fondo = (π/2)·Var(anillo)/N
(error de una mediana). Es fotometría indicativa, no de calidad científica (ver `caveat`).
"""

from __future__ import annotations

import math

import numpy as np

MJY_POR_MJY = 1e9  # 1 MJy = 1e9 mJy
SUBMUESTREO = 5  # para el peso fraccional de los píxeles del borde de la apertura


def pesos_apertura(forma: tuple[int, int], xc: float, yc: float, r: float) -> np.ndarray:
    """Fracción de cada píxel dentro del círculo (xc, yc, r), con submuestreo 5×5."""
    ny, nx = forma
    s = (np.arange(SUBMUESTREO) + 0.5) / SUBMUESTREO - 0.5
    yy, xx = np.mgrid[0:ny, 0:nx]
    w = np.zeros(forma)
    for dy in s:
        for dx in s:
            w += ((xx + dx - xc) ** 2 + (yy + dy - yc) ** 2) <= r * r
    return w / SUBMUESTREO**2


def fotometria(
    img: np.ndarray,
    var: np.ndarray | None,
    xc: float,
    yc: float,
    r_ap: float,
    r_in: float,
    r_out: float,
    omega_sr: float,
) -> dict:
    """xc, yc en píxeles (0-based) de `img`; radios en píxeles. Devuelve flujo y error en mJy."""
    w = pesos_apertura(img.shape, xc, yc, r_ap)
    yy, xx = np.mgrid[0 : img.shape[0], 0 : img.shape[1]]
    d2 = (xx - xc) ** 2 + (yy - yc) ** 2
    anillo = (d2 >= r_in**2) & (d2 <= r_out**2) & np.isfinite(img)
    if anillo.sum() < 8:
        return {"flux_mjy": None, "err_mjy": None, "motivo": "anillo de fondo sin píxeles válidos"}
    dentro = w > 0
    if not np.isfinite(img[dentro]).all():
        return {
            "flux_mjy": None,
            "err_mjy": None,
            "motivo": "píxeles sin dato en la apertura (saturación)",
        }
    fondo = float(np.median(img[anillo]))
    var_fondo = math.pi / 2 * float(np.var(img[anillo])) / int(anillo.sum())
    suma_w = float(w.sum())
    flujo = float(np.sum(w[dentro] * (img[dentro] - fondo)))
    if var is not None and np.isfinite(var[dentro]).all():
        var_ap = float(np.sum(w[dentro] ** 2 * var[dentro]))
    else:  # sin VARIANCE: ruido por píxel estimado en el anillo
        var_ap = float(np.sum(w[dentro] ** 2)) * float(np.var(img[anillo]))
    err = math.sqrt(var_ap + suma_w**2 * var_fondo)
    k = omega_sr * MJY_POR_MJY
    return {
        "flux_mjy": flujo * k,
        "err_mjy": err * k,
        "fondo": fondo,
        "n_anillo": int(anillo.sum()),
    }
