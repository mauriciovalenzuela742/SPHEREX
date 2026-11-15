/**
 * Tutorial guiado por Spherix: todos los textos, en español y en inglés. Dueña: Javiera (N).
 * Cada paso ilumina la sección marcada con `data-tour="<ancla>"` y oscurece el resto.
 * Para cambiar el orden o un texto, se edita este archivo; el componente (src/tutorial) no cambia.
 * Voz de Spherix (content/spherix.ts): cercana, frases cortas, una idea por paso.
 *
 * Hay dos recorridos: `pasos` para el Modo ciencia (el Visor completo) y `pasosSimple` para la vista simple
 * (src/simple). `textosTutorial(idioma)` devuelve los de ese idioma.
 */
import type { Idioma } from "./textos";

export type PasoTutorial = {
  /** `data-tour` de la sección; sin ancla = burbuja centrada (bienvenida y cierre). */
  ancla?: string;
  titulo: string;
  texto: string;
  /** Pista de qué probar, en letra más chica. */
  prueba?: string;
};

const ES = {
  progreso: (n: number, total: number) => `${n} de ${total}`,
  anterior: "Anterior",
  siguiente: "Siguiente",
  empezar: "¡Vamos!",
  saltar: "Saltar tutorial",
  cerrar: "Cerrar el tutorial",
  buscando: "Estoy buscando las fotos de SPHEREx para mostrarte esta parte…",
  noEncontrada: "Esta parte todavía se está cargando; te la cuento igual y la verás en un momento.",

  /** Modo ciencia (el Visor completo). */
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
        "«Dimensión» es cuánto cielo entra en la imagen, y «Banda del mapa» el color infrarrojo que quieres ver.",
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
        "Cada marca es una visita de SPHEREx. Haz clic o arrastra en la línea y la foto cambia de fecha; con ▶ se reproduce como " +
        "un videíto. Así descubrió Clyde Tombaugh a Plutón en 1930: comparando fotos de distintas fechas.",
    },
    {
      ancla: "explorador-modos",
      titulo: "Ver lo que cambió",
      texto:
        "Elige la banda y el modo. En «Resta vs t₀» la foto se compara con la primera: lo que aparece sale rojo y lo que se " +
        "fue, azul. Una pareja rojo-azul pegada es algo que se movió. «Resta A − B» compara dos fechas que eliges tú.",
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
        "Ya conoces AstroTRACK. Lo mejor es probar: mira Epsilon Indi B, una pareja de enanas marrones a 12 años luz, y compara " +
        "la primera fecha con la última para ver cómo se corre. O ponte a prueba en el Modo Misión.",
    },
  ] as PasoTutorial[],

  final: {
    probar: "Probar con Epsilon Indi B",
    mision: "Ir al Modo Misión",
    libre: "Explorar libre",
  },

  /** Vista simple (sin Modo ciencia). */
  pasosSimple: [
    {
      titulo: "¡Hola! Soy Spherix",
      texto:
        "Bienvenido a AstroTRACK. Aquí ves fotos reales del telescopio SPHEREx de la NASA, que mira todo el cielo cada seis " +
        "meses. Te muestro cómo usarlo en un minuto.",
      prueba: "Usa las flechas ← → del teclado o los botones. Con Esc sales cuando quieras.",
    },
    {
      ancla: "simple-objetos",
      titulo: "Cinco objetos para empezar",
      texto:
        "Estos botones te llevan a los objetos del desafío de la NASA: tres que se mueven (Barnard, ε Indi B y WISE 0855) y " +
        "dos que cambian de brillo (RW Aurigae y R Draconis). El que estás mirando queda en naranja.",
    },
    {
      ancla: "simple-busca",
      titulo: "Busca lo que quieras",
      texto:
        "Escribe el nombre de uno de esos objetos o unas coordenadas del cielo, como «133.79 -7.24», y te llevo ahí.",
    },
    {
      ancla: "simple-imagen",
      titulo: "La foto de SPHEREx",
      texto:
        "Esta es una foto real de ese lugar del cielo. El círculo naranja marca el objeto y la raya de abajo mide 30 segundos " +
        "de arco. Toca el objeto para pasar a la foto siguiente.",
    },
    {
      ancla: "simple-fechas",
      titulo: "Las fechas",
      texto:
        "SPHEREx pasa por cada lugar cada ~6 meses: cada botón es una de esas pasadas. Con «▶ Reproducir» se ven seguidas, " +
        "como un videíto; si algo salta de lugar, se está moviendo.",
      prueba: "Pausa y sigue cuando quieras; también con la barra espaciadora, y ← → pasan de fecha.",
    },
    {
      ancla: "simple-ab",
      titulo: "Compara dos fechas",
      texto:
        "Elige una fecha y tócala como A, otra como B, y pulsa «Ver A − B». Lo que está en A sale rojo y lo que está en B, " +
        "azul. Una pareja roja y azul pegada es algo que se movió.",
    },
    {
      ancla: "simple-luz",
      titulo: "La luz que ves",
      texto:
        "SPHEREx ve luz infrarroja, que tus ojos no ven. Aquí eliges cuál: «Cercana» muestra mejor las estrellas como el Sol, " +
        "«Media» las estrellas frías y «Lejana» los objetos más fríos, como las enanas marrones.",
    },
    {
      ancla: "simple-lado",
      titulo: "¿Dónde y cuándo?",
      texto:
        "Aquí puedes escribir las coordenadas exactas (A.R. y Dec) y elegir con el calendario desde qué fecha hasta cuál " +
        "quieres ver las fotos.",
    },
    {
      ancla: "simple-ciencia",
      titulo: "¿Quieres más?",
      texto:
        "Activa el «Modo ciencia» para tener todas las herramientas: el mapa de todo el cielo, los 102 colores de SPHEREx, " +
        "los catálogos de otros telescopios y el espectro de cada objeto.",
    },
    {
      titulo: "¡Ahora te toca a ti!",
      texto:
        "Prueba con Epsilon Indi B, una pareja de enanas marrones a 12 años luz: reproduce las fechas y mira cómo se corre. " +
        "O pasa al Modo ciencia cuando quieras.",
    },
  ] as PasoTutorial[],

  finalSimple: {
    probar: "Probar con Epsilon Indi B",
    ciencia: "Abrir el Modo ciencia",
    libre: "Explorar libre",
  },
};

const EN: typeof ES = {
  progreso: (n: number, total: number) => `${n} of ${total}`,
  anterior: "Back",
  siguiente: "Next",
  empezar: "Let's go!",
  saltar: "Skip tutorial",
  cerrar: "Close the tutorial",
  buscando: "I'm looking for the SPHEREx photos to show you this part…",
  noEncontrada: "This part is still loading; I'll tell you about it anyway and you'll see it in a moment.",

  pasos: [
    {
      titulo: "Hi! I'm Spherix",
      texto:
        "Welcome to AstroTRACK. Here you can watch how the sky changes using real photos from NASA's SPHEREx telescope. " +
        "I'll show you each part in a couple of minutes. While I explain one, the rest goes dark.",
      prueba: "Use the ← → keys or the buttons. Press Esc to leave whenever you want.",
    },
    {
      ancla: "busqueda",
      titulo: "Where do we look?",
      texto:
        "Here you choose the spot in the sky: right ascension (R.A.) and declination (Dec), like longitude and latitude on the sky. " +
        "“Size” is how much sky fits in the image, and “Map band” is the infrared color you want to see.",
    },
    {
      ancla: "objetos",
      titulo: "Shortcuts to five famous stars",
      texto:
        "These buttons take you to the objects the NASA challenge asks for. I center them where they are today, not where an " +
        "old catalog says: some move so much they are no longer at their position from the year 2000.",
    },
    {
      ancla: "mapa",
      titulo: "The whole SPHEREx sky",
      texto:
        "This is the map of the whole sky built from SPHEREx photos. Drag it to move around and use the mouse wheel to zoom " +
        "in. The dashed square marks the area we are studying.",
    },
    {
      ancla: "epocas",
      titulo: "Photos from 25 years ago",
      texto:
        "Here you change the map background: SPHEREx (2025–26), AllWISE (2010) or 2MASS (around 1999). “Blink” alternates " +
        "them for you. Nearby stars, like Barnard's, jump from place to place between one epoch and another.",
      prueba: "Try “Blink” after the tutorial.",
    },
    {
      ancla: "lambda",
      titulo: "SPHEREx's 102 colors",
      texto:
        "SPHEREx sees the sky in 102 colors of infrared light, grouped into six bands (D1 to D6). Open a band and pick a " +
        "channel: the same object can shine brightly in one color and barely at all in another.",
    },
    {
      ancla: "catalogos",
      titulo: "What's that star called?",
      texto:
        "This button shows the stars from other telescopes on top: Gaia, CatWISE and the names from SIMBAD. Hover over one " +
        "and I'll tell you its name.",
    },
    {
      ancla: "explorador-imagen",
      titulo: "One photo per visit",
      texto:
        "Here you see the photo SPHEREx took on each visit to this spot. The crosshair marks the object and the bar at the " +
        "bottom measures 30 arcseconds. Each little square is a pixel: the instrument sees the whole sky, not fine detail.",
    },
    {
      ancla: "explorador-tiempo",
      titulo: "The timeline",
      texto:
        "Each mark is a SPHEREx visit. Click or drag on the line and the photo changes date; ▶ plays them like a short video. " +
        "That's how Clyde Tombaugh discovered Pluto in 1930: by comparing photos from different dates.",
    },
    {
      ancla: "explorador-modos",
      titulo: "See what changed",
      texto:
        "Pick the band and the mode. In “Subtract vs t₀” the photo is compared with the first one: what appeared shows in red " +
        "and what left in blue. A touching red-blue pair is something that moved. “Subtract A − B” compares two dates you choose.",
      prueba: "Careful: not every spot is motion. Very bright objects saturate the camera.",
    },
    {
      ancla: "explorador-zoom",
      titulo: "Get closer",
      texto:
        "The motion we're looking for is one or two pixels, so it helps to zoom in. Zoom up to 8 times with these buttons, " +
        "the + and − keys or by pinching the touchpad, and drag the image to look around.",
    },
    {
      ancla: "explorador-rejilla",
      titulo: "Everything at a glance",
      texto: "This grid has every band and every date at once. Click any little square to see it large.",
    },
    {
      ancla: "prisma-ojo",
      titulo: "The infrared eye",
      texto:
        "I translate infrared colors into colors you can see: the short bands in blue, the middle ones in green and the long " +
        "ones in red. Cold things look red and hot stars look bluish.",
    },
    {
      ancla: "prisma-huella",
      titulo: "The light fingerprint",
      texto:
        "How bright the object is in each color: it's its fingerprint, and it reveals what it's made of and how hot it is. " +
        "The hollow points are photos where it was so bright it saturated the camera.",
    },
    {
      ancla: "spherix",
      titulo: "Here I am",
      texto:
        "Whenever you want, open me and ask: “take me to Antares”, some coordinates, “what am I looking at?” or “what is a " +
        "band?”. I'll answer and move the viewer for you.",
    },
    {
      ancla: "menu",
      titulo: "Mission Mode",
      texto:
        "This menu has Mission Mode: a journey through levels where you do what Tombaugh did with real photos and learn to " +
        "be skeptical of what looks like a discovery. At the end you earn the planet hunter badge.",
    },
    {
      titulo: "Now it's your turn!",
      texto:
        "Now you know AstroTRACK. The best thing is to try it: look at Epsilon Indi B, a pair of brown dwarfs 12 light-years " +
        "away, and compare the first date with the last to see how it shifts. Or test yourself in Mission Mode.",
    },
  ],

  final: {
    probar: "Try Epsilon Indi B",
    mision: "Go to Mission Mode",
    libre: "Explore freely",
  },

  pasosSimple: [
    {
      titulo: "Hi! I'm Spherix",
      texto:
        "Welcome to AstroTRACK. Here you see real photos from NASA's SPHEREx telescope, which looks at the whole sky every six " +
        "months. I'll show you how to use it in a minute.",
      prueba: "Use the ← → keys or the buttons. Press Esc to leave whenever you want.",
    },
    {
      ancla: "simple-objetos",
      titulo: "Five objects to start with",
      texto:
        "These buttons take you to the NASA challenge objects: three that move (Barnard, ε Indi B and WISE 0855) and two that " +
        "change brightness (RW Aurigae and R Draconis). The one you're looking at turns orange.",
    },
    {
      ancla: "simple-busca",
      titulo: "Search for anything",
      texto: "Type the name of one of those objects or some sky coordinates, like “133.79 -7.24”, and I'll take you there.",
    },
    {
      ancla: "simple-imagen",
      titulo: "The SPHEREx photo",
      texto:
        "This is a real photo of that spot in the sky. The orange circle marks the object and the line at the bottom measures " +
        "30 arcseconds. Tap the object to go to the next photo.",
    },
    {
      ancla: "simple-fechas",
      titulo: "The dates",
      texto:
        "SPHEREx passes over each spot every ~6 months: each button is one of those passes. “▶ Play” shows them one after " +
        "another, like a short video; if something jumps from place to place, it's moving.",
      prueba: "Pause and continue whenever you want; the space bar works too, and ← → step through dates.",
    },
    {
      ancla: "simple-ab",
      titulo: "Compare two dates",
      texto:
        "Pick one date and set it as A, another as B, and press “Show A − B”. What's in A shows in red and what's in B in " +
        "blue. A touching red and blue pair is something that moved.",
    },
    {
      ancla: "simple-luz",
      titulo: "The light you see",
      texto:
        "SPHEREx sees infrared light, which your eyes can't. Here you choose which: “Near” best shows Sun-like stars, " +
        "“Middle” cool stars and “Far” the coldest objects, such as brown dwarfs.",
    },
    {
      ancla: "simple-lado",
      titulo: "Where and when?",
      texto:
        "Here you can type the exact coordinates (R.A. and Dec) and use the calendar to choose from which date to which " +
        "you want to see the photos.",
    },
    {
      ancla: "simple-ciencia",
      titulo: "Want more?",
      texto:
        "Turn on “Science mode” for every tool: the map of the whole sky, SPHEREx's 102 colors, the catalogs from other " +
        "telescopes and the spectrum of each object.",
    },
    {
      titulo: "Now it's your turn!",
      texto:
        "Try Epsilon Indi B, a pair of brown dwarfs 12 light-years away: play the dates and watch it shift. Or switch to " +
        "Science mode whenever you want.",
    },
  ],

  finalSimple: {
    probar: "Try Epsilon Indi B",
    ciencia: "Open Science mode",
    libre: "Explore freely",
  },
};

/** Textos del tutorial en el idioma de la página. */
export const textosTutorial = (idioma: Idioma) => (idioma === "en" ? EN : ES);

/** Compatibilidad: los textos en español (antes se exportaba solo este objeto). */
export const tutorial = ES;
