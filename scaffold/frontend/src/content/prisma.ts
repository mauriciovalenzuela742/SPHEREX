/**
 * Prisma (visualizador multibanda): todos los textos. Dueña: Javiera (N).
 * Regla de honestidad: nada aquí afirma más de lo que muestran los datos. Si un objeto es demasiado
 * débil en una sola foto, se dice; si un punto está saturado, se dice.
 */
export const prisma = {
  titulo: "Prisma: la luz invisible en colores",
  intro:
    "SPHEREx no saca una foto: saca 102, cada una en un «color» de infrarrojo que tus ojos no ven. " +
    "Aquí las traducimos a colores visibles y armamos la huella de luz del objeto, como un prisma.",

  ojo: {
    titulo: "Ojo infrarrojo",
    texto:
      "Así se vería el cielo si tus ojos vieran infrarrojo: las bandas cortas (D1–D2) van en azul, las medias " +
      "(D3–D4) en verde y las largas (D5–D6) en rojo. Lo más frío se ve rojo; las estrellas calientes, azuladas.",
    medida: "El círculo marca dónde medimos la luz del objeto.",
    sinDatos: "Cargando las bandas…",
  },

  huella: {
    titulo: "Huella espectral",
    texto:
      "Cada punto es el brillo del objeto en una foto, ordenado por su color (longitud de onda). " +
      "La línea gris es la forma típica de las estrellas vecinas del mismo campo: compárala con la del objeto.",
    ejeX: "Longitud de onda (µm)",
    ejeY: "Brillo (mJy, escala logarítmica)",
    ojoHumano: "aquí ve tu ojo",
    spherex: "aquí ve SPHEREx",
    leyenda: {
      medida: "medida",
      limite: "demasiado débil (límite)",
      saturado: "saturado (demasiado brillante)",
      vecinas: "estrellas vecinas (forma)",
    },
    moleculas: "Regiones típicas donde absorben estas moléculas",
    caveat:
      "Valores aproximados (apertura fija de ~15″, sin calibración fina): sirven para ver la forma, no como " +
      "fotometría científica. Para eso existe la Spectrophotometry Tool de IRSA.",
    debil:
      "Este objeto es muy débil en una sola foto: la mayoría de los puntos son límites. Para verlo bien hay que " +
      "sumar muchas exposiciones («Exp. por visita» en el explorador).",
    saturadoAviso:
      "Este objeto es tan brillante que satura el detector en varias bandas: esos puntos se marcan huecos y no " +
      "se usan para la forma.",
    pista: "Pasa el mouse por un punto para ver esa foto en el explorador.",
  },


  // Rangos aproximados (µm) donde suelen aparecer bandas de absorción en el infrarrojo cercano.
  moleculas: [
    { nombre: "agua", formula: "H₂O", rangos: [[1.33, 1.48], [1.8, 1.95], [2.6, 2.95]] },
    { nombre: "metano", formula: "CH₄", rangos: [[2.2, 2.4], [3.2, 3.45]] },
    { nombre: "dióxido de carbono", formula: "CO₂", rangos: [[4.2, 4.35]] },
    { nombre: "monóxido de carbono", formula: "CO", rangos: [[4.55, 4.75]] },
  ] as { nombre: string; formula: string; rangos: [number, number][] }[],
};
