/**
 * Resultado de la consulta a SIMBAD del último punto elegido (clic en el cielo o «Explorar una zona al azar»),
 * en la barra de filtros del Visor. Solo la línea que cambia: buscando / ya conocido / nada registrado / error.
 * La consulta es la del panel «¿Qué hay aquí?» de Juan Pablo (apuntar/queHayAqui.ts).
 */
import { useEffect, useState } from "react";
import { queHayAqui, RADIO_ARCSEC, tipoLegible, type Hallazgo } from "../apuntar/queHayAqui";
import { useIdioma } from "../state/idioma";

type Punto = { ra: number; dec: number };
type Estado =
  | { fase: "buscando" }
  | { fase: "listo"; hallazgos: Hallazgo[] }
  | { fase: "error" };

export default function Deteccion({ punto, epoca }: { punto: Punto | null; epoca: number }) {
  const { tr } = useIdioma();
  const [estado, setEstado] = useState<Estado | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!punto) return;
    const ctl = new AbortController();
    setEstado({ fase: "buscando" });
    queHayAqui(punto.ra, punto.dec, epoca, ctl.signal)
      .then((hallazgos) => setEstado({ fase: "listo", hallazgos }))
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        console.error("[deteccion] SIMBAD no respondió:", e);
        setEstado({ fase: "error" });
      });
    return () => ctl.abort();
  }, [punto, epoca, intento]);

  if (!punto || !estado)
    return (
      <p className="deteccion deteccion-pista">
        {tr("Haz clic en el cielo y te digo si SIMBAD ya lo conoce.", "Click on the sky and I will tell you whether SIMBAD already knows it.")}
      </p>
    );

  return (
    <p className="deteccion" aria-live="polite">
      {estado.fase === "buscando" && tr("Consultando SIMBAD…", "Asking SIMBAD…")}
      {estado.fase === "error" && (
        <>
          {tr("SIMBAD no respondió.", "SIMBAD did not answer.")}{" "}
          <button type="button" className="deteccion-reintentar" onClick={() => setIntento((n) => n + 1)}>
            {tr("Reintentar", "Retry")}
          </button>
        </>
      )}
      {estado.fase === "listo" && estado.hallazgos.length > 0 && (
        <>
          <strong>
            {tr("Ya conocido", "Already known")}: {estado.hallazgos[0].nombre}
          </strong>{" "}
          ({tipoLegible(estado.hallazgos[0].tipo)}), {estado.hallazgos[0].distancia.toFixed(1)}″{" "}
          {tr("del punto elegido", "from the chosen spot")}
          {estado.hallazgos[0].propagado ? tr(", contando lo que se movió desde el año 2000", ", counting how far it moved since 2000") : ""}.
          {estado.hallazgos.length > 1 &&
            tr(` Hay ${estado.hallazgos.length - 1} más en el mismo punto.`, ` ${estado.hallazgos.length - 1} more at the same spot.`)}
        </>
      )}
      {estado.fase === "listo" && estado.hallazgos.length === 0 && (
        <>
          <strong>{tr("Nada registrado en SIMBAD aquí", "Nothing listed in SIMBAD here")}</strong> ({tr("a menos de", "within")} {RADIO_ARCSEC}″):{" "}
          {tr("si ves algo que se mueve o cambia, ¡vale la pena revisarlo!", "if you see something moving or changing, it is worth a closer look!")}
        </>
      )}
    </p>
  );
}
