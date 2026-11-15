/** AstroTRACK: portada, visor, Modo Misión y tutorial guiado por Spherix. */
import { useState } from "react";
import Landing from "./pages/Landing";
import Visor from "./pages/Visor";
import Tutorial from "./tutorial/Tutorial";
import { useEstadoUrl, type Estado } from "./state/url";
import { useIdioma } from "./state/idioma";
import { CAMPOS, posicionActual } from "./content/campos";
import "./styles.css";

/** El tutorial y el «probar» del final usan la Estrella de Barnard: tiene datos en todas las secciones. */
const BARNARD: Partial<Estado> = {
  ...posicionActual(CAMPOS.find((c) => c.id === "barnard")!),
  band: "2",
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

  const abrirTutorial = () => set({ ...BARNARD, vista: "visor", mision: undefined, tutorial: true });
  const cerrarTutorial = (siguiente: Partial<Estado> = {}) => {
    marcarVisto();
    set({ tutorial: undefined, ...siguiente });
  };

  return (
    <div className="app">
      <header>
        <button className="marca" onClick={() => set({ vista: "landing", mision: undefined, tutorial: undefined })}>
          {t.titulo}
        </button>
        <span className="etiqueta">NASA Space Apps 2026</span>

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
            <button onClick={abrirTutorial}>{t.verTutorial}</button>
            <a href="https://github.com/mauriciovalenzuela742/SPHEREX">{t.repositorio}</a>
          </nav>
        )}
      </header>
      <main>
        {estado.vista === "landing" ? (
          <Landing
            onEmpezar={() => set({ vista: "visor", mision: undefined })}
            onMision={() => set({ vista: "visor", mision: "intro" })}
            onTutorial={abrirTutorial}
          />
        ) : (
          <Visor estado={estado} set={set} asistido={asistido} />
        )}
      </main>
      <footer>{t.atribucion}</footer>

      {estado.vista === "visor" && estado.tutorial && !estado.mision && (
        <Tutorial
          onCerrar={() => cerrarTutorial()}
          onBarnard={() => cerrarTutorial(BARNARD)}
          onMision={() => cerrarTutorial({ mision: "intro" })}
        />
      )}
    </div>
  );
}
