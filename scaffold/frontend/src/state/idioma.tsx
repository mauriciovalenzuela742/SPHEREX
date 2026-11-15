/**
 * Contexto global de idioma (ES/EN).
 * Uso: envuelve la app con <IdiomaProvider>, luego usa useIdioma() en cualquier componente.
 */
import { createContext, useContext, useState, type ReactNode } from "react";
import { getTraducciones, type Idioma } from "../content/textos";

type IdiomaCtx = {
  idioma: Idioma;
  t: ReturnType<typeof getTraducciones>;
  cambiar: (i: Idioma) => void;
  /** Traducción en línea: tr("Hola", "Hello"). */
  tr: (es: string, en: string) => string;
};

const Ctx = createContext<IdiomaCtx | null>(null);

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(() => {
    try {
      const guardado = localStorage.getItem("astrotrack.idioma");
      if (guardado === "en" || guardado === "es") return guardado;
    } catch { /* modo privado */ }
    return navigator.language.startsWith("es") ? "es" : "en";
  });

  const cambiar = (i: Idioma) => {
    setIdioma(i);
    try { localStorage.setItem("astrotrack.idioma", i); } catch { /* ok */ }
  };

  return (
    <Ctx.Provider value={{ idioma, t: getTraducciones(idioma), cambiar, tr: (es: string, en: string) => (idioma === "en" ? en : es) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useIdioma() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdioma debe usarse dentro de IdiomaProvider");
  return ctx;
}
