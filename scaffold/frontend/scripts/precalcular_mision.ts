/**
 * Precalcula las fotos del Modo Misión (primera y última visita, float32) para que la demo no dependa de IRSA.
 * Uso (con red), desde scaffold/frontend:
 *   ./node_modules/.bin/esbuild scripts/precalcular_mision.ts --bundle --platform=node --format=esm --outfile=/tmp/pm.mjs && node /tmp/pm.mjs
 * Escribe public/precalc/mision/<id>.json. Fuente: prototipo D2 de Bryan (mismo `/frame` que usa el explorador).
 * Mantener sincronizado con `banda`, `size` y `porVisita` de cada nivel en src/content/mision.ts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { CAMPOS, posicionActual } from "../src/content/campos";

const B = "https://spherex-prototipo-d2.vercel.app/api";
const NIVELES = [
  { id: "barnard", banda: 2, size: 0.05, porVisita: 1 },
  { id: "wise_0855", banda: 5, size: 0.05, porVisita: 10 },
  { id: "eps_ind_b", banda: 5, size: 0.05, porVisita: 10 },
  { id: "rw_aur", banda: 2, size: 0.05, porVisita: 1 },
];
const esperar = (ms: number) => new Promise((o) => setTimeout(o, ms));
async function pedir(url: string) {
  for (let k = 0; k < 5; k++) {
    const r = await fetch(url);
    const j = await r.json().catch(() => ({}));
    if (r.ok) return j;
    console.log(`  reintento (${r.status})`);
    await esperar(6000);
  }
  throw new Error(`falló ${url}`);
}

// Relativo a donde se corre (scaffold/frontend), no al archivo empaquetado.
const DIR = pathToFileURL(`${process.cwd()}/public/precalc/mision/`);
mkdirSync(DIR, { recursive: true });
for (const nv of NIVELES) {
  const campo = CAMPOS.find((c) => c.id === nv.id)!;
  const { ra, dec } = posicionActual(campo);
  const base = { ra: String(ra), dec: String(dec), start: "2025-04-01", end: new Date().toISOString().slice(0, 10) };
  const g = await pedir(`${B}/grid?${new URLSearchParams({ ...base, bands: String(nv.banda) })}`);
  const vis = g.visits[nv.banda];
  const frames = await Promise.all(
    [0, vis.length - 1].map((v) =>
      pedir(`${B}/frame?${new URLSearchParams({ ...base, band: String(nv.banda), visit: String(v), size: String(nv.size), per_visit: String(nv.porVisita) })}`),
    ),
  );
  const salida = { id: nv.id, ra, dec, ...nv, generado: new Date().toISOString(), fuente: "prototipo D2 /api/frame", frames };
  writeFileSync(new URL(`${nv.id}.json`, DIR), JSON.stringify(salida));
  console.log(`${nv.id}: D${nv.banda}, ${vis.length} visitas, ${frames[0].t.slice(0, 10)} → ${frames[1].t.slice(0, 10)}, n_stacked ${frames[0].n_stacked}/${frames[1].n_stacked}`);
}
