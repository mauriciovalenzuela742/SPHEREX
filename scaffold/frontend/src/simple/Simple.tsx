/**
 * Vista simple (sin «Modo ciencia»): una imagen grande de SPHEREx con el objeto marcado, las fechas
 * (una por pasada de ~6 meses) y la barra «Luz» (normal / cercana / media / lejana). Para el público general.
 * Usa las mismas fotos reales que el Explorador (useDatosSpherex), con las 6 bandas.
 * «Normal»: el promedio por píxel de las 6 bandas, cada una ajustada a su propio brillo, en blanco y negro (no es la luz sumada).
 * Cercana / media / lejana: solo esas bandas, teñidas de su color.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CAMPOS, nombreDe, posicionActual } from "../content/campos";
import { leerPar } from "../apuntar/coordenadas";
import { EntradaCoordenadas } from "../apuntar/Apuntar";
import { asinh01, type Frame } from "../explorador/render";
import { clave, useDatosSpherex } from "../explorador/useDatosSpherex";
import { enIdioma } from "../explorador/errores";
import type { Estado } from "../state/url";
import { useIdioma } from "../state/idioma";
import InterruptorCiencia from "./InterruptorCiencia";
import "./simple.css";

type Props = { estado: Estado; set: (p: Partial<Estado>) => void; onCiencia: () => void; onTutorial?: () => void };
type Luz = "normal" | "cercana" | "media" | "lejana";
type Pasada = { desde: number; hasta: number; medio: number };

const TODAS = [1, 2, 3, 4, 5, 6];
/** Primera fecha con datos de SPHEREx que pide el explorador (DESDE en useDatosSpherex). Límite del calendario. */
const PRIMERA_FECHA = "2025-04-01";
const HUECO_DIAS = 60;
const CORTO: Record<string, string> = { barnard: "Barnard", eps_ind_b: "ε Indi B", wise_0855: "WISE 0855", rw_aur: "RW Aurigae", r_dra: "R Draconis" };
/** Bandas y color de cada luz filtrada («normal» usa las 6 sin color). */
const LUCES: Record<Exclude<Luz, "normal">, { bandas: number[]; tinte: [number, number, number] }> = {
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

export default function Simple({ estado, set, onCiencia, onTutorial }: Props) {
  const { tr, idioma, cambiar } = useIdioma();
  const datos = useDatosSpherex(estado.ra, estado.dec, estado.size, true);
  // Rango de fechas que se pide a SPHEREx: el mismo «Desde / Hasta» del Explorador, con calendario.
  const { desde, setDesde, hasta, setHasta } = datos;
  const hoyIso = new Date().toISOString().slice(0, 10);
  const { grid, frames, escalas, version, prog, mensaje, cargar, setCargar, visitaMasCercana, setIntento, reintentarFallidas, reintentando, errores } = datos;
  // La vista simple siempre muestra las 6 bandas (los presets del Explorador cargan solo una).
  useEffect(() => {
    if (cargar.length < 6) setCargar(TODAS);
  }, [cargar, setCargar]);

  const campo = campoEn(estado.ra, estado.dec);
  const [luz, setLuz] = useState<Luz>("normal");
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
  // «Compara dos fechas»: A y B son índices de pasada; con las dos elegidas, «Ver A − B» muestra la resta.
  const [ab, setAb] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [verResta, setVerResta] = useState(false);
  // Otro objeto u otras fechas: vuelve a la última fecha y se borran A y B.
  useEffect(() => {
    setPasadaSel(null);
    setPlay(false);
    setAb({ a: null, b: null });
    setVerResta(false);
  }, [estado.ra, estado.dec]);
  useEffect(() => {
    setAb({ a: null, b: null });
    setVerResta(false);
  }, [grid]);
  // ▶: recorre las fechas en bucle.
  useEffect(() => {
    if (!play || pasadas.length < 2) return;
    const id = window.setInterval(() => setPasadaSel((i) => ((i ?? pasadas.length - 1) + 1) % pasadas.length), 1100);
    return () => window.clearInterval(id);
  }, [play, pasadas.length]);
  // Teclado: espacio pausa o sigue; ← → pasan de fecha (y pausan). No actúa mientras se escribe en un campo.
  useEffect(() => {
    const tecla = (ev: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || pasadas.length < 2) return;
      if (document.querySelector(".tut")) return; // con el tutorial abierto, las flechas son suyas
      if (ev.key === " " && tag !== "BUTTON") {
        ev.preventDefault();
        setPlay((v) => !v);
      } else if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        const d = ev.key === "ArrowRight" ? 1 : -1;
        setPlay(false);
        setPasadaSel((i) => ((i ?? pasadas.length - 1) + d + pasadas.length) % pasadas.length);
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [pasadas.length]);

  // ── Fotograma de cada banda en una pasada ──
  const fotosDe = (p: Pasada | undefined) => {
    const m = new Map<number, Frame>();
    if (grid && p)
      for (const b of TODAS) {
        const vs = grid.visits[b];
        if (!vs?.length) continue;
        // Dentro de la pasada, la visita con más exposiciones combinadas (mediana): con 1–2 fotos la mediana no
        // quita rayos cósmicos ni píxeles calientes y aparecen manchas que no están en las otras fechas
        // (eps Ind B: 2025-10-23 con 2 fotos, 2026-04-30 con 1). A igual cantidad, la más cercana al centro.
        const iMedio = visitaMasCercana(b, p.medio);
        let mejor: Frame | undefined;
        let dMejor = Infinity;
        vs.forEach((v, i) => {
          if (v.mjd < p.desde - 1 || v.mjd > p.hasta + 1) return; // fuera de esta pasada
          const fr = frames.current.get(clave(b, i));
          if (!fr) return;
          const d = Math.abs(i - iMedio);
          const n = fr.meta.n_stacked ?? 1;
          const nMejor = mejor?.meta.n_stacked ?? 0;
          if (!mejor || n > nMejor || (n === nMejor && d < dMejor)) {
            mejor = fr;
            dMejor = d;
          }
        });
        if (mejor) m.set(b, mejor);
      }
    return m;
  };
  const porBanda = fotosDe(pasada);
  const bandasLuz = luz === "normal" ? TODAS : LUCES[luz].bandas;
  const pasadaA = ab.a !== null ? pasadas[ab.a] : undefined;
  const pasadaB = ab.b !== null ? pasadas[ab.b] : undefined;
  const porA = fotosDe(pasadaA);
  const porB = fotosDe(pasadaB);
  // La resta se ve con A y B elegidas, distintas, y con fotos de esta luz en las dos.
  const restaActiva =
    verResta && !!pasadaA && !!pasadaB && ab.a !== ab.b && bandasLuz.some((b) => porA.has(b)) && bandasLuz.some((b) => porB.has(b));
  const n = (restaActiva ? [...porA.values()][0] : [...porBanda.values()][0])?.meta.n_px ?? 0;
  const hayLuz = restaActiva || bandasLuz.some((b) => porBanda.has(b));
  useEffect(() => {
    if (verResta) setPlay(false);
  }, [verResta]);

  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = lienzo.current;
    if (!c || !n) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = n;
    c.height = n;
    const img = ctx.createImageData(n, n);
    const valor = (grupo: number[], i: number, fotos: Map<number, Frame> = porBanda) => {
      let s = 0;
      let k = 0;
      for (const b of grupo) {
        const fr = fotos.get(b);
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
    if (restaActiva) {
      // A − B con el brillo ya normalizado de cada banda: rojo = más brillante en A, azul = más brillante en B,
      // gris = igual. La escala de color es el percentil 99,5 de |A − B| (como la resta del Explorador).
      const d = new Float32Array(n * n);
      for (let i = 0; i < n * n; i++) d[i] = valor(bandasLuz, i, porA) - valor(bandasLuz, i, porB);
      // Las dos fechas tienen un brillo de fondo algo distinto: se resta la mediana para que el fondo quede gris
      // y solo se coloree lo que cambió de verdad.
      const ord = Float32Array.from(d).sort();
      const mediana = ord[Math.floor(ord.length / 2)] || 0;
      for (let i = 0; i < d.length; i++) d[i] -= mediana;
      const abs = Float32Array.from(d, Math.abs).sort();
      const lim = abs[Math.floor(0.995 * (abs.length - 1))] || 1;
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const o = ((n - 1 - y) * n + x) * 4; // fila 0 = sur
          const t = Math.max(-1, Math.min(1, d[y * n + x] / lim));
          img.data[o] = t > 0 ? 128 + 127 * t : 128 * (1 + t);
          img.data[o + 1] = 128 * (1 - Math.abs(t));
          img.data[o + 2] = t < 0 ? 128 - 127 * t : 128 * (1 - t);
          img.data[o + 3] = 255;
        }
      ctx.putImageData(img, 0, 0);
      return;
    }
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        const o = ((n - 1 - y) * n + x) * 4; // fila 0 = sur
        if (luz === "normal") {
          const v = 255 * valor(TODAS, i);
          img.data[o] = v;
          img.data[o + 1] = v;
          img.data[o + 2] = v;
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
  // ── Reintentar: si falló la consulta de visitas, si fallaron fotos o si la carga lleva demasiado ──
  const cargando = (!grid && mensaje.startsWith("Consultando")) || (prog.total > 0 && prog.hechos < prog.total);
  const [lento, setLento] = useState(false);
  useEffect(() => {
    setLento(false);
    if (!cargando || n) return;
    const id = window.setTimeout(() => setLento(true), 25000);
    return () => window.clearTimeout(id);
  }, [cargando, n, version]);
  const fallaron = prog.errores;
  const motivo = !grid && !cargando ? mensaje : fallaron ? [...errores.current.values()][0] : null;
  const mostrarReintentar = (!cargando && (!grid || !n || fallaron > 0)) || (lento && !n);
  const reintentar = () => {
    setLento(false);
    if (grid && fallaron > 0 && !lento) reintentarFallidas();
    else setIntento((x) => x + 1);
  };
  const escala30 = grid && n ? (30 / grid.pixel_scale_arcsec / n) * 100 : 0;
  // Cada luz: qué se ve mejor en ella (el color de un objeto depende de su temperatura: cuanto más frío, más
  // larga la longitud de onda en que más brilla). Bandas: LUCES arriba.
  const textoLuz: Record<Luz, string> = {
    // Es un promedio por píxel de las 6 bandas, cada una estirada a su propio rango (asinh01): no es la luz sumada.
    normal: tr(
      "normal: el promedio de las 6 bandas (D1–D6, 0,75–5 µm), cada una ajustada a su propio brillo",
      "normal: the average of the 6 bands (D1–D6, 0.75–5 µm), each scaled to its own brightness",
    ),
    cercana: tr(
      "cercana (D1–D2, 0,75–1,6 µm): donde más brillan las estrellas como el Sol; la que más se parece a la que ven tus ojos",
      "near (D1–D2, 0.75–1.6 µm): where Sun-like stars shine brightest; the closest to what your eyes see",
    ),
    media: tr(
      "media (D3–D4, 1,6–3,8 µm): resaltan las estrellas frías y las enanas marrones tibias; cerca de 3 µm absorben los hielos",
      "middle (D3–D4, 1.6–3.8 µm): cool stars and warm brown dwarfs stand out; near 3 µm, ices absorb light",
    ),
    lejana: tr(
      "lejana (D5–D6, 3,8–5 µm): el brillo propio de los objetos fríos, como las enanas marrones más frías",
      "far (D5–D6, 3.8–5 µm): the glow of cold objects themselves, such as the coldest brown dwarfs",
    ),
  };
  const nombreLuz: Record<Luz, string> = {
    normal: tr("Normal (promedio)", "Normal (average)"),
    cercana: tr("Cercana (estrellas)", "Near (stars)"),
    media: tr("Media (estrellas frías)", "Middle (cool stars)"),
    lejana: tr("Lejana (objetos fríos)", "Far (cold objects)"),
  };
  const bandasDeLuz: Record<Luz, string> = { normal: "D1–D6", cercana: "D1–D2", media: "D3–D4", lejana: "D5–D6" };

  return (
    <div className="simple">
      <header className="simple-barra">
        <button className="simple-marca" onClick={() => set({ vista: "landing" })}>
          <img src="/logo-icono.webp" alt="" width={160} height={133} />
          AstroTrack
        </button>
        <form className="simple-busca" onSubmit={buscar} role="search" data-tour="simple-busca">
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
        <nav className="simple-chips" aria-label={tr("Objetos", "Objects")} data-tour="simple-objetos">
          {CAMPOS.map((c) => (
            <button key={c.id} className={campo?.id === c.id ? "activo" : ""} onClick={() => set(posicionActual(c))} title={nombreDe(c, idioma)}>
              {CORTO[c.id] ?? nombreDe(c, idioma)}
            </button>
          ))}
        </nav>
        <div className="simple-derecha">
          <span data-tour="simple-ciencia">
            <InterruptorCiencia activo={false} onCambiar={onCiencia} />
          </span>
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
          {onTutorial && (
            <button className="primario" onClick={onTutorial}>
              {tr("Ver el tutorial de Spherix", "Watch Spherix's tutorial")}
            </button>
          )}
        </div>
      )}

      <div className="simple-cuerpo">
      {/* A la izquierda de la imagen: coordenadas (como en Modo ciencia) y rango de fechas con calendario. */}
      <aside className="simple-lado" aria-label={tr("Dónde y cuándo", "Where and when")} data-tour="simple-lado">
        <h3>{tr("¿Dónde?", "Where?")}</h3>
        <div className="simple-coords">
          <EntradaCoordenadas ra={estado.ra} dec={estado.dec} onIr={set} />
        </div>
        <h3>{tr("¿Cuándo?", "When?")}</h3>
        <label>
          {tr("Desde", "From")}
          <input
            type="date"
            value={desde}
            min={PRIMERA_FECHA}
            max={hasta}
            onChange={(e) => e.target.value && e.target.value <= hasta && setDesde(e.target.value)}
          />
        </label>
        <label>
          {tr("Hasta", "To")}
          <input
            type="date"
            value={hasta}
            min={desde}
            max={hoyIso}
            onChange={(e) => e.target.value && e.target.value >= desde && setHasta(e.target.value)}
          />
        </label>
        <p className="simple-lado-nota">
          {tr("Solo se traen las fotos de ese rango. SPHEREx empezó en 2025 y pasa por cada punto cada ~6 meses.", "Only photos in that range are loaded. SPHEREx started in 2025 and passes over each spot every ~6 months.")}
        </p>
        {(desde !== PRIMERA_FECHA || hasta !== hoyIso) && (
          <button
            onClick={() => {
              setDesde(PRIMERA_FECHA);
              setHasta(hoyIso);
            }}
          >
            ↺ {tr("Todas las fechas", "All dates")}
          </button>
        )}
      </aside>

      <main className="simple-centro">
        {aviso && (
          <div className="simple-aviso" role="status">
            <span>
              {textoAviso} {pasadas.length > 1 && <b>{tr("Tócalo.", "Tap it.")}</b>}
            </span>
            <button onClick={cerrarAviso}>{tr("Entendido", "Got it")}</button>
          </div>
        )}
        <div className="simple-imagen" data-tour="simple-imagen">
          {n > 0 && <canvas ref={lienzo} aria-label={tr("Foto de SPHEREx", "SPHEREx photo")} />}
          {n > 0 && !hayLuz && <p className="simple-mensaje">{tr("No hay fotos con esta luz en esta fecha.", "No photos in this light on this date.")}</p>}
          {!n && (
            <div className="simple-mensaje">
              <p>
                {cargando
                  ? `${tr("Cargando fotos de SPHEREx…", "Loading SPHEREx photos…")}${prog.total > 0 ? ` ${prog.hechos}/${prog.total}` : ""}`
                  : tr("No se pudieron cargar las fotos.", "The photos could not be loaded.")}
              </p>
              {lento && cargando && <p className="simple-motivo">{tr("Está tardando más de lo normal (IRSA puede estar lento).", "It is taking longer than usual (IRSA may be slow).")}</p>}
              {motivo && !cargando && <p className="simple-motivo">{enIdioma(motivo, idioma)}</p>}
              {mostrarReintentar && (
                <button className="simple-reintentar" onClick={reintentar} disabled={reintentando}>
                  {reintentando ? tr("Reintentando…", "Retrying…") : tr("Reintentar", "Retry")}
                </button>
              )}
            </div>
          )}
          {n > 0 && fallaron > 0 && !cargando && (
            <button className="simple-reintentar simple-reintentar-chico" onClick={reintentar} disabled={reintentando} title={motivo ? enIdioma(motivo, idioma) : undefined}>
              {reintentando
                ? tr("Reintentando…", "Retrying…")
                : tr(`${fallaron} foto(s) fallaron · Reintentar`, `${fallaron} photo(s) failed · Retry`)}
            </button>
          )}
          {n > 0 && (
            <button className="simple-marca-objeto" onClick={tocar} aria-label={tr("Siguiente foto", "Next photo")}>
              <span className="smo-aro" />
              <span className="smo-nombre">{campo ? nombreDe(campo, idioma) : tr("Tu punto", "Your spot")}</span>
            </button>
          )}
          {pasada && n > 0 && (
            <span className="simple-fecha">
              {restaActiva && pasadaA && pasadaB
                ? `A ${rotuloPasada(pasadaA, idioma === "en" ? "en" : "es")} − B ${rotuloPasada(pasadaB, idioma === "en" ? "en" : "es")}`
                : rotuloPasada(pasada, idioma === "en" ? "en" : "es")}
            </span>
          )}
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
          <div className="simple-fechas" role="group" aria-label={tr("Fechas", "Dates")} data-tour="simple-fechas">
            <button
              className="simple-play"
              onClick={() => {
                setVerResta(false); // reproducir vuelve a las fotos
                setPlay((v) => !v);
              }}
              aria-pressed={play}
              disabled={pasadas.length < 2}
              title={tr("Pausa o sigue cuando quieras (también con la barra espaciadora; ← → pasan de fecha)", "Pause or continue whenever you want (also with the space bar; ← → step through dates)")}
            >
              {play ? `❚❚ ${tr("Pausa", "Pause")}` : `▶ ${tr("Reproducir", "Play")}`}
            </button>
            {pasadas.map((p, i) => (
              <button
                key={p.desde}
                className={i === iPasada && !restaActiva ? "activo" : ""}
                onClick={() => {
                  setPlay(false);
                  setVerResta(false);
                  setPasadaSel(i);
                }}
              >
                {rotuloPasada(p, idioma === "en" ? "en" : "es")}
                {ab.a === i && <sup className="simple-ab-letra"> A</sup>}
                {ab.b === i && <sup className="simple-ab-letra"> B</sup>}
              </button>
            ))}
          </div>
        )}
        {/* Compara dos fechas: la que se ve pasa a ser A o B; con las dos, «Ver A − B» muestra la resta. */}
        {pasadas.length > 1 && (
          <div className="simple-ab" role="group" aria-label={tr("Compara dos fechas", "Compare two dates")} data-tour="simple-ab">
            <span className="simple-ab-titulo">{tr("Compara dos fechas:", "Compare two dates:")}</span>
            {(["a", "b"] as const).map((k) => {
              const p = k === "a" ? pasadaA : pasadaB;
              return (
                <button
                  key={k}
                  onClick={() => {
                    setPlay(false);
                    setAb((x) => ({ ...x, [k]: iPasada }));
                  }}
                  title={tr(`Usa la fecha que estás viendo como ${k.toUpperCase()}`, `Use the date you are looking at as ${k.toUpperCase()}`)}
                >
                  <b>{k.toUpperCase()}</b>: {p ? rotuloPasada(p, idioma === "en" ? "en" : "es") : tr("esta fecha", "this date")}
                </button>
              );
            })}
            <button
              className="simple-ab-ver"
              aria-pressed={restaActiva}
              disabled={ab.a === null || ab.b === null || ab.a === ab.b}
              onClick={() => setVerResta((v) => !v)}
              title={ab.a !== null && ab.a === ab.b ? tr("A y B son la misma fecha: elige otra", "A and B are the same date: pick another") : undefined}
            >
              {restaActiva ? tr("Ver la foto", "Show the photo") : tr("Ver A − B", "Show A − B")}
            </button>
            {(ab.a !== null || ab.b !== null) && (
              <button
                onClick={() => {
                  setAb({ a: null, b: null });
                  setVerResta(false);
                }}
              >
                {tr("Borrar", "Clear")}
              </button>
            )}
            {restaActiva && (
              <p className="simple-ab-leyenda">
                {tr(
                  "Rojo: brillo que está en A y no en B · Azul: en B y no en A · Gris: no cambió. Una pareja roja y azul es algo que se movió.",
                  "Red: brightness in A but not in B · Blue: in B but not in A · Gray: no change. A red and blue pair is something that moved.",
                )}
              </p>
            )}
            {verResta && !restaActiva && ab.a !== ab.b && (
              <p className="simple-ab-leyenda">{tr("No hay fotos con esta luz en A o en B.", "No photos in this light for A or B.")}</p>
            )}
          </div>
        )}
      </main>
      </div>

      <footer className="simple-luz" data-tour="simple-luz">
        <div className="simple-luz-botones" role="radiogroup" aria-label={tr("Luz", "Light")}>
          {(["normal", "cercana", "media", "lejana"] as Luz[]).map((l) => (
            <div key={l} className={`luz-celda${luz === l ? " activa" : ""}`}>
              <button role="radio" aria-checked={luz === l} aria-describedby={`luz-texto-${l}`} className={`luz-${l}${luz === l ? " activo" : ""}`} onClick={() => setLuz(l)}>
                {nombreLuz[l]}
                {/* Nota al pie: las bandas de SPHEREx que usa esta luz. */}
                <small className="luz-bandas">{bandasDeLuz[l]}</small>
              </button>
              {/* Debajo de cada botón, qué muestra esa luz (todas a la vista, no solo la elegida). */}
              <p id={`luz-texto-${l}`} className="luz-texto">
                <b>{tr("Luz:", "Light:")}</b> {textoLuz[l]}
              </p>
            </div>
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
