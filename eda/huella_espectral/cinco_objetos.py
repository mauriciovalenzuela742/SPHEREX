"""Metricas unificadas de los 5 objetivos de ejemplo del desafio NASA Space Apps 2026
usando la tecnica de huella espectral y emparejamiento ciego:
  1. wise_0855  (enana marron Y2 en mezcla con estrella de fondo)
  2. eps_ind_b  (binaria T1+T6 brillosa, 4 pasadas con paralaje en zigzag, sin D1/D4 en P4)
  3. barnard    (enana M cercana de altisimo movimiento propio, nucleo brillante)
  4. rw_aur     (estrella joven T Tauri variable espectral estacionaria, alas PSF no gaussianas)
  5. r_dra      (Mira muy brillante saturada: 99.8 % de exposiciones con centro no finito)

Uso: python cinco_objetos.py [CARPETA_DATOS]
Por defecto lee D:\\dev\\informes_v2\\huella_espectral y escribe cinco_objetos_resultado.json junto al script.
"""
import glob
import json
import math
import os
import sys
import warnings
import numpy as np
from astropy.coordinates import get_body_barycentric
from astropy.io import fits
from astropy.time import Time
from astropy.wcs import WCS, FITSFixedWarning

warnings.simplefilter("ignore", FITSFixedWarning)

TRABAJO_PRECALC = r"D:\dev\informes_v2\precalc_espectros\trabajo"
sys.path.insert(0, TRABAJO_PRECALC)
_cwd = os.getcwd()
os.chdir(TRABAJO_PRECALC)
from comun import CAMPOS, pos  # noqa: E402
os.chdir(_cwd)

PIX = 6.15
GRID = PIX / 2.0
R_BUSQ = 3.0 * PIX  # 18.45"
PISO = 0.25         # " por eje y pasada
UMBRAL_SIGMA = 5.0


def pred_pm_plx(campo, mjd):
    ra, dec = pos(campo, mjd)
    plx = campo["paralaje_mas"] / 1000.0 / 3600.0
    E = get_body_barycentric("earth", Time(mjd, format="mjd")).xyz.to_value("AU")
    a, d = math.radians(ra), math.radians(dec)
    dra = plx * (E[0] * math.sin(a) - E[1] * math.cos(a)) / math.cos(d)
    ddec = plx * (E[0] * math.cos(a) * math.sin(d) + E[1] * math.sin(a) * math.sin(d) - E[2] * math.cos(d))
    return ra + dra, dec + ddec


def dsky_arcsec(ra1, dec1, ra2, dec2):
    dra = (ra2 - ra1) * math.cos(math.radians(0.5 * (dec1 + dec2))) * 3600.0
    ddec = (dec2 - dec1) * 3600.0
    return math.hypot(dra, ddec), dra, ddec


def sep(f, g):
    return math.hypot((f["ra"] - g["ra"]) * math.cos(math.radians(f["dec"])), f["dec"] - g["dec"]) * 3600.0


def err_pos(f):
    return math.hypot(math.hypot(f["ex"] * GRID, PISO), math.hypot(f["ey"] * GRID, PISO))


def distancia(A, B):
    a = np.array([x[0] for x in A], float)
    ea = np.array([x[1] for x in A], float)
    b = np.array([x[0] for x in B], float)
    eb = np.array([x[1] for x in B], float)
    ok = np.isfinite(a) & np.isfinite(b)
    if ok.sum() < 4:
        return np.inf
    a, ea, b, eb = a[ok], ea[ok], b[ok], eb[ok]
    s = 1.0
    for _ in range(20):
        v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
        s = max(float(np.sum(a * b / v) / np.sum(b * b / v)), 1e-3)
    v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
    return float(np.sum((a - s * b) ** 2 / v) / (ok.sum() - 1))


def frac_roja(bins, lam_bins):
    b = np.array(bins, float)[:, 0]
    ok = np.isfinite(b)
    tot = float(np.sum(np.clip(b[ok], 0, None)))
    roja = float(np.sum(np.clip(b[ok & (lam_bins > 3.8)], 0, None)))
    return float(roja / tot) if tot > 0 else float("nan")


def elige(F, E, a, i, b, regla):
    cand = [j for j, g in enumerate(F[b]) if sep(F[a][i], g) <= R_BUSQ]
    if not cand:
        return None
    if regla == "posicional":
        return min(cand, key=lambda j: sep(F[a][i], F[b][j]))
    return min(cand, key=lambda j: distancia(E[a][i]["bins"], E[b][j]["bins"]))


def mutua(F, E, a, i, b, regla):
    j = elige(F, E, a, i, b, regla)
    return j if j is not None and elige(F, E, b, j, a, regla) == i else None


def busqueda_ciega_multipase(H):
    F, E = H["fuentes"], H["espectros"]
    lam_bins = np.array(H["lam_bins"], float)
    pases = sorted(F.keys(), key=int)
    p0, pN = pases[0], pases[-1]
    out = {}
    for regla in ("posicional", "huella"):
        trayectorias, rotas = [], 0
        for i in range(len(F[p0])):
            cadena = [i]
            ok = True
            for a, b in zip(pases[:-1], pases[1:]):
                nxt = mutua(F, E, a, cadena[-1], b, regla)
                if nxt is None:
                    ok = False
                    break
                cadena.append(nxt)
            k1N = mutua(F, E, p0, i, pN, regla) if ok else None
            if not ok or k1N != cadena[-1]:
                rotas += 1
                continue
            f0, fN = F[p0][cadena[0]], F[pN][cadena[-1]]
            d1N, dra1N, ddec1N = dsky_arcsec(f0["ra"], f0["dec"], fN["ra"], fN["dec"])
            s1N = math.hypot(err_pos(f0), err_pos(fN))
            mid_idx = 1 if len(pases) > 2 else 0
            pas_mid = pases[mid_idx]
            fr_vals = [frac_roja(E[p][idx]["bins"], lam_bins) for p, idx in zip(pases, cadena)]
            fr_valid = [v for v in fr_vals if np.isfinite(v)]
            trayectorias.append({
                "cadena": dict(zip(pases, cadena)),
                "x_y_ref": [round(F[pas_mid][cadena[mid_idx]]["x"], 2), round(F[pas_mid][cadena[mid_idx]]["y"], 2)],
                "d_neto_arcsec": round(d1N, 3),
                "dra_neto_arcsec": round(dra1N, 3),
                "ddec_neto_arcsec": round(ddec1N, 3),
                "err_neto_arcsec": round(s1N, 3),
                "sigma_neto": round(d1N / s1N, 2),
                "candidata": bool(d1N / s1N >= UMBRAL_SIGMA),
                "D_p0_pN": round(distancia(E[p0][cadena[0]]["bins"], E[pN][cadena[-1]]["bins"]), 3),
                "frac_roja_med": round(float(np.median(fr_valid)), 3) if fr_valid else None,
            })
        usadasN = {t["cadena"][pN] for t in trayectorias}
        out[regla] = {
            "n_completas": len(trayectorias),
            "rotas_desde_P1": rotas,
            "huerfanas_Pfin": len(F[pN]) - len(usadasN),
            "trayectorias": trayectorias,
            "candidatas": [t for t in trayectorias if t["candidata"]],
        }
    return out


def resumen_cajas(D, oid):
    rutas = sorted(glob.glob(os.path.join(D, "cajas", oid, "*.npz")))
    rows = []
    for r in rutas:
        with np.load(r) as z:
            rows.append((float(z["mjd"]), int(z["banda"])))
    rows.sort(key=lambda t: t[0])
    pas = [[rows[0]]]
    for item in rows[1:]:
        (pas[-1].append(item) if item[0] - pas[-1][-1][0] <= 30.0 else pas.append([item]))
    info = []
    for k, p in enumerate(pas, 1):
        mjds = [t[0] for t in p]
        bs = sorted({t[1] for t in p})
        info.append({
            "pasada": k,
            "n_exp": len(p),
            "mjd_min": round(min(mjds), 2),
            "mjd_max": round(max(mjds), 2),
            "mjd_media": round(float(np.mean(mjds)), 2),
            "duracion_dias": round(max(mjds) - min(mjds), 2),
            "bandas": bs,
        })
    return len(rutas), info


def main():
    D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
    out = {"datos_dir": D, "objetivos": {}}

    # Inventario rapido de exposiciones y pasadas por archivo (sin construir WCS)
    invent = {}
    for oid in ("wise_0855", "eps_ind_b", "barnard", "rw_aur", "r_dra"):
        ntot, pinfo = resumen_cajas(D, oid)
        invent[oid] = {"n_exp_total": ntot, "n_pasadas": len(pinfo), "pasadas": pinfo}

    # 1. WISE 0855
    Hw = json.load(open(os.path.join(D, "huella_wise_0855.json")))
    bc_w = busqueda_ciega_multipase(Hw)
    w_cand = bc_w["huella"]["candidatas"][0]
    pw = Hw["prediccion"]
    pred_w_tot, pred_w_dra, pred_w_ddec = dsky_arcsec(pw["1"]["ra"], pw["1"]["dec"], pw["3"]["ra"], pw["3"]["dec"])
    # Separacion medida en P1, P2, P3 usando el indice del candidato y la estrella vecina (P1=1,P2=3,P3=2)
    est_idx = {"1": 1, "2": 3, "3": 2}
    sep_mix = {}
    D_w_est = {}
    D_w_w = {}
    for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
        ia, ib = w_cand["cadena"][a], w_cand["cadena"][b]
        ja, jb = est_idx[a], est_idx[b]
        D_w_w[f"{a}-{b}"] = round(distancia(Hw["espectros"][a][ia]["bins"], Hw["espectros"][b][ib]["bins"]), 3)
        D_w_est[f"{a}-{b}"] = round(distancia(Hw["espectros"][a][ia]["bins"], Hw["espectros"][b][jb]["bins"]), 2)
    for p in ("1", "2", "3"):
        iw, ie = w_cand["cadena"][p], est_idx[p]
        s_meas, _, _ = dsky_arcsec(Hw["fuentes"][p][iw]["ra"], Hw["fuentes"][p][iw]["dec"],
                                   Hw["fuentes"][p][ie]["ra"], Hw["fuentes"][p][ie]["dec"])
        s_pred, _, _ = dsky_arcsec(pw[p]["ra"], pw[p]["dec"], Hw["fuentes"][p][ie]["ra"], Hw["fuentes"][p][ie]["dec"])
        sep_mix[p] = {"medida_arcsec": round(s_meas, 2), "predicha_arcsec": round(s_pred, 2)}
    quietas_d13 = [t["d_neto_arcsec"] for t in bc_w["huella"]["trayectorias"] if not t["candidata"]]
    # Error formal de P1->P3 para WISE 0855 (sin piso)
    f1w, f3w = Hw["fuentes"]["1"][w_cand["cadena"]["1"]], Hw["fuentes"]["3"][w_cand["cadena"]["3"]]
    ef_w = math.hypot(math.hypot(f1w["ex"] * GRID, f1w["ey"] * GRID), math.hypot(f3w["ex"] * GRID, f3w["ey"] * GRID))
    dif_vec_w = math.hypot(w_cand["dra_neto_arcsec"] - pred_w_dra, w_cand["ddec_neto_arcsec"] - pred_w_ddec)
    out["objetivos"]["wise_0855"] = {
        **invent["wise_0855"],
        "estado": "exito_mezcla_resuelta",
        "fuentes_por_pasada": {p: len(Hw["fuentes"][p]) for p in ("1", "2", "3")},
        "busqueda_ciega": {
            "posicional": {k: bc_w["posicional"][k] for k in ("n_completas", "rotas_desde_P1", "huerfanas_Pfin")} | {"n_candidatas": len(bc_w["posicional"]["candidatas"])},
            "huella": {k: bc_w["huella"][k] for k in ("n_completas", "rotas_desde_P1", "huerfanas_Pfin")} | {"n_candidatas": len(bc_w["huella"]["candidatas"]), "candidata": w_cand},
        },
        "medido_P1_P3_arcsec": w_cand["d_neto_arcsec"],
        "err_formal_arcsec": round(ef_w, 3),
        "sigma_con_piso": w_cand["sigma_neto"],
        "predicho_pm_plx_arcsec": round(pred_w_tot, 3),
        "dif_vectorial_pred_arcsec": round(dif_vec_w, 3),
        "sep_vecina_por_pasada": sep_mix,
        "D_misma_fuente": D_w_w,
        "D_vs_estrella": D_w_est,
        "quietas_mediana_arcsec": round(float(np.median(quietas_d13)), 3),
        "quietas_max_arcsec": round(float(np.max(quietas_d13)), 3),
    }

    # 2. EPS IND B
    He = json.load(open(os.path.join(D, "huella_eps_ind_b.json")))
    bc_e = busqueda_ciega_multipase(He)
    e_cand = bc_e["huella"]["candidatas"][0]
    est_e = [t for t in bc_e["huella"]["trayectorias"] if not t["candidata"]][0]
    pe = He["prediccion"]
    pred_e_tot, pred_e_dra, pred_e_ddec = dsky_arcsec(pe["1"]["ra"], pe["1"]["dec"], pe["4"]["ra"], pe["4"]["dec"])
    pred_e_nop, nop_dra, nop_ddec = dsky_arcsec(pe["1"]["ra_sin_plx"], pe["1"]["dec_sin_plx"], pe["4"]["ra_sin_plx"], pe["4"]["dec_sin_plx"])
    dif_vec_e = math.hypot(e_cand["dra_neto_arcsec"] - pred_e_dra, e_cand["ddec_neto_arcsec"] - pred_e_ddec)
    dif_vec_e_nop = math.hypot(e_cand["dra_neto_arcsec"] - nop_dra, e_cand["ddec_neto_arcsec"] - nop_ddec)
    zigzag = []
    for a, b in (("1", "2"), ("2", "3"), ("3", "4"), ("1", "4")):
        fa = He["fuentes"][a][e_cand["cadena"][a]]
        fb = He["fuentes"][b][e_cand["cadena"][b]]
        dm, dram, ddecm = dsky_arcsec(fa["ra"], fa["dec"], fb["ra"], fb["dec"])
        dp, drap, ddecp = dsky_arcsec(pe[a]["ra"], pe[a]["dec"], pe[b]["ra"], pe[b]["dec"])
        d_spec = distancia(He["espectros"][a][e_cand["cadena"][a]]["bins"], He["espectros"][b][e_cand["cadena"][b]]["bins"])
        zigzag.append({
            "par": f"{a}-{b}",
            "medido_arcsec": round(dm, 3),
            "dra_med": round(dram, 3),
            "ddec_med": round(ddecm, 3),
            "pred_pm_plx_arcsec": round(dp, 3),
            "dra_pred": round(drap, 3),
            "ddec_pred": round(ddecp, 3),
            "dif_vectorial_arcsec": round(math.hypot(dram - drap, ddecm - ddecp), 3),
            "D": round(d_spec, 3),
        })
    # Separacion eps Ind B vs estrella de campo y grupos detectados
    s_campo, _, _ = dsky_arcsec(He["fuentes"]["1"][e_cand["cadena"]["1"]]["ra"], He["fuentes"]["1"][e_cand["cadena"]["1"]]["dec"],
                                He["fuentes"]["1"][est_e["cadena"]["1"]]["ra"], He["fuentes"]["1"][est_e["cadena"]["1"]]["dec"])
    # MJDs reales de los grupos usados para la posicion en cada pasada
    mjd_grupo = {}
    rutas_e = sorted(glob.glob(os.path.join(D, "cajas", "eps_ind_b", "*.npz")))
    grupos_b = {"corto": (1, 2, 3), "medio": (4,), "largo": (5, 6)}
    exp_e = []
    for r in rutas_e:
        with np.load(r) as z:
            exp_e.append((float(z["mjd"]), int(z["banda"])))
    exp_e.sort()
    p_exps = [[exp_e[0]]]
    for x in exp_e[1:]:
        (p_exps[-1].append(x) if x[0] - p_exps[-1][-1][0] <= 30 else p_exps.append([x]))
    for idx_p, (p, gidx) in enumerate(zip(("1", "2", "3", "4"), [e_cand["cadena"][k] for k in ("1", "2", "3", "4")])):
        g_used = He["fuentes"][p][gidx]["g"]
        mjd_grupo[p] = {"g": g_used, "mjd_grupo": round(float(np.mean([m for m, bd in p_exps[idx_p] if bd in grupos_b[g_used]])), 2), "mjd_largo_o_tot": round(pe[p]["mjd"], 2)}
    # Prediccion alternativa usando el MJD real del grupo elegido en cada pasada (medio en P1 vs largo en P2-P4)
    p_mjd_g = {p: pred_pm_plx(CAMPOS["eps_ind_b"], mjd_grupo[p]["mjd_grupo"]) for p in ("1", "2", "3", "4")}
    dp_g14, dra_g14, ddec_g14 = dsky_arcsec(p_mjd_g["1"][0], p_mjd_g["1"][1], p_mjd_g["4"][0], p_mjd_g["4"][1])
    dif_vec_e_grupo = math.hypot(e_cand["dra_neto_arcsec"] - dra_g14, e_cand["ddec_neto_arcsec"] - ddec_g14)
    out["objetivos"]["eps_ind_b"] = {
        **invent["eps_ind_b"],
        "estado": "exito_4_pasadas_paralaje",
        "fuentes_por_pasada": {p: len(He["fuentes"][p]) for p in ("1", "2", "3", "4")},
        "separacion_estrella_campo_arcsec": round(s_campo, 2),
        "mjd_posiciones": mjd_grupo,
        "busqueda_ciega": {
            "posicional": {k: bc_e["posicional"][k] for k in ("n_completas", "rotas_desde_P1", "huerfanas_Pfin")} | {"n_candidatas": len(bc_e["posicional"]["candidatas"])},
            "huella": {k: bc_e["huella"][k] for k in ("n_completas", "rotas_desde_P1", "huerfanas_Pfin")} | {"n_candidatas": len(bc_e["huella"]["candidatas"]), "candidata": e_cand, "estrella_quieta": est_e},
        },
        "medido_P1_P4_arcsec": e_cand["d_neto_arcsec"],
        "predicho_pm_plx_arcsec": round(pred_e_tot, 3),
        "dif_vectorial_pm_plx_arcsec": round(dif_vec_e, 3),
        "predicho_pm_plx_mjd_grupo_arcsec": round(dp_g14, 3),
        "dif_vectorial_pm_plx_mjd_grupo_arcsec": round(dif_vec_e_grupo, 3),
        "predicho_solo_pm_arcsec": round(pred_e_nop, 3),
        "dif_vectorial_solo_pm_arcsec": round(dif_vec_e_nop, 3),
        "zigzag_paralaje": zigzag,
    }

    # 3. BARNARD
    bs = json.load(open(os.path.join(D, "barnard_simple.json")))
    fb = json.load(open(os.path.join(D, "fuentes_barnard.json")))
    barn_pares = []
    for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
        dm, dram, ddecm = dsky_arcsec(bs[a]["ra"], bs[a]["dec"], bs[b]["ra"], bs[b]["dec"])
        dp, drap, ddecp = dsky_arcsec(bs[a]["ra_p"], bs[a]["dec_p"], bs[b]["ra_p"], bs[b]["dec_p"])
        barn_pares.append({
            "par": f"{a}-{b}",
            "medido_arcsec": round(dm, 3),
            "predicho_arcsec": round(dp, 3),
            "dif_vectorial_arcsec": round(math.hypot(dram - drap, ddecm - ddecp), 3),
        })
    p13_b = [x for x in barn_pares if x["par"] == "1-3"][0]
    out["objetivos"]["barnard"] = {
        **invent["barnard"],
        "estado": "exito_astrometria_sin_espectro_central",
        "fuentes_detectadas_por_pasada": {p: len(fb[p]) for p in sorted(fb.keys(), key=int)},
        "medido_P1_P3_arcsec": p13_b["medido_arcsec"],
        "predicho_pm_plx_arcsec": p13_b["predicho_arcsec"],
        "dif_vectorial_arcsec": p13_b["dif_vectorial_arcsec"],
        "pares": barn_pares,
        "nota": "Nucleo brillante (~K=4,5): las posiciones P1-P3 siguen la orbita pm+paralaje a <0,5\", pero la PSF no gaussiana/saturacion parcial en exposiciones cortas impide un espectro PSF limpio en el pipeline automatico.",
    }

    # 4. RW AUR
    Hr = json.load(open(os.path.join(D, "huella_rw_aur.json")))
    bc_r = busqueda_ciega_multipase(Hr)
    # Identificar RW Aur como la deteccion de mayor S/N cerca del centro (<= 2 px de (20, 20)) en cada pasada
    rw_idx = {
        p: max(
            [i for i, f in enumerate(Hr["fuentes"][p]) if math.hypot(f["x"] - 20.0, f["y"] - 20.0) <= 2.0],
            key=lambda i: max(Hr["fuentes"][p][i]["det"].values()),
        )
        for p in ("1", "2", "3")
    }
    rw_pares = []
    for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
        ia, ib = rw_idx[a], rw_idx[b]
        fa, fb_r = Hr["fuentes"][a][ia], Hr["fuentes"][b][ib]
        dm, _, _ = dsky_arcsec(fa["ra"], fa["dec"], fb_r["ra"], fb_r["dec"])
        d_sp = distancia(Hr["espectros"][a][ia]["bins"], Hr["espectros"][b][ib]["bins"])
        rw_pares.append({"par": f"{a}-{b}", "desplazamiento_arcsec": round(dm, 3), "D": round(d_sp, 2)})
    # Detecciones secundarias en el halo (<= 5,5 px rejilla desde (20,20), excluyendo rw_idx)
    halo_det = {p: [i for i, f in enumerate(Hr["fuentes"][p]) if i != rw_idx[p] and math.hypot(f["x"] - 20.0, f["y"] - 20.0) <= 5.5] for p in ("1", "2", "3")}
    # Estrellas de campo limpias en trayectorias ciegas por posicion (fuera de r <= 5,5 px)
    campo_tr = [t for t in bc_r["posicional"]["trayectorias"] if math.hypot(t["x_y_ref"][0] - 20.0, t["x_y_ref"][1] - 20.0) > 5.5]
    # Estrellas exteriores aisladas (> 8,5 px = 26" del nucleo, sin ala directa de RW Aur sobre fuente 1)
    campo_aisl = [t for t in campo_tr if math.hypot(t["x_y_ref"][0] - 20.0, t["x_y_ref"][1] - 20.0) > 8.5]
    campo_d13 = [t["d_neto_arcsec"] for t in campo_tr]
    campo_D = [t["D_p0_pN"] for t in campo_tr]
    out["objetivos"]["rw_aur"] = {
        **invent["rw_aur"],
        "estado": "variable_espectral_estacionaria_halo_psf",
        "fuentes_por_pasada": {p: len(Hr["fuentes"][p]) for p in ("1", "2", "3")},
        "halo_secundarias_por_pasada": {p: len(v) for p, v in halo_det.items()},
        "rw_aur_indice": rw_idx,
        "rw_aur_pares": rw_pares,
        "busqueda_ciega": {
            "posicional_candidatas": len(bc_r["posicional"]["candidatas"]),
            "huella_candidatas": len(bc_r["huella"]["candidatas"]),
            "huella_rotas": bc_r["huella"]["rotas_desde_P1"],
            "nota_candidata_huella": bc_r["huella"]["candidatas"],
        },
        "estrellas_campo_limpias": len(campo_tr),
        "campo_mediana_d13_arcsec": round(float(np.median(campo_d13)), 3) if campo_d13 else None,
        "campo_max_d13_aisladas_arcsec": round(float(np.max([t["d_neto_arcsec"] for t in campo_aisl])), 3) if campo_aisl else None,
        "campo_max_d13_arcsec": round(float(np.max(campo_d13)), 3) if campo_d13 else None,
        "campo_mediana_D_13": round(float(np.median(campo_D)), 2) if campo_D else None,
        "nota": "En RW Aur (1-3 Jy), las alas no gaussianas de la PSF generan detecciones residuales secundarias cerca del centro (~10-15\" del nucleo) que se confunden entre pasadas; las 8 fuentes exteriores del campo permanecen quietas (<0,4\").",
    }

    # 5. R DRA
    rutas_rdra = sorted(glob.glob(os.path.join(D, "cajas", "r_dra", "*.npz")))
    n_sat_centro = 0
    for r in rutas_rdra:
        with np.load(r) as z:
            im = z["img"]
            ny, nx = im.shape
            cy, cx = ny // 2, nx // 2
            if not np.isfinite(im[cy - 1:cy + 2, cx - 1:cx + 2]).all():
                n_sat_centro += 1
    zp = np.load(os.path.join(D, "pilas_r_dra.npz"))
    nan_pilas = {}
    wing_outer = {}
    for g in ("corto", "medio", "largo"):
        tot_n = 0
        cen_n = 0
        outer_vals = []
        yy, xx = np.mgrid[0:41, 0:41]
        rmask = np.hypot(xx - 20.0, yy - 20.0) >= 16.0  # >= 8 px nativos
        for ps in ("1", "2", "3"):
            arr = zp[f"{ps}_{g}_st"]
            tot_n += int(np.isnan(arr).sum())
            cen_n += int(np.isnan(arr[18:23, 18:23]).sum())
            v = arr[rmask]
            outer_vals.extend(v[np.isfinite(v)].tolist())
        nan_pilas[g] = {"nans_total_3_pasadas": tot_n, "nans_5x5_central_3_pasadas": cen_n, "px_totales_3_pasadas": 3 * 41 * 41}
        wing_outer[g] = round(float(np.median(outer_vals)), 3) if outer_vals else None
    out["objetivos"]["r_dra"] = {
        **invent["r_dra"],
        "estado": "saturada_central_fuera_de_regimen",
        "exp_centro_3x3_no_finito": n_sat_centro,
        "frac_exp_saturadas": round(n_sat_centro / len(rutas_rdra), 4),
        "pilas_nans": nan_pilas,
        "ala_exterior_mediana_delta_MJy_sr": wing_outer,
    }

    ruta_out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cinco_objetos_resultado.json")
    json.dump(out, open(ruta_out, "w"), indent=2)
    print("Guardado:", ruta_out)
    for k, v in out["objetivos"].items():
        print(f"\n[{k}] exp={v['n_exp_total']} pas={v['n_pasadas']} estado={v['estado']}")
        if k == "wise_0855":
            print(f"  P1->P3={v['medido_P1_P3_arcsec']}±{v['err_formal_arcsec']}\" (pred {v['predicho_pm_plx_arcsec']}\"), sigma_c_piso={v['sigma_con_piso']}, pos_cand={v['busqueda_ciega']['posicional']['n_candidatas']}, huella_cand={v['busqueda_ciega']['huella']['n_candidatas']}")
        elif k == "eps_ind_b":
            print(f"  P1->P4={v['medido_P1_P4_arcsec']}\" (pred_plx={v['predicho_pm_plx_arcsec']}\", dif={v['dif_vectorial_pm_plx_arcsec']}\"; solo_pm dif={v['dif_vectorial_solo_pm_arcsec']}\"), D(1-4)={v['zigzag_paralaje'][-1]['D']}")
        elif k == "barnard":
            print(f"  P1->P3={v['medido_P1_P3_arcsec']}\" (pred {v['predicho_pm_plx_arcsec']}\", dif={v['dif_vectorial_arcsec']}\")")
        elif k == "rw_aur":
            print(f"  RW Aur pares={v['rw_aur_pares']}, halo_sec={v['halo_secundarias_por_pasada']}, campo({v['estrellas_campo_limpias']}) med_d13={v['campo_mediana_d13_arcsec']}\" med_D={v['campo_mediana_D_13']}")
        elif k == "r_dra":
            print(f"  sat={v['exp_centro_3x3_no_finito']}/{v['n_exp_total']} ({v['frac_exp_saturadas']*100:.1f}%), nan_pilas={v['pilas_nans']}")


if __name__ == "__main__":
    main()
