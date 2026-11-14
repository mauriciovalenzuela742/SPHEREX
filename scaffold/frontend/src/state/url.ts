/**
 * Estado del visor ↔ URL (?ra=&dec=&size=&band=&mision=). Dueña: Antonia (V1).
 * `mision` = paso del Modo Misión (intro | 1..5 | fin): cada nivel es un enlace compartible.
 * `tutorial` = el recorrido guiado por Spherix está abierto (?tutorial=1): se puede compartir y repetir.
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
  tutorial?: boolean;
};

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
    size: num("size", DEFECTO.size),
    band: q.get("band") ?? DEFECTO.band,
    vista: q.has("ra") || q.has("mision") || q.has("tutorial") || q.get("vista") === "visor" ? "visor" : "landing",
    mision: q.get("mision") ?? undefined,
    tutorial: q.get("tutorial") === "1" || undefined,
  };
}

export function useEstadoUrl() {
  const [estado, setEstado] = useState<Estado>(leer);
  const set = useCallback((p: Partial<Estado>) => {
    setEstado((prev) => {
      const nuevo = { ...prev, ...p };
      const q = new URLSearchParams();
      if (nuevo.vista === "visor") {
        q.set("ra", String(nuevo.ra));
        q.set("dec", String(nuevo.dec));
        q.set("size", String(nuevo.size));
        q.set("band", nuevo.band);
        if (nuevo.mision) q.set("mision", nuevo.mision);
        if (nuevo.tutorial) q.set("tutorial", "1");
      }
      const qs = q.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      return nuevo;
    });
  }, []);
  return { estado, set };
}
