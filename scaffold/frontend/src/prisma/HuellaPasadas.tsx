/**
 * «Seguir por la huella espectral» (Prisma, V2): resultados del PR #58 (eda/huella_espectral/) sobre los 5 objetos.
 * - Mapa (movimiento entre pasadas, cambio de espectro D): separa lo que se mueve de lo que cambia de brillo.
 * - Tarjeta del objeto abierto: en WISE 0855, la mezcla de mayo de 2026 y la búsqueda ciega (0 candidatas por
 *   posición, 1 por huella); en los demás, su caso.
 * Cifras: public/precalc/huella/resumen.json (copiadas de cinco_objetos_resultado.json y cifras_verificadas.json).
 * D = distancia espectral sin escala: χ² reducido mínimo entre dos espectros, con piso del 5 % (ver docs/hallazgos).
 */
import { useIdioma } from "../state/idioma";
import { useFmt, type Fmt } from "./formato";
import { esResumen, NOMBRES, useHuella, type Caso, type Resumen } from "../huella/precalc";

type Tr = (es: string, en: string) => string;

export default function HuellaPasadas({ id }: { id: string | null }) {
  const { tr } = useIdioma();
  const fmt = useFmt();
  const r = useHuella<Resumen>("resumen", esResumen);
  if (!r) return null;
  const caso = r.casos.find((c) => c.id === id) ?? null;
  return (
    <section className="hp" aria-labelledby="hp-titulo">
      <h3 id="hp-titulo">{tr("Seguir un astro por su huella espectral", "Tracking an object by its spectral fingerprint")}</h3>
      <p className="prisma-texto">
        {tr(
          "Cada vez que SPHEREx pasa por una zona del cielo junta el espectro completo de 0,75 a 5 µm. Si el espectro de un astro no cambia entre pasadas, sirve como su huella: permite reconocerlo aunque se haya movido o esté pegado a otra estrella. D mide cuánto difiere la forma de dos espectros, sin importar el brillo total: cerca de 1 = la misma forma; mucho mayor = otra forma. Datos reales de SPHEREx, sin catálogos externos.",
          "Every time SPHEREx sweeps a patch of sky it collects the full 0.75–5 µm spectrum. If an object's spectrum does not change between passes, it works as a fingerprint: it lets us recognise the object even after it moved or while it overlaps another star. D measures how much the shape of two spectra differs, regardless of total brightness: around 1 = same shape; much larger = a different shape. Real SPHEREx data, no external catalogues.",
        )}
      </p>
      <div className="hp-cuerpo">
        <MapaCasos casos={r.casos} actual={id} tr={tr} fmt={fmt} />
        <div className="hp-caso">
          {id === "wise_0855" ? <CasoWise r={r} tr={tr} fmt={fmt} /> : caso ? <CasoOtro c={caso} tr={tr} fmt={fmt} /> : (
            <p className="h-nota">{tr("Abre uno de los 5 objetos de prueba para ver su caso. El más difícil es WISE 0855.", "Open one of the 5 test objects to see its case. The hardest one is WISE 0855.")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Mapa (Δpos, D) ──
const W = 360, H = 240, M = { l: 44, r: 12, t: 12, b: 52 };
const X_MAX = 12; // ″
const Y_MIN = 0.1, Y_MAX = 30; // D, escala log
const xa = (v: number) => M.l + (v / X_MAX) * (W - M.l - M.r);
const ya = (d: number) => {
  const t = (Math.log10(Math.max(Y_MIN, Math.min(Y_MAX, d))) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN));
  return H - M.b - t * (H - M.t - M.b);
};
const COLOR: Record<Caso["clase"], string> = { movil: "var(--acento)", movil_sin_espectro: "var(--acento)", variable: "#ff6b9a", saturada: "#a9b3cf" };

function MapaCasos({ casos, actual, tr, fmt }: { casos: Caso[]; actual: string | null; tr: Tr; fmt: Fmt }) {
  const sinD = casos.filter((c) => c.dpos !== null && c.D === null);
  const fuera = casos.filter((c) => c.dpos === null);
  return (
    <figure className="hp-mapa">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr("Movimiento entre pasadas frente a cambio de espectro, 5 objetos", "Motion between passes vs spectral change, 5 objects")}>
        {/* Estrellas quietas del campo de WISE 0855: ≤ 0,4″ y D 0,29–3,13 en 20 pares (docs/hallazgos, sec. 5) */}
        <rect x={xa(0)} y={ya(3.13)} width={xa(0.4) - xa(0) + 4} height={ya(0.29) - ya(3.13)} className="hp-quietas" />
        <text x={xa(0) + 8} y={ya(0.29) + 12} className="h-eti">{tr("estrellas quietas", "static stars")}</text>
        {[0.1, 1, 10].map((d) => (
          <g key={d}>
            <line x1={M.l} x2={W - M.r} y1={ya(d)} y2={ya(d)} className="h-grilla" />
            <text x={M.l - 6} y={ya(d) + 4} textAnchor="end" className="h-tick">{fmt(d, 1)}</text>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <text key={v} x={xa(v)} y={H - M.b + 14} textAnchor="middle" className="h-tick">{v}″</text>
        ))}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="h-eje" />
        <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} className="h-eje" />
        <text x={(M.l + W - M.r) / 2} y={H - M.b + 30} textAnchor="middle" className="h-eti">{tr("Cuánto se movió entre la primera y la última pasada", "How far it moved, first to last pass")}</text>
        <text transform={`translate(12 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" className="h-eti">{tr("Cambio de espectro D", "Spectral change D")}</text>
        {casos.filter((c) => c.dpos !== null && c.D !== null).map((c) => {
          const lo = c.D_rango?.[0] ?? (c.D_pares ? Math.min(...Object.values(c.D_pares)) : c.D!);
          const x = xa(c.dpos!);
          const sel = c.id === actual;
          return (
            <g key={c.id} className={sel ? "hp-sel" : ""}>
              <line x1={x} x2={x} y1={ya(lo)} y2={ya(c.D!)} stroke={COLOR[c.clase]} strokeWidth={sel ? 3 : 2} opacity={0.6} />
              <circle cx={x} cy={ya(c.D!)} r={sel ? 6 : 4.5} fill={COLOR[c.clase]} />
              <circle cx={x} cy={ya(lo)} r={3} fill="none" stroke={COLOR[c.clase]} />
              <text x={x + 8} y={ya(c.D!) + 4} className={`hp-nombre ${sel ? "sel" : ""}`}>{NOMBRES[c.id]}</text>
            </g>
          );
        })}
        {sinD.map((c) => (
          <g key={c.id} className={c.id === actual ? "hp-sel" : ""}>
            <path d={`M${xa(c.dpos!)},${H - M.b - 2} l-5,-9 h10 z`} fill={COLOR[c.clase]} />
            <text x={xa(c.dpos!)} y={H - M.b - 16} textAnchor="middle" className={`hp-nombre ${c.id === actual ? "sel" : ""}`}>{NOMBRES[c.id]}</text>
          </g>
        ))}
      </svg>
      <figcaption className="h-nota">
        {tr(
          "Punto lleno: el D más alto entre pasadas; círculo vacío: el más bajo. Barnard: posición sí, espectro no (su núcleo es demasiado brillante). ",
          "Filled dot: highest D between passes; open circle: lowest. Barnard: position yes, spectrum no (its core is too bright). ",
        )}
        {fuera.map((c) => tr(
          `${NOMBRES[c.id]}: fuera del mapa, saturada en ${c.n_sat} de ${c.n_exp} exposiciones (${fmt((c.frac_saturadas ?? 0) * 100, 2)} %).`,
          `${NOMBRES[c.id]}: off the map, saturated in ${c.n_sat} of ${c.n_exp} exposures (${fmt((c.frac_saturadas ?? 0) * 100, 2)}%).`,
        ))}
      </figcaption>
    </figure>
  );
}

// ── WISE 0855: la mezcla y la búsqueda ciega ──
function CasoWise({ r, tr, fmt }: { r: Resumen; tr: Tr; fmt: Fmt }) {
  const w = r.wise_0855;
  const ds = Object.values(w.D_misma), dq = Object.values(w.D_estaticas), de = Object.values(w.D_estrella_a_objeto), dw = Object.values(w.D_objeto_a_estrella);
  const rango = (v: number[], k = 2) => `${fmt(Math.min(...v), k)}–${fmt(Math.max(...v), k)}`;
  const B = ({ titulo, b, destacada }: { titulo: string; b: Resumen["wise_0855"]["busqueda"]["huella"]; destacada?: boolean }) => (
    <div className={`hp-busq ${destacada ? "ok" : ""}`}>
      <strong>{titulo}</strong>
      <ul>
        <li>{tr(`${b.n_completas} trayectorias completas`, `${b.n_completas} complete tracks`)}</li>
        <li>{tr(`${b.rotas_desde_P1} rotas y ${b.huerfanas_Pfin} huérfanas`, `${b.rotas_desde_P1} broken, ${b.huerfanas_Pfin} orphaned`)}</li>
      </ul>
      <p className="hp-cand">{b.n_candidatas}</p>
      <span>{tr(b.n_candidatas === 1 ? "candidata en movimiento: WISE 0855" : "candidatas en movimiento", b.n_candidatas === 1 ? "moving candidate: WISE 0855" : "moving candidates")}</span>
    </div>
  );
  return (
    <div className="hp-wise">
      <h4>{tr("WISE 0855: la mezcla de abril–mayo de 2026", "WISE 0855: the April–May 2026 blend")}</h4>
      <p className="prisma-texto">
        {tr(
          `Se acerca a una estrella de fondo: ${fmt(w.sep["1"].medida_arcsec, 2)}″ → ${fmt(w.sep["2"].medida_arcsec, 2)}″ → ${fmt(w.sep["3"].medida_arcsec, 2)}″ en las tres pasadas (predicho ${fmt(w.sep["3"].predicha_arcsec, 2)}″ en la última: menos de un píxel de SPHEREx, que mide 6,15″). Ahí, su posición queda más cerca de la estrella que de donde estaba antes, y un buscador que solo mira posiciones pierde el rastro.`,
          `It approaches a background star: ${fmt(w.sep["1"].medida_arcsec, 2)}″ → ${fmt(w.sep["2"].medida_arcsec, 2)}″ → ${fmt(w.sep["3"].medida_arcsec, 2)}″ over the three passes (${fmt(w.sep["3"].predicha_arcsec, 2)}″ predicted in the last one: less than one 6.15″ SPHEREx pixel). There, its position is closer to the star than to where it was before, and a search that only looks at positions loses the track.`,
        )}
      </p>
      <div className="hp-busquedas">
        <B titulo={tr("Búsqueda ciega solo por posición", "Blind search, position only")} b={w.busqueda.posicional} />
        <B titulo={tr("Por posición + huella espectral", "Position + spectral fingerprint")} b={w.busqueda.huella} destacada />
      </div>
      <p className="prisma-texto">
        {tr(
          `Movimiento medido en un año: ${fmt(w.medido, 2)}″ ± ${fmt(w.err, 2)}″ (${fmt(w.sigma, 1)}σ), frente a ${fmt(w.predicho, 2)}″ predicho por movimiento propio y paralaje.`,
          `Motion measured over one year: ${fmt(w.medido, 2)}″ ± ${fmt(w.err, 2)}″ (${fmt(w.sigma, 1)}σ), vs ${fmt(w.predicho, 2)}″ predicted from proper motion and parallax.`,
        )}
      </p>
      <BarrasD
        filas={[
          { et: tr("WISE 0855 consigo misma, entre pasadas", "WISE 0855 vs itself, between passes"), v: ds, txt: rango(ds), c: "var(--acento)" },
          { et: tr("La estrella vecina consigo misma, entre pasadas", "The neighbouring star vs itself, between passes"), v: dq, txt: rango(dq), c: "#6ecbff" },
          { et: tr("WISE 0855 comparada con la vecina", "WISE 0855 compared with the neighbour"), v: dw, txt: rango(dw, 1), c: "#ff6b9a" },
          { et: tr("La vecina comparada con WISE 0855", "The neighbour compared with WISE 0855"), v: de, txt: rango(de, 0), c: "#ff6b9a" },
        ]}
        fmt={fmt}
      />
      <p className="prisma-texto">
        {tr(
          `Por qué: WISE 0855 emite el ${fmt(w.frac_roja * 100, 1)} % de su luz sobre 3,8 µm; la estrella vecina, el ${fmt(w.frac_roja_vecina * 100, 0)} %.`,
          `Why: WISE 0855 emits ${fmt(w.frac_roja * 100, 1)}% of its light above 3.8 µm; the neighbouring star, ${fmt(w.frac_roja_vecina * 100, 0)}%.`,
        )}{" "}
        {tr("En el Explorador, «Limpiar estrellas» muestra esa misma diferencia en imágenes.", "In the Explorer, “Star-cleaned” shows the same difference as images.")}
      </p>
      <p className="h-nota">
        {tr(
          "Límites: prueba de concepto en un campo. En los pares de estrellas bien separadas la huella no cambió ningún emparejamiento, y los umbrales se fijaron con estos mismos datos.",
          "Limits: proof of concept on one field. For well-separated star pairs the fingerprint changed no match, and the thresholds were set on these same data.",
        )}
      </p>
    </div>
  );
}

/** Barras horizontales en escala log de D (0,1 a 300). */
function BarrasD({ filas, fmt }: { filas: { et: string; v: number[]; txt: string; c: string }[]; fmt: Fmt }) {
  const lo = Math.log10(0.1), hi = Math.log10(300);
  const pct = (d: number) => ((Math.log10(d) - lo) / (hi - lo)) * 100;
  return (
    <div className="hp-barras">
      {filas.map((f) => (
        <div key={f.et} className="hp-barra">
          <span className="hp-barra-et">{f.et}</span>
          <span className="hp-barra-pista">
            <span style={{ left: `${pct(Math.min(...f.v))}%`, width: `${Math.max(1.5, pct(Math.max(...f.v)) - pct(Math.min(...f.v)))}%`, background: f.c }} />
          </span>
          <span className="hp-barra-v">D {f.txt}</span>
        </div>
      ))}
      <div className="hp-barra hp-escala">
        <span />
        <span className="hp-barra-pista">{[0.1, 1, 10, 100].map((d) => <i key={d} style={{ left: `${pct(d)}%` }}>{fmt(d, 1)}</i>)}</span>
        <span />
      </div>
    </div>
  );
}

// ── Los demás objetos ──
function CasoOtro({ c, tr, fmt }: { c: Caso; tr: Tr; fmt: Fmt }) {
  const nombre = NOMBRES[c.id];
  if (c.id === "eps_ind_b")
    return (
      <div>
        <h4>{tr(`${nombre}: se nota la paralaje`, `${nombre}: the parallax shows`)}</h4>
        <p className="prisma-texto">
          {tr(
            `Seguida a ciegas en ${c.pasadas} pasadas: se movió ${fmt(c.dpos!, 2)}″ (${fmt(c.sigma ?? 0, 1)}σ) frente a ${fmt(c.predicho_grupo!, 2)}″ predicho. Si se predice solo con su movimiento propio, la posición medida queda a ${fmt(c.dif_sin_paralaje!, 2)}″ de lo esperado; si se suma la paralaje (el vaivén que produce la Tierra al girar alrededor del Sol), queda a ${fmt(c.dif_con_paralaje!, 2)}″. Su espectro se mantiene entre pasadas (D ${fmt(c.D_rango![0], 2)}–${fmt(c.D_rango![1], 2)}), aunque a la última le faltan dos bandas.`,
            `Tracked blind over ${c.pasadas} passes: it moved ${fmt(c.dpos!, 2)}″ (${fmt(c.sigma ?? 0, 1)}σ) vs ${fmt(c.predicho_grupo!, 2)}″ predicted. Predicting with proper motion alone, the measured position lands ${fmt(c.dif_sin_paralaje!, 2)}″ from the expected one; adding parallax (the wobble caused by the Earth orbiting the Sun), it lands ${fmt(c.dif_con_paralaje!, 2)}″ away. Its spectrum holds between passes (D ${fmt(c.D_rango![0], 2)}–${fmt(c.D_rango![1], 2)}), even though the last pass lacks two bands.`,
          )}
        </p>
        <p className="h-nota">
          {tr(
            `Aquí la posición sola también la encuentra (${c.candidatas_posicion} candidata): está lejos de otras estrellas. La huella espectral marca la diferencia cuando hay mezcla, como en WISE 0855.`,
            `Here position alone also finds it (${c.candidatas_posicion} candidate): it is far from other stars. The fingerprint makes the difference when there is a blend, as with WISE 0855.`,
          )}
        </p>
      </div>
    );
  if (c.id === "barnard")
    return (
      <div>
        <h4>{tr(`${nombre}: posición sí, espectro no`, `${nombre}: position yes, spectrum no`)}</h4>
        <p className="prisma-texto">
          {tr(
            `Se movió ${fmt(c.dpos!, 2)}″ entre la primera y la última pasada, frente a ${fmt(c.predicho!, 2)}″ predicho. Es tan brillante que su núcleo se sale del régimen lineal: la posición se mide bien, pero su espectro central no.`,
            `It moved ${fmt(c.dpos!, 2)}″ between the first and last pass, vs ${fmt(c.predicho!, 2)}″ predicted. It is so bright that its core leaves the linear regime: the position is measured well, but not its central spectrum.`,
          )}
        </p>
      </div>
    );
  if (c.id === "rw_aur")
    return (
      <div>
        <h4>{tr(`${nombre}: quieta, pero su espectro cambió de forma`, `${nombre}: still, but its spectrum changed shape`)}</h4>
        <p className="prisma-texto">
          {tr(
            `Entre la primera y la última pasada se corrió solo ${fmt(c.dpos!, 2)}″ (las estrellas quietas del campo, ${fmt(c.quietas_mediana ?? 0, 2)}″ en mediana): no se mueve, y el buscador no la toma por un objeto en movimiento (0 candidatas). Entre las pasadas 2 y 3 la forma de su espectro cambió (D = ${fmt(c.D_pares?.["2-3"] ?? 0, 2)}); entre la 1 y la 2 (D = ${fmt(c.D_pares?.["1-2"] ?? 0, 2)}) y entre la 1 y la 3 (D = ${fmt(c.D_pares?.["1-3"] ?? 0, 2)}) queda al nivel de las estrellas del campo (mediana ${fmt(c.D_campo_mediana ?? 0, 2)}). Es compatible con una estrella joven variable, sin descartar el efecto de su propio halo, que es muy brillante.`,
            `Between the first and last pass it shifted only ${fmt(c.dpos!, 2)}″ (the field's static stars: ${fmt(c.quietas_mediana ?? 0, 2)}″ median): it does not move, and the search does not take it for a moving object (0 candidates). Between passes 2 and 3 the shape of its spectrum changed (D = ${fmt(c.D_pares?.["2-3"] ?? 0, 2)}); between 1 and 2 (D = ${fmt(c.D_pares?.["1-2"] ?? 0, 2)}) and between 1 and 3 (D = ${fmt(c.D_pares?.["1-3"] ?? 0, 2)}) it stays at the level of the field stars (median ${fmt(c.D_campo_mediana ?? 0, 2)}). This fits a variable young star, without ruling out the effect of its own very bright halo.`,
          )}
        </p>
      </div>
    );
  return (
    <div>
      <h4>{tr(`${nombre}: demasiado brillante`, `${nombre}: too bright`)}</h4>
      <p className="prisma-texto">
        {tr(
          `El centro está saturado en ${c.n_sat} de ${c.n_exp} exposiciones (${fmt((c.frac_saturadas ?? 0) * 100, 2)} %): queda fuera de lo que este método puede medir. Es el límite honesto del método.`,
          `The centre is saturated in ${c.n_sat} of ${c.n_exp} exposures (${fmt((c.frac_saturadas ?? 0) * 100, 2)}%): it is outside what this method can measure. That is the method's honest limit.`,
        )}
      </p>
    </div>
  );
}
