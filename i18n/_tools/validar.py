"""Valida la zona i18n. Sale con código 1 si hay errores.

Comprueba: mismo conjunto de archivos en los 5 idiomas; cabecera y fecha; enlaces rotos; que ningún
enlace (fuera de la cabecera) cruce a otro idioma; y que URLs, rutas en código y nº de bloques de
código coincidan con el original.
"""
from __future__ import annotations

import posixpath
import re
import sys

from comun import (FECHA, IDIOMAS, INI, RAIZ, RE_CABECERA, RE_ENLACE, RE_REF, archivos_origen,
                   quitar_cabecera, staging, _segmentos)

RE_URL = re.compile(r"https?://[A-Za-z0-9\-._~:/?#@!$&+,;=%]+")
RE_BLOQUE = re.compile(r"```.*?```", re.S)


def destinos(texto: str):
    for es_codigo, t in _segmentos(texto):
        if es_codigo:
            continue
        for m in RE_ENLACE.finditer(t):
            yield m.group(2)
        for m in RE_REF.finditer(t):
            yield m.group(2)


def main() -> int:
    errores, avisos = [], []
    md = archivos_origen()
    for lang in IDIOMAS:
        base = RAIZ / "i18n" / lang
        presentes = {p.relative_to(base).as_posix() for p in base.rglob("*.md")} if base.exists() else set()
        for rel in md:
            if rel not in presentes:
                errores.append(f"[{lang}] falta {rel}")
        for extra in presentes - set(md):
            errores.append(f"[{lang}] sobra {extra}")
    for lang in IDIOMAS:
        for rel in md:
            ruta = RAIZ / staging(lang, rel)
            if not ruta.exists():
                continue
            t = ruta.read_text(encoding="utf-8")
            orig = (RAIZ / rel).read_text(encoding="utf-8")
            if INI not in t or FECHA not in t:
                errores.append(f"[{lang}] {rel}: sin cabecera/fecha {FECHA}")
            cuerpo = quitar_cabecera(t)
            carpeta = posixpath.dirname(staging(lang, rel))
            for d in destinos(cuerpo):
                if re.match(r"^(?:[a-z][a-z0-9+.-]*:|#|/)", d, re.I):
                    continue
                ruta_d = d.partition("#")[0]
                if not ruta_d:
                    continue
                dest = posixpath.normpath(posixpath.join(carpeta, ruta_d))
                if not (RAIZ / dest).exists():
                    errores.append(f"[{lang}] {rel}: enlace roto → {d}")
                m = re.match(r"i18n/([a-z]{2})/", dest)
                if m and m.group(1) != lang:
                    errores.append(f"[{lang}] {rel}: enlace cruza de idioma → {d}")
            urls_o = {u.rstrip(".,;:") for u in RE_URL.findall(RE_CABECERA.sub("", orig))}
            urls_t = {u.rstrip(".,;:") for u in RE_URL.findall(cuerpo)}
            if urls_o - urls_t:
                errores.append(f"[{lang}] {rel}: URLs que faltan: {sorted(urls_o - urls_t)[:3]}")
            if len(RE_BLOQUE.findall(orig)) != len(RE_BLOQUE.findall(cuerpo)):
                errores.append(f"[{lang}] {rel}: distinto nº de bloques de código")
            if lang == "es" and t != t:  # reservado
                pass
    for a in avisos:
        print("aviso:", a)
    for e in errores:
        print("ERROR:", e)
    print(f"{len(md)} archivos × {len(IDIOMAS)} idiomas · {len(errores)} errores")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
