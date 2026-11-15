# ISSUES — hallazgos de la revisión de deriva (EGM)

Origen: revisión de deriva documento ↔ código del repositorio, siguiendo el procedimiento de
`egm-drift-report` de [elephant-goldfish-model](https://github.com/vladimiracunadev-create/elephant-goldfish-model)
(clon local en `C:\fork\elephant-goldfish-model`, commit `e474732`).
Fecha: 2026-11-15 · Estado del repo revisado: `main` en `5776643` · Informe: [`docs/REPORTE_PRELIMINAR_EGM_2026-11-15.md`](docs/REPORTE_PRELIMINAR_EGM_2026-11-15.md)

**Evidencia.** Todos los hallazgos son de **inspección estática** (leí el documento y el código y los
comparé). Ninguno se reprodujo ejecutando el backend ni consultando IRSA. Cada issue lo dice.
Gravedad: Alta · Media · Baja (no hay Bloqueantes: no se observó nada que impida la demo).

Estos issues están **solo en este archivo**. No se abrieron en GitHub (regla 7 de `AGENTS.md`); si el equipo
los aprueba, se pasan uno a uno.

---

## Resumen

| # | Gravedad | Título | Dueño sugerido |
|---|---|---|---|
| 1 | Alta | `/api/resolve` está en el contrato y no existe en el backend | D1 (backend) |
| 2 | Media | `/api/frames`: `band=all`, `cmap` y `stretch` sqrt/log/zscale documentados, no implementados | D1 / D2 |
| 3 | Media | Contrato de URL (§4): `target`, `fps`, `stretch`, `mode` no se leen ni se escriben | V1 (frontend) |
| 4 | Media | `/api/grid` y `/api/frame` viven en el backend oficial, pero el contrato dice que son del prototipo | D1 + equipo |
| 5 | Media | `_banda()` deduce la banda del nombre del detector y su propio docstring dice «NO verificado contra IRSA» | D1 |
| 6 | Media | El backend oficial se despliega a mano y `main` no garantiza lo que corre en producción | Mauricio |
| 7 | Media | La caché «precalentada al arrancar» (docs/03 §5) no tiene gancho de arranque visible | D1 |
| 8 | Baja | `/api/health` y la descripción de OpenAPI no coinciden con el documento | D1 |
| 9 | Baja | CI: `ruff … \|\| true`, frontend sin pruebas, `npm install` frente a `npm ci` | quien lleve CI |
| 10 | Baja | CORS por defecto solo admite `localhost:5173`; falta confirmar la variable en producción | Mauricio |

---

## 1. `/api/resolve` está en el contrato y no existe en el backend — Alta

**Qué dice el documento.** `docs/03_ARQUITECTURA.md` §3 define `GET /api/resolve?q=<texto>` (resolución de
nombres por SIMBAD) y lo describe como lo que «hace que la herramienta sea usable por cualquiera». §4 añade
`?target=WISE+0855` como parte del contrato de URL.

**Qué hay en el código.** `scaffold/backend/app/main.py` expone `/health`, `/api/health`, `/api/epochs`,
`/api/grid`, `/api/demo`, `/api/frames`, `/api/frame` y `/api/spectrum`. No hay `resolve`. El frontend consulta
SIMBAD directo desde el navegador (`scaffold/frontend/src/sky/capas/simbad.ts`), y la nota del documento lo admite
solo para la consulta por cono (`ra`/`dec`), no para el texto `q`.

**Impacto.** Quien lea el contrato y construya algo (otro proyecto, un script, el jurado) recibirá 404. Es la pieza
del desafío que pide poder consultar por nombre.

**Qué hacer.** Dos opciones: (a) implementar `/api/resolve` (la forma de la respuesta ya está definida); o
(b) bajar `/api/resolve` y `?target=` del contrato y decir que la búsqueda por nombre es del cliente. Recomiendo (b)
si no hay tiempo: es una línea de documento y deja el contrato veraz.

## 2. `/api/frames`: parámetros documentados que el código no acepta — Media

**Documento (§3, tabla).** `band` ∈ `1–6` o `all`; `stretch` ∈ `linear, sqrt, log, asinh, zscale`;
`cmap` ∈ `gray, viridis, magma, inferno`. §5 incluye `cmap` en la clave de caché.

**Código (`main.py`, función `frames`).** `band: int` entre 1 y 6 (sin `all`); `stretch` con patrón
`^(asinh|linear)$`; no existe el parámetro `cmap`. El frontend ya lo sabe (`state/url.ts`: «`all` ya no existe»).
Un cliente que pida `stretch=log` recibe 422.

**Qué hacer.** Actualizar la tabla del contrato al estado real (y decir que `gamma` y el mapa de color son del
cliente, como ya dice el propio documento), o implementar lo que falta. Quitar `cmap` de la clave de caché.

## 3. Contrato de URL: `target`, `fps`, `stretch`, `mode` — Media

**Documento (§4).** La URL «siempre refleja el estado actual del visor» con `ra, dec, size, band, fps, stretch,
mode` y `target`.

**Código (`scaffold/frontend/src/state/url.ts`).** Lee y escribe `ra, dec, size, band, mision, tutorial, ciencia`
y `vista`. El propio archivo dice «Pendiente: target, fps, stretch, mode». Además, los parámetros que sí existen
(`mision`, `tutorial`, `ciencia`, `vista`) **no están** en el documento.

**Impacto.** Compartir la barra de direcciones no reproduce el estado completo (se pierde el estiramiento, el
modo de resta y los cuadros por segundo). Es la funcionalidad que el documento llama «infraestructura para otros».

**Qué hacer.** Alinear el §4 con la realidad hoy y dejar `target/fps/stretch/mode` como pendiente explícito, o
implementarlos. Documentar `mision/tutorial/ciencia/vista`.

## 4. `/api/grid` y `/api/frame` en el backend oficial — Media

**Documento (§3, «Cambios… noche»).** «Sus rutas `/api/grid`, `/api/frame` y `/api/presets` son del prototipo,
**no** del contrato». «Pendiente 2» sigue abierto.

**Código.** `main.py` registra `/api/grid` como alias de `epochs` y `/api/frame` como alias de `frames`, y el
frontend usa `${API}/grid` (`explorador/useDatosSpherex.ts`). `/api/presets` solo está en
`prototipos/rango_fechas/servidor.py`. Es decir: el visor oficial depende de una ruta que el contrato declara
fuera de contrato.

**Impacto.** Si alguien «limpia» los alias porque no son contrato, el Explorador deja de funcionar sin aviso.

**Qué hacer.** Decidir el punto 2 de «Pendiente»: o se promueven al contrato (con su forma de respuesta) o el
frontend deja de usarlas. Mientras tanto, un test que fije que existen.

## 5. `_banda()` sin verificar contra IRSA — Media

`main.py` deduce la banda 1–6 del último dígito de `detector`, y su docstring dice: «NO verificado contra IRSA».
La regla 2 de `AGENTS.md` pide verificar el artefacto, no el reporte. El documento de ejemplo además muestra
`"detector": 3` (número) y el código devuelve el texto del detector.

**Impacto.** Si el patrón del nombre cambia o hay un detector con otro formato, la época queda con `band: null`
y **se descarta en silencio** de `visits`/`columns` (el bucle ignora `b is None`).

**Qué hacer.** Comprobar con el explorador-datos una consulta real y registrar el resultado; añadir un test con
un nombre de detector real; devolver un aviso en vez de descartar.

## 6. Despliegue manual del backend — Media

`deploy/README.md`: `spherex-api` y `spherex-prototipo-d2` «no se actualizan solos»; hay que correr
`bash deploy/desplegar.sh api` tras cada merge. `vercel.json` reescribe `/api/*` y `/proto-api/*` a dos
proyectos que **no se construyen desde este repositorio en cada merge**.

**Impacto.** Lo que pasó CI en `main` puede no ser lo que corre en producción, y nada lo detecta. El jurado ve
producción.

**Qué hacer.** Añadir al `/api/health` la versión/commit desplegado y comprobar al final de la demo que coincide
con `main`; o automatizar el despliegue. (No probé producción: ver «No ejecutado» en el informe.)

## 7. Caché precalentada al arrancar — Media (por confirmar)

`docs/03` §5: «los cinco campos de prueba se precalientan al arrancar el servidor». En `main.py`, el `Dockerfile`
y `docker-compose.yml` no encontré ningún gancho de arranque (`lifespan`, `on_event`) que llame a
`app/irsa/precalentar.py`. Puede estar cubierto por el paquete `data/demo` (respuestas precalculadas), que sí se
usa. No leí `precalentar.py` entero, por eso lo marco «por confirmar».

**Qué hacer.** Aclarar en el documento si el «precalentado» es hoy el paquete `data/demo` o un script manual; y
recordar que en Vercel no hay disco persistente (punto 5 de «Pendiente»).

## 8. `/api/health` y OpenAPI desactualizados — Baja

- La nota de §3 dice que el backend «expone hoy `/health`… `{ "ok": true }`»; hoy expone ambos y devuelve
  `version`. El ejemplo muestra `"version": "0.1.0"` y el código `0.0.1`.
- `irsa_reachable` es siempre `null`; el contrato promete `true/false`.
- El título y la descripción de FastAPI siguen siendo «Backend / Esqueleto… No contiene lógica del desafío»; son
  lo primero que ve quien abre `/docs`.

## 9. CI — Baja

`.github/workflows/ci.yml`: `ruff check . || true  # en el evento, quitar el "|| true"` (el evento ya empezó);
el frontend solo corre `npm install && npm run build` (Vercel usa `npm ci`, y CI usa Node 20); hay 46 pruebas
de backend y **ninguna** de frontend. Ejecutado el 2026-11-15 con las versiones fijadas de `requirements.txt`
(Python 3.12.9): `pytest` → 46 pasan; `ruff check .` → 17 avisos, todos E501 (línea larga) y ninguno funcional, así
que quitar el `|| true` hoy solo exige acortar esas líneas o ajustar `line-length`.

## 10. CORS — Baja

`CORS_ORIGINS` por defecto es `http://localhost:5173`; el comentario dice «ANTES DE DESPLEGAR: restringir a los
dominios reales». Con los *rewrites* del mismo dominio no hace falta, pero no verifiqué qué valor tiene en el
proyecto `spherex-api`. Confirmarlo antes de que alguien llame a la API desde otro origen.

---

## Lo que **no** falló

Para que nadie piense que el repo está en mal estado: `tsc --noEmit` del frontend termina sin errores; Aladin
Lite está fijada en 3.8.2 como dice `AGENTS.md`; el Dockerfile usa Python 3.11 como dice la decisión de stack;
`/api/spectrum` incluye `caveat` como exige el contrato; no hay FITS versionados.
