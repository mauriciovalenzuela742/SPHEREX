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
const COLOR = "#ff6fb5";

type Movil = { nombre: string; ra: number; dec: number; pmra: number; pmdec: number; w2: number | null };
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
    moviles.push({ nombre: (c[iNom] ?? "").trim(), ra, dec, pmra, pmdec, w2 });
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
    if (senal.aborted) return null;
    try {
      return parsear(await pedir(url(base), senal));
    } catch (e) {
      if (senal.aborted) return null;
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
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

export const capaCatwise: Capa = {
  id: "catwise",
  montar: (aladin, ctx) => {
    const control = new AbortController();
    const radio = Math.max(ctx.size, RADIO_MIN_GRADOS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let catalogo: any = null;
    let bajaCatalogo: (() => void) | null = null;

    consultar(ctx.ra, ctx.dec, radio, control.signal)
      .then((moviles) => {
        if (control.signal.aborted) return;
        catalogo = A.catalog({
          name: `CatWISE2020 · se mueven (época ${ctx.epoca.toFixed(1)})`,
          color: COLOR,
          sourceSize: 16,
          shape: "triangle",
        });
        aladin.addCatalog(catalogo);
        bajaCatalogo = ctx.registrarCatalogo(catalogo);
        catalogo.addSources(
          moviles.map((m) => {
            // pm en ″/año → mas/año para propagar().
            const [ra, dec] = propagar(m.ra, m.dec, m.pmra * 1000, m.pmdec * 1000, EPOCA_CATWISE, ctx.epoca);
            return A.source(ra, dec, {
              CatWISE: m.nombre,
              W2: m.w2,
              pm_arcsec_anio: Math.hypot(m.pmra, m.pmdec).toFixed(3),
              RA_2015: m.ra,
              DE_2015: m.dec,
            });
          }),
        );
        console.info(`[catwise] ${moviles.length} objetos con movimiento propio alto (radio ${radio}°)`);
      })
      .catch((e) => {
        if (!control.signal.aborted) console.error("[catwise] no se pudo cargar CatWISE2020:", e);
      });

    return () => {
      control.abort();
      bajaCatalogo?.();
      if (catalogo) {
        try {
          aladin.removeLayer(catalogo);
        } catch (e) {
          console.error("[catwise] error al quitar el catálogo:", e);
        }
      }
    };
  },
};
