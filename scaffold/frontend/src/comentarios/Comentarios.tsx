/**
 * Comentarios al final del Visor, sin servidor.
 *
 * - Se agrupan por objeto: la clave es el id del objeto de prueba si se está mirando uno (a menos de 0,05°)
 *   o, en cualquier otro punto, las coordenadas «ra,dec» con 4 decimales.
 * - Al comentar, se guarda en este navegador (localStorage, como JSON) bajo esa clave.
 * - «Descargar comments.json» baja el archivo completo (repo + navegador). Se reemplaza
 *   `scaffold/frontend/public/comments.json` con él y se hace commit: así lo ve todo el mundo.
 * - Se muestran los comentarios del objeto actual: los del comments.json publicado más los de este navegador.
 * Límites: nombre ≤ 60, texto ≤ 600, sin enlaces, solo texto plano.
 */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CAMPOS, posicionActual } from "../content/campos";
import { useIdioma } from "../state/idioma";
import "./comentarios.css";

export type Comentario = { id: string; nombre: string; fecha: string | null; texto: string };
export type Objeto = { nombre?: string; ra: number; dec: number; comentarios: Comentario[] };
export type Archivo = { _instrucciones?: string; objetos: Record<string, Objeto> };

const MAX_NOMBRE = 60;
const MAX_TEXTO = 600;
const ENLACE = /(https?:\/\/|www\.)/i;
const CLAVE_LOCAL = "astrotrack.comments";

/** Clave del objeto en esta posición: id del objeto de prueba o «ra,dec» con 4 decimales. */
export function claveDe(ra: number, dec: number): { clave: string; nombre?: string } {
  for (const c of CAMPOS) {
    const p = posicionActual(c);
    if (Math.hypot((p.ra - ra) * Math.cos((dec * Math.PI) / 180), p.dec - dec) < 0.05) return { clave: c.id, nombre: c.nombre };
  }
  return { clave: `${ra.toFixed(4)},${dec >= 0 ? "+" : ""}${dec.toFixed(4)}` };
}

/** Valida un comentario; devuelve null si no sirve. */
export function validar(x: unknown): Comentario | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const nombre = typeof o.nombre === "string" ? o.nombre.trim() : "";
  const texto = typeof o.texto === "string" ? o.texto.trim() : "";
  if (!nombre || !texto || nombre.length > MAX_NOMBRE || texto.length > MAX_TEXTO) return null;
  if (ENLACE.test(nombre) || ENLACE.test(texto)) return null;
  const fecha = typeof o.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.fecha) ? o.fecha : null;
  const id = typeof o.id === "string" && o.id ? o.id : `${nombre}|${fecha}|${texto}`.slice(0, 80);
  return { id, nombre, fecha, texto };
}

/** Normaliza un archivo comments.json (descarta lo mal formado). */
export function normalizar(d: unknown): Archivo {
  const objetos: Record<string, Objeto> = {};
  const crudos = d && typeof d === "object" ? (d as { objetos?: unknown }).objetos : null;
  if (crudos && typeof crudos === "object") {
    for (const [k, v] of Object.entries(crudos as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const o = v as Record<string, unknown>;
      const comentarios = Array.isArray(o.comentarios) ? o.comentarios.map(validar).filter((c): c is Comentario => c !== null) : [];
      if (typeof o.ra !== "number" || typeof o.dec !== "number") continue;
      objetos[k] = { ...(typeof o.nombre === "string" ? { nombre: o.nombre } : {}), ra: o.ra, dec: o.dec, comentarios };
    }
  }
  return { objetos };
}

/** Une dos archivos sin repetir comentarios (por id). */
export function unir(a: Archivo, b: Archivo): Archivo {
  const objetos: Record<string, Objeto> = structuredClone(a.objetos);
  for (const [k, o] of Object.entries(b.objetos)) {
    const dest = (objetos[k] ??= { ...o, comentarios: [] });
    const ids = new Set(dest.comentarios.map((c) => c.id));
    for (const c of o.comentarios) if (!ids.has(c.id)) dest.comentarios.push(c);
  }
  return { objetos };
}

function leerLocal(): Archivo {
  try {
    return normalizar(JSON.parse(localStorage.getItem(CLAVE_LOCAL) ?? "{}"));
  } catch {
    return { objetos: {} };
  }
}

function guardarLocal(a: Archivo): boolean {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(a));
    return true;
  } catch {
    return false; // modo privado o almacenamiento lleno
  }
}

type Envio = { fase: "nada" } | { fase: "ok" } | { fase: "error"; motivo: string };

export default function Comentarios({ ra, dec }: { ra: number; dec: number }) {
  const { tr, idioma } = useIdioma();
  const [publicado, setPublicado] = useState<Archivo | null>(null);
  const [instrucciones, setInstrucciones] = useState<string | undefined>();
  const [local, setLocal] = useState<Archivo>(leerLocal);
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [envio, setEnvio] = useState<Envio>({ fase: "nada" });
  const { clave, nombre: nombreObjeto } = claveDe(ra, dec);

  useEffect(() => {
    let vivo = true;
    fetch("/comments.json", { cache: "no-cache", signal: AbortSignal.timeout(8000) })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((txt) => {
        const d: unknown = JSON.parse(txt); // sin archivo, el servidor de desarrollo responde index.html: falla aquí
        if (!vivo) return;
        setPublicado(normalizar(d));
        if (d && typeof d === "object" && typeof (d as { _instrucciones?: unknown })._instrucciones === "string")
          setInstrucciones((d as { _instrucciones: string })._instrucciones);
      })
      .catch((e: unknown) => {
        console.error("[comentarios] no se pudo leer comments.json:", e);
        if (vivo) setPublicado({ objetos: {} });
      });
    return () => {
      vivo = false;
    };
  }, []);

  const todo = useMemo(() => unir(publicado ?? { objetos: {} }, local), [publicado, local]);
  const deAqui = [...(todo.objetos[clave]?.comentarios ?? [])].sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  const enNavegador = Object.values(local.objetos).reduce((n, o) => n + o.comentarios.length, 0);

  const conEnlace = ENLACE.test(nombre) || ENLACE.test(texto);
  const puedeEnviar = nombre.trim().length > 0 && texto.trim().length > 0 && !conEnlace;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const c = validar({ id: crypto.randomUUID().slice(0, 12), nombre: nombre.split(/\s+/).filter(Boolean).join(" "), fecha: new Date().toISOString().slice(0, 10), texto });
    if (!c) return setEnvio({ fase: "error", motivo: tr("Revisa el nombre y el comentario.", "Check the name and the comment.") });
    const nuevo = unir(local, {
      objetos: { [clave]: { ...(nombreObjeto ? { nombre: nombreObjeto } : {}), ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)), comentarios: [c] } },
    });
    if (!guardarLocal(nuevo))
      return setEnvio({ fase: "error", motivo: tr("Este navegador no deja guardar (¿modo privado?).", "This browser does not allow saving (private mode?).") });
    setLocal(nuevo);
    setTexto("");
    setEnvio({ fase: "ok" });
  };

  const descargar = () => {
    const doc = { _instrucciones: instrucciones, objetos: todo.objetos };
    const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2) + "\n"], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "comments.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fechaLegible = (f: string) =>
    new Date(`${f}T12:00:00Z`).toLocaleDateString(idioma === "en" ? "en-US" : "es-CL", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section className="comentarios" aria-labelledby="comentarios-titulo">
      <h2 id="comentarios-titulo">
        {tr("Comentarios", "Comments")} · <span className="com-objeto">{nombreObjeto ?? `A.R. ${ra.toFixed(4)}°, Dec ${dec.toFixed(4)}°`}</span>
      </h2>

      <form className="com-form" onSubmit={enviar}>
        <label>
          {tr("Tu nombre", "Your name")}
          <input value={nombre} maxLength={MAX_NOMBRE} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required />
        </label>
        <label>
          {tr("Comentario sobre este objeto", "Comment about this object")}
          <textarea value={texto} maxLength={MAX_TEXTO} rows={3} onChange={(e) => { setTexto(e.target.value); setEnvio({ fase: "nada" }); }} required />
          <span className="com-contador">{texto.length}/{MAX_TEXTO}</span>
        </label>
        <div className="com-enviar">
          <button type="submit" disabled={!puedeEnviar}>{tr("Guardar comentario", "Save comment")}</button>
          <span className="com-nota" aria-live="polite">
            {conEnlace
              ? tr("Los comentarios no pueden llevar enlaces.", "Comments cannot contain links.")
              : envio.fase === "ok"
                ? tr("Guardado en este navegador. Descarga comments.json para sumarlo al proyecto.", "Saved in this browser. Download comments.json to add it to the project.")
                : envio.fase === "error"
                  ? envio.motivo
                  : tr(`Se guarda bajo «${clave}». Sin enlaces.`, `Saved under “${clave}”. No links.`)}
          </span>
        </div>
      </form>

      {publicado === null && <p className="com-vacio">{tr("Cargando comentarios…", "Loading comments…")}</p>}
      {publicado !== null && deAqui.length === 0 && (
        <p className="com-vacio">{tr("Todavía no hay comentarios sobre este objeto.", "No comments about this object yet.")}</p>
      )}
      {deAqui.length > 0 && (
        <ul className="com-lista">
          {deAqui.map((c) => (
            <li key={c.id} className="com-item">
              <div className="com-cabecera">
                <strong>{c.nombre}</strong>
                {c.fecha && <time dateTime={c.fecha}>{fechaLegible(c.fecha)}</time>}
                {local.objetos[clave]?.comentarios.some((x) => x.id === c.id) && !publicado?.objetos[clave]?.comentarios.some((x) => x.id === c.id) && (
                  <span className="com-local">{tr("solo en este navegador", "only in this browser")}</span>
                )}
              </div>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="com-archivo">
        <button type="button" onClick={descargar}>{tr("Descargar comments.json", "Download comments.json")}</button>
        <span className="com-nota">
          {tr(
            `Incluye todos los objetos (${enNavegador} comentario(s) guardados en este navegador). Reemplaza con él scaffold/frontend/public/comments.json y haz commit.`,
            `Includes every object (${enNavegador} comment(s) saved in this browser). Replace scaffold/frontend/public/comments.json with it and commit.`,
          )}
        </span>
      </div>
    </section>
  );
}
