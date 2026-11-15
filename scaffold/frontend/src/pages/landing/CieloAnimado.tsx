/**
 * Cielo de la portada (V1, Antonia). Un <canvas> fijo detrás de todo, decorativo (sin clics ni lector de pantalla).
 *
 * - Estrellas creíbles: tamaños con ley de potencia (muchas tenues, pocas brillantes), tonos levemente distintos
 *   (blanco azulado / blanco / amarillento) y centelleo suave solo en algunas. Tres capas con un paralaje mínimo
 *   al mover el mouse (solo con puntero fino, o sea escritorio).
 * - Cometas escasos: uno cada 7–14 s, cruzan en 1–1,5 s con una cola que se desvanece.
 * - Dos objetos lentos que dejan sus posiciones anteriores cada vez más tenues, como las épocas del Explorador.
 * - Con «reducir movimiento»: cielo quieto, sin cometas ni objetos. Sin animar cuando la pestaña no se ve.
 */
import { useEffect, useRef } from "react";

type Estrella = { x: number; y: number; r: number; brillo: number; tono: string; capa: number; titila: boolean; fase: number; vel: number };
type Cometa = { x: number; y: number; vx: number; vy: number; vida: number; dura: number };
type Viajero = { x: number; y: number; vx: number; vy: number; huella: { x: number; y: number }[]; reloj: number };

const TONOS = ["205,220,255", "255,255,255", "255,255,255", "255,244,225"];
const PARALAJE = [3, 7, 12]; // px de desplazamiento máximo por capa
const CADA_EPOCA = 1.1; // s entre «fotos» de cada objeto lento
const EPOCAS = 5;

const azar = (a: number, b: number) => a + Math.random() * (b - a);

export default function CieloAnimado() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conMouse = window.matchMedia("(pointer: fine)").matches;
    let W = 0, H = 0;
    let estrellas: Estrella[] = [];
    let viajeros: Viajero[] = [];
    let cometa: Cometa | null = null;
    let proximo = azar(3, 7); // el primer cometa llega antes
    const mouse = { x: 0, y: 0, ox: 0, oy: 0 }; // destino (-1..1) y valor suavizado

    const nuevoViajero = (dentro: boolean): Viajero => {
      const izq = Math.random() < 0.5;
      const v = azar(8, 14);
      const ang = azar(-0.35, 0.35);
      return {
        x: dentro ? azar(0, W) : izq ? -10 : W + 10,
        y: azar(H * 0.08, H * 0.7),
        vx: Math.cos(ang) * v * (izq ? 1 : -1),
        vy: Math.sin(ang) * v,
        huella: [],
        reloj: 0,
      };
    };

    const armar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((W * H) / 3800);
      estrellas = Array.from({ length: n }, () => {
        // Ley de potencia: u^4 deja casi todas chicas y unas pocas grandes.
        const u = Math.random();
        const r = 0.35 + 1.5 * u ** 4;
        return {
          x: azar(0, W),
          y: azar(0, H),
          r,
          brillo: Math.min(1, 0.22 + 0.55 * u ** 2 + azar(0, 0.15)),
          tono: TONOS[Math.floor(Math.random() * TONOS.length)],
          capa: r > 1.1 ? 2 : r > 0.6 ? 1 : 0,
          titila: Math.random() < 0.12,
          fase: azar(0, Math.PI * 2),
          vel: azar(0.5, 1.3),
        };
      });
      viajeros = quieto ? [] : Array.from({ length: W < 700 ? 1 : 2 }, () => nuevoViajero(true));
    };

    const dibujar = (t: number, dt: number) => {
      mouse.ox += (mouse.x - mouse.ox) * Math.min(1, dt * 3);
      mouse.oy += (mouse.y - mouse.oy) * Math.min(1, dt * 3);
      ctx.clearRect(0, 0, W, H);

      for (const e of estrellas) {
        const a = e.titila && !quieto ? e.brillo * (0.75 + 0.25 * Math.sin(t * e.vel + e.fase)) : e.brillo;
        const dx = -mouse.ox * PARALAJE[e.capa];
        const dy = -mouse.oy * PARALAJE[e.capa];
        ctx.fillStyle = `rgba(${e.tono},${a})`;
        ctx.beginPath();
        ctx.arc(e.x + dx, e.y + dy, e.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (quieto) return;

      // Objetos lentos con sus posiciones anteriores.
      for (let i = 0; i < viajeros.length; i++) {
        const v = viajeros[i];
        v.x += v.vx * dt;
        v.y += v.vy * dt;
        v.reloj += dt;
        if (v.reloj >= CADA_EPOCA) {
          v.reloj = 0;
          v.huella.push({ x: v.x, y: v.y });
          if (v.huella.length > EPOCAS) v.huella.shift();
        }
        v.huella.forEach((p, k) => {
          ctx.fillStyle = `rgba(255,176,0,${0.06 + (0.22 * (k + 1)) / EPOCAS})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = "rgba(255,196,80,0.9)";
        ctx.beginPath();
        ctx.arc(v.x, v.y, 1.9, 0, Math.PI * 2);
        ctx.fill();
        if (v.x < -20 || v.x > W + 20 || v.y < -20 || v.y > H + 20) viajeros[i] = nuevoViajero(false);
      }

      // Cometa ocasional.
      proximo -= dt;
      if (!cometa && proximo <= 0) {
        const dura = azar(1, 1.5);
        const largo = azar(0.35, 0.6) * Math.hypot(W, H);
        const ang = azar(0.2, 0.55) * (Math.random() < 0.5 ? 1 : -1);
        const dir = ang > 0 ? 1 : -1;
        cometa = {
          x: dir > 0 ? azar(0, W * 0.6) : azar(W * 0.4, W),
          y: azar(0, H * 0.45),
          vx: (Math.cos(Math.abs(ang)) * largo * dir) / dura,
          vy: (Math.sin(Math.abs(ang)) * largo) / dura,
          vida: 0,
          dura,
        };
        proximo = azar(7, 14);
      }
      if (cometa) {
        cometa.vida += dt;
        cometa.x += cometa.vx * dt;
        cometa.y += cometa.vy * dt;
        const f = cometa.vida / cometa.dura;
        const a = f < 0.15 ? f / 0.15 : Math.max(0, 1 - (f - 0.15) / 0.85); // aparece y se apaga
        const cx = cometa.x - cometa.vx * 0.12;
        const cy = cometa.y - cometa.vy * 0.12;
        const cola = ctx.createLinearGradient(cometa.x, cometa.y, cx, cy);
        cola.addColorStop(0, `rgba(235,242,255,${0.85 * a})`);
        cola.addColorStop(1, "rgba(235,242,255,0)");
        ctx.strokeStyle = cola;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cometa.x, cometa.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.arc(cometa.x, cometa.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (f >= 1) cometa = null;
      }
    };

    armar();
    const alRedimensionar = () => {
      armar();
      if (quieto) dibujar(0, 0);
    };
    const alMover = (ev: PointerEvent) => {
      mouse.x = (ev.clientX / W) * 2 - 1;
      mouse.y = (ev.clientY / H) * 2 - 1;
    };
    window.addEventListener("resize", alRedimensionar);
    if (conMouse && !quieto) window.addEventListener("pointermove", alMover);

    let cuadro = 0;
    let antes = performance.now();
    const paso = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - antes) / 1000); // tras una pestaña oculta, sin saltos
      antes = ahora;
      dibujar(ahora / 1000, dt);
      cuadro = requestAnimationFrame(paso);
    };
    if (quieto) dibujar(0, 0);
    else cuadro = requestAnimationFrame(paso);

    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("resize", alRedimensionar);
      window.removeEventListener("pointermove", alMover);
    };
  }, []);

  return <canvas ref={lienzo} className="cielo-animado" aria-hidden="true" />;
}
