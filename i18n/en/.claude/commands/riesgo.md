---
description: Records a new risk in docs/07_RIESGOS.md with its alarm signal and its plan B
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/.claude/commands/riesgo.md) · [中文](../../../zh/.claude/commands/riesgo.md) · [Deutsch](../../../de/.claude/commands/riesgo.md) · [Italiano](../../../it/.claude/commands/riesgo.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/commands/riesgo.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

Record in `docs/07_RIESGOS.md` the risk that comes in the argument.

Before writing it:

1. **Read the risks that are already there.** If it is the same one in another form, **update the one that exists** instead of
   duplicating it. A register with twelve repeated risks is read by nobody.
2. Decide where it goes: the file is ordered by how much it hurts, not by probability.

Write it with the same structure as the others:

**R\<n\> · \<one sentence saying what can fail\>**

- **Impact:** critical / high / medium / low, and why in half a line.
- **Alarm signal:** what we would see if it is happening. It has to be observable: a measured time, a
  concrete error, a screen. Not «if things go badly».
- **Plan B:** what we would do. Concrete and executable today.
- **When it is decided:** the moment in the plan when this has to be looked at and the decision made. A risk
  without a decision date is discovered late.

Then tell me in two lines: what you recorded and whether it changes anything in the `docs/05_PLAN_24H.md` plan.
If it does, say so explicitly — **do not touch the plan on your own**, the team decides that.
