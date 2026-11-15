/**
 * Precalcula el explorador para los objetos con preset (src/explorador/presets.ts): la rejilla y TODAS las visitas
 * de su banda, con sus exposiciones sumadas, como float32. Así el explorador no depende de IRSA en vivo.
 * Uso (con red), desde scaffold/frontend:
 *   ./node_modules/.bin/esbuild scripts/precalcular_explorador.ts --bundle --platform=node --format=esm --outfile=/tmp/pe.mjs && node /tmp/pe.mjs
 * Escribe public/precalc/explorador/<id>.json. Fuente: prototipo D2 de Bryan (el mismo `/grid` y `/frame` del explorador).
 * La posición es la de hoy (posicionActual): el explorador solo usa el archivo si la vista está a < 3″ de ella.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { CAMPOS, posicionActual } from "../src/content/campos";

const B = "https://spherex-prototipo-d2.vercel.app/api";
const OBJETOS = [
  { id: "wise_0855", banda: 5, size: 0.1, porVisita: 10 },
  { id: "eps_ind_b", banda: 5, size: 0.1, porVisita: 10 },
];
const DESDE = "2025-04-01";
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

const DIR = pathToFileURL(`${process.cwd()}/public/precalc/explorador/`);
mkdirSync(DIR, { recursive: true });
for (const o of OBJETOS) {
  const campo = CAMPOS.find((c) => c.id === o.id)!;
  const { ra, dec } = posicionActual(campo);
  const base = { ra: String(ra), dec: String(dec), start: DESDE, end: new Date().toISOString().slice(0, 10) };
  const grid = await pedir(`${B}/grid?${new URLSearchParams({ ...base, bands: String(o.banda) })}`);
  const vis = grid.visits[o.banda];
  const frames: Record<string, unknown> = {};
  for (let v = 0; v < vis.length; v++) {
    const q = new URLSearchParams({ ...base, band: String(o.banda), visit: String(v), size: String(o.size), per_visit: String(o.porVisita) });
    frames[`${o.banda}:${v}`] = await pedir(`${B}/frame?${q}`);
  }
  const salida = { ...o, ra, dec, desde: DESDE, generado: new Date().toISOString(), fuente: "prototipo D2 /api/grid y /api/frame", grid, frames };
  writeFileSync(new URL(`${o.id}.json`, DIR), JSON.stringify(salida));
  console.log(`${o.id}: D${o.banda}, ${vis.length} visitas, ${vis[0].start.slice(0, 10)} → ${vis[vis.length - 1].start.slice(0, 10)}`);
}
