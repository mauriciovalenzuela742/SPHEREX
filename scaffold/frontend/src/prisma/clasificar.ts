/**
 * Tipo probable de un astro a partir de su espectro SPHEREx (0,75–5 µm), con reglas simples y explicables.
 * EXPORT ESTABLE: `clasificar(puntos)` también lo usarán los candidatos de CatWISE. No cambiar la firma.
 *
 * Solo se usan medidas no saturadas con S/N ≥ 3 (estado "medida"). Flujo en mJy (fν). Reglas, en orden:
 *  0. En las bandas con tantos saturados como medidas, las medidas no se usan (al borde de la saturación).
 *  1. Indeterminado si todo está saturado, si hay medidas en menos de 3 bandas de SPHEREx o si no cubren
 *     al menos un factor 2 en λ (con una sola banda no se clasifica nada).
 *  2. Enana marrón: pico en ~3,9–4,5 µm (P), con depresión de metano en 2,8–3,6 µm (P/M ≥ 2) y poca luz bajo
 *     1,5 µm comparada con el pico (S/P < 0,7).
 *  3. Estrella joven con polvo: el flujo sube hacia λ largas (pendiente α = dlog fν / dlog λ > 0,3 sobre
 *     λ ≥ 1,5 µm) y 4–5 µm supera a 1,5–2,5 µm en más de 30 %.
 *  4. Estrella: el flujo cae hacia λ largas (α < −0,5; la cola de Rayleigh-Jeans da α ≈ −2).
 *  5. Si nada calza: indeterminado.
 * La confianza nunca es «alta»: es una orientación, no una clasificación espectral.
 */

export type PuntoClasif = { lam: number; mJy: number; err: number; estado: string };
export type Tipo = "estrella" | "estrella_joven_polvo" | "enana_marron" | "indeterminado";
export type Clasificacion = { tipo: Tipo; confianza: "baja" | "media"; motivo: string };

const BANDAS: [number, number][] = [[0.7, 1.1], [1.1, 1.63], [1.63, 2.42], [2.42, 3.83], [3.83, 4.42], [4.42, 5.1]];
const REG = { S: [0.74, 1.5], K: [1.5, 2.5], M: [2.8, 3.6], P: [3.9, 4.5], L: [4.5, 5.1] } as const;

function mediana(a: number[]): number {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN;
}

/** Pendiente de mínimos cuadrados de log fν contra log λ. */
function pendiente(ps: PuntoClasif[]): number {
  if (ps.length < 3) return NaN;
  const x = ps.map((p) => Math.log10(p.lam));
  const y = ps.map((p) => Math.log10(p.mJy));
  const mx = x.reduce((a, b) => a + b, 0) / x.length;
  const my = y.reduce((a, b) => a + b, 0) / y.length;
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
  }
  return sxx > 0 ? sxy / sxx : NaN;
}

const f2 = (n: number, en: boolean) => (en ? n.toFixed(1) : n.toFixed(1).replace(".", ","));

export function clasificar(puntos: PuntoClasif[], idioma: "es" | "en" = "es"): Clasificacion {
  const en = idioma === "en";
  const tr = (es: string, eng: string) => (en ? eng : es);
  const ind = (motivo: string): Clasificacion => ({ tipo: "indeterminado", confianza: "baja", motivo });

  if (!puntos.length) return ind(tr("No hay puntos.", "No points."));
  const medidas = puntos.filter((p) => p.estado === "medida" && p.mJy > 0 && p.err > 0 && p.mJy / p.err >= 3 && Number.isFinite(p.lam));
  const sat = puntos.filter((p) => p.estado === "saturado");
  const nSat = sat.length;
  // En una banda con tantos saturados como medidas, las medidas están al borde de la saturación y
  // probablemente subestimadas (Barnard en D1): no se usan.
  const enBanda = (p: PuntoClasif, [a, z]: [number, number]) => p.lam >= a && p.lam < z;
  const dudosas = BANDAS.filter((b) => sat.filter((p) => enBanda(p, b)).length >= medidas.filter((p) => enBanda(p, b)).length);
  const ok = medidas.filter((p) => BANDAS.some((b) => enBanda(p, b)) && !dudosas.some((b) => enBanda(p, b)));
  if (!ok.length && nSat > 0)
    return ind(tr("Todo o casi todo está saturado: es demasiado brillante para medir su forma.", "Everything or nearly everything is saturated: too bright to measure its shape."));
  const bandas = BANDAS.filter(([a, z]) => ok.some((p) => p.lam >= a && p.lam < z)).length;
  const lams = ok.map((p) => p.lam);
  const cubre = lams.length ? Math.max(...lams) / Math.min(...lams) : 0;
  if (bandas >= 3 && cubre < 2)
    return ind(
      tr(
        `Las medidas buenas solo cubren de ${f2(Math.min(...lams), en)} a ${f2(Math.max(...lams), en)} µm: hace falta un tramo más ancho (de λ a 2λ).`,
        `Good measurements only cover ${f2(Math.min(...lams), en)} to ${f2(Math.max(...lams), en)} µm: a wider range (λ to 2λ) is needed.`,
      ),
    );
  if (bandas < 3) {
    const sat = nSat > puntos.length / 3 ? tr(" (el resto está saturado)", " (the rest is saturated)") : "";
    return ind(
      tr(
        `Hay medidas buenas en solo ${bandas} ${bandas === 1 ? "banda" : "bandas"}${sat}: hacen falta al menos 3 que cubran de λ a 2λ.`,
        `Good measurements in only ${bandas} ${bandas === 1 ? "band" : "bands"}${sat}: at least 3 bands spanning λ to 2λ are needed.`,
      ),
    );
  }

  const reg = (k: keyof typeof REG) => mediana(ok.filter((p) => p.lam >= REG[k][0] && p.lam < REG[k][1]).map((p) => p.mJy));
  const S = reg("S");
  const K = reg("K");
  const M = reg("M");
  const P = reg("P");
  const L = reg("L");
  // Si en 2,8–3,6 µm solo hay límites, el más bajo sirve de cota superior para la depresión.
  const limM = puntos
    .filter((p) => p.estado === "limite" && p.lam >= REG.M[0] && p.lam < REG.M[1])
    .map((p) => Math.max(p.mJy, 0) + 3 * p.err);
  const Mcota = Number.isFinite(M) ? M : limM.length ? Math.min(...limM) : NaN;
  const maxReg = Math.max(...[S, K, M, P, L].filter(Number.isFinite));

  // 2. Enana marrón
  if (Number.isFinite(P) && Number.isFinite(Mcota) && P / Mcota >= 2 && P >= 0.8 * maxReg && (!Number.isFinite(S) || S / P < 0.7)) {
    const media = Number.isFinite(M) && Number.isFinite(S) && P / M >= 3 && S / P < 0.6 && bandas >= 5;
    return {
      tipo: "enana_marron",
      confianza: media ? "media" : "baja",
      motivo: tr(
        `Su luz tiene un pico en ~4 µm, ${f2(P / Mcota, en)} veces más que en 2,8–3,6 µm (ahí el metano se come la luz), y bajo 1,5 µm ${Number.isFinite(S) ? `tiene ${f2(S / P, en)} veces la del pico` : "no hay medidas"}. Ese patrón es típico de una enana marrón fría.`,
        `Its light peaks at ~4 µm, ${f2(P / Mcota, en)} times more than at 2.8–3.6 µm (where methane absorbs light), and below 1.5 µm it ${Number.isFinite(S) ? `has ${f2(S / P, en)} times the peak` : "has no measurements"}. That pattern is typical of a cool brown dwarf.`,
      ),
    };
  }

  const alfa = pendiente(ok.filter((p) => p.lam >= 1.5));
  const largo = Math.max(...[P, L].filter(Number.isFinite));

  // Pico en 4 µm que vuelve a bajar hacia 4,5–5 µm pero sin medidas en 2,8–3,6 µm: no se puede confirmar
  // el metano, y tampoco es la subida sostenida de una estrella joven.
  const picoQueBaja = Number.isFinite(P) && Number.isFinite(L) && L < 0.8 * P;
  if (picoQueBaja && !Number.isFinite(Mcota) && P >= 0.8 * maxReg)
    return ind(
      tr(
        "Tiene un pico en ~4 µm que vuelve a bajar (podría ser una enana marrón), pero faltan medidas en 2,8–3,6 µm para ver si hay metano.",
        "It has a peak at ~4 µm that falls again (it could be a brown dwarf), but there are no measurements at 2.8–3.6 µm to check for methane.",
      ),
    );

  // 3. Estrella joven con polvo (subida sostenida: 4,5–5 µm no cae bajo el 80 % de 3,9–4,5 µm)
  if (Number.isFinite(alfa) && alfa > 0.3 && Number.isFinite(K) && Number.isFinite(largo) && largo > 1.3 * K && !picoQueBaja) {
    return {
      tipo: "estrella_joven_polvo",
      confianza: alfa > 0.8 && bandas >= 4 ? "media" : "baja",
      motivo: tr(
        `Su brillo sube hacia 4–5 µm (${f2(largo / K, en)} veces lo de 1,5–2,5 µm, pendiente ${f2(alfa, en)}). Una estrella sola bajaría; ese exceso infrarrojo suele venir de polvo tibio alrededor de una estrella joven.`,
        `Its brightness rises toward 4–5 µm (${f2(largo / K, en)} times the 1.5–2.5 µm level, slope ${f2(alfa, en)}). A bare star would fall; that infrared excess usually comes from warm dust around a young star.`,
      ),
    };
  }

  // 4. Estrella
  const alfaTodo = Number.isFinite(alfa) ? alfa : pendiente(ok);
  if (Number.isFinite(alfaTodo) && alfaTodo < -0.5) {
    return {
      tipo: "estrella",
      confianza: alfaTodo < -1.2 && bandas >= 4 ? "media" : "baja",
      motivo: tr(
        `Su brillo cae hacia λ largas (pendiente ${f2(alfaTodo, en)}; la cola de una estrella da cerca de −2). No hay exceso infrarrojo ni depresión de metano.`,
        `Its brightness falls toward long λ (slope ${f2(alfaTodo, en)}; a star's tail gives about −2). No infrared excess and no methane dip.`,
      ),
    };
  }

  return ind(
    tr(
      `La forma no calza claramente con ninguna regla (pendiente ${Number.isFinite(alfaTodo) ? f2(alfaTodo, en) : "?"}).`,
      `The shape does not clearly match any rule (slope ${Number.isFinite(alfaTodo) ? f2(alfaTodo, en) : "?"}).`,
    ),
  );
}
