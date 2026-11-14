/**
 * Parpadeo por visitas con datos reales de SPHEREx (Vía B). Dueña: Antonia (V1); datos: `/api/frames`
 * de Bryan (D2) sobre el acceso de Vladimir (D1), servidos por el backend desplegado en Vercel
 * (`spherex-api`, reescrito a `/api` por vercel.json).
 *
 * Respuesta parcial (ADR-001): si `pending` trae visitas, se vuelve a pedir hasta completarlas.
 * Cada fotograma trae su λ: la tira la muestra, porque entre visitas la λ cambia (docs/09).
 */
import { useEffect, useRef, useState } from "react";

type Fotograma = {
  t: string;
  wavelength_um: number | null;
  flagged_fraction: number | null;
  png: string;
};
type Respuesta = { frames: Fotograma[]; pending: unknown[]; warnings: string[]; n_visits: number };

type Modo = "zodi_subtracted" | "diff_first" | "diff_prev";
const MODOS: { valor: Modo; texto: string }[] = [
  { valor: "zodi_subtracted", texto: "Fotos" },
  { valor: "diff_first", texto: "Resta con la primera" },
  { valor: "diff_prev", texto: "Resta con la anterior" },
];

type Props = { ra: number; dec: number; size: number; band: string };

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlinkPanel({ ra, dec, size, band }: Props) {
  const banda = /^[1-6]$/.test(band) ? band : "4";
  const [modo, setModo] = useState<Modo>("zodi_subtracted");
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(true);
  const [fps, setFps] = useState(2);
  const pedido = useRef(0);

  useEffect(() => {
    const n = ++pedido.current;
    setEstado("cargando");
    setDatos(null);
    setI(0);
    const q = new URLSearchParams({ ra: String(ra), dec: String(dec), size: String(size), band: banda, mode: modo });
    let intentos = 0;
    const pedir = async (): Promise<void> => {
      const r = await fetch(`/api/frames?${q}`, { signal: AbortSignal.timeout(65000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d: Respuesta = await r.json();
      if (n !== pedido.current) return;
      setDatos(d);
      setEstado("listo");
      // Respuesta parcial: el backend ya guardó lo bajado; repetir la petición completa el resto.
      if (d.pending?.length && intentos++ < 6) {
        await new Promise((ok) => setTimeout(ok, 1200));
        if (n === pedido.current) return pedir();
      }
    };
    pedir().catch(() => {
      if (n === pedido.current) setEstado("error");
    });
  }, [ra, dec, size, banda, modo]);

  const frames = datos?.frames ?? [];
  useEffect(() => {
    if (!play || frames.length < 2) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % frames.length), 1000 / fps);
    return () => window.clearInterval(id);
  }, [play, fps, frames.length]);

  const actual = frames.length ? frames[Math.min(i, frames.length - 1)] : undefined;
  const pendientes = datos?.pending?.length ?? 0;
  const ir = (k: number) => {
    setPlay(false);
    setI(((k % frames.length) + frames.length) % frames.length);
  };

  return (
    <section className="blink" aria-label="Parpadeo por visitas de SPHEREx">
      <div className="blink-cabecera">
        <strong>Parpadeo · banda D{banda}</strong>
        <div role="group" aria-label="Modo" className="blink-modos">
          {MODOS.map((m) => (
            <button key={m.valor} aria-pressed={modo === m.valor} onClick={() => setModo(m.valor)}>
              {m.texto}
            </button>
          ))}
        </div>
      </div>

      <div className="blink-img">
        {estado === "cargando" && !actual && (
          <p className="vacio" role="status">
            <span className="girando" aria-hidden="true" /> Pidiendo las visitas de SPHEREx a IRSA…
          </p>
        )}
        {estado === "error" && <p className="vacio">IRSA no respondió. Prueba otra vez en un momento.</p>}
        {estado === "listo" && frames.length === 0 && (
          <p className="vacio">{datos?.warnings?.[0] ?? "No hay visitas de SPHEREx en esta posición y banda."}</p>
        )}
        {actual && <img src={actual.png} alt={`Visita del ${fecha(actual.t)}`} />}
        {actual && <span className="comparador-norte" aria-hidden="true">N ↑</span>}
      </div>

      {actual && (
        <p className="blink-meta">
          {Math.min(i, frames.length - 1) + 1}/{frames.length} · {fecha(actual.t)}
          {actual.wavelength_um ? ` · λ ${actual.wavelength_um.toFixed(2)} µm` : ""}
          {actual.flagged_fraction != null ? ` · ${(actual.flagged_fraction * 100).toFixed(1)} % píxeles marcados` : ""}
          {pendientes > 0 && ` · completando ${pendientes} visita(s)…`}
        </p>
      )}

      <div className="reproductor">
        <button aria-label="Anterior" disabled={frames.length < 2} onClick={() => ir(i - 1)}>◁</button>
        <button aria-label={play ? "Pausa" : "Reproducir"} disabled={frames.length < 2} onClick={() => setPlay(!play)}>
          {play ? "⏸" : "▶"}
        </button>
        <button aria-label="Siguiente" disabled={frames.length < 2} onClick={() => ir(i + 1)}>▷</button>
        <input
          type="range"
          aria-label="Línea de tiempo"
          min={0}
          max={Math.max(0, frames.length - 1)}
          value={Math.min(i, Math.max(0, frames.length - 1))}
          onChange={(e) => ir(Number(e.target.value))}
          disabled={frames.length < 2}
        />
        <label>
          <span className="solo-lector">Velocidad</span>
          <select value={fps} onChange={(e) => setFps(Number(e.target.value))}>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </label>
      </div>

      {frames.length > 0 && (
        <ol className="tira-blink" aria-label="Visitas">
          {frames.map((f, k) => (
            <li key={f.t}>
              <button
                className={k === i ? "actual" : ""}
                onClick={() => ir(k)}
                aria-label={`Visita ${k + 1}: ${fecha(f.t)}`}
              >
                <img src={f.png} alt="" />
                <span>{fecha(f.t)}</span>
                {f.wavelength_um ? <span>{f.wavelength_um.toFixed(2)} µm</span> : null}
              </button>
            </li>
          ))}
        </ol>
      )}

      {frames.length > 0 &&
        (datos?.warnings ?? []).map((w) => (
          <p key={w} className="blink-aviso">
            ⚠ {w}
          </p>
        ))}
    </section>
  );
}
