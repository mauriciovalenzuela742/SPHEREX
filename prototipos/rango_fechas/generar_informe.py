"""Genera el informe HTML de bandas a partir del JSON de recolectar_bandas.py.

    .venv/bin/python prototipos/rango_fechas/generar_informe.py bandas.json informe.html
"""

import json
import sys

datos = json.load(open(sys.argv[1]))
carga = json.dumps(datos, ensure_ascii=False).replace("</", "<\\/")

HTML = r"""<title>Bandas de SPHEREx</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: una columna de lectura; la galería se abre a una rejilla de 4 columnas por banda. */
:root {
  --bg: #f4f6fa; --panel: #ffffff; --fg: #141a26; --tenue: #5b6578; --borde: #d9dfe9;
  --acento: #3b5bdb; --aviso: #b26a00; --aviso-bg: #fff4e0;
  --b1: #4c6ef5; --b2: #15aabf; --b3: #40c057; --b4: #fab005; --b5: #fd7e14; --b6: #e03131;
  --display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --texto: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #0c111b; --panel: #141b28; --fg: #e5e9f2; --tenue: #9aa5b8; --borde: #263043;
  --acento: #8ea6ff; --aviso: #ffb547; --aviso-bg: #2b2111; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #0c111b; --panel: #141b28; --fg: #e5e9f2; --tenue: #9aa5b8; --borde: #263043;
  --acento: #8ea6ff; --aviso: #ffb547; --aviso-bg: #2b2111; color-scheme: dark; }
body { background: var(--bg); color: var(--fg); font: 16px/1.55 var(--texto); }
.envoltura { max-width: 1120px; margin: 0 auto; padding-block: 28px 48px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
h1, h2, h3 { font-family: var(--display); text-wrap: balance; margin: 0; }
h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 800; letter-spacing: -.01em; }
h2 { font-size: 24px; font-weight: 700; margin-top: 44px; }
h3 { font-size: 17px; font-weight: 700; }
p { max-width: 68ch; }
.eyebrow { font: 600 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--tenue); }
.sub { color: var(--tenue); margin-top: 8px; }
.mono { font-family: var(--mono); font-variant-numeric: tabular-nums; }
.espectro { margin-top: 18px; overflow-x: auto; }
.espectro svg { display: block; width: 100%; min-width: 640px; height: auto; }
.tarjetas { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; margin-top: 18px; }
.tarjeta { background: var(--panel); border: 1px solid var(--borde); border-radius: 10px; padding: 14px 16px;
  border-top: 4px solid var(--c); display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.tarjeta .rango { font: 600 20px var(--mono); }
.kv { display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; font-size: 14px; }
.kv dt { color: var(--tenue); } .kv dd { margin: 0; font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; }
.nota { font-size: 14px; color: var(--tenue); }
.tabla { overflow-x: auto; margin-top: 14px; background: var(--panel); border: 1px solid var(--borde); border-radius: 10px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { padding: 8px 10px; border-bottom: 1px solid var(--borde); text-align: right; white-space: nowrap; }
th:first-child, td:first-child { text-align: left; }
thead th { font: 600 12px var(--mono); color: var(--tenue); letter-spacing: .05em; }
td.num { font-family: var(--mono); font-variant-numeric: tabular-nums; }
td .vis { color: var(--tenue); font-size: 12px; }
.graficos { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; margin-top: 14px; }
.grafico { background: var(--panel); border: 1px solid var(--borde); border-radius: 10px; padding: 12px 14px; min-width: 0; }
.grafico svg { width: 100%; height: auto; display: block; }
.pestanas { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
.pestanas button { font: 600 14px var(--texto); color: var(--fg); background: var(--panel); border: 1px solid var(--borde);
  border-radius: 999px; padding: 6px 14px; cursor: pointer; }
.pestanas button[aria-selected="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.pestanas button:focus-visible, .tarjeta:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }
.ficha { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 14px; color: var(--tenue); }
.ficha b { color: var(--fg); font-weight: 600; }
.fila { display: grid; grid-template-columns: 120px repeat(4, minmax(0, 1fr)); gap: 10px; align-items: start;
  padding: 14px 0; border-bottom: 1px solid var(--borde); }
.fila .etq { display: flex; flex-direction: column; gap: 2px; }
.fila .etq .chip { align-self: flex-start; font: 700 13px var(--mono); color: #fff; background: var(--c); border-radius: 6px; padding: 1px 8px; }
.fila figure { margin: 0; min-width: 0; }
.fila img { width: 100%; aspect-ratio: 1; image-rendering: pixelated; border-radius: 6px; background: #000; display: block; }
.fila figcaption { font: 12px/1.35 var(--mono); color: var(--tenue); margin-top: 4px; }
.fila .vacio { aspect-ratio: 1; border: 1px dashed var(--borde); border-radius: 6px; display: grid; place-items: center;
  color: var(--tenue); font-size: 13px; text-align: center; padding: 8px; }
.rec { font: 600 11px var(--mono); color: var(--acento); }
.encab { display: grid; grid-template-columns: 120px repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 18px;
  font: 600 12px var(--mono); color: var(--tenue); letter-spacing: .05em; }
.aviso { background: var(--aviso-bg); border-left: 3px solid var(--aviso); padding: 6px 10px; font-size: 13px; border-radius: 4px; margin-top: 6px; }
@media (max-width: 640px) {
  .fila, .encab { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fila .etq { grid-column: 1 / -1; flex-direction: row; gap: 8px; align-items: baseline; }
  .encab { display: none; }
}
footer { margin-top: 48px; font-size: 12px; color: var(--tenue); max-width: 90ch; }
</style>

<div class="envoltura">
  <div class="eyebrow">SPHEREx · NASA/IPAC IRSA · DR1 + QR3</div>
  <h1>Las seis bandas de SPHEREx</h1>
  <p class="sub" id="subtitulo"></p>

  <h2>Dónde cae cada banda en el espectro</h2>
  <p>SPHEREx no usa filtros fijos: cada detector cubre un tramo del infrarrojo cercano y la longitud de onda cambia
     a lo largo del detector. Las barras muestran el tramo de cada detector; las marcas de abajo son rasgos espectrales
     conocidos que caen en esos tramos (de la literatura, no medidos aquí). Los puntos son la λ real de cada foto que
     usamos en este informe.</p>
  <div class="espectro" id="espectro"></div>

  <div class="tarjetas" id="tarjetas"></div>

  <h2>Cuántos datos hay por objeto y banda</h2>
  <p>Exposiciones encontradas en IRSA y, debajo, en cuántas visitas se agrupan. Una visita es un paso de SPHEREx por
     esa zona: varias exposiciones en pocos días. Para ver movimiento cuenta el número de visitas, no el de exposiciones.</p>
  <div class="tabla" id="inventario"></div>

  <h2>Lo que medimos en los recortes</h2>
  <p>Una exposición por visita, en cada objeto y banda. Cada punto es un objeto; la línea es la mediana.</p>
  <div class="graficos">
    <div class="grafico"><h3>Fondo zodiacal (MJy/sr)</h3><div id="g-zodi"></div>
      <p class="nota">Luz del Sol dispersada por el polvo del sistema solar. Viene en la extensión ZODI y hay que restarla.</p></div>
    <div class="grafico"><h3>Ruido por píxel (MJy/sr)</h3><div id="g-ruido"></div>
      <p class="nota">Raíz de la extensión VARIANCE. Más ruido implica que los objetos débiles se pierden antes.</p></div>
    <div class="grafico"><h3>Píxeles con contaminación (%)</h3><div id="g-cont"></div>
      <p class="nota">Bits de FLAGS que indican un problema. No cuenta SOURCE, que solo marca píxeles cerca de estrellas conocidas.</p></div>
  </div>

  <h2>Las imágenes, banda por banda</h2>
  <p>Para cada banda, la primera y la última visita del rango, alineadas norte arriba y este a la izquierda, y su resta.
     En la resta, <b style="color:var(--b6)">rojo</b> es brillo que aparece y <b style="color:var(--b1)">azul</b> brillo que
     estaba: un par rojo/azul juntos es un objeto que se movió. El objeto de prueba está en el centro.</p>
  <div class="pestanas" role="tablist" id="pestanas"></div>
  <div class="ficha" id="ficha"></div>
  <div class="encab"><span>BANDA</span><span>PRIMERA VISITA</span><span>ÚLTIMA VISITA</span><span>RESTA</span><span>COLOR (1.ª ROJO · ÚLTIMA CIAN)</span></div>
  <div id="galeria"></div>

  <h2>Cómo leer esto, y sus límites</h2>
  <ul>
    <li><b>Cada foto está a una λ distinta</b>, incluso dentro de una banda. Parte de los cambios de brillo entre la primera
        y la última visita se debe al filtro, no al objeto. Por eso cada imagen lleva su λ.</li>
    <li><b>Las estrellas quietas también dejan pequeños pares</b> en la resta, por la PSF distinta en cada λ y por errores de
        alineación de una fracción de píxel. El movimiento real es un par más marcado que el de las vecinas.</li>
    <li><b>WISE 0855 es débil:</b> en sus imágenes cada visita es la mediana de varias exposiciones. Aun así, en las bandas
        cortas no se ve: es muy frío y emite casi todo en las bandas largas.</li>
    <li>Los números de la sección anterior salen de una exposición por visita, no de todo el archivo.</li>
  </ul>

  <footer>
    This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
    Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California
    Institute of Technology, and is funded by the National Aeronautics and Space Administration.
    Datos obtenidos del servicio SIA2 y de recortes de NASA/IPAC IRSA.
  </footer>
</div>

<script type="application/json" id="datos">__DATOS__</script>
<script>
const D = JSON.parse(document.getElementById("datos").textContent);
const R = {1: 39, 2: 41, 3: 41, 4: 35, 5: 112, 6: 128};
const COLOR = b => `var(--b${b})`;
const RASGOS = [
  {l: 3.05, t: "hielo de agua"}, {l: 3.3, t: "metano / PAH"}, {l: 4.27, t: "hielo de CO₂"}, {l: 4.67, t: "hielo de CO"},
];
const BANDAS = [1, 2, 3, 4, 5, 6];
const med = a => { const s = a.filter(x => x != null && isFinite(x)).sort((x, y) => x - y); if (!s.length) return null;
  const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = (x, d = 2) => x == null ? "—" : x.toLocaleString("es", {maximumFractionDigits: d, minimumFractionDigits: d});
const svgNS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, txt) => { const e = document.createElementNS(svgNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]); if (txt != null) e.textContent = txt; return e; };

document.getElementById("subtitulo").textContent =
  `${D.campos.length} objetos de prueba del desafío · observaciones entre ${D.rango[0]} y ${D.rango[1]} · ` +
  `recortes de ${D.size}° (${Math.round(D.size * 3600 / D.escala)} px de ${D.escala}″) · generado ${D.generado.replace("T", " ")}`;

// ---------- Estadísticas por banda (todas las visitas, todos los objetos) ----------
const porBanda = {};
for (const b of BANDAS) {
  const st = D.campos.flatMap(c => (c.bandas[b]?.stats || []).map(s => ({...s, campo: c.id})));
  porBanda[b] = {
    st, nObs: D.campos.reduce((a, c) => a + (c.bandas[b]?.n_obs || 0), 0),
    zodi: med(st.map(s => s.zodi)), ruido: med(st.map(s => s.ruido)), cont: med(st.map(s => s.contaminado)),
    lmin: Math.min(...st.map(s => s.lam).filter(x => x)), lmax: Math.max(...st.map(s => s.lam).filter(x => x)),
  };
}

// ---------- Espectro ----------
(() => {
  const W = 960, H = 170, x0 = 40, x1 = W - 20, lo = 0.7, hi = 5.05;
  const X = l => x0 + (l - lo) / (hi - lo) * (x1 - x0);
  const s = el("svg", {viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Tramos de longitud de onda de las seis bandas"});
  for (let t = 1; t <= 5; t += 0.5) {
    s.append(el("line", {x1: X(t), x2: X(t), y1: 30, y2: 112, stroke: "var(--borde)"}));
    s.append(el("text", {x: X(t), y: 128, "text-anchor": "middle", "font-size": 12, fill: "var(--tenue)", "font-family": "var(--mono)"}, t.toFixed(1)));
  }
  s.append(el("text", {x: x1, y: 146, "text-anchor": "end", "font-size": 12, fill: "var(--tenue)"}, "longitud de onda (µm)"));
  for (const b of BANDAS) {
    const [a, z] = D.bandas_um[b];
    s.append(el("rect", {x: X(a), y: 34, width: X(z) - X(a) - 2, height: 34, rx: 4, fill: COLOR(b)}));
    s.append(el("text", {x: (X(a) + X(z)) / 2, y: 56, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: "#fff", "font-family": "var(--mono)"}, b));
    for (const st of porBanda[b].st) if (st.lam)
      s.append(el("circle", {cx: X(st.lam), cy: 80 + (b % 2) * 6, r: 2.6, fill: COLOR(b), opacity: .75}));
  }
  for (const r of RASGOS) {
    s.append(el("line", {x1: X(r.l), x2: X(r.l), y1: 92, y2: 112, stroke: "var(--fg)", "stroke-width": 1.5}));
    s.append(el("text", {x: X(r.l), y: 22, "text-anchor": r.l > 4.5 ? "end" : "middle", "font-size": 12, fill: "var(--fg)"}, r.t));
    s.append(el("line", {x1: X(r.l), x2: X(r.l), y1: 25, y2: 33, stroke: "var(--fg)", "stroke-dasharray": "2 2"}));
  }
  document.getElementById("espectro").append(s);
})();

// ---------- Tarjetas ----------
const QUE = {
  1: "El extremo más azul. Estrellas normales brillan mucho; los objetos fríos casi no aparecen.",
  2: "Estrellas y galaxias. Banda recomendada para Barnard, que es brillante y no muy fría.",
  3: "Banda K del infrarrojo clásico. Buena para estrellas jóvenes como RW Aur.",
  4: "Incluye el hielo de agua (≈3 µm) y la absorción de metano de las enanas marrones (≈3,3 µm).",
  5: "La ventana donde las enanas marrones frías emiten más: aquí aparece WISE 0855. Incluye el CO₂ (≈4,27 µm).",
  6: "La de mayor resolución espectral. Incluye el hielo de CO (≈4,67 µm).",
};
document.getElementById("tarjetas").innerHTML = BANDAS.map(b => {
  const p = porBanda[b], [a, z] = D.bandas_um[b];
  return `<article class="tarjeta" style="--c:${COLOR(b)}">
    <div class="eyebrow">Banda ${b} · detector ${b}</div>
    <div class="rango">${fmt(a)}–${fmt(z)} µm</div>
    <p class="nota" style="margin:0">${QUE[b]}</p>
    <dl class="kv">
      <dt>Resolución espectral R</dt><dd>${R[b]}</dd>
      <dt>Exposiciones (5 objetos)</dt><dd>${p.nObs}</dd>
      <dt>λ de las fotos usadas</dt><dd>${fmt(p.lmin)}–${fmt(p.lmax)}</dd>
      <dt>Fondo zodiacal mediano</dt><dd>${fmt(p.zodi, 3)}</dd>
      <dt>Ruido mediano por píxel</dt><dd>${fmt(p.ruido, 3)}</dd>
      <dt>Píxeles con contaminación</dt><dd>${fmt(p.cont * 100, 1)} %</dd>
    </dl></article>`;
}).join("");

// ---------- Inventario ----------
document.getElementById("inventario").innerHTML = `<table><thead><tr><th>OBJETO</th>${BANDAS.map(b =>
  `<th><span style="color:${COLOR(b)}">●</span> BANDA ${b}</th>`).join("")}<th>PRIMERA → ÚLTIMA</th></tr></thead><tbody>${
  D.campos.map(c => {
    const todas = BANDAS.flatMap(b => c.bandas[b]?.visitas || []).map(v => v.ini).sort();
    return `<tr><td><b>${c.nombre}</b></td>${BANDAS.map(b => { const x = c.bandas[b];
      return `<td class="num">${x.n_obs}<br><span class="vis">${x.n_visitas} visitas</span>${b === c.banda_rec ? '<br><span class="rec">recomendada</span>' : ""}</td>`; }).join("")}
      <td class="num">${todas[0] || "—"} → ${todas.at(-1) || "—"}</td></tr>`;
  }).join("")}</tbody></table>`;

// ---------- Gráficos ----------
function grafico(id, campo, escala = 1, dec = 2) {
  const W = 340, H = 200, x0 = 46, x1 = W - 10, y0 = 14, y1 = H - 30;
  const vals = BANDAS.flatMap(b => porBanda[b].st.map(s => s[campo] * escala)).filter(isFinite);
  const max = Math.max(...vals) * 1.1 || 1;
  const X = b => x0 + (b - 0.5) / 6 * (x1 - x0), Y = v => y1 - v / max * (y1 - y0);
  const s = el("svg", {viewBox: `0 0 ${W} ${H}`, role: "img"});
  for (let i = 0; i <= 4; i++) { const v = max * i / 4;
    s.append(el("line", {x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: "var(--borde)"}));
    s.append(el("text", {x: x0 - 6, y: Y(v) + 4, "text-anchor": "end", "font-size": 11, fill: "var(--tenue)", "font-family": "var(--mono)"}, fmt(v, dec))); }
  const pts = [];
  for (const b of BANDAS) {
    s.append(el("text", {x: X(b), y: H - 10, "text-anchor": "middle", "font-size": 12, fill: "var(--tenue)", "font-family": "var(--mono)"}, `B${b}`));
    porBanda[b].st.forEach((st, i) => s.append(el("circle", {cx: X(b) + ((i % 7) - 3) * 3, cy: Y(st[campo] * escala), r: 2.4, fill: COLOR(b), opacity: .55})));
    const m = med(porBanda[b].st.map(st => st[campo] * escala)); if (m != null) pts.push([X(b), Y(m)]);
  }
  s.append(el("polyline", {points: pts.map(p => p.join(",")).join(" "), fill: "none", stroke: "var(--fg)", "stroke-width": 2}));
  pts.forEach(p => s.append(el("circle", {cx: p[0], cy: p[1], r: 3.5, fill: "var(--fg)"})));
  document.getElementById(id).append(s);
}
grafico("g-zodi", "zodi", 1, 2); grafico("g-ruido", "ruido", 1, 3); grafico("g-cont", "contaminado", 100, 1);

// ---------- Galería ----------
const pest = document.getElementById("pestanas");
D.campos.forEach((c, i) => {
  const btn = document.createElement("button");
  btn.type = "button"; btn.role = "tab"; btn.id = "tab-" + c.id; btn.textContent = c.nombre;
  btn.onclick = () => mostrar(i); pest.append(btn);
});
function mostrar(i) {
  const c = D.campos[i];
  pest.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-selected", i === j));
  document.getElementById("ficha").innerHTML =
    `<span><b>${c.tipo}</b></span><span>Qué demuestra: <b>${c.que_demuestra}</b></span>` +
    `<span>Movimiento propio: <b class="mono">${fmt(c.pm)}″/año</b> (${fmt(c.pm / D.escala)} px/año)</span>` +
    `<span>Centro: <b class="mono">RA ${c.ra.toFixed(5)}, Dec ${c.dec.toFixed(5)}</b></span>` +
    (c.por_visita > 1 ? `<span>Cada imagen: <b>mediana de ${c.por_visita} exposiciones</b></span>` : "");
  document.getElementById("galeria").innerHTML = BANDAS.map(b => {
    const x = c.bandas[b], f = x.frames || [];
    const fig = (src, cap) => src ? `<figure><img src="${src}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`
                                  : `<div class="vacio">Sin datos suficientes</div>`;
    const cap = f_ => f_ ? `${f_.t.slice(0, 10)} · λ ${f_.lam ?? "?"} µm` : "";
    const avisos = (x.avisos || []).filter(a => !a.startsWith("Las épocas")).map(a => `<div class="aviso">${a}</div>`).join("");
    return `<div class="fila" style="--c:${COLOR(b)}">
      <div class="etq"><span class="chip">B${b}</span><span class="mono" style="font-size:12px">${fmt(D.bandas_um[b][0])}–${fmt(D.bandas_um[b][1])} µm</span>
        <span class="nota">${x.n_visitas} visitas</span>${b === c.banda_rec ? '<span class="rec">recomendada</span>' : ""}${avisos}</div>
      ${fig(f[0]?.png, cap(f[0]))}${fig(f[1]?.png, cap(f[1]))}
      ${fig(x.diff_png, f.length > 1 ? `Δλ ${fmt(Math.abs((f[1].lam || 0) - (f[0].lam || 0)), 3)} µm` : "")}
      ${fig(x.color_png, "blanco = sin cambio")}</div>`;
  }).join("");
}
mostrar(0);
</script>
"""

open(sys.argv[2], "w").write(HTML.replace("__DATOS__", carga))
print("ok", len(HTML) + len(carga), "bytes")
