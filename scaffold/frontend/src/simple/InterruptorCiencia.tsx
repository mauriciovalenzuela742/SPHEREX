/** Interruptor «Modo ciencia»: deslizarlo pasa de la vista simple al Visor completo (y al revés). */
import { useIdioma } from "../state/idioma";
import "./simple.css";

export default function InterruptorCiencia({ activo, onCambiar }: { activo: boolean; onCambiar: (v: boolean) => void }) {
  const { tr } = useIdioma();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      className={`interruptor-ciencia${activo ? " activo" : ""}`}
      onClick={() => onCambiar(!activo)}
      title={activo ? tr("Volver a la vista simple", "Back to the simple view") : tr("Ver todas las herramientas científicas", "Show all the science tools")}
    >
      <span className="ic-riel" aria-hidden="true"><span className="ic-perilla" /></span>
      {tr("Modo ciencia", "Science mode")}
    </button>
  );
}
