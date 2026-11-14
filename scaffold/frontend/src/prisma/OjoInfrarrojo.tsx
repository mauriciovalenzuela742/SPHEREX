/**
 * Ojo infrarrojo (Prisma): el campo en «color traducido». D1+D2 → azul, D3+D4 → verde, D5+D6 → rojo,
 * cada banda con su escala común (render.ts) y la visita más cercana a la fecha del explorador.
 * El círculo muestra dónde mide la Huella espectral (transparencia: qué luz estamos sumando).
 */
import { useEffect, useRef } from "react";
import { asinh01, type Frame } from "../explorador/render";
import { clave, type DatosSpherex } from "../explorador/useDatosSpherex";
import { prisma } from "../content/prisma";
import { medirObjeto } from "./fotometria";

const CANALES: [number, number][] = [
  [5, 6], // rojo
  [3, 4], // verde
  [1, 2], // azul
];

export default function OjoInfrarrojo({ datos }: { datos: DatosSpherex }) {
  const { grid, frames, escalas, version, banda, visita, visitaMasCercana, mjdActual } = datos;
  const lienzo = useRef<HTMLCanvasElement>(null);

  // Fotograma de cada banda en la fecha actual.
  const porBanda = new Map<number, Frame>();
  if (grid)
    for (const b of [1, 2, 3, 4, 5, 6]) {
      if (!grid.visits[b]?.length) continue;
      const fr = frames.current.get(clave(b, visitaMasCercana(b, mjdActual)));
      if (fr) porBanda.set(b, fr);
    }
  const n = [...porBanda.values()][0]?.meta.n_px ?? 0;
  const medido = grid ? frames.current.get(clave(banda, visita)) : undefined;
  const medida = medido ? medirObjeto(medido) : undefined;

  useEffect(() => {
    const c = lienzo.current;
    if (!c || !n) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = n;
    c.height = n;
    const img = ctx.createImageData(n, n);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        const o = ((n - 1 - y) * n + x) * 4; // fila 0 = sur
        CANALES.forEach((grupo, k) => {
          let s = 0;
          let cuenta = 0;
          for (const b of grupo) {
            const fr = porBanda.get(b);
            const esc = escalas.current.get(b);
            if (!fr || !esc || fr.meta.n_px !== n) continue;
            const v = fr.arr[i];
            if (Number.isFinite(v)) {
              s += asinh01(v, esc.vmin, esc.vmax);
              cuenta++;
            }
          }
          img.data[o + k] = cuenta ? 255 * (s / cuenta) : 0;
        });
        img.data[o + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  }); // se repinta en cada render: lo disparan `version` (llega un fotograma) y la fecha/banda elegidas

  const pct = (v: number) => `${((v + 0.5) / n) * 100}%`;
  return (
    <figure className="ojo">
      <div className="ojo-lienzo">
        {n ? <canvas ref={lienzo} aria-label="Campo en color infrarrojo traducido" /> : <p className="ojo-vacio">{prisma.ojo.sinDatos}</p>}
        {n > 0 && medida && medido?.meta.n_px === n && (
          <span
            className="ojo-apertura"
            style={{ left: pct(medida.x), top: pct(n - 1 - medida.y), width: `${(5 / n) * 100}%` }}
            aria-hidden="true"
          />
        )}
        <span className="ojo-orient" aria-hidden="true">N↑ E←</span>
        <span className="ojo-v" aria-hidden="true" data-version={version} />
      </div>
      <figcaption>
        <span className="ojo-rgb"><b style={{ color: "#ff6b6b" }}>D5–D6</b> · <b style={{ color: "#51cf66" }}>D3–D4</b> · <b style={{ color: "#4dabf7" }}>D1–D2</b></span>
        {prisma.ojo.medida}
      </figcaption>
    </figure>
  );
}
