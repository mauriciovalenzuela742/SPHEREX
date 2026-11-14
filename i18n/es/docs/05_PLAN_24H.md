<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/docs/05_PLAN_24H.md) · **Español** · [中文](../../zh/docs/05_PLAN_24H.md) · [Deutsch](../../de/docs/05_PLAN_24H.md) · [Italiano](../../it/docs/05_PLAN_24H.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `docs/05_PLAN_24H.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# 05 — Plan de las 24 horas

Plan por bloques, con criterio de corte en cada uno. **Está escrito para poder cortar.** Si un bloque
se pasa de su tiempo, se aplica el corte y se sigue: en un hackatón el enemigo no es la falta de
ideas, es la falta de disciplina para abandonar una.

Horarios de referencia del evento local de Santiago (inicio de trabajo sábado 10:00, **cierre de
entregas domingo 11:00**, confirmado por JP el 14-nov y comunicado en vivo por la organización; ver
[`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)). Pitch: 2 minutos + 2 preguntas; su hora no está
confirmada. Si algo cambia, se recalculan los bloques, no el orden.

| Rol | Quién |
|---|---|
| D — Datos | Vladimir (D1 acceso) · Bryan (D2 fotogramas) |
| V — Visor | Antonia (V1 blink) · Juan Pablo (V2 cielo) |
| C — Ciencia y verificación | Mauricio (+ despliegue) |
| N — Narrativa y entrega | Javiera |

*(Rellenar en la hora 0. Que cada quien sepa qué es suyo evita la mitad de los roces.)*

---

## Bloque 0 · Hora 0 – 1 · Todos · **Alinear**

Lo más rentable del día entero y lo que más equipos se saltan.

- Leer juntos [`00_DESAFIO.md`](00_DESAFIO.md) en voz alta. 10 minutos. Sobre todo las
  *Potential Considerations*: son la rúbrica.
- Repartir roles y escribirlos arriba en este archivo.
- **Confirmar la hora exacta del cierre de entregas.** De ahí salen T−6, T−4 y T−2.
- Crear el repositorio en GitHub, subir el kit, dar acceso a los seis.
- Levantar `scaffold/`: backend y frontend arrancan y se ven. No hace nada; levanta.
- Abrir [`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) y firmar la decisión de stack (o cambiarla).

**Corte:** si a la hora 1 el esqueleto no levanta, es un problema de entorno y se ataca con todos.
Nadie avanza hasta que los seis puedan correr el proyecto.

---

## Bloque 1 · Hora 1 – 3 · D1 + D2 + C · **La hora de la verdad con los datos**

> **Respondido el 14-nov:** ver [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) y
> [`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md). Lo que sigue queda como referencia del plan.

El bloque que decide el proyecto. Es el checklist del final de
[`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md), punto por punto.

- Consulta SIA2 real sobre WISE 0855, en `spherex_dr1` y en `spherex_qr3`. ¿Cuántas filas?
- ¿Cuántas **épocas distintas** hay para un campo típico? Decide si el video tiene 5 o 50 fotogramas.
- Un cutout de `size=0.1`: **cronometrarlo**. Decide si hace falta caché, cola o las dos.
- Abrir el MEF recortado. Confirmar las 6 extensiones.
- **Leer `WCS-WAVE` de dos épocas del mismo campo y medir cuánto cambia la longitud de onda.**
  Esta es la pregunta más importante del día (ver [`02`](02_DATOS_SPHEREX.md) §2).
- ¿El cubo HiPS de DR1 carga en Aladin Lite? ¿IRSA responde con CORS desde el navegador?

Mientras tanto, **V no espera**: monta el mock del contrato de
[`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) y trabaja contra él. **N** empieza el README y abre el
formulario de entrega para ver qué pide.

**Corte:** a la hora 3 hay que tener una respuesta escrita a cada pregunta, aunque alguna sea «no
pudimos averiguarlo». Si los cutouts resultan inviables por lentitud, **el plan cambia aquí**, no
a la hora 15.

---

## Bloque 2 · Hora 3 – 8 · **El camino crítico**

Las dos vías en paralelo, sin dependencias entre ellas.

**D — backend mínimo que funciona de punta a punta**
`/api/epochs` y `/api/frames` para **una sola banda**, sin controles, sin modos, con caché en disco.
Hardcodeado donde haga falta. **Lo importante es que de una coordenada salga una secuencia de PNG.**

**V — visor mínimo que funciona de punta a punta**
Caja de coordenadas → llamada → fotogramas en un `<canvas>` → play/pausa. Feo. Funcional.
Y Aladin Lite al lado cargando el cubo HiPS, que es la Vía A.

**C** — llena `data/campos_de_prueba.yml` con los cinco objetos, verificados contra SIMBAD, y escribe
qué debería verse en cada uno. Prepara el chequeo con Gaia.

**N** — README, nombre del proyecto, la frase de una línea. La frase cuesta más de lo que parece
y es lo que el jurado recuerda.

**Corte — hito de la hora 8:** *una coordenada escrita a mano produce un videíto en pantalla.*
Feo, lento, una sola banda, da igual. **Si a la hora 8 no hay videíto, todo lo demás se suspende**
y los seis se ponen en eso.

---

## Bloque 3 · Hora 8 – 14 · **Que sea bueno**

Ahora sí, por orden de valor. El orden sale de las viñetas del desafío y de lo que cuesta cada una.

| Prioridad | Qué | Quién | Por qué |
|---|---|---|---|
| 1 | Selección de banda / detector | D + V | Es la viñeta de las 102 bandas y arregla el problema de la λ variable |
| 2 | Controles: estiramiento, color, fps, campo de visión | V | WiseView demuestra que **sin esto no se ve nada**. Barato y decisivo |
| 3 | Resta de imágenes (`diff_first`, `diff_prev`) | D | Viñeta explícita. Espectacular en pantalla. Barato |
| 4 | Resolución de nombres (SIMBAD) | D + V | Convierte la herramienta en usable por cualquiera |
| 5 | URL consultable y compartible | V | Viñeta explícita. Media hora de trabajo |
| 6 | Overlay de Gaia DR3 | V + C | Viñeta explícita **y** la prueba de que el visor es correcto |
| 7 | Flags de contaminación | D + V | Viñeta explícita. Un campo que ya viene en el MEF |
| 8 | Espectro al vuelo | D | «Extra kudos». El más caro de la lista. **Solo si 1–7 están cerradas** |

**Corte — T − 6 h: congelación de alcance.** Lo que no esté empezado, no se empieza. Lo empezado se
termina o se saca. Una funcionalidad a medias resta: el jurado hace clic justo ahí.

---

## Bloque 4 · T − 6 h a T − 4 h · **Pulir y verificar**

- **C corre los cinco campos de prueba, uno por uno, en la aplicación desplegada.** No en local.
- Precalentar la caché de los cinco. La demo nunca se hace con una consulta fría.
- Estados vacíos y de error: ¿qué ve el usuario si no hay datos en esa coordenada? ¿Si IRSA no responde?
  **El jurado va a escribir coordenadas al azar.** Que no vea una pantalla en blanco.
- Que funcione en un móvil, aunque sea a medias. Alguien del jurado lo va a abrir en el teléfono.
- Pie de página con la atribución obligatoria de SPHEREx ([`02`](02_DATOS_SPHEREX.md) §8).

---

## Bloque 5 · T − 4 h a T − 2 h · **Demo y entrega**

- **Grabar el vídeo de demo.** Guion en la skill `demo-y-pitch`. Dura lo que pida el evento.
- Dejar funcionando el **modo degradado**: la aplicación sirve los cinco campos desde caché sin
  internet. El wifi de un hackatón se cae; el de la sala de pitches, más.
- **Subir la entrega completa**, incluida la descripción de cómo se usó la IA, que este año es
  obligatoria. Checklist en la skill `entrega-nasa`.

**T − 2 h: entregado.** A partir de aquí todo lo demás es mejora opcional sobre algo ya entregado.

---

## Bloque 6 · T − 2 h al pitch · **Ensayar**

- N ensaya el pitch **en voz alta, cronometrado**, tres veces. En Santiago son 2 minutos + 2 preguntas:
  2 minutos es mucho menos de lo que parece.
- Los otros cinco hacen de jurado y preguntan lo incómodo:
  - «¿Esto no lo hace ya el Data Explorer de IRSA?»
  - «¿Cómo sabes que la imagen es de esa coordenada?»
  - «¿Qué pasa si pongo una coordenada sin datos?»
  - «¿Por qué no usaron aprendizaje automático?»

  Las respuestas a la primera y a la última están en [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md);
  la segunda es el overlay de Gaia; la tercera es el estado vacío del Bloque 4.
- Dejar abiertas en el navegador: la aplicación desplegada, el vídeo y el repositorio. Nada más.

---

## Lo que haríamos con 6 horas más

Para la respuesta de «¿y qué sigue?», que siempre la preguntan:

- Marcar y guardar candidatos con URL permanente, estilo Backyard Worlds.
- Resta de imágenes alineada por movimiento propio predicho (Gaia) en vez de por posición fija.
- Cribado automático de candidatos con una red pequeña sobre recortes, al estilo del *stamp
  classifier* de ALeRCE. **Ese es el papel honesto de la IA aquí**, no un transformer de video.
- Exportar la secuencia como GIF o como un subject set de Zooniverse.
