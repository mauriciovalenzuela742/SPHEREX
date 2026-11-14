<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/08_REGLAS_DEL_EVENTO.md) · [中文](../../zh/docs/08_REGLAS_DEL_EVENTO.md) · [Deutsch](../../de/docs/08_REGLAS_DEL_EVENTO.md) · [Italiano](../../it/docs/08_REGLAS_DEL_EVENTO.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/08_REGLAS_DEL_EVENTO.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 08 — Event rules and what we can do beforehand

This document exists so that nobody has doubts about what is legitimate to prepare before the hackathon
and what is not. The rules apply to the whole team and to its agents.

---

## The rule that matters

The NASA Space Apps rulebook says, verbatim:

> Teams are not allowed to begin working on the challenges prior to the hackathon.

It is not permitted to **start working on the challenge** before the hackathon.

## How we interpret it

The rule forbids getting a head start on the solution, it does not forbid knowing how to read. Our criterion, conservative:

### Yes, before the event

- **Read** the statement, the *Resources* and the public documentation of NASA, IRSA and CDS.
- **Research the state of the art**: papers, public repositories, tools that already exist.
- **Write documentation**: what we know about the instrument, what formats there are, what has been done before.
- **Agree on how we will work**: roles, branches, schedules, cut criteria.
- **Prepare the environment**: install Python, Node, Docker; configure the editors and the agents.
- **Generic scaffolding**: a FastAPI «hello world» and a Vite/React one, a `docker-compose`, a CI
  that runs linter and tests. It is the equivalent of having the editor configured; it solves nothing of the challenge.

### No, before the event

- **Write code that solves the challenge**: IRSA client, MEF reader, cropping logic,
  normalization, blink component, WCS resolution.
- **Download and preprocess SPHEREx data** for the project.
- **Prototype the viewer's interface**, even if «just to test».
- Anything that, if we removed it, would leave us with less of the project done.

### The practical test

> Would this still be useful if tomorrow we got a different challenge?

If the answer is yes (methodology, bibliography, environment, conventions), it is preparation.
If it is no (a SIA2 client, a blink component), it is work on the challenge and it waits.

## What this kit contains, measured against that test

| Folder | Verdict |
|---|---|
| `docs/00_DESAFIO.md` | Transcription of a public page. Preparation |
| `docs/01` – `docs/08` | Research and methodology. Preparation |
| `biblio/` | Public bibliography. Preparation |
| `data/campos_de_prueba.yml` | Public coordinates of objects named **in the statement itself**. Reference, not solution |
| `.claude/` | Configuration of work tools. Preparation |
| `scaffold/` | Generic FastAPI and Vite «hello world», with nothing from SPHEREx. Environment |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING.md` | Team conventions. Preparation |

**Until Nov 13 there was not a single line of code in this repository that queries IRSA, reads a FITS
or paints a frame.** Since the official start (Nov 14, 10:00) the team has been working on the challenge:
see `eda/` and `scaffold/frontend/src/sky/`, and [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md).

If anyone on the team has doubts about a specific case, the rule is: **ask the local event
organizer before doing it.** Losing ten minutes asking is cheaper than a disqualification.

---

## Other event rules that affect the work

- **Teams:** maximum 6 people. One person cannot be on two teams, and each team
  works on a single challenge.
- **AI use:** it is allowed and **each submission must include a description of how it was used**.
  It is not optional. Template in the `entrega-nasa` skill.
- **Under 18:** they must not upload photos of themselves as an avatar nor appear with photo, video or voice
  in the demo or the submission.
- **Submission:** through the project page on spaceappschallenge.org, according to the closing time of the
  local event.
- **Third-party data:** NASA warns that it does not endorse non-government sites and that the terms of use
  of each one must be followed. In practice: respect the licenses and attribution notes
  of CDS, IRSA and CSA.

## License and publication

The plan is to publish the repository under the MIT license at the start of the event. Two cautions:

- **SPHEREx attribution** verbatim in the README and in the tool's footer
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Do not version data**: the FITS and the cache PNGs stay out of the repository.

## Rules communicated at the event (Nov 14, 2026)

Said live by the organizers; we did not verify them against the official page. If they differ from
`docs/00_DESAFIO.md` or from the platform, the platform rules.

1. **Data:** open data from NASA and its partner agencies.
2. **Submission deadline:** 11:00 in the morning (local event time).
3. **What gets uploaded:** project name and summary, link to the final demo, NASA data and
   other sources used, and how AI was used.
4. **Jury criteria:** impact, creativity, validity, relevance and presentation.
5. **Deployment:** Vercel. The frontend is already deployed (https://spherex-planet-x-tau.vercel.app).
   Still to decide how the backend runs; ADR-001 remains to be closed. Nothing is deployed without approval from a
   team member.

---

## Before uploading this to GitHub, check

> **Status Nov 14:** the repository is already on GitHub (`mauriciovalenzuela742/SPHEREX`), with `LICENSE` and a `.gitignore` that covers `data/cache/`, `.env`, `node_modules/` and `__pycache__/`. The boxes below were not ticked because nobody reviewed them one by one.

- [ ] There are no keys, tokens or credentials in any file.
- [ ] There is no personal data of the members (emails, phones, addresses).
- [ ] There are no heavy data files or FITS.
- [ ] The `.gitignore` covers `data/cache/`, `.env`, `node_modules/`, `__pycache__/`.
- [ ] The README clearly says what this is and what it is not.
