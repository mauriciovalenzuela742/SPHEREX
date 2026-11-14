"""Esqueleto genérico de backend. No contiene lógica del desafío."""

import os
import re

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.irsa import cache
from app.irsa.config import COLECCIONES
from app.irsa.sia2 import buscar_epocas, filtrar_fechas

VERSION = "0.0.1"

app = FastAPI(
    title="Backend",
    version=VERSION,
    description="Esqueleto. La lógica del proyecto se escribe durante el hackatón.",
)

# En desarrollo se permite el origen del frontend de Vite.
# ANTES DE DESPLEGAR: restringir a los dominios reales.
origenes = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Comprobación de vida. Lo primero que se mira cuando algo falla."""
    return {"ok": True, "version": VERSION}


def _banda(detector: str) -> int | None:
    """Banda 1-6 a partir del nombre del detector (último dígito). NO verificado contra IRSA."""
    m = re.search(r"(\d)\s*$", detector)
    return int(m.group(1)) if m else None


@app.get("/api/health")
def api_health() -> dict:
    return {"ok": True, "version": VERSION, "irsa_reachable": None,
            "cache_entries": cache.entradas()}


@app.get("/api/epochs")
def epochs(
    ra: float = Query(ge=0, le=360),
    dec: float = Query(ge=-90, le=90),
    size: float = Query(0.1, gt=0, le=1),
    collections: str = ",".join(COLECCIONES),
    desde: str | None = Query(None, alias="from"),
    hasta: str | None = Query(None, alias="to"),
) -> dict:
    """Qué observaciones existen para esa posición. No baja imágenes (docs/03)."""
    cols = tuple(c for c in collections.split(",") if c)
    try:
        lista = filtrar_fechas(buscar_epocas(ra, dec, size, cols), desde, hasta)
    except cache.FueraDeCache as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    salida = [{"id": e["id"], "t": e["t"], "band": _banda(e["detector"]), "detector": e["detector"],
               "collection": e["collection"], "access_url": e["access_url"]} for e in lista]
    return {
        "ra": ra, "dec": dec, "size": size, "n_epochs": len(salida),
        "time_range": [salida[0]["t"], salida[-1]["t"]] if salida else None,
        "bands_available": sorted({e["band"] for e in salida if e["band"]}),
        "epochs": salida,
    }
