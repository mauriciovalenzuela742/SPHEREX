---
description: Geht die gesamte Demo im Browser durch und meldet, was kaputtgeht
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/.claude/commands/chequeo-demo.md) · [Español](../../../es/.claude/commands/chequeo-demo.md) · [中文](../../../zh/.claude/commands/chequeo-demo.md) · **Deutsch** · [Italiano](../../../it/.claude/commands/chequeo-demo.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/commands/chequeo-demo.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

Gehe die gesamte Demo so durch, wie das Team sie vor der Jury durchführen wird, und melde, was
kaputtgeht. Das läuft **vor jedem Freeze und vor der Aufnahme des Videos**.

Das Skript steht in `.claude/skills/demo-y-pitch/SKILL.md`. Wenn das Argument des Befehls eine URL
enthält, nutze diese; wenn nicht, nutze die deployte Anwendung (https://spherex-planet-x-tau.vercel.app), und wenn es keine gibt, die lokale (`npm run dev` in `scaffold/frontend`, http://localhost:5173). Achtung: Solange der Player und die Einzelbilder Platzhalter sind, schlägt Schritt 3 absichtlich fehl und nicht wegen einer Regression.

Gehe die zehn Schritte des Skripts einzeln mit dem Browser durch. Notiere bei jedem Schritt:

- Hat er getan, was er tun sollte?
- **Wie lange er gedauert hat.** Miss die Zeit. Ein Schritt, der 15 Sekunden dauert, tötet eine
  Demo von 2 Minuten.
- Gab es Fehler in der Konsole oder fehlgeschlagene Anfragen?

Probiere danach, was die Jury tun wird und das Skript nicht abdeckt:

- Eine Koordinate ohne Daten.
- Eine falsch geschriebene Koordinate.
- Mitten im Laden neu laden.
- Dieselbe URL in einem anderen Tab geöffnet.
- Fenstergröße für Handy.

Gib zurück:

**Zerstört die Demo** — was auf jeden Fall behoben werden muss, mit dem genauen Schritt, in dem es
fehlschlägt.

**Langsam** — Schritte, die länger als 3 Sekunden dauern, mit der gemessenen Zeit.

**Lästig, aber vertretbar** — damit kann man heute leben.

**Gesamtzeit des Durchgangs** — wenn sie über 2 Minuten liegt, müssen Schritte gekürzt werden, und
sage welche.

Wenn etwas fehlgeschlagen ist, sage genau, was du getan hast, um dorthin zu gelangen, damit es
reproduziert werden kann.
