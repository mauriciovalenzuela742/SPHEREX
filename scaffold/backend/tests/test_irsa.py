"""Tests de D1. IRSA nunca se consulta: se simula la búsqueda y se usa un caché temporal."""
import pytest
from fastapi.testclient import TestClient

from app.irsa import cache, config, cutouts, posicion, sia2
from app.main import app

CAMPOS = {c["id"]: c for c in posicion.cargar_campos()}


@pytest.fixture(autouse=True)
def cache_temporal(tmp_path, monkeypatch):
    for modulo in (cache, cutouts):
        monkeypatch.setattr(modulo, "CACHE", tmp_path, raising=False)
    monkeypatch.setattr(config, "CACHE", tmp_path)
    monkeypatch.delenv("OFFLINE", raising=False)


def _fila(i, mjd, col="spherex_dr1"):
    return {"id": f"obs{i}", "t": sia2.mjd_a_iso(mjd), "t_mjd": mjd, "detector": "D3",
            "collection": col, "access_url": f"https://ejemplo.invalido/{i}.fits",
            "pixel_scale_arcsec": 6.15}


@pytest.mark.parametrize("campo", list(CAMPOS))
def test_posicion_propagada_se_aleja_de_j2000(campo):
    c = CAMPOS[campo]
    ra, dec = posicion.posicion_en(c, 61000.0)
    assert (ra, dec) != pytest.approx((c["ra_deg"], c["dec_deg"]), abs=1e-9)


def test_wise_0855_coincide_con_posicion_calculada_del_yaml():
    # data/campos_de_prueba.yml: 2025.40 -> ra 133.761129, dec -7.242298 (SIMBAD propagado)
    mjd_2025_40 = posicion.MJD_J2000 + (2025.40 - 2000.0) * 365.25
    ra, dec = posicion.posicion_en(CAMPOS["wise_0855"], mjd_2025_40)
    assert ra == pytest.approx(133.761129, abs=2e-4)
    assert dec == pytest.approx(-7.242298, abs=2e-4)


def test_epocas_ordenadas_y_cacheadas(monkeypatch):
    llamadas = []

    def falso(col, ra, dec):
        llamadas.append(col)
        return [_fila(1, 61100, col)] if col == "spherex_qr3" else [_fila(2, 60900, col)]

    monkeypatch.setattr(sia2, "_consultar", falso)
    r1 = sia2.buscar_epocas(133.76, -7.24, 0.1)
    assert [e["id"] for e in r1] == ["obs2", "obs1"]       # por tiempo, no por colección
    sia2.buscar_epocas(133.76, -7.24, 0.1)
    assert len(llamadas) == 2                              # la segunda salió de caché


def test_offline_sin_cache_falla_claro(monkeypatch):
    monkeypatch.setenv("OFFLINE", "1")
    with pytest.raises(cache.FueraDeCache):
        sia2.buscar_epocas(1.0, 1.0, 0.1)


def test_cutout_se_descarga_una_sola_vez(monkeypatch):
    n = []

    class R:
        content = b"SIMPLE"

    monkeypatch.setattr(cutouts, "pedir", lambda *a, **k: n.append(1) or R())
    e = _fila(1, 61000)
    p1 = cutouts.cutout(e, 133.76, -7.24)
    p2 = cutouts.cutout(e, 133.76, -7.24)
    assert p1 == p2 and p1.read_bytes() == b"SIMPLE" and len(n) == 1


def test_api_epochs_respeta_el_contrato(monkeypatch):
    monkeypatch.setattr(sia2, "_consultar", lambda c, ra, dec: [_fila(1, 61000, c)])
    r = TestClient(app).get("/api/epochs", params={"ra": 133.76, "dec": -7.24, "size": 0.1})
    j = r.json()
    assert r.status_code == 200
    assert set(j) >= {"ra", "dec", "size", "n_epochs", "time_range", "bands_available", "epochs",
                      "source"}
    assert set(j["epochs"][0]) >= {"id", "t", "band", "detector", "collection", "access_url"}


def test_api_epochs_filtra_por_fecha(monkeypatch):
    monkeypatch.setattr(
        sia2, "_consultar", lambda c, ra, dec: [_fila(1, 60900, c), _fila(2, 61100, c)])
    desde = sia2.mjd_a_iso(61000)
    j = TestClient(app).get("/api/epochs", params={"ra": 1, "dec": 1, "from": desde}).json()
    assert {e["id"] for e in j["epochs"]} == {"obs2"}
