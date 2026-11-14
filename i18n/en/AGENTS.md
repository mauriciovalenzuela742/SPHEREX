<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../es/AGENTS.md) · [中文](../zh/AGENTS.md) · [Deutsch](../de/AGENTS.md) · [Italiano](../it/AGENTS.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `AGENTS.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# AGENTS.md — instructions for agents in this repository

This file is the **single source**. `CLAUDE.md` and `GEMINI.md` point here and only add what is
specific to each tool. If you fix something, fix it here.

---

## 1. What we are building

A **public web tool** for the *Planet X and SPHEREx* challenge of NASA Space Apps 2026.
The user enters RA/Dec; the tool shows the time sequence of SPHEREx images of
that region of the sky, like a little video, so that you can see by eye what moves or changes brightness.

The full text of the challenge is in `docs/00_DESAFIO.md`. **Read it before proposing an architecture.**
It is common for an agent to assume this is a classification problem with video models:
it is not. The deliverable that is judged is the viewer.

## 2. Non-negotiable rules

1. **Do not invent data, endpoints, parameters or results.** If you did not verify it, say so: "I did not
   check it" or "according to IRSA's documentation, which I did not open". An invented endpoint costs an
   hour of debugging at 3 in the morning.
2. **Verify the artifact, not the report.** Before saying something works: open the URL, look at
   the FITS, count the epochs, compare the position with SIMBAD. A `200 OK` does not prove that the image
   is of the right piece of sky.
3. **An empty result does not prove that something does not exist.** If a query returns nothing, try
   another collection, another radius, another epoch, before concluding "there is no data there".
4. **No figure without a source.** Every number that reaches the README, the pitch or the interface has
   to be openable and checkable. Leave the link or the file next to it.
5. **Do not commit to `main`.** Work on your branch. See `CONTRIBUTING.md`.
6. **Do not download FITS into the repository.** They go to `data/cache/`, which is in `.gitignore`.
   A SPHEREx MEF weighs about 70 MB.
7. **Do not publish anything outward** —deploying to a public domain, posting to social networks, sending
   emails, opening issues in other people's repositories— without a person explicitly approving it.
8. **Event rules:** the hackathon started on Nov 14, 2026 at 10:00; before that, no code was written that
   solves the challenge. See `docs/08_REGLAS_DEL_EVENTO.md`.

## 3. Decided stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Python 3.11 + FastAPI + uvicorn | `astropy`/`pyvo`/`astroquery` only exist in Python |
| Data access | `pyvo` (SIA2) and direct HTTP to IRSA's cutout service | It is the route documented by IRSA |
| Image | `astropy.io.fits`, `astropy.wcs`, `astropy.visualization` | Community standard |
| Frontend | React + Vite + TypeScript | Quick to set up, the team knows it |
| Sky | Aladin Lite 3.8.2 (pinned) on the IRSA HiPS cube; Gaia and SIMBAD with Harvard mirrors | Solves sky context and overlays without writing them |
| Cache | Local disk (`data/cache/`), optional Redis | Cutouts are slow; without a cache the demo falls over |
| Deployment | Frontend on Vercel (only Mauricio has access); backend to be decided (ADR-001) | See `docs/03_ARQUITECTURA.md` |

This decision is in `docs/adr/ADR-001-stack.md`. **Do not change it on your own.** If you think it is
wrong, write a new ADR and bring it to the team.

## 4. API contract

Frontend and backend are developed in parallel against a contract fixed in hour 1. The contract
lives in `docs/03_ARQUITECTURA.md` and is the only thing both sides can take as certain.
**If you change the contract, change it first in the document**, announce it in the team channel and only
then touch the code. A silent contract change blocks someone else without them knowing.

## 5. How to work here

**Before writing code**

- Read the document in `docs/` that covers your part. They are written so that you do not have to read
  all of IRSA's documentation.
- If the task touches SPHEREx data, the `spherex-datos` skill has endpoints, bands and file structure
  already verified against the official documentation.

**While you work**

- Small, verifiable changes. No big rewrites in the middle of the event.
- Every function that touches sky coordinates carries a test with a field from `data/campos_de_prueba.yml`.
- If something takes you more than 30 minutes without progress, **stop it and say so**. At a hackathon the cost of
  insisting is higher than the cost of changing approach.

**When finished**

- Say what you checked and how. Not "it works", but: "I opened `/api/epochs?ra=...&dec=...`, it returned
  14 epochs between 2025-05 and 2026-10, I compared the first one with IRSA's Data Explorer and it matches".
- Say what you did **not** check. It is just as important.

## 6. How to report

- Conclusion first, then detail.
- A problem is reported with its solution or with the option you recommend, not just with the error.
- No internal jargon, no commit hashes, no long paths, when you are talking to someone who
  was not in the detail.
- If you failed, say so. A wrong deliverable that arrives without warning is worse than announcing that something failed.

## 7. Minimal glossary

So that an agent without an astronomy background does not write absurd things.

- **RA / Dec** — right ascension and declination, the sky coordinates. RA is given in hours
  (`08h55m10.831s`) or in degrees (0–360); Dec in degrees (−90 to +90). **Confusing hours with degrees is
  the most common error**: there is a factor of 15 between the two.
- **Epoch** — an observation at a given instant. The "little video" is the same region of the sky in
  different epochs, ordered in time.
- **Pointing / sweep** — a pointing is one telescope position (a sky position falls in 2
  files per pointing: pairs D1+D4, D2+D5, D3+D6); a sweep is a complete pass over the sky
  (1-6 weeks, ~6 months between sweeps). **A sweep is not an epoch**: for the video, the unit is
  the sweep (`docs/09`).
- **Proper motion** — apparent displacement of a star across the sky, in milliarcseconds per
  year (mas/yr). It is what makes a nearby star move between epochs.
- **Parallax** — apparent wobble due to the Earth's motion around the Sun. A period of one
  year; it is what gives the distance.
- **FITS** — standard astronomical image format. A **MEF** is a FITS with several extensions
  (image, variance, flags, etc.) in the same file.
- **WCS** — the FITS header information that translates pixel ↔ sky coordinate.
- **Cutout** — a crop of a large image around a position.
- **HiPS** — CDS hierarchical tile format that allows navigating the whole sky in the
  browser. It is what Aladin Lite consumes.
- **LVF** — linear variable filter. SPHEREx's optical trick: the wavelength changes along
  one axis of the detector, so *where* a source falls in the image determines *at which
  wavelength* it is being measured. Practical consequence: two images of the same region of the
  sky may not be comparable if they were taken at different wavelengths.
- **Brown dwarf** — object between planet and star. Cold, red, bright in the infrared:
  exactly what SPHEREx sees well and what the Backyard Worlds volunteers look for.

## 8. Where the truth is

| Question | Document |
|---|---|
| What exactly does the challenge ask for? | `docs/00_DESAFIO.md` |
| What has been done before and what works? | `docs/01_ESTADO_DEL_ARTE.md` |
| How do I request SPHEREx data? | `docs/02_DATOS_SPHEREX.md` and skill `spherex-datos` |
| How is the system built? | `docs/03_ARQUITECTURA.md` |
| Who does what and how do we coordinate? | `docs/04_METODOLOGIA.md` |
| What is up now? | `docs/05_PLAN_24H.md` |
| What does the jury reward? | `docs/06_JURADO_Y_PITCH.md` |
| What can go wrong? | `docs/07_RIESGOS.md` |
| What can we legally do and when? | `docs/08_REGLAS_DEL_EVENTO.md` |
| What did the real data show? | `docs/09_EDA_HALLAZGOS.md` |
| Who does what after the EDA? | `docs/10_REPARTO_DE_TRABAJO.md` |
| How was it measured and how is it repeated? | `eda/README.md` |
| What does the interface look like? | `docs/diseno/` |
| How is the kit used? | `docs/KIT.md` |
| Papers and repositories | `biblio/README.md` |

If a document contradicts this file, **the document rules** and you fix this one.
