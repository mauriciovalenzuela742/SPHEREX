# Brief: AstroTRACK se entiende al entrar y entrega todos los números cuando se piden

Respuestas de JP a las preguntas iniciales (15-nov-2026).

## Qué quiere obtener
- Una demostración de software: video de cómo un usuario usa la propuesta de interfaz en tres niveles.
- Va en una diapositiva HTML, en español, para mostrársela al equipo.

## Formato
- HTML.

## Audiencia y mensaje
- Audiencia: el equipo del hackatón, que decide cómo ordenar la interfaz.
- La frase que debe recordar: el visor puede ser simple para cualquiera y completo para un astrónomo si cada nivel aparece solo cuando se pide.
- Duración: corta (video de ~1 minuto y 4 diapositivas).
- Idioma: español.
- Referencia de estilo: ninguna; perfil «night» (el visor es oscuro). Supuesto mío, no preguntado.
- Registro: expresivo moderado.

## Demostración de software
- Qué demostrar: entra al visor y ve WISE 0855 en sus fechas → cambia la luz → la toca y se abre el panel → Resta → Prisma → activa Modo ciencia → Limpiar estrellas → Resultados.
- ¿Producto real o maqueta? Maqueta funcional (app/index.html), con el sello «Maqueta» en cada cuadro. JP eligió esta opción frente a implementar primero en el visor real.
- Cómo se inicia: app/index.html?video=1 (sin servidor). Datos: imágenes y cifras reales de SPHEREx de WISE 0855 (PR #58).
