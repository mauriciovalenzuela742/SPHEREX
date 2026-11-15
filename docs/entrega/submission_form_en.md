# Submission form draft (English) · NASA Space Apps 2026 · Planet X and SPHEREx

Draft for the team's Project page. **Nobody submits from this file: a team member pastes, reviews and
clicks "Submit for Judging".** Everything below must stay in English (official rule).

**Source of the field list:** official Project Submission Guide,
https://www.spaceappschallenge.org/resources/project-submission-guide/ (read 2026-11-14). The guide lists
these fields, in this order. It gives **no character or word limits** and **no tags field**; if the live
form shows a limit or a tags box, the form wins: shorten here and note it.

| # | Field on the form | Status of this draft |
|---|---|---|
| 1 | Project Name | Ready, name [TO CONFIRM] |
| 2 | High-Level Project Summary | Ready |
| 3 | Link to Project Demo | [TO ADD] |
| 4 | Link to Final Project | Ready (tool); repo link only if public |
| 5 | Detailed Project Description | Ready |
| 6 | Use of Super Intelligence (SI) | Draft with [TO CONFIRM] items |
| 7 | NASA Data | Ready |
| 8 | Space Agency Partner Data and Other References | Ready, items "to verify" marked |
| — | Checkboxes: Terms and Conditions; Confirm All Work is Original | The team ticks them |

Markers: **[TO CONFIRM]** = a fact only the team can state. **[TO ADD]** = a link that does not exist yet.
**to verify** = an official citation text that could not be read on 2026-11-14.

---

## 1. Project Name

AstroTRACK

<!-- [TO CONFIRM] Name shown on the landing page (PR #37); the team has not confirmed it as final. -->

## 2. High-Level Project Summary

AstroTRACK is a free public web tool that turns NASA SPHEREx data into a "blink comparator" anyone can
use. You type a position in the sky (or pick one of the challenge's five test objects) and the tool plays
every SPHEREx visit to that patch as a short video, in all six detector bands, with a subtraction mode
where anything that moved shows up as a red/blue pair. It also blinks SPHEREx against 2MASS (~2000) and
AllWISE (2010) images, overlays Gaia DR3, CatWISE2020 and SIMBAD, and estimates a spectrum across the
bands on the fly. This is the technique that found Pluto and that citizen scientists still use to find
brown dwarfs; our goal is that students, teachers and curious people, not only astronomers, can use real
SPHEREx data to look for things that move. A guided tutorial and a Mission Mode teach the method step by
step, and every view is a shareable URL.

## 3. Link to Project Demo

[TO ADD: public link (YouTube / Google Drive / GitHub) to a video of **30 seconds or less**, with English
subtitles if spoken in Spanish, **or** to a deck of **at most 7 slides in English** (title and intro
slides included). Test it in a private browser window before pasting.]

## 4. Link to Final Project

https://spherex-planet-x-tau.vercel.app

Source code: https://github.com/mauriciovalenzuela742/SPHEREX
<!-- [TO CONFIRM] On 2026-11-14 the repository answered 404 without login (private). Either make it public
     or delete this line: the rules require links that open with no login or permission. -->

## 5. Detailed Project Description

**The problem.** SPHEREx maps the whole sky every six months in 102 infrared bands (0.75–5 µm). Its data
can reveal nearby stars and brown dwarfs by their motion, but looking for motion means comparing images of
the same patch taken at different times, and today that requires downloading files and astronomy
software. The challenge asks for a public tool that makes this easy for anyone.

**What it does.**
- **Viewer:** enter R.A./Dec (decimal degrees; the assistant also accepts sexagesimal and object names),
  choose the field of view (0.05–0.5°) and the detector band. One-click buttons for Barnard's Star,
  Epsilon Indi B, WISE 0855−0714, RW Aurigae and R Draconis, centred on their positions today.
- **Explorer (time):** every SPHEREx visit to that position, six bands at once, on a timeline
  proportional to the date. Modes: Image, Subtract vs first visit (red = appeared, blue = was there), and
  Colour (first visit red, latest cyan). Up to 10 exposures per visit can be combined to bring out faint
  objects.
- **Sky (Aladin Lite):** the SPHEREx all-sky cube with its 102 wavelength planes; blink against 2MASS
  (~2000) and AllWISE (2010) images; Gaia DR3 (propagated to the view epoch), CatWISE2020 and SIMBAD
  markers.
- **Prisma:** the same object across the bands and an approximate spectrum measured in the browser
  (labelled as approximate).
- **Learning path:** a guided tutorial with the mascot Spherix, a rule-based assistant (no AI model, no
  API key) and Mission Mode: four levels with real SPHEREx images, including one that teaches why a
  saturated star can look as if it moved when it did not.
- **Shareable:** the position, band, field of view and Mission level live in the URL.

**How it works.** React + TypeScript front end on Vercel. A Python (FastAPI + Astropy + NumPy/SciPy) data
service queries IRSA's SIA2 service live (collections spherex_dr1 and spherex_qr3), reads only the image
pixels it needs through HTTP range requests, groups exposures into visits, and reprojects each frame to a
common north-up grid. Two traps we had to solve: consecutive SPHEREx exposures are at different
wavelengths (linear variable filter), and the detector orientation flips ~180° between surveys; blinking
without handling both shows colour and rotation, not motion. Aladin Lite displays IRSA's SPHEREx HiPS cube
and the catalogues.

**What we checked.** On real data, Epsilon Indi B's measured shift between first and last epoch
(−0.85 / −0.71 px) matches the shift predicted from its proper motion (−0.92 / −0.57 px). WISE 0855 moves
about 1 pixel (~6″) west in one year, in the expected direction, when 10 exposures per visit are
combined. We also found that bright stars saturate and leave a red/blue pattern even when they do not
move (RW Aurigae), and the tool teaches that instead of hiding it.

**Limits, stated honestly.** The interface is in Spanish [TO CONFIRM if an English UI ships]; contamination
flags are not displayed; epochs can be subtracted but not added; the variable stars have no light curve;
the spectrum is approximate; the layout was not tested on mobile.

**What we hope to achieve.** A bridge between SPHEREx's open data and classrooms (UN SDG 4, Quality
Education [TO CONFIRM SDG choice]): a teacher sends a Mission link, students repeat Tombaugh's method with
data taken months ago. Next steps: English interface, co-adding all epochs per detector, contamination
flags, light curves, and a "report a candidate" flow towards citizen-science projects such as Backyard
Worlds.

**Tools:** TypeScript, React, Vite, Aladin Lite v3.8.2, Python, FastAPI, Astropy, NumPy, SciPy, httpx,
Pillow, Vercel, GitHub.

## 6. Use of Super Intelligence (SI)

(The guide says this answer is for data collection and is not shown to judges; the SI markers inside the
project are. The same text is in the README, section 8.)

Yes. We used Claude Code (Anthropic; Claude Opus and Sonnet models) as a coding and documentation
assistant during the event: to write and revise the front end, the data service, analysis scripts, tests
and documentation, following project rules versioned in the repository (AGENTS.md). In the repository
metadata, 156 of the 157 non-merge commits on main carry a "Co-Authored-By: Claude" trailer. [TO CONFIRM:
other assistants used, e.g. Antigravity / Gemini.] Changes were merged through pull requests by a team
member and checked by opening them against real data [TO CONFIRM: human review on every pull request].
No SI generated, completed or altered scientific data: all images come from SPHEREx, 2MASS and AllWISE
archives, and catalogue positions from Gaia, CatWISE2020 and SIMBAD. The in-app assistant Spherix is a
rule-based script and does not use a language model. [TO CONFIRM: whether any image, video, slide or
audio was SI-generated; if so it carries a visible SI watermark or a text/metadata notice.] [TO CONFIRM:
statement that the solution idea came from the team, not from SI.]

## 7. NASA Data

- **SPHEREx** (NASA/JPL-Caltech), Data Release 1 and Quick Release 3 spectral images, queried through
  IRSA's SIA2 service (collections spherex_dr1, spherex_qr3) — https://irsa.ipac.caltech.edu/Missions/spherex.html
- **SPHEREx all-sky HiPS cube** (102 wavelength planes) served by IRSA —
  https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube
- **NASA/IPAC Infrared Science Archive (IRSA)** — SIA2 search and image access.
- **AllWISE** (WISE/NEOWISE) W2 images, HiPS served by IRSA — blink "2010".
- **2MASS** (NASA/NSF) colour images, HiPS served by IRSA — blink "~2000".
- **CatWISE2020** catalogue (built from WISE and NEOWISE data), queried through VizieR.

Acknowledgement texts and citations: README section 7 and `docs/entrega/fuentes_y_citas.md`.

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

> This research has made use of the NASA/IPAC Infrared Science Archive, which is funded by the National
> Aeronautics and Space Administration and operated by the California Institute of Technology.

## 8. Space Agency Partner Data and Other References

**Space Agency Partner (ESA):**
- **Gaia DR3** (ESA/Gaia/DPAC), catalogue overlay via VizieR. Gaia Collaboration, Prusti et al. 2016,
  A&A 595, A1; Gaia Collaboration, Vallenari et al. 2023, A&A 674, A1.
- **ESA Sky HiPS** (skies.esac.esa.int), fallback for the AllWISE and 2MASS images. [to verify:
  acknowledgement text]

**Other data and services:**
- SIMBAD (CDS, Strasbourg): "This research has made use of the SIMBAD database, operated at CDS,
  Strasbourg, France". Wenger et al. 2000, A&AS 143, 9.
- VizieR (CDS): "This research has made use of the VizieR catalogue access tool, CDS, Strasbourg, France
  (DOI: 10.26093/cds/vizier). The original description of the VizieR service was published in A&AS 143, 23"
- CatWISE2020: Marocco et al. 2021, ApJS 253, 8; Eisenhardt et al. 2020, ApJS 247, 69.
- WISE / NEOWISE: Wright et al. 2010, AJ 140, 1868; Mainzer et al. 2011, ApJ 731, 53; Mainzer et al.
  2014, ApJ 792, 30.
- 2MASS: Skrutskie et al. 2006, AJ 131, 1163.
- HiPS format: Fernique et al. 2015, A&A 578, A114. [to verify: whether CDS requests it]
- Proper motions of the test objects: SIMBAD.

**Software:**
- Aladin Lite v3.8.2 (CDS) — [to verify: official acknowledgement text]
- Astropy: "This work made use of Astropy (https://www.astropy.org), a community-developed core Python
  package and an ecosystem of tools and resources for astronomy (Astropy Collaboration 2013, 2018, 2022)."
- NumPy (Harris et al. 2020, Nature 585, 357); SciPy (Virtanen et al. 2020, Nature Methods 17, 261).
- React, Vite, TypeScript, FastAPI, httpx, Pillow, PyYAML (open source, MIT/BSD-style licences).
- Analysis only: matplotlib, pandas, PyVO, reproject. [to verify: citation requests]

**Inspiration:** WiseView (byw.tools/wiseview) and the Backyard Worlds project, listed in the challenge
resources (not used in the code).

**Images and text:** all images in the tool come from the archives above. Interface texts were written by
the team. [TO CONFIRM: any third-party icon, font or image in the presentation, and its licence.]

---

## Tags

The guide does not describe a tags field. If the form shows one, suggested tags: `SPHEREx`, `infrared`,
`citizen science`, `education`, `proper motion`, `brown dwarfs`, `blink comparator`, `Aladin`, `open data`.
