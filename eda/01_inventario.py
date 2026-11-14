"""EDA 1 — ¿Qué imágenes de SPHEREx hay en cada campo de prueba?

Consulta SIA2 en las cuatro colecciones de imágenes (dr1, dr1_deep, qr3, qr3_deep) para los cinco
campos del enunciado y responde, por campo:

- cuántas filas (archivos MEF) devuelve cada colección y si DR1 y QR3 se solapan;
- cuántos apuntados distintos hay y cuántos por detector;
- en qué fechas: cuántos barridos del cielo ("pasadas") y cuántas visitas en cada uno.

Uso:  .venv/Scripts/python eda/01_inventario.py
Salidas:
  data/cache/eda/sia2_<campo>.ecsv     tabla completa (no versionada)
  eda/resultados/inventario.json       resumen (versionado)
"""
from __future__ import annotations

import json
import time
from collections import Counter, defaultdict

import numpy as np
import pyvo
from astropy.table import Table, vstack

from comun import (CACHE, COLECCIONES, RESULTADOS, SIA2_URL, asegurar_carpetas,
                   cargar_campos, mjd_a_anio, posicion_en)

RADIO_DEG = 0.01          # el objeto tiene que caer dentro del archivo, no basta con rozarlo
MJD_REFERENCIA = 61000.0  # 2025-11-10, mitad de la misión hasta hoy: centra la búsqueda
HUECO_ENTRE_PASADAS_DIAS = 30.0
HUECO_ENTRE_VISITAS_DIAS = 0.5


def agrupar(valores: np.ndarray, hueco: float) -> list[list[float]]:
    """Agrupa valores ordenados cuando la separación entre consecutivos es menor que `hueco`."""
    v = np.sort(valores)
    grupos: list[list[float]] = [[v[0]]]
    for x in v[1:]:
        if x - grupos[-1][-1] > hueco:
            grupos.append([x])
        else:
            grupos[-1].append(x)
    return grupos


def main() -> None:
    asegurar_carpetas()
    svc = pyvo.dal.SIA2Service(SIA2_URL)
    resumen = {"consultado_el": time.strftime("%Y-%m-%d %H:%M"), "radio_deg": RADIO_DEG,
               "mjd_referencia_posicion": MJD_REFERENCIA, "campos": {}}

    for campo in cargar_campos():
        ra, dec = posicion_en(campo, MJD_REFERENCIA)
        print(f"\n== {campo['nombre']}  RA={ra:.5f} Dec={dec:.5f}")
        tablas, por_coleccion, tiempos = [], {}, {}
        for col in COLECCIONES:
            t0 = time.time()
            try:
                tab = svc.search(pos=(ra, dec, RADIO_DEG), collection=col).to_table()
            except Exception as e:  # noqa: BLE001 — en un EDA se reporta y se sigue
                print(f"  {col}: ERROR {e}")
                por_coleccion[col] = f"error: {e}"
                continue
            tiempos[col] = round(time.time() - t0, 2)
            por_coleccion[col] = len(tab)
            print(f"  {col}: {len(tab)} filas en {tiempos[col]} s")
            if len(tab):
                tab["coleccion"] = col
                tablas.append(tab)

        if not tablas:
            resumen["campos"][campo["id"]] = {"filas": por_coleccion, "vacio": True}
            continue

        t = vstack(tablas, metadata_conflicts="silent")
        t.write(CACHE / f"sia2_{campo['id']}.ecsv", overwrite=True)

        # Clave de un archivo: apuntado + detector. Sirve para ver si DR1 y QR3 repiten archivos.
        clave = [f"{o}|{b}" for o, b in zip(t["obs_id"], t["energy_bandpassname"])]
        claves_por_col = defaultdict(set)
        for k, c in zip(clave, t["coleccion"]):
            claves_por_col[c].add(k)
        solape = len(claves_por_col["spherex_dr1"] & claves_por_col["spherex_qr3"])

        detectores = Counter(t["energy_bandpassname"])
        apuntados = sorted(set(t["obs_id"]))
        tmin = np.array(t["t_min"], dtype=float)
        pasadas = agrupar(tmin, HUECO_ENTRE_PASADAS_DIAS)
        detalle_pasadas = []
        for p in pasadas:
            sel = (tmin >= p[0]) & (tmin <= p[-1])
            visitas = agrupar(tmin[sel], HUECO_ENTRE_VISITAS_DIAS)
            detalle_pasadas.append({
                "desde": round(mjd_a_anio(p[0]), 3), "hasta": round(mjd_a_anio(p[-1]), 3),
                "duracion_dias": round(p[-1] - p[0], 1),
                "archivos": int(sel.sum()),
                "apuntados": len(set(np.array(t["obs_id"])[sel])),
                "visitas": len(visitas),
                "por_detector": dict(sorted(Counter(np.array(t["energy_bandpassname"])[sel]).items())),
                "colecciones": dict(Counter(np.array(t["coleccion"])[sel])),
            })

        r = {
            "ra_busqueda": round(ra, 6), "dec_busqueda": round(dec, 6),
            "filas": por_coleccion, "segundos_consulta": tiempos,
            "archivos_repetidos_dr1_y_qr3": solape,
            "archivos_total": len(t), "apuntados_distintos": len(apuntados),
            "por_detector": dict(sorted(detectores.items())),
            "primera_fecha": round(mjd_a_anio(tmin.min()), 3),
            "ultima_fecha": round(mjd_a_anio(tmin.max()), 3),
            "base_temporal_anios": round((tmin.max() - tmin.min()) / 365.25, 2),
            "pasadas": detalle_pasadas,
            "tamano_mef_mb_mediana": round(float(np.median(t["access_estsize"])) / 1024, 1),
            "escala_pixel_arcsec": sorted(set(float(x) for x in t["s_pixel_scale"])),
            "exposicion_s_mediana": round(float(np.median(t["t_exptime"])), 1),
        }
        resumen["campos"][campo["id"]] = r
        print(json.dumps({k: r[k] for k in ("archivos_total", "apuntados_distintos",
                                            "por_detector", "base_temporal_anios")}, ensure_ascii=False))
        for p in detalle_pasadas:
            print(f"   pasada {p['desde']}–{p['hasta']}: {p['archivos']} archivos, "
                  f"{p['apuntados']} apuntados, {p['visitas']} visitas")

    salida = RESULTADOS / "inventario.json"
    salida.write_text(json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nResumen en {salida}")


if __name__ == "__main__":
    main()
