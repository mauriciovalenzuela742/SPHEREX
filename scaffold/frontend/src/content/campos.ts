/**
 * Los 5 objetos de prueba del desafío. Copia mínima de data/campos_de_prueba.yml
 * (fuente de verdad; dueño: Mauricio, C). WISE 0855 usa la posición PROPAGADA, no la del enunciado.
 */
export type Campo = { id: string; nombre: string; ra: number; dec: number; tipo: "se mueve" | "cambia de brillo" };

export const CAMPOS: Campo[] = [
  { id: "barnard", nombre: "Estrella de Barnard", ra: 269.4520769586187, dec: 4.693364966576667, tipo: "se mueve" },
  { id: "eps_ind_b", nombre: "Epsilon Indi B", ra: 331.04414658852124, dec: -56.782844195116105, tipo: "se mueve" },
  { id: "wise_0855", nombre: "WISE 0855", ra: 133.81890825, dec: -7.247048, tipo: "se mueve" },
  { id: "rw_aur", nombre: "RW Aurigae", ra: 76.95652603458333, dec: 30.401438173888888, tipo: "cambia de brillo" },
  { id: "r_dra", nombre: "R Draconis", ra: 248.16761083295, dec: 66.75497941722, tipo: "cambia de brillo" },
];
