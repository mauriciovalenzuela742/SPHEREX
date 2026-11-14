"""EDA 2 — ¿En qué longitud de onda quedó el objeto en cada época?

La pregunta más importante del Bloque 1 (docs/02 §2): por el filtro lineal variable, la λ de un
objeto depende de en qué parte del detector cayó. Si cambia mucho entre épocas, un blink ingenuo
muestra cambios de brillo falsos.

Para cada archivo del inventario (sin las colecciones _deep, para no pedir miles de headers):
  - baja solo el header de IMAGE (petición HTTP Range, ~35 KB, no los 65 MB);
  - ubica el objeto en el detector con el WCS del cielo, en su posición propagada a esa fecha;
  - interpola la λ y el ancho de banda en la grilla WCS-WAVE de ese detector.

Uso:  .venv/Scripts/python eda/02_longitud_de_onda.py      (requiere haber corrido 01)
Salidas:
  eda/resultados/lambda_por_archivo.csv   una fila por archivo (versionado: es pequeño)
  eda/resultados/lambda_resumen.json      dispersión de λ por campo y detector
"""
from __future__ import annotations

import csv
import json
import time
import warnings
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from astropy.table import Table
from astropy.wcs import WCS, FITSFixedWarning

from comun import CACHE, RESULTADOS, asegurar_carpetas, cargar_campos, mjd_a_anio, posicion_en
from espectral import bilineal, cabecera_imagen, grilla_detector

warnings.simplefilter("ignore", FITSFixedWarning)
HILOS = 6           # amable con IRSA: 6 peticiones simultáneas como máximo
COLECCIONES_USADAS = ("spherex_dr1", "spherex_qr3")


def procesar(fila, campo, grillas):
    h = cabecera_imagen(fila["access_url"])
    mjd = float(h["MJD-AVG"])
    ra, dec = posicion_en(campo, mjd)
    x, y = WCS(h).world_to_pixel_values(ra, dec)          # 0-based en la imagen completa
    det = int(h["DETECTOR"])
    X, Y = float(x) + 1, float(y) + 1                        # detector 1-based (imagen = área activa)
    g = grillas[det]
    return {
        "campo": campo["id"], "coleccion": fila["coleccion"], "obs_id": fila["obs_id"],
        "detector": det, "mjd": round(mjd, 5), "anio": round(mjd_a_anio(mjd), 4),
        "x_det": round(X, 1), "y_det": round(Y, 1),
        "dentro": bool(1 <= X <= 2040 and 1 <= Y <= 2040),
        "lambda_um": round(bilineal(g, "lam", X, Y), 4),
        "ancho_um": round(bilineal(g, "dlam", X, Y), 4),
        "flags_calidad": h.get("L2DQAFLG", ""),
    }


def main() -> None:
    asegurar_carpetas()
    campos = {c["id"]: c for c in cargar_campos()}

    # 1) Grilla WCS-WAVE de cada detector, sacada de un cutout chico de WISE 0855
    t_w = Table.read(CACHE / "sia2_wise_0855.ecsv")
    grillas = {}
    for d in range(1, 7):
        sel = t_w[t_w["energy_bandpassname"] == f"SPHEREx-D{d}"]
        ra, dec = posicion_en(campos["wise_0855"], float(sel["t_min"][0]))
        grillas[d] = grilla_detector(d, sel["access_url"][0], ra, dec)
        v = grillas[d]["validacion"]
        print(f"D{d}: λ {np.min(grillas[d]['lam']):.3f}–{np.max(grillas[d]['lam']):.3f} µm  "
              f"validación propia={v['lam_propia']:.4f} astropy={v['lam_astropy']:.4f}")

    # 2) Header de cada archivo, en paralelo
    filas_out = []
    for cid, campo in campos.items():
        t = Table.read(CACHE / f"sia2_{cid}.ecsv")
        t = t[np.isin(t["coleccion"], COLECCIONES_USADAS)]
        t0 = time.time()
        with ThreadPoolExecutor(HILOS) as ex:
            futuros = [ex.submit(procesar, f, campo, grillas) for f in t]
            for fu in futuros:
                try:
                    filas_out.append(fu.result())
                except Exception as e:  # noqa: BLE001
                    print(f"  {cid}: fallo {e}")
        print(f"{cid}: {len(t)} headers en {time.time() - t0:.0f} s")

    with open(RESULTADOS / "lambda_por_archivo.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(filas_out[0].keys()))
        w.writeheader()
        w.writerows(filas_out)

    # 3) Resumen: ¿cuánto varía la λ del objeto dentro de un mismo detector?
    resumen = defaultdict(dict)
    grupos = defaultdict(list)
    for r in filas_out:
        if r["dentro"] and not np.isnan(r["lambda_um"]):
            grupos[(r["campo"], r["detector"])].append(r)
    for (cid, det), rs in sorted(grupos.items()):
        lam = np.array([r["lambda_um"] for r in rs])
        ancho = np.median([r["ancho_um"] for r in rs])
        anios = np.array([r["anio"] for r in rs])
        # ¿Hay pares de épocas separadas > 0,4 años con λ dentro de medio ancho de banda?
        pares = 0
        for i in range(len(rs)):
            for j in range(i + 1, len(rs)):
                if abs(anios[i] - anios[j]) > 0.4 and abs(lam[i] - lam[j]) < ancho / 2:
                    pares += 1
        resumen[cid][f"D{det}"] = {
            "archivos": len(rs), "lambda_min": round(lam.min(), 3), "lambda_max": round(lam.max(), 3),
            "rango_en_anchos_de_banda": round((lam.max() - lam.min()) / ancho, 1),
            "ancho_banda_mediano_um": round(float(ancho), 4),
            "pares_misma_lambda_entre_pasadas": pares,
        }
    (RESULTADOS / "lambda_resumen.json").write_text(
        json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(resumen, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
