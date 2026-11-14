<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/KIT.md) · [中文](../../zh/docs/KIT.md) · [Deutsch](../../de/docs/KIT.md) · [Italiano](../../it/docs/KIT.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/KIT.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# SPHEREx Kit — NASA Space Apps Challenge 2026

The team's working kit for the **Planet X and SPHEREx** challenge (difficulty: Advanced).
It is a toolbox: documentation, bibliography, conventions and generic scaffolding
so that six people and their AI agents can work in parallel without stepping on each other during the event.

> **Status as of Nov 14 (event in progress):** since Nov 14 there is an EDA (`eda/`) and a viewer in
> `scaffold/frontend/` (see [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)). Before the event there was
> not a single line of code that solved the challenge, because the event rules
> forbid working on the challenges before the hackathon. What there is, is reference material
> (public, from NASA and from the literature) and generic web scaffolding —a FastAPI "hello world"
> and a Vite/React one— equivalent to having the editor configured. See [`docs/08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md).

---

## The challenge in one sentence

Build **a public web tool** where anyone types some sky coordinates
(right ascension and declination) and sees that region of the sky **as a little video**: the sequence of
SPHEREx images over time, to detect by eye what moves or changes brightness.

The model declared by NASA is [WiseView](http://byw.tools/wiseview), the tool with which
[Backyard Worlds](https://backyardworlds.org) volunteers have discovered hundreds of brown dwarfs.
Full text of the challenge in [`docs/00_DESAFIO.md`](00_DESAFIO.md).

**What this is NOT:** it is not a video classification model, it is not an automatic detector,
it is not a scientific pipeline. It is a viewer. Any ML layer is optional and goes on top, never
in place of the viewer. This is argued in [`docs/01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md).

---

## Start in 10 minutes

1. Read this README and [`docs/00_DESAFIO.md`](00_DESAFIO.md) (5 min). It is the only text that is mandatory.
2. Coming without context? Read [`docs/briefings/`](../../../docs/briefings/) — the two summaries cover the whole project in one go.
3. Look at your role in [`docs/04_METODOLOGIA.md`](04_METODOLOGIA.md#roles) and the 24 h plan in [`docs/05_PLAN_24H.md`](05_PLAN_24H.md).
4. Open Claude Code at the repo root. It automatically reads `CLAUDE.md`; the skills in `.claude/skills/`
   activate on their own when appropriate.
5. If you have backend or data: skim [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md). It is the technical sheet
   of where the data lives and how it is requested. It is the densest document and the one that saves the most time.
6. If you have frontend: skim [`docs/03_ARQUITECTURA.md`](03_ARQUITECTURA.md) and the `visor-sky-blink` skill.

---

## Kit map

| Folder | What it contains | When you open it |
|---|---|---|
| `docs/` | Challenge, state of the art, data sheet, architecture, methodology, plan, jury, risks | Always; it is the source of truth |
| `docs/briefings/` | Two narrative summaries of the whole project, to read in one go. They also exist as audio | To arrive with context in 20 minutes |
| `docs/adr/` | Architecture decisions, one per file | When the team decides something that is costly to reverse |
| `biblio/` | Annotated bibliography, paper sheets, relevant GitHub repos | When you need backing or a proven idea |
| `data/` | Test fields with coordinates, reference catalogs. **No versioned FITS** | When testing the viewer |
| `.claude/skills/` | Eight skills: five own (SPHEREx data, viewer, coordinates, demo/pitch, submission) and three generic (astropy, matplotlib, scikit-learn) | Claude loads them on its own |
| `.claude/agents/` | Specialized subagents (data explorer, scientific reviewer, UI reviewer) | When you delegate a bounded part |
| `.claude/commands/` | `/standup`, `/traspaso`, `/chequeo-demo`, `/verifica-cifra`, `/riesgo` | During the event, by hand |
| `scaffold/` | Generic backend + frontend skeleton, Docker, CI | Hour 0 of the event |
| `AGENTS.md` | Instructions for **any** agent. Single source | Agents read it, not you |
| `CLAUDE.md` / `GEMINI.md` | Pointers to `AGENTS.md` + what is specific to each tool | Same |

---

## The four team rules

1. **The deliverable is the viewer working with real coordinates.** Everything else is decoration.
   If at 20 hours there is no little video on screen, anything gets cut.
2. **Nothing is taken for granted without looking at it.** An agent saying "it works now" is a data point, not a fact:
   you open the URL, look at the image, compare with SIMBAD. An empty result does not prove that something does not exist.
3. **No figure without a source.** What is said in the pitch or the README has to be
   openable and checkable. Use `/verifica-cifra`.
4. **Nobody commits to `main` without someone else looking at it.** Four people with agents in parallel
   break `main` in minutes. See [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Status

- **Today (Nov 14, event in progress):** published on GitHub (`mauriciovalenzuela742/SPHEREX`), with PRs #1 to #6 merged and the viewer deployed on Vercel (https://spherex-planet-x-tau.vercel.app).
- **Before the event (until Nov 13):** only documentation, bibliography and generic scaffolding, local.

Planned license: MIT (see [`LICENSE`](../../../LICENSE)). SPHEREx data are public and require
the acknowledgment note found in [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## Installing the kit (for teammates)

**Simplest: clone the repository and open Claude Code at the root.**
`CLAUDE.md`, the skills in `.claude/skills/`, the subagents and the commands load on their own.
There is nothing to install.

```bash
git clone <url-del-repo>
cd spherex_kit
claude
```

Check: type `/standup`. If the command exists, the kit is loaded.

Whoever uses **Antigravity or Gemini** reads `AGENTS.md` and `GEMINI.md`; they point to the same thing.

### If someone wants the skills outside this repository

The kit is also packaged as a plugin (`.claude-plugin/plugin.json` and
`.claude-plugin/marketplace.json`), to use it from another folder. It is optional: inside the
repository it is not needed.

---

## Verification status of this kit

Written on **November 14, 2026**. What is checked and what is not:

| | Status |
|---|---|
| Challenge text and *Resources* list | ✅ Read from the official page that day |
| IRSA endpoints, SIA2 collections, MEF structure, bands, HiPS cube | ✅ Against IRSA's official documentation |
| Backend skeleton | ✅ It runs: `/health` responds `200 {"ok": true}` |
| Frontend skeleton | ✅ It builds in CI and runs in production (Vercel) |
| Bibliography | 🟡 Partial. Each entry carries its status in [`biblio/README.md`](../biblio/README.md) |
| Coordinates of the test fields | ✅ All five verified in SIMBAD (CfA mirror) on Nov 14. Two traps appeared: the brief's coordinate for WISE 0855 is from epoch 2010, and `eps Ind b` ≠ `eps Ind B` |
| SPHEREx pixel scale (6.15"/px) | ✅ Confirmed in SIA2 on Nov 14 (`s_pixel_scale`, `docs/09`). The sub-pixel motion depends on it (risk R10) |
| That Aladin Lite loads the DR1 HiPS cube | ✅ Yes, it loads (Aladin Lite 3.8.2, PNG HiPS from `/data/hips/SPHEREx/spherex_allsky_cube`, Nov 14; `docs/09`) |

What is not verified is marked as such in each document. **Do not take it as certain because it is
written here.**
