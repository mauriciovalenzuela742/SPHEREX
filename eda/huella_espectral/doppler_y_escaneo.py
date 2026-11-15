"""Calcula la escala del efecto Doppler fisico, el salto baricentrico entre
pasadas de SPHEREx, el acoplamiento geometrico del filtro lineal variable (LVF)
y el impacto del desplazamiento propio durante el escaneo de una misma pasada
(43-55 dias) sobre los 5 objetivos del desafio.

Uso:
  python doppler_y_escaneo.py [CARPETA_DATOS]

Lee `cinco_objetos_resultado.json` y `analisis_fondo_resultado.json` de esta
misma carpeta (y `huella_wise_0855.json` / `ids_wise_0855.json` de CARPETA_DATOS,
por defecto D:\\dev\\informes_v2\\huella_espectral) y escribe
`doppler_y_escaneo_resultado.json` junto a este script.
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import astropy.constants as const
import astropy.units as u
import numpy as np
from astropy.coordinates import SkyCoord, get_body_barycentric_posvel
from astropy.time import Time

HERE = Path(__file__).resolve().parent
DATA_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\dev\informes_v2\huella_espectral")

C_KMS = float(const.c.to_value("km/s"))
PIX_ARCSEC = 6.15
DETECTOR_PX = 2048.0
SIGMA_PSF_CORTO_PX = 0.40
SIGMA_PSF_LARGO_PX = 0.55

# Especificacion nominal SPHEREx por detector (D1-D6): (nombre, lam_min_um, lam_max_um, R)
BANDAS = [
    ("D1", 0.75, 1.11, 41),
    ("D2", 1.11, 1.64, 41),
    ("D3", 1.64, 2.42, 41),
    ("D4", 2.42, 3.82, 35),
    ("D5", 3.82, 4.42, 110),
    ("D6", 4.42, 5.00, 130),
]

# Velocidades radiales sistemicas consultadas en SIMBAD TAP (espejo CfA, 15-nov-2026)
RV_SIMBAD = {
    "wise_0855": {"simbad_id": "WISEA J085510.74-071442.5", "rv_kms": None, "nota": "Sin RV publicada en SIMBAD; solo se usa el salto baricentrico exacto y cota |v_r|<=50 km/s ilustrativa."},
    "eps_ind_b": {"simbad_id": "* eps Ind (sistema)", "rv_kms": -40.035, "bibcode": "2018A&A...616A...7S", "nota": "* eps Ind B hereda la RV del sistema eps Ind A (2018A&A...616A...7S)."},
    "barnard": {"simbad_id": "NAME Barnard's star", "rv_kms": -110.11, "bibcode": "2018MNRAS.475.1960F", "nota": "Fouque et al. 2018."},
    "rw_aur": {"simbad_id": "V* RW Aur", "rv_kms": 15.0, "bibcode": "2012ApJ...745..119N", "v_int_kms": 200.0, "nota": "Estrella T Tauri con chorros bipolares del orden de ~200 km/s."},
    "r_dra": {"simbad_id": "V* R Dra", "rv_kms": -132.8, "bibcode": "1953GCRV..C......0W", "v_int_kms": 15.0, "nota": "Estrella Mira con pulsacion tipica ~15 km/s."},
}


def v_bary_kms(ra_deg: float, dec_deg: float, mjd: float) -> float:
    """Proyeccion de la velocidad baricentrica de la Tierra sobre la linea de vision (km/s)."""
    sc = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg)
    u_vec = sc.cartesian.xyz.value
    _, vel = get_body_barycentric_posvel("earth", Time(mjd, format="mjd"))
    return float(np.dot(vel.xyz.to_value("km/s"), u_vec))


def escala_bandas() -> list[dict]:
    filas = []
    for nombre, l0, l1, R in BANDAS:
        l_med = 0.5 * (l0 + l1)
        dlam = l_med / R
        dv_res = C_KMS / R
        grad_um_px = (l1 - l0) / DETECTOR_PX
        grad_um_arcsec = grad_um_px / PIX_ARCSEC
        v_eq_px = C_KMS * (grad_um_px / l_med)
        v_eq_arcsec = C_KMS * (grad_um_arcsec / l_med)
        filas.append({
            "banda": nombre,
            "lam_min_um": l0,
            "lam_max_um": l1,
            "R": R,
            "dlam_res_nm": round(dlam * 1e3, 1),
            "dv_res_kms": round(dv_res, 0),
            "grad_lvf_nm_px": round(grad_um_px * 1e3, 3),
            "v_eq_lvf_kms_px": round(v_eq_px, 1),
            "v_eq_lvf_kms_arcsec": round(v_eq_arcsec, 1),
        })
    return filas


def cramer_rao_wise0855() -> dict:
    hp = DATA_DIR / "huella_wise_0855.json"
    ip = DATA_DIR / "ids_wise_0855.json"
    if not hp.exists() or not ip.exists():
        return {"disponible": False}
    hw = json.loads(hp.read_text(encoding="utf-8"))
    ids = json.loads(ip.read_text(encoding="utf-8"))
    lams = np.array(hw["lam_bins"], dtype=float)
    res = {}
    for p_id in ("1", "2", "3"):
        obj_idx = ids["obj"][p_id]
        bins = hw["espectros"][p_id][obj_idx]["bins"]
        f = np.array([b[0] if b[0] is not None else np.nan for b in bins], dtype=float)
        e = np.array([b[1] if b[1] is not None else np.nan for b in bins], dtype=float)
        ok = np.isfinite(f) & np.isfinite(e) & (e > 0)
        df_dlnl = np.gradient(f[ok], np.log(lams[ok]))
        sigma_est = C_KMS / math.sqrt(float(np.sum((df_dlnl / e[ok]) ** 2)))
        e_sys = np.hypot(e[ok], 0.05 * np.abs(f[ok]))
        sigma_sys = C_KMS / math.sqrt(float(np.sum((df_dlnl / e_sys) ** 2)))
        res[f"P{p_id}"] = {
            "n_bines": int(ok.sum()),
            "sigma_v_est_kms": round(sigma_est, 0),
            "sigma_v_con_5pct_kms": round(sigma_sys, 0),
        }
    return {"disponible": True, "por_pasada": res}


def movimiento_anual(k: str, obj: dict) -> float:
    if k == "barnard":
        return float(obj["medido_P1_P3_arcsec"])
    if k == "wise_0855":
        return float(obj["medido_P1_P3_arcsec"])
    if k == "eps_ind_b":
        return float(obj["medido_P1_P4_arcsec"])
    if k == "rw_aur":
        return float(next(p["desplazamiento_arcsec"] for p in obj["rw_aur_pares"] if p["par"] == "1-3"))
    return 0.022  # R Dra (pm = 0,022"/yr segun SIMBAD / campos_de_prueba.yml)


def analizar() -> dict:
    co = json.loads((HERE / "cinco_objetos_resultado.json").read_text(encoding="utf-8"))
    af = json.loads((HERE / "analisis_fondo_resultado.json").read_text(encoding="utf-8"))

    bandas = escala_bandas()
    grad_corto = float(np.mean([b["v_eq_lvf_kms_arcsec"] for b in bandas[:3]]))
    grad_largo = float(np.mean([b["v_eq_lvf_kms_arcsec"] for b in bandas[4:]]))

    objetivos = {}
    for k in ("wise_0855", "eps_ind_b", "barnard", "rw_aur", "r_dra"):
        meta = af["campos"][k]["meta"]
        ra, dec = float(meta["ra_deg"]), float(meta["dec_deg"])
        pasadas = co["objetivos"][k]["pasadas"]
        mjds_mid = [0.5 * (p["mjd_min"] + p["mjd_max"]) for p in pasadas]
        vbarys = [round(v_bary_kms(ra, dec, m), 2) for m in mjds_mid]
        dv_bary_pasadas = round(max(vbarys) - min(vbarys), 2)
        dv_bary_intra = round(
            max(abs(v_bary_kms(ra, dec, p["mjd_max"]) - v_bary_kms(ra, dec, p["mjd_min"])) for p in pasadas),
            2,
        )
        max_dt = round(max(p["mjd_max"] - p["mjd_min"] for p in pasadas), 1)
        mjd_span_total = max(p["mjd_max"] for p in pasadas) - min(p["mjd_min"] for p in pasadas)

        mov = movimiento_anual(k, co["objetivos"][k])
        dt_neto = mjds_mid[-1] - mjds_mid[0]
        tasa_arcsec_dia = mov / dt_neto if dt_neto > 0 else 0.0
        mov_intra = mov * (max_dt / dt_neto) if dt_neto > 0 else 0.0

        rv_info = RV_SIMBAD[k]
        rv_val = abs(rv_info["rv_kms"]) if rv_info["rv_kms"] is not None else 0.0
        v_int = float(rv_info.get("v_int_kms", 0.0))
        v_tot_max = rv_val + 0.5 * dv_bary_pasadas + v_int

        atten_fija_corto = math.exp(-0.5 * (mov / (SIGMA_PSF_CORTO_PX * PIX_ARCSEC)) ** 2)
        atten_fija_largo = math.exp(-0.5 * (mov / (SIGMA_PSF_LARGO_PX * PIX_ARCSEC)) ** 2)
        atten_intra_corto = math.exp(-0.5 * (mov_intra / (SIGMA_PSF_CORTO_PX * PIX_ARCSEC)) ** 2)
        atten_intra_largo = math.exp(-0.5 * (mov_intra / (SIGMA_PSF_LARGO_PX * PIX_ARCSEC)) ** 2)

        objetivos[k] = {
            "meta": meta,
            "simbad_rv": rv_info,
            "v_bary_por_pasada_kms": vbarys,
            "max_delta_v_bary_entre_pasadas_kms": dv_bary_pasadas,
            "frac_lam_bary": round(dv_bary_pasadas / C_KMS, 6),
            "frac_canal_d1_3_pct": round(dv_bary_pasadas / 7312.0 * 100.0, 3),
            "frac_canal_d6_pct": round(dv_bary_pasadas / 2306.0 * 100.0, 3),
            "max_delta_v_bary_dentro_pasada_kms": dv_bary_intra,
            "v_fisica_total_max_kms": round(v_tot_max, 1),
            "frac_canal_d1_3_total_pct": round(v_tot_max / 7312.0 * 100.0, 2),
            "frac_canal_d6_total_pct": round(v_tot_max / 2306.0 * 100.0, 2),
            "duracion_total_dias": round(mjd_span_total, 1),
            "dt_centros_pasadas_dias": round(dt_neto, 1),
            "movimiento_neto_arcsec": round(mov, 2),
            "si_coordenada_fija_entre_pasadas": {
                "falso_doppler_lvf_corto_kms": round(mov * grad_corto, 1),
                "falso_doppler_lvf_largo_kms": round(mov * grad_largo, 1),
                "flujo_psf_retenido_corto_pct": round(atten_fija_corto * 100.0, 1),
                "flujo_psf_retenido_largo_pct": round(atten_fija_largo * 100.0, 1),
            },
            "dentro_de_misma_pasada": {
                "max_duracion_pasada_dias": max_dt,
                "movimiento_intra_arcsec": round(mov_intra, 2),
                "movimiento_intra_px": round(mov_intra / PIX_ARCSEC, 3),
                "falso_doppler_lvf_corto_kms": round(mov_intra * grad_corto, 2),
                "flujo_psf_retenido_corto_pct": round(atten_intra_corto * 100.0, 2),
                "flujo_psf_retenido_largo_pct": round(atten_intra_largo * 100.0, 2),
            },
        }

    return {
        "c_kms": C_KMS,
        "escala_pixel_arcsec": PIX_ARCSEC,
        "escala_por_banda": bandas,
        "cramer_rao_wise0855": cramer_rao_wise0855(),
        "objetivos": objetivos,
    }


if __name__ == "__main__":
    res = analizar()
    out_path = HERE / "doppler_y_escaneo_resultado.json"
    out_path.write_text(json.dumps(res, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Escrito: {out_path}")
    for k, o in res["objetivos"].items():
        di = o["dentro_de_misma_pasada"]
        print(
            f"{k:10s} | dV_bary={o['max_delta_v_bary_entre_pasadas_kms']:5.2f} km/s "
            f"| mov={o['movimiento_neto_arcsec']:5.2f}\" | max_pas={di['max_duracion_pasada_dias']:4.1f} d "
            f"| mov_intra={di['movimiento_intra_arcsec']:4.2f}\" ({di['movimiento_intra_px']:.3f} px) "
            f"| ret_intra={di['flujo_psf_retenido_corto_pct']:.2f}%/{di['flujo_psf_retenido_largo_pct']:.2f}%"
        )
