---
name: demo-y-pitch
description: Preparar la demo grabada y el pitch del proyecto ante el jurado del hackatón: guion de la demo, qué mostrar y en qué orden, cómo grabarla, el pitch de dos minutos con su estructura, las preguntas incómodas del jurado con sus respuestas, y el plan B si falla la conexión. Actívala cuando se mencione demo, vídeo, pitch, presentación, jurado, grabar la pantalla, guion, ensayar, o cuando falten pocas horas para el cierre y haya que preparar lo que se presenta.
---

# Demo y pitch

El jurado no lee código. Ve una demo de dos minutos y hace dos preguntas. Esta skill es para que
esos dos minutos no se improvisen.

Contexto completo de premios y criterios: `docs/06_JURADO_Y_PITCH.md`.

---

## Reglas que no se negocian

1. **La demo se graba en T − 4 h**, aunque la aplicación siga mejorando. Si después mejora, se
   regraba. Si no da tiempo, ya hay vídeo.
2. **Nunca se demuestra en vivo contra una consulta fría.** Los cinco campos de prueba van
   precalentados en la caché.
3. **El vídeo está descargado en el disco del computador que presenta.** No en la nube. El wifi de
   la sala de pitches se cae.
4. **Se muestra lo que hay.** Nada de «podría» ni de «con más tiempo haríamos». Lo que falta se
   nombra una sola vez al final, como lo que sigue.
5. **No se promete haber descubierto nada.** Un jurado con astrónomos lo castiga al instante.

---

## Guion de la demo

Cada paso tiene un propósito. El orden no es casual: lo más impactante va primero, por si cortan.

| # | Acción | Qué demuestra |
|---|---|---|
| 1 | Abrir la URL. Ya hay un campo parpadeando | Que funciona de verdad, sin configurar nada |
| 2 | Escribir **`WISE 0855`** (el nombre, no coordenadas) | Que es para cualquiera, no para astrónomos |
| 3 | Play y luego **Modo diferencia** (primera − última). **WISE 0855 es caso obligatorio y se muestra siempre**: decir con honestidad que en una exposición suelta se ve débil y que el movimiento (~1,3 px en todo el período) se ve en la resta (y con la suma por barrido cuando exista) | El desafío, cumplido sin exagerar. Es el momento de la demo |
| 4 | Bajar los fps y volver a verlo | Que los controles importan y sabemos por qué |
| 5 | Cambiar la banda. La misma zona en otra λ | Las 102 bandas. Hasta donde pudimos comprobar, ninguna herramienta pública las combina con el blink temporal en una sola pantalla |
| 6 | Encender el overlay de Gaia (en WISE 0855 no hay Gaia: usar CatWISE2020; hacerlo sobre Barnard o eps Ind B). Los marcadores caen sobre las fuentes | *«Así sabemos que es correcto.»* Responde la pregunta antes de que la hagan |
| 7 | Cargar **eps Ind B** en modo diferencia | Es donde el movimiento se ve más claro (−0,85/−0,71 px medido). Viñeta del desafío |
| 8 | Cargar **RW Aurigae**: cambia de brillo sin moverse. Ojo: satura y en la resta deja un par rojo/azul aunque no se mueva; su fotometría no se midió, así que no se presenta como prueba de variabilidad | Que el visor avisa cuando un objeto satura |
| 9 | Copiar la URL y abrirla en otra pestaña | Compartible y embebible. Viñeta del desafío |
| 10 | Si hay espectro: pinchar una fuente | El «extra kudos» |

Si solo queda tiempo para tres pasos: **2, 3 y 5**. Nombre → se mueve → otra banda.

---

## Grabar el vídeo

- **Duración:** la que pida el evento. Si no lo dice, 30–60 segundos. Un vídeo largo no se ve entero.
- **Sin audio de locución** si hay prisa: subtítulos cortos sobreimpresos funcionan igual y no hay
  que regrabar por una palabra mal dicha.
- **Pantalla limpia:** una sola ventana, sin pestañas personales, sin notificaciones, sin nombres de
  usuario visibles.
- **Cursor lento.** Los movimientos rápidos de ratón no se siguen en vídeo.
- **Dos o tres segundos quieto** en cada momento clave, sobre todo cuando el objeto se mueve: hay que
  darle al ojo tiempo de verlo.
- **Nada de menores** en imagen ni voz, por las reglas del evento.
- Guardar el archivo **en el disco local** y subirlo a donde pida la entrega.

---

## El pitch de dos minutos

**0:00 – 0:20 · Gancho.** En 1930 se descubrió Plutón comparando dos fotos del mismo trozo de cielo.
Hoy SPHEREx fotografía el cielo entero cada seis meses en 102 colores de infrarrojo, y nadie lo está
mirando así.

**0:20 – 1:10 · Demo en vivo.** La mitad del tiempo. Es lo que se juzga.

**1:10 – 1:35 · Por qué importa.** La mayoría de las enanas marrones y los cometas conocidos los
encontraron voluntarios mirando parpadeos. Esa comunidad existe y no tiene cómo mirar SPHEREx. El
candidato a Planet Nine más citado salió de comparar dos sondeos infrarrojos separados en el tiempo:
la misma técnica.

**1:35 – 2:00 · Qué construimos.** Stack en una frase, DR1 publicado este mes, URL pública, código
abierto, y una línea de qué sigue.

**Terminar en 1:50 con todo mostrado es mejor que atropellarse en 2:10.**

---

## Las preguntas, con su respuesta

**«¿Esto no lo hace ya el Data Explorer de IRSA?»** — No para este público. El Data Explorer es un
archivo para astrónomos. Nosotros resolvemos el nombre, agrupamos las épocas, normalizamos y
entregamos el parpadeo. Es la diferencia entre un archivo y un visor; la misma que hizo útil a
WiseView frente al archivo de WISE.

**«¿Cómo sé que la imagen es de esa coordenada?»** — Por el overlay de Gaia. *(Y se muestra.)*

**«¿Por qué no usaron aprendizaje automático?»** — Porque el desafío pide un visor para personas y
el cuello de botella real es traer y alinear los datos, no reconocer el movimiento. Donde la IA
aporta es en el cribado de candidatos con redes pequeñas sobre recortes, como hace el broker ALeRCE
con las alertas de ZTF, y lo dejamos planteado.

**«¿Qué pasa si pongo una coordenada sin datos?»** — *(Se escribe una y se muestra el estado vacío.)*

**«¿Escala a todo el cielo?»** — En cobertura sí: la consulta es por posición contra SIA2. Lo que no
escala sin infraestructura es la caché; a escala haría falta precomputar recortes, que es lo que hace
unWISE para WiseView.

**«¿Qué tan correctos son los espectros?»** — Indicativos, fotometría de apertura con la zodiacal
restada, y lo decimos en la propia interfaz. Para ciencia está la Spectrophotometry Tool de IRSA.

---

## Antes de salir a presentar

- [ ] Vídeo descargado en el disco del computador que presenta.
- [ ] Aplicación abierta, caché caliente, los cinco campos probados **hace menos de una hora**.
- [ ] Pestañas: aplicación, vídeo, repositorio. **Nada más.**
- [ ] Notificaciones silenciadas. Modo presentación.
- [ ] Batería o cargador.
- [ ] Alguien del equipo con el vídeo también en su teléfono.
- [ ] Ensayado en voz alta y cronometrado, **tres veces**.
