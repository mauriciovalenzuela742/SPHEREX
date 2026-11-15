"""Figuras 16:9 con letra grande para el pitch y la entrega, en inglés (en) y español (es).
Mismo contenido que figuras.py (fig1 huellas, fig2 posiciones) más fig3 (búsqueda ciega) y fig4 (limpieza de fondo).

Uso: python figuras_pitch.py [CARPETA_DATOS] [CARPETA_SALIDA]
  CARPETA_DATOS  por defecto D:\\dev\\informes_v2\\huella_espectral (huella_wise_0855.json, ids_wise_0855.json, pilas_wise_0855.npz, limpieza_wise0855.npz)
  CARPETA_SALIDA por defecto ../../docs/hallazgos/img
Requiere haber corrido busqueda_ciega.py y limpieza_fondo.py.
"""
import json, math, os, re, sys
import numpy as np, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from astropy.wcs import WCS

AQUI = os.path.dirname(os.path.abspath(__file__))
D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "..", "..", "docs", "hallazgos", "img")
os.makedirs(OUT, exist_ok=True)
H = json.load(open(os.path.join(D, "huella_wise_0855.json"))); F = H["fuentes"]
ids = json.load(open(os.path.join(D, "ids_wise_0855.json"))); z = np.load(os.path.join(D, "pilas_wise_0855.npz"))
ZL = np.load(os.path.join(D, "limpieza_wise0855.npz"))
BC = json.load(open(os.path.join(AQUI, "busqueda_ciega_resultado.json")))
CV = json.load(open(os.path.join(AQUI, "cifras_verificadas.json")))
LF = json.load(open(os.path.join(AQUI, "limpieza_fondo_resultado.json")))
lam = np.array(H["lam_bins"]); N = 41
wg = WCS(naxis=2); wg.wcs.ctype = ["RA---TAN", "DEC--TAN"]; wg.wcs.crval = [float(z["ra_c"]), float(z["dec_c"])]
wg.wcs.crpix = [(N + 1) / 2] * 2; wg.wcs.cdelt = [-3.075 / 3600, 3.075 / 3600]
plt.rcParams.update({"font.size": 17, "axes.titlesize": 21, "axes.labelsize": 19, "legend.fontsize": 15,
                     "xtick.labelsize": 16, "ytick.labelsize": 16, "font.family": "DejaVu Sans"})
col = {"1": "#9ecae1", "2": "#3182bd", "3": "#08306b"}
mov = CV["movimiento"]["1-3"]; Dd = CV["D"]

T = {
 "en": dict(
   f1_sup="Spectral fingerprint: each source keeps its spectral shape from one sky pass to the next",
   f1_t=("WISE 0855 (Y brown dwarf)", "Background star next to it"),
   f1_x="Wavelength (µm)", f1_y="Flux (mJy)",
   pas={"1": "Pass 1 (May 2025)*", "2": "Pass 2 (Nov 2025)", "3": "Pass 3 (May 2026)"},
   f1_box=("No light below 3.5 µm,\nbright at 4.6 µm (methane window)", "Bright at 0.8 µm,\nfades toward 5 µm"),
   f1_nota="* Pass 1 incomplete (30 exposures in 1 day). Forced PSF photometry, 12 wavelength bins; bars = 1σ. Data: SPHEREx Level 2 (NASA/IPAC IRSA).",
   f2_sup="WISE 0855: same fingerprint, new position. Moved {m:.2f}″ ± {e:.2f}″ in one year (predicted {p:.2f}″)",
   f2_t=("Bands 1–3 (0.75–2.4 µm): the star dominates", "Bands 5–6 (3.8–5 µm): WISE 0855 dominates"),
   f2_sub="(pass 2 stack)", f2_pred="predicted (proper motion + parallax)", f2_quiet="static field sources", f2_meas="WISE 0855, measured",
   f2_px="1 pixel = 6.15″",
   f2_nota="North up, east left. ~1′ crop of the ~2′ field analysed. No external catalogues: every source was detected in SPHEREx stacks.",
   f3_sup="Blind search: which sources move, and what are they? (no catalogue, no target position)",
   f3_x="Net motion in one year (significance, σ)", f3_y="Fraction of flux at λ > 3.8 µm",
   f3_lab="Only mover: WISE 0855\n{d:.2f}″ in 1 yr, {s:.1f}σ\n{r:.0%} of its light beyond 3.8 µm",
   f3_thr="5σ threshold", f3_star="other sources (static)",
   f3_nota=("Tracks built with mutual fingerprint matching across passes 1→2→3. With mutual nearest-position matching,\n"
            "the WISE 0855 track breaks in pass 3 (it blends with the star) and no mover is found.\n"
            "Thresholds were set on this same field: proof of concept, not a survey."),
   f4_sup="Background-star removal in Pass 3 (May 2026): isolating WISE 0855 as it crosses the star",
   f4_t=("Raw Bands 5–6 (3.8–5 µm)\nBlended centroid: {sr:.2f}″ from star",
         "Static-star PSF subtracted\nStatic RMS ÷ {fp:.1f}× | sep = {sp:.2f}″",
         "Direct B5–6 − {a:.3f}·B1–3\nStatic RMS ÷ {fc:.1f}×/÷{fl:.1f}× | sep = {ss:.2f}″ (pred {pr:.2f}″)"),
   f4_quiet="static stars (suppressed)", f4_star="removed star", f4_track="WISE 0855 track (P1→P2→P3)",
   f4_zoom="Zoom (3.3″–4.2″ blend)",
   f4_nota=("Full ~1.9′×1.8′ field (north up, east left; insets zoom into the 22″×17″ blend core). Static stars and the neighbor match from blind fingerprint tracking.\n"
            "Spectral subtraction removes the Rayleigh-Jeans star tail from pixels without fitting a PSF, recovering WISE 0855 within 0.09″ of the 4.27″ orbital prediction."),
 ),
 "es": dict(
   f1_sup="Huella espectral: cada fuente conserva la forma de su espectro de una pasada a otra",
   f1_t=("WISE 0855 (enana marrón Y)", "Estrella de fondo vecina"),
   f1_x="Longitud de onda (µm)", f1_y="Flujo (mJy)",
   pas={"1": "Pasada 1 (may-2025)*", "2": "Pasada 2 (nov-2025)", "3": "Pasada 3 (may-2026)"},
   f1_box=("Sin luz bajo 3,5 µm,\nbrillante a 4,6 µm (ventana del metano)", "Brillante a 0,8 µm,\ndecae hacia 5 µm"),
   f1_nota="* Pasada 1 incompleta (30 exposiciones en 1 día). Fotometría PSF forzada, 12 tramos de λ; barras = 1σ. Datos: SPHEREx nivel 2 (NASA/IPAC IRSA).",
   f2_sup="WISE 0855: misma huella, otra posición. Se movió {m:.2f}″ ± {e:.2f}″ en un año (predicho {p:.2f}″)",
   f2_t=("Bandas 1–3 (0,75–2,4 µm): domina la estrella", "Bandas 5–6 (3,8–5 µm): domina WISE 0855"),
   f2_sub="(pila de la pasada 2)", f2_pred="predicho (mov. propio + paralaje)", f2_quiet="fuentes de campo quietas", f2_meas="WISE 0855, medido",
   f2_px="1 píxel = 6,15″",
   f2_nota="Norte arriba, este a la izquierda. Recorte de ~1′ del campo analizado (~2′). Sin catálogos externos: fuentes detectadas en las pilas de SPHEREx.",
   f3_sup="Búsqueda ciega: ¿qué se mueve y qué es? (sin catálogo y sin decirle dónde está el objeto)",
   f3_x="Movimiento neto en un año (significancia, σ)", f3_y="Fracción del flujo en λ > 3,8 µm",
   f3_lab="Única que se mueve: WISE 0855\n{d:.2f}″ en 1 año, {s:.1f}σ\n{r:.0%} de su luz más allá de 3,8 µm",
   f3_thr="umbral 5σ", f3_star="demás fuentes (quietas)",
   f3_nota=("Trayectorias armadas con emparejamiento mutuo por huella entre las pasadas 1→2→3. Con emparejamiento por posición más cercana,\n"
            "la de WISE 0855 se corta en la pasada 3 (se mezcla con la estrella) y no aparece ningún candidato.\n"
            "Umbrales fijados en este mismo campo: prueba de concepto, no un sondeo."),
   f4_sup="Limpieza ciega de estrellas de fondo (pasada 3, may-2026): aislando a WISE 0855",
   f4_t=("Bandas 5–6 crudas (3,8–5 µm)\nCentroide mezclado a {sr:.2f}″ de la estrella",
         "Resta ciega de PSF estáticas\nRMS estáticas ÷ {fp:.1f}× | sep = {sp:.2f}″",
         "Resta espectral B5–6 − {a:.3f}·B1–3\nRMS ÷ {fc:.1f}×/÷{fl:.1f}× | sep = {ss:.2f}″ (pred {pr:.2f}″)"),
   f4_quiet="estrellas quietas (suprimidas)", f4_star="estrella restada", f4_track="trayectoria WISE 0855 (P1→P2→P3)",
   f4_zoom="Detalle de la mezcla",
   f4_nota=("Campo de ~1,9′×1,8′ (norte arriba, este a la izquierda; recuadro amplía los 22″×17″ centrales). Estrellas estáticas identificadas a ciegas por huella espectral.\n"
            "La resta espectral elimina la cola estelar directamente por píxel sin ajustar PSF, recuperando WISE 0855 a 0,09″ de los 4,27″ predichos."),
 ),
}


def coma(s, lang): return re.sub(r"(\d)\.(\d)", r"\1,\2", s) if lang == "es" else s


for lang, t in T.items():
    # ---------- Fig 1: huellas
    fig, ax = plt.subplots(1, 2, figsize=(16, 9))
    for k, key in enumerate(("obj", "est")):
        for ps in F:
            b = np.array(H["espectros"][ps][ids[key][ps]]["bins"], float); ok = np.isfinite(b[:, 0])
            ax[k].errorbar(lam[ok], b[ok, 0], yerr=b[ok, 1], fmt="o-", color=col[ps], lw=2.6, ms=9, capsize=3, label=t["pas"][ps])
        ax[k].axhline(0, color="0.6", lw=1); ax[k].set_title(t["f1_t"][k], weight="bold"); ax[k].set_xlabel(t["f1_x"])
        ax[k].set_xlim(0.7, 5.05); ax[k].set_ylim(-0.25, 1.45); ax[k].grid(alpha=0.25)
        ax[k].text(0.53 if k == 0 else 0.97, 0.63 if k == 0 else 0.97, t["f1_box"][k], transform=ax[k].transAxes, ha="center" if k == 0 else "right", va="top", fontsize=16,
                   bbox=dict(boxstyle="round", fc="#fff8e1", ec="#e0a800"))
        if lang == "es": ax[k].xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: f"{v:.1f}".replace(".", ",")))
    ax[0].set_ylabel(t["f1_y"]); ax[0].legend(loc="upper left", framealpha=0.95)
    if lang == "es":
        for a in ax: a.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: f"{v:.1f}".replace(".", ",")))
    fig.suptitle(t["f1_sup"], fontsize=22, weight="bold")
    fig.text(0.01, 0.01, t["f1_nota"] + ("\nPass-1 error bars at 4.6 µm (±1.2 and ±1.0 mJy) are clipped." if lang == "en" else "\nLas barras de la pasada 1 a 4,6 µm (±1,2 y ±1,0 mJy) quedan cortadas."),
             fontsize=13, color="0.3")
    plt.tight_layout(rect=(0, 0.07, 1, 0.94)); fig.savefig(os.path.join(OUT, f"huella_espectral_fig1_espectros_{lang}.png"), dpi=125); plt.close(fig)

    # ---------- Fig 2: posiciones
    fig, ax = plt.subplots(1, 2, figsize=(16, 9))
    for k, g in enumerate(("corto", "largo")):
        sn = z[f"2_{g}_st"] / np.sqrt(z[f"2_{g}_var"])
        ax[k].imshow(sn, origin="lower", cmap="gray_r", vmin=-2, vmax=25 if g == "corto" else 12, extent=(-0.5, N - 0.5, -0.5, N - 0.5))
        ax[k].set_title(t["f2_t"][k] + "\n" + t["f2_sub"], fontsize=19)
        primero = True
        for ps in F:
            for i, f in enumerate(F[ps]):
                if i == ids["obj"][ps]: continue
                ax[k].plot(f["x"], f["y"], "o", mfc="none", mec="#2ca02c", ms=20, mew=2, label=t["f2_quiet"] if primero else None); primero = False
        xo = [F[ps][ids["obj"][ps]]["x"] for ps in F]; yo = [F[ps][ids["obj"][ps]]["y"] for ps in F]
        for j in range(len(xo) - 1):
            ax[k].annotate("", xy=(xo[j + 1], yo[j + 1]), xytext=(xo[j], yo[j]), arrowprops=dict(arrowstyle="-|>", color="#d62728", lw=3, mutation_scale=22))
        for n, (ps, x, y) in enumerate(zip(F, xo, yo)):
            ax[k].plot(x, y, "o", color=col[ps], mec="k", ms=11, label=t["f2_meas"] if n == 0 else None)
            ax[k].text(x - 0.3, y - 1.6, f"P{ps}", color="#d62728", fontsize=19, weight="bold", ha="center")
        pp = [wg.wcs_world2pix([[H["prediccion"][ps]["ra"], H["prediccion"][ps]["dec"]]], 0)[0] for ps in F]
        ax[k].plot([p[0] for p in pp], [p[1] for p in pp], "x--", color="orange", ms=13, mew=2.5, lw=1.8, label=t["f2_pred"])
        ax[k].set_xlim(13.5, 33.5); ax[k].set_ylim(13, 30); ax[k].set_xticks([]); ax[k].set_yticks([])
        ax[k].plot([29, 31], [14, 14], "k-", lw=5); ax[k].text(30, 14.5, t["f2_px"], fontsize=16, ha="center", bbox=dict(fc="white", ec="none", alpha=0.8))
    ax[1].legend(loc="upper left", framealpha=0.95, fontsize=14)
    m, e, p = mov["medido"], mov["error"], mov["predicho_pm_plx"]
    fig.suptitle(coma(t["f2_sup"].format(m=m, e=e, p=p), lang), fontsize=22, weight="bold")
    fig.text(0.01, 0.01, t["f2_nota"], fontsize=13, color="0.3")
    plt.tight_layout(rect=(0, 0.04, 1, 0.94)); fig.savefig(os.path.join(OUT, f"huella_espectral_fig2_posiciones_{lang}.png"), dpi=125); plt.close(fig)

    # ---------- Fig 3: búsqueda ciega
    fig, ax = plt.subplots(figsize=(16, 9))
    tr = BC["huella"]["trayectorias"]
    xs = [x["sigma13"] for x in tr]; ys = [x["frac_flujo_lambda>3.8um_P2"] for x in tr]
    cand = [x for x in tr if x["candidata"]]
    ax.scatter([x["sigma13"] for x in tr if not x["candidata"]], [x["frac_flujo_lambda>3.8um_P2"] for x in tr if not x["candidata"]],
               s=260, color="#7f7f7f", edgecolor="k", label=t["f3_star"], zorder=3)
    for c in cand:
        ax.scatter(c["sigma13"], c["frac_flujo_lambda>3.8um_P2"], s=700, marker="*", color="#d62728", edgecolor="k", zorder=4)
        ax.annotate(coma(t["f3_lab"].format(d=c["d13"], s=c["sigma13"], r=c["frac_flujo_lambda>3.8um_P2"]), lang),
                    (c["sigma13"], c["frac_flujo_lambda>3.8um_P2"]), xytext=(5.8, 0.42), fontsize=18,
                    arrowprops=dict(arrowstyle="->", lw=2), bbox=dict(boxstyle="round", fc="#fdecea", ec="#d62728"))
    ax.axvline(5, color="orange", ls="--", lw=2.5, label=t["f3_thr"])
    ax.set_xlim(-0.5, 12.5); ax.set_ylim(-0.05, 1.05); ax.grid(alpha=0.25)
    ax.set_xlabel(t["f3_x"]); ax.set_ylabel(t["f3_y"]); ax.legend(loc="upper left", framealpha=0.95)
    if lang == "es":
        ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, p: f"{v:.1f}".replace(".", ",")))
    fig.suptitle(t["f3_sup"], fontsize=22, weight="bold")
    fig.text(0.01, 0.01, t["f3_nota"], fontsize=13, color="0.3")
    plt.tight_layout(rect=(0, 0.11, 1, 0.94)); fig.savefig(os.path.join(OUT, f"huella_espectral_fig3_busqueda_ciega_{lang}.png"), dpi=125); plt.close(fig)

    # ---------- Fig 4: limpieza de fondo en P3
    fig, ax = plt.subplots(1, 3, figsize=(16, 9))
    p3 = LF["pasadas"]["3"]
    mats = [
        ZL["3_raw_largo"] - float(np.nanmedian(ZL["3_raw_largo"])),
        ZL["3_psf_clean"] - float(np.nanmedian(ZL["3_psf_clean"])),
        ZL["3_spec_clean"] - float(np.nanmedian(ZL["3_spec_clean"])),
    ]
    titulos_4 = [
        coma(t["f4_t"][0].format(sr=p3["wise0855_raw_largo"]["sep_vecina_arcsec"]), lang),
        coma(t["f4_t"][1].format(
            fp=p3["supresion_estaticas_psf_vs_raw_l"]["factor_reduccion_rms"],
            sp=p3["wise0855_psf_clean"]["sep_vecina_arcsec"],
        ), lang),
        coma(t["f4_t"][2].format(
            a=LF["alpha_largo_sobre_corto"],
            fc=p3["supresion_estaticas_spec_vs_raw_c"]["factor_reduccion_rms_vs_corto"],
            fl=p3["supresion_estaticas_spec_vs_raw_c"]["factor_reduccion_rms_vs_largo"],
            ss=p3["wise0855_spec_clean"]["sep_vecina_arcsec"],
            pr=LF["prediccion_sep_P3_arcsec"],
        ), lang),
    ]
    c_xy = [ZL[f"{ps}_cand_xy"] for ps in ("1", "2", "3")]
    ic3 = BC["huella"]["candidatas"][0]["P3"]
    for k, (mat, tit) in enumerate(zip(mats, titulos_4)):
        ax[k].imshow(mat, origin="lower", cmap="gray_r", vmin=-0.008, vmax=0.048, extent=(-0.5, N - 0.5, -0.5, N - 0.5))
        ax[k].set_title(tit, fontsize=14.5, pad=8)
        # Circulos verdes para estrellas quietas en todos los paneles
        prim_q = True
        for i, f in enumerate(F["3"]):
            if i == ic3: continue
            ax[k].plot(f["x"], f["y"], "o", mfc="none", mec="#2ca02c", ms=15, mew=1.8, ls="--",
                       alpha=0.9 if k == 0 else 0.55, label=t["f4_quiet"] if prim_q and k == 0 else None)
            prim_q = False
        # Trayectoria WISE 0855 P1 -> P2 -> P3
        xo4 = [c[0] for c in c_xy]; yo4 = [c[1] for c in c_xy]
        for j in range(len(xo4) - 1):
            ax[k].annotate("", xy=(xo4[j + 1], yo4[j + 1]), xytext=(xo4[j], yo4[j]),
                           arrowprops=dict(arrowstyle="-|>", color="#d62728", lw=2.2, mutation_scale=16))
        ax[k].plot(xo4, yo4, "o", color="#d62728", mec="k", ms=7, label=t["f4_track"] if k == 1 else None)
        # Posicion de la estrella vecina restada (c_xy[2][2], c_xy[2][3])
        xv, yv = float(c_xy[2][2]), float(c_xy[2][3])
        ax[k].plot(xv, yv, "x", color="orange", ms=11, mew=2.4, label=t["f4_star"] if k == 1 else None)
        ax[k].set_xlim(1, 37); ax[k].set_ylim(3, 38); ax[k].set_xticks([]); ax[k].set_yticks([])
        # Barra de escala 15" (= 4.88 px rejilla)
        ax[k].plot([3, 3 + 15.0 / 3.075], [5, 5], "k-", lw=4)
        ax[k].text(3 + 7.5 / 3.075, 5.7, "15″", fontsize=14, ha="center", bbox=dict(fc="white", ec="none", alpha=0.8))
        # Zoom inset en esquina superior derecha
        ins = ax[k].inset_axes([0.56, 0.57, 0.41, 0.39])
        ins.imshow(mat, origin="lower", cmap="gray_r", vmin=-0.008, vmax=0.048, extent=(-0.5, N - 0.5, -0.5, N - 0.5))
        for j in range(len(xo4) - 1):
            ins.annotate("", xy=(xo4[j + 1], yo4[j + 1]), xytext=(xo4[j], yo4[j]),
                         arrowprops=dict(arrowstyle="-|>", color="#d62728", lw=2, mutation_scale=13))
        for p_n, (xp, yp) in enumerate(zip(xo4, yo4), 1):
            ins.plot(xp, yp, "o", color=col[str(p_n)], mec="k", ms=7)
            ins.text(xp - 0.2, yp - 0.9, f"P{p_n}", color="#d62728", fontsize=12, weight="bold", ha="center")
        ins.plot(xv, yv, "x", color="orange", ms=10, mew=2.4)
        ins.set_xlim(17.0, 24.2); ins.set_ylim(18.0, 23.6); ins.set_xticks([]); ins.set_yticks([])
        for sp in ins.spines.values():
            sp.set_edgecolor("#444444"); sp.set_linewidth(1.5)
        ins.set_title(t["f4_zoom"], fontsize=11, pad=3, bbox=dict(fc="white", ec="none", alpha=0.85))
    h_all, l_all = [], []
    for a in ax[:2]:
        hh, ll = a.get_legend_handles_labels()
        h_all.extend(hh); l_all.extend(ll)
    fig.legend(h_all, l_all, loc="upper center", bbox_to_anchor=(0.5, 0.91), ncol=3, framealpha=0.95, fontsize=14)
    fig.suptitle(t["f4_sup"], fontsize=20.5, weight="bold", y=0.97)
    fig.text(0.01, 0.01, coma(t["f4_nota"], lang), fontsize=12.5, color="0.3")
    plt.tight_layout(rect=(0, 0.07, 1, 0.85)); fig.savefig(os.path.join(OUT, f"huella_espectral_fig4_limpieza_fondo_{lang}.png"), dpi=125); plt.close(fig)
print("figuras en", os.path.abspath(OUT))
