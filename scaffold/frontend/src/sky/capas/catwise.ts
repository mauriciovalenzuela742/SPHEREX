/**
 * Capa CatWISE2020 (VizieR II/365/catwise): objetos con movimiento propio alto, propagados de 2015,4 a
 * `ctx.epoca`. Dueño: Juan Pablo (V2).
 *
 * Por qué existe: WISE 0855 (uno de los objetos de prueba de la organización) no está en Gaia, porque es
 * demasiado fría y débil en el óptico. CatWISE2020 mide su movimiento con años de datos de WISE/NEOWISE,
 * así que marca dónde está hoy aunque en una exposición suelta de SPHEREx se vea débil.
 *
 * Solo se dibujan los objetos que se mueven de verdad (movimiento total ≥ PM_MIN y ≥ SNR_MIN veces su
 * error): el catálogo completo taparía el mapa como pasaba con Gaia.
 *
 * Filtro contra movimientos falsos junto a estrellas brillantes (revisión científica del 14-nov-2026):
 * con el filtro anterior (≥ 0,3″/año y ≥ 5σ) pasaban 170 objetos en 0,1° alrededor de Barnard (213 en 0,2°),
 * con densidad que caía con la distancia a la estrella: trozos del halo y de los picos de difracción de
 * Barnard (W2 = 3,66, saturada; Barnard misma no está en CatWISE). Las marcas `ccf`/`abf` no los separan.
 * Por eso, además del umbral de movimiento:
 * (a) se descartan los objetos dentro de un radio de exclusión alrededor de las estrellas de AllWISE (II/328)
 *     con W2 < 9: 300″ si W2 < 5, 120″ si W2 < 7, 45″ si W2 < 9 (solo el primer tramo está calibrado, con
 *     Barnard). Las brillantes se piden en un cono RADIO_EXTRA_GRADOS más ancho, para que una estrella justo
 *     fuera del campo también limpie su halo.
 *     Época: AllWISE da RA_pm/DE_pm en MJD 55400 (≈ 2010,56) y CatWISE en 2015,4; Barnard se mueve ~50″ en
 *     ese lapso. Se propaga la brillante con el pmRA/pmDE de AllWISE (mas/año) y la zona excluida es la
 *     «cápsula» que recorre la estrella entre 2010,56 y 2015,4 (distancia al segmento, no al punto): así
 *     cubre el error del movimiento de AllWISE, que es grosero en estrellas saturadas (Barnard: 13,7″/año en
 *     vez de 10,4; la propagación se pasa ~16″, que quedan dentro del segmento). Si el movimiento de AllWISE
 *     no viene o supera PM_BRILLANTE_MAX, no se propaga.
 * (b) SNR_MIN = 10 (antes 5).
 * (c) W2mproPM ≤ W2_MAX: los restos que quedan son débiles (W2 > 16); la pieza principal de WISE 0855
 *     (J085508.34-071439.2, W2 = 13,82, 7,99″/año, S/R 24,5) pasa holgada.
 * Conteos en 0,1° (espejo de CfA, 14-nov-2026), antes → ahora: Barnard 170 → 0; eps Ind B 29 → 4 (3 piezas
 * de eps Ind B a ~−56°47′ y 1 resto de una estela a ~8′ de eps Ind A, W2 = 0,4, que queda fuera de 300″);
 * WISE 0855 7 → 4 (piezas de 0855, con la principal); RW Aur 13 → 0; R Dra 3 → 0.
 * Si AllWISE no responde, la capa sigue con (b) y (c) y avisa en la consola (Barnard queda en 61).
 *
 * Comprobado el 14-nov-2026 en el espejo de CfA:
 * - Columnas: RAPMdeg/DEPMdeg = posición ICRS en la época 2015,4 (MJD 57170) del ajuste con movimiento;
 *   pmRA/pmDE en ARCSEC/año (no mas), pmRA ya incluye cos δ; e_pmRA/e_pmDE; W2mproPM en mag.
 * - Con `-out=<lista>` el espejo devuelve cero filas en esta tabla; con `-out.all` funciona. Por eso se
 *   pide todo y se leen las columnas por nombre.
 * - WISE 0855 aparece PARTIDA en varias entradas (5 con |pm| > 4″/año en un cono de 0,02°), típico de
 *   un objeto tan rápido. La más brillante (J085508.34-071439.2, W2 = 13,82, pm = −7,950/+0,812 ″/año)
 *   cae a ~0,4″ de la posición propagada desde SIMBAD a 2015,4. Se muestran todas: se agrupan juntas.
 */
import A from "aladin-lite";
import { propagar } from "../propagacion";
import type { Capa } from "./index";
import { ponerEstado, TEXTO_SIN_RESPUESTA } from "./estado";
import { SERVICIOS_TAP } from "./simbad";

/** Época de referencia de RAPMdeg/DEPMdeg: MJD 57170,0 en años julianos. */
export const EPOCA_CATWISE = 2000 + (57170.0 - 51544.5) / 365.25; // ≈ 2015,40

const ESPEJOS = [
  "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv",
  "https://vizier.cds.unistra.fr/viz-bin/asu-tsv",
];
const RADIO_MIN_GRADOS = 0.1;
const FILAS_MAX = 5000;
const TIMEOUT_MS = 20000;
/** Movimiento propio total mínimo para dibujar un objeto, en ″/año. */
const PM_MIN = 0.3;
/** Señal/ruido mínima del movimiento propio. */
const SNR_MIN = 10;
/** Magnitud W2 máxima (más débil) de un objeto que se dibuja. */
const W2_MAX = 16;
/** Ensanche del cono de AllWISE respecto del de CatWISE: el radio de exclusión mayor (300″). */
const RADIO_EXTRA_GRADOS = 300 / 3600;
/** Las estrellas de AllWISE con W2 menor que esto definen zonas de exclusión. */
const W2_BRILLANTE = 9;
/** Un movimiento de AllWISE mayor que esto se considera espurio y no se propaga, en mas/año. */
const PM_BRILLANTE_MAX = 15000;
/** Época de RA_pm/DE_pm y del movimiento propio de AllWISE: MJD 55400,0. */
const EPOCA_ALLWISE = 2000 + (55400.0 - 51544.5) / 365.25; // ≈ 2010,56
/** Triángulo hueco: se mueve y ya está en SIMBAD (o no se pudo cotejar). */
export const COLOR_MOVIL = "#ff6fb5";
/** Triángulo relleno: se mueve y no aparece en SIMBAD (candidato para revisar). */
export const COLOR_CANDIDATO = "#b6ff3b";

/** pmra/pmdec/epm en ″/año (pmra con cos δ); epm = error total del movimiento, √(e_pmRA² + e_pmDE²). */
export type Movil = {
  nombre: string;
  ra: number;
  dec: number;
  pmra: number;
  pmdec: number;
  epm: number;
  w2: number | null;
};
/** Zona de exclusión: cápsula de radio `radio` (″) alrededor del segmento (ra0, dec0) → (ra1, dec1). */
type Brillante = { ra0: number; dec0: number; ra1: number; dec1: number; radio: number };

/** Radio de exclusión en ″ según la W2 de AllWISE; 0 si la estrella no excluye nada. */
export function radioExclusion(w2: number): number {
  if (w2 < 5) return 300;
  if (w2 < 7) return 120;
  if (w2 < W2_BRILLANTE) return 45;
  return 0;
}

/** Distancia en ″ de (ra, dec) al segmento de la brillante, en el plano tangente local. */
function distanciaSegmento(ra: number, dec: number, b: Brillante): number {
  const c = Math.cos((b.dec0 * Math.PI) / 180);
  const envolver = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);
  const px = envolver(ra - b.ra0) * c * 3600;
  const py = (dec - b.dec0) * 3600;
  const sx = envolver(b.ra1 - b.ra0) * c * 3600;
  const sy = (b.dec1 - b.dec0) * 3600;
  const l2 = sx * sx + sy * sy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, (px * sx + py * sy) / l2));
  return Math.hypot(px - t * sx, py - t * sy);
}

export function enZonaExcluida(ra: number, dec: number, brillantes: Brillante[]): boolean {
  return brillantes.some((b) => distanciaSegmento(ra, dec, b) < b.radio);
}

function urlCono(base: string, ra: number, dec: number, radio: number): string {
  const p = new URLSearchParams({
    "-source": "II/365/catwise",
    "-c": `${ra.toFixed(6)} ${dec >= 0 ? "+" : ""}${dec.toFixed(6)}`,
    "-c.rd": radio.toFixed(4),
    "-out.max": String(FILAS_MAX),
  });
  return `${base}?${p.toString()}&-out.all`;
}

/** Cono de AllWISE solo con W2 < W2_BRILLANTE (restricción del servidor; se vuelve a filtrar al parsear). */
function urlBrillantes(base: string, ra: number, dec: number, radio: number): string {
  const p = new URLSearchParams({
    "-source": "II/328/allwise",
    "-c": `${ra.toFixed(6)} ${dec >= 0 ? "+" : ""}${dec.toFixed(6)}`,
    "-c.rd": radio.toFixed(4),
    "-out.max": String(FILAS_MAX),
    W2mag: `<${W2_BRILLANTE}`,
  });
  return `${base}?${p.toString()}&-out.all`;
}

/** Filas de datos de un TSV de VizieR, a partir de la cabecera que contiene `columnaClave`. */
function tablaVizier(texto: string, columnaClave: string): { col: (n: string) => number; filas: string[][] } {
  const lineas = texto.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
  const iCab = lineas.findIndex((l) => l.split("\t").map((c) => c.trim()).includes(columnaClave));
  if (iCab < 0) throw new Error(`respuesta de VizieR sin la columna ${columnaClave}`);
  const cab = lineas[iCab].split("\t").map((c) => c.trim());
  return { col: (n: string) => cab.indexOf(n), filas: lineas.slice(iCab + 1).map((l) => l.split("\t")) };
}

function num(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const v = Number(s.trim());
  return Number.isFinite(v) ? v : null;
}

/** TSV de AllWISE → zonas de exclusión de las estrellas con W2 < W2_BRILLANTE, en la época de CatWISE. */
export function parsearBrillantes(texto: string): Brillante[] {
  const { col, filas } = tablaVizier(texto, "W2mag");
  const [iRa, iDec, iRaPm, iDecPm, iPmra, iPmdec, iW2] = [
    "RAJ2000", "DEJ2000", "RA_pm", "DE_pm", "pmRA", "pmDE", "W2mag",
  ].map(col);
  const brillantes: Brillante[] = [];
  for (const c of filas) {
    const w2 = num(c[iW2]);
    if (w2 === null) continue;
    const radio = radioExclusion(w2);
    if (radio === 0) continue;
    // Posición del ajuste con movimiento (MJD 55400) y su movimiento; si falta, la posición media sin mover.
    let ra = num(c[iRaPm]);
    let dec = num(c[iDecPm]);
    let pmra = num(c[iPmra]);
    let pmdec = num(c[iPmdec]);
    if (ra === null || dec === null) {
      ra = num(c[iRa]);
      dec = num(c[iDec]);
      pmra = null;
    }
    if (ra === null || dec === null) continue;
    if (pmra === null || pmdec === null || Math.hypot(pmra, pmdec) > PM_BRILLANTE_MAX) {
      pmra = 0;
      pmdec = 0;
    }
    const [ra1, dec1] = propagar(ra, dec, pmra, pmdec, EPOCA_ALLWISE, EPOCA_CATWISE);
    brillantes.push({ ra0: ra, dec0: dec, ra1, dec1, radio });
  }
  return brillantes;
}

/**
 * TSV de VizieR: comentarios «#», cabecera, unidades, guiones y filas. Devuelve solo los que se mueven de
 * verdad: pm ≥ PM_MIN, pm ≥ SNR_MIN·σ, W2 ≤ W2_MAX y fuera de las zonas de exclusión de `brillantes`.
 */
export function parsearMoviles(texto: string, brillantes: Brillante[] = []): Movil[] {
  const { col, filas } = tablaVizier(texto, "RAPMdeg");
  const [iNom, iRa, iDec, iPmra, iPmdec, iEra, iEdec, iW2] = [
    "Name", "RAPMdeg", "DEPMdeg", "pmRA", "pmDE", "e_pmRA", "e_pmDE", "W2mproPM",
  ].map(col);
  const moviles: Movil[] = [];
  for (const c of filas) {
    const ra = num(c[iRa]);
    const dec = num(c[iDec]);
    const pmra = num(c[iPmra]);
    const pmdec = num(c[iPmdec]);
    if (ra === null || dec === null || pmra === null || pmdec === null) continue;
    const pm = Math.hypot(pmra, pmdec);
    const err = Math.hypot(num(c[iEra]) ?? Infinity, num(c[iEdec]) ?? Infinity);
    if (pm < PM_MIN || pm < SNR_MIN * err) continue;
    const w2 = num(c[iW2]);
    if (w2 === null || w2 > W2_MAX) continue;
    if (enZonaExcluida(ra, dec, brillantes)) continue;
    moviles.push({ nombre: (c[iNom] ?? "").trim(), ra, dec, pmra, pmdec, epm: err, w2 });
  }
  return moviles;
}

async function pedir(url: string, senal: AbortSignal): Promise<string> {
  const local = new AbortController();
  const abortar = () => local.abort();
  senal.addEventListener("abort", abortar);
  const t = setTimeout(abortar, TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: local.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } catch (e) {
    if (local.signal.aborted && !senal.aborted) throw new Error(`sin respuesta en ${TIMEOUT_MS / 1000} s`);
    throw e;
  } finally {
    clearTimeout(t);
    senal.removeEventListener("abort", abortar);
  }
}

/** Pide `url(base)` a cada espejo en orden y devuelve lo que `parsear` acepte del primero que sirva. */
async function consultarEspejos<T>(
  url: (base: string) => string,
  parsear: (texto: string) => T,
  senal: AbortSignal,
): Promise<T | null> {
  const errores: string[] = [];
  for (const base of ESPEJOS) {
    // Segundo intento en el mismo espejo solo si respondió algo que no era una tabla: el 14-nov-2026 el de CfA
    // devolvía a ratos «The database is not currently reachable» y al rato respondía bien.
    for (let intento = 1; intento <= 2; intento++) {
      if (senal.aborted) return null;
      try {
        return parsear(await pedir(url(base), senal));
      } catch (e) {
        if (senal.aborted) return null;
        const msg = e instanceof Error ? e.message : String(e);
        errores.push(`${base} (intento ${intento}): ${msg}`);
        if (!msg.startsWith("respuesta de VizieR sin")) break;
      }
    }
  }
  throw new Error(`ningún espejo de VizieR respondió (${errores.join(" | ")})`);
}

async function consultar(ra: number, dec: number, radio: number, senal: AbortSignal): Promise<Movil[]> {
  // Las dos consultas van en paralelo. Si AllWISE falla, se sigue sin zonas de exclusión y se avisa.
  const pedidoBrillantes = consultarEspejos(
    (b) => urlBrillantes(b, ra, dec, radio + RADIO_EXTRA_GRADOS),
    parsearBrillantes,
    senal,
  ).catch((e): null => {
    if (!senal.aborted) {
      console.warn(
        "[catwise] no se pudieron pedir las estrellas brillantes de AllWISE; se dibuja sin zonas de " +
          "exclusión (solo S/R ≥ 10 y W2 ≤ 16), pueden aparecer movimientos falsos junto a estrellas brillantes:",
        e,
      );
    }
    return null;
  });
  const pedidoCatwise = consultarEspejos(
    (b) => urlCono(b, ra, dec, radio),
    (t) => {
      tablaVizier(t, "RAPMdeg"); // valida que el espejo devolvió una tabla de CatWISE antes de aceptarlo
      return t;
    },
    senal,
  );
  const [texto, brillantes] = await Promise.all([pedidoCatwise, pedidoBrillantes]);
  if (texto === null || senal.aborted) return [];
  if (brillantes !== null) {
    console.info(
      `[catwise] ${brillantes.length} estrellas de AllWISE con W2 < ${W2_BRILLANTE} excluyen su entorno`,
    );
  }
  return parsearMoviles(texto, brillantes ?? []);
}

// ---------------------------------------------------------------------------------------------------------
// «Se mueve y nadie lo ha estudiado»: cotejo con SIMBAD.
//
// Un objeto de CatWISE que se mueve es «conocido» si SIMBAD tiene algo en su posición. Las posiciones de
// SIMBAD (basic.ra/dec) son de época J2000,0 y las de CatWISE de 2015,4: en 15,4 años un objeto de 1″/año
// recorre 15″, así que comparar sin mover daría falsos candidatos. Se aceptan dos caminos:
//  (1) Se lleva el objeto de CatWISE a 2000,0 con SU movimiento y se compara con la posición de SIMBAD.
//      Tolerancia = RADIO_COTEJO + SIGMAS_COTEJO · σ_pm · 15,4 años (el error del movimiento acumulado).
//      Si SIMBAD NO trae movimiento propio, su coordenada no está propagada a 2000: es la del catálogo de
//      origen tal como se midió (2MASS ≈ 2000, AllWISE ≈ 2010,5…). Entonces se compara contra todo el tramo
//      que recorre el objeto de CatWISE entre 2000,0 y 2015,4 (cápsula de `distanciaSegmento`), con la misma
//      tolerancia: cubre cualquier época intermedia.
//  (2) Si SIMBAD trae movimiento propio, se lleva el objeto de SIMBAD a 2015,4 y se compara con CatWISE
//      con RADIO_COTEJO.
// RADIO_COTEJO = 5″: el ancho a media altura de la imagen de WISE en W2 es ~6,4″ (Wright et al. 2010), así
// que dos objetos a menos de 5″ no se separan en WISE; las posiciones de SIMBAD vienen de catálogos con
// errores de 0,1″ a pocos ″. Con S/R ≥ 10, σ_pm ≤ pm/10 y el término (1) suma a lo más 1,5″ por cada ″/año.
// Si SIMBAD no responde o la respuesta llega truncada, NO se marca ningún candidato (y se dice).
// ---------------------------------------------------------------------------------------------------------

/** Época de basic.ra/dec de SIMBAD. */
const EPOCA_SIMBAD = 2000.0;
/** Radio base del cotejo, en ″ (ver arriba). */
export const RADIO_COTEJO = 5;
/** Cuántas σ del movimiento propio se suman a la tolerancia del camino (1). */
const SIGMAS_COTEJO = 3;
/** Tope de filas pedidas a SIMBAD; si se llega a él, la lista no está completa y no se marcan candidatos. */
const TOPE_SIMBAD = 10000;
const ESPERA_SIMBAD_MS = 40000;

type ObjetoSimbad = { id: string; ra: number; dec: number; pmra: number | null; pmdec: number | null };
export type Cotejo = { conocido: boolean; simbad?: string; sep?: number };

/** Separación angular en ″ (fórmula del haversine). */
function separacion(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const r = Math.PI / 180;
  const s =
    Math.sin(((dec2 - dec1) * r) / 2) ** 2 +
    Math.cos(dec1 * r) * Math.cos(dec2 * r) * Math.sin(((ra2 - ra1) * r) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s))) * 180 * 3600) / Math.PI;
}

/** Tolerancia del camino (1), en ″. */
export function toleranciaCotejo(m: Movil): number {
  return RADIO_COTEJO + SIGMAS_COTEJO * m.epm * (EPOCA_CATWISE - EPOCA_SIMBAD);
}

/** ¿Tiene `m` contrapartida en `objetos` (SIMBAD)? Devuelve la más cercana. */
export function cotejar(m: Movil, objetos: ObjetoSimbad[]): Cotejo {
  const [ra00, dec00] = propagar(m.ra, m.dec, m.pmra * 1000, m.pmdec * 1000, EPOCA_CATWISE, EPOCA_SIMBAD);
  const tol = toleranciaCotejo(m);
  let mejor: Cotejo = { conocido: false };
  // Tramo del objeto de CatWISE entre 2000,0 y 2015,4, para las posiciones de SIMBAD sin movimiento propio.
  const tramo: Brillante = { ra0: ra00, dec0: dec00, ra1: m.ra, dec1: m.dec, radio: tol };
  for (const s of objetos) {
    const conPm = s.pmra !== null && s.pmdec !== null;
    let d = conPm ? separacion(ra00, dec00, s.ra, s.dec) : distanciaSegmento(s.ra, s.dec, tramo);
    let coincide = d < tol;
    if (conPm) {
      const [ra15, dec15] = propagar(s.ra, s.dec, s.pmra!, s.pmdec!, EPOCA_SIMBAD, EPOCA_CATWISE);
      const d2 = separacion(ra15, dec15, m.ra, m.dec);
      if (d2 < RADIO_COTEJO) {
        coincide = true;
        d = Math.min(d, d2);
      }
    }
    if (coincide && (mejor.sep === undefined || d < mejor.sep)) mejor = { conocido: true, simbad: s.id, sep: d };
  }
  return mejor;
}

/**
 * CatWISE parte en varias entradas a los objetos muy rápidos (WISE 0855 sale en 5, ver arriba), y las piezas
 * secundarias traen un movimiento equivocado: el 14-nov-2026, J085507.45-071437.8 (W2 = 15,1, pm = 5,6″/año
 * en otra dirección) quedaba a ~11″ de la pieza principal de 0855 y salía como «candidato». Por eso un objeto
 * sin contrapartida que está a menos de RADIO_FRAGMENTO (en 2015,4) de otro objeto móvil MÁS BRILLANTE que sí
 * la tiene se toma como pieza de ese objeto. 15″ ≈ 2,3 veces el ancho de la imagen de WISE en W2 (6,4″).
 */
export const RADIO_FRAGMENTO = 15;

export function absorberFragmentos(moviles: Movil[], cotejos: Cotejo[]): Cotejo[] {
  return cotejos.map((c, i) => {
    if (c.conocido) return c;
    const m = moviles[i];
    for (let j = 0; j < moviles.length; j++) {
      const o = moviles[j];
      const cj = cotejos[j];
      if (j === i || !cj.conocido || o.w2 === null || m.w2 === null || o.w2 >= m.w2) continue;
      const d = separacion(m.ra, m.dec, o.ra, o.dec);
      if (d < RADIO_FRAGMENTO) {
        return { conocido: true, simbad: `${cj.simbad} (pieza del mismo objeto en CatWISE, a ${d.toFixed(0)}″)`, sep: d };
      }
    }
    return c;
  });
}

/** Todos los objetos de SIMBAD en un cono (sin orden ni tope útil): para cotejar, no para dibujar. */
async function pedirSimbadCampo(ra: number, dec: number, radio: number, senal: AbortSignal): Promise<ObjetoSimbad[]> {
  const query =
    `SELECT TOP ${TOPE_SIMBAD} main_id, ra, dec, pmra, pmdec FROM basic ` +
    `WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${ra}, ${dec}, ${radio})) = 1 ` +
    `AND ra IS NOT NULL AND dec IS NOT NULL`;
  const params = new URLSearchParams({ request: "doQuery", lang: "adql", format: "json", query });
  const errores: string[] = [];
  for (const base of SERVICIOS_TAP) {
    if (senal.aborted) throw new DOMException("cancelado", "AbortError");
    const ctl = new AbortController();
    const cortar = () => ctl.abort();
    senal.addEventListener("abort", cortar);
    const reloj = setTimeout(cortar, ESPERA_SIMBAD_MS);
    try {
      const r = await fetch(`${base}?${params}`, { signal: ctl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { metadata: { name: string }[]; data: unknown[][] };
      const col = (n: string) => j.metadata.findIndex((m) => m.name === n);
      const [iId, iRa, iDec, iPmra, iPmdec] = ["main_id", "ra", "dec", "pmra", "pmdec"].map(col);
      if ([iId, iRa, iDec].some((i) => i < 0)) throw new Error("respuesta sin las columnas esperadas");
      if (j.data.length >= TOPE_SIMBAD) throw new Error(`respuesta truncada en ${TOPE_SIMBAD} filas`);
      const n = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
      return j.data.map((f) => ({
        id: String(f[iId]).trim(),
        ra: Number(f[iRa]),
        dec: Number(f[iDec]),
        pmra: iPmra >= 0 ? n(f[iPmra]) : null,
        pmdec: iPmdec >= 0 ? n(f[iPmdec]) : null,
      }));
    } catch (e) {
      if (senal.aborted) throw e;
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      clearTimeout(reloj);
      senal.removeEventListener("abort", cortar);
    }
  }
  throw new Error(`ningún servicio de SIMBAD respondió (${errores.join("; ")})`);
}

/**
 * Enlace a WiseView (Backyard Worlds) centrado en el objeto. Nombres de parámetros comprobados el 14-nov-2026
 * en byw.tools/static/flash3.js (`buildUrl` y `fromUrl`); los que no van toman su valor por defecto.
 */
export function urlWiseView(ra: number, dec: number): string {
  const p = [
    `ra=${ra.toFixed(6)}`, `dec=${dec.toFixed(6)}`, "size=176", "band=3", "speed=500",
    "minbright=-50.0000", "maxbright=500.0000", "window=0.5", "diff_window=1", "linear=1", "color=",
    "zoom=9", "border=1", "gaia=1", "invert=1", "maxdyr=0", "scandir=0", "neowise=0", "diff=0",
    "outer_epochs=0", "unique_window=1", "smooth_scan=0", "shift=0", "pmra=0", "pmdec=0",
  ];
  return `http://byw.tools/wiseview#${p.join("&")}`;
}

/** Triángulo relleno (Aladin solo dibuja formas huecas): se pasa como imagen del catálogo. */
function trianguloRelleno(lado: number, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = lado;
  c.height = lado;
  const g = c.getContext("2d");
  if (g) {
    g.beginPath();
    g.moveTo(lado / 2, 1.5);
    g.lineTo(lado - 1.5, lado - 2);
    g.lineTo(1.5, lado - 2);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    g.lineWidth = 1.5;
    g.strokeStyle = "#101010";
    g.stroke();
  }
  return c;
}

/** Recuadro con el texto del objeto clicado, dentro del mapa (estilos en línea: la capa no toca CSS). */
function crearCaja(contenedor: HTMLElement): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Objeto que se mueve");
  Object.assign(el.style, {
    position: "absolute",
    zIndex: "45",
    left: "8px",
    bottom: "8px",
    maxWidth: "min(340px, calc(100% - 16px))",
    display: "none",
    padding: "8px 10px",
    borderRadius: "6px",
    background: "rgba(10, 14, 24, 0.94)",
    color: "#f3f5f9",
    font: "13px/1.4 system-ui, sans-serif",
    boxShadow: "0 1px 6px rgba(0,0,0,0.6)",
  } satisfies Partial<CSSStyleDeclaration>);
  contenedor.appendChild(el);
  return el;
}

type DatoFuente = Movil & { cotejo: Cotejo | null };

function llenarCaja(caja: HTMLDivElement, d: DatoFuente) {
  caja.replaceChildren();
  const p = (texto: string, negrita = false) => {
    const e = document.createElement("p");
    e.style.margin = "0 0 4px";
    if (negrita) e.style.fontWeight = "600";
    e.textContent = texto;
    caja.appendChild(e);
    return e;
  };
  const pm = Math.hypot(d.pmra, d.pmdec).toFixed(2).replace(".", ",");
  const w2 = d.w2 === null ? "" : `, brillo W2 = ${d.w2.toFixed(1).replace(".", ",")}`;
  if (d.cotejo && !d.cotejo.conocido) {
    p("¡Candidato para revisar!", true).style.color = COLOR_CANDIDATO;
    p(`${d.nombre}: se mueve ${pm}″ por año${w2}.`);
    p("No está en SIMBAD. Puede ser algo poco estudiado o un error de medición: compruébalo en WiseView.");
  } else if (d.cotejo) {
    p("Se mueve y ya está estudiado", true);
    p(`${d.nombre}: se mueve ${pm}″ por año${w2}.`);
    p(`En SIMBAD es «${d.cotejo.simbad}».`);
  } else {
    p("Se mueve (sin cotejar)", true);
    p(`${d.nombre}: se mueve ${pm}″ por año${w2}.`);
    p("SIMBAD no respondió, así que no sabemos si ya está estudiado.");
  }
  const fila = document.createElement("div");
  Object.assign(fila.style, { display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" });
  const a = document.createElement("a");
  a.href = urlWiseView(d.ra, d.dec);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "Ver en WiseView ↗";
  a.style.color = "#8fd3ff";
  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.textContent = "Cerrar";
  Object.assign(cerrar.style, { marginLeft: "auto", padding: "1px 8px", fontSize: "12px" });
  cerrar.onclick = () => (caja.style.display = "none");
  fila.append(a, cerrar);
  caja.appendChild(fila);
  caja.style.display = "block";
}

export const capaCatwise: Capa = {
  id: "catwise",
  montar: (aladin, ctx) => {
    let control = new AbortController();
    const radio = Math.max(ctx.size, RADIO_MIN_GRADOS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let catalogos: any[] = [];
    let bajas: (() => void)[] = [];
    const nombre = "CatWISE2020 (objetos que se mueven)";
    const contenedor: HTMLElement | undefined = aladin.aladinDiv;
    const caja = contenedor ? crearCaja(contenedor) : null;

    const quitarCatalogos = () => {
      for (const b of bajas) b();
      for (const c of catalogos) {
        try {
          aladin.removeLayer(c);
        } catch (e) {
          console.error("[catwise] error al quitar el catálogo:", e);
        }
      }
      catalogos = [];
      bajas = [];
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agregar = (opciones: any, lista: DatoFuente[]) => {
      if (lista.length === 0) return;
      const cat = A.catalog(opciones);
      aladin.addCatalog(cat);
      bajas.push(ctx.registrarCatalogo(cat));
      catalogos.push(cat);
      cat.addSources(
        lista.map((m) => {
          // pm en ″/año → mas/año para propagar().
          const [ra, dec] = propagar(m.ra, m.dec, m.pmra * 1000, m.pmdec * 1000, EPOCA_CATWISE, ctx.epoca);
          return A.source(ra, dec, m);
        }),
      );
    };

    // Se llama al montar y desde «Reintentar» del panel de catálogos.
    const cargar = () => {
      control.abort();
      control = new AbortController();
      const senal = control.signal;
      quitarCatalogos();
      if (caja) caja.style.display = "none";
      ponerEstado({ id: "catwise", nombre, fase: "cargando", texto: "" });
      consultar(ctx.ra, ctx.dec, radio, senal)
        .then(async (moviles) => {
          if (senal.aborted) return;
          let cotejos: Cotejo[] | null = [];
          if (moviles.length > 0) {
            // El cono de SIMBAD se ensancha lo que recorre el más rápido en 15,4 años más su tolerancia,
            // para que un objeto en el borde del campo no quede sin su contrapartida.
            const margen = Math.max(
              ...moviles.map((m) => Math.hypot(m.pmra, m.pmdec) * (EPOCA_CATWISE - EPOCA_SIMBAD) + toleranciaCotejo(m)),
            );
            try {
              const objetos = await pedirSimbadCampo(ctx.ra, ctx.dec, radio + margen / 3600, senal);
              cotejos = absorberFragmentos(moviles, moviles.map((m) => cotejar(m, objetos)));
              console.info(`[catwise] cotejo con ${objetos.length} objetos de SIMBAD (radio ${radio}° + ${margen.toFixed(0)}″)`);
            } catch (e) {
              if (senal.aborted) return;
              console.warn("[catwise] SIMBAD no respondió; no se marca ningún candidato:", e);
              cotejos = null;
            }
          }
          if (senal.aborted) return;
          const datos: DatoFuente[] = moviles.map((m, i) => ({ ...m, cotejo: cotejos ? cotejos[i] : null }));
          const candidatos = datos.filter((d) => d.cotejo && !d.cotejo.conocido);
          const resto = datos.filter((d) => !(d.cotejo && !d.cotejo.conocido));
          agregar(
            {
              name: cotejos ? "CatWISE2020 · se mueven, ya en SIMBAD" : "CatWISE2020 · se mueven (sin cotejar con SIMBAD)",
              color: COLOR_MOVIL,
              sourceSize: 16,
              shape: "triangle",
            },
            resto,
          );
          agregar(
            {
              name: "CatWISE2020 · ¡candidatos! (no están en SIMBAD)",
              color: COLOR_CANDIDATO,
              shape: trianguloRelleno(18, COLOR_CANDIDATO),
            },
            candidatos,
          );
          const texto = moviles.length === 1 ? "1 objeto se mueve" : `${moviles.length} objetos se mueven`;
          let nota: string | undefined;
          if (cotejos === null) {
            nota = "SIMBAD no respondió: no se marca ningún candidato. Reintenta para cotejar.";
          } else if (moviles.length > 0) {
            nota =
              candidatos.length === 0
                ? "Todos ya aparecen en SIMBAD."
                : `${candidatos.length} no aparece${candidatos.length === 1 ? "" : "n"} en SIMBAD: ¡candidato${candidatos.length === 1 ? "" : "s"} para revisar!`;
          } else {
            nota = "Sin objetos que se muevan rápido en este campo, así que no hay candidatos.";
          }
          ponerEstado({
            id: "catwise",
            nombre,
            fase: "listo",
            texto,
            nota,
            reintentar: cotejos === null ? cargar : undefined,
          });
          console.info(
            `[catwise] ${moviles.length} objetos con movimiento propio alto (radio ${radio}°); ` +
              `candidatos sin SIMBAD: ${cotejos === null ? "sin cotejar" : candidatos.map((c) => c.nombre).join(", ") || "0"}`,
          );
        })
        .catch((e) => {
          if (senal.aborted) return;
          console.error("[catwise] no se pudo cargar CatWISE2020:", e);
          ponerEstado({ id: "catwise", nombre, fase: "error", texto: TEXTO_SIN_RESPUESTA, reintentar: cargar });
        });
    };
    cargar();

    // Clic en un triángulo: recuadro con lo que sabemos y el enlace a WiseView.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quitarClic = ctx.on("objectClicked", (fuente: any) => {
      const cat = fuente?.getCatalog?.() ?? fuente?.catalog;
      if (!caja || !catalogos.includes(cat)) return;
      llenarCaja(caja, fuente.data as DatoFuente);
    });

    return () => {
      control.abort();
      quitarClic();
      quitarCatalogos();
      caja?.remove();
    };
  },
};
