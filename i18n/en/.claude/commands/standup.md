---
description: 5-minute team sync - what works, what is blocked, what is next
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/.claude/commands/standup.md) · [中文](../../../zh/.claude/commands/standup.md) · [Deutsch](../../../de/.claude/commands/standup.md) · [Italiano](../../../it/.claude/commands/standup.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/commands/standup.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

Prepare the sync report for this front. It is read aloud in under a minute.

1. Look at the real state of the work: `git log --oneline -15`, `git status`, the open branches
   (`git branch -a`) and the PRs if there are any. Do not trust what was said earlier in the conversation.
2. If something is deployed or running, check it for real before saying it works.

Return exactly this format, without frills:

**Works** — what can be opened and looked at right now. One line per item. If it cannot be opened
and looked at, it does not go here.

**Blocked** — what is stopped, why, and **who it depends on to unblock it**. If nothing is
blocked, write «nothing».

**Next 90 minutes** — a single thing. If it is three, it means it is not decided.

**New risk** — only if one appeared. If not, omit this line.

Writing rules: no commit hashes, no long paths, no jargon. Three people who were not looking at your
screen are listening to this. Conclusion first.

At the end, on a separate line: if something we thought was finished turned out not to be, say so. It is more useful
than any progress.
