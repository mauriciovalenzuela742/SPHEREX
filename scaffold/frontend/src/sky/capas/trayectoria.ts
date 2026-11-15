/**
 * Capa «trayectoria»: dónde estaba el objeto en cada fecha y hacia dónde se mueve. Dueño: Juan Pablo (V2).
 *
 * Para el objeto de prueba más cercano al centro (los 5 de `objetivo.ts`) dibuja un aro en su posición
 * propagada a la fecha de cada imagen de fondo: 2MASS (~2000), AllWISE (~2010) y SPHEREx (2025–26), con el año
 * escrito al lado, y una flecha entre aros consecutivos. La posición de HOY la sigue marcando `objetivo.ts`.
 *
 * Posiciones: movimiento propio real de SIMBAD (J2000.0, ICRS; tabla de `objetivo.ts`, copiada de
 * `data/campos_de_prueba.yml`, verificado el 14-nov-2026) propagado con `propagar` (lineal). Se omiten el paralaje
 * (Barnard: hasta 0,55″ de desvío, 1,1″ entre extremos, del orden de un píxel de 2MASS y < 0,2 píxel de SPHEREx) y
 * la aceleración de perspectiva (Barnard: ~1,3 mas/año², ≤ 0,2″ entre 2000 y 2026).
 *
 * Fechas de cada imagen (no se usa «2000» ni «2010» redondo: Barnard se mueve 10,4″/año):
 * - 2MASS: `jdate` de la fuente en el catálogo 2MASS PSC (IRSA Gator, `fp_psc`, consultado el 14-nov-2026),
 *   pasado a año juliano: Barnard JD 2451692,93 → 2000,405; eps Ind B 2451490,61 → 1999,851;
 *   RW Aur 2451509,79 → 1999,904; R Dra 2451324,84 → 1999,397. WISE 0855 no está en el PSC (es muy fría): se
 *   usa la `jdate` de sus vecinas del mismo barrido a <1′ (2451175,833 → 1998,989).
 * - AllWISE: combina las pasadas de enero de 2010 a febrero de 2011; se usa 2010,5 como fecha media.
 *   WISE 0855: 2010,45, la que reproduce la coordenada AllWISE del enunciado dentro de 0,2″
 *   (`campos_de_prueba.yml`, posiciones_calculadas). Error esperado en los demás: ±0,3 año ⇒ ±3″ en Barnard
 *   (~2 píxeles de AllWISE, bajo el ancho de la estrella en W2, 6,4″). Mejora pendiente: `w1mjdmean` por objeto
 *   del catálogo AllWISE (IRSA devolvió 502 al consultarlo el 14-nov-2026).
 * - SPHEREx: el cubo DR1 no trae t_min / t_max en su `properties`. Se usa la media de `t_min` de las imágenes
 *   `spherex_dr1` que cubren cada objeto (SIA2 de IRSA, 14-nov-2026): WISE 0855 2025,985 (258 imágenes,
 *   2025,34–2026,36); Barnard 2025,940 (239; 2025,62–2026,34); eps Ind B 2025,746 (340); RW Aur 2025,932 (226);
 *   R Dra 2025,791 (414). Hipótesis: que el cubo pese todas las tomas por igual (no está documentado). Con «hoy»
 *   (2026,87) en vez de esto, el aro de Barnard caía ~10″ (1,6 píxeles de SPHEREx) al norte de la estrella. Dentro de
 *   la propia ventana de DR1 Barnard se movió ~7,5″ (1,2 píxeles): en el cubo sale algo estirada.
 *
 * Por qué no `A.circle` / `A.vector` (existen en 3.8.2: dist/aladin.js, `v.circle`, `v.vector`): su radio va en
 * grados, así que con zoom lejano el aro desaparece y con zoom cercano tapa medio campo; y la flecha va de centro
 * a centro, encima de la estrella que se quiere ver. Aquí se usa un catálogo de Aladin con forma propia
 * (`shape` = función sobre el canvas): el aro mide siempre lo mismo en pantalla y la flecha va de borde a borde.
 * Al ser un catálogo, aparece en el control de capas con su nombre y se puede apagar ahí también.
 */
import A from "aladin-lite";
import { propagar, EPOCA_J2000 } from "../propagacion";
import type { Capa } from "./index";
import { objetoCercano, type Objeto } from "./objetivo";

/** Año juliano de la toma de 2MASS por objeto (ver arriba). */
const EPOCA_2MASS: Record<string, number> = {
  wise_0855: 1998.989,
  barnard: 2000.405,
  eps_ind_b: 1999.851,
  rw_aur: 1999.904,
  r_dra: 1999.397,
};
const EPOCA_2MASS_DEFECTO = 2000.0;
const EPOCA_ALLWISE: Record<string, number> = { wise_0855: 2010.45 };
const EPOCA_ALLWISE_DEFECTO = 2010.5;
const EPOCA_SPHEREX: Record<string, number> = {
  wise_0855: 2025.985,
  barnard: 2025.94,
  eps_ind_b: 2025.746,
  rw_aur: 2025.932,
  r_dra: 2025.791,
};
const EPOCA_SPHEREX_DEFECTO = 2025.9;

/** Colores distinguibles con daltonismo (magenta / amarillo / cian) y siempre con el año escrito. */
const MAGENTA = "#ff5ce6";
const AMARILLO = "#ffd23f";
const CIAN = "#4fe3ff";

/** Radio del aro en píxeles de pantalla. */
const RADIO_PX = 14;
/** Si en todo el tramo se movió menos que esto (″), se dibuja un solo aro: «casi no se movió». */
const QUIETO_ARCSEC = 3;

type Punto = { ra: number; dec: number; rotulo: string; color: string };

// ---------- Interruptor «Mostrar trayectoria» (lo usa Epocas.tsx) ----------
let visible = true;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activos = new Set<any>();
const oyentes = new Set<(v: boolean) => void>();

export function trayectoriaVisible(): boolean {
  return visible;
}
export function mostrarTrayectoria(v: boolean): void {
  visible = v;
  for (const cat of activos) aplicar(cat);
  for (const fn of oyentes) fn(v);
}
export function alCambiarTrayectoria(fn: (v: boolean) => void): () => void {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function aplicar(cat: any) {
  try {
    if (visible) cat.show();
    else cat.hide();
  } catch (e) {
    console.error("[sky] no se pudo cambiar la visibilidad de la trayectoria:", e);
  }
}

// ---------- Geometría ----------
function separacionArcsec(a: Punto, b: Punto): number {
  const r = Math.PI / 180;
  const s =
    Math.sin(((b.dec - a.dec) * r) / 2) ** 2 + Math.cos(a.dec * r) * Math.cos(b.dec * r) * Math.sin(((b.ra - a.ra) * r) / 2) ** 2;
  return ((2 * Math.asin(Math.min(1, Math.sqrt(s)))) / r) * 3600;
}

function puntosDe(obj: Objeto): Punto[] {
  const e2 = EPOCA_2MASS[obj.id] ?? EPOCA_2MASS_DEFECTO;
  const ew = EPOCA_ALLWISE[obj.id] ?? EPOCA_ALLWISE_DEFECTO;
  const es = EPOCA_SPHEREX[obj.id] ?? EPOCA_SPHEREX_DEFECTO;
  const p = (ep: number) => propagar(obj.ra, obj.dec, obj.pmra, obj.pmdec, EPOCA_J2000, ep);
  const [r2, d2] = p(e2);
  const [rw, dw] = p(ew);
  const [rh, dh] = p(es);
  return [
    { ra: r2, dec: d2, // Sin «(no se ve)»: el rótulo largo se montaba sobre el de SPHEREx y quedaba en español con la página en inglés.
    // Que WISE 0855 no aparece en 2MASS ya lo dice el texto bajo el mapa (mapaAyuda).
    rotulo: `${Math.floor(e2)} · 2MASS`, color: MAGENTA },
    { ra: rw, dec: dw, rotulo: `${Math.floor(ew)} · AllWISE`, color: AMARILLO },
    { ra: rh, dec: dh, rotulo: "2025–26 · SPHEREx", color: CIAN },
  ];
}

// ---------- Dibujo (en píxeles de pantalla) ----------
type Ctx = CanvasRenderingContext2D;

/**
 * Año escrito junto al aro. (nx, ny): dirección unitaria hacia donde se aparta del centro del aro; la caja se
 * corre lo justo para no tocar el aro, sea cual sea esa dirección.
 */
function rotulo(ctx: Ctx, texto: string, x: number, y: number, nx: number, ny: number, color: string) {
  ctx.font = "bold 13px sans-serif";
  const w = ctx.measureText(texto).width + 10;
  const h = 18;
  const off = RADIO_PX + 5 + (w / 2) * Math.abs(nx) + (h / 2) * Math.abs(ny);
  const cx = x + nx * off;
  const cy = y + ny * off;
  // Franja oscura detrás del texto: contraste ≥ 4,5:1 sobre cualquier cielo (WCAG 1.4.3).
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, cx, cy);
}

function aro(ctx: Ctx, x: number, y: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, RADIO_PX, 0, 2 * Math.PI);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.75)"; // halo: se ve sobre estrellas brillantes
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/** Flecha de borde a borde de dos aros; no se dibuja si los aros se tocan. */
function flecha(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.hypot(dx, dy);
  const hueco = RADIO_PX + 4;
  if (d < 2 * hueco + 10) return;
  const ux = dx / d;
  const uy = dy / d;
  const ax = x1 + ux * hueco;
  const ay = y1 + uy * hueco;
  const bx = x2 - ux * hueco;
  const by = y2 - uy * hueco;
  const punta = 9;
  const trazo = (color: string, ancho: number) => {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.moveTo(bx - ux * punta - uy * punta * 0.6, by - uy * punta + ux * punta * 0.6);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx - ux * punta + uy * punta * 0.6, by - uy * punta - ux * punta * 0.6);
    ctx.lineWidth = ancho;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };
  trazo("rgba(0, 0, 0, 0.75)", 5);
  trazo("#ffffff", 2.2);
}

export const capaTrayectoria: Capa = {
  id: "trayectoria",
  montar: (aladin, ctx) => {
    const obj = objetoCercano(ctx.ra, ctx.dec);
    if (!obj) return () => {};

    const puntos = puntosDe(obj);
    const quieto = separacionArcsec(puntos[0], puntos[puntos.length - 1]) < QUIETO_ARCSEC;
    const aPx = (p: Punto): [number, number] | null => {
      try {
        const xy = aladin.world2pix(p.ra, p.dec);
        return xy && Number.isFinite(xy[0]) ? [xy[0], xy[1]] : null;
      } catch {
        return null;
      }
    };

    // Cada fuente dibuja su aro, su año y la flecha hacia el aro siguiente.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dibujar = (s: any, c: Ctx) => {
      const i: number = s.data.indice;
      const p = puntos[i];
      c.save();
      if (quieto) {
        aro(c, s.x, s.y, CIAN);
        rotulo(c, `Desde ${puntos[0].rotulo.split(" ")[0]}: casi no se movió`, s.x, s.y, 0, -1, CIAN);
        c.restore();
        return;
      }
      aro(c, s.x, s.y, p.color);
      // El rótulo va de costado respecto de la dirección del movimiento, para no caer sobre la flecha.
      const a = aPx(puntos[0]);
      const z = aPx(puntos[puntos.length - 1]);
      let nx = 0;
      let ny = -1;
      if (a && z && Math.hypot(z[0] - a[0], z[1] - a[1]) > 1) {
        const d = Math.hypot(z[0] - a[0], z[1] - a[1]);
        nx = -(z[1] - a[1]) / d;
        ny = (z[0] - a[0]) / d;
        if (ny > 0 || (ny === 0 && nx < 0)) {
          nx = -nx;
          ny = -ny;
        }
      }
      // Rótulos alternados a uno y otro lado: con zoom lejano los aros quedan cerca y los textos se pisarían.
      const lado = i % 2 === 1 ? -1 : 1;
      let rx = lado * nx;
      let ry = lado * ny;
      // El primero y el último caen del mismo lado: se abren en diagonal (hacia atrás y hacia adelante del
      // movimiento) para que no se monten cuando los aros quedan cerca (WISE 0855 con el zoom por defecto).
      const extremo = i === 0 ? -1 : i === puntos.length - 1 ? 1 : 0;
      if (extremo && i % 2 === 0 && a && z) {
        const d = Math.hypot(z[0] - a[0], z[1] - a[1]);
        if (d > 1) {
          const sx = rx + (extremo * 0.9 * (z[0] - a[0])) / d;
          const sy = ry + (extremo * 0.9 * (z[1] - a[1])) / d;
          const m = Math.hypot(sx, sy) || 1;
          rx = sx / m;
          ry = sy / m;
        }
      }
      rotulo(c, p.rotulo, s.x, s.y, rx, ry, p.color);
      const sig = i + 1 < puntos.length ? aPx(puntos[i + 1]) : null;
      if (sig) flecha(c, s.x, s.y, sig[0], sig[1]);
      c.restore();
    };

    const cat = A.catalog({ name: `Trayectoria de ${obj.nombre}`, shape: dibujar, color: CIAN, sourceSize: 2 * RADIO_PX });
    aladin.addCatalog(cat);
    const fuentes = (quieto ? [puntos[puntos.length - 1]] : puntos).map((p, k) =>
      A.source(p.ra, p.dec, {
        indice: quieto ? puntos.length - 1 : k,
        fecha: p.rotulo,
        ra: p.ra.toFixed(6),
        dec: p.dec.toFixed(6),
      }),
    );
    cat.addSources(fuentes);
    activos.add(cat);
    aplicar(cat);

    return () => {
      activos.delete(cat);
      aladin.removeOverlay(cat);
    };
  },
};
