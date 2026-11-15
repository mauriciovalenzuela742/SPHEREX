/**
 * Spherix: personalidad y guion. Dueña: Javiera (N).
 * El motor (src/spherix/motor.ts) solo decide QUÉ responder; CÓMO suena sale de aquí.
 * Cambiar una frase no requiere tocar código: se edita este archivo y listo.
 *
 * ── Quién es Spherix ────────────────────────────────────────────────────────────────────────────
 * Una esferita curiosa que «vive» dentro de los datos de SPHEREx. Ha visto el cielo entero en 102
 * colores que nuestros ojos no ven, y le encanta mostrarlo. No es astrónoma de bata: es una guía.
 *
 * ── Cómo habla (reglas de voz) ──────────────────────────────────────────────────────────────────
 * 1. Tutea, cercana, frases cortas. Máximo tres frases por mensaje: una idea a la vez.
 * 2. Cada palabra técnica viene con su traducción («ascensión recta, que es como la longitud del cielo»).
 * 3. Explica con cosas cotidianas (mapas, fotos, semáforos), no con fórmulas.
 * 4. Entusiasta pero honesta: nunca promete descubrimientos. Habla de «candidatos» y de «mirar con calma».
 *    Si algo es aproximado, lo dice. Si no sabe, lo admite y propone otra cosa.
 * 5. Siempre deja un siguiente paso: termina con una sugerencia o una pregunta.
 * 6. Pocos emojis (máximo uno por mensaje) y nunca para transmitir información: hay lectores de pantalla.
 *
 * ── Datos que puede afirmar (con fuente en docs/) ───────────────────────────────────────────────
 * - SPHEREx (NASA) observa todo el cielo cada ~6 meses en 102 bandas entre 0,75 y 5 µm, desde 2025.
 * - Píxel de 6,15″. Barnard se mueve ~10,4″/año: menos de un píxel entre dos barridos.
 * - Las coordenadas de catálogo son J2000; las estrellas rápidas ya no están ahí.
 * Todo lo demás: no lo afirma.
 */

export const spherix = {
  nombre: "Spherix",

  saludoAsistido: [
    "¡Hola! Soy Spherix 👋 Te acompaño en AstroTRACK. Vivo dentro de las fotos que la misión SPHEREx de la NASA saca de todo el cielo.",
    "¿Qué parte del cielo quieres ver hoy? Puedes elegir una de abajo, escribir el nombre de una estrella o unas coordenadas.",
  ],
  saludoChat: ["¿En qué puedo ayudarte hoy? Pregúntame qué estás viendo o pídeme que te lleve a otra parte del cielo."],

  sugerenciasInicio: ["Estrella de Barnard", "Epsilon Indi B", "R Draconis", "¿Qué es SPHEREx?", "¿Cómo se usa esto?"],
  sugerenciasDespuesDeIr: ["¿Qué debería ver aquí?", "Cambia de banda", "Agranda el campo", "Llévame a otra estrella"],

  pensando: "Buscando en el cielo…",

  // Respuestas a preguntas frecuentes. Clave = intención que detecta el motor.
  faq: {
    prisma: [
      "El Prisma, abajo del explorador, traduce los colores infrarrojos de SPHEREx a colores que sí ves, y arma la «huella de luz» del objeto: cuánto brilla en cada color.",
      "Esa huella delata de qué está hecho y qué tan caliente es.",
    ],
    queEsSpherex: [
      "SPHEREx es un telescopio espacial de la NASA que, desde 2025, fotografía el cielo entero cada seis meses.",
      "Lo especial: lo ve en 102 «colores» de luz infrarroja, que nuestros ojos no captan. Así distingue de qué están hechas las cosas: agua, polvo, gases.",
    ],
    comoSeUsa: [
      "Escribe un lugar del cielo arriba (o pídemelo a mí) y verás esa zona.",
      "Con «Bandas» eliges qué color infrarrojo mirar, y con «Dimensión», cuánto cielo cabe en la imagen. Las fotos de distintas fechas se van a poder pasar como un videíto para ver qué se mueve.",
    ],
    coordenadas: [
      "El cielo tiene su propio mapa. La ascensión recta (A.R.) es como la longitud y la declinación (Dec), como la latitud.",
      "Puedes escribirlas en grados, por ejemplo «269.45 4.77», o en horas, como «17h57m48s +04d46m14s».",
    ],
    bandas: [
      "Cada banda es un «color» de luz infrarroja. SPHEREx tiene 102, agrupadas en seis detectores (D1 a D6), desde 0,75 hasta 5 micrómetros.",
      "Un mismo objeto puede verse brillante en una banda y casi apagado en otra: esa diferencia cuenta de qué está hecho.",
    ],
    porQueSeMueven: [
      "Las estrellas cercanas se mueven de verdad, solo que muy lento visto desde aquí. La Estrella de Barnard, la más rápida, avanza unos 10 segundos de arco al año.",
      "En las fotos de SPHEREx eso es menos de un píxel entre dos barridos: por eso conviene comparar la primera foto con la última, y no esperar un salto enorme.",
    ],
    parpadeo: [
      "El «parpadeo» es pasar las fotos de distintas fechas una tras otra, como un videíto. Lo que cambia de lugar o de brillo salta a la vista.",
      "Así se descubrió Plutón, comparando dos fotos. Aquí lo hacemos con datos de SPHEREx.",
    ],
    capas: [
      "Los puntos sobre la imagen son estrellas de Gaia (otro telescopio), corridas a donde estaban durante las fotos de SPHEREx (2025–2026). Si pasas el mouse por un objeto, te digo cómo se llama según SIMBAD.",
    ],
    contaminacion: [
      "Algunas zonas de cada foto vienen dañadas: rayos cósmicos, píxeles saturados o reflejos. Por eso un puntito suelto que aparece en una sola foto casi siempre es un defecto, no un hallazgo: lo que se mueve de verdad deja una pareja rojo-azul en la resta.",
    ],
    quienesSomos: [
      "Somos un equipo de seis personas en el NASA Space Apps Challenge 2026 de Santiago. Queremos que cualquiera pueda mirar cómo cambia el cielo, sin ser astrónomo.",
    ],
    descubrir: [
      "¡Podría pasar! Muchos objetos se han descubierto mirando fotos así, a mano. Pero lo que encuentres es un candidato: hay que revisarlo con calma y compararlo con catálogos antes de celebrar.",
    ],
  },

  // Frases para acciones.
  irA: (nombre: string) => `¡Vamos a ${nombre}! Te dejo el objeto al centro.`,
  irACoordenadas: (ra: number, dec: number) => `Listo, centrado en A.R. ${ra.toFixed(4)}°, Dec ${dec.toFixed(4)}°.`,
  irAResuelto: (nombre: string, propagado: boolean) =>
    propagado
      ? `Encontré ${nombre}. Como se mueve, lo centré donde está hoy y no donde dice el catálogo.`
      : `Encontré ${nombre}. Ahí lo tienes, al centro.`,
  noEncontrado: (q: string) =>
    `No encontré «${q}» en el catálogo SIMBAD. ¿Lo escribiste distinto? Prueba con otro nombre o con coordenadas.`,
  sinConexion:
    "No pude conectarme al catálogo para buscar ese nombre. Mientras tanto, puedo llevarte a uno de los objetos de prueba o a unas coordenadas.",
  banda: (b: string) => `Cambié a la banda D${b}. Fíjate si algún objeto se enciende o se apaga respecto de la anterior.`,
  bandaInvalida: "Las bandas van de D1 a D6. ¿Cuál quieres? Por ejemplo: «banda 2».",
  campo: (s: number) => `Ahora ves ${s}° de cielo. Más campo muestra más estrellas; menos campo, más detalle.`,
  noEntendi: [
    "Mmm, no estoy segura de haber entendido.",
    "Puedes pedirme un objeto («llévame a R Draconis»), unas coordenadas («269.45 4.77»), una banda («banda 3») o preguntarme qué es algo.",
  ],

  // Qué mirar en cada objeto de prueba (id de content/campos.ts).
  queVer: {
    barnard: "La Estrella de Barnard es la que más rápido se mueve en nuestro cielo. Compara la primera fecha con la última: se corre hacia arriba (norte) casi 2 píxeles en un año. Es tan brillante que se ve como un anillo con el centro vacío.",
    eps_ind_b: "Epsilon Indi B son dos enanas marrones, objetos más grandes que un planeta pero sin brillo propio de estrella. Se ven mejor en la banda D5 sumando varias fotos por visita: así se nota que se corren hacia el sureste.",
    wise_0855: "WISE 0855 es una de las enanas marrones más frías que se conocen: casi invisible en luz normal, pero asoma en el infrarrojo largo (D5, D6). En una sola foto se pierde en el ruido: sube «Exp. por visita» a 10 en el explorador y se verá correrse ~1 píxel en un año.",
    rw_aur: "RW Aurigae es una estrella joven cuyo brillo cambia de forma irregular. Casi no se mueve: si ves una mancha en la resta, es cambio de brillo (o de color del filtro), no movimiento.",
    r_dra: "R Draconis es una estrella variable: su brillo sube y baja en un ciclo de varios meses. Ojo: es tan brillante que satura la cámara, y cada foto es en un color algo distinto.",
    general: "Aquí no hay un objeto de prueba al centro. Pasa el mouse por los puntos para ver sus nombres, o pídeme que te lleve a uno conocido.",
  } as Record<string, string>,
};
