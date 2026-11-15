/**
 * Comentarios al final del Visor: formulario para que cualquiera comente y lista de lo comentado.
 * Envío y lectura: backend `GET/POST /api/comments` (scaffold/backend/app/comentarios.py), que guarda en
 * `scaffold/frontend/public/comentarios.json` del repo (en producción con un commit por la API de GitHub; en
 * desarrollo, en el archivo local). Si la API no responde, se muestra el `comentarios.json` publicado.
 * Límites (los mismos que valida el backend): nombre ≤ 60 y texto ≤ 600 caracteres, sin enlaces, solo texto plano.
 */
import { useEffect, useState, type FormEvent } from "react";
import { useIdioma } from "../state/idioma";
import "./comentarios.css";

export type Comentario = { id?: string; nombre: string; fecha: string | null; texto: string };

const MAX_NOMBRE = 60;
const MAX_TEXTO = 600;
const MAX_MOSTRADOS = 100;
const ENLACE = /(https?:\/\/|www\.)/i;

/** Valida una entrada; devuelve null si no sirve. Exportada para probarla. */
export function validar(x: unknown): Comentario | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const nombre = typeof o.nombre === "string" ? o.nombre.trim() : "";
  const texto = typeof o.texto === "string" ? o.texto.trim() : "";
  if (!nombre || !texto || nombre.length > MAX_NOMBRE || texto.length > MAX_TEXTO) return null;
  const fecha = typeof o.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.fecha) ? o.fecha : null;
  const id = typeof o.id === "string" ? o.id : undefined;
  return { id, nombre, fecha, texto };
}

function listaDe(d: unknown): unknown[] | null {
  return d && typeof d === "object" && Array.isArray((d as { comentarios?: unknown }).comentarios)
    ? (d as { comentarios: unknown[] }).comentarios
    : null;
}

/** Lee un JSON con tiempo máximo: si el Explorador tiene ocupadas las conexiones o el backend no responde,
 *  no se queda «Cargando» para siempre. */
async function leerJson(url: string, ms = 8000): Promise<unknown> {
  const r = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  // Sin archivo o sin backend, el servidor de desarrollo puede responder index.html con 200: JSON.parse falla.
  return JSON.parse(await r.text());
}

type Lista = { fase: "cargando" } | { fase: "listo"; lista: Comentario[] } | { fase: "error" };
type Envio = { fase: "nada" } | { fase: "enviando" } | { fase: "ok" } | { fase: "error"; motivo: string };

export default function Comentarios() {
  const { tr, idioma } = useIdioma();
  const [lista, setLista] = useState<Lista>({ fase: "cargando" });
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [sitio, setSitio] = useState(""); // campo trampa para bots (invisible)
  const [envio, setEnvio] = useState<Envio>({ fase: "nada" });

  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setLista({ fase: "cargando" });
    (async () => {
      let crudos: unknown[] | null = null;
      let desdeApi = false;
      try {
        crudos = listaDe(await leerJson("/api/comments"));
        desdeApi = crudos !== null;
      } catch {
        /* sin backend: se usa el archivo publicado */
      }
      if (!crudos) {
        try {
          crudos = listaDe(await leerJson("/comentarios.json"));
        } catch (e) {
          console.error("[comentarios] no se pudieron leer:", e);
        }
      }
      if (!vivo) return;
      if (!crudos) return setLista({ fase: "error" });
      const l = crudos.map(validar).filter((c): c is Comentario => c !== null);
      // La API ya los entrega del más reciente al más antiguo; el archivo va en orden de llegada.
      if (!desdeApi) l.reverse();
      setLista({ fase: "listo", lista: l.slice(0, MAX_MOSTRADOS) });
    })();
    return () => {
      vivo = false;
    };
  }, [intento]);

  const nombreLimpio = nombre.trim();
  const textoLimpio = texto.trim();
  const conEnlace = ENLACE.test(nombre) || ENLACE.test(texto);
  const puedeEnviar = nombreLimpio.length > 0 && textoLimpio.length > 0 && !conEnlace && envio.fase !== "enviando";

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    setEnvio({ fase: "enviando" });
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreLimpio, texto: textoLimpio, sitio }),
        // En producción el commit a GitHub tarda unos segundos; más de 20 s es que el backend no responde.
        signal: AbortSignal.timeout(20000),
      });
      const j: unknown = await r.json().catch(() => null);
      if (r.status === 429)
        return setEnvio({ fase: "error", motivo: tr("Demasiados comentarios seguidos: espera un minuto.", "Too many comments in a row: wait a minute.") });
      if (r.status === 503 || r.status >= 500)
        return setEnvio({ fase: "error", motivo: tr("No se pudo guardar el comentario ahora. Inténtalo más tarde.", "The comment could not be saved right now. Try again later.") });
      if (!r.ok) {
        const detalle = j && typeof j === "object" && typeof (j as { detail?: unknown }).detail === "string"
          ? (j as { detail: string }).detail
          : tr(`El servidor respondió ${r.status}.`, `The server answered ${r.status}.`);
        return setEnvio({ fase: "error", motivo: detalle });
      }
      const nuevo = validar(j);
      if (nuevo) setLista((l) => ({ fase: "listo", lista: [nuevo, ...(l.fase === "listo" ? l.lista : [])] }));
      setTexto("");
      setEnvio({ fase: "ok" });
    } catch (err) {
      const tiempo = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
      setEnvio({
        fase: "error",
        motivo: tiempo
          ? tr("El servidor de comentarios no respondió (más de 20 s). Inténtalo de nuevo.", "The comments server did not answer (over 20 s). Try again.")
          : tr("No hay conexión con el servidor de comentarios.", "Could not reach the comments server."),
      });
    }
  };

  const fechaLegible = (f: string) =>
    new Date(`${f}T12:00:00Z`).toLocaleDateString(idioma === "en" ? "en-US" : "es-CL", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="comentarios" aria-labelledby="comentarios-titulo">
      <h2 id="comentarios-titulo">{tr("Comentarios", "Comments")}</h2>

      <form className="com-form" onSubmit={enviar}>
        <label>
          {tr("Tu nombre", "Your name")}
          <input value={nombre} maxLength={MAX_NOMBRE} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required />
        </label>
        <label>
          {tr("Comentario", "Comment")}
          <textarea value={texto} maxLength={MAX_TEXTO} rows={3} onChange={(e) => setTexto(e.target.value)} required />
          <span className="com-contador">{texto.length}/{MAX_TEXTO}</span>
        </label>
        {/* Trampa para bots: fuera de la vista y del tabulador; una persona nunca la llena. */}
        <label className="com-trampa" aria-hidden="true">
          Sitio web
          <input tabIndex={-1} autoComplete="off" value={sitio} onChange={(e) => setSitio(e.target.value)} />
        </label>
        <div className="com-enviar">
          <button type="submit" disabled={!puedeEnviar}>
            {envio.fase === "enviando" ? tr("Enviando…", "Sending…") : tr("Publicar comentario", "Post comment")}
          </button>
          <span className="com-nota" aria-live="polite">
            {conEnlace
              ? tr("Los comentarios no pueden llevar enlaces.", "Comments cannot contain links.")
              : envio.fase === "ok"
                ? tr("¡Gracias! Tu comentario quedó publicado.", "Thanks! Your comment is posted.")
                : envio.fase === "error"
                  ? envio.motivo
                  : tr("Es público y queda guardado en el repositorio del proyecto. Sin enlaces.", "It is public and saved in the project repository. No links.")}
          </span>
        </div>
      </form>

      {lista.fase === "cargando" && <p className="com-vacio">{tr("Cargando comentarios…", "Loading comments…")}</p>}
      {lista.fase === "error" && (
        <p className="com-vacio">
          {tr("No se pudieron cargar los comentarios.", "Could not load the comments.")}{" "}
          <button type="button" onClick={() => setIntento((n) => n + 1)}>{tr("Reintentar", "Retry")}</button>
        </p>
      )}
      {lista.fase === "listo" && lista.lista.length === 0 && (
        <p className="com-vacio">{tr("Todavía no hay comentarios: ¡sé el primero!", "No comments yet: be the first!")}</p>
      )}
      {lista.fase === "listo" && lista.lista.length > 0 && (
        <ul className="com-lista">
          {lista.lista.map((c, i) => (
            <li key={c.id ?? `${c.nombre}-${c.fecha}-${i}`} className="com-item">
              <div className="com-cabecera">
                <strong>{c.nombre}</strong>
                {c.fecha && <time dateTime={c.fecha}>{fechaLegible(c.fecha)}</time>}
              </div>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
