/**
 * Huella espectral (Prisma): brillo del objeto en cada foto, ordenado por λ, sobre la barra del espectro
 * electromagnético. SVG sin librerías. Pasar el mouse por un punto lleva el explorador a esa banda/visita.
 * Puntos: lleno = medida; ▽ = límite superior (S/N < 3); △ en la franja de arriba = saturado (sin altura).
 * Con dos o más pasadas, cada pasada tiene su color y una línea por sus medianas. Gris = forma de las vecinas.
 */
import { useState } from "react";
import { usePrisma } from "../content/prisma";
import { useIdioma } from "../state/idioma";
import { useFmt } from "./formato";
import { depresion } from "./moleculas";
import { COLORES_PASADA, etiquetaPasada, usable, valorLimite, type Pasada, type PuntoVista } from "./pasadas";

type Props = {
  /** Todas las pasadas (los colores dependen del orden); `ver` elige cuáles se dibujan. */
  pasadas: Pasada[];
  ver: string;
  sel: { banda: number; visita: number };
  onPunto: (p: PuntoVista) => void;
  /** Si el explorador puede cargar las 6 bandas, el botón del aviso «solo 1 banda» lo hace. */
  cargarTodas?: () => void;
};

// Lienzo lógico del SVG.
const W = 820;
const H = 340;
const M = { izq: 62, der: 16, arr: 90, aba: 46 };
// Franja fija para los saturados, arriba del área de datos: su flujo medido es una fracción arbitraria
// del real (píxeles enmascarados), así que no se dibujan a ninguna altura del eje ni cuentan para su rango.
const SAT_Y = 70;
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

/** Medianas de las medidas usables en cajas de ~7 % en λ: la línea de cada pasada. */
function linea(ps: PuntoVista[]): { l: number; v: number }[] {
  const cajas = new Map<number, PuntoVista[]>();
  for (const p of ps.filter(usable)) {
    const k = Math.floor(Math.log10(p.lam) / 0.03);
    cajas.set(k, [...(cajas.get(k) ?? []), p]);
  }
  return [...cajas.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, g]) => ({ l: mediana(g.map((p) => p.lam)), v: mediana(g.map((p) => p.mJy)) }));
}

export default function HuellaEspectral({ pasadas, ver, sel, onPunto, cargarTodas }: Props) {
  const prisma = usePrisma();
  const { tr, idioma } = useIdioma();
  const fmt = useFmt();
  const [molSobre, setMolSobre] = useState<string | null>(null);
  const porColor = pasadas.length > 1;
  const visibles = pasadas.map((pa, i) => ({ pa, color: COLORES_PASADA[i % COLORES_PASADA.length] })).filter(({ pa }) => ver === "todas" || pa.id === ver);
  const puntos = visibles.flatMap(({ pa, color }) => pa.puntos.map((p) => ({ p, color })));
  const todosPuntos = puntos.map(({ p }) => p);

  const usables = todosPuntos.filter(usable);
  const limites = todosPuntos
    .filter((p) => p.estado !== "saturado" && (p.estado === "limite" || p.mJy > 0))
    .map((p) => (p.estado === "medida" ? p.mJy : valorLimite(p)))
    .filter((v) => v > 0);
  // Forma de las vecinas (solo puntos vivos): UNA mediana por banda, escalada para que su mediana coincida
  // con la del objeto. Por banda y no por punto, para que un fotograma raro no deforme la línea.
  const conVec = todosPuntos.filter((p) => p.vecinas && p.vecinas > 0);
  const porBanda = BANDAS.map(([b]) => conVec.filter((p) => p.banda === b))
    .filter((g) => g.length)
    .map((g) => ({ l: mediana(g.map((p) => p.lam)), v: mediana(g.map((p) => p.vecinas!)) }));
  const kVec =
    usables.length && porBanda.length ? mediana(usables.map((p) => p.mJy)) / mediana(porBanda.map((g) => g.v)) : NaN;
  const vecinas = Number.isFinite(kVec) ? porBanda.map((g) => ({ l: g.l, v: g.v * kVec })) : [];
  const lineas = porColor ? visibles.map(({ pa, color }) => ({ id: pa.id, color, pts: linea(pa.puntos) })) : [];

  const todos = [...limites, ...vecinas.map((v) => v.v)];
  const yLo = todos.length ? Math.log10(Math.min(...todos)) - 0.3 : -1;
  const yHi = todos.length ? Math.log10(Math.max(...todos)) + 0.3 : 3;
  const ly = (mJy: number) => H - M.aba - ((Math.log10(Math.max(mJy, 1e-6)) - yLo) / (yHi - yLo || 1)) * (H - M.arr - M.aba);
  // Marcas del eje y: potencias de 10; si cabe menos de dos, se agregan 2× y 5× para que se lea la escala.
  let yTicks: number[] = [];
  for (let e = Math.ceil(yLo); e <= Math.floor(yHi); e++) yTicks.push(10 ** e);
  if (yTicks.length < 2) {
    yTicks = [];
    for (let e = Math.floor(yLo); e <= Math.ceil(yHi); e++)
      for (const m of [1, 2, 5]) {
        const v = m * 10 ** e;
        if (Math.log10(v) >= yLo && Math.log10(v) <= yHi) yTicks.push(v);
      }
  }

  const esSel = (p: PuntoVista) => p.visita !== null && p.banda === sel.banda && p.visita === sel.visita;
  const actual = todosPuntos.find(esSel);
  const nDebil = todosPuntos.filter((p) => p.estado === "limite").length;
  const nSat = todosPuntos.filter((p) => p.estado === "saturado").length;
  const nSosp = todosPuntos.filter((p) => p.sospechoso).length;
  const nBorde = todosPuntos.filter((p) => p.bordeSat).length;
  const tenue = (p: PuntoVista) => p.sospechoso || p.bordeSat;
  const todoSaturado = todosPuntos.length > 0 && nSat >= 0.9 * todosPuntos.length;
  const bandasConPuntos = new Set(todosPuntos.map((p) => p.banda));
  const unaBanda = bandasConPuntos.size === 1 ? [...bandasConPuntos][0] : 0;
  const fechas = [...new Set(todosPuntos.map((p) => p.fecha))].sort();
  const chico = todosPuntos.length > 80;
  const valor = (p: PuntoVista) =>
    p.estado === "saturado"
      ? tr("saturado", "saturated")
      : p.estado === "medida"
        ? `${fmt(p.mJy)} ± ${fmt(p.err)} mJy`
        : `< ${fmt(valorLimite(p))} mJy`;
  // Zonas de moléculas: ¿falta luz ahí en este objeto? (misma regla de 3σ que «qué cambió»).
  const zonas = prisma.moleculas.flatMap((m, mi) =>
    m.rangos.map((r, i) => ({ k: `${mi}:${i}`, m, a: r[0], z: r[1], dep: depresion(todosPuntos, r, m.refs[i] ?? []) })),
  );
  const zonaSobre = zonas.find((zn) => zn.k === molSobre);
  const textoDep = (zn: (typeof zonas)[number]) =>
    zn.dep ? prisma.faltaLuz(zn.m.nombre, `${fmt(zn.a, 2)}–${fmt(zn.z, 2)} µm`, fmt(zn.dep.razon, 2), fmt(zn.dep.sigma, 0)) : "";
  const rotulo = (p: PuntoVista) =>
    `D${p.banda} · ${p.fecha} · λ ${fmt(p.lam, 2)} µm · ${valor(p)}${p.sospechoso ? ` · ${prisma.huella.sospechosoCorto}` : ""}${p.bordeSat ? ` · ${prisma.huella.bordeSatCorto}` : ""}`;

  return (
    <figure className="huella">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${prisma.huella.titulo}: ${todosPuntos.length} ${tr("puntos entre 0,75 y 5 micrómetros", "points between 0.75 and 5 micrometers")}`}>
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
          {tr("infrarrojo", "infrared")} · {prisma.huella.spherex}
        </text>

        {/* Franjas de bandas B1–B6 */}
        {BANDAS.map(([b, a, z]) => (
          <g key={b}>
            <rect x={lx(a)} y={M.arr} width={lx(z) - lx(a)} height={H - M.arr - M.aba} fill={`var(--b${b})`} opacity={0.07} />
            <text x={(lx(a) + lx(z)) / 2} y={M.arr - 6} className="h-banda" fill={`var(--b${b})`} textAnchor="middle">D{b}</text>
          </g>
        ))}

        {/* Regiones de moléculas */}
        {zonas.map((zn) => (
          <g
            key={zn.k}
            className={`h-mol-zona ${zn.dep ? "dep" : ""} ${molSobre === zn.k ? "sobre" : ""}`}
            onMouseEnter={() => setMolSobre(zn.k)}
            onMouseLeave={() => setMolSobre((k) => (k === zn.k ? null : k))}
          >
            <title>{`${zn.m.texto}${zn.dep ? ` ${textoDep(zn)}` : ""}`}</title>
            <rect x={lx(zn.a)} y={M.arr} width={lx(zn.z) - lx(zn.a)} height={H - M.arr - M.aba} className="h-mol" />
            <text x={(lx(zn.a) + lx(zn.z)) / 2} y={H - M.aba - 6} className="h-mol-t" textAnchor="middle">{zn.m.formula}</text>
            {zn.dep && (
              <text x={(lx(zn.a) + lx(zn.z)) / 2} y={M.arr + 12} className="h-mol-dep" textAnchor="middle">↓</text>
            )}
          </g>
        ))}

        {/* Ejes */}
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={lx(t)} x2={lx(t)} y1={H - M.aba} y2={H - M.aba + 4} className="h-eje" />
            <text x={lx(t)} y={H - M.aba + 16} className="h-tick" textAnchor="middle">{fmt(t)}</text>
          </g>
        ))}
        <text x={(M.izq + W - M.der) / 2} y={H - 8} className="h-tick" textAnchor="middle">{prisma.huella.ejeX}</text>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={M.izq - 4} x2={W - M.der} y1={ly(v)} y2={ly(v)} className="h-grilla" />
            <text x={M.izq - 8} y={ly(v) + 4} className="h-tick" textAnchor="end">
              {fmt(v, v >= 1 ? 0 : 3)}
            </text>
          </g>
        ))}
        <text x={14} y={(M.arr + H - M.aba) / 2} className="h-tick" textAnchor="middle" transform={`rotate(-90 14 ${(M.arr + H - M.aba) / 2})`}>
          {prisma.huella.ejeY}
        </text>

        {/* Franja de saturados (fuera del eje) */}
        {nSat > 0 && (
          <g>
            <rect x={M.izq} y={SAT_Y - 10} width={W - M.izq - M.der} height={20} className="h-sat-franja" />
            <text x={M.izq - 8} y={SAT_Y + 4} className="h-tick" textAnchor="end">{tr("saturado", "saturated")}</text>
          </g>
        )}

        {/* Vecinas (forma) */}
        {vecinas.length > 1 && (
          <polyline
            className="h-vecinas"
            points={[...vecinas].sort((a, b) => a.l - b.l).map((v) => `${lx(v.l)},${ly(v.v)}`).join(" ")}
          />
        )}

        {/* Una línea por pasada (medianas) */}
        {lineas.map((l) =>
          l.pts.length > 1 ? (
            <polyline key={l.id} className="h-linea" stroke={l.color} points={l.pts.map((v) => `${lx(v.l)},${ly(v.v)}`).join(" ")} />
          ) : null,
        )}

        {/* Puntos del objeto */}
        {puntos.map(({ p, color: cPasada }, i) => {
          const x = lx(p.lam);
          const s = esSel(p);
          const color = porColor ? cPasada : `var(--b${p.banda})`;
          const titulo = rotulo(p);
          const comun = {
            onMouseEnter: () => onPunto(p),
            onFocus: () => onPunto(p),
            onClick: () => onPunto(p),
            tabIndex: 0,
            role: "button" as const,
            "aria-label": titulo,
            className: `h-punto ${s ? "sel" : ""} ${tenue(p) ? "sosp" : ""}`,
          };
          const key = `${p.banda}:${p.visita ?? ""}:${p.mjd}:${i}`;
          if (p.estado === "saturado") {
            // △ en la franja fija: «más brillante de lo que el detector mide», sin altura inventada.
            return (
              <path key={key} d={`M${x},${SAT_Y - 7} L${x + 6},${SAT_Y + 5} L${x - 6},${SAT_Y + 5} Z`} fill="none" stroke={color} strokeWidth={2} {...comun}>
                <title>{titulo}</title>
              </path>
            );
          }
          if (p.estado === "limite") {
            const y = ly(valorLimite(p));
            const r = chico ? 4 : 6;
            return (
              <path key={key} d={`M${x - r},${y - r * 0.66} L${x + r},${y - r * 0.66} L${x},${y + r} Z`} fill={color} opacity={tenue(p) ? 0.25 : 0.55} {...comun}>
                <title>{titulo}</title>
              </path>
            );
          }
          return (
            <circle key={key} cx={x} cy={ly(p.mJy)} r={s ? 7 : chico ? 3.5 : 5} fill={color} opacity={tenue(p) ? 0.3 : 1} {...comun}>
              <title>{titulo}</title>
            </circle>
          );
        })}
      </svg>

      <figcaption>
        <ul className="h-leyenda">
          {porColor &&
            visibles.map(({ pa, color }) => (
              <li key={pa.id}>
                <span className="h-ley-pasada" style={{ background: color }} /> {etiquetaPasada(pa, idioma)}
              </li>
            ))}
          <li><span className="h-ley-medida" /> {prisma.huella.leyenda.medida}</li>
          <li><span className="h-ley-limite" /> {prisma.huella.leyenda.limite}</li>
          <li><span className="h-ley-sat">△</span> {prisma.huella.leyenda.saturado}</li>
          {vecinas.length > 1 && <li><span className="h-ley-vec" /> {prisma.huella.leyenda.vecinas}</li>}
          <li><span className="h-ley-mol" /> {prisma.huella.moleculas}</li>
        </ul>
        <p className="h-actual" aria-live="polite">
          {actual
            ? actual.estado === "limite"
              ? `D${actual.banda} · ${actual.fecha} · λ ${fmt(actual.lam, 2)} µm · ${tr("demasiado débil en esta foto", "too faint in this photo")}`
              : rotulo(actual)
            : prisma.huella.pista}
        </p>
        {zonaSobre ? (
          <p className="h-mol-info">
            {zonaSobre.m.texto} <strong>{zonaSobre.dep ? textoDep(zonaSobre) : prisma.sinDepresion}</strong>
          </p>
        ) : (
          zonas.some((zn) => zn.dep) && (
            <p className="h-mol-info">
              ↓{" "}
              {prisma.faltaLuzResumen(
                prisma.moleculas
                  .map((m) => ({ m, n: zonas.filter((zn) => zn.m === m && zn.dep).length }))
                  .filter((x) => x.n > 0)
                  .map((x) => `${x.m.nombre} (${x.m.formula}${x.n > 1 ? ` ×${x.n}` : ""})`)
                  .join(", "),
              )}
            </p>
          )
        )}
        {todosPuntos.length > 0 && nDebil > todosPuntos.length / 2 && <p className="h-aviso">{prisma.huella.debil}</p>}
        {todoSaturado ? (
          <p className="h-aviso h-aviso-fuerte">{prisma.huella.todoSaturado}</p>
        ) : (
          nSat > 0 && <p className="h-aviso">{prisma.huella.saturadoAviso(nSat)}</p>
        )}
        {unaBanda > 0 && (
          <p className="h-aviso">
            {prisma.huella.unaBanda(unaBanda)}{" "}
            {cargarTodas && (
              <button type="button" className="h-boton" onClick={cargarTodas}>
                {prisma.huella.cargarTodas}
              </button>
            )}
          </p>
        )}
        {nSosp > 0 && !todoSaturado && <p className="h-aviso">{prisma.huella.sospechosos(nSosp)}</p>}
        {nBorde > 0 && !todoSaturado && <p className="h-aviso">{prisma.huella.bordeSat(nBorde)}</p>}
        {porColor ? (
          <p className="h-nota">{prisma.huella.porPasada}</p>
        ) : (
          fechas.length > 1 && (
            <p className="h-nota">{prisma.huella.fechasDistintas(fechas.length, fechas[0], fechas[fechas.length - 1])}</p>
          )
        )}
        <p className="h-caveat">{prisma.huella.caveat}</p>
      </figcaption>
    </figure>
  );
}
