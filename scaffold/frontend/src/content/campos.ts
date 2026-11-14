/**
 * Los 5 objetos de prueba del desafío. Copia mínima de data/campos_de_prueba.yml (fuente de verdad;
 * dueño: Mauricio, C), verificada en SIMBAD el 14-nov-2026.
 *
 * `ra`/`dec` son **J2000** (ICRS, época 2000.0), no la posición actual: a 2026, WISE 0855 está a ~212″ y
 * Barnard a ~270″ de ellas, fuera de un recorte de 0,1° (medio lado 180″). Para centrar la vista usa
 * siempre `posicionActual()`, que propaga con el movimiento propio (mismo cálculo que el EDA).
 * La coordenada del enunciado para WISE 0855 es de época ~2010,4: tampoco sirve para centrar.
 */
import { EPOCA_J2000, epocaDeFecha, propagar } from "../sky/propagacion";

export type Campo = {
  id: string;
  nombre: string;
  /** J2000, grados. */
  ra: number;
  dec: number;
  /** mas/año; pmra incluye cos δ. */
  pmra: number;
  pmdec: number;
  tipo: "se mueve" | "cambia de brillo";
};

export const CAMPOS: Campo[] = [
  { id: "barnard", nombre: "Estrella de Barnard", ra: 269.4520769586187, dec: 4.693364966576667, pmra: -801.551, pmdec: 10362.394, tipo: "se mueve" },
  { id: "eps_ind_b", nombre: "Epsilon Indi B", ra: 331.04414658852124, dec: -56.782844195116105, pmra: 3981.977, pmdec: -2466.832, tipo: "se mueve" },
  { id: "wise_0855", nombre: "WISE 0855", ra: 133.81890825, dec: -7.247048, pmra: -8123.7, pmdec: 673.2, tipo: "se mueve" },
  { id: "rw_aur", nombre: "RW Aurigae", ra: 76.95652603458333, dec: 30.401438173888888, pmra: 7.23, pmdec: -20.33, tipo: "cambia de brillo" },
  { id: "r_dra", nombre: "R Draconis", ra: 248.16761083295, dec: 66.75497941722, pmra: -20.643, pmdec: 6.149, tipo: "cambia de brillo" },
];

/** Posición del campo propagada a `fecha` (por defecto hoy), redondeada a 6 decimales (~4 mas). */
export function posicionActual(c: Campo, fecha: Date = new Date()): { ra: number; dec: number } {
  const [ra, dec] = propagar(c.ra, c.dec, c.pmra, c.pmdec, EPOCA_J2000, epocaDeFecha(fecha));
  return { ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)) };
}
