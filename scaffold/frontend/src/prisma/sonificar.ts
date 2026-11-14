/**
 * Sonificación del espectro (Prisma): cada punto medido es una nota, de corto a largo λ.
 * Tono por λ (agudo = azul, grave = rojo, escala logarítmica), volumen por brillo. Web Audio, sin dependencias.
 * Nunca suena solo: solo con el botón. Devuelve una función para detener.
 */
import type { PuntoEspectral } from "./fotometria";

const NOTA_S = 0.16;

export function sonificar(puntos: PuntoEspectral[], alTerminar: () => void): (() => void) | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const usables = puntos.filter((p) => p.detectado && p.mJy > 0);
  if (!usables.length) return null;

  const ctx = new Ctx();
  const logs = usables.map((p) => Math.log10(p.mJy));
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  const t0 = ctx.currentTime + 0.05;

  usables.forEach((p, i) => {
    // 0,75 µm → 880 Hz, 5 µm → 110 Hz (tres octavas), lineal en log λ.
    const f = Math.log(p.lambda / 0.75) / Math.log(5 / 0.75);
    const hz = 880 * Math.pow(110 / 880, Math.min(1, Math.max(0, f)));
    const vol = 0.05 + 0.3 * (hi > lo ? (Math.log10(p.mJy) - lo) / (hi - lo) : 0.5);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz;
    const ti = t0 + i * NOTA_S;
    g.gain.setValueAtTime(0, ti);
    g.gain.linearRampToValueAtTime(vol, ti + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ti + NOTA_S * 0.95);
    osc.connect(g).connect(ctx.destination);
    osc.start(ti);
    osc.stop(ti + NOTA_S);
  });

  const fin = window.setTimeout(() => {
    void ctx.close();
    alTerminar();
  }, (usables.length * NOTA_S + 0.2) * 1000);

  return () => {
    window.clearTimeout(fin);
    void ctx.close();
    alTerminar();
  };
}
