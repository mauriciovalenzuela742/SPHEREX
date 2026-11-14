"""Del recorte o de los píxeles leídos a un fotograma alineado norte-arriba (D2).

Cada observación viene de un apuntado con otra orientación: sin reproyectar a una rejilla común, el
parpadeo rota. La rejilla de salida es TAN centrada en (ra, dec), 6,15″/px (s_pixel_scale de SIA2).
"""

from __future__ import annotations

import math
import warnings
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from astropy.io import fits
from astropy.wcs import WCS, FITSFixedWarning
from scipy.ndimage import map_coordinates

warnings.simplefilter("ignore", FITSFixedWarning)

ESCALA_ARCSEC = 6.15
HUECO_VISITA_DIAS = 5.0
# SPHEREx vuelve a cada zona cada ~6 meses: visitas separadas por más de esto son otro barrido.
HUECO_BARRIDO_DIAS = 60.0

# FLAGS: las definiciones vienen en la cabecera (MSKNnnnn). SOURCE marca píxeles cerca de una fuente
# conocida y en un campo poblado sale en ~100 %: no es contaminación.
BITS_INFORMATIVOS = {"SOURCE", "FULLSAMPLE", "DICHROIC", "PHANMISS"}
# Defectos de un píxel que se enmascaran. BLOOM/HALO/GHOST/OVERFLOW no, porque vaciarían las estrellas brillantes.
BITS_ENMASCARAR = {"TRANSIENT", "SUR_ERROR", "NONFUNC", "MISSING_DATA", "HOT", "COLD", "OUTLIER"}


@dataclass
class Fotograma:
    epoch_id: str
    t: str
    t_mjd: float
    collection: str
    datos: np.ndarray  # MJy/sr con el fondo en 0; NaN = fuera del detector
    cobertura: np.ndarray  # True donde el recorte tiene detector
    wavelength_um: float | None
    bandwidth_um: float | None
    flagged_fraction: float | None  # None: el lector rápido no lee FLAGS
    method: str  # "rangos" | "recortes"
    n_stacked: int = 1
    avisos: list[str] = field(default_factory=list)
    varianza: np.ndarray | None = (
        None  # (MJy/sr)² reproyectada; solo si se pidió (suma por barrido)
    )


def n_pixeles(size_deg: float) -> int:
    return max(8, int(math.ceil(size_deg * 3600 / ESCALA_ARCSEC)))


def wcs_destino(ra: float, dec: float, n: int) -> WCS:
    w = WCS(naxis=2)
    w.wcs.ctype = ["RA---TAN", "DEC--TAN"]
    w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2.0, (n + 1) / 2.0]
    s = ESCALA_ARCSEC / 3600.0
    w.wcs.cdelt = [-s, s]  # este a la izquierda, norte arriba
    return w


def coordenadas_entrada(w_in: WCS, ra: float, dec: float, n: int) -> tuple[np.ndarray, np.ndarray]:
    """Píxel (0-based) de la imagen de entrada que corresponde a cada píxel de la rejilla de salida."""
    yy, xx = np.mgrid[0:n, 0:n]
    ra_o, dec_o = wcs_destino(ra, dec, n).wcs_pix2world(xx, yy, 0)
    return w_in.all_world2pix(ra_o, dec_o, 0)  # incluye SIP


def reproyectar(
    img: np.ndarray,
    xi: np.ndarray,
    yi: np.ndarray,
    x0: int = 0,
    y0: int = 0,
    forma_total: tuple[int, int] | None = None,
) -> tuple[np.ndarray, np.ndarray]:
    """Interpola `img` (que empieza en el píxel x0, y0 del detector) en las coordenadas xi, yi."""
    n = xi.shape[0]
    valido = np.isfinite(img)
    coords = [yi.ravel() - y0, xi.ravel() - x0]
    rep = map_coordinates(np.where(valido, img, 0.0), coords, order=1, cval=np.nan).reshape(n, n)
    peso = map_coordinates(valido.astype(float), coords, order=1, cval=0.0).reshape(n, n)
    rep[peso < 0.99] = np.nan
    ny, nx = forma_total or img.shape
    cob = (xi >= 0) & (xi <= nx - 1) & (yi >= 0) & (yi <= ny - 1)
    return rep, cob


def lambda_en(
    cab: fits.Header, xs: np.ndarray, ys: np.ndarray, vals: np.ndarray, x_det: float, y_det: float
) -> tuple[float, float]:
    """λ y ancho (µm) en el píxel (0-based) del detector, desde la tabla WCS-WAVE.

    La cabecera de IMAGE trae un WCS alternativo «W» (WAVE-TAB):
      coordenada de la tabla = (píxel 1-based − CRPIXnW) · CDELTnW + CRVALnW
    y la tabla, una rejilla de control X, Y con VALUES[y, x, (λ, ancho)]. Interpolación bilineal.
    """
    cx = (x_det + 1 - cab["CRPIX1W"]) * cab.get("CDELT1W", 1) + cab.get("CRVAL1W", 1)
    cy = (y_det + 1 - cab["CRPIX2W"]) * cab.get("CDELT2W", 1) + cab.get("CRVAL2W", 1)
    fx = np.interp(cx, xs, np.arange(len(xs)))
    fy = np.interp(cy, ys, np.arange(len(ys)))
    lam = float(map_coordinates(vals[..., 0], [[fy], [fx]], order=1)[0])
    ancho = float(map_coordinates(vals[..., 1], [[fy], [fx]], order=1)[0])
    return lam, ancho


def definiciones_flags(cab: fits.Header) -> dict[int, str]:
    return {
        int(k[4:]): str(cab[k]).strip() for k in cab if k.startswith("MSKN") and k[4:].isdigit()
    }


def desde_cutout(ruta: Path, epoca: dict, banda: int, ra: float, dec: float, n: int) -> Fotograma:
    """Respaldo: recorte del servicio de IRSA (más lento, pero trae FLAGS y ZODI)."""
    with fits.open(ruta) as h:
        img = h["IMAGE"].data.astype(float) - h["ZODI"].data.astype(float)
        cab = h["IMAGE"].header
        w_in = WCS(cab)
        t = h["WCS-WAVE"].data
        xs, ys = np.asarray(t["X"][0], float), np.asarray(t["Y"][0], float)
        vals = np.asarray(t["VALUES"][0], float)
        flags = h["FLAGS"].data.astype(np.int64)
        defs = definiciones_flags(h["FLAGS"].header)
        var = h["VARIANCE"].data.astype(float) if "VARIANCE" in h else None
    contaminado = np.zeros(flags.shape, bool)
    enmascarar = np.zeros(flags.shape, bool)
    for bit, nombre in defs.items():
        m = ((flags >> bit) & 1).astype(bool)
        if nombre not in BITS_INFORMATIVOS:
            contaminado |= m
        if nombre in BITS_ENMASCARAR:
            enmascarar |= m
    img = np.where(enmascarar, np.nan, img)
    xi, yi = coordenadas_entrada(w_in, ra, dec, n)
    rep, cob = reproyectar(img, xi, yi)
    rep -= np.nanmedian(rep)
    rep = np.where(np.isnan(rep) & cob, 0.0, rep)  # enmascarado dentro del detector -> fondo
    var_rep = None
    if var is not None:  # los píxeles enmascarados quedan sin peso (varianza infinita)
        var_rep = reproyectar(np.where(enmascarar, np.nan, var), xi, yi)[0]
    xt, yt = w_in.all_world2pix([[ra, dec]], 0)[0]
    lam, ancho = lambda_en(cab, xs, ys, vals, xt, yt)
    return Fotograma(
        f"{epoca['id']}D{banda}",
        epoca["t"],
        epoca["t_mjd"],
        epoca["collection"],
        rep,
        cob,
        lam,
        ancho,
        float(contaminado.mean()),
        "recortes",
        varianza=var_rep,
    )


def agrupar_visitas(epocas: list[dict], hueco: float = HUECO_VISITA_DIAS) -> list[list[dict]]:
    """Una visita = exposiciones separadas por menos de `hueco` días (épocas ya ordenadas)."""
    visitas: list[list[dict]] = []
    for e in sorted(epocas, key=lambda e: e["t_mjd"]):
        if visitas and e["t_mjd"] - visitas[-1][-1]["t_mjd"] <= hueco:
            visitas[-1].append(e)
        else:
            visitas.append([e])
    return visitas


def del_centro(visita: list[dict], k: int) -> list[dict]:
    """Las k exposiciones más cercanas al centro de la visita, en orden temporal."""
    c = len(visita) // 2
    idx = sorted(sorted(range(len(visita)), key=lambda i: abs(i - c))[: max(1, k)])
    return [visita[i] for i in idx]


def apilar(fs: list[Fotograma]) -> Fotograma:
    """Mediana de varias exposiciones de una visita: más señal y sin rayos cósmicos."""
    if len(fs) == 1:
        return fs[0]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        datos = np.nanmedian(np.stack([f.datos for f in fs]), axis=0)
    centro = fs[len(fs) // 2]
    lams = [f.wavelength_um for f in fs if f.wavelength_um is not None]
    anchos = [f.bandwidth_um for f in fs if f.bandwidth_um is not None]
    flags = [f.flagged_fraction for f in fs if f.flagged_fraction is not None]
    return Fotograma(
        centro.epoch_id,
        centro.t,
        centro.t_mjd,
        centro.collection,
        datos,
        np.logical_or.reduce([f.cobertura for f in fs]),
        float(np.mean(lams)) if lams else None,
        float(np.mean(anchos)) if anchos else None,
        float(np.mean(flags)) if flags else None,
        "rangos" if all(f.method == "rangos" for f in fs) else "recortes",
        n_stacked=len(fs),
        avisos=sum((f.avisos for f in fs), []),
    )


def agrupar_barridos(epocas: list[dict], hueco: float = HUECO_BARRIDO_DIAS) -> list[list[dict]]:
    """Un barrido = el paso de SPHEREx por la zona (~6 meses entre uno y otro); junta sus visitas."""
    return agrupar_visitas(epocas, hueco)


def ruido_robusto(d: np.ndarray) -> float:
    """σ estimado con la mediana de las desviaciones absolutas (respaldo si no hay VARIANCE)."""
    v = d[np.isfinite(d)]
    if v.size < 10:
        return float("nan")
    return float(1.4826 * np.median(np.abs(v - np.median(v))))


def sumar_ponderado(fs: list[Fotograma]) -> tuple[Fotograma, np.ndarray]:
    """Suma pesada por 1/σ² píxel a píxel: Σ(d/σ²) / Σ(1/σ²). Devuelve el fotograma y su varianza
    (1/Σ(1/σ²)). Sin VARIANCE para alguna exposición, se usa σ² uniforme estimado con la MAD."""
    num = np.zeros_like(fs[0].datos)
    den = np.zeros_like(fs[0].datos)
    sin_varianza = 0
    for f in fs:
        if f.varianza is not None:
            var = f.varianza
        else:
            sin_varianza += 1
            var = np.full_like(f.datos, ruido_robusto(f.datos) ** 2)
        ok = np.isfinite(f.datos) & np.isfinite(var) & (var > 0)
        w = np.where(ok, 1.0 / np.where(ok, var, 1.0), 0.0)
        num += np.where(ok, f.datos, 0.0) * w
        den += w
    with np.errstate(invalid="ignore", divide="ignore"):
        datos = np.where(den > 0, num / den, np.nan)
        var_total = np.where(den > 0, 1.0 / den, np.nan)
    datos -= np.nanmedian(datos)
    centro = fs[len(fs) // 2]
    lams = [f.wavelength_um for f in fs if f.wavelength_um is not None]
    anchos = [f.bandwidth_um for f in fs if f.bandwidth_um is not None]
    avisos = sum((f.avisos for f in fs), [])
    if sin_varianza:
        avisos.append(
            f"{centro.epoch_id}: {sin_varianza} exposiciones sin VARIANCE; peso por ruido estimado."
        )
    suma = Fotograma(
        centro.epoch_id,
        centro.t,
        centro.t_mjd,
        centro.collection,
        datos,
        np.logical_or.reduce([f.cobertura for f in fs]),
        float(np.mean(lams)) if lams else None,
        float(np.mean(anchos)) if anchos else None,
        None,
        "rangos" if all(f.method == "rangos" for f in fs) else "recortes",
        n_stacked=len(fs),
        avisos=avisos,
        varianza=var_total,
    )
    return suma, var_total
