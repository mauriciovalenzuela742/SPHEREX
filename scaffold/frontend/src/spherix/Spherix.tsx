/**
 * Spherix: chat flotante del visor (pizarra 1) y modo asistido (pizarra 2). Dueño: Juan Pablo (V2);
 * textos: Javiera (content/spherix.ts); lógica: ./motor.ts.
 *
 * - Modo asistido (botón «Empecemos con Spherix»): abre desplegado y pregunta qué parte del cielo ver.
 * - Modo directo: queda como burbuja; al abrirla saluda con «¿En qué puedo ayudarte hoy?».
 * Accesibilidad: los mensajes nuevos se anuncian (aria-live), todo se maneja con teclado.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { spherix } from "../content/spherix";
import { responder, saludo, type Accion, type Contexto } from "./motor";

type Mensaje = { de: "spherix" | "usuario"; texto: string };

type Props = {
  asistido: boolean;
  contexto: Contexto;
  onAccion: (a: Accion) => void;
};

export function Cara() {
  // La carita de la pizarra: un círculo con ojos y sonrisa. Decorativa.
  return (
    <svg className="spherix-cara" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="var(--panel)" stroke="var(--acento)" strokeWidth="2.5" />
      <circle cx="14" cy="17" r="2.6" fill="var(--texto)" />
      <circle cx="26" cy="17" r="2.6" fill="var(--texto)" />
      <path d="M13 25 Q20 31 27 25" fill="none" stroke="var(--texto)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Spherix({ asistido, contexto, onAccion }: Props) {
  const [abierto, setAbierto] = useState(asistido);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [entrada, setEntrada] = useState("");
  const [pensando, setPensando] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const ctx = useRef(contexto);
  ctx.current = contexto;

  // Saludo inicial (una vez por apertura del chat vacío).
  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      const r = saludo(asistido);
      setMensajes(r.textos.map((texto) => ({ de: "spherix", texto })));
      setSugerencias(r.sugerencias);
    }
    if (abierto) campo.current?.focus();
  }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si llega el modo asistido después (desde la landing), abrir.
  useEffect(() => {
    if (asistido) setAbierto(true);
  }, [asistido]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, pensando]);

  async function enviar(texto: string) {
    const limpio = texto.trim();
    if (!limpio || pensando) return;
    setMensajes((m) => [...m, { de: "usuario", texto: limpio }]);
    setEntrada("");
    setSugerencias([]);
    setPensando(true);
    try {
      const r = await responder(limpio, ctx.current);
      r.acciones.forEach(onAccion);
      setMensajes((m) => [...m, ...r.textos.map((t) => ({ de: "spherix" as const, texto: t }))]);
      setSugerencias(r.sugerencias);
    } catch {
      setMensajes((m) => [...m, { de: "spherix", texto: spherix.sinConexion }]);
    } finally {
      setPensando(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void enviar(entrada);
  }

  if (!abierto) {
    return (
      <button className="spherix-burbuja" onClick={() => setAbierto(true)} aria-label="Abrir el chat con Spherix" data-tour="spherix">
        <Cara />
        <span>{spherix.nombre}</span>
      </button>
    );
  }

  return (
    <section className={`spherix ${asistido ? "abierto" : ""}`} aria-label="Chat con Spherix" data-tour="spherix">
      <header className="spherix-cabecera">
        <Cara />
        <strong>{spherix.nombre}</strong>
        <button className="spherix-cerrar" onClick={() => setAbierto(false)} aria-label="Minimizar el chat">
          −
        </button>
      </header>

      <div className="spherix-mensajes" ref={lista} role="log" aria-live="polite" aria-relevant="additions">
        {mensajes.map((m, i) => (
          <p key={i} className={`msg msg-${m.de}`}>
            {m.texto}
          </p>
        ))}
        {pensando && <p className="msg msg-spherix pensando">{spherix.pensando}</p>}
      </div>

      {sugerencias.length > 0 && (
        <div className="spherix-sugerencias" role="group" aria-label="Sugerencias">
          {sugerencias.map((s) => (
            <button key={s} type="button" onClick={() => void enviar(s)} disabled={pensando}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="spherix-form">
        <label className="solo-lector" htmlFor="spherix-entrada">
          Escríbele a Spherix
        </label>
        <input
          id="spherix-entrada"
          ref={campo}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Un nombre, coordenadas o una pregunta"
          autoComplete="off"
        />
        <button type="submit" disabled={pensando || !entrada.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
