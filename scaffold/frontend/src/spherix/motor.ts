/**
 * Motor de Spherix: entiende lo que escribe el usuario y decide la respuesta. Dueño: Juan Pablo (V2);
 * los textos son de Javiera (content/spherix.ts).
 *
 * Determinista y sin LLM: no necesita clave de API, no inventa datos y funciona aunque falle la red
 * (salvo la búsqueda de nombres libres en SIMBAD). Un chat con LLM puede ir encima más adelante.
 *
 * Orden de detección: saludos → «qué veo aquí» → comandos (banda, campo) → coordenadas → objetos de
 * prueba → preguntas frecuentes → nombre libre en SIMBAD → «no entendí».
 */
import { CAMPOS, posicionActual, type Campo } from "../content/campos";
import { spherix } from "../content/spherix";
import { EPOCA_J2000, epocaDeFecha, propagar } from "../sky/propagacion";

export type Accion =
  | { tipo: "ir"; ra: number; dec: number }
  | { tipo: "banda"; band: string }
  | { tipo: "size"; size: number };

export type Respuesta = { textos: string[]; acciones: Accion[]; sugerencias: string[] };

/** minúsculas, sin tildes, espacios simples. */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Objetos de prueba ──────────────────────────────────────────────────────────────────────────────
const ALIAS: Record<string, string[]> = {
  barnard: ["barnard", "estrella de barnard", "barnard's star", "barnards star", "gj 699", "v2500 oph"],
  eps_ind_b: ["epsilon indi b", "eps ind b", "epsilon indi", "eps ind", "e indi b"],
  wise_0855: ["wise 0855", "wise0855", "0855", "wise 0855-0714", "wise j0855"],
  rw_aur: ["rw aurigae", "rw aur", "rw auriga"],
  r_dra: ["r draconis", "r dra", "r draco"],
};

export function buscarCampo(texto: string): Campo | undefined {
  const t = normalizar(texto);
  for (const c of CAMPOS) {
    if ((ALIAS[c.id] ?? []).some((a) => t.includes(a))) return c;
  }
  return undefined;
}

// ── Coordenadas ────────────────────────────────────────────────────────────────────────────────────
const NUM = String.raw`[+-]?\d+(?:[.,]\d+)?`;

/** «269.45 4.77», «ra 269.45 dec -4.7», «17h57m48s +04d46m14s», «17:57:48 +04:46:14», «17 57 48 +04 46 14». */
export function parsearCoordenadas(texto: string): { ra: number; dec: number } | undefined {
  const t = normalizar(texto)
    .replace(/−/g, "-")
    .replace(/\b(a\.?r\.?|ra|dec|declinacion|ascension recta)\s*[:=]?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const n = (s: string) => Number(s.replace(",", "."));

  // Sexagesimal: hh mm ss ±dd mm ss, con separadores h/m/s, d/°/'/", ':' o espacios.
  const sexa =
    /^(\d{1,2})\s*[h: ]\s*(\d{1,2})\s*[m: ]\s*(\d{1,2}(?:[.,]\d+)?)\s*s?\s*[, ]?\s*([+-]?)\s*(\d{1,2})\s*[d°: ]\s*(\d{1,2})\s*['m: ]\s*(\d{1,2}(?:[.,]\d+)?)\s*["s]?$/;
  const m = t.match(sexa);
  if (m) {
    const ra = 15 * (n(m[1]) + n(m[2]) / 60 + n(m[3]) / 3600);
    const dec = (m[4] === "-" ? -1 : 1) * (n(m[5]) + n(m[6]) / 60 + n(m[7]) / 3600);
    if (ra >= 0 && ra < 360 && Math.abs(dec) <= 90) return { ra, dec };
  }

  // Decimal: dos números en grados.
  const d = t.match(new RegExp(String.raw`^(${NUM})\s*[ ,;]\s*(${NUM})$`));
  if (d) {
    const ra = n(d[1]);
    const dec = n(d[2]);
    if (ra >= 0 && ra < 360 && Math.abs(dec) <= 90) return { ra, dec };
  }
  return undefined;
}

// ── Comandos ───────────────────────────────────────────────────────────────────────────────────────
function comandoBanda(t: string): Respuesta | undefined {
  const m = t.match(/\b(?:banda|detector)\s*d?\s*(\d)\b/) ?? t.match(/^(?:la\s+)?d(\d)$/);
  if (!m) return undefined;
  if (Number(m[1]) < 1 || Number(m[1]) > 6) {
    return { textos: [spherix.bandaInvalida], acciones: [], sugerencias: ["Banda 1", "Banda 6"] };
  }
  return { textos: [spherix.banda(m[1])], acciones: [{ tipo: "banda", band: m[1] }], sugerencias: spherix.sugerenciasDespuesDeIr };
}

const TAMANOS = [0.05, 0.1, 0.2, 0.5, 1];

function comandoCampo(t: string, sizeActual: number): Respuesta | undefined {
  let size: number | undefined;
  if (/(agranda|mas grande|mas campo|alejar|aleja|zoom out|mas cielo)/.test(t)) {
    size = TAMANOS.find((s) => s > sizeActual) ?? 1;
  } else if (/(achica|mas chico|menos campo|acercar|acerca|zoom in|mas detalle)/.test(t)) {
    size = [...TAMANOS].reverse().find((s) => s < sizeActual) ?? 0.05;
  } else {
    const m = t.match(/\b(?:campo|dimension|tamano)\s*(?:de\s*)?([0-9]+(?:[.,][0-9]+)?)/);
    if (m) size = Math.min(1, Math.max(0.02, Number(m[1].replace(",", "."))));
  }
  if (size === undefined) return undefined;
  return { textos: [spherix.campo(size)], acciones: [{ tipo: "size", size }], sugerencias: spherix.sugerenciasDespuesDeIr };
}

// ── Preguntas frecuentes ───────────────────────────────────────────────────────────────────────────
const FAQ: [RegExp, keyof typeof spherix.faq, string[]][] = [
  [/(prisma|espectro|huella|de que esta hecho|de que estan hechos|composicion)/, "prisma", ["¿Qué son las bandas?", "R Draconis"]],
  [/(que es|que son|cuentame|que hace).*(spherex|esta mision|el telescopio)|^spherex\??$/, "queEsSpherex", ["¿Qué son las bandas?", "Estrella de Barnard"]],
  [/(como (se usa|funciona|uso|lo uso)|ayuda|tutorial|que hago|instrucciones)/, "comoSeUsa", ["¿Qué son las coordenadas?", "Estrella de Barnard"]],
  [/(coordenada|ascension|declinacion)/, "coordenadas", ["269.45 4.77", "¿Qué son las bandas?"]],
  [/(banda|color|infrarroj|longitud de onda|micrometro|detector)/, "bandas", ["Banda 1", "Banda 6"]],
  [/(por que se mueve|se mueven|movimiento|moverse)/, "porQueSeMueven", ["Estrella de Barnard", "¿Qué es el parpadeo?"]],
  [/(parpadeo|blink|video|animacion)/, "parpadeo", ["Estrella de Barnard", "¿Cómo se usa esto?"]],
  [/(puntos|gaia|simbad|capa|marcas|circulos)/, "capas", ["¿Qué debería ver aquí?"]],
  [/(contaminacion|flag|marcad|defecto|rayo cosmico)/, "contaminacion", ["¿Qué debería ver aquí?"]],
  [/(quienes son|quien hizo|quienes hicieron|equipo|quienes somos)/, "quienesSomos", ["¿Qué es SPHEREx?"]],
  [/(descubr|planeta x|nuevo objeto|encontrar algo)/, "descubrir", ["¿Cómo se usa esto?", "Estrella de Barnard"]],
];

function preguntaFrecuente(t: string): Respuesta | undefined {
  for (const [re, clave, sug] of FAQ) {
    if (re.test(t)) return { textos: spherix.faq[clave], acciones: [], sugerencias: sug };
  }
  return undefined;
}

// ── «¿Qué debería ver aquí?» ──────────────────────────────────────────────────────────────────────
function queVerAqui(ra: number, dec: number): Respuesta {
  const cerca = CAMPOS.find((c) => {
    const p = posicionActual(c);
    const d = Math.hypot((p.ra - ra) * Math.cos((dec * Math.PI) / 180), p.dec - dec);
    return d < 10 / 60;
  });
  const texto = spherix.queVer[cerca?.id ?? "general"] ?? spherix.queVer.general;
  return { textos: [texto], acciones: [], sugerencias: spherix.sugerenciasDespuesDeIr };
}

// ── Nombre libre en SIMBAD (espejo de Harvard, respaldo CDS; ambos con CORS abierto) ──────────────
const SIMBAD_SIM_ID = [
  "https://simbad.cfa.harvard.edu/simbad/sim-id",
  "https://simbad.cds.unistra.fr/simbad/sim-id",
];

type Resuelto = { nombre: string; ra: number; dec: number; propagado: boolean };

/** Interpreta la salida ASCII de sim-id: nombre, coordenadas ICRS J2000 y movimiento propio si lo hay. */
export function leerSimId(txt: string, fecha: Date = new Date()): Resuelto | undefined {
  const obj = txt.match(/^Object\s+(.+?)\s+---/m);
  const coo = txt.match(
    /Coordinates\(ICRS,ep=J2000,eq=2000\):\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([+-])(\d+)\s+(\d+)\s+([\d.]+)/,
  );
  if (!obj || !coo) return undefined;
  let ra = 15 * (+coo[1] + +coo[2] / 60 + +coo[3] / 3600);
  let dec = (coo[4] === "-" ? -1 : 1) * (+coo[5] + +coo[6] / 60 + +coo[7] / 3600);
  let propagado = false;
  const pm = txt.match(/Proper motions:\s*([+-]?[\d.]+)\s+([+-]?[\d.]+)/);
  if (pm) {
    const pmra = Number(pm[1]);
    const pmdec = Number(pm[2]);
    // Solo se propaga si se nota a la escala de SPHEREx (más de ~1″ desde J2000: unos 40 mas/año).
    if (Math.hypot(pmra, pmdec) > 40) {
      [ra, dec] = propagar(ra, dec, pmra, pmdec, EPOCA_J2000, epocaDeFecha(fecha));
      propagado = true;
    }
  }
  return { nombre: obj[1].replace(/\s+/g, " ").trim(), ra, dec, propagado };
}

async function resolverNombre(q: string): Promise<Resuelto | "no-encontrado" | "sin-conexion"> {
  let huboRespuesta = false;
  for (const base of SIMBAD_SIM_ID) {
    try {
      const r = await fetch(`${base}?output.format=ASCII&Ident=${encodeURIComponent(q)}`, {
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok) continue;
      huboRespuesta = true;
      const res = leerSimId(await r.text());
      // El servidor respondió: si no reconoce el nombre, el espejo tampoco lo hará.
      return res ?? "no-encontrado";
    } catch {
      // red caída o tiempo agotado: probar el siguiente espejo
    }
  }
  return huboRespuesta ? "no-encontrado" : "sin-conexion";
}

/** «* alf Sco» → «alf Sco»; «NAME Proxima Centauri» → «Proxima Centauri». */
function limpiarIdSimbad(id: string): string {
  return id.replace(/^(NAME|V\*|\*\*|\*)\s+/, "").trim();
}

/** Lo que escribió el usuario, y entre paréntesis el nombre de catálogo si es distinto: «Antares (alf Sco)». */
export function nombreParaMostrar(pedido: string, idSimbad: string): string {
  const limpio = limpiarIdSimbad(idSimbad);
  const igual = normalizar(limpio).replace(/\s/g, "") === normalizar(pedido).replace(/\s/g, "");
  return igual ? limpio : `${pedido} (${limpio})`;
}

const PREFIJO_PEDIDO =
  /^\s*(ll[eé]vame a|ll[eé]vame|mu[eé]strame|quiero ver|vamos a|ir a|ve a|busca(r)?|d[oó]nde est[aá])\s+(la |el |a )?/i;

/** Lo que queda tras quitar «llévame a…»; undefined si no parece un nombre de objeto. */
export function extraerNombre(entrada: string): string | undefined {
  const limpio = entrada.replace(PREFIJO_PEDIDO, "").replace(/[?¿!¡.]/g, "").trim();
  if (!limpio || limpio.split(/\s+/).length > 4) return undefined;
  if (/^(hola|gracias|ok|s[ií]|no|chao|adi[oó]s|buenas|qu[eé] tal)$/i.test(limpio)) return undefined;
  return limpio;
}

// ── Entrada principal ──────────────────────────────────────────────────────────────────────────────
export type Contexto = { ra: number; dec: number; size: number };

export function saludo(asistido: boolean): Respuesta {
  return {
    textos: asistido ? spherix.saludoAsistido : spherix.saludoChat,
    acciones: [],
    sugerencias: spherix.sugerenciasInicio,
  };
}

export async function responder(entrada: string, ctx: Contexto): Promise<Respuesta> {
  const t = normalizar(entrada);
  if (!t) return saludo(false);

  if (/^(hola|buenas|hey|holi|saludos)\b/.test(t) && t.split(" ").length <= 3) {
    return { textos: ["¡Hola! 😊 " + spherix.saludoChat[0]], acciones: [], sugerencias: spherix.sugerenciasInicio };
  }
  if (/^(gracias|muchas gracias|genial|bacan|excelente)\b/.test(t)) {
    return { textos: ["¡De nada! ¿Seguimos explorando?"], acciones: [], sugerencias: spherix.sugerenciasInicio };
  }
  if (/(que (deberia|debo|hay que) ver|que estoy viendo|que es esto|que miro|que veo)/.test(t)) {
    return queVerAqui(ctx.ra, ctx.dec);
  }
  if (/(otra estrella|otro objeto|sorprendeme)/.test(t)) {
    return { textos: ["Elige uno de estos, o escribe el nombre que quieras."], acciones: [], sugerencias: CAMPOS.map((c) => c.nombre) };
  }
  if (/^cambia (de )?banda$/.test(t)) {
    return { textos: ["¿A cuál? Van de D1 (la más azul) a D6 (la más roja)."], acciones: [], sugerencias: ["Banda 1", "Banda 3", "Banda 6"] };
  }

  const banda = comandoBanda(t);
  if (banda) return banda;

  const campo = comandoCampo(t, ctx.size);
  if (campo) return campo;

  const coords = parsearCoordenadas(entrada);
  if (coords) {
    return {
      textos: [spherix.irACoordenadas(coords.ra, coords.dec)],
      acciones: [{ tipo: "ir", ...coords }],
      sugerencias: spherix.sugerenciasDespuesDeIr,
    };
  }

  const c = buscarCampo(t);
  if (c) {
    return {
      textos: [spherix.irA(c.nombre), spherix.queVer[c.id]],
      acciones: [{ tipo: "ir", ...posicionActual(c) }],
      sugerencias: spherix.sugerenciasDespuesDeIr,
    };
  }

  const faq = preguntaFrecuente(t);
  if (faq) return faq;

  const nombre = extraerNombre(entrada);
  if (nombre) {
    const r = await resolverNombre(nombre);
    if (r === "sin-conexion") return { textos: [spherix.sinConexion], acciones: [], sugerencias: CAMPOS.map((x) => x.nombre) };
    if (r === "no-encontrado") return { textos: [spherix.noEncontrado(nombre)], acciones: [], sugerencias: spherix.sugerenciasInicio };
    return {
      textos: [spherix.irAResuelto(nombreParaMostrar(nombre, r.nombre), r.propagado)],
      acciones: [{ tipo: "ir", ra: Number(r.ra.toFixed(6)), dec: Number(r.dec.toFixed(6)) }],
      sugerencias: spherix.sugerenciasDespuesDeIr,
    };
  }

  return { textos: spherix.noEntendi, acciones: [], sugerencias: spherix.sugerenciasInicio };
}
