/**
 * Comparador del Modo Misión: el parpadeo de Tombaugh con fotos reales de SPHEREx.
 * Pide los fotogramas al prototipo D2 de Bryan (`/proto-api/frames`, reescrito por vercel.json a
 * spherex-prototipo-d2.vercel.app): primera y última visita alineadas norte-arriba, y la resta.
 * Cuando exista `/api/frames` oficial (D2 en scaffold/backend), basta con cambiar BASE.
 */
import { useEffect, useRef, useState } from "react";
import { mision } from "../content/mision";

const BASE = "/proto-api";

type Fotograma = { t: string; wavelength_um: number; flagged_fraction: number; png: string };
type Respuesta = { frames: Fotograma[]; diff_png?: string; warnings?: string[] };

const cache = new Map<string, Respuesta>();

type Props = { ra: number; dec: number; banda: string; size: number };

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "short" });
}

export default function Comparador({ ra, dec, banda, size }: Props) {
  const clave = `${ra.toFixed(5)},${dec.toFixed(5)},${banda},${size}`;
  const [datos, setDatos] = useState<Respuesta | null>(cache.get(clave) ?? null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [modo, setModo] = useState<"parpadeo" | "resta">("parpadeo");
  const [cual, setCual] = useState(0); // 0 = primera, 1 = última
  const [pausa, setPausa] = useState(false);
  const pedido = useRef(0);

  useEffect(() => {
    setModo("parpadeo");
    setCual(0);
    setError(false);
    const enCache = cache.get(clave);
    if (enCache) {
      setDatos(enCache);
      return;
    }
    setDatos(null);
    const n = ++pedido.current;
    const q = new URLSearchParams({ ra: String(ra), dec: String(dec), band: banda, size: String(size), max_visits: "4" });
    fetch(`${BASE}/frames?${q}`, { signal: AbortSignal.timeout(120000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: Respuesta) => {
        if (n !== pedido.current) return;
        if (!d.frames || d.frames.length < 2) throw new Error("menos de dos fotos");
        cache.set(clave, d);
        setDatos(d);
      })
      .catch(() => {
        if (n === pedido.current) setError(true);
      });
  }, [clave, intento]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parpadeo: alterna primera y última cada 700 ms.
  useEffect(() => {
    if (!datos || modo !== "parpadeo" || pausa) return;
    const id = window.setInterval(() => setCual((c) => 1 - c), 700);
    return () => window.clearInterval(id);
  }, [datos, modo, pausa]);

  if (error) {
    return (
      <div className="comparador vacio">
        <p>{mision.ui.errorFotos}</p>
        <button onClick={() => setIntento((i) => i + 1)}>{mision.ui.reintentar}</button>
      </div>
    );
  }
  if (!datos) {
    return (
      <div className="comparador vacio" role="status" aria-live="polite">
        <span className="girando" aria-hidden="true" /> {mision.ui.cargando}
      </div>
    );
  }

  const primera = datos.frames[0];
  const ultima = datos.frames[datos.frames.length - 1];
  const actual = cual === 0 ? primera : ultima;
  const enResta = modo === "resta" && Boolean(datos.diff_png);
  const src = enResta ? datos.diff_png! : actual.png;
  const pie = enResta
    ? mision.ui.leyendaResta
    : `${cual === 0 ? "Primera" : "Última"} foto · ${fecha(actual.t)} · ${actual.wavelength_um.toFixed(2)} µm`;

  return (
    <figure className="comparador">
      <div className="comparador-img">
        <img src={src} alt={enResta ? "Resta: última foto menos primera foto" : pie} />
        <span className="comparador-norte" aria-hidden="true">N ↑</span>
        <span className="comparador-centro" aria-hidden="true" />
      </div>
      <figcaption>{pie}</figcaption>
      <div className="comparador-botones" role="group" aria-label="Cómo comparar">
        <button aria-pressed={modo === "parpadeo"} onClick={() => setModo("parpadeo")}>
          {mision.ui.parpadeo}
        </button>
        <button aria-pressed={modo === "resta"} onClick={() => setModo("resta")} disabled={!datos.diff_png}>
          {mision.ui.resta}
        </button>
        {modo === "parpadeo" && (
          <button aria-pressed={pausa} onClick={() => setPausa((p) => !p)}>
            {pausa ? "▶" : mision.ui.pausa}
          </button>
        )}
      </div>
      <p className="comparador-nota">
        {fecha(primera.t)} → {fecha(ultima.t)} · SPHEREx, banda D{banda} · {datos.frames.length} visitas
      </p>
    </figure>
  );
}
