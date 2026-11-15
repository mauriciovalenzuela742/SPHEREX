/**
 * Vía A: cielo de SPHEREx con Aladin Lite v3, sin backend. Dueño: Juan Pablo (V2).
 *
 * Punto de extensión: este componente no conoce el detalle de las capas. Monta las de `capas/index.ts`
 * (objetivo, Gaia, CatWISE, SIMBAD), el selector de λ en acordeón (`SelectorLambda`; `LambdaSlider` queda de respaldo) y reparte los eventos de Aladin
 * (`eventos.ts`). Las piezas se trabajan en sus propios archivos, sin tocar este.
 *
 * Los catálogos de referencia (Gaia, CatWISE, SIMBAD) parten ocultos para que el cielo no se vea cargado al
 * abrir; el botón «Mostrar catálogos» los enciende sin volver a consultarlos. La marca del objeto y el cuadro
 * del recorte se ven siempre. El clic en el cielo funciona igual con los catálogos ocultos.
 *
 * Junto a ese botón, `ControlEpocas` (Epocas.tsx) superpone 2MASS o AllWISE sobre el cubo y los hace parpadear.
 */
import { useEffect, useRef, useState } from "react";
import A from "aladin-lite"; // v3.8.2, fijada en package.json
import { CAPAS, type ContextoCapa } from "./capas";
import PanelCatalogos from "./capas/PanelCatalogos";
import { crearRepartidor, type Suscribir } from "./eventos";
import ControlEpocas from "./Epocas";
import SelectorLambda from "./SelectorLambda";
import { ponerPlano, SURVEY_SPHEREX } from "./planos";
import { epocaDeFecha } from "./propagacion";

// Visor.tsx importa planoDeBanda desde aquí: se mantiene la exportación.
export { planoDeBanda } from "./planos";

/**
 * Época por defecto de la vista (año juliano decimal): la de hoy, calculada una vez al cargar el módulo.
 * Así la marca del objeto cae en el centro que ponen los botones de Visor, que usan `posicionActual()`
 * (también la fecha de hoy). Antes era 2026.0 fijo y la marca quedaba corrida 7–9″ (Barnard, WISE 0855).
 */
export const EPOCA_POR_DEFECTO = epocaDeFecha(new Date());

type Props = {
  ra: number;
  dec: number;
  fovDeg: number;
  /** Plano del cubo pedido desde fuera (p. ej. por la banda). El deslizador puede cambiarlo localmente. */
  plano: number;
  /** Lado del recorte en grados. Si no llega, se estima como fovDeg/4 (lo que hace hoy Visor). */
  size?: number;
  /** Época de la vista, en años julianos decimales. Por defecto, la de hoy (`EPOCA_POR_DEFECTO`). */
  epoca?: number;
  /** Se llama una vez, cuando Aladin está listo. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReady?: (aladin: any) => void;
  /** Clic en el cielo (o en una estrella): posición elegida, en grados ICRS. */
  onSelect?: (ra: number, dec: number) => void;
};

export default function AladinView({ ra, dec, fovDeg, plano, size, epoca = EPOCA_POR_DEFECTO, onReady, onSelect }: Props) {
  const div = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladin = useRef<any>(null);
  const [listo, setListo] = useState<{ on: Suscribir } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planoActivo, setPlanoActivo] = useState(plano);
  const [mostrarCatalogos, setMostrarCatalogos] = useState(false);
  // Catálogos registrados por las capas; se ocultan o muestran sin remontar ni volver a consultar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const catalogos = useRef(new Set<any>());
  const mostrarRef = useRef(mostrarCatalogos);
  mostrarRef.current = mostrarCatalogos;

  // Las funciones de props pueden cambiar en cada render: se guardan en refs para no remontar capas.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let cancel = false;
    if (!div.current) return;
    A.init
      .then(() => {
        if (cancel || !div.current) return;
        aladin.current = A.aladin(div.current, {
          survey: SURVEY_SPHEREX,
          target: `${ra} ${dec}`,
          fov: fovDeg,
          cooFrame: "ICRS",
          showReticle: true,
          showZoomControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showCooGridControl: true,
        });
        setListo({ on: crearRepartidor(aladin.current) });
        onReadyRef.current?.(aladin.current);
      })
      .catch((e: unknown) => setError(String(e)));
    return () => {
      cancel = true;
    };
    // Se inicializa una sola vez; los cambios de posición van en el efecto de abajo.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    aladin.current?.gotoRaDec(ra, dec);
    aladin.current?.setFoV(fovDeg);
  }, [ra, dec, fovDeg]);

  // Si cambia el plano pedido desde fuera (la banda), manda sobre lo elegido en el deslizador.
  useEffect(() => setPlanoActivo(plano), [plano]);

  useEffect(() => {
    if (!listo) return;
    return ponerPlano(aladin.current, planoActivo);
  }, [listo, planoActivo]);

  // Capas: se desmontan y vuelven a montar cuando cambia la posición, el recorte o la época.
  const lado = size ?? fovDeg / 4;
  useEffect(() => {
    if (!listo) return;
    const ctx: ContextoCapa = {
      ra,
      dec,
      size: lado,
      epoca,
      on: listo.on,
      onSelect: (r, d) => onSelectRef.current?.(r, d),
      registrarCatalogo: (cat) => {
        catalogos.current.add(cat);
        visibilidad(cat, mostrarRef.current);
        return () => catalogos.current.delete(cat);
      },
    };
    const desmontar: (() => void)[] = [];
    for (const capa of CAPAS) {
      try {
        const fin = capa.montar(aladin.current, ctx);
        if (fin) desmontar.push(fin);
      } catch (e) {
        console.error(`[sky] no se pudo montar la capa «${capa.id}»:`, e);
      }
    }
    return () => {
      for (const fin of desmontar) {
        try {
          fin();
        } catch (e) {
          console.error("[sky] error al desmontar una capa:", e);
        }
      }
    };
  }, [listo, ra, dec, lado, epoca]);

  useEffect(() => {
    for (const cat of catalogos.current) visibilidad(cat, mostrarCatalogos);
  }, [mostrarCatalogos]);

  if (error) {
    return <div className="vacio">No se pudo iniciar el mapa del cielo: {error}</div>;
  }
  return (
    <>
      {/* data-tour: anclas del tutorial de Spherix (src/tutorial); no cambian el comportamiento. */}
      <div ref={div} className="aladin" aria-label="Mapa del cielo de SPHEREx" data-tour="mapa" />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginTop: 6 }}>
        <div data-tour="epocas">
          <ControlEpocas aladin={listo ? aladin.current : null} />
        </div>
        <button
          type="button"
          data-tour="catalogos"
          aria-pressed={mostrarCatalogos}
          onClick={() => setMostrarCatalogos((v) => !v)}
          title="Gaia DR3 (círculos), CatWISE2020 (triángulos) y SIMBAD (cuadrados)"
        >
          {mostrarCatalogos ? "Ocultar catálogos" : "Mostrar catálogos (Gaia, CatWISE, SIMBAD)"}
        </button>
      </div>
      {/* Estado de cada catálogo (cargando / N objetos / no respondió + Reintentar) y su leyenda. */}
      {mostrarCatalogos && <PanelCatalogos />}
      <div data-tour="lambda">
        <SelectorLambda plano={planoActivo} onPlano={setPlanoActivo} survey={SURVEY_SPHEREX} />
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function visibilidad(cat: any, mostrar: boolean) {
  try {
    if (mostrar) cat.show();
    else cat.hide();
  } catch (e) {
    console.error("[sky] no se pudo cambiar la visibilidad de un catálogo:", e);
  }
}
