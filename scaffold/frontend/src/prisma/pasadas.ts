/**
 * Espectro por pasada (Prisma). SPHEREx vuelve a mirar el mismo cielo cada ~6 meses: cada vuelta es una
 * «pasada». Mezclar pasadas en un solo espectro confunde si el objeto cambia de brillo (RW Aur, R Dra), así
 * que los puntos se agrupan por pasada (huecos de más de 30 días) y cada una se dibuja con su color.
 *
 * Dos fuentes con el mismo modelo de puntos:
 *  (i)  los fotogramas que el explorador ya cargó (`desdeVivo`), y
 *  (ii) el espectro precalculado `public/precalc/espectro/<id>.json` (`desdePrecalc`), que se muestra al instante.
 *
 * «Qué cambió» (`cambios`): razón de flujo entre dos pasadas por tramo de λ. Solo se afirma un cambio si la
 * diferencia supera 3σ, con un piso de error de calibración (PISO_REL): las barras de error de la fotometría de
 * apertura solo cuentan el ruido del cielo y en objetos brillantes son irrealmente chicas (Barnard: 0,02 %).
 */
import type { PuntoEspectral } from "./fotometria";

export type Estado = "medida" | "limite" | "saturado";

export type PuntoVista = {
  lam: number;
  /** Flujo medido (mJy). En un saturado no significa nada (puede ser null en el precalculado → 0). */
  mJy: number;
  err: number;
  estado: Estado;
  mjd: number;
  banda: number;
  /** Medida que probablemente no es del objeto (p. ej. estrella de fondo en la apertura). */
  sospechoso: boolean;
  /** Medida en una banda donde la mayoría de las fotos de la pasada saturan: probablemente subestimada. */
  bordeSat: boolean;
  /** Visita del explorador (solo puntos vivos); en el precalculado se busca la más cercana por fecha. */
  visita: number | null;
  /** Fecha AAAA-MM-DD. */
  fecha: string;
  vecinas: number | null;
};

export type Pasada = {
  id: string;
  desde: string;
  hasta: string;
  mjdMedio: number;
  puntos: PuntoVista[];
  /** Canales de SPHEREx cubiertos (de 102), solo en el precalculado; < CANALES_MIN = pasada incompleta. */
  canales: number | null;
};

/** Con menos canales que esto (de 102), la pasada es «incompleta» y no se clasifica sola. */
export const CANALES_MIN = 90;
export const incompleta = (p: Pasada) => p.canales !== null && p.canales < CANALES_MIN;

/** Contrato del JSON precalculado (D:\dev\informes_v2\precalc_espectros, generado por otro agente). */
export type PrecalcEspectro = {
  objeto: string;
  nombre: string;
  ra: number;
  dec: number;
  pmra_mas: number;
  pmdec_mas: number;
  epoca_ref: number;
  generado: string;
  fuente: string;
  caveat: string;
  pasadas: {
    id: number | string;
    desde: string;
    hasta: string;
    dias: number;
    n_exp: number;
    lam_min: number;
    lam_max: number;
    canales_cubiertos: number;
    puntos: {
      lam: number;
      mJy: number | null;
      err: number | null;
      estado: Estado;
      mjd: number;
      banda: number | string;
      sospechoso?: boolean;
    }[];
  }[];
};

/** Hueco mínimo entre dos pasadas (días). */
export const HUECO_DIAS = 30;
/** Piso del error relativo para comparar flujos entre pasadas o regiones (calibración + apertura). */
export const PISO_REL = 0.05;

const MJD_UNIX = 40587;
export const mjdDe = (iso: string) => Date.parse(iso) / 86400000 + MJD_UNIX;
export const fechaDe = (mjd: number) => new Date((mjd - MJD_UNIX) * 86400000).toISOString().slice(0, 10);

/** Valor que se dibuja para un límite superior (3σ sobre lo medido). */
export const valorLimite = (p: PuntoVista) => Math.max(p.mJy, 0) + 3 * p.err;

/** Medida usable: no saturada, S/N ≥ 3, flujo positivo y no sospechosa. */
export const usable = (p: PuntoVista) => p.estado === "medida" && p.mJy > 0 && p.err > 0 && !p.sospechoso && !p.bordeSat;

/** Marca `bordeSat` en las medidas de cada banda donde, en esa pasada, hay tantos saturados como medidas. */
function marcarBordeSat(ps: PuntoVista[]): PuntoVista[] {
  const n = (b: number, e: Estado) => ps.filter((p) => p.banda === b && p.estado === e).length;
  const malas = new Set([1, 2, 3, 4, 5, 6].filter((b) => n(b, "saturado") > 0 && n(b, "saturado") >= n(b, "medida")));
  return ps.map((p) => (p.estado === "medida" && malas.has(p.banda) ? { ...p, bordeSat: true } : p));
}

export function aVista(p: PuntoEspectral): PuntoVista {
  return {
    lam: p.lambda,
    mJy: p.mJy,
    err: p.errMJy,
    estado: p.saturado ? "saturado" : p.detectado ? "medida" : "limite",
    mjd: mjdDe(p.t),
    banda: p.banda,
    sospechoso: false,
    bordeSat: false,
    visita: p.visita,
    fecha: p.t.slice(0, 10),
    vecinas: p.vecinas,
  };
}

/** Agrupa por fecha: una pasada nueva cada vez que hay un hueco de más de HUECO_DIAS. */
export function agrupar(puntos: PuntoVista[]): Pasada[] {
  const orden = [...puntos].sort((a, b) => a.mjd - b.mjd);
  const grupos: PuntoVista[][] = [];
  for (const p of orden) {
    const g = grupos[grupos.length - 1];
    if (g && p.mjd - g[g.length - 1].mjd <= HUECO_DIAS) g.push(p);
    else grupos.push([p]);
  }
  return grupos.map((g, i) => ({
    id: String(i + 1),
    desde: g[0].fecha,
    hasta: g[g.length - 1].fecha,
    mjdMedio: (g[0].mjd + g[g.length - 1].mjd) / 2,
    puntos: marcarBordeSat(g).sort((a, b) => a.lam - b.lam),
    canales: null,
  }));
}

export const desdeVivo = (puntos: PuntoEspectral[]) => agrupar(puntos.map(aVista));

export function desdePrecalc(j: PrecalcEspectro): Pasada[] {
  return j.pasadas.map((pa) => {
    const puntos: PuntoVista[] = pa.puntos
      .filter((p) => Number.isFinite(p.lam) && (p.estado === "medida" || p.estado === "limite" || p.estado === "saturado"))
      .map((p) => ({
        lam: p.lam,
        // Los saturados traen mJy/err null: NaN, nunca 0 (no se usan como flujo en ninguna parte).
        mJy: p.mJy ?? NaN,
        err: p.err ?? NaN,
        estado: p.estado,
        mjd: p.mjd,
        banda: typeof p.banda === "number" ? p.banda : Number(String(p.banda).replace(/\D/g, "")) || 0,
        sospechoso: Boolean(p.sospechoso),
        bordeSat: false,
        visita: null,
        fecha: fechaDe(p.mjd),
        vecinas: null,
      }))
      .sort((a, b) => a.lam - b.lam);
    const mjds = puntos.map((p) => p.mjd);
    return {
      id: String(pa.id),
      desde: pa.desde,
      hasta: pa.hasta,
      mjdMedio: mjds.length ? (Math.min(...mjds) + Math.max(...mjds)) / 2 : mjdDe(pa.desde),
      puntos: marcarBordeSat(puntos),
      canales: Number.isFinite(pa.canales_cubiertos) ? pa.canales_cubiertos : null,
    };
  });
}

/** Valida lo mínimo del contrato; si no calza, se ignora el archivo (y se usa lo vivo). */
export function esPrecalc(j: unknown): j is PrecalcEspectro {
  const o = j as PrecalcEspectro;
  return Boolean(o && typeof o === "object" && Array.isArray(o.pasadas) && o.pasadas.every((p) => Array.isArray(p.puntos)));
}

/** «may–jun 2025» / «May–Jun 2025». */
export function etiquetaPasada(p: Pasada, idioma: string): string {
  const loc = idioma === "en" ? "en-US" : "es-CL";
  const mes = (iso: string) =>
    new Date(iso + "T12:00:00Z").toLocaleDateString(loc, { month: "short", timeZone: "UTC" }).replace(".", "");
  const anio = (iso: string) => iso.slice(0, 4);
  const [a, z] = [p.desde, p.hasta];
  const inc = incompleta(p) ? (idioma === "en" ? " (incomplete)" : " (incompleta)") : "";
  if (a.slice(0, 7) === z.slice(0, 7)) return `${mes(a)} ${anio(a)}${inc}`;
  if (anio(a) === anio(z)) return `${mes(a)}–${mes(z)} ${anio(z)}${inc}`;
  return `${mes(a)} ${anio(a)}–${mes(z)} ${anio(z)}${inc}`;
}

/** Colores de pasada (distintos de los de banda para no confundirlos). */
export const COLORES_PASADA = ["#74c0fc", "#ffa94d", "#b197fc", "#63e6be", "#ff8787", "#ffe066"];

// ── Estadística simple ──

/** Media ponderada con error: el mayor entre el formal, la dispersión/√n y el piso relativo. */
export function media(ps: PuntoVista[]): { v: number; s: number; n: number } | null {
  if (!ps.length) return null;
  let sw = 0;
  let swx = 0;
  for (const p of ps) {
    const w = 1 / p.err ** 2;
    sw += w;
    swx += w * p.mJy;
  }
  const v = swx / sw;
  const formal = 1 / Math.sqrt(sw);
  const disp =
    ps.length > 1 ? Math.sqrt(ps.reduce((a, p) => a + (p.mJy - v) ** 2, 0) / (ps.length - 1)) / Math.sqrt(ps.length) : 0;
  return { v, s: Math.max(formal, disp, PISO_REL * Math.abs(v)), n: ps.length };
}

/** Media de las medidas usables dentro de [a, z) µm. */
export const mediaEn = (ps: PuntoVista[], a: number, z: number) => media(ps.filter((p) => usable(p) && p.lam >= a && p.lam < z));

// ── Qué cambió entre pasadas ──

/** Tramos de λ para comparar pasadas (aprox. las bandas, con D4 partida en dos). */
export const TRAMOS: [number, number][] = [
  [0.75, 1.1], [1.1, 1.63], [1.63, 2.42], [2.42, 3.1], [3.1, 3.83], [3.83, 4.42], [4.42, 5.05],
];

export type Tramo = { a: number; z: number; razon: number; sigma: number; nA: number; nB: number; significativo: boolean };
export type Cambio = { antes: Pasada; despues: Pasada; meses: number; tramos: Tramo[] };

/**
 * Compara la primera y la última pasada que compartan al menos un tramo con medidas usables.
 * Un tramo es «significativo» si |B − A| > 3σ (σ con el piso PISO_REL en cada lado).
 */
export function cambios(pasadas: Pasada[]): Cambio | null {
  if (pasadas.length < 2) return null;
  const comparar = (A: Pasada, B: Pasada): Tramo[] =>
    TRAMOS.flatMap(([a, z]) => {
      const ma = mediaEn(A.puntos, a, z);
      const mb = mediaEn(B.puntos, a, z);
      if (!ma || !mb || ma.v <= 0) return [];
      const sigma = Math.abs(mb.v - ma.v) / Math.hypot(ma.s, mb.s);
      return [{ a, z, razon: mb.v / ma.v, sigma, nA: ma.n, nB: mb.n, significativo: sigma > 3 }];
    });
  // La pareja más separada en el tiempo con tramos en común.
  for (let span = pasadas.length - 1; span >= 1; span--)
    for (let i = 0; i + span < pasadas.length; i++) {
      const A = pasadas[i];
      const B = pasadas[i + span];
      const tramos = comparar(A, B);
      if (tramos.length) return { antes: A, despues: B, meses: Math.max(1, Math.round((B.mjdMedio - A.mjdMedio) / 30.44)), tramos };
    }
  return null;
}

/** Une tramos significativos contiguos del mismo signo: [{a, z, sube}] para el texto simple. */
export function resumenCambio(c: Cambio): { a: number; z: number; sube: boolean; razon: number }[] {
  const out: { a: number; z: number; sube: boolean; razon: number; k: number }[] = [];
  for (const t of c.tramos) {
    if (!t.significativo) continue;
    const sube = t.razon > 1;
    const u = out[out.length - 1];
    if (u && u.sube === sube && Math.abs(u.z - t.a) < 1e-6) {
      u.z = t.z;
      u.razon = (u.razon * u.k + t.razon) / (u.k + 1);
      u.k++;
    } else out.push({ a: t.a, z: t.z, sube, razon: t.razon, k: 1 });
  }
  return out.map(({ a, z, sube, razon }) => ({ a, z, sube, razon }));
}
