/** Portada de AstroTRACK. Dueña del layout: Antonia (V1); textos: Javiera (N). */
import { textos } from "../content/textos";
import { mision } from "../content/mision";

type Props = { onEmpezar: () => void; onMision: () => void; onTutorial: () => void };

export default function Landing({ onEmpezar, onMision, onTutorial }: Props) {
  return (
    <section className="landing">
      <h1>{textos.bienvenida}</h1>
      <h2>¿Qué somos?</h2>
      <p className="lead">{textos.queSomos}</p>

      <div className="acciones">
        <button className="primario" onClick={onTutorial}>
          {textos.empecemosTutorial}
        </button>
        <button onClick={onEmpezar}>{textos.empecemos}</button>
      </div>
      <p className="nota">{textos.tutorialAyuda}</p>

      <div className="mision-invitacion">
        <p className="mision-etiqueta">{mision.nombre}</p>
        <p>{mision.subtitulo}</p>
        <button onClick={onMision}>{mision.botonLanding}</button>
      </div>
    </section>
  );
}
