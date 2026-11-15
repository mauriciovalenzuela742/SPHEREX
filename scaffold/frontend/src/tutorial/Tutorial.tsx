/**
 * Tutorial guiado por Spherix. Recorre las funciones principales del visor: en cada paso ilumina una
 * sección (`data-tour="<ancla>"`) y oscurece el resto, y Spherix la explica en una burbuja.
 * Textos: content/tutorial.ts (Javiera). Búsqueda y seguimiento de la sección: ./usarObjetivo.ts.
 *
 * Accesibilidad: diálogo modal con el foco atrapado en la burbuja, ← → para moverse, Esc para salir,
 * el texto se anuncia (aria-live) y al cerrar el foco vuelve a donde estaba. Sin animaciones si el
 * sistema pide «reducir movimiento».
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { textosTutorial } from "../content/tutorial";
import { useIdioma } from "../state/idioma";
import { Cara } from "../spherix/Spherix";
import { usarObjetivo, type Rect } from "./usarObjetivo";
import "./tutorial.css";

type Props = {
  /** «ciencia» = recorrido del Visor completo; «simple» = el de la vista simple. */
  variante?: "ciencia" | "simple";
  onCerrar: () => void;
  onBarnard: () => void;
  /** Botón del medio al final: Modo Misión (ciencia) o abrir el Modo ciencia (simple). */
  onMision: () => void;
};

const SEP = 14; // distancia entre la sección y la burbuja
const BORDE = 16; // margen mínimo con el borde de la ventana

type Lugar = { estilo: CSSProperties; flecha?: "arriba" | "abajo" | "izquierda" | "derecha" };

/** Dónde poner la burbuja para no tapar la sección: abajo, arriba, a la derecha, a la izquierda o en una esquina. */
function ubicar(r: Rect | null, bw: number, bh: number): Lugar {
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (!r) return { estilo: { left: (W - bw) / 2, top: Math.max(BORDE, (H - bh) / 2) } };
  if (W < 640) return { estilo: { left: BORDE, right: BORDE, bottom: BORDE } }; // hoja inferior en móvil
  const enX = (x: number) => Math.min(Math.max(BORDE, x), W - bw - BORDE);
  const enY = (y: number) => Math.min(Math.max(BORDE, y), H - bh - BORDE);
  if (r.top + r.height + SEP + bh <= H - BORDE)
    return { estilo: { left: enX(r.left), top: r.top + r.height + SEP }, flecha: "arriba" };
  if (r.top - SEP - bh >= BORDE) return { estilo: { left: enX(r.left), top: r.top - SEP - bh }, flecha: "abajo" };
  if (r.left + r.width + SEP + bw <= W - BORDE)
    return { estilo: { left: r.left + r.width + SEP, top: enY(r.top) }, flecha: "izquierda" };
  if (r.left - SEP - bw >= BORDE) return { estilo: { left: r.left - SEP - bw, top: enY(r.top) }, flecha: "derecha" };
  // Sección muy grande (p. ej. el mapa): esquina inferior derecha, encima de la sección.
  return { estilo: { right: BORDE, bottom: BORDE } };
}

export default function Tutorial({ variante = "ciencia", onCerrar, onBarnard, onMision }: Props) {
  // Textos en el idioma de la página (ES/EN) y los pasos del recorrido que corresponde.
  const { idioma } = useIdioma();
  const tutorial = textosTutorial(idioma);
  const PASOS = variante === "simple" ? tutorial.pasosSimple : tutorial.pasos;
  const final = variante === "simple"
    ? { barnard: tutorial.finalSimple.barnard, medio: tutorial.finalSimple.ciencia, libre: tutorial.finalSimple.libre }
    : { barnard: tutorial.final.barnard, medio: tutorial.final.mision, libre: tutorial.final.libre };
  const [i, setI] = useState(0);
  const paso = PASOS[i];
  const ultimo = i === PASOS.length - 1;
  const objetivo = usarObjetivo(paso.ancla);
  const rect = objetivo.estado === "visible" ? objetivo.rect : null;

  const burbuja = useRef<HTMLDivElement>(null);
  const [tam, setTam] = useState({ w: 380, h: 240 });
  const previo = useRef<Element | null>(null);

  // Guardar el foco previo y devolverlo al cerrar.
  useEffect(() => {
    previo.current = document.activeElement;
    return () => (previo.current as HTMLElement | null)?.focus?.();
  }, []);

  // Medir la burbuja (su alto cambia con el texto) para ubicarla bien.
  // Dentro de un mismo paso el tamaño solo crece: si no, con secciones grandes (p. ej. «Longitud de onda», paso 6)
  // la burbuja alternaba entre dos lugares de distinto tamaño, se volvía a medir en cada uno y React cortaba el bucle
  // con «Maximum update depth exceeded» (el tutorial desaparecía). Al cambiar de paso se mide de nuevo desde cero.
  const pasoMedido = useRef(-1);
  useLayoutEffect(() => {
    const b = burbuja.current;
    if (!b) return;
    const r = b.getBoundingClientRect();
    const nuevo = pasoMedido.current !== i;
    const w = nuevo ? r.width : Math.max(r.width, tam.w);
    const h = nuevo ? r.height : Math.max(r.height, tam.h);
    pasoMedido.current = i;
    if (Math.abs(w - tam.w) > 2 || Math.abs(h - tam.h) > 2) setTam({ w, h });
  });

  // Al cambiar de paso, el foco va al botón principal.
  useEffect(() => {
    burbuja.current?.querySelector<HTMLButtonElement>("[data-principal]")?.focus();
  }, [i]);

  // Teclado: ← → para moverse, Esc para salir, Tab dentro de la burbuja.
  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onCerrar();
      } else if (ev.key === "ArrowRight" && !ultimo) {
        ev.preventDefault();
        setI((x) => Math.min(PASOS.length - 1, x + 1));
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        setI((x) => Math.max(0, x - 1));
      } else if (ev.key === "Tab" && burbuja.current) {
        const focos = [...burbuja.current.querySelectorAll<HTMLElement>("button")];
        if (!focos.length) return;
        const primero = focos[0];
        const fin = focos[focos.length - 1];
        if (ev.shiftKey && document.activeElement === primero) {
          ev.preventDefault();
          fin.focus();
        } else if (!ev.shiftKey && document.activeElement === fin) {
          ev.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener("keydown", tecla, true);
    return () => window.removeEventListener("keydown", tecla, true);
  }, [ultimo, onCerrar, PASOS.length]);

  const lugar = ubicar(rect, tam.w, tam.h);
  const aviso =
    objetivo.estado === "buscando" ? tutorial.buscando : objetivo.estado === "no-encontrada" ? tutorial.noEncontrada : null;

  return (
    <div className="tut" role="presentation">
      {/* Bloquea los clics a la página mientras dura el tutorial. */}
      <div className={`tut-velo ${rect ? "" : "tut-velo-oscuro"}`} aria-hidden="true" />
      {rect && (
        <div
          className="tut-foco"
          aria-hidden="true"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}

      <div
        ref={burbuja}
        className={`tut-burbuja ${lugar.flecha ? `tut-flecha-${lugar.flecha}` : ""}`}
        style={lugar.estilo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tut-titulo"
        aria-describedby="tut-texto"
      >
        <div className="tut-cabecera">
          <Cara />
          <div>
            <p className="tut-progreso">Spherix · {tutorial.progreso(i + 1, PASOS.length)}</p>
            <h2 id="tut-titulo">{paso.titulo}</h2>
          </div>
          <button className="tut-x" onClick={onCerrar} aria-label={tutorial.cerrar} title={tutorial.cerrar}>
            ×
          </button>
        </div>

        <div className="tut-barra" aria-hidden="true">
          <i style={{ width: `${((i + 1) / PASOS.length) * 100}%` }} />
        </div>

        <div aria-live="polite">
          <p id="tut-texto" className="tut-texto">{paso.texto}</p>
          {paso.prueba && <p className="tut-prueba">{paso.prueba}</p>}
          {aviso && <p className="tut-aviso">{aviso}</p>}
        </div>

        {ultimo ? (
          <div className="tut-final">
            <button className="primario" data-principal onClick={onBarnard}>{final.barnard}</button>
            <button onClick={onMision}>{final.medio}</button>
            <button onClick={onCerrar}>{final.libre}</button>
          </div>
        ) : (
          <div className="tut-acciones">
            <button className="tut-saltar" onClick={onCerrar}>{tutorial.saltar}</button>
            <span className="tut-espacio" />
            {i > 0 && <button onClick={() => setI(i - 1)}>{tutorial.anterior}</button>}
            <button className="primario" data-principal onClick={() => setI(i + 1)}>
              {i === 0 ? tutorial.empezar : tutorial.siguiente}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
