// Comprueba `propagar` (src/sky/propagacion.ts) contra la tabla de referencia de Python
// (`posicion_en` de eda/comun.py). J2000 y movimiento propio: data/campos_de_prueba.yml.
// Uso: node --experimental-strip-types scripts/comprobar_propagacion.mjs
import { propagar, EPOCA_J2000 } from "../src/sky/propagacion.ts";

const TOL = 5e-7; // coincidencia en la 6.ª cifra decimal (redondeo)

const campos = {
  "eps Ind B": { ra: 331.04414658852124, dec: -56.782844195116105, pmra: 3981.977, pmdec: -2466.832 },
  "WISE 0855": { ra: 133.81890825, dec: -7.247048, pmra: -8123.7, pmdec: 673.2 },
  Barnard: { ra: 269.4520769586187, dec: 4.693364966576667, pmra: -801.551, pmdec: 10362.394 },
};

const esperado = [
  ["eps Ind B", 2025.5, 331.095634, -56.800318],
  ["eps Ind B", 2026.5, 331.097653, -56.801003],
  ["WISE 0855", 2025.5, 133.760902, -7.24228],
  ["WISE 0855", 2026.5, 133.758627, -7.242093],
  ["Barnard", 2025.5, 269.44638, 4.766765],
  ["Barnard", 2026.5, 269.446157, 4.769644],
];

let fallos = 0;
for (const [nombre, epoca, raE, decE] of esperado) {
  const c = campos[nombre];
  const [ra, dec] = propagar(c.ra, c.dec, c.pmra, c.pmdec, EPOCA_J2000, epoca);
  const dRa = ra - raE;
  const dDec = dec - decE;
  const ok = ra.toFixed(6) === raE.toFixed(6) && dec.toFixed(6) === decE.toFixed(6) && Math.abs(dRa) <= TOL && Math.abs(dDec) <= TOL + 1e-12;
  if (!ok) fallos++;
  console.log(
    `${ok ? "OK   " : "FALLA"} ${nombre.padEnd(9)} ${epoca}  ` +
      `RA ${ra.toFixed(6)} (esp ${raE.toFixed(6)}, Δ ${dRa.toExponential(2)})  ` +
      `Dec ${dec.toFixed(6)} (esp ${decE.toFixed(6)}, Δ ${dDec.toExponential(2)})`,
  );
}
console.log(fallos ? `${fallos} de ${esperado.length} no coinciden` : `Los ${esperado.length} coinciden`);
process.exit(fallos ? 1 : 0);
