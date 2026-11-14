# Pedidos del frente V2 (visor del cielo) · 14-nov-2026, tarde

De: Juan Pablo (V2). Para: **Antonia (V1)** y **Bryan (D2)**.
Cierre de entregas: domingo 15 a las 11:00.

Estos pedidos salen de cruzar las sugerencias de la organización («Potential Considerations» del desafío)
con lo que hay en `main` (hasta el PR #17). Cada uno trae el mensaje para la persona y, debajo, el detalle
para su agente: archivos, líneas y qué se comprobó.

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
