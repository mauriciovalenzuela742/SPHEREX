---
title: "AstroTRACK se entiende al entrar y entrega todos los números cuando se piden"
author: Equipo AstroTRACK · NASA Space Apps 2026
date: 2026-11-15
place:
profile: night
lang: es
audience: El equipo del hackatón, que decide cómo ordenar la interfaz del visor. Conocen el proyecto; no todos conocen los resultados técnicos.
message: El visor puede ser simple para cualquiera y completo para un astrónomo si cada nivel de detalle aparece solo cuando el usuario lo pide.
---

<!-- Demostración de una propuesta de interfaz. El video se grabó con «kit.py demo demo.es.yml» desde app/index.html,
     una maqueta que funciona (no el visor real): por eso cada cuadro dice «Maqueta». Imágenes y cifras: datos reales
     de SPHEREx de WISE 0855 (eda/huella_espectral, PR #58). -->

## AstroTRACK se entiende al entrar y entrega todos los números cuando se piden
@type cover
@subtitle Propuesta de interfaz en tres niveles, mostrada en una maqueta con datos reales de SPHEREx
> Es una propuesta para decidir en equipo, no un cambio hecho en el visor.
@why El título es la conclusión que el equipo tiene que evaluar; el subtítulo dice de entrada que lo que se verá es una maqueta.

## Una persona pasa de curiosa a experta sin cambiar de pantalla
@video figures/demo_tres_niveles.es.mp4
@source Maqueta grabada con «kit.py demo» (demo.es.yml) desde app/index.html. Imágenes y cifras de WISE 0855: SPHEREx nivel 2 (IRSA), eda/huella_espectral (PR #58).
> Dejar correr el video. Primero se usa como cualquier persona (fechas, luz, tocar el objeto); al final, con «Modo ciencia», como un astrónomo. Con V se pausa.
@why Una sola tarea, de principio a fin, en la maqueta que funciona: se entiende mejor usada que descrita.

## Cada nivel aparece solo cuando el usuario lo pide
@steps
- **Al entrar:** el cielo, un buscador, los 5 objetos, las fechas y la luz. La ayuda, en «?».
- **Curioso:** al tocar el objeto se abre su panel: Fotos (Parpadeo, Resta, Color) y Prisma.
- **Experto:** «Modo ciencia» suma coordenadas, Limpiar estrellas, parámetros, Resultados y descargas.
- **Los resultados no cambian:** cada nivel solo muestra más.
@source Propuesta basada en «progressive disclosure» (Nielsen Norman Group) y en las interfaces multinivel de Shneiderman (2003).
> Hoy todo está a la vista a la vez; con esto se ordena, sin quitar nada.
@why Resume la regla que el video muestra, para que el equipo la discuta aparte del diseño visual.

## Las herramientas que usan los astrónomos ya funcionan así
@steps
- **ESASky (ESA):** modo Explorer o Science, con un interruptor arriba.
- **ALeRCE:** pestañas por objeto, de lo simple a lo técnico; todo se descarga.
- **WiseView:** buenos valores por defecto; los ajustes finos, escondidos y en el enlace.
- **Google Maps:** un mapa y un buscador; medir o cambiar capas, a un clic.
@source Investigación del 15-nov-2026: cosmos.esa.int/web/esdc/esasky-interface · science.alerce.online/services/ztf-explorer · blog.backyardworlds.org (WiseView) · support.google.com/maps/answer/1628031.
> Un astrónomo de ALeRCE reconocería este esquema: no se siente un juguete porque cada número se descarga y enlaza a su fuente.
@why Da la evidencia de que el esquema no es una idea nuestra, sino lo que hacen las herramientas profesionales.

## El equipo tiene que decidir cuatro cosas antes de implementarlo
- ¿Se reemplaza la página actual o se agrega como una vista nueva?
- ¿El cielo de entrada es el mapa de Aladin, como hoy, o la foto de SPHEREx en falso color?
- ¿Qué entra en la primera versión (por ejemplo, niveles 1 y 2) y qué queda para después?
- ¿Quién implementa cada parte, sin pisarse con lo que ya está en revisión?
> El caso de WISE 0855 contado en pasos y el deslizador de antes y después quedan para el pitch, no para el sitio.
@why Cierra con decisiones concretas en vez de un resumen: el objetivo de la sesión es decidir.

## Fuentes
@appendix
- Maqueta: app/index.html; grabación: demo.es.yml y presentation-kit (engine/demo.py).
- Datos: SPHEREx nivel 2 (NASA/IPAC IRSA), campo de WISE 0855; resultados en eda/huella_espectral y docs/hallazgos (PR #58).
- Nielsen Norman Group, «Progressive Disclosure». Shneiderman, B. (2003), «Promoting universal usability with multi-layer interface design», ACM CUU.
- ESASky, ALeRCE ZTF Explorer, WiseView y Google Maps: páginas citadas en la diapositiva 4.
@why Dice dónde está cada pieza para volver a grabar la demostración o revisar una cifra.
