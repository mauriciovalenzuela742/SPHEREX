<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../es/CONTRIBUTING.md) · [中文](../zh/CONTRIBUTING.md) · [Deutsch](../de/CONTRIBUTING.md) · [Italiano](../it/CONTRIBUTING.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `CONTRIBUTING.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# How we work in this repository

Six people and their agents, 24 hours, a `main` branch that must always come up.
This is short on purpose.

## The non-negotiables

1. **Nobody pushes to `main`.** Neither you nor your agent. Everything comes in through a PR.
2. **A PR is reviewed by a person.** Not an agent. Looking at the diff costs two minutes and saves hours.
3. **Branches live less than 3 hours.** If a branch lasts longer, the task was too big.
4. **The API contract is changed first in `docs/03_ARQUITECTURA.md`**, the team is notified, and
   only then is code touched.
5. **No FITS and no downloaded data in the repository.** They go to `data/cache/`.

## Branches

```
<inicial-del-rol>/<tema-corto>
```

`d/sia2-epochs`, `v/panel-blink`, `c/verificar-campos`, `n/readme`.

Roles in [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md): **D** data, **V** viewer,
**C** science and verification, **N** narrative and submission.

## Worktrees: one folder per person

Two agents on the same folder overwrite each other without warning and without either telling you.

```bash
git worktree add -b d/sia2-epochs ../spherex-d main
cd ../spherex-d
```

## Commits

Imperative, in Spanish, one line, no ceremony:

```
añade endpoint /api/epochs
corrige conversión de RA en horas a grados
documenta la estructura del MEF
```

## What a PR carries

Three lines are enough:

```
Qué hace:
Cómo lo comprobé:
Qué NO comprobé:
```

**The third line is mandatory.** "What I did NOT check" is what prevents something from getting into the demo without
anyone having really looked at it.

## Before asking for review

- [ ] It runs clean: frontend `cd scaffold/frontend && npm ci && npm run build && npm run preview`; backend `cd scaffold && docker compose up`.
- If Vercel shows *Blocked* on your PR, that is expected (only Mauricio's commits are built; see README §2). Do not deploy it yourself.
- [ ] If it touches coordinates or images, tested with **at least one field from `data/campos_de_prueba.yml`**.
- [ ] You did not break anything that already worked (`/chequeo-demo` if you touched the interface).
- [ ] No secrets, no personal data, no FITS.

## If you break `main`

You say it out loud, immediately. You do not fix it silently: there are three other people working
on top of it. Reverting is free; half an hour of three people debugging something you already knew about is not.
