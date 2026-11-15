import sys, json, numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from collections import Counter
from comun_h import *
sys.path.insert(0, r"D:\dev\informes_v2\precalc_espectros\trabajo"); os.chdir(r"D:\dev\informes_v2\precalc_espectros\trabajo")
from comun import CAMPOS, pos
os.chdir(r"D:\dev\informes_v2\huella_espectral")
oid = sys.argv[1]; MJDC = float(sys.argv[2])
pas = cargar(oid); ra_c, dec_c = pos(CAMPOS[oid], MJDC)
N, ESC = 41, PIX / 2; wg = wcs_grid(ra_c, dec_c, N, ESC)
fig, ax = plt.subplots(len(pas), 3, figsize=(10, 3.3 * len(pas)))
pilas = {}
for i, p in enumerate(pas):
    print("pasada", i + 1, len(p), "exp", Counter(e.banda for e in p), round(p[0].mjd, 1), round(p[-1].mjd, 1))
    mjd_m = np.mean([e.mjd for e in p])
    for j, (g, bs) in enumerate(GRUPOS.items()):
        ex = [e for e in p if e.banda in bs]
        if not ex: continue
        st, vs, den = apilar(ex, wg, N)
        pilas[f"{i+1}_{g}"] = (st, vs)
        sn = st / np.sqrt(vs)
        a = ax[i, j]; a.imshow(sn, origin="lower", cmap="gray_r", vmin=-3, vmax=30)
        # posición predicha de WISE/objeto
        r, d = pos(CAMPOS[oid], mjd_m); x, y = wg.wcs_world2pix([[r, d]], 0)[0]
        a.plot(x, y, "r+", ms=12); a.set_title(f"P{i+1} {g} ({len(ex)} exp)")
np.savez(f"pilas_{oid}.npz", **{k + "_st": v[0] for k, v in pilas.items()}, **{k + "_var": v[1] for k, v in pilas.items()}, ra_c=ra_c, dec_c=dec_c)
plt.tight_layout(); plt.savefig(f"diag_pilas_{oid}.png", dpi=70)
