/**
 * Propagación de posiciones por movimiento propio. Dueño: Juan Pablo (V2).
 * Port de `posicion_en` (eda/comun.py): lineal, sin paralaje. El paralaje mayor de los campos de prueba
 * (Barnard, 0,55″) es menos de una décima de píxel de SPHEREx (6,15″/px).
 *
 * Épocas en años julianos decimales (J2000.0 = 2000.0; Gaia DR3 = 2016.0), igual que el EDA:
 * dt = (MJD − 51544,5) / 365,25.
 *
 * TODO (S2): comprobar contra la tabla de referencia (eps Ind B, WISE 0855 y Barnard en 2025,5 y 2026,5)
 * con 6 decimales.
 */

export const EPOCA_J2000 = 2000.0;
export const EPOCA_GAIA_DR3 = 2016.0;
const MJD_J2000 = 51544.5;

/**
 * Propaga (ra, dec) en grados de `epocaRef` a `epocaDestino` (años decimales).
 * `pmraMas` ya incluye el factor cos δ (convención de SIMBAD y Gaia); ambos en mas/año.
 */
export function propagar(
  ra: number,
  dec: number,
  pmraMas: number,
  pmdecMas: number,
  epocaRef: number,
  epocaDestino: number,
): [number, number] {
  const dt = epocaDestino - epocaRef;
  const dDec = (pmdecMas * dt) / 3.6e6;
  const dRa = (pmraMas * dt) / 3.6e6 / Math.cos((dec * Math.PI) / 180);
  const raNueva = (((ra + dRa) % 360) + 360) % 360;
  return [raNueva, dec + dDec];
}

/** Año juliano decimal de una fecha (para pasar la fecha de un fotograma como `epoca`). */
export function epocaDeFecha(fecha: Date): number {
  const mjd = fecha.getTime() / 86400000 + 40587; // 1970-01-01 = MJD 40587
  return EPOCA_J2000 + (mjd - MJD_J2000) / 365.25;
}
