/**
 * Prisma: visualizador multibanda de SPHEREx (Ojo infrarrojo + Huella espectral + Escuchar).
 * Comparte los datos y la selección con el Explorador (useDatosSpherex): no descarga nada nuevo.
 * Textos: content/prisma.ts (Javiera). Responde a «Extra kudos if your tool can generate spectra on the fly».
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { prisma } from "../content/prisma";
import type { DatosSpherex } from "../explorador/useDatosSpherex";
import { espectro } from "./fotometria";
import HuellaEspectral from "./HuellaEspectral";
import OjoInfrarrojo from "./OjoInfrarrojo";
import { sonificar } from "./sonificar";
import "./prisma.css";

export default function Prisma({ datos }: { datos: DatosSpherex }) {
  const { grid, frames, version, banda, visita, irA } = datos;
  // `version` sube con cada fotograma que llega: recalcular el espectro entonces.
  const puntos = useMemo(() => (grid ? espectro(frames.current) : []), [grid, version, frames]);

  const [sonando, setSonando] = useState(false);
  const [sinAudio, setSinAudio] = useState(false);
  const parar = useRef<(() => void) | null>(null);
  useEffect(() => () => parar.current?.(), []);
  useEffect(() => {
    parar.current?.(); // si cambia el objeto, se corta el sonido
  }, [grid]);

  function escuchar() {
    if (sonando) {
      parar.current?.();
      return;
    }
    const stop = sonificar(puntos, () => {
      setSonando(false);
      parar.current = null;
    });
    if (!stop) {
      setSinAudio(true);
      return;
    }
    setSinAudio(false);
    parar.current = stop;
    setSonando(true);
  }

  return (
    <section className="prisma" aria-labelledby="prisma-titulo">
      <header className="prisma-cabecera">
        <h2 id="prisma-titulo">{prisma.titulo}</h2>
        <p>{prisma.intro}</p>
      </header>
      {!grid ? (
        <p className="prisma-vacio">{prisma.ojo.sinDatos}</p>
      ) : (
        <div className="prisma-cuerpo">
          <div className="prisma-col">
            <h3>{prisma.ojo.titulo}</h3>
            <p className="prisma-texto">{prisma.ojo.texto}</p>
            <OjoInfrarrojo datos={datos} />
            <div className="prisma-sonido">
              <h3>{prisma.sonido.titulo}</h3>
              <p className="prisma-texto">{prisma.sonido.texto}</p>
              <button className="primario" onClick={escuchar} aria-pressed={sonando}>
                {sonando ? prisma.sonido.parar : prisma.sonido.tocar}
              </button>
              {sinAudio && <p className="prisma-texto">{prisma.sonido.sinAudio}</p>}
            </div>
          </div>
          <div className="prisma-col prisma-ancha">
            <h3>{prisma.huella.titulo}</h3>
            <p className="prisma-texto">{prisma.huella.texto}</p>
            <HuellaEspectral puntos={puntos} sel={{ banda, visita }} onPunto={irA} />
          </div>
        </div>
      )}
    </section>
  );
}
