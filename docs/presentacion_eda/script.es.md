---
title: "Lo que nos dijeron los datos de SPHEREx"
author: Equipo SPHEREx · NASA Space Apps 2026
date: 2026-11-14
place: Santiago
profile: night
lang: es
transition: fade
audience: El equipo del hackatón (6 personas). Una integrante sin experiencia en astronomía, un informático, el resto con astronomía.
message: Las estrellas más rápidas se mueven 1–2 píxeles en un año de SPHEREx; lo hacemos visible igualando la longitud de onda, alineando y restando.
---

<!-- Todas las cifras salen de docs/09_EDA_HALLAZGOS.md y eda/resultados/. Las imágenes son recortes reales de
     IRSA, procesados por figures/make_figures.py. Los valores de animations.js se copiaron de su salida. -->

## Lo que nos dijeron los datos de SPHEREx
@type cover
@class full
@anim portada
@subtitle EDA con datos reales de IRSA · 14 de noviembre de 2026
> La imagen de la derecha es real: la enana marrón Epsilon Indi B en cinco fotos de SPHEREx, de 2025 a 2026. Al final de la charla vamos a ver que se mueve justo lo que tiene que moverse.
@why La portada ya muestra el dato real que la charla explica: el parpadeo de un objeto que se mueve.

## La idea del desafío: comparar fotos del mismo cielo en distintas fechas
@kicker La idea
@class full
@anim idea
@steps 1
@source Esquema, no datos reales. Así se descubrió Plutón en 1930 y así trabajan los voluntarios de Backyard Worlds.
> Primero el parpadeo: dos fotos del mismo trozo de cielo, alternadas. Casi todo queda quieto; una estrella salta. Después la resta: lo que no cambia desaparece y lo que se movió deja un par, rojo donde está ahora y azul donde estaba.
@why Se explica el método con un esquema antes de los datos reales, para quien no conoce el problema. Parpadeo y resta son las dos vistas del visor.

## SPHEREx mira en infrarrojo, más allá del rojo, con 6 detectores
@kicker El instrumento
@figure figures/bandas.svg
@source Rangos por detector: documentación de IRSA (docs/02_DATOS_SPHEREX.md §1). Un micrómetro (µm) es una milésima de milímetro.
> El ojo ve entre 0,4 y 0,75 micrómetros. SPHEREx empieza donde termina el rojo y llega a 5. Lo divide en 6 detectores, D1 a D6. Las enanas marrones, frías, brillan sobre todo en los detectores largos.
@why Ubica al público sin astronomía: infrarrojo es «más allá del rojo», y los seis detectores son la unidad con la que se trabaja después.

## El truco de SPHEREx: el color que mide cambia a lo largo del detector
@kicker El filtro lineal variable
@class full
@anim lvf
@steps 5
@source Esquema. Rango real del detector 5 (3,82–4,44 µm) según la tabla WCS-WAVE; los puntos del espectro son ilustrativos.
> Cada franja del detector mide un color distinto. La nave apunta de nuevo y la estrella cae en otra franja: queda medida en otro color. Juntando las fotos se arma su espectro. Pero eso significa que dos fotos de la misma estrella casi nunca están en el mismo color.
@why Es una transformación (el detector se desplaza y el punto cambia de color) y una figura quieta no la cuenta: cumple las cuatro condiciones para animar.

## Para cada estrella hay cientos de fotos, en 3 o 4 barridos de un año
@kicker Cuántos datos hay
@figure figures/cobertura.svg
@source Consulta SIA2 a spherex_dr1 y spherex_qr3 (eda/resultados/inventario.json). R Dra tiene además 1.966 archivos en campos profundos, no dibujados.
> Cada punto es un archivo. Se ven los barridos: SPHEREx pasa por cada zona cada seis meses y, en cada pasada, toma decenas de fotos durante unas semanas. La base de tiempo va de 1 a 1,4 años.
@why Pequeños múltiplos en el mismo eje de tiempo: los cinco campos se comparan de un vistazo.

## Pero cada foto está en otro color: hay que elegir las que coinciden
@kicker Primer problema
@figure figures/lambda_wise.svg
@source WISE 0855, detector 5: color en que quedó el objeto en cada archivo, calculado con el header de cada archivo y la tabla WCS-WAVE (eda/resultados/lambda_por_archivo.csv).
> Si tomamos la primera foto de cada barrido, el color salta casi medio micrómetro: el brillo cambiaría sin que nada pase. Pero cada color se repite cada seis meses, así que podemos elegir fotos del mismo color: la variación baja a 0,035 micrómetros.
@why El acento va a la selección buena; la mala va en rojo y lo que es contexto en gris.

## El detector gira 180° entre barridos: antes de comparar hay que alinear
@kicker Segundo problema
@class full
@anim giro
@steps 1
@source Dos recortes reales de Barnard (D2) sin alinear. Ángulo del detector en el cielo leído del header: −179,6° y +1,1°.
> Las dos fotos son del mismo trozo de cielo, pero la de la derecha está dada vuelta. Al girarla 180°, las mismas estrellas coinciden. En el código esto se hace reproyectando todo a una grilla con el norte arriba.
@why Girar es una transformación: verlo girar convence más que dos imágenes con una flecha.

## Alineadas y al mismo color, Epsilon Indi B se mueve justo lo que predice el catálogo
@kicker El resultado
@class full
@anim epsind
@steps 1
@source Centroides en la primera y la última foto (2025,31 y 2026,74), reproyectadas a la misma grilla (eda/resultados/centroides.json). Predicción: movimiento propio de SIMBAD. Ampliado: 18×18 píxeles de 6,15″.
> El círculo es donde el catálogo dice que debería estar en cada fecha. Se corre hacia la izquierda y abajo, que en el cielo es este y sur. Medimos 0,85 y 0,71 píxeles; el catálogo predice 0,92 y 0,57. Las estrellas de alrededor, que no se mueven, se corren menos de 0,4.
@why Datos reales antes que la regla, y la comprobación numérica en la misma diapositiva que la imagen.

## La resta convierte el movimiento en un par rojo y azul, pero una estrella saturada engaña
@kicker La resta
@class full
@anim restas
@steps 2
@source Resta última − primera, normalizada. Núcleo marcado como malo: Barnard 44 de 49 píxeles, RW Aur 6–8, eps Ind B 0–1 (eda/resultados/centroides.json).
> Epsilon Indi B: el par rojo-azul es movimiento real. Barnard: también se mueve, hacia el norte, pero está saturada y no se puede medir. RW Aur no se mueve y aun así deja un par: es el efecto de la saturación. El visor tiene que avisar cuándo un objeto satura.
@why Se revela un panel por paso (segmentación) para comparar los tres casos con el mismo código de color.

## WISE 0855 casi no se ve en una sola foto: para mostrarla hay que sumar
@kicker Un caso difícil
@class full
@anim wise
@source Cuatro recortes reales de WISE 0855 en el detector 5 a la misma λ (4,15–4,18 µm). El círculo es la posición predicha.
> El objeto que el enunciado propone es demasiado débil para una sola exposición. La solución es sumar las fotos de cada barrido, que es justo una de las ideas que sugiere el desafío.
@why Una diapositiva quieta después de las animadas: aquí se abre la discusión de qué mostrar en la demo.

## Cada recorte tarda 7 segundos y el navegador no puede pedirlo: todo pasa por un backend con caché
@kicker Para el código
@figure figures/latencia.svg
@source 25 recortes de 0,1° (eda/resultados/latencia_cutouts.json): mediana 7,3 s, máximo 29 s, ~3,9 MB cada uno. IRSA no responde con CORS (eda/resultados/infraestructura.json).
> El recorte pesa lo mismo sea chico o grande, porque trae entera la descripción de la imagen de la estrella. Hubo errores 503. Y IRSA no deja que una página web le pida datos directo. Conclusión: backend, caché en disco y precalentar los campos de la demo.
@why La distribución completa, no solo la mediana: se ve la cola de 29 s que haría caer una demo en vivo.

## La máscara de calidad: el bit SOURCE no es un error
@kicker Filtros
@figure figures/flags.svg
@source Bits de FLAGS en 25 recortes. Los nombres vienen en el propio header de la extensión FLAGS.
> Si filtramos «todo lo que tenga algún bit», borramos el 72 % de la imagen, porque SOURCE solo dice que ahí hay una estrella. Los bits que de verdad indican un píxel malo suman cerca de un 4 %.
@why El acento azul marca el caso que no es un error; en rojo los bits que invalidan un píxel.

## Siete piezas de punta a punta, cada una con su dueño
@kicker El reparto
@class full
@anim flujo
@steps 1
@source Reparto del plan del equipo (README §3, docs/05_PLAN_24H.md); tareas del EDA por rol en docs/10_REPARTO_DE_TRABAJO.md.
> Primero el camino de los datos, de la coordenada a la imagen en pantalla. Después quién toma cada pieza, según el plan que ya acordamos: el EDA le carga más trabajo a D2, que recibe la selección por λ, los filtros y las restas.
@why El reparto se lee sobre el flujo de datos: cada persona ve dónde encaja su pieza y con quién se conecta.

## Lo que todavía no sabemos
@kicker Para discutir
- **¿Carga el HiPS de SPHEREx del CDS en Aladin?** Hoy el servidor respondía error.
- **¿Cuánto mejora WISE 0855 al sumar** las fotos de un barrido?
- **¿Qué hace el visor con las estrellas saturadas?** Avisar, mostrar la máscara o cambiar de detector.
- **El brillo:** todavía no medimos la variabilidad de RW Aur ni de R Dra.
@source docs/09_EDA_HALLAZGOS.md §7.
> Para recordar: las estrellas más rápidas se mueven uno o dos píxeles en un año; lo hacemos visible igualando el color, alineando y restando.
@why Cierre con lo abierto y el mensaje, no con un «gracias».

## Fuentes
@appendix
- Datos: IRSA/IPAC, colecciones SIA2 spherex_dr1 y spherex_qr3, consultadas el 14-nov-2026.
- Movimientos propios: SIMBAD (espejo CfA), en data/campos_de_prueba.yml.
- Scripts: eda/01_inventario.py a eda/05_centroides.py; figuras: docs/presentacion_eda/figures/make_figures.py.
- Atribución: This publication makes use of data products from SPHEREx, a joint project of JPL and Caltech, funded by NASA.
@why Dónde vive cada cifra, para volver a calcularla.
