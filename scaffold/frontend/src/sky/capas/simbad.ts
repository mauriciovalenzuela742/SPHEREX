/**
 * Capa SIMBAD: objetos conocidos alrededor del centro, su nombre al pasar el ratón y el clic que elige
 * una posición del cielo. Dueño: Juan Pablo (V2). Trabajo de S4.
 *
 * Qué hace
 * - Pide a SIMBAD (TAP, tabla `basic`, JSON, con CORS) los objetos a menos de max(ctx.size, 0,1°) de
 *   (ctx.ra, ctx.dec), los más citados primero, con tope de MAX_OBJETOS. Primero el TAP del CDS y, si
 *   falla, su espejo de Harvard (el 14-nov-2026 el del CDS devolvía 404 «Page unavailable»).
 *   Se dibujan como un catálogo llamado «SIMBAD», que se puede apagar en el control de capas.
 * - Hover sobre un objeto: rótulo con main_id, tipo (otype) y coordenadas.
 * - Clic en el cielo o en un objeto (sin arrastrar): `ctx.onSelect(ra, dec)` en grados ICRS y
 *   `console.info("[sky] clic", ra, dec)`. Si el clic cae sobre un objeto de SIMBAD se usa la
 *   posición del objeto; si no, la del punto del cielo bajo el cursor.
 *
 * Ojo: SIMBAD da posiciones J2000 (época 2000,0). Las estrellas de movimiento propio alto aparecen
 * corridas respecto del cubo de SPHEREx (Barnard: ~270″). Esta capa no las propaga.
 *
 * Cómo lo usa Visor (no está conectado aquí): `ctx.onSelect` llama a la prop `onSelect` de AladinView.
 * Para recibir el clic, Visor.tsx tiene que pasar
 *   <AladinView … onSelect={(ra, dec) => …} />
 * con ra y dec en grados ICRS (p. ej. para actualizar la URL o pedir el espectro en ese punto).
 */
import A from "aladin-lite";
import type { Capa } from "./index";

/** Tope de objetos pedidos a SIMBAD. */
const MAX_OBJETOS = 200;
/** Radio mínimo del cono, en grados. */
const RADIO_MIN = 0.1;
/** Tiempo máximo por servicio antes de probar el siguiente, en ms. El espejo de Harvard tardó
 *  entre 2 y 18 s por consulta el 14-nov-2026. */
const ESPERA_MS = 40000;

/** Servicios TAP de SIMBAD, en orden de preferencia. Los dos responden con CORS abierto. */
const SERVICIOS_TAP = [
  "https://simbad.cds.unistra.fr/simbad/sim-tap/sync",
  "https://simbad.cfa.harvard.edu/simbad/sim-tap/sync",
];

type ObjetoSimbad = { main_id: string; otype: string; ra: number; dec: number };

function consulta(ra: number, dec: number, radio: number): string {
  return (
    `SELECT TOP ${MAX_OBJETOS} main_id, otype, ra, dec FROM basic ` +
    `WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${ra}, ${dec}, ${radio})) = 1 ` +
    `AND ra IS NOT NULL AND dec IS NOT NULL ORDER BY nbref DESC`
  );
}

async function pedirSimbad(ra: number, dec: number, radio: number, senal: AbortSignal): Promise<ObjetoSimbad[]> {
  const params = new URLSearchParams({
    request: "doQuery",
    lang: "adql",
    format: "json",
    query: consulta(ra, dec, radio),
  });
  const errores: string[] = [];
  for (const base of SERVICIOS_TAP) {
    if (senal.aborted) throw new DOMException("cancelado", "AbortError");
    const ctl = new AbortController();
    const cortar = () => ctl.abort();
    senal.addEventListener("abort", cortar);
    const reloj = setTimeout(cortar, ESPERA_MS);
    try {
      const r = await fetch(`${base}?${params}`, { signal: ctl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { metadata: { name: string }[]; data: unknown[][] };
      const col = (n: string) => j.metadata.findIndex((m) => m.name === n);
      const [iId, iTipo, iRa, iDec] = ["main_id", "otype", "ra", "dec"].map(col);
      if ([iId, iTipo, iRa, iDec].some((i) => i < 0)) throw new Error("respuesta sin las columnas esperadas");
      return j.data.map((f) => ({
        main_id: String(f[iId]).trim(),
        otype: String(f[iTipo] ?? "").trim(),
        ra: Number(f[iRa]),
        dec: Number(f[iDec]),
      }));
    } catch (e) {
      if (senal.aborted) throw e;
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      clearTimeout(reloj);
      senal.removeEventListener("abort", cortar);
    }
  }
  throw new Error(`ningún servicio de SIMBAD respondió (${errores.join("; ")})`);
}

/** Rótulo flotante sobre el mapa (estilos en línea: esta capa no toca las hojas de estilo). */
function crearRotulo(contenedor: HTMLElement): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("role", "tooltip");
  Object.assign(el.style, {
    position: "absolute",
    zIndex: "40",
    pointerEvents: "none",
    display: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    background: "rgba(10, 14, 24, 0.88)",
    color: "#f3f5f9",
    font: "12px/1.35 system-ui, sans-serif",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
  } satisfies Partial<CSSStyleDeclaration>);
  contenedor.appendChild(el);
  return el;
}

const fmt = (x: number) => x.toFixed(5);

export const capaSimbad: Capa = {
  id: "simbad",
  montar: (aladin, ctx) => {
    const fin = new AbortController();
    const radio = Math.max(ctx.size, RADIO_MIN);

    const catalogo = A.catalog({ name: "SIMBAD", sourceSize: 12, color: "#ffb000", hoverColor: "#ff4040" });
    aladin.addCatalog(catalogo);

    pedirSimbad(ctx.ra, ctx.dec, radio, fin.signal)
      .then((objetos) => {
        if (fin.signal.aborted) return;
        catalogo.addSources(objetos.map((o, rango) => A.source(o.ra, o.dec, { ...o, rango })));
        console.info(`[sky] SIMBAD: ${objetos.length} objetos a ${radio}° de (${ctx.ra}, ${ctx.dec})`);
      })
      .catch((e: unknown) => {
        if (fin.signal.aborted) return;
        console.error("[sky] SIMBAD falló; el mapa sigue sin esa capa:", e);
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const esDeSimbad = (s: any) => (s?.getCatalog?.() ?? s?.catalog) === catalogo;

    // Hover: rótulo con nombre, tipo y coordenadas. pos trae x, y en píxeles del mapa.
    // Varios objetos pueden caer en el mismo punto (Barnard y sus planetas): Aladin avisa uno por uno,
    // así que se guardan todos y se muestra el más citado (la consulta viene ordenada por nbref).
    const contenedor: HTMLElement | undefined = aladin.aladinDiv;
    const rotulo = contenedor ? crearRotulo(contenedor) : null;
    const bajoCursor = new Map<number, ObjetoSimbad>();
    const pintarRotulo = (pos?: { x: number; y: number }) => {
      if (!rotulo || !contenedor) return;
      if (bajoCursor.size === 0) {
        rotulo.style.display = "none";
        return;
      }
      const orden = [...bajoCursor.keys()].sort((a, b) => a - b);
      const d = bajoCursor.get(orden[0])!;
      const mas = orden.length > 1 ? ` (+${orden.length - 1} en el mismo punto)` : "";
      rotulo.textContent = `${d.main_id} · ${d.otype || "?"} · RA ${fmt(d.ra)}°, Dec ${fmt(d.dec)}° (J2000)${mas}`;
      rotulo.style.display = "block";
      if (pos) {
        // A la derecha del cursor, o a la izquierda si no cabe.
        const x = pos.x + 14 + rotulo.offsetWidth > contenedor.clientWidth ? pos.x - 14 - rotulo.offsetWidth : pos.x + 14;
        rotulo.style.left = `${Math.max(0, x)}px`;
        rotulo.style.top = `${pos.y + 14}px`;
      }
    };
    const quitarHover = ctx.on("objectHovered", (fuente, pos) => {
      if (!esDeSimbad(fuente)) return;
      const d = fuente.data as ObjetoSimbad & { rango: number };
      bajoCursor.set(d.rango, d);
      pintarRotulo(pos);
    });
    const quitarHoverStop = ctx.on("objectHoveredStop", (fuente) => {
      if (!esDeSimbad(fuente)) return;
      bajoCursor.delete((fuente.data as { rango: number }).rango);
      pintarRotulo();
    });
    // Al arrastrar o hacer zoom el objeto se mueve y el rótulo quedaría huérfano: se oculta.
    const ocultar = () => {
      bajoCursor.clear();
      if (rotulo) rotulo.style.display = "none";
    };
    const quitarPos = ctx.on("positionChanged", ocultar);
    const quitarZoom = ctx.on("zoomChanged", ocultar);

    // Clic: Aladin 3.8.2 llama objectClicked (una vez por objeto bajo el cursor) justo antes de click,
    // y al arrastrar no llama objectClicked y marca click con isDragging = true.
    // Si hay varios objetos bajo el cursor, gana el más citado (menor rango).
    let objetoClicado: { ra: number; dec: number; rango: number } | null = null;
    const quitarObjClic = ctx.on("objectClicked", (fuente) => {
      if (!esDeSimbad(fuente)) return;
      const rango = (fuente.data as { rango: number }).rango;
      if (!objetoClicado || rango < objetoClicado.rango) objetoClicado = { ra: fuente.ra, dec: fuente.dec, rango };
    });
    const quitarClic = ctx.on("click", (e: { ra: number; dec: number; isDragging?: boolean }) => {
      const obj = objetoClicado;
      objetoClicado = null;
      if (e?.isDragging) return;
      const ra = obj?.ra ?? e?.ra;
      const dec = obj?.dec ?? e?.dec;
      if (!Number.isFinite(ra) || !Number.isFinite(dec)) return;
      console.info("[sky] clic", ra, dec);
      ctx.onSelect(ra, dec);
    });

    return () => {
      fin.abort();
      quitarHover();
      quitarHoverStop();
      quitarPos();
      quitarZoom();
      quitarObjClic();
      quitarClic();
      rotulo?.remove();
      try {
        aladin.removeLayer(catalogo);
      } catch (e) {
        console.error("[sky] no se pudo quitar el catálogo SIMBAD:", e);
      }
    };
  },
};
