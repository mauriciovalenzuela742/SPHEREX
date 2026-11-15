/**
 * Portada de AstroTrack. Dueña del layout: Antonia (V1); textos: Javiera (N), en content/textos.ts.
 *
 * Cielo animado de fondo, la Tierra (foto real, Apolo 17) cortada abajo a la izquierda, SPHEREx flotando en su
 * órbita y Spherix preguntando «¿Qué investigaremos hoy?». Los tres caminos son respuestas a esa pregunta.
 * Las imágenes son decorativas (alt="" y aria-hidden); los créditos van abajo. Estilos: landing/landing.css.
 */
import { useIdioma } from "../state/idioma";
import { Cara } from "../spherix/Spherix";
import CieloAnimado from "./landing/CieloAnimado";
import "./landing/landing.css";

type Props = { onEmpezar: () => void; onMision: () => void; onTutorial: () => void; onDescargas: () => void };

export default function Landing({ onEmpezar, onMision, onTutorial, onDescargas }: Props) {
  const { t } = useIdioma();
  return (
    <section className="portada">
      <CieloAnimado />

      <div className="portada-escena" aria-hidden="true">
        <div className="portada-orbita" />
        <img className="portada-tierra" src="/img/tierra.webp" alt="" width={900} height={900} />
        <img className="portada-spherex" src="/img/spherex.webp" alt="" width={900} height={749} />
      </div>

      <div className="portada-contenido">
        <h1 className="portada-titulo">
          <img src="/logo.webp" alt={t.titulo} width={602} height={640} />
        </h1>
        <p className="portada-linea">{t.lineaPortada}</p>

        <div className="portada-spherix">
          <Cara className="portada-cara" />
          <p className="portada-burbuja">{t.queInvestigamos}</p>
        </div>

        <div className="portada-respuestas">
          <button className="primario" onClick={onTutorial}>{t.respuestaTutorial}</button>
          <button onClick={onEmpezar}>{t.respuestaExplorar}</button>
          <button onClick={onMision}>{t.respuestaMision}</button>
        </div>
        {/* Descargas (PR #84): un enlace discreto bajo las respuestas, para no competir con ellas. */}
        <button className="portada-descargas" onClick={onDescargas}>↓ {t.descargarApp}</button>
      </div>

      <p className="portada-creditos">{t.creditosPortada}</p>
    </section>
  );
}
