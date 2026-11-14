"""EDA 3 — Recortes reales, latencia y las figuras para entender los datos.

Para cada campo y su banda recomendada (data/campos_de_prueba.yml):
  - elige, en cada pasada del cielo, el archivo cuya λ en el objeto es más parecida entre
    pasadas (blink "a λ igualada");
  - para WISE 0855 también arma el blink ingenuo (primer archivo de cada pasada, sin mirar λ)
    para comparar;
  - baja los cutouts (size=0.1°), cronometra cada uno, y dibuja.

Uso:  .venv/Scripts/python eda/03_recortes_y_figuras.py     (requiere 01 y 02)
Salidas:
  data/cache/eda/fits/*.fits                 cutouts (no versionados)
  eda/figuras/*.png                          figuras (versionadas, pequeñas)
  eda/resultados/latencia_cutouts.json       tiempos de descarga
"""
from __future__ import annotations

import csv
import json
import time
import warnings
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from astropy.io import fits  # noqa: E402
from astropy.table import Table  # noqa: E402
from astropy.visualization import AsinhStretch, ImageNormalize, PercentileInterval  # noqa: E402
from astropy.wcs import WCS, FITSFixedWarning  # noqa: E402

from comun import (CACHE, FIGURAS, RESULTADOS, asegurar_carpetas, cargar_campos,  # noqa: E402
                   posicion_en)
from espectral import pedir  # noqa: E402

warnings.simplefilter("ignore", FITSFixedWarning)
SIZE_DEG = 0.1
HILOS = 4
ESCALA = 6.15  # arcsec/px, de s_pixel_scale en SIA2


def leer_lambda():
    with open(RESULTADOS / "lambda_por_archivo.csv", encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    for r in filas:
        for k in ("detector",):
            r[k] = int(r[k])
        for k in ("mjd", "anio", "lambda_um", "ancho_um"):
            r[k] = float(r[k])
        r["dentro"] = r["dentro"] == "True"
    return filas


def pasadas(rs, hueco=30.0):
    rs = sorted(rs, key=lambda r: r["mjd"])
    g = [[rs[0]]]
    for r in rs[1:]:
        (g[-1].append(r) if r["mjd"] - g[-1][-1]["mjd"] < hueco else g.append([r]))
    return g


def elegir_lambda_igualada(grupos):
    """Un archivo por pasada, minimizando la dispersión de λ entre pasadas."""
    mejor, mejor_disp = None, np.inf
    for cand in grupos[0]:
        sel = [min(g, key=lambda r: abs(r["lambda_um"] - cand["lambda_um"])) for g in grupos]
        lam = [r["lambda_um"] for r in sel]
        if max(lam) - min(lam) < mejor_disp:
            mejor, mejor_disp = sel, max(lam) - min(lam)
    return mejor


def bajar(r, url, campo, ra_c, dec_c):
    ruta = CACHE / "fits" / f"{campo}_{r['obs_id']}_D{r['detector']}.fits"
    t0 = time.time()
    if ruta.exists():
        return ruta, None, None
    try:
        resp = pedir(url, reintentos=6, params={"center": f"{ra_c},{dec_c}", "size": SIZE_DEG})
    except RuntimeError as e:  # el servicio de cutouts devuelve 503 a ratos: se registra
        return None, time.time() - t0, str(e)[-40:]
    ruta.write_bytes(resp.content)
    return ruta, time.time() - t0, None


# Bits de FLAGS que invalidan el píxel. Los nombres vienen en el propio header de FLAGS
# (tarjetas MSKNnnnn / MSKMnnnn / MSKDnnnn). NO se enmascaran SOURCE (2^21, "hay una fuente
# conocida": ¡es justo lo que queremos ver!), FULLSAMPLE (2^12) ni DICHROIC (2^7).
BITS_MALOS = {"TRANSIENT": 0, "OVERFLOW": 1, "SUR_ERROR": 2, "NONFUNC": 6, "MISSING_DATA": 9,
              "HOT": 10, "COLD": 11, "NONLINEAR": 15, "PERSIST": 17, "OUTLIER": 19}
MASCARA_MALA = sum(1 << b for b in BITS_MALOS.values())
LADO_PX = 58


def grilla_comun(ra_c: float, dec_c: float) -> WCS:
    """Grilla TAN con el norte arriba, a la escala nativa. Todas las épocas se reproyectan aquí.

    Hace falta porque la orientación del detector en el cielo gira ~180° entre pasadas (y en
    ángulos arbitrarios cerca de los polos de la eclíptica): restar o parpadear los píxeles
    crudos compara trozos de cielo distintos.
    """
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra_c, dec_c]
    w.wcs.crpix = [LADO_PX / 2 + 0.5, LADO_PX / 2 + 0.5]
    w.wcs.cdelt = [-ESCALA / 3600, ESCALA / 3600]
    return w


def panel(ax, ruta, campo, r, w_destino):
    from reproject import reproject_interp
    with fits.open(ruta) as hl:
        img = hl["IMAGE"].data.astype(float) - hl["ZODI"].data.astype(float)
        flags = hl["FLAGS"].data
        malos = (flags & MASCARA_MALA) != 0
        img[malos] = np.nan
        alineada, _ = reproject_interp((img, WCS(hl["IMAGE"].header)), w_destino,
                                       shape_out=(LADO_PX, LADO_PX), order="bilinear")
    ok = np.isfinite(alineada)
    norm = ImageNormalize(alineada[ok], interval=PercentileInterval(99.5), stretch=AsinhStretch(0.1))
    ax.imshow(alineada, origin="lower", cmap="gray", norm=norm)
    ra, dec = posicion_en(campo, r["mjd"])
    x, y = w_destino.world_to_pixel_values(ra, dec)
    ax.plot(x, y, "o", mfc="none", mec="tab:orange", ms=14, mew=1.2)
    ax.set_title(f"{r['anio']:.2f} · {r['lambda_um']:.3f} µm", fontsize=8)
    ax.set_xticks([]); ax.set_yticks([])
    return alineada, (x, y), int(malos.sum()), flags.size


def main() -> None:
    asegurar_carpetas()
    campos = {c["id"]: c for c in cargar_campos()}
    filas = leer_lambda()
    urls = {}
    for cid in campos:
        t = Table.read(CACHE / f"sia2_{cid}.ecsv")
        for o, b, u in zip(t["obs_id"], t["energy_bandpassname"], t["access_url"]):
            urls[(cid, o, int(str(b)[-1]))] = u

    # ---------- Figura 1: λ del objeto en el tiempo (el efecto del LVF) ----------
    fig, axs = plt.subplots(1, 5, figsize=(17, 3.6), sharey=True)
    colores = plt.cm.viridis(np.linspace(0, 0.9, 6))
    for ax, (cid, c) in zip(axs, campos.items()):
        rs = [r for r in filas if r["campo"] == cid and r["dentro"]]
        for d in range(1, 7):
            sub = [r for r in rs if r["detector"] == d]
            ax.scatter([r["anio"] for r in sub], [r["lambda_um"] for r in sub], s=8,
                       color=colores[d - 1], label=f"D{d}")
        ax.set_title(c["nombre"], fontsize=9)
        ax.set_xlabel("año")
        ax.grid(alpha=.3)
    axs[0].set_ylabel("λ del objeto en ese archivo (µm)")
    axs[-1].legend(fontsize=7, loc="upper left", bbox_to_anchor=(1, 1))
    fig.suptitle("Cada punto es un archivo: la λ en que quedó el objeto depende de dónde cayó en el detector",
                 fontsize=10)
    fig.tight_layout()
    fig.savefig(FIGURAS / "01_lambda_vs_tiempo.png", dpi=110)
    plt.close(fig)

    # ---------- Recortes: secuencias por campo ----------
    trabajos = []   # (cid, etiqueta, [filas])
    for cid, c in campos.items():
        d = c["banda_recomendada"]
        rs = [r for r in filas if r["campo"] == cid and r["detector"] == d and r["dentro"]]
        gs = pasadas(rs)
        trabajos.append((cid, "lambda_igualada", elegir_lambda_igualada(gs)))
        if cid == "wise_0855":
            trabajos.append((cid, "ingenuo", [g[0] for g in gs]))
            # Enana Y muy fría: su emisión sube hacia 4,5–5 µm, así que se prueba también D6.
            rs6 = [r for r in filas if r["campo"] == cid and r["detector"] == 6 and r["dentro"]]
            trabajos.append((cid, "lambda_igualada_D6", elegir_lambda_igualada(pasadas(rs6))))

    latencias = []
    descargas = []
    for cid, _, sel in trabajos:
        mjd_med = float(np.median([r["mjd"] for r in sel]))
        ra_c, dec_c = posicion_en(campos[cid], mjd_med)
        for r in sel:
            descargas.append((r, urls[(cid, r["obs_id"], r["detector"])], cid, ra_c, dec_c))
    t0 = time.time()
    with ThreadPoolExecutor(HILOS) as ex:
        res = list(ex.map(lambda a: bajar(*a), descargas))
    total = time.time() - t0
    rutas, fallas = {}, []
    for (r, *_), (ruta, seg, error) in zip(descargas, res):
        if error:
            fallas.append({"obs_id": r["obs_id"], "detector": r["detector"], "error": error,
                           "segundos_hasta_rendirse": round(seg, 1)})
            continue
        rutas[(r["campo"], r["obs_id"], r["detector"])] = ruta
        if seg is not None:
            latencias.append({"archivo": ruta.name, "segundos": round(seg, 1),
                              "kb": ruta.stat().st_size // 1024})
    if latencias:
        s = np.array([x["segundos"] for x in latencias])
        (RESULTADOS / "latencia_cutouts.json").write_text(json.dumps({
            "size_deg": SIZE_DEG, "hilos": HILOS, "n": len(s), "total_pared_s": round(total, 1),
            "mediana_s": round(float(np.median(s)), 1), "p90_s": round(float(np.percentile(s, 90)), 1),
            "max_s": round(float(s.max()), 1),
            "kb_mediana": int(np.median([x["kb"] for x in latencias])),
            "fallas_tras_6_reintentos": fallas, "detalle": latencias,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{len(s)} cutouts: mediana {np.median(s):.1f}s, p90 {np.percentile(s, 90):.1f}s, "
              f"pared {total:.0f}s con {HILOS} hilos")

    resumen_flags = {}
    for cid, etiqueta, sel in trabajos:
        c = campos[cid]
        sel = [r for r in sel if (cid, r["obs_id"], r["detector"]) in rutas]
        if len(sel) < 2:
            print(f"{cid} {etiqueta}: menos de 2 recortes disponibles, sin figura")
            continue
        n = len(sel)
        mjd_med = float(np.median([r["mjd"] for r in sel]))
        w_destino = grilla_comun(*posicion_en(c, mjd_med))
        fig, axs = plt.subplots(1, n + 1, figsize=(2.6 * (n + 1), 3.0))
        imgs, pos = [], []
        for ax, r in zip(axs, sel):
            img, p, nflag, ntot = panel(ax, rutas[(cid, r["obs_id"], r["detector"])], c, r, w_destino)
            imgs.append(img); pos.append(p)
            resumen_flags.setdefault(f"{cid}_{etiqueta}", []).append(round(nflag / ntot, 3))
        # Resta última − primera, ya en la misma grilla. Se normaliza cada una con estadística
        # robusta para que la diferencia de fondo entre épocas no domine.
        ax = axs[-1]
        a, b = imgs[0], imgs[-1]
        a = (a - np.nanmedian(a)) / np.nanstd(a)
        b = (b - np.nanmedian(b)) / np.nanstd(b)
        dif = b - a
        lim = np.nanpercentile(np.abs(dif[np.isfinite(dif)]), 99.5)
        ax.imshow(dif, origin="lower", cmap="RdBu_r", vmin=-lim, vmax=lim)
        ax.plot(*pos[0], "+", color="k", ms=10); ax.plot(*pos[-1], "x", color="k", ms=8)
        ax.set_title("última − primera (rojo = ahora)", fontsize=8)
        ax.set_xticks([]); ax.set_yticks([])
        lam = [r["lambda_um"] for r in sel]
        desplaz = np.hypot(c["pmra"], c["pmdec"]) / 1000 * (sel[-1]["anio"] - sel[0]["anio"])
        fig.suptitle(f"{c['nombre']} · D{sel[0]['detector']} · {etiqueta.replace('_', ' ')} · "
                     f"Δλ={max(lam) - min(lam):.3f} µm · desplazamiento esperado "
                     f"{desplaz:.1f}\" = {desplaz / ESCALA:.1f} px", fontsize=9)
        fig.tight_layout()
        fig.savefig(FIGURAS / f"02_{cid}_{etiqueta}.png", dpi=110)
        plt.close(fig)

    (RESULTADOS / "fraccion_pixeles_con_flags.json").write_text(
        json.dumps(resumen_flags, indent=2), encoding="utf-8")
    print("Figuras en", FIGURAS)


if __name__ == "__main__":
    main()
