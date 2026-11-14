"""Esqueleto genérico de backend. No contiene lógica del desafío."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
