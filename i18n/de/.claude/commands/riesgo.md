---
description: Trägt ein neues Risiko mit Warnsignal und Plan B in docs/07_RIESGOS.md ein
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/.claude/commands/riesgo.md) · [Español](../../../es/.claude/commands/riesgo.md) · [中文](../../../zh/.claude/commands/riesgo.md) · **Deutsch** · [Italiano](../../../it/.claude/commands/riesgo.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/commands/riesgo.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

Trage das Risiko, das als Argument kommt, in `docs/07_RIESGOS.md` ein.

Bevor du es schreibst:

1. **Lies die bereits vorhandenen Risiken.** Wenn es dasselbe in anderer Form ist, **aktualisiere das
   bestehende**, statt es zu duplizieren. Ein Register mit zwölf wiederholten Risiken liest niemand.
2. Entscheide, wo es hingehört: Die Datei ist danach sortiert, wie sehr es schmerzt, nicht nach
   Wahrscheinlichkeit.

Schreibe es mit derselben Struktur wie die anderen:

**R\<n\> · \<ein Satz, der sagt, was schiefgehen kann\>**

- **Auswirkung:** kritisch / hoch / mittel / niedrig, und warum in einer halben Zeile.
- **Warnsignal:** was wir sehen würden, wenn es eintritt. Es muss beobachtbar sein: eine gemessene Zeit,
  ein konkreter Fehler, ein Bildschirm. Nicht «wenn es schlecht läuft».
- **Plan B:** was wir tun würden. Konkret und heute ausführbar.
- **Wann entschieden wird:** der Moment im Plan, in dem man sich das ansehen und die Entscheidung treffen
  muss. Ein Risiko ohne Entscheidungsdatum wird zu spät entdeckt.

Danach sag mir in zwei Zeilen: was du eingetragen hast und ob sich etwas am Plan in
`docs/05_PLAN_24H.md` ändert. Wenn ja, sag es ausdrücklich — **ändere den Plan nicht auf eigene Faust**,
das entscheidet das Team.
