/**
 * Lectura de coordenadas escritas a mano. Dueño: Juan Pablo (V2), frente «apuntar a cualquier parte».
 *
 * Acepta grados decimales («133.795», «133,795», «-7.245») y sexagesimal («08 55 10.83», «08:55:10.83»,
 * «08h55m10.83s», «-07 14 42.5», «-07°14′42.5″», «-7d14m42.5s»).
 * - A.R.: un solo número = grados (0 ≤ A.R. < 360). Dos o tres números = horas, minutos y segundos (0 ≤ h < 24).
 * - Dec: un solo número = grados (−90 a 90). Dos o tres números = grados, minutos y segundos de arco;
 *   el signo se lee del texto, así «-00 30 00» da −0,5° (no +0,5°).
 * - `leerPar` reconoce el par entero pegado en un solo campo («08 55 10.83 -07 14 42.5»).
 * Devuelve `{ ok: true, valor }` o `{ ok: false, error }` con un mensaje para la persona.
 */

export type Lectura = { ok: true; valor: number } | { ok: false; error: string };
export type LecturaPar = { ok: true; ra: number; dec: number } | { ok: false; error: string };

/** Los mensajes de error en inglés, para el selector ES/EN. Si se agrega un error nuevo, agregarlo aquí. */
const ERRORES_EN: Record<string, string> = {
  "En grados, la A.R. va de 0 a 360 (sin incluir 360).": "In degrees, R.A. goes from 0 to 360 (not including 360).",
  "La A.R. lleva a lo más tres números: horas, minutos y segundos.": "R.A. takes at most three numbers: hours, minutes and seconds.",
  "La A.R. no puede llegar a 24 h.": "R.A. cannot reach 24 h.",
  "La A.R. no puede ser negativa.": "R.A. cannot be negative.",
  "La Dec lleva a lo más tres números: grados, minutos y segundos.": "Dec takes at most three numbers: degrees, minutes and seconds.",
  "La Dec va de -90 a +90 grados.": "Dec goes from -90 to +90 degrees.",
  "Las horas de la A.R. van de 0 a 23.": "R.A. hours go from 0 to 23.",
  "Las horas de la A.R. van sin decimales si das minutos.": "R.A. hours have no decimals if you give minutes.",
  "Los grados de la Dec van sin decimales si das minutos.": "Dec degrees have no decimals if you give minutes.",
  "Los minutos y segundos van de 0 a 59,99…": "Minutes and seconds go from 0 to 59.99…",
  "No entendí la A.R. Escríbela en grados (133.795) o en horas, minutos y segundos (08 55 10.83).":
    "I didn't understand the R.A. Type it in degrees (133.795) or in hours, minutes and seconds (08 55 10.83).",
  "No entendí la Dec. Escríbela en grados (-7.245) o en grados, minutos y segundos (-07 14 42.5).":
    "I didn't understand the Dec. Type it in degrees (-7.245) or in degrees, minutes and seconds (-07 14 42.5).",
};

/** Un mensaje de error en inglés (si no está en la tabla, queda en español). */
export const errorEnIngles = (es: string) => ERRORES_EN[es] ?? es;

const NUM = /^\d+(?:\.\d*)?$|^\.\d+$/;

/** Separa el texto en signo y números. Devuelve null si trae caracteres que no son de coordenadas. */
function trocear(texto: string): { signo: 1 | -1; conSigno: boolean; partes: string[]; marcas: boolean } | null {
  let t = texto.trim().replace(/[−–—]/g, "-");
  if (!t) return null;
  // Coma decimal solo si es un número suelto («133,79»); en sexagesimal la coma separaría campos.
  if (/^[+-]?\d+,\d+\s*°?$/.test(t)) t = t.replace(",", ".");
  let signo: 1 | -1 = 1;
  let conSigno = false;
  if (t[0] === "+" || t[0] === "-") {
    signo = t[0] === "-" ? -1 : 1;
    conSigno = true;
    t = t.slice(1).trim();
  }
  const marcas = /[hms°′″'":dD]/.test(t);
  // h m s d ° ′ ″ ' " : y espacios valen como separadores.
  const limpio = t.replace(/[hHmMsSdD°′″'":]/g, " ").trim();
  if (!limpio) return null;
  const partes = limpio.split(/\s+/);
  if (!partes.every((p) => NUM.test(p))) return null;
  return { signo, conSigno, partes, marcas };
}

function sexagesimal(partes: string[]): { a: number; m: number; s: number } {
  const [a, m = "0", s = "0"] = partes;
  return { a: Number(a), m: Number(m), s: Number(s) };
}

/** Ascensión recta → grados [0, 360). */
export function leerRA(texto: string): Lectura {
  const t = trocear(texto);
  if (!t) return { ok: false, error: "No entendí la A.R. Escríbela en grados (133.795) o en horas, minutos y segundos (08 55 10.83)." };
  if (t.conSigno && t.signo < 0) return { ok: false, error: "La A.R. no puede ser negativa." };
  if (t.partes.length > 3) return { ok: false, error: "La A.R. lleva a lo más tres números: horas, minutos y segundos." };
  const esHoras = t.partes.length > 1 || /[hH]/.test(texto);
  if (!esHoras) {
    const g = Number(t.partes[0]);
    if (!(g >= 0 && g < 360)) return { ok: false, error: "En grados, la A.R. va de 0 a 360 (sin incluir 360)." };
    return { ok: true, valor: g };
  }
  const { a: h, m, s } = sexagesimal(t.partes);
  if (!Number.isInteger(h) && t.partes.length > 1) return { ok: false, error: "Las horas de la A.R. van sin decimales si das minutos." };
  if (!(h >= 0 && h < 24)) return { ok: false, error: "Las horas de la A.R. van de 0 a 23." };
  if (!(m >= 0 && m < 60) || !(s >= 0 && s < 60)) return { ok: false, error: "Los minutos y segundos van de 0 a 59,99…" };
  const g = (h + m / 60 + s / 3600) * 15;
  if (!(g < 360)) return { ok: false, error: "La A.R. no puede llegar a 24 h." };
  return { ok: true, valor: g };
}

/** Declinación → grados [−90, 90]. */
export function leerDec(texto: string): Lectura {
  const t = trocear(texto);
  if (!t) return { ok: false, error: "No entendí la Dec. Escríbela en grados (-7.245) o en grados, minutos y segundos (-07 14 42.5)." };
  if (t.partes.length > 3) return { ok: false, error: "La Dec lleva a lo más tres números: grados, minutos y segundos." };
  const { a: g, m, s } = sexagesimal(t.partes);
  if (t.partes.length > 1 && !Number.isInteger(g)) return { ok: false, error: "Los grados de la Dec van sin decimales si das minutos." };
  if (!(m >= 0 && m < 60) || !(s >= 0 && s < 60)) return { ok: false, error: "Los minutos y segundos van de 0 a 59,99…" };
  const valor = t.signo * (g + m / 60 + s / 3600);
  if (!(Math.abs(valor) <= 90)) return { ok: false, error: "La Dec va de -90 a +90 grados." };
  return { ok: true, valor: valor === 0 ? 0 : valor };
}

/**
 * Par A.R. + Dec en un solo texto. Corta en el signo de la Dec, o en la mitad si son 2 o 6 números
 * («133.79 -7.24», «08 55 10.83 -07 14 42.5», «08:55:10.83 +07:14:42.5», «133.79, -7.24»).
 */
export function leerPar(texto: string): LecturaPar | null {
  const t = texto.trim().replace(/[−–—]/g, "-");
  // Un número suelto con coma decimal («133,795», «-7,245») no es un par: lo lee leerRA/leerDec.
  // Sin esto, la coma se tomaba como separador y «-7,245» daba A.R. −7 y Dec 245.
  if (/^[+-]?\d+,\d+\s*°?$/.test(t)) return null;
  let ra: string | null = null;
  let dec: string | null = null;
  const conSigno = t.match(/^(.+?)\s*,?\s*([+-]\s*\d.*)$/);
  if (conSigno && /\d/.test(conSigno[1])) {
    [ra, dec] = [conSigno[1].replace(/,\s*$/, ""), conSigno[2]];
  } else {
    const partes = t.split(/[\s,]+/).filter(Boolean);
    if (partes.length === 2 || partes.length === 6) {
      const mitad = partes.length / 2;
      [ra, dec] = [partes.slice(0, mitad).join(" "), partes.slice(mitad).join(" ")];
    }
  }
  if (ra === null || dec === null) return null;
  const r = leerRA(ra);
  const d = leerDec(dec);
  if (!r.ok) return r;
  if (!d.ok) return d;
  return { ok: true, ra: r.valor, dec: d.valor };
}

/** Grados → «08h 55m 10.83s» (para mostrar la equivalencia). */
export function raASexa(ra: number): string {
  let cs = Math.round((((ra % 360) + 360) % 360) / 15 * 360000); // centésimas de segundo de tiempo
  cs %= 24 * 360000;
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = (cs % 6000) / 100;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${s.toFixed(2).padStart(5, "0")}s`;
}

/** Grados → «-07° 14′ 42.5″». */
export function decASexa(dec: number): string {
  const signo = dec < 0 ? "-" : "+";
  const ds = Math.round(Math.abs(dec) * 36000); // décimas de segundo de arco
  const g = Math.floor(ds / 36000);
  const m = Math.floor((ds % 36000) / 600);
  const s = (ds % 600) / 10;
  return `${signo}${String(g).padStart(2, "0")}° ${String(m).padStart(2, "0")}′ ${s.toFixed(1).padStart(4, "0")}″`;
}
