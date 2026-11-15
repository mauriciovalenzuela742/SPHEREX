/**
 * `prefers-reduced-motion`: si el sistema pide reducir el movimiento. Dueño: Juan Pablo (V2).
 * Se lee con `matchMedia` (MDN) y se sigue al vuelo: si la persona cambia el ajuste, la interfaz se entera.
 */
import { useEffect, useState } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function consultar(): MediaQueryList | null {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(CONSULTA) : null;
}

export function useMovimientoReducido(): boolean {
  const [reducir, setReducir] = useState(() => consultar()?.matches ?? false);
  useEffect(() => {
    const mq = consultar();
    if (!mq) return;
    const alCambiar = () => setReducir(mq.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);
  return reducir;
}
