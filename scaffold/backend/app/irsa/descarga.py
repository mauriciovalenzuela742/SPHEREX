"""GET con reintentos. El servicio de cutouts de IRSA devolvió 503 transitorios en el EDA."""
from __future__ import annotations

import time

import httpx

from .config import offline

_CLIENTE = httpx.Client(
    timeout=180, headers={"User-Agent": "spherex-visor/0.1 (hackaton NASA Space Apps)"})


class IrsaNoDisponible(RuntimeError):
    pass


def pedir(url: str, reintentos: int = 4, espera: float = 2.0, **kw) -> httpx.Response:
    if offline():
        raise IrsaNoDisponible("OFFLINE=1: no se consulta IRSA")
    ultimo = None
    for i in range(reintentos):
        try:
            r = _CLIENTE.get(url, **kw)
            if r.status_code in (200, 206):
                return r
            ultimo = f"HTTP {r.status_code}"
        except httpx.HTTPError as e:
            ultimo = str(e)
        time.sleep(espera * (i + 1))
    raise IrsaNoDisponible(f"{url}: {ultimo}")
