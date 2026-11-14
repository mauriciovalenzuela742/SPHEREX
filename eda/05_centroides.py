"""EDA 5 — ¿El desplazamiento medido coincide con el movimiento propio de SIMBAD?

Sobre los recortes alineados (misma grilla, norte arriba) de la primera y la última época a λ igualada:
  - centroide del objeto en las dos épocas → desplazamiento medido;
  - lo mismo en estrellas de campo brillantes → error de alineación (deberían quedar en ~0);
  - píxeles marcados como malos en el núcleo → si el objeto satura, el centroide no vale.

Uso:  .venv/Scripts/python eda/05_centroides.py        (requiere 01, 02 y 03)
Salida: eda/resultados/centroides.json
"""
from __future__ import annotations

import importlib.util
import json
import warnings
from pathlib import Path

import numpy as np
from astropy.io import fits
from astropy.wcs import WCS, FITSFixedWarning
from reproject import reproject_interp
from scipy.ndimage import maximum_filter

from comun import RESULTADOS, cargar_campos, posicion_en

warnings.simplefilter("ignore", FITSFixedWarning)
AQUI = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("eda03", AQUI / "03_recortes_y_figuras.py")
eda03 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eda03)
FITS_DIR = AQUI.parent / "data" / "cache" / "eda" / "fits"
CASOS = [("barnard", 2), ("rw_aur", 3), ("eps_ind_b", 5)]


def centroide(img, x0, y0, r):
    y, x = np.mgrid[0:img.shape[0], 0:img.shape[1]]
    m = (abs(x - x0) <= r) & (abs(y - y0) <= r) & np.isfinite(img)
    w = np.clip(img[m] - np.nanmedian(img), 0, None)
    return float((x[m] * w).sum() / w.sum()), float((y[m] * w).sum() / w.sum())


def alineada(ruta, w_dest):
    with fits.open(ruta) as hl:
        img = hl["IMAGE"].data.astype(float) - hl["ZODI"].data.astype(float)
        fl = hl["FLAGS"].data
        img[(fl & eda03.MASCARA_MALA) != 0] = np.nan
        w = WCS(hl["IMAGE"].header)
        mjd = hl["IMAGE"].header["MJD-AVG"]
    al, _ = reproject_interp((img, w), w_dest, shape_out=(eda03.LADO_PX,) * 2, order="bilinear")
    return al, fl, w, mjd


def main() -> None:
    campos = {c["id"]: c for c in cargar_campos()}
    filas = eda03.leer_lambda()
    salida = {}
    for cid, det in CASOS:
        c = campos[cid]
        rs = [r for r in filas if r["campo"] == cid and r["detector"] == det and r["dentro"]]
        sel = eda03.elegir_lambda_igualada(eda03.pasadas(rs))
        w_dest = eda03.grilla_comun(*posicion_en(c, float(np.median([r["mjd"] for r in sel]))))
        prim, ult = sel[0], sel[-1]
        a, fa, wa, mjda = alineada(FITS_DIR / f"{cid}_{prim['obs_id']}_D{det}.fits", w_dest)
        b, fb, wb, mjdb = alineada(FITS_DIR / f"{cid}_{ult['obs_id']}_D{det}.fits", w_dest)

        xt, yt = w_dest.world_to_pixel_values(*posicion_en(c, prim["mjd"]))
        ca, cb = centroide(a, xt, yt, 3), centroide(b, xt, yt, 3)
        dt = ult["anio"] - prim["anio"]
        # En la grilla: x crece hacia el oeste (cdelt1 < 0), y hacia el norte.
        esperado = (-c["pmra"] / 1000 * dt / eda03.ESCALA, c["pmdec"] / 1000 * dt / eda03.ESCALA)

        s = np.nan_to_num(a - np.nanmedian(a))
        picos = np.argwhere((s == maximum_filter(s, 7)) & (s > np.nanpercentile(s, 99)))
        campo = []
        for yy, xx in picos:
            if 5 < xx < eda03.LADO_PX - 5 and 5 < yy < eda03.LADO_PX - 5 and np.hypot(xx - xt, yy - yt) > 8:
                p, q = centroide(a, xx, yy, 2), centroide(b, xx, yy, 2)
                campo.append((q[0] - p[0], q[1] - p[1]))
        campo = np.array(campo)

        def malos_nucleo(fl, w, mjd):
            x, y = (int(round(float(v))) for v in w.world_to_pixel_values(*posicion_en(c, mjd)))
            return int(((fl[y - 3:y + 4, x - 3:x + 4] & eda03.MASCARA_MALA) != 0).sum())

        salida[cid] = {
            "detector": det, "epocas": [prim["anio"], ult["anio"]], "lambda_um": [prim["lambda_um"], ult["lambda_um"]],
            "medido_px": [round(cb[0] - ca[0], 2), round(cb[1] - ca[1], 2)],
            "esperado_px": [round(esperado[0], 2), round(esperado[1], 2)],
            "estrellas_de_campo": len(campo),
            "campo_mediana_px": [round(float(np.median(campo[:, 0])), 2), round(float(np.median(campo[:, 1])), 2)],
            "malos_en_nucleo_7x7": [malos_nucleo(fa, wa, mjda), malos_nucleo(fb, wb, mjdb)],
            "nota": "x positivo = oeste, y positivo = norte",
        }
        print(cid, json.dumps(salida[cid], ensure_ascii=False))
    (RESULTADOS / "centroides.json").write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
