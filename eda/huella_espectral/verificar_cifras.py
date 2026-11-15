"""Recalcula, desde los archivos intermedios, todas las cifras que citan los documentos de
docs/hallazgos/huella_espectral_wise0855.md y spectral_fingerprint_wise0855_en.md.

Uso:  python verificar_cifras.py [CARPETA_DATOS]
CARPETA_DATOS (por defecto D:\\dev\\informes_v2\\huella_espectral) debe tener huella_wise_0855.json,
ids_wise_0855.json, barnard_simple.json y cajas/wise_0855/*.npz. Escribe cifras_verificadas.json al lado de este script.
"""
import glob, json, math, os, sys
from collections import Counter
import numpy as np
from astropy.time import Time

D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
H = json.load(open(os.path.join(D, "huella_wise_0855.json")))
ids = json.load(open(os.path.join(D, "ids_wise_0855.json")))
F, E, P = H["fuentes"], H["espectros"], H["prediccion"]
GRID = 6.15 / 2  # ″ por píxel de la rejilla de las pilas
out = {}


def distancia(A, B):  # copia exacta de paso3_huella.py
    a = np.array([x[0] for x in A]); ea = np.array([x[1] for x in A]); b = np.array([x[0] for x in B]); eb = np.array([x[1] for x in B])
    ok = np.isfinite(a) & np.isfinite(b)
    if ok.sum() < 4: return np.nan
    a, ea, b, eb = a[ok], ea[ok], b[ok], eb[ok]; s = 1.0
    for _ in range(20):
        v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
        s = max(np.sum(a * b / v) / np.sum(b * b / v), 1e-3)
    v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
    return float(np.sum((a - s * b) ** 2 / v) / (ok.sum() - 1))


def sep(f, g):
    return math.hypot((f["ra"] - g["ra"]) * math.cos(math.radians(f["dec"])), f["dec"] - g["dec"]) * 3600


def iso(mjd): return Time(mjd, format="mjd").iso[:10]


# 1) Pasadas: exposiciones, fechas, bandas (mismo agrupamiento que comun_h.cargar: hueco > 30 d)
meta = []
for r in glob.glob(os.path.join(D, "cajas", "wise_0855", "*.npz")):
    z = np.load(r); meta.append((float(z["mjd"]), int(z["banda"])))
meta.sort(); pas = [[meta[0]]]
for m in meta[1:]:
    (pas[-1].append(m) if m[0] - pas[-1][-1][0] <= 30 else pas.append([m]))
out["pasadas"] = {str(i + 1): {"n_exp": len(p), "desde": iso(p[0][0]), "hasta": iso(p[-1][0]), "dias": round(p[-1][0] - p[0][0], 1),
                               "por_banda": dict(sorted(Counter(b for _, b in p).items()))} for i, p in enumerate(pas)}
out["n_exp_total"] = len(meta)
out["fuentes_por_pasada"] = {k: len(v) for k, v in F.items()}

# 2) Distancia espectral D
o, s = ids["obj"], ids["est"]
out["D"] = {}
for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
    bins = lambda ps, i: E[ps][i]["bins"]
    out["D"][f"{a}-{b}"] = {"obj_obj": distancia(bins(a, o[a]), bins(b, o[b])), "obj_est": distancia(bins(a, o[a]), bins(b, s[b])),
                            "est_est": distancia(bins(a, s[a]), bins(b, s[b])), "est_obj": distancia(bins(a, s[a]), bins(b, o[b]))}

# 3) Movimiento de WISE 0855 medido vs predicho (pm + paralaje)
out["movimiento"] = {}
for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
    oa, ob = F[a][o[a]], F[b][o[b]]; c = math.cos(math.radians(oa["dec"]))
    m = ((ob["ra"] - oa["ra"]) * c * 3600, (ob["dec"] - oa["dec"]) * 3600)
    p = ((P[b]["ra"] - P[a]["ra"]) * c * 3600, (P[b]["dec"] - P[a]["dec"]) * 3600)
    p0 = ((P[b]["ra_sin_plx"] - P[a]["ra_sin_plx"]) * c * 3600, (P[b]["dec_sin_plx"] - P[a]["dec_sin_plx"]) * 3600)
    e = math.hypot(math.hypot(oa["ex"], oa["ey"]), math.hypot(ob["ex"], ob["ey"])) * GRID
    dm = math.hypot(*m)
    out["movimiento"][f"{a}-{b}"] = {"medido": dm, "error": e, "sigma": dm / e, "predicho_pm_plx": math.hypot(*p), "predicho_solo_pm": math.hypot(*p0),
                                     "dif_vectorial": math.hypot(m[0] - p[0], m[1] - p[1]), "dias": P[b]["mjd"] - P[a]["mjd"]}

# 4) Separación WISE 0855 - estrella por pasada (medida y predicha)
out["sep_obj_estrella"] = {ps: {"medida": sep(F[ps][o[ps]], F[ps][s[ps]]), "predicha": sep(P[ps], F[ps][s[ps]])} for ps in F}
out["error_pos_obj_por_eje"] = {ps: [F[ps][o[ps]]["ex"] * GRID, F[ps][o[ps]]["ey"] * GRID] for ps in F}

# 5) Fuentes quietas y movidas (regla de pareja mutua, igual que figuras.py), sin WISE 0855
quietas, movidas, rech, sinc = [], {}, {}, {}
for k, filas in H["pares"].items():
    a, b = k.split("-"); movidas[k] = []; rech[k] = []; sinc[k] = 0
    for fl in filas:
        if fl["i"] == o[a]: continue
        if fl["j"] is None: sinc[k] += 1; continue
        g = F[b][fl["j"]]; mutuo = min(range(len(F[a])), key=lambda i: sep(F[a][i], g)) == fl["i"]
        d = fl["desplazamiento_arcsec"]
        if not mutuo: rech[k].append(round(d, 2))
        elif d < 1.0: quietas.append(d)
        else: movidas[k].append(round(d, 2))
    # ¿la huella cambió algún emparejamiento frente a «la más cercana»?
out["quietas"] = {"n": len(quietas), "mediana": float(np.median(quietas)), "max": float(max(quietas)),
                  "mediana_px_nativos": float(np.median(quietas)) / 6.15, "max_px_nativos": max(quietas) / 6.15}
out["movidas_falsas"] = movidas; out["no_mutuas_descartadas"] = rech; out["sin_candidata"] = sinc
out["huella_cambio_emparejamiento"] = sum(fl["j"] is not None and fl["j"] != fl["j_cercana"] for filas in H["pares"].values() for fl in filas)
out["D_fuentes_campo"] = sorted(round(fl["D"], 2) for k, filas in H["pares"].items() for fl in filas
                               if fl["j"] is not None and fl["i"] != o[k.split("-")[0]] and fl["i"] != s[k.split("-")[0]])

# 6) Flujos de la huella (tramo 4,6 µm y tramo más corto)
lam = H["lam_bins"]
out["flujo_mJy"] = {ps: {"obj_4.62um": E[ps][o[ps]]["bins"][-1][:2], "est_4.62um": E[ps][s[ps]]["bins"][-1][:2],
                         "obj_max_abs_bajo_3.5um": max(abs(x[0]) for x, l in zip(E[ps][o[ps]]["bins"], lam) if l < 3.5 and x[0] == x[0]),
                         "est_0.81um": E[ps][s[ps]]["bins"][0][:2]} for ps in F}
out["sigma_psf_px_nativos"] = H["sigma_psf"]

# 7) Barnard (centroide simple, bandas largas)
B = json.load(open(os.path.join(D, "barnard_simple.json")))
out["barnard"] = {}
for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
    A_, B_ = B[a], B[b]; c = math.cos(math.radians(A_["dec"]))
    m = ((B_["ra"] - A_["ra"]) * c * 3600, (B_["dec"] - A_["dec"]) * 3600); p = ((B_["ra_p"] - A_["ra_p"]) * c * 3600, (B_["dec_p"] - A_["dec_p"]) * 3600)
    out["barnard"][f"{a}-{b}"] = {"medido": math.hypot(*m), "predicho": math.hypot(*p), "dif": math.hypot(m[0] - p[0], m[1] - p[1])}

json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "cifras_verificadas.json"), "w"), indent=1, default=float)
print(json.dumps(out, indent=1, default=lambda x: round(float(x), 3)))
