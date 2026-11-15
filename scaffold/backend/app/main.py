"""Esqueleto genérico de backend. No contiene lógica del desafío."""

import os
import re

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app import demo
from app.irsa import cache
from app.irsa.config import COLECCIONES
from app.irsa.sia2 import buscar_epocas, filtrar_fechas

VERSION = "0.4.2"

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
@app.get("/api/grid")
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
    # Los 5 campos de la demo salen del paquete precalculado (sin tocar IRSA).
    base = demo.epocas(ra, dec, size) if cols == COLECCIONES else None
    try:
        lista = filtrar_fechas(base if base is not None else buscar_epocas(ra, dec, size, cols),
                               desde, hasta)
    except cache.FueraDeCache as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    salida = [{"id": e["id"], "t": e["t"], "t_mjd": e.get("t_mjd", 0.0),
               "band": _banda(e["detector"]), "detector": e["detector"],
               "collection": e["collection"], "access_url": e["access_url"],
               "pixel_scale_arcsec": e.get("pixel_scale_arcsec", 6.15)} for e in lista]

    # Construir estructura de visitas agrupada por banda (formato que espera el frontend)
    visitas_por_banda: dict[str, list[dict]] = {}
    pixel_scale = 6.15
    for e in salida:
        b = e["band"]
        if b is not None:
            clave_b = str(b)
            lst = visitas_por_banda.setdefault(clave_b, [])
            if e["pixel_scale_arcsec"]:
                pixel_scale = e["pixel_scale_arcsec"]
            lst.append({
                "id": e["id"],
                "mjd": e["t_mjd"],
                "start": e["t"],   # ISO string, e.g. "2025-05-05T16:48:02Z"
                "n": 1,            # 1 exposición por época
            })

    bands_list = sorted(int(b) for b in visitas_por_banda)

    # Construir columns: una columna por fecha, con índice de visita por banda
    dates_seen: dict[str, dict[str, int]] = {}
    for b_str, vlist in visitas_por_banda.items():
        for v_idx, v in enumerate(vlist):
            date_str = v["start"][:10]
            if date_str not in dates_seen:
                dates_seen[date_str] = {}
            if b_str not in dates_seen[date_str]:
                dates_seen[date_str][b_str] = v_idx

    columns = [
        {"date": d, "celdas": celdas}
        for d, celdas in sorted(dates_seen.items())
    ]

    return {
        "ra": ra, "dec": dec, "size": size, "n_epochs": len(salida),
        "time_range": [salida[0]["t"], salida[-1]["t"]] if salida else None,
        # Formato que espera el frontend:
        "bands": bands_list,
        "visits": visitas_por_banda,
        "columns": columns,
        "pixel_scale_arcsec": pixel_scale,
        # Compatibilidad hacia atrás:
        "bands_available": bands_list,
        "epochs": salida,
        "source": "precalculado" if base is not None else "vivo",
    }


@app.get("/api/demo")
def api_demo() -> dict:
    """Los campos precalculados (los 5 de la demo) y sus parámetros; vacío si no hay paquete."""
    return {"campos": demo.manifiesto()}


@app.get("/api/frames")
@app.get("/api/frame")
def frames(
    ra: float = Query(ge=0, lt=360),
    dec: float = Query(ge=-90, le=90),
    size: float = Query(0.1, gt=0.005, le=0.5),
    band: int = Query(4, ge=1, le=6),
    stretch: str = Query("asinh", pattern="^(asinh|linear)$"),
    mode: str = Query(
        "zodi_subtracted", pattern="^(zodi_subtracted|raw|diff_first|diff_prev|coadd|coadd_diff)$"
    ),
    desde: str | None = Query(None, alias="from"),
    hasta: str | None = Query(None, alias="to"),
    per_visit: int = Query(1, ge=1, le=10),
    budget_s: float = Query(8.0, gt=0, le=55),
    epochs: str | None = None,
    vmin: float | None = None,
    vmax: float | None = None,
    fast: bool = True,
    max_per_sweep: int = Query(40, ge=1, le=200),
) -> dict:
    """Un fotograma por visita (o por barrido con mode=coadd/coadd_diff), alineado norte-arriba (D2).
    Respuesta parcial: ver `pending` (docs/03)."""
    from app.frames.servicio import fotogramas
    from app.irsa.descarga import IrsaNoDisponible

    # Parámetros por defecto de la demo sobre uno de los 5 campos: respuesta precalculada.
    if (stretch == "asinh" and desde is None and hasta is None and per_visit == 1
            and not epochs and vmin is None and vmax is None):
        previa = demo.fotogramas(ra, dec, size, band, mode)
        if previa is not None:
            return previa
    try:
        vivo = fotogramas(ra, dec, size, band, mode, stretch, desde, hasta, per_visit, budget_s,
                          [e for e in epochs.split(",") if e] if epochs else None, vmin, vmax, fast,
                          max_per_sweep)
        return {**vivo, "source": "vivo"}
    except (cache.FueraDeCache, IrsaNoDisponible) as e:
        raise HTTPException(status_code=503, detail=f"IRSA no está disponible ahora: {e}") from e


@app.get("/api/spectrum")
def spectrum(
    ra: float = Query(ge=0, lt=360),
    dec: float = Query(ge=-90, le=90),
    aperture: float = Query(12.0, gt=2, le=60, description="Radio de la apertura en segundos de arco"),
    desde: str | None = Query(None, alias="from"),
    hasta: str | None = Query(None, alias="to"),
    bands: str = "1,2,3,4,5,6",
    max_points: int = Query(120, ge=6, le=600),
    budget_s: float = Query(8.0, gt=0, le=55),
    epochs: str | None = None,
    pmra: float | None = Query(None, description="mas/año, con cos δ; activa la propagación"),
    pmdec: float | None = Query(None, description="mas/año"),
    epoch: float = Query(2000.0, description="Año decimal de ra/dec (si se dan pmra/pmdec)"),
) -> dict:
    """Espectro de una posición: un punto (λ, flujo) por exposición de nivel 2 (D2). Ver docs/03."""
    from app.irsa.descarga import IrsaNoDisponible
    from app.spectrum.servicio import espectro

    try:
        bandas = sorted({int(b) for b in bands.split(",") if b.strip()})
    except ValueError as e:
        raise HTTPException(status_code=422, detail="bands: números del 1 al 6 separados por comas") from e
    if not bandas or any(b < 1 or b > 6 for b in bandas):
        raise HTTPException(status_code=422, detail="bands: números del 1 al 6 separados por comas")
    try:
        return espectro(ra, dec, aperture, desde, hasta, bandas, max_points, budget_s,
                        [e for e in epochs.split(",") if e] if epochs else None, pmra, pmdec, epoch)
    except (cache.FueraDeCache, IrsaNoDisponible) as e:
        raise HTTPException(status_code=503, detail=f"IRSA no está disponible ahora: {e}") from e
