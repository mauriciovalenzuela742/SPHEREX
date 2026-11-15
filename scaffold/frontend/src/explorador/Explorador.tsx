/**
 * Explorador SPHEREx dentro del visor: port a React del explorador de Bryan
 * (`prototipos/rango_fechas/static/explorar.html`, D2) con su diseño y su lógica:
 * imagen grande con mira, escala de 30″ y rótulo; línea de tiempo proporcional a la fecha (pasar el mouse
 * cambia la visita); las 6 bandas a la vez; modos Imagen / Resta vs t₀ / Color / Resta A − B; «Esta imagen»;
 * «Resta A − B»: dos fechas cualesquiera elegidas por la persona (docs/11: «resta entre dos fechas cualesquiera»);
 * rejilla bandas × fechas; teclado ← → ↑ ↓ y espacio; carga progresiva (t₀ y la última primero).
 *
 * Datos: `/proto-api/grid` y `/proto-api/frame` (prototipo de Bryan; rewrite en vercel.json).
 * Sigue la posición del visor (A.R./Dec/dimensión): botones de objetos, Spherix y la barra de arriba.
 * Dueña de la integración: Antonia (V1). Lógica de datos y render: Bryan (D2).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIdioma } from "../state/idioma";
import { dibujar, type Frame, type Modo } from "./render";
import { clave, type DatosSpherex } from "./useDatosSpherex";
import PanelApilar from "./PanelApilar";
import "./explorador.css";

const BANDAS_UM: Record<number, [number, number]> = {
  1: [0.75, 1.09], 2: [1.1, 1.62], 3: [1.63, 2.41], 4: [2.42, 3.82], 5: [3.83, 4.41], 6: [4.42, 5.0],
};
const MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


const LEYENDA_ES: Record<Modo, string> = {
  imagen: "Brillo con escala común para todas las fechas de la banda. La mira marca el punto pedido.",
  resta: "Rojo = brillo que aparece respecto de t₀ · Azul = brillo que estaba. Un par rojo/azul que se separa al avanzar el tiempo = movimiento.",
  color: "Primera visita en rojo, la actual en cian. Lo quieto se ve blanco.",
};

// Pasos de los botones y teclas. Con el touchpad (pellizcar) el zoom es continuo entre el primero y el último.
const ZOOMS = [1, 2, 4, 8];
const ZOOM_MIN = ZOOMS[0];
const ZOOM_MAX = ZOOMS[ZOOMS.length - 1];
const cambiarZoom = (z: number, paso: 1 | -1) =>
  paso > 0 ? ZOOMS.find((v) => v > z + 0.01) ?? ZOOM_MAX : [...ZOOMS].reverse().find((v) => v < z - 0.01) ?? ZOOM_MIN;
const textoZoom = (z: number) => `${Number(z.toFixed(1))}x`.replace(".", ",");
type Punto = { x: number; y: number };
const limitar = (p: Punto, z: number) => {
  const m = (z - 1) / 2; // con zoom z, la imagen sobresale (z−1)/2 del cuadro por cada lado
  return { x: Math.max(-m, Math.min(m, p.x)), y: Math.max(-m, Math.min(m, p.y)) };
};
const fechaDeMjd = (mjd: number) => new Date((mjd - 40587) * 864e5);
/** Modos de la vista: los de `render.ts` más «ab» (resta de dos fechas elegidas), que se dibuja con «resta». */
type Vista = Modo | "ab";

type Props = { datos: DatosSpherex };

export default function Explorador({ datos }: Props) {
  const { t, idioma, tr } = useIdioma();
  const MESES = idioma === "en" ? MESES_EN : MESES_ES;
  const { desde, setDesde, hasta, setHasta, cargar, setCargar, porVisita, setPorVisita, intento, setIntento, banda, setBanda, visita, setVisita, grid, mensaje, version, prog, frames, escalas, errores, filas, visitas, tMin, tMax, irA, visitaMasCercana, mjdActual, reintentarImagen, reintentarFallidas, reintentando, preset } = datos;

  // ── Leyenda dinámica ──
  const LEYENDA: Record<Vista, string> = {
    imagen: t.modoImagenDesc,
    resta: t.modoRestaDesc,
    color: t.modoColorDesc,
    ab: tr(
      "Rojo = brillo que está en A y no en B · Azul = brillo que está en B y no en A. Elige A y B en la línea de tiempo.",
      "Red = brightness in A but not in B · Blue = brightness in B but not in A. Pick A and B on the timeline.",
    ),
  };

  // ── Vista ──
  const [modo, setModo] = useState<Vista>("imagen");
  // Fechas A y B de «Resta A − B», como MJD: cada banda tiene sus propias visitas y usa la más cercana.
  const [ab, setAb] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  useEffect(() => setAb({ a: null, b: null }), [grid]);
  const [suave, setSuave] = useState(false);
  const [apilar, setApilar] = useState(false); // modo Apilar (PanelApilar.tsx, V2)
  const [zoom, setZoom] = useState(1); // ampliación hacia la mira: el movimiento es de 1–2 px (docs/09)
  // Desplazamiento al arrastrar, en fracción del ancho del cuadro. Se limita para no dejar bordes negros.
  const [pan, setPan] = useState<Punto>({ x: 0, y: 0 });
  const arrastre = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const caja = useRef<HTMLDivElement>(null);
  // Copia al día de zoom y pan: el touchpad manda muchos eventos seguidos y cada uno parte del anterior.
  const vista = useRef({ zoom, pan });
  vista.current = { zoom, pan };
  /** Cambia el zoom dejando quieto el punto `s` del cuadro (fracción desde el centro; {0,0} = el centro). */
  const aplicarZoom = useCallback((nuevo: number, s: Punto = { x: 0, y: 0 }) => {
    const { zoom: z, pan: p } = vista.current;
    const nz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nuevo));
    const np = limitar({ x: s.x - ((s.x - p.x) * nz) / z, y: s.y - ((s.y - p.y) * nz) / z }, nz);
    vista.current = { zoom: nz, pan: np };
    setZoom(nz);
    setPan(np);
  }, []);
  const mover = useCallback((p: Punto) => {
    const np = limitar(p, vista.current.zoom);
    vista.current = { ...vista.current, pan: np };
    setPan(np);
  }, []);

  // Touchpad: pellizcar = zoom hacia los dedos (el navegador lo manda como rueda + Ctrl);
  // dos dedos = mover la imagen (solo con zoom; sin zoom, la página se desplaza como siempre).
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const rueda = (ev: WheelEvent) => {
      const r = el.getBoundingClientRect();
      const k = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? r.height : 1; // líneas o páginas → píxeles
      if (ev.ctrlKey) {
        ev.preventDefault(); // si no, el navegador amplía toda la página
        const s = { x: (ev.clientX - r.left) / r.width - 0.5, y: (ev.clientY - r.top) / r.height - 0.5 };
        aplicarZoom(vista.current.zoom * Math.exp((-ev.deltaY * k) / 100), s);
      } else if (vista.current.zoom > 1) {
        ev.preventDefault();
        const { pan: p } = vista.current;
        mover({ x: p.x - (ev.deltaX * k) / r.width, y: p.y - (ev.deltaY * k) / r.width });
      }
    };
    el.addEventListener("wheel", rueda, { passive: false }); // passive: false para poder usar preventDefault
    return () => el.removeEventListener("wheel", rueda);
  }, [aplicarZoom, mover]);
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(false), [grid]);
  // Objetos débiles con preset (presets.ts): se abren en la resta contra la primera visita; los demás, en la imagen.
  const presetId = preset?.id;
  useEffect(() => setModo(presetId ? "resta" : "imagen"), [presetId]);

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
      if (ev.key === "+" || ev.key === "=") aplicarZoom(cambiarZoom(vista.current.zoom, +1));
      if (ev.key === "-" || ev.key === "_") aplicarZoom(cambiarZoom(vista.current.zoom, -1));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [grid, banda, visita, filas, irA, visitaMasCercana, mjdActual]);

  // ── Imagen grande ──
  const lienzo = useRef<HTMLCanvasElement>(null);
  const actual = grid ? frames.current.get(clave(banda, visita)) : undefined;
  const ref0 = grid ? frames.current.get(clave(banda, 0)) : undefined;
  // «Resta A − B»: visita de A y de B en la banda visible, y sus fotos (si ya llegaron).
  const visA = grid && ab.a !== null ? visitaMasCercana(banda, ab.a) : null;
  const visB = grid && ab.b !== null ? visitaMasCercana(banda, ab.b) : null;
  const frA = visA !== null ? frames.current.get(clave(banda, visA)) : undefined;
  const frB = visB !== null ? frames.current.get(clave(banda, visB)) : undefined;
  const conAB = modo === "ab" && !!frA && !!frB; // con A y B listas se muestra la resta; si no, la foto de la fecha
  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;
    const escala = escalas.current.get(banda) ?? { vmin: 0, vmax: 1 };
    if (conAB) {
      dibujar(c, frA!, frB, escala, "resta"); // A − B: rojo = está en A, azul = está en B
      return;
    }
    if (!actual) {
      c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      return;
    }
    dibujar(c, actual, ref0, escala, modo === "ab" ? "imagen" : modo);
  }, [actual, ref0, frA, frB, conAB, banda, modo, version]);

  const error = errores.current.get(clave(banda, visita));
  const dias = actual && ref0 ? (Date.parse(actual.meta.t) - Date.parse(ref0.meta.t)) / 864e5 : 0;
  // Barra de escala: 30″ sin zoom; con zoom fuerte, 10″ para que no se salga del cuadro.
  const escalaArcsec = zoom >= 6 ? 10 : 30;
  const escalaPct = actual && grid ? (escalaArcsec / grid.pixel_scale_arcsec / actual.meta.n_px) * 100 * zoom : 0;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, tMin, tMax, idioma]);

  const pct = prog.total ? Math.round((prog.hechos / prog.total) * 100) : 0;

  return (
    <section className="explorador" aria-label={tr("Explorador SPHEREx: bandas y fechas", "SPHEREx Explorer: bands and dates")}>
      <div className="exp-escena">
        <div className="exp-titulo">
          <strong>{t.exploradorTitulo}</strong>
          <span>{t.exploradorHint}</span>
        </div>
        {preset && <p className="exp-preset">{t.presetRazon(preset.muyDebil, preset.porVisita, preset.banda)}</p>}
        {apilar && <PanelApilar datos={datos} />}
        <div
          ref={caja}
          style={apilar ? { display: "none" } : undefined}
          data-tour="explorador-imagen"
          className={`exp-lienzo ${suave ? "suave" : ""} ${zoom > 1 ? "movible" : ""} ${arrastre.current ? "arrastrando" : ""}`}
          onPointerDown={(ev) => {
            if (zoom <= 1 || (ev.target as HTMLElement).closest("button")) return;
            ev.currentTarget.setPointerCapture(ev.pointerId);
            arrastre.current = { x: ev.clientX, y: ev.clientY, px: pan.x, py: pan.y };
          }}
          onPointerMove={(ev) => {
            const a = arrastre.current;
            if (!a) return;
            const w = ev.currentTarget.getBoundingClientRect().width;
            mover({ x: a.px + (ev.clientX - a.x) / w, y: a.py + (ev.clientY - a.y) / w });
          }}
          onPointerUp={() => { arrastre.current = null; setPan((p) => ({ ...p })); }}
          onPointerCancel={() => { arrastre.current = null; }}
          onDoubleClick={() => mover({ x: 0, y: 0 })}
          title={zoom > 1 ? t.lienzoAyudaZoom : t.lienzoAyuda}
        >
          <canvas
            ref={lienzo}
            width={59}
            height={59}
            style={{ transform: `translate(${pan.x * 100}%, ${pan.y * 100}%) scale(${zoom})` }}
            aria-label={actual ? t.lienzoAria(banda, actual.meta.t.slice(0, 10), textoZoom(zoom)) : t.sinImagen}
          />
          {actual && (
            <>
              {/* La mira se mueve con la imagen: sigue marcando el objeto pedido. */}
              <div className="exp-ret" aria-hidden="true" style={{ left: `${50 + pan.x * 100}%`, top: `${50 + pan.y * 100}%` }}><i /><i /><i /><i /></div>
              <div className="exp-escala"><i style={{ width: `${escalaPct}%` }} />{escalaArcsec}″</div>
            </>
          )}
          {grid && (
            <div className="exp-zoom" role="group" aria-label="Zoom" data-tour="explorador-zoom">
              <button aria-label={t.acercar} title={t.acercar} onClick={() => aplicarZoom(cambiarZoom(vista.current.zoom, +1))} disabled={zoom >= ZOOM_MAX}>+</button>
              <span aria-live="polite">{textoZoom(zoom)}</span>
              <button aria-label={t.alejar} title={t.alejar} onClick={() => aplicarZoom(cambiarZoom(vista.current.zoom, -1))} disabled={zoom <= ZOOM_MIN}>−</button>
              <button aria-label={t.volverMira} title={t.volverMira} onClick={() => mover({ x: 0, y: 0 })} disabled={!pan.x && !pan.y}>⌖</button>
            </div>
          )}
          {grid && banda > 0 && visitas[visita] && (
            <div className="exp-rot">
              B{banda} · {(actual?.meta.t ?? visitas[visita].start).slice(0, 10)}
              {actual && (
                <small>
                  {conAB
                    ? `A ${frA!.meta.t.slice(0, 10)} − B ${frB!.meta.t.slice(0, 10)} · ${(Math.abs(Date.parse(frB!.meta.t) - Date.parse(frA!.meta.t)) / 864e5 / 365.25).toFixed(2)} ${tr("años entre ambas", "years apart")}`
                    : `${dias >= 0 ? "+" : ""}${(dias / 365.25).toFixed(2)} ${tr("años desde t₀", "years since t₀")} · λ ${actual.meta.wavelength_um ?? "?"} µm`}
                </small>
              )}
            </div>
          )}
          <span className="exp-orient">N↑ E←</span>
          {prog.total > 0 && prog.hechos < prog.total && <div className="exp-cargando">{tr("cargando", "loading")} {prog.hechos}/{prog.total}</div>}
          {!actual && (
            <div className="exp-mensaje">
              {!grid
                ? mensaje
                : error
                  ? t.noSePudoTraer(error)
                  : t.cargandoImagenDel(visitas[visita]?.start.slice(0, 10) ?? "")}
              {/* Reintentar cuando puede servir: errores de IRSA, de red o del servidor (mensajes de errores.ts) */}
              {!grid && /IRSA|HTTP|\(50\d\)|conexión|servidor/.test(mensaje) && (
                <button onClick={() => setIntento((x) => x + 1)}>{t.reintentar}</button>
              )}
              {/* Una foto suelta falló (la búsqueda sí funcionó): pedir solo esa */}
              {grid && error && <button onClick={() => reintentarImagen(banda, visita)}>{t.reintentarEsta}</button>}
            </div>
          )}
        </div>

        <div className="exp-tiempo" data-tour="explorador-tiempo">
          <div className="exp-botones">
            <button aria-label={t.visitaAnterior} onClick={() => irA(banda, visita - 1)} disabled={!grid}>◀</button>
            <button aria-label={play ? t.pausa : t.reproducir} aria-pressed={play} onClick={() => setPlay(!play)} disabled={!grid}>{play ? "⏸" : "▶"}</button>
            <button aria-label={t.visitaSiguiente} onClick={() => irA(banda, visita + 1)} disabled={!grid}>▶▶</button>
          </div>
          <div
            ref={pista}
            className="exp-pista"
            tabIndex={0}
            role="slider"
            aria-label={tr("Fecha", "Date")}
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
              // Pasar el mouse solo muestra la línea guía; la fecha cambia con clic o arrastrando (botón apretado).
              // Así, una vez elegida, no se pierde al mover el cursor para ir a otra parte.
              if ((ev.buttons & 1) === 0) return;
              const v = visitaMasCercana(banda, mjd);
              if (v !== visita) irA(banda, v);
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
                title={`${v.start.slice(0, 10)} · ${t.nExposiciones(v.n)}`}
              />
            ))}
            {fantasma !== null && <div className="fantasma" style={{ left: `${fantasma}%` }} />}
            {modo === "ab" && visA !== null && visitas[visA] && <div className="ab-marca" data-l="A" style={{ left: `${xDe(visitas[visA].mjd)}%` }} />}
            {modo === "ab" && visB !== null && visitas[visB] && <div className="ab-marca" data-l="B" style={{ left: `${xDe(visitas[visB].mjd)}%` }} />}
            {grid && visitas[visita] && <div className="puntero" style={{ left: `${xDe(mjdActual)}%` }} />}
          </div>
        </div>
      </div>

      <aside className="exp-barra">
        <div className="exp-seccion">
          <h3>{t.queCargar}</h3>
          <div className="exp-fila2">
            <label>{t.desde}<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
            <label>{t.hasta}<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          </div>
          <div className="exp-chips" role="group" aria-label={tr("Bandas a cargar", "Bands to load")}>
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
          <label title={tr("Mediana de varias exposiciones de la visita: objetos débiles se ven mejor", "Median of several exposures per visit: faint objects show up better")}>
            {tr("Exp. por visita", "Exp. per visit")}
            <input type="number" min={1} max={10} value={porVisita} onChange={(e) => setPorVisita(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} />
          </label>
          {prog.total > 0 && (
            <div className="exp-estado">
              {prog.hechos < prog.total ? t.cargando : t.listo} {prog.hechos}/{prog.total} {t.imagenes}
              {prog.errores > 0 && <span className="aviso"> · {prog.errores} {t.conError}</span>}
              <div className="exp-barrita"><i style={{ width: `${pct}%` }} /></div>
              {/* Cuando terminó la carga normal y quedaron fotos con error: pedir de nuevo solo esas */}
              {prog.errores > 0 && prog.hechos >= prog.total && (
                <button className="exp-reintentar" onClick={reintentarFallidas} disabled={reintentando}>
                  {reintentando ? t.reintentando : t.reintentarFallidas(prog.errores)}
                </button>
              )}
            </div>
          )}
          {(grid?.warnings ?? []).map((w) => <div key={w} className="aviso">{w}</div>)}
        </div>

        {grid && (
          <div className="exp-seccion" data-tour="explorador-modos">
            <h3>{t.bandaVisible}</h3>
            <div className="exp-chips" role="group" aria-label={t.bandaVisible}>
              {filas.map((b) => (
                <button key={b} style={{ ["--c" as string]: `var(--b${b})` }} aria-pressed={b === banda} onClick={() => irA(b, visitaMasCercana(b, mjdActual))}>
                  B{b}
                </button>
              ))}
            </div>
            <div className="exp-modos" role="group" aria-label={t.modo}>
              {(["imagen", "resta", "color", "ab"] as Vista[]).map((m) => (
                <button key={m} aria-pressed={!apilar && modo === m} onClick={() => { setModo(m); setApilar(false); }}>
                  {m === "imagen" ? t.modoImagen : m === "resta" ? t.modoResta : m === "color" ? t.modoColor : tr("Resta A − B", "Subtract A − B")}
                </button>
              ))}
            </div>
            <button className="exp-apilar" aria-pressed={apilar} onClick={() => setApilar((x) => !x)}
              title={tr("Suma todas las visitas de la banda para bajar el ruido", "Adds up all visits of the band to lower the noise")}>
              {tr("Apilar visitas", "Stack visits")}
            </button>
            {!apilar && modo === "ab" && (
              <div className="exp-ab">
                {(["a", "b"] as const).map((k) => {
                  const v = k === "a" ? visA : visB;
                  const f = k === "a" ? frA : frB;
                  const L = k.toUpperCase();
                  return (
                    <div key={k} className="exp-ab-fila">
                      <span>
                        <b>{L}</b>: {v !== null && visitas[v] ? (f?.meta.t ?? visitas[v].start).slice(0, 10) : tr("sin elegir", "not set")}
                        {v !== null && !f && tr(" · cargando…", " · loading…")}
                      </span>
                      <button
                        onClick={() => visitas[visita] && setAb((x) => ({ ...x, [k]: visitas[visita].mjd }))}
                        disabled={!visitas[visita] || v === visita}
                      >
                        {tr(`Esta fecha como ${L}`, `This date as ${L}`)}
                      </button>
                    </div>
                  );
                })}
                {(ab.a !== null || ab.b !== null) && (
                  <button onClick={() => setAb({ a: null, b: null })}>{tr("Borrar A y B", "Clear A and B")}</button>
                )}
              </div>
            )}
            <p className="exp-leyenda">{apilar ? tr("Apilar: quieto vs. siguiendo el movimiento propio. Ver los paneles.", "Stack: static vs. following the proper motion. See the panels.") : LEYENDA[modo]}</p>
            <label className="exp-interruptor"><input type="checkbox" checked={suave} onChange={(e) => setSuave(e.target.checked)} /> {tr("Suavizar píxeles", "Smooth pixels")}</label>
            <p className="exp-ayuda">
              {tr("La mira marca la posición pedida (A.R./Dec). Cada cuadrado es un píxel de SPHEREx de 6,15″: el instrumento está hecho para espectros de todo el cielo, no para detalle fino. El grano es ruido; baja con la mediana de más exposiciones por visita.",
                  "The crosshair marks the requested position (R.A./Dec). Each square is a 6.15″ SPHEREx pixel: the instrument is built for all-sky spectra, not fine detail. The grain is noise; it drops with the median of more exposures per visit.")}
            </p>
          </div>
        )}

        {grid && visitas[visita] && (
          <div className="exp-seccion">
            <h3>{t.estaImagen}</h3>
            <dl className="exp-info">
              {(actual
                ? [
                    [t.fecha, actual.meta.t.replace("T", " ").replace("Z", "")],
                    [t.longitudOnda, `${actual.meta.wavelength_um ?? "?"} µm`],
                    [t.exposiciones, actual.meta.n_stacked > 1 ? t.mediana(actual.meta.n_stacked) : "1"],
                    [tr("Observación", "Observation"), actual.meta.epoch_id],
                    [tr("Colección", "Collection"), actual.meta.collection],
                    [tr("Método", "Method"), actual.meta.method === "rangos" ? tr("rápido (solo píxeles)", "fast (pixels only)") : tr("recorte de IRSA", "IRSA cutout")],
                  ]
                : [[t.fecha, visitas[visita].start.slice(0, 10)], [t.exposiciones, String(visitas[visita].n)], [t.estado, t.cargandoEstado]]
              ).map(([k, x]) => (
                <div key={k} className="exp-info-fila"><dt>{k}</dt><dd>{x}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {grid && (
          <div className="exp-seccion" data-tour="explorador-rejilla">
            <h3>{tr("Todas las bandas y fechas", "All bands and dates")}</h3>
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
                                modo={modo === "ab" ? "imagen" : modo}
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
              <kbd>←</kbd><kbd>→</kbd> {tr("visita", "visit")} · <kbd>↑</kbd><kbd>↓</kbd> {tr("banda", "band")} · <kbd>{tr("espacio", "space")}</kbd> {tr("reproducir", "play")}
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
