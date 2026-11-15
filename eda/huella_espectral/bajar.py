"""Lee una caja de 23×23 px nativos (IMAGE+VARIANCE) alrededor del campo en cada exposición de nivel 2.
Usa el lector por rangos del backend (sin modificarlo). Paralelo ≤ 6 (el backend limita a 4 internamente)."""
import json, sys, os, time, math
from concurrent.futures import ThreadPoolExecutor, as_completed
sys.path.insert(0, r"D:\dev\informes_v2\precalc_espectros\trabajo")
os.chdir(r"D:\dev\informes_v2\precalc_espectros\trabajo")
from comun import *  # fija SPHEREX_CACHE y sys.path del backend
from app.frames import rangos
from app.frames.servicio import banda_de
import numpy as np
oid = sys.argv[1]; MJD_C = float(sys.argv[2]); H = 11; LIMITE = 900
OUT = rf"D:\dev\informes_v2\huella_espectral\cajas\{oid}"; os.makedirs(OUT, exist_ok=True)
ra_c, dec_c = pos(CAMPOS[oid], MJD_C)
todas = json.load(open("sia2_todas.json"))[oid]
vistos, lista = set(), []
for e in todas:
    if e["collection"] in ("spherex_dr1", "spherex_qr3") and e["access_url"] not in vistos:
        vistos.add(e["access_url"]); lista.append(e)
def una(e):
    ruta = os.path.join(OUT, f"{e['id']}_{e['detector'][-1]}.npz")
    if os.path.exists(ruta): return "cache"
    est = rangos.estructura(e["access_url"], con_varianza=True)
    nx, ny = est.cab["NAXIS1"], est.cab["NAXIS2"]
    xt, yt = est.wcs.all_world2pix([[ra_c, dec_c]], 0)[0]
    x0, y0 = int(round(xt)) - H, int(round(yt)) - H
    if x0 < 0 or y0 < 0 or x0 + 2 * H > nx - 1 or y0 + 2 * H > ny - 1: return "borde"
    img, var = rangos.leer_cajas(e["access_url"], est, x0, x0 + 2 * H, y0, y0 + 2 * H, con_varianza=True)
    np.savez_compressed(ruta, img=img.astype(np.float32), var=var.astype(np.float32), x0=x0, y0=y0, cab=est.cab.tostring(),
                        xs=est.xs, ys=est.ys, vals=est.vals, mjd=e["t_mjd"], banda=banda_de(e["detector"]), url=e["access_url"])
    return "ok"
t0 = time.time(); from collections import Counter; c = Counter()
with ThreadPoolExecutor(6) as ex:
    fs = [ex.submit(una, e) for e in lista]
    for i, f in enumerate(as_completed(fs)):
        try: c[f.result()] += 1
        except Exception as x: c[type(x).__name__ + str(x)[:60]] += 1
        if i % 50 == 0: print(i, len(lista), f"{time.time()-t0:.0f}s", dict(c), flush=True)
        if time.time() - t0 > LIMITE:
            print("LIMITE"); [g.cancel() for g in fs]; break
print("fin", dict(c), f"{time.time()-t0:.0f}s", "centro", ra_c, dec_c)
