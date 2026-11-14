# Reglas de traducción (las leen los traductores; no se traduce este archivo)

Origen: español. Destinos: `en`, `zh`, `de`, `it`. Salida: `i18n/<idioma>/<misma ruta que el original>`.

## Qué se traduce y qué no
1. **Se traduce solo la prosa**: párrafos, títulos, listas, celdas de tabla, texto de enlaces y el campo
   `description:` del front matter YAML (si lo hay).
2. **NO se toca**: bloques de código (```), código en línea (`…`), rutas, nombres de archivo, URLs,
   **destinos de enlaces** (lo que va entre paréntesis en `[texto](destino)` y tras `[ref]:`), claves y
   valores técnicos del front matter (`name:`, `model:`, `tools:`…), identificadores (D1, D2, V1, V2, C, N,
   B08-C03, ADR-001), nombres propios y de personas, comandos (`/standup`).
3. **No añadas ni quites líneas de contenido**: misma estructura de títulos, tablas y listas. No pongas
   cabecera de idioma ni fecha: la añade un script. No añadas notas del traductor.
4. Conserva los emojis y el formato Markdown. El archivo termina con un salto de línea.
5. Números: en prosa, `en` y `zh` usan punto decimal y coma de millares (`0,1` → `0.1`, `2.077` → `2,077`);
   `de` e `it` usan igual que el español (no se cambian). Dentro de código, URLs, rutas y datos de tablas
   que son valores copiados de archivos, **no se cambia nada**. Fechas: `14-nov` → `Nov 14` (en),
   `14. Nov.` (de), `14 nov` (it), `11月14日` (zh).
6. Si una frase es ambigua, tradúcela literal y no inventes. Nunca cambies una cifra, una unidad o un nombre.

## Términos que NO se traducen
SPHEREx, IRSA, SIA2, FITS, MEF, WCS, LVF, HiPS, PSF, FLAGS, SIMBAD, Gaia, MAST, CDS, VizieR, Aladin Lite,
Vercel, FastAPI, React, Vite, Backyard Worlds, NASA Space Apps, WISE 0855, eps Ind B, Barnard, RW Aur,
R Dra, 3I/ATLAS, DR1, QR3, ICRS, J2000, RA, Dec, blink, cutout (en `de`/`it`/`zh` se mantiene «cutout»),
diff_first, diff_prev, zodi, co-add, Claude Code, skill, subagente→subagent (en/de/it) / 子智能体 (zh).

## Glosario fijo
| Español | en | de | it | zh |
|---|---|---|---|---|
| época | epoch | Epoche | epoca | 历元 |
| barrido (pasada) | sweep (pass) | Durchgang | passata | 扫描轮次 |
| movimiento propio | proper motion | Eigenbewegung | moto proprio | 自行 |
| paralaje | parallax | Parallaxe | parallasse | 视差 |
| enana marrón | brown dwarf | Brauner Zwerg | nana bruna | 褐矮星 |
| longitud de onda | wavelength | Wellenlänge | lunghezza d'onda | 波长 |
| λ igualada | matched λ | angeglichene λ | λ uniformata | 匹配波长 |
| fotograma | frame | Einzelbild | fotogramma | 帧 |
| recorte | crop / cutout | Ausschnitt | ritaglio | 裁切图 |
| banda | band | Band | banda | 波段 |
| máscara | mask | Maske | maschera | 掩膜 |
| ciencia ciudadana | citizen science | Bürgerwissenschaft | scienza partecipata | 公民科学 |
| jurado | jury | Jury | giuria | 评审团 |
| traspaso | handoff | Übergabe | passaggio di consegne | 交接 |
| hallazgos | findings | Befunde | risultati | 发现 |
| campo de prueba | test field | Testfeld | campo di prova | 测试天区 |
| pizarra | whiteboard | Whiteboard | lavagna | 白板 |
| contrato (de la API) | (API) contract | (API-)Vertrag | contratto (dell'API) | API 契约 |
| caché | cache | Cache | cache | 缓存 |
| ruta (de aprendizaje) | path | Pfad | percorso | 路径 |
| rama / PR | branch / PR | Branch / PR | branch / PR | 分支 / PR |
| «Qué NO comprobé» | What I did NOT check | Was ich NICHT geprüft habe | Cosa NON ho verificato | 未验证的内容 |

Tono: técnico, claro, sin florituras; el mismo registro que el original (tuteo en español → trato directo
no formal: «du» en alemán solo si el original es informal; «tu» en italiano; en inglés y chino, neutro).
