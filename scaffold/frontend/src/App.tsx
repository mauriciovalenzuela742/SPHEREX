/** AstroTrack: portada, visor, Modo Misión y tutorial guiado por Spherix. */
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Visor from "./pages/Visor";
import Tutorial from "./tutorial/Tutorial";
import Simple from "./simple/Simple";
import InterruptorCiencia from "./simple/InterruptorCiencia";
import { useEstadoUrl, type Estado } from "./state/url";
import { useIdioma } from "./state/idioma";
import { CAMPOS, posicionActual } from "./content/campos";
import "./styles.css";

/**
 * Los dos tutoriales empiezan y terminan («Probar con…») en Epsilon Indi B (pedido de V1): es el objeto por defecto del visor y tiene fotos
 * precalculadas (explorador/presets.ts: banda 5, mediana de 10), así que el Explorador y la vista simple cargan
 * al instante. Banda 5 para el mapa, la misma del preset.
 */
const EPS_IND_B: Partial<Estado> = {
  ...posicionActual(CAMPOS.find((c) => c.id === "eps_ind_b")!),
  band: "5",
  size: 0.1,
};

/** Marca que el tutorial ya se vio (solo una comodidad: si el navegador no deja guardar, no pasa nada). */
function marcarVisto() {
  try {
    localStorage.setItem("astrotrack.tutorial.visto", "1");
  } catch {
    /* modo privado o almacenamiento bloqueado */
  }
}

export default function App() {
  const { estado, set } = useEstadoUrl();
  const { t, idioma, cambiar } = useIdioma();
  const [asistido] = useState(false);
  const [menu, setMenu] = useState(false);

  // Dos recorridos: el del Modo ciencia (menú ☰) y el de la vista simple (botón «?» de esa vista y la portada,
  // que abre la vista simple). Los dos empiezan en Epsilon Indi B.
  const abrirTutorial = (tipo: "ciencia" | "simple" = "ciencia") =>
    set({ ...EPS_IND_B, vista: "visor", mision: undefined, tutorial: tipo, ciencia: tipo === "ciencia" ? true : undefined });
  const cerrarTutorial = (siguiente: Partial<Estado> = {}) => {
    marcarVisto();
    set({ tutorial: undefined, ...siguiente });
  };

  // Modo ciencia = el Visor completo; sin él, la vista simple. El tutorial y el Modo Misión viven en el Visor.
  const enVisor = estado.vista === "visor";
  const ciencia = Boolean(estado.ciencia || estado.tutorial === "ciencia" || estado.mision);
  const conInterruptor = enVisor && !estado.tutorial && !estado.mision;
  // Transición: la vista actual se nubla («sale»), se cambia y la nueva se aclara («entra»).
  const [mostrada, setMostrada] = useState(ciencia);
  const [fase, setFase] = useState<"quieto" | "sale" | "entra">("quieto");
  useEffect(() => {
    if (ciencia === mostrada) return;
    if (!enVisor) {
      setMostrada(ciencia);
      return;
    }
    setFase("sale");
    const t1 = window.setTimeout(() => {
      setMostrada(ciencia);
      setFase("entra");
      window.scrollTo({ top: 0 });
    }, 350);
    const t2 = window.setTimeout(() => setFase("quieto"), 850);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ciencia]);
  const simple = enVisor && !mostrada;

  return (
    <div className="app">
      <div className={`vista-modo ${fase}`}>
      {simple ? (
        <Simple estado={estado} set={set} onCiencia={() => set({ ciencia: true })} onTutorial={() => abrirTutorial("simple")} />
      ) : (
      <>
      <header>
        <button className="marca" onClick={() => set({ vista: "landing", mision: undefined, tutorial: undefined })}>
          <img src="/logo-icono.webp" alt="" width={160} height={133} />
          {t.titulo}
        </button>
        <span className="etiqueta">NASA Space Apps 2026</span>

        {conInterruptor && <InterruptorCiencia activo onCambiar={(v) => set({ ciencia: v || undefined })} />}

        {/* Selector de idioma */}
        <div className="selector-idioma">
          <button
            onClick={() => cambiar("es")}
            className={idioma === "es" ? "activo" : ""}
            title="Español"
          >
            ES
          </button>
          <span>|</span>
          <button
            onClick={() => cambiar("en")}
            className={idioma === "en" ? "activo" : ""}
            title="English"
          >
            EN
          </button>
        </div>

        <button className="hamburguesa" data-tour="menu" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          ☰
        </button>
        {menu && (
          <nav className="menu" onClick={() => setMenu(false)}>
            <button onClick={() => set({ vista: "landing", mision: undefined, tutorial: undefined })}>{t.inicio}</button>
            <button onClick={() => set({ vista: "visor", mision: undefined, tutorial: undefined })}>{t.visor}</button>
            <button onClick={() => set({ vista: "visor", mision: "intro", tutorial: undefined })}>{t.modoMision}</button>
            <button onClick={() => abrirTutorial("ciencia")}>{t.verTutorial}</button>
            <a href="https://github.com/mauriciovalenzuela742/SPHEREX">{t.repositorio}</a>
          </nav>
        )}
      </header>
      <main>
        {estado.vista === "landing" ? (
          <Landing
            onEmpezar={() => set({ vista: "visor", mision: undefined, ciencia: undefined })}
            onMision={() => set({ vista: "visor", mision: "intro" })}
            onTutorial={() => abrirTutorial("simple")}
          />
        ) : (
          <Visor estado={estado} set={set} asistido={asistido} />
        )}
      </main>
      </>
      )}
      </div>
      <footer>{t.atribucion}</footer>

      {estado.vista === "visor" && estado.tutorial && !estado.mision && (
        <Tutorial
          key={estado.tutorial}
          variante={estado.tutorial}
          onCerrar={() => cerrarTutorial()}
          onProbar={() => cerrarTutorial(EPS_IND_B)}
          onMision={() => cerrarTutorial(estado.tutorial === "simple" ? { ciencia: true } : { mision: "intro" })}
        />
      )}
    </div>
  );
}
