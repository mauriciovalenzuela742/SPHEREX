/**
 * «El fondo del cielo» (Prisma, V2): espectro del brillo difuso medido entre las estrellas, sin restar la mediana,
 * en los campos de los 5 objetos (PR #58, eda/huella_espectral/analisis_fondo.py, 1.918 recortes).
 * Muestra la luz zodiacal (más brillante cerca de la eclíptica), la ventana oscura cerca de 3 µm y el exceso de luz
 * galáctica en Barnard. Las líneas de nebulosas son un criterio propuesto: en estos campos no se detectó ninguna.
 * Cifras: public/precalc/huella/fondo.json (copiadas de analisis_fondo_resultado.json).
 */
import { useIdioma } from "../state/idioma";
import { useFmt } from "./formato";
import { esFondo, NOMBRES, useHuella, type Fondo } from "../huella/precalc";

const W = 520, H = 250, M = { l: 48, r: 14, t: 16, b: 40 };
const L0 = 0.75, L1 = 5.0;
const COL: Record<string, string> = { wise_0855: "var(--acento)", eps_ind_b: "#6ecbff", barnard: "#9be38a", rw_aur: "#ff6b9a" };
const FIRMAS_EN: Record<string, string> = { "Hielo H2O": "H₂O ice", "Emision PAH": "PAH", "H I Brackett alpha (Br_a)": "Brα", "Hielo CO2": "CO₂ ice" };
/** Los hielos se ven en absorción (falta luz); PAH y Brα, en emisión (sobra luz). */
const ABSORCION = new Set(["Hielo H2O", "Hielo CO2"]);
const FIRMAS_ES: Record<string, string> = { "Hielo H2O": "hielo H₂O", "Emision PAH": "PAH", "H I Brackett alpha (Br_a)": "Brα", "Hielo CO2": "hielo CO₂" };

export default function FondoCielo({ id }: { id: string | null }) {
  const { tr, idioma } = useIdioma();
  const fmt = useFmt();
  const f = useHuella<Fondo>("fondo", esFondo);
  if (!f) return null;
  const campos = f.campos.filter((c) => !c.saturado);
  const vals = campos.flatMap((c) => c.espectro.map((s) => s.p25)).filter((v) => v > 0);
  const y0 = Math.log10(Math.min(...vals) * 0.8), y1 = Math.log10(Math.max(...vals) * 1.25);
  const xa = (l: number) => M.l + ((l - L0) / (L1 - L0)) * (W - M.l - M.r);
  const ya = (v: number) => H - M.b - ((Math.log10(v) - y0) / (y1 - y0)) * (H - M.t - M.b);
  const ventana = f.campos.flatMap((c) => c.espectro.filter((s) => s.lo >= 2.6 && s.hi <= 3.7).map((s) => ({ id: c.id, v: s.p25 })));
  const minimo = (cid: string) => Math.min(...ventana.filter((x) => x.id === cid).map((x) => x.v));
  const halo = f.halo;
  const pct = (r: [number, number]) => `${fmt(r[0] * 100, 1)}–${fmt(r[1] * 100, 1)} %`;
  const ticksY = [0.1, 0.2, 0.5, 1].filter((v) => Math.log10(v) >= y0 && Math.log10(v) <= y1);
  const firmas = idioma === "en" ? FIRMAS_EN : FIRMAS_ES;
  const sat = f.campos.find((c) => c.saturado);
  // Fondo de Barnard frente a los otros campos sin saturar, en el tramo de ~1,3 µm (percentil 25)
  const a13 = (cid: string) => f.campos.find((c) => c.id === cid)?.espectro.reduce((m, s) => (Math.abs(s.lam - 1.3) < Math.abs(m.lam - 1.3) ? s : m)).p25 ?? NaN;
  const razones = campos.filter((c) => c.id !== "barnard").map((c) => a13("barnard") / a13(c.id)).filter(Number.isFinite);
  const rB = [Math.min(...razones), Math.max(...razones)];

  return (
    <section className="fc" aria-labelledby="fc-titulo">
      <h3 id="fc-titulo">{tr("El fondo del cielo: lo que hay entre las estrellas", "The sky background: what lies between the stars")}</h3>
      <p className="prisma-texto">
        {tr(
          `Brillo difuso medido en ${fmt(f.n_pix, 0)} píxeles sin estrellas de ${fmt(f.n_exp, 0)} recortes de SPHEREx, sin restar nada. Cada línea es un campo (percentil 25, para que las estrellas débiles no lo suban).`,
          `Diffuse brightness measured on ${fmt(f.n_pix, 0)} star-free pixels from ${fmt(f.n_exp, 0)} SPHEREx cutouts, with nothing subtracted. Each line is one field (25th percentile, so faint stars do not push it up).`,
        )}
      </p>
      <figure className="fc-figura">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr("Espectro del fondo del cielo en 4 campos", "Sky background spectrum in 4 fields")}>
          <rect x={xa(2.66)} y={M.t} width={xa(3.64) - xa(2.66)} height={H - M.t - M.b} className="fc-ventana" />
          <text x={xa(3.15)} y={M.t + 12} textAnchor="middle" className="h-eti">{tr("ventana oscura", "dark window")}</text>
          {f.firmas.map((s) => (
            <g key={s.firma}>
              <line x1={xa(s.lam)} x2={xa(s.lam)} y1={M.t + 18} y2={H - M.b} className={ABSORCION.has(s.firma) ? "fc-firma abs" : "fc-firma"} />
              <text x={xa(s.lam) + 2} y={H - M.b - 4} className="h-mol-t" transform={`rotate(-90 ${xa(s.lam) + 2} ${H - M.b - 4})`}>{firmas[s.firma] ?? s.firma}</text>
            </g>
          ))}
          {ticksY.map((v) => (
            <g key={v}>
              <line x1={M.l} x2={W - M.r} y1={ya(v)} y2={ya(v)} className="h-grilla" />
              <text x={M.l - 6} y={ya(v) + 4} textAnchor="end" className="h-tick">{fmt(v, 1)}</text>
            </g>
          ))}
          {[1, 2, 3, 4, 5].map((l) => <text key={l} x={xa(l)} y={H - M.b + 14} textAnchor="middle" className="h-tick">{l}</text>)}
          <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="h-eje" />
          <line x1={M.l} x2={M.l} y1={M.t} y2={H - M.b} className="h-eje" />
          <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" className="h-eti">{tr("Longitud de onda (µm)", "Wavelength (µm)")}</text>
          <text transform={`translate(12 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" className="h-eti">MJy/sr</text>
          {campos.map((c) => (
            <polyline key={c.id} fill="none" stroke={COL[c.id] ?? "#ccc"} strokeWidth={c.id === id ? 3 : 1.6} opacity={id && c.id !== id ? 0.55 : 1}
              points={c.espectro.filter((s) => s.p25 > 0).map((s) => `${xa(s.lam)},${ya(s.p25)}`).join(" ")} />
          ))}
        </svg>
        <ul className="h-leyenda">
          {campos.map((c) => (
            <li key={c.id}>
              <span style={{ background: COL[c.id] }} />
              {NOMBRES[c.id]} ({tr("latitud eclíptica", "ecliptic latitude")} {fmt(c.beta, 1)}°)
            </li>
          ))}
        </ul>
      </figure>
      <ul className="fc-lista">
        <li>
          {tr(
            `Luz zodiacal (polvo del sistema solar): cerca de la eclíptica el fondo es más brillante. A 4,1 µm, RW Aur (${fmt(campos.find((c) => c.id === "rw_aur")?.beta ?? 0, 1)}°) tiene ${fmt(f.razon_D5_rw_eps, 2)}× el brillo de ε Ind B (${fmt(campos.find((c) => c.id === "eps_ind_b")?.beta ?? 0, 1)}°); correlación con la latitud r = ${fmt(f.r_D5_beta, 2)}, con solo 4 campos. Parte del brillo de RW Aur puede venir de su propio halo y de estar cerca del plano galáctico.`,
            `Zodiacal light (Solar System dust): near the ecliptic the background is brighter. At 4.1 µm, RW Aur (${fmt(campos.find((c) => c.id === "rw_aur")?.beta ?? 0, 1)}°) is ${fmt(f.razon_D5_rw_eps, 2)}× as bright as ε Ind B (${fmt(campos.find((c) => c.id === "eps_ind_b")?.beta ?? 0, 1)}°); correlation with latitude r = ${fmt(f.r_D5_beta, 2)}, from only 4 fields. Part of RW Aur's brightness may come from its own halo and from lying near the Galactic plane.`,
          )}
        </li>
        <li>
          {tr(
            `Ventana oscura cerca de 3 µm (tramos de 2,66 a 3,64 µm): el cielo más oscuro, ${fmt(minimo("eps_ind_b"), 3)} MJy/sr en ε Ind B y ${fmt(minimo("wise_0855"), 3)} en WISE 0855. Ahí la luz del Sol reflejada en el polvo ya es débil y el brillo térmico del polvo recién empieza a subir.`,
            `Dark window near 3 µm (bins from 2.66 to 3.64 µm): the darkest sky, ${fmt(minimo("eps_ind_b"), 3)} MJy/sr at ε Ind B and ${fmt(minimo("wise_0855"), 3)} at WISE 0855. There, sunlight scattered by dust is already faint and the dust's thermal glow is only starting to rise.`,
          )}
        </li>
        <li>
          {tr(
            `Barnard: a 1,3 µm su fondo es ${fmt(rB[0], 1)}–${fmt(rB[1], 1)}× más brillante que el de los otros campos. Puede ser luz de la Vía Láctea (está a ${fmt(campos.find((c) => c.id === "barnard")?.b ?? 0, 0)}° de su plano) o el halo de la propia estrella, que es muy brillante: no lo separamos.`,
            `Barnard: at 1.3 µm its background is ${fmt(rB[0], 1)}–${fmt(rB[1], 1)}× brighter than the other fields. It may be Milky Way light (it sits ${fmt(campos.find((c) => c.id === "barnard")?.b ?? 0, 0)}° from its plane) or the halo of the star itself, which is very bright: we did not separate the two.`,
          )}
        </li>
        {sat && (
          <li>
            {tr(
              `${NOMBRES[sat.id]} no se grafica: su halo saturado domina el fondo de todo el recorte.`,
              `${NOMBRES[sat.id]} is not plotted: its saturated halo dominates the background of the whole cutout.`,
            )}
          </li>
        )}
      </ul>
      <details className="fc-nebulosas">
        <summary>{tr("¿Se pueden ver nebulosas? Criterio propuesto, aún sin aplicar", "Can nebulae be seen? Proposed criterion, not yet applied")}</summary>
        <p>
          {tr(
            `Tras borrar las estrellas, lo que queda distingue dos cosas. El halo de una estrella brillante deja anillos positivos y negativos a la vez: en RW Aur, ${pct(halo.rw_aur.pos3)} de los píxeles quedan sobre +3σ y ${pct(halo.rw_aur.neg3)} bajo −3σ (dispersión ${fmt(halo.rw_aur.std_norm[0], 1)}–${fmt(halo.rw_aur.std_norm[1], 1)}σ). En WISE 0855 el residuo es compatible con ruido (${fmt(halo.wise_0855.std_norm[0], 2)}–${fmt(halo.wise_0855.std_norm[1], 2)}σ). Una nebulosa dejaría una señal extendida y de un solo signo en las bandas marcadas en el gráfico: un exceso de luz donde el gas o el polvo emiten (PAH a 3,29 µm, hidrógeno Brα a 4,05 µm) o una falta de luz donde los hielos absorben (hielo de agua a 3,05 µm, hielo de CO₂ a 4,26 µm; líneas punteadas más tenues).`,
            `After removing the stars, what remains tells two things apart. A bright star's halo leaves positive and negative rings at once: at RW Aur, ${pct(halo.rw_aur.pos3)} of pixels sit above +3σ and ${pct(halo.rw_aur.neg3)} below −3σ (scatter ${fmt(halo.rw_aur.std_norm[0], 1)}–${fmt(halo.rw_aur.std_norm[1], 1)}σ). At WISE 0855 the residual is consistent with noise (${fmt(halo.wise_0855.std_norm[0], 2)}–${fmt(halo.wise_0855.std_norm[1], 2)}σ). A nebula would leave an extended, single-sign signal in the bands marked on the plot: extra light where gas or dust emits (PAH at 3.29 µm, hydrogen Brα at 4.05 µm) or missing light where ices absorb (water ice at 3.05 µm, CO₂ ice at 4.26 µm; fainter dotted lines).`,
          )}
        </p>
        <p className="h-nota">{tr("En estos 5 campos todavía no se buscaron nebulosas: es el criterio para hacerlo, no un hallazgo.", "Nebulae have not yet been searched for in these 5 fields: this is the criterion to do it, not a finding.")}</p>
      </details>
    </section>
  );
}
