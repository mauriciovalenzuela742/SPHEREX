/**
 * Registro de capas del cielo. Dueño: Juan Pablo (V2).
 *
 * AladinView monta cada capa de `CAPAS` sin conocer su detalle. Cada capa vive en su propio archivo
 * de esta carpeta y solo se toca ese archivo. Contrato:
 *
 *   montar(aladin, ctx) → desmontar
 *
 * AladinView desmonta y vuelve a montar todas las capas cuando cambian ra, dec, size o epoca.
 * Para escuchar eventos de Aladin (hover, clic) usa SIEMPRE `ctx.on`, nunca `aladin.on` directo:
 * Aladin guarda un solo oyente por evento (ver ../eventos.ts).
 * Para que una capa se pueda apagar, usa un catálogo u overlay con nombre: aparece en el control de capas.
 */
import type { Suscribir } from "../eventos";
import { capaCatwise } from "./catwise";
import { capaGaia } from "./gaia";
import { capaObjetivo } from "./objetivo";
import { capaSimbad } from "./simbad";
import { capaTrayectoria } from "./trayectoria";

export type ContextoCapa = {
  /** Centro de la vista (grados, ICRS), tal como llega del estado de la URL. */
  ra: number;
  dec: number;
  /** Lado del recorte, en grados. */
  size: number;
  /** Época de la vista, en años julianos decimales (p. ej. 2026.0). */
  epoca: number;
  /** Suscripción a eventos de Aladin. Devuelve la función para desuscribirse. */
  on: Suscribir;
  /** Avisar que el usuario eligió una posición del cielo (clic). */
  onSelect: (ra: number, dec: number) => void;
  /**
   * Registrar un catálogo de referencia (Gaia, CatWISE, SIMBAD) para que obedezca el botón «Mostrar catálogos».
   * Parten ocultos: AladinView los oculta o muestra sin volver a consultarlos. Devuelve la función que lo
   * da de baja (llamarla al desmontar). La marca del objetivo y el cuadro del recorte no se registran.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registrarCatalogo: (catalogo: any) => () => void;
};

export type Capa = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  montar: (aladin: any, ctx: ContextoCapa) => (() => void) | void;
};

/** Orden de montaje: lo de abajo se dibuja encima. */
export const CAPAS: Capa[] = [capaGaia, capaCatwise, capaSimbad, capaObjetivo, capaTrayectoria];
