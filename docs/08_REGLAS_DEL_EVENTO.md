# 08 — Reglas del evento y qué podemos hacer antes

Este documento existe para que nadie tenga dudas sobre qué es legítimo preparar antes del hackatón
y qué no. Las reglas aplican a todo el equipo y a sus agentes.

---

## La regla que importa

El reglamento del NASA Space Apps dice, textual:

> Teams are not allowed to begin working on the challenges prior to the hackathon.

No está permitido **empezar a trabajar en el desafío** antes del hackatón.

## Cómo lo interpretamos

La regla prohíbe adelantar la solución, no prohíbe saber leer. Nuestro criterio, conservador:

### Sí, antes del evento

- **Leer** el enunciado, los *Resources* y la documentación pública de la NASA, IRSA y el CDS.
- **Investigar el estado del arte**: papers, repositorios públicos, herramientas que ya existen.
- **Escribir documentación**: qué sabemos del instrumento, qué formatos hay, qué se ha hecho antes.
- **Acordar cómo vamos a trabajar**: roles, ramas, horarios, criterios de corte.
- **Preparar el entorno**: instalar Python, Node, Docker; configurar los editores y los agentes.
- **Andamiaje genérico**: un «hola mundo» de FastAPI y uno de Vite/React, un `docker-compose`, un CI
  que corre linter y tests. Es el equivalente a tener el editor configurado; no resuelve nada del desafío.

### No, antes del evento

- **Escribir código que resuelva el desafío**: cliente de IRSA, lector de MEF, lógica de recorte,
  normalización, componente de blink, resolución de WCS.
- **Descargar y preprocesar datos** de SPHEREx para el proyecto.
- **Prototipar la interfaz** del visor, aunque sea «solo para probar».
- Cualquier cosa que, si la quitáramos, nos dejara con menos proyecto hecho.

### La prueba práctica

> ¿Esto seguiría siendo útil si mañana nos tocara otro desafío?

Si la respuesta es sí (metodología, bibliografía, entorno, convenciones), es preparación.
Si es no (un cliente de SIA2, un componente de blink), es trabajo sobre el desafío y espera.

## Qué contiene este kit, medido contra esa prueba

| Carpeta | Juicio |
|---|---|
| `docs/00_DESAFIO.md` | Transcripción de una página pública. Preparación |
| `docs/01` – `docs/08` | Investigación y metodología. Preparación |
| `biblio/` | Bibliografía pública. Preparación |
| `data/campos_de_prueba.yml` | Coordenadas públicas de objetos nombrados **en el propio enunciado**. Referencia, no solución |
| `.claude/` | Configuración de herramientas de trabajo. Preparación |
| `scaffold/` | «Hola mundo» genérico de FastAPI y Vite, sin nada de SPHEREx. Entorno |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING.md` | Convenciones de equipo. Preparación |

**No hay en este repositorio una sola línea de código que consulte IRSA, lea un FITS o pinte un
fotograma.** Está dicho en el README y se mantiene así hasta el inicio oficial.

Si alguien del equipo tiene dudas sobre un caso concreto, la regla es: **se pregunta al organizador
del evento local antes de hacerlo.** Perder diez minutos preguntando es más barato que una
descalificación.

---

## Otras reglas del evento que afectan al trabajo

- **Equipos:** máximo 6 personas. Una sola persona no puede estar en dos equipos, y cada equipo
  trabaja en un solo desafío.
- **Uso de IA:** está permitido y **cada entrega debe incluir una descripción de cómo se usó**.
  No es opcional. Plantilla en la skill `entrega-nasa`.
- **Menores de 18:** no deben subir fotos de sí mismos como avatar ni aparecer con foto, vídeo o voz
  en la demo o la entrega.
- **Entrega:** por la página del proyecto en spaceappschallenge.org, según la hora de cierre del
  evento local.
- **Datos de terceros:** la NASA advierte que no respalda sitios no gubernamentales y que hay que
  cumplir las condiciones de uso de cada uno. En la práctica: respetar las licencias y las notas de
  atribución del CDS, de IRSA y de la CSA.

## Licencia y publicación

El plan es publicar el repositorio con licencia MIT al empezar el evento. Dos cuidados:

- **Atribución de SPHEREx** literal en el README y en el pie de la herramienta
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **No versionar datos**: los FITS y los PNG de caché quedan fuera del repositorio.

## Reglas comunicadas en el evento (14-nov-2026)

Dichas en vivo por la organización; no las verificamos contra la página oficial. Si difieren de
`docs/00_DESAFIO.md` o de la plataforma, manda la plataforma.

1. **Datos:** abiertos de la NASA y de sus agencias socias.
2. **Cierre de envíos:** 11:00 de la mañana (hora local del evento).
3. **Qué se sube:** nombre y resumen del proyecto, enlace a la demo final, datos de la NASA y
   otras fuentes usadas, y cómo se usó IA.
4. **Criterios del jurado:** impacto, creatividad, validez, relevancia y presentación.
5. **Despliegue:** Vercel. Pendiente decidir cómo corre el backend; el ADR-001 (frontend
   estático + backend en contenedor) queda por revisar. Nada se despliega sin aprobación de una
   persona del equipo.

---

## Antes de subir esto a GitHub, revisar

- [ ] No hay claves, tokens ni credenciales en ningún archivo.
- [ ] No hay datos personales de los integrantes (correos, teléfonos, direcciones).
- [ ] No hay archivos de datos pesados ni FITS.
- [ ] El `.gitignore` cubre `data/cache/`, `.env`, `node_modules/`, `__pycache__/`.
- [ ] El README dice con claridad qué es esto y qué no es.
