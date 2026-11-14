/**
 * Capa SIMBAD: nombre al pasar sobre una estrella y clic → `ctx.onSelect(ra, dec)`. Dueño: Juan Pablo (V2).
 * Trabajo de S4.
 */
import type { Capa } from "./index";

export const capaSimbad: Capa = {
  id: "simbad",
  montar: () => {
    // TODO (S4): objetos de SIMBAD con su nombre al hacer hover (ctx.on("objectHovered", …)) y
    // ctx.on("click", …) → ctx.onSelect(ra, dec).
    return () => {};
  },
};
