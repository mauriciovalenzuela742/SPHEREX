<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/04_METODOLOGIA.md) · [中文](../../zh/docs/04_METODOLOGIA.md) · [Deutsch](../../de/docs/04_METODOLOGIA.md) · [Italiano](../../it/docs/04_METODOLOGIA.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/04_METODOLOGIA.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 04 — Methodology: four people, four agents, 24 hours

The main risk for a team of four with agents is not running out of ideas: it is **stepping on each other**.
Four agents writing fast on the same repository produce conflicts, duplicated code and
a broken `main` branch at three in the morning. This document is the agreement so that does not happen.

---

## Roles

Four roles, each the owner of certain files. (In this team of six, D is split into D1 access and D2
frames, and V into V1 blink and V2 sky; see [`README.md`](../README.md) §3.) **Owner** means: that person decides, the others
ask. It does not mean they work alone.

### D — Data (backend / IRSA)
Owner of `scaffold/backend/app/irsa/`, `scaffold/backend/app/cache/`.
Queries SIA2, downloads cutouts, reads the MEFs, groups by band, resolves the WCS and the wavelengths.
It is the critical path: **if this does not work, there is no project.**
Profile that fits: whoever is most comfortable with scientific Python and observational astronomy.

### V — Viewer (frontend)
Owner of `scaffold/frontend/src/`.
Aladin Lite, the blink panel, the controls (stretch, color, fps), the queryable URL.
Profile that fits: whoever is most comfortable with modern web.

### C — Science and verification
Owner of `data/campos_de_prueba.yml`, `tests/`, `docs/`.
Checks that what is shown is correct: that the cutout is of the sky it says it is, that the object
is where Gaia predicts, that the spectrum is not an artifact. **They are the one with permission to say
«this is wrong» without having to propose the fix.**
Profile that fits: whoever has the best astronomical judgment. In this team, naturally from the physics side.

### N — Narrative and delivery
Owner of `README.md`, the demo, the pitch and the submission form.
Starts working **from hour 0**, not at the end. The classic hackathon mistake is leaving the
delivery for the last two hours and discovering that half of the form is missing.
Profile that fits: whoever speaks best in public, because they are also the one who presents.

> **Roles are not cages.** From hour 12 on, when the critical path is unblocked, D and
> V split the extra bullets. But C and N **do not dissolve**: if nobody verifies and nobody prepares
> the delivery, the project is delivered late and with errors.

---

## How the code is coordinated

**Trunk-based with short branches.** `main` always comes up.

```bash
git switch -c d/sia2-epochs      # inicial del rol + tema
# ... trabajo ...
git push -u origin d/sia2-epochs
# PR. Lo mira otro. Se mergea.
```

Rules:

1. **Nobody pushes to `main` directly.** Neither you nor your agent.
2. **Branches live less than 3 hours.** If a branch is older, the task was too big.
3. **A PR is reviewed by a person, not an agent.** Looking at the diff takes two minutes and saves hours.
4. **The API contract is changed first in `docs/03_ARQUITECTURA.md`** and announced, before touching
   code. A silent contract change blocks someone else without their knowing.
5. **No FITS in the repository.** `data/cache/` is in `.gitignore`.

### Worktrees: one folder per person

If two people (or two agents) work in the same folder, they overwrite each other without warning. With
`git worktree` each one has their own copy over the same repository:

```bash
git worktree add ../spherex-d d/sia2-epochs
cd ../spherex-d
```

It is the difference between four agents collaborating and four agents fighting over the same files.

---

## The 90-minute cycle

The hackathon is divided into 90-minute blocks. At the end of each block, **five minutes standing**,
everyone, with the `/standup` command:

1. **What is left working** — not «what I did», but what can be opened and looked at.
2. **What is blocked and by whom.**
3. **What I do in the next 90.**

Five minutes. No screens. If someone needs more, it is discussed separately.

Why 90: it is enough to finish something and short enough that a wrong path does not cost half the night.

---

## How an agent is used here

This is what separates a team that uses agents from one that the agents beat.

**One session per front.** Do not mix the data backend with the frontend in the same Claude Code
session. The context gets contaminated and the agent starts making silly mistakes. If you change
topic, new session, with `/traspaso` if you need to carry the context over.

**The agent proposes, the person decides.** For anything that touches more than two files: plan
first, approval after. In a hackathon the temptation to let it run is enormous and it is the fastest
way to end up with 2,000 lines that nobody understands at 5 in the morning.

**Verify the artifact, not the report.** The agent saying «it works now» is a data point, not a fact.
Open the URL. Look at the image. Count the epochs. This is not distrust: it is that the agent cannot
see the screen.

**When something does not work on the third try, change the approach, not the prompt.** If you have spent three attempts
fixing the same thing, the problem is not how you asked for it.

**Never let an agent decide the scope on its own.** The scope is set by the team with the plan in
[`05_PLAN_24H.md`](05_PLAN_24H.md). An agent, if you let it, builds all the challenge bullets
halfway instead of three completely.

**Use subagents for what pollutes the context.** Searching the IRSA documentation, trying
20 SIA2 queries, reviewing the UI: that goes to `explorador-datos`, `revisor-cientifico` or
`revisor-interfaz`, which return the conclusion without the filler.

---

## Split between Claude Code and Antigravity

If both tools coexist in the team, the default split is **by files**, never by
topic:

| Tool | Files |
|---|---|
| Claude Code | `backend/`, `tests/`, `docs/` |
| Antigravity | `frontend/` |

Two agents editing the same file overwrite each other without warning, and neither of them will tell you.

---

## Definition of «done»

A task is done when:

- [ ] It works with **at least one real field** from `data/campos_de_prueba.yml`.
- [ ] Another person opened it and saw it working.
- [ ] What was not covered is said out loud (missing bands, untested cases).
- [ ] It did not break anything that already worked (`/chequeo-demo`).

It is not done because an agent said it is.

---

## The three mandatory stops

They are the only things that are not negotiable, no matter what happens with the code:

| Moment | What happens |
|---|---|
| **T − 6 h** | **Scope freeze.** Nothing new is started. Only what exists is fixed and polished |
| **T − 4 h** | **Demo recorded.** The video has to be ready even if the application keeps improving. If it improves later, it is re-recorded. If there is no time, a video already exists |
| **T − 2 h** | **Submission uploaded.** Form complete, links in place, AI-use statement written. If time remains, it is edited; but **it is already submitted** |

`T` is the submission deadline of the local event. At the Santiago event, JP confirmed on Nov 14
(announced live by the organization) that it is at **11:00 on Sunday the 15th** ([`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)).
It is the number that orders everything else.

The project that wins is not the one with the most code. It is the one that arrives whole.
