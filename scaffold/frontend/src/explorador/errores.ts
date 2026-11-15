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

/** Mensaje para mostrar a partir de cualquier error atrapado (también los de red). */
export function mensajeDeError(e: unknown): string {
  if (e instanceof TypeError && /fetch|network/i.test(e.message))
    return "Sin conexión con el servidor. Revisa internet y reintenta.";
  return e instanceof Error ? e.message : String(e);
}
