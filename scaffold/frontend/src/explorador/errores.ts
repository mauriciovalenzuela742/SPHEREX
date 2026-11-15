/**
 * Mensajes de error legibles para el explorador. Dueña: Antonia (V1), tarea #5 de docs/11.
 *
 * El servidor (FastAPI) manda `detail` como texto o, si rechaza un parámetro, como una lista de objetos
 * ({loc, msg, ctx}). Mostrar esa lista tal cual daba «[object Object]». Si el servidor cae, a veces responde
 * una página HTML en vez de JSON, y `r.json()` daba «Unexpected token <».
 */

const CAMPOS: Record<string, string> = {
  ra: "A.R.",
  dec: "Dec",
  size: "Dimensión",
  band: "Banda",
  bands: "Bandas",
  start: "Desde",
  end: "Hasta",
  from: "Desde",
  to: "Hasta",
  visit: "Visita",
  per_visit: "Exp. por visita",
};

type Problema = { loc?: (string | number)[]; msg?: string; type?: string; ctx?: Record<string, unknown> };

function deProblema(p: Problema): string {
  const clave = String(p.loc?.[p.loc.length - 1] ?? "");
  const campo = CAMPOS[clave] ?? clave;
  const c = p.ctx ?? {};
  if (p.type === "less_than_equal") return `«${campo}» puede ser como máximo ${c.le}.`;
  if (p.type === "less_than") return `«${campo}» debe ser menor que ${c.lt}.`;
  if (p.type === "greater_than_equal") return `«${campo}» debe ser al menos ${c.ge}.`;
  if (p.type === "greater_than") return `«${campo}» debe ser mayor que ${c.gt}.`;
  if (p.type === "missing") return `Falta «${campo}».`;
  if (p.type?.endsWith("_parsing")) return `«${campo}» no tiene un valor válido.`;
  return campo ? `«${campo}»: ${p.msg ?? "valor no válido"}.` : p.msg ?? "Valor no válido.";
}

function porEstado(status: number): string {
  if (status === 404) return "El servidor no tiene esa ruta (404).";
  if (status === 422 || status === 400) return "El servidor rechazó la consulta.";
  if (status === 429) return "Demasiadas consultas seguidas: espera un momento y reintenta.";
  // Cada código dice algo distinto: 500 es un fallo del propio servidor (reintentar no suele servir);
  // 502/503/504 vienen de IRSA o del límite de 5 min de Vercel (deploy/prototipo/vercel.json) y a ratos se arreglan solos.
  if (status === 500) return "Falló el servidor (500). No es tu culpa: avísale al equipo.";
  if (status === 502) return "IRSA mandó una respuesta rota (502). Prueba de nuevo.";
  if (status === 503) return "IRSA está ocupado (503). Espera unos segundos y reintenta.";
  if (status === 504) return "La imagen tardó más de 5 minutos (504). Prueba de nuevo: puede que ya esté guardada.";
  return `El servidor respondió con un error (${status}).`;
}

/** Texto legible a partir del `detail` de una respuesta con error. */
export function mensajeDeDetalle(detail: unknown, status: number): string {
  // Los textos genéricos de FastAPI vienen en inglés («Not Found»): para esos, el mensaje según el código.
  if (typeof detail === "string" && detail.trim() && !/^(Not Found|Method Not Allowed|Internal Server Error)$/.test(detail))
    return detail;
  if (Array.isArray(detail) && detail.length) return detail.map((p) => deProblema(p as Problema)).join(" ");
  return porEstado(status);
}

/**
 * Lee el JSON de una respuesta. Si la respuesta es un error, lanza un Error con un mensaje legible.
 * Uso: `const j = await leerJson(await fetch(url))`.
 */
export async function leerJson(r: Response): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  let j: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    j = await r.json();
  } catch {
    // No vino JSON (p. ej. una página de error del hosting).
    throw new Error(r.ok ? "El servidor mandó una respuesta que no se pudo leer." : porEstado(r.status));
  }
  if (!r.ok) throw new Error(mensajeDeDetalle(j?.detail, r.status));
  return j;
}

/**
 * Versión en inglés de un mensaje (V1, Antonia). Los mensajes se guardan en español (los de este archivo, los de
 * useDatosSpherex y los que manda el servidor en `detail`, p. ej. prototipos/rango_fechas/spherex.py) y se traducen
 * al mostrarlos, así cambiar de idioma también cambia un error que ya está en pantalla. Lo que no esté en la lista
 * (p. ej. el texto técnico de una excepción de Python) queda como venía.
 */
const EN: [RegExp, string][] = [
  // Servidor (prototipos/rango_fechas y scaffold/backend)
  [/IRSA no está respondiendo ahora \((.*?)\) y no hay una búsqueda guardada para este punto\. Reintenta en un minuto\./, "IRSA is not responding right now ($1) and there is no saved search for this point. Try again in a minute."],
  [/No se pudo consultar IRSA \((.*?)\)\. Reintenta en un minuto\./, "Could not query IRSA ($1). Try again in a minute."],
  [/IRSA no está disponible ahora: /, "IRSA is not available right now: "],
  [/Fallo al consultar IRSA: /, "IRSA query failed: "],
  [/Fallo al preparar el fotograma: /, "Could not prepare the frame: "],
  [/Fallo al preparar los fotogramas: /, "Could not prepare the frames: "],
  [/RA debe estar en grados, entre 0 y 360 \(no en horas\)\./, "R.A. must be in degrees, between 0 and 360 (not hours)."],
  [/Dec debe estar entre -90 y 90 grados\./, "Dec must be between -90 and 90 degrees."],
  [/La banda debe ser 1–6\./, "The band must be 1–6."],
  [/La fecha inicial debe ser anterior a la final\./, "The start date must be before the end date."],
  [/Fechas en formato AAAA-MM-DD\./, "Dates must be YYYY-MM-DD."],
  [/Bandas separadas por comas, p\. ej\. 1,2,5\./, "Bands separated by commas, e.g. 1,2,5."],
  [/Las bandas deben estar entre 1 y 6\./, "Bands must be between 1 and 6."],
  [/bands: números del 1 al 6 separados por comas/, "bands: numbers 1 to 6 separated by commas"],
  [/La banda (\d+) tiene (\d+) visitas en ese rango; no existe la (\d+)\./, "Band $1 has $2 visits in that range; visit $3 does not exist."],
  [/La respuesta de IRSA para (\S+) no es un FITS/, "IRSA's response for $1 is not a FITS file"],
  [/el punto cae fuera del detector/, "the point falls outside the detector"],
  [/sin fotogramas/, "no frames"],
  [/rango no servido/, "range not served"],
  // useDatosSpherex
  [/^Elige un objeto o escribe A\.R\.\/Dec arriba\.$/, "Pick an object or type R.A./Dec above."],
  [/^Elige al menos una banda para cargar\.$/, "Pick at least one band to load."],
  [/^Consultando en IRSA qué visitas hay…$/, "Asking IRSA which visits exist…"],
  [/^IRSA no devolvió visitas con estos filtros\. Prueba otro rango de fechas u otras bandas\.$/, "IRSA returned no visits with these filters. Try another date range or other bands."],
  // Este archivo
  [/«(.+?)» puede ser como máximo (.+?)\./g, "“$1” can be at most $2."],
  [/«(.+?)» debe ser menor que (.+?)\./g, "“$1” must be less than $2."],
  [/«(.+?)» debe ser al menos (.+?)\./g, "“$1” must be at least $2."],
  [/«(.+?)» debe ser mayor que (.+?)\./g, "“$1” must be greater than $2."],
  [/Falta «(.+?)»\./g, "“$1” is missing."],
  [/«(.+?)» no tiene un valor válido\./g, "“$1” does not have a valid value."],
  [/valor no válido|Valor no válido\./g, "invalid value"],
  [/“Dimensión”/g, "“Size”"], [/“Desde”/g, "“From”"], [/“Hasta”/g, "“To”"], [/“Banda”/g, "“Band”"],
  [/“Bandas”/g, "“Bands”"], [/“Visita”/g, "“Visit”"], [/“Exp\. por visita”/g, "“Exp. per visit”"], [/“A\.R\.”/g, "“R.A.”"],
  [/El servidor no tiene esa ruta \(404\)\./, "The server does not have that route (404)."],
  [/El servidor rechazó la consulta\./, "The server rejected the query."],
  [/Demasiadas consultas seguidas: espera un momento y reintenta\./, "Too many queries in a row: wait a moment and try again."],
  [/Falló el servidor \(500\)\. No es tu culpa: avísale al equipo\./, "The server failed (500). It's not your fault: let the team know."],
  [/IRSA mandó una respuesta rota \(502\)\. Prueba de nuevo\./, "IRSA sent a broken response (502). Try again."],
  [/IRSA está ocupado \(503\)\. Espera unos segundos y reintenta\./, "IRSA is busy (503). Wait a few seconds and try again."],
  [/La imagen tardó más de 5 minutos \(504\)\. Prueba de nuevo: puede que ya esté guardada\./, "The image took more than 5 minutes (504). Try again: it may already be saved."],
  [/El servidor respondió con un error \((\d+)\)\./, "The server responded with an error ($1)."],
  [/El servidor mandó una respuesta que no se pudo leer\./, "The server sent a response that could not be read."],
  [/Sin conexión con el servidor\. Revisa internet y reintenta\./, "No connection to the server. Check your internet and try again."],
  // apuntar/espectroPunto.ts
  [/IRSA no responde ahora \(503\)/, "IRSA is not responding right now (503)"],
  [/el servidor respondió (\d+)/, "the server responded $1"],
  [/no hubo respuesta en (\d+) s/, "no response in $1 s"],
];

export function mensajeEnIngles(msg: string): string {
  return EN.reduce((m, [re, en]) => m.replace(re, en), msg);
}

/** El mensaje en el idioma de la página. Uso en un componente: `enIdioma(mensaje, idioma)`. */
export function enIdioma(msg: string, idioma: "es" | "en"): string {
  return idioma === "en" ? mensajeEnIngles(msg) : msg;
}

/** Mensaje para mostrar a partir de cualquier error atrapado (también los de red). */
export function mensajeDeError(e: unknown): string {
  if (e instanceof TypeError && /fetch|network/i.test(e.message))
    return "Sin conexión con el servidor. Revisa internet y reintenta.";
  return e instanceof Error ? e.message : String(e);
}
