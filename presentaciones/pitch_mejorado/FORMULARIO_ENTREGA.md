# Submission form · final text (15-nov-2026, 10:00)

Based on the team draft `docs/entrega/submission_form_en.md` (branch `n/entrega-en`), updated to what the app does
today. Juan Pablo (team lead) reviews it and clicks **Submit for Judging**; nobody else submits.

---

## 1. Project Name

AstroTRACK

## 2. High-Level Project Summary

AstroTRACK is a free, public web tool, in English and Spanish, that turns NASA SPHEREx data into a "blink
comparator" anyone can use. Pick one of the challenge's test objects or type a position, and you see the SPHEREx
photos of that patch of sky on each visit. Mark two dates and subtract them: anything that moved shows up as a
red/blue pair. One switch opens the science tools: every visit in six detector bands, the object's spectrum
across SPHEREx's 102 colors with a simple, transparent reading of what it looks like, a blink against 2MASS
(~2000) and WISE (2010) images, and Gaia DR3, CatWISE2020 and SIMBAD overlays. This is the technique that found
Pluto and that citizen scientists still use to find brown dwarfs; our goal is that students, teachers and curious
people, not only astronomers, can look for things that move with real SPHEREx data, and leave notes for the next
explorer.

## 3. Link to Project Demo

DRIVE_LINK

(30-second video, English subtitles, recorded from the real app.)

## 4. Link to Final Project

https://spherex-planet-x-tau.vercel.app

## 5. Detailed Project Description

**The problem.** SPHEREx maps the whole sky every six months in 102 infrared bands (0.75–5 µm). Its data can
reveal nearby stars and brown dwarfs by their motion, but looking for motion means comparing images of the same
patch taken at different times, and today that requires downloading files and astronomy software. The challenge
asks for a public tool that makes this easy for anyone.

**What it does.** The tool has two levels, so it is simple to start and deep on demand:
- **Simple view (anyone):** a SPHEREx photo of the chosen object; buttons for Barnard's Star, Epsilon Indi B,
  WISE 0855−0714, RW Aurigae and R Draconis, centred on their positions today; dates to step through or play;
  "light" buttons that group the bands (near, middle, far infrared); and "compare two dates" (A − B), where an
  object that moved appears as a red/blue pair.
- **Science mode (one switch):**
  - **Explorer:** every SPHEREx visit in six bands on a timeline; image, subtraction against the first visit and
    color modes; the median of up to 10 exposures per visit to bring out faint objects; a warning when a visit
    has only one or two exposures (the median cannot remove cosmic rays then).
  - **Sky map (Aladin Lite):** the SPHEREx all-sky cube with its 102 wavelength planes; blink against 2MASS
    (~2000) and AllWISE (2010) images with circles showing where a moving object should be at each epoch; Gaia
    DR3, CatWISE2020 and SIMBAD markers.
  - **Prism:** the object's spectrum from every SPHEREx exposure, with the regions where water, methane and CO₂
    absorb; an "object card" that reads the shape with simple, stated rules (Epsilon Indi B: "looks like a brown
    dwarf"; RW Aurigae: "a young star with dust" whose spectrum changed between passes); and "what changed
    between passes".
- **Learning path:** a guided tutorial with the mascot Spherix (a rule-based assistant, no AI model), and
  Mission Mode with real SPHEREx images.
- **Community:** comments per object, saved in the browser and exportable to the project.
- **Shareable:** the position, band and view live in the URL.

**How it works.** React + TypeScript front end on Vercel. A Python (FastAPI + Astropy + NumPy) data service
queries IRSA's SIA2 service (collections spherex_dr1 and spherex_qr3), reads only the image pixels it needs, groups
exposures into visits and reprojects each frame to a common north-up grid. Two traps we had to solve: consecutive
SPHEREx exposures are at different wavelengths (linear variable filter), and the detector orientation flips ~180°
between surveys; blinking without handling both shows color and rotation, not motion.

**What we checked on real data.** Using SPHEREx images only, with no external catalogues, we measured WISE
0855−0714 moving 8.67″ ± 0.66″ in one year, against 8.04″ predicted by its proper motion and parallax. Where it
blends with a background star, its infrared "fingerprint" (it barely emits below 3.5 µm) separates the two, and
subtracting a fixed share of the short-wavelength image removes the still stars around it. The thresholds were
tuned on this same field, so it still has to be tested on others. Epsilon Indi B's shift between visits matches
its proper motion, and bright stars that saturate (Barnard, R Draconis) are flagged instead of hidden.

**Limits, stated honestly.** People look; the tool does not detect objects on its own. Contamination flags are
not displayed; epochs can be subtracted but not added; variable stars have no light curve; the spectrum uses a
fixed aperture and is approximate; the layout was not tested on mobile; live images depend on IRSA, which was not
responding on the morning of 15 November.

**What we hope to achieve.** A bridge between SPHEREx's open data and classrooms (UN SDG 4, Quality Education):
a teacher sends a link, students repeat Tombaugh's method with data taken months ago. Next steps: co-adding all
epochs, contamination flags, light curves, and a "report a candidate" flow towards citizen-science projects such
as Backyard Worlds.

**Tools:** TypeScript, React, Vite, Aladin Lite v3.8.2, Python, FastAPI, Astropy, NumPy, SciPy, Vercel, GitHub.

## 6. Use of Super Intelligence (SI)

Yes. We used two AI assistants during the event: Claude Code (Anthropic; Claude Opus and Sonnet models) and
Antigravity (Google). They helped write and revise the front end, the data service, analysis scripts, tests and
documentation, following project rules versioned in the repository. In the repository metadata, 233 of the 234
non-merge commits on main carry a "Co-Authored-By: Claude" trailer. Changes were merged through pull requests by a
team member and checked against real data. No SI generated, completed or altered scientific data: all images
come from the SPHEREx, 2MASS and AllWISE archives, and catalogue positions from Gaia, CatWISE2020 and SIMBAD. The
demo video is a screen recording of the real app, not SI-generated. The in-app assistant Spherix is a rule-based
script and does not use a language model. IDEA_LINE

## 7. NASA Data

- **SPHEREx** (NASA/JPL-Caltech), Data Release 1 and Quick Release 3 spectral images, via IRSA's SIA2 service
  (collections spherex_dr1, spherex_qr3) — https://irsa.ipac.caltech.edu/Missions/spherex.html
- **SPHEREx all-sky HiPS cube** (102 wavelength planes), served by IRSA —
  https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube
- **NASA/IPAC Infrared Science Archive (IRSA)** — SIA2 search and image access.
- **AllWISE** (WISE/NEOWISE) W2 images, HiPS served by IRSA — blink "2010".
- **2MASS** (NASA/NSF) images, HiPS served by IRSA — blink "~2000".
- **CatWISE2020** catalogue (built from WISE and NEOWISE data), via VizieR.

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration. This
research has made use of the NASA/IPAC Infrared Science Archive, which is funded by the National Aeronautics and
Space Administration and operated by the California Institute of Technology.

## 8. Space Agency Partner Data and Other References

**Space Agency Partner (ESA):** Gaia DR3 (ESA/Gaia/DPAC), catalogue overlay via VizieR (Gaia Collaboration, Prusti
et al. 2016, A&A 595, A1; Vallenari et al. 2023, A&A 674, A1).

**Other data and services:** SIMBAD and VizieR (CDS, Strasbourg; Wenger et al. 2000, A&AS 143, 9; Ochsenbein et
al. 2000, A&AS 143, 23); CatWISE2020 (Marocco et al. 2021, ApJS 253, 8); WISE/NEOWISE (Wright et al. 2010, AJ 140,
1868; Mainzer et al. 2014, ApJ 792, 30); 2MASS (Skrutskie et al. 2006, AJ 131, 1163); HiPS (Fernique et al. 2015,
A&A 578, A114).

**Software:** Aladin Lite v3.8.2 (CDS); Astropy (Astropy Collaboration 2013, 2018, 2022); NumPy (Harris et al.
2020); SciPy (Virtanen et al. 2020); React, Vite, TypeScript, FastAPI (open source).

**Inspiration:** WiseView and the Backyard Worlds project, listed in the challenge resources.
