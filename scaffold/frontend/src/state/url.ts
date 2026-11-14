/**
 * Estado del visor ↔ URL (?ra=&dec=&size=&band=). Dueña: Antonia (V1).
 * Contrato de la URL: docs/03_ARQUITECTURA.md §4. Pendiente: target, fps, stretch, mode.
 */
import { useCallback, useState } from "react";

export type Estado = { ra: number; dec: number; size: number; band: string; vista: "landing" | "visor" };

const DEFECTO: Estado = { ra: 133.81890825, dec: -7.247048, size: 0.1, band: "4", vista: "landing" };

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
    vista: q.has("ra") || q.get("vista") === "visor" ? "visor" : "landing",
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
      }
      const qs = q.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      return nuevo;
    });
  }, []);
  return { estado, set };
}
