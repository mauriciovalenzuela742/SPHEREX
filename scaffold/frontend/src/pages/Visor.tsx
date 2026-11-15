/**
 * Pantalla 3 de la pizarra: el visor de AstroTrack (en la pizarra se llamaba «Planet X»; ya no se usa ese nombre).
 * Dueña: Antonia (V1).
 * Hoy: controles conectados a la URL + cielo de SPHEREx en Aladin (Vía A).
 * Cada recuadro con borde punteado es un hueco con su responsable.
 */
import { useEffect, useRef, useState } from "react";
import AladinView, { planoDeBanda } from "../sky/AladinView";
import { CAMPOS, nombreDe, posicionActual } from "../content/campos";
import { TAMANOS, type Estado } from "../state/url";
import Spherix from "../spherix/Spherix";
import MisionPanel from "../mision/MisionPanel";
import Explorador from "../explorador/Explorador";
import { useDatosSpherex } from "../explorador/useDatosSpherex";
import Prisma from "../prisma/Prisma";
import type { Accion } from "../spherix/motor";
import { epocaDeFecha } from "../sky/propagacion";
import { EntradaCoordenadas } from "../apuntar/Apuntar";
import { puntoAlAzar } from "../apuntar/galactica";
import PanelEspectro from "../apuntar/PanelEspectro";
import { useIdioma } from "../state/idioma";
import Comentarios from "../comentarios/Comentarios";
import Deteccion from "./Deteccion";
import "./visor.css";

// Misma fecha que usa posicionActual() para centrar: así la marca del objeto cae en el centro del recorte.
// TODO: cuando el explorador avise la fecha del fotograma elegido, pasar esa época en vez de la de hoy.
const EPOCA_HOY = epocaDeFecha(new Date());
// Época media del cubo SPHEREx DR1 (≈ 2025,94; la misma que usa capas/trayectoria.ts en la rama de trayectoria:
// cuando entre, unificar con su EPOCA_SPHEREX). La detección de la barra propaga SIMBAD a la imagen que se mira, no a hoy:
// Barnard se corre 9,7″ entre 2025,94 y fines de 2026, casi todo el radio de 10″. La época de la capa visible
// (2MASS/AllWISE al parpadear) vive dentro de ControlEpocas y no llega aquí; se usa la del cubo, que es la base.
const EPOCA_SPHEREX = 2025.94;

type Props = { estado: Estado; set: (p: Partial<Estado>) => void; asistido: boolean };

/**
 * Texto al pasar el mouse por cada objeto de prueba: qué es y qué buscar, en ES y EN.
 * Movimientos propios de content/campos.ts; el resto, de content/mision.ts y docs/11.
 */
const AYUDA_OBJETO: Record<string, [string, string]> = {
  barnard: [
    "La estrella que más rápido se mueve en nuestro cielo: 10,4″ por año. En la resta, busca la pareja roja y azul.",
    "The fastest-moving star in our sky: 10.4″ per year. In Subtract, look for the red and blue pair.",
  ],
  eps_ind_b: [
    "Una pareja de enanas marrones a 12 años luz, que se mueve 4,7″ por año. En la resta, busca la pareja roja y azul en la mira.",
    "A pair of brown dwarfs 12 light-years away, moving 4.7″ per year. In Subtract, look for the red and blue pair at the crosshair.",
  ],
  wise_0855: [
    "La enana marrón más fría que se conoce, a 7 años luz; se mueve 8,2″ por año. Es muy débil: casi solo se ve en las bandas largas (D5–D6).",
    "The coldest known brown dwarf, 7 light-years away; it moves 8.2″ per year. It is very faint: it shows up almost only in the long bands (D5–D6).",
  ],
  rw_aur: [
    "Estrella joven rodeada de gas y polvo, que cambia de brillo sin ritmo fijo. Casi no se mueve, y es tan brillante que satura: una mancha en la resta no siempre es movimiento.",
    "Young star surrounded by gas and dust, changing brightness irregularly. It barely moves, and it is so bright it saturates: a spot in Subtract is not always motion.",
  ],
  r_dra: [
    "Estrella vieja que se infla y se desinfla: su brillo sube y baja en un ciclo de varios meses. En la resta sale de un solo color: cambió de brillo, no se movió.",
    "Old star that swells and shrinks: its brightness rises and falls over a cycle of several months. In Subtract it shows one color: it changed brightness, it did not move.",
  ],
};

function Hueco({ titulo, quien }: { titulo: string; quien: string }) {
  return (
    <div className="hueco">
      <strong>{titulo}</strong>
      <span>{quien}</span>
    </div>
  );
}

export default function Visor({ estado, set, asistido }: Props) {
  const { t, tr, idioma } = useIdioma();
  const enMision = Boolean(estado.mision);
  // Objeto de prueba en la posición actual (a menos de 0,05°): su botón queda marcado en naranja.
  const campoActivo = CAMPOS.find((c) => {
    const p = posicionActual(c);
    return Math.hypot((p.ra - estado.ra) * Math.cos((estado.dec * Math.PI) / 180), p.dec - estado.dec) < 0.05;
  });
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
  // La banda elegida arriba también se aplica al Explorador (si esa banda tiene visitas cargadas).
  const { irA: irAVisita, grid: gridExp, visita: visitaExp } = datos;
  useEffect(() => {
    const b = Number(estado.band);
    if (b >= 1 && b <= 6 && gridExp?.visits[b]?.length) irAVisita(b, visitaExp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.band, gridExp]);

  const mapa = (
    <>
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
            (biblio/fichas/wiseview-el-precedente.md). Diferencia con AstroTrack: WiseView hace parpadear
            WISE/NEOWISE (2010–2024, 4 bandas anchas) y sirve para ver bien el movimiento en años;
            AstroTrack hace lo mismo con SPHEREx y suma el eje de longitud de onda (102 canales). */}
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
      {/* Lo esencial para usar el mapa, plegado para no tapar el cielo. */}
      <details className="tarjeta mapa-ayuda">
        <summary>ⓘ {tr("Cómo usar el mapa", "How to use the map")}</summary>
        <ul>
          <li>{tr("El fondo es el cielo de SPHEREx (todas sus fechas juntas) en un color de infrarrojo. El menú «Banda del mapa» y el panel «Longitud de onda» de abajo eligen cuál.", "The background is the SPHEREx sky (all its dates combined) in one infrared color. The “Map band” menu and the “Wavelength” panel below choose which.")}</li>
          <li>{tr("Arrastra para moverte; usa la rueda, el pellizco o − / + (abajo a la izquierda) para acercar o alejar.", "Drag to move around; use the scroll wheel, a pinch or − / + (bottom left) to zoom in or out.")}</li>
          <li>{tr("Haz clic en el cielo: el visor va a ese punto y la línea sobre «Explorar una zona al azar» dice si SIMBAD ya lo conoce.", "Click on the sky: the viewer moves to that point and the line above “Explore a random area” says whether SIMBAD already knows it.")}</li>
          <li>{tr("La marca es el objeto; el cuadrado punteado, el recorte que usan el Explorador y el Prisma; los círculos y la flecha, dónde estaba el objeto en cada época y hacia dónde se mueve.", "The marker is the object; the dashed square, the cutout the Explorer and the Prism use; the circles and the arrow, where the object was in each epoch and where it is heading.")}</li>
          <li>{tr("Debajo del mapa: «AllWISE 2010» y «2MASS ~2000» cambian el fondo a fotos antiguas, y «Parpadear» las alterna con SPHEREx para ver qué se movió. «Mostrar catálogos» marca Gaia (círculos), CatWISE (triángulos) y SIMBAD (cuadrados).", "Below the map: “AllWISE 2010” and “2MASS ~2000” switch the background to older photos, and “Blink” alternates them with SPHEREx to see what moved. “Show catalogs” marks Gaia (circles), CatWISE (triangles) and SIMBAD (squares).")}</li>
          <li>{tr("«⤢ Encuadrar el recorte» vuelve al objeto y a su tamaño.", "“⤢ Frame the cutout” goes back to the object at its size.")}</li>
        </ul>
      </details>
      <AladinView
        ra={estado.ra}
        dec={estado.dec}
        fovDeg={fovDeg}
        plano={planoDeBanda(estado.band)}
        onReady={(a) => (aladin.current = a)}
        size={estado.size}
        epoca={EPOCA_HOY}
        onSelect={(ra, dec) => irA({ ra: Number(ra.toFixed(6)), dec: Number(dec.toFixed(6)) })}
        onBanda={(b) => set({ band: String(b) })}
      />
      {/* Espectro del punto o del candidato de CatWISE que se pidió («modo descubrimiento»). */}
      <PanelEspectro />
    </>
  );

  return (
    <section className="visor">
      {/* Primero, qué es SPHEREx (introducción). «Cómo leer el Explorador» va plegado a la derecha,
          justo encima del Explorador, donde se usa. */}
      {!enMision && (
        <>
        <div className="tarjeta intro-spherex">
          <strong>{tr("¿Qué es SPHEREx?", "What is SPHEREx?")}</strong>
          <p>{t.queEsSpherex}</p>
          <p>
            {tr(
              "Aquí puedes explorar el cielo, detectar lo que cambia en él, ver el espectro de cada objeto y hacer tu propia ciencia con datos reales.",
              "Here you can explore the sky, detect what changes in it, see the spectrum of each object and do your own science with real data.",
            )}
          </p>
        </div>
        </>
      )}
      <div className="barra" data-tour="busqueda">
        {/* Izquierda: A.R., Dec, dimensión y banda, con la equivalencia «= 08h 55m…» justo debajo. */}
        <div className="barra-filtros">
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
          {tr("Banda del mapa", "Map band")}
          {/* Sin «Todas»: mostraba solo el canal central de D2. El mapa muestra un canal a la vez. */}
          <select value={estado.band} onChange={(e) => set({ band: e.target.value })}>
            {[1, 2, 3, 4, 5, 6].map((b) => (
              <option key={b} value={String(b)}>
                D{b}
              </option>
            ))}
          </select>
        </label>
        </div>
        {/* A la derecha de los filtros: saltar a una zona al azar y qué hacer si aparece algo. */}
        <div className="barra-azar">
          <Deteccion punto={punto} epoca={EPOCA_SPHEREX} />
          <button
            type="button"
            onClick={() => {
              const p = puntoAlAzar(20);
              irA({ ra: Number(p.ra.toFixed(6)), dec: Number(p.dec.toFixed(6)) });
            }}
            title={tr(
              "Lejos del plano de la Vía Láctea (más de 20° de latitud galáctica), donde el cielo está menos lleno",
              "Away from the Milky Way plane (more than 20° of galactic latitude), where the sky is less crowded",
            )}
          >
            {tr("Explorar una zona al azar", "Explore a random area")}
          </button>
          <p className="barra-pista">
            <strong>{tr("¿Encontraste algo?", "Found something?")}</strong>{" "}
            {tr(
              "Míralo con «Ver en WiseView ↗», sobre el mapa (las imágenes de WISE y NEOWISE de 2010 a 2024, en el mismo punto) y, si se sigue moviendo, súmate a",
              "Check it with “View in WiseView ↗” above the map (WISE and NEOWISE images from 2010 to 2024, same spot) and, if it keeps moving, join",
            )}{" "}
            <a href="https://www.backyardworlds.org" target="_blank" rel="noopener noreferrer">
              Backyard Worlds
            </a>
            {tr(", donde voluntarios buscan enanas marrones y el posible Planeta 9.", ", where volunteers hunt for brown dwarfs and the possible Planet 9.")}
          </p>
        </div>
      </div>

      <div className="objetos" role="group" aria-label={tr("Objetos de prueba", "Test objects")} data-tour="objetos">
        {CAMPOS.map((c) => (
          <button
            key={c.id}
            className={campoActivo?.id === c.id ? "activo" : undefined}
            aria-pressed={campoActivo?.id === c.id}
            onClick={() => set(posicionActual(c))}
            title={`${AYUDA_OBJETO[c.id] ? tr(...AYUDA_OBJETO[c.id]) : c.tipo} ${tr("(El mapa se centra donde está hoy.)", "(The map centers on where it is today.)")}`}
          >
            {nombreDe(c, idioma)}
          </button>
        ))}
      </div>


      {enMision ? (
        <div className="cuerpo cuerpo-mision">
          <div className="principal">{mapa}</div>
          <aside className="lateral lateral-mision">
            <MisionPanel estado={estado} set={set} />
          </aside>
        </div>
      ) : (
        <>
          {/* Mapa a la izquierda y Explorador a la derecha (con su panel de bandas y controles al costado):
              la barra de filtros de arriba mueve a los dos. */}
          <div className="dupla">
            <div className="dupla-col dupla-mapa">{mapa}</div>
            <div className="dupla-col">
              {/* Cómo leer el Explorador: plegable y solo a la derecha, justo encima del Explorador. Habla del
                  Explorador SPHEREx, no del botón «Parpadear» del mapa (que alterna SPHEREx con AllWISE/2MASS). */}
              <details className="tarjeta explorador-ayuda">
                <summary>ⓘ {tr("Cómo leer el Explorador", "How to read the Explorer")}</summary>
              <p>{tr("En el Explorador SPHEREx, cada cuadro es una visita, de la más antigua a la más reciente. En «Resta vs t₀», lo que apareció desde la primera fecha sale en rojo y lo que se fue, en azul: una pareja roja y azul pegada es algo que se movió. «Resta A − B» hace lo mismo entre dos fechas que eliges tú. Ojo: en «Color» el rojo es al revés: la primera fecha va en rojo y la actual en cian, y lo que no cambia se ve blanco.", "In the SPHEREx Explorer, each frame is a visit, from oldest to newest. In “Subtract vs t₀”, what appeared since the first date shows in red and what left in blue: a touching red and blue pair is something that moved. “Subtract A − B” does the same between two dates you choose. Careful: in “Color” red is the other way around: the first date is red and the current one cyan, and what doesn't change looks white.")}</p>
              {/* Detalle de «Resta vs t₀» y «Color» (render.ts de Bryan), cerrado hasta que se pide. */}
              <details className="mas-info">
                <summary>{tr("Más información: Resta y Color", "More info: Subtract and Color")}</summary>
                <h4>{tr("Resta vs t₀", "Subtract vs t₀")}</h4>
                <p>{tr("Para cada píxel calcula ahora − t₀:", "For each pixel it computes now − t₀:")}</p>
                <ul>
                  <li>{tr("Gris = sin cambio. Las estrellas que no se mueven desaparecen en el gris.", "Gray = no change. Stars that don't move disappear into the gray.")}</li>
                  <li>{tr("Rojo = más brillante ahora (algo apareció).", "Red = brighter now (something appeared).")}</li>
                  <li>{tr("Azul = más brillante en t₀ (algo se fue).", "Blue = brighter in t₀ (something left).")}</li>
                </ul>
                <p>{tr("Solo ves lo que cambió. Una estrella que se mueve aparece como una pareja roja y azul, y todo lo demás desaparece. Es el modo más sensible para movimientos pequeños, pero también hace más visible el ruido (los puntitos de color tenues).", "All you see is what changed. A moving star shows up as a red and blue pair, and everything else vanishes. It's the most sensitive mode for small movements, but it also makes noise more visible (the faint colored speckles).")}</p>
                <h4>{tr("Color", "Color")}</h4>
                <p>{tr("Superpone las dos fotos, cada una de un color:", "It overlays the two photos, each in a different color:")}</p>
                <ul>
                  <li>{tr("la foto de t₀ en rojo,", "the t₀ photo in red,")}</li>
                  <li>{tr("la foto actual en cian (verde + azul).", "the current photo in cyan (green + blue).")}</li>
                </ul>
                <p>{tr("Al sumarse:", "When the two add up:")}</p>
                <ul>
                  <li>{tr("Blanco = está en las dos (estrella quieta). Las estrellas no desaparecen.", "White = it's in both (still star). Stars don't disappear.")}</li>
                  <li>{tr("Rojo = solo en t₀ (estaba antes).", "Red = only in t₀ (it was there before).")}</li>
                  <li>{tr("Cian = solo ahora.", "Cyan = only now.")}</li>
                </ul>
              </details>
              </details>
              <Explorador datos={datos} />
            </div>
          </div>
          <Prisma datos={datos} ra={estado.ra} dec={estado.dec} />
          <Comentarios ra={estado.ra} dec={estado.dec} />
        </>
      )}

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
