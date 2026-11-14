/**
 * Vía A: cielo de SPHEREx con Aladin Lite v3, sin backend. Dueño: Juan Pablo (V2).
 * Pendiente (V2): cubo HiPS DR1 de IRSA con deslizador de λ, overlay Gaia propagado,
 * burbuja al pasar sobre una estrella, clic → animación recortada.
 */
import { useEffect, useRef, useState } from "react";
import A from "aladin-lite"; // v3.8.2, fijada en package.json

// Cubo HiPS de SPHEREx DR1 servido por IRSA: 102 planos (uno por canal), CORS abierto.
// Alternativa (CDS, caído el 14-nov): "CDS/P/SPHEREx/QR2/color".
const SURVEY_SPHEREX = "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube";

/** Plano del cubo para una banda D1–D6: el canal central (17 canales por banda). Los planos 50 y 51 vienen vacíos. */
export function planoDeBanda(band: string): number {
  const b = Number(band);
  return Number.isInteger(b) && b >= 1 && b <= 6 ? 17 * (b - 1) + 8 : 25;
}

type Props = { ra: number; dec: number; fovDeg: number; plano: number };

/**
 * setSliceNumber solo funciona cuando la capa ya está agregada (sus propiedades cargan en asíncrono),
 * y al agregarse Aladin la deja en el «primer plano» del cubo, que es el 50 (vacío). Por eso se reintenta
 * hasta que la capa esté lista y el plano quede puesto. Devuelve una función para cancelar.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ponerPlano(aladin: any, plano: number): () => void {
  let intentos = 0;
  const id = window.setInterval(() => {
    const capa = aladin?.getBaseImageLayer?.();
    intentos += 1;
    if (capa?.added && capa.cubeDepth && capa.emMin && capa.emMax) {
      // setSliceNumber de Aladin 3.8.2 interpola en λ, pero el motor elige el plano lineal en frecuencia:
      // pedir 59 trae el plano 9. Se calcula la frecuencia del centro del plano deseado y se pasa su λ.
      const C = 299792458;
      const fMin = C / capa.emMax;
      const fMax = C / capa.emMin;
      const f = fMin + ((plano + 0.5) / capa.cubeDepth) * (fMax - fMin);
      capa.setFrequency({ value: C / f, unit: "m" });
      if (intentos > 4) window.clearInterval(id);
    }
    if (intentos > 60) window.clearInterval(id); // ~15 s
  }, 250);
  return () => window.clearInterval(id);
}

export default function AladinView({ ra, dec, fovDeg, plano }: Props) {
  const div = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladin = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    if (!div.current) return;
    A.init.then(() => {
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
    }).catch((e: unknown) => setError(String(e)));
    return () => {
      cancel = true;
    };
    // Se inicializa una sola vez; los cambios de posición van en el efecto de abajo.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    aladin.current?.gotoRaDec(ra, dec);
    aladin.current?.setFoV(fovDeg);
  }, [ra, dec, fovDeg]);

  useEffect(() => {
    // El intervalo espera también a que Aladin exista (primer render).
    let cancelar: () => void = () => {};
    const espera = window.setInterval(() => {
      if (aladin.current) {
        window.clearInterval(espera);
        cancelar = ponerPlano(aladin.current, plano);
      }
    }, 100);
    return () => {
      window.clearInterval(espera);
      cancelar();
    };
  }, [plano]);

  if (error) {
    return <div className="vacio">No se pudo iniciar el mapa del cielo: {error}</div>;
  }
  return <div ref={div} className="aladin" aria-label="Mapa del cielo de SPHEREx" />;
}
