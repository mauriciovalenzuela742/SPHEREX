<!-- i18n-header -->
> 🌐 **Sprache:** [English](../en/AGENTS.md) · [Español](../es/AGENTS.md) · [中文](../zh/AGENTS.md) · **Deutsch** · [Italiano](../it/AGENTS.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `AGENTS.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# AGENTS.md — Anweisungen für Agents in diesem Repository

Diese Datei ist die **einzige Quelle**. `CLAUDE.md` und `GEMINI.md` verweisen hierher und ergänzen nur
das, was für das jeweilige Werkzeug spezifisch ist. Wenn du etwas korrigierst, korrigiere es hier.

---

## 1. Was wir bauen

Ein **öffentliches Web-Werkzeug** für die Challenge *Planet X and SPHEREx* des NASA Space Apps 2026.
Die Nutzerin bzw. der Nutzer gibt RA/Dec ein; das Werkzeug zeigt die zeitliche Abfolge der SPHEREx-Bilder
dieser Himmelsregion als kleines Video, damit man mit bloßem Auge sieht, was sich bewegt oder seine Helligkeit ändert.

Der vollständige Text der Challenge steht in `docs/00_DESAFIO.md`. **Lies ihn, bevor du eine Architektur vorschlägst.**
Häufig nimmt ein Agent an, dies sei ein Klassifikationsproblem mit Videomodellen:
das ist es nicht. Bewertet wird der Viewer.

## 2. Nicht verhandelbare Regeln

1. **Erfinde keine Daten, Endpunkte, Parameter oder Ergebnisse.** Wenn du es nicht geprüft hast, sag es: „nicht
   geprüft“ oder „laut IRSA-Dokumentation, die ich nicht geöffnet habe“. Ein erfundener Endpunkt kostet eine
   Stunde Fehlersuche um 3 Uhr nachts.
2. **Prüfe das Artefakt, nicht den Bericht.** Bevor du sagst, dass etwas funktioniert: öffne die URL, sieh dir
   die FITS an, zähle die Epochen, vergleiche die Position mit SIMBAD. Ein `200 OK` beweist nicht, dass das Bild
   vom richtigen Himmelsausschnitt stammt.
3. **Ein leeres Ergebnis beweist nicht, dass etwas nicht existiert.** Wenn eine Abfrage nichts zurückgibt, probiere
   eine andere Collection, einen anderen Radius, eine andere Epoche, bevor du schließt: „dort gibt es keine Daten“.
4. **Keine Zahl ohne Quelle.** Jede Zahl, die in die README, den Pitch oder die Oberfläche gelangt, muss
   geöffnet und überprüft werden können. Lege den Link oder die Datei daneben.
5. **Kein Commit auf `main`.** Arbeite in deinem Branch. Siehe `CONTRIBUTING.md`.
6. **Lade keine FITS ins Repository.** Sie gehören nach `data/cache/`, das in `.gitignore` steht.
   Ein SPHEREx-MEF wiegt rund 70 MB.
7. **Veröffentliche nichts nach außen** —auf eine öffentliche Domain deployen, in soziale Netze hochladen, E-Mails
   versenden, Issues in fremden Repositories öffnen— ohne dass eine Person es ausdrücklich genehmigt.
8. **Regeln des Events:** Der Hackathon begann am 14. Nov. 2026 um 10:00 Uhr; vorher wurde kein Code geschrieben,
   der die Challenge löst. Siehe `docs/08_REGLAS_DEL_EVENTO.md`.

## 3. Festgelegter Stack

| Schicht | Wahl | Warum |
|---|---|---|
| Backend | Python 3.11 + FastAPI + uvicorn | `astropy`/`pyvo`/`astroquery` gibt es nur in Python |
| Datenzugriff | `pyvo` (SIA2) und direktes HTTP auf den Cutout-Dienst von IRSA | Es ist der von IRSA dokumentierte Weg |
| Bild | `astropy.io.fits`, `astropy.wcs`, `astropy.visualization` | Standard der Community |
| Frontend | React + Vite + TypeScript | Schnell aufgesetzt, das Team kennt es |
| Himmel | Aladin Lite 3.8.2 (fixiert) über dem HiPS-Cube von IRSA; Gaia und SIMBAD mit Harvard-Spiegeln | Löst Himmelskontext und Overlays, ohne sie selbst zu schreiben |
| Cache | Lokale Platte (`data/cache/`), optional Redis | Die Cutouts sind langsam; ohne Cache bricht die Demo zusammen |
| Deployment | Frontend auf Vercel (nur Mauricio hat Zugriff); Backend noch zu entscheiden (ADR-001) | Siehe `docs/03_ARQUITECTURA.md` |

Diese Entscheidung steht in `docs/adr/ADR-001-stack.md`. **Ändere sie nicht im Alleingang.** Wenn du sie für
falsch hältst, schreibe ein neues ADR und bring es im Team zur Sprache.

## 4. Vertrag der API

Frontend und Backend werden parallel gegen einen Vertrag entwickelt, der in Stunde 1 festgelegt wird. Der Vertrag
steht in `docs/03_ARQUITECTURA.md` und ist das Einzige, was beide Seiten als gegeben ansehen dürfen.
**Wenn du den Vertrag änderst, ändere ihn zuerst im Dokument**, sag im Teamkanal Bescheid und fasse erst danach
den Code an. Eine stille Vertragsänderung blockiert eine andere Person, ohne dass sie es merkt.

## 5. Wie man hier arbeitet

**Bevor du Code schreibst**

- Lies das Dokument in `docs/`, das deinen Teil abdeckt. Sie sind so geschrieben, dass du nicht die gesamte
  IRSA-Dokumentation lesen musst.
- Wenn die Aufgabe SPHEREx-Daten betrifft, enthält die Skill `spherex-datos` Endpunkte, Bänder und Dateistruktur,
  die bereits gegen die offizielle Dokumentation geprüft sind.

**Während du arbeitest**

- Kleine, überprüfbare Änderungen. Keine großen Umschreibungen mitten im Event.
- Jede Funktion, die Himmelskoordinaten anfasst, bekommt einen Test mit einem Feld aus `data/campos_de_prueba.yml`.
- Wenn dich etwas länger als 30 Minuten ohne Fortschritt aufhält, **halte an und sag es**. Bei einem Hackathon sind
  die Kosten des Beharrens höher als die eines Ansatzwechsels.

**Wenn du fertig bist**

- Sag, was du geprüft hast und wie. Nicht „funktioniert“, sondern: „Ich habe `/api/epochs?ra=...&dec=...` geöffnet,
  es lieferte 14 Epochen zwischen 2025-05 und 2026-10, ich habe die erste mit dem Data Explorer von IRSA verglichen
  und sie stimmt überein.“
- Sag, was du **nicht** geprüft hast. Das ist genauso wichtig.

## 6. Wie man berichtet

- Zuerst die Schlussfolgerung, dann die Details.
- Ein Problem wird mit seiner Lösung oder mit der von dir empfohlenen Option gemeldet, nicht nur mit dem Fehler.
- Kein internes Fachjargon, keine Commit-Hashes, keine langen Pfade, wenn du mit jemandem sprichst, der nicht
  in den Details war.
- Wenn du gescheitert bist, sag es. Ein falsches Ergebnis, das ohne Warnung ankommt, ist schlimmer, als zu melden,
  dass etwas schiefgegangen ist.

## 7. Minimales Glossar

Damit ein Agent ohne astronomischen Kontext keine absurden Dinge schreibt.

- **RA / Dec** — Rektaszension und Deklination, die Koordinaten des Himmels. RA wird in Stunden
  (`08h55m10.831s`) oder in Grad (0–360) angegeben; Dec in Grad (−90 bis +90). **Stunden mit Grad zu verwechseln ist
  der häufigste Fehler**: zwischen beiden liegt ein Faktor 15.
- **Epoche** — eine Beobachtung zu einem bestimmten Zeitpunkt. Das „kleine Video“ ist dieselbe Himmelsregion in
  verschiedenen Epochen, zeitlich geordnet.
- **Pointing / Durchgang** — ein Pointing ist eine Position des Teleskops (eine Himmelsposition landet pro Pointing in 2
  Dateien: Paare D1+D4, D2+D5, D3+D6); ein Durchgang ist ein vollständiger Himmelsdurchlauf
  (1–6 Wochen, ~6 Monate zwischen Durchgängen). **Ein Durchgang ist keine Epoche**: Für das Video ist die Einheit
  der Durchgang (`docs/09`).
- **Eigenbewegung** — scheinbare Verschiebung eines Sterns am Himmel, in Millibogensekunden
  pro Jahr (mas/yr). Sie lässt einen nahen Stern zwischen Epochen wandern.
- **Parallaxe** — scheinbares Hin- und Herwackeln durch die Bewegung der Erde um die Sonne. Periode von einem
  Jahr; sie liefert die Entfernung.
- **FITS** — Standardformat für astronomische Bilder. Ein **MEF** ist eine FITS mit mehreren Erweiterungen
  (Bild, Varianz, Flags usw.) in derselben Datei.
- **WCS** — die Information im FITS-Header, die Pixel ↔ Himmelskoordinate übersetzt.
- **Cutout** — Ausschnitt eines großen Bildes um eine Position.
- **HiPS** — hierarchisches Kachelformat des CDS, das es erlaubt, den gesamten Himmel im
  Browser zu durchsuchen. Es ist das, was Aladin Lite verarbeitet.
- **LVF** — Linear Variable Filter. Der optische Trick von SPHEREx: Die Wellenlänge ändert sich entlang
  einer Achse des Detektors, sodass *wo* eine Quelle im Bild landet bestimmt, *bei welcher
  Wellenlänge* sie gemessen wird. Praktische Folge: Zwei Bilder derselben Himmelsregion
  können nicht vergleichbar sein, wenn sie bei unterschiedlichen Wellenlängen aufgenommen wurden.
- **Brauner Zwerg** — Objekt zwischen Planet und Stern. Kalt, rot, hell im Infrarot:
  genau das, was SPHEREx gut sieht und was die Freiwilligen von Backyard Worlds suchen.

## 8. Wo die Wahrheit steht

| Frage | Dokument |
|---|---|
| Was verlangt die Challenge genau? | `docs/00_DESAFIO.md` |
| Was wurde bisher gemacht und was funktioniert? | `docs/01_ESTADO_DEL_ARTE.md` |
| Wie frage ich SPHEREx-Daten an? | `docs/02_DATOS_SPHEREX.md` und Skill `spherex-datos` |
| Wie ist das System aufgebaut? | `docs/03_ARQUITECTURA.md` |
| Wer macht was und wie koordinieren wir uns? | `docs/04_METODOLOGIA.md` |
| Was steht jetzt an? | `docs/05_PLAN_24H.md` |
| Was belohnt die Jury? | `docs/06_JURADO_Y_PITCH.md` |
| Was kann schiefgehen? | `docs/07_RIESGOS.md` |
| Was dürfen wir rechtlich und wann? | `docs/08_REGLAS_DEL_EVENTO.md` |
| Was haben die realen Daten gezeigt? | `docs/09_EDA_HALLAZGOS.md` |
| Wer macht was nach der EDA? | `docs/10_REPARTO_DE_TRABAJO.md` |
| Wie wurde gemessen und wie wiederholt man es? | `eda/README.md` |
| Wie sieht die Oberfläche aus? | `docs/diseno/` |
| Wie benutzt man das Kit? | `docs/KIT.md` |
| Papers und Repositories | `biblio/README.md` |

Wenn ein Dokument dieser Datei widerspricht, **gilt das Dokument**, und korrigiere diese Datei.
