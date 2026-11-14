"""Mueve la zona i18n a su destino final. Por defecto solo muestra qué haría (--aplicar para ejecutar).

Destino: en → rutas originales (inglés por defecto, sustituye al original en español);
         es, zh, de, it → docs/i18n/<idioma>/<ruta>. Los .md de `.claude/` NO se promueven
         (configuración viva): se quedan en i18n/<idioma>/.claude/.
El español original sigue existiendo en docs/i18n/es/, así que nada se pierde. Los enlaces y la
cabecera se recalculan para la nueva ubicación.
"""
from __future__ import annotations

import argparse
import posixpath
import re
import sys

from comun import (IDIOMAS, RAIZ, archivos_origen, cabecera, final, poner_cabecera, quitar_cabecera,
                   reescribir_destinos, staging)


def destino_final(lang: str, rel: str) -> str:
    return staging(lang, rel) if rel.startswith(".claude/") else final(lang, rel)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--aplicar", action="store_true")
    a = ap.parse_args()
    md = archivos_origen()
    plan = [(lang, rel, staging(lang, rel), destino_final(lang, rel)) for lang in IDIOMAS for rel in md]
    mover = [p for p in plan if p[2] != p[3]]
    print(f"{len(mover)} archivos se mueven; {len(plan) - len(mover)} se quedan en i18n/ (.claude).")
    for lang, rel, origen, destino in mover[:8]:
        print(f"  {origen}  →  {destino}")
    if not a.aplicar:
        print("(dry-run) usa --aplicar para ejecutar. Se sobrescriben los originales en español: "
              "ya están copiados en i18n/es/ → docs/i18n/es/.")
        return 0
    rel_a_final = {(l, r): d for l, r, _, d in plan}

    def mapa_de(lang):
        def mapa(p):
            m = re.match(rf"i18n/{lang}/(.*)", p)
            return destino_final(lang, m.group(1)) if m and (lang, m.group(1)) in rel_a_final else p
        return mapa

    for lang, rel, origen, destino in plan:
        texto = quitar_cabecera((RAIZ / origen).read_text(encoding="utf-8"))
        texto = reescribir_destinos(texto, posixpath.dirname(origen), posixpath.dirname(destino), mapa_de(lang))
        texto = poner_cabecera(texto, cabecera(lang, rel, lambda l, r=rel: destino_final(l, r)))
        (RAIZ / destino).parent.mkdir(parents=True, exist_ok=True)
        (RAIZ / destino).write_text(texto, encoding="utf-8")
        if origen != destino:
            (RAIZ / origen).unlink()
    print("hecho. Revisa con `git status` y ejecuta los tests antes de commitear.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
