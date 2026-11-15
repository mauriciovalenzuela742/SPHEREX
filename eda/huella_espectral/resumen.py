import json, math, numpy as np, sys
oid = sys.argv[1]; H = json.load(open(f"huella_{oid}.json")); F = H["fuentes"]; P = H["prediccion"]
def idx(ps, cond): return [i for i, f in enumerate(F[ps]) if cond(f)]
obj = {ps: idx(ps, lambda f: f["g"] == "largo" and abs(f["x"] - 20) < 3 and abs(f["y"] - 20) < 2)[0] for ps in F}
est = {ps: idx(ps, lambda f: abs(f["x"] - 22.2) < 0.5 and abs(f["y"] - 21.2) < 0.5)[0] for ps in F}
print("indices objeto", obj, "estrella", est)
for ps in F:
    o = F[ps][obj[ps]]; s = F[ps][est[ps]]; p = P[ps]; c = math.cos(math.radians(o["dec"]))
    print(f"P{ps}: objeto - predicho: dRA={(o['ra']-p['ra'])*c*3600:+.2f}″ dDec={(o['dec']-p['dec'])*3600:+.2f}″ ; sep objeto-estrella medida={math.hypot((o['ra']-s['ra'])*c,o['dec']-s['dec'])*3600:.2f}″ predicha={math.hypot((p['ra']-s['ra'])*c,p['dec']-s['dec'])*3600:.2f}″  err pos objeto ±{o['ex']*3.075:.2f},{o['ey']*3.075:.2f}″")
for a, b in (("1", "2"), ("2", "3"), ("1", "3")):
    pa, pb = P[a], P[b]; c = math.cos(math.radians(pa["dec"]))
    dra, ddec = (pb["ra"] - pa["ra"]) * c * 3600, (pb["dec"] - pa["dec"]) * 3600
    dra0, ddec0 = (pb["ra_sin_plx"] - pa["ra_sin_plx"]) * c * 3600, (pb["dec_sin_plx"] - pa["dec_sin_plx"]) * 3600
    oa, ob = F[a][obj[a]], F[b][obj[b]]
    mra, mdec = (ob["ra"] - oa["ra"]) * c * 3600, (ob["dec"] - oa["dec"]) * 3600
    e = math.hypot(math.hypot(oa["ex"], oa["ey"]), math.hypot(ob["ex"], ob["ey"])) * 3.075
    print(f"{a}->{b}: medido |d|={math.hypot(mra,mdec):.2f}″ ({mra:+.2f},{mdec:+.2f}) ±{e:.2f}; predicho pm+plx {math.hypot(dra,ddec):.2f}″ ({dra:+.2f},{ddec:+.2f}); solo pm {math.hypot(dra0,ddec0):.2f}″  dif={math.hypot(mra-dra,mdec-ddec):.2f}″  Δt={pb['mjd']-pa['mjd']:.0f} d")
lam = H["lam_bins"]
for ps in F:
    print(f"P{ps} objeto:", [None if np.isnan(x[0]) else round(x[0], 3) for x in H["espectros"][ps][obj[ps]]["bins"]])
    print(f"P{ps} estrella:", [None if np.isnan(x[0]) else round(x[0], 3) for x in H["espectros"][ps][est[ps]]["bins"]])
print("lam", [round(l, 2) for l in lam])
json.dump({"obj": obj, "est": est}, open(f"ids_{oid}.json", "w"))
