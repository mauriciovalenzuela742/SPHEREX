/** AstroTRACK: portada, visor, Modo Misión y tutorial guiado por Spherix. */
import { useState } from "react";
import Landing from "./pages/Landing";
import Visor from "./pages/Visor";
import Tutorial from "./tutorial/Tutorial";
import { useEstadoUrl, type Estado } from "./state/url";
import { textos } from "./content/textos";
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
          {textos.titulo}
        </button>
        <span className="etiqueta">NASA Space Apps 2026</span>
        <button className="hamburguesa" data-tour="menu" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          ☰
        </button>
        {menu && (
          <nav className="menu" onClick={() => setMenu(false)}>
            <button onClick={() => set({ vista: "landing", mision: undefined, tutorial: undefined })}>Inicio</button>
            <button onClick={() => set({ vista: "visor", mision: undefined, tutorial: undefined })}>Visor</button>
            <button onClick={() => set({ vista: "visor", mision: "intro", tutorial: undefined })}>Modo Misión</button>
            <button onClick={abrirTutorial}>Ver tutorial</button>
            <a href="https://github.com/mauriciovalenzuela742/SPHEREX">Repositorio</a>
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
      <footer>{textos.atribucion}</footer>

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
