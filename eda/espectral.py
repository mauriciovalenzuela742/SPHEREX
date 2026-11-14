"""Lectura de la longitud de onda por píxel (extensión WCS-WAVE) sin bajar el MEF entero.

Hallazgo del EDA que hace posible esto: la tabla WCS-WAVE sale de un archivo de calibración
por detector (`spectral_wcs_<D>_v*.fits`, ver HISTORY del header). Es decir, el mapa
píxel → λ es FIJO para cada detector. Entonces, para saber en qué λ se observó un objeto en un
archivo basta con:

1. la tabla WCS-WAVE del detector (se saca una vez, de un cutout pequeño), y
2. el header de la extensión IMAGE del archivo (sus primeros ~35 KB, con una petición HTTP Range),
   que da el WCS del cielo y la fecha.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
import requests
from astropy.io import fits
from astropy.wcs import WCS

from comun import CACHE

BYTES_CABECERA = 34560  # 12 bloques FITS: primario (1) + header IMAGE (8) con margen
SESION = requests.Session()
SESION.headers["User-Agent"] = "spherex-eda/0.1 (hackaton NASA Space Apps)"


def pedir(url: str, reintentos: int = 4, **kw) -> requests.Response:
    """GET con reintentos: el servicio de cutouts devolvió 503 transitorios durante el EDA."""
    ultimo = None
    for i in range(reintentos):
        try:
            r = SESION.get(url, timeout=180, **kw)
            if r.status_code in (200, 206):
                return r
            ultimo = f"HTTP {r.status_code}"
        except requests.RequestException as e:
            ultimo = str(e)
        time.sleep(2 * (i + 1))
    raise RuntimeError(f"{url}: {ultimo}")


def cabecera_imagen(url: str) -> fits.Header:
    """Header de la extensión IMAGE (HDU 1) de un MEF remoto, con una petición Range."""
    r = pedir(url, headers={"Range": f"bytes=0-{BYTES_CABECERA - 1}"})
    datos = r.content
    # Saltar el header primario (termina en el primer bloque con END)
    texto = datos.decode("ascii", errors="replace")
    fin_primario = texto.index("END" + " " * 77) + 80
    inicio = ((fin_primario + 2879) // 2880) * 2880
    return fits.Header.fromstring(texto[inicio:], sep="")


def tabla_onda(cutout: fits.HDUList) -> dict:
    """Extrae la grilla de puntos de control de WCS-WAVE (X, Y en píxeles del detector, 1-based)."""
    t = cutout["WCS-WAVE"].data[0]
    valores = np.asarray(t["VALUES"], dtype=float)          # forma (ny, nx, 2): [iy][ix][λ, Δλ]
    historia = [str(h) for h in cutout["WCS-WAVE"].header.get("HISTORY", [])]
    return {"x": np.asarray(t["X"], float).tolist(), "y": np.asarray(t["Y"], float).tolist(),
            "lam": valores[..., 0].tolist(), "dlam": valores[..., 1].tolist(),
            "calibracion": [h for h in historia if "Calibration" in h]}


def bilineal(grid: dict, clave: str, X: float, Y: float) -> float:
    """Interpola bilinealmente la grilla en coordenadas de detector 1-based (X, Y)."""
    xs, ys, v = np.array(grid["x"]), np.array(grid["y"]), np.array(grid[clave])
    if not (xs[0] <= X <= xs[-1] and ys[0] <= Y <= ys[-1]):
        return float("nan")
    i = min(np.searchsorted(xs, X, side="right") - 1, len(xs) - 2)
    j = min(np.searchsorted(ys, Y, side="right") - 1, len(ys) - 2)
    fx = (X - xs[i]) / (xs[i + 1] - xs[i])
    fy = (Y - ys[j]) / (ys[j + 1] - ys[j])
    return float((1 - fx) * (1 - fy) * v[j, i] + fx * (1 - fy) * v[j, i + 1]
                 + (1 - fx) * fy * v[j + 1, i] + fx * fy * v[j + 1, i + 1])


def wcs_onda_astropy(cutout: fits.HDUList) -> WCS:
    """WCS alternativo 'W' (WAVE-TAB) leído por astropy, quitando los SIP del cielo.

    Si no se quitan, astropy aplica la distorsión SIP del WCS del cielo también al eje de λ y
    avisa con un INFO. Solo se usa para validar `bilineal` contra una implementación independiente.
    """
    h = cutout["IMAGE"].header.copy()
    for k in list(h.keys()):
        if k.split("_")[0] in ("A", "B", "AP", "BP") and "_" in k:
            del h[k]
    return WCS(h, fobj=cutout, key="W")


def grilla_detector(detector: int, url_muestra: str, ra: float, dec: float) -> dict:
    """Grilla WCS-WAVE de un detector, cacheada en disco."""
    destino = CACHE / f"wcs_wave_D{detector}.json"
    if destino.exists():
        return json.loads(destino.read_text())
    r = pedir(url_muestra, params={"center": f"{ra},{dec}", "size": 0.02})
    ruta = CACHE / "fits" / f"muestra_D{detector}.fits"
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_bytes(r.content)
    with fits.open(ruta) as hl:
        g = tabla_onda(hl)
        # Autovalidación: la interpolación propia tiene que coincidir con astropy en el centro.
        h = hl["IMAGE"].header
        ny, nx = hl["IMAGE"].data.shape
        xc, yc = nx // 2, ny // 2
        lam_astropy = float(wcs_onda_astropy(hl).pixel_to_world_values(xc, yc)[0])
        X = (xc + 1) - h["CRPIX1W"] + h["CRVAL1W"]
        Y = (yc + 1) - h["CRPIX2W"] + h["CRVAL2W"]
        g["validacion"] = {"lam_propia": bilineal(g, "lam", X, Y), "lam_astropy": lam_astropy}
    destino.write_text(json.dumps(g))
    return g


def ruta_relativa(p: Path) -> str:
    return str(p).replace("\\", "/")
