/** Portada de AstroTRACK. Dueña del layout: Antonia (V1); textos: Javiera (N). */
import { useIdioma } from "../state/idioma";
import { mision } from "../content/mision";

type Props = { onEmpezar: () => void; onMision: () => void; onTutorial: () => void };

export default function Landing({ onEmpezar, onMision, onTutorial }: Props) {
  const { t, idioma } = useIdioma();
  return (
    <section className="landing">
      <h1>{t.bienvenida}</h1>
      <h2>{idioma === "es" ? "¿Qué somos?" : "What are we?"}</h2>
      <p className="lead">{t.queSomos}</p>

      <div className="acciones">
        <button className="primario" onClick={onTutorial}>
          {t.empecemosTutorial}
        </button>
        <button onClick={onEmpezar}>{t.empecemos}</button>
      </div>
      <p className="nota">{t.tutorialAyuda}</p>

      <div className="mision-invitacion">
        <p className="mision-etiqueta">{mision.nombre}</p>
        <p>{mision.subtitulo}</p>
        <button onClick={onMision}>{mision.botonLanding}</button>
      </div>
    </section>
  );
}
