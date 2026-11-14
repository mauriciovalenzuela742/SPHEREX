<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/09_EDA_HALLAZGOS.md) · [Español](../../es/docs/09_EDA_HALLAZGOS.md) · [中文](../../zh/docs/09_EDA_HALLAZGOS.md) · **Deutsch** · [Italiano](../../it/docs/09_EDA_HALLAZGOS.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/09_EDA_HALLAZGOS.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 09 — EDA: was die realen Daten sagen (14. Nov. 2026)

Antworten, mit IRSA-Daten, auf die Checkliste der Stunde 1 ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §9).
Jede Zahl stammt aus einer Datei in [`../eda/resultados/`](../../../eda/resultados/) oder aus einer Abbildung in
[`../eda/figuras/`](../../../eda/figuras/); die Skripte, die sie erzeugen, liegen in [`../eda/`](../eda/README.md)
und können erneut ausgeführt werden.

---

## Zusammenfassung in zehn Zeilen

1. **Daten gibt es reichlich.** Zwischen 258 und 2.514 Dateien pro Testfeld, 3–4 Durchgänge über den Himmel,
   **1,0 bis 1,4 Jahre Zeitbasis**. Man muss **DR1 und QR3** abfragen: Dateien wiederholen sich nicht und
   QR3 bringt den jüngsten Durchgang (außer WISE 0855, das noch kein QR3 hat).
2. **Die Bewegung beträgt 1–2 Pixel im gesamten Zeitraum**, kein Sprung. Pixelskala 6,15″
   (in SIA2 bestätigt), PSF von 7,5–8,7″. Barnard: 1,8 px; WISE 0855: 1,3 px; eps Ind B: 1,1 px.
3. **Die Bewegung lässt sich messen, bei Sternen, die nicht sättigen.** Bei eps Ind B verschiebt sich der Zentroid
   um −0,85 / −0,71 px (Westen / Norden) zwischen 2025,31 und 2026,74; SIMBAD sagt −0,92 / −0,57 px voraus. Die
   hellen Sterne (Barnard, RW Aur) **sättigen**: Ihr Kern ist als schlecht markiert und die Subtraktion
   zeigt ein rot/blaues Paar, **auch wenn sie sich nicht bewegen** (RW Aur). Bei ihnen zählt nur das Qualitative.
4. **Die λ des Objekts ändert sich zwischen den Dateien über die gesamte Breite des Detektors** (~16 Bandbreiten
   innerhalb desselben Detektors). Ein blink, der sie nicht angleicht, mischt 16 verschiedene «Farben».
5. **Aber sie anzugleichen ist einfach:** In jedem Feld und Detektor gibt es Dutzende von Epochenpaaren mit derselben
   λ (innerhalb einer halben Bandbreite). Mit einer Auswahl «bei angeglichener λ» sinkt die Streuung von 0,47 µm auf
   0,005–0,04 µm.
6. **Die λ wird berechnet, ohne die Datei herunterzuladen:** Die Tabelle `WCS-WAVE` ist pro Detektor fest und der Header
   von IMAGE wird mit einer HTTP-Range-Anfrage geladen (~35 KB). ~1.900 Dateien in ~2,5 Minuten.
7. **Die Orientierung dreht sich zwischen den Durchgängen um ~180°.** Man muss **auf ein gemeinsames Gitter reprojizieren** (Norden
   oben), bevor man blinkt oder subtrahiert. Ohne das vergleicht die Subtraktion verschiedene Himmelsstücke.
8. **Ein cutout braucht im Median 7 s (p90 11 s, Maximum 29 s) und wiegt ~3,9 MB, egal welche Größe**:
   fast alles ist die PSF-Erweiterung, die vollständig kommt. Es gab vorübergehende 503-Fehler. **Ohne Cache
   keine Demo.**
9. **IRSA antwortet nicht mit CORS**: Der Browser kann nichts direkt anfordern. **Alles läuft über das
   Backend**, einschließlich SIA2.
10. **Der DR1-Cube hat zwei Versionen.** Die, die SIA2 liefert (`spherex_dr1_cube`), sind FITS mit
    ~320 MB pro Kachel, die der Ausschnittsdienst ablehnt. **Die HiPS-Version lädt in Aladin**
    (`irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`: PNG-Kacheln, 102 Ebenen, offenes
    CORS) und ist bereits im deployten Viewer. Es sind PNG zur Visualisierung: Sie liefern keine Flüsse für ein Spektrum.
    *Korrektur vom 14. Nov. am Nachmittag: Die erste Version dieses Dokuments sagte, der Cube tauge
    nicht für Aladin, weil nur die SIA2-Version getestet worden war.*

---

## 1. Inventar pro Feld

Quelle: `eda/resultados/inventario.json`, SIA2-Suche mit Radius 0,01° an der auf 2025-11 propagierten Position
(MJD 61000).

| Feld | DR1 | DR1 deep | QR3 | QR3 deep | Pointings | Durchgänge | Erste → letzte | Basis |
|---|---|---|---|---|---|---|---|---|
| WISE 0855 | 258 | 0 | 0 | 0 | 129 | 3 | 2025,34 → 2026,37 | 1,02 a |
| Barnard | 240 | 0 | 124 | 0 | 185 | 3 | 2025,62 → 2026,73 | 1,10 a |
| eps Ind B | 347 | 0 | 120 | 0 | 245 | 4 | 2025,31 → 2026,75 | 1,44 a |
| RW Aur | 226 | 0 | 110 | 0 | 168 | 3 | 2025,67 → 2026,71 | 1,04 a |
| R Dra | 422 | 1.233 | 126 | 733 | 1.273 | kontinuierlich | 2025,31 → 2026,74 | 1,42 a |

Was man über diese Tabelle wissen muss:

- **Jedes Pointing ergibt 2 Dateien**, eine für kurze Wellen und eine für lange Wellen, immer in Paaren
  **D1+D4, D2+D5, D3+D6** (das Dichroikum teilt das Licht; dasselbe Himmelsstück fällt auf beide).
- **Ein Durchgang ist keine Epoche**: Er dauert 1 bis 6 Wochen und bringt 7–20 Visiten und ~50–60 Pointings,
  jedes in einer anderen λ. Für das Video ist die natürliche Einheit der **Durchgang** (3–4 Einzelbilder) oder
  die Visite, wenn man mehr Einzelbilder will, auf Kosten der Vermischung von λ.
- **R Dra liegt in einem tiefen Feld** (nahe dem Nordpol der Ekliptik): fast kontinuierliche Beobachtung.
  Es ist das Feld zum Testen von Lichtkurven, nicht das typische.
- Alle abgefragten Dateien haben `L2DQAFLG = Pass` (Qualitätskontrolle von Level 2).

## 2. Die Wellenlänge (der linear variable Filter)

Quellen: `eda/resultados/lambda_resumen.json`, `lambda_por_archivo.csv`, Abbildung `01_lambda_vs_tiempo.png`.

- Innerhalb desselben Detektors durchläuft die λ des Objekts über die Dateien hinweg **den gesamten** Bereich des Detektors:
  ~16 Bandbreiten. Beispiel WISE 0855, D5: von 3,82 bis 4,41 µm.
- Bei jedem Durchgang überstreicht SPHEREx das Objekt erneut mit dem Filter, sodass sich **jede λ alle
  ~6 Monate wiederholt**. Epochenpaare mit mehr als 0,4 Jahren Abstand bei derselben λ: zwischen 18 und 196 pro
  Feld und Detektor.
- Validierung: Die eigene Interpolation von `WCS-WAVE` stimmt mit der von astropy (`WAVE-TAB`) in allen
  6 Detektoren bis zur vierten Dezimalstelle überein.

Direkter Vergleich bei WISE 0855, D5 (Abbildungen `02_wise_0855_*.png`):

| Auswahl | λ der 4 Einzelbilder (µm) | Streuung |
|---|---|---|
| Naiv (erste Datei jedes Durchgangs) | 4,295 · 3,821 · 4,047 · 3,835 | **0,474 µm** |
| Bei angeglichener λ | 4,145 · 4,153 · 4,153 · 4,180 | **0,035 µm** |

## 3. Geometrie: Orientierung und Ausrichtung

Gemessen an den 25 Ausschnitten mit `size=0.1` (59×59 px):

- Positionswinkel des Detektors: wechselt zwischen ~−160° und ~+19° (WISE 0855), ~−179° und ~+1°
  (Barnard), ~−28° und ~+154° (eps Ind B). Nahe dem Pol (R Dra) beliebige Winkel.
- Die Größe des Ausschnitts schwankt um ±1 px zwischen den Dateien (58 oder 59).

**Folge:** Das Backend reprojiziert jeden Ausschnitt auf ein gemeinsames TAN-Gitter, Norden oben, mit der
nativen Skala (`reproject_interp` der Bibliothek `reproject`). Implementiert in
`eda/03_recortes_y_figuras.py` (`grilla_comun`, `panel`).

## 4. Was in jedem Feld zu sehen ist

Abbildungen `eda/figuras/02_*.png`. Ausschnitte von 0,1°, `IMAGE − ZODI`, reprojiziert, asinh-Streckung.
Der orangefarbene Kreis ist die mit der SIMBAD-Eigenbewegung auf das Datum jeder Datei propagierte Position.

| Feld | Band | Ist das Objekt zu sehen? | Ist die Änderung zu sehen? |
|---|---|---|---|
| Barnard | D2 (1,5 µm) | Ja, **gesättigt**: 30–44 der 49 Pixel des Kerns als schlecht markiert | Rotes Paar oben / blau unten (nach Norden, wie seine Bewegung), aber nicht messbar: Der Zentroid existiert bei maskiertem Kern nicht |
| eps Ind B | D5 (3,86 µm) | Ja, ohne Sättigung | **Ja, und gemessen**: −0,85 / −0,71 px gegenüber −0,92 / −0,57 px vorhergesagt (siehe unten) |
| RW Aur | D3 (1,94 µm) | Ja, gesättigt (6–8 schlechte Pixel im Kern) | **Rot/blaues Paar, obwohl es sich nicht bewegt**: Es ist der Effekt der Sättigung und der Maske, keine Bewegung |
| R Dra | D4 | Ja | Helligkeitsmessung ausstehend |
| WISE 0855 | D5 und D6 | **Kaum** in einzelnen Belichtungen | Nicht in einer einzelnen Belichtung |

**WISE 0855 ist ein Pflichtfall (Testobjekt der Organisation) und wird immer gezeigt, aber mit einzelnen Belichtungen ist es schwach zu sehen**: Es ist pro
Belichtung zu schwach. Um es zu sehen, müsste man die Belichtungen jedes Durchgangs summieren (der Stichpunkt der Aufgabenstellung
«add together all the data taken by each of the six detector arrays»).

### Zentroide: Entspricht die gemessene Verschiebung der von SIMBAD vorhergesagten?

Quelle: `eda/resultados/centroides.json` (`eda/05_centroides.py`). Erste und letzte Epoche bei angeglichener λ,
auf dasselbe Gitter reprojiziert; schlechte Pixel ausgeschlossen. x positiv = Westen, y positiv = Norden.

| Feld | Gemessen (px) | Vorhergesagt (px) | Feldsterne (Median, px) | Schlechte Pixel im Kern |
|---|---|---|---|---|
| eps Ind B | −0,85 / −0,71 | −0,92 / −0,57 | +0,05 / −0,37 (3 Sterne) | 1 und 0 von 49 |
| RW Aur | +0,73 / +1,22 | 0 / 0 | −0,01 / +0,07 (5 Sterne) | 6 und 8 von 49 |
| Barnard | nicht möglich (Kern leer) | +0,14 / +1,81 | −0,14 / +0,04 (8 Sterne) | 44 und 44 von 49 |

Lesart:

- **Die Ausrichtung funktioniert:** Die Feldsterne verschieben sich um ein bis zwei Zehntel Pixel (bis zu
  0,37 px bei eps Ind B, mit nur 3 Sternen).
- **eps Ind B bewegt sich genau so, wie es sich bewegen muss**, innerhalb von ~0,15 px in jeder Achse. Es ist der quantitative
  Beweis, dass angeglichene λ + Reprojektion + Subtraktion reale Bewegung zeigen.
- **Sättigende Sterne täuschen.** Der Kern von Barnard und von RW Aur ist als schlecht markiert
  (OVERFLOW, TRANSIENT, SUR_ERROR). Schließt man ihn aus, bleibt ein asymmetrischer Ring übrig und der
  Zentroid verschiebt sich: RW Aur «bewegt sich» 1,4 px, ohne sich zu bewegen. In der Subtraktion erscheint dasselbe
  rot/blaue Paar, das ein sich tatsächlich bewegendes Objekt hinterlässt. **Der Viewer muss warnen, wenn das Objekt sättigt.**

## 5. Qualitätsmaske (`FLAGS`)

Die Namen der Bits **stehen im Header selbst** von `FLAGS` (Karten `MSKNnnnn` Name,
`MSKMnnnn` Maske, `MSKDnnnn` Beschreibung): Man muss nicht die Tabelle 16 des Supplements suchen.

Häufigkeit in den 25 Ausschnitten:

| Bit | Name | % der Pixel | Macht das Pixel ungültig? |
|---|---|---|---|
| 21 | SOURCE | **72,4 %** | **Nein**: markiert, dass es eine bekannte Quelle gibt. Es ist das, was wir sehen wollen |
| 28 | HALO | 2,1 % | Diskutabel: vorübergehender Halo um helle Quellen |
| 0 | TRANSIENT | 1,6 % | Ja |
| 2 | SUR_ERROR | 1,3 % | Ja |
| 26 | BLOOM | 0,8 % | Diskutabel |
| 19 | OUTLIER | 0,7 % | Ja |
| 6 | NONFUNC | 0,4 % | Ja |
| 17 | PERSIST | 0,3 % | Ja |
| 1 | OVERFLOW | 0,2 % | Ja |
| 11 | COLD | 0,1 % | Ja |

**Falle:** `FLAGS != 0` markiert wegen SOURCE 72 % des Ausschnitts. Man muss eine Maske
pro Bit verwenden. Die der EDA (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`) maskiert ~4 % der
Pixel, aber beim Reprojizieren mit bilinearer Interpolation werden die NaN größer und auf dem Bildschirm erscheinen sie
als weiße Blöcke (~15 %). Für den Viewer empfiehlt es sich, **die Maske per nächstem Nachbarn zu reprojizieren und die
schlechten Pixel aufzufüllen**, und die Maske als optionale Ebene anzuzeigen.

## 6. Infrastruktur

Quelle: `eda/resultados/infraestructura.json`, `latencia_cutouts.json`.

| Frage | Antwort | Folge |
|---|---|---|
| Antwortet IRSA mit CORS? | **Nein** (weder SIA2 noch Dateien) | Alles läuft über unser Backend |
| SIA2-Abfrage | 1–3,5 s pro Sammlung | Kann live erfolgen, 4 Sammlungen parallel |
| Header per HTTP Range | ~2 s, 35 KB; ~0,1 s effektiv bei 6 parallel | Metadaten und λ von Hunderten von Dateien in Sekunden |
| Cutout `size=0.1` | Median 7,3 s, p90 10,8 s, max. 29 s; ~3,9 MB; 25 in 52 s mit 4 Threads | Cache auf der Festplatte obligatorisch; die Felder der Demo vorwärmen |
| Ist ein kleinerer cutout schneller? | Nein: 0,02° wiegt gleich viel (die PSF kommt vollständig) | Immer 0,1° anfordern; mehr kostet nichts |
| Fehler | Vorübergehende 503; einer überdauerte 4 Wiederholungen | Wiederholungen mit Wartezeit und Fehlerzustand in der UI |
| DR1-Cube über SIA2 (`spherex_dr1_cube`) | FITS 512×512×102, ~320 MB pro Kachel, Pixel 12,9″; der cutout antwortete 422 «lacks WCS» (und 503 bei einem zweiten Test) | Taugt weder für Ausschnitte noch für Spektren im laufenden Betrieb |
| **DR1-Cube als HiPS** (`/data/hips/SPHEREx/spherex_allsky_cube`) | `properties` antwortet 200 mit `Access-Control-Allow-Origin: *`; PNG, Ordnung 5, 102 Ebenen (die 50 und 51 leer), Pixel 12,9″, veröffentlicht am 1. Nov. 2026 | **Lädt in Aladin** (der deployte Viewer nutzt ihn). Es ist ein Mosaik aller Epochen: ohne Zeitachse, und als PNG, ohne Flüsse |
| SPHEREx-HiPS beim CDS | Der MocServer listet `CDS/P/SPHEREx/QR2/D1`…`D6` (QR2, Ordnung 7); `alasky` lieferte am 14. Nov. 404, sogar für DSS | Plan B, falls das von IRSA ausfällt; nicht verifiziert |

## 7. Was nicht geprüft wurde

- Die Helligkeit: In keinem Feld wurde Photometrie gemessen (Veränderlichkeit von RW Aur und R Dra ungemessen).
- Ob das HiPS des CDS in Aladin Lite lädt (Server zum Zeitpunkt des Tests ausgefallen). Das ist nicht mehr nötig: Das von IRSA lädt.
- Die `_deep`-Sammlungen wurden in der λ-Analyse nicht verwendet (nur DR1 und QR3).
- Wie man die Position eines gesättigten Sterns misst (PSF-Fit an den Flügeln oder einen Detektor nutzen, in dem er nicht sättigt).
- Belichtungen eines Durchgangs summieren, um WISE 0855 zu sehen.
- Die Subtraktion von R Dra wurde nicht im Detail geprüft. Die Zentroide wurden nur in der ersten und der letzten Epoche gemessen.
