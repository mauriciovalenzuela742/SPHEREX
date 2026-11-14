<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/02_DATOS_SPHEREX.md) · [Español](../../es/docs/02_DATOS_SPHEREX.md) · [中文](../../zh/docs/02_DATOS_SPHEREX.md) · **Deutsch** · [Italiano](../../it/docs/02_DATOS_SPHEREX.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/02_DATOS_SPHEREX.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 02 — SPHEREx-Daten: wo sie liegen und wie man sie anfragt

Technisches Datenblatt. Alles hier stammt aus der offiziellen Dokumentation von IRSA/IPAC, abgerufen am
**14. November 2026**, außer dem mit `[RAZONAMIENTO]` Markierten, das unsere eigene Ableitung ist und gegen die Daten geprüft werden muss.

Hauptquellen:

- Missionsseite: <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- Zugriffsleitfaden: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access>
- Produktleitfaden: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products>
- Cutouts: <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html> und <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- Notebooks: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

---

## 1. Die Mission in Zahlen

| Angabe | Wert |
|---|---|
| Geplante Lebensdauer | 2025 – 2027 |
| Abdeckung | 100 % des Himmels, ein vollständiger Durchgang alle ~6 Monate |
| Bereich | 0,75 – 5,0 µm (nahes Infrarot) |
| Spektralkanäle | 102 |
| Detektoren | 6 Arrays (3 für kurze Wellenlängen, 3 für lange, getrennt durch einen Dichroiten) |
| Instrument | Abbildender Spektrograf mit weitfeldigem **linear variablem Filter (LVF)** |

Spektrale Auflösung pro Band (das bestimmt, welcher Detektor wofür taugt):

| Band / Detektor | Wellenlänge | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

---

## 2. Das Detail, das über das Projekt entscheidet: wie SPHEREx Spektren gewinnt

SPHEREx hat keine diskreten Filter. Es hat einen **linear variablen Filter**: Die Wellenlänge
ändert sich kontinuierlich entlang einer Achse des Detektors. In den Worten der IRSA-Dokumentation:

> SPHEREx obtains spectra through multiple exposures, placing a given source at multiple positions
> in the field of view, where it is measured at multiple wavelengths by repointing the spacecraft.

Das heißt: **Das Spektrum einer Quelle entsteht, indem man sie viele Male beobachtet, jedes Mal in einem
anderen Teil des Detektors und daher jedes Mal in einer anderen Wellenlänge.**

`[RAZONAMIENTO]` Die Konsequenz für diese Challenge ist groß und sollte von Stunde 0 an klar sein.
Wenn man alle Level-2-Bilder nimmt, die eine Himmelsposition abdecken, sie ausschneidet und
nacheinander abspielt, **erhält man kein sauberes Blink: Man erhält eine Sequenz, in der die Helligkeit jeder
Quelle springt, weil jedes Einzelbild in einer anderen Wellenlänge liegt.** Ein roter Stern erscheint
in manchen Einzelbildern hell und in anderen schwach, ohne sich verändert zu haben. Das ruiniert genau das, was
die Challenge zeigen will: was sich bewegt und was wirklich variiert.

Die drei möglichen Auswege, nach Aufwand geordnet:

1. **Vor dem Blink nach Band/Detektor gruppieren.** Jedes Einzelbild des Videos ist dasselbe
   Band (z. B. Detektor 4) in verschiedenen Epochen. Innerhalb eines Bandes variiert die Wellenlänge immer noch, aber viel weniger. Es ist die wörtliche Lesart des Stichpunkts der Challenge: *«it may make sense to
   separately add together all the data taken by each of the six detector arrays»*.
2. **Nach Wellenlänge gruppieren mit der Extension `WCS-WAVE`**, die die zentrale λ an jedem
   Pixel angibt. Korrekter und teurer.
3. **Jedes Einzelbild normalisieren** (robuste Perzentile über denselben Ausschnitt), damit der Sprung im
   Niveau nicht dominiert. Das ist ein visueller Behelf, keine physikalische Lösung, aber in 24 Stunden kann es das sein, was
   die Demo rettet.

> **Geprüft am 14. Nov. ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) §2):** Nur nach Detektor zu gruppieren gleicht die λ
> **nicht** an (innerhalb eines Detektors variiert sie um ~16 Bandbreiten). Man muss Epochen mit
> angeglichener λ wählen; das ist billig, weil sich die λ aus `WCS-WAVE` mit einer HTTP-Range-Anfrage von ~35 KB ergibt.

**Das musste in Stunde 1 des Events mit echten Daten geprüft werden**, nicht diskutiert. Die
cutouts desselben Feldes herunterladen, `WCS-WAVE` von jedem lesen und sehen, wie stark die λ zwischen Epochen variiert.

---

## 3. Welche Versionen der Daten es heute gibt

Chronologie der Veröffentlichungen laut Missionsseite von IRSA:

| Datum | Was erschien |
|---|---|
| Juli 2025 | Erste Quick-Release-Produkte (QR1) |
| Oktober 2025 | QR2 (neu prozessiert) |
| 10. April 2026 | Korrektur eines Fehlers im Header der PSF-Extension von QR2 |
| September 2026 | QR3 |
| **November 2026** | **Data Release 1 (DR1)** |

**DR1 und QR3 zusammen ersetzen QR2.** QR2 bleibt bis Februar 2027 direkt herunterladbar,
ist aber über SIA2 nicht mehr durchsuchbar.

> **DR1 ist gerade erst erschienen, in genau diesem Monat.** Sehr wahrscheinlich hat kein anderes Team es genutzt, und
> mit ziemlicher Sicherheit verweisen die Tutorials und Beispiele, die im Internet kursieren, noch auf QR2.
> Das ist zugleich die größte Chance und das größte Risiko des Projekts. Siehe [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 4. Die vier Zugriffswege

IRSA liefert die Daten von zwei Orten: bei IPAC («on-premises») und in AWS S3. Es gibt vier Zugriffsschichten.

### 4.1 Durchsuchbare Verzeichnisse

Wurzel: <https://irsa.ipac.caltech.edu/ibe/data/spherex/>

Ein Unterverzeichnis pro Release: `dr1`, `qr3`, `qr2`. Die Level-2-MEF liegen in:

```
level2/[Planning Period]/l2b-v[Version]-[Processing Date]/[Detector]/
```

Der Allsky-Cube (nur DR1):

```
hips5_cube/hips_20261026/Norder5/Dir[Directory Number]/
```

Dient für massenhaftes `wget`/`curl` und um die Organisation zu verstehen. **Taugt nicht zur Suche nach
Koordinate**: Dafür gibt es SIA2.

### 4.2 SIA2 (Simple Image Access v2, IVOA-Standard) — der Hauptweg

Generischer Endpoint:

```
https://irsa.ipac.caltech.edu/SIA?
```

`COLLECTION` muss ergänzt werden. Die fünf Collections von SPHEREx:

| COLLECTION | Was sie enthält |
|---|---|
| `spherex_dr1` | MEF der Spektralbilder DR1, **weiter** Durchgang (gleichmäßige Abdeckung des gesamten Himmels) |
| `spherex_dr1_deep` | MEF DR1 der **tiefen** Felder |
| `spherex_dr1_cube` | Allsky-Cube DR1 |
| `spherex_qr3` | MEF QR3, weiter Durchgang |
| `spherex_qr3_deep` | MEF QR3, tiefe Felder |

**Um alle aktuell gültigen Spektralbilder einer Position zu finden, muss man
`spherex_dr1` und `spherex_qr3` abfragen** (und die `_deep`, wenn man die tiefen Felder will). QR2 ist nicht durchsuchbar.

In der IRSA-Dokumentation verifiziertes Beispiel:

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO` in Grad. Antwortformate: `HTML` zum Ansehen mit bloßem Auge, VOTable als Standard
für die Verarbeitung.

Die zurückgegebene Tabelle enthält unter anderem zwei Spalten, die uns interessieren:

- `access_url` — Download-URL der Datei bei IPAC. **Das ist die, die man benutzt, um ein cutout anzufordern.**
- `cloud_access` — Informationen, um dieselbe Datei aus AWS S3 zu lesen.

Zwei Warnungen der offiziellen Dokumentation:

- Die **Kalibrierungs**dateien sind **nicht in SIA2**; sie werden aus den durchsuchbaren Verzeichnissen geladen.
- Die Daten werden **wöchentlich** eingespielt, und die Verfügbarkeit über SIA2 **hinkt einen Tag hinterher**
  gegenüber den Verzeichnissen, dem Data Explorer und manchen TAP-Abfragen.

### 4.3 Cutouts — was den Viewer wirklich machbar macht

Ein vollständiges MEF wiegt **etwa 70 MB**. 15 komplette Epochen herunterzuladen, um einen Ausschnitt von 0,1° zu zeigen, ist
bei einem Hackathon und in einem öffentlichen Tool nicht praktikabel.

Der cutout-Dienst wird aufgerufen, indem man **Parameter an die URL der Datei anhängt**:

```bash
curl -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in Dezimalgrad.
- `size` in Grad.
- Vollständige Parameter: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

Wichtige Einschränkung: **Die cutouts funktionieren nur auf den bei IPAC gehosteten Dateien**, nicht auf
der Kopie in AWS.

Das ausgeschnittene MEF behält dieselben Extensions. `IMAGE`, `FLAGS`, `VARIANCE` und `ZODI` werden ausgeschnitten;
`WCS-WAVE` wird an den Ausschnitt angepasst; **die PSF-Extension kommt unverändert**, mit der PSF des
gesamten Originalbildes.

### 4.4 Python

```bash
pip install pyvo astroquery astropy
```

`pyvo` und `astroquery` kapseln SIA2. Die offiziellen IRSA-Notebooks sind der kürzeste Weg:

| Notebook | Wofür |
|---|---|
| Data Overview | Bilder finden, die eine Position abdecken, und das MEF verstehen |
| Spectral Image Cutouts | cutouts erzeugen und in ein neues MEF packen |
| PSF Models | Wie die PSF organisiert ist |
| Source Discovery Tool | Quellen entdecken und extrahieren |
| Mosaic Cube | Einen Cube des Mosaic Tool analysieren |
| HiPS All-Sky Cube | Den HiPS-Cube in Firefly erkunden und schnell ein Spektrum extrahieren |

Index: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Es gibt auch **`spxquery`** (v0.4.1), ein Drittanbieter-Paket auf PyPI, das Abfrage, Download
mit cutout, Aperturphotometrie mit Abzug des Zodiakallichts, Kombination zu 3D-Cubes («Drizzle3D»)
und Lichtkurven automatisiert: <https://spxquery.readthedocs.io>. Es ist das Stück, das dem am ähnlichsten ist, was auf der Datenseite
gebaut werden muss. **Es lohnt sich, es anzusehen, bevor man irgendetwas schreibt**: Auch wenn man es nicht nutzt, sind seine
Vier-Stufen-Architektur und seine Qualitätskontrolle eine gute Landkarte.

---

## 5. Was in einer Datei steckt

Das Hauptprodukt ist das **Spectral Image MEF auf Level 2**. Es gibt **6 pro Pointing** (eines pro
Detektor), ~70 MB je, Bilder von **2040 × 2040** Pixeln.

| HDU | Name | Inhalt |
|---|---|---|
| 1 | `IMAGE` | Kalibrierte Oberflächenhelligkeit in MJy/sr. **Das Zodiakallicht ist nicht abgezogen** |
| 2 | `FLAGS` | Bitmap pro Pixel: Status und Verarbeitung. Tabelle 16 des Explanatory Supplement |
| 3 | `VARIANCE` | Varianz der Helligkeit, in (MJy/sr)² |
| 4 | `ZODI` | Modell des Zodiakallichts, in MJy/sr. **Man muss es selbst abziehen, wenn man will** |
| 5 | `EPSF` (DR1/QR3) oder `PSF` (QR2) | Effektive PSF pro Detektorzone |
| 6 | `WCS-WAVE` | Tabelle, die Pixel → zentrale Wellenlänge und Bandbreite abbildet |

Hinweise, die Stunden sparen:

- **`FLAGS` ist die direkte Antwort auf den Stichpunkt der Challenge zu «contamination flags».** Sie
  in der Oberfläche zu zeigen ist billig und genau das, was der Autor der Challenge verlangt hat.
- **Das Zodiakallicht ist nicht abgezogen.** Für einen Viewer verbessert das Abziehen von `ZODI` von `IMAGE` den
  Kontrast schwacher Quellen stark. Es ist eine Codezeile und ein Verkaufsargument.
- **`WCS-WAVE` nutzt einen wenig verbreiteten Teil des FITS-Standards**, den laut IRSA «noch nicht
  alle Reader implementiert haben». Wenn dein FITS-Client ihn nicht erkennt: die vier nächstgelegenen Kontrollpunkte suchen
  und bilinear interpolieren, mit einer Genauigkeit von ~1 nm. **Diese Genauigkeit gilt für die Visualisierung.**
  Für Wissenschaft muss man die Extensions `CWAVE` und `CBAND` des Kalibrierungsprodukts Spectral WCS verwenden.
- **Pixelkonvention.** FITS-Header sind 1-basiert; Astropy liefert 0-basiert. IRSA warnt ausdrücklich
  davor beim Umgang mit der PSF. Es ist eine klassische Quelle für Verschiebungen um ein Pixel.
- **Nicht alle Beobachtungen bringen die 6 Bänder mit**: Die Qualität wird pro Band bewertet, und manche
  gelangen nicht ins Archiv. Der Code muss fehlende Bänder tolerieren.

### Dateinamen

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

Beispiel: `level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits`

Zerlegt:

- `2025W18_2B` — **planning period**: der zum Raumfahrzeug hochgeladene Flugplan, deckt ~3,5 Betriebstage ab.
- `0001` — Zähler des *large slew*.
- `1` — Zähler des *small slew* (1 bis 4; manche large slews bringen weniger als 4).
- `D1` — Detektor 1.
- `v12-2025-164` — Version und Verarbeitungsdatum (Jahr + Tag des Jahres).

`[RAZONAMIENTO]` Die *observation ID* ordnet das Video zeitlich. Man sollte sich nicht auf den
Namen verlassen und das Datum aus dem Header lesen, aber zum schnellen Ordnen genügt sie.

### Der Allsky-Cube (nur DR1)

DR1 bringt einen **All-Sky Cube**: Mosaike des gesamten Himmels, räumlich und spektral interpoliert, eines
pro jedem der 102 Kanäle. Er existiert in **zwei Versionen** (geprüft am 14. Nov., siehe
[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)):

1. **Die von SIA2 gelieferte** (`COLLECTION=spherex_dr1_cube`, Verzeichnis `hips5_cube/hips_20261026/Norder5/`):
   FITS-Kacheln von 512×512×102, ~320 MB je. Der Ausschnittsdienst lehnt sie ab (422/503), und
   Aladin nutzt sie nicht. Taugt nicht für den Viewer.
2. **Die HiPS für den Browser**, unter `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`:
   **PNG**-Kacheln, Order 5, 102 Ebenen (die 50 und 51 sind leer), Pixel von 12,9″, CORS offen.
   **Diese lädt Aladin Lite 3.8.2** ohne Backend. Es ist ein Mosaik aller Epochen (ohne Zeit-
   achse) und in bereits gestrecktem PNG (ohne Flüsse).

Dass man es ohne Backend in Aladin anzeigen kann, ist die beste technische Nachricht der Challenge für Weg A.
Siehe [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md).

Man darf die beiden Produkte nicht verwechseln, denn sie beantworten unterschiedliche Fragen:

| | Level-2-Bilder | Allsky-Cube |
|---|---|---|
| Achse, die er liefert | **Zeit** (viele Epochen) | **Wellenlänge** (102 Kanäle) |
| Wofür | Das Blink, Bewegung erkennen | Kontext und die 102 Bänder als Bild (PNG ohne Flüsse: taugt **nicht** für das Spektrum) |
| Auflösung | Nativ des Detektors | HEALPix-Order 5 (grob) |
| Verfügbar in | DR1, QR3 (und QR2 herunterladbar) | **Nur DR1** |

**Der Viewer, den die Challenge verlangt, braucht beides.** Die Zeit kommt aus Level 2; die 102 Bänder
als Bild aus dem Cube. Das Spektrum (Fluss gegen λ) stammt aus den Level-2-Dateien oder aus dem
Spectrophotometry Tool von IRSA, nicht aus dem Cube ([`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md)).

---

## 6. Bereits existierende Tools von IRSA

Bevor man etwas baut, nachsehen, ob IRSA es schon getan hat. Alle sind von der Missionsseite verlinkt.

| Tool | Was es tut | Warum es uns interessiert |
|---|---|---|
| **SPHEREx Data Explorer** | Web-Oberfläche zum Suchen, Visualisieren und Herunterladen | Das ist «der Konkurrent». Ansehen, um zu sehen, was man NICHT tun sollte: Es ist für Astronomen gedacht |
| **MOST** (Moving Object Search Tool) | Berechnet die Bahn eines Objekts des Sonnensystems und findet die SPHEREx-Bilder, die seine vorhergesagte Position in jeder Epoche abdeckten | Direkt relevant für Asteroiden und Kometen. Ein Tab «folge diesem Asteroiden» fällt fast gratis ab |
| **Spectrophotometry Tool** | Extrahiert Spektren aus den Bildern per forcierter Photometrie | Das ist die Antwort von IRSA auf das «spectra on the fly» der Challenge |
| **Mosaic Tool** | Maßgeschneiderte Multiband-Mosaike | |
| **Cutout Tool** | Ausschnitte aus den MEF | Oben bereits beschrieben |
| **Source Discovery Tool** | Identifiziert und charakterisiert Quellen in einer Region, ohne vorherige Positionen zu brauchen | Wenn man Quellen auf dem Bild markieren will |
| **Cloud Data Access** | Dieselben Daten in AWS S3 | Für schwere Verarbeitung |
| **Comet 3I/ATLAS** | Eigene Collection von Spektralbildern des interstellaren Kometen | Fertiges Material für eine Demo mit Aufhänger |

`[RAZONAMIENTO]` Die Collection von 3I/ATLAS verdient eine Minute Aufmerksamkeit: Es ist ein Objekt, das sich
schnell bewegt, es ist aktuell, und die Öffentlichkeit kennt es. Für die 2-Minuten-Demo ist sie mehr wert als jeder Braune
Zwerg.

---

## 7. Daten anderer Missionen (die Overlays)

Die Challenge schlägt vor, Daten anderer Teleskope überlagern zu können.

| Mission | Zugriff | Was sie beiträgt |
|---|---|---|
| **Gaia DR3** | <https://archive.stsci.edu/missions-and-data/gaia>, oder `astroquery.gaia`, oder der HiPS-Katalog des CDS in Aladin | Äußerst präzise Positionen, Eigenbewegungen und Parallaxen. Erlaubt, **vorherzusagen, wo ein Stern** in jeder Epoche sein sollte, und zu prüfen, dass der Viewer richtig liegt |
| **WISE / NEOWISE** | IRSA; unWISE unter <https://unwise.me> | Der naheliegende Vergleich: Das Blink in WISE ist es, was WiseView macht |
| **NEOSSat** (CSA) | <https://data.asc-csa.gc.ca/dataset/neossat>, Tutorial unter <https://github.com/asc-csa/NEOSSAT_Tutorial> | Es ist eine Ressource einer Partneragentur. Sie zu nutzen bringt im Kriterium *Global Connection* Punkte |
| **SIMBAD / VizieR** (CDS) | <https://simbad.cds.unistra.fr> | Namen («Barnard's Star») in Koordinaten auflösen. **Nötig, damit das Tool für jeden benutzbar ist** |

`[RAZONAMIENTO]` Gaia ist nicht nur Dekoration: Es ist die **Qualitätskontrolle** des Viewers. Wenn man
auf das Bild die Position zeichnet, die Gaia für den Stern zum Datum dieser Epoche vorhersagt, und sie
mit dem hellen Punkt übereinstimmt, ist bewiesen, dass WCS, Daten und Ausschnitt stimmen.
Es ist der billigste Weg, einer Jury zu beweisen, dass das Tool korrekt ist und nicht nur hübsch.

---

## 8. Verpflichtende Attribution

IRSA verlangt, diesen Hinweis in jedes veröffentlichte Material aufzunehmen, das SPHEREx-Daten nutzt:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**Er gehört in die Fußzeile des Tools und ins README.** Es ist ein geschenkter Punkt an Sorgfalt vor einer NASA-
Jury und kostet dreißig Sekunden.

Kanonische Papers, die IRSA zu zitieren bittet: Bock et al. (2026) für die Mission, Akeson et al. (2026) für
die Pipeline, Crill et al. (2025) für den Himmelssimulator, Korngut et al. (2026) für Instrument und
Kalibrierung. Details in [`../biblio/README.md`](../biblio/README.md).

---

## 9. Checkliste der Stunde 1 des Events

Das ist es, was mit echten Daten zu prüfen ist, bevor irgendetwas entschieden wird:

- [x] Eine SIA2-Abfrage an `spherex_dr1` über WISE 0855 liefert Zeilen. Anzahl notieren. **Ja: 258 Dateien** (`docs/09` §1).
- [x] Dasselbe über `spherex_qr3`. Anzahl notieren und ob sie sich mit den vorherigen überschneiden. **0 Zeilen für WISE 0855; keine Datei wiederholt sich zwischen beiden** (`docs/09` §1).
- [x] Wie viele verschiedene Epochen gibt es für ein typisches Feld? Das entscheidet, ob das «Video» 5 oder 50 Einzelbilder hat. **3-4 Durchgänge pro Zone, Basislinie von 1,0-1,4 Jahren** (`docs/09` §1).
- [x] Ein cutout mit `size=0.1` lädt in weniger als N Sekunden. Messen. **Entscheidet, ob Cache oder Queue nötig ist.** *(Gemessen: Median 7,3 s, p90 10,8 s, max. 29 s, ~3,9 MB; Cache nötig; `docs/09` §6.)*
- [ ] Das ausgeschnittene MEF öffnen und die 6 Extensions bestätigen. *(Im EDA nicht verifiziert.)*
- [x] `WCS-WAVE` zweier verschiedener Epochen desselben Feldes lesen. **Wie stark ändert sich die λ?** (Abschnitt 2). **~16 Bandbreiten innerhalb eines Detektors** (`docs/09` §2).
- [x] Lässt sich der HiPS-Cube von DR1 in Aladin Lite laden, wenn man auf das IRSA-Verzeichnis zeigt? Wenn ja, gibt es einen schnellen Weg. **Ja, die HiPS-PNG von `/data/hips/SPHEREx/spherex_allsky_cube` (nicht das Verzeichnis `ibe/`).**
- [x] Antwortet IRSA mit CORS auf eine Anfrage aus dem Browser? Wenn nicht, **läuft alles über das Backend**. **Nein: Nur die HiPS hat CORS; SIA2 und cutouts laufen über das Backend** (`docs/09` §6).

*Beantwortet am 14. Nov. in [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md). Offen bleibt nur das Kästchen mit den 6 Extensions.*
