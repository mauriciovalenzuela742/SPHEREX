/**
 * Datos del explorador SPHEREx, compartidos por el Explorador (tiempo) y el Prisma (colores).
 * Es la carga del explorador de Bryan sin cambios: rejilla de visitas por `/proto-api/grid` y un
 * fotograma float32 por (banda, visita) por `/proto-api/frame`, de a PARALELO, t₀ y la última primero.
 * Los fotogramas viven en refs; `version` sube con cada uno que llega (sirve para repintar).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { decodificar, escalaDe, type Frame, type MetaFrame } from "./render";
import { leerJson, mensajeDeError } from "./errores";

export const API = "/proto-api";
const PARALELO = 3;

export type Visita = { mjd: number; start: string; n: number };
export type Grid = {
  bands: number[];
  visits: Record<string, Visita[]>;
  columns: { date: string; celdas: Record<string, number> }[];
  pixel_scale_arcsec: number;
  warnings?: string[];
};

export const clave = (b: number, v: number) => `${b}:${v}`;
const hoy = () => new Date().toISOString().slice(0, 10);

/** `activo = false` (p. ej. en el Modo Misión) no descarga nada. */
export function useDatosSpherex(ra: number, dec: number, size: number, activo = true) {
  // ── Qué cargar ──
  const [desde, setDesde] = useState("2025-04-01");
  const [hasta, setHasta] = useState(hoy());
  const [cargar, setCargar] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [porVisita, setPorVisita] = useState(1);
  const [intento, setIntento] = useState(0);

  // ── Selección (banda y visita visibles; compartida con el Prisma) ──
  const [banda, setBanda] = useState(0);
  const [visita, setVisita] = useState(0);

  // ── Datos (los fotogramas viven en refs; `version` fuerza el repintado) ──
  const [grid, setGrid] = useState<Grid | null>(null);
  const [mensaje, setMensaje] = useState("Elige un objeto o escribe A.R./Dec arriba.");
  const [version, setVersion] = useState(0);
  const [prog, setProg] = useState({ hechos: 0, total: 0, errores: 0 });
  const frames = useRef(new Map<string, Frame>());
  const escalas = useRef(new Map<number, { vmin: number; vmax: number }>());
  const errores = useRef(new Map<string, string>());
  const generacion = useRef(0);

  const filas = useMemo(() => (grid ? grid.bands.filter((b) => grid.visits[b]?.length) : []), [grid]);
  const visitas: Visita[] = grid && banda ? grid.visits[banda] ?? [] : [];
  const [tMin, tMax] = useMemo(() => {
    if (!grid) return [0, 1];
    const todas = filas.flatMap((b) => grid.visits[b].map((v) => v.mjd));
    const a = Math.min(...todas);
    const z = Math.max(...todas);
    const pad = Math.max(10, (z - a) * 0.03);
    return [a - pad, z + pad];
  }, [grid, filas]);

  // ── Búsqueda: rejilla de visitas y luego los fotogramas, de a PARALELO ──
  useEffect(() => {
    if (!activo) return;
    const gen = ++generacion.current;
    const ctl = new AbortController();
    frames.current = new Map();
    escalas.current = new Map();
    errores.current = new Map();
    setGrid(null);
    setProg({ hechos: 0, total: 0, errores: 0 });
    if (!cargar.length) {
      setMensaje("Elige al menos una banda para cargar.");
      return;
    }
    setMensaje("Consultando en IRSA qué visitas hay…");
    const bandas = [...cargar].sort().join(",");
    const base = { ra: String(ra), dec: String(dec), start: desde, end: hasta };

    const t = window.setTimeout(async () => {
      let g: Grid;
      try {
        const r = await fetch(`${API}/grid?${new URLSearchParams({ ...base, bands: bandas })}`, { signal: ctl.signal });
        g = await leerJson(r); // con error, lanza un mensaje legible (no «[object Object]»)
      } catch (e) {
        if (gen === generacion.current && (e as Error).name !== "AbortError") setMensaje(mensajeDeError(e));
        return;
      }
      if (gen !== generacion.current) return;
      const fs = g.bands.filter((b) => g.visits[b]?.length);
      if (!fs.length) {
        setMensaje("IRSA no devolvió visitas con estos filtros. Prueba otro rango de fechas u otras bandas.");
        return;
      }
      const b0 = fs.includes(5) && porVisita > 1 ? 5 : fs[0];
      setGrid(g);
      setBanda(b0);
      setVisita(0);

      // t₀ y la última de cada banda primero; después el resto.
      const tareas: [number, number][] = [];
      const vistas = new Set<string>();
      const add = (b: number, v: number) => {
        if (!vistas.has(clave(b, v))) {
          vistas.add(clave(b, v));
          tareas.push([b, v]);
        }
      };
      const orden = [b0, ...fs.filter((x) => x !== b0)];
      for (const b of orden) {
        add(b, 0);
        add(b, g.visits[b].length - 1);
      }
      for (const b of orden) for (let v = 1; v < g.visits[b].length - 1; v++) add(b, v);
      let hechos = 0;
      let nErr = 0;
      setProg({ hechos, total: tareas.length, errores: 0 });

      let i = 0;
      const trabajador = async () => {
        while (i < tareas.length && gen === generacion.current) {
          const [b, v] = tareas[i++];
          const q = new URLSearchParams({
            ...base, band: String(b), visit: String(v), size: String(size), per_visit: String(porVisita),
          });
          try {
            const r = await fetch(`${API}/frame?${q}`, { signal: ctl.signal });
            const j = await leerJson(r);
            if (gen !== generacion.current) return;
            frames.current.set(clave(b, v), { meta: j as MetaFrame, arr: decodificar((j as MetaFrame).data) });
            const deBanda = [...frames.current.entries()].filter(([k]) => k.startsWith(`${b}:`)).map(([, f]) => f);
            escalas.current.set(b, escalaDe(deBanda));
          } catch (e) {
            if (gen !== generacion.current || (e as Error).name === "AbortError") return;
            nErr++;
            errores.current.set(clave(b, v), mensajeDeError(e));
          }
          hechos++;
          setProg({ hechos, total: tareas.length, errores: nErr });
          setVersion((x) => x + 1);
        }
      };
      await Promise.all(Array.from({ length: PARALELO }, trabajador));
    }, 400); // espera corta: si el usuario sigue escribiendo coordenadas, no se pide de más

    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
  }, [ra, dec, size, desde, hasta, cargar, porVisita, intento, activo]);

  // ── Navegación ──
  const irA = useCallback(
    (b: number, v: number) => {
      if (!grid?.visits[b]) return;
      setBanda(b);
      setVisita(Math.max(0, Math.min(grid.visits[b].length - 1, v)));
    },
    [grid],
  );
  const visitaMasCercana = useCallback(
    (b: number, mjd: number) => {
      let mejor = 0;
      let dmin = Infinity;
      (grid?.visits[b] ?? []).forEach((v, i) => {
        const d = Math.abs(v.mjd - mjd);
        if (d < dmin) {
          dmin = d;
          mejor = i;
        }
      });
      return mejor;
    },
    [grid],
  );
  const mjdActual = visitas[visita]?.mjd ?? 0;

  // ── Reintentar fotos sueltas que fallaron (V1, Antonia) ──
  // «Reintentar» de arriba repite toda la búsqueda; esto vuelve a pedir solo las que dieron error, sin
  // perder las que ya llegaron. Un 500/503/504 a ratos se arregla solo, o la foto ya quedó en la caché.
  const [reintentando, setReintentando] = useState(false);
  const pedirUna = useCallback(
    async (b: number, v: number, gen: number) => {
      errores.current.delete(clave(b, v));
      setProg((p) => ({ ...p, errores: errores.current.size }));
      setVersion((x) => x + 1); // sin foto y sin error, la vista muestra «Cargando…»
      const q = new URLSearchParams({
        ra: String(ra), dec: String(dec), start: desde, end: hasta,
        band: String(b), visit: String(v), size: String(size), per_visit: String(porVisita),
      });
      try {
        const j = await leerJson(await fetch(`${API}/frame?${q}`));
        if (gen !== generacion.current) return;
        frames.current.set(clave(b, v), { meta: j as MetaFrame, arr: decodificar((j as MetaFrame).data) });
        const deBanda = [...frames.current.entries()].filter(([k]) => k.startsWith(`${b}:`)).map(([, f]) => f);
        escalas.current.set(b, escalaDe(deBanda));
      } catch (e) {
        if (gen !== generacion.current) return;
        errores.current.set(clave(b, v), mensajeDeError(e));
      }
      setProg((p) => ({ ...p, errores: errores.current.size }));
      setVersion((x) => x + 1);
    },
    [ra, dec, size, desde, hasta, porVisita],
  );
  const reintentarImagen = useCallback((b: number, v: number) => pedirUna(b, v, generacion.current), [pedirUna]);
  const reintentarFallidas = useCallback(async () => {
    const gen = generacion.current;
    const pendientes = [...errores.current.keys()].map((k) => k.split(":").map(Number) as [number, number]);
    setReintentando(true);
    // De a PARALELO, como la carga normal: IRSA devuelve 503 si se le piden muchas a la vez.
    let i = 0;
    const trabajador = async () => {
      while (i < pendientes.length && gen === generacion.current) {
        const [b, v] = pendientes[i++];
        await pedirUna(b, v, gen);
      }
    };
    await Promise.all(Array.from({ length: PARALELO }, trabajador));
    setReintentando(false);
  }, [pedirUna]);

  return {
    desde, setDesde, hasta, setHasta, cargar, setCargar, porVisita, setPorVisita, intento, setIntento, banda, setBanda, visita, setVisita, grid, mensaje, version, prog, frames, escalas, errores, filas, visitas, tMin, tMax, irA, visitaMasCercana, mjdActual,
    reintentarImagen, reintentarFallidas, reintentando,
  };
}

export type DatosSpherex = ReturnType<typeof useDatosSpherex>;
