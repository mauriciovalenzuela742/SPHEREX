/**
 * Apilado de visitas («add together all the data … to improve the signal-to-noise», enunciado del desafío).
 * Dueño: Juan Pablo (V2). No toca render.ts (Bryan): solo reutiliza `percentil` y `asinh01`.
 *
 * Geometría de los fotogramas (prototipos/rango_fechas/spherex.py, `wcs_destino`): cada visita se reproyecta
 * a la MISMA rejilla TAN centrada en la posición pedida, fija para todas las fechas (no se recentra en la posición
 * propagada de cada visita). Píxel de 6,15″, columna creciente hacia el OESTE (cdelt1 < 0), fila 0 = sur.
 * Por eso, en los fotogramas, las estrellas están quietas y el objeto con movimiento propio se desplaza:
 *  - apilado quieto      = sumar tal cual → fondo nítido, el objeto que se mueve queda como trazo;
 *  - siguiendo al objeto = correr cada visita según el movimiento propio hasta una época común y sumar →
 *    el objeto queda como un punto y las estrellas fijas se alargan.
 */
import { EPOCA_J2000, epocaDeFecha, propagar } from "../sky/propagacion";
import { CAMPOS, type Campo } from "../content/campos";
import { asinh01, percentil, type Frame } from "./render";
import { distanciaArcsec } from "./presets";

export type Metodo = "promedio" | "mediana";
export type Punto = { x: number; y: number };

/** Objeto del catálogo con movimiento propio apreciable cerca de (ra, dec), si lo hay. */
export function objetoEn(ra: number, dec: number, fecha: Date = new Date()): Campo | null {
  let mejor: Campo | null = null;
  let dmin = 90; // ″: cualquier posición de ±15 meses del objeto cae dentro
  for (const c of CAMPOS) {
    if (Math.hypot(c.pmra, c.pmdec) < 500) continue; // < 0,5″/año: no se nota en píxeles de 6,15″
    const [r, d] = propagar(c.ra, c.dec, c.pmra, c.pmdec, EPOCA_J2000, epocaDeFecha(fecha));
    const dist = distanciaArcsec(ra, dec, r, d);
    if (dist < dmin) {
      dmin = dist;
      mejor = c;
    }
  }
  return mejor;
}

/** Píxel (0-based, fila 0 = sur) donde está el objeto en `fecha`, en un fotograma n×n centrado en (ra0, dec0). */
export function pixelDelObjeto(c: Campo, ra0: number, dec0: number, n: number, escalaArcsec: number, fecha: Date): Punto {
  const [ra, dec] = propagar(c.ra, c.dec, c.pmra, c.pmdec, EPOCA_J2000, epocaDeFecha(fecha));
  let dra = ra - ra0;
  if (dra > 180) dra -= 360;
  if (dra < -180) dra += 360;
  const centro = (n - 1) / 2;
  // Aproximación plana: a 3′ del centro el error de la proyección TAN es despreciable frente a 6,15″.
  return {
    x: centro - (dra * Math.cos((dec0 * Math.PI) / 180) * 3600) / escalaArcsec, // este a la izquierda
    y: centro + ((dec - dec0) * 3600) / escalaArcsec,
  };
}

/** Fondo y ruido robustos (mediana y 1,4826·MAD con recorte iterativo a 3σ, sin las fuentes). */
export function fondoYRuido(arr: ArrayLike<number>): { fondo: number; ruido: number } {
  let v: number[] = [];
  for (let i = 0; i < arr.length; i++) if (Number.isFinite(arr[i])) v.push(arr[i]);
  let fondo = 0;
  let ruido = 0;
  for (let it = 0; it < 5 && v.length > 10; it++) {
    fondo = percentil(v, 50);
    ruido = 1.4826 * percentil(v.map((x) => Math.abs(x - fondo)), 50);
    if (!(ruido > 0)) break;
    const lim = 3 * ruido;
    const w = v.filter((x) => Math.abs(x - fondo) < lim);
    if (w.length === v.length) break;
    v = w;
  }
  return { fondo, ruido };
}

/**
 * `src` corrido: out(x, y) = src(x + dx, y + dy), interpolación bilineal subpíxel.
 * Los vecinos sin dato (NaN) no cuentan; si falta más de la mitad del peso, el píxel queda NaN.
 */
export function desplazar(src: Float32Array, n: number, dx: number, dy: number): Float32Array {
  const out = new Float32Array(n * n).fill(NaN);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const sx = x + dx;
      const sy = y + dy;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const fx = sx - x0;
      const fy = sy - y0;
      let s = 0;
      let w = 0;
      for (const [xx, yy, ww] of [
        [x0, y0, (1 - fx) * (1 - fy)],
        [x0 + 1, y0, fx * (1 - fy)],
        [x0, y0 + 1, (1 - fx) * fy],
        [x0 + 1, y0 + 1, fx * fy],
      ]) {
        if (xx < 0 || yy < 0 || xx >= n || yy >= n || ww <= 0) continue;
        const val = src[yy * n + xx];
        if (!Number.isFinite(val)) continue;
        s += val * ww;
        w += ww;
      }
      if (w > 0.5) out[y * n + x] = s / w;
    }
  return out;
}

/** Combina fotogramas n×n píxel a píxel (promedio o mediana de los valores con dato). */
export function combinar(capas: Float32Array[], n: number, metodo: Metodo): Float32Array {
  const out = new Float32Array(n * n).fill(NaN);
  const vals = new Float64Array(capas.length);
  for (let i = 0; i < n * n; i++) {
    let k = 0;
    for (const c of capas) if (Number.isFinite(c[i])) vals[k++] = c[i];
    if (!k) continue;
    if (metodo === "promedio") {
      let s = 0;
      for (let j = 0; j < k; j++) s += vals[j];
      out[i] = s / k;
    } else {
      const s = Array.from(vals.subarray(0, k)).sort((a, b) => a - b);
      out[i] = k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2;
    }
  }
  return out;
}

/** S/N de una fuente puntual: suma en una caja de 3×3 píxeles centrada en `p`, sobre el ruido de esa caja (σ·3). */
export function snEn(arr: Float32Array, n: number, p: Punto, ruido: number): number | null {
  const cx = Math.round(p.x);
  const cy = Math.round(p.y);
  let s = 0;
  let k = 0;
  for (let y = cy - 1; y <= cy + 1; y++)
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (x < 0 || y < 0 || x >= n || y >= n) continue;
      const v = arr[y * n + x];
      if (Number.isFinite(v)) {
        s += v;
        k++;
      }
    }
  if (k < 9 || !(ruido > 0)) return null;
  return s / (ruido * 3);
}

export type Apilado = {
  n: number;
  nVisitas: number;
  /** Una visita sola (la más reciente), sin fondo: para comparar a la misma escala. */
  una: Float32Array;
  quieto: Float32Array;
  siguiendo: Float32Array | null;
  /** Ruido del fondo (MJy/sr): mediana del de cada visita sola, y el de cada apilado. */
  ruidoUna: number;
  ruidoQuieto: number;
  ruidoSiguiendo: number | null;
  /**
   * Ruido aleatorio, sin la estructura fija del cielo (fuentes débiles bajo el recorte, gradientes): en una visita,
   * σ(visita_i − visita_j)/√2; en el apilado de N, σ(apilado de una mitad − apilado de la otra)/2. Solo para el promedio.
   */
  aleatorioUna: number | null;
  aleatorioApilado: number | null;
  /** S/N del objeto en una caja 3×3 donde debería estar (null si no hay objeto conocido o cae fuera). */
  snUna: number | null;
  snQuieto: number | null;
  snSiguiendo: number | null;
  /** Posición predicha del objeto en cada visita (para dibujar su recorrido) y en la época común. */
  recorrido: Punto[];
  /** Dónde queda el objeto en la visita sola que se muestra (la más reciente). */
  enUna: Punto | null;
  comun: Punto | null;
  /** Píxel más brillante del objeto en el apilado «siguiendo» (caja 3×3), para la escala de pintura. */
  pico: number | null;
  /** Época común del apilado «siguiendo» (la fecha de la visita más reciente). */
  fechaComun: string;
  /** Corrimiento máximo aplicado, en píxeles. */
  corrimientoMax: number;
};

/**
 * Apila las visitas de una banda. `ra0, dec0` = centro de los fotogramas; `objeto` = catálogo con su
 * movimiento propio (si es null, solo se hace el apilado quieto). Cada visita se resta su fondo antes de sumar.
 */
export function apilarVisitas(
  frames: Frame[],
  ra0: number,
  dec0: number,
  escalaArcsec: number,
  objeto: Campo | null,
  metodo: Metodo,
): Apilado | null {
  const fs = frames.filter((f) => f.arr.length === f.meta.n_px * f.meta.n_px).sort((a, b) => Date.parse(a.meta.t) - Date.parse(b.meta.t));
  if (fs.length < 2) return null;
  const n = fs[0].meta.n_px;
  const mismas = fs.filter((f) => f.meta.n_px === n);
  const limpias = mismas.map((f) => {
    const { fondo, ruido } = fondoYRuido(f.arr);
    const a = new Float32Array(f.arr.length);
    for (let i = 0; i < a.length; i++) a[i] = f.arr[i] - fondo;
    return { a, ruido, fecha: new Date(f.meta.t) };
  });
  const quieto = combinar(limpias.map((l) => l.a), n, metodo);
  const ultima = limpias[limpias.length - 1];
  const ruidos = limpias.map((l) => l.ruido).filter((r) => r > 0);
  const ruidoUna = ruidos.length ? percentil(ruidos, 50) : 0;
  const ruidoQuieto = fondoYRuido(quieto).ruido;
  const resta = (a: Float32Array, b: Float32Array) => a.map((x, i) => x - b[i]);
  const difs: number[] = [];
  for (let i = 1; i < limpias.length; i++) difs.push(fondoYRuido(resta(limpias[i].a, limpias[i - 1].a)).ruido / Math.SQRT2);
  const aleatorioUna = difs.length ? percentil(difs, 50) : null;
  let aleatorioApilado: number | null = null;
  if (limpias.length >= 4) {
    // Mitades alternadas (pares e impares) para que las dos cubran el mismo rango de fechas.
    const pares = combinar(limpias.filter((_, i) => i % 2 === 0).map((l) => l.a), n, "promedio");
    const impares = combinar(limpias.filter((_, i) => i % 2 === 1).map((l) => l.a), n, "promedio");
    aleatorioApilado = fondoYRuido(resta(pares, impares)).ruido / 2;
  }

  let siguiendo: Float32Array | null = null;
  let ruidoSiguiendo: number | null = null;
  let snUna: number | null = null;
  let snQuieto: number | null = null;
  let snSiguiendo: number | null = null;
  let recorrido: Punto[] = [];
  let enUna: Punto | null = null;
  let comun: Punto | null = null;
  let corrimientoMax = 0;
  let pico: number | null = null;
  if (objeto) {
    recorrido = limpias.map((l) => pixelDelObjeto(objeto, ra0, dec0, n, escalaArcsec, l.fecha));
    comun = recorrido[recorrido.length - 1];
    enUna = comun;
    const corridas = limpias.map((l, i) => {
      const dx = recorrido[i].x - comun!.x;
      const dy = recorrido[i].y - comun!.y;
      corrimientoMax = Math.max(corrimientoMax, Math.hypot(dx, dy));
      return desplazar(l.a, n, dx, dy);
    });
    siguiendo = combinar(corridas, n, metodo);
    ruidoSiguiendo = fondoYRuido(siguiendo).ruido;
    // Una visita: mediana del S/N de cada visita en su propia posición predicha.
    const sns = limpias.map((l, i) => snEn(l.a, n, recorrido[i], l.ruido)).filter((x): x is number => x !== null);
    snUna = sns.length ? percentil(sns, 50) : null;
    const medio = { x: recorrido.reduce((s, p) => s + p.x, 0) / recorrido.length, y: recorrido.reduce((s, p) => s + p.y, 0) / recorrido.length };
    snQuieto = snEn(quieto, n, medio, ruidoQuieto);
    snSiguiendo = snEn(siguiendo, n, comun, ruidoSiguiendo);
    for (let y = Math.round(comun.y) - 1; y <= Math.round(comun.y) + 1; y++)
      for (let x = Math.round(comun.x) - 1; x <= Math.round(comun.x) + 1; x++) {
        const v = x >= 0 && y >= 0 && x < n && y < n ? siguiendo[y * n + x] : NaN;
        if (Number.isFinite(v) && (pico === null || v > pico)) pico = v;
      }
  }
  return {
    n, nVisitas: limpias.length, una: ultima.a, quieto, siguiendo, ruidoUna, ruidoQuieto, ruidoSiguiendo, aleatorioUna, aleatorioApilado,
    snUna, snQuieto, snSiguiendo, recorrido, enUna, comun, pico, fechaComun: mismas[mismas.length - 1].meta.t, corrimientoMax,
  };
}

/** Escala de pintura común a los paneles: del fondo (−2σ) a un percentil alto del apilado quieto (máx. 25σ o el pico del objeto). */
export function escalaApilado(ap: Apilado): { vmin: number; vmax: number } {
  const vmin = -2 * ap.ruidoQuieto;
  // Tope en 25σ (o en el pico del objeto, si es más brillante): con el percentil solo, una estrella brillante
  // del campo deja al objeto débil casi negro; con 25σ solo, un objeto brillante (eps Ind B) se satura.
  let vmax = Math.min(percentil(Array.from(ap.quieto).filter(Number.isFinite), 99.9), Math.max(25 * ap.ruidoQuieto, ap.pico ?? 0));
  if (!(vmax > vmin)) vmax = vmin + 1;
  return { vmin, vmax };
}

/** Pinta la zona central `m×m` de un fotograma n×n (norte arriba, este a la izquierda). */
export function pintar(canvas: HTMLCanvasElement, arr: Float32Array, n: number, m: number, esc: { vmin: number; vmax: number }): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (canvas.width !== m) {
    canvas.width = m;
    canvas.height = m;
  }
  const o0 = Math.floor((n - m) / 2);
  const img = ctx.createImageData(m, m);
  for (let y = 0; y < m; y++)
    for (let x = 0; x < m; x++) {
      const v = arr[(o0 + y) * n + (o0 + x)];
      const o = ((m - 1 - y) * m + x) * 4; // fila 0 = sur: se voltea
      const g = Number.isFinite(v) ? 255 * asinh01(v, esc.vmin, esc.vmax) : 30;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = g;
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}
