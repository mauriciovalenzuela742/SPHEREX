/**
 * Apuntar a cualquier parte del cielo. Dueño: Juan Pablo (V2).
 * - `EntradaCoordenadas`: los campos A.R./Dec de la barra del visor, en grados o sexagesimal.
 * - `PanelDescubrir`: «¿Qué hay aquí?» (SIMBAD en el punto del clic), «Explorar una zona al azar» y
 *   «¿Encontraste algo?» (remite al enlace de WiseView sobre el mapa y a Backyard Worlds).
 */
import { useEffect, useState } from "react";
import { decASexa, errorEnIngles, leerDec, leerPar, leerRA, raASexa } from "./coordenadas";
import { puntoAlAzar, icrsAGalactica } from "./galactica";
import { queHayAqui, RADIO_ARCSEC, tipoLegible, type Hallazgo } from "./queHayAqui";
import { useIdioma } from "../state/idioma";
import { nombrarPedido, pedirEspectro } from "./espectroPunto";

type Punto = { ra: number; dec: number };

export function EntradaCoordenadas({ ra, dec, onIr }: Punto & { onIr: (p: Partial<Punto>) => void }) {
  const [textoRa, setTextoRa] = useState(String(ra));
  const [textoDec, setTextoDec] = useState(String(dec));
  const [error, setError] = useState<string | null>(null);
  const { tr } = useIdioma();
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
      <label
        title={tr(
          "En grados (133.795) o en horas, minutos y segundos (08 55 10.83). También puedes pegar A.R. y Dec juntas.",
          "In degrees (133.795) or in hours, minutes and seconds (08 55 10.83). You can also paste R.A. and Dec together.",
        )}
      >
        {tr("A.R. (° o h m s)", "R.A. (° or h m s)")}
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
      <label title={tr("En grados (-7.245) o en grados, minutos y segundos (-07 14 42.5).", "In degrees (-7.245) or in degrees, minutes and seconds (-07 14 42.5).")}>
        {tr("Dec (° o ° ′ ″)", "Dec (° or ° ′ ″)")}
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
        {/* Los errores llegan en español desde coordenadas.ts; con la página en inglés se traducen. */}
        {error ? tr(error, errorEnIngles(error)) :
          `= ${raASexa(ra)}, ${decASexa(dec)} · ${tr("escribe en grados o en sexagesimal y pulsa Enter", "type degrees or sexagesimal and press Enter")}`}
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
  const { tr } = useIdioma();

  useEffect(() => {
    if (!punto) return;
    const ctl = new AbortController();
    setEstado({ fase: "buscando", punto });
    queHayAqui(punto.ra, punto.dec, epoca, ctl.signal)
      .then((hallazgos) => {
        setEstado({ fase: "listo", punto, hallazgos });
        if (hallazgos.length) nombrarPedido(punto.ra, punto.dec, hallazgos[0].nombre);
      })
      .catch((e: unknown) => {
        if (ctl.signal.aborted) return;
        console.error("[apuntar] SIMBAD no respondió:", e);
        setEstado({ fase: "error", punto, error: e instanceof Error ? e.message : String(e) });
      });
    return () => ctl.abort();
  }, [punto, epoca, intento]);

  const [l, b] = icrsAGalactica(ra, dec);

  return (
    <div className="tarjeta descubrir" data-tour="descubrir" style={{ marginTop: 8 }}>
      <strong>{tr("¿Qué hay aquí?", "What is here?")}</strong>
      <div aria-live="polite" style={{ margin: "0.4rem 0" }}>
        {estado.fase === "nada" && (
          <p>{tr("Haz clic en cualquier punto del cielo y te digo si ya está registrado en SIMBAD.", "Click anywhere on the sky and I will tell you whether SIMBAD already lists it.")}</p>
        )}
        {estado.fase === "buscando" && <p>{tr("Consultando SIMBAD (puede tardar unos segundos)…", "Asking SIMBAD (it may take a few seconds)…")}</p>}
        {estado.fase === "listo" && estado.hallazgos.length > 0 && (
          <p>
            <strong>
              {tr("Ya conocido", "Already known")}: {estado.hallazgos[0].nombre}
            </strong>{" "}
            ({tipoLegible(estado.hallazgos[0].tipo)}), {tr("a ", "")}
            {estado.hallazgos[0].distancia.toFixed(1)}″{" "}
            {tr("del clic", "from the click")}
            {estado.hallazgos[0].propagado
              ? tr(", contando lo que se movió desde el año 2000", ", counting how far it moved since 2000")
              : ""}
            .
            {estado.hallazgos.length > 1 &&
              tr(
                ` Hay ${estado.hallazgos.length - 1} objeto(s) más registrados en el mismo punto.`,
                ` ${estado.hallazgos.length - 1} more object(s) listed at the same spot.`,
              )}
          </p>
        )}
        {estado.fase === "listo" && estado.hallazgos.length === 0 && (
          <p>
            <strong>{tr("Nada registrado en SIMBAD en este punto", "Nothing listed in SIMBAD at this spot")}</strong> (
            {tr("a menos de", "within")} {RADIO_ARCSEC}″):{" "}
            {tr("si ves algo que se mueve o cambia, ¡puede valer la pena revisarlo!", "if you see something moving or changing, it may be worth a closer look!")}
          </p>
        )}
        {estado.fase !== "nada" && (
          <p>
            <button
              type="button"
              onClick={() => {
                const h = estado.fase === "listo" ? estado.hallazgos[0] : undefined;
                pedirEspectro({
                  ra: h?.ra ?? estado.punto.ra,
                  dec: h?.dec ?? estado.punto.dec,
                  nombre: h?.nombre,
                  pmra: h?.pmra,
                  pmdec: h?.pmdec,
                  epoca: h?.epoca,
                  origen: "clic",
                });
              }}
              title={tr(
                "Mide su brillo en las fotos de SPHEREx entre 0,75 y 5 µm y estima qué tipo de objeto podría ser",
                "Measures its brightness in SPHEREx photos from 0.75 to 5 µm and estimates what kind of object it could be",
              )}
            >
              {tr("Ver el espectro de este punto", "See the spectrum of this spot")}
            </button>
          </p>
        )}
        {estado.fase === "error" && (
          <p>
            {tr("SIMBAD no respondió, así que no sé qué hay aquí.", "SIMBAD did not answer, so I can't tell what is here.")}{" "}
            <button type="button" onClick={() => setIntento((n) => n + 1)}>
              {tr("Reintentar", "Retry")}
            </button>
          </p>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => onAzar(puntoAlAzar(20))}
          title={tr(
            "Lejos del plano de la Vía Láctea (más de 20° de latitud galáctica), donde el cielo está menos lleno",
            "Away from the Milky Way plane (more than 20° of galactic latitude), where the sky is less crowded",
          )}
        >
          {tr("Explorar una zona al azar", "Explore a random area")}
        </button>
        <span style={{ fontSize: "0.8rem", color: "var(--suave)" }}>
          {tr("Latitud galáctica aquí", "Galactic latitude here")}: {b >= 0 ? "+" : ""}
          {b.toFixed(1)}° ({tr("longitud", "longitude")} {l.toFixed(1)}°)
        </span>
      </div>
      <p style={{ marginTop: 8 }}>
        {/* El enlace a WiseView de este punto es «Ver en WiseView ↗», sobre el mapa (Visor.tsx): uno solo por vista. */}
        <strong>{tr("¿Encontraste algo?", "Found something?")}</strong>{" "}
        {tr(
          "Míralo con «Ver en WiseView ↗», sobre el mapa (las imágenes de WISE y NEOWISE de 2010 a 2024, en el mismo punto) y, si se sigue moviendo, súmate a",
          "Check it with “View in WiseView ↗” above the map (WISE and NEOWISE images from 2010 to 2024, same spot) and, if it keeps moving, join",
        )}{" "}
        <a href="https://www.backyardworlds.org" target="_blank" rel="noopener noreferrer">
          Backyard Worlds
        </a>
        {tr(", donde voluntarios buscan enanas marrones y el posible Planeta 9.", ", where volunteers hunt for brown dwarfs and the possible Planet 9.")}
      </p>
    </div>
  );
}
