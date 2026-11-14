/**
 * Repartidor de eventos de Aladin. Dueño: Juan Pablo (V2).
 *
 * Aladin Lite 3.8.2 guarda UNA sola función por evento (`aladin.on(e, fn)` reemplaza la anterior;
 * comprobado en dist/aladin.js: `callbacksByEventName[g]=Q`). Si Gaia y SIMBAD llamaran `on` cada una,
 * la última pisaría a la primera. Las capas se suscriben aquí y este módulo registra un solo
 * despachador por evento.
 */

export type EventoAladin =
  | "objectHovered"
  | "objectHoveredStop"
  | "objectClicked"
  | "click"
  | "mouseMove"
  | "positionChanged"
  | "zoomChanged";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Oyente = (...args: any[]) => void;

export type Suscribir = (evento: EventoAladin, fn: Oyente) => () => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function crearRepartidor(aladin: any): Suscribir {
  const oyentes = new Map<EventoAladin, Set<Oyente>>();
  return (evento, fn) => {
    let lista = oyentes.get(evento);
    if (!lista) {
      const nueva = new Set<Oyente>();
      lista = nueva;
      oyentes.set(evento, nueva);
      aladin.on(evento, (...args: unknown[]) => {
        for (const f of nueva) {
          try {
            f(...args);
          } catch (e) {
            console.error(`[sky] error en un oyente de «${evento}»:`, e);
          }
        }
      });
    }
    lista.add(fn);
    return () => {
      lista?.delete(fn);
    };
  };
}
