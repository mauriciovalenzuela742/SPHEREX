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

Para el cubo de 102 canales: Aladin sabe recorrer la tercera dimensión de un cubo HiPS plano a plano
o como animación. **Esto hay que comprobarlo con el cubo real de SPHEREx en la hora 1**, no darlo
por hecho.

Documentación: <https://aladin.cds.unistra.fr/AladinLite/doc/API>

**Plan B si el HiPS de IRSA no carga** (CORS, formato, orden): existe un HiPS de SPHEREx servido por
el CDS en `alasky.cds.unistra.fr`. Puede ser de una versión anterior de los datos, pero sirve para
el contexto visual.

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
