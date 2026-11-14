# Entrada para Vercel: equivale a `uvicorn app.main:app` desde scaffold/backend.
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "scaffold" / "backend"))
from app.main import app  # noqa: E402,F401

