---
name: entrega-nasa
description: Checkliste und Vorlagen für die Abgabe des Projekts auf der Plattform der NASA Space Apps Challenge - was das Formular verlangt, die Projektzusammenfassung, die verpflichtende Beschreibung, wie künstliche Intelligenz eingesetzt wurde, die Links zu Demo und Repository, die Namensnennung der NASA-Daten und die Regeln zu Minderjährigen und Inhalten. Aktiviere sie, wenn Abgabe, Submission, Projekt hochladen, Abgabeformular, Abgabeschluss, Erklärung zum KI-Einsatz erwähnt werden, oder wenn nur noch wenige Stunden bleiben und die Abgabe abgeschlossen werden muss.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../../en/.claude/skills/entrega-nasa/SKILL.md) · [Español](../../../../es/.claude/skills/entrega-nasa/SKILL.md) · [中文](../../../../zh/.claude/skills/entrega-nasa/SKILL.md) · **Deutsch** · [Italiano](../../../../it/.claude/skills/entrega-nasa/SKILL.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/skills/entrega-nasa/SKILL.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Abgabe auf der Plattform

**Die Ursache Nummer eins dafür, dass ein gutes Projekt nichts gewinnt, ist verspätete oder unvollständige Abgabe.**
Diese Skill existiert, damit das nicht passiert.

**Regel:** Die Abgabe wird bei **T − 2 h** hochgeladen, nicht bei T. Danach kann weiter bearbeitet werden, aber es
ist bereits abgegeben.

**N öffnet das Formular in Stunde 1 des Events**, nicht in Stunde 22, um zu sehen, was es wirklich verlangt.
Was hier steht, ist das, was wir wissen; die Plattform hat Vorrang.

---

## Was die Abgabe verlangt (was wir wissen)

- Projektname und Kurzzusammenfassung.
- Projektbeschreibung: was es tut, wie sie es gemacht haben, welche Daten sie verwendet haben.
- **Beschreibung, wie KI im Projekt eingesetzt wurde. In diesem Jahr verpflichtend.**
- Link zur Demo (Video oder deployte Anwendung).
- Link zum Code-Repository.
- Verwendete Ressourcen und Daten, mit ihren Quellen.

Die Abgabe erfolgt über die Projektseite des Teams auf spaceappschallenge.org, nach dem Abschlusszeitpunkt
des lokalen Events: **Sonntag 15. Nov., 11:00** (von JP am 14. Nov. bestätigt). Um 09:00 abgeben (T − 2 h).

---

## Vorlagen

### Kurzzusammenfassung

> *(Ein oder zwei Sätze. Was die Jury zuerst liest und manchmal das Einzige.)*
>
> `<Nombre>` ist ein öffentliches Web-Werkzeug, das jedes beliebige Stück Himmel so zeigt, wie es
> SPHEREx über die Zeit sieht, als kleines Video, damit jede Person Objekte erkennen kann, die sich
> bewegen oder ihre Helligkeit ändern. Es fügt die Spektralachse hinzu: die 102 Infrarotbänder der Mission
> *(„mit spontan erzeugten Spektren“ nur aufnehmen, wenn `/api/spectrum` in die Demo gelangt)*.

### Beschreibung

Vier Blöcke, in dieser Reihenfolge:

1. **Das Problem.** Warum es nötig ist: SPHEREx kartiert alle sechs Monate den ganzen Himmel in 102
   Bändern und niemand sucht darin nach dem, was sich bewegt. Die Blinktechnik entdeckte
   Pluto und entdeckt dank Freiwilligen weiterhin Braune Zwerge und Kometen.
2. **Was wir gebaut haben.** Den Viewer, die Regler, die Overlays, die teilbare URL. Was es **gibt**,
   nicht was geplant war.
3. **Wie wir es gebaut haben.** Die verwendeten realen Daten (Release, Collections, IRSA-Dienste), den
   Stack und die Probleme, die gelöst werden mussten — **insbesondere das des Linear Variable Filter**,
   das zeigt, dass wir das Instrument verstanden haben und nicht nur Bilder heruntergeladen haben.
4. **Was als Nächstes kommt.** Ehrlich: was wir nicht geschafft haben und warum.

### Erklärung zum KI-Einsatz

Das ist keine Formalität. Gut geschrieben ist es ein Beleg für Methode. Schlecht geschrieben („wir haben ChatGPT zum Programmieren benutzt“)
verschenkt man eine Gelegenheit.

> **Wie wir künstliche Intelligenz in diesem Projekt eingesetzt haben**
>
> Wir haben Programmierassistenten auf Basis von Sprachmodellen (Claude Code und Antigravity) als
> Entwicklungswerkzeug während der 24 Stunden des Events eingesetzt, mit einer expliziten Methode:
>
> - **Was wir von ihnen verlangt haben:** Integrationscode für das IRSA-Archiv, Oberflächenkomponenten,
>   Tests und Dokumentation zu schreiben, ausgehend von einem API-Vertrag und Konventionen, die das Team
>   zu Beginn festgelegt hat und die im Repository versioniert sind (`AGENTS.md`).
> - **Wie wir das Ergebnis kontrolliert haben:** Jede Änderung ging vor der Integration durch ein menschliches Review.
>   Wir arbeiteten nach der Regel, das Artefakt und nicht den Bericht zu prüfen: Keine Funktion galt
>   als fertig, weil ein Assistent es sagte, sondern erst nach dem Öffnen und Prüfen gegen reale Daten
>   und gegen externe Kataloge.
> - **Was wir NICHT getan haben:** Wir haben keine Modelle verwendet, um wissenschaftliche Daten zu erzeugen, zu erfinden oder zu ergänzen.
>   Alle Bilder, Wellenlängen und Metadaten, die das Werkzeug zeigt, stammen aus den
>   von der SPHEREx-Mission über IRSA veröffentlichten Dateien.
> - **Warum wir keine Bild- oder Videomodelle zur Detektion verwendet haben:** Wir haben es geprüft und
>   begründet verworfen. Die Challenge verlangt einen Viewer, damit Menschen detektieren; der eigentliche Flaschenhals
>   ist der Zugriff auf die Daten und ihre Ausrichtung. Wir haben im Repository dokumentiert,
>   wo ein Modell etwas beitragen würde —Vorsortieren von Kandidaten mit kleinen Netzen auf Ausschnitten, im Stil
>   des Brokers ALeRCE— als nächste Arbeit.
>
> *(An das anpassen, was tatsächlich geschah. Wenn etwas anderes verwendet wurde, wird es gesagt. Wenn Spherix ein LLM in Produktion einsetzt, hier mit dem Modell angeben und welche Daten es erhält.)*

### Verwendete Daten und Ressourcen

Mit Link auflisten: die Missionsseite von SPHEREx bei IRSA, das konkrete Release (DR1 / QR3) und die
SIA2-Collections, die verwendeten IRSA-Dienste (Cutouts, HiPS-Cube, MOST…), Aladin Lite 3.8.2, den HiPS-Cube
von SPHEREx DR1 (IRSA), Gaia DR3 (VizieR, Harvard/CfA-Spiegel), SIMBAD (CDS und Harvard-Spiegel), Astropy. Falls eine Ressource der Partneragentur (CSA/NEOSSat) verwendet wurde,
nennen: **zählt beim Kriterium *Global Connection***.

### Verpflichtende Namensnennung

In der README und in der Fußzeile des Werkzeugs, wörtlich:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## Abschlusscheckliste

**Inhalt**

- [ ] Projektname und Kurzzusammenfassung.
- [ ] Beschreibung mit den vier Blöcken.
- [ ] **Erklärung zum KI-Einsatz.** Verpflichtend.
- [ ] Liste der Daten und Ressourcen mit Links.
- [ ] Namensnennung von SPHEREx, wörtlich.

**Links — von außerhalb des Event-WLANs getestet**

- [ ] Video der Demo. **Von einem Handy mit mobilen Daten geöffnet.**
- [ ] Deployte Anwendung. Ebenso.
- [ ] Repository **öffentlich** und ohne Anmeldung zugänglich.
- [ ] Die README des Repositorys erklärt, was es ist, wie es läuft und welche Daten es verwendet.

**Regeln**

- [ ] Keine Fotos, Videos oder Stimmen von Minderjährigen.
- [ ] Keine Schlüssel, Tokens oder Zugangsdaten im Repository.
- [ ] Keine personenbezogenen Daten der Teammitglieder.
- [ ] Lizenz angegeben.

**Zuletzt**

- [ ] Jemand anderes als die schreibende Person liest die Abgabe vollständig von Anfang bis Ende.
- [ ] **Abgegeben vor T − 2 h.**
