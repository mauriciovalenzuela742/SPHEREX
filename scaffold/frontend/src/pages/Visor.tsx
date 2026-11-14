/**
 * Pantalla 3 de la pizarra («Planet X»). Dueña: Antonia (V1).
 * Hoy: controles conectados a la URL + cielo de SPHEREx en Aladin (Vía A).
 * Cada recuadro con borde punteado es un hueco con su responsable.
 */
import { useRef } from "react";
import AladinView, { planoDeBanda } from "../sky/AladinView";
import { CAMPOS, posicionActual } from "../content/campos";
import { textos } from "../content/textos";
import { TAMANOS, type Estado } from "../state/url";
import Spherix from "../spherix/Spherix";
import MisionPanel from "../mision/MisionPanel";
import Explorador from "../explorador/Explorador";
import { useDatosSpherex } from "../explorador/useDatosSpherex";
import Prisma from "../prisma/Prisma";
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
  // Un solo origen de datos para el Explorador (tiempo) y el Prisma (colores).
  const datos = useDatosSpherex(estado.ra, estado.dec, estado.size, !enMision);
  // El cielo solo se reencuadra cuando cambia la posición o la dimensión. Si la persona alejó el mapa a mano,
  // volver a elegir la misma dimensión no cambia nada: este botón lo reencuadra.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladin = useRef<any>(null);
  const fovDeg = Math.max(estado.size * 4, 0.3);
  const encuadrar = () => {
    aladin.current?.gotoRaDec(estado.ra, estado.dec);
    aladin.current?.setFoV(fovDeg);
  };
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
            {TAMANOS.map((s) => (
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
          {/* Arriba del mapa: así se ve justo después de escribir A.R./Dec o elegir la dimensión. */}
          <button
            className="encuadrar"
            onClick={encuadrar}
            title={`Vuelve al objeto y a la dimensión elegida (${estado.size}°)`}
          >
            ⤢ Encuadrar el recorte
          </button>
          <AladinView
            ra={estado.ra}
            dec={estado.dec}
            fovDeg={fovDeg}
            plano={planoDeBanda(estado.band)}
            onReady={(a) => (aladin.current = a)}
          />
          <p className="quien">
            Cielo: cubo SPHEREx DR1 de IRSA (mosaico de todas las épocas, sin eje de tiempo). Banda {estado.band === "all" ? "D2" : `D${estado.band}`}, canal central.
          </p>
          {!enMision && (
            <>
            <Explorador datos={datos} />
            <Prisma datos={datos} />
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
            <div className="tarjeta">
              <strong>Cómo leer el parpadeo</strong>
              <p>Cada cuadro es una visita de SPHEREx, de la más antigua a la más reciente. En «Resta con la primera», lo que apareció queda de un color y lo que se fue, del otro: una pareja pegada es algo que se movió.</p>
            </div>
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
