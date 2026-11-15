/**
 * Prisma (visualizador multibanda): todos los textos. Dueña: Javiera (N).
 * Regla de honestidad: nada aquí afirma más de lo que muestran los datos. Si un objeto es demasiado
 * débil en una sola foto, se dice; si un punto está saturado, se dice.
 */
import { useIdioma } from "../state/idioma";

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

/** Versión en inglés: misma forma que `prisma`. */
export const prismaEN: typeof prisma = {
  titulo: "Prism: invisible light in colors",
  intro:
    "SPHEREx doesn't take one photo: it takes 102, each in an infrared \u201ccolor\u201d your eyes can't see. " +
    "Here we translate them into visible colors and build the object's light fingerprint, like a prism.",

  ojo: {
    titulo: "Infrared eye",
    texto:
      "This is how the sky would look if your eyes saw infrared: short bands (D1–D2) in blue, middle " +
      "(D3–D4) in green and long (D5–D6) in red. The coldest things look red; hot stars look bluish.",
    medida: "The circle marks where we measure the object's light.",
    sinDatos: "Loading the bands…",
  },

  huella: {
    titulo: "Spectral fingerprint",
    texto:
      "Each point is the object's brightness in one photo, sorted by its color (wavelength). " +
      "The gray line is the typical shape of neighboring stars in the same field: compare it with the object's.",
    ejeX: "Wavelength (µm)",
    ejeY: "Brightness (mJy, log scale)",
    ojoHumano: "your eye sees here",
    spherex: "SPHEREx sees here",
    leyenda: {
      medida: "measurement",
      limite: "too faint (upper limit)",
      saturado: "saturated (too bright)",
      vecinas: "neighboring stars (shape)",
    },
    moleculas: "Typical regions where these molecules absorb",
    caveat:
      "Approximate values (fixed ~15″ aperture, no fine calibration): good for seeing the shape, not as " +
      "scientific photometry. For that there is IRSA's Spectrophotometry Tool.",
    debil:
      "This object is very faint in a single photo: most points are upper limits. To see it well you need to " +
      "stack many exposures (\u201cExp. per visit\u201d in the explorer).",
    saturadoAviso:
      "This object is so bright it saturates the detector in several bands: those points are drawn hollow and " +
      "not used for the shape.",
    pista: "Hover over a point to see that photo in the explorer.",
  },

  moleculas: [
    { nombre: "water", formula: "H₂O", rangos: [[1.33, 1.48], [1.8, 1.95], [2.6, 2.95]] },
    { nombre: "methane", formula: "CH₄", rangos: [[2.2, 2.4], [3.2, 3.45]] },
    { nombre: "carbon dioxide", formula: "CO₂", rangos: [[4.2, 4.35]] },
    { nombre: "carbon monoxide", formula: "CO", rangos: [[4.55, 4.75]] },
  ],
};

/** Textos del Prisma en el idioma activo. */
export function usePrisma() {
  const { idioma } = useIdioma();
  return idioma === "en" ? prismaEN : prisma;
}
