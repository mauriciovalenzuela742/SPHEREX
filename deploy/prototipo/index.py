# Entrada para Vercel: equivale a `uvicorn --app-dir prototipos/rango_fechas servidor:app`.
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "prototipos" / "rango_fechas"))
from servidor import app  # noqa: E402,F401
