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
- **Riesgo real:** que el HiPS de IRSA no sirva con CORS o que Aladin Lite no maneje bien un cubo
  de 102 planos. **Comprobar en la hora 1.** Plan B: el HiPS de SPHEREx del CDS
  (`alasky.cds.unistra.fr`), que sirve para el contexto aunque sea de una versión anterior.

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
  "pixel_scale_arcsec": 6.2,
  "wcs": { "crval1": 133.7951, "crval2": -7.2452, "cdelt1": -0.0017, "cdelt2": 0.0017 },
  "n_frames": 9,
  "frames": [
    {
      "t": "2025-05-12T03:11:00Z",
      "epoch_id": "2025W19_2B_0073_2D3",
      "wavelength_um": 3.41,
      "bandwidth_um": 0.031,
      "png": "/static/cache/ab12cd/0001.png",
      "flagged_fraction": 0.004,
      "vmin": -0.8, "vmax": 12.3
    }
  ],
  "warnings": ["La época 2026W02_1A no trae banda 4 y se omitió."]
}
```

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
- **`flagged_fraction`** cubre la viñeta de los *contamination flags* con un campo.

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
