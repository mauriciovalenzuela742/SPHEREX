---
description: Checks a numerical or factual claim against its source before it reaches the pitch
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/.claude/commands/verifica-cifra.md) · [中文](../../../zh/.claude/commands/verifica-cifra.md) · [Deutsch](../../../de/.claude/commands/verifica-cifra.md) · [Italiano](../../../it/.claude/commands/verifica-cifra.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/commands/verifica-cifra.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

Check the claim that comes in the argument (or, if there is no argument, go through the README and the
pitch script and check all that you find).

For each claim:

1. **Identify exactly what is being claimed.** Separate the number from the decoration: «we processed thousands
   of images» and «we processed 1,400 images» are not the same claim.
2. **Find the source.** A file in the repository, the output of a command, a page of the
   IRSA documentation, a paper. **Open it.** That a link exists does not prove that it says what is
   attributed to it.
3. **Compare.** Does the source say that, say something similar, or not say it?

Return a table with: claim · status · source · comment.

Possible statuses:

- **Verified** — the source says it. Put the exact link or path.
- **Approximate** — the source says something close but not equal. **Propose the correct wording.**
- **No source** — no backing was found. It has to be removed or backing has to be found.
- **False** — the source says something else. Urgent.

Pay special attention to:

- SPHEREx mission figures (bands, wavelengths, cadence, sizes): they are checked against the
  IRSA documentation, not against memory.
- Novelty claims («nobody has done this», «the first tool that…»). They are the riskiest
  before an expert jury. If they cannot be backed, they are softened to «as far as we could
  check».
- Anything that sounds like having discovered something. **That is never claimed.**
- Photometry results presented as science quality.

At the end, one line: how many verified, how many need correcting and which is the most serious.
