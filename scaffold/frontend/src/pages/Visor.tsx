/**
 * Pantalla 3 de la pizarra («Planet X»). Dueña: Antonia (V1).
 * Hoy: controles conectados a la URL + cielo de SPHEREx en Aladin (Vía A).
 * Cada recuadro con borde punteado es un hueco con su responsable.
 */
import AladinView, { planoDeBanda } from "../sky/AladinView";
import { CAMPOS, posicionActual } from "../content/campos";
import { textos } from "../content/textos";
import type { Estado } from "../state/url";
import Spherix from "../spherix/Spherix";
import MisionPanel from "../mision/MisionPanel";
import type { Accion } from "../spherix/motor";

type Props = { estado: Estado; set: (p: Partial<Estado>) => void; asistido: boolean };

function Hueco({ titulo, quien }: { titulo: string; quien: string }) {
  return (
    <div className="hueco">
      <strong>{titulo}</strong>
      <span>{quien}</span>
    </div>
  );
}

export default function Visor({ estado, set, asistido }: Props) {
  const enMision = Boolean(estado.mision);
  return (
    <section className="visor">
      <div className="barra">
        <label>
          A.R. (°)
          <input type="number" step="0.0001" value={estado.ra} onChange={(e) => set({ ra: Number(e.target.value) })} />
        </label>
        <label>
          Dec (°)
          <input type="number" step="0.0001" value={estado.dec} onChange={(e) => set({ dec: Number(e.target.value) })} />
        </label>
        <label>
          Dimensión (°)
          <select value={estado.size} onChange={(e) => set({ size: Number(e.target.value) })}>
            {[0.05, 0.1, 0.2, 0.5, 1].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bandas
          <select value={estado.band} onChange={(e) => set({ band: e.target.value })}>
            <option value="all">Todas</option>
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <option key={b} value={String(b)}>
                D{b}
              </option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input type="date" disabled title="Pendiente: Vladimir (from/to)" />
        </label>
        <label>
          Hasta
          <input type="date" disabled title="Pendiente: Vladimir (from/to)" />
        </label>
      </div>

      <div className="objetos" role="group" aria-label="Objetos de prueba">
        {CAMPOS.map((c) => (
          <button key={c.id} onClick={() => set(posicionActual(c))} title={`${c.tipo} · centrado en su posición de hoy`}>
            {c.nombre}
          </button>
        ))}
      </div>

      <div className={enMision ? "cuerpo cuerpo-mision" : "cuerpo"}>
        <div className="principal">
          <AladinView
            ra={estado.ra}
            dec={estado.dec}
            fovDeg={Math.max(estado.size * 4, 0.3)}
            plano={planoDeBanda(estado.band)}
          />
          <p className="quien">
            Cielo: cubo SPHEREx DR1 de IRSA (mosaico de todas las épocas, sin eje de tiempo). Banda {estado.band === "all" ? "D2" : `D${estado.band}`}, canal central.
          </p>
          {!enMision && (
            <>
            <div className="reproductor">
              <button disabled aria-label="Anterior">◁</button>
              <button disabled aria-label="Reproducir">▶</button>
              <button disabled aria-label="Siguiente">▷</button>
              <input type="range" disabled aria-label="Línea de tiempo" />
              <span>1x</span>
              <span className="quien">Blink por épocas: Antonia + Bryan (/api/frames)</span>
            </div>
            <div className="tira">
              {[1, 2, 3, 4].map((i) => (
                <Hueco key={i} titulo={`Época ${i}`} quien="Tira de fotogramas" />
              ))}
            </div>
            <Hueco titulo="Gráfico de bandas (espectro, 0,75–5 µm) + barra UV · V · IR · X" quien="Juan Pablo + Bryan (/api/spectrum)" />
            </>
          )}
        </div>
        {enMision ? (
          <aside className="lateral lateral-mision">
            <MisionPanel estado={estado} set={set} />
          </aside>
        ) : (
          <aside className="lateral">
            <div className="tarjeta">
              <strong>¿Qué es SPHEREx?</strong>
              <p>{textos.queEsSpherex}</p>
            </div>
            <Hueco titulo="Épocas y metadatos (fecha, λ, flags)" quien="Vladimir + Bryan (/api/epochs)" />
            <Hueco titulo="Contaminación (% …) — por definir" quien="Mauricio + Bryan" />
          </aside>
        )}
      </div>

      {!enMision && (
      <Spherix
        asistido={asistido}
        contexto={{ ra: estado.ra, dec: estado.dec, size: estado.size }}
        onAccion={(a: Accion) => {
          if (a.tipo === "ir") set({ ra: a.ra, dec: a.dec });
          else if (a.tipo === "banda") set({ band: a.band });
          else set({ size: a.size });
        }}
      />
      )}
    </section>
  );
}
