---
description: Kontextübergabe, damit eine andere Person oder eine neue Sitzung diese Arbeit wieder aufnehmen kann
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/.claude/commands/traspaso.md) · [Español](../../../es/.claude/commands/traspaso.md) · [中文](../../../zh/.claude/commands/traspaso.md) · **Deutsch** · [Italiano](../../../it/.claude/commands/traspaso.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/commands/traspaso.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

Schreibe eine Übergabe, damit jemand, der **nicht in dieser Unterhaltung war**, diese Arbeit
ohne Zeitverlust wieder aufnehmen kann. Das kann eine andere Person aus dem Team sein oder du selbst in einer neuen Sitzung.

Sieh dir zuerst den tatsächlichen Stand an: aktueller Branch, nicht committete Änderungen, was läuft und was nicht.

Gib dieses Format zurück:

**Woran ich gearbeitet habe** — ein Satz. Das Ziel, nicht die Schritte.

**Wo es steht** — Branch, geänderte Dateien, ob es nicht committete Änderungen gibt. Was heute funktioniert und was nicht.

**Was man wissen muss, um keine Fehler zu wiederholen** — das Teure aus dieser Sitzung: was ausprobiert wurde und nicht
funktioniert hat, welche Annahme sich als falsch herausstellte, welcher Endpoint leer zurückkam und warum. **Dies ist der wertvolle
Teil der Übergabe**; ohne ihn wiederholt die nächste Person dieselben drei Stunden.

**Der nächste konkrete Schritt** — was zu tun ist, in welcher Datei, und woran du erkennst, dass es funktioniert hat.

**Was NICHT zu tun ist** — bereits verworfene Wege, mit dem Grund in einer halben Zeile.

**Was nicht verifiziert ist** — was zu funktionieren scheint, aber niemand geprüft hat.

Speichere es unter `docs/traspasos/<fecha-hora>-<tema>.md` und nenne mir den Pfad. Falls der Ordner nicht existiert, lege ihn an.
