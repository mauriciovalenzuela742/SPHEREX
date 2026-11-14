/**
 * Planos del cubo HiPS de SPHEREx DR1 (IRSA). Dueño: Juan Pablo (V2). Trabajo de S1.
 *
 * Lo que se sabe (EDA, 14-nov-2026): 102 planos PNG, orden 5, píxel 12,9″.
 * `properties` trae `data_cube_crval3_arr` = λ de cada plano (0,753–4,988 µm).
 * plano = 17·(banda−1) + (canal−1). Los planos 50 y 51 vienen VACÍOS (dicroico).
 */

// Cubo HiPS de SPHEREx DR1 servido por IRSA: 102 planos (uno por canal), CORS abierto.
// Alternativa (CDS, caído el 14-nov): "CDS/P/SPHEREx/QR2/color".
export const SURVEY_SPHEREX = "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube";

export const PLANOS_VACIOS = [50, 51];

/** Plano del cubo para una banda D1–D6: el canal central (17 canales por banda). Los planos 50 y 51 vienen vacíos. */
export function planoDeBanda(band: string): number {
  const b = Number(band);
  return Number.isInteger(b) && b >= 1 && b <= 6 ? 17 * (b - 1) + 8 : 25;
}

/** Banda D1–D6 a la que pertenece un plano (0–101). */
export function bandaDePlano(plano: number): number {
  return Math.floor(plano / 17) + 1;
}

export type Plano = { indice: number; lambdaUm: number; banda: number };

/** Factor para pasar la unidad de `data_cube_bunit3` a µm. IRSA trae «um» (comprobado el 14-nov-2026). */
const A_MICRAS: Record<string, number> = {
  um: 1,
  "µm": 1,
  micron: 1,
  microns: 1,
  nm: 1e-3,
  angstrom: 1e-4,
  m: 1e6,
};

/** Lee un archivo `properties` de HiPS («clave = valor», con # de comentario). */
export function parsearProperties(texto: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const linea of texto.split(/\r?\n/)) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf("=");
    if (i < 0) continue;
    props[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  return props;
}

/**
 * Convierte las propiedades del cubo en la lista de planos con su λ en µm, sin los vacíos (50 y 51).
 * Lanza un error con el motivo si falta la lista, la unidad es desconocida o el largo no calza.
 */
export function planosDesdeProperties(props: Record<string, string>): Plano[] {
  const arr = props["data_cube_crval3_arr"];
  if (!arr) throw new Error("el properties no trae data_cube_crval3_arr");
  const unidad = (props["data_cube_bunit3"] ?? "").trim().toLowerCase();
  const factor = A_MICRAS[unidad];
  if (factor === undefined) throw new Error(`unidad de λ desconocida: «${props["data_cube_bunit3"] ?? ""}»`);
  const valores = arr.split(/\s+/).map(Number);
  if (valores.some((v) => !Number.isFinite(v))) throw new Error("data_cube_crval3_arr trae valores no numéricos");
  const profundidad = Number(props["hips_cube_depth"]);
  if (Number.isFinite(profundidad) && profundidad !== valores.length) {
    throw new Error(`data_cube_crval3_arr trae ${valores.length} valores y hips_cube_depth dice ${profundidad}`);
  }
  return valores
    .map((v, indice) => ({ indice, lambdaUm: v * factor, banda: bandaDePlano(indice) }))
    .filter((p) => !PLANOS_VACIOS.includes(p.indice));
}

const cache = new Map<string, Promise<Plano[]>>();

/**
 * Lee `${survey}/properties` en ejecución y devuelve los planos con su λ en µm, sin el 50 y 51.
 * Se pide una sola vez por survey; si falla, se olvida para poder reintentar.
 */
export function leerPlanos(survey: string = SURVEY_SPHEREX): Promise<Plano[]> {
  let p = cache.get(survey);
  if (!p) {
    p = fetch(`${survey.replace(/\/$/, "")}/properties`)
      .then((r) => {
        if (!r.ok) throw new Error(`properties respondió ${r.status}`);
        return r.text();
      })
      .then((t) => planosDesdeProperties(parsearProperties(t)));
    p.catch(() => cache.delete(survey));
    cache.set(survey, p);
  }
  return p;
}

/**
 * Pone el plano `plano` en la capa base. Devuelve una función para cancelar.
 *
 * setSliceNumber solo funciona cuando la capa ya está agregada (sus propiedades cargan en asíncrono),
 * y al agregarse Aladin la deja en el «primer plano» del cubo, que es el 50 (vacío). Por eso se reintenta
 * hasta que la capa esté lista y el plano quede puesto.
 *
 * Comprobado (S1, 14-nov-2026, Aladin 3.8.2): con band=1…6 las teselas pedidas llevan sufijo _8, _25, _42,
 * _59, _76 y _93 (= 17·(b−1)+8); el sufijo del nombre de la tesela es el índice del plano. En cambio
 * setSliceNumber(59) pide teselas _9: no usarlo. getFrequency() de la capa no es la λ real del plano.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ponerPlano(aladin: any, plano: number): () => void {
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
