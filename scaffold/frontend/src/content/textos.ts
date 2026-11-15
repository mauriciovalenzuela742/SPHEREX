/**
 * Textos de la interfaz. Dueña: Javiera (N).
 * Todo lo que el usuario lee sale de aquí, para que se pueda corregir sin tocar componentes.
 * Los textos de Spherix están en content/spherix.ts.
 */

export type Idioma = "es" | "en";

const ES = {
  // Header / nav
  titulo: "AstroTRACK",
  inicio: "Inicio",
  visor: "Visor",
  modoMision: "Modo Misión",
  verTutorial: "Ver tutorial",
  repositorio: "Repositorio",

  // Landing
  bienvenida: "Bienvenido a AstroTRACK",
  queEsSec: "¿Qué somos?",
  queSomos:
    "Una ventana al cielo infrarrojo: escribe un lugar del cielo y mira cómo cambia con el tiempo, " +
    "con imágenes reales de la misión SPHEREx de la NASA.",
  queEsSpherex:
    "SPHEREx es un telescopio espacial de la NASA que, desde 2025, fotografía todo el cielo cada seis " +
    "meses en 102 colores de luz infrarroja.",
  empecemos: "Empecemos",
  empecemosTutorial: "Empecemos con un tutorial",
  tutorialAyuda: "Spherix te muestra todo en un par de minutos.",

  // Explorador
  exploradorTitulo: "Explorador SPHEREx",
  exploradorHint: "Arrastra o pasa el mouse por la línea de tiempo para cambiar la fecha.",
  modoImagen: "Imagen",
  modoResta: "Resta vs t₀",
  modoColor: "Color",
  modoImagenDesc: "Brillo con escala común para todas las fechas de la banda. La mira marca el punto pedido.",
  modoRestaDesc: "Rojo = brillo que aparece respecto de t₀ · Azul = brillo que estaba. Un par rojo/azul que se separa al avanzar el tiempo = movimiento.",
  modoColorDesc: "Primera visita en rojo, la actual en cian. Lo quieto se ve blanco.",
  queCargar: "Qué cargar",
  desde: "Desde",
  hasta: "Hasta",
  bandaVisible: "Banda visible",
  modo: "Modo",
  estaImagen: "Esta imagen",
  cargando: "Cargando",
  listo: "Listo:",
  imagenes: "imágenes",
  reintentar: "Reintentar",
  reintentarEsta: "Reintentar esta imagen",
  reintentando: "Reintentando…",
  reintentarFallidas: (n: number) => `Reintentar las ${n} con error`,
  fecha: "Fecha (UTC)",
  longitudOnda: "Longitud de onda",
  exposiciones: "Exposiciones",
  mediana: (n: number) => `mediana de ${n}`,
  acercar: "Acercar",
  alejar: "Alejar",
  volverMira: "Volver a la mira",
  visitaAnterior: "Visita anterior",
  visitaSiguiente: "Visita siguiente",
  reproducir: "Reproducir",
  pausa: "Pausa",
  cieloDesc: (band: string) =>
    `Cielo: cubo SPHEREx DR1 de IRSA (mosaico de todas las épocas, sin eje de tiempo). Banda ${band}, canal central.`,

  // Épocas del visor: trayectoria y movimiento reducido
  trayectoriaMostrar: "Mostrar trayectoria",
  trayectoriaExplica:
    "Los círculos marcan dónde debía estar el objeto en la fecha de cada imagen, según su movimiento propio; la flecha, hacia dónde se mueve.",
  epocasAlternar: "Alternar época",
  epocasMovimientoReducido:
    "Tu sistema pide reducir el movimiento: el parpadeo automático está apagado. Usa «Alternar época» para cambiar de imagen a mano.",

  // Footer
  atribucion:
    "This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of " +
    "Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California " +
    "Institute of Technology, and is funded by the National Aeronautics and Space Administration. Datos vía NASA/IPAC IRSA.",
};

const EN: typeof ES = {
  titulo: "AstroTRACK",
  inicio: "Home",
  visor: "Viewer",
  modoMision: "Mission Mode",
  verTutorial: "View tutorial",
  repositorio: "Repository",

  bienvenida: "Welcome to AstroTRACK",
  queEsSec: "What are we?",
  queSomos:
    "A window into the infrared sky: enter a location in the sky and watch how it changes over time, " +
    "with real images from NASA's SPHEREx mission.",
  queEsSpherex:
    "SPHEREx is a NASA space telescope that, since 2025, photographs the entire sky every six " +
    "months in 102 colors of infrared light.",
  empecemos: "Get started",
  empecemosTutorial: "Start with a tutorial",
  tutorialAyuda: "Spherix will show you everything in a couple of minutes.",

  exploradorTitulo: "SPHEREx Explorer",
  exploradorHint: "Drag or hover over the timeline to change the date.",
  modoImagen: "Image",
  modoResta: "Subtract vs t₀",
  modoColor: "Color",
  modoImagenDesc: "Brightness with a common scale for all dates in the band. The crosshair marks the requested point.",
  modoRestaDesc: "Red = brightness that appeared relative to t₀ · Blue = brightness that was there. A red/blue pair that separates over time = motion.",
  modoColorDesc: "First visit in red, current in cyan. Still objects appear white.",
  queCargar: "What to load",
  desde: "From",
  hasta: "To",
  bandaVisible: "Visible band",
  modo: "Mode",
  estaImagen: "This image",
  cargando: "Loading",
  listo: "Done:",
  imagenes: "images",
  reintentar: "Retry",
  reintentarEsta: "Retry this image",
  reintentando: "Retrying…",
  reintentarFallidas: (n: number) => `Retry the ${n} with errors`,
  fecha: "Date (UTC)",
  longitudOnda: "Wavelength",
  exposiciones: "Exposures",
  mediana: (n: number) => `median of ${n}`,
  acercar: "Zoom in",
  alejar: "Zoom out",
  volverMira: "Back to crosshair",
  visitaAnterior: "Previous visit",
  visitaSiguiente: "Next visit",
  reproducir: "Play",
  pausa: "Pause",
  cieloDesc: (band: string) =>
    `Sky: SPHEREx DR1 cube from IRSA (mosaic of all epochs, no time axis). Band ${band}, central channel.`,

  trayectoriaMostrar: "Show trajectory",
  trayectoriaExplica:
    "The circles mark where the object should have been on the date of each image, from its proper motion; the arrow shows where it is moving.",
  epocasAlternar: "Switch epoch",
  epocasMovimientoReducido:
    "Your system asks for reduced motion: automatic blinking is off. Use «Switch epoch» to change images by hand.",

  atribucion:
    "This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of " +
    "Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California " +
    "Institute of Technology, and is funded by the National Aeronautics and Space Administration. Data via NASA/IPAC IRSA.",
};

export const TRADUCCIONES = { es: ES, en: EN };

export function getTraducciones(idioma: Idioma) {
  return TRADUCCIONES[idioma];
}

/** Compatibilidad con código que importaba `textos` directamente. */
export const textos = ES;
