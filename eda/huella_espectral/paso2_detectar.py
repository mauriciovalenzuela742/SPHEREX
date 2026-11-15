"""Detección sin catálogos en las pilas por pasada y grupo de bandas, y posiciones por ajuste conjunto de gaussianas."""
import sys, json, numpy as np
from scipy.ndimage import maximum_filter
from scipy.optimize import least_squares
from comun_h import *
oid = sys.argv[1]; z = np.load(f"pilas_{oid}.npz")
N = 41; ESC = PIX / 2; UMBRAL = 5.0; ENLACE = 1.3  # px de la rejilla (3,075″): 4″
wg = wcs_grid(float(z["ra_c"]), float(z["dec_c"]), N, ESC)
yy, xx = np.mgrid[0:N, 0:N]
def modelo(p, nfree, fijas):
    s = p[0]; m = np.full((N, N), p[1]); k = 2
    for i in range(nfree):
        x, y, f = p[k:k + 3]; k += 3
        m += f * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2 * s * s))
    for (x, y) in fijas:
        m += p[k] * np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (2 * s * s)); k += 1
    return m
def ajustar(st, vs, libres, fijas):
    ok = np.isfinite(st) & np.isfinite(vs)
    sig = np.sqrt(np.where(ok, vs, 1))
    p0 = [1.2, 0.0] + [v for (x, y) in libres for v in (x, y, max(st[int(round(y)), int(round(x))], 1e-3))] + [0.0] * len(fijas)
    lo = [0.5, -np.inf] + [v for (x, y) in libres for v in (x - 2, y - 2, -np.inf)] + [-np.inf] * len(fijas)
    hi = [4.0, np.inf] + [v for (x, y) in libres for v in (x + 2, y + 2, np.inf)] + [np.inf] * len(fijas)
    r = least_squares(lambda p: ((modelo(p, len(libres), fijas) - st) / sig)[ok], p0, bounds=(lo, hi))
    J = r.jac; cov = np.linalg.pinv(J.T @ J) * max(1.0, np.sum(r.fun ** 2) / (ok.sum() - len(p0)))
    e = np.sqrt(np.diag(cov))
    out = [(r.x[2 + 3 * i], r.x[3 + 3 * i], r.x[4 + 3 * i], e[2 + 3 * i], e[3 + 3 * i], r.x[4 + 3 * i] / e[4 + 3 * i]) for i in range(len(libres))]
    return out, r.x[0], np.sum(r.fun ** 2) / (ok.sum() - len(p0))
pases = sorted({k.split("_")[0] for k in z.files if k[0].isdigit()})
res = {}
for ps in pases:
    det = {}
    for g in GRUPOS:
        if f"{ps}_{g}_st" not in z.files:
            det[g] = []; continue
        st, vs = z[f"{ps}_{g}_st"], z[f"{ps}_{g}_var"]
        sn = st / np.sqrt(vs)
        # ruido real de la pila (los errores formales pueden quedar cortos): escala con la MAD
        f = np.nanmedian(np.abs(sn - np.nanmedian(sn))) * 1.4826
        sn = sn / max(f, 1.0)
        mx = maximum_filter(np.nan_to_num(sn, nan=-99), size=5)
        pk = np.argwhere((sn == mx) & (sn > UMBRAL))
        borde = [(x, y) for y, x in pk if 2 <= x <= N - 3 and 2 <= y <= N - 3 and np.isfinite(st[y-2:y+3, x-2:x+3]).all()]
        det[g] = [(float(x), float(y), float(sn[int(y), int(x)])) for x, y in borde]
    # fuentes = unión de detecciones de los tres grupos, enlazadas a ≤ ENLACE
    fuentes = []
    for g in GRUPOS:
        for x, y, s in det[g]:
            cerca = [f for f in fuentes if math.hypot(f["x0"] - x, f["y0"] - y) <= ENLACE]
            if cerca: cerca[0]["det"][g] = s
            else: fuentes.append({"x0": x, "y0": y, "det": {g: s}})
    # ajuste por grupo: posición libre para las detectadas en ese grupo; fija (flujo libre) para las demás
    for g in GRUPOS:
        if f"{ps}_{g}_st" not in z.files:
            det[g] = []; continue
        st, vs = z[f"{ps}_{g}_st"], z[f"{ps}_{g}_var"]
        libres = [f for f in fuentes if g in f["det"]]; fijas = [f for f in fuentes if g not in f["det"]]
        if not libres: continue
        out, s, chi = ajustar(st, vs, [(f["x0"], f["y0"]) for f in libres], [(f.get("x", f["x0"]), f.get("y", f["y0"])) for f in fijas])
        for f, (x, y, fl, ex, ey, sn) in zip(libres, out):
            f.setdefault("pos", {})[g] = (x, y, ex, ey, sn)
        print(f"P{ps} {g}: {len(det[g])} detecciones, sigma_gauss={s:.2f} px rejilla, chi2nu={chi:.1f}")
    # Regla de «huella»: si la posición de una fuente en un grupo de bandas se aparta de la del grupo corto
    # más de 0,5 px de rejilla (1,5″) y de 5σ, son dos fuentes con espectros distintos: se separa y se reajusta.
    nuevas = []
    for f in fuentes:
        if "corto" not in f.get("pos", {}): continue
        xc, yc, exc, eyc, _ = f["pos"]["corto"]
        for g in ("largo", "medio"):
            if g not in f["pos"]: continue
            x, y, ex, ey, sn = f["pos"][g]
            d = math.hypot(x - xc, y - yc); e = math.hypot(ex, ey) + math.hypot(exc, eyc)
            if d > 0.5 and d > 5 * e:
                print(f"   separo en P{ps}: grupo {g} a {d*ESC:.1f}″ del corto ({d/e:.0f}σ)")
                nuevas.append({"x0": x, "y0": y, "det": {g: f["det"].pop(g)}, "separada_de": (xc, yc)})
                f["pos"].pop(g); break
    if nuevas:
        fuentes += nuevas
        for g in {list(n["det"])[0] for n in nuevas}:
            st, vs = z[f"{ps}_{g}_st"], z[f"{ps}_{g}_var"]
            libres = [f for f in fuentes if g in f["det"]]
            fijas = [f for f in fuentes if g not in f["det"]]
            out, s, chi = ajustar(st, vs, [(f["x0"], f["y0"]) for f in libres],
                                  [((f["pos"]["corto"][0], f["pos"]["corto"][1]) if "corto" in f.get("pos", {}) else (f["x0"], f["y0"])) for f in fijas])
            for f, (x, y, fl, ex, ey, sn) in zip(libres, out):
                f.setdefault("pos", {})[g] = (x, y, ex, ey, sn)
            print(f"   reajuste P{ps} {g}: chi2nu={chi:.2f}")
    for f in fuentes:  # posición de la pasada: la del grupo con mayor S/N del ajuste
        g = max(f["pos"], key=lambda k: f["pos"][k][4]); x, y, ex, ey, sn = f["pos"][g]
        ra, dec = wg.wcs_pix2world([[x, y]], 0)[0]
        f.update(x=x, y=y, ex=ex, ey=ey, g=g, ra=float(ra), dec=float(dec))
    res[ps] = fuentes
    print(f"P{ps}: {len(fuentes)} fuentes")
    for f in sorted(fuentes, key=lambda f: (f['y'], f['x'])):
        print(f"   ({f['x']:.2f},{f['y']:.2f}) ±({f['ex']:.2f},{f['ey']:.2f}) grupo={f['g']} det={ {k: round(v,1) for k,v in f['det'].items()} } " +
              " ".join(f"{g}:({v[0]:.2f},{v[1]:.2f})" for g, v in f["pos"].items()))
json.dump(res, open(f"fuentes_{oid}.json", "w"), indent=1)
