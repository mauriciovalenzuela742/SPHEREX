/**
 * Deslizador de longitud de onda sobre los planos del cubo. Dueño: Juan Pablo (V2). Trabajo de S1.
 *
 * Recorre los 100 planos con imagen (los 102 menos el 50 y el 51, que vienen vacíos), rotulados con su λ
 * en µm leída del `properties` del HiPS en ejecución, y la banda D1–D6. Si `plano` cambia desde fuera
 * (p. ej. al elegir otra banda), el deslizador se mueve.
 */
import { useEffect, useId, useState, type CSSProperties } from "react";
import { leerPlanos, type Plano } from "./planos";

type Props = {
  /** Plano activo (0–101). */
  plano: number;
  /** Se llama cuando el usuario elige otro plano. */
  onPlano: (plano: number) => void;
  /** URL del HiPS, para leer su `properties`. */
  survey: string;
};

type Estado = { tipo: "cargando" } | { tipo: "error"; motivo: string } | { tipo: "listo"; planos: Plano[] };

/** Posición en la lista del plano pedido; si es uno vacío o no está, la del plano más cercano. */
function posicionDe(planos: Plano[], plano: number): number {
  let mejor = 0;
  for (let i = 0; i < planos.length; i++) {
    if (Math.abs(planos[i].indice - plano) < Math.abs(planos[mejor].indice - plano)) mejor = i;
  }
  return mejor;
}

const rotulo = (p: Plano) => `λ = ${p.lambdaUm.toFixed(2)} µm · banda D${p.banda}`;

const caja: CSSProperties = {
  marginTop: "0.5rem",
  padding: "0.5rem 0.75rem",
  border: "1px solid var(--borde)",
  borderRadius: 8,
  background: "var(--panel)",
  color: "var(--texto)",
  fontSize: "0.9rem",
};

export default function LambdaSlider({ plano, onPlano, survey }: Props) {
  const id = useId();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let vigente = true;
    setEstado({ tipo: "cargando" });
    leerPlanos(survey)
      .then((planos) => {
        if (!vigente) return;
        setEstado(planos.length ? { tipo: "listo", planos } : { tipo: "error", motivo: "la lista de planos vino vacía" });
      })
      .catch((e: unknown) => {
        if (vigente) setEstado({ tipo: "error", motivo: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      vigente = false;
    };
  }, [survey]);

  if (estado.tipo === "cargando") {
    return (
      <div style={{ ...caja, color: "var(--suave)" }} aria-live="polite">
        Cargando las longitudes de onda del cubo…
      </div>
    );
  }
  if (estado.tipo === "error") {
    return (
      <div role="alert" style={{ ...caja, border: "1px solid var(--acento)" }}>
        No se pudieron leer las longitudes de onda del cubo ({estado.motivo}). El mapa sigue en el plano {plano}, pero
        no se puede elegir λ.
      </div>
    );
  }

  const { planos } = estado;
  const pos = posicionDe(planos, plano);
  const actual = planos[pos];
  const primero = planos[0];
  const ultimo = planos[planos.length - 1];

  return (
    <div style={caja}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
        <label htmlFor={id} style={{ fontWeight: 600 }}>
          Longitud de onda
        </label>
        <output htmlFor={id} aria-live="polite" style={{ fontVariantNumeric: "tabular-nums", color: "var(--acento)" }}>
          {rotulo(actual)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={planos.length - 1}
        step={1}
        value={pos}
        aria-valuetext={rotulo(actual)}
        onChange={(e) => onPlano(planos[Number(e.target.value)].indice)}
        style={{ width: "100%", accentColor: "var(--acento)", margin: "0.4rem 0 0.1rem" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--suave)", fontSize: "0.8rem" }}>
        <span>{primero.lambdaUm.toFixed(2)} µm</span>
        <span>
          {planos.length} canales · D1–D6
        </span>
        <span>{ultimo.lambdaUm.toFixed(2)} µm</span>
      </div>
    </div>
  );
}
