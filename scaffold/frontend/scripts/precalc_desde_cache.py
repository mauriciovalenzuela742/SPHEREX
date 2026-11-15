"""Convierte lo que guardó la grabación de la demo (.demo-cache/, ver vite.demo.config.ts) en fotos precalculadas para
la vista simple: public/precalc/simple/<id>.json, con la rejilla de visitas y TODAS las fotos de las 6 bandas.

Uso, desde scaffold/frontend:
    python scripts/precalc_desde_cache.py [id ...]     (sin ids: los 5 objetos de prueba)

Solo escribe un objeto si están su rejilla y cada foto (200) o su «no hay visita» (404). Los parámetros son los que pide
la vista simple (src/explorador/useDatosSpherex.ts): desde 2025-04-01 hasta HASTA, size 0.1, porVisita 10 para los
objetos con preset (WISE 0855, eps Ind B) y 1 para el resto. Los datos son los que entregó IRSA vía el prototipo D2.
"""
import json, sys
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path
from urllib.parse import urlencode

AQUI = Path(__file__).resolve().parent.parent
CACHE = AQUI / ".demo-cache"
SALIDA = AQUI / "public" / "precalc" / "simple"
API = "https://spherex-prototipo-d2.vercel.app/api/"
DESDE, HASTA, SIZE = "2025-04-01", "2026-11-15", 0.1
# Posición de hoy (posicionActual de content/campos.ts, 15-nov-2026) y exposiciones por visita
OBJ = {
    "barnard": (269.446074, 4.770714, 1),
    "eps_ind_b": (331.098404, -56.801258, 10),
    "wise_0855": (133.757782, -7.242023, 10),
    "rw_aur": (76.956589, 30.401286, 1),
    "r_dra": (248.16722, 66.755025, 1),
}


def leer(url):
    """Respuesta guardada para esta URL exacta (misma clave que vite.demo.config.ts), o None."""
    k = sha1(url.encode()).hexdigest()
    meta, cuerpo = CACHE / f"{k}.json", CACHE / f"{k}.bin"
    if not (meta.exists() and cuerpo.exists()):
        return None
    m = json.loads(meta.read_text(encoding="utf-8"))
    return m.get("status", 200), cuerpo.read_bytes()


def fmt(x):
    # Igual que String(number) en JS: sin ceros de más.
    return repr(float(x)).rstrip("0").rstrip(".") if "." in repr(float(x)) else str(x)


def convertir(oid):
    ra, dec, pv = OBJ[oid]
    base = {"ra": fmt(ra), "dec": fmt(dec), "start": DESDE, "end": HASTA}
    g = leer(API + "grid?" + urlencode({**base, "bands": "1,2,3,4,5,6"}))
    if not g or g[0] != 200:
        return f"{oid}: falta la rejilla"
    grid = json.loads(g[1])
    frames, faltan, vacias = {}, 0, 0
    for b in grid["bands"]:
        for v in range(len(grid["visits"].get(str(b), []))):
            q = {**base, "band": str(b), "visit": str(v), "size": fmt(SIZE), "per_visit": str(pv), "budget_s": "8"}
            r = leer(API + "frame?" + urlencode(q))
            if r is None:
                faltan += 1
            elif r[0] == 200:
                frames[f"{b}:{v}"] = json.loads(r[1])
            else:
                vacias += 1
    if faltan:
        return f"{oid}: faltan {faltan} fotos (no se escribe)"
    SALIDA.mkdir(parents=True, exist_ok=True)
    salida = {
        "id": oid, "size": SIZE, "porVisita": pv, "ra": ra, "dec": dec, "desde": DESDE, "hasta": HASTA,
        "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "fuente": "IRSA vía prototipo D2 (/grid y /frame)", "grid": grid, "frames": frames,
    }
    p = SALIDA / f"{oid}.json"
    p.write_text(json.dumps(salida, separators=(",", ":")), encoding="utf-8")
    return f"{oid}: {len(frames)} fotos, {vacias} sin visita · {p.stat().st_size / 1e3:.0f} kB"


if __name__ == "__main__":
    for oid in sys.argv[1:] or OBJ:
        print(convertir(oid))
