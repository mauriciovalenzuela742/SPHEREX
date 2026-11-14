<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [中文](../../zh/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Deutsch](../../de/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Italiano](../../it/docs/REVISION_DOCUMENTACION_2026-11-14.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/REVISION_DOCUMENTACION_2026-11-14.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Documentation review · Nov 14, 2026

Branch `n/docs-al-dia`, from `equipo/main` (8202409, with PRs #1 to #6 already merged). Review done with three
readers in parallel (each with a group of documents) and consolidated here. Each finding in the table
cites the file and line of the document and the data that contradicts it. The lines were checked by hand in the
documents that were fixed; where a reader gave a line number that did not match, the real one was used.

> **Currency note:** this branch already incorporates `equipo/main` up to `b115fc0` (PR #7 "fields at their current position and `/api` deployment decision" and PR #8 "Spherix"). Conflicts with `data/campos_de_prueba.yml` and `ADR-001` were resolved in favor of `main`. There is also a new branch, `v/v2-catwise`, with the viewer's CatWISE2020 layer, and PR #9 (Bryan, `d/prototipo-rango-fechas`) is still open.

## (a) Summary in 5 lines

1. The documentation fell behind on four things: **the closing time** (several documents say 13:00; the organizers said 11:00), **the sky cube** (two different DR1 products are confused), **what is already done** (the viewer, Vercel and PR #6 are still listed as "pending") and **the team size** (six, not four).
2. Most urgent: the deadline is **Sunday the 15th at 11:00** (confirmed by JP). WISE 0855 is a mandatory case and is always shown, but we must say honestly that in a single exposure it looks weak and that its motion is seen with the subtraction; eps Ind B is where it is clearest.
3. In the code (not in the documents) there are two things that contradict what is written: the viewer footer does not carry the **literal** attribution text that IRSA requires, and `campos.ts` and the default value in `url.ts` use J2000 coordinates even though they say "propagated".
4. 45 files were fixed (one commit each) in two rounds; the second also applies the proposals, with JP's approval. In `docs/03` only measured facts were applied. No code, CI or permissions were touched.
5. Of the 7 remote branches, only `d/prototipo-rango-fechas` has unmerged work; its routes use `start`/`end` and the contract says `from`/`to`. The other 6 are already inside `main`.

## (b) Findings by document

Severity: **B** = blocks someone · **C** = confusing · **K** = cosmetic.
Status: **Fixed** (commit on this branch) · **Proposal** (the owner or the team decides) · **Code** (not touched here).
Owner per README §3: D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera.

| # | Document:line | What it says | What is true today | Evidence | Owner | Sev. | Status |
|---|---|---|---|---|---|---|---|
| 1 | `docs/05_PLAN_24H.md:7-8` | Deadline Sunday 13:00, pitches 14:00 | Deadline **11:00** (announced live). The 13:00 comes from the Nov 13 meeting, unconfirmed | `docs/08_REGLAS_DEL_EVENTO.md:94`; `README.md:33`; `docs/reuniones/2026-11-13_resumen.txt` ("schedule not confirmed") | C | B | Fixed |
| 2 | `docs/04_METODOLOGIA.md:160` | "announced at 13:00 on Sunday... confirm it" | 11:00, already confirmed | same as #1 | C | B | Fixed |
| 3 | `docs/02_DATOS_SPHEREX.md:258-267` (and `:111-114`) | The cube is a HiPS at `hips5_cube/hips_20261026/Norder5/`, searchable via SIA2, and Aladin displays it directly | These are **two** products. The SIA2 one is a FITS of ~320 MB per tile that the cutout service rejects. The one that loads in Aladin is `/data/hips/SPHEREx/spherex_allsky_cube` (PNG, 102 planes, 50 and 51 empty, open CORS) | `docs/09_EDA_HALLAZGOS.md:35-38,176-177`; `scaffold/frontend/src/sky/planos.ts:11-13`; `curl` to `.../ibe/.../hips5_cube/hips_20261026/properties` gives 404 (tested by the group C reader) | C | B | Fixed (paragraph and table; the route at `:111-114` stays as a reference to the SIA2 directory, already clarified above) |
| 4 | `.claude/skills/spherex-datos/SKILL.md:144-155` (§6) | Same error as #3: "Aladin can display it directly", `ibe/...` route | Same as #3. In addition, the `visor-sky-blink` skill §2 already said it correctly: the two skills contradicted each other | same as #3; `.claude/skills/visor-sky-blink/SKILL.md:42-90` | V2 / C | B | Fixed |
| 5 | `docs/02_DATOS_SPHEREX.md:271-278` · `docs/briefings/01_el_desafio_y_los_datos.md:226-228,321-323` · `spherex-datos/SKILL.md:159-164` | The spectrum and the color come from the cube | The cube is already-stretched PNGs, with no fluxes: it is no use for the spectrum; that comes from level 2 or the Spectrophotometry Tool | `docs/09:37-38,177`; `docs/10_REPARTO_DE_TRABAJO.md:106-107` | C / N | C | Fixed in `docs/02` and the skill; briefing 01 stays as a proposal (it is audio text) |
| 6 | `docs/02_DATOS_SPHEREX.md:61-72` (§2) and the `spherex-datos` skill §1 | "Within a band the λ varies much less"; grouping by band is enough | The object's λ spans ~16 band widths within a detector; epochs must be chosen at matched λ (dispersion 0.474 → 0.035 µm) and reprojected (the detector rotates ~180°) | `docs/09:22-27,72-85`; `eda/resultados/lambda_resumen.json` | C / D2 | C | Fixed in `docs/02` (note). **Proposal** for `spherex-datos` §1 and `revisor-cientifico.md:25-27` (add "match λ" and "reproject" as reviewer questions) |
| 7 | `docs/02_DATOS_SPHEREX.md:340-353` | Hour 1 checklist with all 8 boxes unchecked | Almost all already have an answer in `docs/09`; "confirm the 6 extensions" was not verified | `docs/09:10-40,168-178`; `eda/README.md:3` | C | C | Partial: `docs/05` already points to `docs/09`. **Proposal**: check the boxes in `docs/02` with the figure and its source |
| 8 | `docs/07_RIESGOS.md` R1 (`:10`), R2, R3, R10 | R1 "we do not know how long it takes"; R2 "measure WCS-WAVE"; R3 "plan B: use only `spherex_qr3`"; R10 scale 6.2 and "decided in hour 3" | R1 came true (median 7.3 s, max 29 s). R2 resolved. R3: QR3 alone leaves WISE 0855 with no data (0 rows). R10 measured: 1.1-1.8 px, scale 6.15″ | `docs/09:15-19,30-32,49-55`; `eda/resultados/latencia_cutouts.json`; `eda/03_recortes_y_figuras.py:42` | C | C | Fixed (status notes + 6.15) |
| 9 | `docs/07_RIESGOS.md:154-157` | No new risks registered | Missing: Vercel with a single access, CDS down, saturated stars that fool the subtraction, IRSA 503s | `README.md:74-86`; `scaffold/frontend/src/sky/capas/simbad.ts:8,36-37`; `docs/09:132-136,175` | C | C | **Proposal** (use `/riesgo`; C decides) |
| 10 | `docs/06_JURADO_Y_PITCH.md:70-74` · `docs/briefings/01` and `02` · `.claude/skills/demo-y-pitch/SKILL.md:35-47` · `coordenadas-astro/SKILL.md:164-168` · `data/campos_de_prueba.yml:50` | Script with WISE 0855 "it moves. Period."; RW Aur as a variability control; Gaia over WISE 0855 | **JP's decision (Nov 14): WISE 0855 is a mandatory case, one of the organizers' test objects, and is always shown.** We must explain honestly that in a single exposure it looks weak (113 s) and that its motion (~1.3 px over the whole period) is seen with the first − last subtraction and, when it exists, with the per-sweep sum. eps Ind B is where the motion is clearest. **Plan complements:** CatWISE2020 overlay (WISE 0855 is not in Gaia; CatWISE carries its proper motion; `README.md:50` and §3, skill `coordenadas-astro:104-107`; owner V2 Juan Pablo): **done on branch `v/v2-catwise` (marks WISE 0855 at 2.6″ from the position propagated from SIMBAD, per V2), PR pending**; and per-sweep sum with 1/VARIANCE weights (`docs/10:75`, `docs/09:186`; owner D2 Bryan): **pending**. The challenge guide values overlaying Gaia and WISE. RW Aur saturates and leaves a red/blue pair that does not move. WISE 0855 is not in Gaia (its overlay is CatWISE2020) | `docs/09:104-114,133-136`; `README.md:50`; `prototipos/rango_fechas/README.md` | N / C | C | Fixed in `docs/06`, `demo-y-pitch`, `coordenadas-astro`, `campos_de_prueba.yml` (comments), briefings 01 and 02, `docs/09`, `docs/10`, README. **The NotebookLM audios already generated are now outdated** |
| 11 | `scaffold/frontend/src/content/textos.ts:25-26` · `README.md` (§License) · `docs/presentacion_eda/script.es.md:136` | `docs/05:113`, `docs/06:136`, `docs/08:84` and the `entrega-nasa` skill require the **literal** attribution | The viewer footer is a Spanish paraphrase; the README only links to `docs/02`; the literal text is only in `docs/02_DATOS_SPHEREX.md:324-328` | `grep "This publication makes use" README.md` = 0 results; `textos.ts:25` | N / V1 | B (for the submission) | **Code**: change `textos.ts`, paste the text into the README and into `script.es.md:136` |
| 12 | `scaffold/frontend/src/content/campos.ts:1-13` and `src/state/url.ts:12` · `README.md:9` (example link) | Comment "use the PROPAGATED position" with J2000 values: in 2026 WISE 0855 was 212″ and Barnard 270″ from the center, outside a 0.1° cutout | **Resolved in the code by PR #7 (Mauricio):** `campos.ts` now documents that `ra`/`dec` are J2000 and centers with `posicionActual()`, and the default URL starts from eps Ind B. Only the README example link remains (Barnard in J2000, which falls outside the cutout): N fixes it | `docs/10:115-118`; `campos.ts:1-13,33` at `b115fc0`; `url.ts:12` | C / N | C | Resolved (PR #7). Only the `README.md:9` link is pending |
| 13 | `docs/10_REPARTO_DE_TRABAJO.md:99-109` | The V2 section describes the cube as "one plane per band" and propagated Gaia as to-do | Already merged in PR #6: λ slider, propagated marker and box, Gaia DR3 (cap 300), SIMBAD layer with label and click. Missing: band chart, click → animation, Spherix | commits `8eace4e`, `9043243`, `21a8edb`, `c76f61d`, `3cd51aa`, `e515ac5`; `scaffold/frontend/src/sky/` | V2 | C | Fixed |
| 14 | `docs/traspasos/2026-11-14-1530-v2-visor-cielo.md:61-89` | Steps 1 to 5 to do; "each PR has its preview"; "the CDS responds with CORS" | Steps already done in PR #6. Previews are only built for Mauricio's commits. The CDS was down and the code tries the Harvard mirror first | `git log`; `README.md:81-85`; `capas/gaia.ts:25-26`; `capas/simbad.ts:36-37` | V2 | C | Fixed ("superseded" banner and two notes) |
| 15 | `docs/KIT.md:5,52,76-77,80,116-121` | "four people"; "five skills"; "Today: local, unpublished"; anchor `#atribución-obligatoria`; frontend "not run", scale "derived", HiPS cube "unchecked" | Six people; eight skills; published with PR #1-#6 and viewer in production; real anchor `#8-atribución-obligatoria`; the frontend runs in CI and Vercel; scale 6.15″; the HiPS does load | `README.md:7-12,160`; `git ls-files .claude/skills`; `docs/02_DATOS_SPHEREX.md:322`; `docs/09:15,177` | N / C | C | Fixed |
| 16 | `docs/08_REGLAS_DEL_EVENTO.md:55-58,98-100` | "There is not a single line of code... until the official start"; "backend to be decided; the ADR remains to be reviewed" | It was true until Nov 13. Today there is `eda/` and a viewer; the frontend is already on Vercel (the backend is still to be decided) | `eda/01_inventario.py`…`05_centroides.py`; `scaffold/frontend/src/sky/`; `README.md:74-93` | C | C | Fixed. **Proposal** (minor): mark the "Before uploading this to GitHub" list (`:104-110`) as done |
| 17 | `README.md:17-18` · `AGENTS.md` rule 8 · `scaffold/README.md:3-5,52` | "Before the official start there is no code" as if still in force | The event started on Nov 14 at 10:00 | `README.md:33` | N / C | C | Fixed in README and AGENTS. **Proposal** for `scaffold/README.md` (it lives under `scaffold/`, not touched): header "initial skeleton; the frontend already has landing, viewer and path A" |
| 18 | `README.md:259` (§9, Block 0) | "Mauricio: create the project on Vercel" unchecked | Done: https://spherex-planet-x-tau.vercel.app | `README.md:7`; `vercel.json` | N | K | Fixed |
| 19 | `CONTRIBUTING.md:3,31,60` · `CLAUDE.md:44` · `scaffold/README.md:9,58` · `docs/05_PLAN_24H.md` (6 mentions) · `docs/04_METODOLOGIA.md` (title and §Roles) | "Four people"; `git worktree add ../spherex-d d/sia2-epochs` without `-b`; "`docker compose up`" from the root | Six people; a new branch needs `-b … main`; `docker-compose.yml` is in `scaffold/` and only brings up `/health` | `README.md:160,223`; `git worktree add -h`; `ls` of the root | C / N | K / C | Fixed in CONTRIBUTING, CLAUDE and docs/05; in docs/04 only the roles clarification was added (title and split: **proposal**, the team decides). `scaffold/README.md`: proposal |
| 20 | `CLAUDE.md:46-48` | `settings.json` "approves `curl` to IRSA and CDS domains" | `settings.json` has no `Bash(curl:*)`; it has `WebFetch(domain:…)` and does not include the Harvard mirrors | `.claude/settings.json:10-38` | C | C | Fixed (the sentence). **Proposal to Mauricio**: add `WebFetch` for `vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu` and the Vercel URL, and `npm run dev/preview`; this is a security matter, so it was not added |
| 21 | `GEMINI.md:10` | `git switch -c <tu-nombre>/<tema>` | The convention is `<role-initial>/<topic>` (`d/`, `v/`, `c/`, `n/`) | `CONTRIBUTING.md:17-21`; `git branch -r` | C | C | Fixed |
| 22 | `AGENTS.md:46,48` | "Aladin Lite v3 (HiPS, CDS)"; "Static frontend + backend in a container" | Aladin Lite 3.8.2 on the IRSA cube; the CDS went down and Harvard mirrors are used; the backend is to be decided | `scaffold/frontend/package.json:14`; `ADR-001:29-36` | C | K | Fixed |
| 23 | `docs/adr/ADR-001-stack.md:27,58-62` | The no-backend option "depends on IRSA responding with CORS"; review in hour 3 | IRSA does not give CORS outside the HiPS: discarded with evidence | `docs/09:33-34,170`; `eda/resultados/infraestructura.json` | C | K | Fixed |
| 24 | `docs/adr/ADR-001-stack.md` | Status "proposal", "to be signed"; the Decision section clashed with the Nov 14 update | **Resolved in substance by PR #7:** the ADR now has the "Update Nov 14, 2026, afternoon" with the `/api` deployment decision and the latency data (median 7.3 s, max 29 s). It is still **C's proposal, pending the team's approval and signature**; it was left written that way. The Vercel Hobby time limit is still unverified (the ADR itself asks to check it) | `README.md:38-39` | C | C | Fixed in text; **signature pending from C** |
| 25 | `docs/03_ARQUITECTURA.md` (contract) | Several points | (1) `:25-27` the CORS risk of path A was resolved; (2) `:156` scale 6.2 → 6.15; (3) `:166` `flagged_fraction` 0.004 vs ~4 % real; (4) `:120` default collections leave R Dra almost without data (it is mostly in `_deep`: 1,233 + 733 files vs 422 + 126); (5) `:141-172` `/api/frames` cannot ask for matched λ or per-sweep sum; (6) `/api/presets` is cited by `docs/10:117` and is not in the contract; (7) `:75-76,96-99,214-215` SIMBAD is queried directly from the browser, not through `/api/resolve`; (8) `:243` disk cache clashes with Vercel Functions; (9) `:93` the skeleton exposes `/health`, not `/api/health` | `docs/09:55,158-160`; `capas/simbad.ts:5-9`; `scaffold/backend/app/main.py:29-32` | team (D1, D2, C) | C | **Proposal**: not touched (the contract requires team agreement) |
| 26 | `docs/03_ARQUITECTURA.md` vs branch `d/prototipo-rango-fechas` (**Bryan's PR #9, open and unmerged**) | Contract: `from`/`to` filters | The prototype uses `start`/`end`, `visit`, `per_visit`, and new routes `/api/grid`, `/api/frame`, `/api/presets` | `prototipos/rango_fechas/README.md` (API table), `servidor.py` | D2 / D1 | C | Noted in the "Pending team agreement (Nov 14)" section of `docs/03`; agree on names before merging PR #9 |
| 27 | `data/campos_de_prueba.yml:48,162-171,187-189` | "It is THE main demo"; scale "6.2 arcsec [DERIVED]"; "verify in hour 1" | WISE 0855's place as a mandatory case is kept and the caveat is added that in a single exposure it looks weak. Scale 6.15″ and baseline 1.0-1.4 years measured. At 18 months with 6.15 you get 1.99 / 2.53 / 1.14 px | `eda/03_recortes_y_figuras.py:42`; `docs/10:114` | C | K | Fixed only in comments and text notes (without changing coordinates or proper motions) |
| 28 | `data/README.md:6` · `biblio/README.md:144-146` | The coordinates are "unverified" | All five were verified on Nov 14 against SIMBAD (Harvard mirror) | `data/campos_de_prueba.yml:7-13` | C | C | Fixed |
| 29 | `eda/README.md:8-9,19` | Backend in `backend/app/`; `04_infraestructura` tests "CORS, DR1 cube, CDS HiPS" | `scaffold/backend/app/`; the script also tests the IRSA HiPS | `eda/04_infraestructura.py:46-47` | D1 / C | K | Fixed |
| 30 | `docs/briefings/README.md:5` · `briefings/02:190` | "nine documents"; "Nine risks" | 11 numbered documents (00-10); 10 risks (R1-R10) | `ls docs`; `grep "^## R" docs/07_RIESGOS.md` | N | K | Fixed; a notice was also added that the briefings predate the EDA |
| 31 | `docs/briefings/01:19,312-316` · `02:3,56-58,91-97,157-158,168` | "four people", "four roles", "backend in a container" | Six people; backend to be decided | `README.md:160`; `ADR-001:29-36` | N | K | **Proposal**: they are audio scripts; if corrected, the audios must be regenerated |
| 32 | `.claude/skills/entrega-nasa/SKILL.md:42,88-91` | "spectra generated on the fly"; resources "the CDS HiPS" | The band chart is a gap in the viewer (`Visor.tsx:88`); no CDS HiPS is used | `scaffold/frontend/src/pages/Visor.tsx:88`; `planos.ts:13-14` | N | C | Fixed the resources list. **Proposal**: make "on-the-fly spectra" conditional |
| 33 | `.claude/skills/coordenadas-astro/SKILL.md:156-160` | Scale ~6.2 and "1-2.5 pixels" | 6.15″; 1.1-1.8 px measured | `docs/09:15-19` | C | K | Fixed |
| 34 | `docs/KIT.md`, `README.md:245-246`, `.github/workflows/ci.yml:26,41` | "When the event starts, remove the `|| true`"; CI uses `npm install` | `ruff check scaffold/backend` passes clean; Vercel uses `npm ci` | group C reader's run; `vercel.json:3` | C | K | **Proposal** (touching CI is approved by a person) |
| 35 | `scaffold/README.md:15-37,46-62` | `App.tsx` "calls /health"; `make dev` starts everything; `requirements-astro.txt` with astropy… | `App.tsx` is landing/viewer and does not call `/health`; `make dev` only prints help; `requirements-astro.txt` lacks `reproject` and `scipy`, which the EDA uses | `scaffold/Makefile:19-22`; `scaffold/backend/requirements-astro.txt:4-10`; `eda/comun.py:16` | D2 / C | C (B for D2 with `import reproject`) | **Proposal** (under `scaffold/`) |
| 36 | `.claude/skills/spherex-datos/SKILL.md` §1, §3-§4, §11 and `visor-sky-blink` | The measured data are missing: IRSA without CORS, cutout latencies, a position falls in 2 files per pointing (not 6), `FLAGS != 0` flags 72 %, the red/blue pair of the subtraction also appears with saturated objects | Measured in the EDA | `docs/09:30-34,59-60,133-136,140-162`; `eda/resultados/*.json` | C / D1 / D2 | C | **Proposal** (suggested text in the working notes) |
| 37 | `docs/06_JURADO_Y_PITCH.md:81` · `demo-y-pitch/SKILL.md:39,70` · `entrega-nasa/SKILL.md:41` | "The 102 bands: what no other public tool gives" | IRSA itself publishes the 102-plane cube; `/verifica-cifra` forbids "nobody has done this" without backing | `.claude/commands/verifica-cifra.md:30-32`; `docs/09:177` | N | C | **Proposal**: "as far as we could verify, no public tool combines the temporal blink with the 102 bands on a single screen" |
| 38 | `docs/diseno/REVISION_MAQUETA_V1.md:20,24,36` | "The footer with the attribution is missing"; "3 or 4 sweeps per zone" | There is already a footer (with non-literal text, see #11); R Dra has almost continuous observation and WISE 0855 ends at 2026.37 | `App.tsx:44`; `docs/09:51,55,63-64` | V1 / C | K | **Proposal** |
| 39 | `biblio/repos.md:32,97-98` | Aladin Lite is LGPL-3.0 | GitHub says LGPL-3.0; `package-lock.json:1248` and npm say GPL-3. Unresolved | `scaffold/frontend/package-lock.json:1248` | C | C | **Proposal**: open the `LICENSE` inside the 3.8.2 package and decide (the project is published under MIT) |
| 40 | `docs/presentacion_eda/script.es.md:45` · `docs/02:36` · `docs/09:72` | Detector 5 range: 3.82-4.44 / 3.83-4.41 / 3.82-4.41 µm | Three different figures | `eda/resultados/lambda_resumen.json` | C | K | **Proposal**: measure the `WCS-WAVE` table once and unify |

**Count by severity** (table rows, each with its highest severity): **blocks: 6** (rows 1, 2, 3, 4, 11 and 12) · **confusing: 23** · **cosmetic: 11**. Total: 40 rows.

> Counting note: the table groups items. The three readers delivered about 90 raw findings (13 + 40 + 40, plus observations on `docs/03`); duplicates across groups were merged (13:00 deadline, "four people", scale 6.2) and those that could not be proven were discarded.

### Checks that did not come out as the reader reported them

- **Line numbers in `docs/04`.** The group A reader cited lines 288 to 433, but `docs/04_METODOLOGIA.md` has 162. The real lines are in the table (`:160`, `:15`, `:21`). The content was correct.
- **"visor-sky-blink:61 says the cube is a mosaic of all epochs" (C-11 from group C).** Discarded: the actual sentence says "**What it is NOT:** a mosaic of all epochs (it has no time axis…)", which is correct. It is only ambiguous to read.
- **Attribution, R10 and latency figures:** checked against `textos.ts:25`, `docs/08:94` and `docs/09`.

## (c) Remote branches of `equipo`

| Branch | Last commit | Ahead / behind `main` | What it brings | Which documentation it affects |
|---|---|---|---|---|
| `c/correccion-cubo-hips` | Nov 14 | 0 / 16 | EDA fix: the HiPS cube does load; J2000 notice | Already merged (PR #4). Nothing pending |
| `c/eda-datos` | Nov 14 | 0 / 20 | EDA and mockup review | Already merged (PR #2) |
| `c/vercel-shell` | Nov 14 | 0 / 28 | Visual skeleton on Vercel | Already merged (PR #3) |
| `n/plan-readme` | Nov 14 | 0 / 30 | Whiteboard and Vercel in the plan | Already merged (PR #1) |
| `n/readme-vercel` | Nov 14 | 0 / 14 | How to deploy with the free plan | Already merged (PR #5) |
| `v/v2-cielo` | Nov 14 | 0 / 3 | V2 sky viewer | **Already merged** (PR #6, `8202409`). The assignment assumed it was open |
| `d/prototipo-rango-fechas` | Nov 14 | **4 / 33** | Isolated prototype in `prototipos/rango_fechas/` (server, bands × dates explorer, bands report) and `data/data.ipynb` (4,249 lines) | See rows 26 and 10. (1) Uses `start`/`end` and new routes different from the `docs/03` contract (`from`/`to`). (2) Its own README says WISE 0855 is not visible in a single exposure, which supports row 10. (3) It brings no documents that contradict `main`: it does not touch `docs/` or `README.md`. (4) The branch starts from `4411f5f`, before PRs #1 to #6: it must be rebuilt on `main` before a PR. (5) `data/data.ipynb` is about 4,200 lines: check that it does not include downloaded data (repo rule: no data in git) |

## Final status after the second round (with JP's approval)

JP's decisions of Nov 14: (1) the deadline is Sunday the 15th at 11:00, confirmed; (2) WISE 0855 is a mandatory case and is always shown (see row 10). That is why the rows marked "Proposal" above became fixed, except for what follows.

**Fixed in the second round** (rows 5, 6, 7, 8, 9, 10, 13, 16, 17, 19, 20 in documentation terms, 23, 24, 25, 26, 27, 31, 32, 34 in documentation terms, 35, 36, 37, 38, 39, 40 partial): `docs/02` checklist, R11-R13 in `docs/07`, `ADR-001` (text updated; **not signed: pending C's signature**), `docs/03` (see below), `scaffold/README.md`, `spherex-datos` skill (matched λ, 2 files per pointing, FLAGS by bits, §12 with the measured data), reviewers, `chequeo-demo`, `AGENTS.md` (pointing/sweep), `CLAUDE.md`, `GEMINI.md`, `docs/08`, `REVISION_MAQUETA_V1.md`, `biblio/repos.md` (license discrepancy noted, **unresolved**), `script.es.md` and README (literal attribution text), `entrega-nasa`, briefings 01 and 02.

**What was changed in `docs/03`** (measured facts only): pixel scale 6.15; CORS risk of path A marked as resolved; note on `/health` vs `/api/health`; example `flagged_fraction` 0.04 with its explanation; note that SIMBAD is now queried from the browser. The design changes (`from`/`to` vs `start`/`end`, `/api/grid`, `/api/frame`, `/api/presets`, matched λ and per-sweep sum, default collections, cache vs Vercel, contamination mask) were left as a "Pending team agreement (Nov 14)" section at the end, without changing the current contract.

**Audios.** The NotebookLM audios already generated from the briefings are outdated on: the cube does not give the spectrum, the team is six people, the backend is to be decided and the framing of WISE 0855.

### Pending code changes (not touched)

| What | Where | Owner |
|---|---|---|
| Put the literal IRSA attribution in the viewer footer | `scaffold/frontend/src/content/textos.ts:25-26` | N / V1 |
| ~~Move `campos.ts` to propagated positions~~ | Resolved by PR #7 (`campos.ts` documents J2000 and centers with `posicionActual()`) | — |
| Fix the README example link (Barnard in J2000, outside the cutout; `url.ts` already starts from eps Ind B) | `README.md:9` | N |
| Remove `\|\| true` from the linter and use `npm ci` in CI | `.github/workflows/ci.yml:26,41` | C |
| `WebFetch` permissions for the Harvard mirrors and the Vercel URL; `npm run dev/preview` | `.claude/settings.json` | C (security) |
| Add `reproject` and `scipy` | `scaffold/backend/requirements-astro.txt` | D2 / C |
| "Subtract" button in the viewer (`diff_first`) | `scaffold/frontend/src/pages/Visor.tsx` | V1 / D2 |
| Remove the `TODO` in `propagacion.ts` (the check already exists in `scripts/comprobar_propagacion.mjs`) | `scaffold/frontend/src/sky/propagacion.ts:10-11` | V2 |

### What was left undone in documentation

- Signature of `ADR-001` (it is C's) and resolving the Aladin Lite license (open the `LICENSE` of the 3.8.2 package).
- Regenerating the briefing audios.
- Detector 5 range (3.82-4.44 / 3.83-4.41 / 3.82-4.41 µm): the `WCS-WAVE` table must be measured before unifying.
- The "confirm the 6 extensions" box in `docs/02`, which the EDA did not verify.
- The numeric examples in AGENTS and in the viewer skill ("14 epochs"), which are illustrative; and the `visor-sky-blink` §8 note about preloading WISE 0855 in J2000 (depends on the code change to `campos.ts`/`url.ts`).

## What was NOT reviewed

- `docs/03_ARQUITECTURA.md` line by line against a real backend (there is none: only `/health`).
- The bibliographic citations (arXiv, DOI) in `biblio/`.
- The generic skills `astropy`, `matplotlib`, `scikit-learn` (they are third-party).
- `docs/reuniones/` (historical) and the PNG/PDF files in `docs/diseno/` and `docs/presentacion_eda/` (text only).
- Whether the NotebookLM audios were generated on Nov 14.
- The internal content of the notebooks and of `prototipos/rango_fechas/*.py`.
- The Vercel Hobby time limit and the Aladin Lite license (marked "unverified").
- All of `src/` and `scaffold/`: not edited, per the assignment.

## What remains for each owner

- **C Mauricio:** sign ADR-001 (and the latency figure), yml values (6.15 and "main demo"), `docs/03` (see row 25), new risks (row 9), `settings.json` permissions, Aladin license, CI (`|| true`, `npm ci`), `docs/02` checklist.
- **N Javiera:** the order of the demo and the pitch (row 10), "no other tool" (37), literal attribution in README and footer (11), briefings and audios (31).
- **V1 Antonia / V2 Juan Pablo:** `textos.ts` (11), `campos.ts` and `url.ts` in J2000 (12), `REVISION_MAQUETA_V1.md` (38).
- **D1 Vladimir / D2 Bryan:** `from`/`to` vs `start`/`end` (26), `/api/health` vs `/health`, `requirements-astro.txt` with `reproject` and `scipy` (35).
