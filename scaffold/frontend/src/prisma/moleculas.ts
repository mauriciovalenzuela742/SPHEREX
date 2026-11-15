/**
 * ¿Falta luz en la zona de una molécula? (Prisma). Compara la media de las medidas usables dentro del rango
 * con la de sus tramos vecinos (`refs` en content/prisma.ts). Solo se resalta si la caída supera 3σ (con el
 * piso de calibración de pasadas.ts) y el rango tiene menos del 80 % de la luz de los vecinos: así el ruido
 * no se presenta como una molécula.
 */
import { media, usable, type PuntoVista } from "./pasadas";

export type Depresion = { razon: number; sigma: number };

export function depresion(puntos: PuntoVista[], [a, z]: [number, number], refs: [number, number][]): Depresion | null {
  const dentro = media(puntos.filter((p) => usable(p) && p.lam >= a && p.lam < z));
  const vecinos = media(puntos.filter((p) => usable(p) && refs.some(([ra, rz]) => p.lam >= ra && p.lam < rz)));
  if (!dentro || !vecinos || vecinos.v <= 0) return null;
  const sigma = (vecinos.v - dentro.v) / Math.hypot(dentro.s, vecinos.s);
  const razon = dentro.v / vecinos.v;
  return sigma > 3 && razon < 0.8 ? { razon, sigma } : null;
}
