"""Figuras y fotogramas de la presentación del EDA.

Todo sale de datos reales:
  - eda/resultados/*.json|csv           (scripts del EDA)
  - data/cache/eda/fits/*.fits          (recortes de IRSA que baja eda/03_recortes_y_figuras.py)

    .venv/Scripts/python docs/presentacion_eda/figures/make_figures.py      (desde la raíz del repo)

Imprime los valores (fechas, λ, posiciones) que usa animations.js: si cambian los datos, copiarlos allá.
"""
from __future__ import annotations

import csv
import importlib.util
import json
import sys
import warnings
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
DECK = HERE.parent
RAIZ = DECK.parent.parent
sys.path.insert(0, str(DECK / "engine"))
sys.path.insert(0, str(RAIZ / "eda"))

import matplotlib.pyplot as plt  # noqa: E402
from astropy.io import fits  # noqa: E402
from astropy.visualization import AsinhStretch, PercentileInterval  # noqa: E402
from astropy.wcs import WCS, FITSFixedWarning  # noqa: E402
from figures import save, use_profile  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from PIL import Image  # noqa: E402
from reproject import reproject_interp  # noqa: E402

from comun import cargar_campos, posicion_en  # noqa: E402

warnings.simplefilter("ignore", FITSFixedWarning)
col = use_profile(DECK / "profile")
ACC, ACC2, SOFT, INK, BG, LINE = col["accent"], col["accent_2"], col["ink_soft"], col["ink"], col["background"], col["line"]
RES = RAIZ / "eda" / "resultados"
FITS_DIR = RAIZ / "data" / "cache" / "eda" / "fits"
CAMPOS = {c["id"]: c for c in cargar_campos()}

spec = importlib.util.spec_from_file_location("eda03", RAIZ / "eda" / "03_recortes_y_figuras.py")
eda03 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eda03)

FILAS = eda03.leer_lambda()
NOMBRE = {"wise_0855": "WISE 0855", "barnard": "Barnard", "eps_ind_b": "eps Ind B", "rw_aur": "RW Aur", "r_dra": "R Dra"}
ESCALA_PNG = 10   # cada píxel de SPHEREx = 10×10 píxeles de PNG, sin suavizar


# ------------------------------------------------------------------ utilidades de imagen
def leer(ruta):
    with fits.open(ruta) as hl:
        img = hl["IMAGE"].data.astype(float) - hl["ZODI"].data.astype(float)
        malos = (hl["FLAGS"].data & eda03.MASCARA_MALA) != 0
        w = WCS(hl["IMAGE"].header)
    return img, malos, w


def rellenar(img, malos):
    """Solo para mostrar: los píxeles malos se reemplazan por la mediana de sus vecinos válidos."""
    out = img.copy()
    out[malos] = np.nan
    base = out.copy()
    for y, x in zip(*np.where(~np.isfinite(base))):
        for r in range(1, 8):          # ventana creciente: el centro saturado se rellena con su borde, no con fondo
            v = base[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1]
            v = v[np.isfinite(v)]
            if v.size >= 3:
                out[y, x] = np.max(v) if r > 2 else np.median(v)
                break
        else:
            out[y, x] = np.nanmedian(base)
    return out


def alinear(ruta, w_dest):
    img, malos, w = leer(ruta)
    al, _ = reproject_interp((rellenar(img, malos), w), w_dest, shape_out=(eda03.LADO_PX,) * 2, order="bilinear")
    return al


def a_png(arr, nombre, vmin, vmax, cmap="gray", asinh=True):
    a = np.clip((arr - vmin) / (vmax - vmin), 0, 1)
    if asinh:
        a = AsinhStretch(0.1)(a)
    a = np.nan_to_num(a, nan=0.0)
    rgba = (plt.get_cmap(cmap)(a)[..., :3] * 255).astype(np.uint8)
    rgba = np.flipud(rgba)                                   # FITS: origen abajo; PNG: arriba
    im = Image.fromarray(rgba).resize((rgba.shape[1] * ESCALA_PNG, rgba.shape[0] * ESCALA_PNG), Image.NEAREST)
    im.save(HERE / f"{nombre}.png")


def secuencia(cid, detector, etiqueta):
    rs = [r for r in FILAS if r["campo"] == cid and r["detector"] == detector and r["dentro"]]
    sel = eda03.elegir_lambda_igualada(eda03.pasadas(rs))
    mjd_med = float(np.median([r["mjd"] for r in sel]))
    ra_c, dec_c = posicion_en(CAMPOS[cid], mjd_med)
    w_dest = eda03.grilla_comun(ra_c, dec_c)
    imgs, meta = [], []
    for r in sel:
        ruta = FITS_DIR / f"{cid}_{r['obs_id']}_D{detector}.fits"
        imgs.append(alinear(ruta, w_dest))
        x, y = w_dest.world_to_pixel_values(*posicion_en(CAMPOS[cid], r["mjd"]))
        # coordenadas en fracción del PNG (0..1, origen arriba a la izquierda)
        meta.append({"anio": round(r["anio"], 2), "lam": round(r["lambda_um"], 3),
                     "fx": round((float(x) + 0.5) / eda03.LADO_PX, 4),
                     "fy": round(1 - (float(y) + 0.5) / eda03.LADO_PX, 4), "archivo": ruta.name})
    fondo = np.nanmedian(imgs[0])
    vmin, vmax = fondo - 2 * np.nanstd(imgs[0]) * 0.1, PercentileInterval(99.7).get_limits(imgs[0][np.isfinite(imgs[0])])[1]
    c0, c1 = eda03.LADO_PX // 2 - 9, eda03.LADO_PX // 2 + 9      # zoom: 18×18 px alrededor del centro
    for i, im in enumerate(imgs):
        a_png(im - np.nanmedian(im) + fondo, f"{etiqueta}_{i}", vmin, vmax)
        z = im[c0:c1, c0:c1]
        a_png(z - np.nanmedian(im) + fondo, f"{etiqueta}_zoom_{i}", vmin, vmax)
    for m in meta:
        m["zx"] = round((m["fx"] * eda03.LADO_PX - c0) / (c1 - c0), 4)
        m["zy"] = round((m["fy"] * eda03.LADO_PX - c0) / (c1 - c0), 4)
    a, b = imgs[0], imgs[-1]
    a = (a - np.nanmedian(a)) / np.nanstd(a)
    b = (b - np.nanmedian(b)) / np.nanstd(b)
    dif = b - a
    lim = np.nanpercentile(np.abs(dif), 99.5)
    dif = np.nan_to_num(dif, nan=0.0)          # fuera del recorte: neutro (blanco), no azul
    a_png(dif, f"{etiqueta}_resta", -lim, lim, cmap="RdBu_r", asinh=False)
    return meta


# ------------------------------------------------------------------ figuras con matplotlib
def fig_bandas():
    """El ojo ve 0,38–0,75 µm; SPHEREx ve 0,75–5 µm en 6 detectores."""
    bandas = [(0.75, 1.09), (1.10, 1.62), (1.63, 2.41), (2.42, 3.82), (3.83, 4.41), (4.42, 5.00)]
    fig, ax = plt.subplots(figsize=(16, 4.4))
    x = np.linspace(0.38, 0.75, 200)
    for i in range(len(x) - 1):
        nm = x[i] * 1000
        ax.axvspan(x[i], x[i + 1], ymin=0.55, ymax=0.85, color=plt.cm.nipy_spectral((nm - 380) / 420 * 0.9 + 0.05), lw=0)
    ax.text(0.565, 0.95, "lo que ve el ojo", ha="center", va="bottom", color=INK, fontsize=22, transform=ax.get_xaxis_transform())
    cm = plt.get_cmap("magma")
    for i, (a, b) in enumerate(bandas):
        c = cm(0.35 + 0.1 * i)
        ax.axvspan(a, b, ymin=0.12, ymax=0.42, color=c, lw=0)
        ax.text((a + b) / 2, 0.27, f"D{i + 1}", ha="center", va="center", fontsize=22, color="white",
                fontweight="bold", transform=ax.get_xaxis_transform())
    ax.text(2.9, 0.47, "lo que ve SPHEREx: 6 detectores, 102 canales", ha="center", va="bottom", color=ACC,
            fontsize=22, transform=ax.get_xaxis_transform())
    ax.set_xlim(0.35, 5.1)
    ax.set_yticks([])
    for s in ("left", "right", "top"):
        ax.spines[s].set_visible(False)
    ax.set_xlabel("longitud de onda (µm, micrómetros)")
    save(fig, HERE / "bandas")


def fig_cobertura():
    fig, ax = plt.subplots(figsize=(16, 6))
    orden = ["wise_0855", "barnard", "eps_ind_b", "rw_aur", "r_dra"]
    inv = json.loads((RES / "inventario.json").read_text(encoding="utf-8"))["campos"]
    for i, cid in enumerate(orden):
        anios = [r["anio"] for r in FILAS if r["campo"] == cid]
        ax.scatter(anios, np.full(len(anios), i) + np.random.default_rng(i).uniform(-0.25, 0.25, len(anios)),
                   s=6, color=ACC2, alpha=0.6, lw=0)
        n = inv[cid]["archivos_total"]
        ax.text(2026.83, i, f"{n:,}".replace(",", ".") + " archivos", va="center", fontsize=20, color=INK)
    ax.set_yticks(range(len(orden)), [NOMBRE[c] for c in orden])
    ax.set_xlim(2025.25, 2027.15)
    ax.set_xticks([2025.5, 2026.0, 2026.5])
    ax.set_xticklabels(["mediados 2025", "inicio 2026", "mediados 2026"])
    ax.invert_yaxis()
    ax.grid(axis="x", color=LINE)
    ax.set_xlabel("fecha de la foto (cada punto es un archivo; DR1 + QR3)")
    save(fig, HERE / "cobertura")


def fig_lambda(sel_ing, sel_igu):
    rs = [r for r in FILAS if r["campo"] == "wise_0855" and r["detector"] == 5]
    fig, ax = plt.subplots(figsize=(16, 6.2))
    ax.scatter([r["anio"] for r in rs], [r["lambda_um"] for r in rs], s=40, color=SOFT, alpha=0.55, lw=0,
               label="todos los archivos del detector 5")
    ax.plot([r["anio"] for r in sel_ing], [r["lambda_um"] for r in sel_ing], "o-", color="#e0685a", ms=16, lw=2.5,
            label="el primero de cada barrido: λ salta 0,47 µm")
    ax.plot([r["anio"] for r in sel_igu], [r["lambda_um"] for r in sel_igu], "o-", color=ACC, ms=16, lw=2.5,
            label="elegidos a la misma λ: varía 0,035 µm")
    ax.set_ylabel("λ en que se midió (µm)")
    ax.set_xlabel("fecha (año)")
    ax.legend(loc="upper left", bbox_to_anchor=(1.01, 1), frameon=False, fontsize=20)
    ax.grid(color=LINE)
    save(fig, HERE / "lambda_wise")


def fig_latencia():
    d = json.loads((RES / "latencia_cutouts.json").read_text(encoding="utf-8"))
    s = np.array([x["segundos"] for x in d["detalle"]])
    fig, ax = plt.subplots(figsize=(12, 3.6))
    ax.scatter(s, np.random.default_rng(1).uniform(-0.3, 0.3, len(s)), s=140, color=ACC, alpha=0.85, lw=0)
    ax.axvline(np.median(s), color=INK, lw=2)
    ax.text(np.median(s) + 0.3, 0.42, f"mediana {np.median(s):.1f} s".replace(".", ","), color=INK, fontsize=22)
    ax.set_yticks([]); ax.set_ylim(-0.5, 0.6)
    ax.set_xlim(0, 31)
    for sp in ("left", "right", "top"):
        ax.spines[sp].set_visible(False)
    ax.set_xlabel("segundos para bajar un recorte (25 recortes reales)")
    save(fig, HERE / "latencia")


def fig_flags():
    datos = [("SOURCE: hay una estrella (no es malo)", 72.4, ACC2), ("HALO", 2.1, SOFT), ("TRANSIENT", 1.6, "#e0685a"),
             ("SUR_ERROR", 1.3, "#e0685a"), ("BLOOM", 0.8, SOFT), ("OUTLIER", 0.7, "#e0685a"),
             ("NONFUNC", 0.4, "#e0685a"), ("PERSIST", 0.3, "#e0685a"), ("OVERFLOW", 0.2, "#e0685a")]
    fig, ax = plt.subplots(figsize=(15, 6.4))
    y = np.arange(len(datos))
    ax.barh(y, [d[1] for d in datos], color=[d[2] for d in datos], height=0.7)
    for i, (n, v, _) in enumerate(datos):
        ax.text(v + 0.8, i, f"{v:.1f} %".replace(".", ","), va="center", fontsize=20, color=INK)
    ax.set_yticks(y, [d[0] for d in datos])
    ax.invert_yaxis()
    ax.set_xlim(0, 85)
    ax.set_xlabel("% de píxeles con ese bit encendido (25 recortes)")
    save(fig, HERE / "flags")


def main():
    for cid, det, et in [("barnard", 2, "barnard"), ("rw_aur", 3, "rwaur"), ("wise_0855", 5, "wise"), ("eps_ind_b", 5, "epsind")]:
        meta = secuencia(cid, det, et)
        print(et, json.dumps(meta, ensure_ascii=False))

    # Barnard sin alinear: dos recortes crudos con orientación opuesta (PA −179,6° y +1,1°)
    for i, nombre in enumerate(["barnard_2025W35_1A_0146_1_D2.fits", "barnard_2026W11_2A_0501_3_D2.fits"]):
        img, malos, _ = leer(FITS_DIR / nombre)
        img = rellenar(img, malos)
        f = img[np.isfinite(img)]
        a_png(img, f"barnard_crudo_{i}", np.median(f) - 0.2 * np.std(f), PercentileInterval(99.7).get_limits(f)[1])

    rs = [r for r in FILAS if r["campo"] == "wise_0855" and r["detector"] == 5 and r["dentro"]]
    gs = eda03.pasadas(rs)
    fig_lambda([g[0] for g in gs], eda03.elegir_lambda_igualada(gs))
    fig_bandas(); fig_cobertura(); fig_latencia(); fig_flags()
    print("listo")


if __name__ == "__main__":
    main()
