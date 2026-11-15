/**
 * Resultados de la huella espectral (PR #58, eda/huella_espectral/) precalculados para el visor.
 * Los genera `eda/huella_espectral/exportar_visor.py` en `public/precalc/huella/`: no recalcula nada, copia
 * las pilas por pasada y las cifras de los *_resultado.json. Este módulo solo los carga y los tipa.
 */
import { useEffect, useState } from "react";

export type Posicion = { x: number; y: number; sep: number; snr_int: number };
export type PasadaLimpieza = {
  pasada: number;
  desde: string;
  hasta: string;
  n_exp: number;
  corto: (number | null)[];
  largo: (number | null)[];
  limpio: (number | null)[];
  vecina_xy: [number, number];
  pos: { raw_largo: Posicion; psf_clean: Posicion; spec_clean: Posicion };
  supresion: { vs_corto: number; vs_largo: number; psf: number };
};
export type Limpieza = {
  objeto: string;
  n: number;
  escala_arcsec: number;
  alpha: number;
  err_alpha: number;
  sep_predicha: Record<string, number>;
  sep_medida_huella: Record<string, number>;
  pasadas: PasadaLimpieza[];
};

export type Busqueda = { n_completas: number; rotas_desde_P1: number; huerfanas_Pfin: number; n_candidatas: number };
export type Caso = {
  id: string;
  dpos: number | null;
  D: number | null;
  clase: "movil" | "movil_sin_espectro" | "variable" | "saturada";
  sigma?: number;
  predicho?: number;
  pasadas: number;
  D_rango?: [number, number];
  D_pares?: Record<string, number>;
  zigzag?: number[];
  candidatas_posicion?: number;
  predicho_grupo?: number;
  dif_con_paralaje?: number;
  dif_sin_paralaje?: number;
  D_campo_mediana?: number;
  quietas_mediana?: number;
  frac_saturadas?: number;
  n_sat?: number;
  n_exp?: number;
};
export type Resumen = {
  wise_0855: {
    D_misma: Record<string, number>;
    D_estrella_a_objeto: Record<string, number>;
    D_objeto_a_estrella: Record<string, number>;
    D_estaticas: Record<string, number>;
    frac_roja: number;
    frac_roja_vecina: number;
    busqueda: { posicional: Busqueda; huella: Busqueda };
    medido: number;
    err: number;
    sigma: number;
    predicho: number;
    sep: Record<string, { medida_arcsec: number; predicha_arcsec: number }>;
  };
  casos: Caso[];
};

export type BinFondo = { lam: number; lo: number; hi: number; p25: number; med: number };
export type Fondo = {
  n_exp: number;
  n_pix: number;
  campos: { id: string; beta: number; b: number; saturado: boolean; n_pix: number; espectro: BinFondo[] }[];
  razon_D5_rw_eps: number;
  r_D5_beta: number;
  halo: Record<string, { std_norm: [number, number]; pos3: [number, number]; neg3: [number, number] }>;
  firmas: { firma: string; lam: number; banda: string }[];
};

const cache = new Map<string, Promise<unknown>>();

/** Carga un JSON de `public/precalc/huella/` una sola vez. Devuelve null mientras carga o si falta. */
export function useHuella<T>(archivo: "limpieza_wise_0855" | "resumen" | "fondo", valido: (d: unknown) => boolean): T | null {
  const [d, setD] = useState<T | null>(null);
  useEffect(() => {
    let vivo = true;
    if (!cache.has(archivo)) {
      cache.set(
        archivo,
        fetch(`/precalc/huella/${archivo}.json`)
          .then((r) => (r.ok ? r.text() : ""))
          .then((txt) => {
            try {
              return JSON.parse(txt) as unknown; // vite responde index.html con 200 si falta: se valida
            } catch {
              return null;
            }
          })
          .catch(() => null),
      );
    }
    cache.get(archivo)!.then((j) => {
      if (vivo && j && valido(j)) setD(j as T);
    });
    return () => {
      vivo = false;
    };
  }, [archivo]); // eslint-disable-line react-hooks/exhaustive-deps
  return d;
}

export const esLimpieza = (d: unknown) => !!d && Array.isArray((d as Limpieza).pasadas) && typeof (d as Limpieza).alpha === "number";
export const esResumen = (d: unknown) => !!d && Array.isArray((d as Resumen).casos) && !!(d as Resumen).wise_0855;
export const esFondo = (d: unknown) => !!d && Array.isArray((d as Fondo).campos);

/** Nombre visible de cada objeto de prueba. */
export const NOMBRES: Record<string, string> = {
  wise_0855: "WISE 0855",
  eps_ind_b: "ε Ind B",
  barnard: "Barnard",
  rw_aur: "RW Aur",
  r_dra: "R Dra",
};
