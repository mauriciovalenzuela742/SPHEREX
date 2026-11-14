"""Tests de D2 (fotogramas y espectro). Sin red: datos sintéticos."""

import numpy as np
import pytest
from astropy.io import fits
from fastapi.testclient import TestClient

from app.frames import rangos
from app.frames.procesar import Fotograma, agrupar_barridos, sumar_ponderado
from app.frames.servicio import repartir
from app.main import app
from app.spectrum.fotometria import fotometria, pesos_apertura


def _foto(datos, var=None):
    n = datos.shape[0]
    return Fotograma(
        "e1",
        "2025-01-01T00:00:00Z",
        60000.0,
        "spherex_dr1",
        datos,
        np.ones((n, n), bool),
        4.1,
        0.03,
        None,
        "rangos",
        varianza=var,
    )


def test_suma_ponderada_por_inversa_de_la_varianza():
    a = np.zeros((9, 9))
    b = np.zeros((9, 9))
    a[4, 4], b[4, 4] = 10.0, 20.0
    suma, var = sumar_ponderado([_foto(a, np.ones((9, 9))), _foto(b, np.full((9, 9), 9.0))])
    # (10/1 + 20/9) / (1/1 + 1/9) = 11 ; varianza = 1 / (1 + 1/9) = 0,9
    assert suma.datos[4, 4] == pytest.approx(11.0)
    assert var[4, 4] == pytest.approx(0.9)
    assert suma.n_stacked == 2


def test_suma_sin_varianza_usa_ruido_estimado_y_avisa():
    rng = np.random.default_rng(1)
    suma, _ = sumar_ponderado(
        [_foto(rng.normal(0, 1, (20, 20))), _foto(rng.normal(0, 1, (20, 20)))]
    )
    assert any("sin VARIANCE" in a for a in suma.avisos)


def test_agrupar_barridos_separa_a_mas_de_60_dias():
    ep = [{"t_mjd": m} for m in (0, 1, 3, 180, 182, 400)]
    assert [len(b) for b in agrupar_barridos(ep)] == [3, 2, 1]


def test_repartir_incluye_extremos():
    assert repartir(list(range(10)), 3) == [0, 4, 9]
    assert repartir([1, 2], 5) == [1, 2]


def test_fotometria_recupera_el_flujo_de_una_gaussiana():
    n, s, flujo = 41, 1.2, 50.0
    yy, xx = np.mgrid[0:n, 0:n]
    xc, yc = 20.3, 19.6
    img = flujo * np.exp(-((xx - xc) ** 2 + (yy - yc) ** 2) / (2 * s * s)) / (2 * np.pi * s * s)
    img += 5.0  # fondo constante: lo saca el anillo
    var = np.full((n, n), 0.01)
    r = fotometria(img, var, xc, yc, 5.0, 7.0, 10.0, omega_sr=1e-9)  # 1e-9 sr -> mJy = suma
    assert r["flux_mjy"] == pytest.approx(flujo, rel=0.01)
    assert r["err_mjy"] == pytest.approx(
        np.sqrt(np.sum(pesos_apertura(img.shape, xc, yc, 5.0) ** 2) * 0.01), rel=0.2
    )


def test_fotometria_rechaza_apertura_saturada():
    img = np.zeros((21, 21))
    img[10, 10] = np.nan
    r = fotometria(img, None, 10, 10, 2, 4, 7, 1e-9)
    assert r["flux_mjy"] is None and "satur" in r["motivo"]


def test_separar_multipart_respeta_el_orden_pedido():
    ct = "multipart/byteranges; boundary=XYZ"
    cuerpo = (
        b"--XYZ\r\nContent-Type: application/octet-stream\r\nContent-Range: bytes 100-102/999\r\n\r\nabc\r\n"
        b"--XYZ\r\nContent-Range: bytes 10-11/999\r\n\r\nde\r\n--XYZ--\r\n"
    )
    assert rangos.separar_multipart(cuerpo, ct, [(10, 11), (100, 102)]) == [b"de", b"abc"]


def test_cabeceras_y_tamano_de_datos():
    p = fits.PrimaryHDU().header.tostring().encode()
    h = fits.ImageHDU(np.zeros((3, 4), np.float32), name="IMAGE").header
    cabs, fin = rangos.separar_cabeceras(p + h.tostring().encode(), 2)
    assert cabs[1]["EXTNAME"] == "IMAGE" and fin % 2880 == 0
    assert rangos.tamano_datos(cabs[1]) == 3 * 4 * 4


def test_spectrum_valida_bandas_sin_consultar_irsa():
    r = TestClient(app).get("/api/spectrum", params={"ra": 10, "dec": 10, "bands": "9"})
    assert r.status_code == 422


def test_frames_rechaza_size_mayor_al_limite():
    r = TestClient(app).get("/api/frames", params={"ra": 10, "dec": 10, "size": 0.6})
    assert r.status_code == 422
