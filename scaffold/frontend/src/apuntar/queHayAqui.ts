/**
 * «¿Qué hay aquí?»: qué objeto de SIMBAD hay en un punto del cielo. Dueño: Juan Pablo (V2).
 *
 * SIMBAD da posiciones J2000 y el cubo de SPHEREx es de 2025–2026: una estrella rápida aparece corrida
 * (Barnard, ~270″). Por eso la consulta trae los objetos a menos de RADIO_ARCSEC del punto y, además,
 * los de movimiento propio alto (> 0,3″/año) en un cono de RADIO_RAPIDAS_DEG. A cada uno se le compara
 * SOLO su posición propagada a la época de la imagen que se mira (quien llama pasa esa época): donde estuvo
 * en 2000 ya no está, así que un clic ahí no lo nombra. Gana el más cercano (empate: el más citado).
 */
import { SERVICIOS_TAP } from "../sky/capas/simbad";
import { EPOCA_J2000, propagar } from "../sky/propagacion";

/** Radio del punto, en segundos de arco: lo que cabe en un clic con la vista habitual (~2″ por píxel). */
export const RADIO_ARCSEC = 10;
/** Cono para estrellas rápidas: Barnard (10,4″/año) se corre 0,08° en 27 años. */
const RADIO_RAPIDAS_DEG = 0.1;
/** Movimiento propio mínimo (mas/año) para buscar más lejos. Una estrella más lenta que esto tiene que caer
 *  dentro del cono de RADIO_ARCSEC alrededor de su posición J2000, así que el umbral debe cumplir
 *  pm × 27 años < RADIO_ARCSEC, o sea < 372 mas/año: 0,3″/año × 27 años ≈ 8″, con margen para el error del clic. */
const PM_RAPIDA = 300;
const ESPERA_MS = 30000;

export type Hallazgo = { nombre: string; tipo: string; distancia: number; propagado: boolean };

function consulta(ra: number, dec: number): string {
  const punto = `POINT('ICRS', ra, dec)`;
  return (
    `SELECT TOP 50 main_id, otype, ra, dec, pmra, pmdec, nbref FROM basic ` +
    `WHERE CONTAINS(${punto}, CIRCLE('ICRS', ${ra}, ${dec}, ${RADIO_RAPIDAS_DEG})) = 1 ` +
    `AND ra IS NOT NULL AND dec IS NOT NULL ` +
    `AND (CONTAINS(${punto}, CIRCLE('ICRS', ${ra}, ${dec}, ${RADIO_ARCSEC / 3600})) = 1 ` +
    `OR pmra * pmra + pmdec * pmdec > ${PM_RAPIDA * PM_RAPIDA}) ORDER BY nbref DESC`
  );
}

/** Separación angular en segundos de arco (fórmula de haversine). */
export function separacion(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const r = Math.PI / 180;
  const h =
    Math.sin(((dec2 - dec1) * r) / 2) ** 2 +
    Math.cos(dec1 * r) * Math.cos(dec2 * r) * Math.sin(((ra2 - ra1) * r) / 2) ** 2;
  return (2 * Math.asin(Math.min(1, Math.sqrt(h))) * 180 * 3600) / Math.PI;
}

/**
 * Objetos de SIMBAD en el punto, el más cercano primero. Lista vacía = nada registrado.
 * Lanza un error si ningún servicio de SIMBAD respondió.
 */
export async function queHayAqui(ra: number, dec: number, epoca: number, senal: AbortSignal): Promise<Hallazgo[]> {
  const params = new URLSearchParams({ request: "doQuery", lang: "adql", format: "json", query: consulta(ra, dec) });
  const errores: string[] = [];
  for (const base of SERVICIOS_TAP) {
    if (senal.aborted) throw new DOMException("cancelado", "AbortError");
    const ctl = new AbortController();
    const cortar = () => ctl.abort();
    senal.addEventListener("abort", cortar);
    const reloj = setTimeout(cortar, ESPERA_MS);
    try {
      const r = await fetch(`${base}?${params}`, { signal: ctl.signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as { metadata: { name: string }[]; data: unknown[][] };
      const i = (n: string) => j.metadata.findIndex((m) => m.name === n);
      const [iId, iTipo, iRa, iDec, iPmra, iPmdec] = ["main_id", "otype", "ra", "dec", "pmra", "pmdec"].map(i);
      if ([iId, iTipo, iRa, iDec].some((k) => k < 0)) throw new Error("respuesta sin las columnas esperadas");
      const hallazgos: Hallazgo[] = [];
      for (const f of j.data) {
        const oRa = Number(f[iRa]);
        const oDec = Number(f[iDec]);
        const pmra = Number(f[iPmra] ?? 0) || 0;
        const pmdec = Number(f[iPmdec] ?? 0) || 0;
        // Solo la posición en la época de la imagen: sin movimiento propio es la misma de J2000.
        const [pRa, pDec] = propagar(oRa, oDec, pmra, pmdec, EPOCA_J2000, epoca);
        const distancia = separacion(ra, dec, pRa, pDec);
        if (distancia <= RADIO_ARCSEC) {
          hallazgos.push({
            nombre: String(f[iId]).trim().replace(/^NAME /, ""),
            tipo: String(f[iTipo] ?? "").trim(),
            distancia,
            // Se dice «contando lo que se movió» solo si se movió algo apreciable (> 1″) desde 2000.
            propagado: separacion(oRa, oDec, pRa, pDec) > 1,
          });
        }
      }
      // Vienen ordenados por citas (nbref): el sort estable deja primero al más citado entre los muy cercanos.
      return hallazgos.sort((a, b) => Math.round(a.distancia) - Math.round(b.distancia));
    } catch (e) {
      if (senal.aborted) throw e;
      errores.push(`${base}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      clearTimeout(reloj);
      senal.removeEventListener("abort", cortar);
    }
  }
  throw new Error(`ningún servicio de SIMBAD respondió (${errores.join("; ")})`);
}

/** Tipos de objeto de SIMBAD más comunes, en palabras simples (tabla otypedef de SIMBAD, revisada el 14-nov-2026).
 *  Los demás se muestran con su código. Los candidatos («?») se arman en `tipoLegible`. */
const TIPOS: Record<string, string> = {
  "*": "estrella",
  "BY*": "estrella variable de tipo BY Dra",
  "PM*": "estrella de movimiento propio alto",
  "BD*": "enana marrón",
  "LM*": "estrella de poca masa",
  "MS*": "estrella de secuencia principal",
  "Y*O": "objeto estelar joven",
  "AB*": "estrella de la rama asintótica de las gigantes",
  "Pl": "exoplaneta",
  "G": "galaxia",
  "GiG": "galaxia en dirección a un grupo de galaxias",
  "GiC": "galaxia en dirección a un cúmulo de galaxias",
  "ClG": "cúmulo de galaxias",
  "AGN": "núcleo galáctico activo",
  "QSO": "cuásar",
  "Mi*": "estrella variable de tipo Mira",
  "LP*": "estrella variable de período largo",
  "V*": "estrella variable",
  "Or*": "estrella joven variable (tipo Orión)",
  "TT*": "estrella T Tauri",
  "Ce*": "cefeida",
  "RR*": "estrella variable RR Lyrae",
  "WD*": "enana blanca",
  "**": "estrella doble",
  "EB*": "estrella binaria eclipsante",
  "SB*": "estrella binaria espectroscópica",
  "Em*": "estrella con líneas de emisión",
  "IR": "fuente infrarroja",
  "NIR": "fuente en el infrarrojo cercano",
  "MIR": "fuente en el infrarrojo medio",
  "X": "fuente de rayos X",
  "Rad": "fuente de radio",
  "Cl*": "cúmulo de estrellas",
  "OpC": "cúmulo abierto",
  "GlC": "cúmulo globular",
  "DNe": "nube oscura",
  "PN": "nebulosa planetaria",
  "HII": "región HII",
  "C*": "estrella de carbono",
  "RG*": "estrella de la rama de las gigantes rojas",
};

/** Candidatos cuyo tipo base no sale de cambiar «?» por «*». */
const BASE_CANDIDATO: Record<string, string> = { "Y*?": "Y*O", "RB?": "RG*", "AB?": "AB*" };

/** Tipo base de un candidato de SIMBAD («BD?» → «BD*», «WD?» → «WD*», «LM?» → «LM*»), o undefined. */
function baseCandidato(otype: string): string | undefined {
  if (!otype.endsWith("?")) return undefined;
  const base = BASE_CANDIDATO[otype] ?? [otype.slice(0, -1) + "*", otype.slice(0, -1)].find((b) => TIPOS[b]);
  return base && TIPOS[base] ? base : undefined;
}

export function tipoLegible(otype: string): string {
  if (TIPOS[otype]) return `${TIPOS[otype]}, ${otype}`;
  const base = baseCandidato(otype);
  if (base) return `candidata a ${TIPOS[base]}, ${otype}`;
  return otype || "tipo sin dato";
}
