"""P2: desplazamiento en 6 meses frente al píxel de 6,15″ y precisión de centroide necesaria."""
import json, math
PIX = 6.15
objs = {"Barnard": (10.4, 0.547), "WISE 0855": (8.1, 0.439), "eps Ind B": (4.7, 0.276)}  # ″/año, paralaje ″
out = {}
for n, (mu, plx) in objs.items():
    r = {}
    for meses in (6, 12):
        d = mu * meses / 12
        # detección a 5σ de un desplazamiento d con 2 pasadas: σ_pos por pasada tal que d/(√2 σ) ≥ 5
        sig2 = d / (5 * math.sqrt(2))
        r[f"{meses}m"] = {"arcsec": round(d, 2), "px": round(d / PIX, 3), "sigma_pos_5sig_2pasadas_arcsec": round(sig2, 2), "px_sig": round(sig2 / PIX, 3)}
    # 3 pasadas equiespaciadas (0, 6, 12 meses): ajuste lineal, σ_mu = σ/ (√(Σ(t-tm)^2)) con t en años
    ts = [0, 0.5, 1.0]; tm = sum(ts) / 3; S = math.sqrt(sum((t - tm) ** 2 for t in ts))
    sig3 = mu * S / 5
    r["3pasadas_sigma_pos_5sig_arcsec"] = round(sig3, 2); r["3pasadas_px"] = round(sig3 / PIX, 3)
    r["paralaje_pico_a_pico_arcsec"] = round(2 * plx, 2)
    out[n] = r
    print(n, r)
# centroide: σ ≈ FWHM / (2,35 · S/N) (límite de fotones; Lindegren/King aprox.)  -> S/N necesaria
for fwhm_px in (1.0, 1.5, 2.0):
    for n in objs:
        s = out[n]["6m"]["sigma_pos_5sig_2pasadas_arcsec"] / PIX
        print(f"FWHM={fwhm_px} px: {n} necesita S/N ≥ {fwhm_px/(2.35*s):.0f} por pasada (σ={s:.3f} px)")
json.dump(out, open("q2_resultados.json", "w"), indent=1)
