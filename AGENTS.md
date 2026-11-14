# AGENTS.md — instrucciones para agentes en este repositorio

Este archivo es la **fuente única**. `CLAUDE.md` y `GEMINI.md` apuntan acá y solo añaden lo
específico de cada herramienta. Si corriges algo, corrígelo aquí.

---

## 1. Qué estamos construyendo

Una **herramienta web pública** para el desafío *Planet X and SPHEREx* del NASA Space Apps 2026.
El usuario entra RA/Dec; la herramienta muestra la secuencia temporal de imágenes de SPHEREx de
esa zona del cielo, como un videíto, para que se vea a ojo qué se mueve o qué cambia de brillo.

El texto íntegro del desafío está en `docs/00_DESAFIO.md`. **Léelo antes de proponer arquitectura.**
Es frecuente que un agente asuma que esto es un problema de clasificación con modelos de video:
no lo es. El entregable que se juzga es el visor.

## 2. Reglas no negociables

1. **No inventes datos, endpoints, parámetros ni resultados.** Si no lo verificaste, dilo: «no lo
   comprobé» o «según la documentación de IRSA, que no abrí». Un endpoint inventado cuesta una
   hora de depuración a las 3 de la madrugada.
2. **Verifica el artefacto, no el reporte.** Antes de decir que algo funciona: abre la URL, mira
   el FITS, cuenta las épocas, compara la posición con SIMBAD. Un `200 OK` no prueba que la imagen
   sea del trozo de cielo correcto.
3. **Un resultado vacío no prueba que algo no exista.** Si una consulta no devuelve nada, prueba
   otra colección, otro radio, otra época, antes de concluir «no hay datos ahí».
4. **Ninguna cifra sin fuente.** Todo número que llegue al README, al pitch o a la interfaz tiene
   que poder abrirse y comprobarse. Deja el enlace o el archivo al lado.
5. **No commitees a `main`.** Trabaja en tu rama. Ver `CONTRIBUTING.md`.
6. **No descargues FITS al repositorio.** Van a `data/cache/`, que está en `.gitignore`.
   Un MEF de SPHEREx pesa unos 70 MB.
7. **No publiques nada hacia afuera** —desplegar a un dominio público, subir a redes, enviar
   correos, abrir issues en repositorios ajenos— sin que una persona lo apruebe explícitamente.
8. **Reglas del evento:** el hackatón empezó el 14-nov-2026 a las 10:00; antes no se escribía código que
   resuelva el desafío. Ver `docs/08_REGLAS_DEL_EVENTO.md`.

## 3. Stack decidido

| Capa | Elección | Por qué |
|---|---|---|
| Backend | Python 3.11 + FastAPI + uvicorn | `astropy`/`pyvo`/`astroquery` solo existen en Python |
| Acceso a datos | `pyvo` (SIA2) y HTTP directo al servicio de cutouts de IRSA | Es la vía documentada por IRSA |
| Imagen | `astropy.io.fits`, `astropy.wcs`, `astropy.visualization` | Estándar de la comunidad |
| Frontend | React + Vite + TypeScript | Rápido de levantar, el equipo lo conoce |
| Cielo | Aladin Lite 3.8.2 (fijada) sobre el cubo HiPS de IRSA; Gaia y SIMBAD con espejos de Harvard | Resuelve contexto del cielo y overlays sin escribirlos |
| Caché | Disco local (`data/cache/`), opcional Redis | Los cutouts son lentos; sin caché la demo se cae |
| Despliegue | Frontend en Vercel (solo Mauricio tiene acceso); backend por decidir (ADR-001) | Ver `docs/03_ARQUITECTURA.md` |

Esta decisión está en `docs/adr/ADR-001-stack.md`. **No la cambies solo.** Si crees que está
equivocada, escribe un ADR nuevo y plantéalo al equipo.

## 4. Contrato de la API

Frontend y backend se desarrollan en paralelo contra un contrato fijado en la hora 1. El contrato
vive en `docs/03_ARQUITECTURA.md` y es lo único que ambos lados pueden dar por cierto.
**Si cambias el contrato, cámbialo primero en el documento**, avisa en el canal del equipo y recién
después toca el código. Un cambio silencioso de contrato bloquea a otra persona sin que se entere.

## 5. Cómo trabajar aquí

**Antes de escribir código**

- Lee el documento de `docs/` que cubre tu parte. Están escritos para que no tengas que leerte
  la documentación de IRSA entera.
- Si la tarea toca datos de SPHEREx, la skill `spherex-datos` tiene endpoints, bandas y estructura
  de archivos ya verificados contra la documentación oficial.

**Mientras trabajas**

- Cambios pequeños y verificables. Nada de reescrituras grandes a mitad del evento.
- Cada función que toca coordenadas del cielo lleva un test con un campo de `data/campos_de_prueba.yml`.
- Si algo te toma más de 30 minutos sin avanzar, **páralo y dilo**. En un hackatón el costo de
  insistir es más alto que el de cambiar de enfoque.

**Al terminar**

- Di qué comprobaste y cómo. No «funciona», sino: «abrí `/api/epochs?ra=...&dec=...`, devolvió
  14 épocas entre 2025-05 y 2026-10, comparé la primera con el Data Explorer de IRSA y coincide».
- Di qué **no** comprobaste. Es igual de importante.

## 6. Cómo reportar

- Primero la conclusión, después el detalle.
- Un problema se reporta con su solución o con la opción que recomiendas, no solo con el error.
- Sin jerga interna, sin hashes de commit, sin rutas largas, cuando hablas con alguien que no
  estaba en el detalle.
- Si fallaste, dilo. Un entregable equivocado que llega sin advertencia es peor que avisar que algo falló.

## 7. Glosario mínimo

Para que un agente sin contexto astronómico no escriba cosas absurdas.

- **RA / Dec** — ascensión recta y declinación, las coordenadas del cielo. RA se da en horas
  (`08h55m10.831s`) o en grados (0–360); Dec en grados (−90 a +90). **Confundir horas con grados es
  el error más común**: hay un factor 15 entre ambas.
- **Época** — una observación en un instante dado. El "videíto" es la misma zona del cielo en
  distintas épocas, ordenadas en el tiempo.
- **Apuntado / barrido** — un apuntado es una posición del telescopio (una posición del cielo cae en 2
  archivos por apuntado: pares D1+D4, D2+D5, D3+D6); un barrido es una pasada completa del cielo
  (1-6 semanas, ~6 meses entre barridos). **Un barrido no es una época**: para el video, la unidad es
  el barrido (`docs/09`).
- **Movimiento propio** — desplazamiento aparente de una estrella en el cielo, en milisegundos de
  arco por año (mas/yr). Es lo que hace que una estrella cercana se mueva entre épocas.
- **Paralaje** — bamboleo aparente por el movimiento de la Tierra alrededor del Sol. Período de un
  año; es lo que da la distancia.
- **FITS** — formato estándar de imagen astronómica. Un **MEF** es un FITS con varias extensiones
  (imagen, varianza, flags, etc.) en el mismo archivo.
- **WCS** — la información del header FITS que traduce píxel ↔ coordenada del cielo.
- **Cutout** — recorte de una imagen grande alrededor de una posición.
- **HiPS** — formato de teselas jerárquicas del CDS que permite navegar todo el cielo en el
  navegador. Es lo que consume Aladin Lite.
- **LVF** — filtro lineal variable. El truco óptico de SPHEREx: la longitud de onda cambia a lo
  largo de un eje del detector, así que *dónde cae* una fuente en la imagen determina *en qué
  longitud de onda* se la está midiendo. Consecuencia práctica: dos imágenes de la misma zona del
  cielo pueden no ser comparables si fueron tomadas en longitudes de onda distintas.
- **Enana marrón** — objeto entre planeta y estrella. Frías, rojas, brillantes en infrarrojo:
  exactamente lo que SPHEREx ve bien y lo que los voluntarios de Backyard Worlds buscan.

## 8. Dónde está la verdad

| Pregunta | Documento |
|---|---|
| ¿Qué pide exactamente el desafío? | `docs/00_DESAFIO.md` |
| ¿Qué se ha hecho antes y qué funciona? | `docs/01_ESTADO_DEL_ARTE.md` |
| ¿Cómo pido datos de SPHEREx? | `docs/02_DATOS_SPHEREX.md` y skill `spherex-datos` |
| ¿Cómo está armado el sistema? | `docs/03_ARQUITECTURA.md` |
| ¿Quién hace qué y cómo nos coordinamos? | `docs/04_METODOLOGIA.md` |
| ¿Qué toca ahora? | `docs/05_PLAN_24H.md` |
| ¿Qué premia el jurado? | `docs/06_JURADO_Y_PITCH.md` |
| ¿Qué puede salir mal? | `docs/07_RIESGOS.md` |
| ¿Qué podemos hacer legalmente y cuándo? | `docs/08_REGLAS_DEL_EVENTO.md` |
| ¿Qué mostraron los datos reales? | `docs/09_EDA_HALLAZGOS.md` |
| ¿Quién hace qué después del EDA? | `docs/10_REPARTO_DE_TRABAJO.md` |
| ¿Cómo se midió y cómo se repite? | `eda/README.md` |
| ¿Cómo es la interfaz? | `docs/diseno/` |
| ¿Cómo se usa el kit? | `docs/KIT.md` |
| Papers y repositorios | `biblio/README.md` |

Si un documento contradice a este archivo, **manda el documento** y corrige este.
