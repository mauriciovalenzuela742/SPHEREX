# Reporte preliminar — revisión de deriva con EGM

**Fecha:** 2026-11-15 · **Repositorio revisado:** `mauriciovalenzuela742/SPHEREX`, `main` en `5776643`
**Herramienta:** [elephant-goldfish-model](https://github.com/vladimiracunadev-create/elephant-goldfish-model) (EGM), clon local en `C:\fork\elephant-goldfish-model`, commit `e474732`, rama `main` limpia y al día con su origen.
**Hallazgos detallados:** [`ISSUES.md`](../ISSUES.md)

Es un **preflight**, no una certificación. Dice qué se comprobó, cómo, y qué quedó sin comprobar.

## Conclusión

El proyecto está sano en lo que se pudo mirar sin ejecutarlo, pero **el contrato de la API (`docs/03`) y el
código ya no coinciden**: una ruta documentada no existe, dos tablas de parámetros prometen más de lo que el
backend acepta y el visor depende de rutas que el contrato declara «fuera de contrato». Nada de eso impide hoy la
demo; sí rompe la promesa de la regla 4 («si cambias el contrato, cámbialo primero en el documento»).
**Veredicto global: corregir antes de ampliar pruebas** (por el contrato, no por un fallo en pantalla).
Se encontraron 10 issues: 1 alta, 6 medias, 3 bajas.

## Alcance y método

- **Qué hice.** Apliqué a mano el procedimiento de la skill `egm-drift-report` de EGM: leer el documento, localizar
  el código, comparar y listar solo las diferencias. Documentos cubiertos: `AGENTS.md`, `docs/03_ARQUITECTURA.md`
  (contrato, caché, despliegue, URL), `deploy/README.md`. Código: `scaffold/backend/app/main.py`,
  `scaffold/frontend/src/state/url.ts`, `package.json`, `vercel.json`, `deploy/`, CI.
- **Qué no hice.** No lancé los revisores «pez dorado» de EGM (subagentes sin contexto) ni `/egm:egm-review`; el plugin
  no está instalado en esta sesión de Claude Code (el comando `claude` no existe en el shell). Los documentos
  `01, 02, 04–11` y `docs/adr` **no** se revisaron contra el código.
- **Entorno.** Windows 11, Python 3.12.9, Node 24.11.1. El backend del proyecto apunta a Python 3.11.

## Evidencia por nivel

| Nivel | Qué | Resultado |
|---|---|---|
| Inspección estática | Contrato ↔ `main.py`; URL ↔ `url.ts`; `deploy/`; CI; versiones fijadas | 10 diferencias (ver `ISSUES.md`) |
| Build/integración | `npx tsc --noEmit` en `scaffold/frontend` | Termina sin errores. **No** prueba que el visor sea usable |
| Automatizada | `pytest` del backend, venv aislado, versiones fijadas, Python 3.12.9 | 46 pasan, 0 fallan (1 aviso de deprecación de anyio). Las pruebas no tocan IRSA |
| Automatizada | `ruff check .` (0.8.6) | 17 avisos, todos E501 (línea larga); ninguno funcional |
| Automatizada | Pruebas del propio EGM | **No ejecutada** |
| Funcional interactiva | Visor, API viva, IRSA, producción en Vercel | **No ejecutada** |

## Veredicto por superficie

| Superficie | Veredicto | Por qué |
|---|---|---|
| Contrato / documentación | Corregir antes de ampliar pruebas | Issues 1–4, 8 |
| Backend (comportamiento) | Continuar | 46 pruebas pasan; falta probar contra IRSA real y la API viva |
| Frontend | Continuar | Tipos limpios; no se operó la interfaz |
| Despliegue | Bloqueado por entorno | No probé producción ni IRSA (sin autorización para tocar el destino) |

## Hallazgos principales

1. **Alta — `/api/resolve`** está en el contrato (y `?target=` en la URL) y no existe en el backend. Recomiendo
   bajarlo del contrato si no hay tiempo de implementarlo.
2. **Media — Parámetros de `/api/frames`** (`band=all`, `cmap`, `stretch` sqrt/log/zscale) no se aceptan: 422.
3. **Media — URL del visor** no lleva `target/fps/stretch/mode`; sí lleva `mision/tutorial/ciencia/vista`, que el
   documento no menciona.
4. **Media — `/api/grid` y `/api/frame`** sostienen el Explorador pero el contrato las llama del prototipo.
5. **Media — `_banda()`** deduce la banda del nombre y se declara «NO verificado contra IRSA»; si falla, descarta la
   época en silencio.
6. **Media — Despliegue manual** del backend: producción puede diverger de `main` sin que nada lo avise.
7. **Media (por confirmar) — Precalentado al arrancar** sin gancho visible.
8–10. **Baja** — salud/OpenAPI desactualizados, CI laxo (`|| true`, sin pruebas de frontend), CORS por confirmar.

## Qué no se ejecutó y por qué

- **Pruebas propias de EGM** (`pytest tests/unit`): no corridas. No afectan los hallazgos de SPHEREX, solo el
  estado del clon de EGM.
- **Entorno temporal:** los `venv` de la carpeta temporal de la sesión (`venv` vacío y `venv2` con las dependencias
  del backend) pueden borrarse; no están en el repo.
- **Las 46 pruebas no cubren** lo que señalan los issues 1–5 (rutas del contrato, parámetros rechazados,
  `_banda()` con detectores reales).
- **Visor, API y producción:** no operados. Los 10 issues son lectura, no reproducción.
- **Archivos escritos:** solo `ISSUES.md` y este reporte. Sin commit, sin rama, sin push, sin issues en GitHub.

## Siguiente nivel recomendado

1. Decidir los issues 1–4 (contrato): es trabajo de documento, una hora.
2. Añadir una prueba que fije las rutas que el frontend usa (issue 4) y quitar el `|| true` de `ruff` tras acortar
   las 17 líneas.
3. Usar el subagente `explorador-datos` para cerrar el issue 5 con una consulta real a IRSA.
4. Con la demo cerca: `/chequeo-demo` sobre producción y comprobar que `spherex-api` corre lo que hay en `main`.
5. Si se quiere la revisión completa de EGM: instalar el plugin y correr `/egm:egm-drift-report docs/` y
   `/egm:egm-review docs/03_ARQUITECTURA.md`.
