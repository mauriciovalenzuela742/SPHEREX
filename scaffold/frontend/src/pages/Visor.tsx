/**
 * Pantalla 3 de la pizarra: el visor de AstroTRACK (en la pizarra se llamaba «Planet X»; ya no se usa ese nombre).
 * Dueña: Antonia (V1).
 * Hoy: controles conectados a la URL + cielo de SPHEREx en Aladin (Vía A).
 * Cada recuadro con borde punteado es un hueco con su responsable.
 */
import { useRef, useState } from "react";
import AladinView, { planoDeBanda } from "../sky/AladinView";
import { CAMPOS, posicionActual } from "../content/campos";
import { TAMANOS, type Estado } from "../state/url";
import Spherix from "../spherix/Spherix";
import MisionPanel from "../mision/MisionPanel";
import Explorador from "../explorador/Explorador";
import { useDatosSpherex } from "../explorador/useDatosSpherex";
import Prisma from "../prisma/Prisma";
import type { Accion } from "../spherix/motor";
import { epocaDeFecha } from "../sky/propagacion";
import { EntradaCoordenadas, PanelDescubrir } from "../apuntar/Apuntar";
import PanelEspectro from "../apuntar/PanelEspectro";
import { useIdioma } from "../state/idioma";

// Misma fecha que usa posicionActual() para centrar: así la marca del objeto cae en el centro del recorte.
// TODO: cuando el explorador avise la fecha del fotograma elegido, pasar esa época en vez de la de hoy.
const EPOCA_HOY = epocaDeFecha(new Date());
// Época media del cubo SPHEREx DR1 (≈ 2025,94; la misma que usa capas/trayectoria.ts en la rama de trayectoria:
// cuando entre, unificar con su EPOCA_SPHEREX). «¿Qué hay aquí?» propaga SIMBAD a la imagen que se mira, no a hoy:
// Barnard se corre 9,7″ entre 2025,94 y fines de 2026, casi todo el radio de 10″. La época de la capa visible
// (2MASS/AllWISE al parpadear) vive dentro de ControlEpocas y no llega aquí; se usa la del cubo, que es la base.
const EPOCA_SPHEREX = 2025.94;

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
  const { t, tr } = useIdioma();
  const enMision = Boolean(estado.mision);
  // Un solo origen de datos para el Explorador (tiempo) y el Prisma (colores).
  const datos = useDatosSpherex(estado.ra, estado.dec, estado.size, !enMision);
  // El cielo solo se reencuadra cuando cambia la posición o la dimensión. Si la persona alejó el mapa a mano,
  // volver a elegir la misma dimensión no cambia nada: este botón lo reencuadra.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aladin = useRef<any>(null);
  const fovDeg = Math.max(estado.size * 4, 0.3);
  // Último punto elegido con un clic o al azar: el panel «¿Qué hay aquí?» lo consulta en SIMBAD.
  const [punto, setPunto] = useState<{ ra: number; dec: number } | null>(null);
  const irA = (p: { ra: number; dec: number }) => {
    set(p);
    setPunto(p);
  };
  const encuadrar = () => {
    aladin.current?.gotoRaDec(estado.ra, estado.dec);
    aladin.current?.setFoV(fovDeg);
  };
  return (
    <section className="visor">
      <div className="barra" data-tour="busqueda">
        {/* Grados o sexagesimal («08 55 10.83 -07 14 42.5»): src/apuntar/coordenadas.ts. */}
        <EntradaCoordenadas ra={estado.ra} dec={estado.dec} onIr={set} />
        <label>
          {tr("Dimensión (°)", "Size (°)")}
          <select value={estado.size} onChange={(e) => set({ size: Number(e.target.value) })}>
            {TAMANOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          {tr("Bandas", "Bands")}
          <select value={estado.band} onChange={(e) => set({ band: e.target.value })}>
            <option value="all">{tr("Todas", "All")}</option>
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <option key={b} value={String(b)}>
                D{b}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="objetos" role="group" aria-label={tr("Objetos de prueba", "Test objects")} data-tour="objetos">
        {CAMPOS.map((c) => (
          <button key={c.id} onClick={() => set(posicionActual(c))} title={`${c.tipo} · ${tr("centrado en su posición de hoy", "centered on its current position")}`}>
            {c.nombre}
          </button>
        ))}
      </div>

      <div className={enMision ? "cuerpo cuerpo-mision" : "cuerpo"}>
        <div className="principal">
          {/* Arriba del mapa: así se ve justo después de escribir A.R./Dec o elegir la dimensión. */}
          <div className="sobre-mapa">
            <button
              className="encuadrar"
              onClick={encuadrar}
              title={tr(`Vuelve al objeto y a la dimensión elegida (${estado.size}°)`, `Back to the object at the chosen size (${estado.size}°)`)}
            >
              ⤢ {tr("Encuadrar el recorte", "Frame the cutout")}
            </button>
            {/* Tarea #14: el mismo punto en WiseView, la herramienta que el desafío nombra como modelo
                (biblio/fichas/wiseview-el-precedente.md). Diferencia con AstroTRACK: WiseView hace parpadear
                WISE/NEOWISE (2010–2024, 4 bandas anchas) y sirve para ver bien el movimiento en años;
                AstroTRACK hace lo mismo con SPHEREx y suma el eje de longitud de onda (102 canales). */}
            <a
              className="wiseview"
              href={`http://byw.tools/wiseview#ra=${estado.ra.toFixed(5)}&dec=${estado.dec.toFixed(5)}`}
              target="_blank"
              rel="noopener noreferrer"
              title={tr("Abre estas coordenadas en WiseView (parpadeo de WISE/NEOWISE, 2010–2024) en otra pestaña", "Opens these coordinates in WiseView (WISE/NEOWISE blink, 2010–2024) in a new tab")}
            >
              {tr("Ver en WiseView ↗", "View in WiseView ↗")}
            </a>
          </div>
          <AladinView
            ra={estado.ra}
            dec={estado.dec}
            fovDeg={fovDeg}
            plano={planoDeBanda(estado.band)}
            onReady={(a) => (aladin.current = a)}
            size={estado.size}
            epoca={EPOCA_HOY}
            onSelect={(ra, dec) => irA({ ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)) })}
          />
          <PanelDescubrir ra={estado.ra} dec={estado.dec} punto={punto} epoca={EPOCA_SPHEREX} onAzar={(p) => irA({ ra: p.ra, dec: p.dec })} />
          {/* Espectro del punto o del candidato de CatWISE que se pidió («modo descubrimiento»). */}
          <PanelEspectro />
          <p className="quien">
            {t.cieloDesc(estado.band === "all" ? "D2" : `D${estado.band}`)}
          </p>
          {!enMision && (
            <>
            <Explorador datos={datos} />
            <Prisma datos={datos} ra={estado.ra} dec={estado.dec} />
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
              <strong>{tr("¿Qué es SPHEREx?", "What is SPHEREx?")}</strong>
              <p>{t.queEsSpherex}</p>
            </div>
            <div className="tarjeta">
              <strong>{tr("Cómo leer el parpadeo", "How to read the blink")}</strong>
              <p>{tr("Cada cuadro es una visita de SPHEREx, de la más antigua a la más reciente. En «Resta con la primera», lo que apareció queda de un color y lo que se fue, del otro: una pareja pegada es algo que se movió.", "Each frame is a SPHEREx visit, from oldest to newest. In “Subtract vs t₀”, what appeared shows in one color and what left in the other: a touching pair is something that moved.")}</p>
            </div>
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
