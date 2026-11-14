<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/docs/02_DATOS_SPHEREX.md) · **Español** · [中文](../../zh/docs/02_DATOS_SPHEREX.md) · [Deutsch](../../de/docs/02_DATOS_SPHEREX.md) · [Italiano](../../it/docs/02_DATOS_SPHEREX.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `docs/02_DATOS_SPHEREX.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# 02 — Datos de SPHEREx: dónde están y cómo se piden

Ficha técnica. Todo lo de aquí está tomado de la documentación oficial de IRSA/IPAC consultada el
**14 de noviembre de 2026**, salvo lo marcado `[RAZONAMIENTO]`, que es deducción nuestra y hay que
comprobar contra los datos.

Fuentes principales:

- Página de misión: <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- Guía de acceso: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access>
- Guía de productos: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products>
- Cutouts: <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html> y <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- Notebooks: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

---

## 1. La misión en números

| Dato | Valor |
|---|---|
| Vida planificada | 2025 – 2027 |
| Cobertura | 100 % del cielo, un barrido completo cada ~6 meses |
| Rango | 0,75 – 5,0 µm (infrarrojo cercano) |
| Canales espectrales | 102 |
| Detectores | 6 arreglos (3 de onda corta, 3 de onda larga, separados por un dicroico) |
| Instrumento | Espectrógrafo de imagen con **filtro lineal variable (LVF)** de campo amplio |

Resolución espectral por banda (esto define qué detector sirve para qué):

| Banda / detector | Longitud de onda | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

---

## 2. El detalle que decide el proyecto: cómo SPHEREx obtiene espectros

SPHEREx no tiene filtros discretos. Tiene un **filtro lineal variable**: la longitud de onda
cambia de forma continua a lo largo de un eje del detector. En palabras de la documentación de IRSA:

> SPHEREx obtains spectra through multiple exposures, placing a given source at multiple positions
> in the field of view, where it is measured at multiple wavelengths by repointing the spacecraft.

Es decir: **el espectro de una fuente se construye observándola muchas veces, cada vez en una parte
distinta del detector, y por tanto cada vez en una longitud de onda distinta.**

`[RAZONAMIENTO]` La consecuencia para este desafío es grande y conviene tenerla clara desde la
hora 0. Si uno toma todas las imágenes de nivel 2 que cubren una posición del cielo, las recorta y
las pasa en secuencia, **no obtiene un blink limpio: obtiene una secuencia donde el brillo de cada
fuente salta porque cada fotograma está en otra longitud de onda.** Una estrella roja aparecerá
brillante en unos fotogramas y débil en otros sin haber cambiado. Eso arruina precisamente lo que
el desafío quiere mostrar: lo que se mueve y lo que de verdad varía.

Las tres salidas posibles, en orden de costo:

1. **Agrupar por banda/detector antes de hacer el blink.** Cada fotograma del video es la misma
   banda (p. ej. detector 4) en épocas distintas. Dentro de una banda la longitud de onda todavía
   varía, pero mucho menos. Es la lectura literal de la viñeta del desafío: *«it may make sense to
   separately add together all the data taken by each of the six detector arrays»*.
2. **Agrupar por longitud de onda usando la extensión `WCS-WAVE`**, que da la λ central en cada
   píxel. Más correcto y más caro.
3. **Normalizar cada fotograma** (percentiles robustos sobre el mismo recorte) para que el salto de
   nivel no domine. Es un parche visual, no una solución física, pero en 24 horas puede ser lo que
   salve la demo.

> **Comprobado el 14-nov ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) §2):** agrupar solo por detector
> **no** iguala la λ (dentro de un detector varía ~16 anchos de banda). Hay que elegir épocas a λ
> igualada; es barato porque la λ sale de `WCS-WAVE` con una petición HTTP Range de ~35 KB.

**Esto había que comprobarlo con datos reales en la hora 1 del evento**, no discutirlo. Bajar los
cutouts de un mismo campo, leer `WCS-WAVE` de cada uno y ver cuánta λ varía entre épocas.

---

## 3. Qué versiones de los datos existen hoy

Cronología de publicaciones según la página de misión de IRSA:

| Fecha | Qué salió |
|---|---|
| Julio 2025 | Primeros productos Quick Release (QR1) |
| Octubre 2025 | QR2 (reprocesado) |
| 10 abril 2026 | Corrección de un error en el header de la extensión PSF de QR2 |
| Septiembre 2026 | QR3 |
| **Noviembre 2026** | **Data Release 1 (DR1)** |

**DR1 y QR3 juntos reemplazan a QR2.** QR2 sigue descargable directamente hasta febrero de 2027,
pero ya no es buscable por SIA2.

> **DR1 acaba de salir, este mismo mes.** Es muy probable que ningún otro equipo lo haya usado y
> casi seguro que los tutoriales y los ejemplos que circulan por internet aún apunten a QR2.
> Esto es a la vez la mayor oportunidad y el mayor riesgo del proyecto. Ver [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 4. Los cuatro caminos de acceso

IRSA sirve los datos desde dos lugares: en IPAC («on-premises») y en AWS S3. Hay cuatro capas de acceso.

### 4.1 Directorios navegables

Raíz: <https://irsa.ipac.caltech.edu/ibe/data/spherex/>

Un subdirectorio por release: `dr1`, `qr3`, `qr2`. Los MEF de nivel 2 viven en:

```
level2/[Planning Period]/l2b-v[Version]-[Processing Date]/[Detector]/
```

El cubo de todo el cielo (solo DR1):

```
hips5_cube/hips_20261026/Norder5/Dir[Directory Number]/
```

Sirve para `wget`/`curl` masivos y para entender la organización. **No sirve para buscar por
coordenada**: para eso está SIA2.

### 4.2 SIA2 (Simple Image Access v2, estándar IVOA) — la vía principal

Endpoint genérico:

```
https://irsa.ipac.caltech.edu/SIA?
```

Hay que añadir `COLLECTION`. Las cinco colecciones de SPHEREx:

| COLLECTION | Qué contiene |
|---|---|
| `spherex_dr1` | MEF de imagen espectral DR1, barrido **ancho** (cobertura uniforme de todo el cielo) |
| `spherex_dr1_deep` | MEF DR1 de los campos **profundos** |
| `spherex_dr1_cube` | Cubo de todo el cielo DR1 |
| `spherex_qr3` | MEF QR3, barrido ancho |
| `spherex_qr3_deep` | MEF QR3, campos profundos |

**Para buscar todas las imágenes espectrales vigentes de una posición hay que consultar
`spherex_dr1` y `spherex_qr3`** (y las `_deep` si se quieren los campos profundos). QR2 no es buscable.

Ejemplo verificado en la documentación de IRSA:

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO` en grados. Formatos de respuesta: `HTML` para mirar a ojo, VOTable por defecto
para procesar.

La tabla que devuelve trae, entre otras, dos columnas que nos importan:

- `access_url` — URL de descarga del archivo en IPAC. **Es la que se usa para pedir un cutout.**
- `cloud_access` — información para leer el mismo archivo desde AWS S3.

Dos advertencias de la documentación oficial:

- Los archivos de **calibración no están en SIA2**; se bajan de los directorios navegables.
- Los datos se ingestan **semanalmente**, y la disponibilidad vía SIA2 **va con un día de retraso**
  respecto a los directorios, el Data Explorer y algunas consultas TAP.

### 4.3 Cutouts — lo que de verdad hace viable el visor

Un MEF completo pesa **unos 70 MB**. Bajar 15 épocas completas para mostrar un recorte de 0,1° es
inviable en un hackatón y en una herramienta pública.

El servicio de cutouts se invoca **añadiendo parámetros a la URL del archivo**:

```bash
curl -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` en grados decimales.
- `size` en grados.
- Parámetros completos: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

Limitación importante: **los cutouts solo funcionan sobre los archivos alojados en IPAC**, no sobre
la copia en AWS.

El MEF recortado conserva las mismas extensiones. `IMAGE`, `FLAGS`, `VARIANCE` y `ZODI` se recortan;
el `WCS-WAVE` se ajusta al recorte; **la extensión de PSF viene sin modificar**, con la PSF de la
imagen original entera.

### 4.4 Python

```bash
pip install pyvo astroquery astropy
```

`pyvo` y `astroquery` envuelven SIA2. Los notebooks oficiales de IRSA son el camino más corto:

| Notebook | Para qué |
|---|---|
| Data Overview | Encontrar imágenes que cubren una posición y entender el MEF |
| Spectral Image Cutouts | Generar cutouts y empaquetarlos en un MEF nuevo |
| PSF Models | Cómo está organizada la PSF |
| Source Discovery Tool | Descubrir y extraer fuentes |
| Mosaic Cube | Analizar un cubo del Mosaic Tool |
| HiPS All-Sky Cube | Explorar el cubo HiPS en Firefly y extraer un espectro rápido |

Índice: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

También existe **`spxquery`** (v0.4.1), paquete de terceros en PyPI que automatiza consulta, descarga
con cutout, fotometría de apertura con resta de luz zodiacal, combinación en cubos 3D («Drizzle3D»)
y curvas de luz: <https://spxquery.readthedocs.io>. Es la pieza que más se parece a lo que hay que
construir del lado de datos. **Conviene mirarlo antes de escribir nada**: aunque no se use, su
arquitectura de cuatro etapas y su control de calidad son un buen mapa.

---

## 5. Qué hay dentro de un archivo

El producto principal es el **Spectral Image MEF de nivel 2**. Hay **6 por apuntado** (uno por
detector), ~70 MB cada uno, imágenes de **2040 × 2040** píxeles.

| HDU | Nombre | Contenido |
|---|---|---|
| 1 | `IMAGE` | Brillo superficial calibrado en MJy/sr. **No tiene la luz zodiacal restada** |
| 2 | `FLAGS` | Mapa de bits por píxel: estado y procesamiento. Tabla 16 del Explanatory Supplement |
| 3 | `VARIANCE` | Varianza del brillo, en (MJy/sr)² |
| 4 | `ZODI` | Modelo de luz zodiacal, en MJy/sr. **Hay que restarlo uno mismo si se quiere** |
| 5 | `EPSF` (DR1/QR3) o `PSF` (QR2) | PSF efectivas por zona del detector |
| 6 | `WCS-WAVE` | Tabla que mapea píxel → longitud de onda central y ancho de banda |

Notas que ahorran horas:

- **`FLAGS` es la respuesta directa a la viñeta del desafío sobre «contamination flags».** Mostrarlos
  en la interfaz es barato y es exactamente lo que el autor del desafío pidió.
- **La luz zodiacal no está restada.** Para un visor, restar `ZODI` de `IMAGE` mejora mucho el
  contraste de fuentes débiles. Es una línea de código y un argumento de venta.
- **`WCS-WAVE` usa una parte poco común del estándar FITS** que, según IRSA, «aún no han implementado
  todos los lectores». Si tu cliente FITS no la reconoce: busca los cuatro puntos de control más
  cercanos e interpola bilinealmente, con precisión de ~1 nm. **Esa precisión es para visualización.**
  Para ciencia hay que usar las extensiones `CWAVE` y `CBAND` del producto de calibración Spectral WCS.
- **Convención de píxeles.** Los headers FITS son 1-based; Astropy devuelve 0-based. IRSA lo advierte
  explícitamente para el manejo de la PSF. Es una fuente clásica de desplazamientos de un píxel.
- **No todas las observaciones traen las 6 bandas**: la calidad se evalúa por banda y algunas no
  llegan al archivo. El código tiene que tolerar bandas ausentes.

### Nombres de archivo

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

Ejemplo: `level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits`

Descomponiéndolo:

- `2025W18_2B` — **planning period**: el plan de vuelo subido a la nave, cubre ~3,5 días de operación.
- `0001` — contador de *large slew*.
- `1` — contador de *small slew* (1 a 4; algunos large slews traen menos de 4).
- `D1` — detector 1.
- `v12-2025-164` — versión y fecha de procesamiento (año + día del año).

`[RAZONAMIENTO]` El *observation ID* es el que ordena el video en el tiempo. Conviene no fiarse del
nombre y leer la fecha del header, pero para ordenar rápido sirve.

### El cubo de todo el cielo (solo DR1)

DR1 trae un **All-Sky Cube**: mosaicos de todo el cielo interpolados espacial y espectralmente, uno
por cada uno de los 102 canales. Existe en **dos versiones** (comprobado el 14-nov, ver
[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)):

1. **La que entrega SIA2** (`COLLECTION=spherex_dr1_cube`, directorio `hips5_cube/hips_20261026/Norder5/`):
   teselas FITS de 512×512×102, ~320 MB cada una. El servicio de recortes las rechaza (422/503) y
   Aladin no las usa. No sirve para el visor.
2. **La HiPS para navegador**, en `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`:
   teselas **PNG**, orden 5, 102 planos (los 50 y 51 vienen vacíos), píxel de 12,9″, CORS abierto.
   **Esta es la que carga Aladin Lite 3.8.2** sin backend. Es un mosaico de todas las épocas (sin eje
   de tiempo) y en PNG ya estirado (sin flujos).

Que se pueda mostrar en Aladin sin backend es la mejor noticia técnica del desafío para la vía A.
Ver [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md).

Ojo con no confundir los dos productos, porque responden a preguntas distintas:

| | Imágenes de nivel 2 | Cubo de todo el cielo |
|---|---|---|
| Eje que da | **Tiempo** (muchas épocas) | **Longitud de onda** (102 canales) |
| Para qué | El blink, detectar movimiento | Contexto y las 102 bandas como imagen (PNG sin flujos: **no** sirve para el espectro) |
| Resolución | Nativa del detector | Orden 5 de HEALPix (gruesa) |
| Disponible en | DR1, QR3 (y QR2 descargable) | **Solo DR1** |

**El visor que pide el desafío necesita las dos cosas.** El tiempo viene de nivel 2; las 102 bandas
como imagen, del cubo. El espectro (flujo contra λ) sale de los archivos de nivel 2 o del
Spectrophotometry Tool de IRSA, no del cubo ([`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md)).

---

## 6. Herramientas de IRSA que ya existen

Antes de construir algo, mirar si IRSA ya lo hizo. Todas están enlazadas desde la página de misión.

| Herramienta | Qué hace | Por qué nos importa |
|---|---|---|
| **SPHEREx Data Explorer** | Interfaz web de búsqueda, visualización y descarga | Es "el competidor". Mirarlo para ver qué NO hacer: está pensado para astrónomos |
| **MOST** (Moving Object Search Tool) | Calcula la órbita de un objeto del sistema solar y encuentra las imágenes de SPHEREx que cubrieron su posición predicha en cada época | Directamente relevante para asteroides y cometas. Una pestaña "sigue este asteroide" sale casi gratis |
| **Spectrophotometry Tool** | Extrae espectros de las imágenes por fotometría forzada | Es la respuesta de IRSA al «spectra on the fly» del desafío |
| **Mosaic Tool** | Mosaicos multibanda a medida | |
| **Cutout Tool** | Recortes de los MEF | Ya descrito arriba |
| **Source Discovery Tool** | Identifica y caracteriza fuentes en una región sin necesitar posiciones previas | Si se quiere marcar fuentes sobre la imagen |
| **Cloud Data Access** | Los mismos datos en AWS S3 | Para procesamiento pesado |
| **Comet 3I/ATLAS** | Colección dedicada de imágenes espectrales del cometa interestelar | Material listo para una demo con gancho |

`[RAZONAMIENTO]` La colección de 3I/ATLAS merece un minuto de atención: es un objeto que se mueve
rápido, es reciente, y el público lo conoce. Para la demo de 2 minutos vale más que cualquier enana
marrón.

---

## 7. Datos de otras misiones (los overlays)

El desafío sugiere permitir superponer datos de otros telescopios.

| Misión | Acceso | Qué aporta |
|---|---|---|
| **Gaia DR3** | <https://archive.stsci.edu/missions-and-data/gaia>, o `astroquery.gaia`, o el catálogo HiPS del CDS en Aladin | Posiciones, movimientos propios y paralajes precisísimos. Permite **predecir dónde debería estar** una estrella en cada época y comprobar que el visor acierta |
| **WISE / NEOWISE** | IRSA; unWISE en <https://unwise.me> | La comparación obvia: el blink en WISE es lo que hace WiseView |
| **NEOSSat** (CSA) | <https://data.asc-csa.gc.ca/dataset/neossat>, tutorial en <https://github.com/asc-csa/NEOSSAT_Tutorial> | Es un recurso de agencia socia. Usarlo suma en el criterio *Global Connection* |
| **SIMBAD / VizieR** (CDS) | <https://simbad.cds.unistra.fr> | Resolver nombres («Barnard's Star») a coordenadas. **Necesario para que la herramienta sea usable por cualquiera** |

`[RAZONAMIENTO]` Gaia no es solo un adorno visual: es el **control de calidad** del visor. Si se
dibuja sobre la imagen la posición que Gaia predice para la estrella en la fecha de esa época y
coincide con el punto brillante, está demostrado que el WCS, las fechas y el recorte están bien.
Es la forma más barata de probarle a un jurado que la herramienta es correcta, y no solo bonita.

---

## 8. Atribución obligatoria

IRSA exige incluir esta nota en cualquier material publicado que use datos de SPHEREx:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**Va en el pie de la herramienta y en el README.** Es un punto gratis de prolijidad ante un jurado
de la NASA y cuesta treinta segundos.

Papers canónicos que IRSA pide citar: Bock et al. (2026) para la misión, Akeson et al. (2026) para
el pipeline, Crill et al. (2025) para el simulador de cielo, Korngut et al. (2026) para instrumento y
calibración. Detalles en [`../biblio/README.md`](../biblio/README.md).

---

## 9. Checklist de la hora 1 del evento

Esto es lo que hay que comprobar con datos reales antes de decidir nada:

- [x] Una consulta SIA2 a `spherex_dr1` sobre WISE 0855 devuelve filas. Anotar cuántas. **Sí: 258 archivos** (`docs/09` §1).
- [x] Lo mismo sobre `spherex_qr3`. Anotar cuántas y si se solapan con las anteriores. **0 filas para WISE 0855; no se repiten archivos entre las dos** (`docs/09` §1).
- [x] ¿Cuántas épocas distintas hay para un campo típico? Esto decide si el "video" tiene 5 o 50 fotogramas. **3-4 barridos por zona, base de 1,0-1,4 años** (`docs/09` §1).
- [x] Un cutout de `size=0.1` se baja en menos de N segundos. Medirlo. **Decide si hace falta caché o cola.** *(Medido: mediana 7,3 s, p90 10,8 s, máx. 29 s, ~3,9 MB; hace falta caché; `docs/09` §6.)*
- [ ] Abrir el MEF recortado y confirmar las 6 extensiones. *(Sin verificar en el EDA.)*
- [x] Leer `WCS-WAVE` de dos épocas distintas del mismo campo. **¿Cuánto cambia la λ?** (sección 2). **~16 anchos de banda dentro de un detector** (`docs/09` §2).
- [x] ¿El cubo HiPS de DR1 se carga en Aladin Lite apuntando al directorio de IRSA? Si sí, hay vía rápida. **Sí, el HiPS PNG de `/data/hips/SPHEREx/spherex_allsky_cube` (no el directorio `ibe/`).**
- [x] ¿IRSA responde con CORS a una petición desde el navegador? Si no, **todo pasa por el backend**. **No: solo el HiPS tiene CORS; SIA2 y cutouts pasan por el backend** (`docs/09` §6).

*Respondido el 14-nov en [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md). Queda abierta solo la casilla de las 6 extensiones.*
