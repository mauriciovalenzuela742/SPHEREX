/**
 * Prisma: visualizador multibanda de SPHEREx (Ojo infrarrojo + Huella espectral).
 * Comparte los datos y la selección con el Explorador (useDatosSpherex): no descarga nada nuevo.
 * Textos: content/prisma.ts (Javiera). Responde a «Extra kudos if your tool can generate spectra on the fly».
 * (La sonificación se quitó el 14-nov por decisión del equipo.)
 */
import { useMemo } from "react";
import { usePrisma } from "../content/prisma";
import type { DatosSpherex } from "../explorador/useDatosSpherex";
import { espectro } from "./fotometria";
import HuellaEspectral from "./HuellaEspectral";
import OjoInfrarrojo from "./OjoInfrarrojo";
import "./prisma.css";

export default function Prisma({ datos }: { datos: DatosSpherex }) {
  const prisma = usePrisma();
  const { grid, frames, version, banda, visita, irA } = datos;
  // `version` sube con cada fotograma que llega: recalcular el espectro entonces.
  const puntos = useMemo(() => (grid ? espectro(frames.current) : []), [grid, version, frames]);

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
          <div className="prisma-col" data-tour="prisma-ojo">
            <h3>{prisma.ojo.titulo}</h3>
            <p className="prisma-texto">{prisma.ojo.texto}</p>
            <OjoInfrarrojo datos={datos} />
          </div>
          <div className="prisma-col prisma-ancha" data-tour="prisma-huella">
            <h3>{prisma.huella.titulo}</h3>
            <p className="prisma-texto">{prisma.huella.texto}</p>
            <HuellaEspectral
              puntos={puntos}
              sel={{ banda, visita }}
              onPunto={irA}
              cargarTodas={datos.cargar.length < 6 ? () => datos.setCargar([1, 2, 3, 4, 5, 6]) : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}
