---
description: 5-minütige Team-Synchronisation - was funktioniert, was blockiert ist, was als Nächstes kommt
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/.claude/commands/standup.md) · [Español](../../../es/.claude/commands/standup.md) · [中文](../../../zh/.claude/commands/standup.md) · **Deutsch** · [Italiano](../../../it/.claude/commands/standup.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/commands/standup.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

Bereite den Synchronisationsbericht für diese Front vor. Er wird in weniger als einer Minute laut
vorgelesen.

1. Sieh dir den tatsächlichen Stand der Arbeit an: `git log --oneline -15`, `git status`, die offenen
   Branches (`git branch -a`) und die PRs, falls es welche gibt. Verlass dich nicht auf das, was zuvor
   in der Unterhaltung gesagt wurde.
2. Wenn etwas deployt ist oder läuft, prüfe es wirklich, bevor du sagst, dass es funktioniert.

Gib genau dieses Format zurück, ohne Schnörkel:

**Funktioniert** — was man jetzt sofort öffnen und ansehen kann. Eine Zeile pro Sache. Wenn man es nicht
öffnen und ansehen kann, gehört es nicht hierher.

**Blockiert** — was angehalten ist, warum, und **von wem es abhängt, es freizugeben**. Wenn nichts
blockiert ist, schreibe «nichts».

**Nächste 90 Minuten** — nur eine Sache. Wenn es drei sind, ist es nicht entschieden.

**Neues Risiko** — nur wenn eines aufgetaucht ist. Wenn nicht, lass diese Zeile weg.

Formulierungsregeln: keine Commit-Hashes, keine langen Pfade, kein Jargon. Das hören drei Personen, die
nicht auf deinen Bildschirm geschaut haben. Zuerst die Schlussfolgerung.

Am Ende, in einer eigenen Zeile: Wenn sich etwas, das wir für fertig hielten, als nicht fertig
herausgestellt hat, sag es. Das ist nützlicher als jeder Fortschritt.
