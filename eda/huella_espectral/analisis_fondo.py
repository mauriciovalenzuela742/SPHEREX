"""Analisis del fondo del cielo y residuos PSF sobre los recortes sin restar mediana
de SPHEREx para los 5 campos del desafio NASA Space Apps 2026:
  1. Espectro del fondo real del cielo (MJy/sr, p25 y mediana en 12 bines lambda + por banda D1-D6 y por pasada),
     enmascarando estrellas detectadas (r < 2.5 px nativo) y centro (r < 8 px nativo), SIN restar mediana por exposicion.
  2. Dependencia zodiacal con la latitud ecliptica |beta| y exceso en bandas cortas cerca del plano galactico |b|.
  3. Diagnostico de residuos PSF en las pilas apiladas (corto, medio, largo) de wise_0855 vs rw_aur:
     separa fondo limpio de halo PSF / emision extendida circunestelar.
  4. Capacidad y limites de los 6 detectores (0.75-5.0 um) para firmas difusas/nebulares
     (hielo H2O 3.05 um, PAH 3.3 um, Br_alpha 4.05 um, hielo CO2 4.26 um) y taxonomia de eventos (Delta_pos, D).

Uso: python analisis_fondo.py [CARPETA_DATOS]
Por defecto lee D:\\dev\\informes_v2\\huella_espectral y escribe analisis_fondo_resultado.json junto al script.
"""
import glob
import json
import math
import os
import sys
import warnings
import numpy as np
from astropy.coordinates import SkyCoord
from astropy.io import fits
from astropy.wcs import WCS, FITSFixedWarning
import astropy.units as u
from scipy.interpolate import RegularGridInterpolator
from scipy.optimize import least_squares

warnings.simplefilter("ignore", FITSFixedWarning)

OBJETOS = ("wise_0855", "eps_ind_b", "barnard", "rw_aur", "r_dra")
NO_SATURADOS = ("rw_aur", "wise_0855", "barnard", "eps_ind_b")
BORDES_LAM = np.geomspace(0.75, 5.0, 13)
LAM_BINS = np.sqrt(BORDES_LAM[:-1] * BORDES_LAM[1:])
def wcs_rapido(cab_str):
    """Construye WCS+SIP descartando solo HISTORY/COMMENT/HIERARCH del bloque FITS."""
    tarjetas = [
        cab_str[i:i + 80] for i in range(0, len(cab_str), 80)
        if not cab_str[i:i + 8].startswith(("HISTORY ", "COMMENT ", "HIERARCH"))
    ]
    return WCS(fits.Header.fromstring("".join(tarjetas)))


def agrupar_pasadas(rutas_con_mjd):
    """Agrupa exposiciones en pasadas por saltos MJD > 30 dias (misma regla que paso2)."""
    rutas_ord = sorted(rutas_con_mjd, key=lambda t: t[1])
    grupos = [[rutas_ord[0]]]
    for item in rutas_ord[1:]:
        if item[1] - grupos[-1][-1][1] <= 30.0:
            grupos[-1].append(item)
        else:
            grupos.append([item])
    mapa = {}
    info = []
    for k, g in enumerate(grupos, 1):
        ps = str(k)
        mjds = [t[1] for t in g]
        for ruta, _ in g:
            mapa[ruta] = ps
        info.append({
            "pasada": k,
            "n_exp": len(g),
            "mjd_min": round(min(mjds), 2),
            "mjd_max": round(max(mjds), 2),
        })
    return mapa, info


def coords_campo(ra_c, dec_c):
    sc = SkyCoord(ra=ra_c * u.deg, dec=dec_c * u.deg, frame="icrs")
    bme = sc.transform_to("barycentricmeanecliptic")
    gme = sc.transform_to("geocentricmeanecliptic")
    gal = sc.galactic
    return {
        "ra_deg": round(float(ra_c), 5),
        "dec_deg": round(float(dec_c), 5),
        "beta_bme_deg": round(float(bme.lat.deg), 2),
        "beta_gme_deg": round(float(gme.lat.deg), 2),
        "abs_beta_deg": round(abs(float(bme.lat.deg)), 2),
        "ecl_lon_deg": round(float(bme.lon.deg), 2),
        "gal_b_deg": round(float(gal.b.deg), 2),
        "abs_gal_b_deg": round(abs(float(gal.b.deg)), 2),
        "gal_l_deg": round(float(gal.l.deg), 2),
    }


def stats_robustas(arr):
    if len(arr) == 0:
        return {"n_pix": 0, "p25": None, "mediana": None, "mad": None}
    med = float(np.median(arr))
    mad = float(1.4826 * np.median(np.abs(arr - med)))
    return {
        "n_pix": int(len(arr)),
        "p25": round(float(np.percentile(arr, 25)), 5),
        "mediana": round(med, 5),
        "mad": round(mad, 5),
    }


def analizar_cajas_campo(D, oid, verif_wcs):
    zp = np.load(os.path.join(D, f"pilas_{oid}.npz"))
    ra_c, dec_c = float(zp["ra_c"]), float(zp["dec_c"])
    meta = coords_campo(ra_c, dec_c)

    ruta_f = os.path.join(D, f"fuentes_{oid}.json")
    fuentes = json.load(open(ruta_f)) if os.path.exists(ruta_f) else None

    rutas = sorted(glob.glob(os.path.join(D, "cajas", oid, "*.npz")))
    con_mjd = []
    for r in rutas:
        with np.load(r) as z:
            con_mjd.append((r, float(z["mjd"])))
    mapa_pasada, pas_info = agrupar_pasadas(con_mjd)

    flujos_all, lams_all, bandas_all, pas_all = [], [], [], []
    frac_valid_list = []

    for idx_r, r in enumerate(rutas):
        ps = mapa_pasada[r]
        with np.load(r) as z:
            img = z["img"].astype(float)  # SIN restar mediana
            var = z["var"].astype(float)
            x0, y0 = float(z["x0"]), float(z["y0"])
            banda = int(z["banda"])
            cab = str(z["cab"])
            xs = z["xs"].astype(float)
            ys = z["ys"].astype(float)
            vals = z["vals"].astype(float)

        ny, nx = img.shape
        yy, xx = np.mgrid[0:ny, 0:nx]
        w = wcs_rapido(cab)

        if not verif_wcs["hecho"]:
            w_full = WCS(fits.Header.fromstring(cab))
            xf_r, yf_r = w.all_world2pix(ra_c, dec_c, 0)
            xf_f, yf_f = w_full.all_world2pix(ra_c, dec_c, 0)
            verif_wcs["diff_px"] = float(math.hypot(float(xf_r) - float(xf_f), float(yf_r) - float(yf_f)))
            verif_wcs["hecho"] = True

        # Mascaremos r < 8 px nativos alrededor del centro del recorte
        xc_nat, yc_nat = w.all_world2pix(ra_c, dec_c, 0)
        xc = float(xc_nat) - x0
        yc = float(yc_nat) - y0
        mask_src = ((xx - xc) ** 2 + (yy - yc) ** 2) < 8.0 ** 2

        # Mascarar tambien r < 2.5 px nativos alrededor de todas las fuentes detectadas en esa pasada
        if fuentes is not None and ps in fuentes and len(fuentes[ps]) > 0:
            ras = [f["ra"] for f in fuentes[ps]]
            decs = [f["dec"] for f in fuentes[ps]]
            xf_s, yf_s = w.all_world2pix(ras, decs, 0)
            for fx, fy in zip(xf_s - x0, yf_s - y0):
                mask_src |= ((xx - fx) ** 2 + (yy - fy) ** 2) < 2.5 ** 2

        ok = (~mask_src) & np.isfinite(img) & np.isfinite(var) & (var > 0)
        frac_valid_list.append(float(ok.mean()))
        if not np.any(ok):
            continue

        interp = RegularGridInterpolator((ys, xs), vals[:, :, 0], bounds_error=False, fill_value=None)
        pts = np.column_stack([y0 + 1.0 + yy[ok], x0 + 1.0 + xx[ok]])
        lam_pix = interp(pts).astype(float)

        vals_pix = img[ok]
        ok_lam = np.isfinite(lam_pix) & (lam_pix >= BORDES_LAM[0]) & (lam_pix <= BORDES_LAM[-1])
        if not np.any(ok_lam):
            continue

        n_ok = int(ok_lam.sum())
        flujos_all.append(vals_pix[ok_lam])
        lams_all.append(lam_pix[ok_lam])
        bandas_all.append(np.full(n_ok, banda, dtype=np.int16))
        pas_all.append(np.full(n_ok, int(ps), dtype=np.int16))

    flujos = np.concatenate(flujos_all)
    lams = np.concatenate(lams_all)
    bandas = np.concatenate(bandas_all)
    pases = np.concatenate(pas_all)

    # Espectro del fondo en 12 bines log-espaciados
    bins_res = []
    for k in range(len(LAM_BINS)):
        m = (lams >= BORDES_LAM[k]) & (lams < BORDES_LAM[k + 1] if k < len(LAM_BINS) - 1 else lams <= BORDES_LAM[k + 1])
        st = stats_robustas(flujos[m])
        st["bin"] = k
        st["lam_um"] = round(float(LAM_BINS[k]), 4)
        st["lam_min_um"] = round(float(BORDES_LAM[k]), 4)
        st["lam_max_um"] = round(float(BORDES_LAM[k + 1]), 4)
        bins_res.append(st)

    # Por banda detectora D1..D6
    bandas_res = {}
    for b in range(1, 7):
        m = bandas == b
        st = stats_robustas(flujos[m])
        st["lam_med_um"] = round(float(np.median(lams[m])), 3) if np.any(m) else None
        bandas_res[f"D{b}"] = st

    # Por pasada (B2 ~1.3 um y B5 ~4.2 um para chequear modulacion estacional zodiacal)
    pasadas_res = {}
    for pinfo in pas_info:
        p = pinfo["pasada"]
        mp = pases == p
        st_b2 = stats_robustas(flujos[mp & (bandas == 2)])
        st_b5 = stats_robustas(flujos[mp & (bandas == 5)])
        pasadas_res[str(p)] = {
            "n_exp": pinfo["n_exp"],
            "mjd_min": pinfo["mjd_min"],
            "mjd_max": pinfo["mjd_max"],
            "D2": st_b2,
            "D5": st_b5,
        }

    return {
        "meta": meta,
        "n_exp": len(rutas),
        "n_pix_fondo_total": int(len(flujos)),
        "frac_pix_enmascarado_y_valido_prom": round(float(np.mean(frac_valid_list)), 3),
        "saturado_halo_psf": bool(oid == "r_dra"),
        "nota_campo": (
            "Halo de PSF saturada de R Dra (~2-3 Jy) llena el recorte completo de 2.4 arcmin; no representa cielo libre."
            if oid == "r_dra"
            else (
                "Baja latitud galactica (|b|=14.1 deg): fondo elevado en bandas cortas por estrellas tenues no resueltas y luz difusa."
                if oid == "barnard"
                else (
                    "Plano galactico (|b|=6.0 deg) + baja latitud ecliptica (+7.47 deg): maxima luz zodiacal + alas de RW Aur."
                    if oid == "rw_aur"
                    else "Campo limpio apto para medir luz zodiacal."
                )
            )
        ),
        "espectro_12_bines": bins_res,
        "por_banda": bandas_res,
        "por_pasada": pasadas_res,
    }


def ajuste_psf_completo(st, vs, xy_list):
    """Ajusta sigma_gauss, fondo y flujos de TODAS las fuentes simultaneamente."""
    N = st.shape[0]
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
    modelo = mod(res.x)
    return modelo, float(res.x[0]), float(res.x[1]), ok


def residuos_psf_pila(D, oid, x_targ_dict, y_targ_dict):
    zp = np.load(os.path.join(D, f"pilas_{oid}.npz"))
    fuentes = json.load(open(os.path.join(D, f"fuentes_{oid}.json")))
    pases = sorted(fuentes.keys(), key=int)
    out = {}
    for ps in pases:
        xy_list = [(f["x"], f["y"]) for f in fuentes[ps]]
        xt, yt = x_targ_dict[ps], y_targ_dict[ps]
        out[ps] = {}
        for g in ("corto", "medio", "largo"):
            k_st, k_var = f"{ps}_{g}_st", f"{ps}_{g}_var"
            if k_st not in zp:
                continue
            st = zp[k_st].astype(float)
            vs = zp[k_var].astype(float)
            N = st.shape[0]
            yy, xx = np.mgrid[0:N, 0:N]
            modelo, sigma_px, bg, ok = ajuste_psf_completo(st, vs, xy_list)
            z_res = (st - modelo) / np.sqrt(np.where(ok, vs, 1.0))

            r_targ = np.hypot(xx - xt, yy - yt)
            m_in = ok & (r_targ <= 5.0)
            m_out = ok & (r_targ > 5.0)

            def met(m):
                arr = z_res[m]
                return {
                    "n_pix": int(len(arr)),
                    "std_norm": round(float(np.std(arr)), 3) if len(arr) else None,
                    "frac_gt_3sigma": round(float(np.mean(arr > 3.0)), 4) if len(arr) else None,
                    "frac_lt_minus3sigma": round(float(np.mean(arr < -3.0)), 4) if len(arr) else None,
                    "max_z": round(float(np.max(arr)), 2) if len(arr) else None,
                    "min_z": round(float(np.min(arr)), 2) if len(arr) else None,
                }

            out[ps][g] = {
                "n_fuentes": len(xy_list),
                "sigma_gauss_px": round(sigma_px, 3),
                "bg_pila_MJy_sr": round(bg, 5),
                "dentro_r5": met(m_in),
                "fuera_r5": met(m_out),
            }
    return out


def main():
    D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
    here = os.path.dirname(os.path.abspath(__file__))

    verif_wcs = {"hecho": False, "diff_px": None}
    campos = {}
    for oid in OBJETOS:
        campos[oid] = analizar_cajas_campo(D, oid, verif_wcs)

    # Gradiente zodiacal en los 4 campos no saturados
    beta_abs = np.array([campos[o]["meta"]["abs_beta_deg"] for o in NO_SATURADOS], float)
    inv_sin = 1.0 / np.sin(np.radians(beta_abs))
    b2_p25 = np.array([campos[o]["por_banda"]["D2"]["p25"] for o in NO_SATURADOS], float)
    b5_p25 = np.array([campos[o]["por_banda"]["D5"]["p25"] for o in NO_SATURADOS], float)
    b2_med = np.array([campos[o]["por_banda"]["D2"]["mediana"] for o in NO_SATURADOS], float)
    b5_med = np.array([campos[o]["por_banda"]["D5"]["mediana"] for o in NO_SATURADOS], float)

    gradiente_zodiacal = {
        "campos_ordenados_por_abs_beta": list(NO_SATURADOS),
        "abs_beta_deg": [round(float(v), 2) for v in beta_abs],
        "cosecante_abs_beta": [round(float(v), 3) for v in inv_sin],
        "D2_p25_MJy_sr": [round(float(v), 4) for v in b2_p25],
        "D2_mediana_MJy_sr": [round(float(v), 4) for v in b2_med],
        "D5_p25_MJy_sr": [round(float(v), 4) for v in b5_p25],
        "D5_mediana_MJy_sr": [round(float(v), 4) for v in b5_med],
        "razon_rw_aur_sobre_eps_ind_b_D2_p25": round(float(b2_p25[0] / b2_p25[-1]), 2),
        "razon_rw_aur_sobre_eps_ind_b_D5_p25": round(float(b5_p25[0] / b5_p25[-1]), 2),
        "corr_pearson_D2_p25_vs_abs_beta": round(float(np.corrcoef(beta_abs, b2_p25)[0, 1]), 3),
        "corr_pearson_D5_p25_vs_abs_beta": round(float(np.corrcoef(beta_abs, b5_p25)[0, 1]), 3),
        "corr_pearson_D2_p25_vs_csc_beta": round(float(np.corrcoef(inv_sin, b2_p25)[0, 1]), 3),
        "corr_pearson_D5_p25_vs_csc_beta": round(float(np.corrcoef(inv_sin, b5_p25)[0, 1]), 3),
    }

    # Residuos PSF 2D en pilas: WISE 0855 vs RW Aur
    co = json.load(open(os.path.join(here, "cinco_objetos_resultado.json")))
    hw = json.load(open(os.path.join(D, "huella_wise_0855.json")))
    cw = co["objetivos"]["wise_0855"]["busqueda_ciega"]["huella"]["candidata"]["cadena"]
    w_xt = {ps: hw["fuentes"][ps][idx]["x"] for ps, idx in cw.items()}
    w_yt = {ps: hw["fuentes"][ps][idx]["y"] for ps, idx in cw.items()}

    hr = json.load(open(os.path.join(D, "huella_rw_aur.json")))
    cr = co["objetivos"]["rw_aur"]["rw_aur_indice"]
    r_xt = {ps: hr["fuentes"][ps][idx]["x"] for ps, idx in cr.items()}
    r_yt = {ps: hr["fuentes"][ps][idx]["y"] for ps, idx in cr.items()}

    residuos_psf = {
        "wise_0855": residuos_psf_pila(D, "wise_0855", w_xt, w_yt),
        "rw_aur": residuos_psf_pila(D, "rw_aur", r_xt, r_yt),
    }

    # Firmas difusas y nebulares cubiertas por SPHEREx (0.75-5.0 um)
    firmas_difusas = [
        {"firma": "Hielo H2O", "lam_um": 3.05, "banda": "D4", "bin_log": 8, "rango_bin_um": [round(float(BORDES_LAM[8]), 3), round(float(BORDES_LAM[9]), 3)], "nota": "Banda de absorcion en nubes moleculares oscuras y hielos interestelares (objetivo central de SPHEREx Ices)."},
        {"firma": "Emision PAH", "lam_um": 3.29, "banda": "D4", "bin_log": 9, "rango_bin_um": [round(float(BORDES_LAM[9]), 3), round(float(BORDES_LAM[10]), 3)], "nota": "Hidrocarburos aromaticos policiclicos en regiones de fotodisociacion (PDR) y bordes de nebulosas H II."},
        {"firma": "H I Brackett alpha (Br_a)", "lam_um": 4.051, "banda": "D5", "bin_log": 10, "rango_bin_um": [round(float(BORDES_LAM[10]), 3), round(float(BORDES_LAM[11]), 3)], "nota": "Gas ionizado en nebulosas difusas y regiones de formacion estelar (resolucion R~41.5 en D5 diluye lineas estrechas salvo regiones brillantes)."},
        {"firma": "Hielo CO2", "lam_um": 4.26, "banda": "D5/D6", "bin_log": "10/11", "rango_bin_um": [round(float(BORDES_LAM[10]), 3), round(float(BORDES_LAM[12]), 3)], "nota": "Absorcion estrecha en nubes frias y protoestrellas, adyacente a hielo de CO (4.67 um, bin 11)."},
    ]

    taxonomia_eventos = [
        {"clase": "Estrella de campo estatica", "delta_pos": "< 3 sigma (~0.1-0.4 arcsec)", "D_espectral": "Bajo (~0.1-2.8)", "ejemplo_medido": "Estrellas estaticas en WISE 0855 (0.12 arcsec med, D=0.3-2.2) y eps Ind B (0.36 arcsec, D=0.27)"},
        {"clase": "Astro cercano en movimiento (Planeta X / enana marron)", "delta_pos": ">= 5 sigma", "D_espectral": "Bajo entre pasadas (< 3); muy alto respecto a estrellas vecinas", "ejemplo_medido": "WISE 0855 (8.67 arcsec, 10.5 sigma, D=0.12-2.17 vs 4.7-257 con estrella), eps Ind B (6.62 arcsec, 13.2 sigma), Barnard (10.26 arcsec)"},
        {"clase": "Variable espectral o YSO estacionaria", "delta_pos": "< 3 sigma (<= 0.4 arcsec neto)", "D_espectral": "Muy alto (> 5)", "ejemplo_medido": "RW Aur: 0.28 arcsec P1-P3 pero D(2-3)=17.31 (flujo D1-D4 cae ~27 % mientras D5-6 se aplana)"},
        {"clase": "Fuente muy brillante saturada", "delta_pos": "Nucleo con NaNs", "D_espectral": "No fiable en centro", "ejemplo_medido": "R Dra: 518/519 exposiciones (99.81 %) sin pixels centrales finitos; alas cubren 2.4 arcmin"},
        {"clase": "Nebulosa / exceso difuso extendido", "delta_pos": "Extendida > 20 arcsec (multi-pixel coherente)", "D_espectral": "Exceso en bines especificos (3.05, 3.29, 4.05, 4.26 um) y residuos > 3 sigma tras restar todas las PSF", "ejemplo_medido": "En campo WISE 0855 fondo limpio tras restar PSF; en RW Aur las alas PSF dominan el residuo central (< 5 px)"},
    ]

    res = {
        "datos_dir": D,
        "verificacion_wcs_sip": verif_wcs,
        "n_exposiciones_total": sum(campos[o]["n_exp"] for o in OBJETOS),
        "n_pixeles_fondo_total": sum(campos[o]["n_pix_fondo_total"] for o in OBJETOS),
        "campos": campos,
        "gradiente_zodiacal": gradiente_zodiacal,
        "residuos_psf_pilas": residuos_psf,
        "firmas_difusas_spherex": firmas_difusas,
        "taxonomia_eventos": taxonomia_eventos,
    }

    ruta_out = os.path.join(here, "analisis_fondo_resultado.json")
    with open(ruta_out, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, ensure_ascii=False)
    print(f"OK -> {ruta_out} | total_exp={res['n_exposiciones_total']} total_pix_bg={res['n_pixeles_fondo_total']} diff_wcs={verif_wcs['diff_px']:.2e} px")
    for oid in OBJETOS:
        c = campos[oid]
        print(f"  {oid}: exp={c['n_exp']} pix={c['n_pix_fondo_total']} beta={c['meta']['beta_bme_deg']} b={c['meta']['gal_b_deg']} D2_p25={c['por_banda']['D2']['p25']} D5_p25={c['por_banda']['D5']['p25']} D2_med={c['por_banda']['D2']['mediana']} D5_med={c['por_banda']['D5']['mediana']}")
    print("  Zodiacal gradiente (rw_aur -> eps_ind_b):", gradiente_zodiacal)
    for oid in ("wise_0855", "rw_aur"):
        for ps, gd in residuos_psf[oid].items():
            for g, m in gd.items():
                print(f"  RES {oid} P{ps} {g}: sig={m['sigma_gauss_px']} | IN std={m['dentro_r5']['std_norm']} >3s={m['dentro_r5']['frac_gt_3sigma']} <-3s={m['dentro_r5']['frac_lt_minus3sigma']} | OUT std={m['fuera_r5']['std_norm']} >3s={m['fuera_r5']['frac_gt_3sigma']}")


if __name__ == "__main__":
    main()
