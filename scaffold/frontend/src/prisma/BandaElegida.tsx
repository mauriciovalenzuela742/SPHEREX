/**
 * Propuesta «espectro único»: lo que pasa al elegir una banda en la Huella espectral, visto JUNTO al gráfico
 * (el mapa queda muy arriba). Rótulo de la banda, una miniatura del mapa en esa banda (captura de Aladin, sirve
 * para las seis bandas porque sale del cielo completo de SPHEREx) y la foto del Explorador si esa banda está
 * cargada; si no lo está, una línea que dice por qué.
 */
import { useEffect, useRef, useState } from "react";
import { dibujar } from "../explorador/render";
import { clave, type DatosSpherex } from "../explorador/useDatosSpherex";
import { useIdioma } from "../state/idioma";
import { useFmt } from "./formato";

const RANGOS: Record<number, [number, number]> = { 1: [0.75, 1.09], 2: [1.1, 1.62], 3: [1.63, 2.41], 4: [2.42, 3.82], 5: [3.83, 4.41], 6: [4.42, 5.0] };

type Props = {
  banda: number;
  datos: DatosSpherex;
  /** Captura del mapa del cielo (data URL), o undefined si el mapa aún no está listo. */
  capturarMapa?: () => Promise<string | undefined>;
};

export default function BandaElegida({ banda, datos, capturarMapa }: Props) {
  const { tr } = useIdioma();
  const fmt = useFmt();
  const { grid, frames, escalas, version, cargar, mensaje, visita } = datos;
  const [a, z] = RANGOS[banda] ?? [0, 0];

  // Miniatura del mapa: se captura un rato después del cambio (Aladin tiene que bajar los mosaicos de esa banda).
  const [mapa, setMapa] = useState<{ banda: number; url: string } | null>(null);
  useEffect(() => {
    if (!capturarMapa) return;
    let vivo = true;
    const capturar = () =>
      capturarMapa()
        .then((url) => vivo && url && setMapa({ banda, url }))
        .catch(() => undefined);
    const ts = [900, 2500, 6000].map((ms) => window.setTimeout(capturar, ms));
    return () => {
      vivo = false;
      ts.forEach(clearTimeout);
    };
  }, [banda, capturarMapa]);

  // Foto del Explorador en esa banda (la visita que está mirando, o la última).
  const visitas = grid?.visits[banda] ?? [];
  const enExplorador = datos.banda === banda;
  const v = enExplorador ? visita : visitas.length - 1;
  const fr = visitas.length ? frames.current.get(clave(banda, v)) : undefined;
  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const esc = escalas.current.get(banda);
    if (lienzo.current && fr && esc) dibujar(lienzo.current, fr, undefined, esc, "imagen");
  }, [fr, banda, version, escalas]);

  const cargadas = grid ? grid.bands.filter((b) => grid.visits[b]?.length).map((b) => `D${b}`) : [];
  let aviso = "";
  if (!fr) {
    if (!grid) aviso = mensaje || tr("El Explorador todavía no tiene fotos.", "The Explorer has no photos yet.");
    else if (!cargar.includes(banda) || !visitas.length)
      aviso = tr(
        `D${banda} no está cargada en el Explorador${cargadas.length ? ` (solo ${cargadas.join(", ")})` : ""}. Para bajarla, márcala en «Qué cargar»; necesita que IRSA responda.`,
        `D${banda} is not loaded in the Explorer${cargadas.length ? ` (only ${cargadas.join(", ")})` : ""}. To download it, tick it in “What to load”; IRSA has to be responding.`,
      );
    else aviso = tr(`Bajando las fotos de D${banda}…`, `Downloading the D${banda} photos…`);
  }

  const rotulo = fr && enExplorador
    ? tr(`Mapa y Explorador en D${banda}`, `Map and Explorer in D${banda}`)
    : tr(`Mapa en D${banda}`, `Map in D${banda}`);

  return (
    <aside className="banda-elegida" aria-live="polite" style={{ borderColor: `var(--b${banda})` }}>
      <p className="be-rotulo">
        <span style={{ color: `var(--b${banda})` }}>{rotulo}</span> · {fmt(a, 2)}–{fmt(z, 2)} µm
      </p>
      <figure className="be-mini">
        {mapa && mapa.banda === banda ? (
          <img src={mapa.url} alt={tr(`El mapa del cielo en D${banda}`, `The sky map in D${banda}`)} />
        ) : (
          <div className="be-vacio">{tr(`Cargando el mapa en D${banda}…`, `Loading the map in D${banda}…`)}</div>
        )}
        <figcaption>{tr("Mapa del cielo (todas las fechas)", "Sky map (all dates)")}</figcaption>
      </figure>
      {fr ? (
        <figure className="be-mini">
          <canvas ref={lienzo} aria-label={tr(`Foto del Explorador en D${banda}`, `Explorer photo in D${banda}`)} />
          <figcaption>
            {tr("Explorador", "Explorer")} · D{banda} · {fr.meta.t.slice(0, 10)}
          </figcaption>
        </figure>
      ) : (
        <p className="be-aviso">{aviso}</p>
      )}
    </aside>
  );
}
