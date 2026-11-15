"""Fotometría PSF forzada por exposición, espectro por fuente y pasada, emparejamiento por similitud espectral y movimiento."""
import sys, json, numpy as np
from scipy.special import erf
from astropy.time import Time
from astropy.coordinates import get_body_barycentric
from comun_h import *
sys.path.insert(0, r"D:\dev\informes_v2\precalc_espectros\trabajo"); _cwd = os.getcwd()
os.chdir(r"D:\dev\informes_v2\precalc_espectros\trabajo"); from comun import CAMPOS, pos; os.chdir(_cwd)
oid = sys.argv[1]; R_BUSQ = 3.0  # px nativos
pas = cargar(oid); F = json.load(open(f"fuentes_{oid}.json"))
SIG = np.arange(0.40, 1.05, 0.05)
def psf(nx, ny, xc, yc, s):
    xe = np.arange(nx + 1) - 0.5; ye = np.arange(ny + 1) - 0.5
    gx = np.diff(0.5 * (1 + erf((xe - xc) / (np.sqrt(2) * s)))); gy = np.diff(0.5 * (1 + erf((ye - yc) / (np.sqrt(2) * s))))
    return np.outer(gy, gx)
def ajuste(e, fuentes, s):
    ny, nx = e.img.shape; yy, xx = np.mgrid[0:ny, 0:nx]
    ok = np.isfinite(e.img) & np.isfinite(e.var) & (e.var > 0) & ((xx - nx // 2) ** 2 + (yy - ny // 2) ** 2 <= 10 ** 2)
    xs, ys = e.pix([f["ra"] for f in fuentes], [f["dec"] for f in fuentes])
    dentro = [(i, x, y) for i, (x, y) in enumerate(zip(xs, ys)) if 1 <= x <= nx - 2 and 1 <= y <= ny - 2 and ok[int(round(y)), int(round(x))]]
    if not dentro: return None
    A = [np.ones(ok.sum())] + [psf(nx, ny, x, y, s)[ok] for _, x, y in dentro]
    A = np.array(A).T; w = 1 / e.var[ok]; b = e.img[ok]
    AtW = A.T * w; C = np.linalg.pinv(AtW @ A); p = C @ (AtW @ b)
    chi = float(np.sum(w * (b - A @ p) ** 2))
    k = e.omega * 1e9  # MJy/sr·px → mJy
    out = {i: (float(p[j + 1] * k), float(np.sqrt(C[j + 1, j + 1]) * k), *e.lam(x, y)) for j, (i, x, y) in enumerate(dentro)}
    return out, chi
# 1) σ de la PSF por banda (mínimo χ² total en la pasada más larga)
larga = max(range(len(pas)), key=lambda i: len(pas[i])); fl = F[str(larga + 1)]
sig_b = {}
def sum_chi(ex_list, fl_list, s):
    tot = 0.0; n = 0
    for e in ex_list:
        r = ajuste(e, fl_list, s)
        if r is not None: tot += r[1]; n += 1
    return tot if n > 0 else np.inf
for b in range(1, 7):
    ex = [e for e in pas[larga] if e.banda == b]
    if not ex: ex = [e for p in pas for e in p if e.banda == b]
    chis = [sum_chi(ex, fl, s) for s in SIG]
    sig_b[b] = float(SIG[int(np.argmin(chis))])
print("sigma PSF por banda (px nativos):", sig_b)
# 2) fotometría forzada por pasada
EDGES = np.geomspace(0.75, 5.0, 13)
esp = {}
for ip, p in enumerate(pas):
    ps = str(ip + 1); fu = F[ps]; pts = {i: [] for i in range(len(fu))}
    for e in p:
        r = ajuste(e, fu, sig_b[e.banda])
        if r is None: continue
        for i, (f, ef, lam, _) in r[0].items(): pts[i].append((lam, f, ef))
    esp[ps] = []
    for i, f in enumerate(fu):
        a = np.array(pts[i]) if pts[i] else np.zeros((0, 3)); bins = []
        for k in range(len(EDGES) - 1):
            s = a[(a[:, 0] >= EDGES[k]) & (a[:, 0] < EDGES[k + 1])] if len(a) else a
            if len(s) < 2: bins.append((np.nan, np.nan, 0)); continue
            w = 1 / s[:, 2] ** 2; m = np.sum(w * s[:, 1]) / w.sum()
            er = max(np.sqrt(1 / w.sum()), np.std(s[:, 1], ddof=1) / np.sqrt(len(s)))
            bins.append((float(m), float(er), len(s)))
        esp[ps].append({"bins": bins, "puntos": a.tolist()})
lamc = np.sqrt(EDGES[:-1] * EDGES[1:])
# 3) distancia espectral: χ²_ν de la forma (escala libre), con piso sistemático de 5 %
def distancia(A, B):
    a = np.array([x[0] for x in A]); ea = np.array([x[1] for x in A]); b = np.array([x[0] for x in B]); eb = np.array([x[1] for x in B])
    ok = np.isfinite(a) & np.isfinite(b)
    if ok.sum() < 4: return np.nan, 0
    a, ea, b, eb = a[ok], ea[ok], b[ok], eb[ok]; s = 1.0
    for _ in range(20):
        v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
        s = max(np.sum(a * b / v) / np.sum(b * b / v), 1e-3)
    v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
    return float(np.sum((a - s * b) ** 2 / v) / (ok.sum() - 1)), int(ok.sum())
def sep(f, g):
    return math.hypot((f["ra"] - g["ra"]) * math.cos(math.radians(f["dec"])), f["dec"] - g["dec"]) * 3600
# posición predicha (movimiento propio + paralaje) en una MJD
def pred(mjd):
    c = CAMPOS[oid]; ra, dec = pos(c, mjd); plx = c["paralaje_mas"] / 1000 / 3600
    E = get_body_barycentric("earth", Time(mjd, format="mjd")).xyz.to_value("AU")
    a, d = math.radians(ra), math.radians(dec)
    dra = plx * (E[0] * math.sin(a) - E[1] * math.cos(a)) / math.cos(d)
    ddec = plx * (E[0] * math.cos(a) * math.sin(d) + E[1] * math.sin(a) * math.sin(d) - E[2] * math.cos(d))
    return ra + dra, dec + ddec
def mjd_media(ps, g):
    bs = GRUPOS[g]; exs = [e.mjd for e in pas[int(ps) - 1] if e.banda in bs]
    return float(np.mean(exs if exs else [e.mjd for e in pas[int(ps) - 1]]))
# 4) emparejamiento entre todos los pares de pasadas (a < b)
informe = {"sigma_psf": sig_b, "lam_bins": lamc.tolist(), "pares": {}, "espectros": esp, "fuentes": F}
pares_keys = [(str(a), str(b)) for a in range(1, len(pas) + 1) for b in range(a + 1, len(pas) + 1)]
for a, b in pares_keys:
    filas = []
    for i, f in enumerate(F[a]):
        cand = [(j, g) for j, g in enumerate(F[b]) if sep(f, g) <= R_BUSQ * PIX]
        if not cand: filas.append({"i": i, "j": None}); continue
        ds = [(distancia(esp[a][i]["bins"], esp[b][j]["bins"])[0], j) for j, _ in cand]
        dmin, jbest = min(ds, key=lambda t: (np.inf if np.isnan(t[0]) else t[0]))
        jnear = min(cand, key=lambda t: sep(f, t[1]))[0]
        g = F[b][jbest]
        filas.append({"i": i, "j": jbest, "j_cercana": jnear, "D": dmin, "D_todas": {j: d for d, j in ds},
                      "desplazamiento_arcsec": sep(f, g),
                      "dra_arcsec": (g["ra"] - f["ra"]) * math.cos(math.radians(f["dec"])) * 3600, "ddec_arcsec": (g["dec"] - f["dec"]) * 3600})
    informe["pares"][f"{a}-{b}"] = filas
# 5) desplazamiento del sistema (mediana de las fuentes «estelares» emparejadas) para descontar la astrometría
for k, filas in informe["pares"].items():
    a, b = k.split("-")
    print(f"\n== Pasada {a} -> {b}")
    for fl in filas:
        f = F[a][fl["i"]]; tag = f"({f['x']:.1f},{f['y']:.1f}) {f['g']}"
        if fl["j"] is None: print(f"  {tag}: sin candidatas a ≤{R_BUSQ} px"); continue
        print(f"  {tag} -> fuente {fl['j']} (cercana {fl['j_cercana']}) D={fl['D']:.2f}  D_todas={ {j: round(d,2) for j,d in fl['D_todas'].items()} } desplaz={fl['desplazamiento_arcsec']:.2f}″ (dRA={fl['dra_arcsec']:+.2f}, dDec={fl['ddec_arcsec']:+.2f})")
# predicción para el objeto
for ps in F:
    t = mjd_media(ps, "largo"); r, d = pred(t)
    print(f"P{ps}: MJD medio bandas largas {t:.1f}; predicho (pm+paralaje) RA={r:.6f} Dec={d:.6f}")
    informe.setdefault("prediccion", {})[ps] = {"mjd": t, "ra": r, "dec": d, "ra_sin_plx": pos(CAMPOS[oid], t)[0], "dec_sin_plx": pos(CAMPOS[oid], t)[1]}
json.dump(informe, open(f"huella_{oid}.json", "w"), default=float)
