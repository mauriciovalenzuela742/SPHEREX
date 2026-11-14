/**
 * Capa Gaia DR3 (VizieR I/355/gaiadr3), propagada de 2016,0 a `ctx.epoca`. Dueño: Juan Pablo (V2).
 * Trabajo de S3.
 *
 * Servicio: cono ASU-TSV de VizieR (`/viz-bin/asu-tsv`). Se eligió sobre el TAP porque responde rápido,
 * trae `Access-Control-Allow-Origin: *` y ordena por brillo ANTES de cortar en `-out.max` (comprobado
 * el 14-nov-2026 en el centro galáctico: con -out.max=5 salen las mismas 5 más brillantes que con la
 * tabla completa). Ese día el CDS de Estrasburgo devolvía «Page unavailable» y su TAP no conectaba;
 * el espejo de CfA respondía con CORS abierto. Por eso se prueban los espejos en orden, CfA primero
 * (la página de error de Estrasburgo no trae CORS: el navegador ensucia la consola y tardaba hasta 5 s).
 *
 * Ejemplo (eps Ind B):
 *   https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=I/355/gaiadr3&-c=331.0966+-56.8007
 *     &-c.rd=0.02&-out=Source,RA_ICRS,DE_ICRS,pmRA,pmDE,Gmag&-sort=Gmag&-out.max=2000
 *   → Source 6412596012146801152, G = 18,03, pm = (+3981,977, −2466,832) mas/año.
 *
 * Columnas (nombres reales en VizieR): Source, RA_ICRS, DE_ICRS (grados, época 2016,0), pmRA (incluye
 * cos δ), pmDE (mas/año), Gmag.
 */
import A from "aladin-lite";
import type { Capa } from "./index";
import { EPOCA_GAIA_DR3, propagar } from "../propagacion";

const ESPEJOS = [
  "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv",
  "https://vizier.cds.unistra.fr/viz-bin/asu-tsv",
];
const COLUMNAS = ["Source", "RA_ICRS", "DE_ICRS", "pmRA", "pmDE", "Gmag"] as const;
type Columna = (typeof COLUMNAS)[number];
// 2000 tapaba el mapa entero en campos densos (Barnard llegó al tope) y escondía los objetos de SIMBAD
// bajo el cursor. Con 300 las más brillantes, la vista sigue legible.
const MAX_ESTRELLAS = 300;
const RADIO_MIN_GRADOS = 0.1;
const TIMEOUT_MS = 15000;

type EstrellaGaia = {
  source: string;
  ra: number;
  dec: number;
  pmra: number | null;
  pmdec: number | null;
  gmag: number | null;
};

function urlCono(base: string, ra: number, dec: number, radio: number): string {
  const p = new URLSearchParams({
    "-source": "I/355/gaiadr3",
    "-c": `${ra.toFixed(6)} ${dec >= 0 ? "+" : ""}${dec.toFixed(6)}`,
    "-c.rd": radio.toFixed(4),
    "-out": COLUMNAS.join(","),
    "-sort": "Gmag",
    "-out.max": String(MAX_ESTRELLAS),
  });
  return `${base}?${p.toString()}`;
}

function num(s: string | undefined): number | null {
  if (s === undefined) return null;
  const t = s.trim();
  if (t === "") return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

/** TSV de VizieR: comentarios «#», cabecera, unidades, guiones y luego filas. */
function parsearTsv(texto: string): EstrellaGaia[] {
  const lineas = texto.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#"));
  const iCab = lineas.findIndex((l) => l.split("\t").map((c) => c.trim()).includes("RA_ICRS"));
  if (iCab < 0) throw new Error("respuesta de VizieR sin cabecera reconocible");
  const cab = lineas[iCab].split("\t").map((c) => c.trim());
  const idx = Object.fromEntries(COLUMNAS.map((c) => [c, cab.indexOf(c)])) as Record<Columna, number>;
  const filas: EstrellaGaia[] = [];
  for (const l of lineas.slice(iCab + 1)) {
    const c = l.split("\t");
    const ra = num(c[idx.RA_ICRS]);
    const dec = num(c[idx.DE_ICRS]);
    if (ra === null || dec === null) continue; // unidades, guiones u otra línea que no es fila
    filas.push({
      source: (c[idx.Source] ?? "").trim(),
      ra,
      dec,
      pmra: num(c[idx.pmRA]),
      pmdec: num(c[idx.pmDE]),
      gmag: num(c[idx.Gmag]),
    });
  }
  return filas;
}

/** Pide el cono a un espejo, con su propio tope de tiempo y respetando el aborto del desmontaje. */
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

async function consultar(ra: number, dec: number, radio: number, senal: AbortSignal): Promise<EstrellaGaia[]> {
  const errores: string[] = [];
  for (const base of ESPEJOS) {
    if (senal.aborted) break;
    try {
      return parsearTsv(await pedir(urlCono(base, ra, dec, radio), senal));
    } catch (e) {
      if (senal.aborted) break;
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (senal.aborted) return [];
  throw new Error(`ningún espejo de VizieR respondió (${errores.join(" | ")})`);
}

export const capaGaia: Capa = {
  id: "gaia",
  montar: (aladin, ctx) => {
    const control = new AbortController();
    const radio = Math.max(ctx.size, RADIO_MIN_GRADOS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let catalogo: any = null;

    consultar(ctx.ra, ctx.dec, radio, control.signal)
      .then((estrellas) => {
        if (control.signal.aborted) return;
        catalogo = A.catalog({
          name: `Gaia DR3 (época ${ctx.epoca.toFixed(1)})`,
          color: "#4fc3f7",
          sourceSize: 14,
          shape: "circle",
        });
        const fuentes = estrellas.map((s) => {
          // Sin movimiento propio (solución de 2 parámetros) la estrella se queda en su posición de 2016,0.
          const [ra, dec] =
            s.pmra !== null && s.pmdec !== null
              ? propagar(s.ra, s.dec, s.pmra, s.pmdec, EPOCA_GAIA_DR3, ctx.epoca)
              : [s.ra, s.dec];
          return A.source(ra, dec, {
            Source: s.source,
            G: s.gmag,
            pmRA: s.pmra,
            pmDE: s.pmdec,
            RA_2016: s.ra,
            DE_2016: s.dec,
          });
        });
        aladin.addCatalog(catalogo);
        catalogo.addSources(fuentes);
        console.info(`[gaia] ${fuentes.length} estrellas de Gaia DR3 (radio ${radio}°)`);
      })
      .catch((e) => {
        if (control.signal.aborted) return;
        console.error("[gaia] no se pudo cargar Gaia DR3:", e);
      });

    return () => {
      control.abort();
      if (catalogo) {
        try {
          aladin.removeLayer(catalogo);
        } catch (e) {
          console.error("[gaia] error al quitar el catálogo:", e);
        }
      }
    };
  },
};
