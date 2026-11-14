# Audio 2 de 2 — SPHEREx: estrategia, equipo y pitch

Material de preparación para Juan Pablo, camino al NASA Space Apps Challenge 2026, donde su equipo
de cuatro personas del laboratorio de astronomía va a tomar el desafío **Planet X and SPHEREx**.

Este es el segundo de dos audios. El primero cubre qué pide el desafío y con qué datos se trabaja.
Este cubre **cómo organizarse, qué construir primero, qué premia el jurado y cómo presentarlo**.

La idea de fondo: en un hackatón, el proyecto que gana casi nunca es el que tiene más código. Es el
que llega entero.

---

## 1. La rúbrica escondida: las ocho sugerencias del enunciado

El desafío trae una sección de "consideraciones potenciales" con ocho viñetas que dice que uno
"puede, pero no está obligado" a considerar. En la práctica **son la rúbrica**: son lo que el autor
del desafío espera que distinga a un buen proyecto, y lo que un juez de la NASA va a reconocer.

Las ocho son: que la herramienta sea fácil de actualizar cuando lleguen nuevos datos; mostrar de
forma creativa las 102 bandas de infrarrojo, con bonus explícito si se generan espectros al vuelo;
permitir sumar o restar imágenes tomadas en épocas distintas; dejar al usuario elegir el campo de
visión; permitir superponer datos de otros telescopios como Gaia o WISE; **poder consultar la
herramienta incluyendo las coordenadas en la URL**, para que se pueda embeber en otros sitios;
mostrar metadatos como los indicadores de contaminación; y usar herramientas públicas que ya
existan, nombrando explícitamente Astropy y Aladin.

Lo interesante: **siete de las ocho son de costo bajo o muy bajo.** La única cara de verdad es la de
las 102 bandas, que es justamente la diferencial. Así que hay que cumplirlas todas, y hay un orden
para hacerlo.

---

## 2. La arquitectura: dos vías, y hay que tener las dos

El proyecto tiene un camino rápido y uno completo, y la clave es que **el rápido existe de verdad**.

**La vía A** es Aladin Lite cargando directamente el cubo de todo el cielo del Data Release 1, que
se publica en formato HiPS. El usuario navega el cielo y mueve un deslizador de longitud de onda.
Cero backend. Da las 102 bandas, el contexto de todo el cielo y los overlays de catálogos. Lo que no
da es el eje del tiempo, porque el cubo es un mosaico combinado, no una serie de épocas. Costo:
horas, no días. Riesgo técnico bajo.

**La vía B** es el parpadeo temporal, con backend. El servidor consulta el archivo por posición,
pide recortes de cada época, los agrupa por banda, los normaliza y devuelve una secuencia ordenada
en el tiempo. Es el desafío propiamente dicho y es el grueso del trabajo. Su cuello de botella es la
latencia de los recortes: sin caché, la demostración no sobrevive.

**Las dos vías se montan en la misma pantalla**, lado a lado: Aladin da el contexto y la longitud de
onda, un panel al lado da el parpadeo temporal. El usuario entiende enseguida que son dos ejes del
mismo dato.

Y la vía A es el seguro del proyecto: si el backend no llega a tiempo, sigue habiendo algo real que
mostrar.

El stack decidido: Python con FastAPI en el backend, porque las bibliotecas que saben leer estos
datos solo existen en Python; React con Vite y Aladin Lite en el frontend; caché en disco; y
despliegue del frontend estático en un CDN con el backend en un contenedor.

Una decisión de diseño que ahorra mucho trabajo: **el backend devuelve imágenes PNG ya renderizadas,
no archivos FITS.** Mandar FITS al navegador obliga a escribir un lector de FITS en JavaScript y a
aplicar el estiramiento y el mapa de color a mano: el doble de trabajo y el triple de errores. El
costo es que cambiar el estiramiento exige volver al servidor, y con caché eso es barato.

Y un detalle que parece menor y no lo es: **todos los fotogramas de una secuencia se normalizan con
los mismos límites.** Si cada uno se estira por su cuenta, todo parpadea y no se distingue el
movimiento real de un cambio de escala.

---

## 3. Lo primero que hay que fijar: el contrato de la API

Esto es lo que permite que cuatro personas avancen en paralelo desde la primera hora.

En la hora uno se escribe el contrato: qué endpoints hay, qué parámetros toman y qué devuelven
exactamente. Mientras el backend no exista, el frontend trabaja contra un simulador que devuelve
esas mismas formas. Nadie espera a nadie.

Y la regla que lo sostiene: **si alguien cambia el contrato, lo cambia primero en el documento**,
avisa al equipo, y recién después toca el código. Un cambio silencioso de contrato bloquea a otra
persona sin que se entere, y eso a las tres de la mañana cuesta horas.

Dos campos del contrato que valen la pena mencionar. Uno: cada fotograma devuelve **su longitud de
onda**, y eso no es opcional: es lo que impide el problema del filtro lineal variable y, mostrado en
pantalla, le demuestra al jurado que el equipo entiende el instrumento. Y dos: las advertencias
viajan como una lista, no como un error. Faltan bandas constantemente; si eso rompe la petición, la
herramienta no funciona.

---

## 4. Cuatro personas, cuatro agentes, y el riesgo real

El riesgo principal de un equipo de cuatro con asistentes de IA no es quedarse sin ideas. Es
**pisarse**. Cuatro agentes escribiendo rápido sobre el mismo repositorio producen conflictos,
código duplicado y una rama principal rota de madrugada.

El reparto propuesto son cuatro roles, cada uno dueño de unos archivos. Dueño significa que esa
persona decide y los demás piden; no significa que trabaje sola.

**Datos**: consulta el archivo, baja recortes, lee los FITS, agrupa por banda, resuelve las
coordenadas y las longitudes de onda. Es el camino crítico: si esto no funciona, no hay proyecto.

**Visor**: Aladin Lite, el panel de parpadeo, los controles, la URL consultable.

**Ciencia y verificación**: comprueba que lo que se muestra es correcto. Que el recorte es del cielo
que dice, que el objeto está donde Gaia predice, que el espectro no es un artefacto. **Es quien
tiene permiso explícito para decir "esto está mal" sin tener que proponer el arreglo.**

**Narrativa y entrega**: el README, la demo, el pitch y el formulario. Y empieza a trabajar desde la
hora cero, no al final. El error clásico de los hackatones es dejar la entrega para las últimas dos
horas y descubrir que falta la mitad del formulario.

A partir de la hora doce, cuando el camino crítico está destrabado, datos y visor se reparten las
viñetas extra. Pero ciencia y narrativa no se disuelven: si nadie verifica y nadie prepara la
entrega, el proyecto se entrega tarde y con errores.

Sobre el código: ramas cortas que viven menos de tres horas, nadie empuja a la rama principal, y
cada cambio lo revisa una persona —no un agente—, porque mirar un diff toma dos minutos y evita
horas. Y worktrees: una carpeta por persona, porque dos agentes sobre la misma carpeta se
sobreescriben sin avisar y ninguno de los dos lo va a decir.

---

## 5. Cómo se usa un agente sin que el agente te gane

Esto es lo que separa a un equipo que usa agentes de uno al que los agentes le ganan. Son cinco
hábitos.

**Una sesión por frente.** No mezclar el backend de datos con el frontend en la misma sesión: el
contexto se contamina y el asistente empieza a cometer errores tontos.

**El agente propone, la persona decide.** Para cualquier cosa que toque más de dos archivos: plan
primero, aprobación después. En un hackatón la tentación de dejarlo correr es enorme, y es la forma
más rápida de terminar con dos mil líneas que nadie entiende a las cinco de la mañana.

**Verificar el artefacto, no el reporte.** Que el agente diga "ya funciona" es un dato, no un hecho.
Hay que abrir la URL, mirar la imagen, contar las épocas. No es desconfianza: es que el agente no
puede ver la pantalla.

**Cuando algo no sale a la tercera, cambiar de enfoque, no de prompt.** Si llevas tres intentos
corrigiendo lo mismo, el problema no es cómo se lo pediste.

Y **nunca dejar que un agente decida solo el alcance.** Un agente, si lo dejas, construye las ocho
viñetas del desafío a medias en lugar de tres completas.

---

## 6. El plan por bloques, y dónde están los cortes

El ritmo es de bloques de noventa minutos, y al final de cada uno, cinco minutos de pie, sin
pantallas, donde cada quien dice tres cosas: qué quedó funcionando —no qué hizo, sino qué se puede
abrir y mirar—, qué está bloqueado y por quién, y qué va a hacer en los próximos noventa minutos.

Noventa minutos es suficiente para terminar algo y corto para que un camino equivocado no cueste
media noche.

**La hora cero es alinear.** Leer el enunciado juntos en voz alta, repartir roles, confirmar la hora
exacta del cierre de entregas, y levantar el esqueleto en los cuatro computadores. Si el esqueleto
no levanta, nadie avanza hasta que levante.

**Las horas uno a tres son la hora de la verdad con los datos.** Consultas reales, cuántas épocas
hay por campo, cuánto tarda un recorte cronometrado, y la pregunta más importante del día: cuánto
cambia la longitud de onda entre dos épocas del mismo campo. Si los recortes resultan inviables por
lentitud, **el plan cambia ahí, no a la hora quince**.

**Hasta la hora ocho, el camino crítico**, y el hito es muy concreto: *una coordenada escrita a mano
produce un videíto en pantalla*. Feo, lento, una sola banda, da igual. Si a la hora ocho no hay
videíto, todo lo demás se suspende y los cuatro se ponen en eso.

**De la ocho a la catorce, que sea bueno**, por orden de valor: selector de banda, luego los
controles, luego la resta de imágenes, luego resolver nombres, luego la URL compartible, luego el
overlay de Gaia, luego los flags, y solo si todo lo anterior está cerrado, los espectros al vuelo.

Y después vienen **las tres paradas obligatorias**, que son lo único que no se negocia.

A seis horas del cierre: **congelación de alcance**. No se empieza nada nuevo. Lo que no esté
empezado no se empieza, y lo empezado se termina o se saca, porque **una funcionalidad a medias
resta**: el jurado hace clic justo ahí.

A cuatro horas: **la demo grabada**, aunque la aplicación siga mejorando. Si después mejora, se
regraba. Si no da tiempo, ya hay vídeo.

A dos horas: **entregado**. Formulario completo, enlaces puestos, declaración de uso de IA escrita.
Después se puede seguir editando, pero ya está entregado.

---

## 7. Lo que puede salir mal

Nueve riesgos identificados; vale la pena tener los cuatro primeros presentes.

**Que los recortes del archivo sean demasiado lentos.** Es el supuesto sobre el que descansa todo.
Se decide a la hora tres. Si lo son, el plan B es caché agresiva, precalentado y mostrar los
fotogramas a medida que llegan; y el plan C es funcionar sobre un conjunto curado de unos diez
campos precalculados, diciéndolo sin disimulo: hoy servimos estos campos, la arquitectura escala.

**Que las épocas no sean comparables por el filtro lineal variable.** Es el riesgo más sutil y el
que más probablemente arruine el resultado sin que nadie entienda por qué. La señal de alarma es
obvia cuando aparece: el primer parpadeo parece una luz estroboscópica.

**Que se caiga el wifi.** Probabilidad alta: pasa en casi todos los hackatones. El plan B es
obligatorio, no opcional: un modo degradado que sirve los cinco campos desde caché sin tocar la red,
y el vídeo de la demo descargado en el disco del computador que presenta, no en la nube.

**Que el proyecto se entregue tarde o incompleto.** Es la causa número uno de que un buen proyecto
no gane nada, y no tiene plan B. Por eso existen las tres paradas.

Y uno más que conviene tener escrito de antemano para no reabrirlo a las cuatro de la mañana: **no
se va a entrenar ningún modelo.** No hay tiempo, no hay etiquetas y no hace falta.

---

## 8. Por qué no modelos de video, y qué responder si preguntan

Conviene tener esto claro porque alguien lo va a preguntar, dentro o fuera del equipo.

Las arquitecturas de comprensión de video —TimeSformer, ViViT, VideoMAE, X-CLIP— son modelos para
entender video natural. Están preentrenadas con personas, objetos y acciones. La estadística de una
secuencia astronómica —fondo casi vacío, fuentes puntuales, artefactos, un desplazamiento de pocos
píxeles— no se parece en nada, así que el preentrenamiento, que es todo su valor, no transfiere
bien. Además no hay etiquetas, y el caso ya está bien resuelto por métodos clásicos que aprovechan
la física del problema: una trayectoria lineal sobre un fondo estático.

El estado del arte de detección automática aquí es **shift-and-stack**: desplazar cada imagen según
una velocidad candidata y apilarlas, de modo que un objeto que se mueve se suma coherentemente y el
ruido no. La implementación de referencia, KBMOD, corre en GPU y explora del orden de diez mil
millones de trayectorias candidatas por minuto; con ella, el sondeo DEEP identificó 105 objetos
transneptunianos nuevos. Es caro y está fuera de alcance para 24 horas. Mencionarlo como trabajo
futuro es más honesto que intentarlo.

**Y aquí está la ventaja propia del equipo.** El laboratorio de Francisco Förster construyó ALeRCE,
el broker chileno que procesa el flujo de alertas de ZTF y se prepara para LSST. Su clasificador de
estampillas es una red convolucional que trabaja sobre los recortes de ciencia, referencia y
diferencia de la primera detección, diseñada para explotar la invarianza rotacional. Ese —una red
pequeña sobre recortes, con invarianzas elegidas a mano— **es el modelo correcto de inteligencia
artificial para este problema**, no un transformer de video.

Pero el aporte diferencial no es ni siquiera meter ese clasificador en el visor. Es la **disciplina
de clasificación en tiempo real**: umbrales, falsos positivos, cómo se le presenta a una persona un
candidato dudoso, cómo se recoge la etiqueta que esa persona da. Esa disciplina aplicada a la
interfaz es algo que ningún otro equipo del hackatón va a tener.

Así que la respuesta al jurado, si preguntan por qué no usaron aprendizaje automático, es: *lo
evaluamos; el cuello de botella de este desafío no es reconocer el movimiento en un video, es traer
y alinear los datos correctos y ponerlos delante de una persona; donde la IA aporta aquí es en el
cribado de candidatos con redes pequeñas sobre recortes, que es lo que hace el broker ALeRCE, y lo
dejamos planteado*. Esa respuesta es más fuerte que haber metido un modelo que no aporta.

---

## 9. El jurado: cómo se juzga y a qué apuntar

El embudo es: el jurado del evento local elige nominados globales; después expertos de la NASA y de
las agencias socias eligen finalistas; y un comité ejecutivo elige diez ganadores globales.

Es decir: **el primer filtro es un jurado local**, con poco tiempo por equipo y sin leer el código.
Después, gente que sí entiende de astronomía. El proyecto tiene que funcionar en los dos registros:
impactar en dos minutos y resistir una mirada experta.

De los diez premios globales, hay dos naturales para este proyecto: **mejor uso de datos**, que es
literalmente hacer accesibles los datos espaciales, y **mejor uso de ciencia**. Un tercero gratis si
se trabaja: **mejor uso del storytelling**, porque la historia de Plutón y el comparador de parpadeo
está ahí para tomarla. Apuntar a dos o tres, no a diez.

---

## 10. El pitch de dos minutos

En el evento de Santiago el formato anunciado son dos minutos más dos preguntas. Dos minutos es
mucho menos de lo que parece, y hay que ensayarlo en voz alta y cronometrado, tres veces.

La estructura, y el orden no se negocia porque **la demo va antes que la explicación**: si te
cortan, al menos vieron la herramienta.

**Veinte segundos de gancho.** En 1930, Clyde Tombaugh descubrió Plutón mirando dos fotos del mismo
trozo de cielo y notando que un punto se había movido. Hoy SPHEREx fotografía el cielo entero cada
seis meses en 102 colores de infrarrojo, y nadie lo está mirando así.

**Cincuenta segundos de demostración en vivo**, que es la mitad del tiempo y es lo que se juzga.
Escribir "WISE 0855" —el nombre, no las coordenadas, para demostrar que es para cualquiera—. Darle
play: la enana marrón se mueve. Mover el selector de banda: la misma zona en otra longitud de onda.
Encender el overlay de Gaia: los marcadores caen sobre las fuentes, *así sabemos que es correcto*.
Copiar la URL: esto es compartible y embebible.

**Veinticinco segundos de por qué importa.** La mayoría de las enanas marrones y los cometas
conocidos los encontraron voluntarios mirando parpadeos. Esa comunidad existe y hoy no tiene cómo
mirar SPHEREx. El candidato a Planet Nine más citado salió de comparar dos sondeos infrarrojos
separados en el tiempo: la misma técnica.

**Y veinticinco segundos de qué construimos y qué sigue.**

Tres reglas del pitch. Nunca se demuestra en vivo contra una consulta fría: los cinco campos van
precalentados. No se dice "podría": se muestra lo que hay. Y **no se promete haber encontrado nada**:
un jurado con astrónomos lo castiga al instante.

Sobre Planet Nine, el marco honesto: a noviembre de 2026 **no se ha encontrado**. El candidato más
citado es el que salió de cruzar los sondeos infrarrojos IRAS y AKARI, separados veintitrés años, y
los propios autores subrayan que no han descubierto nada definitivo. Pero la frase que sí es
verdadera, verificable, y mejor gancho que cualquier promesa, es esta: **la técnica que encontró ese
candidato es exactamente la del desafío, y SPHEREx la hace cada seis meses, en 102 bandas, y nadie
lo ha revisado a ojo.**

---

## 11. Las preguntas incómodas

Cuatro, con su respuesta.

**¿Esto no lo hace ya el explorador de datos de IRSA?** No para este público. El explorador es un
archivo para astrónomos: hay que saber qué colección pedir, qué es un FITS multiextensión y cómo se
estira una imagen. Nosotros resolvemos el nombre, agrupamos las épocas, normalizamos y entregamos el
parpadeo. Es la diferencia entre un archivo y un visor, y es la misma diferencia que hizo útil a
WiseView frente al archivo de WISE.

**¿Cómo sé que la imagen es de esa coordenada?** Por el overlay de Gaia. Y se muestra en pantalla.

**¿Qué pasa si pongo una coordenada sin datos?** Y se escribe una, y se muestra el estado vacío, que
dice cuántas épocas hay y sugiere un campo cercano. Hay que tener esto resuelto: el jurado va a
escribir coordenadas al azar, y una pantalla en blanco es un fallo grave.

**¿Qué tan correctos son los espectros?** Son indicativos, fotometría de apertura con la luz
zodiacal restada, y lo decimos en la propia interfaz. Para ciencia está la herramienta de
espectrofotometría de IRSA. Nunca presentarlos como calidad científica: la honestidad aquí suma
mucho más de lo que resta.

---

## 12. Lo obligatorio de la entrega

Tres cosas que no son trámite.

**La descripción de cómo se usó la inteligencia artificial es obligatoria este año** en cada
entrega. Escrita bien, es evidencia de método: qué se le pidió a los asistentes, cómo se controló el
resultado, qué no se hizo con ellos —en particular, que ningún dato científico fue generado ni
completado por un modelo—, y por qué se descartaron razonadamente los modelos de visión para la
detección. Escrita mal, es una oportunidad desperdiciada.

**La atribución de los datos de SPHEREx**, literal, en el pie de la herramienta y en el README. Es
un punto gratis de prolijidad ante un jurado de la NASA y cuesta treinta segundos.

Y **los enlaces probados desde fuera del wifi del evento**: el vídeo, la aplicación desplegada y el
repositorio, abiertos desde un teléfono con datos móviles. Un enlace que solo funciona en la red
local es un enlace roto.

---

## 13. Lo que hay que llevar en la cabeza al llegar

Cinco cosas.

Una: las ocho sugerencias del enunciado son la rúbrica, siete son baratas, y hay que cumplirlas
todas en orden de valor.

Dos: el hito de la hora ocho es un videíto en pantalla, por feo que sea. Todo lo demás se subordina.

Tres: las tres paradas —congelación a seis horas, demo grabada a cuatro, entregado a dos— no se
negocian, porque el proyecto que gana es el que llega entero.

Cuatro: verificar el artefacto, no el reporte. Vale para los agentes y vale para las personas.

Y cinco: el ángulo del proyecto cabe en una frase. **Un visor donde cualquiera entra una coordenada
y ve dos ejes a la vez: cómo cambia esa zona del cielo en el tiempo, y cómo se ve en cada una de las
102 longitudes de onda, con el espectro de lo que señale generado al vuelo.** Eso es la lectura
literal del enunciado, es sus dos viñetas más exigentes, y es algo que ninguna herramienta pública
hace hoy.
