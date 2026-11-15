/**
 * Ficha del astro (Prisma): tipo probable según la forma del espectro (clasificar.ts), con su motivo y la
 * confianza. Es orientativa: reglas simples sobre 0,75–5 µm, no una clasificación espectral.
 */
import { usePrisma } from "../content/prisma";
import { useIdioma } from "../state/idioma";
import { clasificar } from "./clasificar";
import type { PuntoVista } from "./pasadas";

export default function FichaAstro({ puntos, nombre }: { puntos: PuntoVista[]; nombre: string | null }) {
  const prisma = usePrisma();
  const { idioma } = useIdioma();
  const t = prisma.ficha;
  // Las medidas sospechosas (luz de otra fuente en la apertura) no cuentan.
  const c = clasificar(puntos.filter((p) => !p.sospechoso && !p.bordeSat), idioma === "en" ? "en" : "es");
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
