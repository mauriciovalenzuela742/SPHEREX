/**
 * Prisma: visualizador multibanda de SPHEREx (Ojo infrarrojo + Huella espectral).
 * Comparte los datos y la selección con el Explorador (useDatosSpherex). Para los 5 objetos de prueba, si existe
 * `public/precalc/espectro/<id>.json` (todas las exposiciones de SPHEREx, medidas fuera de línea), lo muestra al
 * instante; se puede cambiar a «fotos del explorador» (lo que el navegador mide en vivo).
 * Textos: content/prisma.ts (Javiera). Responde a «Extra kudos if your tool can generate spectra on the fly».
 * (La sonificación se quitó el 14-nov por decisión del equipo.)
 */
import { useEffect, useMemo, useState } from "react";
import { usePrisma } from "../content/prisma";
import { CAMPOS, posicionActual } from "../content/campos";
import { useIdioma } from "../state/idioma";
import type { DatosSpherex } from "../explorador/useDatosSpherex";
import { espectro } from "./fotometria";
import HuellaEspectral from "./HuellaEspectral";
import OjoInfrarrojo from "./OjoInfrarrojo";
import QueCambio from "./QueCambio";
import FichaAstro from "./FichaAstro";
import { COLORES_PASADA, desdePrecalc, desdeVivo, esPrecalc, etiquetaPasada, type PrecalcEspectro, type PuntoVista } from "./pasadas";
import "./prisma.css";

/** Id del objeto de prueba en esta posición (a menos de 0,05°), o null. */
function campoEn(ra: number, dec: number): string | null {
  for (const c of CAMPOS) {
    const p = posicionActual(c);
    const d = Math.hypot((p.ra - ra) * Math.cos((dec * Math.PI) / 180), p.dec - dec);
    if (d < 0.05) return c.id;
  }
  return null;
}

/** Precalculado del objeto, o null si no hay archivo (vite responde index.html con 200: se valida el JSON). */
function usePrecalc(id: string | null): PrecalcEspectro | null {
  const [j, setJ] = useState<{ id: string; d: PrecalcEspectro } | null>(null);
  useEffect(() => {
    if (!id) return;
    let vivo = true;
    fetch(`/precalc/espectro/${id}.json`)
      .then((r) => (r.ok ? r.text() : ""))
      .then((txt) => {
        try {
          const d: unknown = JSON.parse(txt);
          if (vivo && esPrecalc(d)) setJ({ id, d });
        } catch {
          /* sin archivo: se usa lo vivo */
        }
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [id]);
  return j && j.id === id ? j.d : null;
}

export default function Prisma({ datos, ra, dec }: { datos: DatosSpherex; ra: number; dec: number }) {
  const prisma = usePrisma();
  const { idioma } = useIdioma();
  const { grid, frames, version, banda, visita, irA, visitaMasCercana } = datos;
  // `version` sube con cada fotograma que llega: recalcular el espectro entonces.
  const puntos = useMemo(() => (grid ? espectro(frames.current) : []), [grid, version, frames]);
  const id = campoEn(ra, dec);
  const pre = usePrecalc(id);
  const [fuente, setFuente] = useState<"pre" | "vivo">("pre");
  const usaPre = Boolean(pre) && fuente === "pre";
  const pasadas = useMemo(() => (usaPre && pre ? desdePrecalc(pre) : desdeVivo(puntos)), [usaPre, pre, puntos]);
  const [ver, setVer] = useState("todas");
  const verValido = ver === "todas" || pasadas.some((p) => p.id === ver) ? ver : "todas";

  const onPunto = (p: PuntoVista) => {
    if (p.visita !== null) irA(p.banda, p.visita);
    else if (grid?.visits[p.banda]?.length) irA(p.banda, visitaMasCercana(p.banda, p.mjd));
  };

  return (
    <section className="prisma" aria-labelledby="prisma-titulo">
      <header className="prisma-cabecera">
        <h2 id="prisma-titulo">{prisma.titulo}</h2>
        <p>{prisma.intro}</p>
      </header>
      {!grid && !usaPre ? (
        <p className="prisma-vacio">{prisma.ojo.sinDatos}</p>
      ) : (
        <div className="prisma-cuerpo">
          <div className="prisma-col" data-tour="prisma-ojo">
            <h3>{prisma.ojo.titulo}</h3>
            <p className="prisma-texto">{prisma.ojo.texto}</p>
            {grid ? <OjoInfrarrojo datos={datos} /> : <p className="prisma-vacio">{prisma.ojo.sinDatos}</p>}
          </div>
          <div className="prisma-col prisma-ancha" data-tour="prisma-huella">
            <h3>{prisma.huella.titulo}</h3>
            <p className="prisma-texto">{prisma.huella.texto}</p>
            <div className="p-controles">
              {pre && (
                <div className="p-grupo" role="group" aria-label={prisma.fuente.titulo}>
                  <span>{prisma.fuente.titulo}:</span>
                  <button type="button" aria-pressed={usaPre} onClick={() => setFuente("pre")}>{prisma.fuente.pre}</button>
                  <button type="button" aria-pressed={!usaPre} onClick={() => setFuente("vivo")}>{prisma.fuente.vivo}</button>
                </div>
              )}
              {pasadas.length > 1 && (
                <div className="p-grupo" role="group" aria-label={prisma.pasadas.titulo}>
                  <span>{prisma.pasadas.titulo}:</span>
                  <button type="button" aria-pressed={verValido === "todas"} onClick={() => setVer("todas")}>{prisma.pasadas.todas}</button>
                  {pasadas.map((pa, i) => (
                    <button key={pa.id} type="button" aria-pressed={verValido === pa.id} onClick={() => setVer(pa.id)}>
                      <span className="p-punto" style={{ background: COLORES_PASADA[i % COLORES_PASADA.length] }} />
                      {etiquetaPasada(pa, idioma)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <HuellaEspectral
              pasadas={pasadas}
              ver={verValido}
              sel={{ banda, visita }}
              onPunto={onPunto}
              cargarTodas={!usaPre && datos.cargar.length < 6 ? () => datos.setCargar([1, 2, 3, 4, 5, 6]) : undefined}
            />
            {usaPre && pre && <p className="h-caveat">{prisma.fuente.notaPre(pre.generado.slice(0, 10))} {pre.caveat}</p>}
            <FichaAstro
              puntos={pasadas.filter((pa) => verValido === "todas" || pa.id === verValido).flatMap((pa) => pa.puntos)}
              nombre={CAMPOS.find((c) => c.id === id)?.nombre ?? null}
            />
            <QueCambio pasadas={pasadas} />
          </div>
        </div>
      )}
    </section>
  );
}
