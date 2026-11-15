/**
 * Comentarios al final del Visor. Se leen de `public/comentarios.json` (en el repo): para agregar uno, se edita
 * ese archivo y se hace commit; no hay formulario ni backend (en Vercel el disco del backend es temporal).
 * Límites al mostrar: nombre ≤ 60 y texto ≤ 600 caracteres, solo texto plano (React escapa todo; los enlaces no se
 * vuelven clicables) y se descartan las entradas mal formadas.
 */
import { useEffect, useState } from "react";
import { useIdioma } from "../state/idioma";
import "./comentarios.css";

export type Comentario = { nombre: string; fecha: string | null; texto: string };

const MAX_NOMBRE = 60;
const MAX_TEXTO = 600;
const MAX_MOSTRADOS = 100;

/** Valida una entrada del JSON; devuelve null si no sirve. Exportada para probarla. */
export function validar(x: unknown): Comentario | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const nombre = typeof o.nombre === "string" ? o.nombre.trim() : "";
  const texto = typeof o.texto === "string" ? o.texto.trim() : "";
  if (!nombre || !texto || nombre.length > MAX_NOMBRE || texto.length > MAX_TEXTO) return null;
  const fecha = typeof o.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.fecha) ? o.fecha : null;
  return { nombre, fecha, texto };
}

type Estado = { fase: "cargando" } | { fase: "listo"; lista: Comentario[]; descartados: number } | { fase: "error" };

export default function Comentarios() {
  const { tr, idioma } = useIdioma();
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });

  useEffect(() => {
    let vivo = true;
    fetch("/comentarios.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((txt) => {
        // Sin archivo, el servidor de desarrollo responde index.html con 200: JSON.parse falla y cae al catch.
        const d: unknown = JSON.parse(txt);
        const crudos = d && typeof d === "object" && Array.isArray((d as { comentarios?: unknown }).comentarios)
          ? ((d as { comentarios: unknown[] }).comentarios)
          : null;
        if (!crudos) throw new Error("formato");
        const lista = crudos.map(validar).filter((c): c is Comentario => c !== null);
        // Más recientes primero; los sin fecha al final, en el orden del archivo.
        lista.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
        if (vivo) setEstado({ fase: "listo", lista: lista.slice(0, MAX_MOSTRADOS), descartados: crudos.length - lista.length });
      })
      .catch((e: unknown) => {
        console.error("[comentarios] no se pudo leer comentarios.json:", e);
        if (vivo) setEstado({ fase: "error" });
      });
    return () => {
      vivo = false;
    };
  }, []);

  const fechaLegible = (f: string) =>
    new Date(`${f}T12:00:00Z`).toLocaleDateString(idioma === "en" ? "en-US" : "es-CL", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="comentarios" aria-labelledby="comentarios-titulo">
      <h2 id="comentarios-titulo">{tr("Comentarios", "Comments")}</h2>
      {estado.fase === "cargando" && <p className="com-vacio">{tr("Cargando comentarios…", "Loading comments…")}</p>}
      {estado.fase === "error" && <p className="com-vacio">{tr("No se pudieron cargar los comentarios.", "Could not load the comments.")}</p>}
      {estado.fase === "listo" && estado.lista.length === 0 && (
        <p className="com-vacio">{tr("Todavía no hay comentarios.", "No comments yet.")}</p>
      )}
      {estado.fase === "listo" && estado.lista.length > 0 && (
        <ul className="com-lista">
          {estado.lista.map((c, i) => (
            <li key={`${c.nombre}-${c.fecha}-${i}`} className="com-item">
              <div className="com-cabecera">
                <strong>{c.nombre}</strong>
                {c.fecha && <time dateTime={c.fecha}>{fechaLegible(c.fecha)}</time>}
              </div>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}
      <details className="com-como">
        <summary>{tr("¿Cómo agregar un comentario?", "How to add a comment?")}</summary>
        <p>
          {tr(
            "Edita scaffold/frontend/public/comentarios.json en el repositorio y agrega a la lista «comentarios» un objeto con nombre, fecha (AAAA-MM-DD) y texto. Nombre hasta 60 caracteres y texto hasta 600; se muestra como texto plano.",
            "Edit scaffold/frontend/public/comentarios.json in the repository and add to the «comentarios» list an object with nombre (name), fecha (date, YYYY-MM-DD) and texto (text). Name up to 60 characters and text up to 600; it is shown as plain text.",
          )}
        </p>
        <pre>{`{ "nombre": "Ana", "fecha": "2026-11-15", "texto": "${tr("¡Muy buena herramienta!", "Great tool!")}" }`}</pre>
        {estado.fase === "listo" && estado.descartados > 0 && (
          <p className="com-aviso">
            {tr(
              estado.descartados === 1
                ? "1 entrada del archivo no se muestra porque le falta el nombre o el texto, o supera el largo máximo."
                : `${estado.descartados} entradas del archivo no se muestran porque les falta el nombre o el texto, o superan el largo máximo.`,
              estado.descartados === 1
                ? "1 entry in the file is hidden because it lacks a name or text, or exceeds the maximum length."
                : `${estado.descartados} entries in the file are hidden because they lack a name or text, or exceed the maximum length.`,
            )}
          </p>
        )}
      </details>
    </section>
  );
}
