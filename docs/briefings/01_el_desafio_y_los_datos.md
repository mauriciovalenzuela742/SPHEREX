# Audio 1 de 2 — SPHEREx: el desafío y los datos

Material de preparación para Juan Pablo, camino al NASA Space Apps Challenge 2026, donde su equipo
de cuatro personas del laboratorio de astronomía va a tomar el desafío **Planet X and SPHEREx**.

Este es el primero de dos audios. Este cubre **qué pide el desafío y con qué datos se trabaja**.
El segundo cubre la estrategia, el método de trabajo y el pitch.

Que quede claro desde el principio, porque es lo que más se malentiende: **el entregable no es un
modelo de inteligencia artificial. Es una herramienta web.**

---

## 1. Qué pide el desafío, exactamente

El enunciado dice: crear una herramienta web pública que muestre imágenes del cielo de la misión
SPHEREx, de modo que cualquiera pueda ver fácilmente cómo cambian con el tiempo. El usuario entra
las coordenadas de un trozo de cielo —ascensión recta y declinación— y la herramienta muestra una
serie de imágenes de esa zona, como un videíto, para que sea fácil detectar objetos en movimiento.

Dificultad declarada: **Advanced**. Materias: astrofísica, planetas y lunas, software.

El desafío nombra cinco objetos para probar la herramienta: la estrella de Barnard, Epsilon Indi B
—un par de enanas marrones que orbitan una estrella—, WISE 0855 —una enana marrón de movimiento
rápido, cuyas coordenadas el enunciado da explícitamente— y dos estrellas variables, RW Aurigae y
R Draconis.

Esos cinco objetos son, en la práctica, el criterio de aceptación. Si la herramienta se comporta
bien con los cinco, está terminada.

**Hay que subrayar lo que el desafío no pide.** No pide un detector automático. No pide un
clasificador. No pide un pipeline científico. El que detecta es el usuario humano. Un modelo de
clasificación de video puede sumar como capa opcional, pero si reemplaza al visor, el proyecto
simplemente no responde al enunciado.

---

## 2. Por qué un visor y no un algoritmo: la lógica del desafío

La técnica tiene casi cien años. Clyde Tombaugh descubrió Plutón en 1930 con un comparador de
parpadeo: dos placas fotográficas de la misma zona del cielo tomadas en fechas distintas,
alternadas rápido. Lo que está quieto no se mueve; lo que se desplaza, salta a la vista.

Un siglo después la técnica es la misma, solo cambió el soporte. Y sigue siendo competitiva.
El propio enunciado lo dice: la mayoría de los cometas y de las enanas marrones conocidas los
descubrieron voluntarios mirando parpadeos, a través de proyectos de ciencia ciudadana como
Backyard Worlds. Cientos de miles de personas han encontrado objetos que los algoritmos
automáticos del sondeo habían dejado pasar, típicamente en zonas de alta densidad estelar, cerca
de fuentes brillantes, o con artefactos que confunden a un detector pero no a una persona.

Esa es la justificación del desafío, y conviene poder decirla en una frase: **no se pide un visor
porque sea más fácil que un detector automático, sino porque el ojo humano a escala de multitud
resuelve casos que el detector automático no.**

---

## 3. El modelo explícito: WiseView

El desafío nombra una herramienta como modelo: **WiseView**, en byw.tools. Es una herramienta de
navegador que hace parpadear imágenes combinadas del telescopio WISE sobre una base temporal de
varios años. El usuario solo entra coordenadas y ajusta tres cosas: el estiramiento de la imagen,
el mapa de color y la velocidad del parpadeo.

Nació como un apaño de dos voluntarios de Backyard Worlds que querían clasificar mejor sus propios
candidatos. Hoy ha permitido cientos de descubrimientos de candidatos a enana marrón, por
aficionados y por profesionales.

Tres lecciones que hay que copiar sin vergüenza:

Primero, **una caja de coordenadas y nada más** en la primera pantalla. Segundo, **los controles
importan**: el estiramiento, el color y la velocidad son lo que convierte un borrón en un
descubrimiento, no son adornos; si se recortan por falta de tiempo, se recorta justamente lo que
hace útil la herramienta. Y tercero, **WiseView tiene API**, y eso la convirtió en infraestructura:
hay paquetes de terceros construidos encima para generar material y subirlo a plataformas de
ciencia ciudadana.

Y lo más importante: **lo que WiseView no hace.** No tiene eje espectral. WISE tiene cuatro bandas
anchas. SPHEREx tiene 102. Ahí está el hueco del proyecto.

---

## 4. Qué es SPHEREx

SPHEREx es una misión de la NASA que desde mayo de 2025 cartografía el cielo entero cada seis meses
en infrarrojo cercano, entre 0,75 y 5 micrómetros, repartidos en **102 canales espectrales**. Esa
cobertura espectral la hace especialmente sensible a objetos ricos en hidrógeno, agua, dióxido de
carbono, monóxido de carbono y otras moléculas. Va a producir imágenes de más de mil millones de
objetos: enanas marrones, cuásares, cometas, asteroides, estrellas, supernovas y galaxias, que a
menudo se solapan o varían en brillo.

El instrumento tiene seis detectores, divididos por un dicroico en tres de onda corta y tres de
onda larga. Cada banda cubre un rango distinto: la banda 1 va de 0,75 a 1,09 micrómetros, la 2 de
1,10 a 1,62, la 3 de 1,63 a 2,41, la 4 de 2,42 a 3,82, la 5 de 3,83 a 4,41, y la 6 de 4,42 a 5,00.
Las dos últimas tienen mucha más resolución espectral que las primeras.

---

## 5. El detalle técnico que decide el proyecto: el filtro lineal variable

Esto es lo más importante de todo el audio. Si hay una sola cosa que recordar, es esta.

SPHEREx **no tiene filtros discretos**. Tiene un filtro lineal variable: la longitud de onda cambia
de forma continua a lo largo de un eje del detector. En palabras de la documentación del archivo:
SPHEREx obtiene espectros mediante múltiples exposiciones, colocando una fuente dada en distintas
posiciones del campo de visión, donde se la mide en distintas longitudes de onda, reapuntando la nave.

Dicho de otro modo: el espectro de una fuente se construye observándola muchas veces, cada vez en
una parte distinta del detector, y por tanto **cada vez en una longitud de onda distinta**.

La consecuencia es enorme para este desafío, y conviene tenerla clara desde la primera hora. Si uno
toma todas las imágenes que cubren una posición del cielo, las recorta y las pasa en secuencia, **no
obtiene un parpadeo limpio. Obtiene una secuencia estroboscópica**, donde el brillo de cada fuente
salta porque cada fotograma está en otra longitud de onda. Una estrella roja aparecerá brillante en
unos fotogramas y débil en otros sin haberse movido ni haber cambiado.

Eso arruina exactamente lo que el desafío quiere mostrar: qué se mueve y qué de verdad varía.

Hay tres salidas, en orden de costo. La primera: **agrupar por banda o por detector antes de hacer
el parpadeo**, de modo que cada fotograma del video sea de la misma banda en épocas distintas. Esta
es, además, la lectura literal de una de las sugerencias del enunciado, que dice que puede tener
sentido sumar por separado todos los datos tomados por cada uno de los seis detectores. La segunda:
agrupar por longitud de onda usando la extensión que trae el archivo con el mapa de píxel a
longitud de onda. Más correcto y más caro. Y la tercera: normalizar cada fotograma con percentiles
robustos, que es un parche visual, no una solución física, pero en 24 horas puede salvar la demo.

Y si ni así queda limpio, hay una cuarta salida que es convertirlo en una funcionalidad: mostrar la
longitud de onda de cada fotograma en pantalla y explicar que el parpadeo es información espectral,
no ruido. Es verdad, y ante un jurado técnico suma en vez de restar.

**Lo primero que hay que hacer con datos reales es medir cuánto cambia la longitud de onda entre dos
épocas del mismo campo.** Antes de decidir nada de arquitectura.

---

## 6. Dónde viven los datos

El archivo es **IRSA**, el Infrared Science Archive de IPAC en Caltech. Hay cuatro caminos de acceso
y conviene conocerlos todos.

**Directorios navegables.** Los productos están organizados en carpetas que se pueden recorrer con
un navegador, útiles para entender la organización y para descargas masivas, pero no para buscar
por coordenada.

**El protocolo SIA2**, que es el estándar de la Alianza Internacional del Observatorio Virtual para
acceso simple a imágenes. Es la vía principal: se consulta por posición en el cielo y devuelve la
lista de imágenes que la cubren, con la URL de descarga de cada una.

**El servicio de recortes.** Esto es crítico: cada archivo de imagen espectral pesa unos 70
megabytes. Bajarlos enteros para mostrar un recorte pequeño es inviable en un hackatón y en una
herramienta pública. El servicio de recortes se invoca simplemente añadiendo a la URL del archivo el
centro en coordenadas y el tamaño en grados. Una advertencia: **los recortes solo funcionan sobre
los archivos alojados en IPAC**, no sobre la copia que hay en Amazon.

Y **Python**: las bibliotecas pyvo y astroquery envuelven todo esto, y el archivo publica notebooks
oficiales de ejemplo. Existe además un paquete de terceros, spxquery, que ya automatiza la consulta,
la descarga con recorte, la fotometría de apertura con resta de luz zodiacal y las curvas de luz.
Vale la pena mirar su arquitectura antes de escribir nada propio, aunque no se use: ya resolvió los
problemas que el equipo va a encontrar.

---

## 7. Qué hay dentro de un archivo

El producto principal es un FITS de múltiples extensiones, de 2040 por 2040 píxeles, con seis
extensiones. Conviene conocerlas porque varias son oportunidades directas.

La primera es la **imagen** calibrada, en unidades de brillo superficial. La segunda son los
**flags**, un mapa de bits por píxel con el estado y el procesamiento de cada uno: esta extensión es
la respuesta directa a una de las sugerencias del enunciado, que pide mostrar metadatos como los
indicadores de contaminación. Mostrarlos en la interfaz es barato y es exactamente lo que el autor
del desafío pidió. La tercera es la **varianza**. La cuarta es el modelo de **luz zodiacal**, y aquí
hay un detalle que vale oro: **la luz zodiacal no viene restada de la imagen**. Restarla es una
línea de código y mejora muchísimo el contraste de las fuentes débiles. La quinta extensión es la
función de dispersión de punto, y la sexta es la tabla que mapea píxel a longitud de onda.

Dos trampas conocidas. Una: la tabla de longitud de onda usa una parte poco común del estándar FITS
que, según el propio archivo, aún no implementan todos los lectores; si el lector no la reconoce,
hay que interpolar entre los puntos de control más cercanos, con precisión de aproximadamente un
nanómetro, suficiente para visualizar pero no para ciencia. Y dos: los headers FITS numeran los
píxeles desde uno, mientras que Astropy los numera desde cero. Es la causa clásica de
desplazamientos de un píxel.

Un detalle más que hay que tolerar en el código: **no todas las observaciones traen las seis
bandas**. La calidad se evalúa banda por banda y algunas no llegan al archivo.

---

## 8. Lo que acaba de pasar y nadie más sabe: Data Release 1

Esto es importante y es información fresca. La cronología de publicaciones es: julio de 2025, primer
Quick Release; octubre de 2025, el segundo; septiembre de 2026, el tercero; y **noviembre de 2026
—este mismo mes— el Data Release 1**.

Es muy probable que ningún otro equipo del hackatón lo esté usando, y casi seguro que los tutoriales
y los ejemplos que circulan por internet todavía apunten a la versión de hace un año, que ya ni
siquiera es buscable por el protocolo de consulta.

Y el Data Release 1 trae algo que cambia la arquitectura del proyecto: **un cubo de todo el cielo,
con un mosaico por cada uno de los 102 canales, publicado en formato HiPS**.

HiPS es el formato de teselas jerárquicas del centro de datos astronómicos de Estrasburgo, y es
precisamente el formato que **Aladin Lite consume directamente en el navegador**. Aladin Lite es,
además, la herramienta que el propio enunciado sugiere usar para mostrar datos astronómicos.

Lo que esto significa en la práctica: **hay un camino para mostrar las 102 bandas de todo el cielo
sin escribir una línea de backend.** Es la vía rápida del proyecto y su seguro: si el backend se
atrasa o se cae, esa parte sigue funcionando y hay algo que mostrar.

Conviene no confundir los dos productos, porque responden a preguntas distintas. **Las imágenes de
nivel 2 dan el eje del tiempo**: muchas épocas, resolución nativa, y es de donde sale el parpadeo.
**El cubo de todo el cielo da el eje de la longitud de onda**: 102 canales, resolución gruesa, y es
de donde sale el espectro y el color. El visor que pide el desafío necesita las dos cosas.

---

## 9. Herramientas que el archivo ya tiene

Antes de construir algo, conviene mirar si IRSA ya lo hizo. Tiene un explorador de datos con
interfaz gráfica, una herramienta de recortes, una de mosaicos, una de espectrofotometría por
fotometría forzada —que es la respuesta del archivo a la sugerencia de generar espectros al vuelo—,
una de descubrimiento de fuentes, y una especialmente interesante: **MOST**, la herramienta de
búsqueda de objetos en movimiento, que dada la órbita de un objeto del sistema solar encuentra las
imágenes de SPHEREx que cubrieron su posición predicha en cada época. Con eso, una pestaña de
"sigue este asteroide" sale casi gratis.

Y hay un detalle con gancho para una demo: el archivo tiene una **colección dedicada al cometa
interestelar 3I/ATLAS**. Un objeto que se mueve rápido, reciente, y que el público conoce. Para dos
minutos de demostración vale más que cualquier enana marrón.

---

## 10. Los otros datos: los overlays

El enunciado sugiere permitir superponer datos de otros telescopios, y menciona Gaia y WISE.

Vale la pena entender que **Gaia no es solo un adorno visual: es el control de calidad del visor.**
Gaia da posiciones, movimientos propios y paralajes con una precisión extraordinaria. Si se dibuja
sobre la imagen la posición que Gaia predice para una estrella en la fecha de esa época concreta, y
el marcador cae justo sobre el punto brillante, queda demostrado que el sistema de coordenadas, las
fechas y el recorte están todos bien.

Es la forma más barata que existe de probarle a un jurado que la herramienta es correcta y no solo
bonita. Y responde, antes de que la hagan, a la pregunta obvia: ¿cómo sé que esta imagen es de la
coordenada que pedí?

Un detalle a cuidar: Gaia Data Release 3 tiene época de referencia 2016, no 2000. Confundirlas mete
un error de dieciséis años de movimiento propio.

---

## 11. Los cinco objetos de prueba, y qué demuestra cada uno

**WISE 0855** es la demo principal: movimiento propio altísimo, uno de los objetos más fríos
conocidos fuera del sistema solar y muy cercano. Debería lucir en las bandas largas y estar casi
ausente en las cortas.

**La estrella de Barnard** tiene el mayor movimiento propio conocido de cualquier estrella. Es el
caso de control: si en Barnard no se ve movimiento, el problema es del visor, no del objeto.

**Epsilon Indi B** es un par de enanas marrones. Es el mejor campo para demostrar el selector de
banda, porque es un objeto rojo y frío. Cuidado con una trampa: el par está separado unos 400
segundos de arco de la estrella Epsilon Indi A, que es muy brillante y puede contaminar el campo.

**RW Aurigae** y **R Draconis** son variables: cambian de brillo sin moverse. Son el caso de control
opuesto.

Y ahí está el argumento más fuerte para el pitch: **la pareja "se mueve" contra "solo cambia de
brillo"** demuestra que la herramienta distingue las dos cosas. En la demostración conviene mostrar
una de cada.

Las cinco coordenadas quedaron verificadas en SIMBAD el 14 de noviembre, y de ahí salieron dos
trampas que vale la pena conocer antes de llegar.

La primera: **la coordenada que el enunciado da para WISE 0855 es de la época de WISE, alrededor de
2010, no la de hoy.** Ese objeto se mueve ocho segundos de arco al año, así que a finales de 2026
está a unos ciento treinta segundos de arco de donde dice el enunciado. Si uno centra el visor ahí
con un campo pequeño, el objeto queda fuera y parece que la herramienta no funciona.

La segunda: **Epsilon Indi B con be mayúscula es el par de enanas marrones, que es lo que pide el
desafío; con be minúscula es un planeta**, que está a cuatrocientos segundos de arco, en la posición
de la estrella. Hay resolvedores de nombres que no distinguen mayúsculas y devuelven el planeta.

Y una expectativa que conviene tener calibrada desde el principio: con una escala de píxel de unos
seis segundos de arco, **incluso los objetos más rápidos del cielo se mueven menos de un píxel entre
dos barridos consecutivos de SPHEREx**, que están separados seis meses. Solo con la base temporal
completa de la misión se llega a uno o dos píxeles y medio. Eso significa comparar la primera época
contra la última, no las consecutivas; da mucho valor a la resta de imágenes, donde un píxel de
desplazamiento se ve clarísimo; y obliga a no prometer en el pitch que el objeto salta a la vista
sin haberlo visto antes.

Una coordenada equivocada, en todo caso, no falla: devuelve imágenes perfectamente válidas de un
trozo de cielo equivocado. Es el error más silencioso y más caro que se puede cometer aquí.

---

## 12. Lo que hay que llevar en la cabeza al llegar

Cinco cosas.

Una: el entregable es un visor para que personas detecten, no un detector automático.

Dos: el filtro lineal variable hace que épocas distintas estén en longitudes de onda distintas, y
eso hay que medirlo con datos reales en la primera hora.

Tres: Data Release 1 salió este mes y trae un cubo de todo el cielo en formato HiPS, que Aladin Lite
puede mostrar sin backend. Ese es el camino rápido y el seguro del proyecto.

Cuatro: los recortes del archivo son lo que hace viable todo; hay que cronometrarlos temprano,
porque si son lentos, el plan cambia.

Y cinco: las 102 bandas son el ángulo propio. WiseView ya hace el parpadeo en WISE. Lo que nadie ha
hecho todavía para el público general es el parpadeo **más** el eje espectral: que el usuario vea no
solo que algo se mueve, sino de qué está hecho.
