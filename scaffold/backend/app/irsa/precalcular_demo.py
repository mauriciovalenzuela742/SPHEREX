"""Genera el paquete de la demo (`data/demo/`): python -m app.irsa.precalcular_demo.

Requiere red y se corre UNA vez (y de nuevo si cambia un campo o llegan datos nuevos). Por cada uno
de los 5 campos guarda las épocas y las respuestas completas de `/api/frames` (sin `pending`) en la
banda recomendada y en los cuatro modos. `app/demo.py` las sirve después sin tocar IRSA.

Opciones:
  --todas-las-bandas   las 6 bandas en vez de solo la recomendada (≈ ×6 de peso).
  --campo ID           solo ese campo (se puede repetir); el manifiesto conserva los demás.
  --salida DIR         carpeta de salida (por defecto data/demo/).
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path

from app.demo import DIR, MODOS
from app.frames.servicio import fotogramas

from .posicion import cargar_campos, posicion_en
from .precalentar import MJD_REFERENCIA
from .sia2 import buscar_epocas

PRESUPUESTO_S = 900.0     # por llamada: aquí no hay un navegador esperando
INTENTOS = 3              # reintentos si quedan `pending` (cada uno aprovecha lo ya bajado)


def _escribir(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def _completo(ra: float, dec: float, size: float, banda: int, modo: str) -> dict:
    """`fotogramas` repetido hasta que no quede nada pendiente; error si no se logra."""
    for _ in range(INTENTOS):
        r = fotogramas(ra, dec, size, banda, modo, budget_s=PRESUPUESTO_S)
        if not r["pending"]:
            break
    if r["pending"] or r["n_frames"] == 0:
        raise RuntimeError(f"banda {banda} {modo}: {r['n_frames']} fotogramas, "
                           f"pendientes {r['pending']}, avisos {r['warnings']}")
    return r


def generar(salida: Path, solo: set[str], todas_bandas: bool) -> list[dict]:
    previo = {}
    if (salida / "manifest.json").exists():
        previo = {c["id"]: c for c in json.loads((salida / "manifest.json").read_text())["campos"]}
    for campo in cargar_campos():
        if solo and campo["id"] not in solo:
            continue
        ra, dec = (round(v, 6) for v in posicion_en(campo, MJD_REFERENCIA))
        size = float(campo["size_recomendado_deg"])
        bandas = list(range(1, 7)) if todas_bandas else [int(campo["banda_recomendada"])]
        epocas = buscar_epocas(ra, dec, size)
        _escribir(salida / campo["id"] / "epochs.json", epocas)
        n_visitas = 0
        for b in bandas:
            for modo in MODOS:
                r = _completo(ra, dec, size, b, modo)
                n_visitas = max(n_visitas, r["n_visits"])
                _escribir(salida / campo["id"] / f"frames_b{b}_{modo}.json", r)
                print(f"{campo['id']} D{b} {modo}: {r['n_frames']} fotogramas", flush=True)
        previo[campo["id"]] = {
            "id": campo["id"], "nombre": campo["nombre"], "ra": ra, "dec": dec,
            "ra_j2000": campo["ra_deg"], "dec_j2000": campo["dec_deg"], "size": size,
            "bands": bandas, "modes": list(MODOS), "n_epochs": len(epocas), "n_visits": n_visitas,
            "generado": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
    orden = [c["id"] for c in cargar_campos()]
    campos = [previo[i] for i in orden if i in previo]
    _escribir(salida / "manifest.json", {"campos": campos})
    return campos


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--todas-las-bandas", action="store_true")
    p.add_argument("--campo", action="append", default=[])
    p.add_argument("--salida", type=Path, default=DIR)
    a = p.parse_args()
    try:
        generar(a.salida, set(a.campo), a.todas_las_bandas)
    except Exception as e:  # no dejar un paquete a medias sin avisar
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
