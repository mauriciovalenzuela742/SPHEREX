"""EDA 4 — Preguntas de infraestructura que cambian la arquitectura.

1. ¿IRSA responde con CORS? (si no, el navegador no puede pedirle nada directo: todo va por backend)
2. ¿Qué es en realidad el "cubo de todo el cielo" de DR1 y se puede recortar?
3. ¿Hay HiPS de SPHEREx que Aladin Lite pueda cargar? (CDS)

Uso:  .venv/Scripts/python eda/04_infraestructura.py
Salida: eda/resultados/infraestructura.json
"""
from __future__ import annotations

import json
import time

import requests

from comun import RESULTADOS, asegurar_carpetas

ORIGEN = {"Origin": "https://ejemplo-visor.org"}
MEF = ("https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W19_1B/l2b-v27-2026-197/3/"
       "level2_2025W19_1B_0116_1D3_spx_l2b-v27-2026-197.fits")


def probar(nombre, url, **kw):
    t0 = time.time()
    try:
        r = requests.get(url, headers={**ORIGEN, **kw.pop("headers", {})}, timeout=120, **kw)
        return {"prueba": nombre, "url": url, "http": r.status_code,
                "cors": r.headers.get("Access-Control-Allow-Origin"),
                "segundos": round(time.time() - t0, 1), "inicio_respuesta": r.text[:160]
                if "text" in r.headers.get("Content-Type", "") else r.headers.get("Content-Type")}
    except requests.RequestException as e:
        return {"prueba": nombre, "url": url, "error": str(e)[:200]}


def main() -> None:
    asegurar_carpetas()
    pruebas = [
        probar("SIA2 IRSA", "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1"
               "&POS=circle+133.76+-7.24+0.001&MAXREC=1&RESPONSEFORMAT=CSV"),
        probar("MEF IRSA (Range)", MEF, headers={"Range": "bytes=0-2879"}),
        probar("Cubo DR1 por SIA2", "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1_cube"
               "&POS=circle+133.76+-7.24+0.01&RESPONSEFORMAT=CSV"),
        probar("Cutout del cubo DR1", "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/hips5_cube/"
               "hips_20261026/Norder5/Dir10000/Npix10226_cube.fits?center=133.7578,-7.2420&size=0.05"),
        probar("MocServer CDS: HiPS SPHEREx", "https://alasky.cds.unistra.fr/MocServer/query?"
               "expr=ID%3D*SPHEREx*&get=id&fmt=ascii"),
        probar("HiPS CDS SPHEREx D5 properties", "https://alasky.cds.unistra.fr/SPHEREx/D5/properties"),
        probar("HiPS CDS DSS (control)", "https://alasky.cds.unistra.fr/DSS/DSSColor/properties"),
    ]
    for p in pruebas:
        print(f"{p['prueba']:35s} http={p.get('http')} cors={p.get('cors')} "
              f"{p.get('segundos', '')}s {str(p.get('inicio_respuesta', p.get('error')))[:90]!r}")
    (RESULTADOS / "infraestructura.json").write_text(json.dumps(
        {"probado_el": time.strftime("%Y-%m-%d %H:%M"), "pruebas": pruebas},
        ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
