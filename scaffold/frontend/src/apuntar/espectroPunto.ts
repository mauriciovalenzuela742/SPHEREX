/**
 * «Modo descubrimiento»: el espectro SPHEREx de un punto o de un candidato de CatWISE, pedido a `/api/spectrum`
 * (backend de Bryan: fotometría de apertura en las exposiciones de nivel 2). Dueño: Juan Pablo (V2).
 *
 * Quién lo pide: el botón «Ver el espectro de este punto» de «¿Qué hay aquí?» y el botón «Ver su espectro» del
 * recuadro de CatWISE (que es DOM puro, fuera de React). Por eso el pedido vive en una tienda mínima, como
 * `sky/capas/estado.ts`, y `PanelEspectro` (PanelEspectro.tsx) la dibuja.
 *
 * Parámetros (medidos el 14-nov-2026 contra producción): con los de fábrica (120 puntos, 8 s) a Barnard le llegó
 * 1 punto; con max_points=48 y budget_s=12 llegan 30–48 puntos en las 6 bandas en 8–19 s en total (la búsqueda
 * en IRSA no cuenta en el presupuesto y suma 1–8 s). Lo que no alcanzó vuelve en `pending`: «Seguir cargando»
 * lo pide con `epochs=` y el mismo max_points (el backend arma la misma lista y se queda con esas).
 */
import { useSyncExternalStore } from "react";
import type { PuntoClasif } from "../prisma/clasificar";

export const MAX_PUNTOS = 48;
export const PRESUPUESTO_S = 12;
/** Espera máxima del navegador: el backend en Vercel tiene 60 s. */
const ESPERA_MS = 50000;

export type Pedido = {
  id: number;
  ra: number;
  dec: number;
  /** Nombre que ve el usuario (catálogo o SIMBAD), si lo hay. */
  nombre?: string;
  /** Movimiento propio en mas/año (pmra con cos δ) y época de ra/dec: el backend sigue al objeto en cada foto. */
  pmra?: number;
  pmdec?: number;
  epoca?: number;
  origen: "catwise" | "clic";
};

export type PuntoEspectro = {
  wavelength_um: number;
  bandwidth_um: number;
  flux_mjy: number;
  err_mjy: number;
  band: number;
  t: string;
  epoch_id: string;
};

export type RespuestaEspectro = {
  n_points: number;
  n_candidates: number;
  spectrum: PuntoEspectro[];
  pending: string[];
  caveat: string;
  elapsed_s: number;
  warnings: string[];
};

let pedido: Pedido | null = null;
let siguiente = 1;
let idioma: "es" | "en" = "es";
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

export function pedirEspectro(p: Omit<Pedido, "id">): void {
  pedido = { ...p, id: siguiente++ };
  avisar();
}

/** SIMBAD suele responder después del clic: si el pedido es de ese mismo punto y no tenía nombre, se lo pone
 *  (mismo id: no se vuelve a pedir el espectro). */
export function nombrarPedido(ra: number, dec: number, nombre: string): void {
  if (!pedido || pedido.nombre || pedido.origen !== "clic" || pedido.ra !== ra || pedido.dec !== dec) return;
  pedido = { ...pedido, nombre };
  avisar();
}

export function cerrarEspectro(): void {
  pedido = null;
  avisar();
}

export function useEspectroPedido(): Pedido | null {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => pedido,
  );
}

/** El recuadro de CatWISE no es React: el panel le deja aquí el idioma vigente para rotular su botón. */
export function fijarIdioma(i: "es" | "en"): void {
  idioma = i;
}
export function textoBotonCatwise(): string {
  return idioma === "en" ? "See its spectrum" : "Ver su espectro";
}

/** Pide el espectro (o la parte `epochs` que quedó pendiente). Lanza un Error con un mensaje legible. */
export async function traerEspectro(p: Pedido, senal: AbortSignal, epochs?: string[]): Promise<RespuestaEspectro> {
  const q = new URLSearchParams({
    ra: p.ra.toFixed(6),
    dec: p.dec.toFixed(6),
    max_points: String(MAX_PUNTOS),
    budget_s: String(PRESUPUESTO_S),
  });
  if (p.pmra !== undefined && p.pmdec !== undefined && p.epoca !== undefined) {
    q.set("pmra", p.pmra.toFixed(3));
    q.set("pmdec", p.pmdec.toFixed(3));
    q.set("epoch", p.epoca.toFixed(3));
  }
  if (epochs?.length) q.set("epochs", epochs.join(","));
  const ctl = new AbortController();
  const cortar = () => ctl.abort();
  senal.addEventListener("abort", cortar);
  const reloj = setTimeout(cortar, ESPERA_MS);
  try {
    const r = await fetch(`/api/spectrum?${q}`, { signal: ctl.signal });
    if (!r.ok) {
      let detalle = "";
      try {
        const j = await r.json();
        detalle = typeof j?.detail === "string" ? j.detail : "";
      } catch {
        /* cuerpo no JSON (p. ej. «Internal Server Error») */
      }
      throw new Error(r.status === 503 ? `IRSA no responde ahora (503)${detalle ? `: ${detalle}` : ""}` : `el servidor respondió ${r.status}${detalle ? `: ${detalle}` : ""}`);
    }
    return (await r.json()) as RespuestaEspectro;
  } catch (e) {
    if (senal.aborted) throw e;
    if (ctl.signal.aborted) throw new Error(`no hubo respuesta en ${ESPERA_MS / 1000} s`);
    throw e;
  } finally {
    clearTimeout(reloj);
    senal.removeEventListener("abort", cortar);
  }
}

/** Puntos del backend → entrada de clasificar(): S/N ≥ 3 es medida; si no, límite superior. */
export function aClasif(ps: PuntoEspectro[]): PuntoClasif[] {
  return ps.map((p) => ({
    lam: p.wavelength_um,
    mJy: p.flux_mjy,
    err: p.err_mjy,
    estado: p.err_mjy > 0 && p.flux_mjy / p.err_mjy >= 3 ? "medida" : "limite",
  }));
}

/** Cuántas exposiciones omitió el backend por saturación (vienen solo como aviso de texto). */
export function saturadas(avisos: string[]): number {
  return avisos.filter((a) => /saturaci/i.test(a)).reduce((s, a) => s + (parseInt(a, 10) || 0), 0);
}
