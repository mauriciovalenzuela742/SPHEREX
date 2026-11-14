/**
 * Fotometría de apertura en el navegador sobre los fotogramas del explorador (Prisma).
 * Entrada: float32 n×n, IMAGE − ZODI en MJy/sr con el fondo llevado a 0 (prototipo de Bryan), fila 0 = sur,
 * centrado en la posición pedida. Píxeles enmascarados dentro del detector llegan como 0 (p. ej. núcleo
 * saturado): se detectan y el punto se marca como «saturado», no se grafica como si fuera débil.
 *
 * Es una medida APROXIMADA (apertura fija, sin PSF ni corrección de apertura): sirve para ver la forma
 * del espectro y comparar con estrellas vecinas, no como fotometría calibrada (docs/03, `caveat`).
 */
import type { Frame } from "../explorador/render";

const PIX_ARCSEC = 6.15;
/** Ángulo sólido de un píxel en estereorradianes. */
const OMEGA_SR = (PIX_ARCSEC / 206264.806) ** 2;
/** MJy/sr · sr = MJy = 1e9 mJy. */
export const aMilliJy = (sumaMJysr: number) => sumaMJysr * OMEGA_SR * 1e9;

const R_AP = 2.5; // radio de apertura en píxeles (~15″)
const R_IN = 5; // anillo de fondo
const R_OUT = 9;
const R_BUSQUEDA = 3; // el objeto puede estar corrido ~2 px en visitas viejas (movimiento propio)

function mediana(a: number[]): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Pico local cerca de (cx, cy): devuelve su posición (x, y). */
function pico(arr: Float32Array, n: number, cx: number, cy: number, r: number): [number, number] {
  let mx = Math.round(cx);
  let my = Math.round(cy);
  let mejor = -Infinity;
  for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(n - 1, Math.ceil(cy + r)); y++)
    for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(n - 1, Math.ceil(cx + r)); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue;
      const v = arr[y * n + x];
      if (Number.isFinite(v) && v > mejor) {
        mejor = v;
        mx = x;
        my = y;
      }
    }
  return [mx, my];
}

export type Medida = { mJy: number; errMJy: number; snr: number; saturado: boolean; x: number; y: number };

/** Umbral de detección: por debajo, el punto se muestra como límite superior («no detectado»). */
export const SNR_MIN = 3;

/** Apertura de radio R_AP en (x, y) menos la mediana del anillo R_IN–R_OUT. */
export function apertura(arr: Float32Array, n: number, x0: number, y0: number): Medida {
  let suma = 0;
  let npix = 0;
  let saturado = false;
  const anillo: number[] = [];
  for (let y = Math.max(0, Math.floor(y0 - R_OUT)); y <= Math.min(n - 1, Math.ceil(y0 + R_OUT)); y++)
    for (let x = Math.max(0, Math.floor(x0 - R_OUT)); x <= Math.min(n - 1, Math.ceil(x0 + R_OUT)); x++) {
      const d2 = (x - x0) ** 2 + (y - y0) ** 2;
      const v = arr[y * n + x];
      if (d2 <= R_AP * R_AP) {
        // Enmascarado dentro del detector = 0 exacto; fuera del detector = NaN.
        if (!Number.isFinite(v) || v === 0) saturado = true;
        else suma += v;
        npix++;
      } else if (d2 >= R_IN * R_IN && d2 <= R_OUT * R_OUT && Number.isFinite(v) && v !== 0) {
        anillo.push(v);
      }
    }
  const fondo = mediana(anillo);
  // Ruido por píxel con la MAD del anillo (robusta a estrellas que caen en él).
  const sigma = 1.4826 * mediana(anillo.map((v) => Math.abs(v - fondo)));
  const mJy = aMilliJy(suma - fondo * npix);
  const errMJy = Math.max(1e-9, aMilliJy(sigma * Math.sqrt(npix)));
  return { mJy, errMJy, snr: mJy / errMJy, saturado, x: x0, y: y0 };
}

/**
 * Ruido real de una apertura en este fotograma, medido empíricamente: aperturas en una rejilla sobre el
 * cielo (lejos del centro) y la dispersión robusta (MAD) de sus flujos. El ruido por píxel subestima el
 * error porque los fotogramas están reproyectados con interpolación y los píxeles quedan correlacionados.
 */
const ruidoCache = new WeakMap<Float32Array, number>();
export function ruidoApertura(fr: Frame): number {
  const enCache = ruidoCache.get(fr.arr);
  if (enCache !== undefined) return enCache;
  const n = fr.meta.n_px;
  const c = (n - 1) / 2;
  const flujos: number[] = [];
  for (let y = R_OUT; y < n - R_OUT; y += 5)
    for (let x = R_OUT; x < n - R_OUT; x += 5) {
      if ((x - c) ** 2 + (y - c) ** 2 < 8 * 8) continue;
      const m = apertura(fr.arr, n, x, y);
      if (!m.saturado) flujos.push(m.mJy);
    }
  const med = mediana(flujos);
  const err = flujos.length >= 8 ? 1.4826 * mediana(flujos.map((f) => Math.abs(f - med))) : NaN;
  const final = Number.isFinite(err) && err > 0 ? err : 1e-9;
  ruidoCache.set(fr.arr, final);
  return final;
}

function conRuido(m: Medida, err: number): Medida {
  const errMJy = Math.max(err, m.errMJy);
  return { ...m, errMJy, snr: m.mJy / errMJy };
}

/**
 * El objeto pedido. Se mide en el centro; si cerca hay un pico SIGNIFICATIVO (objeto corrido por movimiento
 * propio en una visita vieja), se mide ahí. Buscar el máximo en puro ruido inflaría la medida de objetos
 * débiles (WISE 0855), por eso solo se acepta el pico si su apertura supera SNR_MIN con el ruido empírico.
 */
export function medirObjeto(fr: Frame): Medida {
  const n = fr.meta.n_px;
  const c = (n - 1) / 2;
  const err = ruidoApertura(fr);
  const centro = conRuido(apertura(fr.arr, n, Math.round(c), Math.round(c)), err);
  const [x, y] = pico(fr.arr, n, c, c, R_BUSQUEDA);
  const enPico = conRuido(apertura(fr.arr, n, x, y), err);
  return enPico.snr >= SNR_MIN && enPico.snr > centro.snr ? enPico : centro;
}

/** Estrellas vecinas: las más brillantes lejos del centro y del borde, separadas entre sí, no saturadas. */
export function medirVecinas(fr: Frame, cuantas = 5): Medida[] {
  const n = fr.meta.n_px;
  const c = (n - 1) / 2;
  const cand: { x: number; y: number; v: number }[] = [];
  for (let y = R_OUT; y < n - R_OUT; y++)
    for (let x = R_OUT; x < n - R_OUT; x++) {
      if ((x - c) ** 2 + (y - c) ** 2 < 10 * 10) continue;
      const v = fr.arr[y * n + x];
      if (!Number.isFinite(v) || v <= 0) continue;
      let esMax = true;
      for (let dy = -1; dy <= 1 && esMax; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && fr.arr[(y + dy) * n + x + dx] > v) {
            esMax = false;
            break;
          }
      if (esMax) cand.push({ x, y, v });
    }
  cand.sort((a, b) => b.v - a.v);
  const elegidas: Medida[] = [];
  for (const k of cand) {
    if (elegidas.length >= cuantas) break;
    if (elegidas.some((e) => (e.x - k.x) ** 2 + (e.y - k.y) ** 2 < 64)) continue;
    const m = apertura(fr.arr, n, k.x, k.y);
    if (!m.saturado && m.mJy / ruidoApertura(fr) >= 10) elegidas.push(m);
  }
  return elegidas;
}

export type PuntoEspectral = {
  lambda: number; // µm
  mJy: number;
  errMJy: number;
  /** S/N ≥ SNR_MIN y sin saturar: medida usable. Si no, límite superior o saturado. */
  detectado: boolean;
  saturado: boolean;
  banda: number;
  visita: number;
  t: string;
  /** Mediana de las vecinas en este fotograma (mJy), para comparar la forma. */
  vecinas: number | null;
};

/** Todos los fotogramas cargados → puntos espectrales ordenados por λ. */
export function espectro(frames: Map<string, Frame>): PuntoEspectral[] {
  const out: PuntoEspectral[] = [];
  for (const [k, fr] of frames) {
    if (!fr.meta.wavelength_um) continue;
    const [b, v] = k.split(":").map(Number);
    const obj = medirObjeto(fr);
    const vec = medirVecinas(fr).map((m) => m.mJy);
    out.push({
      lambda: fr.meta.wavelength_um,
      mJy: obj.mJy,
      errMJy: obj.errMJy,
      detectado: !obj.saturado && obj.snr >= SNR_MIN,
      saturado: obj.saturado,
      banda: b,
      visita: v,
      t: fr.meta.t,
      vecinas: vec.length ? mediana(vec) : null,
    });
  }
  return out.sort((a, b) => a.lambda - b.lambda);
}
