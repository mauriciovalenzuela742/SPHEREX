---
name: entrega-nasa
description: Checklist y plantillas para entregar el proyecto en la plataforma del NASA Space Apps Challenge - qué pide el formulario, el resumen del proyecto, la descripción obligatoria de cómo se usó la inteligencia artificial, los enlaces a demo y repositorio, la atribución de datos de la NASA, y las reglas sobre menores de edad y contenido. Actívala cuando se mencione entregar, submission, subir el proyecto, formulario de entrega, cierre de entregas, declaración de uso de IA, o cuando queden pocas horas y haya que cerrar la entrega.
---

<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../../../en/.claude/skills/entrega-nasa/SKILL.md) · **Español** · [中文](../../../../zh/.claude/skills/entrega-nasa/SKILL.md) · [Deutsch](../../../../de/.claude/skills/entrega-nasa/SKILL.md) · [Italiano](../../../../it/.claude/skills/entrega-nasa/SKILL.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `.claude/skills/entrega-nasa/SKILL.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# Entrega en la plataforma

**La causa número uno de que un buen proyecto no gane nada es entregar tarde o incompleto.**
Esta skill existe para que eso no pase.

**Regla:** la entrega se sube en **T − 2 h**, no en T. Después se puede seguir editando, pero ya
está entregado.

**N abre el formulario en la hora 1 del evento**, no en la hora 22, para ver qué pide de verdad.
Lo de aquí es lo que sabemos; la plataforma manda.

---

## Qué pide la entrega (lo que sabemos)

- Nombre del proyecto y resumen corto.
- Descripción del proyecto: qué hace, cómo lo hicieron, qué datos usaron.
- **Descripción de cómo se usó la IA en el proyecto. Obligatoria este año.**
- Enlace a la demo (vídeo o aplicación desplegada).
- Enlace al repositorio de código.
- Recursos y datos usados, con sus fuentes.

Se entrega desde la página del proyecto del equipo en spaceappschallenge.org, según la hora de cierre
del evento local: **domingo 15-nov, 11:00** (confirmado por JP el 14-nov). Entregar a las 09:00 (T − 2 h).

---

## Plantillas

### Resumen corto

> *(Una o dos frases. Lo que el jurado lee primero y a veces lo único.)*
>
> `<Nombre>` es una herramienta web pública que muestra cualquier trozo del cielo tal como lo ve
> SPHEREx a lo largo del tiempo, como un videíto, para que cualquiera pueda detectar objetos que se
> mueven o que cambian de brillo. Añade el eje espectral: las 102 bandas de infrarrojo de la misión
> *(incluir «con espectros generados al vuelo» solo si `/api/spectrum` llega a la demo)*.

### Descripción

Cuatro bloques, en este orden:

1. **El problema.** Por qué hace falta: SPHEREx cartografía el cielo entero cada seis meses en 102
   bandas y nadie lo está mirando en busca de lo que se mueve. La técnica del parpadeo descubrió
   Plutón y sigue descubriendo enanas marrones y cometas gracias a voluntarios.
2. **Qué construimos.** El visor, los controles, los overlays, la URL compartible. Lo que **hay**,
   no lo que se planeó.
3. **Cómo lo construimos.** Los datos reales usados (release, colecciones, servicios de IRSA), el
   stack, y los problemas que hubo que resolver — **en particular el del filtro lineal variable**,
   que es lo que demuestra que entendimos el instrumento y no solo descargamos imágenes.
4. **Qué sigue.** Honestamente: lo que no alcanzamos y por qué.

### Declaración de uso de IA

No es un trámite. Escrita bien, es evidencia de método. Escrita mal («usamos ChatGPT para programar»)
desperdicia una oportunidad.

> **Cómo usamos inteligencia artificial en este proyecto**
>
> Usamos asistentes de programación basados en modelos de lenguaje (Claude Code y Antigravity) como
> herramienta de desarrollo durante las 24 horas del evento, con un método explícito:
>
> - **Qué les pedimos:** escribir código de integración con el archivo IRSA, componentes de interfaz,
>   pruebas y documentación, a partir de un contrato de API y unas convenciones que el equipo fijó
>   al inicio y que están versionadas en el repositorio (`AGENTS.md`).
> - **Cómo controlamos el resultado:** todo cambio pasó por revisión humana antes de integrarse.
>   Trabajamos con la regla de verificar el artefacto y no el reporte: ninguna funcionalidad se dio
>   por terminada porque un asistente lo dijera, sino tras abrirla y comprobarla contra datos reales
>   y contra catálogos externos.
> - **Qué NO hicimos:** no usamos modelos para generar, inventar ni completar datos científicos.
>   Todas las imágenes, longitudes de onda y metadatos que muestra la herramienta vienen de los
>   archivos publicados por la misión SPHEREx a través de IRSA.
> - **Por qué no usamos modelos de visión o de video para la detección:** lo evaluamos y lo
>   descartamos de forma razonada. El desafío pide un visor para que personas detecten; el cuello de
>   botella real es el acceso y la alineación de los datos. Dejamos documentado en el repositorio
>   dónde sí aportaría un modelo —cribado de candidatos con redes pequeñas sobre recortes, al estilo
>   del broker ALeRCE— como trabajo siguiente.
>
> *(Ajustar a lo que realmente pasó. Si se usó otra cosa, se dice. Si Spherix usa un LLM en producción, declararlo aquí con el modelo y qué datos recibe.)*

### Datos y recursos usados

Listar con enlace: la página de misión de SPHEREx en IRSA, la release concreta (DR1 / QR3) y las
colecciones SIA2, los servicios de IRSA usados (cutouts, cubo HiPS, MOST…), Aladin Lite 3.8.2, el cubo
HiPS de SPHEREx DR1 (IRSA), Gaia DR3 (VizieR, espejo de Harvard/CfA), SIMBAD (CDS y espejo de Harvard), Astropy. Si se usó algún recurso de la agencia socia (CSA/NEOSSat),
nombrarlo: **suma en el criterio *Global Connection***.

### Atribución obligatoria

En el README y en el pie de la herramienta, literal:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## Checklist final

**Contenido**

- [ ] Nombre del proyecto y resumen corto.
- [ ] Descripción con los cuatro bloques.
- [ ] **Declaración de uso de IA.** Obligatoria.
- [ ] Lista de datos y recursos con enlaces.
- [ ] Atribución de SPHEREx, literal.

**Enlaces — probados desde fuera del wifi del evento**

- [ ] Vídeo de la demo. **Abierto desde un móvil con datos.**
- [ ] Aplicación desplegada. Ídem.
- [ ] Repositorio **público** y accesible sin sesión iniciada.
- [ ] El README del repositorio explica qué es, cómo se corre y qué datos usa.

**Reglas**

- [ ] Sin fotos, vídeo ni voces de menores de edad.
- [ ] Sin claves, tokens ni credenciales en el repositorio.
- [ ] Sin datos personales de los integrantes.
- [ ] Licencia declarada.

**Lo último**

- [ ] Alguien distinto de quien lo escribió lee la entrega entera de principio a fin.
- [ ] **Entregado antes de T − 2 h.**
