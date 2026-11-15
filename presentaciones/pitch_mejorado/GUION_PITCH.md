# Pitch de AstroTRACK · versión alternativa (2 minutos)

Para Mauricio, de parte de JP. **Tu versión sigue intacta**; esto es una segunda opción para comparar.

**El diálogo exacto, con tiempos y sincronizado con el video de 30 s, está en `DIALOGO_PRESENTADOR.md` (y `.docx`). La presentación en PowerPoint es `astrotrack_pitch.pptx` (video incrustado y guion en las notas).**
Las láminas están en inglés (jurado NASA) y el guion hablado en español, igual que en tu propuesta.

## Qué hay en esta carpeta

| Archivo | Qué es |
|---|---|
| `astrotrack_pitch.html` | Presentación alternativa, con el estilo de tu Canva (mismas imágenes y colores). Doble clic para abrir |
| `figures/demo_pitch.mp4` | Video de la demo, **30 s**, mudo, subtítulos en inglés. Sirve para la entrega (pide 30 s o menos) y para la lámina «video» de las dos versiones |
| `demo.yml`, `tools/demo_pitch.py` | La receta del video y el grabador (para regrabarlo) |

**Teclas de la presentación:** → o espacio avanza · ← retrocede · **N** muestra el guion debajo · **T** cronómetro
(se pone rojo después de 2:00) · **F** pantalla completa · **V** pausa el video. El video parte solo al llegar a la
lámina 4.

**Sobre el video:** es la aplicación real grabada en el PC de JP, con los arreglos de esta rama. Las fotos de Epsilon
Indi B salen de los datos precalculados del sitio, porque IRSA estuvo caído (error 502) al grabar; las de 2MASS y WISE
del mapa sí se cargaron en vivo. El rótulo del video lo dice: «Real app · local copy · cached data».

## Qué cambia respecto de tu versión, y por qué

1. **Una sola pregunta al inicio.** La de vida extraterrestre no conecta con lo que mostramos y cuesta 4 segundos.
   «¿Quién podría descubrir una estrella que nadie conoce?» lleva directo a Backyard Worlds.
2. **Un solo video de 30 s**, que sirve para la entrega y para las dos versiones del pitch, con ejemplos probados antes
   de grabar: Epsilon Indi B (la resta A − B lo deja clarísimo; su espectro muestra agua y metano y la ficha dice
   «parece una enana marrón"), un comentario guardado y la Estrella de Barnard dentro de cada aro (2000, 2010 y 2026).
   WISE 0855 no aparece porque en las fotos casi no se distingue; su resultado va en la lámina 5. La limpieza de
   estrellas tampoco: en pocos segundos no se entiende, así que va dicha en la lámina 5.
3. **La penúltima lámina queda como imagen fija** (tenías razón: hace falta algo que se quede en la cabeza), pero
   agrega **el resultado científico**: con imágenes de SPHEREx solamente, medimos que WISE 0855 se movió
   **8,67″ ± 0,66″ en un año (lo predicho es 8,04″)**. Es lo que separa a AstroTRACK de un juguete ante un jurado
   de la NASA.
4. **Detalles de texto en las láminas:** «drawfs» → «dwarfs»; «WISE turn off» → «WISE was switched off»;
   «Ilustration» → «Illustration»; cifras con formato inglés (200,000 · 3,000+ · 7.5%); «Consult with Spherix
   regarding anything you need» promete demasiado → «walks you through every step».
5. **Lámina de Chile más liviana:** una cifra grande (7,5 %) y dos frases. El gráfico de barras se puede mostrar si
   preguntan.
6. **Cierre con QR real** al visor (probado: se lee bien).

## Guion · versión alternativa (español)

El texto exacto, lámina por lámina y con los tiempos del video, está en **`DIALOGO_PRESENTADOR.md`** (también en
`.docx` y en las notas del orador del PowerPoint y del HTML). Es la única versión: si se cambia, se cambia en
`tools/dialogo.py` y se regenera.

## Script · English version (same timing)

1. «Raise your hand: who thinks they could discover a star nobody knows? *(pause)* Good — because two hundred
   thousand people already did.»
2. «In NASA's Backyard Worlds, volunteers blinked sky images and found over three thousand new brown dwarfs,
   doubling the known population. But their telescope, WISE, was switched off in 2024. Today SPHEREx maps the whole
   sky every six months in 102 infrared colors. What was missing was the tool.»
3. «Does Chile care? We host some of the largest telescopes on Earth, yet only 7.5% of STEM students choose natural
   sciences or math.»
4. *(video, 30 s)* «So we built AstroTRACK. Anyone opens a SPHEREx photo of Epsilon Indi B, a nearby brown dwarf.
   Mark spring 2025 and October 2026, subtract them, and there it is: red where it was, blue where it is. One switch
   opens the science: its spectrum in 102 colors, with water and methane dips, and the tool says it looks like a
   brown dwarf. Leave a note for the next explorer. And every star has a history: Barnard's Star in 2000, 2010 and
   today.»
5. «And it's not a toy. Using SPHEREx images alone, no catalogs, we measured WISE 0855 moving 8.7 arcseconds in one
   year; physics predicts 8.0. When it crosses a star, its colors let us erase the still stars and isolate it. Anyone can explore and earn a badge, Spherix explains each step, and anyone who wants
   can do real science.»
6. «We are Transientes, a team aged 17 to 52, and we want frontier science within everyone's reach. Scan the QR and
   become the next star hunter. *(pause)* I already have my badge.»

## Si te quedas con tu versión

- **Video para tu lámina 4:** el mismo `figures/demo_pitch.mp4` (30 s). Calza con tu frase de Epsilon Indi B (metano,
  agua, «se parece a una enana marrón») y muestra la resta roja/azul.
- **Correcciones de texto** en el Canva: las del punto 4 de arriba.

## Si el jurado pregunta (respuestas de 15 s)

| Pregunta | Respuesta |
|---|---|
| ¿El 8,67″ es un resultado o una demo? | «Un resultado: 258 exposiciones reales de SPHEREx, sin catálogos. Coincide con lo predicho dentro del error. Los umbrales los ajustamos con este mismo campo, así que falta probarlo en otros.» |
| ¿Por qué el video y no en vivo? | «La app está en vivo en el QR. IRSA a veces tarda o se cae (esta mañana estuvo caído); el video usa datos guardados, los mismos que entrega IRSA.» |
| ¿En qué se diferencia de Backyard Worlds? | «Ellos usaban WISE, que se apagó, con 4 colores. Nosotros usamos SPHEREx, que sigue observando, con 102 colores y espectro.» |
| ¿Qué tan exacto es el espectro? | «Aproximado y lo decimos en pantalla: sirve para ver la forma. Para fotometría fina está la herramienta de IRSA.» |

## Fuentes de las cifras

- 200,000 voluntarios, 3,000+ enanas marrones: NASA Science, «NASA Volunteers Double Known Population of Brown Dwarfs»,
  5-may-2026 (verificado por el equipo en `docs/pitch/guion_pitch_2min.md`).
- 7,5 % y 193 mil → 354 mil: Minuta 24 OPPES-USACH (2024), pp. 4 y 6.
- 8,67″ ± 0,66″ vs 8,04″: `docs/hallazgos/huella_espectral_wise0855.md` (PR #58), figura
  `docs/hallazgos/img/huella_espectral_fig2_posiciones_en.png`.
- «Mediana de 10 exposiciones», «parece una enana marrón», los huecos de agua y metano: lo que muestra la propia
  aplicación en el video (fotos precalculadas de Epsilon Indi B en `scaffold/frontend/public/precalc/`).
