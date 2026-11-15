"""Extensión: búsqueda ciega de «lo que se mueve» en el campo de WISE 0855.

No usa ids_wise_0855.json, ni la posición predicha, ni ningún catálogo: solo las fuentes detectadas
en cada pasada (fuentes) y sus espectros por fotometría forzada (espectros), que salen de paso2/paso3.

Compara dos reglas de emparejamiento entre pasadas, ambas exigiendo pareja MUTUA (A elige a B y B elige a A):
  - posicional: cada fuente elige a la más cercana dentro de 3 px nativos (18,5″);
  - huella:     cada fuente elige a la de espectro más parecido (menor D) dentro del mismo radio.
Una fuente es «candidata a moverse» si su trayectoria P1→P2→P3 existe con la regla y su desplazamiento
neto en un año (P1→P3) supera 5σ, con σ = error formal + piso sistemático de 0,25″ por eje y pasada.
Después, sin mirar quién es, se describe su espectro: fracción del flujo en λ > 3,8 µm.

Uso: python busqueda_ciega.py [CARPETA_DATOS]   (por defecto D:\\dev\\informes_v2\\huella_espectral)
"""
import json, math, os, sys
import numpy as np

D = sys.argv[1] if len(sys.argv) > 1 else r"D:\dev\informes_v2\huella_espectral"
H = json.load(open(os.path.join(D, "huella_wise_0855.json")))
F, E, lam = H["fuentes"], H["espectros"], np.array(H["lam_bins"])
GRID, R = 6.15 / 2, 3 * 6.15
PISO = 0.25  # ″ por eje y pasada; la repetición de fuentes quietas da mediana 0,16″ y máximo 0,37″ (verificar_cifras.py)
UMBRAL_SIGMA = 5.0


def distancia(A, B):  # copia exacta de paso3_huella.py
    a = np.array([x[0] for x in A]); ea = np.array([x[1] for x in A]); b = np.array([x[0] for x in B]); eb = np.array([x[1] for x in B])
    ok = np.isfinite(a) & np.isfinite(b)
    if ok.sum() < 4: return np.inf
    a, ea, b, eb = a[ok], ea[ok], b[ok], eb[ok]; s = 1.0
    for _ in range(20):
        v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
        s = max(np.sum(a * b / v) / np.sum(b * b / v), 1e-3)
    v = ea ** 2 + (s * eb) ** 2 + (0.05 * np.maximum(np.abs(a), np.abs(s * b))) ** 2
    return float(np.sum((a - s * b) ** 2 / v) / (ok.sum() - 1))


def sep(f, g):
    return math.hypot((f["ra"] - g["ra"]) * math.cos(math.radians(f["dec"])), f["dec"] - g["dec"]) * 3600


def elige(a, i, b, regla):
    cand = [j for j, g in enumerate(F[b]) if sep(F[a][i], g) <= R]
    if not cand: return None
    if regla == "posicional": return min(cand, key=lambda j: sep(F[a][i], F[b][j]))
    return min(cand, key=lambda j: distancia(E[a][i]["bins"], E[b][j]["bins"]))


def mutua(a, i, b, regla):
    j = elige(a, i, b, regla)
    return j if j is not None and elige(b, j, a, regla) == i else None


def err(f): return math.hypot(math.hypot(f["ex"] * GRID, PISO), math.hypot(f["ey"] * GRID, PISO))


def frac_roja(ps, i):  # fracción del flujo (tramos con dato) en λ > 3,8 µm
    b = np.array(E[ps][i]["bins"], float)[:, 0]; ok = np.isfinite(b)
    tot = np.sum(np.clip(b[ok], 0, None)); roja = np.sum(np.clip(b[ok & (lam > 3.8)], 0, None))
    return float(roja / tot) if tot > 0 else float("nan")


res = {}
for regla in ("posicional", "huella"):
    trayectorias, rotas = [], 0
    for i in range(len(F["1"])):
        j = mutua("1", i, "2", regla); k = mutua("2", j, "3", regla) if j is not None else None
        k13 = mutua("1", i, "3", regla)
        if j is None or k is None or k13 != k:
            rotas += 1; continue
        f1, f2, f3 = F["1"][i], F["2"][j], F["3"][k]
        d13 = sep(f1, f3); s13 = math.hypot(err(f1), err(f3))
        trayectorias.append({"P1": i, "P2": j, "P3": k, "x_y_P2": [round(f2["x"], 1), round(f2["y"], 1)],
                             "d12": round(sep(f1, f2), 2), "d23": round(sep(f2, f3), 2), "d13": round(d13, 2), "sigma13": round(d13 / s13, 1),
                             "candidata": d13 / s13 >= UMBRAL_SIGMA, "frac_flujo_lambda>3.8um_P2": round(frac_roja("2", j), 2)})
    # fuentes de P3 que quedaron sin trayectoria (huérfanas)
    usadas3 = {t["P3"] for t in trayectorias}
    res[regla] = {"trayectorias": trayectorias, "rotas_desde_P1": rotas,
                  "huerfanas_P3": [[round(F["3"][k]["x"], 1), round(F["3"][k]["y"], 1)] for k in range(len(F["3"])) if k not in usadas3],
                  "candidatas": [t for t in trayectorias if t["candidata"]]}
    print(f"\n=== Regla {regla}: {len(trayectorias)} trayectorias completas, {rotas} rotas desde P1")
    for t in sorted(trayectorias, key=lambda t: -t["sigma13"]):
        print(f"  P2({t['x_y_P2'][0]:5.1f},{t['x_y_P2'][1]:5.1f})  d12={t['d12']:5.2f}″ d23={t['d23']:5.2f}″ d13={t['d13']:5.2f}″ ({t['sigma13']:5.1f}σ)"
              f"  flujo λ>3,8µm={t['frac_flujo_lambda>3.8um_P2']:.2f}  {'<== CANDIDATA' if t['candidata'] else ''}")
    print("  huérfanas en P3 (x,y rejilla):", res[regla]["huerfanas_P3"])
# Fracción roja de todas las fuentes de P2, para ver si la candidata destaca también por color
res["frac_roja_todas_P2"] = sorted(round(frac_roja("2", j), 2) for j in range(len(F["2"])))
print("\nfracción de flujo en λ>3,8 µm, todas las fuentes de P2:", res["frac_roja_todas_P2"])
json.dump(res, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "busqueda_ciega_resultado.json"), "w"), indent=1)
