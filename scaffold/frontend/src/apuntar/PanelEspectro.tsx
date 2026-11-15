/**
 * Panel del «modo descubrimiento»: espectro SPHEREx (0,75–5 µm) del punto o candidato pedido y su tipo probable
 * con `clasificar()` de Prisma. Dueño: Juan Pablo (V2). Datos y parámetros: espectroPunto.ts.
 *
 * El gráfico es propio y pequeño (HuellaEspectral está atado a las pasadas y al explorador). Lleno = medida
 * (S/N ≥ 3); ▽ = límite superior (S/N < 3), dibujado en flujo + 3σ.
 */
import { useEffect, useRef, useState } from "react";
import { usePrisma } from "../content/prisma";
import { useIdioma } from "../state/idioma";
import { enIdioma } from "../explorador/errores";
import { clasificar } from "../prisma/clasificar";
import "../prisma/prisma.css";
import {
  aClasif,
  cerrarEspectro,
  fijarIdioma,
  MAX_PUNTOS,
  saturadas,
  traerEspectro,
  useEspectroPedido,
  type PuntoEspectro,
  type RespuestaEspectro,
} from "./espectroPunto";

type Estado =
  | { fase: "cargando"; datos: RespuestaEspectro | null }
  | { fase: "listo"; datos: RespuestaEspectro }
  | { fase: "error"; datos: RespuestaEspectro | null; error: string };

const W = 520;
const H = 220;
const M = { izq: 52, der: 12, arr: 14, aba: 34 };
const L_MIN = 0.7;
const L_MAX = 5.2;
const TICKS_L = [0.75, 1, 1.5, 2, 3, 4, 5];
const COLOR_BANDA = ["#7b8cff", "#5fb4ff", "#4fd1a5", "#e6d14a", "#ff9f4a", "#ff6b6b"];

function Grafico({ puntos }: { puntos: PuntoEspectro[] }) {
  const { tr, idioma } = useIdioma();
  const n = (v: number, d = 1) => (idioma === "en" ? v.toFixed(d) : v.toFixed(d).replace(".", ","));
  const sn = (p: PuntoEspectro) => (p.err_mjy > 0 ? p.flux_mjy / p.err_mjy : 0);
  const altura = (p: PuntoEspectro) => (sn(p) >= 3 ? p.flux_mjy : Math.max(p.flux_mjy, 0) + 3 * p.err_mjy);
  const vals = puntos.map(altura).filter((v) => v > 0);
  const yLo = vals.length ? Math.log10(Math.min(...vals)) - 0.2 : -2;
  const yHi = vals.length ? Math.log10(Math.max(...vals)) + 0.2 : 1;
  const lx = (l: number) => M.izq + ((Math.log(l) - Math.log(L_MIN)) / (Math.log(L_MAX) - Math.log(L_MIN))) * (W - M.izq - M.der);
  const ly = (v: number) => H - M.aba - ((Math.log10(Math.max(v, 1e-9)) - yLo) / (yHi - yLo || 1)) * (H - M.arr - M.aba);
  const yTicks: number[] = [];
  for (let e = Math.floor(yLo); e <= Math.ceil(yHi); e++)
    for (const m of yHi - yLo < 1.5 ? [1, 2, 5] : [1]) {
      const v = m * 10 ** e;
      if (Math.log10(v) >= yLo && Math.log10(v) <= yHi) yTicks.push(v);
    }
  const fmtY = (v: number) => (v >= 1 ? String(Math.round(v)) : n(v, Math.max(0, -Math.floor(Math.log10(v)))));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label={tr(`Espectro: ${puntos.length} puntos entre 0,75 y 5 µm`, `Spectrum: ${puntos.length} points between 0.75 and 5 µm`)}
    >
      <rect x={M.izq} y={M.arr} width={W - M.izq - M.der} height={H - M.arr - M.aba} fill="none" stroke="var(--borde)" />
      {TICKS_L.map((l) => (
        <g key={l}>
          <line x1={lx(l)} x2={lx(l)} y1={H - M.aba} y2={H - M.aba + 4} stroke="var(--suave)" />
          <text x={lx(l)} y={H - M.aba + 16} fontSize="11" textAnchor="middle" fill="var(--suave)">
            {n(l, l < 1 ? 2 : l % 1 ? 1 : 0)}
          </text>
        </g>
      ))}
      <text x={(M.izq + W - M.der) / 2} y={H - 4} fontSize="11" textAnchor="middle" fill="var(--suave)">
        {tr("longitud de onda (µm)", "wavelength (µm)")}
      </text>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={M.izq - 4} x2={M.izq} y1={ly(v)} y2={ly(v)} stroke="var(--suave)" />
          <text x={M.izq - 6} y={ly(v) + 4} fontSize="11" textAnchor="end" fill="var(--suave)">
            {fmtY(v)}
          </text>
        </g>
      ))}
      <text x={12} y={(M.arr + H - M.aba) / 2} fontSize="11" textAnchor="middle" fill="var(--suave)" transform={`rotate(-90 12 ${(M.arr + H - M.aba) / 2})`}>
        {tr("brillo (mJy)", "brightness (mJy)")}
      </text>
      {puntos.map((p) => {
        const x = lx(p.wavelength_um);
        const y = ly(altura(p));
        const c = COLOR_BANDA[p.band - 1] ?? "#ccc";
        const rot = `D${p.band} · ${p.t?.slice(0, 10) ?? ""} · λ ${n(p.wavelength_um, 2)} µm · ${n(p.flux_mjy, 3)} ± ${n(p.err_mjy, 3)} mJy`;
        return sn(p) >= 3 ? (
          <circle key={p.epoch_id} cx={x} cy={y} r={3.2} fill={c}>
            <title>{rot}</title>
          </circle>
        ) : (
          <path key={p.epoch_id} d={`M${x - 4} ${y - 3} L${x + 4} ${y - 3} L${x} ${y + 4} Z`} fill="none" stroke={c} strokeWidth={1.3}>
            <title>{`${rot} (${tr("límite superior", "upper limit")})`}</title>
          </path>
        );
      })}
    </svg>
  );
}

export default function PanelEspectro() {
  const pedido = useEspectroPedido();
  const { tr, idioma } = useIdioma();
  const ficha = usePrisma().ficha;
  const [estado, setEstado] = useState<Estado>({ fase: "cargando", datos: null });
  const [intento, setIntento] = useState(0);
  const [inicio, setInicio] = useState(0);
  const [ahora, setAhora] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  // `continuar`: lo pendiente de la respuesta anterior; null = pedido nuevo o reintento completo.
  const continuar = useRef<RespuestaEspectro | null>(null);

  useEffect(() => fijarIdioma(idioma === "en" ? "en" : "es"), [idioma]);

  useEffect(() => {
    if (!pedido) return;
    const ctl = new AbortController();
    const previo = continuar.current;
    continuar.current = null;
    const t0 = Date.now();
    setInicio(t0);
    setAhora(t0);
    setEstado({ fase: "cargando", datos: previo });
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    const p = pedido;
    traerEspectro(p, ctl.signal, previo?.pending)
      .then((r) => {
        const datos: RespuestaEspectro = previo
          ? {
              ...r,
              spectrum: [...previo.spectrum, ...r.spectrum.filter((p) => !previo.spectrum.some((q) => q.epoch_id === p.epoch_id))].sort(
                (a, b) => a.wavelength_um - b.wavelength_um,
              ),
              n_candidates: previo.n_candidates,
              warnings: [...previo.warnings, ...r.warnings],
              elapsed_s: previo.elapsed_s + r.elapsed_s,
            }
          : r;
        console.info(
          `[espectro] ${p.ra},${p.dec}: ${r.n_points} puntos nuevos en ${((Date.now() - t0) / 1000).toFixed(1)} s (servidor ${r.elapsed_s} s), ${r.pending.length} pendientes`,
        );
        setEstado({ fase: "listo", datos });
      })
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        console.error("[espectro] no se pudo traer el espectro:", e);
        setEstado({ fase: "error", datos: previo, error: e instanceof Error ? e.message : String(e) });
      })
      .finally(() => clearInterval(reloj));
    return () => {
      ctl.abort();
      clearInterval(reloj);
    };
    // Solo un pedido nuevo (id) o «seguir»/«reintentar» vuelven a pedir: ponerle el nombre no.
  }, [pedido?.id, intento]);

  // Un pedido nuevo (p. ej. desde el recuadro del mapa) trae el panel a la vista.
  useEffect(() => {
    if (pedido) caja.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [pedido?.id]);

  if (!pedido) return null;

  const datos = estado.datos;
  const puntos = datos?.spectrum ?? [];
  const c = puntos.length ? clasificar(aClasif(puntos), idioma === "en" ? "en" : "es") : null;
  const nSat = datos ? saturadas(datos.warnings) : 0;
  const pendientes = estado.fase === "listo" ? estado.datos.pending.length : 0;
  const titulo = pedido.nombre ?? `A.R. ${pedido.ra.toFixed(4)}°, Dec ${pedido.dec.toFixed(4)}°`;
  const segundos = Math.round((ahora - inicio) / 1000);
  const seguir = () => {
    if (estado.fase !== "listo") return;
    continuar.current = estado.datos;
    setIntento((k) => k + 1);
  };
  const reintentar = () => {
    // Si ya había una parte, se reintenta solo lo que faltaba.
    continuar.current = estado.fase === "error" && estado.datos?.pending.length ? estado.datos : null;
    setIntento((k) => k + 1);
  };

  return (
    <div ref={caja} className="tarjeta espectro-punto" style={{ marginTop: 8 }} aria-live="polite">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <strong>
          {tr("Espectro SPHEREx", "SPHEREx spectrum")} · {titulo}
        </strong>
        <button type="button" onClick={cerrarEspectro} style={{ marginLeft: "auto" }}>
          {tr("Cerrar", "Close")}
        </button>
      </div>
      {pedido.pmra !== undefined && (
        <p style={{ fontSize: "0.8rem" }}>
          {tr(
            "Siguiendo su movimiento propio en cada foto: corrige el desplazamiento entre pasadas y durante los 43–55 días de cada escaneo, evitando perder brillo en la apertura y el corrimiento aparente de longitud de onda en el filtro lineal variable (LVF).",
            "Following its proper motion in every photo: corrects the position shift across passes and during the 43–55 days of each scan, preventing aperture flux loss and apparent wavelength drift on the Linear Variable Filter (LVF).",
          )}
        </p>
      )}

      {estado.fase === "cargando" && (
        <p>
          {tr(
            `Midiendo su brillo en hasta ${MAX_PUNTOS} fotos de SPHEREx (IRSA): suele tardar 10–20 s… ${segundos} s`,
            `Measuring its brightness in up to ${MAX_PUNTOS} SPHEREx photos (IRSA): usually 10–20 s… ${segundos} s`,
          )}
        </p>
      )}
      {estado.fase === "error" && (
        <p role="alert">
          {tr("No se pudo traer el espectro", "Could not get the spectrum")} ({enIdioma(estado.error, idioma)}).{" "}
          <button type="button" onClick={reintentar}>
            {tr("Reintentar", "Retry")}
          </button>
        </p>
      )}

      {puntos.length > 0 && (
        <>
          <Grafico puntos={puntos} />
          <p style={{ fontSize: "0.8rem" }}>
            {tr(
              `${puntos.length} fotos medidas (● medida; ▽ más débil que el ruido, límite superior). Color = banda D1–D6.`,
              `${puntos.length} photos measured (● measurement; ▽ fainter than the noise, upper limit). Color = band D1–D6.`,
            )}
            {nSat > 0 &&
              tr(
                ` ${nSat} fotos no se midieron porque el objeto las satura.`,
                ` ${nSat} photos were skipped because the object saturates them.`,
              )}
          </p>
        </>
      )}
      {estado.fase === "listo" && puntos.length === 0 && (
        <p>
          {tr(
            "SPHEREx no tiene fotos medibles en este punto (fuera de la cobertura, en el borde del detector o saturado).",
            "SPHEREx has no measurable photos at this spot (outside coverage, at the detector edge or saturated).",
          )}
        </p>
      )}
      {pendientes > 0 && (
        <p>
          {tr(
            `Faltan ${pendientes} fotos que no alcanzaron a medirse.`,
            `${pendientes} photos could not be measured in time.`,
          )}{" "}
          <button type="button" onClick={seguir}>
            {tr("Seguir cargando", "Keep loading")}
          </button>
        </p>
      )}

      {c && estado.fase !== "cargando" && (
        <div className={`ficha ficha-${c.tipo}`} style={{ marginTop: 8 }}>
          <h4>{ficha.titulo}</h4>
          <p className="ficha-tipo">
            {c.tipo === "indeterminado" ? (
              ficha.indeterminado
            ) : (
              <>
                {ficha.seParece} <strong>{ficha.tipos[c.tipo]}</strong>
              </>
            )}
            {c.tipo !== "indeterminado" && <span className="ficha-conf">{ficha.confianza[c.confianza]}</span>}
          </p>
          <p className="ficha-motivo">
            {c.tipo === "indeterminado" ? "" : `${ficha.porque} `}
            {c.motivo}
          </p>
          <p className="h-nota">
            {tr(
              "Orientativo: reglas simples sobre la forma del espectro, con fotometría indicativa (no científica). La apertura es de 12″: en un campo lleno de estrellas puede sumar la luz de una vecina. Un candidato se confirma con otros datos: el movimiento en WiseView y, al final, espectroscopía.",
              "Indicative only: simple rules on the spectrum's shape, with indicative (not science-grade) photometry. The aperture is 12″: in a crowded field it can include light from a neighbour. A candidate is confirmed with other data: its motion in WiseView and, in the end, spectroscopy.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
