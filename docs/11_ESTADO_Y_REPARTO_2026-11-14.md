# 11 — Estado y reparto hasta el cierre · sábado 14-nov-2026, 17:30

Para decidir, no para archivar. Escrito sobre `equipo/main` en `4ebdad5` (PR #1 a #20 fusionados) y con la
herramienta en producción probada en el navegador entre las 17:05 y las 17:25.

**Plazos** (calculados con código desde las 17:30): congelación de alcance **dom 05:00** (faltan 11,5 h) ·
T−4 dom 07:00 (13,5 h) · entrega hecha **dom 09:00** (15,5 h) · cierre **dom 11:00** (17,5 h).
Fuente de las horas: `README.md:219-220`.

---

## (a) Conclusión en 5 líneas

1. **El objetivo central ya se cumple en producción**: se escriben A.R. y Dec, y el explorador muestra la serie
   de imágenes de SPHEREx de ese parche como video (play, línea de tiempo, resta contra la primera fecha) en los
   cinco objetos de prueba, que cargan entre 24 y 46 imágenes cada uno.
2. **Lo que pone en riesgo la demo es WISE 0855, que es obligatorio**: con la configuración por defecto (1
   exposición por visita) no se ve nada en la mira. Sí se ve con banda D5, 10 exposiciones por visita y la primera
   visita contra la última, pero esa consulta tarda ~62 s: hay que dejarla precalculada y a un clic.
3. **Segundo riesgo: decir algo falso ante el jurado.** Tres niveles del Modo Misión (WISE 0855, RW Aur, R Dra) dan
   por buena una respuesta que las imágenes contradicen. La revisión que lo prueba quedó en una rama sin fusionar.
   Las dos variables saturan y no hay curva de brillo: hoy solo se pueden mostrar con una explicación honesta.
4. **Tercer riesgo: todo depende de IRSA en vivo.** No hay nada precalculado guardado ni un video de respaldo, y
   la tarea de precalcular (de D1) no la está haciendo nadie.
5. **Recortar ya:** `/api/spectrum` (el Prisma ya dibuja una huella espectral aproximada en el navegador), la suma
   de todas las visitas, el recuadro «Contaminación», la traducción a 5 idiomas, la sección educativa y Spherix con
   un modelo de lenguaje. Lo que no esté empezado a las 05:00 no entra.

---

## (b) Recorrido de la demo en producción (comprobado en el navegador)

URL: https://spherex-planet-x-tau.vercel.app · ventana de 1400×1000 · tamaño 0,1° · **1 exposición por visita**
(lo que trae el explorador por defecto). Cada objeto se abrió con su botón, que centra en la posición de hoy.

| Objeto | Qué ve hoy el jurado | Qué falta |
|---|---|---|
| **Estrella de Barnard** | 28 imágenes, sin errores. Banda B2, resta de la última visita (20-sep-2026) contra la primera: **pareja roja arriba y azul abajo, clara, justo en la mira**. Es el caso que mejor luce hoy. | Decir que la estrella satura: la pareja son los bordes de un anillo con el centro vacío (revisión científica, rama `n/pedidos-v2`). El comentario de `mision.ts:78` («midió 1,44–1,50 px») contradice a `docs/09`. |
| **Epsilon Indi B** | Es el objeto que abre por defecto. 46 imágenes. En «Imagen», banda B5, se ve una fuente puntual en la mira. En «Resta vs t₀», B5, última visita: **no hay una pareja clara a simple vista**; hay manchas de ruido y pares en estrellas vecinas. | Según `docs/09` es donde el movimiento se ve más claro, pero eso no se reproduce con 1 exposición por visita. Probar con 5 o 10 exposiciones por visita y fijar la configuración de la demo (no lo comprobé). |
| **WISE 0855** | 26 imágenes. Banda B5, resta de la última visita (may-2026) contra la primera, 1 exposición: **nada en la mira**. Coincide con lo medido hoy. | Dato ya verificado: se ve con D5, **10 exposiciones por visita**, primera visita (may-2025) contra la última (may-2026): pareja azul al este y roja al oeste, ~1 px. La consulta tarda ~62 s: precalcularla y dejar un botón o enlace que la abra así. |
| **RW Aurigae** | 24 imágenes. Banda B3: estrella brillante en la mira. El brillo entre fechas se puede comparar con la escala común de «Imagen», pero **no hay curva de brillo** ni aviso de saturación en el explorador. | La resta deja una pareja falsa por saturación (revisión científica). Además, la igualación entre fotos usa el 5 % de píxeles más brillantes, que es la propia estrella, y borra su cambio de brillo (`explorador/render.ts:49-61`). Mínimo: un texto honesto; ideal: igualar con las vecinas. |
| **R Draconis** | 44 imágenes. Banda B4: **el centro sale como un agujero negro con un anillo** (núcleo saturado y enmascarado). | Mostrarla en una banda donde no sature (no comprobé cuál) o explicar el agujero. La «huella espectral» del Prisma marca los puntos saturados, que ayuda. |

Comunes a los cinco: en «Esta imagen», «Contaminación» dice «— (lector rápido no la lee)»; la cabecera dice
**«en construcción»** (`App.tsx:20`); en la barra lateral hay un recuadro visible **«Contaminación (% …) — por
definir · Mauricio + Bryan»** (`Visor.tsx:106`). Las dos cosas las va a ver el jurado.

---

## (c) Objetivo y sugerencias contra el estado actual

Estado: **Hecho** · **Parcial** · **Falta** · **Con fallo**.

| Qué pide la organización | Estado | Evidencia |
|---|---|---|
| **Objetivo:** herramienta web pública | Hecho | https://spherex-planet-x-tau.vercel.app |
| **Objetivo:** el usuario ingresa A.R. y Dec | Parcial | Solo grados decimales: `Visor.tsx:37,41` (`type="number"`). El enunciado da WISE 0855 en sexagesimal (08h55m10.831s −7d14m42.53s) y no se puede pegar así. Hay botones de los 5 objetos y Spherix busca por nombre en SIMBAD (`spherix/motor.ts:176`) |
| **Objetivo:** serie de imágenes como un video | Hecho | Explorador con ◀ ▶ ▶▶, línea de tiempo y tira de bandas × fechas (`explorador/Explorador.tsx`); probado en los 5 |
| **Objetivo:** que sea fácil ver lo que se mueve | Parcial | La resta contra t₀ lo muestra en Barnard, no en WISE 0855 ni (a simple vista) en eps Ind B con la configuración por defecto. El color de la resta se escala por cuadro, así que el ruido sale a color pleno (`explorador/render.ts:92`) |
| **Objetivo:** probado en los 5 objetos | Parcial | Ver (b): los 5 cargan; 1 de 3 movedores se ve con lo que trae por defecto; las 2 variables necesitan explicación |
| Actualizar con nuevas entregas de datos | Parcial | Se consulta SIA2 en vivo en `spherex_dr1` y `spherex_qr3`: aparecen visitas hasta oct-2026 de `spherex_qr3` (visto en el explorador). No hay nada escrito que diga cómo agregar una colección nueva |
| Las 102 bandas de forma creativa | Hecho | Deslizador de λ sobre el cubo (`sky/LambdaSlider.tsx`, `sky/planos.ts`) y Prisma: ojo infrarrojo y huella espectral (`prisma/`). El sonido se quita por pedido de JP (tarea #17); el deslizador se reemplaza por el acordeón (tarea #18) |
| Sumar los datos de cada detector (más señal) | Parcial | «Exp. por visita» combina hasta 10 exposiciones de **una** visita (`prototipos/rango_fechas/servidor.py:89`, `per_visit`); no suma todas las visitas de un detector |
| Espectros al vuelo | Parcial | Huella espectral calculada en el navegador, aproximada y rotulada como tal (`prisma/fotometria.ts`, `prisma/HuellaEspectral.tsx`). No existe `/api/spectrum` |
| Sumar o restar imágenes de distintas fechas | Parcial | Resta contra la primera fecha del rango (el rango se elige con Desde/Hasta). No hay suma de fechas ni resta entre dos fechas cualesquiera |
| Elegir el campo de visión | Con fallo | El selector ofrece 1° (`Visor.tsx:46`) y el servidor acepta hasta 0,5° (`prototipos/rango_fechas/servidor.py:89`): el explorador falla con «[object Object]» |
| Superponer Gaia y WISE | Hecho, con un fallo menor | `sky/capas/gaia.ts`, `sky/capas/catwise.ts`, `sky/capas/simbad.ts`. CatWISE dibuja un fragmento (J085507.45-071437.8) a 50″ de WISE 0855 (revisión científica). Falta la imagen de WISE en sí: ver tarea #13 (HiPS AllWISE W2 de IRSA) |
| Coordenadas en la URL / insertar en otras páginas | Hecho | `state/url.ts`; probado: `?ra=133.757785&dec=-7.242023&size=0.1&band=5` abre directo el visor. La respuesta no trae `X-Frame-Options` (curl); no lo probé dentro de un iframe |
| Mostrar metadatos (marcas de contaminación) | Falta | Fecha, λ, observación y colección sí se muestran. Contaminación: «lector rápido no la lee» y recuadro «por definir» (`Visor.tsx:106`) |
| Usar Astropy y Aladin | Hecho | Aladin Lite 3.8.2 (`scaffold/frontend/package.json`); astropy en el prototipo y el backend |
| Atribución literal de IRSA (regla de la entrega) | Hecho | Pie de página en producción con el texto literal «This publication makes use of data products from…» |

---

## (d) Trabajo restante, priorizado

Impacto = cuánto cambia lo que ve el jurado. Horas = estimación mía, no medida. Dueño propuesto por rol; lo
confirma cada persona. **Congelación de alcance: domingo 05:00.** Después de esa hora solo se corrigen fallos.

### Prioridad 1 · sin esto la demo falla o dice algo falso (antes de las 01:00)

| # | Tarea | Dueño | Horas | Si no llega |
|---|---|---|---|---|
| 1 | **WISE 0855 a un clic**: guardar precalculada la resta D5, 10 exposiciones por visita, primera contra última, y un botón o enlace que la abra así | D2 Bryan (servidor y caché) + V1 Antonia (botón) | 2–3 | Se muestra con una captura fija y se explica |
| 2 | **Precalcular los 5 campos** con la configuración de la demo y servirlos sin depender de IRSA | D1 Vladimir | 3 | La demo se apoya en el video de respaldo (#4) |
| 3 | **Modo Misión**: corregir los niveles de WISE 0855, RW Aur y R Dra según la revisión científica, o esconderlos y dejar solo Barnard (y eps Ind B si se verifica) | C Mauricio | 1–1,5 | Se esconden los 3 niveles |
| 4 | **Video de respaldo de la demo** (2 min) con lo que ya funciona, y guion alineado con lo que hay | N Javiera + V2 Juan Pablo | 1,5 | No es opcional |
| 5 | Selector de dimensión hasta 0,5° y mostrar el mensaje del servidor en vez de «[object Object]» | V1 Antonia | 0,25 | — |
| 6 | Quitar «en construcción» de la cabecera y el recuadro «Contaminación — por definir» | V1 Antonia (`App.tsx`, `Visor.tsx`) | 0,25 | — |
| 16 | **Catálogos apagados al iniciar** (pedido de JP: se ve muy cargado): círculos de Gaia (`sky/capas/gaia.ts`), triángulos de CatWISE (`sky/capas/catwise.ts`) y cuadrados de SIMBAD (`sky/capas/simbad.ts`) parten ocultos, con un botón «Mostrar catálogos». Ojo: hoy el clic en el cielo (`onSelect`) lo emite la capa SIMBAD; al apagarla hay que sacar ese oyente de la capa. **Absorbe la tarea #11** (el falso «objeto en movimiento» de CatWISE a 50″ de WISE 0855 deja de verse al iniciar) | V2 Juan Pablo | 1 | Se deja como está |
| 17 | **Quitar el «espectro de audio»** (pedido de JP): `prisma/sonificar.ts`, el bloque `prisma-sonido` de `prisma/Prisma.tsx` y sus textos en `content/prisma.ts:49-55` | C Mauricio (es su código; los textos son de `src/content/`, avisar a Javiera) | 0,25 | — |

### Prioridad 2 · mejora clara para el jurado (antes de las 05:00)

| # | Tarea | Dueño | Horas | Si no llega |
|---|---|---|---|---|
| 7 | Aceptar coordenadas sexagesimales en A.R./Dec (el enunciado da WISE 0855 así) | V1 Antonia | 1 | Se muestran los botones de los objetos |
| 8 | eps Ind B: probar con 5–10 exposiciones por visita y fijar la configuración que muestra el movimiento | C Mauricio | 0,5 | Se usa Barnard como ejemplo principal |
| 9 | Resta con escala de color común para todas las fechas (`render.ts:92`) e igualar con estrellas vecinas, no con el objeto (`render.ts:49-61`, `spherex.py:442-453`) | D2 Bryan + C Mauricio | 1,5 | Texto que explique la pareja falsa de las estrellas saturadas |
| 10 | Revisar con V1 la rama `v/v2-clic-visor` (clic en el cielo mueve el explorador; 8 líneas) | V1 Antonia decide | 0,25 | Se queda fuera |
| 11 | ~~Quitar el fragmento de CatWISE a 50″ de WISE 0855~~ | — | — | **Absorbida por la tarea #16** (catálogos apagados al iniciar). Si se enciende CatWISE en la demo, el fragmento vuelve a verse: no encenderla sobre WISE 0855 |
| 18 | **Selector de longitud de onda en acordeón**, reemplaza al deslizador (`sky/LambdaSlider.tsx`). Maqueta navegable acordada con JP: [`diseno/maqueta_acordeon_lambda.html`](diseno/maqueta_acordeon_lambda.html). Gráfico λ (0,75–5 µm) contra respuesta de cada canal, con los 102 canales como curvas de color por banda; clic en una banda la expande con animación (17 canales rotulados 3.1…3.17 con su λ) y encoge las otras; se elige un canal con clic o un tramo arrastrando (puede cruzar bandas) y abajo salen bandas, canales y rango en µm; con varios canales, el cielo los recorre como video (ya existe `ponerPlano`). Sumarlos queda fuera (necesita el servidor). **Pendientes de la maqueta:** la altura real necesita la curva oficial de respuesta (mientras, el eje dice «respuesta (ilustrativa)»); el ancho usa λ/R con R por banda de la literatura (39, 41, 41, 35, 112, 128), **sin verificar**; las λ sí son reales (`data_cube_crval3_arr` del `properties` del cubo de IRSA); los canales 3.17 y 4.1 (planos 50 y 51) vienen vacíos | V2 Juan Pablo | 3 | **Se apaga si no está a las 05:00**: queda el deslizador actual |
| 12 | Entrega en la plataforma: formulario, README, **declaración de uso de IA** (skill `entrega-nasa`) y **lista de todas las fuentes de datos citadas** (ver abajo) | N Javiera | 2 | Sin esto no hay entrega: empieza a las 05:00 sí o sí |

### Carga de V2 (Juan Pablo) después de los pedidos de JP

Antes: #11 (0,5 h) + #13 (1–2 h) + #14 (0,25 h) + su parte del video #4 = 1,75–2,75 h más el video.
Ahora: #16 catálogos (1 h, absorbe #11) + #13 parpadeo 2MASS/AllWISE (1–2 h) + #18 acordeón (3 h) = **5–6 h**,
más la parte del video. Caben en las 11,5 h que quedan hasta las 05:00, pero Juan Pablo además coordina el frente.
Por eso:

- **Orden de V2:** #16 → #13 → #18. El parpadeo #13 va antes que el acordeón porque es lo que hace visible el
  movimiento de WISE 0855, el objeto obligatorio; el acordeón mejora una sugerencia que ya está cubierta.
- **Se mueve:** #14 (enlace a WiseView) pasa a V1 Antonia. En el video #4, Javiera lo arma y Juan Pablo solo lo revisa
  (~0,5 h).
- **Se recorta si aprieta:** #18 entero (queda el deslizador). Ninguna tarea de prioridad 1 depende de V2 salvo #16 y el video.

### Datos de otros instrumentos: qué conviene sumar

Datos que verificó hoy el orquestador del frente V2 (no los volví a medir; la búsqueda de origen la verificó en
parte). Las imágenes de la herramienta siguen siendo solo de SPHEREx; esto es un extra.

**Regla que obliga a todos:** los términos de Space Apps (spaceappschallenge.org/legal) permiten datos de la NASA y
de sus agencias socias (en 2026, entre otras: ESA, CSA, JAXA, ISRO, ASI, UKSA y CONAE; el CNES no está). Los de
terceros (ZTF, PanSTARRS, AAVSO, unWISE) se pueden usar si son públicos, pero **hay que citar todas las fuentes, o
la NASA puede quitar el premio**. Hoy eso ya incluye Gaia DR3 (ESA), CatWISE2020 y SIMBAD (CDS): van en el README
y en el formulario (tarea #12).

| # | Qué | Por qué rinde | Dueño | Horas | Decisión |
|---|---|---|---|---|---|
| 13 | **Parpadeo «hace 25 años contra hoy» en Aladin** con los HiPS de 2MASS (1997–2001) y AllWISE W2 (2010) que sirve IRSA: `https://irsa.ipac.caltech.edu/data/hips/CDS/2MASS/Color` y `.../CDS/AllWISE/W2` (respondieron 200 con CORS abierto) | Barnard se mueve ~265″ y WISE 0855 ~122″ desde 2010: **el movimiento se ve a simple vista**, justo en el objeto obligatorio que SPHEREx muestra débil. Cubre la sugerencia de superponer WISE | V2 Juan Pablo | 1–2 | **Prioridad 2, la más rentable de esta tabla.** Si no está a las 05:00, se apaga |
| 14 | Enlace a WiseView con las coordenadas (`http://byw.tools/wiseview#ra=..&dec=..`) | Herramienta de referencia del campo (ver `biblio/fichas/wiseview-el-precedente.md`); solo es un enlace | **V1 Antonia** (se le saca a V2, ver abajo) | 0,25 | Prioridad 2 |
| 15 | Curva de brillo ZTF de R Dra (828 puntos; sin CORS, hay que pasarla a un JSON estático) | Llena el hueco de las variables: hoy no hay curva de brillo | C Mauricio o D2 Bryan, solo si las tareas 1–3 ya están | 1–3 | Opcional; si se hace, citar ZTF |
| — | Espectro JWST NIRSpec PRISM de WISE 0855 (MAST, Luhman et al. 2024; sin CORS) | Bonito sobre el espectro de SPHEREx | — | 2–3 | **Se recorta**: depende de `/api/spectrum`, que también se recorta |
| — | NEOSSat de la CSA (recurso socio oficial; 641 observaciones de Barnard, 2018–2019) | Es el recurso socio del desafío | — | alto | **Se recorta**: bajar los archivos falló dos veces. Se puede nombrar en el pitch como siguiente paso |
| — | unWISE y PanSTARRS en HiPS, imágenes NEOWISE por época | — | — | — | **Descartado hoy**: solo están en el CDS (caído) o IRSA respondió 502 |

### Se recorta (no se empieza)

`/api/spectrum` en el servidor (el plazo de las 04:00 de `docs/pedidos` se adelanta: queda fuera ya) · suma de
todas las visitas de un detector · recuadro «Contaminación» · traducción a 5 idiomas y sección educativa · Spherix
con un modelo de lenguaje · conectar `BlinkPanel` al backend oficial · espectro JWST y NEOSSat · sumar los canales elegidos en el acordeón · sonido del Prisma. Pueden ir al pitch
como «siguiente paso».

---

## (e) El desorden concreto y cómo ordenarlo sin reescribir

### 1. Dos backends con la misma lógica, y producción usa el prototipo

- `prototipos/rango_fechas/` (Bryan; `spherex.py`, 780 líneas) se publica en `spherex-prototipo-d2.vercel.app` y
  se llega a él por `/proto-api` (`vercel.json`). **De él dependen el explorador, el Prisma y el Modo Misión**
  (`explorador/useDatosSpherex.ts:10`, `mision/Comparador.tsx:10`).
- `scaffold/backend/app/frames/` (el «oficial», también de Bryan) se publica en `spherex-api.vercel.app` y responde
  `/api/frames`, pero su único cliente, `blink/BlinkPanel.tsx`, **no se importa en ninguna parte**.
- **Propuesta:** hasta el cierre, el prototipo es el backend de la demo. El oficial se congela sin borrarlo. Una
  línea en `README.md` y en `docs/03` lo deja dicho. Unificarlos queda para después del hackatón.

### 2. El contrato escrito no es el que corre

`docs/03` dice `from`/`to`; lo que corre usa `start`/`end`, `/grid`, `/frame`, `visit` y `per_visit`. **Propuesta:**
escribir en `docs/03` lo que corre como contrato vigente y no renombrar nada antes del cierre.

### 3. La revisión científica no llegó a `main`

El PR #18 se fusionó antes de que se agregaran tres commits a `n/pedidos-v2`: la revisión de Mauricio (niveles de la
misión, cómo se ve WISE 0855, igualación de las variables) **solo existe en esa rama**. **Propuesta:** que JP decida
si se fusiona o se le manda el texto a Mauricio directamente; es lo que necesita para la tarea #3.

### 4. Ramas sin fusionar y gente fuera de su rol

| Rama | Quién | Qué trae | Propuesta |
|---|---|---|---|
| `v/v2-clic-visor` | Juan Pablo | 8 líneas en `Visor.tsx` (archivo de Antonia) | Antonia decide (tarea #10) |
| `n/pedidos-v2` | Juan Pablo | 3 commits con la revisión científica | Ver punto 3 |
| `v/wise0855-movimiento` | Juan Pablo | `docs/hallazgos/2026-11-14_wise0855_movimiento.md`: cómo se ve el movimiento de WISE 0855 en SPHEREx, con medición | Fusionar antes de la tarea #1: es la configuración de la demo |
| `d/educacion-preliminar` | Vladimir | 5 archivos en `docs/educacion/` | Fuera de alcance; no se fusiona antes del cierre |
| `d/i18n-documentacion` | Vladimir | 251 archivos, 31.040 líneas: traducción a 5 idiomas | Fuera de alcance; no se fusiona antes del cierre |

Lo más importante de esta tabla: **D1 (Vladimir) está traduciendo documentación mientras la tarea de su rol que la
demo necesita, precalcular los 5 campos, no la hace nadie.** Y **C (Mauricio)**, que debía verificar, escribió el
explorador portado, el Prisma y el Modo Misión: nadie quedó revisando lo que se fusiona.

### 5. Documentos que se contradicen con lo que hay

| Dónde | Qué dice | Qué es cierto |
|---|---|---|
| `docs/06_JURADO_Y_PITCH.md:71` | Demo: «escribir `WISE 0855`, nombre, no coordenadas» | No hay caja de búsqueda por nombre; solo botones y el chat de Spherix |
| `docs/06:77-79` y `docs/10_REPARTO_DE_TRABAJO.md:105,124` | CatWISE «pendiente de PR» | Fusionado (PR #11) y en producción |
| `docs/10:20,124` | eps Ind B es donde el movimiento se ve más claro | En producción, con 1 exposición por visita, no se ve claro (ver b) |
| `docs/REVISION_DOCUMENTACION_2026-11-14.md:36,103` | El pie no trae la atribución literal | Ya la trae (visto en producción) |
| `README.md` §3 | D2 entrega `/api/spectrum` y «Contaminación»; V2 el gráfico de bandas | Recortados en (d) |
| `scaffold/frontend/src/content/mision.ts:78,94` | «Bryan midió 1,30–1,32 px» y `verificado: true` en WISE 0855 | La revisión no lo reproduce con lo que usa el Comparador |
| `Visor.tsx:83` | «canal central» | Se muestra igual aunque se mueva el deslizador de λ |

### 6. Huecos sin dueño

Precálculo y caché para la demo · video de respaldo · quién maneja la demo en vivo y en qué computador · revisión
científica de lo que se fusiona desde ahora · dueño claro del explorador (lo portó Mauricio y lo tocó Antonia; los
pedidos lo tratan como archivo de Mauricio).

### Propuesta para ordenar (sin reescrituras)

1. **Este documento, sección (d), es la lista única hasta el cierre.** Lo que no está ahí no se hace.
2. **`main` es lo que se muestra.** Desde ahora solo entran PR de las tareas de (d), revisados por C.
3. **Una sola persona es dueña de la demo** (propuesta: Javiera con Juan Pablo) y decide la configuración de cada objeto.
4. **Corte a las 05:00:** se apaga lo que no esté listo (botón escondido, nivel escondido) en vez de dejarlo a medias.
5. **Ramas fuera de alcance** (`d/i18n-documentacion`, `d/educacion-preliminar`) quedan como están, sin borrarlas.

---

## (f) Qué NO comprobé

- eps Ind B, Barnard y las variables con más de 1 exposición por visita; R Dra en otras bandas que no sean B4.
- El móvil, la carga dentro de un iframe, la landing y Spherix.
- El Modo Misión más allá de la pantalla 1 de 3 (los fallos de sus niveles vienen de la revisión científica, no los volví a medir).
- Si el parámetro `band` de la URL cambia la banda visible del explorador.
- Los tiempos de carga en frío contra en caliente, ni si la caché del prototipo sobrevive entre llamadas en Vercel
  (`spherex.py:65` escribe en `data/cache/prototipo`; en Vercel eso depende de la variable `SPHEREX_CACHE`).
- Los formularios de la plataforma de entrega.
- Las horas de la sección (d) son estimaciones, no mediciones.
