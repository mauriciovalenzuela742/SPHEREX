"""P1: cambio de BRILLO vs cambio de FORMA del espectro entre pasadas (precalc_espectros/*.json)."""
import json, glob, math, itertools
import numpy as np
BANDAS = {1: (0.75, 1.09), 2: (1.10, 1.62), 3: (1.63, 2.41), 4: (2.42, 3.82), 5: (3.83, 4.41), 6: (4.42, 5.00)}
EDGES = np.geomspace(0.75, 5.0, 25)  # 24 tramos de λ (~4 canales cada uno)
def binear(p):
    pts = [q for q in p["puntos"] if q["estado"] == "medida" and not q["sospechoso"] and q["err"] and q["err"] > 0]
    out = {}
    for i in range(len(EDGES) - 1):
        s = [q for q in pts if EDGES[i] <= q["lam"] < EDGES[i + 1]]
        if len(s) < 2: continue
        f = np.array([q["mJy"] for q in s]); e = np.array([q["err"] for q in s])
        w = 1 / e**2; m = np.sum(w * f) / w.sum()
        # error: el mayor entre el formal y la dispersión observada (errores subestimados por sistemáticos)
        ef = math.sqrt(1 / w.sum()); ed = np.std(f, ddof=1) / math.sqrt(len(f))
        out[i] = (m, max(ef, ed), len(s))
    return out
res = {}
for f in sorted(glob.glob(r"D:\dev\informes_v2\precalc_espectros\*.json")):
    d = json.load(open(f, encoding="utf-8")); oid = d["objeto"]
    B = {p["id"]: binear(p) for p in d["pasadas"]}
    comp = {p["id"]: p["canales_cubiertos"] for p in d["pasadas"]}
    print(f"\n== {d['nombre']}  pasadas={comp}")
    filas = []
    for a, b in itertools.combinations(B, 2):
        com = sorted(set(B[a]) & set(B[b]))
        com = [i for i in com if B[a][i][0] > 3 * B[a][i][1] and B[b][i][0] > 3 * B[b][i][1]]
        if len(com) < 4:
            print(f"  {a}-{b}: solo {len(com)} tramos comunes con S/N>3; no se compara"); continue
        fa = np.array([B[a][i][0] for i in com]); ea = np.array([B[a][i][1] for i in com])
        fb = np.array([B[b][i][0] for i in com]); eb = np.array([B[b][i][1] for i in com])
        r = fb / fa; er = r * np.sqrt((ea / fa) ** 2 + (eb / fb) ** 2)
        brillo = float(np.median(r))                      # cambio de brillo total (b/a)
        forma = r / brillo; ef = er / brillo               # forma: razón normalizada, debería ser 1
        chi2 = float(np.sum(((forma - 1) / ef) ** 2)); dof = len(com) - 1
        rms = float(np.sqrt(np.mean((forma - 1) ** 2)))
        lam = np.sqrt(EDGES[com] * EDGES[np.array(com) + 1])
        peor = int(np.argmax(np.abs(forma - 1) / ef))
        dt = None
        fila = dict(a=a, b=b, n=len(com), brillo=round(brillo, 3), rms_forma=round(rms, 3), chi2_dof=round(chi2 / dof, 2),
                    peor_lam=round(float(lam[peor]), 2), peor_forma=round(float(forma[peor]), 2),
                    forma_por_tramo={f"{l:.2f}": round(float(x), 2) for l, x in zip(lam, forma)},
                    completas=comp[a] >= 90 and comp[b] >= 90)
        filas.append(fila)
        print(f"  {a}-{b} ({'completas' if fila['completas'] else 'alguna incompleta'}): tramos={len(com)} brillo b/a={brillo:.3f}  forma rms={rms*100:.1f}%  chi2/dof={chi2/dof:.1f}  peor tramo {lam[peor]:.2f} um -> {forma[peor]:.2f}")
    res[oid] = filas
json.dump(res, open("q1_resultados.json", "w"), indent=1)
