---
description: Prüft eine numerische oder sachliche Aussage gegen ihre Quelle, bevor sie im Pitch landet
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/.claude/commands/verifica-cifra.md) · [Español](../../../es/.claude/commands/verifica-cifra.md) · [中文](../../../zh/.claude/commands/verifica-cifra.md) · **Deutsch** · [Italiano](../../../it/.claude/commands/verifica-cifra.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/commands/verifica-cifra.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

Prüfe die Aussage, die als Argument kommt (oder, wenn es kein Argument gibt, gehe das README und das
Pitch-Skript durch und prüfe alle, die du findest).

Für jede Aussage:

1. **Identifiziere, was genau behauptet wird.** Trenne die Zahl vom Beiwerk: «Wir verarbeiten
   Tausende von Bildern» und «Wir verarbeiten 1.400 Bilder» sind nicht dieselbe Aussage.
2. **Suche die Quelle.** Eine Datei im Repository, die Ausgabe eines Befehls, eine Seite der
   IRSA-Dokumentation, ein Paper. **Öffne sie.** Dass ein Link existiert, beweist nicht, dass er sagt,
   was ihm zugeschrieben wird.
3. **Vergleiche.** Sagt die Quelle das, sagt sie etwas Ähnliches, oder sagt sie es nicht?

Gib eine Tabelle zurück mit: Aussage · Status · Quelle · Kommentar.

Mögliche Status:

- **Verifiziert** — die Quelle sagt es. Gib den Link oder den genauen Pfad an.
- **Ungefähr** — die Quelle sagt etwas Naheliegendes, aber nicht dasselbe. **Schlage die richtige
  Formulierung vor.**
- **Ohne Quelle** — es wurde kein Beleg gefunden. Sie muss gestrichen werden oder man muss einen Beleg
  beschaffen.
- **Falsch** — die Quelle sagt etwas anderes. Dringend.

Achte besonders auf:

- Zahlen der SPHEREx-Mission (Bänder, Wellenlängen, Kadenz, Größen): Sie werden gegen die
  IRSA-Dokumentation geprüft, nicht gegen das Gedächtnis.
- Neuheitsbehauptungen («Das hat noch niemand gemacht», «das erste Werkzeug, das…»). Sie sind vor einer
  fachkundigen Jury am riskantesten. Wenn sie sich nicht belegen lassen, werden sie abgeschwächt zu
  «soweit wir prüfen konnten».
- Alles, was danach klingt, etwas entdeckt zu haben. **Das wird nie behauptet.**
- Photometrie-Ergebnisse, die als wissenschaftliche Qualität dargestellt werden.

Am Ende eine Zeile: wie viele verifiziert, wie viele korrigiert werden müssen und welche die
schwerwiegendste ist.
