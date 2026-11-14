/**
 * Selector de longitud de onda en acordeón. Dueño: Juan Pablo (V2). Tarea #18; reemplaza a `LambdaSlider`
 * (que queda como respaldo). Port a React de `docs/diseno/maqueta_acordeon_lambda.html`.
 *
 * - Gráfico SVG: eje x = λ (0,75–5 µm), eje y = respuesta ilustrativa; los 102 canales como curvas por banda.
 * - Clic en una banda (botón o su nombre en el gráfico): se expande (~450 ms) y se ven sus 17 canales. Otro clic
 *   la cierra.
 * - Clic en el gráfico: elige el canal más cercano (el cielo pasa a ese plano). Arrastrar: elige un tramo, que
 *   puede cruzar bandas; el cielo pasa al primer canal del tramo y «Recorrer» lo pasa por cada canal (~0,8 s).
 * - Si `plano` cambia desde fuera (selector «Bandas» del visor), el acordeón marca ese canal.
 *
 * λ: las del `properties` del cubo (`leerPlanos`). Si no se pueden leer, o para los planos 50 y 51 (vacíos, que
 * `leerPlanos` descarta), se usan las de la maqueta, que salen del mismo `properties` (14-nov-2026).
 * Ancho de cada curva: λ/R con R por banda de la literatura (sin verificar); altura ilustrativa.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as PE, type ReactElement } from "react";
import { bandaDePlano, leerPlanos, PLANOS_VACIOS } from "./planos";

type Props = {
  /** Plano activo (0–101). */
  plano: number;
  /** Se llama cuando el usuario (o el recorrido) elige otro plano. */
  onPlano: (plano: number) => void;
  /** URL del HiPS, para leer su `properties`. */
  survey: string;
};

// λ (µm) por banda y canal, de la maqueta (data_cube_crval3_arr redondeado a 2 decimales). Respaldo.
const L_RESPALDO = [
  [0.75, 0.77, 0.79, 0.81, 0.83, 0.85, 0.87, 0.89, 0.91, 0.93, 0.95, 0.98, 1.0, 1.02, 1.05, 1.07, 1.1],
  [1.11, 1.14, 1.17, 1.2, 1.22, 1.25, 1.28, 1.31, 1.35, 1.38, 1.41, 1.45, 1.48, 1.52, 1.55, 1.59, 1.63],
  [1.66, 1.7, 1.74, 1.77, 1.82, 1.86, 1.91, 1.95, 2.0, 2.04, 2.09, 2.14, 2.19, 2.24, 2.29, 2.35, 2.4],
  [2.44, 2.51, 2.58, 2.65, 2.72, 2.79, 2.87, 2.95, 3.03, 3.12, 3.2, 3.29, 3.38, 3.48, 3.57, 3.67, 3.77],
  [3.83, 3.87, 3.9, 3.94, 3.97, 4.0, 4.04, 4.08, 4.11, 4.15, 4.18, 4.22, 4.26, 4.29, 4.33, 4.37, 4.41],
  [4.43, 4.47, 4.5, 4.53, 4.57, 4.6, 4.63, 4.67, 4.7, 4.74, 4.77, 4.81, 4.84, 4.88, 4.92, 4.95, 4.99],
].flat();

/** Poder de resolución R por banda (literatura, sin verificar) y altura ilustrativa de las curvas. */
const R = [39, 41, 41, 35, 112, 128];
const H = [0.55, 0.75, 0.85, 0.8, 0.65, 0.6];
const COL = ["#a39cf0", "#6aa8ec", "#3cc79a", "#8cc152", "#e0a33a", "#ef7b52"];

const VB_W = 680;
const VB_H = 270;
const X0 = 36;
const X1 = 672;
const Y0 = 215;
const Y1 = 30;
const DURACION_MS = 450;
const PASO_RECORRIDO_MS = 800;

const BANDAS = [0, 1, 2, 3, 4, 5];
const vacio = (p: number) => PLANOS_VACIOS.includes(p);
const rotuloCanal = (p: number) => `${bandaDePlano(p)}.${(p % 17) + 1}`;

type Fuente = { tipo: "cargando" } | { tipo: "cubo" } | { tipo: "respaldo"; motivo: string };

const caja: CSSProperties = {
  marginTop: "0.5rem",
  padding: "0.5rem 0.75rem",
  border: "1px solid var(--borde)",
  borderRadius: 8,
  background: "var(--panel)",
  color: "var(--texto)",
  fontSize: "0.9rem",
};
const pastilla: CSSProperties = {
  fontSize: "0.8rem",
  padding: "0.15rem 0.6rem",
  borderRadius: 6,
  background: "var(--fondo)",
  border: "1px solid var(--borde)",
};
const botonChico: CSSProperties = { fontSize: "0.8rem", padding: "0.2rem 0.6rem" };

export default function SelectorLambda({ plano, onPlano, survey }: Props) {
  const [lam, setLam] = useState<number[]>(L_RESPALDO);
  const [fuente, setFuente] = useState<Fuente>({ tipo: "cargando" });
  const [w, setW] = useState<number[]>([1, 1, 1, 1, 1, 1]);
  const [abierta, setAbierta] = useState(0); // 0 = ninguna; 1–6 = banda
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [recorrido, setRecorrido] = useState<number[] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const anim = useRef<number | null>(null);
  const wRef = useRef(w);
  wRef.current = w;
  const inicio = useRef<{ l: number; px: number } | null>(null);
  // Último plano que emitió este componente: si `plano` cambia a otro, el cambio vino de fuera.
  const emitido = useRef(plano);
  const onPlanoRef = useRef(onPlano);
  onPlanoRef.current = onPlano;

  // λ reales del cubo.
  useEffect(() => {
    let vigente = true;
    setFuente({ tipo: "cargando" });
    leerPlanos(survey)
      .then((planos) => {
        if (!vigente) return;
        const nuevas = L_RESPALDO.slice();
        for (const p of planos) if (p.indice >= 0 && p.indice < nuevas.length) nuevas[p.indice] = p.lambdaUm;
        setLam(nuevas);
        setFuente({ tipo: "cubo" });
      })
      .catch((e: unknown) => {
        if (vigente) setFuente({ tipo: "respaldo", motivo: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      vigente = false;
    };
  }, [survey]);

  useEffect(() => () => {
    if (anim.current !== null) cancelAnimationFrame(anim.current);
  }, []);

  // Límites de cada banda en λ: a medio camino entre el último canal de una y el primero de la siguiente.
  const { lo, hi } = useMemo(() => {
    const lo = BANDAS.map((b) => (b === 0 ? lam[0] - 0.02 : (lam[17 * b - 1] + lam[17 * b]) / 2));
    const hi = BANDAS.map((b) => (b === 5 ? lam[101] + 0.03 : (lam[17 * b + 16] + lam[17 * b + 17]) / 2));
    return { lo, hi };
  }, [lam]);

  const tot = w.reduce((a, c) => a + c, 0);
  const sx = (l: number) => {
    let x = X0;
    for (let b = 0; b < 6; b++) {
      const s = ((X1 - X0) * w[b]) / tot;
      if (l <= hi[b] || b === 5) return x + s * Math.min(1, Math.max(0, (l - lo[b]) / (hi[b] - lo[b])));
      x += s;
    }
    return X1;
  };
  const lx = (px: number) => {
    let x = X0;
    for (let b = 0; b < 6; b++) {
      const s = ((X1 - X0) * w[b]) / tot;
      if (px <= x + s || b === 5) return lo[b] + (hi[b] - lo[b]) * Math.min(1, Math.max(0, (px - x) / s));
      x += s;
    }
    return hi[5];
  };
  const sy = (v: number) => Y0 - v * (Y0 - Y1);

  const emitir = (p: number) => {
    emitido.current = p;
    onPlanoRef.current(p);
  };

  const abrir = (b: number, forzar = false) => {
    const nueva = !forzar && abierta === b ? 0 : b;
    setAbierta(nueva);
    const wt = BANDAS.map((i) => (nueva ? (i === nueva - 1 ? 9 : 0.6) : 1));
    if (anim.current !== null) cancelAnimationFrame(anim.current);
    const w0 = wRef.current.slice();
    const t0 = performance.now();
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / DURACION_MS);
      const e = 1 - Math.pow(1 - k, 3);
      setW(w0.map((v, i) => v + (wt[i] - v) * e));
      anim.current = k < 1 ? requestAnimationFrame(paso) : null;
    };
    anim.current = requestAnimationFrame(paso);
  };

  // Cambio de plano desde fuera (selector «Bandas»): se marca ese canal y, si hay una banda abierta, se abre la suya.
  useEffect(() => {
    if (plano === emitido.current) return;
    emitido.current = plano;
    setRecorrido(null);
    setSel([lam[plano], lam[plano]]);
    const b = bandaDePlano(plano);
    if (abierta && abierta !== b) abrir(b, true);
    // Solo reacciona al plano pedido desde fuera.
  }, [plano]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Canales con imagen dentro del tramo [a, z] de λ, en orden de λ. */
  const canalesEn = (a: number, z: number) => {
    const r: number[] = [];
    for (let p = 0; p < 102; p++) if (!vacio(p) && lam[p] >= a - 1e-9 && lam[p] <= z + 1e-9) r.push(p);
    return r;
  };
  const elegidos = sel ? canalesEn(sel[0], sel[1]) : [];

  /** Canal con imagen más cercano, en píxeles, a la posición px del gráfico. */
  const masCercano = (px: number) => {
    let mejor = -1;
    let dist = Infinity;
    for (let p = 0; p < 102; p++) {
      if (vacio(p)) continue;
      const d = Math.abs(sx(lam[p]) - px);
      if (d < dist) {
        dist = d;
        mejor = p;
      }
    }
    return mejor;
  };

  const pxDe = (e: PE<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * VB_W;
  };

  const alBajar = (e: PE<SVGSVGElement>) => {
    const px = pxDe(e);
    inicio.current = { l: lx(px), px };
    setRecorrido(null);
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const alMover = (e: PE<SVGSVGElement>) => {
    if (!inicio.current) return;
    const px = pxDe(e);
    if (Math.abs(px - inicio.current.px) < 4) return;
    const l = lx(px);
    setSel([Math.min(inicio.current.l, l), Math.max(inicio.current.l, l)]);
  };
  const alSoltar = (e: PE<SVGSVGElement>) => {
    if (!inicio.current) return;
    const px = pxDe(e);
    const ini = inicio.current;
    inicio.current = null;
    if (Math.abs(px - ini.px) < 4) {
      // Clic: el canal más cercano.
      const p = masCercano(px);
      if (p < 0) return;
      setSel([lam[p], lam[p]]);
      emitir(p);
      return;
    }
    const l = lx(px);
    const tramo: [number, number] = [Math.min(ini.l, l), Math.max(ini.l, l)];
    setSel(tramo);
    const ps = canalesEn(tramo[0], tramo[1]);
    if (ps.length) emitir(ps[0]);
  };

  // Teclado: ← y → mueven el cielo un canal (saltando los vacíos).
  const alTecla = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const d = e.key === "ArrowRight" ? 1 : -1;
    let p = plano + d;
    while (p >= 0 && p < 102 && vacio(p)) p += d;
    if (p < 0 || p > 101) return;
    setRecorrido(null);
    setSel([lam[p], lam[p]]);
    emitir(p);
  };

  // Recorrido: un canal cada PASO_RECORRIDO_MS, una sola pasada.
  useEffect(() => {
    if (!recorrido) return;
    let i = 0;
    emitir(recorrido[0]);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= recorrido.length) {
        window.clearInterval(id);
        setRecorrido(null);
        return;
      }
      emitir(recorrido[i]);
    }, PASO_RECORRIDO_MS);
    return () => window.clearInterval(id);
  }, [recorrido]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Dibujo ----
  const fondo: ReactElement[] = [];
  const curvas: ReactElement[] = [];
  const textos: ReactElement[] = [];
  for (const b of BANDAS) {
    const a = sx(lo[b]);
    const z = sx(hi[b]);
    const an = z - a;
    const ex = abierta === b + 1;
    if (b % 2 === 0) fondo.push(<rect key={`f${b}`} x={a} y={Y1 - 22} width={z - a} height={Y0 - Y1 + 22} fill="#1b2340" />);
    for (let k = 0; k < 17; k++) {
      const p = 17 * b + k;
      const c = lam[p];
      if (vacio(p)) {
        if (ex)
          textos.push(
            <text key={`v${p}`} x={sx(c)} y={Y0 + 16} textAnchor="middle" fontSize={10} fill="#5a6286">
              vacío
            </text>,
          );
        // Canal vacío: curva punteada y apagada, no seleccionable.
      }
      const s = c / R[b] / 2.355;
      let d = "";
      // La curva se corta en los bordes de su banda: si no, al encogerse la banda vecina se estira sobre ella.
      for (let i = 0; i <= 30; i++) {
        const l = c - 3 * s + (6 * s * i) / 30;
        if (l < lo[b] || l > hi[b]) continue;
        d += `${d ? "L" : "M"}${sx(l).toFixed(1)} ${sy(H[b] * Math.exp(-((l - c) ** 2) / (2 * s * s))).toFixed(1)}`;
      }
      const on = !vacio(p) && elegidos.includes(p);
      const activo = p === plano;
      curvas.push(
        <path
          key={`c${p}`}
          d={d}
          fill="none"
          stroke={vacio(p) ? "#5a6286" : COL[b]}
          strokeWidth={activo ? 2.6 : on ? 1.8 : 1}
          strokeDasharray={vacio(p) ? "2 3" : undefined}
          opacity={vacio(p) ? 0.5 : sel && !on && !activo ? 0.3 : 0.9}
        />,
      );
      if (ex && !vacio(p)) {
        if (k % 2 === 0 || an > 400)
          textos.push(
            <text key={`r${p}`} x={sx(c)} y={Y0 + 16} textAnchor="middle" fontSize={10} fill={activo ? "#ffb000" : "#a9b3cf"}>
              {rotuloCanal(p)}
            </text>,
          );
        if (k % 4 === 0)
          textos.push(
            <text key={`l${p}`} x={sx(c)} y={Y0 + 30} textAnchor="middle" fontSize={10} fill="#6b7396">
              {c.toFixed(2)}
            </text>,
          );
      }
    }
    textos.push(
      <text
        key={`b${b}`}
        x={(a + z) / 2}
        y={Y1 - 8}
        textAnchor="middle"
        fontSize={12}
        fill={COL[b]}
        style={{ cursor: "pointer" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          abrir(b + 1);
        }}
      >
        {an > 90 ? `D${b + 1} · ${lam[17 * b].toFixed(2)}–${lam[17 * b + 16].toFixed(2)} µm` : `D${b + 1}`}
      </text>,
    );
    if (!abierta)
      textos.push(
        <text key={`m${b}`} x={sx((lam[17 * b] + lam[17 * b + 16]) / 2)} y={Y0 + 16} textAnchor="middle" fontSize={10} fill="#a9b3cf">
          {lam[17 * b + 8].toFixed(1)} µm
        </text>,
      );
  }

  // Resumen de la selección por banda.
  const porBanda = BANDAS.map((b) => elegidos.filter((p) => bandaDePlano(p) === b + 1)).filter((ps) => ps.length);
  const xa = sel ? sx(sel[0]) : 0;
  const xz = sel ? sx(sel[1]) : 0;
  const xActivo = sx(lam[plano] ?? lam[0]);

  return (
    <div style={caja}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          <strong style={{ marginRight: 4 }}>Longitud de onda</strong>
          {BANDAS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={abierta === b + 1}
              onClick={() => abrir(b + 1)}
              title={`Expandir la banda D${b + 1} (${lam[17 * b].toFixed(2)}–${lam[17 * b + 16].toFixed(2)} µm)`}
              style={{
                ...botonChico,
                borderColor: abierta === b + 1 ? COL[b] : undefined,
                color: abierta === b + 1 ? COL[b] : undefined,
              }}
            >
              D{b + 1}
            </button>
          ))}
        </div>
        <output aria-live="polite" style={{ fontVariantNumeric: "tabular-nums", color: "var(--acento)" }}>
          En el cielo: canal {rotuloCanal(plano)} · λ = {lam[plano]?.toFixed(2)} µm
        </output>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        tabIndex={0}
        aria-label="Canales de SPHEREx por longitud de onda. Clic para elegir un canal, arrastrar para elegir un tramo; flechas izquierda y derecha para cambiar de canal."
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={() => (inicio.current = null)}
        onKeyDown={alTecla}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          marginTop: 6,
          cursor: "crosshair",
          userSelect: "none",
          touchAction: "none",
          background: "var(--fondo)",
          borderRadius: 6,
        }}
      >
        <title>Ancho λ/R con R por banda de la literatura; altura ilustrativa</title>
        {fondo}
        {sel && <rect x={xa} y={Y1 - 22} width={Math.max(1.5, xz - xa)} height={Y0 - Y1 + 22} fill="#2a3360" />}
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="#3a4268" />
        <line x1={xActivo} x2={xActivo} y1={Y1 - 4} y2={Y0} stroke="#ffb000" strokeWidth={1} strokeDasharray="3 3" />
        {curvas}
        {textos}
        <text x={10} y={120} fontSize={10} fill="#a9b3cf" transform="rotate(-90 10 120)" textAnchor="middle">
          Respuesta (ilustrativa)
        </text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, alignItems: "center" }}>
        {!sel || elegidos.length === 0 ? (
          <span style={{ color: "var(--suave)", fontSize: "0.8rem" }}>
            {sel ? "El tramo no tiene canales con imagen." : "Clic en un canal o arrastra para elegir un tramo."}
          </span>
        ) : (
          <>
            {porBanda.map((ps) => (
              <span key={ps[0]} style={pastilla}>
                D{bandaDePlano(ps[0])} ·{" "}
                {ps.length > 1 ? `canales ${rotuloCanal(ps[0])}–${rotuloCanal(ps[ps.length - 1])}` : `canal ${rotuloCanal(ps[0])}`}
              </span>
            ))}
            <span style={{ color: "var(--suave)", fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>
              {lam[elegidos[0]].toFixed(2)}–{lam[elegidos[elegidos.length - 1]].toFixed(2)} µm · {elegidos.length}{" "}
              {elegidos.length === 1 ? "canal" : "canales"}
            </span>
          </>
        )}
        <span style={{ flex: 1 }} />
        {elegidos.length > 1 &&
          (recorrido ? (
            <button type="button" style={botonChico} onClick={() => setRecorrido(null)}>
              Detener
            </button>
          ) : (
            <button
              type="button"
              style={botonChico}
              onClick={() => setRecorrido(elegidos)}
              title="Pasa el cielo por cada canal del tramo, uno tras otro (0,8 s por canal)"
            >
              Recorrer
            </button>
          ))}
        {sel && (
          <button
            type="button"
            style={botonChico}
            onClick={() => {
              setRecorrido(null);
              setSel(null);
            }}
          >
            Limpiar
          </button>
        )}
      </div>
      <div style={{ color: "var(--suave)", fontSize: "0.75rem", marginTop: 4 }}>
        Ancho λ/R con R por banda de la literatura; altura ilustrativa. Los canales 3.17 y 4.1 vienen vacíos en el cubo.
        {fuente.tipo === "respaldo" && ` No se pudo leer el properties del cubo (${fuente.motivo}): λ de respaldo, redondeadas.`}
        {fuente.tipo === "cargando" && " Leyendo las λ del cubo…"}
      </div>
    </div>
  );
}
