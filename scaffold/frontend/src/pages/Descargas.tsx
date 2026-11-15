/**
 * Descargas: instaladores de escritorio, APK de Android y cómo instalar la web en iPhone/iPad.
 * Los enlaces salen del último release del repositorio oficial; si no responde, del repositorio de respaldo
 * (copia pública de los mismos archivos); si tampoco, se enlaza la página de releases del oficial.
 * Los instaladores no están firmados (decisión del equipo para el evento): hay una nota, no un bloqueo.
 */
import { useEffect, useState, type ReactNode } from "react";
import { useIdioma } from "../state/idioma";
import "./descargas.css";

const OFICIAL = "mauriciovalenzuela742/SPHEREX";
const RESPALDO = "vladimiracunadev-create/spherex-releases";
const SITIO = "https://spherex-planet-x-tau.vercel.app";

type Activo = { name: string; size: number; browser_download_url: string };
type Fuente = { repo: string; tag: string; url: string; activos: Activo[] };
type Carga = { estado: "cargando" } | { estado: "listo"; fuente: Fuente; respaldo: boolean } | { estado: "sin-api" };

type Plataforma = "windows" | "macos" | "linux" | "android" | "ios";

/** Qué dispositivo es el visitante, para mostrar primero lo que le sirve. */
function detectar(): Plataforma | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows/.test(ua)) return "windows";
  if (/Mac/.test(ua)) return "macos";
  if (/Linux|X11/.test(ua)) return "linux";
  return null;
}

async function ultimo(repo: string): Promise<Fuente | null> {
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) return null;
    const j = await r.json();
    const activos: Activo[] = (j.assets ?? []).map((a: Activo) => ({
      name: a.name,
      size: a.size,
      browser_download_url: a.browser_download_url,
    }));
    return activos.length ? { repo, tag: j.tag_name, url: j.html_url, activos } : null;
  } catch {
    return null;
  }
}

const mb = (b: number) => `${(b / 1048576).toFixed(b >= 10485760 ? 0 : 1)} MB`;

const Icono = ({ children }: { children: ReactNode }) => (
  <svg className="dl-icono" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ICONOS: Record<Plataforma, ReactNode> = {
  windows: <Icono><path d="M3 5.5l7-1v6.5H3zM11 4.4l10-1.4v8H11zM3 12.5h7v6.5l-7-1zM11 12.5h10v8l-10-1.4z" /></Icono>,
  macos: <Icono><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></Icono>,
  linux: <Icono><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M12 15h5" /></Icono>,
  android: <Icono><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></Icono>,
  ios: <Icono><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M10.5 5h3M12 17.5v.01" /></Icono>,
};
const IconoDescarga = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
  </svg>
);

export default function Descargas() {
  const { tr, idioma } = useIdioma();
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" });
  const [mio] = useState<Plataforma | null>(detectar);
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;

  useEffect(() => {
    let vivo = true;
    (async () => {
      const oficial = await ultimo(OFICIAL);
      if (!vivo) return;
      if (oficial) return setCarga({ estado: "listo", fuente: oficial, respaldo: false });
      const copia = await ultimo(RESPALDO);
      if (!vivo) return;
      setCarga(copia ? { estado: "listo", fuente: copia, respaldo: true } : { estado: "sin-api" });
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const activos = carga.estado === "listo" ? carga.fuente.activos : [];
  const buscar = (re: RegExp) => activos.find((a) => re.test(a.name));
  const paginaReleases = carga.estado === "listo" ? carga.fuente.url : `https://github.com/${OFICIAL}/releases/latest`;

  type Archivo = { etiqueta: string; activo?: Activo };
  const archivos: Record<Exclude<Plataforma, "ios">, Archivo[]> = {
    windows: [
      { etiqueta: tr("Instalador .exe", ".exe installer"), activo: buscar(/setup\.exe$/) },
      { etiqueta: ".msi", activo: buscar(/\.msi$/) },
    ],
    macos: [{ etiqueta: tr(".dmg (Intel y Apple Silicon)", ".dmg (Intel and Apple Silicon)"), activo: buscar(/\.dmg$/) }],
    linux: [
      { etiqueta: ".AppImage", activo: buscar(/\.AppImage$/) },
      { etiqueta: ".deb", activo: buscar(/\.deb$/) },
    ],
    android: [{ etiqueta: ".apk", activo: buscar(/\.apk$/) }],
  };

  const fichas: { id: Plataforma; nombre: string; pasos: string[] }[] = [
    {
      id: "windows",
      nombre: "Windows",
      pasos: [
        tr("Descarga el instalador y ábrelo.", "Download the installer and open it."),
        tr("Si Windows avisa («Windows protegió su PC»), toca «Más información» y luego «Ejecutar de todos modos».", "If Windows warns you («Windows protected your PC»), click «More info» and then «Run anyway»."),
      ],
    },
    {
      id: "macos",
      nombre: "macOS",
      pasos: [
        tr("Abre el .dmg y arrastra la app a Aplicaciones.", "Open the .dmg and drag the app to Applications."),
        tr("La primera vez, clic derecho sobre la app → «Abrir».", "The first time, right-click the app → «Open»."),
      ],
    },
    {
      id: "linux",
      nombre: "Linux",
      pasos: [
        tr("AppImage: dale permiso de ejecución (clic derecho → Propiedades, o chmod +x) y ábrelo.", "AppImage: make it executable (right-click → Properties, or chmod +x) and open it."),
        tr(".deb: instálalo con tu gestor de paquetes (en Debian/Ubuntu: sudo apt install ./archivo.deb).", ".deb: install it with your package manager (on Debian/Ubuntu: sudo apt install ./file.deb)."),
      ],
    },
    {
      id: "android",
      nombre: "Android",
      pasos: [
        tr("Descarga el .apk desde tu teléfono.", "Download the .apk on your phone."),
        tr("Permite «instalar apps desconocidas» para tu navegador cuando Android lo pida, y ábrelo.", "Allow «install unknown apps» for your browser when Android asks, then open it."),
      ],
    },
    {
      id: "ios",
      nombre: "iPhone / iPad",
      pasos: [
        tr("No hay app nativa (Apple exige una cuenta de pago para publicarla). Se instala la versión web, gratis.", "There is no native app (Apple requires a paid account to publish one). Install the web version instead, it is free."),
        tr("Abre el sitio en Safari.", "Open the site in Safari."),
        tr("Toca Compartir (el cuadrado con la flecha) y elige «Añadir a pantalla de inicio».", "Tap Share (the square with the arrow) and choose «Add to Home Screen»."),
      ],
    },
  ];
  const orden = mio ? [...fichas.filter((f) => f.id === mio), ...fichas.filter((f) => f.id !== mio)] : fichas;
  const sumas = buscar(/^SHA256SUMS/);

  return (
    <section className="descargas">
      <h1>{tr("Descargas", "Downloads")}</h1>
      <p className="lead">
        {tr("Instala AstroTrack en tu computador o teléfono. Es la misma aplicación que ves aquí: necesita internet.", "Install AstroTrack on your computer or phone. It is the same app you see here: it needs internet.")}
      </p>
      {standalone && <p className="nota">{tr("Ya estás usando la app instalada.", "You are already using the installed app.")}</p>}

      <p className="nota dl-version" role="status">
        {carga.estado === "cargando" && tr("Buscando la última versión…", "Looking for the latest version…")}
        {carga.estado === "listo" && (
          <>
            {tr("Última versión", "Latest version")}: <b>{carga.fuente.tag}</b>
            {carga.respaldo && " · " + tr("desde el repositorio de respaldo", "from the backup repository")}
          </>
        )}
        {carga.estado === "sin-api" &&
          tr("No pudimos consultar las versiones ahora. Usa el enlace a la página de releases.", "We could not check the versions right now. Use the releases page link.")}
      </p>

      <div className="dl-lista">
        {orden.map((f) => (
          <article key={f.id} className={`dl-ficha${f.id === mio ? " mio" : ""}`}>
            <div className="dl-cab">
              {ICONOS[f.id]}
              <h2>{f.nombre}</h2>
              {f.id === mio && <span className="dl-etiqueta">{tr("Tu dispositivo", "Your device")}</span>}
            </div>

            {f.id === "ios" ? (
              <a className="dl-boton primario" href={SITIO} target="_blank" rel="noopener noreferrer">
                {tr("Abrir la versión web", "Open the web version")}
              </a>
            ) : (
              <div className="dl-botones">
                {archivos[f.id].map((a) =>
                  a.activo ? (
                    <a key={a.etiqueta} className={`dl-boton${f.id === mio ? " primario" : ""}`} href={a.activo.browser_download_url}>
                      <IconoDescarga /> {a.etiqueta} <span className="dl-peso">{mb(a.activo.size)}</span>
                    </a>
                  ) : (
                    <a key={a.etiqueta} className="dl-boton" href={paginaReleases} target="_blank" rel="noopener noreferrer">
                      <IconoDescarga /> {a.etiqueta}
                    </a>
                  ),
                )}
              </div>
            )}

            <ol className="dl-pasos">
              {f.pasos.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <p className="nota dl-aviso">
        {tr(
          "Los instaladores de escritorio y el APK no están firmados y no se han probado en todos los equipos; por eso Windows y macOS muestran un aviso la primera vez.",
          "The desktop installers and the APK are unsigned and have not been tested on every device, so Windows and macOS show a warning the first time.",
        )}
      </p>
      <p className="nota">
        <a href={paginaReleases} target="_blank" rel="noopener noreferrer">{tr("Todas las versiones", "All versions")}</a>
        {sumas && (
          <>
            {" · "}
            <a href={sumas.browser_download_url}>{tr("Sumas de verificación (SHA-256)", "Checksums (SHA-256)")}</a>
          </>
        )}
        {" · "}
        <a href={`https://github.com/${OFICIAL}`} target="_blank" rel="noopener noreferrer">{idioma === "es" ? "Repositorio" : "Repository"}</a>
      </p>
    </section>
  );
}
