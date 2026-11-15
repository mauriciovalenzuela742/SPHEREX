/**
 * Capa «objetivo»: marca del objeto en su posición propagada a `ctx.epoca` y el cuadro de `ctx.size`
 * grados. Dueño: Juan Pablo (V2). Trabajo de S2.
 *
 * Solo se dibuja si el centro de la vista (ctx.ra, ctx.dec) está a menos de `RADIO_RECONOCER_DEG` de la
 * posición J2000 de uno de los campos de prueba. Los campos de la URL vienen en J2000, así que la marca
 * cae a unos minutos de arco del centro de la vista: es lo esperado (el objeto se movió desde 2000).
 */
import A from "aladin-lite";
import { EPOCA_J2000, propagar } from "../propagacion";
import type { Capa } from "./index";

export type Objeto = {
  id: string;
  nombre: string;
  /** Nombre con la página en inglés, si difiere. */
  nombreEn?: string;
  /** ICRS, época J2000.0, grados. */
  ra: number;
  dec: number;
  /** mas/año; pmra incluye cos δ. */
  pmra: number;
  pmdec: number;
};

/**
 * Copiado de `data/campos_de_prueba.yml` (SIMBAD, espejo CfA, verificado el 14-nov-2026).
 * Ojo: para WISE 0855 es la coordenada J2000 de SIMBAD, no la del enunciado (época ~2010,4).
 * No se importa de `content/campos.ts` para no acoplar esta capa a ese archivo.
 */
const OBJETOS: Objeto[] = [
  { id: "wise_0855", nombre: "WISE 0855-0714", ra: 133.81890825, dec: -7.247048, pmra: -8123.7, pmdec: 673.2 },
  { id: "barnard", nombre: "Estrella de Barnard", nombreEn: "Barnard's Star", ra: 269.4520769586187, dec: 4.693364966576667, pmra: -801.551, pmdec: 10362.394 },
  { id: "eps_ind_b", nombre: "Epsilon Indi B", ra: 331.04414658852124, dec: -56.782844195116105, pmra: 3981.977, pmdec: -2466.832 },
  { id: "rw_aur", nombre: "RW Aurigae", ra: 76.95652603458333, dec: 30.401438173888888, pmra: 7.23, pmdec: -20.33 },
  { id: "r_dra", nombre: "R Draconis", ra: 248.16761083295, dec: 66.75497941722, pmra: -20.643, pmdec: 6.149 },
];

/** 10′: holgado frente a los ~4,5′ que se movió el más rápido (Barnard) desde J2000. */
const RADIO_RECONOCER_DEG = 10 / 60;
const COLOR = "#ffd23f";
const RAD = Math.PI / 180;

/** Separación angular en grados (haversine). */
function separacion(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const s =
    Math.sin(((dec2 - dec1) * RAD) / 2) ** 2 +
    Math.cos(dec1 * RAD) * Math.cos(dec2 * RAD) * Math.sin(((ra2 - ra1) * RAD) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s)))) / RAD;
}

/** Inversa de la proyección gnomónica (plano tangente) en (ra0, dec0); xi, eta en grados. */
function desdeTangente(ra0: number, dec0: number, xi: number, eta: number): [number, number] {
  const x = xi * RAD;
  const y = eta * RAD;
  const d0 = dec0 * RAD;
  const den = Math.cos(d0) - y * Math.sin(d0);
  const ra = ra0 + Math.atan2(x, den) / RAD;
  const dec = Math.atan2(Math.sin(d0) + y * Math.cos(d0), Math.hypot(x, den)) / RAD;
  return [((ra % 360) + 360) % 360, dec];
}

/** Objeto de prueba más cercano al centro, si está dentro del radio. */
export function objetoCercano(ra: number, dec: number): Objeto | null {
  let mejor: Objeto | null = null;
  let dMejor = RADIO_RECONOCER_DEG;
  for (const o of OBJETOS) {
    const d = separacion(ra, dec, o.ra, o.dec);
    if (d < dMejor) {
      mejor = o;
      dMejor = d;
    }
  }
  return mejor;
}

/** Nombre del rótulo en el idioma de la página (misma regla que state/idioma.tsx: lo guardado, si no el del navegador). */
function nombreVisible(o: Objeto): string {
  let en = false;
  try {
    const g = localStorage.getItem("astrotrack.idioma");
    en = g ? g === "en" : !navigator.language.startsWith("es");
  } catch {
    en = !navigator.language.startsWith("es");
  }
  return en && o.nombreEn ? o.nombreEn : o.nombre;
}

export const capaObjetivo: Capa = {
  id: "objetivo",
  montar: (aladin, ctx) => {
    const obj = objetoCercano(ctx.ra, ctx.dec);
    if (!obj) return () => {};

    const [ra, dec] = propagar(obj.ra, obj.dec, obj.pmra, obj.pmdec, EPOCA_J2000, ctx.epoca);
    const epocaTxt = ctx.epoca.toFixed(1);

    // Cuadro del recorte: ctx.size grados de lado en el plano tangente, centrado en la posición propagada.
    const m = ctx.size / 2;
    const esquinas = [
      [-m, -m],
      [m, -m],
      [m, m],
      [-m, m],
    ].map(([xi, eta]) => desdeTangente(ra, dec, xi, eta));
    const cuadro = A.graphicOverlay({ name: `Recorte ${ctx.size}° (${obj.nombre})`, color: COLOR, lineWidth: 1, lineDash: [6, 4] });
    aladin.addOverlay(cuadro);
    cuadro.add(A.polygon(esquinas));

    // Marca: catálogo de una fuente con etiqueta, para que se vea el nombre y se pueda apagar.
    const marca = A.catalog({
      name: `${obj.nombre} en ${epocaTxt}`,
      shape: "circle",
      sourceSize: 22,
      color: COLOR,
      displayLabel: true,
      labelColumn: "nombre",
      labelColor: COLOR,
      labelFont: "12px sans-serif",
    });
    aladin.addCatalog(marca);
    marca.addSources([
      A.source(ra, dec, {
        nombre: `${nombreVisible(obj)} (${epocaTxt})`,
        ra_propagada: ra.toFixed(6),
        dec_propagada: dec.toFixed(6),
        epoca: epocaTxt,
      }),
    ]);

    return () => {
      aladin.removeOverlay(marca);
      aladin.removeOverlay(cuadro);
    };
  },
};
