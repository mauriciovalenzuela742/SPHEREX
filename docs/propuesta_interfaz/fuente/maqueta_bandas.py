"""Imágenes extra para la maqueta funcional (datos reales de las pilas por pasada de WISE 0855, PR #58).

- Gris por grupo de bandas y pasada: cercano (B1–B3), medio (B4), lejano (B5–B6); escala común a las 3 pasadas.
- Resta lejano P3 − P1: rojo = brillo que apareció, azul = brillo que estaba (misma convención que el visor).
- Color: P1 en rojo, P3 en cian; lo quieto sale blanco.
Norte arriba, este a la izquierda (fila 0 = sur, se voltea). Píxeles suavizados.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

DATOS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\dev\informes_v2\huella_espectral")  # pilas *.npz (no van en git)
SAL = Path(__file__).resolve().parent / "img"
SAL.mkdir(parents=True, exist_ok=True)
LADO = 480
pil = np.load(DATOS / "pilas_wise_0855.npz")


def mad(a):
    v = a[np.isfinite(a)]
    return 1.4826 * np.median(np.abs(v - np.median(v)))


def asinh01(a, lo, hi, k=8.0):
    x = np.clip((np.nan_to_num(a, nan=lo) - lo) / (hi - lo), 0, None)
    return np.clip(np.arcsinh(k * x) / np.arcsinh(k), 0, 1)


def guardar(rgb01, nombre):
    img = Image.fromarray((np.flipud(rgb01) * 255).astype(np.uint8))
    img.resize((LADO, LADO), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2)).save(SAL / nombre)


grupos = {"cercano": "corto", "medio": "medio", "lejano": "largo"}
for nombre, g in grupos.items():
    arr = [pil[f"{p}_{g}_st"] for p in "123"]
    v = np.concatenate([a[np.isfinite(a)] for a in arr])
    lo, hi = np.median(v) + 0.5 * mad(v), np.percentile(v, 99.7)
    for p, a in zip("123", arr):
        x = asinh01(a, lo, hi)
        guardar(np.dstack([x, x, x]), f"{nombre}_P{p}.png")

# Resta y color, banda lejana (donde WISE 0855 brilla)
a1, a3 = pil["1_largo_st"], pil["3_largo_st"]
d = np.nan_to_num(a3 - a1)
s = np.percentile(np.abs(d), 99.7)
z = 2.5 * mad(d)  # zona muerta: el ruido queda negro
pos = np.clip((d - z) / (s - z), 0, 1) ** 0.7
neg = np.clip((-d - z) / (s - z), 0, 1) ** 0.7
guardar(np.dstack([pos, 0.25 * (pos + neg), neg]), "resta_lejano.png")

v = np.concatenate([a1[np.isfinite(a1)], a3[np.isfinite(a3)]])
lo, hi = np.median(v) + 0.5 * mad(v), np.percentile(v, 99.7)
r, c = asinh01(a1, lo, hi), asinh01(a3, lo, hi)
guardar(np.dstack([r, c, c]), "color_lejano.png")
for f in sorted(SAL.iterdir()):
    print(f.name, f.stat().st_size)
