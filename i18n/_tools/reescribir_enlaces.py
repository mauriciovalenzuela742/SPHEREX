"""Prepara/regenera la zona i18n: enlaces al mismo idioma + cabecera estándar (determinista).

  python i18n/_tools/reescribir_enlaces.py --copiar-es      # crea i18n/es/ desde los originales
  python i18n/_tools/reescribir_enlaces.py                  # procesa las traducciones ya escritas

Los traductores escriben i18n/<idioma>/<ruta> con los destinos de enlace SIN tocar (relativos al
original). Este script los convierte a rutas dentro de la carpeta del mismo idioma.
"""
from __future__ import annotations

import argparse
import posixpath
import sys

from comun import (IDIOMAS, RAIZ, archivos_origen, cabecera, poner_cabecera, quitar_anclajes_rotos,
                   quitar_cabecera, reescribir_destinos, staging)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--copiar-es", action="store_true", help="(obsoleto: es siempre se regenera desde el original)")
    ap.add_argument("--idiomas", nargs="*", default=IDIOMAS)
    a = ap.parse_args()
    md = set(archivos_origen())
    faltan = []
    for lang in a.idiomas:
        for rel in sorted(md):
            destino = RAIZ / staging(lang, rel)
            if lang == "es":
                texto = (RAIZ / rel).read_text(encoding="utf-8")
            elif destino.exists():
                texto = destino.read_text(encoding="utf-8")
            else:
                faltan.append(f"{lang}:{rel}")
                continue
            texto = quitar_cabecera(texto)
            # Los enlaces del texto crudo resuelven desde la carpeta del original; el mapa los
            # lleva a la copia del mismo idioma si el destino es otro .md traducido.
            mapa = lambda p, l=lang: staging(l, p) if p in md else p  # noqa: E731
            texto = reescribir_destinos(texto, posixpath.dirname(rel), posixpath.dirname(staging(lang, rel)), mapa,
                                        lambda r: (RAIZ / r).exists())
            texto = poner_cabecera(texto, cabecera(lang, rel, lambda l, r=rel: staging(l, r)))
            destino.parent.mkdir(parents=True, exist_ok=True)
            destino.write_text(texto, encoding="utf-8")
    # Segunda pasada: con todos los archivos ya escritos, quita los anclajes que dejó de existir.
    leer = lambda r: (RAIZ / r).read_text(encoding="utf-8") if (RAIZ / r).exists() else None  # noqa: E731
    for lang in a.idiomas:
        total = 0
        for rel in sorted(md):
            ruta = staging(lang, rel)
            if not (RAIZ / ruta).exists():
                continue
            texto, n = quitar_anclajes_rotos((RAIZ / ruta).read_text(encoding="utf-8"), ruta, leer)
            if n:
                (RAIZ / ruta).write_text(texto, encoding="utf-8")
                total += n
        print(f"[{lang}] anclajes sin destino quitados: {total}")
    if faltan:
        print(f"sin traducir ({len(faltan)}):", *faltan[:10], "…" if len(faltan) > 10 else "")
    return 0


if __name__ == "__main__":
    sys.exit(main())
