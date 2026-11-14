/**
 * Parpadeo entre épocas: SPHEREx (2025–26) contra 2MASS (1997–2001) o AllWISE (~2010). Dueño: Juan Pablo (V2).
 *
 * Cómo funciona: el cubo de SPHEREx se queda como capa BASE de Aladin, sin tocarlo, así que el plano de λ
 * (`ponerPlano`) y el deslizador siguen igual. Cada época antigua es una capa de imagen SUPERPUESTA
 * (`setOverlayImageLayer`) que se crea la primera vez que se elige y después solo cambia de opacidad
 * (1 = se ve, 0 = se ve SPHEREx debajo). Los catálogos y la marca del objeto se dibujan siempre encima de
 * las imágenes, así que no se tapan.
 *
 * Antes de crear la capa se pide su `properties`: si IRSA no responde, se usa el espejo de la ESA. Si fallan
 * los dos, el control lo dice (no hay fallo silencioso).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import A from "aladin-lite";
import { CAMPOS, posicionActual } from "../content/campos";

type IdEpoca = "spherex" | "allwise" | "2mass";

type EpocaAntigua = {
  id: Exclude<IdEpoca, "spherex">;
  boton: string;
  /** Rótulo largo con la época y el instrumento. */
  rotulo: string;
  atribucion: string;
  /** HiPS principal (IRSA) y respaldo (ESA). */
  urls: string[];
};

// 2MASS: t_min / t_max de su `properties` (MJD 50600–51941 = 1997-06-01 a 2001-02-01, calculado el 14-nov-2026);
// la toma de cada objeto cae en ese rango (Barnard 2000,4; WISE 0855 1999,0).
// 2MASS color trae parches VERDES de fondo en algunas franjas de barrido (p. ej. cerca de WISE 0855): vienen
// dentro de las teselas (IRSA y ESA sirven los mismos bytes, Norder8/Npix654477), no de nuestra mezcla de capas.
// AllWISE: se rotula «época ~2010». El t_min / t_max de su `properties` (MJD 55378–55414) NO es el periodo
// de observación de AllWISE, así que no se usa para dar fechas.
const EPOCAS: EpocaAntigua[] = [
  {
    id: "allwise",
    boton: "AllWISE 2010",
    rotulo: "AllWISE W2 · 4,6 µm · 2010",
    atribucion: "AllWISE: NASA/JPL-Caltech/IPAC",
    urls: ["https://irsa.ipac.caltech.edu/data/hips/CDS/AllWISE/W2", "https://skies.esac.esa.int/AllWISEColor"],
  },
  {
    id: "2mass",
    boton: "2MASS ~2000",
    rotulo: "2MASS color J·H·K · 1997–2001",
    atribucion: "2MASS: UMass/IPAC-Caltech (NASA/NSF)",
    urls: ["https://irsa.ipac.caltech.edu/data/hips/CDS/2MASS/Color", "https://skies.esac.esa.int/2MASSColor"],
  },
];

const ROTULO_SPHEREX = "SPHEREx · 2025–26";

// WISE 0855 en su posición de hoy: el aviso de 2MASS solo se muestra si cae dentro de la vista.
const WISE_0855 = posicionActual(CAMPOS.find((c) => c.id === "wise_0855")!);

/** Separación angular en grados (fórmula del haversine; basta para distancias de minutos de arco). */
function separacionDeg(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const r = Math.PI / 180;
  const s =
    Math.sin(((dec2 - dec1) * r) / 2) ** 2 + Math.cos(dec1 * r) * Math.cos(dec2 * r) * Math.sin(((ra2 - ra1) * r) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(s)))) / r;
}
const PERIODO_MS = 1000;

/** Devuelve la primera URL cuyo `properties` responde 200; lanza si ninguna responde. */
async function primeraQueResponde(urls: string[]): Promise<string> {
  const motivos: string[] = [];
  for (const url of urls) {
    try {
      const r = await fetch(`${url}/properties`, { signal: AbortSignal.timeout(8000) });
      if (r.ok) return url;
      motivos.push(`${new URL(url).host}: ${r.status}`);
    } catch (e) {
      motivos.push(`${new URL(url).host}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(motivos.join("; "));
}

type Props = {
  /** Instancia de Aladin ya iniciada, o null mientras carga. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aladin: any;
  /** Centro y campo de la vista (grados), para saber si WISE 0855 está a la vista. */
  ra: number;
  dec: number;
  fovDeg: number;
};

export default function ControlEpocas({ aladin, ra, dec, fovDeg }: Props) {
  const [elegida, setElegida] = useState<EpocaAntigua["id"]>("allwise");
  const [mostrada, setMostrada] = useState<IdEpoca>("spherex");
  const [parpadeando, setParpadeando] = useState(false);
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Capas superpuestas ya creadas (o en creación), por época.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capas = useRef(new Map<string, Promise<any>>());

  /** Crea (una sola vez) la capa de una época antigua, invisible. */
  function capaDe(ep: EpocaAntigua) {
    let p = capas.current.get(ep.id);
    if (!p) {
      setCargando(ep.boton);
      p = primeraQueResponde(ep.urls).then((url) => {
        const hips = A.HiPS(url, { name: `Época: ${ep.rotulo}`, imgFormat: "jpeg" });
        const capa = aladin.setOverlayImageLayer(hips, `epoca_${ep.id}`);
        capa.setOpacity(0);
        return capa;
      });
      p.then(
        () => setCargando(null),
        (e: unknown) => {
          capas.current.delete(ep.id);
          setCargando(null);
          setError(`No se pudo cargar ${ep.boton} (${e instanceof Error ? e.message : String(e)}). Se sigue viendo SPHEREx.`);
          setParpadeando(false);
          setMostrada("spherex");
        },
      );
      capas.current.set(ep.id, p);
    }
    return p;
  }

  // Aplica la opacidad según la época mostrada: solo la mostrada se ve; con «spherex» se ven todas en 0.
  useEffect(() => {
    if (!aladin) return;
    for (const ep of EPOCAS) {
      const visible = ep.id === mostrada;
      if (visible) setError(null);
      const p = visible ? capaDe(ep) : capas.current.get(ep.id);
      p?.then((capa) => capa.setOpacity(visible ? 1 : 0)).catch(() => {});
    }
    // capaDe usa refs y setters estables.
  }, [aladin, mostrada]); // eslint-disable-line react-hooks/exhaustive-deps

  // Parpadeo: alterna SPHEREx ↔ época elegida cada ~1 s.
  useEffect(() => {
    if (!parpadeando) return;
    setMostrada(elegida);
    const id = window.setInterval(() => setMostrada((m) => (m === "spherex" ? elegida : "spherex")), PERIODO_MS);
    return () => window.clearInterval(id);
  }, [parpadeando, elegida]);

  const antigua = EPOCAS.find((e) => e.id === mostrada);
  const rotuloActual = antigua ? antigua.rotulo : ROTULO_SPHEREX;
  const atribuciones = EPOCAS.map((e) => e.atribucion).join(" · ");
  // 2MASS «activo»: a la vista, o elegido para el parpadeo (así el aviso no titila cada segundo).
  const conDosMass = parpadeando ? elegida === "2mass" : mostrada === "2mass";
  const avisoWise0855 = conDosMass && separacionDeg(ra, dec, WISE_0855.ra, WISE_0855.dec) <= fovDeg / 2;

  function elegir(id: IdEpoca) {
    if (id === "spherex") {
      setParpadeando(false);
      setMostrada("spherex");
      return;
    }
    setElegida(id);
    if (!parpadeando) setMostrada(id);
  }

  const boton = (activo: boolean): CSSProperties => ({
    fontWeight: activo ? 700 : 400,
    outline: activo ? "2px solid var(--acento)" : undefined,
  });

  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}
      role="group"
      aria-label="Época de la imagen de fondo"
      title={`Compara el cielo de SPHEREx con imágenes de otras épocas para ver el movimiento propio. ${atribuciones}`}
    >
      <span
        aria-live="polite"
        style={{
          padding: "2px 8px",
          borderRadius: 6,
          border: "1px solid var(--acento)",
          color: "var(--acento)",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
          // Ocupa su propia línea: así los botones no saltan cuando el rótulo cambia de largo al parpadear.
          flexBasis: "100%",
          boxSizing: "border-box",
        }}
      >
        Mostrando: {rotuloActual}
      </span>
      <button type="button" aria-pressed={mostrada === "spherex" && !parpadeando} style={boton(mostrada === "spherex" && !parpadeando)} onClick={() => elegir("spherex")}>
        SPHEREx 2025–26
      </button>
      {EPOCAS.map((ep) => {
        const activo = parpadeando ? elegida === ep.id : mostrada === ep.id;
        return (
          <button
            key={ep.id}
            type="button"
            aria-pressed={activo}
            style={boton(activo)}
            onClick={() => elegir(ep.id)}
            title={`${ep.rotulo}. ${ep.atribucion}`}
          >
            {ep.boton}
          </button>
        );
      })}
      <button
        type="button"
        aria-pressed={parpadeando}
        style={boton(parpadeando)}
        onClick={() => setParpadeando((v) => !v)}
        title={`Alterna SPHEREx y ${EPOCAS.find((e) => e.id === elegida)?.boton} cada ${PERIODO_MS / 1000} s`}
      >
        {parpadeando ? "Detener parpadeo" : "Parpadear"}
      </button>
      {cargando && <span style={{ color: "var(--suave)", fontSize: "0.85rem" }}>Cargando {cargando}…</span>}
      {error && (
        <span role="alert" style={{ color: "var(--acento)", fontSize: "0.85rem" }}>
          {error}
        </span>
      )}
      {avisoWise0855 && (
        <span style={{ color: "var(--suave)", fontSize: "0.85rem", flexBasis: "100%" }}>
          En 2MASS no se ven objetos muy fríos como WISE 0855: compara con AllWISE.
        </span>
      )}
      <span style={{ color: "var(--suave)", fontSize: "0.75rem", flexBasis: "100%" }}>{atribuciones}</span>
    </div>
  );
}
