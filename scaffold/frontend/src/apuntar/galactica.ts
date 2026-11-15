/**
 * Coordenadas galácticas y punto al azar lejos del plano de la Vía Láctea. Dueño: Juan Pablo (V2).
 *
 * Matriz de rotación ICRS → galácticas (marco de Hipparcos, ESA 1997, vol. 1 §1.5.3; la misma que
 * usa astropy). Comprobada con node el 14-nov-2026: Sgr A* (ICRS 266.41683, −29.00781 →
 * l = 359.944°, b = −0.046°) y con el polo norte galáctico (ICRS 192.85948, +27.12825 → b = +90°).
 */

const RAD = Math.PI / 180;

/** Filas: ejes galácticos x, y, z expresados en ICRS. */
const M = [
  [-0.0548755604162154, -0.873437090234885, -0.4838350155487132],
  [0.4941094278755837, -0.4448296299600112, 0.7469822444972189],
  [-0.8676661490190047, -0.1980763734312015, 0.4559837761750669],
];

const vector = (lon: number, lat: number) => [
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
  Math.sin(lat * RAD),
];

const angulos = (v: number[]): [number, number] => {
  const lon = Math.atan2(v[1], v[0]) / RAD;
  const lat = Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD;
  return [((lon % 360) + 360) % 360, lat];
};

/** (A.R., Dec) ICRS en grados → (l, b) galácticas en grados. */
export function icrsAGalactica(ra: number, dec: number): [number, number] {
  const v = vector(ra, dec);
  return angulos(M.map((fila) => fila[0] * v[0] + fila[1] * v[1] + fila[2] * v[2]));
}

/** (l, b) galácticas → (A.R., Dec) ICRS, con la matriz transpuesta. */
export function galacticaAIcrs(l: number, b: number): [number, number] {
  const v = vector(l, b);
  return angulos([0, 1, 2].map((j) => M[0][j] * v[0] + M[1][j] * v[1] + M[2][j] * v[2]));
}

/**
 * Punto al azar con |b| > `bMin`, repartido de forma pareja sobre la esfera (no se amontona en los polos):
 * l uniforme y sen|b| uniforme entre sen(bMin) y 1, con signo al azar.
 */
export function puntoAlAzar(bMin = 20, azar: () => number = Math.random): { ra: number; dec: number; l: number; b: number } {
  const l = azar() * 360;
  const s = Math.sin(bMin * RAD) + azar() * (1 - Math.sin(bMin * RAD));
  const b = (azar() < 0.5 ? -1 : 1) * Math.asin(s) / RAD;
  const [ra, dec] = galacticaAIcrs(l, b);
  return { ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)), l, b };
}
