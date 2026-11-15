"""Comentarios del público: GET/POST /api/comments.

Dónde se guardan:
- Con `COMENTARIOS_GITHUB_TOKEN` (producción): en el repositorio de GitHub, con un commit por
  comentario a `COMENTARIOS_GITHUB_RUTA` en la rama `COMENTARIOS_GITHUB_RAMA`. Por defecto es una
  rama propia, «comentarios», para no disparar despliegues de Vercel ni llenar `main` de
  commits; se crea sola desde `main` si no existe.
- Sin token (desarrollo): en el mismo archivo del repo, local (`COMENTARIOS_ARCHIVO`, por defecto
  `scaffold/frontend/public/comentarios.json`): queda listo para hacer commit. En Vercel el disco es
  temporal, así que ahí sin token se responde 503 en vez de perder comentarios en silencio.

Formato del archivo (el mismo que `scaffold/frontend/public/comentarios.json`):
  {"comentarios": [{"id": "...", "nombre": "...", "fecha": "AAAA-MM-DD", "texto": "..."}, ...]}

Límites: nombre ≤ 60 y texto ≤ 600 caracteres, sin enlaces, campo trampa para bots y a lo más
`LIMITE_POR_MINUTO` envíos por IP y minuto (por instancia; es un freno, no una garantía).
"""

from __future__ import annotations

import base64
import json
import os
import re
import threading
import time
import uuid
from datetime import UTC, datetime
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

MAX_NOMBRE = 60
MAX_TEXTO = 600
MAX_GUARDADOS = 500
LIMITE_POR_MINUTO = 3
CACHE_S = 30.0

RAIZ = Path(__file__).resolve().parents[3]
API_GH = "https://api.github.com"
_ENLACE = re.compile(r"(https?://|www\.)", re.IGNORECASE)

router = APIRouter()
_candado = threading.Lock()
_envios: dict[str, list[float]] = {}
_cache: dict[str, object] = {"t": 0.0, "lista": None}


class Nuevo(BaseModel):
    nombre: str = ""
    texto: str = ""
    # Campo trampa: invisible en el formulario; un bot que lo llena queda fuera.
    sitio: str = ""


class SinAlmacen(Exception):
    """No hay dónde guardar de forma persistente."""


# ── Configuración ──────────────────────────────────────────────────────────────────────────────


def _token() -> str:
    return os.getenv("COMENTARIOS_GITHUB_TOKEN", "").strip()


def _repo() -> str:
    return os.getenv("COMENTARIOS_GITHUB_REPO", "mauriciovalenzuela742/SPHEREX")


def _rama() -> str:
    return os.getenv("COMENTARIOS_GITHUB_RAMA", "comentarios")


def _ruta_repo() -> str:
    return os.getenv("COMENTARIOS_GITHUB_RUTA", "scaffold/frontend/public/comentarios.json")


def _archivo_local() -> Path:
    return Path(
        os.getenv(
            "COMENTARIOS_ARCHIVO",
            str(RAIZ / "scaffold" / "frontend" / "public" / "comentarios.json"),
        )
    )


def _cliente() -> httpx.Client:
    return httpx.Client(timeout=15.0)


def _cabeceras() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_token()}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


# ── Validación ─────────────────────────────────────────────────────────────────────────────────


def validar(n: Nuevo) -> tuple[str, str]:
    """Devuelve (nombre, texto) limpios o lanza HTTPException 422 con un motivo legible."""
    if n.sitio.strip():
        raise HTTPException(422, "No se pudo enviar el comentario.")
    nombre = " ".join(n.nombre.split())
    texto = n.texto.strip()
    if not nombre or not texto:
        raise HTTPException(422, "Faltan el nombre o el comentario.")
    if len(nombre) > MAX_NOMBRE:
        raise HTTPException(422, f"El nombre puede tener hasta {MAX_NOMBRE} caracteres.")
    if len(texto) > MAX_TEXTO:
        raise HTTPException(422, f"El comentario puede tener hasta {MAX_TEXTO} caracteres.")
    if _ENLACE.search(nombre) or _ENLACE.search(texto):
        raise HTTPException(422, "Los comentarios no pueden llevar enlaces.")
    return nombre, texto


def _limitar(ip: str) -> None:
    ahora = time.monotonic()
    with _candado:
        recientes = [t for t in _envios.get(ip, []) if ahora - t < 60]
        if len(recientes) >= LIMITE_POR_MINUTO:
            raise HTTPException(429, "Demasiados comentarios seguidos: espera un minuto.")
        recientes.append(ahora)
        _envios[ip] = recientes


def _lista_de(d: object) -> list[dict]:
    if isinstance(d, dict) and isinstance(d.get("comentarios"), list):
        return [c for c in d["comentarios"] if isinstance(c, dict)]
    return []


# ── Almacén local ──────────────────────────────────────────────────────────────────────────────


def _leer_local() -> tuple[dict, list[dict]]:
    p = _archivo_local()
    if not p.exists():
        return {"comentarios": []}, []
    d = json.loads(p.read_text(encoding="utf-8"))
    return (d if isinstance(d, dict) else {"comentarios": []}), _lista_de(d)


def _guardar_local(c: dict) -> None:
    if os.getenv("VERCEL"):
        raise SinAlmacen(
            "En Vercel falta COMENTARIOS_GITHUB_TOKEN: el disco es temporal y el comentario "
            "se perdería."
        )
    with _candado:
        d, lista = _leer_local()
        d["comentarios"] = (lista + [c])[-MAX_GUARDADOS:]
        p = _archivo_local()
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(".tmp")
        tmp.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        tmp.replace(p)


# ── Almacén en GitHub ──────────────────────────────────────────────────────────────────────────


def _url_contenido() -> str:
    return f"{API_GH}/repos/{_repo()}/contents/{_ruta_repo()}"


def _leer_github(cl: httpx.Client) -> tuple[dict, list[dict], str | None]:
    """(documento, lista, sha). Si el archivo o la rama no existen: documento vacío y sha None."""
    r = cl.get(_url_contenido(), params={"ref": _rama()}, headers=_cabeceras())
    if r.status_code == 404:
        return {"comentarios": []}, [], None
    r.raise_for_status()
    j = r.json()
    d = json.loads(base64.b64decode(j["content"]).decode("utf-8"))
    return (d if isinstance(d, dict) else {"comentarios": []}), _lista_de(d), j["sha"]


def _asegurar_rama(cl: httpx.Client) -> None:
    """Crea la rama desde main si no existe."""
    base = f"{API_GH}/repos/{_repo()}/git"
    if cl.get(f"{base}/ref/heads/{_rama()}", headers=_cabeceras()).status_code == 200:
        return
    r = cl.get(f"{base}/ref/heads/main", headers=_cabeceras())
    r.raise_for_status()
    sha = r.json()["object"]["sha"]
    r = cl.post(
        f"{base}/refs", headers=_cabeceras(), json={"ref": f"refs/heads/{_rama()}", "sha": sha}
    )
    if r.status_code not in (201, 422):  # 422: otra petición la creó recién
        r.raise_for_status()


def _guardar_github(c: dict) -> list[dict]:
    with _cliente() as cl:
        _asegurar_rama(cl)
        for _ in range(3):  # 409/422 = otro comentario entró entremedio: releer y reintentar
            d, lista, sha = _leer_github(cl)
            nueva = (lista + [c])[-MAX_GUARDADOS:]
            d["comentarios"] = nueva
            cuerpo = {
                "message": f"comentario de {c['nombre']}",
                "content": base64.b64encode(
                    (json.dumps(d, ensure_ascii=False, indent=2) + "\n").encode()
                ).decode(),
                "branch": _rama(),
            }
            if sha:
                cuerpo["sha"] = sha
            r = cl.put(_url_contenido(), headers=_cabeceras(), json=cuerpo)
            if r.status_code in (200, 201):
                return nueva
            if r.status_code not in (409, 422):
                r.raise_for_status()
        raise HTTPException(503, "Hay muchos comentarios a la vez: inténtalo de nuevo.")


# ── Rutas ──────────────────────────────────────────────────────────────────────────────────────


def _publicos(lista: list[dict]) -> list[dict]:
    claves = ("id", "nombre", "fecha", "texto")
    return [{k: c.get(k) for k in claves} for c in reversed(lista)]  # más recientes primero


@router.get("/api/comments")
def listar() -> dict:
    """Comentarios guardados, del más reciente al más antiguo."""
    try:
        if _token():
            ahora = time.monotonic()
            if _cache["lista"] is None or ahora - float(_cache["t"]) > CACHE_S:  # type: ignore[arg-type]
                with _cliente() as cl:
                    _cache["lista"] = _leer_github(cl)[1]
                _cache["t"] = ahora
            lista = _cache["lista"]  # type: ignore[assignment]
        else:
            lista = _leer_local()[1]
    except (httpx.HTTPError, json.JSONDecodeError, KeyError, ValueError) as e:
        raise HTTPException(503, f"No se pudieron leer los comentarios: {e}") from e
    return {"comentarios": _publicos(lista), "guardado": "github" if _token() else "local"}  # type: ignore[arg-type]


@router.post("/api/comments", status_code=201)
def comentar(n: Nuevo, request: Request) -> dict:
    """Valida y guarda un comentario; lo devuelve tal como quedó."""
    nombre, texto = validar(n)
    ip = (
        (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?"))
        .split(",")[0]
        .strip()
    )
    _limitar(ip)
    c = {
        "id": uuid.uuid4().hex[:12],
        "nombre": nombre,
        "fecha": datetime.now(UTC).strftime("%Y-%m-%d"),
        "texto": texto,
    }
    try:
        if _token():
            _cache["lista"] = _guardar_github(c)
            _cache["t"] = time.monotonic()
        else:
            _guardar_local(c)
    except SinAlmacen as e:
        raise HTTPException(503, str(e)) from e
    except (httpx.HTTPError, json.JSONDecodeError, KeyError, ValueError) as e:
        raise HTTPException(503, f"No se pudo guardar el comentario: {e}") from e
    return c
