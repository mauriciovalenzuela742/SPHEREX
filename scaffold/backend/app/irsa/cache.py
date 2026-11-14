"""Caché en disco. Sin caché no hay demo (docs/03 §5)."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

from .config import CACHE, offline


class FueraDeCache(RuntimeError):
    """Modo OFFLINE=1 y el dato no está en disco."""


def _redondear(x: float) -> str:
    return f"{round(x, 4):.4f}"          # 1e-4° ≈ 0,36": menos que un píxel de SPHEREx


def clave(*partes: object) -> str:
    return hashlib.sha256("|".join(map(str, partes)).encode()).hexdigest()[:16]


def clave_posicion(ra: float, dec: float, size: float) -> str:
    return f"{_redondear(ra)}_{_redondear(dec)}_{size:g}"


def ruta(tipo: str, nombre: str) -> Path:
    return CACHE / tipo / nombre


def escribir_atomico(destino: Path, contenido: bytes) -> None:
    """Escribe a un temporal y renombra: un lector nunca ve un archivo a medias."""
    destino.parent.mkdir(parents=True, exist_ok=True)
    tmp = destino.with_name(f".{destino.name}.{os.getpid()}.tmp")
    tmp.write_bytes(contenido)
    os.replace(tmp, destino)


def leer_json(tipo: str, nombre: str):
    p = ruta(tipo, nombre)
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    if offline():
        raise FueraDeCache(f"OFFLINE=1 y no hay {tipo}/{nombre} en caché")
    return None


def guardar_json(tipo: str, nombre: str, datos) -> None:
    escribir_atomico(ruta(tipo, nombre), json.dumps(datos, ensure_ascii=False).encode())


def entradas() -> int:
    return sum(1 for p in CACHE.rglob("*") if p.is_file() and not p.name.endswith(".tmp")) if CACHE.exists() else 0
