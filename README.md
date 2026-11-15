<!-- PROJECT NAME TO CONFIRM: "AstroTRACK" is the name on the new landing page (PR #37). The team has not
     confirmed it as the final submission name. If it changes, update the title, the first paragraph and
     docs/entrega/submission_form_en.md. -->

# AstroTRACK · NASA Space Apps Challenge 2026 · *Planet X and SPHEREx*

**A free, public web tool where anyone types a position in the sky and watches that patch of sky as a
little video: the sequence of real NASA SPHEREx images taken over time, so people can spot by eye what
moves or changes brightness, and see the same patch across SPHEREx's 102 infrared colours.**

- **Live tool:** https://spherex-planet-x-tau.vercel.app
- **Challenge:** [Planet X and SPHEREx](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/)
  (Advanced). The official text is copied in [`docs/00_DESAFIO.md`](docs/00_DESAFIO.md).
- **Team:** see [Team](#team). Santiago, Chile local event.

> [!NOTE]
> **Language.** This README and the submission are in English. The tool's interface is currently in
> **Spanish** (the team's language); an English interface is not yet available. [TO CONFIRM: whether an
> English UI ships before the deadline.]

---

## 1. What it is and who it is for

SPHEREx maps the whole sky every six months in 102 infrared bands (0.75–5 µm). Comparing images of the
same patch taken at different times ("blinking") is how Pluto was found, and how citizen-science
volunteers keep finding brown dwarfs today. AstroTRACK puts that technique, with real SPHEREx data, in a
browser tab:

- **For curious people, students and teachers, not only astronomers.** No account, no install, no
  software to learn. A guided tutorial (the mascot *Spherix*) and a **Mission Mode** walk you through what
  Clyde Tombaugh did in 1930, with real SPHEREx images: compare two photos, find what moved, explain why.
  Each Mission level is a shareable link, so a teacher can send one to a class.
- **Accessibility as a requirement.** Plain-language texts, a glossary inside the Mission, colour pairs
  chosen so that red/green is never the only cue (red/blue and red/cyan), and a rule-based assistant that
  works without an AI model or an API key.
- **Education (UN SDG 4, Quality Education).** The tool is designed as an entry point to real space data
  for people without astronomy training. [TO CONFIRM: the team's final choice of SDGs; the landing page
  does not show SDG cards yet.]
- **Discovery, citizen-science style.** The challenge asks for a viewer so that *people* can find moving
  objects. AstroTRACK is a viewer, not an automatic detector: the human does the detecting, and every view
  can be shared by URL.

## 2. How to use it

1. Open https://spherex-planet-x-tau.vercel.app and choose **Empecemos con un tutorial** (guided tour),
   **Empecemos** (straight to the viewer) or the **Mission Mode** card.
2. In the viewer, type **R.A.** and **Dec** in decimal degrees (the Spherix chat also accepts
   sexagesimal coordinates and object names), pick the field of view (**Dimensión**: 0.05–0.5°) and a
   detector band (D1–D6), or click one of the five test-object buttons.
3. The top panel is the SPHEREx sky in Aladin Lite (all-sky HiPS cube, 102 wavelength planes). You can
   blink it against **AllWISE (2010)** and **2MASS (~2000)** images, and switch on Gaia DR3, CatWISE2020
   and SIMBAD catalogue markers.
4. Below it, the **Explorer** loads every SPHEREx visit to that position, in the six bands at once, and
   plays them along a timeline proportional to the date. Modes: **Image**, **Subtract vs t₀**
   (red = brightness that appeared, blue = brightness that was there: a red/blue pair that separates over
   time means motion) and **Colour** (first visit red, current visit cyan).
5. The **Prisma** panel shows the same position across the bands and an approximate spectrum measured in
   the browser.

### The five test objects (links checked on 2026-11-14 against production)

Positions are propagated with each object's proper motion from J2000 to 2026-11-15 using the app's own
formula ([`scaffold/frontend/src/content/campos.ts`](scaffold/frontend/src/content/campos.ts)); the
J2000 coordinate of Barnard's Star or WISE 0855 falls outside a 0.1° cut-out today. Each link opened the
viewer, and the data service answered for every position (HTTP 200, 8–19 date columns).

| Object | What to look for | Viewer link | Mission Mode |
|---|---|---|---|
| Barnard's Star (moves) | Red/blue pair at the centre, best example | [open](https://spherex-planet-x-tau.vercel.app/?ra=269.446074&dec=4.770711&size=0.1&band=2) | [level 1](https://spherex-planet-x-tau.vercel.app/?mision=1) |
| WISE 0855−0714 (moves) | Faint; visible as a ~1 px pair only with 10 exposures per visit in D5 | [open](https://spherex-planet-x-tau.vercel.app/?ra=133.757784&dec=-7.242023&size=0.1&band=5) | [level 2](https://spherex-planet-x-tau.vercel.app/?mision=2) |
| Epsilon Indi B (moves) | Pair towards the south-east in D5 with 10 exposures per visit | [open](https://spherex-planet-x-tau.vercel.app/?ra=331.098402&dec=-56.801257&size=0.1&band=5) | [level 3](https://spherex-planet-x-tau.vercel.app/?mision=3) |
| RW Aurigae (variable) | Bright and saturated: the red/blue pattern is **not** motion | [open](https://spherex-planet-x-tau.vercel.app/?ra=76.956589&dec=30.401286&size=0.1&band=3) | [level 4](https://spherex-planet-x-tau.vercel.app/?mision=4) |
| R Draconis (variable) | Deep-field position, many visits; saturated core | [open](https://spherex-planet-x-tau.vercel.app/?ra=248.16722&dec=66.755025&size=0.1&band=4) | hidden (see §3) |

What the team measured on these fields (from [`docs/09_EDA_HALLAZGOS.md`](docs/09_EDA_HALLAZGOS.md) and
[`docs/hallazgos/`](docs/hallazgos/)):

- Over the ~1–1.4 years of SPHEREx data, these objects move **1–2 pixels** (6.15″ per pixel), not a jump.
- **Epsilon Indi B:** the measured centroid shift between the first and last epoch at matched wavelength
  is −0.85 / −0.71 px (west / north) against −0.92 / −0.57 px predicted from SIMBAD proper motion.
- **WISE 0855:** in band D5, combining 10 exposures per visit, it moved about **1 pixel (~6″) to the west
  in one year**, in the expected direction. With one exposure per visit it is not visible. The magnitude
  comes out ~20 % short of the prediction; this is a visual confirmation, not a precision measurement.
- **Barnard's Star and RW Aurigae saturate:** their cores are masked, so the subtraction shows a red/blue
  pattern even for RW Aur, which does not move. Mission Mode level 4 teaches exactly this.

## 3. How it meets the challenge

Honest status of `main` at commit `13d74da`. "Partial" means it works with limits that are stated.

| Challenge item | Status | What there is |
|---|---|---|
| Public web tool | **Done** | Deployed on Vercel, no login |
| User enters RA/Dec | **Partial** | Main fields take decimal degrees; sexagesimal and names only through the Spherix chat |
| Series of images "like a little video" | **Done** | Explorer: all visits, six bands, timeline, play, keyboard |
| Easy to spot moving objects | **Partial** | Clear for Barnard's Star in the default Explorer; WISE 0855 and Epsilon Indi B need 10 exposures per visit (Mission Mode uses precomputed images) |
| Tested on Barnard, Epsilon Indi B, WISE 0855 | **Done / partial** | All three load; see the table above for what is visible |
| Tested on RW Aur and R Dra (brightness) | **Partial** | Both load; no light curve. R Dra is hidden in Mission Mode because its saturated core does not allow an honest question |
| Easy to update with new releases | **Done (mostly)** | The Explorer queries IRSA live (SIA2, collections `spherex_dr1` + `spherex_qr3`); the sky cube URL is fixed (see §6) |
| Show the 102 bands creatively | **Done** | 102-plane wavelength selector on the sky cube; six bands side by side; Colour mode |
| Add together each detector's data for S/N | **Partial** | Combines up to 10 exposures of the same visit; no co-add across all epochs |
| Spectra on the fly (extra kudos) | **Partial** | Prisma: aperture photometry in the browser across bands; approximate and labelled as such |
| Add or subtract images from different times | **Partial** | Subtraction (vs first visit) yes; adding epochs no |
| Choose the field of view | **Done** | 0.05, 0.1, 0.2, 0.5° |
| Overlay Gaia or WISE | **Done** | Gaia DR3 (propagated to the view epoch), CatWISE2020, SIMBAD; blink against AllWISE and 2MASS images |
| Coordinates in the URL | **Done** | `?ra=&dec=&size=&band=` and `?mision=` |
| Metadata such as contamination flags | **Cut** | The fast reader skips the FLAGS extension; the flag fraction is not shown |
| Use Astropy and Aladin | **Done** | Astropy in the data service; Aladin Lite v3.8.2 in the viewer |

Not done and not claimed: automatic detection, sexagesimal input in the main fields, light curves for
the variable stars, a mobile-tested layout, a link to WiseView or Backyard Worlds.

## 4. Architecture

```
Browser (React + Vite + TypeScript, on Vercel)
 ├─ Aladin Lite v3 ── SPHEREx all-sky HiPS cube (IRSA)  · AllWISE / 2MASS HiPS (IRSA, ESA mirror)
 │                └─ catalogues: Gaia DR3 + CatWISE2020 (VizieR), SIMBAD   (direct, CORS-enabled)
 ├─ Explorer + Prisma ── /proto-api/grid, /proto-api/frame  ──► FastAPI data service (Python, Vercel)
 │                                                                ├─ IRSA SIA2: spherex_dr1 + spherex_qr3
 │                                                                └─ HTTP range reads of the image pixels,
 │                                                                   reprojected north-up, background removed
 └─ Mission Mode ── precomputed frames (public/precalc/mision/*.json)
```

- IRSA does not send CORS headers, so SIA2 queries and image reads go through the Python service
  (`prototipos/rango_fechas/`, deployed as `spherex-prototipo-d2`, reached through the rewrites in
  [`vercel.json`](vercel.json)).
- The fast reader fetches only the IMAGE pixels by HTTP range (measured on Barnard: 11.1 s and 2.1 MB vs
  97.7 s and 112 MB with the cut-out service). It replaces the ZODI extension by the cut-out median and
  does not read FLAGS.
- Consecutive SPHEREx exposures are taken at **different wavelengths** (linear variable filter), and the
  detector orientation flips ~180° between surveys. The service groups exposures into visits and
  reprojects every frame to a common north-up grid before blinking or subtracting.
- `scaffold/backend/` holds the API designed in [`docs/03_ARQUITECTURA.md`](docs/03_ARQUITECTURA.md);
  the production viewer does not call it at `13d74da`.

## 5. Run it locally

Requirements: Node 20, Python 3.11+.

```bash
git clone https://github.com/mauriciovalenzuela742/SPHEREX
cd SPHEREX/scaffold/frontend
npm ci
npm run dev          # http://localhost:5173 ; /proto-api is proxied to the deployed data service
```

To run the data service yourself (from the repository root):

```bash
python -m venv .venv && .venv/bin/pip install -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
```

Then point the `/proto-api` proxy in `scaffold/frontend/vite.config.ts` to `http://localhost:8010`
(rewrite `/proto-api` → `/api`). Production build: `npm run build` (CI runs it on every pull request).
Deployment notes: [`deploy/README.md`](deploy/README.md).

## 6. Adding a new SPHEREx data release

1. **Explorer (time series):** add the new SIA2 collection name to `COLECCIONES` in
   [`prototipos/rango_fechas/spherex.py`](prototipos/rango_fechas/spherex.py) and redeploy the data service
   (`bash deploy/desplegar.sh prototipo`). New files inside existing collections appear without changes:
   queries run live and the date range ends today by default.
2. **Sky cube:** if IRSA publishes a new all-sky HiPS cube, change `SURVEY_SPHEREX` in
   [`scaffold/frontend/src/sky/planos.ts`](scaffold/frontend/src/sky/planos.ts) and check the empty planes
   (`PLANOS_VACIOS`).
3. **Mission Mode:** re-run `scaffold/frontend/scripts/precalcular_mision.ts` to refresh the precomputed
   first/last frames.

## 7. Data sources & acknowledgements

Full list, with every DOI checked, in [`docs/entrega/fuentes_y_citas.md`](docs/entrega/fuentes_y_citas.md).
Texts in quotes are copied verbatim from each provider's official page.

**SPHEREx (NASA), via IRSA** — https://irsa.ipac.caltech.edu/Missions/spherex.html

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**NASA/IPAC Infrared Science Archive (IRSA)** — serves SPHEREx, 2MASS, AllWISE and the HiPS cube.

> This research has made use of the NASA/IPAC Infrared Science Archive, which is funded by the National
> Aeronautics and Space Administration and operated by the California Institute of Technology.

**2MASS** (blink "~2000")

> This publication makes use of data products from the Two Micron All Sky Survey, which is a joint
> project of the University of Massachusetts and the Infrared Processing and Analysis Center/California
> Institute of Technology, funded by the National Aeronautics and Space Administration and the National
> Science Foundation.

Skrutskie, M. F., et al. 2006, AJ, 131, 1163. https://doi.org/10.1086/498708

**AllWISE** (blink "2010")

> This publication makes use of data products from the Wide-field Infrared Survey Explorer, which is a
> joint project of the University of California, Los Angeles, and the Jet Propulsion Laboratory/California
> Institute of Technology, and NEOWISE, which is a project of the Jet Propulsion Laboratory/California
> Institute of Technology. WISE and NEOWISE are funded by the National Aeronautics and Space
> Administration.

Wright, E. L., et al. 2010, AJ, 140, 1868. https://doi.org/10.1088/0004-6256/140/6/1868 ·
Mainzer, A., et al. 2011, ApJ, 731, 53. https://doi.org/10.1088/0004-637X/731/1/53

**CatWISE2020** (catalogue overlay; built from WISE and NEOWISE data) — Marocco, F., et al. 2021, ApJS,
253, 8, https://doi.org/10.3847/1538-4365/abd805 · Eisenhardt, P. R. M., et al. 2020, ApJS, 247, 69,
https://doi.org/10.3847/1538-4365/ab7f2a · datasets DOI 10.26131/IRSA551 and 10.26131/IRSA552.

> This publication makes use of data products from the Wide-field Infrared Survey Explorer, which is a
> joint project of the University of California, Los Angeles, and the Jet Propulsion Laboratory/California
> Institute of Technology, funded by the National Aeronautics and Space Administration.
>
> This publication also makes use of data products from NEOWISE, which is a project of the Jet Propulsion
> Laboratory/California Institute of Technology, funded by the Planetary Science Division of the National
> Aeronautics and Space Administration.

Mainzer, A., et al. 2014, ApJ, 792, 30. https://doi.org/10.1088/0004-637X/792/1/30

**Gaia DR3 (ESA)** — catalogue overlay, queried through VizieR.

> This work has made use of data from the European Space Agency (ESA) mission Gaia
> (https://www.cosmos.esa.int/gaia), processed by the Gaia Data Processing and Analysis Consortium (DPAC,
> https://www.cosmos.esa.int/web/gaia/dpac/consortium). Funding for the DPAC has been provided by national
> institutions, in particular the institutions participating in the Gaia Multilateral Agreement.

Gaia Collaboration, Prusti, T., et al. 2016, A&A, 595, A1, https://doi.org/10.1051/0004-6361/201629272 ·
Gaia Collaboration, Vallenari, A., et al. 2023, A&A, 674, A1, https://doi.org/10.1051/0004-6361/202243940

**ESA Sky HiPS mirror** (`skies.esac.esa.int`) — fallback for the AllWISE and 2MASS images when IRSA does
not respond. [to verify: ESA Sky acknowledgement text]

**SIMBAD (CDS)** — object names, positions and proper motions.

> This research has made use of the SIMBAD database, operated at CDS, Strasbourg, France

Wenger, M., et al. 2000, A&AS, 143, 9. https://doi.org/10.1051/aas:2000332

**VizieR (CDS)**

> This research has made use of the VizieR catalogue access tool, CDS, Strasbourg, France
> (DOI: 10.26093/cds/vizier). The original description of the VizieR service was published in A&AS 143, 23

Ochsenbein, F., Bauer, P., & Marcout, J. 2000, A&AS, 143, 23. https://doi.org/10.1051/aas:2000169

**Aladin Lite v3.8.2 (CDS)** — sky viewer. [to verify: official acknowledgement text at
https://aladin.cds.unistra.fr/AladinLite/doc/ ; the CDS site was down on 2026-11-14. Boch & Fernique 2014,
ASP Conf. Ser. 485, 277 is commonly used but not confirmed as the requested citation.]

**HiPS** — Fernique, P., et al. 2015, A&A, 578, A114, https://doi.org/10.1051/0004-6361/201526075 ;
IVOA standard https://www.ivoa.net/documents/HiPS/ . [to verify: whether CDS asks for this citation]

**Astropy**

> This work made use of Astropy (https://www.astropy.org), a community-developed core Python package and
> an ecosystem of tools and resources for astronomy (Astropy Collaboration 2013, 2018, 2022).

Astropy Collaboration 2013, A&A, 558, A33, https://doi.org/10.1051/0004-6361/201322068 ·
2018, AJ, 156, 123, https://doi.org/10.3847/1538-3881/aabc4f ·
2022, ApJ, 935, 167, https://doi.org/10.3847/1538-4357/ac7c74

**NumPy** — Harris, C. R., et al. 2020, Nature, 585, 357–362. https://doi.org/10.1038/s41586-020-2649-2
**SciPy** — Virtanen, P., et al. 2020, Nature Methods, 17, 261–272. https://doi.org/10.1038/s41592-019-0686-2

**Other software:** React, Vite, TypeScript, FastAPI, httpx, Pillow, PyYAML (no citation requested that
we know of). Used only in the exploratory analysis (`eda/`, notebooks): matplotlib (Hunter 2007, CiSE, 9,
90, https://doi.org/10.1109/MCSE.2007.55 [to verify: official citing page]), pandas, PyVO and reproject
[to verify: citation requests].

**Inspiration:** [WiseView](http://byw.tools/wiseview) and the Backyard Worlds citizen-science project,
named in the challenge resources.

## 8. Use of Super Intelligence (SI)

Space Apps 2026 asks teams to state where SI tools were used. Ours:

- **Code and documentation assistants.** The team used **Claude Code** (Anthropic; Claude Opus and
  Sonnet models) to write and revise code, tests, data scripts and documentation. On `main` at `13d74da`,
  156 of the 157 non-merge commits carry a `Co-Authored-By: Claude …` trailer, which is how SI-assisted
  code is marked in this repository's metadata. [TO CONFIRM: whether Antigravity / Gemini or any other
  assistant was also used, and by whom.]
- **How it was controlled.** Project rules and conventions are versioned in [`AGENTS.md`](AGENTS.md).
  Changes entered `main` through pull requests merged by a team member, and features were checked by
  opening them against real data. [TO CONFIRM: that every pull request had human review.]
- **What SI did not do.** No SI model generated, completed or altered scientific data. Every image the
  tool shows comes from SPHEREx, 2MASS or AllWISE archives, and catalogue positions come from Gaia,
  CatWISE2020 and SIMBAD. The in-app assistant *Spherix* is a deterministic rule-based script written with
  the team's texts: it does not call any language model.
- **Generated media.** [TO CONFIRM: whether any image, icon, video, slide or audio in the tool, the demo or
  the presentation was SI-generated. If so, it must carry a visible SI watermark (images and video) or a
  text and metadata notice (audio).] Figures in `docs/` are plots produced by the team's analysis scripts.
- **The idea.** [TO CONFIRM: the team's own statement that the solution idea was not produced by SI, as
  the rules require.]

## Team

Mauricio Valenzuela · Bryan Cabezas · Juan Pablo Castillo · Antonia Del Castillo · Javiera
[TO CONFIRM surname] · Vladimir [TO CONFIRM surname].

Up to 2026-11-13 this repository only held planning documents and a working kit; code that solves the
challenge was written from the official start on 2026-11-14 (see
[`docs/08_REGLAS_DEL_EVENTO.md`](docs/08_REGLAS_DEL_EVENTO.md)). Team process and internal documents are
in Spanish under [`docs/`](docs/).

## License

Code under the MIT License ([`LICENSE`](LICENSE)). Data belong to their providers and are used under their
terms; see §7.
