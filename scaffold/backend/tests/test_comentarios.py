"""Tests de comentarios (app/comentarios.py).

Sin red: archivo temporal o GitHub simulado con MockTransport.
"""

import base64
import json

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app import comentarios as com


@pytest.fixture
def cliente(tmp_path, monkeypatch):
    monkeypatch.setenv("COMENTARIOS_ARCHIVO", str(tmp_path / "comentarios.json"))
    monkeypatch.delenv("COMENTARIOS_GITHUB_TOKEN", raising=False)
    monkeypatch.delenv("VERCEL", raising=False)
    com._envios.clear()
    com._cache.update(t=0.0, lista=None)
    app = FastAPI()
    app.include_router(com.router)
    return TestClient(app)


def test_guarda_y_lista_en_archivo_local(cliente, tmp_path):
    r = cliente.post(
        "/api/comments", json={"nombre": "  Ana   María ", "texto": "Muy buena\nherramienta"}
    )
    assert r.status_code == 201 and r.json()["nombre"] == "Ana María"
    cliente.post("/api/comments", json={"nombre": "Pedro", "texto": "Segundo"})
    j = cliente.get("/api/comments").json()
    assert [c["nombre"] for c in j["comentarios"]] == [
        "Pedro",
        "Ana María",
    ]  # más recientes primero
    assert j["guardado"] == "local"
    guardado = json.loads((tmp_path / "comentarios.json").read_text())
    assert len(guardado["comentarios"]) == 2


def test_conserva_las_instrucciones_del_archivo(cliente, tmp_path):
    (tmp_path / "comentarios.json").write_text(
        json.dumps({"_instrucciones": "x", "comentarios": []})
    )
    cliente.post("/api/comments", json={"nombre": "Ana", "texto": "Hola"})
    d = json.loads((tmp_path / "comentarios.json").read_text())
    assert d["_instrucciones"] == "x" and len(d["comentarios"]) == 1


@pytest.mark.parametrize(
    "cuerpo",
    [
        {"nombre": "", "texto": "Hola"},
        {"nombre": "Ana", "texto": "   "},
        {"nombre": "n" * 61, "texto": "Hola"},
        {"nombre": "Ana", "texto": "x" * 601},
        {"nombre": "Ana", "texto": "mira https://spam.example"},
        {"nombre": "Ana", "texto": "mira www.spam.example"},
        {"nombre": "Ana", "texto": "Hola", "sitio": "soy un bot"},
    ],
)
def test_rechaza_lo_que_no_cumple(cliente, cuerpo):
    assert cliente.post("/api/comments", json=cuerpo).status_code == 422


def test_limite_por_minuto(cliente):
    codigos = [
        cliente.post("/api/comments", json={"nombre": "Ana", "texto": f"c{i}"}).status_code
        for i in range(4)
    ]
    assert codigos == [201, 201, 201, 429]


def test_en_vercel_sin_token_no_finge_guardar(cliente, monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    r = cliente.post("/api/comments", json={"nombre": "Ana", "texto": "Hola"})
    assert r.status_code == 503 and "COMENTARIOS_GITHUB_TOKEN" in r.json()["detail"]


def test_con_token_hace_commit_en_github(cliente, monkeypatch):
    monkeypatch.setenv("COMENTARIOS_GITHUB_TOKEN", "tok")
    estado = {"archivo": None, "sha": None, "ramas": {"main"}, "puts": []}

    def manejar(req: httpx.Request) -> httpx.Response:
        assert req.headers["authorization"] == "Bearer tok"
        p = req.url.path
        if p.endswith("/git/ref/heads/comentarios"):
            return httpx.Response(200 if "comentarios" in estado["ramas"] else 404, json={})
        if p.endswith("/git/ref/heads/main"):
            return httpx.Response(200, json={"object": {"sha": "abc"}})
        if p.endswith("/git/refs"):
            estado["ramas"].add("comentarios")
            return httpx.Response(201, json={})
        if "/contents/" in p and req.method == "GET":
            if estado["archivo"] is None:
                return httpx.Response(404, json={})
            return httpx.Response(
                200,
                json={
                    "content": base64.b64encode(estado["archivo"].encode()).decode(),
                    "sha": estado["sha"],
                },
            )
        if "/contents/" in p and req.method == "PUT":
            b = json.loads(req.content)
            assert b["branch"] == "comentarios" and b.get("sha") == estado["sha"]
            estado["archivo"] = base64.b64decode(b["content"]).decode()
            estado["sha"] = f"sha{len(estado['puts'])}"
            estado["puts"].append(b["message"])
            return httpx.Response(201, json={})
        return httpx.Response(500)

    monkeypatch.setattr(
        com, "_cliente", lambda: httpx.Client(transport=httpx.MockTransport(manejar))
    )
    assert cliente.post("/api/comments", json={"nombre": "Ana", "texto": "Uno"}).status_code == 201
    assert (
        cliente.post("/api/comments", json={"nombre": "Pedro", "texto": "Dos"}).status_code == 201
    )
    assert "comentarios" in estado["ramas"]  # creó la rama desde main
    assert estado["puts"] == ["comentario de Ana", "comentario de Pedro"]
    assert [c["texto"] for c in json.loads(estado["archivo"])["comentarios"]] == ["Uno", "Dos"]
    j = cliente.get("/api/comments").json()
    assert j["guardado"] == "github" and [c["nombre"] for c in j["comentarios"]] == ["Pedro", "Ana"]
