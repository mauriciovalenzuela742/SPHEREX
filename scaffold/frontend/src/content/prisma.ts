/**
 * Prisma (visualizador multibanda): todos los textos. Dueña: Javiera (N).
 * Regla de honestidad: nada aquí afirma más de lo que muestran los datos. Si un objeto es demasiado
 * débil en una sola foto, se dice; si un punto está saturado, se dice.
 */
import { useIdioma } from "../state/idioma";

export const prisma = {
  titulo: "Prisma: la luz invisible en colores",
  intro:
    "SPHEREx mira el cielo en 102 «colores» de infrarrojo que tus ojos no ven. " +
    "Aquí los traducimos a colores visibles y, midiendo el brillo del objeto en cada foto, armamos su espectro: " +
    "su huella de luz, como un prisma.",

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
    saturadoAviso: (n: number) =>
      `${n} ${n === 1 ? "punto tiene" : "puntos tienen"} píxeles saturados o sin dato en la apertura: van como △ ` +
      "en la franja de arriba («saturado»), sin altura, y no se usan para la forma.",
    todoSaturado:
      "Demasiado brillante, sin espectro: en SPHEREx todos o casi todos los puntos están saturados. La franja de arriba solo " +
      "marca en qué colores hay fotos; el brillo real es mayor de lo que el detector registra.",
    unaBanda: (b: number) =>
      `Solo hay fotos de la banda D${b}: eso no alcanza para ver la forma del espectro. Carga las 6 bandas ` +
      "(«Bandas a cargar» en el explorador, ~1 min).",
    cargarTodas: "Cargar las 6 bandas",
    fechasDistintas: (n: number, desde: string, hasta: string) =>
      `Ojo: los puntos vienen de fotos de ${n} fechas distintas (${desde} a ${hasta}). Si el objeto cambia de ` +
      "brillo, el espectro mezcla momentos distintos.",
    pista: "Pasa el mouse por un punto para ver esa foto en el explorador.",
    sospechosoCorto: "sospechoso",
    bordeSatCorto: "al borde de la saturación",
    bordeSat: (n: number) =>
      `${n} ${n === 1 ? "medida va atenuada" : "medidas van atenuadas"}: son de bandas donde la mayoría de las fotos ` +
      "saturan, así que probablemente subestiman el brillo. No se usan para la forma ni para la ficha.",
    sospechosos: (n: number) =>
      `${n} puntos van atenuados: son medidas sospechosas (luz de otra fuente dentro de la apertura, o un ` +
      "pico aislado como un rayo cósmico). No se usan para la forma ni para la ficha.",
    porPasada:
      "Cada color es una pasada: SPHEREx vuelve al mismo cielo cada ~6 meses. Compara los colores para ver si " +
      "el objeto cambió; la línea une las medianas de cada pasada.",
  },

  fuente: {
    titulo: "Datos",
    pre: "todas las exposiciones (precalculado)",
    vivo: "fotos del explorador (en vivo)",
    notaPre: (fecha: string) =>
      `Precalculado el ${fecha} con cada exposición de SPHEREx en IRSA (no solo las fotos del explorador).`,
  },

  pasadas: {
    titulo: "Pasadas",
    todas: "todas",
  },

  ficha: {
    titulo: "Ficha del astro",
    seParece: "Se parece a:",
    indeterminado: "Tipo probable: no se puede decir con estos datos.",
    porque: "Porque:",
    tipos: {
      estrella: "una estrella",
      estrella_joven_polvo: "una estrella joven con polvo",
      enana_marron: "una enana marrón",
    } as Record<string, string>,
    confianza: { baja: "confianza baja", media: "confianza media" } as Record<string, string>,
    soloCompletas: (n: number) => `Clasificado solo con ${n === 1 ? "la pasada completa" : `las ${n} pasadas completas`} (90 o más de 102 canales).`,
    incompleta: (n: number) =>
      `Esta pasada está incompleta (${n} de 102 canales): sola no alcanza para clasificar. Mira «todas» u otra pasada.`,
    aviso:
      "Orientativo: reglas simples sobre la forma del espectro entre 0,75 y 5 µm, sin modelos ni catálogos. " +
      "No reemplaza una clasificación espectral.",
  },

  cambio: {
    titulo: "¿Qué cambió entre pasadas?",
    frase: (sube: boolean, rango: string, meses: number, razon: string) =>
      `${sube ? "Más brillante" : "Más débil"} en ${rango} que hace ${meses} ${meses === 1 ? "mes" : "meses"} ` +
      `(×${razon}).`,
    sinCambio: (n: number) =>
      `Sin cambios claros: en ${n} ${n === 1 ? "tramo comparable" : "tramos comparables"} la diferencia no supera ` +
      "el ruido (3σ).",
    sinComun: "Las pasadas no tienen medidas en los mismos colores: no se pueden comparar.",
    comparando: (a: string, b: string) => `Comparando ${a} con ${b} (razón = después / antes).`,
    ruido: "dentro del ruido",
    parcial:
      "Comparación parcial: no hay dos pasadas completas (90 o más de 102 canales), así que se compara al menos " +
      "una incompleta. Tómalo con cautela.",
    regla:
      "Solo se dice que cambió si la diferencia supera 3σ, contando un 5 % de error de calibración además del " +
      "ruido del cielo.",
  },


  // Rangos aproximados (µm) donde suelen aparecer bandas de absorción en el infrarrojo cercano.
  // `refs[i]`: tramos vecinos sin esa absorción contra los que se compara el rango `rangos[i]` para decir si
  // «falta luz» ahí (regla de 3σ con piso de calibración, ver prisma/moleculas.ts).
  moleculas: [
    {
      nombre: "agua", formula: "H₂O", rangos: [[1.33, 1.48], [1.8, 1.95], [2.6, 2.95]],
      refs: [[[1.2, 1.32], [1.5, 1.75]], [[1.5, 1.75], [2.0, 2.2]], [[2.0, 2.2]]],
      texto:
        "Agua (H₂O): en estrellas frías y enanas marrones es vapor de su atmósfera; en las nubes frías donde nacen " +
        "estrellas aparece como hielo sobre el polvo, cerca de 3 µm.",
    },
    {
      nombre: "metano", formula: "CH₄", rangos: [[2.2, 2.4], [3.2, 3.45]],
      refs: [[[2.0, 2.18]], [[3.9, 4.2]]],
      texto:
        "Metano (CH₄): solo existe como gas en atmósferas muy frías, como las de enanas marrones y planetas " +
        "gigantes, y se come la luz cerca de 2,3 y 3,3 µm. También hay hielo de metano en nubes frías.",
    },
    {
      nombre: "dióxido de carbono", formula: "CO₂", rangos: [[4.2, 4.35]],
      refs: [[[4.0, 4.15], [4.4, 4.5]]],
      texto:
        "Dióxido de carbono (CO₂): hielo en los granos de polvo de nubes frías (4,27 µm), uno de los blancos de " +
        "SPHEREx; también gas en enanas marrones muy frías.",
    },
    {
      nombre: "monóxido de carbono", formula: "CO", rangos: [[4.55, 4.75]],
      refs: [[[4.4, 4.5], [4.8, 5.0]]],
      texto:
        "Monóxido de carbono (CO): gas en estrellas frías y enanas marrones (~4,6 µm) y hielo en nubes frías " +
        "(4,67 µm).",
    },
  ] as { nombre: string; formula: string; rangos: [number, number][]; refs: [number, number][][]; texto: string }[],
  faltaLuz: (nombre: string, rango: string, razon: string, sigma: string) =>
    `Aquí falta luz: posible ${nombre}. En ${rango} el brillo es ×${razon} el de los tramos vecinos (${sigma}σ).`,
  faltaLuzResumen: (lista: string) =>
    `Falta luz (más de 3σ bajo sus vecinos) en zonas de: ${lista}. Pasa el mouse por una zona sombreada para ` +
    "ver qué molécula es y cuánto falta.",
  sinDepresion: "En este objeto no se ve una caída clara de luz en este rango (o faltan medidas).",
};

/** Versión en inglés: misma forma que `prisma`. */
export const prismaEN: typeof prisma = {
  titulo: "Prism: invisible light in colors",
  intro:
    "SPHEREx sees the sky in 102 infrared \u201ccolors\u201d your eyes can't see. " +
    "Here we translate them into visible colors and, by measuring the object's brightness in each photo, build its spectrum: " +
    "its light fingerprint, like a prism.",

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
    saturadoAviso: (n: number) =>
      `${n} ${n === 1 ? "point has" : "points have"} saturated or missing pixels in the aperture: they are hollow △ ` +
      "in the top strip (“saturated”), with no height, and are not used for the shape.",
    todoSaturado:
      "Too bright, no spectrum: in SPHEREx every point, or nearly every point, is saturated. The top strip only marks which colors " +
      "have photos; the real brightness is higher than the detector records.",
    unaBanda: (b: number) =>
      `Only band D${b} has photos: that is not enough to see the shape of the spectrum. Load all 6 bands ` +
      "(\u201cBands to load\u201d in the explorer, ~1 min).",
    cargarTodas: "Load all 6 bands",
    fechasDistintas: (n: number, desde: string, hasta: string) =>
      `Note: the points come from photos taken on ${n} different dates (${desde} to ${hasta}). If the object ` +
      "changes brightness, the spectrum mixes different moments.",
    pista: "Hover over a point to see that photo in the explorer.",
    sospechosoCorto: "suspect",
    bordeSatCorto: "near saturation",
    bordeSat: (n: number) =>
      `${n} ${n === 1 ? "measurement is" : "measurements are"} faded: they come from bands where most photos ` +
      "saturate, so they probably underestimate the brightness. They are not used for the shape or the card.",
    sospechosos: (n: number) =>
      `${n} points are faded: they are suspect measurements (light from another source inside the aperture, ` +
      "or an isolated spike such as a cosmic ray). They are not used for the shape or the card.",
    porPasada:
      "Each color is one pass: SPHEREx returns to the same sky every ~6 months. Compare the colors to see " +
      "whether the object changed; the line joins each pass's medians.",
  },

  fuente: {
    titulo: "Data",
    pre: "all exposures (precomputed)",
    vivo: "explorer photos (live)",
    notaPre: (fecha: string) =>
      `Precomputed on ${fecha} from every SPHEREx exposure in IRSA (not just the explorer's photos).`,
  },

  pasadas: {
    titulo: "Passes",
    todas: "all",
  },

  ficha: {
    titulo: "Object card",
    seParece: "Looks like:",
    indeterminado: "Probable type: cannot be told from this data.",
    porque: "Because:",
    tipos: {
      estrella: "a star",
      estrella_joven_polvo: "a young star with dust",
      enana_marron: "a brown dwarf",
    },
    confianza: { baja: "low confidence", media: "medium confidence" },
    soloCompletas: (n: number) => `Classified with ${n === 1 ? "the complete pass" : `the ${n} complete passes`} only (90 or more of 102 channels).`,
    incompleta: (n: number) =>
      `This pass is incomplete (${n} of 102 channels): on its own it is not enough to classify. See \u201call\u201d or another pass.`,
    aviso:
      "Indicative only: simple rules on the shape of the spectrum between 0.75 and 5 µm, no models or catalogs. " +
      "It does not replace a spectral classification.",
  },

  cambio: {
    titulo: "What changed between passes?",
    frase: (sube: boolean, rango: string, meses: number, razon: string) =>
      `${sube ? "Brighter" : "Fainter"} at ${rango} than ${meses} ${meses === 1 ? "month" : "months"} earlier ` +
      `(×${razon}).`,
    sinCambio: (n: number) =>
      `No clear change: in ${n} comparable ${n === 1 ? "range" : "ranges"} the difference does not exceed ` +
      "the noise (3σ).",
    sinComun: "The passes have no measurements in the same colors: they cannot be compared.",
    comparando: (a: string, b: string) => `Comparing ${a} with ${b} (ratio = after / before).`,
    ruido: "within noise",
    parcial:
      "Partial comparison: there are not two complete passes (90 or more of 102 channels), so at least one " +
      "incomplete pass is compared. Take it with caution.",
    regla:
      "A change is only claimed if the difference exceeds 3σ, counting a 5% calibration error on top of the " +
      "sky noise.",
  },

  moleculas: [
    {
      nombre: "water", formula: "H₂O", rangos: [[1.33, 1.48], [1.8, 1.95], [2.6, 2.95]],
      refs: [[[1.2, 1.32], [1.5, 1.75]], [[1.5, 1.75], [2.0, 2.2]], [[2.0, 2.2]]],
      texto:
        "Water (H₂O): in cool stars and brown dwarfs it is vapor in the atmosphere; in the cold clouds where stars " +
        "are born it appears as ice on dust grains, near 3 µm.",
    },
    {
      nombre: "methane", formula: "CH₄", rangos: [[2.2, 2.4], [3.2, 3.45]],
      refs: [[[2.0, 2.18]], [[3.9, 4.2]]],
      texto:
        "Methane (CH₄): it only exists as a gas in very cold atmospheres, like those of brown dwarfs and giant " +
        "planets, and it absorbs light near 2.3 and 3.3 µm. There is also methane ice in cold clouds.",
    },
    {
      nombre: "carbon dioxide", formula: "CO₂", rangos: [[4.2, 4.35]],
      refs: [[[4.0, 4.15], [4.4, 4.5]]],
      texto:
        "Carbon dioxide (CO₂): ice on the dust grains of cold clouds (4.27 µm), one of SPHEREx's targets; also a " +
        "gas in very cold brown dwarfs.",
    },
    {
      nombre: "carbon monoxide", formula: "CO", rangos: [[4.55, 4.75]],
      refs: [[[4.4, 4.5], [4.8, 5.0]]],
      texto: "Carbon monoxide (CO): gas in cool stars and brown dwarfs (~4.6 µm) and ice in cold clouds (4.67 µm).",
    },
  ],
  faltaLuz: (nombre: string, rango: string, razon: string, sigma: string) =>
    `Light is missing here: possible ${nombre}. At ${rango} the brightness is ×${razon} that of the neighboring ranges (${sigma}σ).`,
  faltaLuzResumen: (lista: string) =>
    `Light is missing (more than 3σ below its neighbors) in the zones of: ${lista}. Hover over a shaded zone ` +
    "to see which molecule it is and how much is missing.",
  sinDepresion: "This object shows no clear drop in light in this range (or measurements are missing).",
};

/** Textos del Prisma en el idioma activo. */
export function usePrisma() {
  const { idioma } = useIdioma();
  return idioma === "en" ? prismaEN : prisma;
}
