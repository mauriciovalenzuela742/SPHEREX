# SPHEREX — NASA Space Apps Challenge 2026 · *Planet X and SPHEREx*

**Una herramienta web pública donde cualquiera escribe unas coordenadas del cielo y ve esa zona como un
videíto: la secuencia de imágenes de SPHEREx a lo largo del tiempo, para detectar a ojo lo que se mueve
o cambia de brillo, y además de qué está hecho (las 102 bandas).**

Este README es **el plan principal del equipo**. El detalle vive en `docs/` (fuente de verdad),
y la guía de uso del kit de trabajo está en [`docs/KIT.md`](docs/KIT.md).

> Antes del inicio oficial no hay aquí código que resuelva el desafío: solo documentación, convenciones
> y andamiaje genérico. Ver [`docs/08_REGLAS_DEL_EVENTO.md`](docs/08_REGLAS_DEL_EVENTO.md).

---

## 1. Contexto

- **Desafío:** [Planet X and SPHEREx](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/)
  (Advanced). Texto oficial completo en [`docs/00_DESAFIO.md`](docs/00_DESAFIO.md).
- **Qué pide:** el usuario ingresa RA/Dec; la herramienta muestra una serie de imágenes de SPHEREx de ese
  parche «like a little video». Probar con **Barnard's Star, Epsilon Indi B, WISE 0855** (se mueven) y
  **RW Aurigae, R Draconis** (cambian de brillo).
- **Rúbrica de facto (las 8 *Potential Considerations*):** fácil de actualizar con nuevos releases ·
  mostrar las 102 bandas (co-add por detector; **extra kudos: espectro al vuelo**) · sumar/restar épocas ·
  campo de visión elegible · overlays de Gaia/WISE · coordenadas en la URL · flags de contaminación ·
  usar Astropy y Aladin. Modelo de inspiración: [WiseView](http://byw.tools/wiseview).
- **Evento (Santiago):** trabajo sáb 14 10:00 → **cierre de entregas dom 15 11:00** (comunicado en vivo
  por la organización; ver [`docs/08`](docs/08_REGLAS_DEL_EVENTO.md#reglas-comunicadas-en-el-evento-14-nov-2026)),
  pitch de **2 min + 2 preguntas**. Uso de IA permitido **y su declaración es obligatoria** en la entrega.
- **Se sube:** nombre y resumen, enlace a la demo final, datos de la NASA y otras fuentes, y cómo se usó IA.
- **Jurado:** impacto, creatividad, validez, relevancia y presentación.
- **Despliegue:** Vercel para el frontend (indicado por la organización); cómo corre el backend está por decidir
  en el ADR-001. Nada se despliega sin aprobación de una persona del equipo.
- **Lo que NO es:** no es un detector automático ni un modelo de video. Es un **visor**; el humano detecta.
  Cualquier capa de ML va encima, nunca en lugar del visor ([`docs/01_ESTADO_DEL_ARTE.md`](docs/01_ESTADO_DEL_ARTE.md)).

### Trampas ya detectadas

1. **La coordenada del enunciado para WISE 0855 es de época ~2010,4.** El objeto se mueve 8,15″/año:
   hoy está a ~130″. Usar siempre las posiciones propagadas de [`data/campos_de_prueba.yml`](data/campos_de_prueba.yml).
2. **Exposiciones consecutivas = longitudes de onda distintas** (filtro lineal variable). Blinkear sin
   agrupar por banda/λ (`WCS-WAVE`) da una secuencia que muestra color, no tiempo.
3. **Usar DR1 + QR3.** QR2 ya no es buscable por SIA2.
4. **WISE 0855 no está en Gaia:** su overlay usa CatWISE2020.

---

## 2. Arquitectura (resumen de [`docs/03_ARQUITECTURA.md`](docs/03_ARQUITECTURA.md))

Dos vías en la misma pantalla:

- **Vía A — «el cielo en 102 colores», sin backend:** Aladin Lite v3 + cubo HiPS de DR1 de IRSA con
  deslizador de λ, overlay Gaia. Es el seguro si el backend falla. (Plan B: HiPS de SPHEREx del CDS.)
- **Vía B — el blink temporal, con backend:** FastAPI consulta SIA2 por posición, pide cutouts por
  época, agrupa por banda, resta ZODI, normaliza y devuelve PNG ordenados en el tiempo.

**Contrato de la API** (lo único que front y back dan por cierto; se cambia primero en `docs/03`):
`GET /api/health` · `/api/resolve?q=` · `/api/epochs?ra=&dec=&size=` ·
`/api/frames?ra=&dec=&size=&band=&stretch=&cmap=&mode=` (`raw|zodi_subtracted|diff_first|diff_prev`,
con `wavelength_um` y `flagged_fraction` por fotograma) · `/api/spectrum?ra=&dec=&aperture=` (con `caveat` obligatorio).

**URL compartible:** `/?ra=…&dec=…&size=…&band=…&fps=…&stretch=…&mode=…` o `/?target=WISE+0855`.
Caché en disco con **los cinco campos precalentados**; modo degradado offline para la demo.

Stack ([`docs/adr/ADR-001-stack.md`](docs/adr/ADR-001-stack.md)): Python 3.11 + FastAPI + astropy/astroquery/pyvo ·
React + Vite + TypeScript + Aladin Lite v3 · Docker · frontend estático en CDN, backend en contenedor.

---

## 3. Las 6 ramas (sobre los roles D/V/C/N de [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md))

| # | Frente · prefijo de rama | Responsable | Carpeta que es suya | Entregables, en orden de prioridad |
|---|---|---|---|---|
| 1 | **D1 Datos-acceso** · `d/…` (`d/sia2-epochs`, `d/cache`) | Javiera | `scaffold/backend/app/irsa/`, `app/cache/`; rutas `resolve`, `epochs`, `health` | Checklist de la hora 1 ([`docs/02`](docs/02_DATOS_SPHEREX.md) §9) con C; SIA2 sobre `spherex_dr1`+`spherex_qr3`; cutouts en paralelo con reintento; caché; **precalentar los 5 campos**; resolución de nombres (SIMBAD); re-consulta de nuevos releases |
| 2 | **D2 Datos-fotogramas** · `d/…` (`d/frames-banda`, `d/diff`, `d/spectrum`) | Bryan | `scaffold/backend/app/frames/`, `app/spectrum/`; rutas `frames`, `spectrum` | Agrupar por banda y λ (`WCS-WAVE`); restar ZODI; reproyectar a grilla común; estiramiento → PNG; `wavelength_um` + `flagged_fraction`; `diff_first`/`diff_prev`; co-add por detector; `/api/spectrum` al final |
| 3 | **V1 Visor-blink** · `v/…` (`v/panel-blink`, `v/url`) | Antonia | `scaffold/frontend/src/blink/`, `src/controls/`, `src/state/` | Mock del contrato desde la hora 1; coordenada → canvas → play/pausa; controles (stretch, cmap, fps, **campo de visión**, banda, modo); URL ↔ estado; estados vacío/error; móvil; pie con atribución; extra: modo «¿cambió?» de votación humana |
| 4 | **V2 Visor-cielo** · `v/…` (`v/aladin-hips`, `v/overlay-gaia`) | Juan Pablo | `scaffold/frontend/src/sky/` | **Vía A**: Aladin Lite + cubo HiPS DR1 con deslizador de λ (CORS en la hora 1); overlay Gaia DR3 **propagado a la época del fotograma**; overlay WISE/CatWISE; marcadores de flags |
| 5 | **C Ciencia, verificación y despliegue** · `c/…` | Mauricio | `data/campos_de_prueba.yml`, `docs/02`, `docs/07`, `scaffold/docker-compose.yml`, config de despliegue | Checklist de la hora 1 con D1; verificar cada función en los 5 campos + controles (`campo_vacio`, `plano_galactico`); `revisor-cientifico` antes de cada merge que se ve en la demo; **despliegue** (sin que el contenedor se duerma) y **modo degradado offline**; revisar PRs |
| 6 | **N Narrativa y entrega** · `n/…` | Vladimir | `README.md`, `docs/06`, video de demo, formulario de entrega | Frase de una línea; README + atribución SPHEREx; video de demo (`demo-y-pitch`); entrega + **declaración de uso de IA** (`entrega-nasa`); ensayar el pitch 3 veces con las preguntas incómodas |

> Asignación inicial de Javiera (D1) y Vladimir (N): se confirma o se intercambia en el Bloque 0 según
> experiencia de cada uno. Equipo completo: 6 personas, el máximo del evento.
>
> Los roles no son jaulas: desde la hora 12, D1/D2/V1/V2 se reparten las viñetas extra. **C y N no se disuelven.**
> La detección automática (clasificador de recortes estilo ALeRCE, idea de Bryan) queda como «con 6 horas más».

---

## 4. Skills, agentes y comandos por rama

Todo vive en `.claude/` y se carga solo al abrir Claude Code en la raíz del repo.

**Para todas las ramas:** skills `spherex-datos`, `coordenadas-astro`; comandos `/standup`, `/traspaso`,
`/verifica-cifra`, `/riesgo`; y del plugin ECC: `ecc:git-workflow`, `ecc:search-first`,
`ecc:documentation-lookup`, `ecc:verification-loop`.

| Rama | Skills del repo / agentes | Skills adicionales | Agentes revisores (antes de la revisión humana del PR) |
|---|---|---|---|
| D1 acceso | `spherex-datos`, `coordenadas-astro`, agente **`explorador-datos`** | `astropy`, `ecc:python-patterns`, `ecc:python-testing`, `ecc:fastapi-patterns`, `ecc:api-connector-builder`, `ecc:content-hash-cache-pattern`, `ecc:error-handling` | `ecc:python-reviewer`, `ecc:silent-failure-hunter`, `ecc:fastapi-reviewer` |
| D2 fotogramas | `spherex-datos`, `visor-sky-blink`, agente `explorador-datos` | `astropy`, `matplotlib`, `ecc:python-patterns`, `ecc:python-testing`, `ecc:data-throughput-accelerator`, `dataviz` | `ecc:python-reviewer`, `ecc:performance-optimizer`, **`revisor-cientifico`** |
| V1 blink | `visor-sky-blink`, `coordenadas-astro`, agente **`revisor-interfaz`**, `/chequeo-demo` | `ecc:react-patterns`, `ecc:vite-patterns`, `ecc:typescript-patterns`, `ecc:frontend-patterns`, `ecc:frontend-design-direction`, `ecc:accessibility`, `ecc:e2e-testing`, `ecc:browser-qa` | `ecc:react-reviewer`, `ecc:typescript-reviewer`, `ecc:e2e-runner` |
| V2 cielo | `visor-sky-blink`, `coordenadas-astro`, agente `revisor-interfaz` | `astropy`, `ecc:react-patterns`, `ecc:typescript-patterns`, `dataviz` | `ecc:react-reviewer`, **`revisor-cientifico`** |
| C ciencia + despliegue | `coordenadas-astro`, `spherex-datos`, agentes **`revisor-cientifico`**, `explorador-datos`; `/verifica-cifra`, `/riesgo`, `/chequeo-demo` | `astropy`, `ecc:docker-patterns`, `ecc:deployment-patterns`, `ecc:verification-loop`, `ecc:code-review` | `ecc:security-reviewer`, `ecc:code-reviewer` |
| N entrega | **`demo-y-pitch`**, **`entrega-nasa`**, `/chequeo-demo` | `ecc:frontend-slides` o `anthropic-skills:pptx`, `ecc:video-editing`, `ecc:ui-demo`, `ecc:article-writing`, `dataviz` | `ecc:agent-evaluator`, `revisor-interfaz` |

**Origen de las skills:**
- `spherex-datos`, `coordenadas-astro`, `visor-sky-blink`, `demo-y-pitch`, `entrega-nasa` y los 3 agentes: kit de Juan Pablo.
  `spherex-datos` §11 y la nota de CatWISE en `coordenadas-astro` se añadieron con la exploración del 14-nov.
- `astropy`, `matplotlib`, `scikit-learn`: [K-Dense AI scientific skills](https://github.com/K-Dense-AI/claude-scientific-skills) (MIT),
  revisadas antes de copiarlas (solo documentación y plantillas de gráficos). `scikit-learn` solo para el extra de clasificación.
- `ecc:*`: plugin [ECC](https://github.com/affaan-m/ECC). Quien no lo tenga: `/plugin marketplace add affaan-m/ECC` → `/plugin install ecc@ecc`.
  Es opcional: las skills del repo bastan para trabajar.

---

## 5. Cómo trabajamos ([`CONTRIBUTING.md`](CONTRIBUTING.md))

1. **Nadie empuja a `main`.** Todo entra por PR, y **lo revisa una persona** (un agente puede prepararlo).
2. Ramas `<rol>/<tema>` que viven **menos de 3 horas**.
3. **Un worktree por persona:** `git worktree add ../spherex-<rol> <rol>/<tema>`.
4. El contrato de la API se cambia primero en `docs/03_ARQUITECTURA.md` y se avisa al equipo.
5. Nada de FITS ni datos descargados en el repo (van a `data/cache/`, ignorado).
6. Cada PR: *Qué hace · Cómo lo comprobé · Qué NO comprobé*, probado con al menos un campo de prueba.

```bash
git clone https://github.com/mauriciovalenzuela742/SPHEREX
cd SPHEREX
claude            # comprobación: /standup debe existir
```

---

## 6. Cronograma (detalle y criterios de corte en [`docs/05_PLAN_24H.md`](docs/05_PLAN_24H.md))

**T = domingo 11:00** (cierre de entregas). Por lo tanto: **T−6 = dom 05:00** (congelación de alcance),
**T−4 = dom 07:00**, **T−2 = dom 09:00 (entregado)**. Son ~25 h de trabajo, no 27.

| Bloque | Horas | Quién | Qué | Corte |
|---|---|---|---|---|
| 0 | h0–1 | Todos | Leer `00_DESAFIO` en voz alta, firmar ADR-001, nombres en `05`, el scaffold levanta para todos | Nadie avanza hasta que los 6 puedan correr el proyecto |
| 1 | h1–3 | D1 + D2 + C | Checklist de datos: n.º de épocas, tiempo de un cutout, **cuánto cambia la λ entre épocas**, HiPS + CORS. V1/V2 sobre el mock; N abre el formulario | A la h3, respuesta escrita a cada pregunta |
| 2 | h3–8 | Todos | `/epochs` + `/frames` de una banda con caché; coordenada → canvas → play; Vía A con Aladin; C verifica campos | **h8: una coordenada produce un videíto en pantalla**, o todos se ponen en eso |
| 3 | h8–14 | Todos | Prioridades 1→8: banda, controles, resta, nombres, URL, overlay Gaia, flags, espectro | **T−6 h: congelación de alcance** |
| 4 | T−6→T−4 | C + todos | Los 5 campos en la app **desplegada**, precalentar, estados vacíos, móvil, atribución | — |
| 5 | T−4→T−2 | N + C | Video de demo, modo degradado offline, **entrega completa con declaración de IA** | **T−2 h: entregado** |
| 6 | T−2→pitch | N + todos | Ensayar 3 veces, cronometrado, con las preguntas incómodas | — |

---

## 7. Subagentes de exploración durante el evento

- **Hora 1:** dos `explorador-datos` en paralelo (D1: filas de SIA2 y tiempo de cutout sobre WISE 0855
  y Barnard; D2: deriva de λ entre épocas con `WCS-WAVE`), más un agente que **revisa de nuevo la pestaña
  Resources** del desafío (puede cambiar) y actualiza `docs/00_DESAFIO.md`.
- **Antes de cada merge que se ve en la demo:** `revisor-cientifico`.
- **Antes de la congelación y de la demo:** `revisor-interfaz` + `/chequeo-demo`.

---

## 8. Verificación (criterio de «terminado»)

- CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `pytest -q` en backend y `npm run build` en frontend.
  Al empezar el evento, quitar el `|| true` del linter.
- **Aceptación = los 5 campos en la app desplegada:** Barnard, WISE 0855 (con coordenada propagada) y
  ε Ind B se ven moverse; RW Aur y R Dra cambian de brillo; los marcadores de Gaia caen sobre las estrellas
  en la época del fotograma; `campo_vacio` muestra un estado vacío claro.
- `/chequeo-demo` pasa; el modo offline sirve los 5 campos; el pitch dura ≤ 2 min.

---

## 9. Pendientes del Bloque 0

- [ ] Javiera y Vladimir: leer este README, [`docs/00_DESAFIO.md`](docs/00_DESAFIO.md) y [`docs/briefings/`](docs/briefings/) (20 min).
- [ ] Confirmar o intercambiar los roles D1/N según experiencia.
- [ ] Decidir dónde corre el backend (Vercel para el frontend) y actualizar el ADR-001.
- [ ] Juan Pablo: confirmar con la organización comida y si se puede quedar de noche.
- [ ] Todos: clonar el repo, abrir `claude` en la raíz y comprobar `/standup`.
- [ ] Todos: Python 3.11, Node 20, Docker instalados.
- [ ] Juan Pablo: llevar la zapatilla eléctrica.

---

## Equipo

Mauricio Valenzuela · Bryan Cabezas · Juan Pablo Castillo · Antonia Del Castillo · Javiera · Vladimir.
Kit de trabajo original: [jpcastillo714/spherex-kit](https://github.com/jpcastillo714/spherex-kit).
Material de la reunión de preparación (13-nov): [`docs/reuniones/`](docs/reuniones/).

## Licencia y atribución

Código bajo licencia MIT ([`LICENSE`](LICENSE)). Los datos de SPHEREx son públicos y requieren la nota de
agradecimiento de [`docs/02_DATOS_SPHEREX.md`](docs/02_DATOS_SPHEREX.md) §8 en el README final y en el pie de la herramienta.
