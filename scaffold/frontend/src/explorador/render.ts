/**
 * Render del explorador en el navegador. Port fiel de `prototipos/rango_fechas/static/explorar.html`
 * (Bryan, D2): los fotogramas llegan como float32 crudos y se pintan aquí, con escala común por banda.
 * No cambiar la matemática sin avisar a Bryan: es la misma que validó contra el movimiento propio.
 */

export type MetaFrame = {
  n_px: number;
  t: string;
  wavelength_um: number | null;
  n_stacked: number;
  flagged_fraction: number | null;
  epoch_id: string;
  collection: string;
  method?: string;
  data: string; // float32 little-endian en base64
};
export type Frame = { meta: MetaFrame; arr: Float32Array };
export type Modo = "imagen" | "resta" | "color";

export function decodificar(b64: string): Float32Array {
  const s = atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return new Float32Array(u.buffer);
}

export function percentil(v: ArrayLike<number>, p: number): number {
  if (!v.length) return 0;
  const s = Float32Array.from(v).sort();
  return s[Math.min(s.length - 1, Math.max(0, Math.floor((p / 100) * (s.length - 1))))];
}

/** Escala común de una banda: percentiles 1 y 99,7 de todos sus fotogramas. */
export function escalaDe(frames: Frame[]): { vmin: number; vmax: number } {
  const vals: number[] = [];
  for (const f of frames) for (const x of f.arr) if (Number.isFinite(x)) vals.push(x);
  const vmin = percentil(vals, 1);
  let vmax = percentil(vals, 99.7);
  if (!(vmax > vmin)) vmax = vmin + 1;
  return { vmin, vmax };
}

export const asinh01 = (x: number, a: number, z: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (z - a)));
  return Math.asinh(t / 0.1) / Math.asinh(10);
};

/** Factor que iguala el flujo de `cur` al de `ref` con las estrellas brillantes (las épocas tienen λ distintas). */
function factorFlujo(ref: Float32Array, cur: Float32Array): number {
  const amb: number[] = [];
  for (let i = 0; i < ref.length; i++) if (Number.isFinite(ref[i]) && Number.isFinite(cur[i])) amb.push(ref[i]);
  if (amb.length < 20) return 1;
  const u = percentil(amb, 95);
  const r: number[] = [];
  for (let i = 0; i < ref.length; i++)
    if (Number.isFinite(ref[i]) && Number.isFinite(cur[i]) && ref[i] > u && cur[i] > 0) r.push(ref[i] / cur[i]);
  if (r.length < 5) return 1;
  const k = percentil(r, 50);
  return k > 0.2 && k < 5 ? k : 1;
}

/** Pinta `fr` en `canvas` según el modo. `ref` es la primera visita de la banda (t₀). */
export function dibujar(
  canvas: HTMLCanvasElement,
  fr: Frame,
  ref: Frame | undefined,
  escala: { vmin: number; vmax: number },
  m: Modo,
): void {
  const n = fr.meta.n_px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== n) {
    canvas.width = n;
    canvas.height = n;
  }
  const img = ctx.createImageData(n, n);
  const d = img.data;
  const { vmin, vmax } = escala;
  const cur = fr.arr;
  let k = 1;
  let lim = 1;
  if (m !== "imagen" && ref) {
    k = factorFlujo(ref.arr, cur);
    if (m === "resta") {
      const ds: number[] = [];
      for (let i = 0; i < cur.length; i++) {
        const x = cur[i] * k - ref.arr[i];
        if (Number.isFinite(x)) ds.push(Math.abs(x));
      }
      lim = percentil(ds, 99.5) || 1;
    }
  }
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      const o = ((n - 1 - y) * n + x) * 4; // fila 0 = sur: se voltea para dejar el norte arriba
      const c = cur[i];
      let r: number, g: number, bl: number;
      if (!Number.isFinite(c)) r = g = bl = 30;
      else if (m === "imagen" || !ref) r = g = bl = 255 * asinh01(c, vmin, vmax);
      else {
        const rf = ref.arr[i];
        if (!Number.isFinite(rf)) r = g = bl = 30;
        else if (m === "resta") {
          const t = Math.max(-1, Math.min(1, (c * k - rf) / lim));
          r = t > 0 ? 128 + 127 * t : 128 * (1 + t);
          g = 128 * (1 - Math.abs(t));
          bl = t < 0 ? 128 - 127 * t : 128 * (1 - t);
        } else {
          r = 255 * asinh01(rf, vmin, vmax);
          g = bl = 255 * asinh01(c * k, vmin, vmax);
        }
      }
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = bl;
      d[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}
