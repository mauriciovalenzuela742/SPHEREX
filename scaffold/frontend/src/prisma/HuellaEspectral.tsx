/**
 * Huella espectral (Prisma): brillo del objeto en cada foto, ordenado por λ, sobre la barra del espectro
 * electromagnético. SVG sin librerías. Pasar el mouse por un punto lleva el explorador a esa banda/visita.
 * Puntos: lleno = medida; ▽ = límite superior (S/N < 3); hueco = saturado. Gris = forma de las vecinas.
 */
import { prisma } from "../content/prisma";
import type { PuntoEspectral } from "./fotometria";

type Props = {
  puntos: PuntoEspectral[];
  sel: { banda: number; visita: number };
  onPunto: (banda: number, visita: number) => void;
};

// Lienzo lógico del SVG.
const W = 820;
const H = 340;
const M = { izq: 62, der: 16, arr: 64, aba: 46 };
const L_MIN = 0.3;
const L_MAX = 5.3;
const lx = (l: number) => M.izq + ((Math.log(l) - Math.log(L_MIN)) / (Math.log(L_MAX) - Math.log(L_MIN))) * (W - M.izq - M.der);

const BANDAS: [number, number, number][] = [
  [1, 0.75, 1.09], [2, 1.1, 1.62], [3, 1.63, 2.41], [4, 2.42, 3.82], [5, 3.83, 4.41], [6, 4.42, 5.0],
];
const TICKS = [0.4, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5];

function mediana(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN;
}

export default function HuellaEspectral({ puntos, sel, onPunto }: Props) {
  const usables = puntos.filter((p) => p.detectado && p.mJy > 0);
  const limites = puntos.map((p) => (p.detectado ? p.mJy : Math.max(p.mJy, 0) + 3 * p.errMJy)).filter((v) => v > 0);
  // Forma de las vecinas: UNA mediana por banda (en la λ mediana de la banda), escalada para que su mediana
  // coincida con la del objeto. Por banda y no por punto, para que un fotograma raro no deforme la línea.
  const conVec = puntos.filter((p) => p.vecinas && p.vecinas > 0);
  const porBanda = BANDAS.map(([b]) => conVec.filter((p) => p.banda === b))
    .filter((g) => g.length)
    .map((g) => ({ l: mediana(g.map((p) => p.lambda)), v: mediana(g.map((p) => p.vecinas!)) }));
  const kVec =
    usables.length && porBanda.length ? mediana(usables.map((p) => p.mJy)) / mediana(porBanda.map((g) => g.v)) : NaN;
  const vecinas = Number.isFinite(kVec) ? porBanda.map((g) => ({ l: g.l, v: g.v * kVec })) : [];

  const todos = [...limites, ...vecinas.map((v) => v.v)];
  const yLo = todos.length ? Math.log10(Math.min(...todos)) - 0.3 : -1;
  const yHi = todos.length ? Math.log10(Math.max(...todos)) + 0.3 : 3;
  const ly = (mJy: number) => H - M.aba - ((Math.log10(Math.max(mJy, 1e-6)) - yLo) / (yHi - yLo || 1)) * (H - M.arr - M.aba);
  const yTicks: number[] = [];
  for (let e = Math.ceil(yLo); e <= Math.floor(yHi); e++) yTicks.push(e);

  const actual = puntos.find((p) => p.banda === sel.banda && p.visita === sel.visita);
  const nDebil = puntos.filter((p) => !p.detectado && !p.saturado).length;
  const nSat = puntos.filter((p) => p.saturado).length;

  return (
    <figure className="huella">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${prisma.huella.titulo}: ${puntos.length} puntos entre 0,75 y 5 micrómetros`}>
        {/* Barra del espectro electromagnético */}
        <defs>
          <linearGradient id="visible" x1="0" x2="1">
            <stop offset="0" stopColor="#7b3fe4" />
            <stop offset="0.25" stopColor="#3a6df0" />
            <stop offset="0.45" stopColor="#2fb84a" />
            <stop offset="0.65" stopColor="#f2d53c" />
            <stop offset="0.82" stopColor="#f28a2e" />
            <stop offset="1" stopColor="#e3342f" />
          </linearGradient>
        </defs>
        <rect x={lx(L_MIN)} y={10} width={lx(0.38) - lx(L_MIN)} height={12} fill="#3b2a5c" />
        <rect x={lx(0.38)} y={10} width={lx(0.75) - lx(0.38)} height={12} fill="url(#visible)" />
        <rect x={lx(0.75)} y={10} width={lx(L_MAX) - lx(0.75)} height={12} fill="#4a1d1d" />
        <text x={(lx(L_MIN) + lx(0.38)) / 2} y={36} className="h-eti" textAnchor="middle">UV</text>
        <text x={(lx(0.38) + lx(0.75)) / 2} y={36} className="h-eti" textAnchor="middle">{prisma.huella.ojoHumano}</text>
        <text x={(lx(0.75) + lx(L_MAX)) / 2} y={36} className="h-eti" textAnchor="middle">
          infrarrojo · {prisma.huella.spherex}
        </text>

        {/* Franjas de bandas B1–B6 */}
        {BANDAS.map(([b, a, z]) => (
          <g key={b}>
            <rect x={lx(a)} y={M.arr} width={lx(z) - lx(a)} height={H - M.arr - M.aba} fill={`var(--b${b})`} opacity={0.07} />
            <text x={(lx(a) + lx(z)) / 2} y={M.arr - 6} className="h-banda" fill={`var(--b${b})`} textAnchor="middle">D{b}</text>
          </g>
        ))}

        {/* Regiones de moléculas */}
        {prisma.moleculas.map((m) =>
          m.rangos.map(([a, z], i) => (
            <g key={m.formula + i}>
              <rect x={lx(a)} y={M.arr} width={lx(z) - lx(a)} height={H - M.arr - M.aba} className="h-mol" />
              <text x={(lx(a) + lx(z)) / 2} y={H - M.aba - 6} className="h-mol-t" textAnchor="middle">{m.formula}</text>
            </g>
          )),
        )}

        {/* Ejes */}
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={lx(t)} x2={lx(t)} y1={H - M.aba} y2={H - M.aba + 4} className="h-eje" />
            <text x={lx(t)} y={H - M.aba + 16} className="h-tick" textAnchor="middle">{String(t).replace(".", ",")}</text>
          </g>
        ))}
        <text x={(M.izq + W - M.der) / 2} y={H - 8} className="h-tick" textAnchor="middle">{prisma.huella.ejeX}</text>
        {yTicks.map((e) => (
          <g key={e}>
            <line x1={M.izq - 4} x2={W - M.der} y1={ly(10 ** e)} y2={ly(10 ** e)} className="h-grilla" />
            <text x={M.izq - 8} y={ly(10 ** e) + 4} className="h-tick" textAnchor="end">
              {10 ** e >= 1 ? (10 ** e).toLocaleString("es-CL") : (10 ** e).toString().replace(".", ",")}
            </text>
          </g>
        ))}
        <text x={14} y={(M.arr + H - M.aba) / 2} className="h-tick" textAnchor="middle" transform={`rotate(-90 14 ${(M.arr + H - M.aba) / 2})`}>
          {prisma.huella.ejeY}
        </text>

        {/* Vecinas (forma) */}
        {vecinas.length > 1 && (
          <polyline
            className="h-vecinas"
            points={[...vecinas].sort((a, b) => a.l - b.l).map((v) => `${lx(v.l)},${ly(v.v)}`).join(" ")}
          />
        )}

        {/* Puntos del objeto */}
        {puntos.map((p) => {
          const x = lx(p.lambda);
          const esSel = p.banda === sel.banda && p.visita === sel.visita;
          const color = `var(--b${p.banda})`;
          const titulo = `D${p.banda} · ${p.t.slice(0, 10)} · λ ${p.lambda.toFixed(2)} µm · ${
            p.saturado ? "saturado" : p.detectado ? `${p.mJy.toFixed(1)} ± ${p.errMJy.toFixed(1)} mJy` : `< ${(Math.max(p.mJy, 0) + 3 * p.errMJy).toFixed(2)} mJy`
          }`;
          const comun = {
            onMouseEnter: () => onPunto(p.banda, p.visita),
            onFocus: () => onPunto(p.banda, p.visita),
            onClick: () => onPunto(p.banda, p.visita),
            tabIndex: 0,
            role: "button" as const,
            "aria-label": titulo,
            className: `h-punto ${esSel ? "sel" : ""}`,
          };
          if (p.saturado) {
            const y = ly(p.mJy > 0 ? p.mJy : 10 ** yHi);
            return <circle key={`${p.banda}:${p.visita}`} cx={x} cy={y} r={6} fill="none" stroke={color} strokeWidth={2} {...comun}><title>{titulo}</title></circle>;
          }
          if (!p.detectado) {
            const y = ly(Math.max(p.mJy, 0) + 3 * p.errMJy);
            return (
              <path key={`${p.banda}:${p.visita}`} d={`M${x - 6},${y - 4} L${x + 6},${y - 4} L${x},${y + 6} Z`} fill={color} opacity={0.55} {...comun}>
                <title>{titulo}</title>
              </path>
            );
          }
          return <circle key={`${p.banda}:${p.visita}`} cx={x} cy={ly(p.mJy)} r={esSel ? 7 : 5} fill={color} {...comun}><title>{titulo}</title></circle>;
        })}
      </svg>

      <figcaption>
        <ul className="h-leyenda">
          <li><span className="h-ley-medida" /> {prisma.huella.leyenda.medida}</li>
          <li><span className="h-ley-limite" /> {prisma.huella.leyenda.limite}</li>
          <li><span className="h-ley-sat" /> {prisma.huella.leyenda.saturado}</li>
          <li><span className="h-ley-vec" /> {prisma.huella.leyenda.vecinas}</li>
          <li><span className="h-ley-mol" /> {prisma.huella.moleculas}</li>
        </ul>
        <p className="h-actual" aria-live="polite">
          {actual
            ? `D${actual.banda} · ${actual.t.slice(0, 10)} · λ ${actual.lambda.toFixed(2)} µm · ${
                actual.saturado ? "saturado" : actual.detectado ? `${actual.mJy.toFixed(1)} ± ${actual.errMJy.toFixed(1)} mJy` : "demasiado débil en esta foto"
              }`
            : prisma.huella.pista}
        </p>
        {puntos.length > 0 && nDebil > puntos.length / 2 && <p className="h-aviso">{prisma.huella.debil}</p>}
        {nSat > 0 && <p className="h-aviso">{prisma.huella.saturadoAviso}</p>}
        <p className="h-caveat">{prisma.huella.caveat}</p>
      </figcaption>
    </figure>
  );
}
