/**
 * Modo «Limpiar estrellas» del explorador (V2): resta espectral B5–6 − α·B1–3 sobre las pilas por pasada del campo
 * de WISE 0855 (PR #58, eda/huella_espectral/limpieza_fondo.py). Las estrellas tienen casi la misma razón
 * largo/corto (cola de Rayleigh-Jeans), así que restar α veces la imagen corta las borra; una enana Y casi no emite en
 * B1–B3 y queda. α se calibra con las estrellas del propio campo, sin catálogos ni ajuste de PSF.
 * Datos precalculados (`public/precalc/huella/limpieza_wise_0855.json`): no descarga fotogramas.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useIdioma } from "../state/idioma";
import { pintar } from "./apilar";
import { esLimpieza, useHuella, type Limpieza, type PasadaLimpieza } from "../huella/precalc";

type Esc = { vmin: number; vmax: number };
// Subpíxeles de 3,075″ (medio píxel de SPHEREx). Se abre con todo el recorte: así se ve que las otras estrellas
// del campo desaparecen; el centro amplía la mezcla.
const RECORTES = [41, 15];
const MESES = { es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
/** «abr–may 2026» a partir de las fechas de inicio y fin de la pasada (AAAA-MM-DD). */
function mesesDe(desde: string, hasta: string, idioma: string): string {
  const m = idioma === "en" ? MESES.en : MESES.es;
  const a = m[Number(desde.slice(5, 7)) - 1], z = m[Number(hasta.slice(5, 7)) - 1];
  const y0 = desde.slice(0, 4), y1 = hasta.slice(0, 4);
  return a === z && y0 === y1 ? `${a} ${y0}` : y0 === y1 ? `${a}–${z} ${y1}` : `${a} ${y0}–${z} ${y1}`;
}

function aArreglo(v: (number | null)[]): Float32Array {
  return Float32Array.from(v, (x) => (x === null ? NaN : x));
}

/** Escala robusta: desde −2σ del fondo (MAD) hasta el percentil 99,8. */
function escalaDe(a: Float32Array): Esc {
  const v = Array.from(a).filter(Number.isFinite).sort((p, q) => p - q);
  if (!v.length) return { vmin: 0, vmax: 1 };
  const q = (f: number) => v[Math.min(v.length - 1, Math.floor(f * v.length))];
  const med = q(0.5);
  const mad = v.map((x) => Math.abs(x - med)).sort((p, r) => p - r)[Math.floor(v.length / 2)];
  const sig = 1.4826 * mad;
  const vmin = med - 2 * sig;
  const vmax = Math.max(q(0.998), vmin + 1e-6);
  return { vmin, vmax };
}

export default function PanelLimpieza() {
  const { tr, idioma } = useIdioma();
  const d = useHuella<Limpieza>("limpieza_wise_0855", esLimpieza);
  const [p, setP] = useState(3);
  const [m, setM] = useState(RECORTES[0]);
  const fmt = (x: number, k = 2) => (idioma === "en" ? x.toFixed(k) : x.toFixed(k).replace(".", ","));

  const pas = d?.pasadas.find((x) => x.pasada === p) ?? null;
  const img = useMemo(() => {
    if (!pas) return null;
    const corto = aArreglo(pas.corto);
    const largo = aArreglo(pas.largo);
    const limpio = aArreglo(pas.limpio);
    // Largo y limpio comparten escala: así se ve cuánto se borró. El corto tiene la suya.
    return { corto, largo, limpio, escCorto: escalaDe(corto), escLargo: escalaDe(largo) };
  }, [pas]);

  if (!d) return <div className="lmp"><p className="apl-leyenda">{tr("Cargando la limpieza…", "Loading the cleaning…")}</p></div>;
  const n = d.n;
  const alpha = fmt(d.alpha, 4);
  const predicha = d.sep_predicha[String(p)];

  return (
    <div className="lmp">
      <p className="lmp-titulo">
        <strong>{tr("WISE 0855 · limpieza espectral de estrellas", "WISE 0855 · spectral star cleaning")}</strong>{" "}
        <span>{tr("datos reales de SPHEREx apilados por pasada, sin catálogos", "real SPHEREx data stacked per pass, no catalogues")}</span>
      </p>
      <div className="exp-modos lmp-pasadas" role="group" aria-label={tr("Pasada", "Pass")}>
        {d.pasadas.map((x) => (
          <button key={x.pasada} aria-pressed={x.pasada === p} onClick={() => setP(x.pasada)}>
            P{x.pasada} · {mesesDe(x.desde, x.hasta, idioma)}
          </button>
        ))}
      </div>

      {pas && img && (
        <div className="apl-paneles">
          <Panel arr={img.corto} n={n} m={m} esc={img.escCorto} pas={pas} marca="ninguna"
            titulo={tr("Bandas cortas B1–B3", "Short bands B1–B3")} sub={tr("0,75–2,42 µm", "0.75–2.42 µm")}
            pie={tr("Solo se ven estrellas: WISE 0855 casi no emite aquí.", "Only stars show: WISE 0855 barely emits here.")} />
          <Panel arr={img.largo} n={n} m={m} esc={img.escLargo} pas={pas} marca="raw_largo"
            titulo={tr("Bandas largas B5–B6, crudas", "Long bands B5–B6, raw")} sub={tr("3,82–5,00 µm", "3.82–5.00 µm")}
            pie={tr(`Centroide a ${fmt(pas.pos.raw_largo.sep)}″ de la estrella: la mezcla lo arrastra.`, `Centroid ${fmt(pas.pos.raw_largo.sep)}″ from the star: the blend drags it.`)} />
          <Panel arr={img.limpio} n={n} m={m} esc={img.escLargo} pas={pas} marca="spec_clean"
            titulo={tr(`Limpia: B5–6 − ${alpha}·B1–3`, `Cleaned: B5–6 − ${alpha}·B1–3`)} sub={tr("misma escala que la cruda", "same scale as raw")}
            pie={tr(`WISE 0855 a ${fmt(pas.pos.spec_clean.sep)}″ de la estrella (predicho ${fmt(predicha)}″).`, `WISE 0855 at ${fmt(pas.pos.spec_clean.sep)}″ from the star (predicted ${fmt(predicha)}″).`)} />
        </div>
      )}

      <p className="lmp-marcas">
        <span className="lmp-m-est" /> {tr("estrella vecina", "neighbouring star")}
        <span className="lmp-m-obj" /> {tr("WISE 0855 (donde se midió)", "WISE 0855 (where measured)")}
      </p>
      <p className="apl-leyenda">
        {tr(
          `Las estrellas brillan en las bandas largas casi en la misma proporción que en las cortas (α = ${alpha} ± ${fmt(d.err_alpha, 4)}, medido con las estrellas de este mismo campo). Restar α veces la imagen corta las borra. WISE 0855 es una enana marrón muy fría que casi no emite bajo 3,5 µm: la resta no la toca. En la pasada 3 (abril–mayo de 2026) está a menos de un píxel de una estrella y en la imagen cruda se funden.`,
          `Stars shine in the long bands in almost the same proportion as in the short ones (α = ${alpha} ± ${fmt(d.err_alpha, 4)}, measured on the stars of this same field). Subtracting α times the short image erases them. WISE 0855 is a very cold brown dwarf that barely emits below 3.5 µm: the subtraction leaves it untouched. In pass 3 (April–May 2026) it sits less than one pixel from a star and in the raw image they merge.`,
        )}
      </p>

      <table className="apl-tabla lmp-tabla">
        <thead>
          <tr>
            <th />
            {d.pasadas.map((x) => <th key={x.pasada}>P{x.pasada}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th title={tr("Separación medida entre WISE 0855 y la estrella vecina", "Measured separation between WISE 0855 and the neighbouring star")}>{tr("Separación, larga cruda", "Separation, raw long")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.pos.raw_largo.sep)}″</td>)}
          </tr>
          <tr>
            <th title={tr("Ajustando y restando las estrellas quietas con su PSF", "Fitting and subtracting the static stars with their PSF")}>{tr("Separación, resta PSF", "Separation, PSF subtraction")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.pos.psf_clean.sep)}″</td>)}
          </tr>
          <tr className="lmp-destacada">
            <th>{tr("Separación, limpia (B5–6 − α·B1–3)", "Separation, cleaned (B5–6 − α·B1–3)")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.pos.spec_clean.sep)}″</td>)}
          </tr>
          <tr>
            <th title={tr("Movimiento propio + paralaje", "Proper motion + parallax")}>{tr("Separación predicha", "Predicted separation")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(d.sep_predicha[String(x.pasada)])}″</td>)}
          </tr>
          <tr>
            <th title={tr("Cuánto baja la RMS de las estrellas quietas aisladas frente a la imagen larga cruda (misma banda)", "How much the RMS of isolated static stars drops vs the raw long image (same band)")}>{tr("Estrellas atenuadas, resta espectral", "Stars dimmed, spectral subtraction")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.supresion.vs_largo)}×</td>)}
          </tr>
          <tr>
            <th title={tr("Lo mismo, ajustando y restando cada estrella con su PSF", "Same, fitting and subtracting each star with its PSF")}>{tr("Estrellas atenuadas, resta PSF", "Stars dimmed, PSF subtraction")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.supresion.psf)}×</td>)}
          </tr>
          <tr>
            <th title={tr("Relación señal/ruido integrada de WISE 0855 en la imagen limpia", "Integrated signal-to-noise of WISE 0855 in the cleaned image")}>{tr("S/N de WISE 0855, limpia", "WISE 0855 S/N, cleaned")}</th>
            {d.pasadas.map((x) => <td key={x.pasada}>{fmt(x.pos.spec_clean.snr_int, 1)}</td>)}
          </tr>
        </tbody>
      </table>
      <p className="apl-nota">
        {tr(
          "Límites: α es uno solo para todo el campo; una estrella muy roja o variable deja residuo. La resta PSF atenúa más las estrellas; la espectral no necesita modelo y ubica mejor a WISE 0855. Calculado para WISE 0855, el caso que más lo necesita; en los otros objetos no se aplicó.",
          "Limits: α is a single value for the whole field; a very red or variable star leaves a residual. PSF subtraction dims the stars more; the spectral one needs no model and places WISE 0855 better. Computed for WISE 0855, the case that needs it most; it was not applied to the other objects.",
        )}
      </p>
      <div className="apl-controles">
        <div className="exp-modos" role="group" aria-label={tr("Zona que se muestra", "Area shown")}>
          {RECORTES.map((r) => (
            <button key={r} aria-pressed={m === r} onClick={() => setM(r)}>
              {r < n ? `${tr("centro", "centre")} ${Math.round(r * d.escala_arcsec)}″` : tr("todo", "all")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel(props: {
  arr: Float32Array;
  n: number;
  m: number;
  esc: Esc;
  pas: PasadaLimpieza;
  marca: "ninguna" | "raw_largo" | "spec_clean";
  titulo: string;
  sub: string;
  pie: string;
}) {
  const c = useRef<HTMLCanvasElement>(null);
  const { arr, n, m, esc, pas, marca } = props;
  useEffect(() => {
    if (c.current) pintar(c.current, arr, n, m, esc);
  }, [arr, n, m, esc]);
  // Coordenadas del recorte (0..m) con el norte arriba, como pintar().
  const o0 = Math.floor((n - m) / 2);
  const aRec = (x: number, y: number) => ({ x: x - o0 + 0.5, y: m - (y - o0 + 0.5) });
  const est = aRec(pas.vecina_xy[0], pas.vecina_xy[1]);
  const obj = marca === "ninguna" ? aRec(pas.pos.spec_clean.x, pas.pos.spec_clean.y) : aRec(pas.pos[marca].x, pas.pos[marca].y);
  const r = Math.max(0.9, m / 22);
  return (
    <figure className="apl-panel">
      <div className="apl-lienzo">
        <canvas ref={c} aria-label={props.titulo} />
        <svg viewBox={`0 0 ${m} ${m}`} aria-hidden="true">
          <circle cx={est.x} cy={est.y} r={r} className="lmp-estrella" />
          <circle cx={obj.x} cy={obj.y} r={r} className={marca === "ninguna" ? "lmp-ausente" : "anillo"} />
        </svg>
        <span className="apl-orient">N↑ E←</span>
      </div>
      <figcaption>
        <strong>{props.titulo}</strong>
        <span>{props.sub}</span>
        <span className="lmp-pie">{props.pie}</span>
      </figcaption>
    </figure>
  );
}
