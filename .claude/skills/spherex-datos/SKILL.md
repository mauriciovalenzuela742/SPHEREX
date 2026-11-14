---
name: spherex-datos
description: Cómo pedir datos de SPHEREx al archivo IRSA/IPAC - colecciones SIA2 (spherex_dr1, spherex_qr3 y variantes deep y cube), servicio de cutouts, estructura del MEF de nivel 2 y sus seis extensiones (IMAGE, FLAGS, VARIANCE, ZODI, EPSF, WCS-WAVE), las seis bandas y sus longitudes de onda, el cubo HiPS de todo el cielo de DR1, y las herramientas de IRSA que ya existen (Data Explorer, MOST, Cutout, Mosaic, Spectrophotometry, Source Discovery). Actívala cuando haya que consultar, descargar, recortar, leer o entender datos de SPHEREx; cuando se mencione IRSA, IPAC, SIA2, pyvo, astroquery, cutout, MEF, FITS de SPHEREx, DR1, QR2, QR3, WCS-WAVE, luz zodiacal, filtro lineal variable o LVF; o al diseñar el backend que alimenta el visor.
---

# Datos de SPHEREx en IRSA

Referencia operativa. El documento largo, con fuentes, es `docs/02_DATOS_SPHEREX.md`;
esta skill es lo que se necesita para escribir código sin equivocarse.

**Regla de oro: si una ruta o un parámetro no está en esta skill ni en la documentación oficial de
IRSA, no lo inventes.** Consulta <https://caltech-ipac.github.io/spherex-archive-documentation/>.

---

## 1. Lo primero que hay que entender: el filtro lineal variable

SPHEREx no tiene filtros discretos. La longitud de onda varía de forma continua a lo largo de un eje
del detector. El espectro de una fuente se construye observándola muchas veces, cada vez en una
posición distinta del campo, y **por tanto cada vez en una longitud de onda distinta**.

**Consecuencia directa:** dos imágenes de la misma zona del cielo tomadas en épocas distintas
normalmente **no están en la misma longitud de onda**. Un blink ingenuo produce una secuencia donde
el brillo salta sin que nada se haya movido.

Por eso, en cualquier código que construya una secuencia temporal:

1. **Agrupa por detector/banda** antes de formar la secuencia.
2. **Lee `WCS-WAVE`** y expón la λ de cada fotograma. No es opcional: es el campo que explica lo que
   el usuario está viendo.
3. **Normaliza cada fotograma** con percentiles robustos sobre el mismo recorte.

---

## 2. Las seis bandas

| Banda = detector | λ | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

Hay **6 MEF por apuntado**, uno por detector. **No todas las observaciones traen las 6**: la calidad
se evalúa por banda. El código tiene que tolerar bandas ausentes sin fallar.

Para enanas marrones frías y objetos rojos, las bandas largas (4–6) son las interesantes.

---

## 3. Colecciones SIA2

Endpoint genérico:

```
https://irsa.ipac.caltech.edu/SIA?
```

| COLLECTION | Qué es |
|---|---|
| `spherex_dr1` | Imágenes espectrales DR1, barrido ancho |
| `spherex_dr1_deep` | DR1, campos profundos |
| `spherex_dr1_cube` | Cubo de todo el cielo DR1 |
| `spherex_qr3` | Imágenes espectrales QR3, barrido ancho |
| `spherex_qr3_deep` | QR3, campos profundos |

- **DR1 + QR3 reemplazan a QR2.** Para buscar todo lo vigente hay que consultar **las dos**.
- **QR2 no es buscable** por SIA2. Sigue descargable por URL directa hasta febrero de 2027.
- Los archivos de **calibración no están en SIA2**: se bajan de los directorios navegables.
- Los datos se ingestan **semanalmente** y SIA2 **va ~1 día por detrás** de los directorios y del
  Data Explorer.

Consulta por línea de comandos (ejemplo de la documentación de IRSA):

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO`, todo en grados. Quita `RESPONSEFORMAT` para recibir VOTable.

Columnas de la respuesta que importan:

- `access_url` — URL del archivo en IPAC. **Es sobre esta URL que se pide el cutout.**
- `cloud_access` — cómo leer el mismo archivo desde AWS S3.

---

## 4. Cutouts

Un MEF completo pesa **~70 MB**. Para un visor hay que pedir recortes **siempre**.

Se piden **añadiendo parámetros a la `access_url`**:

```bash
curl -o cutout.fits "<access_url>?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` en grados decimales.
- `size` en grados.
- Documentación: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

**Solo funciona sobre los archivos alojados en IPAC, no sobre la copia de AWS.**

El MEF recortado conserva las mismas extensiones; `IMAGE`, `FLAGS`, `VARIANCE` y `ZODI` se recortan,
`WCS-WAVE` se ajusta, y **la extensión de PSF viene sin modificar** (es la de la imagen entera).

---

## 5. Qué hay dentro del MEF

2040 × 2040 píxeles, seis extensiones:

| HDU | Nombre | Contenido | Trampa |
|---|---|---|---|
| 1 | `IMAGE` | Brillo superficial, MJy/sr | **La luz zodiacal NO está restada** |
| 2 | `FLAGS` | Bits de estado por píxel | Definiciones en la tabla 16 del Explanatory Supplement |
| 3 | `VARIANCE` | Varianza, (MJy/sr)² | Úsala para la relación señal-ruido |
| 4 | `ZODI` | Modelo de luz zodiacal, MJy/sr | Réstalo tú: `IMAGE - ZODI` mejora mucho el contraste |
| 5 | `EPSF` (DR1/QR3) o `PSF` (QR2) | PSF por zona del detector | Cambió entre releases. No asumas la forma |
| 6 | `WCS-WAVE` | Píxel → λ central y ancho de banda | Parte poco usada del estándar FITS; muchos lectores no la entienden |

Sobre `WCS-WAVE`: es una tabla de **1 fila y 3 columnas** (`X`, `Y`, `VALUES`), una rejilla de puntos
de control. Si tu lector no la reconoce, **interpola bilinealmente entre los cuatro puntos de control
más cercanos**: precisión ~1 nm, suficiente para visualización. Para ciencia hay que usar `CWAVE` y
`CBAND` del producto de calibración Spectral WCS.

**Convención de píxeles:** los headers FITS son 1-based; Astropy devuelve 0-based. IRSA lo advierte
explícitamente al trabajar con la PSF. Es la causa clásica de desplazamientos de un píxel.

### Nombres de archivo

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits` se lee así:
`2025W18_2B` = planning period (~3,5 días de operación) · `0001` = large slew ·
`1` = small slew (1–4) · `D1` = detector 1 · `v12-2025-164` = versión y fecha de procesamiento.

---

## 6. El cubo de todo el cielo (solo DR1)

Mosaicos de todo el cielo, uno por cada uno de los 102 canales. **Hay dos versiones** (comprobado el 14-nov, `docs/09`):

1. **La de SIA2** (`COLLECTION=spherex_dr1_cube`, directorio `.../ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir[N]/`):
   FITS de ~320 MB por tesela; el servicio de recortes la rechaza. **No sirve para Aladin.** (La raíz
   de ese directorio como HiPS, `.../properties`, da 404.)
2. **La HiPS para navegador:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
   (PNG, orden 5, 102 planos, 50 y 51 vacíos, CORS abierto). **Esta es la que carga Aladin Lite.**
   Ver la skill `visor-sky-blink`.

No confundir los dos productos:

| | Nivel 2 | Cubo de todo el cielo |
|---|---|---|
| Eje que aporta | **Tiempo** | **Longitud de onda** |
| Para | El blink, el movimiento | El color y el contexto (PNG sin flujos: el espectro **no** sale de aquí, sale de nivel 2) |
| Resolución | Nativa | HEALPix orden 5 (gruesa) |
| Dónde | DR1, QR3 | Solo DR1 |

---

## 7. Python

```bash
pip install pyvo astroquery astropy
```

Los notebooks oficiales son el camino más corto y están en
<https://caltech-ipac.github.io/irsa-tutorials/spherex/>: Data Overview, Spectral Image Cutouts,
PSF Models, Source Discovery Tool, Mosaic Cube, HiPS All-Sky Cube.

**Antes de escribir un cliente propio, mira `spxquery`** (<https://spxquery.readthedocs.io>,
`pip install spxquery`): paquete de terceros que ya hace consulta TAP a IRSA, descarga con cutout,
fotometría de apertura con resta de zodiacal, combinación en cubos 3D y curvas de luz. Aunque no se
use, su arquitectura de cuatro etapas y su control de calidad (umbral de SNR, filtrado por flags)
son un buen mapa de lo que hay que resolver.

---

## 8. Herramientas de IRSA que ya existen

Antes de construir algo, comprueba si IRSA ya lo hizo. Todas están enlazadas desde
<https://irsa.ipac.caltech.edu/Missions/spherex.html>.

| Herramienta | Qué hace |
|---|---|
| **SPHEREx Data Explorer** | Búsqueda, visualización y descarga, para astrónomos |
| **MOST** | Dada la órbita de un objeto del sistema solar, encuentra las imágenes que cubrieron su posición predicha en cada época |
| **Spectrophotometry Tool** | Extrae espectros por fotometría forzada |
| **Mosaic Tool** | Mosaicos multibanda a medida |
| **Cutout Tool** | Recortes de los MEF |
| **Source Discovery Tool** | Detecta y caracteriza fuentes sin posiciones previas |
| **Cloud Data Access** | Los mismos datos en AWS S3 |
| **Comet 3I/ATLAS** | Colección dedicada de imágenes del cometa interestelar |

---

## 9. Atribución obligatoria

Debe aparecer en cualquier material publicado que use datos de SPHEREx:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## 10. Errores que ya sabemos que se cometen

1. **Blinkear sin agrupar por banda.** Produce una secuencia estroboscópica. Sección 1.
2. **Olvidar restar `ZODI`.** Las fuentes débiles se pierden en el fondo.
3. **Asumir que todas las épocas traen las 6 bandas.** No es así.
4. **Buscar solo en `spherex_dr1`** y concluir que hay pocas épocas. Hay que sumar `spherex_qr3`.
5. **Usar QR2 porque es lo que decía un tutorial viejo.** No es buscable por SIA2.
6. **Bajar el MEF completo** en vez de pedir cutout. 70 MB por época.
7. **Mezclar 1-based y 0-based** al convertir píxeles. Desplazamientos de un píxel.
8. **Presentar fotometría de apertura como calidad científica.** Siempre con su advertencia.
9. **Pedir cutouts sobre la URL de AWS.** El servicio solo opera sobre los archivos de IPAC.
10. **Concluir «no hay datos» tras una consulta vacía.** Prueba otra colección, otro radio, otra banda.

---

## 11. Extras verificados contra la documentación de IRSA/AWS (14-nov-2026)

Añadidos desde la exploración del equipo. Confírmalos en la hora 1 con un archivo real.

- **Espejo en AWS (lectura masiva, sin cuenta):** `s3://nasa-irsa-spherex/{qr3,dr1}/level2/...`,
  región `us-east-1`, acceso anónimo. Misma estructura de directorios que IRSA. Lectura parcial sin
  bajar los 70 MB:
  ```python
  from astropy.io import fits
  with fits.open(s3_url, use_fsspec=True, fsspec_kwargs={"anon": True}) as h:
      sub = h["IMAGE"].section[y0:y1, x0:x1]
  ```
  Útil solo si el backend corre en `us-east-1`. Para un objeto, el cutout de IRSA es más simple (error 9).
- **Consulta TAP rápida, ordenada por tiempo y con la URL del cutout ya armada** (camino rápido del
  tutorial `spherex-cutouts`: join espacial indexado sobre `spherex.plane.poly`):
  ```python
  from astroquery.ipac.irsa import Irsa
  from astropy.utils.data import conf; conf.remote_timeout = 120
  q = f"""SELECT 'https://irsa.ipac.caltech.edu/' || a.uri ||
    '?center={ra},{dec}d&size=0.1' AS uri, p.time_bounds_lower, p.energy_bandpassname
  FROM spherex.artifact a JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1=CONTAINS(POINT('ICRS',{ra},{dec}), p.poly)
  ORDER BY p.time_bounds_lower"""
  tab = Irsa.query_tap(q).to_table()
  ```
  Añade `AND p.energy_bandpassname='SPHEREx-D4'` para una sola banda.
- **λ en el píxel de la fuente con astropy** (WCS alternativo `W` de la extensión `WCS-WAVE`):
  ```python
  from astropy.wcs import WCS
  x, y = WCS(h["IMAGE"].header).world_to_pixel(coord)
  wcs_w = WCS(h["IMAGE"].header, fobj=h, key="W"); wcs_w.sip = None
  lam, dlam = wcs_w.pixel_to_world(x, y)   # λ central y ancho de banda
  ```
  Si falla, interpolación bilineal entre los 4 puntos de control más cercanos de la tabla (~1 nm).
- **Descarga robusta:** `ThreadPoolExecutor(max_workers=10)` con reintento ante `TimeoutError`,
  `HTTPError`, `IncompleteRead` y `RemoteDisconnected` (así lo hace el notebook oficial). Un cutout sin
  solapamiento devuelve **HTTP 500**: trátalo como «sin datos», no como caída.
- **Las estrellas que se mueven salen como dipolo** (par positivo/negativo) en `diff_first`/`diff_prev`.
  Es lo esperado y es lo que el usuario debe ver; no es variabilidad.
- **Para restar épocas, primero `reproject.reproject_interp` a una grilla común:** cada época viene
  con otra rotación. Muestra la resta en S/N usando `VARIANCE` para que los residuos de estrellas
  brillantes no parezcan detecciones.
