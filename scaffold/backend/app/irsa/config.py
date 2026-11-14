"""Rutas y constantes del acceso a IRSA. Todo lo verificable viene del EDA (docs/09)."""
from __future__ import annotations

import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[4]
# Los FITS nunca se versionan: data/cache/ está en .gitignore (AGENTS.md, regla 6).
CACHE = Path(os.getenv("SPHEREX_CACHE", RAIZ / "data" / "cache" / "api"))
CAMPOS_YML = RAIZ / "data" / "campos_de_prueba.yml"

SIA2_URL = "https://irsa.ipac.caltech.edu/SIA"
COLECCIONES = ("spherex_dr1", "spherex_qr3")   # DR1 y QR3 no repiten archivos (EDA §1)
RADIO_BUSQUEDA_DEG = 0.01                      # el objeto debe caer dentro del archivo

BYTES_CABECERA = 34560        # primario + header IMAGE con margen (EDA, Range de ~35 KB)
CABECERAS_EN_PARALELO = 6
CUTOUTS_EN_PARALELO = 4       # más de 4 provoca 503 en el servicio de IRSA (EDA §8)
REINTENTOS_CUTOUT = 6
SIZE_CUTOUT_DEG = 0.1

# OFFLINE=1: nunca se toca internet; lo que no está en caché es un error explícito.
def offline() -> bool:
    return os.getenv("OFFLINE", "") == "1"
