/**
 * Apuntar a cualquier parte del cielo. Dueño: Juan Pablo (V2).
 * - `EntradaCoordenadas`: los campos A.R./Dec de la barra del visor, en grados o sexagesimal.
 * - `PanelDescubrir`: «¿Qué hay aquí?» (SIMBAD en el punto del clic), «Explorar una zona al azar» y
 *   «¿Encontraste algo?» (WiseView y Backyard Worlds).
 */
import { useEffect, useState } from "react";
import { decASexa, leerDec, leerPar, leerRA, raASexa } from "./coordenadas";
import { puntoAlAzar, icrsAGalactica } from "./galactica";
import { queHayAqui, RADIO_ARCSEC, tipoLegible, type Hallazgo } from "./queHayAqui";

type Punto = { ra: number; dec: number };

export function EntradaCoordenadas({ ra, dec, onIr }: Punto & { onIr: (p: Partial<Punto>) => void }) {
  const [textoRa, setTextoRa] = useState(String(ra));
  const [textoDec, setTextoDec] = useState(String(dec));
  const [error, setError] = useState<string | null>(null);
  // Si la posición cambia desde fuera (botones, clic en el cielo), los campos la muestran.
  useEffect(() => setTextoRa(String(ra)), [ra]);
  useEffect(() => setTextoDec(String(dec)), [dec]);

  const aplicar = (campo: "ra" | "dec") => {
    const texto = campo === "ra" ? textoRa : textoDec;
    // Si pegaron el par completo («08 55 10.83 -07 14 42.5») en un campo, se usan los dos.
    const par = leerPar(texto);
    if (par) {
      if (!par.ok) return setError(par.error);
      setError(null);
      setTextoRa(String(par.ra));
      setTextoDec(String(par.dec));
      return onIr({ ra: Number(par.ra.toFixed(6)), dec: Number(par.dec.toFixed(6)) });
    }
    const r = campo === "ra" ? leerRA(texto) : leerDec(texto);
    if (!r.ok) return setError(r.error);
    setError(null);
    const valor = Number(r.valor.toFixed(6));
    if (campo === "ra") setTextoRa(String(valor));
    else setTextoDec(String(valor));
    if (valor !== (campo === "ra" ? ra : dec)) onIr({ [campo]: valor });
  };
  const teclas = (campo: "ra" | "dec") => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") aplicar(campo);
  };

  return (
    <>
      <label title="En grados (133.795) o en horas, minutos y segundos (08 55 10.83). También puedes pegar A.R. y Dec juntas.">
        A.R. (° o h m s)
        <input
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          value={textoRa}
          placeholder="08 55 10.83"
          onChange={(e) => setTextoRa(e.target.value)}
          onKeyDown={teclas("ra")}
          onBlur={() => aplicar("ra")}
        />
      </label>
      <label title="En grados (-7.245) o en grados, minutos y segundos (-07 14 42.5).">
        Dec (° o ° ′ ″)
        <input
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          value={textoDec}
          placeholder="-07 14 42.5"
          onChange={(e) => setTextoDec(e.target.value)}
          onKeyDown={teclas("dec")}
          onBlur={() => aplicar("dec")}
        />
      </label>
      <span className="coord-ayuda" role={error ? "alert" : undefined} style={{ flexBasis: "100%", fontSize: "0.8rem", color: error ? "#ff8080" : "var(--suave)" }}>
        {error ?? `= ${raASexa(ra)}, ${decASexa(dec)} · escribe en grados o en sexagesimal y pulsa Enter`}
      </span>
    </>
  );
}

type Estado =
  | { fase: "nada" }
  | { fase: "buscando"; punto: Punto }
  | { fase: "listo"; punto: Punto; hallazgos: Hallazgo[] }
  | { fase: "error"; punto: Punto; error: string };

/** `punto`: lo último que se eligió con un clic o con «al azar» (null = nada todavía). */
export function PanelDescubrir({
  ra,
  dec,
  punto,
  epoca,
  onAzar,
}: Punto & { punto: Punto | null; epoca: number; onAzar: (p: Punto) => void }) {
  const [estado, setEstado] = useState<Estado>({ fase: "nada" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!punto) return;
    const ctl = new AbortController();
    setEstado({ fase: "buscando", punto });
    queHayAqui(punto.ra, punto.dec, epoca, ctl.signal)
      .then((hallazgos) => setEstado({ fase: "listo", punto, hallazgos }))
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        console.error("[apuntar] SIMBAD no respondió:", e);
        setEstado({ fase: "error", punto, error: e instanceof Error ? e.message : String(e) });
      });
    return () => ctl.abort();
  }, [punto, epoca, intento]);

  const [l, b] = icrsAGalactica(ra, dec);
  const wiseview = `http://byw.tools/wiseview#ra=${ra}&dec=${dec}&size=176`;

  return (
    <div className="tarjeta descubrir" data-tour="descubrir" style={{ marginTop: 8 }}>
      <strong>¿Qué hay aquí?</strong>
      <div aria-live="polite" style={{ margin: "0.4rem 0" }}>
        {estado.fase === "nada" && <p>Haz clic en cualquier punto del cielo y te digo si ya está registrado en SIMBAD.</p>}
        {estado.fase === "buscando" && <p>Consultando SIMBAD (puede tardar unos segundos)…</p>}
        {estado.fase === "listo" && estado.hallazgos.length > 0 && (
          <p>
            <strong>Ya conocido: {estado.hallazgos[0].nombre}</strong> ({tipoLegible(estado.hallazgos[0].tipo)}), a{" "}
            {estado.hallazgos[0].distancia.toFixed(1)}″ del clic
            {estado.hallazgos[0].propagado ? ", contando lo que se movió desde el año 2000" : ""}.
            {estado.hallazgos.length > 1 && ` Hay ${estado.hallazgos.length - 1} objeto(s) más registrados en el mismo punto.`}
          </p>
        )}
        {estado.fase === "listo" && estado.hallazgos.length === 0 && (
          <p>
            <strong>Nada registrado en SIMBAD en este punto</strong> (a menos de {RADIO_ARCSEC}″): si ves algo que se mueve o
            cambia, ¡puede valer la pena revisarlo!
          </p>
        )}
        {estado.fase === "error" && (
          <p>
            SIMBAD no respondió, así que no sé qué hay aquí.{" "}
            <button type="button" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => onAzar(puntoAlAzar(20))}
          title="Lejos del plano de la Vía Láctea (más de 20° de latitud galáctica), donde el cielo está menos lleno"
        >
          Explorar una zona al azar
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--suave)" }}>
          Latitud galáctica aquí: {b >= 0 ? "+" : ""}
          {b.toFixed(1)}° (longitud {l.toFixed(1)}°)
        </span>
      </div>
      <p style={{ marginTop: 8 }}>
        <strong>¿Encontraste algo?</strong> Míralo en{" "}
        <a href={wiseview} target="_blank" rel="noopener noreferrer" data-enlace="wiseview">
          WiseView
        </a>{" "}
        (las imágenes de WISE y NEOWISE de 2010 a 2024, en el mismo punto) y, si se sigue moviendo, súmate a{" "}
        <a href="https://www.backyardworlds.org" target="_blank" rel="noopener noreferrer">
          Backyard Worlds
        </a>
        , donde voluntarios buscan enanas marrones y el posible Planeta 9.
      </p>
    </div>
  );
}
