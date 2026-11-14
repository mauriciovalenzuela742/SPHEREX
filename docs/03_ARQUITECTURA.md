# 03 — Arquitectura

Propuesta de arquitectura y, sobre todo, **el contrato de la API**, que es lo que permite que
frontend y backend avancen en paralelo desde la hora 1.

Esta es una propuesta pre-evento. Se confirma o se corrige en la hora 1 con los datos reales
(ver el checklist al final de [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)) y queda registrada en
[`adr/ADR-001-stack.md`](adr/ADR-001-stack.md).

---

## 1. Dos vías, y hay que tener las dos

El proyecto tiene un camino rápido y uno completo. **La clave es que el rápido existe de verdad**,
gracias a que el cubo de todo el cielo de DR1 se publica en formato HiPS.

### Vía A — «el cielo en 102 colores», sin backend

Aladin Lite carga directamente el cubo HiPS de SPHEREx DR1 servido por IRSA. El usuario navega el
cielo y mueve un deslizador de longitud de onda. **Cero backend.**

- **Qué da:** las 102 bandas, contexto de todo el cielo, overlays de Gaia y de catálogos del CDS.
- **Qué no da:** el eje del tiempo. El cubo es un mosaico combinado, no una serie de épocas.
- **Costo:** horas, no días. Riesgo técnico bajo.
- **Riesgo resuelto (14-nov):** el HiPS de IRSA (`/data/hips/SPHEREx/spherex_allsky_cube`, PNG, 102 planos, el 50 y el 51 vacíos) carga en Aladin Lite 3.8.2 con CORS abierto (`09_EDA_HALLAZGOS.md` §6). El plan B del CDS (`alasky.cds.unistra.fr`) no se pudo comprobar: ese día devolvió 404.

### Vía B — el blink temporal, con backend

Es el desafío propiamente dicho. El backend consulta SIA2 por posición, pide cutouts de cada época,
los agrupa por banda, los normaliza y devuelve una secuencia de fotogramas ordenada en el tiempo.

- **Qué da:** el videíto. Lo que se juzga.
- **Costo:** es el grueso del trabajo.
- **Cuello de botella:** la latencia de los cutouts. Sin caché, la demo no sobrevive.

**Las dos vías se montan en la misma pantalla.** Aladin Lite da el contexto y la navegación; un panel
al lado da el blink temporal del recorte. El usuario entiende enseguida que son dos ejes del mismo dato.

---

## 2. Diagrama

```
                   ┌───────────────────────────────────────────────┐
  Usuario ───────► │  FRONTEND  (React + Vite + TS)                │
  "Barnard's Star" │                                               │
  o  RA/Dec        │  ┌─────────────────┐  ┌────────────────────┐  │
                   │  │  Aladin Lite v3 │  │  Panel de blink    │  │
                   │  │  contexto +     │  │  <canvas>          │  │
                   │  │  cubo HiPS +    │  │  play/pausa, fps,  │  │
                   │  │  overlay Gaia   │  │  estiramiento,     │  │
                   │  └────────┬────────┘  │  color, resta      │  │
                   │           │           └─────────┬──────────┘  │
                   └───────────┼─────────────────────┼─────────────┘
                   VÍA A       │                     │  VÍA B
                   (directo)   │                     │
                               ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────────────┐
                 │  IRSA  HiPS cube │   │  BACKEND (FastAPI)       │
                 │  (DR1, Norder5)  │   │                          │
                 └──────────────────┘   │  /resolve  /epochs       │
                                        │  /frames   /spectrum     │
                                        │            /health       │
                                        │        │                 │
                                        │        ▼                 │
                                        │  ┌──────────────┐        │
                                        │  │ caché disco  │        │
                                        │  └──────┬───────┘        │
                                        └─────────┼────────────────┘
                                                  ▼
                        ┌──────────────────────────────────────────┐
                        │  IRSA:  SIA2  +  servicio de cutouts     │
                        │  CDS:   SIMBAD (nombres), HiPS, Gaia     │
                        └──────────────────────────────────────────┘
```

---

## 3. Contrato de la API

**Esto es lo único que el frontend puede dar por cierto.** Cualquier cambio se discute, se escribe
aquí primero y se avisa al equipo. Mientras el backend no exista, el frontend trabaja contra un mock
que devuelve exactamente estas formas.

Todas las coordenadas van en **grados decimales**, ICRS. Todos los tamaños en **grados**. Todas las
fechas en **ISO 8601 UTC**.

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "irsa_reachable": true, "cache_entries": 128 }
```

> **Nota (14-nov):** el esqueleto del backend expone hoy `/health` (sin `/api`) y responde `{ "ok": true }`. Si pasa a `/api/health` lo decide D1.

### `GET /api/resolve?q=<texto>`

Resuelve un nombre a coordenadas (vía SIMBAD). Hace que la herramienta sea usable por cualquiera.

```json
{
  "query": "Barnard's Star",
  "resolved": true,
  "name": "V2500 Oph",
  "ra": 269.4521,
  "dec": 4.6933,
  "source": "SIMBAD"
}
```

Si no resuelve: `{"query": "...", "resolved": false, "error": "not found"}` con HTTP 200.
**Un nombre no encontrado no es un error del servidor.**

### `GET /api/epochs?ra=&dec=&size=&collections=`

Qué observaciones existen para esa posición. Es la consulta barata: **no baja imágenes**.
Sirve para que la interfaz muestre enseguida «hay 14 épocas entre mayo de 2025 y octubre de 2026»
mientras los fotogramas se preparan.

`collections` por defecto: `spherex_dr1,spherex_qr3`.

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1,
  "n_epochs": 14,
  "time_range": ["2025-05-12T03:11:00Z", "2026-10-02T19:40:00Z"],
  "bands_available": [1, 2, 3, 4, 5, 6],
  "epochs": [
    {
      "id": "2025W19_2B_0073_2D3",
      "t": "2025-05-12T03:11:00Z",
      "band": 3,
      "detector": 3,
      "collection": "spherex_qr3",
      "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/...fits"
    }
  ]
}
```

### `GET /api/frames?ra=&dec=&size=&band=&stretch=&cmap=&mode=`

El corazón. Devuelve los fotogramas listos para pintar.

| Parámetro | Valores | Por defecto |
|---|---|---|
| `band` | `1`–`6`, o `all` | `4` |
| `size` | grados | `0.1` |
| `stretch` | `linear`, `sqrt`, `log`, `asinh`, `zscale` | `asinh` |
| `cmap` | `gray`, `viridis`, `magma`, `inferno` | `gray` |
| `mode` | `raw`, `zodi_subtracted`, `diff_first`, `diff_prev` | `zodi_subtracted` |

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1, "band": 4, "mode": "zodi_subtracted",
  "pixel_scale_arcsec": 6.15,
  "wcs": { "crval1": 133.7951, "crval2": -7.2452, "cdelt1": -0.0017, "cdelt2": 0.0017 },
  "n_frames": 9,
  "frames": [
    {
      "t": "2025-05-12T03:11:00Z",
      "epoch_id": "2025W19_2B_0073_2D3",
      "wavelength_um": 3.41,
      "bandwidth_um": 0.031,
      "png": "/static/cache/ab12cd/0001.png",
      "flagged_fraction": 0.04,
      "vmin": -0.8, "vmax": 12.3
    }
  ],
  "warnings": ["La época 2026W02_1A no trae banda 4 y se omitió."],
  "source": "vivo"
}
```

`source` (`"vivo"` | `"precalculado"`, también en `/api/epochs`): `precalculado` significa que la
respuesta salió del paquete `data/demo/` de los 5 campos de prueba, sin consultar IRSA. Solo ocurre
con los parámetros por defecto de la demo (`stretch=asinh`, sin `from`/`to`/`epochs`). `GET /api/demo`
lista los campos precalculados.

Decisiones del contrato, y por qué:

- **El backend devuelve PNG ya renderizados, no FITS.** Mandar FITS al navegador obliga a escribir un
  lector de FITS, aplicar el estiramiento y el mapa de color en JavaScript: es el doble de trabajo y
  el triple de bugs. El costo es que cambiar el estiramiento exige volver al servidor; con caché es
  barato, y se puede añadir después un estiramiento fino en el cliente sobre el PNG.
- **`wavelength_um` por fotograma es obligatorio.** Es el campo que impide el error descrito en
  [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2 y, mostrado en pantalla, demuestra al jurado que
  entendemos el instrumento.
- **`warnings` es un array, no un error.** Faltan bandas constantemente; si eso rompe la petición,
  la herramienta no funciona.
- **`flagged_fraction`** cubre la viñeta de los *contamination flags* con un campo. (Medido: con máscara por bits es ~4 % del recorte; contar `FLAGS != 0` daría ~72 %, porque el bit SOURCE no es un error; `09_EDA_HALLAZGOS.md`.)

### `GET /api/spectrum?ra=&dec=&aperture=`

El «extra kudos». Espectro de una posición, al vuelo.

```json
{
  "ra": 133.7951, "dec": -7.2452, "aperture_arcsec": 12,
  "n_points": 87,
  "spectrum": [ { "wavelength_um": 0.78, "flux_mjy": 0.42, "err_mjy": 0.08, "band": 1 } ],
  "method": "aperture photometry, zodi-subtracted",
  "caveat": "Valores indicativos, no fotometría científica. Ver docs/02."
}
```

El campo `caveat` **no es opcional**. Presentar un espectro aproximado como si fuera fotometría
calibrada ante un jurado con astrónomos es la forma más rápida de perder credibilidad.

---

### Cambios al contrato — 14-nov-2026 (pizarra del visor)

Aditivos: nada de lo anterior cambia de forma, así que el mock y el código existentes siguen valiendo.

- **`from` y `to`** (ISO 8601 UTC, opcionales) en `/api/epochs` y `/api/frames`: el control «desde – hasta»
  de la pizarra. Sin ellos, todas las épocas.
- **Animación centrada en una estrella** (clic en la imagen): no hay endpoint nuevo. El frontend llama a
  `/api/frames` con `ra`/`dec` de la estrella y un `size` chico (p. ej. `0.02`).
- **Burbuja con el nombre al pasar sobre una estrella:** `/api/resolve` acepta también `ra`/`dec`
  (búsqueda por cono en SIMBAD, radio 10″) y devuelve el objeto más cercano con la misma forma de respuesta. **Nota (14-nov):** hoy el visor consulta SIMBAD directo desde el navegador (TAP, CDS primero y el espejo de Harvard de respaldo; `scaffold/frontend/src/sky/capas/simbad.ts`), no por `/api/resolve`.
- **Gamma:** se aplica en el cliente sobre el PNG; no viaja al servidor.
- **Precalculado para Vercel:** los 5 campos de prueba se publican como archivos estáticos con exactamente
  estas mismas formas JSON, en `/precalc/<id>/epochs.json`, `/precalc/<id>/frames-b<band>.json` y sus PNG.

### Cambios al contrato — 14-nov-2026, noche (D2: fotogramas y espectro)

Aditivos salvo donde se indica. Implementados en `scaffold/backend/app/frames/` y `app/spectrum/`.

**Nombres de parámetros (decisión, cierra el punto 1 de «Pendiente»):** en toda la API oficial el rango de
fechas es **`from` / `to`** (ISO 8601 UTC, opcionales). Un fotograma es **una visita** (varias exposiciones
en pocos días) y **`per_visit`** (1–10) dice cuántas de sus exposiciones se combinan (mediana). El prototipo
(`prototipos/rango_fechas`) acepta `from`/`to` además de sus `start`/`end`; sus rutas `/api/grid`,
`/api/frame` y `/api/presets` son del prototipo, **no** del contrato.

**Tamaño del recorte:** `size` ∈ (0,005; 0,5] grados en `/api/frames`; el servidor rechaza más (422) y el
frontend no debe ofrecerlo. Motivo medido (14-nov, lector por rangos, banda 3): el tiempo por imagen casi
no cambia (≈1–1,5 s, lo domina la latencia de IRSA), pero los datos crecen con el área: ~29 KB leídos por
imagen a 0,1°, ~185 KB a 0,25°, ~733 KB a 0,5°, y lo mismo los PNG de la respuesta (59² → 293² píxeles).
El límite cuida el tamaño de la respuesta y la memoria del navegador, no el tiempo.

**`GET /api/frames` — parámetros adicionales**

| Parámetro | Valores | Por defecto | Para qué |
|---|---|---|---|
| `from`, `to` | ISO 8601 | — | Rango de fechas |
| `per_visit` | 1–10 | `1` | Exposiciones combinadas por visita (mediana) |
| `mode` | además: `coadd`, `coadd_diff` | `zodi_subtracted` | **Suma por barrido** (abajo) |
| `max_per_sweep` | 1–200 | `40` | Exposiciones por barrido en `coadd` |
| `budget_s` | 0–55 | `8` | Presupuesto de tiempo (ADR-001); lo que no alcanza va a `pending` |
| `epochs` | lista de `epoch_id` | — | Pedir solo esos (para completar `pending`) |
| `vmin`, `vmax` | número | — | Repetir la escala de la primera respuesta, para que no salte |
| `fast` | `true`/`false` | `true` | Lector por rangos (rápido, sin FLAGS) o servicio de recortes |

Respuesta, además de lo de arriba: `pending` (lista de `epoch_id` sin terminar), `unit` (`visita` o
`barrido`), `n_visits` / `n_sweeps`, `elapsed_s` y, por fotograma, `n_stacked` y `method`
(`rangos`/`recortes`). `png` es un **data URI**. `flagged_fraction` puede ser `null` (el lector por rangos
no lee FLAGS); cuando no es `null` se calcula con máscara por bits, nunca con `FLAGS != 0` (punto 6).

**Suma por barrido (`mode=coadd`, `mode=coadd_diff`; cierra la mitad del punto 3).** Un barrido es el paso de
SPHEREx por la zona (vuelve cada ~6 meses; visitas separadas por más de 60 días son otro barrido). Todas
sus exposiciones (hasta `max_per_sweep`) se reproyectan a la rejilla común norte-arriba (el detector gira
~180° entre barridos) y se suman con peso **1/VARIANCE** píxel a píxel: Σ(d/σ²)/Σ(1/σ²). `coadd_diff`
devuelve la resta respecto del primer barrido (con igualación de flujo, como `diff_first`). Medido con
WISE 0855 en banda 5: 3 barridos de 8, 25 y 15 exposiciones, 20 s la primera vez; en la resta aparece el
par azul/rojo hacia el oeste que en la resta de exposiciones sueltas se pierde en el ruido.

**`GET /api/spectrum` — implementado**

`ra`, `dec` (grados), `aperture` (radio en ″, 2–60, defecto 12), `from`, `to`, `bands` (lista, defecto
`1,…,6`), `max_points` (6–600, defecto 120: se reparten en el tiempo dentro de cada banda), `budget_s`,
`epochs`, y para objetos con movimiento propio `pmra`, `pmdec` (mas/año, pmra con cos δ) y `epoch` (año de
`ra`/`dec`, defecto 2000): la apertura se centra en la posición propagada a cada fecha.

Un punto por exposición: fotometría de apertura en píxeles nativos del detector, fondo = mediana de un
anillo (r+2 a r+5 px), error con VARIANCE, λ y ancho en el píxel del objeto (WCS-WAVE), flujo en **mJy**.
Respuesta: `spectrum: [{wavelength_um, bandwidth_um, flux_mjy, err_mjy, band, t, epoch_id, collection}]`
ordenado por λ, más `n_points`, `n_candidates`, `pending`, `method`, `caveat` (obligatorio), `warnings`.
Las exposiciones con saturación o fuera del detector se omiten y se cuentan en `warnings`.

## 4. URL de la aplicación

El desafío pide explícitamente poder consultar la herramienta por URL. El formato es parte del
contrato:

```
https://<dominio>/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
https://<dominio>/?target=WISE+0855&size=0.2
```

Reglas: `target` tiene prioridad sobre `ra`/`dec`; todo parámetro ausente toma el valor por defecto;
**la URL siempre refleja el estado actual del visor** (se actualiza con `history.replaceState`), para
que copiar la barra de direcciones sea compartir exactamente lo que se está viendo. Esa es la
funcionalidad que convierte la herramienta en infraestructura para otros proyectos, como pasó con WiseView.

---

## 5. Caché

Sin caché no hay demo. Es la pieza menos vistosa y la más importante.

- **Clave:** hash de `(ra, dec, size, band, mode, stretch, cmap)` redondeando coordenadas a ~1 arcsec.
- **Qué se guarda:** los PNG renderizados y el JSON de la respuesta. Opcionalmente los cutouts FITS.
- **Dónde:** `data/cache/` en disco. En el evento sobra; Redis solo si hace falta compartir entre procesos.
- **Precalentado:** **los cinco campos de prueba se precalientan al arrancar el servidor.** La demo
  ante el jurado usa esos cinco. Nunca se demuestra con una consulta fría.
- **TTL:** no hace falta expirar nada en 24 horas. No se construye lo que no se necesita.

---

## 6. Despliegue

El desafío dice «public-facing web tool». Una URL que el jurado pueda abrir vale más que cualquier
diapositiva.

- **Frontend:** build estático en cualquier CDN (Vercel, Netlify, GitHub Pages).
- **Backend:** contenedor en un servicio con capa gratuita. **Cuidado con los que duermen el
  contenedor por inactividad**: si el jurado abre la URL y espera 50 segundos, está perdido. De ahí
  el precalentado y, si hace falta, un ping periódico.
- **Plan B obligatorio:** vídeo de la demo grabado y un modo de la aplicación que funcione con datos
  en caché sin tocar IRSA. **El wifi de un hackatón se cae.** Ver [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 7. Lo que deliberadamente no vamos a hacer

Escrito de antemano para que a las 4 de la mañana nadie lo reabra:

- **No vamos a escribir nuestro propio visor de cielo.** Aladin Lite existe y lo cita el desafío.
- **No vamos a implementar shift-and-stack.** Ver [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §3.
- **No vamos a entrenar un modelo de video.** Ídem, §6.
- **No vamos a hacer fotometría de calidad científica.** Para eso está la Spectrophotometry Tool de IRSA.
- **No vamos a montar cuentas de usuario.** Si hace falta guardar un hallazgo, se guarda como URL.
- **No vamos a reprocesar nada de nivel 1.** Partimos de nivel 2, que es lo publicado.


---

## Pendiente de acuerdo del equipo (14-nov)

Propuestas que salen de la revisión de documentación ([`REVISION_DOCUMENTACION_2026-11-14.md`](REVISION_DOCUMENTACION_2026-11-14.md)) y de los datos medidos en el EDA. **No cambian el contrato vigente** de arriba: se aplican solo cuando el equipo lo acuerde (README §5, regla 4).

1. ~~**Nombres de los filtros de fecha.**~~ **Resuelto el 14-nov (noche):** `from`/`to` en toda la API oficial; ver «Cambios al contrato — 14-nov-2026, noche».
2. **Rutas nuevas del prototipo.** `/api/grid` (visitas por banda y columna de fecha), `/api/frame` (un fotograma por visita) y `/api/presets` (los 5 campos con la posición propagada) existen en esa rama y no figuran aquí. `docs/10` ya cita `/api/presets`.
3. **Pedir λ igualada y suma por barrido.** *Suma por barrido: resuelta el 14-nov (noche), `mode=coadd`/`coadd_diff`. Queda pendiente pedir λ igualada.* `/api/frames` no tiene forma de pedir épocas a λ igualada ni la suma de exposiciones por barrido; el EDA concluye que la unidad natural del video es el barrido (3-4 fotogramas) y que hay que igualar λ (`09_EDA_HALLAZGOS.md` §2).
4. **Colecciones por defecto.** `collections=spherex_dr1,spherex_qr3` deja casi sin datos a R Dra, que está sobre todo en los `_deep` (1.233 + 733 archivos contra 422 + 126 normales; `09_EDA_HALLAZGOS.md` §1).
5. **Caché en disco frente a Vercel.** Vercel Functions no tiene disco persistente; si `/api` corre allí, la caché (`data/cache/`) tiene que ser en memoria o almacenamiento externo (ADR-001, actualización 14-nov).
6. **Máscara de contaminación.** Documentar en el contrato que `flagged_fraction` se calcula con máscara por bits y nunca con `FLAGS != 0`.
