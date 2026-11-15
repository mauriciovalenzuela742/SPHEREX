/**
 * Números en el formato del idioma activo (Prisma): coma decimal en ES («0,4»), punto en EN («0.4»).
 * Antes los ejes usaban `es-CL` fijo y en inglés salían «0,4» y «1.000».
 */
import { useIdioma } from "../state/idioma";

export type Fmt = (n: number, decimales?: number) => string;

export function crearFmt(idioma: string): Fmt {
  const loc = idioma === "en" ? "en-US" : "es-CL";
  const cache = new Map<number, Intl.NumberFormat>();
  return (n, decimales) => {
    const d = decimales ?? (Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 1 ? 1 : 2);
    let f = cache.get(d);
    if (!f) {
      f = new Intl.NumberFormat(loc, { minimumFractionDigits: 0, maximumFractionDigits: d });
      cache.set(d, f);
    }
    return f.format(n);
  };
}

export function useFmt(): Fmt {
  const { idioma } = useIdioma();
  return crearFmt(idioma);
}
