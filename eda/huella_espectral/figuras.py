import json, math, numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from comun_h import wcs_grid, PIX
oid = "wise_0855"; H = json.load(open(f"huella_{oid}.json")); F = H["fuentes"]; ids = json.load(open(f"ids_{oid}.json")); z = np.load(f"pilas_{oid}.npz")
N = 41; wg = wcs_grid(float(z["ra_c"]), float(z["dec_c"]), N, PIX / 2); lam = np.array(H["lam_bins"])
def sep(f, g): return math.hypot((f["ra"] - g["ra"]) * math.cos(math.radians(f["dec"])), f["dec"] - g["dec"]) * 3600
# ---- conteo quietas / movidas con regla de emparejamiento mutuo
conteo = {}
for k, filas in H["pares"].items():
    a, b = k.split("-"); q, mov, rech, sinc = [], [], [], 0
    for fl in filas:
        if fl["j"] is None: sinc += 1; continue
        f, g = F[a][fl["i"]], F[b][fl["j"]]
        mutuo = min(range(len(F[a])), key=lambda i: sep(F[a][i], g)) == fl["i"] or fl["i"] == ids["obj"][a]
        # para el objeto: la fuente de P_a más parecida espectralmente a g, no la más cercana
        d = fl["desplazamiento_arcsec"]
        if not mutuo: rech.append((round(f["x"],1), round(f["y"],1), round(d, 2))); continue
        (q if d < 1.0 else mov).append((round(f["x"],1), round(f["y"],1), round(d, 2), round(fl["D"], 2), fl["i"] == ids["obj"][a]))
    conteo[k] = {"quietas": q, "movidas": mov, "rechazadas_no_mutuo": rech, "sin_candidata": sinc}
    print(k, "quietas", len(q), [x[2] for x in q], "movidas", mov, "no mutuas", rech, "sin candidata", sinc)
json.dump(conteo, open("conteo_wise_0855.json", "w"))
# ---- Figura 1: espectros por pasada
col = {"1": "#9ecae1", "2": "#3182bd", "3": "#08306b"}; fecha = {"1": "may-2025*", "2": "nov-2025", "3": "may-2026"}
fig, ax = plt.subplots(1, 2, figsize=(12, 4.6), sharey=False)
for k, (nom, key) in enumerate((("WISE 0855 (enana Y)", "obj"), ("Estrella vecina (fondo, J≈15,4)", "est"))):
    for ps in F:
        b = np.array(H["espectros"][ps][ids[key][ps]]["bins"], float)
        ok = np.isfinite(b[:, 0])
        ax[k].errorbar(lam[ok], b[ok, 0], yerr=b[ok, 1], fmt="o-", color=col[ps], lw=1.6, ms=5, capsize=2, label=f"Pasada {ps} ({fecha[ps]})")
    ax[k].axhline(0, color="0.6", lw=0.8); ax[k].set_title(nom, fontsize=13); ax[k].set_xlabel("Longitud de onda (µm)", fontsize=11)
    ax[k].set_xlim(0.7, 5.05)
ax[0].set_ylabel("Flujo (mJy)", fontsize=11); ax[0].legend(fontsize=9, loc="upper left")
fig.suptitle("La huella espectral: cada fuente conserva su forma de una pasada a otra (SPHEREx, fotometría PSF forzada)", fontsize=12)
fig.text(0.01, 0.005, "* Pasada 1 incompleta (30 exposiciones en 1 día). Promedios en 12 tramos de λ; barras = error. Datos: SPHEREx nivel 2 (IRSA).", fontsize=8, color="0.35")
plt.tight_layout(rect=(0, 0.03, 1, 0.95)); plt.savefig("fig1_espectros.png", dpi=150)
# ---- Figura 2: imagen + posiciones y flechas
fig, ax = plt.subplots(1, 2, figsize=(12, 5.6))
for k, (g, tit) in enumerate((("corto", "Bandas 1–3 (0,75–2,4 µm): domina la estrella"), ("largo", "Bandas 5–6 (3,8–5 µm): domina WISE 0855"))):
    st, vs = z[f"2_{g}_st"], z[f"2_{g}_var"]; sn = st / np.sqrt(vs)
    ax[k].imshow(sn, origin="lower", cmap="gray_r", vmin=-2, vmax=25 if g == "corto" else 12, extent=(-0.5, N - 0.5, -0.5, N - 0.5))
    ax[k].set_title(tit + "\n(pila de la pasada 2)", fontsize=11)
    for ps in F:
        for i, f in enumerate(F[ps]):
            if i == ids["obj"][ps]: continue
            ax[k].plot(f["x"], f["y"], "o", mfc="none", mec="#2ca02c", ms=13, mew=1.2)
    xo = [F[ps][ids["obj"][ps]]["x"] for ps in F]; yo = [F[ps][ids["obj"][ps]]["y"] for ps in F]
    for j in range(len(xo) - 1):
        ax[k].annotate("", xy=(xo[j + 1], yo[j + 1]), xytext=(xo[j], yo[j]), arrowprops=dict(arrowstyle="->", color="#d62728", lw=2))
    for ps, x, y in zip(F, xo, yo): ax[k].plot(x, y, "o", color=col[ps], mec="k", ms=7); ax[k].text(x - 0.4, y - 1.3 - 0.0*int(ps), f"P{ps}", color="#d62728", fontsize=11, weight="bold", ha="center")
    pp = [wg.wcs_world2pix([[H["prediccion"][ps]["ra"], H["prediccion"][ps]["dec"]]], 0)[0] for ps in F]
    ax[k].plot([p[0] for p in pp], [p[1] for p in pp], "x--", color="orange", ms=8, lw=1, label="predicho (mov. propio + paralaje)")
    ax[k].set_xlim(13.5, 33.5); ax[k].set_ylim(13, 30); ax[k].set_xticks([]); ax[k].set_yticks([])
    ax[k].plot([29, 31], [14, 14], "k-", lw=3); ax[k].text(28.5, 14.5, "1 píxel = 6,15″", fontsize=9)
ax[1].legend(loc="upper left", fontsize=9)
fig.suptitle("WISE 0855: misma huella espectral, otra posición — se movió 8,7″ en un año (predicho 8,0″). Verde: fuentes quietas (<0,4″)", fontsize=12)
fig.text(0.01, 0.005, "Norte arriba, este a la izquierda. Recorte de ~1′ del campo analizado (~2′). Sin catálogos externos: fuentes detectadas en las pilas de SPHEREx.", fontsize=8, color="0.35")
plt.tight_layout(rect=(0, 0.03, 1, 0.94)); plt.savefig("fig2_posiciones.png", dpi=150)
