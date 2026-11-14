"""Recolecta, para los 5 campos de prueba y las 6 bandas, el inventario, imágenes (primera/última visita,
resta, color) y estadísticas medidas de cada recorte. Escribe un JSON que usa el informe HTML.

    .venv/bin/python prototipos/rango_fechas/recolectar_bandas.py salida.json
"""

from __future__ import annotations

import json
import math
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date

import numpy as np
import yaml
from astropy.io import fits
from astropy.time import Time

import spherex

INICIO, FIN = "2025-04-01", date.today().isoformat()
SIZE = 0.1
POR_VISITA = {"wise_0855": 4}  # débil: hay que sumar exposiciones


def posicion(c, anio):
    dt = anio - 2000.0
    dec = c["dec_deg"] + c["pmdec"] * dt / 3.6e6
    ra = c["ra_deg"] + c["pmra"] * dt / 3.6e6 / math.cos(math.radians(c["dec_deg"]))
    return ra % 360, dec


def stats_recorte(o, ra, dec):
    ruta = spherex.bajar_recorte(o, ra, dec, SIZE)
    with fits.open(ruta) as h:
        img = h["IMAGE"].data.astype(float)
        zodi = h["ZODI"].data.astype(float)
        var = h["VARIANCE"].data.astype(float)
        lam, ancho = spherex.longitud_onda_centro(h)
        defs = spherex.definiciones_flags(h["FLAGS"].header)
        f = h["FLAGS"].data.astype(np.int64)
    neto = img - zodi
    cont = np.zeros(f.shape, bool)
    for b, n in defs.items():
        if n not in spherex.BITS_INFORMATIVOS:
            cont |= ((f >> b) & 1).astype(bool)
    return dict(
        obs_id=o.obs_id,
        t=o.iso,
        lam=lam,
        ancho=ancho,
        zodi=float(np.nanmedian(zodi)),
        ruido=float(np.nanmedian(np.sqrt(var))),
        neto_p99=float(np.nanpercentile(neto, 99)),
        nan=float(np.isnan(img).mean()),
        contaminado=float(cont.mean()),
    )


def campo(c):
    anio = (Time(INICIO).decimalyear + Time(FIN).decimalyear) / 2
    ra, dec = posicion(c, anio)
    pv = POR_VISITA.get(c["id"], 1)
    out = dict(id=c["id"], nombre=c["nombre"], ra=ra, dec=dec, tipo=c.get("tipo", ""),
               que_demuestra=c.get("que_demuestra", ""), banda_rec=c.get("banda_recomendada"),
               pm=math.hypot(c["pmra"], c["pmdec"]) / 1000, por_visita=pv, bandas={})
    for b in range(1, 7):
        obs, _ = spherex.buscar(ra, dec, b, INICIO, FIN)
        vis = spherex.agrupar_visitas(obs)
        d = dict(n_obs=len(obs), n_visitas=len(vis),
                 visitas=[dict(ini=v[0].iso[:10], n=len(v)) for v in vis],
                 colecciones=sorted({o.coleccion for o in obs}))
        if len(vis) >= 2:
            r = spherex.fotogramas(ra, dec, b, INICIO, FIN, SIZE, max_visitas=2, por_visita=pv)
            d["frames"] = [dict(t=f["t"], lam=f["wavelength_um"], png=f["png"], cont=f["flagged_fraction"],
                                n=f["n_stacked"]) for f in r["frames"]]
            d["diff_png"], d["color_png"] = r.get("diff_png"), r.get("color_png")
            d["avisos"] = r["warnings"]
        # Estadísticas de una exposición por visita (las del medio): baratas y ya en caché casi todas.
        muestra = [v[len(v) // 2] for v in vis]
        with ThreadPoolExecutor(3) as ex:
            d["stats"] = [s for s in ex.map(lambda o: _seguro(stats_recorte, o, ra, dec), muestra) if s]
        out["bandas"][b] = d
        print(f"  {c['id']} banda {b}: {len(obs)} obs, {len(vis)} visitas", flush=True)
    return out


def _seguro(fn, *a):
    try:
        return fn(*a)
    except Exception as e:
        print("   omitido:", e, flush=True)
        return None


if __name__ == "__main__":
    campos = yaml.safe_load((spherex.RAIZ / "data" / "campos_de_prueba.yml").read_text())["campos"]
    datos = dict(generado=Time.now().isot[:16] + "Z", rango=[INICIO, FIN], size=SIZE,
                 escala=spherex.ESCALA_ARCSEC, bandas_um=spherex.BANDAS_UM, campos=[])
    for c in campos:
        print(c["id"], flush=True)
        datos["campos"].append(campo(c))
    with open(sys.argv[1], "w") as fh:
        json.dump(datos, fh)
    print("ok")
