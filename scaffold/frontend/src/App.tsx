/** Esqueleto visual según la pizarra del 14-nov (docs/diseno/). Integración: cada uno reemplaza su hueco. */
import { useState } from "react";
import Landing from "./pages/Landing";
import Visor from "./pages/Visor";
import { useEstadoUrl } from "./state/url";
import { textos } from "./content/textos";
import "./styles.css";

export default function App() {
  const { estado, set } = useEstadoUrl();
  const [asistido, setAsistido] = useState(false);
  const [menu, setMenu] = useState(false);

  return (
    <div className="app">
      <header>
        <button className="marca" onClick={() => set({ vista: "landing" })}>
          {textos.titulo}
        </button>
        <span className="etiqueta">en construcción · NASA Space Apps 2026</span>
        <button className="hamburguesa" aria-label="Menú" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          ☰
        </button>
        {menu && (
          <nav className="menu" onClick={() => setMenu(false)}>
            <button onClick={() => set({ vista: "landing" })}>Inicio</button>
            <button onClick={() => set({ vista: "visor" })}>Visor</button>
            <a href="https://github.com/mauriciovalenzuela742/SPHEREX">Repositorio</a>
          </nav>
        )}
      </header>
      <main>
        {estado.vista === "landing" ? (
          <Landing
            onEmpezar={(a) => {
              setAsistido(a);
              set({ vista: "visor" });
            }}
          />
        ) : (
          <Visor estado={estado} set={set} asistido={asistido} />
        )}
      </main>
      <footer>{textos.atribucion}</footer>
    </div>
  );
}
