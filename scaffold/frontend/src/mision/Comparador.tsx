/**
 * Comparador del Modo Misión: el parpadeo de Tombaugh con fotos reales de SPHEREx.
 *
 * Primera y última visita del nivel como float32 (prototipo D2 de Bryan), pintadas con su matemática
 * (`explorador/render.ts`): escala común e igualación de flujo antes de restar. Así la resta es la misma
 * que en el explorador y no la PNG del servidor (que sale descompensada, docs/pedidos §2e).
 *
 * Fuente: primero `public/precalc/mision/<id>.json` (generado por scripts/precalcular_mision.ts: la demo no
 * depende de IRSA); si falta, en vivo por `/proto-api/grid` + `/proto-api/frame` con los mismos parámetros.
 * Cada nivel elige `porVisita`: WISE 0855 y eps Ind B necesitan sumar 10 exposiciones para verse (docs/hallazgos).
 */
import { useEffect, useRef, useState } from "react";
import { mision } from "../content/mision";
import { decodificar, dibujar, escalaDe, type Frame, type MetaFrame } from "../explorador/render";

type Props = { id: string; ra: number; dec: number; banda: string; size: number; porVisita: number };
type Par = { primera: Frame; ultima: Frame };

const cache = new Map<string, Par>();
const aFrame = (m: MetaFrame): Frame => ({ meta: m, arr: decodificar(m.data) });

async function cargar({ id, ra, dec, banda, size, porVisita }: Props, senal: AbortSignal): Promise<Par> {
  // 1) Precalculado (mismos parámetros que el nivel)
  try {
    const r = await fetch(`/precalc/mision/${id}.json`, { signal: senal });
    if (r.ok) {
      const j = await r.json();
      if (String(j.banda) === banda && j.porVisita === porVisita && j.frames?.length === 2) {
        return { primera: aFrame(j.frames[0]), ultima: aFrame(j.frames[1]) };
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
  }
  // 2) En vivo
  const base = { ra: String(ra), dec: String(dec), start: "2025-04-01", end: new Date().toISOString().slice(0, 10) };
  const g = await (await fetch(`/proto-api/grid?${new URLSearchParams({ ...base, bands: banda })}`, { signal: senal })).json();
  const vis = g.visits?.[banda] ?? [];
  if (vis.length < 2) throw new Error("menos de dos visitas");
  const [a, z] = await Promise.all(
    [0, vis.length - 1].map(async (v) => {
      const q = new URLSearchParams({ ...base, band: banda, visit: String(v), size: String(size), per_visit: String(porVisita) });
      const r = await fetch(`/proto-api/frame?${q}`, { signal: senal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return aFrame(await r.json());
    }),
  );
  return { primera: a, ultima: z };
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "short" });
}
const lambda = (f: Frame) => (f.meta.wavelength_um == null ? "λ ?" : `${f.meta.wavelength_um.toFixed(2)} µm`);

export default function Comparador(props: Props) {
  const clave = `${props.id}|${props.banda}|${props.porVisita}`;
  const [par, setPar] = useState<Par | null>(cache.get(clave) ?? null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [modo, setModo] = useState<"parpadeo" | "resta">("parpadeo");
  const [cual, setCual] = useState(0); // 0 = primera, 1 = última
  const [pausa, setPausa] = useState(false);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setModo("parpadeo");
    setCual(0);
    setError(false);
    const enCache = cache.get(clave);
    if (enCache) {
      setPar(enCache);
      return;
    }
    setPar(null);
    const ctl = new AbortController();
    cargar(props, ctl.signal)
      .then((p) => {
        cache.set(clave, p);
        setPar(p);
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setError(true);
      });
    return () => ctl.abort();
  }, [clave, intento]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parpadeo: alterna primera y última cada 700 ms.
  useEffect(() => {
    if (!par || modo !== "parpadeo" || pausa) return;
    const id = window.setInterval(() => setCual((c) => 1 - c), 700);
    return () => window.clearInterval(id);
  }, [par, modo, pausa]);

  useEffect(() => {
    const c = lienzo.current;
    if (!c || !par) return;
    const escala = escalaDe([par.primera, par.ultima]);
    if (modo === "resta") dibujar(c, par.ultima, par.primera, escala, "resta");
    else dibujar(c, cual === 0 ? par.primera : par.ultima, undefined, escala, "imagen");
  }, [par, modo, cual]);

  if (error) {
    return (
      <div className="comparador vacio">
        <p>{mision.ui.errorFotos}</p>
        <button onClick={() => setIntento((i) => i + 1)}>{mision.ui.reintentar}</button>
      </div>
    );
  }
  if (!par) {
    return (
      <div className="comparador vacio" role="status" aria-live="polite">
        <span className="girando" aria-hidden="true" /> {mision.ui.cargando}
      </div>
    );
  }

  const actual = cual === 0 ? par.primera : par.ultima;
  const pie =
    modo === "resta"
      ? mision.ui.leyendaResta
      : `${cual === 0 ? "Primera" : "Última"} foto · ${fecha(actual.meta.t)} · ${lambda(actual)}`;
  const la = par.primera.meta.wavelength_um;
  const lz = par.ultima.meta.wavelength_um;
  const avisoLambda = la != null && lz != null && Math.abs(la - lz) > 0.1;
  const suma = par.primera.meta.n_stacked > 1 || par.ultima.meta.n_stacked > 1;

  return (
    <figure className="comparador">
      <div className="comparador-img">
        <canvas ref={lienzo} aria-label={modo === "resta" ? "Resta: última foto menos primera foto" : pie} />
        <span className="comparador-norte" aria-hidden="true">N ↑ E ←</span>
        <span className="comparador-centro" aria-hidden="true" />
      </div>
      <figcaption>{pie}</figcaption>
      <div className="comparador-botones" role="group" aria-label="Cómo comparar">
        <button aria-pressed={modo === "parpadeo"} onClick={() => setModo("parpadeo")}>
          {mision.ui.parpadeo}
        </button>
        <button aria-pressed={modo === "resta"} onClick={() => setModo("resta")}>
          {mision.ui.resta}
        </button>
        {modo === "parpadeo" && (
          <button aria-pressed={pausa} onClick={() => setPausa((p) => !p)}>
            {pausa ? "▶" : mision.ui.pausa}
          </button>
        )}
      </div>
      <p className="comparador-nota">
        {fecha(par.primera.meta.t)} → {fecha(par.ultima.meta.t)} · SPHEREx, banda D{props.banda}
        {suma && ` · ${mision.ui.sumaExposiciones(Math.min(par.primera.meta.n_stacked, par.ultima.meta.n_stacked))}`}
      </p>
      {avisoLambda && <p className="comparador-nota aviso-lambda">⚠ {mision.ui.avisoLambda(la!, lz!)}</p>}
    </figure>
  );
}
