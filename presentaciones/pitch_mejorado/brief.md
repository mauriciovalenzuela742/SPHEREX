# Brief: pitch alternativo de AstroTRACK (2 min, NASA Space Apps 2026)

Respuestas de JP a las preguntas iniciales (15-nov-2026, ~05:50).

## Qué quiere obtener
- Una alternativa al pitch de Mauricio sin reemplazar el suyo: video de la demo (presentation-kit), presentación HTML
  parecida a su Canva pero mejorada, y el guion para que Mauricio lo diga.
- Videos acotados a la duración de cada versión: 47 s (alternativa) y ~30 s (la lámina 4 de Mauricio).

## Formato
- HTML hecho a mano (`astrotrack_pitch.html`) para copiar el estilo del Canva; el kit impone su propio diseño.
  El video sí sale del kit (`kit.py demo`).

## Audiencia y mensaje
- Jurado local de Santiago (2 min + 2 preguntas) y luego expertos de la NASA.
- Frase para recordar: cualquiera puede explorar el cielo de SPHEREx, y la misma herramienta alcanza para medir de
  verdad (WISE 0855: 8,67″ ± 0,66″ en un año vs 8,04″ predicho).
- Idioma: láminas y subtítulos en inglés; guion hablado en español (más versión en inglés).
- Referencia de estilo: el PDF de Canva de Mauricio (fondo de estrellas, títulos con serif en franja morada, cajas
  moradas y naranjas).

## Demostración de software
- Qué: vista simple → WISE 0855 → luz lejana → parpadeo de fechas → Modo ciencia → recorrido 1998-2010-2025 y
  cambio de época → resta última − primera visita → espectro y ficha.
- Producto real: main (PR #65) en local con `scaffold/frontend/vite.demo.config.ts`, que guarda en disco las
  respuestas del servidor de fotos. Video mudo; Mauricio narra encima.
