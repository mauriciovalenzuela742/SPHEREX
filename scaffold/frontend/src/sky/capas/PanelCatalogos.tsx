/**
 * Panel junto a «Mostrar catálogos»: estado de cada catálogo (cargando / N objetos / no respondió, con
 * «Reintentar») y la leyenda de las marcas. Dueño: Juan Pablo (V2). Lee el estado de `estado.ts`.
 */
import { COLOR_CANDIDATO, COLOR_MOVIL } from "./catwise";
import { useEstadosCatalogos, type EstadoCatalogo } from "./estado";

function Icono({ forma, color, relleno }: { forma: "circulo" | "triangulo" | "cuadrado"; color: string; relleno?: boolean }) {
  const comun = { stroke: color, strokeWidth: 1.6, fill: relleno ? color : "none" };
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: "none", verticalAlign: "-2px" }}>
      {forma === "circulo" && <circle cx="7" cy="7" r="5.2" {...comun} />}
      {forma === "cuadrado" && <rect x="2" y="2" width="10" height="10" {...comun} />}
      {forma === "triangulo" && <polygon points="7,1.5 12.8,12.3 1.2,12.3" {...comun} />}
    </svg>
  );
}

function Fila({ e }: { e: EstadoCatalogo }) {
  const color = e.fase === "error" ? "#ff8a80" : e.fase === "cargando" ? "var(--suave)" : "var(--texto)";
  return (
    <li style={{ margin: "2px 0" }}>
      <span style={{ fontWeight: 600 }}>{e.nombre}:</span>{" "}
      <span style={{ color }} role={e.fase === "error" ? "alert" : undefined}>
        {e.fase === "cargando" ? "cargando…" : e.texto}
      </span>
      {e.reintentar && (
        <button type="button" onClick={e.reintentar} style={{ marginLeft: 8, padding: "1px 8px", fontSize: "0.85em" }}>
          Reintentar
        </button>
      )}
      {e.nota && <div className="nota" style={{ marginLeft: 12 }}>{e.nota}</div>}
    </li>
  );
}

export default function PanelCatalogos() {
  const estados = useEstadosCatalogos();
  return (
    <div
      aria-live="polite"
      style={{
        marginTop: 6,
        padding: "6px 10px",
        border: "1px solid var(--borde)",
        borderRadius: 6,
        background: "var(--panel)",
        fontSize: "0.85rem",
        lineHeight: 1.4,
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {estados.map((e) => (
          <Fila key={e.id} e={e} />
        ))}
      </ul>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 6, color: "var(--suave)" }}>
        <span><Icono forma="circulo" color="#4fc3f7" /> estrella de Gaia</span>
        <span><Icono forma="cuadrado" color="#ffb000" /> objeto conocido (SIMBAD)</span>
        <span><Icono forma="triangulo" color={COLOR_MOVIL} /> se mueve y ya está estudiado</span>
        <span style={{ color: "var(--texto)" }}>
          <Icono forma="triangulo" color={COLOR_CANDIDATO} relleno /> se mueve y no aparece en SIMBAD: ¡candidato para
          revisar! (haz clic en él)
        </span>
      </div>
    </div>
  );
}
