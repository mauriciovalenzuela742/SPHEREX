/**
 * Ficha del astro (Prisma): tipo probable según la forma del espectro (clasificar.ts), con su motivo y la
 * confianza. Es orientativa: reglas simples sobre 0,75–5 µm, no una clasificación espectral.
 */
import { usePrisma } from "../content/prisma";
import { useIdioma } from "../state/idioma";
import { clasificar } from "./clasificar";
import { incompleta, type Pasada } from "./pasadas";

export default function FichaAstro({ pasadas, nombre }: { pasadas: Pasada[]; nombre: string | null }) {
  const prisma = usePrisma();
  const { idioma } = useIdioma();
  const t = prisma.ficha;
  const puntos = pasadas.flatMap((pa) => pa.puntos);
  // Una pasada incompleta (< 90 de 102 canales) no se clasifica sola.
  const sola = pasadas.length === 1 && incompleta(pasadas[0]) ? pasadas[0] : null;
  // Las medidas sospechosas (luz de otra fuente) y las de bandas al borde de la saturación no cuentan.
  const c = sola
    ? { tipo: "indeterminado" as const, confianza: "baja" as const, motivo: t.incompleta(sola.canales ?? 0) }
    : clasificar(puntos.filter((p) => !p.sospechoso && !p.bordeSat), idioma === "en" ? "en" : "es");
  return (
    <div className={`ficha ficha-${c.tipo}`}>
      <h4>{nombre ? `${t.titulo} · ${nombre}` : t.titulo}</h4>
      <p className="ficha-tipo">
        {c.tipo === "indeterminado" ? t.indeterminado : <>{t.seParece} <strong>{t.tipos[c.tipo]}</strong></>}
        {c.tipo !== "indeterminado" && <span className="ficha-conf">{t.confianza[c.confianza]}</span>}
      </p>
      <p className="ficha-motivo">
        {c.tipo === "indeterminado" ? "" : `${t.porque} `}
        {c.motivo}
      </p>
      <p className="h-nota">{t.aviso}</p>
    </div>
  );
}
