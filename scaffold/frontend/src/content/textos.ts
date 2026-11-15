/**
 * Textos de la interfaz. Dueña: Javiera (N).
 * Todo lo que el usuario lee sale de aquí, para que se pueda corregir sin tocar componentes.
 * Los textos de Spherix están en content/spherix.ts.
 */

export type Idioma = "es" | "en";

const ES = {
  titulo: "AstroTRACK",
  bienvenida: "Bienvenido a AstroTRACK",
  queSomos:
    "Una ventana al cielo infrarrojo: escribe un lugar del cielo y mira cómo cambia con el tiempo, " +
    "con imágenes reales de la misión SPHEREx de la NASA.",
  queEsSpherex:
    "SPHEREx es un telescopio espacial de la NASA que, desde 2025, fotografía todo el cielo cada seis " +
    "meses en 102 colores de luz infrarroja.",
  empecemos: "Empecemos",
  empecemosTutorial: "Empecemos con un tutorial",
  tutorialAyuda: "Spherix te muestra todo en un par de minutos.",
  inicio: "Inicio",
  visor: "Visor",
  modoMision: "Modo Misión",
  verTutorial: "Ver tutorial",
  repositorio: "Repositorio",
  atribucion:
    "This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of " +
    "Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California " +
    "Institute of Technology, and is funded by the National Aeronautics and Space Administration. Datos vía NASA/IPAC IRSA.",
};

const EN: typeof ES = {
  titulo: "AstroTRACK",
  bienvenida: "Welcome to AstroTRACK",
  queSomos:
    "A window into the infrared sky: enter a location in the sky and watch how it changes over time, " +
    "with real images from NASA's SPHEREx mission.",
  queEsSpherex:
    "SPHEREx is a NASA space telescope that, since 2025, photographs the entire sky every six " +
    "months in 102 colors of infrared light.",
  empecemos: "Get started",
  empecemosTutorial: "Start with a tutorial",
  tutorialAyuda: "Spherix will show you everything in a couple of minutes.",
  inicio: "Home",
  visor: "Viewer",
  modoMision: "Mission Mode",
  verTutorial: "View tutorial",
  repositorio: "Repository",
  atribucion:
    "This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of " +
    "Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California " +
    "Institute of Technology, and is funded by the National Aeronautics and Space Administration. Data via NASA/IPAC IRSA.",
};

export const TRADUCCIONES = { es: ES, en: EN };

/** Hook/helper: devuelve los textos del idioma actual. */
export function getTraducciones(idioma: Idioma) {
  return TRADUCCIONES[idioma];
}

/** Compatibilidad con código que importaba `textos` directamente. */
export const textos = ES;
