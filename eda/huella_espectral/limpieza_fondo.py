"""Limpieza ciega del fondo estelar en el campo de WISE 0855 (P1 -> P2 -> P3)
para aislar visual y astrometricamente el objeto en movimiento.

Implementa dos metodos complementarios sobre las pilas ya apiladas (pilas_wise_0855.npz)
usando la clasificacion ciega previa (fuentes estaticas = todas excepto la candidata en movimiento):
  1. Sustraccion de PSF de fuentes estaticas ciegas en bandas largas (B5-6, 3.8-5.0 um):
     ajusta simultaneamente sigma_gauss, fondo y flujos de las 9 fuentes detectadas, y resta
     solo el fondo + las 8 fuentes estaticas.
  2. Sustraccion espectral directa por banda (I_largo - alpha * I_corto):
     ajusta el cociente escalar estelar alpha = dI_largo / dI_corto en los pixeles de las fuentes
     estaticas (excluyendo la candidata), y resta alpha * I_corto sin ajustar ninguna PSF.

Uso: python limpieza_fondo.py [CARPETA_DATOS]
Escribe D:\\dev\\informes_v2\\huella_espectral\\limpieza_wise0855.npz (datos 2D pesados, fuera de git)
y limpieza_fondo_resultado.json junto al script (metricas reproducibles).
"""
import json
import math
import os
import sys
import numpy as np
from astropy.wcs import WCS
from scipy.optimize import least_squares
from scipy.ndimage import gaussian_filter

PIX = 6.15
N = 41
ESC = PIX / 2.0  # 3.075 "/px rejilla


def wcs_grid(ra, dec, n=N, esc=ESC):
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2.0, (n + 1) / 2.0]
    w.wcs.cdelt = [-esc / 3600.0, esc / 3600.0]
    return w


def ajuste_conjunto_fijo(st, vs, xy_list):
    """Ajusta sigma_gauss, bg y los flujos (en MJy/sr pico) de todas las fuentes con posiciones fijas."""
    yy, xx = np.mgrid[0:N, 0:N]
    ok = np.isfinite(st) & np.isfinite(vs) & (vs > 0)
    sig = np.sqrt(np.where(ok, vs, 1.0))
    nf = len(xy_list)
    p0 = [1.2, float(np.nanmedian(st[ok]))] + [
        max(float(st[int(round(y)), int(round(x))]), 0.0) if ok[int(round(y)), int(round(x))] else 0.0
        for x, y in xy_list
    ]
    lo = [0.5, -np.inf] + [-np.inf] * nf
    hi = [3.5, np.inf] + [np.inf] * nf

    def mod(p):
        s, bg = p[0], p[1]
        m = np.full((N, N), bg, float)
        for k, (x, y) in enumerate(xy_list):
            m += p[2 + k] * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2.0 * s * s))
        return m

    res = least_squares(lambda p: ((mod(p) - st) / sig)[ok], p0, bounds=(lo, hi))
    chi2nu = float(np.sum(res.fun ** 2) / max(1, int(ok.sum()) - len(p0)))
    return float(res.x[0]), float(res.x[1]), res.x[2:].astype(float), chi2nu


def ajustar_centroide_unico(img, var, x_init, y_init, radio=3.5, sig_fix=None):
    """Ajusta una unica gaussiana cerca de (x_init, y_init) para medir centroide y S/N."""
    yy, xx = np.mgrid[0:N, 0:N]
    r2 = (xx - x_init) ** 2 + (yy - y_init) ** 2
    ok = np.isfinite(img) & np.isfinite(var) & (var > 0) & (r2 <= radio ** 2)
    sig = np.sqrt(np.where(ok, var, 1.0))
    iy, ix = int(round(y_init)), int(round(x_init))
    amp0 = max(float(img[iy, ix]) if np.isfinite(img[iy, ix]) else 0.05, 1e-3)
    if sig_fix is None:
        p0 = [x_init, y_init, amp0, 1.1, 0.0]
        lo = [x_init - 2.0, y_init - 2.0, 0.0, 0.6, -np.inf]
        hi = [x_init + 2.0, y_init + 2.0, np.inf, 2.5, np.inf]

        def mod(p):
            return p[4] + p[2] * np.exp(-((xx - p[0]) ** 2 + (yy - p[1]) ** 2) / (2.0 * p[3] ** 2))
    else:
        p0 = [x_init, y_init, amp0, 0.0]
        lo = [x_init - 2.0, y_init - 2.0, 0.0, -np.inf]
        hi = [x_init + 2.0, y_init + 2.0, np.inf, np.inf]

        def mod(p):
            return p[3] + p[2] * np.exp(-((xx - p[0]) ** 2 + (yy - p[1]) ** 2) / (2.0 * sig_fix ** 2))

    r = least_squares(lambda p: ((mod(p) - img) / sig)[ok], p0, bounds=(lo, hi))
    J = r.jac
    dof = max(1, int(ok.sum()) - len(p0))
    cov = np.linalg.pinv(J.T @ J) * max(1.0, float(np.sum(r.fun ** 2) / dof))
    er = np.sqrt(np.diag(cov))
    # S/N integrado por filtro acoplado con la PSF sobre la mascara
    g = np.exp(-((xx - r.x[0]) ** 2 + (yy - r.x[1]) ** 2) / (2.0 * (sig_fix if sig_fix else r.x[3]) ** 2))
    w = g[ok] / var[ok]
    snr_int = float(np.sum(w * (img[ok] - r.x[-1])) / np.sqrt(np.sum(g[ok] ** 2 / var[ok])))
    return {
        "x": float(r.x[0]),
        "y": float(r.x[1]),
        "ex": float(er[0]),
        "ey": float(er[1]),
        "amp": float(r.x[2]),
        "eamp": float(er[2]),
        "snr_amp": float(r.x[2] / er[2]) if er[2] > 0 else float("nan"),
        "snr_int": snr_int,
    }


def sep_sky(wg, x1, y1, x2, y2):
    r1, d1 = wg.wcs_pix2world([[x1, y1]], 0)[0]
    r2, d2 = wg.wcs_pix2world([[x2, y2]], 0)[0]
    return float(math.hypot((r1 - r2) * math.cos(math.radians(0.5 * (d1 + d2))), d1 - d2) * 3600.0)


def main():
    D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
    here = os.path.dirname(os.path.abspath(__file__))
    zp = np.load(os.path.join(D, "pilas_wise_0855.npz"))
    H = json.load(open(os.path.join(D, "huella_wise_0855.json")))
    bc = json.load(open(os.path.join(here, "busqueda_ciega_resultado.json")))

    cand = bc["huella"]["candidatas"][0]
    cand_idx = {"1": cand["P1"], "2": cand["P2"], "3": cand["P3"]}
    wg = wcs_grid(float(zp["ra_c"]), float(zp["dec_c"]))
    yy, xx = np.mgrid[0:N, 0:N]

    # Identificar estrella vecina en cada pasada (fuente estatica mas cercana al candidato en P3, emparejada por huella)
    # Usamos las trayectorias ciegas por huella para localizar la vecina de forma totalmente ciega
    tr_est = [
        t for t in bc["huella"]["trayectorias"]
        if not t["candidata"]
    ]
    vecina = min(
        tr_est,
        key=lambda t: math.hypot(
            H["fuentes"]["3"][t["P3"]]["x"] - H["fuentes"]["3"][cand_idx["3"]]["x"],
            H["fuentes"]["3"][t["P3"]]["y"] - H["fuentes"]["3"][cand_idx["3"]]["y"],
        ),
    )
    vec_idx = {"1": vecina["P1"], "2": vecina["P2"], "3": vecina["P3"]}

    # Ajuste de cociente espectral alpha global sobre todas las pasadas (pixeles de estrellas estaticas)
    # I_largo ~ c_p + alpha * I_corto
    xs_fit_c, ys_fit_l, w_fit, p_ids = [], [], [], []
    for ps in ("1", "2", "3"):
        st_l = zp[f"{ps}_largo_st"]
        st_c = zp[f"{ps}_corto_st"]
        vr_l = zp[f"{ps}_largo_var"]
        vr_c = zp[f"{ps}_corto_var"]
        fc = H["fuentes"][ps][cand_idx[ps]]
        mask_cand = ((xx - fc["x"]) ** 2 + (yy - fc["y"]) ** 2) <= 3.0 ** 2
        mask_est = np.zeros((N, N), bool)
        for i, f in enumerate(H["fuentes"][ps]):
            if i == cand_idx[ps]:
                continue
            mask_est |= (((xx - f["x"]) ** 2 + (yy - f["y"]) ** 2) <= 2.5 ** 2)
        ok = mask_est & (~mask_cand) & np.isfinite(st_l) & np.isfinite(st_c) & np.isfinite(vr_l) & np.isfinite(vr_c) & (vr_l > 0) & (vr_c > 0)
        xs_fit_c.append(st_c[ok])
        ys_fit_l.append(st_l[ok])
        w_fit.append(1.0 / (vr_l[ok] + 0.04 * vr_c[ok]))
        p_ids.append(np.full(int(ok.sum()), int(ps)))

    Xc = np.concatenate(xs_fit_c)
    Yl = np.concatenate(ys_fit_l)
    W = np.concatenate(w_fit)
    P = np.concatenate(p_ids)

    # Resolvemos alpha + un offset c_p por pasada
    A_sp = np.zeros((len(Xc), 4))
    A_sp[:, 0] = Xc
    for ip, pval in enumerate((1, 2, 3)):
        A_sp[P == pval, 1 + ip] = 1.0
    AtW = A_sp.T * W
    coef_sp = np.linalg.solve(AtW @ A_sp, AtW @ Yl)
    cov_sp = np.linalg.inv(AtW @ A_sp)
    alpha = float(coef_sp[0])
    e_alpha = float(math.sqrt(cov_sp[0, 0]))
    offsets_sp = {str(ip): float(coef_sp[ip]) for ip in (1, 2, 3)}

    # Guardamos matrices limpias para fig4 y medimos metricas por pasada
    npz_out = {"ra_c": zp["ra_c"], "dec_c": zp["dec_c"]}
    resultados_pasadas = {}

    for ps in ("1", "2", "3"):
        st_l = zp[f"{ps}_largo_st"].astype(float)
        vr_l = zp[f"{ps}_largo_var"].astype(float)
        st_c = zp[f"{ps}_corto_st"].astype(float)
        vr_c = zp[f"{ps}_corto_var"].astype(float)
        fu = H["fuentes"][ps]
        ic = cand_idx[ps]
        iv = vec_idx[ps]
        fc = fu[ic]
        fv = fu[iv]

        # Metodo 1: ajuste PSF conjunto y resta de las 8 estrellas estaticas
        xy_list = [(f["x"], f["y"]) for f in fu]
        sg, bg_l, flujos, chi2nu = ajuste_conjunto_fijo(st_l, vr_l, xy_list)
        mod_est = np.full((N, N), bg_l, float)
        for i, (x, y) in enumerate(xy_list):
            if i == ic:
                continue
            mod_est += flujos[i] * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2.0 * sg * sg))
        psf_clean = st_l - mod_est

        # Metodo 2: resta espectral directa B5-6 - alpha * B1-3 (sin ajustar ninguna PSF)
        spec_clean = (st_l - offsets_sp[ps]) - alpha * st_c
        spec_var = vr_l + (alpha ** 2) * vr_c

        # Evaluar supresion en las fuentes estaticas aisladas (i != ic y lejos de cand > 4 px)
        est_aisl = [
            f for i, f in enumerate(fu)
            if i != ic and math.hypot(f["x"] - fc["x"], f["y"] - fc["y"]) > 4.0
        ]
        rms_raw_c, rms_psf_c, rms_sp_c = [], [], []
        rms_raw_l, rms_psf_l = [], []
        max_raw_c, max_sp_c, max_raw_l, max_psf_l = [], [], [], []
        bg_c_p = float(np.nanmedian(st_c))
        for f in est_aisl:
            m = (((xx - f["x"]) ** 2 + (yy - f["y"]) ** 2) <= 2.0 ** 2)
            ok_c = m & np.isfinite(st_c) & np.isfinite(spec_clean)
            if ok_c.any():
                # en corto la estrella brilla fuerte; en spec_clean medimos residuo vs escala de corto y vs raw_l
                vc = st_c[ok_c] - bg_c_p
                vs_p = spec_clean[ok_c]
                rms_raw_c.append(float(np.sqrt(np.mean(vc ** 2))))
                rms_sp_c.append(float(np.sqrt(np.mean(vs_p ** 2))))
                max_raw_c.append(float(np.max(vc)))
                max_sp_c.append(float(np.max(np.abs(vs_p))))
            ok_l = m & np.isfinite(st_l) & np.isfinite(psf_clean)
            if ok_l.any():
                vl_r = st_l[ok_l] - bg_l
                vl_p = psf_clean[ok_l]
                rms_raw_l.append(float(np.sqrt(np.mean(vl_r ** 2))))
                rms_psf_l.append(float(np.sqrt(np.mean(vl_p ** 2))))
                max_raw_l.append(float(np.max(vl_r)))
                max_psf_l.append(float(np.max(np.abs(vl_p))))

        # En bandas largas la estrella vecina tambien es medible en P1 y P2 por separado
        vec_m = (((xx - fv["x"]) ** 2 + (yy - fv["y"]) ** 2) <= 2.0 ** 2)
        ok_v = vec_m & np.isfinite(st_l) & np.isfinite(psf_clean) & np.isfinite(spec_clean)
        vec_res = {
            "raw_l_peak": round(float(np.max(st_l[ok_v] - bg_l)), 4),
            "psf_clean_peak": round(float(np.max(np.abs(psf_clean[ok_v]))), 4),
            "spec_clean_peak": round(float(np.max(np.abs(spec_clean[ok_v]))), 4),
            "raw_l_rms": round(float(np.sqrt(np.mean((st_l[ok_v] - bg_l) ** 2))), 4),
            "psf_clean_rms": round(float(np.sqrt(np.mean(psf_clean[ok_v] ** 2))), 4),
            "spec_clean_rms": round(float(np.sqrt(np.mean(spec_clean[ok_v] ** 2))), 4),
        }

        # Centroide y S/N de WISE 0855 antes y despues de limpiar
        c_raw = ajustar_centroide_unico(st_l - bg_l, vr_l, fc["x"], fc["y"], radio=3.0)
        c_psf = ajustar_centroide_unico(psf_clean, vr_l, fc["x"], fc["y"], radio=3.0, sig_fix=sg)
        c_sp = ajustar_centroide_unico(spec_clean, spec_var, fc["x"], fc["y"], radio=3.0)

        sep_vec_raw = sep_sky(wg, c_raw["x"], c_raw["y"], fv["x"], fv["y"])
        sep_vec_psf = sep_sky(wg, c_psf["x"], c_psf["y"], fv["x"], fv["y"])
        sep_vec_sp = sep_sky(wg, c_sp["x"], c_sp["y"], fv["x"], fv["y"])

        # S/N simple en apertura de radio 1.5 px rejilla vs ruido de fondo limpio
        m_w = (((xx - c_psf["x"]) ** 2 + (yy - c_psf["y"]) ** 2) <= 1.5 ** 2)
        m_bg = np.ones((N, N), bool)
        for f in fu:
            m_bg &= (((xx - f["x"]) ** 2 + (yy - f["y"]) ** 2) > 3.5 ** 2)
        noise_psf = float(np.nanstd(psf_clean[m_bg & np.isfinite(psf_clean)]))
        noise_sp = float(np.nanstd(spec_clean[m_bg & np.isfinite(spec_clean)]))
        peak_psf = float(np.nanmax(psf_clean[m_w]))
        peak_sp = float(np.nanmax(spec_clean[m_w]))

        npz_out[f"{ps}_raw_largo"] = st_l - bg_l
        npz_out[f"{ps}_psf_clean"] = psf_clean
        npz_out[f"{ps}_spec_clean"] = spec_clean
        npz_out[f"{ps}_cand_xy"] = np.array([c_psf["x"], c_psf["y"], fv["x"], fv["y"]])

        resultados_pasadas[ps] = {
            "sigma_psf_largo_px": round(sg, 3),
            "chi2nu_largo": round(chi2nu, 2),
            "fondo_largo_MJy_sr": round(bg_l, 5),
            "flujo_pico_cand_MJy_sr": round(float(flujos[ic]), 4),
            "wise0855_raw_largo": {**{k: round(v, 3) for k, v in c_raw.items()}, "sep_vecina_arcsec": round(sep_vec_raw, 2)},
            "wise0855_psf_clean": {**{k: round(v, 3) for k, v in c_psf.items()}, "sep_vecina_arcsec": round(sep_vec_psf, 2), "pico_sobre_std_fondo": round(peak_psf / noise_psf, 1)},
            "wise0855_spec_clean": {**{k: round(v, 3) for k, v in c_sp.items()}, "sep_vecina_arcsec": round(sep_vec_sp, 2), "pico_sobre_std_fondo": round(peak_sp / noise_sp, 1)},
            "estaticas_aisladas_n": len(est_aisl),
            "supresion_estaticas_psf_vs_raw_l": {
                "rms_raw_med": round(float(np.median(rms_raw_l)), 4),
                "rms_psf_clean_med": round(float(np.median(rms_psf_l)), 4),
                "factor_reduccion_rms": round(float(np.median(rms_raw_l) / np.median(rms_psf_l)), 2),
            },
            "supresion_estaticas_spec_vs_raw_c": {
                "rms_raw_corto_med": round(float(np.median(rms_raw_c)), 4),
                "rms_spec_clean_med": round(float(np.median(rms_sp_c)), 4),
                "factor_reduccion_rms_vs_corto": round(float(np.median(rms_raw_c) / np.median(rms_sp_c)), 2),
                "rms_raw_largo_med": round(float(np.median(rms_raw_l)), 4),
                "factor_reduccion_rms_vs_largo": round(float(np.median(rms_raw_l) / np.median(rms_sp_c)), 2),
            },
            "vecina_residuo": vec_res,
        }

    # Movimiento neto P1->P3 medido en los tres productos (raw, psf_clean, spec_clean)
    mov = {}
    for key in ("wise0855_raw_largo", "wise0855_psf_clean", "wise0855_spec_clean"):
        c1 = resultados_pasadas["1"][key]
        c3 = resultados_pasadas["3"][key]
        d13 = sep_sky(wg, c1["x"], c1["y"], c3["x"], c3["y"])
        e13 = math.hypot(math.hypot(c1["ex"] * ESC, c1["ey"] * ESC), math.hypot(c3["ex"] * ESC, c3["ey"] * ESC))
        mov[key] = {"movimiento_P1_P3_arcsec": round(d13, 3), "err_formal_arcsec": round(e13, 3)}

    # Separacion real en P3 predicha vs raw vs limpias
    out = {
        "campo": "wise_0855",
        "alpha_largo_sobre_corto": round(alpha, 4),
        "err_alpha": round(e_alpha, 4),
        "offsets_spec_MJy_sr": {k: round(v, 5) for k, v in offsets_sp.items()},
        "prediccion_sep_P3_arcsec": 4.27,
        "pasadas": resultados_pasadas,
        "movimiento_P1_P3": mov,
    }
    npz_path = os.path.join(D, "limpieza_wise0855.npz")
    np.savez(npz_path, **npz_out)
    json_path = os.path.join(here, "limpieza_fondo_resultado.json")
    json.dump(out, open(json_path, "w"), indent=2)
    print("Guardado NPZ:", npz_path)
    print("Guardado JSON:", json_path)
    print(f"alpha = {alpha:.4f} ± {e_alpha:.4f}")
    for ps in ("1", "2", "3"):
        rp = resultados_pasadas[ps]
        print(
            f"P{ps}: PSF sep_vec={rp['wise0855_psf_clean']['sep_vecina_arcsec']}\" (SNR_int={rp['wise0855_psf_clean']['snr_int']}), "
            f"SPEC sep_vec={rp['wise0855_spec_clean']['sep_vecina_arcsec']}\" (SNR_int={rp['wise0855_spec_clean']['snr_int']}), "
            f"RAW_L sep_vec={rp['wise0855_raw_largo']['sep_vecina_arcsec']}\" | "
            f"reduccion RMS estaticas PSF={rp['supresion_estaticas_psf_vs_raw_l']['factor_reduccion_rms']}x, "
            f"SPEC vs corto={rp['supresion_estaticas_spec_vs_raw_c']['factor_reduccion_rms_vs_corto']}x / vs largo={rp['supresion_estaticas_spec_vs_raw_c']['factor_reduccion_rms_vs_largo']}x"
        )
    print("Mov P1->P3:", mov)


if __name__ == "__main__":
    main()
