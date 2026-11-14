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

/**
 * TODO (S1): leer `${SURVEY_SPHEREX}/properties`, parsear `data_cube_crval3_arr` y devolver los planos
 * con su λ en µm, sin el 50 y 51. Comprobar la unidad que trae el archivo.
 */
export async function leerPlanos(_survey: string = SURVEY_SPHEREX): Promise<Plano[]> {
  return [];
}

/**
 * Pone el plano `plano` en la capa base. Devuelve una función para cancelar.
 *
 * setSliceNumber solo funciona cuando la capa ya está agregada (sus propiedades cargan en asíncrono),
 * y al agregarse Aladin la deja en el «primer plano» del cubo, que es el 50 (vacío). Por eso se reintenta
 * hasta que la capa esté lista y el plano quede puesto.
 *
 * TODO (S1): el truco de frecuencias de abajo NO está comprobado. Verificar en las 6 bandas leyendo de la
 * capa el plano activo y comparándolo con 17·(b−1)+8.
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
