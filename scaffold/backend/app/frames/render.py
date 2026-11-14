"""Fotograma numérico -> PNG (data URI). Escala común a todos los fotogramas de una banda (D2)."""

from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image

SIN_DATO = 30  # gris oscuro fuera del detector


def escala_comun(planos: list[np.ndarray]) -> tuple[float, float]:
    vals = np.concatenate([p[np.isfinite(p)] for p in planos]) if planos else np.array([])
    if vals.size == 0:
        return 0.0, 1.0
    vmin, vmax = np.percentile(vals, [1.0, 99.7])
    return float(vmin), float(vmax if vmax > vmin else vmin + 1.0)


def asinh01(d: np.ndarray, vmin: float, vmax: float, a: float = 0.1) -> np.ndarray:
    x = np.clip((d - vmin) / (vmax - vmin), 0, 1)
    return np.arcsinh(x / a) / np.arcsinh(1 / a)


def _uri(arr: np.ndarray) -> str:
    arr = np.flipud(np.clip(arr, 0, 255).astype(np.uint8))  # la fila 0 de FITS es el sur
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def png_gris(d: np.ndarray, vmin: float, vmax: float, stretch: str = "asinh") -> str:
    x = asinh01(d, vmin, vmax) if stretch == "asinh" else np.clip((d - vmin) / (vmax - vmin), 0, 1)
    return _uri(np.where(np.isfinite(x), x * 255, SIN_DATO))


def factor_flujo(ref: np.ndarray, cur: np.ndarray) -> float:
    """Cada visita está a otra λ (filtro lineal variable): se iguala el flujo de las fuentes brillantes
    antes de restar, para que lo que quede sea sobre todo lo que cambió de sitio."""
    ambos = np.isfinite(ref) & np.isfinite(cur)
    if ambos.sum() <= 20:
        return 1.0
    sel = ambos & (ref > np.percentile(ref[ambos], 95)) & (cur > 0)
    if sel.sum() <= 5:
        return 1.0
    k = float(np.median(ref[sel] / cur[sel]))
    return k if 0.2 < k < 5 else 1.0


def png_resta(cur: np.ndarray, ref: np.ndarray) -> tuple[str, float]:
    """Divergente: rojo = brillo que aparece, azul = brillo que estaba, gris = sin cambio."""
    k = factor_flujo(ref, cur)
    diff = cur * k - ref
    ambos = np.isfinite(diff)
    lim = float(np.percentile(np.abs(diff[ambos]), 99.5)) if ambos.any() else 1.0
    x = np.clip(diff / (lim or 1.0), -1, 1)
    rgb = np.stack(
        [
            np.where(x > 0, 128 + 127 * x, 128 * (1 + x)),
            128 * (1 - np.abs(x)),
            np.where(x < 0, 128 - 127 * x, 128 * (1 - x)),
        ],
        axis=-1,
    )
    rgb[~ambos] = SIN_DATO
    return _uri(rgb), k
