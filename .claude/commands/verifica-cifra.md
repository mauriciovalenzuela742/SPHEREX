---
description: Comprueba una afirmación numérica o factual contra su fuente antes de que llegue al pitch
---

Comprueba la afirmación que viene en el argumento (o, si no hay argumento, recorre el README y el
guion del pitch y comprueba todas las que encuentres).

Para cada afirmación:

1. **Identifica qué se está afirmando exactamente.** Separa el número del adorno: «procesamos miles
   de imágenes» y «procesamos 1.400 imágenes» no son la misma afirmación.
2. **Busca la fuente.** Un archivo del repositorio, una salida de un comando, una página de la
   documentación de IRSA, un paper. **Ábrela.** Que un enlace exista no prueba que diga lo que se le
   atribuye.
3. **Compara.** ¿La fuente dice eso, dice algo parecido, o no lo dice?

Devuelve una tabla con: afirmación · estado · fuente · comentario.

Estados posibles:

- **Verificada** — la fuente lo dice. Pon el enlace o la ruta exacta.
- **Aproximada** — la fuente dice algo cercano pero no igual. **Propón la redacción correcta.**
- **Sin fuente** — no se encontró respaldo. Hay que quitarla o conseguir el respaldo.
- **Falsa** — la fuente dice otra cosa. Urgente.

Presta atención especial a:

- Cifras de la misión SPHEREx (bandas, longitudes de onda, cadencia, tamaños): van contra la
  documentación de IRSA, no contra la memoria.
- Afirmaciones de novedad («nadie ha hecho esto», «la primera herramienta que…»). Son las más
  arriesgadas ante un jurado experto. Si no se puede respaldar, se suaviza a «hasta donde pudimos
  comprobar».
- Cualquier cosa que suene a haber descubierto algo. **Eso nunca se afirma.**
- Resultados de fotometría presentados como calidad científica.

Al final, una línea: cuántas verificadas, cuántas hay que corregir y cuál es la más grave.
