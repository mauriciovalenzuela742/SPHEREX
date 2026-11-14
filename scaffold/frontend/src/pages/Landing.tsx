/** Pantalla 1 de la pizarra. Dueña del layout: Antonia (V1); textos: Javiera (N). */
import { textos } from "../content/textos";

type Props = { onEmpezar: (asistido: boolean) => void };

export default function Landing({ onEmpezar }: Props) {
  return (
    <section className="landing">
      <h1>{textos.bienvenida}</h1>
      <h2>¿Qué somos?</h2>
      <p className="lead">{textos.queSomos}</p>
      <h3>ODS</h3>
      <ul className="ods">
        {textos.ods.map((o) => (
          <li key={o.id}>
            <span className="ods-num">{o.id}</span>
            {o.nombre}
          </li>
        ))}
      </ul>
      <div className="acciones">
        <button className="primario" onClick={() => onEmpezar(false)}>
          {textos.empecemos}
        </button>
        <button onClick={() => onEmpezar(true)}>{textos.empecemosAsistido}</button>
      </div>
      <p className="nota">
        <a href="#conceptos">{textos.conceptosBasicos}</a> · pendiente (Javiera)
      </p>
    </section>
  );
}
