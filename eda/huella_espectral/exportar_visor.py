"""Exporta al visor (scaffold/frontend/public/precalc/huella/) los resultados de la huella espectral.

No recalcula nada: copia las imagenes apiladas por pasada (pilas_wise_0855.npz, limpieza_wise0855.npz, generadas por
paso1_apilar.py y limpieza_fondo.py) y las cifras de los *_resultado.json / cifras_verificadas.json. Cada cifra del
resumen lleva su origen en el campo "fuente" para poder verificarla.

Uso: python -I exportar_visor.py [carpeta_de_datos]   (por defecto D:\\dev\\informes_v2\\huella_espectral)
"""
import json
import math
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
DATOS = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(r"D:\dev\informes_v2\huella_espectral")
SALIDA = AQUI.parents[1] / "scaffold" / "frontend" / "public" / "precalc" / "huella"
ESC_ARCSEC = 6.15 / 2  # subrejilla de paso1_apilar.py (medio pixel nativo)


def leer(nombre):
    return json.loads((AQUI / nombre).read_text(encoding="utf-8"))


def imagen(a):
    """41x41 -> lista plana por filas (y, x), 5 decimales, NaN -> None."""
    return [None if not math.isfinite(v) else round(float(v), 5) for v in np.asarray(a, dtype=float).ravel()]


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    lim = leer("limpieza_fondo_resultado.json")
    cinco = leer("cinco_objetos_resultado.json")["objetivos"]
    fondo = leer("analisis_fondo_resultado.json")
    ver = leer("cifras_verificadas.json")

    # ── Imagenes de WISE 0855 por pasada ──
    pilas = np.load(DATOS / "pilas_wise_0855.npz")
    limp = np.load(DATOS / "limpieza_wise0855.npz")
    pasadas = []
    for p in ("1", "2", "3"):
        r = lim["pasadas"][p]
        xy = limp[f"{p}_cand_xy"]  # [x_cand_psf, y_cand_psf, x_vecina, y_vecina]
        info = ver["pasadas"][p]
        pasadas.append({
            "pasada": int(p),
            "desde": info["desde"], "hasta": info["hasta"], "n_exp": info["n_exp"],
            "corto": imagen(pilas[f"{p}_corto_st"]),
            "largo": imagen(limp[f"{p}_raw_largo"]),
            "limpio": imagen(limp[f"{p}_spec_clean"]),
            "vecina_xy": [round(float(xy[2]), 3), round(float(xy[3]), 3)],
            "pos": {k: {"x": r[f"wise0855_{k}"]["x"], "y": r[f"wise0855_{k}"]["y"],
                        "sep": r[f"wise0855_{k}"]["sep_vecina_arcsec"], "snr_int": r[f"wise0855_{k}"]["snr_int"]}
                    for k in ("raw_largo", "psf_clean", "spec_clean")},
            "supresion": {
                "vs_corto": r["supresion_estaticas_spec_vs_raw_c"]["factor_reduccion_rms_vs_corto"],
                "vs_largo": r["supresion_estaticas_spec_vs_raw_c"]["factor_reduccion_rms_vs_largo"],
                "psf": r["supresion_estaticas_psf_vs_raw_l"]["factor_reduccion_rms"],
            },
        })
    sep = cinco["wise_0855"]["sep_vecina_por_pasada"]
    limpieza = {
        "objeto": "wise_0855", "n": 41, "escala_arcsec": ESC_ARCSEC,
        "orientacion": "x crece hacia el oeste (RA baja), y crece hacia el norte; fila 0 = sur",
        "alpha": lim["alpha_largo_sobre_corto"], "err_alpha": lim["err_alpha"],
        "offsets": lim["offsets_spec_MJy_sr"],
        "sep_predicha": {p: sep[p]["predicha_arcsec"] for p in sep},
        "sep_medida_huella": {p: sep[p]["medida_arcsec"] for p in sep},
        "movimiento": lim["movimiento_P1_P3"],
        "fuente": "limpieza_fondo_resultado.json, cinco_objetos_resultado.json, pilas_wise_0855.npz, limpieza_wise0855.npz",
        "pasadas": pasadas,
    }
    (SALIDA / "limpieza_wise_0855.json").write_text(json.dumps(limpieza, separators=(",", ":")), encoding="utf-8")

    # ── Resumen: huella, busqueda ciega y los 5 objetos ──
    w, e, b, rw, rd = (cinco[k] for k in ("wise_0855", "eps_ind_b", "barnard", "rw_aur", "r_dra"))
    Dv = ver["D"]
    resumen = {
        "wise_0855": {
            "D_misma": w["D_misma_fuente"],
            "D_estrella_a_objeto": {k: round(Dv[k]["est_obj"], 1) for k in Dv},
            "D_objeto_a_estrella": w["D_vs_estrella"],
            "D_estaticas": {k: round(Dv[k]["est_est"], 2) for k in Dv},
            "frac_roja": w["busqueda_ciega"]["huella"]["candidata"]["frac_roja_med"],
            "frac_roja_vecina": 0.04,
            "busqueda": {k: {c: w["busqueda_ciega"][k][c] for c in ("n_completas", "rotas_desde_P1", "huerfanas_Pfin", "n_candidatas")}
                         for k in ("posicional", "huella")},
            "medido": round(w["medido_P1_P3_arcsec"], 2), "err": round(w["err_formal_arcsec"], 2),
            "sigma": w["sigma_con_piso"], "predicho": round(w["predicho_pm_plx_arcsec"], 2),
            "sep": w["sep_vecina_por_pasada"],
            "fuente": "cinco_objetos_resultado.json[wise_0855], cifras_verificadas.json[D]; frac_roja_vecina = 4 % del documento de hallazgos (sec. 5)",
        },
        "casos": [
            {"id": "wise_0855", "dpos": round(w["medido_P1_P3_arcsec"], 2), "sigma": w["sigma_con_piso"],
             "D": max(w["D_misma_fuente"].values()), "D_rango": [min(w["D_misma_fuente"].values()), max(w["D_misma_fuente"].values())],
             "clase": "movil", "predicho": round(w["predicho_pm_plx_arcsec"], 2), "pasadas": w["n_pasadas"]},
            {"id": "eps_ind_b", "dpos": round(e["medido_P1_P4_arcsec"], 2), "sigma": e["busqueda_ciega"]["huella"]["candidata"]["sigma_neto"],
             "D": max(z["D"] for z in e["zigzag_paralaje"]), "D_rango": [min(z["D"] for z in e["zigzag_paralaje"]), max(z["D"] for z in e["zigzag_paralaje"])],
             "clase": "movil", "predicho": round(e["predicho_pm_plx_arcsec"], 2), "pasadas": e["n_pasadas"],
             "zigzag": [round(z["medido_arcsec"], 2) for z in e["zigzag_paralaje"][:3]],
             # Prueba de la paralaje: diferencia vectorial medida−predicha con y sin paralaje (MJD de grupo)
             "predicho_grupo": round(e["predicho_pm_plx_mjd_grupo_arcsec"], 2),
             "dif_con_paralaje": round(e["dif_vectorial_pm_plx_mjd_grupo_arcsec"], 2),
             "dif_sin_paralaje": round(e["dif_vectorial_solo_pm_arcsec"], 2),
             "candidatas_posicion": e["busqueda_ciega"]["posicional"]["n_candidatas"]},
            {"id": "barnard", "dpos": round(b["medido_P1_P3_arcsec"], 2), "D": None, "clase": "movil_sin_espectro",
             "predicho": round(b["predicho_pm_plx_arcsec"], 2), "pasadas": b["n_pasadas"]},
            {"id": "rw_aur", "dpos": next(p["desplazamiento_arcsec"] for p in rw["rw_aur_pares"] if p["par"] == "1-3"),
             "D": max(p["D"] for p in rw["rw_aur_pares"]), "D_pares": {p["par"]: p["D"] for p in rw["rw_aur_pares"]},
             "clase": "variable", "pasadas": rw["n_pasadas"],
             "D_campo_mediana": rw["campo_mediana_D_13"], "quietas_mediana": rw["campo_mediana_d13_arcsec"]},
            {"id": "r_dra", "dpos": None, "D": None, "clase": "saturada", "frac_saturadas": rd["frac_exp_saturadas"],
             "n_sat": rd["exp_centro_3x3_no_finito"], "n_exp": rd["n_exp_total"], "pasadas": rd["n_pasadas"]},
        ],
        "fuente_casos": "cinco_objetos_resultado.json",
    }
    (SALIDA / "resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding="utf-8")

    # ── Fondo del cielo ──
    campos = []
    for cid, c in fondo["campos"].items():
        campos.append({
            "id": cid, "beta": c["meta"]["beta_bme_deg"], "b": c["meta"]["gal_b_deg"],
            "saturado": bool(c.get("saturado_halo_psf")), "n_pix": c["n_pix_fondo_total"],
            "espectro": [{"lam": s["lam_um"], "lo": s["lam_min_um"], "hi": s["lam_max_um"], "p25": s["p25"], "med": s["mediana"]}
                         for s in c["espectro_12_bines"]],
        })
    g = fondo["gradiente_zodiacal"]
    rp = fondo["residuos_psf_pilas"]

    def rango(obj, campo):
        vals = [rp[obj][p][b]["dentro_r5"][campo] for p in rp[obj] for b in rp[obj][p] if "dentro_r5" in rp[obj][p][b]]
        return [round(min(vals), 3), round(max(vals), 3)]

    fondo_out = {
        "n_exp": fondo["n_exposiciones_total"], "n_pix": fondo["n_pixeles_fondo_total"],
        "campos": campos,
        "razon_D5_rw_eps": g["razon_rw_aur_sobre_eps_ind_b_D5_p25"], "r_D5_beta": g["corr_pearson_D5_p25_vs_abs_beta"],
        "halo": {o: {"std_norm": rango(o, "std_norm"), "pos3": rango(o, "frac_gt_3sigma"), "neg3": rango(o, "frac_lt_minus3sigma")}
                 for o in ("wise_0855", "rw_aur")},
        "firmas": [{"firma": f["firma"], "lam": f["lam_um"], "banda": f["banda"]} for f in fondo["firmas_difusas_spherex"]],
        "fuente": "analisis_fondo_resultado.json",
    }
    (SALIDA / "fondo.json").write_text(json.dumps(fondo_out, ensure_ascii=False, indent=1), encoding="utf-8")
    for f in sorted(SALIDA.iterdir()):
        print(f.name, f.stat().st_size)


if __name__ == "__main__":
    main()
