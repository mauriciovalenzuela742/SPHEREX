/**
 * «Qué cambió» entre pasadas (Prisma): razón de flujo por tramo de λ entre la primera y la última pasada con
 * medidas en común, y una frase simple. Solo se afirma un cambio si supera 3σ (con piso de calibración del
 * 5 %, ver pasadas.ts): el ruido no se presenta como variabilidad.
 */
import { usePrisma } from "../content/prisma";
import { useIdioma } from "../state/idioma";
import { useFmt } from "./formato";
import { cambios, etiquetaPasada, resumenCambio, type Pasada } from "./pasadas";

export default function QueCambio({ pasadas, id }: { pasadas: Pasada[]; id?: string | null }) {
  const prisma = usePrisma();
  const { idioma, tr } = useIdioma();
  const fmt = useFmt();
  if (pasadas.length < 2) return null;
  const c = cambios(pasadas);
  const t = prisma.cambio;
  if (!c) return <div className="qc"><h4>{t.titulo}</h4><p className="h-nota">{t.sinComun}</p></div>;
  const antes = etiquetaPasada(c.antes, idioma);
  const despues = etiquetaPasada(c.despues, idioma);
  const res = resumenCambio(c);
  const rango = (a: number, z: number) => `${fmt(a, 2)}–${fmt(z, 2)} µm`;
  return (
    <div className="qc">
      <h4>{t.titulo}</h4>
      <p className="qc-frase">
        {res.length
          ? res.map((r) => t.frase(r.sube, rango(r.a, r.z), c.meses, fmt(r.razon, 2))).join(" ")
          : t.sinCambio(c.tramos.length)}
      </p>
      {c.parcial && <p className="h-aviso">{t.parcial}</p>}
      {id === "rw_aur" && (
        // Cifras de eda/huella_espectral/cinco_objetos_resultado.json (PR #58)
        <p className="qc-quieta">
          {tr(
            "No se movió (0,28″ entre la primera y la última pasada), pero la forma de su espectro cambió entre las pasadas 2 y 3 (distancia espectral D = 17,31; entre las otras pasadas queda al nivel de las estrellas del campo). Es compatible con una estrella joven variable, no con un objeto en movimiento. Ver «Seguir un astro por su huella espectral», más abajo.",
            "It did not move (0.28″ between the first and last pass), but the shape of its spectrum changed between passes 2 and 3 (spectral distance D = 17.31; between the other passes it stays at the level of the field stars). This fits a variable young star, not a moving object. See “Tracking an object by its spectral fingerprint” below.",
          )}
        </p>
      )}
      <p className="h-nota">{t.comparando(antes, despues)}</p>
      <ul className="qc-tramos">
        {c.tramos.map((tr) => (
          <li key={tr.a} className={tr.significativo ? (tr.razon > 1 ? "sube" : "baja") : ""}>
            <span>{rango(tr.a, tr.z)}</span>
            <span className="qc-barra">
              <span style={{ width: `${Math.min(100, Math.abs(Math.log2(tr.razon)) * 100)}%` }} />
            </span>
            <span>
              ×{fmt(tr.razon, 2)} · {fmt(tr.sigma, 1)}σ{tr.significativo ? "" : ` (${t.ruido})`}
            </span>
          </li>
        ))}
      </ul>
      <p className="h-nota">
        {t.regla}{" "}
        {tr(
          "El cambio Doppler por la órbita de la Tierra entre pasadas semestrales (hasta 58,8 km/s, < 0,02 % en λ) es más de 100 veces menor que la resolución de SPHEREx (2.300–8.565 km/s por canal), por lo que no altera el espectro entre pasadas.",
          "The barycentric Doppler shift from Earth's orbit between six-month passes (up to 58.8 km/s, < 0.02% in λ) is over 100 times smaller than SPHEREx's spectral resolution (2,300–8,565 km/s per channel), so it does not alter the spectrum across passes.",
        )}
      </p>
    </div>
  );
}
