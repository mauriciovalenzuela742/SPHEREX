/**
 * Configuración con la que SE VE el movimiento de los objetos débiles (V2, docs/hallazgos/2026-11-14_*):
 * WISE 0855 y eps Ind B no se ven con 1 exposición por visita; con la banda 5 y 10 exposiciones sumadas por
 * visita, la resta de la última contra la primera muestra la pareja azul/roja. Es lo mismo que usa el Modo Misión.
 *
 * Si hay fotos precalculadas (`public/precalc/explorador/<id>.json`, scripts/precalcular_explorador.ts), el
 * explorador las usa y no consulta IRSA en vivo. Los demás objetos no tienen preset: se cargan como siempre.
 */
import { CAMPOS, posicionActual } from "../content/campos";

export type Preset = { id: string; banda: number; porVisita: number; razon: string };

const PRESETS: Preset[] = [
  {
    id: "wise_0855",
    banda: 5,
    porVisita: 10,
    razon: "Este objeto es muy débil: sumamos 10 fotos de cada visita en la banda 5 para verlo. Ves la resta de la última visita contra la primera: azul es donde estaba y rojo, donde está.",
  },
  {
    id: "eps_ind_b",
    banda: 5,
    porVisita: 10,
    razon: "Este objeto es débil: sumamos 10 fotos de cada visita en la banda 5 para verlo. Ves la resta de la última visita contra la primera: azul es donde estaba y rojo, donde está.",
  },
];

/** Distancia máxima (″) a la posición de hoy del objeto para aplicar su preset. */
const TOLERANCIA_ARCSEC = 10;

export function distanciaArcsec(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const dra = (ra1 - ra2) * Math.cos((((dec1 + dec2) / 2) * Math.PI) / 180);
  return Math.hypot(dra, dec1 - dec2) * 3600;
}

/** Preset del objeto que está en (ra, dec), si lo hay. */
export function presetEn(ra: number, dec: number): Preset | null {
  for (const p of PRESETS) {
    const c = CAMPOS.find((x) => x.id === p.id);
    if (!c) continue;
    const hoy = posicionActual(c);
    if (distanciaArcsec(ra, dec, hoy.ra, hoy.dec) < TOLERANCIA_ARCSEC) return p;
  }
  return null;
}
