/**
 * Explorador SPHEREx dentro del visor: port a React del explorador de Bryan
 * (`prototipos/rango_fechas/static/explorar.html`, D2) con su diseño y su lógica:
 * imagen grande con mira, escala de 30″ y rótulo; línea de tiempo proporcional a la fecha (pasar el mouse
 * cambia la visita); las 6 bandas a la vez; modos Imagen / Resta vs t₀ / Color; «Esta imagen»;
 * rejilla bandas × fechas; teclado ← → ↑ ↓ y espacio; carga progresiva (t₀ y la última primero).
 *
 * Datos: `/proto-api/grid` y `/proto-api/frame` (prototipo de Bryan; rewrite en vercel.json).
 * Sigue la posición del visor (A.R./Dec/dimensión): botones de objetos, Spherix y la barra de arriba.
 * Dueña de la integración: Antonia (V1). Lógica de datos y render: Bryan (D2).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { dibujar, type Frame, type Modo } from "./render";
import { clave, type DatosSpherex } from "./useDatosSpherex";
import "./explorador.css";

const BANDAS_UM: Record<number, [number, number]> = {
  1: [0.75, 1.09], 2: [1.1, 1.62], 3: [1.63, 2.41], 4: [2.42, 3.82], 5: [3.83, 4.41], 6: [4.42, 5.0],
};
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];


const LEYENDA: Record<Modo, string> = {
  imagen: "Brillo con escala común para todas las fechas de la banda. La mira marca el punto pedido.",
  resta: "Rojo = brillo que aparece respecto de t₀ · Azul = brillo que estaba. Un par rojo/azul que se separa al avanzar el tiempo = movimiento.",
  color: "Primera visita en rojo, la actual en cian. Lo quieto se ve blanco.",
};

const fechaDeMjd = (mjd: number) => new Date((mjd - 40587) * 864e5);

type Props = { datos: DatosSpherex };

export default function Explorador({ datos }: Props) {
  const { desde, setDesde, hasta, setHasta, cargar, setCargar, porVisita, setPorVisita, intento, setIntento, banda, setBanda, visita, setVisita, grid, mensaje, version, prog, frames, escalas, errores, filas, visitas, tMin, tMax, irA, visitaMasCercana, mjdActual } = datos;

  // ── Vista ──
  const [modo, setModo] = useState<Modo>("imagen");
  const [suave, setSuave] = useState(false);
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(false), [grid]);

  useEffect(() => {
    if (!play || visitas.length < 2) return;
    const id = window.setInterval(() => setVisita((x) => (x + 1) % visitas.length), 650);
    return () => window.clearInterval(id);
  }, [play, visitas.length]);

  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (!grid || ["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
      if (ev.key === "ArrowLeft") { ev.preventDefault(); irA(banda, visita - 1); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); irA(banda, visita + 1); }
      if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        ev.preventDefault();
        const i = filas.indexOf(banda) + (ev.key === "ArrowDown" ? 1 : -1);
        if (i >= 0 && i < filas.length) irA(filas[i], visitaMasCercana(filas[i], mjdActual));
      }
      if (ev.key === " " && tag !== "BUTTON") { ev.preventDefault(); setPlay((p) => !p); }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [grid, banda, visita, filas, irA, visitaMasCercana, mjdActual]);

  // ── Imagen grande ──
  const lienzo = useRef<HTMLCanvasElement>(null);
  const actual = grid ? frames.current.get(clave(banda, visita)) : undefined;
  const ref0 = grid ? frames.current.get(clave(banda, 0)) : undefined;
  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;
    if (!actual) {
      c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      return;
    }
    dibujar(c, actual, ref0, escalas.current.get(banda) ?? { vmin: 0, vmax: 1 }, modo);
  }, [actual, ref0, banda, modo, version]);

  const error = errores.current.get(clave(banda, visita));
  const dias = actual && ref0 ? (Date.parse(actual.meta.t) - Date.parse(ref0.meta.t)) / 864e5 : 0;
  const escalaPct = actual && grid ? (30 / grid.pixel_scale_arcsec / actual.meta.n_px) * 100 : 0;

  // ── Línea de tiempo ──
  const pista = useRef<HTMLDivElement>(null);
  const [fantasma, setFantasma] = useState<number | null>(null);
  const xDe = (mjd: number) => ((mjd - tMin) / (tMax - tMin)) * 100;
  const mjdEnPista = (clientX: number) => {
    const r = pista.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return tMin + t * (tMax - tMin);
  };
  const meses = useMemo(() => {
    if (!grid) return [];
    const ini = fechaDeMjd(tMin);
    const fin = fechaDeMjd(tMax);
    const span = (+fin - +ini) / 864e5;
    const paso = span > 500 ? 3 : span > 200 ? 2 : 1;
    const out: { x: number; txt: string }[] = [];
    for (let d = new Date(Date.UTC(ini.getUTCFullYear(), ini.getUTCMonth() + 1, 1)); d <= fin; d.setUTCMonth(d.getUTCMonth() + paso)) {
      out.push({ x: ((+d / 864e5 + 40587 - tMin) / (tMax - tMin)) * 100, txt: `${MESES[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(2)}` });
    }
    return out;
  }, [grid, tMin, tMax]);

  const pct = prog.total ? Math.round((prog.hechos / prog.total) * 100) : 0;

  return (
    <section className="explorador" aria-label="Explorador SPHEREx: bandas y fechas">
      <div className="exp-escena">
        <div className="exp-titulo">
          <strong>Explorador SPHEREx</strong>
          <span>Arrastra o pasa el mouse por la línea de tiempo para cambiar la fecha.</span>
        </div>
        <div className={`exp-lienzo ${suave ? "suave" : ""}`}>
          <canvas ref={lienzo} width={59} height={59} aria-label={actual ? `Banda ${banda}, ${actual.meta.t.slice(0, 10)}` : "Sin imagen"} />
          {actual && (
            <>
              <div className="exp-ret" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="exp-escala"><i style={{ width: `${escalaPct}%` }} />30″</div>
            </>
          )}
          {grid && banda > 0 && visitas[visita] && (
            <div className="exp-rot">
              B{banda} · {(actual?.meta.t ?? visitas[visita].start).slice(0, 10)}
              {actual && (
                <small>
                  {dias >= 0 ? "+" : ""}{(dias / 365.25).toFixed(2)} años desde t₀ · λ {actual.meta.wavelength_um ?? "?"} µm
                </small>
              )}
            </div>
          )}
          <span className="exp-orient">N↑ E←</span>
          {prog.total > 0 && prog.hechos < prog.total && <div className="exp-cargando">cargando {prog.hechos}/{prog.total}</div>}
          {!actual && (
            <div className="exp-mensaje">
              {!grid
                ? mensaje
                : error
                  ? `No se pudo traer esta imagen: ${error}`
                  : `Cargando la imagen del ${visitas[visita]?.start.slice(0, 10) ?? ""}…`}
              {!grid && /IRSA|HTTP|502|503/.test(mensaje) && (
                <button onClick={() => setIntento((x) => x + 1)}>Reintentar</button>
              )}
            </div>
          )}
        </div>

        <div className="exp-tiempo">
          <div className="exp-botones">
            <button aria-label="Visita anterior" onClick={() => irA(banda, visita - 1)} disabled={!grid}>◀</button>
            <button aria-label={play ? "Pausa" : "Reproducir"} aria-pressed={play} onClick={() => setPlay(!play)} disabled={!grid}>{play ? "⏸" : "▶"}</button>
            <button aria-label="Visita siguiente" onClick={() => irA(banda, visita + 1)} disabled={!grid}>▶▶</button>
          </div>
          <div
            ref={pista}
            className="exp-pista"
            tabIndex={0}
            role="slider"
            aria-label="Fecha"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, visitas.length - 1)}
            aria-valuenow={visita}
            aria-valuetext={visitas[visita]?.start.slice(0, 10) ?? ""}
            onPointerDown={(ev) => {
              if (!grid) return;
              pista.current?.setPointerCapture(ev.pointerId);
              irA(banda, visitaMasCercana(banda, mjdEnPista(ev.clientX)));
            }}
            onPointerMove={(ev) => {
              if (!grid) return;
              const mjd = mjdEnPista(ev.clientX);
              setFantasma(xDe(mjd));
              const v = visitaMasCercana(banda, mjd);
              if (v !== visita) irA(banda, v); // con solo pasar el mouse cambia la fecha
            }}
            onPointerLeave={() => setFantasma(null)}
          >
            <div className="eje" />
            {meses.map((m) => (
              <div key={m.txt + m.x} className="mes" style={{ left: `${m.x}%` }}>{m.txt}</div>
            ))}
            {visitas.map((v, k) => (
              <div
                key={v.start}
                className={`marca ${frames.current.has(clave(banda, k)) ? "lista" : ""} ${errores.current.has(clave(banda, k)) ? "error" : ""}`}
                style={{ left: `${xDe(v.mjd)}%`, ["--c" as string]: `var(--b${banda})` }}
                title={`${v.start.slice(0, 10)} · ${v.n} exposiciones`}
              />
            ))}
            {fantasma !== null && <div className="fantasma" style={{ left: `${fantasma}%` }} />}
            {grid && visitas[visita] && <div className="puntero" style={{ left: `${xDe(mjdActual)}%` }} />}
          </div>
        </div>
      </div>

      <aside className="exp-barra">
        <div className="exp-seccion">
          <h3>Qué cargar</h3>
          <div className="exp-fila2">
            <label>Desde<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
            <label>Hasta<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          </div>
          <div className="exp-chips" role="group" aria-label="Bandas a cargar">
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <button
                key={b}
                style={{ ["--c" as string]: `var(--b${b})` }}
                aria-pressed={cargar.includes(b)}
                title={`${BANDAS_UM[b][0]}–${BANDAS_UM[b][1]} µm`}
                onClick={() => setCargar((c) => (c.includes(b) ? c.filter((x) => x !== b) : [...c, b]))}
              >
                {b}
              </button>
            ))}
          </div>
          <label title="Mediana de varias exposiciones de la visita: objetos débiles se ven mejor">
            Exp. por visita
            <input type="number" min={1} max={10} value={porVisita} onChange={(e) => setPorVisita(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
          </label>
          {prog.total > 0 && (
            <div className="exp-estado">
              {prog.hechos < prog.total ? "Cargando" : "Listo:"} {prog.hechos}/{prog.total} imágenes
              {prog.errores > 0 && <span className="aviso"> · {prog.errores} con error</span>}
              <div className="exp-barrita"><i style={{ width: `${pct}%` }} /></div>
            </div>
          )}
          {(grid?.warnings ?? []).map((w) => <div key={w} className="aviso">{w}</div>)}
        </div>

        {grid && (
          <div className="exp-seccion">
            <h3>Banda visible</h3>
            <div className="exp-chips" role="group" aria-label="Banda visible">
              {filas.map((b) => (
                <button key={b} style={{ ["--c" as string]: `var(--b${b})` }} aria-pressed={b === banda} onClick={() => irA(b, visitaMasCercana(b, mjdActual))}>
                  B{b}
                </button>
              ))}
            </div>
            <div className="exp-modos" role="group" aria-label="Modo">
              {(["imagen", "resta", "color"] as Modo[]).map((m) => (
                <button key={m} aria-pressed={modo === m} onClick={() => setModo(m)}>
                  {m === "imagen" ? "Imagen" : m === "resta" ? "Resta vs t₀" : "Color"}
                </button>
              ))}
            </div>
            <p className="exp-leyenda">{LEYENDA[modo]}</p>
            <label className="exp-interruptor"><input type="checkbox" checked={suave} onChange={(e) => setSuave(e.target.checked)} /> Suavizar píxeles</label>
            <p className="exp-ayuda">
              La mira marca la posición pedida (A.R./Dec). Cada cuadrado es un píxel de SPHEREx de 6,15″: el instrumento está hecho para
              espectros de todo el cielo, no para detalle fino. El grano es ruido; baja sumando exposiciones por visita.
            </p>
          </div>
        )}

        {grid && visitas[visita] && (
          <div className="exp-seccion">
            <h3>Esta imagen</h3>
            <dl className="exp-info">
              {(actual
                ? [
                    ["Fecha (UTC)", actual.meta.t.replace("T", " ").replace("Z", "")],
                    ["Longitud de onda", `${actual.meta.wavelength_um ?? "?"} µm`],
                    ["Exposiciones", actual.meta.n_stacked > 1 ? `mediana de ${actual.meta.n_stacked}` : "1"],
                    ["Contaminación", actual.meta.flagged_fraction == null ? "— (lector rápido no la lee)" : `${(actual.meta.flagged_fraction * 100).toFixed(1)} %`],
                    ["Observación", actual.meta.epoch_id],
                    ["Colección", actual.meta.collection],
                    ["Método", actual.meta.method === "rangos" ? "rápido (solo píxeles)" : "recorte de IRSA"],
                  ]
                : [["Fecha", visitas[visita].start.slice(0, 10)], ["Exposiciones", String(visitas[visita].n)], ["Estado", "cargando…"]]
              ).map(([k, x]) => (
                <div key={k} className="exp-info-fila"><dt>{k}</dt><dd>{x}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {grid && (
          <div className="exp-seccion">
            <h3>Todas las bandas y fechas</h3>
            <div className="exp-minis">
              <table>
                <thead>
                  <tr>
                    <th />
                    {grid.columns.map((c) => (
                      <th key={c.date}>{MESES[+c.date.slice(5, 7) - 1]}<br />{c.date.slice(2, 4)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((b) => (
                    <tr key={b}>
                      <th style={{ color: `var(--b${b})` }}>B{b}</th>
                      {grid.columns.map((c) => {
                        const v = c.celdas[String(b)];
                        return (
                          <td key={c.date}>
                            {v === undefined ? (
                              <div className="vacia" />
                            ) : (
                              <Mini
                                fr={frames.current.get(clave(b, v))}
                                ref0={frames.current.get(clave(b, 0))}
                                escala={escalas.current.get(b)}
                                modo={modo}
                                version={version}
                                sel={b === banda && v === visita}
                                titulo={`B${b} · ${c.date}`}
                                onClick={() => irA(b, v)}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="exp-ayuda">
              <kbd>←</kbd><kbd>→</kbd> visita · <kbd>↑</kbd><kbd>↓</kbd> banda · <kbd>espacio</kbd> reproducir
            </p>
          </div>
        )}
      </aside>
    </section>
  );
}

function Mini(props: {
  fr?: Frame;
  ref0?: Frame;
  escala?: { vmin: number; vmax: number };
  modo: Modo;
  version: number;
  sel: boolean;
  titulo: string;
  onClick: () => void;
}) {
  const c = useRef<HTMLCanvasElement>(null);
  const { fr, ref0, escala, modo, version } = props;
  useEffect(() => {
    if (c.current && fr && escala) dibujar(c.current, fr, ref0, escala, modo);
  }, [fr, ref0, escala, modo, version]);
  return (
    <button className={`mini ${props.sel ? "sel" : ""}`} title={props.titulo} aria-label={props.titulo} onClick={props.onClick}>
      <canvas ref={c} />
    </button>
  );
}
