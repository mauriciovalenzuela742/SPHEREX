/**
 * Estado del visor ↔ URL (?ra=&dec=&size=&band=&mision=). Dueña: Antonia (V1).
 * `mision` = paso del Modo Misión (intro | 1..5 | fin): cada nivel es un enlace compartible.
 * Contrato de la URL: docs/03_ARQUITECTURA.md §4. Pendiente: target, fps, stretch, mode.
 */
import { useCallback, useState } from "react";
import { CAMPOS, posicionActual } from "../content/campos";

export type Estado = {
  ra: number;
  dec: number;
  size: number;
  band: string;
  vista: "landing" | "visor";
  mision?: string;
};

/** Tamaños del recorte que ofrece el selector «Dimensión». El servidor de fotogramas acepta hasta 0,5° (docs/03). */
export const TAMANOS = [0.05, 0.1, 0.2, 0.5];
export const TAMANO_MAX = TAMANOS[TAMANOS.length - 1];
// Un enlace viejo (?size=1) o Spherix pueden pedir más: se recorta al máximo en vez de dejar que el servidor falle.
const tamanoValido = (s: number) => (s > 0 ? Math.min(s, TAMANO_MAX) : 0.1);

// Por defecto, Epsilon Indi B en su posición de hoy: el movimiento que el EDA midió con datos reales.
const EPS_IND_B = posicionActual(CAMPOS.find((c) => c.id === "eps_ind_b")!);
const DEFECTO: Estado = { ...EPS_IND_B, size: 0.1, band: "4", vista: "landing" };

function leer(): Estado {
  const q = new URLSearchParams(window.location.search);
  const num = (k: string, d: number) => {
    const v = Number(q.get(k));
    return q.has(k) && Number.isFinite(v) ? v : d;
  };
  return {
    ra: num("ra", DEFECTO.ra),
    dec: num("dec", DEFECTO.dec),
    size: tamanoValido(num("size", DEFECTO.size)),
    band: q.get("band") ?? DEFECTO.band,
    vista: q.has("ra") || q.has("mision") || q.get("vista") === "visor" ? "visor" : "landing",
    mision: q.get("mision") ?? undefined,
  };
}

export function useEstadoUrl() {
  const [estado, setEstado] = useState<Estado>(leer);
  const set = useCallback((p: Partial<Estado>) => {
    setEstado((prev) => {
      const nuevo = { ...prev, ...p };
      nuevo.size = tamanoValido(nuevo.size);
      const q = new URLSearchParams();
      if (nuevo.vista === "visor") {
        q.set("ra", String(nuevo.ra));
        q.set("dec", String(nuevo.dec));
        q.set("size", String(nuevo.size));
        q.set("band", nuevo.band);
        if (nuevo.mision) q.set("mision", nuevo.mision);
      }
      const qs = q.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      return nuevo;
    });
  }, []);
  return { estado, set };
}
