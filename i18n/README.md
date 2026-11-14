# i18n — documentación en 5 idiomas (zona independiente) / documentation in 5 languages (staging)

**Estado / Status:** staging. Nada fuera de `i18n/` cambia hasta ejecutar `promover.py --aplicar`.
Traducciones automáticas **pendientes de revisión nativa** / machine translations **pending native review**.
Fecha de la documentación / documentation date: **2026-11-14 15:35**.

| Carpeta | Idioma | Origen |
|---|---|---|
| `en/` | English (**por defecto / default**) | traducción |
| `es/` | Español | copia fiel de los originales |
| `zh/` `de/` `it/` | 中文 · Deutsch · Italiano | traducción |

Cada idioma espeja las rutas del repositorio: `i18n/de/docs/03_ARQUITECTURA.md` es la versión alemana de
`docs/03_ARQUITECTURA.md`. **Los enlaces de cada archivo llevan solo a archivos del mismo idioma** (la única
excepción es el selector de idioma de la cabecera). Los recursos que no son `.md` (código, datos, imágenes)
se enlazan al original.

## Qué incluye (49 archivos × 5 idiomas)
Todo el `.md` propio del equipo, incluida la configuración de Claude (`.claude/agents`, `commands`, `skills`
propias). **No incluye** `.claude/skills/{astropy,matplotlib,scikit-learn}` (material de terceros, fase 2).
Las copias de `.claude/` son solo de referencia: **no se promueven**, porque `.claude/` es configuración viva.

## Herramientas (`_tools/`, solo biblioteca estándar de Python)
```bash
python3 i18n/_tools/reescribir_enlaces.py   # enlaces al mismo idioma + cabecera + anclajes (idempotente)
python3 i18n/_tools/validar.py              # mismos archivos en los 5 idiomas, enlaces, cruces, URLs, fecha
python3 i18n/_tools/promover.py             # dry-run: muestra qué se movería
python3 i18n/_tools/promover.py --aplicar   # mueve el staging a su destino final
```
Reglas de traducción y glosario: [`_tools/traducir.md`](_tools/traducir.md).

## Destino final al promover
- `en/` → rutas originales (el inglés pasa a ser el idioma por defecto: reemplaza a los `.md` en español).
- `es/ zh/ de/ it/` → `docs/i18n/<idioma>/<ruta>`. El español original queda en `docs/i18n/es/`.
- `.claude/**` → se queda en `i18n/<idioma>/.claude/`.

Promover **reemplaza `README.md`, `AGENTS.md` y `CLAUDE.md` por su versión en inglés**, que leen el equipo y
sus agentes: hacerlo es una decisión del equipo y va en un PR aparte.
