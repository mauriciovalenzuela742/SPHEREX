<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/KIT.md) · [Español](../../es/docs/KIT.md) · [中文](../../zh/docs/KIT.md) · **Deutsch** · [Italiano](../../it/docs/KIT.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/KIT.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# SPHEREx Kit — NASA Space Apps Challenge 2026

Arbeitskit des Teams für die Challenge **Planet X and SPHEREx** (Schwierigkeit: Advanced).
Es ist ein Werkzeugkasten: Dokumentation, Bibliografie, Konventionen und generisches Gerüst,
damit sechs Personen und ihre KI-Agents während des Events parallel arbeiten können, ohne sich zu behindern.

> **Stand am 14. Nov. (Event läuft):** Seit dem 14. Nov. gibt es eine EDA (`eda/`) und einen Viewer in
> `scaffold/frontend/` (siehe [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)). Vor dem Event gab es
> keine einzige Codezeile, die die Challenge löste, weil die Regeln des Events
> es verbieten, vor dem Hackathon an den Challenges zu arbeiten. Vorhanden ist Referenzmaterial
> (öffentlich, von der NASA und aus der Literatur) und generisches Web-Gerüst —ein „Hello World“ in FastAPI
> und eines in Vite/React—, vergleichbar mit einem eingerichteten Editor. Siehe [`docs/08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md).

---

## Die Challenge in einem Satz

Ein **öffentliches Web-Werkzeug** bauen, in dem jede Person Himmelskoordinaten eingibt
(Rektaszension und Deklination) und diese Himmelsregion **als kleines Video** sieht: die Abfolge der
SPHEREx-Bilder über die Zeit, um mit bloßem Auge zu erkennen, was sich bewegt oder seine Helligkeit ändert.

Das von der NASA genannte Vorbild ist [WiseView](http://byw.tools/wiseview), das Werkzeug, mit dem
Freiwillige von [Backyard Worlds](https://backyardworlds.org) Hunderte Brauner Zwerge entdeckt haben.
Vollständiger Text der Challenge in [`docs/00_DESAFIO.md`](00_DESAFIO.md).

**Was dies NICHT ist:** kein Videoklassifikationsmodell, kein automatischer Detektor,
keine wissenschaftliche Pipeline. Es ist ein Viewer. Jede ML-Schicht ist optional und kommt obendrauf, nie
anstelle des Viewers. Dies ist in [`docs/01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) begründet.

---

## Start in 10 Minuten

1. Lies diese README und [`docs/00_DESAFIO.md`](00_DESAFIO.md) (5 Min.). Das ist der einzige verpflichtende Text.
2. Kommst du ohne Kontext? Lies [`docs/briefings/`](../../../docs/briefings/) — die beiden Zusammenfassungen decken das ganze Projekt am Stück ab.
3. Sieh dir deine Rolle in [`docs/04_METODOLOGIA.md`](04_METODOLOGIA.md) und den Plan der 24 h in [`docs/05_PLAN_24H.md`](05_PLAN_24H.md) an.
4. Öffne Claude Code im Stammverzeichnis des Repos. Es liest automatisch `CLAUDE.md`; die Skills in `.claude/skills/`
   werden von selbst aktiviert, wenn es passt.
5. Wenn du für Backend oder Daten zuständig bist: überfliege [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md). Es ist das technische
   Datenblatt dazu, wo die Daten liegen und wie man sie anfragt. Es ist das dichteste Dokument und das, das am meisten Zeit spart.
6. Wenn du für das Frontend zuständig bist: überfliege [`docs/03_ARQUITECTURA.md`](03_ARQUITECTURA.md) und die Skill `visor-sky-blink`.

---

## Karte des Kits

| Ordner | Was er enthält | Wann du ihn öffnest |
|---|---|---|
| `docs/` | Challenge, Stand der Technik, Datenblatt, Architektur, Methodik, Plan, Jury, Risiken | Immer; es ist die Quelle der Wahrheit |
| `docs/briefings/` | Zwei erzählende Zusammenfassungen des gesamten Projekts zum Durchlesen. Es gibt sie auch als Audio | Um in 20 Minuten mit Kontext anzukommen |
| `docs/adr/` | Architekturentscheidungen, eine pro Datei | Wenn das Team etwas entscheidet, das schwer rückgängig zu machen ist |
| `biblio/` | Kommentierte Bibliografie, Paper-Steckbriefe, relevante GitHub-Repos | Wenn du Rückhalt oder eine erprobte Idee brauchst |
| `data/` | Testfelder mit Koordinaten, Referenzkataloge. **Keine versionierten FITS** | Beim Testen des Viewers |
| `.claude/skills/` | Acht Skills: fünf eigene (SPHEREx-Daten, Viewer, Koordinaten, Demo/Pitch, Abgabe) und drei generische (astropy, matplotlib, scikit-learn) | Claude lädt sie selbst |
| `.claude/agents/` | Spezialisierte Subagents (Datenerkunder, wissenschaftlicher Reviewer, UI-Reviewer) | Wenn du einen abgegrenzten Teil delegierst |
| `.claude/commands/` | `/standup`, `/traspaso`, `/chequeo-demo`, `/verifica-cifra`, `/riesgo` | Während des Events, von Hand |
| `scaffold/` | Generisches Gerüst Backend + Frontend, Docker, CI | Stunde 0 des Events |
| `AGENTS.md` | Anweisungen für **jeden** Agent. Einzige Quelle | Die Agents lesen sie, nicht du |
| `CLAUDE.md` / `GEMINI.md` | Verweise auf `AGENTS.md` + das Spezifische des jeweiligen Werkzeugs | Ebenso |

---

## Die vier Regeln des Teams

1. **Das Ergebnis ist der Viewer, der mit realen Koordinaten funktioniert.** Alles andere ist Zierde.
   Wenn nach 20 Stunden kein kleines Video auf dem Bildschirm läuft, wird gestrichen, was auch immer nötig ist.
2. **Nichts gilt als gegeben, ohne es angesehen zu haben.** Wenn ein Agent sagt „funktioniert schon“, ist das ein Datum, keine Tatsache:
   man öffnet die URL, sieht sich das Bild an, vergleicht es mit SIMBAD. Ein leeres Ergebnis beweist nicht, dass etwas nicht existiert.
3. **Keine Zahl ohne Quelle.** Was im Pitch oder in der README gesagt wird, muss
   geöffnet und überprüft werden können. Nutze `/verifica-cifra`.
4. **Niemand committet auf `main`, ohne dass jemand anderes draufschaut.** Vier Personen mit Agents parallel
   zerstören `main` in Minuten. Siehe [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Stand

- **Heute (14. Nov., Event läuft):** auf GitHub veröffentlicht (`mauriciovalenzuela742/SPHEREX`), mit den PR #1 bis #6 gemergt und dem Viewer auf Vercel deployt (https://spherex-planet-x-tau.vercel.app).
- **Vor dem Event (bis 13. Nov.):** nur Dokumentation, Bibliografie und generisches Gerüst, lokal.

Vorgesehene Lizenz: MIT (siehe [`LICENSE`](../../../LICENSE)). Die SPHEREx-Daten sind öffentlich und erfordern
den Danksagungshinweis aus [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## Das Kit installieren (für die Kolleginnen und Kollegen)

**Am einfachsten: das Repository klonen und Claude Code im Stammverzeichnis öffnen.**
`CLAUDE.md`, die Skills in `.claude/skills/`, die Subagents und die Befehle werden von selbst geladen.
Es muss nichts installiert werden.

```bash
git clone <url-del-repo>
cd spherex_kit
claude
```

Kontrolle: Tippe `/standup`. Wenn der Befehl existiert, ist das Kit geladen.

Wer **Antigravity oder Gemini** benutzt, liest `AGENTS.md` und `GEMINI.md`; sie verweisen auf dasselbe.

### Wenn jemand die Skills außerhalb dieses Repositorys möchte

Das Kit ist auch als Plugin verpackt (`.claude-plugin/plugin.json` und
`.claude-plugin/marketplace.json`), um es aus einem anderen Ordner zu verwenden. Es ist optional: innerhalb des
Repositorys wird es nicht benötigt.

---

## Verifikationsstand dieses Kits

Geschrieben am **14. November 2026**. Was geprüft ist und was nicht:

| | Status |
|---|---|
| Text der Challenge und Liste der *Resources* | ✅ An diesem Tag von der offiziellen Seite gelesen |
| IRSA-Endpunkte, SIA2-Collections, Struktur des MEF, Bänder, HiPS-Cube | ✅ Gegen die offizielle IRSA-Dokumentation |
| Gerüst des Backends | ✅ Läuft: `/health` antwortet `200 {"ok": true}` |
| Gerüst des Frontends | ✅ Wird in CI gebaut und läuft in Produktion (Vercel) |
| Bibliografie | 🟡 Teilweise. Jeder Eintrag trägt seinen Status in [`biblio/README.md`](../biblio/README.md) |
| Koordinaten der Testfelder | ✅ Alle fünf am 14. Nov. in SIMBAD (CfA-Spiegel) verifiziert. Es traten zwei Fallstricke auf: Die Koordinate der Aufgabenstellung für WISE 0855 ist von der Epoche 2010, und `eps Ind b` ≠ `eps Ind B` |
| Pixelskala von SPHEREx (6,15"/px) | ✅ Am 14. Nov. in SIA2 bestätigt (`s_pixel_scale`, `docs/09`). Von ihr hängt die Sub-Pixel-Bewegung ab (Risiko R10) |
| Dass Aladin Lite den HiPS-Cube von DR1 lädt | ✅ Ja, er lädt (Aladin Lite 3.8.2, HiPS PNG von `/data/hips/SPHEREx/spherex_allsky_cube`, 14. Nov.; `docs/09`) |

Was nicht verifiziert ist, ist in jedem Dokument so markiert. **Halte es nicht für gesichert, nur weil es
hier steht.**
