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
const SNR_MIN = 5;
const COLOR = "#ff6fb5";

type Movil = { nombre: string; ra: number; dec: number; pmra: number; pmdec: number; w2: number | null };

function urlCono(base: string, ra: number, dec: number, radio: number): string {
  const p = new URLSearchParams({
    "-source": "II/365/catwise",
    "-c": `${ra.toFixed(6)} ${dec >= 0 ? "+" : ""}${dec.toFixed(6)}`,
    "-c.rd": radio.toFixed(4),
    "-out.max": String(FILAS_MAX),
  });
  return `${base}?${p.toString()}&-out.all`;
}

function num(s: string | undefined): number | null {
  if (s === undefined || s.trim() === "") return null;
  const v = Number(s.trim());
  return Number.isFinite(v) ? v : null;
}

/** TSV de VizieR: comentarios «#», cabecera, unidades, guiones y filas. Devuelve solo los que se mueven. */
export function parsearMoviles(texto: string): Movil[] {
  const lineas = texto.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
  const iCab = lineas.findIndex((l) => l.split("\t").map((c) => c.trim()).includes("RAPMdeg"));
  if (iCab < 0) throw new Error("respuesta de VizieR sin la columna RAPMdeg");
  const cab = lineas[iCab].split("\t").map((c) => c.trim());
  const col = (n: string) => cab.indexOf(n);
  const [iNom, iRa, iDec, iPmra, iPmdec, iEra, iEdec, iW2] = [
    "Name", "RAPMdeg", "DEPMdeg", "pmRA", "pmDE", "e_pmRA", "e_pmDE", "W2mproPM",
  ].map(col);
  const moviles: Movil[] = [];
  for (const l of lineas.slice(iCab + 1)) {
    const c = l.split("\t");
    const ra = num(c[iRa]);
    const dec = num(c[iDec]);
    const pmra = num(c[iPmra]);
    const pmdec = num(c[iPmdec]);
    if (ra === null || dec === null || pmra === null || pmdec === null) continue;
    const pm = Math.hypot(pmra, pmdec);
    const err = Math.hypot(num(c[iEra]) ?? Infinity, num(c[iEdec]) ?? Infinity);
    if (pm < PM_MIN || pm < SNR_MIN * err) continue;
    moviles.push({ nombre: (c[iNom] ?? "").trim(), ra, dec, pmra, pmdec, w2: num(c[iW2]) });
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

async function consultar(ra: number, dec: number, radio: number, senal: AbortSignal): Promise<Movil[]> {
  const errores: string[] = [];
  for (const base of ESPEJOS) {
    if (senal.aborted) return [];
    try {
      return parsearMoviles(await pedir(urlCono(base, ra, dec, radio), senal));
    } catch (e) {
      if (senal.aborted) return [];
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(`ningún espejo de VizieR respondió (${errores.join(" | ")})`);
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
