---
description: Walks through the complete demo in the browser and reports what breaks
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/.claude/commands/chequeo-demo.md) · [中文](../../../zh/.claude/commands/chequeo-demo.md) · [Deutsch](../../../de/.claude/commands/chequeo-demo.md) · [Italiano](../../../it/.claude/commands/chequeo-demo.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/commands/chequeo-demo.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

Walk through the entire demo as the team will do it before the jury and report what breaks. This is run
**before each freeze and before recording the video**.

The script is in `.claude/skills/demo-y-pitch/SKILL.md`. If the command's argument brings a URL,
use that one; if not, use the deployed application (https://spherex-planet-x-tau.vercel.app), and if there is none, the local one (`npm run dev` in `scaffold/frontend`, http://localhost:5173). Note: as long as the player and the frames are placeholders, step 3 fails by design and not because of a regression.

Go through the ten steps of the script, one by one, with the browser. At each step note:

- Did it do what it had to do?
- **How long it took.** Time it. A step that takes 15 seconds kills a 2-minute demo.
- Were there console errors or failed requests?

Then try what the jury will do and the script does not cover:

- A coordinate with no data.
- A misspelled coordinate.
- Reloading mid-load.
- The same URL opened in another tab.
- Mobile window size.

Return:

**Breaks the demo** — what has to be fixed no matter what, with the exact step where it fails.

**Slow** — steps that take more than 3 seconds, with the measured time.

**Annoying but passable** — can be lived with today.

**Total walkthrough time** — if it exceeds 2 minutes, steps have to be cut and say which.

If something failed, say exactly what you did to get there, so it can be reproduced.
