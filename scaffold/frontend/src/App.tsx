/** Esqueleto móvil primero. Comprueba que el frontend habla con el backend y ofrece instalar la app. */
import { useEffect, useState } from "react";

type Salud = { ok: boolean; version: string };
type EventoInstalar = Event & { prompt: () => Promise<void> };

export default function App() {
  const [salud, setSalud] = useState<Salud | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);

  useEffect(() => {
    fetch("/health")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setSalud)
      .catch((e) => setError(String(e)));
  }, []);

  // Chrome/Edge/Android ofrecen instalar con este evento. Safari (iPhone) no: allí es Compartir → Añadir a inicio.
  useEffect(() => {
    const alvolver = (e: Event) => {
      e.preventDefault();
      setInstalar(e as EventoInstalar);
    };
    window.addEventListener("beforeinstallprompt", alvolver);
    return () => window.removeEventListener("beforeinstallprompt", alvolver);
  }, []);

  const esIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const yaInstalada = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div className="app">
      <header className="cabecera">
        <h1>SPHEREX</h1>
        <p>Visor de datos SPHEREx</p>
      </header>

      <main className="contenido">
        <section className="tarjeta" aria-live="polite">
          <h2>Servidor</h2>
          {error ? (
            <p className="estado mal">No responde ({error})</p>
          ) : salud ? (
            <p className="estado ok">Listo, versión {salud.version}</p>
          ) : (
            <p>Comprobando…</p>
          )}
        </section>

        {!yaInstalada && (
          <section className="tarjeta">
            <h2>Instalar en el teléfono</h2>
            {instalar ? (
              <button
                className="boton"
                onClick={() => {
                  void instalar.prompt();
                  setInstalar(null);
                }}
              >
                Instalar app
              </button>
            ) : esIphone ? (
              <p>En Safari: toca Compartir y luego «Añadir a pantalla de inicio».</p>
            ) : (
              <p>Desde el menú del navegador elige «Instalar app» o «Añadir a pantalla de inicio».</p>
            )}
          </section>
        )}
      </main>

      <footer className="pie">Datos: NASA/IPAC IRSA</footer>
    </div>
  );
}
