"""Utilidades compartidas de la zona i18n (solo biblioteca estándar)."""
from __future__ import annotations

import posixpath
import re
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
STAGING = "i18n"
IDIOMAS = ["en", "es", "zh", "de", "it"]          # en = idioma por defecto
FECHA = "2026-11-14 15:35"
# Material de terceros (Fase 2, otro PR): no se traduce aquí.
EXCLUIDOS = ("scikit-learn", "matplotlib", "astropy")

NOMBRE = {"en": "English", "es": "Español", "zh": "中文", "de": "Deutsch", "it": "Italiano"}
TEXTOS = {
    "en": ("Language", "Documentation date", "Source", "Machine-translated draft, pending native-speaker review."),
    "es": ("Idioma", "Fecha de la documentación", "Fuente", "Copia fiel del original en español."),
    "zh": ("语言", "文档日期", "来源", "机器翻译草稿，尚待母语人士审校。"),
    "de": ("Sprache", "Dokumentationsdatum", "Quelle", "Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend."),
    "it": ("Lingua", "Data della documentazione", "Fonte", "Bozza tradotta automaticamente, in attesa di revisione di un madrelingua."),
}
INI, FIN = "<!-- i18n-header -->", "<!-- /i18n-header -->"
RE_CABECERA = re.compile(re.escape(INI) + r".*?" + re.escape(FIN) + r"\n?", re.S)
# [texto](destino)  y  [ref]: destino   (el destino no puede tener espacios)
RE_ENLACE = re.compile(r"(\]\()([^)\s]+)((?:\s+\"[^\"]*\")?\))")
RE_REF = re.compile(r"^(\[[^\]]+\]:\s+)(\S+)", re.M)


def archivos_origen() -> list[str]:
    """Los .md del repo que entran en esta fase, sin la propia zona i18n."""
    sal = subprocess.run(["git", "ls-files", "*.md"], cwd=RAIZ, capture_output=True, text=True, check=True).stdout
    res = []
    for p in sal.splitlines():
        if p.startswith(STAGING + "/"):
            continue
        if any(f".claude/skills/{x}/" in p for x in EXCLUIDOS):
            continue
        res.append(p)
    return sorted(res)


def staging(lang: str, rel: str) -> str:
    return posixpath.join(STAGING, lang, rel)


def final(lang: str, rel: str) -> str:
    """Destino al promover: en reemplaza al original; los demás van a docs/i18n/<lang>/."""
    return rel if lang == "en" else posixpath.join("docs", "i18n", lang, rel)


def partir_frontmatter(texto: str) -> tuple[str, str]:
    """(front matter YAML con su cierre, resto). El front matter debe seguir siendo la primera cosa."""
    if texto.startswith("---\n"):
        fin = texto.find("\n---\n", 4)
        if fin != -1:
            return texto[: fin + 5], texto[fin + 5:]
    return "", texto


def _segmentos(texto: str):
    """Divide en (es_codigo, trozo): bloques ``` y `código` en línea no se tocan."""
    partes = re.split(r"(```.*?```|`[^`\n]*`)", texto, flags=re.S)
    for i, t in enumerate(partes):
        yield i % 2 == 1, t


def reescribir_destinos(texto: str, base_dir: str, nuevo_dir: str, mapa, existe=None) -> str:
    """Cambia cada destino relativo: lo resuelve desde `base_dir`, lo pasa por `mapa(ruta_repo)`
    y lo vuelve a escribir relativo a `nuevo_dir`. URLs, anclas y mailto no se tocan."""
    def nuevo(dest: str) -> str:
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|/)", dest, re.I):
            return dest
        ruta, _, ancla = dest.partition("#")
        if not ruta:
            return dest
        absoluta = posixpath.normpath(posixpath.join(base_dir, ruta))
        if existe and not existe(absoluta) and existe(posixpath.normpath(posixpath.join(nuevo_dir or ".", ruta))):
            return dest        # ya está reescrito para su nueva ubicación: no lo toques otra vez
        res = posixpath.relpath(mapa(absoluta), nuevo_dir or ".")
        if ruta.endswith("/") and not res.endswith("/"):
            res += "/"
        return res + (("#" + ancla) if ancla else "")

    salida = []
    for es_codigo, t in _segmentos(texto):
        if not es_codigo:
            t = RE_ENLACE.sub(lambda m: m.group(1) + nuevo(m.group(2)) + m.group(3), t)
            t = RE_REF.sub(lambda m: m.group(1) + nuevo(m.group(2)), t)
        salida.append(t)
    return "".join(salida)


def cabecera(lang: str, rel_origen: str, destino_de) -> str:
    """Bloque estándar de cabecera. `destino_de(lang)` da la ruta del archivo en cada idioma."""
    actual = destino_de(lang)
    d = posixpath.dirname(actual)
    cambia = []
    for l in IDIOMAS:
        if l == lang:
            cambia.append(f"**{NOMBRE[l]}**")
        else:
            cambia.append(f"[{NOMBRE[l]}]({posixpath.relpath(destino_de(l), d or '.')})")
    idioma, fecha, fuente, aviso = TEXTOS[lang]
    return (f"{INI}\n> 🌐 **{idioma}:** " + " · ".join(cambia) + "\n"
            f"> 🕒 **{fecha}:** {FECHA} · **{fuente}:** `{rel_origen}`\n"
            f"> ⚠️ {aviso}\n{FIN}\n\n")


def poner_cabecera(texto: str, bloque: str) -> str:
    fm, resto = partir_frontmatter(RE_CABECERA.sub("", texto))
    return fm + ("\n" if fm and not fm.endswith("\n\n") else "") + bloque + resto.lstrip("\n")


def quitar_cabecera(texto: str) -> str:
    return RE_CABECERA.sub("", texto)


def slug(titulo: str) -> str:
    """Anclaje de un título tal como lo calcula GitHub (aproximación: minúsculas, sin signos)."""
    t = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", titulo)          # [texto](url) -> texto
    t = re.sub(r"[`*_~]", "", t).strip().lower()
    t = re.sub(r"[^\w\- ]", "", t, flags=re.UNICODE)                    # quita signos y emojis
    return t.replace(" ", "-")


def anclajes(texto: str) -> set[str]:
    res, vistos = set(), {}
    for es_codigo, t in _segmentos(RE_CABECERA.sub("", texto)):
        if es_codigo:
            continue
        for m in re.finditer(r"^#{1,6}\s+(.+?)\s*#*\s*$", t, re.M):
            base = slug(m.group(1))
            n = vistos.get(base, 0)
            vistos[base] = n + 1
            res.add(base if n == 0 else f"{base}-{n}")
    return res


def quitar_anclajes_rotos(texto: str, ruta_actual: str, leer) -> tuple[str, int]:
    """Quita `#ancla` de los enlaces a otro .md cuyo título ya no existe (p. ej. por la traducción).
    `leer(ruta_repo)` devuelve el texto del destino o None. Devuelve (texto, nº de anclas quitadas)."""
    quitadas = 0

    def arreglar(dest: str) -> str:
        nonlocal quitadas
        if re.match(r"^(?:[a-z][a-z0-9+.-]*:|/)", dest, re.I) or "#" not in dest:
            return dest
        ruta, _, ancla = dest.partition("#")
        destino = ruta_actual if not ruta else posixpath.normpath(
            posixpath.join(posixpath.dirname(ruta_actual), ruta))
        if not destino.endswith(".md") or not ancla:
            return dest
        contenido = leer(destino)
        if contenido is None or ancla.lower() in anclajes(contenido):
            return dest
        quitadas += 1
        return ruta

    salida = []
    for es_codigo, t in _segmentos(texto):
        if not es_codigo:
            t = RE_ENLACE.sub(lambda m: m.group(1) + arreglar(m.group(2)) + m.group(3), t)
            t = RE_REF.sub(lambda m: m.group(1) + arreglar(m.group(2)), t)
        salida.append(t)
    return "".join(salida), quitadas
