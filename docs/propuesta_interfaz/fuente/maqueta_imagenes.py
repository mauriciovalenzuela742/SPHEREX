"""Imágenes reales para el mockup de la interfaz para público (datos del PR #58, sin recalcular la ciencia).

- Falso color por pasada: azul = B1–B3 (0,75–2,42 µm), verde = B4 (2,42–3,82), rojo = B5–B6 (3,82–5,0).
  Cada canal se escala para que una estrella típica del campo salga blanca (rojo ÷ α medido = 0,2169; verde ÷ razón
  mediana de las estrellas). Así lo que sale rojo emite casi solo en el infrarrojo largo: WISE 0855.
- Antes / después de la pasada 3: banda larga cruda y limpia (B5–6 − α·B1–3), misma escala.
Norte arriba, este a la izquierda (fila 0 = sur, se voltea). Píxeles suavizados para la vista.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DATOS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\dev\informes_v2\huella_espectral")  # pilas *.npz (no van en git)
SAL = Path(__file__).resolve().parent / "img"
SAL.mkdir(parents=True, exist_ok=True)
ALPHA = 0.2169
LADO = 480

pil = np.load(DATOS / "pilas_wise_0855.npz")
lim = np.load(DATOS / "limpieza_wise0855.npz")
import json
res = json.loads((Path(__file__).resolve().parents[3] / "eda" / "huella_espectral" / "limpieza_fondo_resultado.json").read_text(encoding="utf-8"))


def mad(a):
    v = a[np.isfinite(a)]
    return 1.4826 * np.median(np.abs(v - np.median(v)))


def asinh01(a, lo, hi, k=8.0):
    x = np.clip((a - lo) / (hi - lo), 0, None)
    return np.clip(np.arcsinh(k * x) / np.arcsinh(k), 0, 1)


def agrandar(rgb01):
    img = Image.fromarray((np.flipud(rgb01) * 255).astype(np.uint8))
    return img.resize((LADO, LADO), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))


def anillo(img, x, y, color, r=26, discontinuo=False):
    d = ImageDraw.Draw(img)
    esc = LADO / 41
    cx, cy = (x + 0.5) * esc, LADO - (y + 0.5) * esc
    if discontinuo:
        for a0 in range(0, 360, 30):
            d.arc([cx - r, cy - r, cx + r, cy + r], a0, a0 + 18, fill=color, width=3)
    else:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=3)
    return img


# Razón B4 / B1–3 de las estrellas: píxeles brillantes en la banda corta
c3 = pil["3_corto_st"]
estr = c3 > np.nanpercentile(c3, 99)
beta = float(np.nanmedian(pil["3_medio_st"][estr] / c3[estr]))
print("razón medio/corto de estrellas", round(beta, 3))

# Escala común a las 3 pasadas (para que el brillo sea comparable entre fechas)
pasadas = ["1", "2", "3"]
canal = {}
for p in pasadas:
    b = pil[f"{p}_corto_st"]
    g = pil[f"{p}_medio_st"] / beta
    r = pil[f"{p}_largo_st"] / ALPHA
    canal[p] = (r, g, b)
todo = np.concatenate([np.ravel(x) for p in pasadas for x in canal[p]])
todo = todo[np.isfinite(todo)]
lo = np.median(todo) + 1.0 * mad(todo)
hi = np.percentile(todo, 99.7)
for p in pasadas:
    rgb = np.dstack([asinh01(np.nan_to_num(x, nan=lo), lo, hi) for x in canal[p]])
    img = agrandar(rgb)
    pos = res["pasadas"][p]["wise0855_spec_clean"]
    img.save(SAL / f"falso_color_P{p}.png")

# Antes / después, pasada 3, misma escala gris
cr = lim["3_raw_largo"]
cl = lim["3_spec_clean"]
v = cr[np.isfinite(cr)]
lo2, hi2 = np.median(v) + 0.5 * mad(v), np.percentile(v, 99.8)
for nombre, a in (("antes_P3", cr), ("despues_P3", cl)):
    g = asinh01(np.nan_to_num(a, nan=lo2), lo2, hi2)
    rgb = np.dstack([g, g * 0.92, g * 0.82])  # gris cálido, legible en fondo oscuro
    agrandar(rgb).save(SAL / f"{nombre}.png")

for f in sorted(SAL.iterdir()):
    print(f.name, f.stat().st_size)
