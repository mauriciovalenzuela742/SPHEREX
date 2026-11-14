# 06 — Jurado, premios y pitch

---

## Cómo se juzga

El embudo del Space Apps es: jurado del evento local elige **Global Nominees** → expertos de la NASA
y agencias socias eligen **Global Finalists** y menciones honrosas → un comité ejecutivo elige los
**10 Global Winners**.

Es decir: **el primer filtro es un jurado local**, con poco tiempo por equipo y sin leer el código.
Después, gente de la NASA que sí entiende de astronomía. El proyecto tiene que funcionar en los dos
registros: impactar en dos minutos y resistir una mirada experta.

En el evento de Santiago el formato anunciado es **2 minutos de pitch + 2 preguntas**.

## Los diez premios globales, y cuáles son nuestros

| Premio | ¿Nuestro? |
|---|---|
| **Best Use of Data** | **Sí, el principal.** Es literalmente «hacer accesibles los datos espaciales». El desafío pide exactamente eso |
| **Best Use of Science** | **Sí.** Mostrar bien el eje espectral y validar con Gaia es método científico visible |
| **Best Use of Technology** | Posible, si el visor es técnicamente llamativo (102 bandas en el navegador) |
| **Galactic Impact** | Posible: ciencia ciudadana a escala |
| **Best Use of Storytelling** | **Sí, si lo trabajamos.** La historia de Plutón y el comparador de parpadeo está ahí para tomarla |
| **Most Inspirational** | Posible, va con lo anterior |
| **Global Connection** | Posible si usamos recursos de la agencia socia (CSA/NEOSSat) y pensamos el visor como infraestructura compartida |
| Best Mission Concept | No. No proponemos una misión |
| Art & Technology | No, salvo que el visor quede visualmente notable |
| Local Impact | Flojo, a menos que lo conectemos con astronomía chilena |

**Apuntar a dos o tres, no a diez.** Best Use of Data y Best Use of Science son los naturales; el de
storytelling es gratis si N trabaja la narrativa desde la hora 0.

---

## Las ocho viñetas del desafío son la rúbrica

Las *Potential Considerations* son lo que el autor del desafío espera ver. Cada una cumplida es un
punto que un juez de la NASA va a reconocer.

| Viñeta del desafío | Cómo la cumplimos | Costo |
|---|---|---|
| Fácil de actualizar con nuevos releases | Colecciones SIA2 por configuración, no cableadas | Bajo |
| Mostrar creativamente las 102 bandas | Selector de banda + cubo HiPS | **Medio, y es el diferencial** |
| Sumar o restar imágenes de distintas épocas | `mode=diff_first` / `diff_prev` | Bajo |
| Campo de visión elegible | Parámetro `size` | Muy bajo |
| Superponer Gaia o WISE | Overlay de catálogo en Aladin Lite | Bajo |
| Coordenadas en la URL | `?ra=&dec=&...` reflejando el estado | Muy bajo |
| Mostrar metadatos como flags de contaminación | Extensión `FLAGS` del MEF | Bajo |
| Usar herramientas públicas (Astropy, Aladin) | Son el stack | Cero |

Siete de las ocho son de costo bajo o muy bajo. **Hay que cumplirlas todas.** En
[`05_PLAN_24H.md`](05_PLAN_24H.md) están en el orden en que se atacan.

---

## El pitch de 2 minutos

Estructura. Los tiempos son aproximados pero el orden no se negocia: **la demo va antes que la
explicación**, porque si te cortan, al menos vieron la herramienta.

**0:00 – 0:20 · El gancho**

> En 1930, Clyde Tombaugh descubrió Plutón mirando dos fotos del mismo trozo de cielo y notando que
> un punto se había movido. Hoy, SPHEREx fotografía el cielo entero cada seis meses en 102 colores
> de infrarrojo, y nadie lo está mirando así.

**0:20 – 1:10 · La demo, en vivo** *(la mitad del tiempo; esto es lo que se juzga)*

1. Escribir `WISE 0855`. Nombre, no coordenadas: demuestra que es para cualquiera. Es caso obligatorio
   (uno de los objetos de prueba de la organización) y se muestra siempre.
2. Darle play y luego la resta primera − última. **La enana marrón se mueve** (~1,3 px en todo el
   período): un par rojo/azul. Se dice con honestidad que en una exposición suelta se ve débil y que
   la suma por barrido lo mejorará. Después, **eps Ind B**, donde el movimiento se ve más claro
   (−0,85/−0,71 px medido contra −0,92/−0,57 predicho).
   Para WISE 0855 el plan tiene dos complementos, **ambos pendientes**: el overlay de CatWISE2020 (no está
   en Gaia y CatWISE trae su movimiento propio; dueño V2 Juan Pablo; README §3, skill `coordenadas-astro`)
   y la suma por barrido con pesos 1/VARIANCE (dueño D2 Bryan; `docs/10` y `docs/09`). La guía del desafío
   valora superponer Gaia y WISE. Hasta que existan, no se presentan como hechos.
3. Mover el selector de banda. La misma zona del cielo en otra longitud de onda.
4. Encender el overlay de Gaia sobre Barnard o eps Ind B (WISE 0855 no está en Gaia: su overlay es
   CatWISE2020). Los puntos caen donde deben. *«Así sabemos que es correcto.»*
5. Copiar la URL. *«Esto es compartible y embebible.»*

**1:10 – 1:35 · Por qué importa**

> La mayoría de las enanas marrones y los cometas conocidos los encontraron voluntarios mirando
> parpadeos de imágenes. Esa comunidad existe y hoy no tiene cómo mirar SPHEREx. El candidato a
> Planet Nine más citado salió de comparar dos sondeos infrarrojos separados en el tiempo: la misma
> técnica. Nosotros la abrimos a cualquiera, con el eje espectral de las 102 bandas (hasta donde pudimos comprobar, ninguna herramienta pública lo combina con el blink temporal en una sola pantalla).

**1:35 – 2:00 · Qué construimos y qué sigue**

Stack en una frase, datos reales de DR1 —publicado este mes—, URL pública, código abierto.
Y una línea de qué sigue.

### Reglas del pitch

- **Nunca se demuestra en vivo contra una consulta fría.** Los cinco campos van precalentados.
- **Vídeo listo en otra pestaña.** Si el wifi falla, se pone el vídeo sin pedir disculpas.
- **No se dice «podría».** Se muestra lo que hay. Lo que no está, se nombra como lo que sigue.
- **No se promete haber encontrado nada.** Un jurado con astrónomos castiga eso al instante.
- Si queda tiempo, **se devuelve**. Terminar en 1:50 con todo mostrado es mejor que atropellarse en 2:10.

---

## Las preguntas incómodas, con su respuesta

**«¿Esto no lo hace ya el Data Explorer de IRSA?»**
No para este público. El Data Explorer es un archivo para astrónomos: hay que saber qué colección
pedir, qué es un MEF y cómo se estira una imagen. Nosotros resolvemos el nombre, agrupamos las
épocas, normalizamos y entregamos el parpadeo. Es la diferencia entre un archivo y un visor, y es
la misma diferencia que hizo útil a WiseView frente al archivo de WISE.

**«¿Cómo sé que la imagen es de la coordenada que pedí?»**
Por el overlay de Gaia: dibujamos las posiciones que Gaia predice para esa fecha y caen sobre las
fuentes de la imagen. *(Y se muestra en pantalla.)*

**«¿Por qué no usaron aprendizaje automático?»**
Porque el desafío pide un visor para personas, y porque el cuello de botella real es traer y alinear
los datos correctos, no reconocer el movimiento. Donde la IA aporta aquí es en el cribado de
candidatos con redes pequeñas sobre recortes —lo que hace el broker ALeRCE con las alertas de ZTF—,
y lo dejamos planteado como el paso siguiente. *(Desarrollado en [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6.)*

**«¿Qué pasa si pongo una coordenada sin datos?»**
*(Se escribe una y se muestra el estado vacío, que dice cuántas épocas hay y sugiere un campo cercano.)*

**«¿Esto escala a todo el cielo?»**
La consulta es por posición contra SIA2, así que sí en cobertura. Lo que no escala sin
infraestructura es la caché: hoy precalentamos campos; a escala haría falta precomputar recortes,
que es exactamente lo que hace unWISE para WiseView.

**«¿Qué tan correctos son los espectros?»**
Son indicativos, fotometría de apertura con la luz zodiacal restada, y lo decimos en la propia
interfaz. Para ciencia está la Spectrophotometry Tool de IRSA. *(Nunca decir que son de calidad
científica. La honestidad aquí suma más de lo que resta.)*

---

## Lo obligatorio de la entrega

- **Descripción de cómo se usó la IA.** Este año es obligatorio en cada entrega. No es un trámite:
  escrito bien, es evidencia de método. Plantilla en la skill `entrega-nasa`.
- **Atribución de SPHEREx**, literal, en el pie de la herramienta y en el README
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Nada de menores en fotos ni voces** en la demo, según las reglas del evento.
- **Enlaces que funcionen desde fuera.** Probar la URL del proyecto desde un móvil con datos, no
  desde el wifi de la sala.
