/**
 * Estado de carga de los catálogos de referencia (Gaia, CatWISE, SIMBAD), para mostrárselo al usuario.
 * Dueño: Juan Pablo (V2).
 *
 * Por qué existe: desde el 9-nov-2026 el CDS de Estrasburgo (VizieR y SIMBAD) responde a ratos. Antes las
 * capas fallaban en silencio (solo en la consola) y el usuario veía el mapa sin marcas sin saber por qué.
 * Cada capa publica aquí su estado (cargando / listo con N objetos / error) y, si falló, una función para
 * reintentar. `PanelCatalogos` lo dibuja junto al botón «Mostrar catálogos».
 */
import { useSyncExternalStore } from "react";

export type FaseCatalogo = "cargando" | "listo" | "error";

export type EstadoCatalogo = {
  /** Identificador estable (gaia, catwise, simbad); define el orden en el panel. */
  id: string;
  /** Nombre que ve el usuario. */
  nombre: string;
  fase: FaseCatalogo;
  /** Frase corta para el usuario: «300 estrellas», «no respondió el servidor (CDS), intenta de nuevo». */
  texto: string;
  /** Segunda línea opcional (p. ej. el resultado del cotejo con SIMBAD). */
  nota?: string;
  /** Si está, el panel muestra el botón «Reintentar». */
  reintentar?: () => void;
};

const ORDEN = ["gaia", "catwise", "simbad"];
let estados: EstadoCatalogo[] = [];
const oyentes = new Set<() => void>();

function avisar() {
  for (const f of oyentes) f();
}

/** Publica (o reemplaza) el estado de un catálogo. */
export function ponerEstado(e: EstadoCatalogo): void {
  estados = [...estados.filter((x) => x.id !== e.id), e].sort(
    (a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id),
  );
  avisar();
}

function suscribir(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

export function useEstadosCatalogos(): EstadoCatalogo[] {
  return useSyncExternalStore(suscribir, () => estados);
}

/** Mensaje para el usuario cuando ningún espejo respondió. El detalle técnico va a la consola. */
export const TEXTO_SIN_RESPUESTA = "no respondió el servidor (CDS), intenta de nuevo";
