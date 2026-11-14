<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/08_REGLAS_DEL_EVENTO.md) · [Español](../../es/docs/08_REGLAS_DEL_EVENTO.md) · [中文](../../zh/docs/08_REGLAS_DEL_EVENTO.md) · **Deutsch** · [Italiano](../../it/docs/08_REGLAS_DEL_EVENTO.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/08_REGLAS_DEL_EVENTO.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 08 — Regeln des Events und was wir vorher tun können

Dieses Dokument existiert, damit niemand Zweifel hat, was vor dem Hackathon legitim vorbereitet werden darf
und was nicht. Die Regeln gelten für das ganze Team und seine Agenten.

---

## Die Regel, auf die es ankommt

Das Reglement des NASA Space Apps sagt wörtlich:

> Teams are not allowed to begin working on the challenges prior to the hackathon.

Es ist nicht erlaubt, **vor dem Hackathon mit der Arbeit an der Challenge zu beginnen**.

## Wie wir sie auslegen

Die Regel verbietet, die Lösung vorwegzunehmen, nicht, lesen zu können. Unser konservatives Kriterium:

### Ja, vor dem Event

- Die Aufgabenstellung, die *Resources* und die öffentliche Dokumentation der NASA, von IRSA und des CDS **lesen**.
- **Den Stand der Technik erforschen**: Papers, öffentliche Repositories, bereits existierende Werkzeuge.
- **Dokumentation schreiben**: was wir über das Instrument wissen, welche Formate es gibt, was bereits gemacht wurde.
- **Vereinbaren, wie wir arbeiten**: Rollen, Branches, Zeiten, Abbruchkriterien.
- **Die Umgebung vorbereiten**: Python, Node, Docker installieren; die Editoren und die Agenten konfigurieren.
- **Generisches Grundgerüst**: ein «Hello World» von FastAPI und eines von Vite/React, ein `docker-compose`, eine CI,
  die Linter und Tests ausführt. Es entspricht einem konfigurierten Editor; es löst nichts von der Challenge.

### Nein, vor dem Event

- **Code schreiben, der die Challenge löst**: IRSA-Client, MEF-Leser, Cutout-Logik,
  Normalisierung, Blink-Komponente, WCS-Auflösung.
- **SPHEREx-Daten für das Projekt herunterladen und vorverarbeiten.**
- **Die Oberfläche des Viewers prototypisieren**, und sei es «nur zum Ausprobieren».
- Alles, was uns, wenn wir es wegnähmen, mit weniger fertigem Projekt zurückließe.

### Der praktische Test

> Wäre das weiterhin nützlich, wenn uns morgen eine andere Challenge zufiele?

Wenn die Antwort ja ist (Methodik, Bibliografie, Umgebung, Konventionen), ist es Vorbereitung.
Wenn sie nein ist (ein SIA2-Client, eine Blink-Komponente), ist es Arbeit an der Challenge und wartet.

## Was dieses Kit enthält, an diesem Test gemessen

| Ordner | Urteil |
|---|---|
| `docs/00_DESAFIO.md` | Abschrift einer öffentlichen Seite. Vorbereitung |
| `docs/01` – `docs/08` | Recherche und Methodik. Vorbereitung |
| `biblio/` | Öffentliche Bibliografie. Vorbereitung |
| `data/campos_de_prueba.yml` | Öffentliche Koordinaten von Objekten, die **in der Aufgabenstellung selbst** genannt sind. Referenz, keine Lösung |
| `.claude/` | Konfiguration von Arbeitswerkzeugen. Vorbereitung |
| `scaffold/` | Generisches «Hello World» von FastAPI und Vite, ohne etwas von SPHEREx. Umgebung |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING.md` | Teamkonventionen. Vorbereitung |

**Bis zum 13. Nov. gab es in diesem Repository keine einzige Codezeile, die IRSA abfragt, ein FITS liest
oder ein Einzelbild zeichnet.** Seit dem offiziellen Beginn (14. Nov., 10:00) arbeitet das Team an der Challenge:
siehe `eda/` und `scaffold/frontend/src/sky/`, sowie [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md).

Wenn jemand im Team Zweifel an einem konkreten Fall hat, gilt die Regel: **Man fragt den Organisator
des lokalen Events, bevor man es tut.** Zehn Minuten fürs Fragen zu verlieren ist billiger als eine
Disqualifikation.

---

## Weitere Regeln des Events, die die Arbeit betreffen

- **Teams:** höchstens 6 Personen. Eine Person kann nicht in zwei Teams sein, und jedes Team
  arbeitet an nur einer Challenge.
- **Nutzung von KI:** Sie ist erlaubt und **jede Abgabe muss eine Beschreibung enthalten, wie sie eingesetzt wurde**.
  Das ist nicht optional. Vorlage im Skill `entrega-nasa`.
- **Unter 18:** dürfen keine Fotos von sich als Avatar hochladen und nicht mit Foto, Video oder Stimme
  in der Demo oder der Abgabe erscheinen.
- **Abgabe:** über die Projektseite auf spaceappschallenge.org, nach der Uhrzeit des Abgabeschlusses des lokalen
  Events.
- **Daten Dritter:** Die NASA weist darauf hin, dass sie keine nichtstaatlichen Seiten unterstützt und dass die Nutzungsbedingungen
  jeder einzelnen eingehalten werden müssen. In der Praxis: die Lizenzen und Quellenangaben
  des CDS, von IRSA und der CSA respektieren.

## Lizenz und Veröffentlichung

Der Plan ist, das Repository zu Beginn des Events unter MIT-Lizenz zu veröffentlichen. Zwei Vorsichtsmaßnahmen:

- **Quellenangabe von SPHEREx** wörtlich im README und in der Fußzeile des Tools
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Keine Daten versionieren**: Die FITS und die PNGs des Caches bleiben außerhalb des Repositorys.

## Im Event mitgeteilte Regeln (14. Nov. 2026)

Von der Organisation live gesagt; wir haben sie nicht gegen die offizielle Seite geprüft. Wenn sie von
`docs/00_DESAFIO.md` oder von der Plattform abweichen, gilt die Plattform.

1. **Daten:** offene Daten der NASA und ihrer Partneragenturen.
2. **Abgabeschluss:** 11:00 Uhr morgens (Ortszeit des Events).
3. **Was eingereicht wird:** Name und Zusammenfassung des Projekts, Link zur finalen Demo, NASA-Daten und
   andere verwendete Quellen, und wie KI eingesetzt wurde.
4. **Kriterien der Jury:** Wirkung, Kreativität, Gültigkeit, Relevanz und Präsentation.
5. **Deployment:** Vercel. Das Frontend ist bereits deployt (https://spherex-planet-x-tau.vercel.app).
   Wie das Backend läuft, ist noch zu entscheiden; ADR-001 ist noch abzuschließen. Nichts wird ohne Freigabe einer
   Person aus dem Team deployt.

---

## Vor dem Hochladen auf GitHub prüfen

> **Stand 14. Nov.:** Das Repository ist bereits auf GitHub (`mauriciovalenzuela742/SPHEREX`), mit `LICENSE` und einer `.gitignore`, die `data/cache/`, `.env`, `node_modules/` und `__pycache__/` abdeckt. Die Kästchen unten wurden nicht angekreuzt, weil niemand sie einzeln geprüft hat.

- [ ] Es gibt keine Schlüssel, Tokens oder Zugangsdaten in irgendeiner Datei.
- [ ] Es gibt keine persönlichen Daten der Mitglieder (E-Mails, Telefone, Adressen).
- [ ] Es gibt keine schweren Datendateien oder FITS.
- [ ] Die `.gitignore` deckt `data/cache/`, `.env`, `node_modules/`, `__pycache__/` ab.
- [ ] Das README sagt klar, was das hier ist und was nicht.
