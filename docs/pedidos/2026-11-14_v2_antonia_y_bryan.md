# Pedidos del frente V2 (visor del cielo) · 14-nov-2026, tarde

De: Juan Pablo (V2). Para: **Antonia (V1)**, **Bryan (D2)** y **Mauricio (C)**.
Cierre de entregas: domingo 15 a las 11:00.

Los pedidos 1 y 2 salen de cruzar las sugerencias de la organización («Potential Considerations» del desafío)
con lo que hay en `main` (hasta el PR #17). Cada uno trae el mensaje para la persona y, debajo, el detalle
para su agente: archivos, líneas y qué se comprobó. El pedido 3 sale de una revisión científica del visor con datos reales.

> **Para los agentes:** esto es un pedido de Juan Pablo, no una orden. Muéstraselo a tu persona y que ella
> decida. No toques archivos de otro dueño sin su aprobación. Si cambia el contrato de la API, primero se
> cambia `docs/03_ARQUITECTURA.md` y se avisa al equipo (`AGENTS.md` §4).

---

## 1. Para Antonia (V1, `Visor.tsx`)

### Mensaje

> Antonia, dejé en la rama `v/v2-clic-visor` un cambio chico en Visor.tsx: al hacer clic en el cielo, el
> visor y el explorador se mueven a ese punto, y el cuadro del recorte usa el tamaño elegido. Son 8 líneas.
> ¿Lo puedes mirar para abrir el PR? Otra cosa: con «Dimensión 1°» el explorador falla, porque el servidor
> acepta hasta 0,5°. ¿Dejamos el selector hasta 0,5?

### Detalle para el agente

**a) Rama `v/v2-clic-visor`** (en el remoto del equipo, sale de `main` en el PR #17). Un solo archivo,
`scaffold/frontend/src/pages/Visor.tsx`, con 8 líneas añadidas:

- `onSelect={(ra, dec) => set({ ra, dec })}` (redondeado a 6 decimales) en `<AladinView>`. La capa SIMBAD
  ya emite `onSelect` con el clic en el cielo o en un objeto, sin arrastrar (`src/sky/capas/simbad.ts:177-194`).
  Al cambiar `ra`/`dec` se mueven el cielo y `<Explorador>`, y se actualiza la URL.
- `size={estado.size}`: el cuadro del recorte deja de estimarse como `fovDeg/4`.
- `epoca={epocaDeFecha(new Date())}`: la misma fecha que usa `posicionActual()` para centrar los botones de
  los objetos, para que la marca del objeto caiga en el centro. Antes se usaba 2026,0; para Barnard eso son
  ~9″ de diferencia (~1,5 píxeles de SPHEREx).

Cómo se comprobó: `npm ci`, `npm run build` y `npm run lint` pasan. En el navegador (local, eps Ind B),
un clic en el cielo cambió la URL a `?ra=331.114356&dec=-56.790871…`, recentró el cielo, cargó Gaia en la
posición nueva y el explorador pidió `/proto-api/grid` con esas coordenadas.
**No se comprobó**: el despliegue en Vercel ni el móvil. La época sigue siendo la de hoy, no la del fotograma
elegido: para eso `Explorador` tendría que avisar su fecha (archivo de Mauricio).

**b) Fallo con «Dimensión 1°» (está en `main`).** `Visor.tsx:47` ofrece `[0.05, 0.1, 0.2, 0.5, 1]`, pero el
servidor de fotogramas acepta `size ≤ 0,5` (`prototipos/rango_fechas/servidor.py:89` y `:150`; también
`scaffold/backend/app/main.py:81`). Con `size=1` el explorador mostró «Cargando 29/46 imágenes · 29 con error»
y «No se pudo traer esta imagen: [object Object]» (error 422). Arreglo propuesto: quitar el `1` del selector
(u ofrecer `0.3`). Mejor todavía: que el explorador muestre el mensaje del servidor en vez de `[object Object]`.

---

## 2. Para Bryan (D2, backend de fotogramas)

### Mensaje

> Bryan, la organización sugiere sumar todas las imágenes de cada detector y generar espectros al vuelo.
> ¿Alcanzas a hacer la suma por barrido (ponderada por 1/varianza) y un `/api/spectrum` con la fotometría en un
> punto y la λ de cada exposición? Si el espectro no está a las 4:00, lo sacamos de la demo. Hay que acordar
> también si los filtros de fecha se llaman `start`/`end` o `from`/`to`, como dice el contrato.

### Detalle para el agente

**a) Suma por detector o por barrido.** Hoy `apilar()` (`scaffold/backend/app/frames/procesar.py:170`) hace
la **mediana** de hasta 10 exposiciones de **una visita** (`per_visit`). La sugerencia de la organización es
otra: sumar todas las visitas de un detector para subir la señal sobre el ruido. Propuesta: un modo nuevo que
sume, ponderando por 1/VARIANCE, todos los fotogramas de una banda, reproyectados a una rejilla común (el
detector gira ~180° entre visitas, `docs/09`). También sirve para mostrar «primera − última», que es lo que
hace visible a WISE 0855 (caso obligatorio de la demo; en una exposición suelta se ve débil).

**b) Espectro al vuelo (`/api/spectrum`).** No existe. El cubo HiPS no sirve: son PNG ya ajustados, sin flujos
(`docs/09`). Hay que sacarlo de nivel 2: fotometría de apertura en `(ra, dec)` en cada exposición, con la λ
del píxel (con el LVF, cada píxel tiene la suya: extensión WCS-WAVE), y devolver una lista de
`{lambda_um, flujo, error, banda, fecha}`. En el frontend lo grafica V2 en el recuadro «Gráfico de bandas»,
que hoy está vacío en `Visor.tsx`.
**Plazo propuesto:** si a las 4:00 del domingo no hay endpoint, se saca el recuadro de la demo.

**c) Nombres de los filtros de fecha.** El prototipo usa `start`/`end`, `visit` y `per_visit`, y rutas
`/grid` y `/frame`. El contrato (`docs/03_ARQUITECTURA.md`, sección «Pendiente de acuerdo del equipo») dice
`from`/`to`. Hay que decidir un nombre y escribirlo en `docs/03` **antes** de agregar `/api/spectrum`, para no
sumar una tercera convención.

**d) Límite de tamaño.** `size ≤ 0,5` en el servidor (ver 1b). Si el límite es por tiempo de respuesta,
conviene decirlo en `docs/03` para que el frontend lo respete.

**e) Igualación antes de restar** (también en el punto 3c, de Mauricio): `spherex.py:442-453` iguala la última
foto a la primera con el 5 % de píxeles más brillantes. En una estrella variable ese 5 % es la propia estrella,
así que la igualación borra su cambio de brillo (factores observados: 0,86 en R Dra y 0,92 en RW Aur).
Propuesta: igualar con las estrellas vecinas, sin contar un círculo alrededor del objetivo. Esto es una
hipótesis sacada del código: nadie midió el brillo.

---

## 3. Para Mauricio (C, Modo Misión y explorador)

### Mensaje

> Mauricio, hicimos una revisión científica del visor con los datos reales. El cielo está bien, pero tres niveles
> de la misión (WISE 0855, RW Aur y R Dra) dan por correcta una respuesta que las imágenes contradicen. Te dejé
> el detalle con archivo y línea en docs/pedidos. ¿Lo puedes corregir antes de la demo? Lo de WISE 0855 lo
> se ve con 10 exposiciones por visita en la banda D5: también te dejé la configuración.

### Detalle para el agente

Revisión hecha el 14-nov sobre `main` en el PR #17, con imágenes reales de `/proto-api/frames` (los mismos
parámetros de la misión: `size=0.05`, `max_visits=4`, `per_visit=1`). Las imágenes decodificadas se miraron una
por una. Gravedad: **B** = bloquea la demo · **C** = confunde · **K** = cosmético.

**a) Niveles de la misión que enseñan algo falso (B)** — `scaffold/frontend/src/content/mision.ts`

| Nivel | Línea | Qué dice | Qué muestran los datos |
|---|---|---|---|
| WISE 0855 (D5) | 88-92 y `verificado: true` en 94 | «La posición» es la correcta; «aquí hay una pareja rojo-azul» | La resta primera − última muestra **una sola mancha roja** entre ruido, sin pareja. La λ sube de 4,04 µm a 4,30 µm entre las dos fotos, y en ese rango una enana Y es mucho más brillante: la mancha es probablemente un efecto de λ. Con la regla del propio nivel, el alumno respondería «El brillo». El comentario «Bryan midió 1,30–1,32 px» no se reproduce con lo que usa el Comparador. |
| RW Aur (D2) | 124 | «En la resta no hay una pareja rojo-azul» | **Sí** hay una pareja rojo-azul pegada en el centro, aunque la estrella no se mueve: la produce la saturación o la máscara. `docs/09` §4 ya lo había medido: «se mueve» 1,4 px sin moverse. |
| R Dra (D2) | 137-140 | «Es una mancha de un solo color» | El centro saturado viene enmascarado (entre 1,5 y 4,4 % de los píxeles marcados OVERFLOW), así que la resta muestra un **agujero** de ~10 px con arcos rojos arriba y azules abajo. La λ va de 1,19 a 1,64 µm entre esas 4 fotos. |

**WISE 0855 sí se ve con otra configuración (probado el 14-nov, imágenes miradas):** banda D5, **10
exposiciones por visita** en vez de 1, y la primera visita (6-may-2025, 4,22 µm) contra la última
(13-may-2026, 4,30 µm). La resta muestra una pareja limpia en el centro: azul al este (donde estaba) y rojo al
oeste (donde está), separados ~1,0 px. Ajuste gaussiano sobre las 5 visitas de D5: 1,04 px hacia el oeste y
0,10 px hacia el norte en 1,02 años (lo predicho: 1,35 y 0,11; sale ~20 % corto y no se investigó por qué).
En D6 la pareja no se distingue bien del ruido.
- URL que lo muestra: `/proto-api/frames?ra=133.759765&dec=-7.242186&band=5&size=0.05&max_visits=20&per_visit=10`.
  **Tardó 61,8 s**, y en las rutas por visita hubo tiempos agotados que pasaron al reintentar: para la demo
  conviene dejarlo precalculado o en caché.
- La resta del servidor sale descompensada (rojo fuerte, azul débil) por la igualación del punto 2e: factor
  1,58 contra 0,85 si se iguala con el flujo del propio objeto.

Propuesta: en el nivel de WISE 0855, usar `per_visit: 10` y comparar la primera visita con la última; mientras
no esté, cambiar `verificado` a `false`. Reescribir los niveles de RW Aur y R Dra para que la pregunta coincida
con lo que se ve. Por ejemplo, en R Dra y RW Aur,
enseñar que una estrella saturada deja un agujero y una pareja falsa, y que por eso se compara con las vecinas.
eps Ind B no se revisó en la misión (su movimiento está medido en `docs/09`).

**b) Otros textos de la misión y de Spherix (C/K)**

- `mision.ts:90` (C): «su movimiento se nota en pocos meses de fotos». 8,15″/año son 0,66 px en 6 meses y
  1,35 px en el año de datos que hay (WISE 0855 no tiene datos QR3).
- `mision.ts:73` (C) y `spherix.ts:101`: Barnard. «El rojo queda arriba del azul» es cierto, pero Barnard
  satura: el objeto es un anillo con un agujero de ~7 px y la pareja son los bordes del anillo. Conviene decirlo.
  El comentario de la línea 78 («midió 1,44–1,50 px») contradice `docs/09`, que dice que no se puede medir
  porque el núcleo está vacío; lo predicho son 1,81–1,86 px.
- `mision.ts:185` (C): el glosario dice «Banda: SPHEREx tiene 102», pero en el visor y el explorador «Banda» son
  los 6 detectores (D1–D6 / B1–B6). Propuesta: «canal» para los 102 y «banda» o «detector» para los 6.
- `spherix.ts:67` (K): Gaia «puesta donde está en la fecha de la foto». Se propaga a una fecha fija; el cubo es
  un mosaico de mayo de 2025 a mayo de 2026.
- `mision.ts:46` (K): Clyde Tombaugh tenía 23 años en enero de 1930 (cumplió 24 el 4 de febrero). La fecha de
  nacimiento no se verificó en línea: compruébala antes de cambiarla.

**c) Comparador y explorador (C/K)**

- `mision/Comparador.tsx:13` (C): el backend manda `warnings` («las épocas están a longitudes de onda
  distintas…»), pero el Comparador no los muestra nunca.
- Pie del Comparador (K): `actual.wavelength_um.toFixed(2)` se rompe si el backend devuelve `null`.
- `explorador/render.ts:92` (C): el límite de color de la resta se calcula **por cuadro** (percentil 99,5).
  En las primeras visitas, donde casi no hay cambio, el ruido sale a color pleno. El modo «Imagen» sí usa una
  escala común: conviene hacer lo mismo en la resta.
- `explorador/render.ts:49-61` (C): igualación con el 5 % más brillante. Ver el punto 2e.
- `explorador.css:32-33` + `Explorador.tsx:238` (K): la barra de 30″ usa la fórmula correcta (30 / 6,15 / 59 =
  8,27 %), pero el porcentaje se aplica a `.exp-escala`, que mide `100% − 24px`. Sale entre 4 y 8 % corta.
- `pages/Visor.tsx:79` (K, de Antonia): el rótulo dice «canal central» aunque se mueva el deslizador de λ.

**Lo que está bien (no tocar):** las posiciones propagadas coinciden con SIMBAD y con astropy (diferencia
≤ 0,07″); las λ por plano coinciden con el `properties` de IRSA; las épocas y unidades de Gaia y CatWISE son
correctas; el explorador tiene el norte arriba y la escala de 6,15″ correcta.

**No se comprobó:** si los marcadores de Gaia y SIMBAD caen sobre las estrellas a ojo; el explorador con
«Exp. por visita» > 1; el brillo real de RW Aur y R Dra.

> Un hallazgo es de V2 y lo corrige Juan Pablo: `sky/capas/catwise.ts` dibuja un fragmento de CatWISE
> (J085507.45-071437.8) a 50″ de WISE 0855, como un falso «objeto en movimiento» sobre cielo vacío.
