/**
 * Busca la sección `data-tour="<ancla>"`, la trae a la vista y sigue su rectángulo en pantalla
 * (scroll, cambio de tamaño, contenido que se carga). Si la sección todavía no existe (el explorador
 * y el Prisma aparecen cuando llegan los datos), la espera hasta `esperaMs`.
 */
import { useEffect, useState } from "react";

export type Rect = { top: number; left: number; width: number; height: number };
export type Objetivo =
  | { estado: "sin-ancla" }
  | { estado: "buscando" }
  | { estado: "no-encontrada" }
  | { estado: "visible"; rect: Rect };

const MARGEN = 8; // aire alrededor de la sección iluminada

function medir(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top - MARGEN, left: r.left - MARGEN, width: r.width + 2 * MARGEN, height: r.height + 2 * MARGEN };
}

/** Primer elemento visible (con tamaño) con esa ancla. */
function buscar(ancla: string): Element | null {
  for (const el of document.querySelectorAll(`[data-tour="${ancla}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export function usarObjetivo(ancla: string | undefined, esperaMs = 10000): Objetivo {
  const [obj, setObj] = useState<Objetivo>(ancla ? { estado: "buscando" } : { estado: "sin-ancla" });

  useEffect(() => {
    if (!ancla) {
      setObj({ estado: "sin-ancla" });
      return;
    }
    setObj({ estado: "buscando" });
    let el: Element | null = null;
    let rafId = 0;
    let observador: ResizeObserver | null = null;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const actualizar = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (el && el.isConnected) setObj({ estado: "visible", rect: medir(el) });
      });
    };

    const enganchar = (encontrado: Element) => {
      el = encontrado;
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: quieto ? "auto" : "smooth" });
      actualizar();
      observador = new ResizeObserver(actualizar);
      observador.observe(el);
      observador.observe(document.body);
      window.addEventListener("scroll", actualizar, true);
      window.addEventListener("resize", actualizar);
    };

    const inicio = Date.now();
    let intervalo = 0;
    const e0 = buscar(ancla);
    if (e0) {
      enganchar(e0);
    } else {
      intervalo = window.setInterval(() => {
        const e = buscar(ancla);
        if (e) {
          window.clearInterval(intervalo);
          enganchar(e);
        } else if (Date.now() - inicio > esperaMs) {
          window.clearInterval(intervalo);
          setObj({ estado: "no-encontrada" });
        }
      }, 150);
    }

    return () => {
      window.clearInterval(intervalo);
      cancelAnimationFrame(rafId);
      observador?.disconnect();
      window.removeEventListener("scroll", actualizar, true);
      window.removeEventListener("resize", actualizar);
    };
  }, [ancla, esperaMs]);

  return obj;
}
