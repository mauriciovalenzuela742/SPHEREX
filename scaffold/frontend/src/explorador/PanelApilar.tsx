/**
 * Modo «Apilar» del explorador (V2, Juan Pablo): una visita sola, el apilado quieto y el apilado siguiendo
 * el movimiento propio del objeto, lado a lado y a la misma escala, con el ruido del fondo medido antes y después.
 * Cálculo en apilar.ts. Usa los fotogramas que el explorador ya cargó (no descarga nada).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useIdioma } from "../state/idioma";
import { apilarVisitas, escalaApilado, objetoEn, pintar, type Apilado, type Metodo, type Punto } from "./apilar";
import { clave, type DatosSpherex } from "./useDatosSpherex";
import type { Frame } from "./render";

/** Centro de los fotogramas = la posición pedida, que el visor mantiene en la URL (state/url.ts). */
function centroPedido(): { ra: number; dec: number } | null {
  const q = new URLSearchParams(window.location.search);
  const ra = Number(q.get("ra"));
  const dec = Number(q.get("dec"));
  return q.has("ra") && q.has("dec") && Number.isFinite(ra) && Number.isFinite(dec) ? { ra, dec } : null;
}

const RECORTES = [17, 31, 0]; // lado de la zona central en píxeles; 0 = el fotograma entero

export default function PanelApilar({ datos }: { datos: DatosSpherex }) {
  const { tr, idioma } = useIdioma();
  const { grid, banda, visitas, frames, version } = datos;
  const [metodo, setMetodo] = useState<Metodo>("promedio");
  const [recorte, setRecorte] = useState(RECORTES[1]);
  const fmt = (x: number | null, d = 1) => (x === null || !Number.isFinite(x) ? "—" : idioma === "en" ? x.toFixed(d) : x.toFixed(d).replace(".", ","));

  const centro = centroPedido();
  const objeto = useMemo(() => (centro ? objetoEn(centro.ra, centro.dec) : null), [centro?.ra, centro?.dec]); // eslint-disable-line react-hooks/exhaustive-deps
  const ap: Apilado | null = useMemo(() => {
    if (!grid || !banda || !centro) return null;
    const fs = visitas.map((_, v) => frames.current.get(clave(banda, v))).filter((f): f is Frame => Boolean(f));
    return apilarVisitas(fs, centro.ra, centro.dec, grid.pixel_scale_arcsec, objeto, metodo);
    // `version` sube con cada fotograma que llega: es lo que obliga a recalcular.
  }, [grid, banda, visitas, version, metodo, objeto, centro?.ra, centro?.dec]); // eslint-disable-line react-hooks/exhaustive-deps

  const m = ap ? (recorte && recorte < ap.n ? recorte : ap.n) : 0;
  const esc = ap ? escalaApilado(ap) : null;
  const ganancia = ap && ap.ruidoQuieto > 0 ? ap.ruidoUna / ap.ruidoQuieto : null;
  const gananciaAleatoria = ap?.aleatorioUna && ap.aleatorioApilado ? ap.aleatorioUna / ap.aleatorioApilado : null;
  const nombre = objeto?.nombre ?? "";
  const pmAnual = objeto ? Math.hypot(objeto.pmra, objeto.pmdec) / 1000 : 0;
  const pxAnual = grid ? pmAnual / grid.pixel_scale_arcsec : 0;
  const cargadas = ap?.nVisitas ?? 0;

  if (!grid) return null;
  return (
    <div className="apl">
      <div className="apl-paneles">
        <Panel titulo={tr("Una visita", "One visit")} sub={ap ? ap.fechaComun.slice(0, 10) : ""} arr={ap?.una} n={ap?.n ?? 0} m={m} esc={esc}
          marcas={ap?.enUna ? [ap.enUna] : []} />
        <Panel titulo={tr("Apilado quieto", "Static stack")} sub={tr(`${cargadas} visitas`, `${cargadas} visits`)} arr={ap?.quieto} n={ap?.n ?? 0} m={m} esc={esc}
          marcas={ap?.recorrido ?? []} trazo />
        <Panel titulo={tr("Siguiendo el movimiento", "Following the motion")} sub={objeto ? nombre : tr("sin objeto que se mueva", "no moving object")}
          arr={ap?.siguiendo ?? undefined} n={ap?.n ?? 0} m={m} esc={esc} marcas={ap?.comun ? [ap.comun] : []}
          vacio={tr("Elige un objeto que se mueve (Barnard, eps Ind B, WISE 0855): sin su movimiento propio no hay a quién seguir.",
            "Pick a moving object (Barnard, eps Ind B, WISE 0855): without its proper motion there is nothing to follow.")} />
      </div>

      <p className="apl-leyenda">
        {tr("Si el objeto se mueve, se ve nítido solo cuando seguimos su movimiento. Apilar todas las visitas baja el ruido; en el apilado quieto las estrellas fijas salen nítidas y lo que se movió queda alargado. Siguiendo el movimiento es al revés. Así se encuentran objetos que se mueven y son demasiado débiles para una sola foto.",
          "If the object moves, it is sharp only when we follow its motion. Stacking all visits lowers the noise; in the static stack fixed stars are sharp and whatever moved is smeared. Following the motion it is the other way round. This is how moving objects too faint for a single image are found.")}
      </p>

      {ap ? (
        <table className="apl-tabla">
          <thead>
            <tr><th />{[tr("Una visita", "One visit"), tr("Quieto", "Static"), tr("Siguiendo", "Following")].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <th title={tr("Desviación robusta del fondo (1,4826·MAD, sin fuentes), en MJy/sr", "Robust background scatter (1.4826·MAD, sources clipped), MJy/sr")}>{tr("Ruido del fondo", "Background noise")}</th>
              <td>{fmt(ap.ruidoUna, 3)}</td><td>{fmt(ap.ruidoQuieto, 3)}</td><td>{fmt(ap.ruidoSiguiendo, 3)}</td>
            </tr>
            <tr>
              <th title={tr("Sin la estructura fija del cielo: resta de dos visitas (÷√2) y resta de dos mitades del apilado (÷2)", "Without the fixed sky structure: difference of two visits (÷√2) and of two halves of the stack (÷2)")}>{tr("Ruido aleatorio", "Random noise")}</th>
              <td>{fmt(ap.aleatorioUna, 3)}</td><td>{fmt(ap.aleatorioApilado, 3)}</td><td>≈</td>
            </tr>
            {objeto && (
              <tr>
                <th title={tr("Suma en 3×3 píxeles donde predice el movimiento propio, sobre su ruido", "Sum in 3×3 pixels where proper motion predicts it, over its noise")}>{tr(`S/N de ${nombre}`, `S/N of ${nombre}`)}</th>
                <td>{fmt(ap.snUna)}</td><td>{fmt(ap.snQuieto)}</td><td>{fmt(ap.snSiguiendo)}</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <p className="apl-leyenda">{tr("Hacen falta al menos dos visitas cargadas de esta banda.", "At least two loaded visits of this band are needed.")}</p>
      )}
      {ap && (
        <p className="apl-nota">
          {tr(`Con ${ap.nVisitas} visitas el ruido aleatorio baja ${fmt(gananciaAleatoria)}× (lo ideal es √${ap.nVisitas} = ${fmt(Math.sqrt(ap.nVisitas))}×); el del fondo medido, ${fmt(ganancia)}×, porque incluye estrellas débiles fijas que no se promedian. `,
            `With ${ap.nVisitas} visits the random noise drops ${fmt(gananciaAleatoria)}× (ideal √${ap.nVisitas} = ${fmt(Math.sqrt(ap.nVisitas))}×); the measured background, ${fmt(ganancia)}×, because it includes faint fixed stars that do not average out. `)}
          {objeto && tr(`${nombre} se mueve ${fmt(pmAnual)}″/año = ${fmt(pxAnual, 2)} píxeles/año; el corrimiento más grande fue ${fmt(ap.corrimientoMax, 2)} px. Época común: ${ap.fechaComun.slice(0, 10)}.`,
            `${nombre} moves ${fmt(pmAnual)}″/yr = ${fmt(pxAnual, 2)} pixels/yr; the largest shift was ${fmt(ap.corrimientoMax, 2)} px. Common epoch: ${ap.fechaComun.slice(0, 10)}.`)}
          {objeto && pxAnual < 1 && tr(" Se mueve menos de un píxel por año: la diferencia entre los dos apilados es sutil.", " It moves less than one pixel per year: the difference between the two stacks is subtle.")}
          {objeto && pxAnual >= 1 && tr(" Incluso dentro de una misma pasada de escaneo (43–55 días mientras el filtro LVF recorre los colores), un astro rápido se desplaza 0,6″–1,6″ (0,10–0,25 px), por lo que seguir su movimiento evita perder hasta un 18 % de señal en bandas cortas.", " Even within a single scan pass (43–55 days while the LVF sweeps across wavelengths), a fast mover shifts by 0.6″–1.6″ (0.10–0.25 px), so tracking its motion prevents losing up to 18% of short-band signal.")}
        </p>
      )}

      <div className="apl-controles">
        <div className="exp-modos" role="group" aria-label={tr("Cómo combinar", "How to combine")}>
          {(["promedio", "mediana"] as Metodo[]).map((x) => (
            <button key={x} aria-pressed={metodo === x} onClick={() => setMetodo(x)}>
              {x === "promedio" ? tr("Promedio", "Mean") : tr("Mediana", "Median")}
            </button>
          ))}
        </div>
        <div className="exp-modos" role="group" aria-label={tr("Zona que se muestra", "Area shown")}>
          {RECORTES.map((r) => (
            <button key={r} aria-pressed={recorte === r} onClick={() => setRecorte(r)}>
              {r ? `${tr("centro", "centre")} ${fmt((r * grid.pixel_scale_arcsec) / 60)}′` : tr("todo", "all")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panel(props: {
  titulo: string;
  sub: string;
  arr?: Float32Array;
  n: number;
  m: number;
  esc: { vmin: number; vmax: number } | null;
  marcas: Punto[];
  trazo?: boolean;
  vacio?: string;
}) {
  const c = useRef<HTMLCanvasElement>(null);
  const { arr, n, m, esc } = props;
  useEffect(() => {
    if (c.current && arr && esc && m) pintar(c.current, arr, n, m, esc);
  }, [arr, n, m, esc]);
  // Marcas en coordenadas del recorte (0..m), con el norte arriba.
  const o0 = Math.floor((n - m) / 2);
  const pts = props.marcas.map((p) => ({ x: p.x - o0 + 0.5, y: m - (p.y - o0 + 0.5) }));
  return (
    <figure className="apl-panel">
      <div className="apl-lienzo">
        {arr ? <canvas ref={c} aria-label={props.titulo} /> : <p className="apl-vacio">{props.vacio}</p>}
        {arr && m > 0 && pts.length > 0 && (
          <svg viewBox={`0 0 ${m} ${m}`} aria-hidden="true">
            {/* Anillo alrededor de donde predice el movimiento propio (sin tapar el objeto); en el quieto abarca
                todo el recorrido y una flecha bajo él marca el sentido, de la primera visita a la última. */}
            {(() => {
              const cx = (Math.min(...pts.map((p) => p.x)) + Math.max(...pts.map((p) => p.x))) / 2;
              const cy = (Math.min(...pts.map((p) => p.y)) + Math.max(...pts.map((p) => p.y))) / 2;
              const r = 2.2 + Math.max(...pts.map((p) => Math.hypot(p.x - cx, p.y - cy)));
              const a = pts[0];
              const z = pts[pts.length - 1];
              return (
                <>
                  <circle cx={cx} cy={cy} r={r} className="anillo" />
                  {props.trazo && pts.length > 1 && (
                    <polyline className="flecha" points={`${a.x},${a.y + r + 1} ${z.x},${z.y + r + 1}`} markerEnd="url(#apl-punta)" />
                  )}
                </>
              );
            })()}
            <defs>
              <marker id="apl-punta" viewBox="0 0 4 4" refX="2" refY="2" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M0,0 L4,2 L0,4 z" className="punta" />
              </marker>
            </defs>
          </svg>
        )}
        <span className="apl-orient">N↑ E←</span>
      </div>
      <figcaption><strong>{props.titulo}</strong><span>{props.sub}</span></figcaption>
    </figure>
  );
}
