/**
 * Capa «objetivo»: marca del objeto en su posición propagada a `ctx.epoca` y el cuadro de `ctx.size`
 * grados. Dueño: Juan Pablo (V2). Trabajo de S2.
 */
import type { Capa } from "./index";

export const capaObjetivo: Capa = {
  id: "objetivo",
  montar: () => {
    // TODO (S2): marca + cuadro del recorte, usando propagar() de ../propagacion.
    return () => {};
  },
};
