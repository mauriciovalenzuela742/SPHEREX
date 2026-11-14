"""Servidor del prototipo. Ejecutar desde la raíz del repo:

    .venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010

y abrir http://localhost:8010
"""

from __future__ import annotations

import math
from datetime import date
from pathlib import Path

import yaml
from astropy.time import Time
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import spherex

AQUI = Path(__file__).resolve().parent
CAMPOS = spherex.RAIZ / "data" / "campos_de_prueba.yml"

app = FastAPI(title="Prototipo SPHEREx: rango de fechas + resta", version="0.1.0")
app.mount("/static", StaticFiles(directory=AQUI / "static"), name="static")


def _validar(ra: float, dec: float, banda: int, inicio: str, fin: str) -> None:
    if not (0 <= ra < 360):
        raise HTTPException(422, "RA debe estar en grados, entre 0 y 360 (no en horas).")
    if not (-90 <= dec <= 90):
        raise HTTPException(422, "Dec debe estar entre -90 y 90 grados.")
    if banda not in spherex.BANDAS_UM:
        raise HTTPException(422, "La banda debe ser 1–6.")
    try:
        if spherex.fecha_a_mjd(inicio) >= spherex.fecha_a_mjd(fin):
            raise HTTPException(422, "La fecha inicial debe ser anterior a la final.")
    except ValueError:
        raise HTTPException(422, "Fechas en formato AAAA-MM-DD.")


@app.get("/")
def inicio() -> FileResponse:
    return FileResponse(AQUI / "static" / "index.html")


@app.get("/explorar")
def explorar() -> FileResponse:
    return FileResponse(AQUI / "static" / "explorar.html")


def _bandas(texto: str) -> list[int]:
    try:
        bandas = sorted({int(x) for x in texto.split(",") if x.strip()})
    except ValueError:
        raise HTTPException(422, "Bandas separadas por comas, p. ej. 1,2,5.")
    if not bandas or any(b not in spherex.BANDAS_UM for b in bandas):
        raise HTTPException(422, "Las bandas deben estar entre 1 y 6.")
    return bandas


@app.get("/api/grid")
def api_grid(
    ra: float, dec: float, bands: str = "1,2,3,4,5,6", start: str = "2025-04-01", end: str = date.today().isoformat()
) -> dict:
    """Rejilla bandas × fechas: qué visitas hay. Rápido (solo SIA2, sin imágenes)."""
    bandas = _bandas(bands)
    _validar(ra, dec, bandas[0], start, end)
    try:
        return spherex.rejilla(ra, dec, bandas, start, end)
    except Exception as e:
        raise HTTPException(502, f"Fallo al consultar IRSA: {e}")


@app.get("/api/frame")
def api_frame(
    ra: float,
    dec: float,
    band: int,
    visit: int,
    start: str = "2025-04-01",
    end: str = date.today().isoformat(),
    size: float = Query(0.1, gt=0.005, le=0.5),
    per_visit: int = Query(1, ge=1, le=10),
) -> dict:
    """Un fotograma (floats en base64) de una visita de una banda. Lo lento: pide recortes a IRSA."""
    _validar(ra, dec, band, start, end)
    try:
        return spherex.fotograma_visita(ra, dec, band, start, end, visit, size, per_visit)
    except IndexError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(502, f"Fallo al preparar el fotograma: {e}")


@app.get("/api/presets")
def presets(epoca: float | None = Query(None, description="Año decimal al que propagar")) -> dict:
    """Los cinco campos de prueba, con la posición propagada por movimiento propio.
    Sin propagar, Barnard (≈270″ desde J2000) queda fuera de un recorte de 0,1°."""
    if epoca is None:
        epoca = Time.now().decimalyear
    datos = yaml.safe_load(CAMPOS.read_text(encoding="utf-8"))
    out = []
    for c in datos["campos"]:
        dt = epoca - 2000.0
        dec = c["dec_deg"] + c.get("pmdec", 0) * dt / 3.6e6
        ra = c["ra_deg"] + c.get("pmra", 0) * dt / 3.6e6 / math.cos(math.radians(c["dec_deg"]))
        out.append(
            {
                "id": c["id"],
                "nombre": c["nombre"],
                "ra": round(ra % 360, 6),
                "dec": round(dec, 6),
                "banda": c.get("banda_recomendada", 3),
                "size": c.get("size_recomendado_deg", 0.1),
                "que_demuestra": c.get("que_demuestra", ""),
                "epoca": round(epoca, 3),
            }
        )
    return {"epoca": round(epoca, 3), "campos": out}


@app.get("/api/epochs")
def api_epochs(
    ra: float, dec: float, band: int = 3, start: str = "2025-04-01", end: str = date.today().isoformat()
) -> dict:
    _validar(ra, dec, band, start, end)
    try:
        return spherex.epocas(ra, dec, band, start, end)
    except Exception as e:
        raise HTTPException(502, f"Fallo al consultar IRSA: {e}")


@app.get("/api/frames")
def api_frames(
    ra: float,
    dec: float,
    band: int = 3,
    start: str = "2025-04-01",
    end: str = date.today().isoformat(),
    size: float = Query(0.1, gt=0.005, le=0.5),
    max_visits: int = Query(8, ge=2, le=20),
    per_visit: int = Query(1, ge=1, le=10, description="Exposiciones sumadas por visita"),
) -> dict:
    _validar(ra, dec, band, start, end)
    try:
        return spherex.fotogramas(ra, dec, band, start, end, size, max_visits, per_visit)
    except Exception as e:
        raise HTTPException(502, f"Fallo al preparar los fotogramas: {e}")
