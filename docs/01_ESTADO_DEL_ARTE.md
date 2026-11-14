# 01 — Estado del arte

Qué se ha hecho ya en lo que este desafío pide, qué funcionó, qué no, y dónde queda espacio para
algo nuevo en 24 horas. Las referencias completas, con enlaces, están en
[`../biblio/README.md`](../biblio/README.md); aquí van los nombres y el argumento.

---

## 1. El problema tiene cien años y la técnica no ha cambiado

Clyde Tombaugh descubrió Plutón en 1930 con un **comparador de parpadeo**: dos placas fotográficas
de la misma zona del cielo tomadas en fechas distintas, alternadas rápido. Lo que está quieto no se
mueve; lo que se desplaza, salta a la vista. El ojo humano es extraordinariamente bueno detectando
ese salto, incluso con mucho ruido de fondo.

Un siglo después la técnica es la misma, solo cambió el soporte. Y sigue siendo competitiva: en
proyectos de ciencia ciudadana como **Backyard Worlds: Planet 9** (Kuchner et al., 2017), cientos de
miles de voluntarios han encontrado enanas marrones y objetos de alto movimiento propio que los
algoritmos automáticos del survey habían dejado pasar, típicamente porque estaban en zonas de alta
densidad estelar, cerca de fuentes brillantes o con artefactos que confunden a un detector pero no
a una persona.

**Esto es la justificación del desafío**, y conviene decirlo en el pitch: no se pide un visor porque
sea más fácil que un detector automático, sino porque el ojo humano a escala de multitud resuelve
casos que el detector automático no.

---

## 2. Lo que ya existe y hay que conocer antes de escribir una línea

### WiseView — el modelo explícito del desafío

<http://byw.tools/wiseview> · Caselden, Westin et al., ASCL:1806.004

Herramienta de navegador que hace parpadear coadds de WISE sobre una base temporal de varios años.
El usuario entra coordenadas y ajusta estiramiento, mapa de color y velocidad de parpadeo. Nació
como un apaño de dos voluntarios de Backyard Worlds que querían clasificar mejor sus propios
candidatos, y terminó siendo la herramienta con la que se han hecho **cientos de descubrimientos**
de enanas marrones, por aficionados y por profesionales.

Lecciones que hay que copiar sin vergüenza:

- **Una caja de coordenadas y nada más** en la primera pantalla.
- **Los controles importan**: estiramiento, color y velocidad de parpadeo son lo que convierte un
  borrón en un descubrimiento. No son adornos.
- **Tiene API.** Hay paquetes de terceros —`flipbooks` y `unWISE-verse`, del proyecto Cool
  Neighbors— construidos encima de la API de WiseView para generar material y subirlo a Zooniverse.
  Una herramienta con URL consultable se vuelve infraestructura de otros proyectos. Esto es
  exactamente lo que pide la viñeta del desafío sobre incluir coordenadas en la URL.

Lo que WiseView **no** hace, y es nuestro hueco: no tiene eje espectral. WISE tiene cuatro bandas;
SPHEREx tiene 102.

### unWISE y los coadds

Lang (2014), Meisner et al. (coadds de cinco años), catálogo unWISE (Schlafly et al.).
WiseView no muestra exposiciones sueltas: muestra **coadds**, imágenes combinadas por épocas. Es la
razón de que se vean fuentes débiles. El catálogo **unTimely** (Meisner et al., 2022) llevó esto al
dominio temporal: un catálogo de todo el cielo resuelto en el tiempo a partir de los coadds.

`[Implicación]` Combinar antes de mostrar no es opcional si se quieren ver cosas débiles. En SPHEREx
el equivalente natural es sumar por detector o por rango de λ, que es justo lo que sugiere el desafío.

### Visores de cielo en el navegador

| Herramienta | Quién | Qué aporta |
|---|---|---|
| **Aladin Lite v3** | CDS, Estrasburgo | Visor HiPS en el navegador, embebible, con proyecciones, overlays de catálogos y teselas FITS. **Lo cita el propio desafío** |
| **Firefly** | IPAC/Caltech | El motor del Data Explorer de IRSA. El notebook oficial del cubo HiPS de SPHEREx lo usa |
| **Legacy Survey viewer** | NOIRLab | Otro visor de cielo que sirve los coadds de unWISE |
| **ESASky** | ESA | Visor multimisión, buen ejemplo de UX de capas temporales |
| **JS9** | SAO | DS9 en el navegador: manipulación de FITS del lado del cliente |

**Aladin Lite es la decisión por defecto** y conviene no discutirla: resuelve la navegación por el
cielo, las proyecciones, los overlays de Gaia y el zoom, que son semanas de trabajo. El formato
**HiPS** (Fernique et al., 2015) es lo que consume, y permite animar un cubo plano a plano.

El dato que cierra el argumento: el **cubo de todo el cielo de SPHEREx DR1 se publica como HiPS**
(ver [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)). Hay un camino directo del archivo de la NASA al
navegador sin backend.

---

## 3. Detección automática de objetos en movimiento

No es lo que pide el desafío, pero es lo que un jurado con astrónomos va a preguntar. Hay que poder
responder en una frase por qué no lo hicimos (o cómo lo hicimos encima del visor).

### Shift-and-stack: KBMOD

Whidden et al. (2019) y el equipo de LINCC Frameworks. La idea: un objeto que se mueve despacio es
invisible en una sola imagen, pero si uno **desplaza** cada imagen según una velocidad candidata y
luego las **apila**, el objeto se suma coherentemente y el ruido no. KBMOD hace esto en GPU y puede
explorar del orden de 10¹⁰ trayectorias candidatas por minuto.

Resultados reales: el survey **DEEP** (DECam Ecliptic Exploration Project) identificó con KBMOD
105 objetos transneptunianos nuevos; el New Horizons Subaru TNO Survey lo usó para pasar de días por
chip a horas. Existe además trabajo reciente de clasificación con aprendizaje automático de los
candidatos que produce (Smotherman et al., 2024), porque un umbral bajo genera miles de falsos
positivos por CCD.

`[Implicación]` Shift-and-stack es el estado del arte para "encontrar lo que ni se ve". Es también
caro, y SPHEREx tiene una cadencia y un muestreo espectral que no se parecen a los de DECam.
**Para 24 horas, mencionarlo como trabajo futuro es más honesto que intentarlo.** Si se quiere una
pizca, una resta de imágenes entre dos épocas (que el desafío sugiere explícitamente) es el 5 % del
esfuerzo y el 60 % del efecto visual.

### Enlazado de detecciones: HelioLinC y la familia

El otro enfoque: detectar fuentes en cada imagen y luego **enlazar** las detecciones que son
compatibles con una órbita. Es el camino que seguirá Rubin/LSST. Más barato que shift-and-stack,
pero necesita que el objeto se vea en imágenes individuales.

### Brokers de alertas: ALeRCE

Este es terreno propio: **ALeRCE** (Förster et al., 2021) es el broker chileno que procesa el flujo
de alertas de ZTF y se prepara para LSST. Dos clasificadores:

- **Stamp classifier** (Carrasco-Davis et al.): una red convolucional sobre los recortes de ciencia,
  referencia y diferencia de la *primera* detección, diseñada para explotar la invarianza rotacional.
  Clasifica con una sola imagen.
- **Light curve classifier** (Sánchez-Sáez et al.): random forest balanceado, en dos niveles, sobre
  rasgos de variabilidad y colores.

Han clasificado del orden de 10⁷ objetos a partir de ~10⁸ alertas.

`[Implicación — y es importante para este equipo]` El laboratorio tiene gente que construyó esto. Un
jurado lo nota. Pero el aporte diferencial no es meter un clasificador en el visor: es la **disciplina
de clasificación en tiempo real** —umbrales, falsos positivos, cómo se le presenta a un humano un
candidato dudoso, cómo se recoge la etiqueta que da esa persona. Esa disciplina aplicada a la UI del
visor es algo que ningún otro equipo del hackatón va a tener. Ver
[`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md).

---

## 4. Ciencia ciudadana: qué hace que funcione

Backyard Worlds, Cool Neighbors y Zooniverse llevan años de aprendizaje sobre esto, y el desafío
apunta explícitamente a ese público.

Lo que la experiencia muestra:

- **La tarea tiene que ser una sola y decidible en segundos.** «¿Se mueve algo aquí, sí o no?»
  No «clasifique esta fuente».
- **Hay que poder empezar sin registrarse ni leer nada.** Un ejemplo precargado en la pantalla
  inicial vale más que un tutorial.
- **La trazabilidad es el premio.** Que el voluntario pueda señalar algo, guardarlo y volver a
  mostrarlo —con una URL— es lo que convierte curiosidad en descubrimiento.
- **Los descubrimientos se publican con los nombres de los voluntarios.** No es detalle menor: es
  el motor de la participación.

`[Implicación]` Tres decisiones de producto salen de aquí: ejemplo precargado al abrir, resolución
de nombres («Barnard's Star», no solo números) y **URL compartible con las coordenadas**, que además
es una viñeta explícita del desafío.

---

## 5. Planet X: en qué está la búsqueda hoy

El desafío se llama «Planet X and SPHEREx» pero no pide buscar Planet X. Conviene igual saber el
estado real para no decir una tontería ante un jurado.

- La hipótesis moderna es de **Batygin & Brown (2016)**, *Evidence for a Distant Giant Planet in the
  Solar System* (AJ 151, 22; arXiv:1601.05438): el agrupamiento orbital de objetos transneptunianos
  distantes se explicaría con un planeta de ≳10 masas terrestres en órbita excéntrica lejana.
- **No se ha encontrado.** A noviembre de 2026 sigue sin confirmarse.
- El candidato más citado es el de **Phan et al.**, que cruzó los sondeos infrarrojos **IRAS** y
  **AKARI**, separados por 23 años, y encontró un único objeto compatible. Publicado en PASA. Los
  propios autores subrayan que no han descubierto Planet Nine; hace falta seguimiento.
- Hay búsquedas ópticas dirigidas por paralaje recientes que no encontraron candidatos creíbles en
  el campo cubierto, y trabajo de 2026 que estrecha el espacio de órbitas permitido.

`[Implicación]` El marco honesto para el pitch: **la técnica que encontró el candidato de Phan es
exactamente la del desafío** —comparar dos sondeos infrarrojos de todo el cielo separados en el
tiempo y buscar lo que se movió—. SPHEREx hace eso cada seis meses, en 102 bandas, y nadie lo ha
revisado a ojo. Esa frase es verdadera, es verificable, y es mejor gancho que cualquier promesa de
encontrar un planeta.

---

## 6. Modelos de video (TimeSformer, VideoMAE, X-CLIP): dónde encajan de verdad

Fueron una recomendación inicial del entorno del equipo y merecen una respuesta clara.

Qué son: arquitecturas para **entender video natural**. **TimeSformer** (Bertasius et al., ICML 2021;
arXiv:2102.05095) y **ViViT** (Arnab et al., ICCV 2021; arXiv:2103.15691) aplican atención separada
en espacio y tiempo sobre parches de fotogramas. **VideoMAE** (Tong et al.; arXiv:2203.12602) y
**VideoMAE V2** (arXiv:2303.16727) preentrenan con autoencoders enmascarados y enmascaramiento muy
agresivo, lo que los hace eficientes en datos. **X-CLIP** (Ni et al.; arXiv:2208.02816) extiende CLIP
al video para reconocimiento con descripciones en lenguaje.

Por qué **no** son el núcleo de este proyecto:

1. **El desafío pide un visor, no un clasificador.** El que detecta es el usuario. Un modelo de video
   no responde al enunciado.
2. **Están preentrenados con video natural** (Kinetics, Something-Something): personas, objetos,
   acciones. La estadística de una secuencia astronómica —fondo casi vacío, fuentes puntuales, PSF,
   artefactos, un desplazamiento de pocos píxeles— no se parece en nada. El preentrenamiento, que es
   todo su valor, no transfiere bien.
3. **No hay etiquetas.** Entrenar o ajustar en 24 horas sin un conjunto etiquetado no es realista.
4. **El caso ya está bien resuelto por métodos clásicos.** Shift-and-stack y la resta de imágenes
   aprovechan la física del problema (una trayectoria lineal, un fondo estático). Un transformer de
   video tendría que aprender eso desde cero, con menos datos.

Dónde **sí** podrían encajar, si sobrara tiempo, y vale la pena saberlo para responder al jurado:

- Como **cribado de candidatos** sobre pilas de recortes ya alineadas: un clasificador pequeño
  entrenado con positivos sintéticos (fuentes inyectadas con movimiento conocido) y negativos reales.
  Aquí el paralelo correcto no es TimeSformer, es el **stamp classifier de ALeRCE**: una red chica,
  sobre recortes, con invarianzas elegidas a mano. Más barata, más explicable y con gente del
  laboratorio que la conoce.
- Como **embedding** para buscar «más secuencias parecidas a esta», que es una idea bonita de UI.

**Resumen para el pitch, si preguntan:** «Lo evaluamos. El cuello de botella del desafío no es
reconocer el movimiento en un video, es traer y alinear los datos correctos y ponerlos delante de una
persona. Donde la IA aporta aquí es en el cribado de candidatos con redes pequeñas sobre recortes,
que es lo que hace el broker ALeRCE, y lo dejamos planteado.» Esa respuesta es más fuerte que haber
metido un modelo que no aporta.

---

## 7. Dónde está el hueco

Juntando todo, lo que **no existe hoy** y cabe en 24 horas:

> Un visor público donde el usuario entra una coordenada y ve **dos ejes a la vez**: cómo cambia esa
> zona del cielo **en el tiempo** (el blink de toda la vida, que es lo que pide el desafío) y cómo se
> ve **en cada una de las 102 longitudes de onda** (el eje que WiseView no tiene y que solo SPHEREx
> puede dar), con el espectro de lo que uno señale generado al vuelo.

Eso es a la vez:

- La lectura literal del enunciado (el visor con el videíto).
- Las dos viñetas más exigentes de *Potential Considerations* (las 102 bandas y los espectros al vuelo).
- Algo que, hasta donde hemos podido comprobar, ninguna herramienta pública hace hoy para SPHEREx:
  el Data Explorer de IRSA es para astrónomos, y WiseView es de otra misión y sin eje espectral.

El resto de las viñetas —resta de imágenes, campo de visión ajustable, overlays de Gaia y WISE, URL
consultable, flags de contaminación— son extras de costo bajo que se van sumando en orden de valor.
El orden está en [`05_PLAN_24H.md`](05_PLAN_24H.md).

---

## 8. Honestidad sobre este documento

Lo escrito aquí se apoya en búsquedas y en la documentación oficial de IRSA consultada el 14 de
noviembre de 2026. Los datos de archivo (endpoints, releases, estructura de archivos) están
verificados contra la documentación. Las referencias bibliográficas tienen su estado de verificación
marcado una por una en [`../biblio/README.md`](../biblio/README.md): **no cites de aquí sin mirar
allá**. Las afirmaciones sobre qué no existe («ninguna herramienta pública hace hoy…») son nuestras
y están limitadas por lo que buscamos; si alguien encuentra lo contrario, se corrige el documento.
