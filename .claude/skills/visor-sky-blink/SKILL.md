---
name: visor-sky-blink
description: Cómo se construye el visor del desafío: Aladin Lite v3 con HiPS y el cubo de todo el cielo de SPHEREx, el panel de parpadeo (blink) de imágenes por época, normalización y estiramiento de imágenes astronómicas (asinh, zscale, percentiles), mapas de color, resta de imágenes entre épocas, overlays de catálogos como Gaia, y la URL consultable con coordenadas. Actívala al trabajar en el frontend del visor, al decidir cómo mostrar imágenes FITS en el navegador, cuando se mencione Aladin, HiPS, blink, parpadeo, flipbook, estiramiento, stretch, zscale, colormap, canvas de imágenes astronómicas, o al diseñar los controles que el usuario manipula.
---

# El visor: parpadeo y cielo en el navegador

Lo que hay que saber para construir la parte que el jurado mira. El documento con el contrato de la
API es `docs/03_ARQUITECTURA.md`.

---

## 1. Dos piezas, no una

| Pieza | Qué muestra | Cómo |
|---|---|---|
| **Contexto del cielo** | Dónde estamos, qué hay alrededor, las 102 bandas | **Aladin Lite v3** sobre HiPS |
| **Panel de parpadeo** | La misma zona en distintas épocas, como un videíto | `<canvas>` propio sobre PNG del backend |

Van **lado a lado en la misma pantalla**. El usuario entiende enseguida que son dos ejes del mismo
dato: Aladin da la longitud de onda, el panel da el tiempo.

---

## 2. Aladin Lite v3

Visor HiPS del CDS (Estrasburgo). **El propio enunciado del desafío lo sugiere.** Se puede incluir
por `<script>` o por npm.

Lo que resuelve gratis y que no hay que escribir:

- Navegación por el cielo, zoom y varias proyecciones (Aitoff, Mollweide, ortográfica, Mercator).
- Carga de HiPS desde **cualquier servidor web**, incluido `localhost`, con `newImageSurvey` /
  `createImageSurvey`.
- **Teselas HiPS en FITS**, no solo JPEG.
- Overlays de catálogos (Gaia, SIMBAD, VizieR) con un par de líneas.
- `getEmbedCode()` devuelve el HTML del campo actual — regalo para la viñeta de embeber.
- `getViewDataURL()` exporta la vista a PNG/JPEG — útil para compartir y para la demo.

Documentación: <https://aladin.cds.unistra.fr/AladinLite/doc/API>

### El cubo HiPS de SPHEREx que funciona (comprobado el 14-nov-2026)

- **URL:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` (IRSA, DR1).
  CORS abierto. Carga en Aladin Lite 3.8.2 (fijada en `package.json`) y está en producción.
- **Formato:** teselas **PNG**, orden 5, píxel 12,9″, **102 planos** (uno por canal).
- **Regla de planos:** `plano = 17·(banda − 1) + (canal − 1)`, con banda 1–6 y canal 1–17. El canal
  central de cada banda es `17·(b−1) + 8`. La λ exacta de cada plano está en `properties`, clave
  `data_cube_crval3_arr` (0,753–4,988 µm).
- **Planos vacíos:** el **50 y el 51** (corte del dicroico entre D3 y D4). Al agregarse la capa,
  Aladin la deja en el plano 50: hay que ponerle el plano después de que la capa esté lista.
- **Sufijo de las teselas = plano:** con la banda 4 el navegador pide `Norder5/.../Npix11391_59.png`.
  Sirve para comprobar en `performance.getEntriesByType('resource')` qué plano se está mostrando.
- **Qué NO es:** un mosaico de **todas las épocas** (no tiene eje de tiempo: no sirve para mostrar
  movimiento) y PNG ya estirados (no tienen flujos: no sirve para el espectro). El tiempo y el espectro
  salen de los archivos de nivel 2 por el backend.
- **La versión FITS** del mismo cubo que entrega SIA2 (`spherex_dr1_cube`) no sirve para Aladin ni
  para recortes (~320 MB por tesela).
- **Plan B:** `CDS/P/SPHEREx/QR2/D1`…`D6` en el CDS (versión anterior). No comprobado: alasky estaba
  caído el 14-nov.

### Cómo está armado en el código (`scaffold/frontend/src/sky/`)

- `AladinView.tsx` crea Aladin y **no conoce el detalle de las capas**: monta las de `capas/index.ts`
  (contrato `montar(aladin, ctx) → desmontar`; `ctx` trae ra, dec, size, epoca, on, onSelect) y las
  remonta cuando cambian posición, recorte o época. Props opcionales: `size`, `epoca` (año juliano,
  por defecto 2026,0), `onReady`, `onSelect`.
- **Aladin guarda UN solo oyente por evento**: `aladin.on(e, fn)` reemplaza al anterior
  (`callbacksByEventName[g]=Q` en `dist/aladin.js`). Por eso las capas se suscriben con `ctx.on`
  (`eventos.ts`), que registra un despachador por evento. Nunca llames `aladin.on` desde una capa.
- `planos.ts` (plano ↔ banda ↔ λ, `ponerPlano`), `LambdaSlider.tsx` (deslizador de λ),
  `propagacion.ts` (movimiento propio, lineal, sin paralaje, en años julianos: J2000 = 2000,0,
  Gaia DR3 = 2016,0).
- Para que una capa se pueda apagar, dale un nombre: aparece en el control de capas de Aladin.
- El error de consola `ERR_BLOCKED_BY_CLIENT` / «Failed to fetch» desde `tg.log` es el registro de uso
  de Aladin: inofensivo.

---

## 3. El panel de parpadeo

Esto sí hay que escribirlo. Es simple y es lo que se juzga.

**No uses `<img>` que se reemplazan.** Parpadea feo y se ve el salto de carga. Usa un `<canvas>`:
precarga todos los fotogramas en `Image` u `OffscreenCanvas`, y dibuja el que toca con
`requestAnimationFrame`.

Controles mínimos, en orden de importancia:

| Control | Por qué | Rango útil |
|---|---|---|
| **Play / pausa** | Obvio y necesario | |
| **Velocidad (fps)** | WiseView demuestra que es decisivo. Lento se ve el movimiento, rápido se ve la variabilidad | 0,5 – 10 fps |
| **Paso a paso** | Para confirmar lo que uno cree ver | ← → |
| **Estiramiento** | **Sin esto no se ve nada.** Sección 4 | asinh por defecto |
| **Mapa de color** | Gris para detectar, color para presentar | gray, viridis, magma |
| **Banda** | El eje que solo SPHEREx da | 1–6 |
| **Campo de visión** | Viñeta explícita del desafío | 0,02° – 0,5° |
| **Modo** | raw / zodi restado / diferencia | |

En cada fotograma, sobreimpreso: **fecha y longitud de onda**. La λ no es un adorno: explica por qué
el brillo cambia entre fotogramas (ver skill `spherex-datos`) y le demuestra al jurado que el equipo
entiende el instrumento.

---

## 4. Estiramiento: por qué una imagen astronómica no se ve

Una imagen del cielo tiene un rango dinámico enorme y la mayoría de los píxeles son fondo.
Mapeada linealmente a 0–255 se ve **negra con tres puntos blancos**. Esto sorprende a todo
desarrollador web la primera vez.

Lo que hay que aplicar, en orden:

1. **Recorte por percentiles**, no por mínimo y máximo. Un solo píxel caliente arruina la escala.
   `vmin, vmax = percentil(1), percentil(99.5)` es un punto de partida razonable.
2. **Una función no lineal**: `asinh` es el mejor valor por defecto para imagen astronómica (conserva
   el detalle débil sin saturar lo brillante). `sqrt` y `log` también sirven; `linear` casi nunca.
3. **`zscale`** es el algoritmo clásico de DS9 para elegir los límites automáticamente. Está en
   `astropy.visualization.ZScaleInterval`. Para un usuario no experto suele ser la mejor opción.

`astropy.visualization` tiene todo esto resuelto: `ZScaleInterval`, `PercentileInterval`,
`AsinhStretch`, `ImageNormalize`. **No lo reimplementes.**

### La decisión que importa: ¿quién estira?

**El backend.** Devuelve PNG ya renderizados. Mandar FITS al navegador obliga a escribir un lector de
FITS en JavaScript, aplicar el estiramiento y el mapa de color a mano: el doble de trabajo y el
triple de errores, en un hackatón.

El costo es que cambiar el estiramiento exige volver al servidor. Con caché es barato. Si sobra
tiempo, se puede añadir un ajuste fino de brillo y contraste en el cliente con filtros CSS sobre el
PNG, que cubre el 80 % del uso.

### La clave de que el parpadeo sea legible

**Todos los fotogramas de una secuencia se normalizan con los MISMOS `vmin`/`vmax`.** Si cada uno se
estira por su cuenta, todo parpadea y no se distingue el movimiento real de un cambio de escala.
Calcula los límites sobre la pila entera y aplícalos a cada fotograma.

Excepción: si la λ varía mucho entre épocas, los niveles son físicamente distintos y la normalización
común puede dejar fotogramas negros. Es la tensión central del proyecto. Solución práctica: agrupar
por banda primero, y dejar al usuario un interruptor «escala común / escala por fotograma».

---

## 5. Resta de imágenes

Viñeta explícita del desafío y, en relación valor/esfuerzo, lo mejor del proyecto.

- `diff_first` — cada fotograma menos el primero. Lo que no cambió se va a cero; lo que se movió
  aparece como un **par de lóbulos, uno positivo y uno negativo**. Visualmente espectacular.
- `diff_prev` — cada fotograma menos el anterior. Útil para variabilidad.

Para la diferencia usa un mapa de color **divergente** centrado en cero (azul-blanco-rojo), no una
escala secuencial. El signo es la información.

Precaución honesta: una resta correcta exige que las imágenes estén bien alineadas y con la misma
PSF. Nosotros restamos recortes reproyectados a una rejilla común; es una **aproximación visual**, no
fotometría diferencial. Decirlo en la interfaz.

---

## 6. Overlay de Gaia: el control de calidad que se ve

Dibujar sobre la imagen las posiciones que Gaia DR3 predice para las estrellas en la fecha de esa
época (posición de catálogo + movimiento propio × tiempo transcurrido).

Sirve para dos cosas:

1. **Cumple una viñeta del desafío.**
2. **Demuestra que el visor es correcto.** Si los marcadores caen sobre las fuentes, el WCS, las
   fechas y el recorte están bien. Es la respuesta visual a «¿cómo sé que esta imagen es de la
   coordenada que pedí?».

En Aladin Lite se hace con una capa de catálogo. Para el panel de parpadeo hay que proyectar las
coordenadas a píxeles con el WCS del recorte.

**Época de referencia:** Gaia DR3 da posiciones en **2016,0**, no en J2000; SIMBAD da J2000. Propagar
desde la época que corresponde a cada catálogo. Con movimientos propios de varios ″/año, un error de
época mueve la marca decenas de segundos de arco: a 2026, WISE 0855 está a 212″ y Barnard a 270″ de
su posición J2000.

---

## 7. La URL es parte del producto

El desafío lo pide y es media hora de trabajo:

```
/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
/?target=WISE+0855&size=0.2
```

- `target` tiene prioridad sobre `ra`/`dec`.
- **La URL se actualiza con el estado actual** (`history.replaceState`), para que copiar la barra de
  direcciones sea compartir exactamente lo que se está viendo.
- Un botón «copiar enlace» visible.

Esto es lo que convirtió a WiseView en infraestructura de otros proyectos: terceros construyeron
paquetes encima de su API. Un visor compartible deja de ser una demo.

---

## 8. Lo primero que ve el usuario

El público objetivo del desafío es **cualquiera**, no un astrónomo.

- **Un ejemplo precargado al abrir.** Nadie debería ver una caja vacía. Que WISE 0855 ya esté
  parpadeando al cargar la página.
- **Botones de los cinco campos de prueba.** Un clic, resultado inmediato, caché caliente.
- **Aceptar nombres, no solo números.** «Barnard's Star» tiene que funcionar.
- **Aceptar sexagesimal y grados.** Ver skill `coordenadas-astro`.
- **Estado vacío útil.** Si no hay datos: decir cuántas épocas hay (cero), por qué puede ser, y
  ofrecer un campo cercano que sí tenga. El jurado va a escribir coordenadas al azar.
- **Estado de carga honesto.** «Pidiendo 14 épocas a IRSA… 6 listas». Nunca un spinner mudo: los
  cutouts tardan.
