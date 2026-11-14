/**
 * Capa Gaia DR3 (VizieR I/355/gaiadr3), propagada de 2016,0 a `ctx.epoca`. Dueño: Juan Pablo (V2).
 * Trabajo de S3.
 */
import type { Capa } from "./index";

export const capaGaia: Capa = {
  id: "gaia",
  montar: () => {
    // TODO (S3): cono en VizieR alrededor de (ctx.ra, ctx.dec), propagar con propagar(..., EPOCA_GAIA_DR3, ctx.epoca),
    // catálogo con nombre para que se pueda apagar. Límite de estrellas y de radio.
    return () => {};
  },
};
