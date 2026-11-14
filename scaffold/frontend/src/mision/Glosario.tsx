/**
 * Glosario del Modo Misión: convierte [[id]] o [[id|texto]] en un término con su explicación.
 * La explicación aparece al pasar el mouse y también al llegar con el teclado (Tab), para lectores de pantalla.
 */
import { glosario } from "../content/mision";

function Termino({ id, texto }: { id: string; texto?: string }) {
  const g = glosario[id];
  if (!g) return <>{texto ?? id}</>;
  const tipId = `glosario-${id}`;
  return (
    <span className="termino" tabIndex={0} aria-describedby={tipId}>
      {texto ?? g.termino.toLowerCase()}
      <span role="tooltip" id={tipId} className="termino-tip">
        <strong>{g.termino}:</strong> {g.definicion}
      </span>
    </span>
  );
}

/** Texto con marcas [[id]] / [[id|texto visible]] del glosario. */
export function ConGlosario({ texto }: { texto: string }) {
  const partes = texto.split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {partes.map((p, i) => {
        const m = p.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
        return m ? <Termino key={i} id={m[1]} texto={m[2]} /> : <span key={i}>{p}</span>;
      })}
    </>
  );
}
