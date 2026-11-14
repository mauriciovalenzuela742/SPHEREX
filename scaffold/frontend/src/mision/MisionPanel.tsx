/**
 * Panel lateral del Modo Misión. Textos: content/mision.ts (Javiera). Fotos: ./Comparador.tsx.
 *
 * El paso vive en la URL (`?mision=intro|1..5|fin`), junto con ra/dec/banda/campo: cada nivel es un
 * enlace que un profesor puede compartir con su curso. Sin puntajes ni niveles bloqueados: siempre se
 * puede avanzar, y equivocarse muestra por qué.
 */
import { useEffect, useState } from "react";
import { CAMPOS, posicionActual } from "../content/campos";
import { mision } from "../content/mision";
import type { Estado } from "../state/url";
import Comparador from "./Comparador";
import { ConGlosario } from "./Glosario";

type Props = { estado: Estado; set: (p: Partial<Estado>) => void };

/** Los niveles del recorrido (los `oculto` no se muestran). */
const NIVELES = mision.niveles.filter((nv) => !nv.oculto);
const TOTAL = NIVELES.length;

function Insignia() {
  return (
    <svg className="insignia" viewBox="0 0 120 120" role="img" aria-label={`Insignia: ${mision.final.insignia}`}>
      <circle cx="60" cy="60" r="54" fill="var(--panel)" stroke="var(--acento)" strokeWidth="5" />
      <circle cx="60" cy="60" r="22" fill="none" stroke="var(--texto)" strokeWidth="3" />
      <ellipse cx="60" cy="60" rx="40" ry="11" fill="none" stroke="var(--acento)" strokeWidth="3" transform="rotate(-20 60 60)" />
      <circle cx="94" cy="34" r="4" fill="var(--acento)" />
      <circle cx="28" cy="88" r="3" fill="var(--texto)" />
    </svg>
  );
}

export default function MisionPanel({ estado, set }: Props) {
  const paso = estado.mision ?? "intro";
  const [pantalla, setPantalla] = useState(0); // pantalla de la introducción
  const [elegida, setElegida] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);

  const n = Number(paso);
  const nivel = Number.isInteger(n) && n >= 1 && n <= TOTAL ? NIVELES[n - 1] : null;
  const campo = nivel ? CAMPOS.find((c) => c.id === nivel.id) : undefined;

  // Al entrar a un nivel: el visor apunta al objeto (posición de hoy), banda y campo del nivel.
  useEffect(() => {
    setElegida(null);
    setCopiado(false);
    if (nivel && campo) {
      const p = posicionActual(campo);
      const lejos = Math.abs(p.ra - estado.ra) > 1e-4 || Math.abs(p.dec - estado.dec) > 1e-4;
      if (lejos || estado.band !== nivel.banda) set({ ...p, band: nivel.banda, size: nivel.size });
    }
  }, [paso]); // eslint-disable-line react-hooks/exhaustive-deps

  const ir = (p: string) => set({ mision: p });

  async function compartir() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  // ── Introducción ───────────────────────────────────────────────────────────────────────────
  if (paso === "intro") {
    const p = mision.intro[pantalla];
    const ultima = pantalla === mision.intro.length - 1;
    return (
      <section className="mision" aria-label={mision.nombre}>
        <p className="mision-etiqueta">
          {mision.nombre} · {pantalla + 1}/{mision.intro.length}
        </p>
        <h2>
          <ConGlosario texto={p.titulo} />
        </h2>
        <p>
          <ConGlosario texto={p.texto} />
        </p>
        <div className="mision-nav">
          {pantalla > 0 && <button onClick={() => setPantalla(pantalla - 1)}>{mision.ui.anterior}</button>}
          <button className="primario" onClick={() => (ultima ? ir("1") : setPantalla(pantalla + 1))}>
            {ultima ? mision.ui.empezar : mision.ui.siguiente}
          </button>
        </div>
      </section>
    );
  }

  // ── Pantalla final ─────────────────────────────────────────────────────────────────────────
  if (paso === "fin") {
    return (
      <section className="mision mision-final" aria-label={mision.final.titulo}>
        <Insignia />
        <p className="mision-etiqueta">{mision.final.insignia}</p>
        <h2>{mision.final.titulo}</h2>
        <p>{mision.final.texto}</p>
        <p className="suave">{mision.final.siguiente}</p>
        <div className="mision-nav">
          <button onClick={() => { setPantalla(0); ir("intro"); }}>{mision.ui.volverEmpezar}</button>
          <button className="primario" onClick={() => set({ mision: undefined })}>{mision.ui.salir}</button>
        </div>
        {mision.final.colabUrl && (
          <a className="boton-colab" href={mision.final.colabUrl} target="_blank" rel="noopener noreferrer">
            {mision.final.colabTexto}
          </a>
        )}
      </section>
    );
  }

  // ── Niveles ────────────────────────────────────────────────────────────────────────────────
  if (!nivel || !campo) {
    return (
      <section className="mision">
        <button onClick={() => ir("intro")}>{mision.ui.volverEmpezar}</button>
      </section>
    );
  }

  const opcion = elegida === null ? null : nivel.opciones[elegida];
  return (
    <section className="mision" aria-label={`${mision.ui.nivel(n, TOTAL)}: ${nivel.titulo}`}>
      <div className="mision-progreso" aria-hidden="true">
        {NIVELES.map((_, i) => (
          <span key={i} className={i + 1 < n ? "hecho" : i + 1 === n ? "actual" : ""} />
        ))}
      </div>
      <p className="mision-etiqueta">
        {mision.ui.nivel(n, TOTAL)} · {campo.nombre}
        {nivel.esDuda && <span className="mision-duda"> · {mision.ui.nivelDuda}</span>}
      </p>
      <h2>{nivel.titulo}</h2>
      <p>
        <ConGlosario texto={nivel.contexto} />
      </p>

      <Comparador id={nivel.id} ra={estado.ra} dec={estado.dec} banda={nivel.banda} size={nivel.size} porVisita={nivel.porVisita} />

      <p className="mision-mirar">
        <strong>{mision.ui.comoMirar}:</strong> <ConGlosario texto={nivel.comoMirar} />
      </p>

      <fieldset className="mision-pregunta">
        <legend>{nivel.pregunta}</legend>
        {nivel.opciones.map((o, i) => (
          <button
            key={i}
            className={elegida === i ? (o.correcta ? "opcion bien" : "opcion mal") : "opcion"}
            aria-pressed={elegida === i}
            onClick={() => setElegida(i)}
          >
            {o.texto}
          </button>
        ))}
      </fieldset>
      {opcion && (
        <p className={`mision-feedback ${opcion.correcta ? "bien" : "mal"}`} role="status">
          <ConGlosario texto={opcion.explicacion} />
        </p>
      )}

      <div className="mision-nav">
        <button onClick={() => (n === 1 ? ir("intro") : ir(String(n - 1)))}>{mision.ui.anterior}</button>
        <button className="primario" onClick={() => ir(n === TOTAL ? "fin" : String(n + 1))}>
          {mision.ui.siguiente}
        </button>
      </div>
      <button className="mision-compartir" onClick={compartir}>
        {copiado ? mision.ui.copiado : mision.ui.compartir}
      </button>
    </section>
  );
}
