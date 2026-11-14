"""Header de la extensión IMAGE de un MEF remoto, sin bajar el archivo (HTTP Range ~35 KB)."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor

from astropy.io import fits

from . import cache
from .config import BYTES_CABECERA, CABECERAS_EN_PARALELO
from .descarga import pedir


def parsear_cabecera(datos: bytes) -> fits.Header:
    texto = datos.decode("ascii", errors="replace")
    fin_primario = texto.index("END" + " " * 77) + 80
    inicio = ((fin_primario + 2879) // 2880) * 2880
    return fits.Header.fromstring(texto[inicio:], sep="")


def cabecera_imagen(url: str) -> dict:
    """Fecha, WCS del cielo y detector de un archivo. Cacheado en disco."""
    nombre = f"{cache.clave(url)}.json"
    hit = cache.leer_json("cabeceras", nombre)
    if hit is not None:
        return hit
    r = pedir(url, headers={"Range": f"bytes=0-{BYTES_CABECERA - 1}"})
    h = parsear_cabecera(r.content)
    datos = {k: (h[k] if isinstance(h[k], (int, float, str)) else str(h[k]))
             for k in h.keys() if k and k not in ("COMMENT", "HISTORY")}
    cache.guardar_json("cabeceras", nombre, datos)
    return datos


def cabeceras_para(urls: list[str]) -> list[dict]:
    with ThreadPoolExecutor(max_workers=CABECERAS_EN_PARALELO) as ex:
        return list(ex.map(cabecera_imagen, urls))
