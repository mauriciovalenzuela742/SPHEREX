/* =====================================================================
   Animaciones de la presentación del EDA de SPHEREx (engine/anim.js, window.K).

   Las imágenes son recortes reales de IRSA convertidos a PNG por
   figures/make_figures.py. Los valores de abajo (fechas, λ, posiciones
   predichas en fracción de imagen) se copiaron de la salida de ese script;
   las mediciones, de eda/resultados/centroides.json.
   Lienzo: 1920×1080; el título ocupa hasta y ≈ 300 y la fuente empieza en y ≈ 960.
   ===================================================================== */
(function () {
  "use strict";
  const { svg, text, attr } = K;
  const V = (v) => `var(--${v})`;
  const A = (window.animations = window.animations || {});

  // ---------------------------------------------------------------- datos (make_figures.py)
  const EPS = [  // eps Ind B, D5, a λ igualada; zx, zy: posición predicha en el recorte ampliado (18×18 px)
    { anio: "2025,31", lam: "3,862", fx: 0.5051, fy: 0.4968, zx: 0.5164, zy: 0.4897 },
    { anio: "2025,43", lam: "3,862", fx: 0.5038, fy: 0.4976, zx: 0.5122, zy: 0.4923 },
    { anio: "2025,77", lam: "3,864", fx: 0.5000, fy: 0.5000, zx: 0.5000, zy: 0.5000 },
    { anio: "2026,31", lam: "3,829", fx: 0.4940, fy: 0.5037, zx: 0.4807, zy: 0.5119 },
    { anio: "2026,74", lam: "3,865", fx: 0.4892, fy: 0.5067, zx: 0.4652, zy: 0.5216 },
  ];
  const WISE = [
    { anio: "2025,34", lam: "4,145", fx: 0.4873, fy: 0.5010 },
    { anio: "2025,85", lam: "4,153", fx: 0.4989, fy: 0.5001 },
    { anio: "2025,95", lam: "4,153", fx: 0.5011, fy: 0.4999 },
    { anio: "2026,33", lam: "4,180", fx: 0.5099, fy: 0.4992 },
  ];

  const label = (p, x, y, s, size = 26, color = "ink-soft", anchor = "start", weight = 400) =>
    text(p, x, y, s, { "text-anchor": anchor, style: `fill:${V(color)};font-size:${size}px;font-weight:${weight}` });
  const imagen = (p, x, y, w, h, href) =>
    svg("image", { x, y, width: w, height: h, href, preserveAspectRatio: "none", style: "image-rendering:pixelated" }, p);
  const marco = (p, x, y, w, h) =>
    svg("rect", { x, y, width: w, height: h, fill: "none", style: `stroke:${V("line")};stroke-width:2` }, p);
  const circulo = (p, r = 26, color = "accent") =>
    svg("circle", { r, style: `fill:none;stroke:${V(color)};stroke-width:3` }, p);

  // ================================================================ portada: eps Ind B real, en bucle
  A.portada = K.scene({
    states: [{}], loop: true, tFinal: 0,
    mount(s) {
      const g = { x: 1180, y: 330, w: 600 };
      g.imgs = EPS.map((_, i) => imagen(s, g.x, g.y, g.w, g.w, `figures/epsind_${i}.png`));
      marco(s, g.x, g.y, g.w, g.w);
      g.c = circulo(s, 30);
      g.lbl = label(s, g.x + g.w, g.y + g.w + 44, "", 26, "ink-soft", "end");
      label(s, g.x, g.y + g.w + 44, "Epsilon Indi B · SPHEREx D5", 26, "accent");
      return g;
    },
    draw(g, st, n, time) {
      const k = Math.floor(time / 0.8) % EPS.length;
      g.imgs.forEach((im, i) => (im.style.opacity = i === k ? 1 : 0));
      attr(g.c, { cx: g.x + EPS[k].fx * g.w, cy: g.y + EPS[k].fy * g.w });
      g.lbl.textContent = `${EPS[k].anio} · ${EPS[k].lam} µm`;
    },
  });

  // ================================================================ idea: parpadeo y resta (esquema)
  const ESTRELLAS = [[0.18, 0.22, 9], [0.72, 0.15, 6], [0.4, 0.42, 11], [0.85, 0.55, 7], [0.25, 0.75, 8],
    [0.62, 0.82, 10], [0.12, 0.5, 5], [0.9, 0.88, 6]];
  const MOVIL = { a: [0.55, 0.5], b: [0.6, 0.43] };
  A.idea = K.scene({
    states: [{ resta: 0 }, { resta: 1 }], loop: true, duration: 900, tFinal: 0.3,
    mount(s) {
      const g = { L: { x: 330, y: 330, w: 560 }, R: { x: 1030, y: 330, w: 560 } };
      const { L, R } = g;
      svg("rect", { x: L.x, y: L.y, width: L.w, height: L.w, fill: "#03070f" }, s);
      marco(s, L.x, L.y, L.w, L.w);
      for (const [x, y, r] of ESTRELLAS) svg("circle", { cx: L.x + x * L.w, cy: L.y + y * L.w, r, fill: "#eef2f7" }, s);
      g.movil = svg("circle", { r: 9, fill: "#eef2f7" }, s);
      g.fecha = label(s, L.x, L.y + L.w + 46, "", 28, "ink");
      label(s, L.x + L.w, L.y + L.w + 46, "parpadeo", 28, "accent", "end");
      g.der = svg("g", {}, s);
      svg("rect", { x: R.x, y: R.y, width: R.w, height: R.w, fill: "#f2f4f7" }, g.der);
      svg("circle", { cx: R.x + MOVIL.a[0] * R.w, cy: R.y + MOVIL.a[1] * R.w, r: 12, fill: "#2f6db3" }, g.der);
      svg("circle", { cx: R.x + MOVIL.b[0] * R.w, cy: R.y + MOVIL.b[1] * R.w, r: 12, fill: "#c0392b" }, g.der);
      label(g.der, R.x, R.y + R.w + 46, "resta: después − antes", 28, "ink");
      label(g.der, R.x + MOVIL.b[0] * R.w + 24, R.y + MOVIL.b[1] * R.w - 18, "ahora", 24, "ink", "start").style.fill = "#c0392b";
      label(g.der, R.x + MOVIL.a[0] * R.w + 24, R.y + MOVIL.a[1] * R.w + 40, "antes", 24, "ink", "start").style.fill = "#2f6db3";
      return g;
    },
    draw(g, st, n, time) {
      const b = Math.floor(time / 0.7) % 2 === 1;
      const p = b ? MOVIL.b : MOVIL.a;
      attr(g.movil, { cx: g.L.x + p[0] * g.L.w, cy: g.L.y + p[1] * g.L.w });
      g.fecha.textContent = b ? "foto 2 · 2026" : "foto 1 · 2025";
      g.der.style.opacity = st.resta;
    },
  });

  // ================================================================ lvf: el color cambia a lo largo del detector
  const LAM0 = 3.82, LAM1 = 4.44, NFR = 12;
  // Franjas de color en una escala secuencial (violeta → ámbar): el infrarrojo no tiene color visible.
  const colorLam = (f) => `rgb(${Math.round(59 + f * 186)},${Math.round(42 + f * 124)},${Math.round(107 - f * 72)})`;
  const OFFS = [0.12, 0.31, 0.5, 0.69, 0.88];                   // fracción del detector donde cae la estrella
  const espectro = (l) => 0.55 + 0.3 * Math.exp(-Math.pow((l - 4.05) / 0.12, 2)) - 0.2 * Math.exp(-Math.pow((l - 4.3) / 0.05, 2));
  const fmt = (v, d = 2) => v.toFixed(d).replace(".", ",");
  A.lvf = K.scene({
    states: [{ off: 0.12, k: 0 }, ...OFFS.map((o, i) => ({ off: o, k: i + 1 }))],
    duration: 1300,
    mount(s) {
      // El detector queda quieto en la pantalla; cada nuevo apuntado deja la estrella en otra franja.
      const g = { D: { x: 300, y: 340, w: 520, h: 560 } };
      const { D } = g;
      for (let i = 0; i < NFR; i++) {
        svg("rect", { x: D.x, y: D.y + (i / NFR) * D.h, width: D.w, height: D.h / NFR + 1, fill: colorLam(i / (NFR - 1)) }, s);
      }
      svg("rect", { x: D.x, y: D.y, width: D.w, height: D.h, fill: "none", style: `stroke:${V("ink-soft")};stroke-width:2` }, s);
      label(s, D.x + D.w + 16, D.y + 30, `${fmt(LAM0)} µm`, 24, "ink-soft");
      label(s, D.x + D.w + 16, D.y + D.h - 10, `${fmt(LAM1)} µm`, 24, "ink-soft");
      label(s, D.x, D.y + D.h + 44, "detector: cada franja mide otro color", 24, "ink-soft");
      g.star = svg("circle", { r: 16, fill: "#ffffff" }, s);
      g.ring = svg("circle", { r: 30, fill: "none", style: `stroke:${V("ink")};stroke-width:3` }, s);
      const P = (g.P = { x0: 1120, x1: 1780, y0: 860, y1: 400 });
      svg("line", { x1: P.x0, x2: P.x1, y1: P.y0, y2: P.y0, style: `stroke:${V("ink-soft")};stroke-width:2` }, s);
      svg("line", { x1: P.x0, x2: P.x0, y1: P.y0, y2: P.y1, style: `stroke:${V("ink-soft")};stroke-width:2` }, s);
      for (const l of [3.9, 4.1, 4.3]) {
        const x = P.x0 + (l - LAM0) / (LAM1 - LAM0) * (P.x1 - P.x0);
        svg("line", { x1: x, x2: x, y1: P.y0, y2: P.y0 + 10, style: `stroke:${V("ink-soft")};stroke-width:2` }, s);
        label(s, x, P.y0 + 40, fmt(l, 1), 22, "ink-soft", "middle");
      }
      label(s, (P.x0 + P.x1) / 2, P.y0 + 80, "color medido (µm)", 24, "ink-soft", "middle");
      label(s, P.x0, P.y1 - 20, "brillo (esquema)", 24, "ink-soft");
      g.lamTxt = label(s, P.x1, P.y1 - 20, "", 30, "accent", "end", 600);
      g.pts = OFFS.map(() => svg("circle", { r: 13, style: `fill:${V("accent")}` }, s));
      return g;
    },
    draw(g, st) {
      const { D, P } = g;
      const cx = D.x + D.w * 0.5, cy = D.y + st.off * D.h;
      attr(g.star, { cx, cy }); attr(g.ring, { cx, cy });
      const lamAhora = LAM0 + (LAM1 - LAM0) * st.off;
      g.lamTxt.textContent = st.k > 0.5 ? `foto ${Math.round(st.k)}: ${fmt(lamAhora)} µm` : "la estrella, foto 1";
      g.pts.forEach((p, i) => {
        const l = LAM0 + (LAM1 - LAM0) * OFFS[i];
        attr(p, { cx: P.x0 + (l - LAM0) / (LAM1 - LAM0) * (P.x1 - P.x0), cy: P.y0 - espectro(l) * (P.y0 - P.y1) });
        p.style.opacity = i < Math.round(st.k) ? 1 : 0;
      });
    },
  });

  // ================================================================ giro: dos recortes crudos de Barnard
  A.giro = K.scene({
    states: [{ rot: 0 }, { rot: 180.7 }], duration: 2600,
    mount(s) {
      const w = 560, y = 330, xa = 330, xb = 1030;
      imagen(s, xa, y, w, w, "figures/barnard_crudo_0.png");
      marco(s, xa, y, w, w);
      label(s, xa, y + w + 46, "2025,65 · detector a −179,6°", 26, "ink");
      const g = { grupo: svg("g", {}, s), cx: xb + w / 2, cy: y + w / 2 };
      imagen(g.grupo, xb, y, w, w, "figures/barnard_crudo_1.png");
      marco(g.grupo, xb, y, w, w);
      g.lb = label(s, xb, y + w + 46, "", 26, "ink");
      return g;
    },
    draw(g, st) {
      g.grupo.setAttribute("transform", `rotate(${st.rot} ${g.cx} ${g.cy})`);
      g.lb.textContent = st.rot > 90 ? "2026,20 · girada 180°: coincide" : "2026,20 · detector a +1,1°";
    },
  });

  // ================================================================ epsind: parpadeo ampliado + medición
  A.epsind = K.scene({
    states: [{ num: 0 }, { num: 1 }], loop: true, duration: 800, tFinal: 3.3,
    mount(s) {
      const g = { x: 330, y: 310, w: 540 };
      g.imgs = EPS.map((_, i) => imagen(s, g.x, g.y, g.w, g.w, `figures/epsind_zoom_${i}.png`));
      marco(s, g.x, g.y, g.w, g.w);
      // Rastro de las posiciones predichas (puntos pequeños) y el círculo de la época actual
      EPS.forEach((e) => svg("circle", { cx: g.x + e.zx * g.w, cy: g.y + e.zy * g.w, r: 5, style: `fill:${V("accent-2")}` }, s));
      g.c = circulo(s, 46);
      g.lbl = label(s, g.x, g.y + g.w + 46, "", 28, "ink");
      label(s, g.x, g.y + g.w + 84, "cada cuadrado = 1 píxel de SPHEREx (6,15″)", 22, "ink-soft");
      g.panel = svg("g", {}, s);
      const X = 1060;
      label(g.panel, X, 420, "desplazamiento 2025,31 → 2026,74", 30, "ink-soft");
      label(g.panel, X, 500, "medido", 32, "accent", "start", 600);
      label(g.panel, X + 300, 500, "0,85 px este · 0,71 px sur", 32, "accent");
      label(g.panel, X, 570, "catálogo", 32, "accent-2", "start", 600);
      label(g.panel, X + 300, 570, "0,92 px este · 0,57 px sur", 32, "accent-2");
      label(g.panel, X, 660, "estrellas que no se mueven: < 0,4 px", 28, "ink-soft");
      label(g.panel, X, 740, "= 6,7″ en 1,4 años · está a 3,7 pársecs", 28, "ink-soft");
      return g;
    },
    draw(g, st, n, time) {
      const k = Math.floor(time / 0.8) % EPS.length;
      g.imgs.forEach((im, i) => (im.style.opacity = i === k ? 1 : 0));
      attr(g.c, { cx: g.x + EPS[k].zx * g.w, cy: g.y + EPS[k].zy * g.w });
      g.lbl.textContent = `${EPS[k].anio} · ${EPS[k].lam} µm`;
      g.panel.style.opacity = st.num;
    },
  });

  // ================================================================ restas: tres casos, uno por paso
  const CASOS = [
    { img: "epsind_resta", nombre: "Epsilon Indi B", txt: "se mueve · medido", col: "accent" },
    { img: "barnard_resta", nombre: "Barnard", txt: "se mueve · satura", col: "accent-2" },
    { img: "rwaur_resta", nombre: "RW Aurigae", txt: "no se mueve · par falso", col: "ink" },
  ];
  A.restas = K.scene({
    states: [{ v: 1 }, { v: 2 }, { v: 3 }], duration: 700,
    mount(s) {
      const w = 470, y = 340, gap = 70, x0 = (1920 - 3 * w - 2 * gap) / 2;
      return { paneles: CASOS.map((c, i) => {
        const p = svg("g", {}, s), x = x0 + i * (w + gap);
        imagen(p, x, y, w, w, `figures/${c.img}.png`);
        marco(p, x, y, w, w);
        label(p, x, y + w + 48, c.nombre, 30, "ink", "start", 600);
        label(p, x, y + w + 90, c.txt, 28, c.col);
        return p;
      }) };
    },
    draw(g, st) { g.paneles.forEach((p, i) => (p.style.opacity = Math.max(0, Math.min(1, st.v - i)))); },
  });

  // ================================================================ wise: cuatro fotos quietas
  A.wise = K.scene({
    states: [{}],
    mount(s) {
      const w = 380, gap = 40, y = 360, x0 = (1920 - 4 * w - 3 * gap) / 2;
      WISE.forEach((e, i) => {
        const x = x0 + i * (w + gap);
        imagen(s, x, y, w, w, `figures/wise_${i}.png`);
        marco(s, x, y, w, w);
        svg("circle", { cx: x + e.fx * w, cy: y + e.fy * w, r: 24, style: `fill:none;stroke:${V("accent")};stroke-width:3` }, s);
        label(s, x, y + w + 46, `${e.anio} · ${e.lam} µm`, 26, "ink");
      });
      return {};
    },
    draw() {},
  });

  // ================================================================ flujo: siete piezas y sus dueños
  // Reparto del plan del equipo (README §3 y docs/05_PLAN_24H.md).
  const PIEZAS = [
    ["Buscar", "SIA2 DR1 + QR3", ["D1", "Vladimir"]], ["Elegir épocas", "misma λ", ["D2", "Bryan"]],
    ["Recortar", "+ caché", ["D1", "Vladimir"]], ["Filtros", "máscara + alinear", ["D2", "Bryan"]],
    ["Restas", "y sumas", ["D2", "Bryan"]], ["Imagen", "PNG", ["D2", "Bryan"]],
    ["Visor", "blink · cielo", ["V1 Antonia", "V2 Juan Pablo"]],
  ];
  A.flujo = K.scene({
    states: [{ duenos: 0 }, { duenos: 1 }], duration: 900,
    mount(s) {
      const w = 220, h = 150, gap = 44, y = 420, x0 = (1920 - 7 * w - 6 * gap) / 2;
      const g = { duenos: svg("g", {}, s) };
      PIEZAS.forEach(([a, b, d], i) => {
        const x = x0 + i * (w + gap);
        const color = d[0].startsWith("V") ? "accent" : "accent-2";
        svg("rect", { x, y, width: w, height: h, rx: 10, style: `fill:#10203a;stroke:${V(color)};stroke-width:2` }, s);
        label(s, x + w / 2, y + 62, `${i + 1}. ${a}`, 28, "ink", "middle", 600);
        label(s, x + w / 2, y + 104, b, 22, "ink-soft", "middle");
        if (i < 6) label(s, x + w + gap / 2, y + h / 2 + 10, "→", 30, "ink-soft", "middle");
        label(g.duenos, x + w / 2, y + h + 50, d[0], 26, color, "middle", 600);
        label(g.duenos, x + w / 2, y + h + 86, d[1], 26, color, "middle", 600);
      });
      label(s, x0, y - 40, "coordenada  →", 26, "ink-soft");
      label(s, 1920 - x0, y - 40, "→  pantalla", 26, "ink-soft", "end");
      svg("rect", { x: x0, y: 740, width: 1920 - 2 * x0, height: 64, rx: 10, style: `fill:none;stroke:${V("line")};stroke-width:2` }, g.duenos);
      label(g.duenos, 960, 782, "C · Mauricio verifica todo el camino y decide el despliegue  ·  N · Javiera lo cuenta", 28, "ink-soft", "middle");
      return g;
    },
    draw(g, st) { g.duenos.style.opacity = st.duenos; },
  });
})();
