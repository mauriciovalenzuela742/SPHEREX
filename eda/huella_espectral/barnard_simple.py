"""Versión simple para Barnard: solo el centroide (gaussiana) de la pila de bandas largas por pasada, contra lo predicho."""
import json, math, sys, os, numpy as np
from astropy.time import Time
from astropy.coordinates import get_body_barycentric
from comun_h import *
sys.path.insert(0, r"D:\dev\informes_v2\precalc_espectros\trabajo"); c0 = os.getcwd(); os.chdir(r"D:\dev\informes_v2\precalc_espectros\trabajo")
from comun import CAMPOS, pos; os.chdir(c0)
F = json.load(open("fuentes_barnard.json")); pas = cargar("barnard"); C = CAMPOS["barnard"]
def pred(mjd):
    ra, dec = pos(C, mjd); plx = C["paralaje_mas"] / 3.6e6
    E = get_body_barycentric("earth", Time(mjd, format="mjd")).xyz.to_value("AU"); a, d = map(math.radians, (ra, dec))
    return ra + plx * (E[0] * math.sin(a) - E[1] * math.cos(a)) / math.cos(d), dec + plx * (E[0] * math.cos(a) * math.sin(d) + E[1] * math.sin(a) * math.sin(d) - E[2] * math.cos(d))
out = {}
for ps, fu in F.items():
    f = fu[0]; t = float(np.mean([e.mjd for e in pas[int(ps) - 1] if e.banda in (5, 6)])); r, d = pred(t)
    out[ps] = dict(ra=f["ra"], dec=f["dec"], mjd=t, ra_p=r, dec_p=d); c = math.cos(math.radians(d))
    print(f"P{ps}: medido-predicho dRA={(f['ra']-r)*c*3600:+.2f}″ dDec={(f['dec']-d)*3600:+.2f}″")
for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
    A, B = out[a], out[b]; c = math.cos(math.radians(A["dec"]))
    m = ((B["ra"] - A["ra"]) * c * 3600, (B["dec"] - A["dec"]) * 3600); p = ((B["ra_p"] - A["ra_p"]) * c * 3600, (B["dec_p"] - A["dec_p"]) * 3600)
    print(f"{a}->{b}: medido {math.hypot(*m):.2f}″ ({m[0]:+.2f},{m[1]:+.2f}); predicho {math.hypot(*p):.2f}″ ({p[0]:+.2f},{p[1]:+.2f}); dif {math.hypot(m[0]-p[0], m[1]-p[1]):.2f}″")
json.dump(out, open("barnard_simple.json", "w"))
