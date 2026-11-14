# Repositorios y herramientas de código

Lo que ya existe y nos puede ahorrar horas. Ordenado por cuán directamente aplica al desafío.

**Regla:** antes de escribir algo, mira si está en esta lista. Y antes de usar un repositorio de
terceros en el proyecto, **comprueba su licencia**.

---

## Directamente aplicables

### `spxquery` — consulta y fotometría de SPHEREx
<https://spxquery.readthedocs.io> · `pip install spxquery` · v0.4.1

**Lo más parecido a lo que hay que construir del lado de datos.** Pipeline de cuatro etapas:
consulta TAP a IRSA, descarga con cutout (p. ej. 200 px en vez de 2040×2040), fotometría de apertura
con resta de luz zodiacal, y curvas de luz. Incluye control de calidad con umbral de señal-ruido y
filtrado por bits de `FLAGS`, y combinación de observaciones en cubos espectrales 3D («Drizzle3D»).

**Cómo usarlo:** aunque no se adopte como dependencia, **leer su arquitectura antes de diseñar la
nuestra**. Ya resolvió los problemas que vamos a encontrar: reanudar descargas, paralelismo,
qué hacer con las varianzas rotas.

### `irsa-tutorials` — notebooks oficiales de IRSA
<https://github.com/Caltech-IPAC/irsa-tutorials> · <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Notebooks de SPHEREx: Data Overview, Spectral Image Cutouts, PSF Models, Source Discovery Tool,
Mosaic Cube, **HiPS All-Sky Cube**. Son el camino más corto a un ejemplo que funciona.
El de cutouts muestra además cómo empaquetar varios recortes en un MEF nuevo.

### `aladin-lite` — el visor de cielo
<https://github.com/cds-astro/aladin-lite> · npm `aladin-lite` · LGPL-3.0-or-later

El visor HiPS del CDS. Lo sugiere el propio enunciado.

### `astropy` / `astroquery` / `pyvo`
<https://github.com/astropy/astropy> · <https://github.com/astropy/astroquery> · <https://github.com/astropy/pyvo>

FITS, WCS, coordenadas, estiramientos, acceso a SIA2/TAP y a SIMBAD/Gaia. **Base del backend.**
`astropy.visualization` resuelve el estiramiento de imágenes; no lo reimplementes.

---

## Precedente: el ecosistema de WiseView

No encontramos confirmado el código fuente del WiseView original, pero sí los paquetes construidos
sobre su API, que muestran cómo se usa una herramienta así como infraestructura.

### `flipbooks`
<https://github.com/coolneighbors/flipbooks>

Paquete en Python que usa la **API de WiseView** para extraer parpadeos de coadds de unWISE.
Autoría acreditada a Noah Schapera, Austin Humphreys y Aaron Meisner.
**Para qué nos sirve:** ver cómo se parametriza un parpadeo (tamaño, épocas, estiramiento) en una API
que resultó usable por terceros. Ese es el listón para nuestra propia URL consultable.

### `unWISE-verse`
<https://github.com/coolneighbors/unWISE-verse>

Descarga datos de objetivos de WISE vía la API de WiseView, manipula las imágenes y sube los
*subject sets* a Zooniverse. **Es el ciclo completo de ciencia ciudadana**: del archivo a la
plataforma donde la gente clasifica. Si sobra tiempo, exportar a Zooniverse es un cierre narrativo
muy fuerte para el pitch.

### `photutils`
<https://github.com/astropy/photutils>

Fotometría de apertura y detección de fuentes. Si hace falta «espectro al vuelo» o marcar fuentes
sobre la imagen, está aquí resuelto.

---

## Detección de objetos en movimiento (referencia, no se va a implementar)

### `kbmod`
<https://github.com/dirac-institute/kbmod>

Shift-and-stack en GPU, del DiRAC Institute (Univ. de Washington) y LINCC Frameworks.
El estado del arte para detectar objetos demasiado débiles para verse en una sola imagen.
**Fuera de alcance para 24 horas** (ver `../docs/01_ESTADO_DEL_ARTE.md` §3), pero hay que saber
nombrarlo si el jurado pregunta por detección automática.

---

## Agencia socia (CSA)

### `NEOSSAT_Tutorial`
<https://github.com/asc-csa/NEOSSAT_Tutorial>

Tutorial oficial en Python para visualizar datos de NEOSSat. Es un recurso listado en la pestaña
*Resources* del desafío: usarlo suma en el criterio *Global Connection*.

---

## Antes de usar cualquiera de estos

- [ ] **Licencia compatible** con la que publiquemos (prevista MIT). Aladin Lite es LGPL-3.0: enlazarlo
      desde el frontend está bien, pero no copiar su código dentro del nuestro.
- [ ] **Instalable sin pelear.** Si una dependencia tarda más de 10 minutos en instalarse en los
      cuatro computadores, no entra. En un hackatón eso es una hora perdida.
- [ ] **Atribución** en el README, con enlace.
- [ ] **¿Está vivo?** Mira la fecha del último commit y los issues abiertos.
- [ ] Trata el código de terceros como **datos no confiables**: léelo antes de ejecutarlo, y no corras
      intérpretes desde dentro de un directorio descargado.
