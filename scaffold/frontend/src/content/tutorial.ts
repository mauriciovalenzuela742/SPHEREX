/**
 * Tutorial guiado por Spherix: todos los textos. Dueña: Javiera (N).
 * Cada paso ilumina la sección marcada con `data-tour="<ancla>"` y oscurece el resto.
 * Para cambiar el orden o un texto, se edita este archivo; el componente (src/tutorial) no cambia.
 * Voz de Spherix (content/spherix.ts): cercana, frases cortas, una idea por paso.
 */

export type PasoTutorial = {
  /** `data-tour` de la sección; sin ancla = burbuja centrada (bienvenida y cierre). */
  ancla?: string;
  titulo: string;
  texto: string;
  /** Pista de qué probar, en letra más chica. */
  prueba?: string;
};

export const tutorial = {
  progreso: (n: number, total: number) => `${n} de ${total}`,
  anterior: "Anterior",
  siguiente: "Siguiente",
  empezar: "¡Vamos!",
  saltar: "Saltar tutorial",
  cerrar: "Cerrar el tutorial",
  buscando: "Estoy buscando las fotos de SPHEREx para mostrarte esta parte…",
  noEncontrada: "Esta parte todavía se está cargando; te la cuento igual y la verás en un momento.",

  pasos: [
    {
      titulo: "¡Hola! Soy Spherix",
      texto:
        "Bienvenido a AstroTRACK. Aquí puedes mirar cómo cambia el cielo usando fotos reales del telescopio SPHEREx de la NASA. " +
        "Te muestro cada parte en un par de minutos. Mientras te explico una, el resto queda a oscuras.",
      prueba: "Usa las flechas ← → del teclado o los botones. Con Esc sales cuando quieras.",
    },
    {
      ancla: "busqueda",
      titulo: "¿A dónde miramos?",
      texto:
        "Aquí eliges el lugar del cielo: ascensión recta (A.R.) y declinación (Dec), como la longitud y la latitud del cielo. " +
        "«Dimensión» es cuánto cielo entra en la imagen, y «Bandas» el color infrarrojo que quieres ver.",
    },
    {
      ancla: "objetos",
      titulo: "Atajos a cinco estrellas famosas",
      texto:
        "Estos botones te llevan a los objetos que pide el desafío de la NASA. Los centro donde están hoy, no donde dice " +
        "un catálogo viejo: algunos se mueven tanto que ya no están en su posición del año 2000.",
    },
    {
      ancla: "mapa",
      titulo: "El cielo entero de SPHEREx",
      texto:
        "Este es el mapa de todo el cielo armado con las fotos de SPHEREx. Arrástralo para moverte y usa la rueda del mouse " +
        "para acercarte. El cuadro punteado marca la zona que estamos estudiando.",
    },
    {
      ancla: "epocas",
      titulo: "Fotos de hace 25 años",
      texto:
        "Aquí cambias el fondo del mapa: SPHEREx (2025–26), AllWISE (2010) o 2MASS (cerca de 1999). Con «Parpadear» se " +
        "alternan solas. Las estrellas cercanas, como la de Barnard, saltan de lugar entre una época y otra.",
      prueba: "Prueba «Parpadear» después del tutorial.",
    },
    {
      ancla: "lambda",
      titulo: "Los 102 colores de SPHEREx",
      texto:
        "SPHEREx ve el cielo en 102 colores de luz infrarroja, agrupados en seis bandas (D1 a D6). Abre una banda y elige un " +
        "canal: un mismo objeto puede brillar mucho en un color y casi nada en otro.",
    },
    {
      ancla: "catalogos",
      titulo: "¿Cómo se llama esa estrella?",
      texto:
        "Este botón muestra encima las estrellas de otros telescopios: Gaia, CatWISE y los nombres de SIMBAD. Si pasas el mouse " +
        "sobre una, te digo cómo se llama.",
    },
    {
      ancla: "explorador-imagen",
      titulo: "Una foto de cada visita",
      texto:
        "Aquí ves la foto que SPHEREx tomó en cada visita a este lugar. La mira del centro marca el objeto y la barra de abajo " +
        "mide 30 segundos de arco. Cada cuadradito es un píxel: el instrumento ve todo el cielo, no detalles finos.",
    },
    {
      ancla: "explorador-tiempo",
      titulo: "La línea del tiempo",
      texto:
        "Cada marca es una visita de SPHEREx. Pasa el mouse por la línea y la foto cambia de fecha; con ▶ se reproduce como un " +
        "videíto. Así descubrió Clyde Tombaugh a Plutón en 1930: comparando fotos de distintas fechas.",
    },
    {
      ancla: "explorador-modos",
      titulo: "Ver lo que cambió",
      texto:
        "Elige la banda y el modo. En «Resta vs t₀» la foto se compara con la primera: lo que aparece sale rojo y lo que se " +
        "fue, azul. Una pareja rojo-azul pegada es algo que se movió.",
      prueba: "Ojo: no toda mancha es movimiento. Los objetos muy brillantes saturan la cámara.",
    },
    {
      ancla: "explorador-zoom",
      titulo: "Acércate",
      texto:
        "El movimiento que buscamos es de uno o dos píxeles, así que conviene ampliar. Acerca hasta 8 veces con estos botones, " +
        "las teclas + y − o pellizcando el touchpad, y arrastra la imagen para recorrerla.",
    },
    {
      ancla: "explorador-rejilla",
      titulo: "Todo de un vistazo",
      texto:
        "Esta rejilla tiene todas las bandas y todas las fechas a la vez. Haz clic en cualquier cuadrito para verlo en grande.",
    },
    {
      ancla: "prisma-ojo",
      titulo: "El ojo infrarrojo",
      texto:
        "Traduzco los colores infrarrojos a colores que sí ves: las bandas cortas en azul, las medias en verde y las largas en " +
        "rojo. Lo frío se ve rojo y las estrellas calientes, azuladas.",
    },
    {
      ancla: "prisma-huella",
      titulo: "La huella de luz",
      texto:
        "Cuánto brilla el objeto en cada color: es su huella digital, y delata de qué está hecho y qué tan caliente es. Los " +
        "puntos huecos son fotos donde estaba tan brillante que saturó la cámara.",
    },
    {
      ancla: "spherix",
      titulo: "Aquí estoy yo",
      texto:
        "Cuando quieras, ábreme y pregúntame: «llévame a Antares», unas coordenadas, «¿qué estoy viendo?» o «¿qué es una banda?». " +
        "Te respondo y muevo el visor por ti.",
    },
    {
      ancla: "menu",
      titulo: "El Modo Misión",
      texto:
        "En este menú está el Modo Misión: un recorrido por niveles donde haces lo que hizo Tombaugh con fotos reales y aprendes " +
        "a desconfiar de lo que parece un descubrimiento. Al terminar ganas la insignia de cazador de planetas.",
    },
    {
      titulo: "¡Ahora te toca a ti!",
      texto:
        "Ya conoces AstroTRACK. Lo mejor es probar: busca la Estrella de Barnard, la que más rápido cruza nuestro cielo, y mira " +
        "cómo se corre entre una visita y otra. O ponte a prueba en el Modo Misión.",
    },
  ] as PasoTutorial[],

  final: {
    barnard: "Probar con la Estrella de Barnard",
    mision: "Ir al Modo Misión",
    libre: "Explorar libre",
  },
};
