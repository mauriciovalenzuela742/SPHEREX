"""Tests del paquete de la demo. IRSA nunca se consulta: cualquier intento de red falla el test."""
import json

import pytest
from fastapi.testclient import TestClient

from app import demo
from app.irsa import cache, config, cutouts, descarga, posicion, sia2
from app.main import app

CAMPOS = {c["id"]: c for c in posicion.cargar_campos()}
J2000 = {i: (c["ra_deg"], c["dec_deg"]) for i, c in CAMPOS.items()}
PROP = {i: tuple(round(v, 6) for v in posicion.posicion_en(c, 61000.0)) for i, c in CAMPOS.items()}


def _epoca(i):
    return {"id": f"obs{i}", "t": sia2.mjd_a_iso(61000 + i), "t_mjd": 61000.0 + i,
            "detector": "D3", "collection": "spherex_dr1",
            "access_url": f"https://ejemplo.invalido/{i}.fits", "pixel_scale_arcsec": 6.15}


@pytest.fixture(autouse=True)
def paquete(tmp_path, monkeypatch):
    """Paquete falso con los 5 campos, caché vacía y red prohibida."""
    destino = tmp_path / "demo"
    campos = []
    for cid, (ra, dec) in PROP.items():
        campos.append({"id": cid, "nombre": cid, "ra": ra, "dec": dec,
                       "ra_j2000": J2000[cid][0], "dec_j2000": J2000[cid][1], "size": 0.1,
                       "bands": [3], "modes": list(demo.MODOS), "n_epochs": 1, "n_visits": 1})
        (destino / cid).mkdir(parents=True)
        (destino / cid / "epochs.json").write_text(json.dumps([_epoca(1)]))
        for modo in demo.MODOS:
            (destino / cid / f"frames_b3_{modo}.json").write_text(json.dumps(
                {"ra": ra, "dec": dec, "size": 0.1, "band": 3, "mode": modo, "n_frames": 1,
                 "frames": [{"png": "data:image/png;base64,AA"}], "pending": [], "warnings": []}))
    (destino / "manifest.json").write_text(json.dumps({"campos": campos}))
    monkeypatch.setattr(demo, "DIR", destino)
    cache_dir = tmp_path / "cache"
    for modulo in (cache, cutouts):
        monkeypatch.setattr(modulo, "CACHE", cache_dir, raising=False)
    monkeypatch.setattr(config, "CACHE", cache_dir)
    monkeypatch.setenv("OFFLINE", "1")

    def sin_red(*a, **k):
        raise AssertionError("se tocó la red")

    monkeypatch.setattr(sia2, "_consultar", sin_red)
    monkeypatch.setattr(descarga, "pedir", sin_red)
    monkeypatch.setattr(cutouts, "pedir", sin_red)


cliente = TestClient(app)


@pytest.mark.parametrize("cid", list(CAMPOS))
@pytest.mark.parametrize("origen", [J2000, PROP], ids=["j2000", "propagada"])
def test_frames_de_los_5_campos_sin_red(cid, origen):
    ra, dec = origen[cid]
    for modo in demo.MODOS:
        r = cliente.get("/api/frames", params={"ra": ra, "dec": dec, "size": 0.1, "band": 3,
                                               "mode": modo})
        j = r.json()
        assert r.status_code == 200 and j["source"] == "precalculado"
        assert j["mode"] == modo and j["pending"] == [] and j["n_frames"] == 1


@pytest.mark.parametrize("cid", list(CAMPOS))
def test_epochs_de_los_5_campos_sin_red(cid):
    ra, dec = J2000[cid]
    r = cliente.get("/api/epochs", params={"ra": ra, "dec": dec, "size": 0.1})
    j = r.json()
    assert r.status_code == 200 and j["source"] == "precalculado" and j["n_epochs"] == 1


def test_j2000_avisa_que_se_centro_en_la_posicion_propagada():
    ra, dec = J2000["wise_0855"]
    j = cliente.get("/api/frames", params={"ra": ra, "dec": dec, "size": 0.1, "band": 3}).json()
    assert any("propagada" in w for w in j["warnings"])
    ra, dec = PROP["wise_0855"]
    j = cliente.get("/api/frames", params={"ra": ra, "dec": dec, "size": 0.1, "band": 3}).json()
    assert j["warnings"] == []


def test_coordenada_al_azar_cae_al_flujo_vivo_y_falla_claro_offline():
    r = cliente.get("/api/frames", params={"ra": 10, "dec": 10, "size": 0.1, "band": 3})
    assert r.status_code == 503 and "IRSA" in r.json()["detail"]


@pytest.mark.parametrize("extra", [{"size": 0.2}, {"band": 4}, {"stretch": "linear"},
                                   {"from": "2025-01-01T00:00:00Z"}, {"per_visit": 2},
                                   {"epochs": "obs1D3"}])
def test_otros_parametros_no_devuelven_el_paquete(extra):
    ra, dec = PROP["barnard"]
    q = {"ra": ra, "dec": dec, "size": 0.1, "band": 3, **extra}
    r = cliente.get("/api/frames", params=q)
    assert r.status_code == 503      # OFFLINE=1 y sin caché: ya no es el paquete


def test_api_demo_lista_los_campos_y_sin_paquete_va_vacio(monkeypatch, tmp_path):
    assert {c["id"] for c in cliente.get("/api/demo").json()["campos"]} == set(CAMPOS)
    monkeypatch.setattr(demo, "DIR", tmp_path / "no_existe")
    assert cliente.get("/api/demo").json() == {"campos": []}
