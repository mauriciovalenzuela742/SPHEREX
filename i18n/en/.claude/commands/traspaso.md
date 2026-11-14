---
description: Context handoff so that another person or a new session can pick up this work
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/.claude/commands/traspaso.md) · [中文](../../../zh/.claude/commands/traspaso.md) · [Deutsch](../../../de/.claude/commands/traspaso.md) · [Italiano](../../../it/.claude/commands/traspaso.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/commands/traspaso.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

Write a handoff so that someone who **was not in this conversation** can pick up this
work without losing time. It can be another team member or yourself in a new session.

First look at the real state: current branch, uncommitted changes, what runs and what doesn't.

Return this format:

**What I was doing** — one sentence. The goal, not the steps.

**Where it stands** — branch, files touched, whether there are uncommitted changes. What works today and what doesn't.

**What you need to know to avoid repeating mistakes** — the expensive part of this session: what was tried and did not
work, which assumption turned out false, which endpoint returned empty and why. **This is the valuable part of the
handoff**; without it, whoever continues repeats the same three hours.

**The next concrete step** — what to do, in which file, and how you will know it worked.

**What NOT to do** — paths already discarded, with the reason in half a line.

**What is not verified** — what seems to work but nobody checked.

Save it in `docs/traspasos/<date-time>-<topic>.md` and tell me the path. If the folder does not exist, create it.
