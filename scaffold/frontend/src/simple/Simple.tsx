/**
 * Vista simple (sin «Modo ciencia»): una imagen grande de SPHEREx en falso color con el objeto marcado, las fechas
 * (una por pasada de ~6 meses) y la barra «Luz» (todas / cercana / media / lejana). Para el público general.
 * Usa las mismas fotos reales que el Explorador (useDatosSpherex), con las 6 bandas.
 * Falso color: D1–D2 → azul, D3–D4 → verde, D5–D6 → rojo (como el Ojo infrarrojo del Prisma).
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CAMPOS, nombreDe, posicionActual } from "../content/campos";
import { leerPar } from "../apuntar/coordenadas";
import { asinh01, type Frame } from "../explorador/render";
import { clave, useDatosSpherex } from "../explorador/useDatosSpherex";
import type { Estado } from "../state/url";
import { useIdioma } from "../state/idioma";
import InterruptorCiencia from "./InterruptorCiencia";
import "./simple.css";

type Props = { estado: Estado; set: (p: Partial<Estado>) => void; onCiencia: () => void };
type Luz = "todas" | "cercana" | "media" | "lejana";
type Pasada = { desde: number; hasta: number; medio: number };

const TODAS = [1, 2, 3, 4, 5, 6];
const HUECO_DIAS = 60;
const CORTO: Record<string, string> = { barnard: "Barnard", eps_ind_b: "ε Indi B", wise_0855: "WISE 0855", rw_aur: "RW Aurigae", r_dra: "R Draconis" };
/** Bandas y color de cada luz. En «todas», cada grupo va a un canal (R, G, B). */
const LUCES: Record<Exclude<Luz, "todas">, { bandas: number[]; tinte: [number, number, number] }> = {
  cercana: { bandas: [1, 2], tinte: [138, 180, 255] },
  media: { bandas: [3, 4], tinte: [125, 207, 163] },
  lejana: { bandas: [5, 6], tinte: [255, 122, 89] },
};
const MESES = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const fechaDe = (mjd: number) => new Date((mjd - 40587) * 864e5);
const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function campoEn(ra: number, dec: number) {
  return CAMPOS.find((c) => {
    const p = posicionActual(c);
    return Math.hypot((p.ra - ra) * Math.cos((dec * Math.PI) / 180), p.dec - dec) < 0.05;
  });
}

function rotuloPasada(p: Pasada, idioma: "es" | "en") {
  const m = MESES[idioma];
  const a = fechaDe(p.desde);
  const z = fechaDe(p.hasta);
  const [ma, ya, mz, yz] = [a.getUTCMonth(), a.getUTCFullYear(), z.getUTCMonth(), z.getUTCFullYear()];
  if (ya === yz && ma === mz) return `${m[ma]} ${ya}`;
  if (ya === yz) return `${m[ma]}–${m[mz]} ${yz}`;
  return `${m[ma]} ${ya}–${m[mz]} ${yz}`;
}

export default function Simple({ estado, set, onCiencia }: Props) {
  const { tr, idioma, cambiar } = useIdioma();
  const datos = useDatosSpherex(estado.ra, estado.dec, estado.size, true);
  const { grid, frames, escalas, version, prog, mensaje, cargar, setCargar, visitaMasCercana } = datos;
  // La vista simple siempre muestra las 6 bandas (los presets del Explorador cargan solo una).
  useEffect(() => {
    if (cargar.length < 6) setCargar(TODAS);
  }, [cargar, setCargar]);

  const campo = campoEn(estado.ra, estado.dec);
  const [luz, setLuz] = useState<Luz>("todas");
  const [pasadaSel, setPasadaSel] = useState<number | null>(null);
  const [play, setPlay] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [ayuda, setAyuda] = useState(false);
  const [aviso, setAviso] = useState(() => {
    try {
      return localStorage.getItem("astrotrack.simple.aviso") !== "1";
    } catch {
      return true;
    }
  });
  const cerrarAviso = () => {
    setAviso(false);
    try {
      localStorage.setItem("astrotrack.simple.aviso", "1");
    } catch {
      /* modo privado */
    }
  };

  // ── Pasadas: todas las visitas de todas las bandas, agrupadas cuando hay más de 60 días de hueco ──
  const pasadas = useMemo<Pasada[]>(() => {
    if (!grid) return [];
    const mjds = Object.values(grid.visits).flat().map((v) => v.mjd).sort((a, b) => a - b);
    const out: Pasada[] = [];
    for (const m of mjds) {
      const u = out[out.length - 1];
      if (u && m - u.hasta <= HUECO_DIAS) u.hasta = m;
      else out.push({ desde: m, hasta: m, medio: m });
    }
    return out.map((p) => ({ ...p, medio: (p.desde + p.hasta) / 2 }));
  }, [grid]);
  const iPasada = pasadaSel !== null && pasadaSel < pasadas.length ? pasadaSel : pasadas.length - 1;
  const pasada = pasadas[iPasada];
  // Otro objeto: vuelve a la última fecha.
  useEffect(() => {
    setPasadaSel(null);
    setPlay(false);
  }, [estado.ra, estado.dec]);
  // ▶: recorre las fechas en bucle.
  useEffect(() => {
    if (!play || pasadas.length < 2) return;
    const id = window.setInterval(() => setPasadaSel((i) => ((i ?? pasadas.length - 1) + 1) % pasadas.length), 1100);
    return () => window.clearInterval(id);
  }, [play, pasadas.length]);

  // ── Fotograma de cada banda en la pasada elegida ──
  const porBanda = new Map<number, Frame>();
  if (grid && pasada)
    for (const b of TODAS) {
      const vs = grid.visits[b];
      if (!vs?.length) continue;
      const i = visitaMasCercana(b, pasada.medio);
      if (vs[i].mjd < pasada.desde - 1 || vs[i].mjd > pasada.hasta + 1) continue; // esa banda no tiene foto en esta pasada
      const fr = frames.current.get(clave(b, i));
      if (fr) porBanda.set(b, fr);
    }
  const n = [...porBanda.values()][0]?.meta.n_px ?? 0;
  const bandasLuz = luz === "todas" ? TODAS : LUCES[luz].bandas;
  const hayLuz = bandasLuz.some((b) => porBanda.has(b));

  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = lienzo.current;
    if (!c || !n) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = n;
    c.height = n;
    const img = ctx.createImageData(n, n);
    const valor = (grupo: number[], i: number) => {
      let s = 0;
      let k = 0;
      for (const b of grupo) {
        const fr = porBanda.get(b);
        const esc = escalas.current.get(b);
        if (!fr || !esc || fr.meta.n_px !== n) continue;
        const v = fr.arr[i];
        if (Number.isFinite(v)) {
          s += asinh01(v, esc.vmin, esc.vmax);
          k++;
        }
      }
      return k ? s / k : 0;
    };
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        const o = ((n - 1 - y) * n + x) * 4; // fila 0 = sur
        if (luz === "todas") {
          img.data[o] = 255 * valor([5, 6], i);
          img.data[o + 1] = 255 * valor([3, 4], i);
          img.data[o + 2] = 255 * valor([1, 2], i);
        } else {
          const v = valor(LUCES[luz].bandas, i);
          const [r, g, b] = LUCES[luz].tinte;
          img.data[o] = r * v;
          img.data[o + 1] = g * v;
          img.data[o + 2] = b * v;
        }
        img.data[o + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  }); // se repinta en cada render: lo disparan `version` (llega una foto), la fecha y la luz

  // ── Búsqueda: nombre de un objeto de prueba o coordenadas ──
  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const q = sinTildes(busqueda);
    if (!q) return;
    const c = CAMPOS.find((x) => [x.id, x.nombre, x.nombreEn ?? "", CORTO[x.id] ?? ""].some((s) => sinTildes(s).includes(q) || (q.length >= 3 && q.includes(sinTildes(s)) && sinTildes(s).length >= 3)));
    if (c) {
      set(posicionActual(c));
      setErrorBusqueda(null);
      return;
    }
    const par = leerPar(busqueda.replace(/,(?=\s)/, " "));
    if (par && par.ok) {
      set({ ra: Number(par.ra.toFixed(6)), dec: Number(par.dec.toFixed(6)) });
      setErrorBusqueda(null);
    } else
      setErrorBusqueda(
        tr("No lo encontré. Prueba «Barnard», «WISE 0855» o coordenadas como «133.79 -7.24».", "Not found. Try “Barnard”, “WISE 0855” or coordinates like “133.79 -7.24”."),
      );
  };

  const se_mueve = campo?.tipo === "se mueve";
  const textoAviso = !campo
    ? tr("La marca naranja es el punto que elegiste. Pasa las fechas para ver si algo se mueve o cambia de brillo.", "The orange mark is the spot you chose. Step through the dates to see if anything moves or changes brightness.")
    : se_mueve
      ? tr("El punto naranja se mueve entre fotos: así se buscan planetas y estrellas cercanas.", "The orange dot moves between photos: that is how nearby planets and stars are found.")
      : tr("El punto naranja cambia de brillo entre fotos: así se estudian estrellas que laten o se apagan.", "The orange dot changes brightness between photos: that is how pulsing or fading stars are studied.");
  const tocar = () => {
    cerrarAviso();
    if (pasadas.length > 1) setPasadaSel((iPasada + 1) % pasadas.length);
  };
  const escala30 = grid && n ? (30 / grid.pixel_scale_arcsec / n) * 100 : 0;
  const textoLuz: Record<Luz, string> = {
    todas: tr("todas, en falso color (azul: cercana · rojo: lejana)", "all of it, in false color (blue: near · red: far)"),
    cercana: tr("cercana (0,75–1,6 µm): la que más se parece a la que ven tus ojos", "near (0.75–1.6 µm): the closest to what your eyes see"),
    media: tr("media (1,6–3,8 µm)", "middle (1.6–3.8 µm)"),
    lejana: tr("lejana (3,8–5 µm): el calor de los objetos fríos, como las enanas marrones", "far (3.8–5 µm): the heat of cold objects such as brown dwarfs"),
  };

  return (
    <div className="simple">
      <header className="simple-barra">
        <button className="simple-marca" onClick={() => set({ vista: "landing" })}>AstroTRACK</button>
        <form className="simple-busca" onSubmit={buscar} role="search">
          <span aria-hidden="true">⌕</span>
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setErrorBusqueda(null);
            }}
            placeholder={tr("Busca un objeto o unas coordenadas", "Search an object or coordinates")}
            aria-label={tr("Busca un objeto o unas coordenadas", "Search an object or coordinates")}
          />
          {errorBusqueda && <span className="simple-busca-error" role="alert">{errorBusqueda}</span>}
        </form>
        <nav className="simple-chips" aria-label={tr("Objetos", "Objects")}>
          {CAMPOS.map((c) => (
            <button key={c.id} className={campo?.id === c.id ? "activo" : ""} onClick={() => set(posicionActual(c))} title={nombreDe(c, idioma)}>
              {CORTO[c.id] ?? nombreDe(c, idioma)}
            </button>
          ))}
        </nav>
        <div className="simple-derecha">
          <InterruptorCiencia activo={false} onCambiar={onCiencia} />
          <button className="simple-ayuda-btn" aria-expanded={ayuda} onClick={() => setAyuda((v) => !v)} aria-label={tr("Ayuda", "Help")}>?</button>
          <span className="simple-idioma">
            <button className={idioma === "es" ? "activo" : ""} onClick={() => cambiar("es")}>ES</button>|
            <button className={idioma === "en" ? "activo" : ""} onClick={() => cambiar("en")}>EN</button>
          </span>
        </div>
      </header>

      {ayuda && (
        <div className="simple-ayuda" role="note">
          <p>{tr("Estas son fotos reales del telescopio SPHEREx de la NASA, tomadas cada ~6 meses. Elige un objeto arriba, pasa las fechas y mira qué cambia.", "These are real photos from NASA's SPHEREx telescope, taken every ~6 months. Pick an object above, step through the dates and see what changes.")}</p>
          <p>{tr("La barra «Luz» elige qué tipo de luz infrarroja ves: cada objeto brilla distinto según la luz.", "The “Light” bar picks which kind of infrared light you see: each object shines differently in each light.")}</p>
          <p>{tr("¿Quieres todas las herramientas (resta de fotos, espectro, catálogos)? Activa «Modo ciencia».", "Want every tool (photo subtraction, spectrum, catalogs)? Turn on “Science mode”.")}</p>
        </div>
      )}

      <main className="simple-centro">
        {aviso && (
          <div className="simple-aviso" role="status">
            <span>
              {textoAviso} {pasadas.length > 1 && <b>{tr("Tócalo.", "Tap it.")}</b>}
            </span>
            <button onClick={cerrarAviso}>{tr("Entendido", "Got it")}</button>
          </div>
        )}
        <div className="simple-imagen">
          {n > 0 && <canvas ref={lienzo} aria-label={tr("Foto de SPHEREx en falso color", "SPHEREx photo in false color")} />}
          {n > 0 && !hayLuz && <p className="simple-mensaje">{tr("No hay fotos con esta luz en esta fecha.", "No photos in this light on this date.")}</p>}
          {!n && (
            <p className="simple-mensaje">
              {grid || prog.total ? tr("Cargando fotos de SPHEREx…", "Loading SPHEREx photos…") : mensaje}
              {prog.total > 0 && ` ${prog.hechos}/${prog.total}`}
            </p>
          )}
          {n > 0 && (
            <button className="simple-marca-objeto" onClick={tocar} aria-label={tr("Siguiente foto", "Next photo")}>
              <span className="smo-aro" />
              <span className="smo-nombre">{campo ? nombreDe(campo, idioma) : tr("Tu punto", "Your spot")}</span>
            </button>
          )}
          {pasada && n > 0 && <span className="simple-fecha">{rotuloPasada(pasada, idioma === "en" ? "en" : "es")}</span>}
          {escala30 > 0 && (
            // La raya mide 30″ en la imagen: su ancho es un % del cuadro; el rótulo va al lado, fuera de ese ancho.
            <span className="simple-escala" style={{ width: `${escala30}%` }}>
              <i />
              <b>30″</b>
            </span>
          )}
          {prog.total > 0 && prog.hechos < prog.total && n > 0 && <span className="simple-cargando">{prog.hechos}/{prog.total}</span>}
          <span hidden data-version={version} />
        </div>
        {pasadas.length > 0 && (
          <div className="simple-fechas" role="group" aria-label={tr("Fechas", "Dates")}>
            <button onClick={() => setPlay((v) => !v)} aria-label={play ? tr("Pausa", "Pause") : tr("Reproducir", "Play")} disabled={pasadas.length < 2}>
              {play ? "❚❚" : "▶"}
            </button>
            {pasadas.map((p, i) => (
              <button key={p.desde} className={i === iPasada ? "activo" : ""} onClick={() => { setPlay(false); setPasadaSel(i); }}>
                {rotuloPasada(p, idioma === "en" ? "en" : "es")}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="simple-luz">
        <p>
          <b>{tr("Luz:", "Light:")}</b> {textoLuz[luz]}
        </p>
        <div className="simple-luz-botones" role="radiogroup" aria-label={tr("Luz", "Light")}>
          {(["todas", "cercana", "media", "lejana"] as Luz[]).map((l) => (
            <button key={l} role="radio" aria-checked={luz === l} className={`luz-${l}${luz === l ? " activo" : ""}`} onClick={() => setLuz(l)}>
              {l === "todas" ? tr("Todas", "All") : l === "cercana" ? tr("Cercana", "Near") : l === "media" ? tr("Media", "Middle") : tr("Lejana (calor)", "Far (heat)")}
            </button>
          ))}
        </div>
        <div className="simple-luz-ejes">
          <span>{tr("0,75 µm", "0.75 µm")}</span>
          <span>5 µm</span>
        </div>
      </footer>
    </div>
  );
}
