<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/docs/REVISION_DOCUMENTACION_2026-11-14.md) · **Español** · [中文](../../zh/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Deutsch](../../de/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Italiano](../../it/docs/REVISION_DOCUMENTACION_2026-11-14.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `docs/REVISION_DOCUMENTACION_2026-11-14.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# Revisión de la documentación · 14-nov-2026

Rama `n/docs-al-dia`, desde `equipo/main` (8202409, con los PR #1 a #6 ya fusionados). Revisión hecha con tres
lectores en paralelo (cada uno con un grupo de documentos) y consolidada aquí. Cada hallazgo de la tabla
cita archivo y línea del documento y el dato que lo contradice. Las líneas se comprobaron a mano en los
documentos que se corrigieron; donde un lector dio un número de línea que no calzaba, se usó el real.

> **Nota de vigencia:** esta rama ya incorpora `equipo/main` hasta `b115fc0` (PR #7 «campos en su posición de hoy y decisión de despliegue de `/api`» y PR #8 «Spherix»). Los conflictos con `data/campos_de_prueba.yml` y `ADR-001` se resolvieron a favor de `main`. Hay además una rama nueva, `v/v2-catwise`, con la capa CatWISE2020 del visor, y el PR #9 (Bryan, `d/prototipo-rango-fechas`) sigue abierto.

## (a) Resumen en 5 líneas

1. La documentación se quedó atrás en cuatro cosas: **la hora de cierre** (varios documentos dicen 13:00; la organización dijo 11:00), **el cubo del cielo** (se confunden dos productos distintos de DR1), **lo que ya está hecho** (siguen como «pendiente» el visor, Vercel, el PR #6) y **el tamaño del equipo** (seis, no cuatro).
2. Lo más urgente: el cierre es el **domingo 15 a las 11:00** (confirmado por JP). WISE 0855 es caso obligatorio y se muestra siempre, pero hay que decir con honestidad que en una exposición suelta se ve débil y que su movimiento se ve con la resta; eps Ind B es donde se ve más claro.
3. En el código (no en los documentos) hay dos cosas que contradicen lo escrito: el pie de página del visor no trae el texto de atribución **literal** que exige IRSA, y `campos.ts` y el valor por defecto de `url.ts` usan coordenadas J2000 aunque dicen «propagada».
4. Se corrigieron 45 archivos (un commit cada uno) en dos rondas; la segunda aplica también las propuestas, con la aprobación de JP. En `docs/03` solo se aplicaron hechos medidos. No se tocó código, CI ni permisos.
5. De las 7 ramas remotas, solo `d/prototipo-rango-fechas` tiene trabajo sin fusionar; sus rutas usan `start`/`end` y el contrato dice `from`/`to`. Las otras 6 ya están dentro de `main`.

## (b) Hallazgos por documento

Gravedad: **B** = bloquea a alguien · **C** = confunde · **K** = cosmético.
Estado: **Corregido** (commit en esta rama) · **Propuesta** (decide el dueño o el equipo) · **Código** (no se toca aquí).
Dueño según README §3: D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera.

| # | Documento:línea | Qué dice | Qué es cierto hoy | Evidencia | Dueño | Grav. | Estado |
|---|---|---|---|---|---|---|---|
| 1 | `docs/05_PLAN_24H.md:7-8` | Cierre domingo 13:00, pitches 14:00 | Cierre **11:00** (comunicado en vivo). El 13:00 viene de la reunión del 13-nov, sin confirmar | `docs/08_REGLAS_DEL_EVENTO.md:94`; `README.md:33`; `docs/reuniones/2026-11-13_resumen.txt` («horario no confirmado») | C | B | Corregido |
| 2 | `docs/04_METODOLOGIA.md:160` | «anunciado a las 13:00 del domingo… confírmalo» | 11:00, ya confirmado | igual que #1 | C | B | Corregido |
| 3 | `docs/02_DATOS_SPHEREX.md:258-267` (y `:111-114`) | El cubo es un HiPS en `hips5_cube/hips_20261026/Norder5/`, buscable por SIA2, y Aladin lo muestra directo | Son **dos** productos. El de SIA2 es FITS de ~320 MB por tesela que el servicio de recortes rechaza. El que carga en Aladin es `/data/hips/SPHEREx/spherex_allsky_cube` (PNG, 102 planos, 50 y 51 vacíos, CORS abierto) | `docs/09_EDA_HALLAZGOS.md:35-38,176-177`; `scaffold/frontend/src/sky/planos.ts:11-13`; `curl` a `.../ibe/.../hips5_cube/hips_20261026/properties` da 404 (lo probó el lector del grupo C) | C | B | Corregido (párrafo y tabla; la ruta del `:111-114` queda como referencia del directorio de SIA2, ya aclarada arriba) |
| 4 | `.claude/skills/spherex-datos/SKILL.md:144-155` (§6) | Mismo error que #3: «Aladin puede mostrarlo directamente», ruta `ibe/...` | Igual que #3. Además la skill `visor-sky-blink` §2 ya lo decía bien: las dos skills se contradecían | igual que #3; `.claude/skills/visor-sky-blink/SKILL.md:42-90` | V2 / C | B | Corregido |
| 5 | `docs/02_DATOS_SPHEREX.md:271-278` · `docs/briefings/01_el_desafio_y_los_datos.md:226-228,321-323` · `spherex-datos/SKILL.md:159-164` | El espectro y el color salen del cubo | El cubo son PNG ya estirados, sin flujos: no sirve para el espectro; sale de nivel 2 o del Spectrophotometry Tool | `docs/09:37-38,177`; `docs/10_REPARTO_DE_TRABAJO.md:106-107` | C / N | C | Corregido en `docs/02` y la skill; el briefing 01 queda como propuesta (es texto de audio) |
| 6 | `docs/02_DATOS_SPHEREX.md:61-72` (§2) y la skill `spherex-datos` §1 | «Dentro de una banda la λ varía mucho menos»; agrupar por banda alcanza | La λ del objeto recorre ~16 anchos de banda dentro de un detector; hay que elegir épocas a λ igualada (dispersión 0,474 → 0,035 µm) y reproyectar (el detector gira ~180°) | `docs/09:22-27,72-85`; `eda/resultados/lambda_resumen.json` | C / D2 | C | Corregido en `docs/02` (nota). **Propuesta** para `spherex-datos` §1 y `revisor-cientifico.md:25-27` (añadir «igualar λ» y «reproyectar» como preguntas del revisor) |
| 7 | `docs/02_DATOS_SPHEREX.md:340-353` | Checklist de la hora 1 con las 8 casillas sin marcar | Casi todas ya tienen respuesta en `docs/09`; «confirmar las 6 extensiones» no se verificó | `docs/09:10-40,168-178`; `eda/README.md:3` | C | C | Parcial: `docs/05` ya remite a `docs/09`. **Propuesta**: marcar casillas en `docs/02` con la cifra y su fuente |
| 8 | `docs/07_RIESGOS.md` R1 (`:10`), R2, R3, R10 | R1 «no sabemos cuánto tarda»; R2 «medir WCS-WAVE»; R3 «plan B: usar solo `spherex_qr3`»; R10 escala 6,2 y «se decide en la hora 3» | R1 se cumplió (mediana 7,3 s, máx. 29 s). R2 resuelto. R3: QR3 sola deja a WISE 0855 sin datos (0 filas). R10 medido: 1,1-1,8 px, escala 6,15″ | `docs/09:15-19,30-32,49-55`; `eda/resultados/latencia_cutouts.json`; `eda/03_recortes_y_figuras.py:42` | C | C | Corregido (notas de estado + 6,15) |
| 9 | `docs/07_RIESGOS.md:154-157` | No hay riesgos nuevos registrados | Faltan: Vercel con un solo acceso, CDS caído, estrellas saturadas que engañan la resta, 503 de IRSA | `README.md:74-86`; `scaffold/frontend/src/sky/capas/simbad.ts:8,36-37`; `docs/09:132-136,175` | C | C | **Propuesta** (usar `/riesgo`; C decide) |
| 10 | `docs/06_JURADO_Y_PITCH.md:70-74` · `docs/briefings/01` y `02` · `.claude/skills/demo-y-pitch/SKILL.md:35-47` · `coordenadas-astro/SKILL.md:164-168` · `data/campos_de_prueba.yml:50` | Guion con WISE 0855 «se mueve. Punto»; RW Aur como control de variabilidad; Gaia sobre WISE 0855 | **Decisión de JP (14-nov): WISE 0855 es caso obligatorio, uno de los objetos de prueba de la organización, y se muestra siempre.** Hay que explicar con honestidad que en una exposición suelta se ve débil (113 s) y que su movimiento (~1,3 px en todo el período) se ve con la resta primera − última y, cuando exista, con la suma por barrido. eps Ind B es donde el movimiento se ve más claro. **Complementos del plan:** overlay de CatWISE2020 (WISE 0855 no está en Gaia; CatWISE trae su movimiento propio; `README.md:50` y §3, skill `coordenadas-astro:104-107`; dueño V2 Juan Pablo): **hecho en la rama `v/v2-catwise` (marca WISE 0855 a 2,6″ de la posición propagada desde SIMBAD, según V2), pendiente de PR**; y suma por barrido con pesos 1/VARIANCE (`docs/10:75`, `docs/09:186`; dueño D2 Bryan): **pendiente**. La guía del desafío valora superponer Gaia y WISE. RW Aur satura y deja un par rojo/azul sin moverse. WISE 0855 no está en Gaia (su overlay es CatWISE2020) | `docs/09:104-114,133-136`; `README.md:50`; `prototipos/rango_fechas/README.md` | N / C | C | Corregido en `docs/06`, `demo-y-pitch`, `coordenadas-astro`, `campos_de_prueba.yml` (comentarios), briefings 01 y 02, `docs/09`, `docs/10`, README. **Los audios de NotebookLM ya generados quedan desactualizados** |
| 11 | `scaffold/frontend/src/content/textos.ts:25-26` · `README.md` (§Licencia) · `docs/presentacion_eda/script.es.md:136` | `docs/05:113`, `docs/06:136`, `docs/08:84` y la skill `entrega-nasa` exigen la atribución **literal** | El pie del visor es una paráfrasis en español; el README solo enlaza a `docs/02`; el texto literal está únicamente en `docs/02_DATOS_SPHEREX.md:324-328` | `grep "This publication makes use" README.md` = 0 resultados; `textos.ts:25` | N / V1 | B (para la entrega) | **Código**: cambiar `textos.ts`, pegar el texto en el README y en `script.es.md:136` |
| 12 | `scaffold/frontend/src/content/campos.ts:1-13` y `src/state/url.ts:12` · `README.md:9` (enlace de ejemplo) | Comentario «usa la posición PROPAGADA» con valores J2000: a 2026 WISE 0855 quedaba a 212″ y Barnard a 270″ del centro, fuera de un recorte de 0,1° | **Resuelto en el código por el PR #7 (Mauricio):** `campos.ts` ahora documenta que `ra`/`dec` son J2000 y centra con `posicionActual()`, y la URL por defecto parte de eps Ind B. Queda solo el enlace de ejemplo del README (Barnard en J2000, que cae fuera del recorte): lo corrige N | `docs/10:115-118`; `campos.ts:1-13,33` en `b115fc0`; `url.ts:12` | C / N | C | Resuelto (PR #7). Pendiente solo el enlace del `README.md:9` |
| 13 | `docs/10_REPARTO_DE_TRABAJO.md:99-109` | La sección V2 describe el cubo «un plano por banda» y Gaia propagado como por hacer | Ya fusionado en el PR #6: deslizador de λ, marca y cuadro propagados, Gaia DR3 (tope 300), capa SIMBAD con rótulo y clic. Falta: gráfico de bandas, clic → animación, Spherix | commits `8eace4e`, `9043243`, `21a8edb`, `c76f61d`, `3cd51aa`, `e515ac5`; `scaffold/frontend/src/sky/` | V2 | C | Corregido |
| 14 | `docs/traspasos/2026-11-14-1530-v2-visor-cielo.md:61-89` | Pasos 1 a 5 por hacer; «cada PR tiene su vista previa»; «el CDS responde con CORS» | Pasos ya hechos en el PR #6. Las vistas previas solo se construyen para commits de Mauricio. El CDS estaba caído y el código prueba primero el espejo de Harvard | `git log`; `README.md:81-85`; `capas/gaia.ts:25-26`; `capas/simbad.ts:36-37` | V2 | C | Corregido (banner «superado» y dos notas) |
| 15 | `docs/KIT.md:5,52,76-77,80,116-121` | «cuatro personas»; «cinco skills»; «Hoy: local, sin publicar»; ancla `#atribución-obligatoria`; frontend «no ejecutado», escala «derivada», cubo HiPS «sin comprobar» | Seis personas; ocho skills; publicado con PR #1-#6 y visor en producción; ancla real `#8-atribución-obligatoria`; el frontend corre en CI y Vercel; escala 6,15″; el HiPS sí carga | `README.md:7-12,160`; `git ls-files .claude/skills`; `docs/02_DATOS_SPHEREX.md:322`; `docs/09:15,177` | N / C | C | Corregido |
| 16 | `docs/08_REGLAS_DEL_EVENTO.md:55-58,98-100` | «No hay una sola línea de código… hasta el inicio oficial»; «backend por decidir; el ADR queda por revisar» | Era cierto hasta el 13-nov. Hoy hay `eda/` y un visor; el frontend ya está en Vercel (el backend sigue por decidir) | `eda/01_inventario.py`…`05_centroides.py`; `scaffold/frontend/src/sky/`; `README.md:74-93` | C | C | Corregido. **Propuesta** (menor): marcar la lista «Antes de subir esto a GitHub» (`:104-110`) como hecha |
| 17 | `README.md:17-18` · `AGENTS.md` regla 8 · `scaffold/README.md:3-5,52` | «Antes del inicio oficial no hay código» como si siguiera vigente | El evento empezó el 14-nov 10:00 | `README.md:33` | N / C | C | Corregido en README y AGENTS. **Propuesta** para `scaffold/README.md` (está bajo `scaffold/`, no se tocó): cabecera «esqueleto inicial; el frontend ya tiene landing, visor y vía A» |
| 18 | `README.md:259` (§9, Bloque 0) | «Mauricio: crear el proyecto en Vercel» sin marcar | Hecho: https://spherex-planet-x-tau.vercel.app | `README.md:7`; `vercel.json` | N | K | Corregido |
| 19 | `CONTRIBUTING.md:3,31,60` · `CLAUDE.md:44` · `scaffold/README.md:9,58` · `docs/05_PLAN_24H.md` (6 menciones) · `docs/04_METODOLOGIA.md` (título y §Roles) | «Cuatro personas»; `git worktree add ../spherex-d d/sia2-epochs` sin `-b`; «`docker compose up`» desde la raíz | Seis personas; para una rama nueva hace falta `-b … main`; `docker-compose.yml` está en `scaffold/` y solo levanta `/health` | `README.md:160,223`; `git worktree add -h`; `ls` de la raíz | C / N | K / C | Corregido en CONTRIBUTING, CLAUDE y docs/05; en docs/04 solo se añadió la aclaración de roles (título y reparto: **propuesta**, lo decide el equipo). `scaffold/README.md`: propuesta |
| 20 | `CLAUDE.md:46-48` | `settings.json` «aprueba `curl` a dominios de IRSA y CDS» | `settings.json` no tiene `Bash(curl:*)`; tiene `WebFetch(domain:…)` y no incluye los espejos de Harvard | `.claude/settings.json:10-38` | C | C | Corregido (la frase). **Propuesta a Mauricio**: agregar `WebFetch` a `vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu` y la URL de Vercel, y `npm run dev/preview`; es un tema de seguridad, no se agregó |
| 21 | `GEMINI.md:10` | `git switch -c <tu-nombre>/<tema>` | La convención es `<inicial-del-rol>/<tema>` (`d/`, `v/`, `c/`, `n/`) | `CONTRIBUTING.md:17-21`; `git branch -r` | C | C | Corregido |
| 22 | `AGENTS.md:46,48` | «Aladin Lite v3 (HiPS, CDS)»; «Frontend estático + backend en contenedor» | Aladin Lite 3.8.2 sobre el cubo de IRSA; el CDS cayó y se usan espejos de Harvard; el backend está por decidir | `scaffold/frontend/package.json:14`; `ADR-001:29-36` | C | K | Corregido |
| 23 | `docs/adr/ADR-001-stack.md:27,58-62` | La opción sin backend «depende de que IRSA responda con CORS»; revisar en la hora 3 | IRSA no da CORS fuera del HiPS: descartada con evidencia | `docs/09:33-34,170`; `eda/resultados/infraestructura.json` | C | K | Corregido |
| 24 | `docs/adr/ADR-001-stack.md` | Estado «propuesta», «por firmar»; la sección Decisión chocaba con la actualización del 14-nov | **Resuelto en lo sustancial por el PR #7:** el ADR ahora tiene la «Actualización 14-nov-2026, tarde» con la decisión de despliegue de `/api` y los datos de latencia (mediana 7,3 s, máx. 29 s). Sigue siendo **propuesta de C, pendiente de visto bueno del equipo y de firma**; se dejó escrito así. El límite de tiempo de Vercel Hobby sigue sin verificar (el propio ADR pide comprobarlo) | `README.md:38-39` | C | C | Corregido en texto; **firma pendiente de C** |
| 25 | `docs/03_ARQUITECTURA.md` (contrato) | Varios puntos | (1) `:25-27` el riesgo de CORS de la vía A se resolvió; (2) `:156` escala 6.2 → 6,15; (3) `:166` `flagged_fraction` 0.004 contra ~4 % real; (4) `:120` colecciones por defecto dejan a R Dra casi sin datos (está sobre todo en `_deep`: 1.233 + 733 archivos contra 422 + 126); (5) `:141-172` `/api/frames` no puede pedir λ igualada ni suma por barrido; (6) `/api/presets` lo cita `docs/10:117` y no está en el contrato; (7) `:75-76,96-99,214-215` SIMBAD se consulta directo desde el navegador, no por `/api/resolve`; (8) `:243` caché en disco choca con Vercel Functions; (9) `:93` el esqueleto expone `/health`, no `/api/health` | `docs/09:55,158-160`; `capas/simbad.ts:5-9`; `scaffold/backend/app/main.py:29-32` | equipo (D1, D2, C) | C | **Propuesta**: no se tocó (el contrato exige acuerdo del equipo) |
| 26 | `docs/03_ARQUITECTURA.md` vs la rama `d/prototipo-rango-fechas` (**PR #9 de Bryan, abierto y sin fusionar**) | Contrato: filtros `from`/`to` | El prototipo usa `start`/`end`, `visit`, `per_visit`, y rutas nuevas `/api/grid`, `/api/frame`, `/api/presets` | `prototipos/rango_fechas/README.md` (tabla API), `servidor.py` | D2 / D1 | C | Anotado en la sección «Pendiente de acuerdo del equipo (14-nov)» de `docs/03`; acordar nombres antes de fusionar el PR #9 |
| 27 | `data/campos_de_prueba.yml:48,162-171,187-189` | «Es LA demo principal»; escala «6,2 arcsec [DERIVADO]»; «verificar en la hora 1» | Se conserva el lugar de WISE 0855 como caso obligatorio y se agrega la salvedad de que en una exposición suelta se ve débil. Escala 6,15″ y base 1,0-1,4 años medidas. A 18 meses con 6,15 salen 1,99 / 2,53 / 1,14 px | `eda/03_recortes_y_figuras.py:42`; `docs/10:114` | C | K | Corregido solo en comentarios y notas de texto (sin cambiar coordenadas ni movimientos propios) |
| 28 | `data/README.md:6` · `biblio/README.md:144-146` | Las coordenadas están «sin verificar» | Las cinco se verificaron el 14-nov contra SIMBAD (espejo de Harvard) | `data/campos_de_prueba.yml:7-13` | C | C | Corregido |
| 29 | `eda/README.md:8-9,19` | Backend en `backend/app/`; `04_infraestructura` prueba «CORS, cubo DR1, HiPS del CDS» | `scaffold/backend/app/`; el script prueba también el HiPS de IRSA | `eda/04_infraestructura.py:46-47` | D1 / C | K | Corregido |
| 30 | `docs/briefings/README.md:5` · `briefings/02:190` | «nueve documentos»; «Nueve riesgos» | 11 documentos numerados (00-10); 10 riesgos (R1-R10) | `ls docs`; `grep "^## R" docs/07_RIESGOS.md` | N | K | Corregido; además se añadió un aviso de que los briefings son previos al EDA |
| 31 | `docs/briefings/01:19,312-316` · `02:3,56-58,91-97,157-158,168` | «cuatro personas», «cuatro roles», «backend en un contenedor» | Seis personas; backend por decidir | `README.md:160`; `ADR-001:29-36` | N | K | **Propuesta**: son guiones de audio; si se corrigen hay que regenerar los audios |
| 32 | `.claude/skills/entrega-nasa/SKILL.md:42,88-91` | «espectros generados al vuelo»; recursos «los HiPS del CDS» | El gráfico de bandas es un hueco en el visor (`Visor.tsx:88`); no se usa ningún HiPS del CDS | `scaffold/frontend/src/pages/Visor.tsx:88`; `planos.ts:13-14` | N | C | Corregido la lista de recursos. **Propuesta**: poner «espectros al vuelo» como condicional |
| 33 | `.claude/skills/coordenadas-astro/SKILL.md:156-160` | Escala ~6,2 y «1-2,5 píxeles» | 6,15″; 1,1-1,8 px medidos | `docs/09:15-19` | C | K | Corregido |
| 34 | `docs/KIT.md`, `README.md:245-246`, `.github/workflows/ci.yml:26,41` | «Al empezar el evento, quitar el `|| true`»; CI usa `npm install` | `ruff check scaffold/backend` pasa limpio; Vercel usa `npm ci` | ejecución del lector del grupo C; `vercel.json:3` | C | K | **Propuesta** (tocar el CI lo aprueba una persona) |
| 35 | `scaffold/README.md:15-37,46-62` | `App.tsx` «llama a /health»; `make dev` arranca todo; `requirements-astro.txt` con astropy… | `App.tsx` es landing/visor y no llama a `/health`; `make dev` solo imprime ayuda; a `requirements-astro.txt` le faltan `reproject` y `scipy` que usa el EDA | `scaffold/Makefile:19-22`; `scaffold/backend/requirements-astro.txt:4-10`; `eda/comun.py:16` | D2 / C | C (B para D2 con `import reproject`) | **Propuesta** (bajo `scaffold/`) |
| 36 | `.claude/skills/spherex-datos/SKILL.md` §1, §3-§4, §11 y `visor-sky-blink` | Faltan los datos medidos: IRSA sin CORS, latencias de cutout, una posición cae en 2 archivos por apuntado (no 6), `FLAGS != 0` marca el 72 %, el par rojo/azul de la resta también sale con objetos saturados | Medidos en el EDA | `docs/09:30-34,59-60,133-136,140-162`; `eda/resultados/*.json` | C / D1 / D2 | C | **Propuesta** (texto sugerido en las notas de trabajo) |
| 37 | `docs/06_JURADO_Y_PITCH.md:81` · `demo-y-pitch/SKILL.md:39,70` · `entrega-nasa/SKILL.md:41` | «Las 102 bandas: lo que ninguna otra herramienta pública da» | IRSA publica el propio cubo de 102 planos; `/verifica-cifra` prohíbe «nadie ha hecho esto» sin respaldo | `.claude/commands/verifica-cifra.md:30-32`; `docs/09:177` | N | C | **Propuesta**: «hasta donde pudimos comprobar, ninguna herramienta pública combina el blink temporal con las 102 bandas en una sola pantalla» |
| 38 | `docs/diseno/REVISION_MAQUETA_V1.md:20,24,36` | «Falta el pie con la atribución»; «3 o 4 barridos por zona» | Ya hay pie (con texto no literal, ver #11); R Dra tiene observación casi continua y WISE 0855 termina en 2026,37 | `App.tsx:44`; `docs/09:51,55,63-64` | V1 / C | K | **Propuesta** |
| 39 | `biblio/repos.md:32,97-98` | Aladin Lite es LGPL-3.0 | GitHub dice LGPL-3.0; `package-lock.json:1248` y npm dicen GPL-3. Sin resolver | `scaffold/frontend/package-lock.json:1248` | C | C | **Propuesta**: abrir el `LICENSE` dentro del paquete 3.8.2 y decidir (el proyecto se publica con MIT) |
| 40 | `docs/presentacion_eda/script.es.md:45` · `docs/02:36` · `docs/09:72` | Rango del detector 5: 3,82-4,44 / 3,83-4,41 / 3,82-4,41 µm | Tres cifras distintas | `eda/resultados/lambda_resumen.json` | C | K | **Propuesta**: medir una vez la tabla `WCS-WAVE` y unificar |

**Recuento por gravedad** (filas de la tabla, cada una con su gravedad más alta): **bloquea: 6** (filas 1, 2, 3, 4, 11 y 12) · **confunde: 23** · **cosmético: 11**. Total: 40 filas.

> Nota de conteo: la tabla agrupa. Los tres lectores entregaron unos 90 hallazgos brutos (13 + 40 + 40, más observaciones sobre `docs/03`); se unieron los repetidos entre grupos (cierre 13:00, «cuatro personas», escala 6,2) y se descartaron los que no se pudieron probar.

### Verificaciones que no salieron como el lector las reportó

- **Números de línea de `docs/04`.** El lector del grupo A citó líneas de 288 a 433, pero `docs/04_METODOLOGIA.md` tiene 162. Las líneas reales están en la tabla (`:160`, `:15`, `:21`). El contenido sí era correcto.
- **«visor-sky-blink:61 dice que el cubo es un mosaico de todas las épocas» (C-11 del grupo C).** Se descartó: la frase real dice «**Qué NO es:** un mosaico de todas las épocas (no tiene eje de tiempo…)», que es correcta. Solo es ambigua de leer.
- **Atribución, R10 y cifras de latencia:** se comprobaron contra `textos.ts:25`, `docs/08:94` y `docs/09`.

## (c) Ramas remotas de `equipo`

| Rama | Último commit | Delante / detrás de `main` | Qué trae | Qué documentación afecta |
|---|---|---|---|---|
| `c/correccion-cubo-hips` | 14-nov | 0 / 16 | Corrección del EDA: el cubo HiPS sí carga; aviso J2000 | Ya fusionada (PR #4). Nada pendiente |
| `c/eda-datos` | 14-nov | 0 / 20 | EDA y revisión de la maqueta | Ya fusionada (PR #2) |
| `c/vercel-shell` | 14-nov | 0 / 28 | Esqueleto visual en Vercel | Ya fusionada (PR #3) |
| `n/plan-readme` | 14-nov | 0 / 30 | Pizarra y Vercel en el plan | Ya fusionada (PR #1) |
| `n/readme-vercel` | 14-nov | 0 / 14 | Cómo se despliega con el plan gratuito | Ya fusionada (PR #5) |
| `v/v2-cielo` | 14-nov | 0 / 3 | Visor del cielo V2 | **Ya fusionada** (PR #6, `8202409`). El encargo la daba por abierta |
| `d/prototipo-rango-fechas` | 14-nov | **4 / 33** | Prototipo aislado en `prototipos/rango_fechas/` (servidor, explorador bandas × fechas, informe de bandas) y `data/data.ipynb` (4.249 líneas) | Ver filas 26 y 10. (1) Usa `start`/`end` y rutas nuevas distintas del contrato `docs/03` (`from`/`to`). (2) Su propio README dice que WISE 0855 no se ve en una exposición suelta, lo que respalda la fila 10. (3) No trae documentos que contradigan `main`: no toca `docs/` ni `README.md`. (4) La rama parte de `4411f5f`, antes de los PR #1 a #6: hay que reconstruirla sobre `main` antes de un PR. (5) `data/data.ipynb` pesa unas 4.200 líneas: revisar que no incluya datos descargados (regla del repo: nada de datos en git) |

## Estado final tras la segunda ronda (con la aprobación de JP)

Decisiones de JP del 14-nov: (1) el cierre es el domingo 15 a las 11:00, confirmado; (2) WISE 0855 es caso obligatorio y se muestra siempre (ver fila 10). Por eso las filas marcadas «Propuesta» arriba pasaron a corregidas, salvo lo que sigue.

**Corregido en la segunda ronda** (filas 5, 6, 7, 8, 9, 10, 13, 16, 17, 19, 20 en lo documental, 23, 24, 25, 26, 27, 31, 32, 34 en lo documental, 35, 36, 37, 38, 39, 40 parcial): checklist de `docs/02`, R11-R13 en `docs/07`, `ADR-001` (texto actualizado; **no está firmado: pendiente de firma de C**), `docs/03` (ver abajo), `scaffold/README.md`, skill `spherex-datos` (λ igualada, 2 archivos por apuntado, FLAGS por bits, §12 con lo medido), revisores, `chequeo-demo`, `AGENTS.md` (apuntado/barrido), `CLAUDE.md`, `GEMINI.md`, `docs/08`, `REVISION_MAQUETA_V1.md`, `biblio/repos.md` (discrepancia de licencia anotada, **sin resolver**), `script.es.md` y README (texto literal de atribución), `entrega-nasa`, briefings 01 y 02.

**Qué se cambió en `docs/03`** (solo hechos medidos): escala de píxel 6,15; riesgo CORS de la vía A marcado como resuelto; nota de `/health` frente a `/api/health`; `flagged_fraction` de ejemplo 0,04 con su explicación; nota de que SIMBAD hoy se consulta desde el navegador. Los cambios de diseño (`from`/`to` frente a `start`/`end`, `/api/grid`, `/api/frame`, `/api/presets`, λ igualada y suma por barrido, colecciones por defecto, caché frente a Vercel, máscara de contaminación) quedaron como sección «Pendiente de acuerdo del equipo (14-nov)» al final, sin cambiar el contrato vigente.

**Audios.** Los audios de NotebookLM ya generados a partir de los briefings quedan desactualizados en: el cubo no da el espectro, el equipo es de seis, el backend está por decidir y el encuadre de WISE 0855.

### Cambios de código pendientes (no se tocaron)

| Qué | Dónde | Dueño |
|---|---|---|
| Poner la atribución literal de IRSA en el pie del visor | `scaffold/frontend/src/content/textos.ts:25-26` | N / V1 |
| ~~Pasar `campos.ts` a posiciones propagadas~~ | Resuelto por el PR #7 (`campos.ts` documenta J2000 y centra con `posicionActual()`) | — |
| Corregir el enlace de ejemplo del README (Barnard en J2000, fuera del recorte; `url.ts` ya parte de eps Ind B) | `README.md:9` | N |
| Quitar `\|\| true` del linter y usar `npm ci` en CI | `.github/workflows/ci.yml:26,41` | C |
| Permisos `WebFetch` a los espejos de Harvard y a la URL de Vercel; `npm run dev/preview` | `.claude/settings.json` | C (seguridad) |
| Agregar `reproject` y `scipy` | `scaffold/backend/requirements-astro.txt` | D2 / C |
| Botón «Resta» en el visor (`diff_first`) | `scaffold/frontend/src/pages/Visor.tsx` | V1 / D2 |
| Quitar el `TODO` de `propagacion.ts` (la comprobación ya existe en `scripts/comprobar_propagacion.mjs`) | `scaffold/frontend/src/sky/propagacion.ts:10-11` | V2 |

### Qué quedó sin hacer en documentación

- Firma del `ADR-001` (es de C) y resolver la licencia de Aladin Lite (abrir el `LICENSE` del paquete 3.8.2).
- Regenerar los audios de los briefings.
- Rango del detector 5 (3,82-4,44 / 3,83-4,41 / 3,82-4,41 µm): hay que medir la tabla `WCS-WAVE` antes de unificar.
- La casilla «confirmar las 6 extensiones» de `docs/02`, que el EDA no verificó.
- Los ejemplos numéricos de AGENTS y de la skill del visor («14 épocas»), que son ilustrativos; y la nota del `visor-sky-blink` §8 sobre precargar WISE 0855 en J2000 (depende del cambio de código de `campos.ts`/`url.ts`).

## Qué NO se revisó

- `docs/03_ARQUITECTURA.md` línea por línea contra un backend real (no existe: solo `/health`).
- Las citas bibliográficas (arXiv, DOI) de `biblio/`.
- Las skills genéricas `astropy`, `matplotlib`, `scikit-learn` (son de terceros).
- `docs/reuniones/` (histórico) y los PNG/PDF de `docs/diseno/` y `docs/presentacion_eda/` (solo texto).
- Que los audios de NotebookLM se generaran el 14-nov.
- El contenido interno de los notebooks y de `prototipos/rango_fechas/*.py`.
- El límite de tiempo de Vercel Hobby y la licencia de Aladin Lite (marcados como «sin verificar»).
- Todo `src/` y `scaffold/`: no se editó, según el encargo.

## Qué queda para cada dueño

- **C Mauricio:** firmar ADR-001 (y el dato de latencia), valores del yml (6,15 y «demo principal»), `docs/03` (ver fila 25), riesgos nuevos (fila 9), permisos de `settings.json`, licencia de Aladin, CI (`|| true`, `npm ci`), `docs/02` checklist.
- **N Javiera:** el orden de la demo y el pitch (fila 10), «ninguna otra herramienta» (37), atribución literal en README y pie (11), briefings y audios (31).
- **V1 Antonia / V2 Juan Pablo:** `textos.ts` (11), `campos.ts` y `url.ts` en J2000 (12), `REVISION_MAQUETA_V1.md` (38).
- **D1 Vladimir / D2 Bryan:** `from`/`to` frente a `start`/`end` (26), `/api/health` frente a `/health`, `requirements-astro.txt` con `reproject` y `scipy` (35).
