---
name: spherex-datos
description: Wie man SPHEREx-Daten aus dem IRSA/IPAC-Archiv anfragt - SIA2-Collections (spherex_dr1, spherex_qr3 und die Varianten deep und cube), cutout-Dienst, Struktur des Level-2-MEF und seiner sechs Extensions (IMAGE, FLAGS, VARIANCE, ZODI, EPSF, WCS-WAVE), die sechs Bänder und ihre Wellenlängen, der HiPS-Allsky-Cube von DR1 und die bereits existierenden IRSA-Tools (Data Explorer, MOST, Cutout, Mosaic, Spectrophotometry, Source Discovery). Aktiviere sie, wenn SPHEREx-Daten abgefragt, heruntergeladen, ausgeschnitten, gelesen oder verstanden werden müssen; wenn IRSA, IPAC, SIA2, pyvo, astroquery, cutout, MEF, SPHEREx-FITS, DR1, QR2, QR3, WCS-WAVE, Zodiakallicht, linear variabler Filter oder LVF erwähnt werden; oder beim Entwurf des Backends, das den Viewer speist.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../../en/.claude/skills/spherex-datos/SKILL.md) · [Español](../../../../es/.claude/skills/spherex-datos/SKILL.md) · [中文](../../../../zh/.claude/skills/spherex-datos/SKILL.md) · **Deutsch** · [Italiano](../../../../it/.claude/skills/spherex-datos/SKILL.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/skills/spherex-datos/SKILL.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# SPHEREx-Daten bei IRSA

Operative Referenz. Das lange Dokument mit Quellen ist `docs/02_DATOS_SPHEREX.md`;
diese Skill ist das, was man braucht, um Code zu schreiben, ohne sich zu irren.

**Goldene Regel: Wenn ein Pfad oder ein Parameter weder in dieser Skill noch in der offiziellen
IRSA-Dokumentation steht, erfinde ihn nicht.** Konsultiere <https://caltech-ipac.github.io/spherex-archive-documentation/>.

---

## 1. Das Erste, was man verstehen muss: der linear variable Filter

SPHEREx hat keine diskreten Filter. Die Wellenlänge variiert kontinuierlich entlang einer Achse des
Detektors. Das Spektrum einer Quelle entsteht, indem man sie viele Male beobachtet, jedes Mal an einer anderen
Position im Feld, und **daher jedes Mal in einer anderen Wellenlänge**.

**Direkte Konsequenz:** Zwei Bilder derselben Himmelszone, aufgenommen in verschiedenen Epochen,
liegen normalerweise **nicht in derselben Wellenlänge**. Ein naives Blink erzeugt eine Sequenz, in der
die Helligkeit springt, ohne dass sich etwas bewegt hätte.

Deshalb gilt in jedem Code, der eine zeitliche Sequenz aufbaut:

1. **Gruppiere nach Detektor/Band und wähle die Epochen mit angeglichener λ**, bevor du die Sequenz bildest. Nach Band zu gruppieren genügt nicht: Innerhalb eines Detektors durchläuft die λ des Objekts ~16 Bandbreiten; mit angeglichener Auswahl sinkt sie von 0,47 auf 0,035 µm (`eda/03_recortes_y_figuras.py`, `elegir_lambda_igualada`; `docs/09` §2). Danach auf ein gemeinsames Raster reprojizieren: Der Detektor dreht sich zwischen den Durchgängen um ~180°.
2. **Lies `WCS-WAVE`** und gib die λ jedes Einzelbildes aus. Das ist nicht optional: Es ist das Feld, das erklärt, was der
   Nutzer sieht.
3. **Normalisiere jedes Einzelbild** mit robusten Perzentilen über denselben Ausschnitt.

---

## 2. Die sechs Bänder

| Band = Detektor | λ | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

Ein Pointing erzeugt **6 MEF**, eines pro Detektor, aber eine gegebene Position fällt nur auf 2 davon (Paare D1+D4, D2+D5 oder D3+D6): Eine Abfrage nach Position liefert 2 Dateien pro Pointing (`docs/09` §1). **Nicht alle Beobachtungen bringen die 6 mit**: Die Qualität
wird pro Band bewertet. Der Code muss fehlende Bänder tolerieren, ohne zu scheitern.

Für kalte Braune Zwerge und rote Objekte sind die langen Bänder (4–6) die interessanten.

---

## 3. SIA2-Collections

Generischer Endpoint:

```
https://irsa.ipac.caltech.edu/SIA?
```

| COLLECTION | Was es ist |
|---|---|
| `spherex_dr1` | Spektralbilder DR1, weiter Durchgang |
| `spherex_dr1_deep` | DR1, tiefe Felder |
| `spherex_dr1_cube` | Allsky-Cube DR1 |
| `spherex_qr3` | Spektralbilder QR3, weiter Durchgang |
| `spherex_qr3_deep` | QR3, tiefe Felder |

- **DR1 + QR3 ersetzen QR2.** Um alles Aktuelle zu finden, muss man **beide** abfragen.
- **QR2 ist über SIA2 nicht durchsuchbar.** Es bleibt per direkter URL bis Februar 2027 herunterladbar.
- Die **Kalibrierungs**dateien sind **nicht in SIA2**: Sie werden aus den durchsuchbaren Verzeichnissen geladen.
- Die Daten werden **wöchentlich** eingespielt, und SIA2 **hinkt ~1 Tag hinterher** gegenüber den Verzeichnissen und dem
  Data Explorer.

Abfrage per Kommandozeile (Beispiel aus der IRSA-Dokumentation):

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO`, alles in Grad. Lass `RESPONSEFORMAT` weg, um VOTable zu erhalten.

Spalten der Antwort, die wichtig sind:

- `access_url` — URL der Datei bei IPAC. **Auf dieser URL fordert man das cutout an.**
- `cloud_access` — wie man dieselbe Datei aus AWS S3 liest.

---

## 4. Cutouts

Ein vollständiges MEF wiegt **~70 MB**. Für einen Viewer muss man **immer** Ausschnitte anfordern.

Sie werden angefordert, indem man **Parameter an die `access_url` anhängt**:

```bash
curl -o cutout.fits "<access_url>?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in Dezimalgrad.
- `size` in Grad.
- Dokumentation: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

**Funktioniert nur auf den bei IPAC gehosteten Dateien, nicht auf der AWS-Kopie.**

Das ausgeschnittene MEF behält dieselben Extensions; `IMAGE`, `FLAGS`, `VARIANCE` und `ZODI` werden ausgeschnitten,
`WCS-WAVE` wird angepasst, und **die PSF-Extension kommt unverändert** (es ist die des gesamten Bildes).

---

## 5. Was im MEF steckt

2040 × 2040 Pixel, sechs Extensions:

| HDU | Name | Inhalt | Falle |
|---|---|---|---|
| 1 | `IMAGE` | Oberflächenhelligkeit, MJy/sr | **Das Zodiakallicht ist NICHT abgezogen** |
| 2 | `FLAGS` | Statusbits pro Pixel | Die Namen der Bits stehen im Header (`MSKN/MSKM/MSKD`). **Niemals `FLAGS != 0`**: Das Bit SOURCE markiert 72 % des Ausschnitts und ist kein Fehler; nutze eine Bitmaske (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`, ~4 %) |
| 3 | `VARIANCE` | Varianz, (MJy/sr)² | Nutze sie für das Signal-Rausch-Verhältnis |
| 4 | `ZODI` | Modell des Zodiakallichts, MJy/sr | Zieh es selbst ab: `IMAGE - ZODI` verbessert den Kontrast stark |
| 5 | `EPSF` (DR1/QR3) oder `PSF` (QR2) | PSF pro Detektorzone | Hat sich zwischen Releases geändert. Nimm die Form nicht als gegeben an |
| 6 | `WCS-WAVE` | Pixel → zentrale λ und Bandbreite | Wenig genutzter Teil des FITS-Standards; viele Reader verstehen ihn nicht |

Zu `WCS-WAVE`: Es ist eine Tabelle mit **1 Zeile und 3 Spalten** (`X`, `Y`, `VALUES`), ein Raster von Kontrollpunkten.
Wenn dein Reader sie nicht erkennt, **interpoliere bilinear zwischen den vier nächstgelegenen
Kontrollpunkten**: Genauigkeit ~1 nm, genug für die Visualisierung. Für Wissenschaft muss man `CWAVE` und
`CBAND` des Kalibrierungsprodukts Spectral WCS verwenden.

**Pixelkonvention:** FITS-Header sind 1-basiert; Astropy liefert 0-basiert. IRSA warnt ausdrücklich
davor beim Arbeiten mit der PSF. Es ist die klassische Ursache für Verschiebungen um ein Pixel.

### Dateinamen

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits` liest sich so:
`2025W18_2B` = planning period (~3,5 Betriebstage) · `0001` = large slew ·
`1` = small slew (1–4) · `D1` = Detektor 1 · `v12-2025-164` = Version und Verarbeitungsdatum.

---

## 6. Der Allsky-Cube (nur DR1)

Mosaike des gesamten Himmels, eines für jeden der 102 Kanäle. **Es gibt zwei Versionen** (geprüft am 14. Nov., `docs/09`):

1. **Die von SIA2** (`COLLECTION=spherex_dr1_cube`, Verzeichnis `.../ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir[N]/`):
   FITS von ~320 MB pro Kachel; der Ausschnittsdienst lehnt sie ab. **Taugt nicht für Aladin.** (Die Wurzel
   dieses Verzeichnisses als HiPS, `.../properties`, liefert 404.)
2. **Die HiPS für den Browser:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
   (PNG, Order 5, 102 Ebenen, 50 und 51 leer, CORS offen). **Diese lädt Aladin Lite.**
   Siehe die Skill `visor-sky-blink`.

Die beiden Produkte nicht verwechseln:

| | Level 2 | Allsky-Cube |
|---|---|---|
| Achse, die er beiträgt | **Zeit** | **Wellenlänge** |
| Wofür | Das Blink, die Bewegung | Die Farbe und der Kontext (PNG ohne Flüsse: Das Spektrum stammt **nicht** von hier, sondern aus Level 2) |
| Auflösung | Nativ | HEALPix-Order 5 (grob) |
| Wo | DR1, QR3 | Nur DR1 |

---

## 7. Python

```bash
pip install pyvo astroquery astropy
```

Die offiziellen Notebooks sind der kürzeste Weg und liegen unter
<https://caltech-ipac.github.io/irsa-tutorials/spherex/>: Data Overview, Spectral Image Cutouts,
PSF Models, Source Discovery Tool, Mosaic Cube, HiPS All-Sky Cube.

**Bevor du einen eigenen Client schreibst, sieh dir `spxquery` an** (<https://spxquery.readthedocs.io>,
`pip install spxquery`): ein Drittanbieter-Paket, das bereits TAP-Abfrage an IRSA, Download mit cutout,
Aperturphotometrie mit Abzug des Zodiakallichts, Kombination zu 3D-Cubes und Lichtkurven erledigt. Auch wenn man es nicht
nutzt, sind seine Vier-Stufen-Architektur und seine Qualitätskontrolle (SNR-Schwelle, Filterung nach Flags)
eine gute Landkarte dessen, was zu lösen ist.

---

## 8. Bereits existierende Tools von IRSA

Bevor du etwas baust, prüfe, ob IRSA es schon getan hat. Alle sind verlinkt von
<https://irsa.ipac.caltech.edu/Missions/spherex.html>.

| Tool | Was es tut |
|---|---|
| **SPHEREx Data Explorer** | Suche, Visualisierung und Download, für Astronomen |
| **MOST** | Findet anhand der Bahn eines Objekts des Sonnensystems die Bilder, die seine vorhergesagte Position in jeder Epoche abdeckten |
| **Spectrophotometry Tool** | Extrahiert Spektren per forcierter Photometrie |
| **Mosaic Tool** | Maßgeschneiderte Multiband-Mosaike |
| **Cutout Tool** | Ausschnitte aus den MEF |
| **Source Discovery Tool** | Erkennt und charakterisiert Quellen ohne vorherige Positionen |
| **Cloud Data Access** | Dieselben Daten in AWS S3 |
| **Comet 3I/ATLAS** | Eigene Collection von Bildern des interstellaren Kometen |

---

## 9. Verpflichtende Attribution

Muss in jedem veröffentlichten Material erscheinen, das SPHEREx-Daten nutzt:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## 10. Fehler, von denen wir wissen, dass sie gemacht werden

1. **Blinken, ohne nach Band zu gruppieren.** Erzeugt eine stroboskopartige Sequenz. Abschnitt 1.
2. **Vergessen, `ZODI` abzuziehen.** Schwache Quellen gehen im Hintergrund verloren.
3. **Annehmen, dass alle Epochen die 6 Bänder mitbringen.** Das ist nicht so.
4. **Nur in `spherex_dr1` suchen** und folgern, dass es wenige Epochen gibt. Man muss `spherex_qr3` dazunehmen.
5. **QR2 benutzen, weil es in einem alten Tutorial stand.** Es ist über SIA2 nicht durchsuchbar.
6. **Das komplette MEF herunterladen**, statt ein cutout anzufordern. 70 MB pro Epoche.
7. **1-basiert und 0-basiert mischen** beim Umrechnen von Pixeln. Verschiebungen um ein Pixel.
8. **Aperturphotometrie als wissenschaftliche Qualität präsentieren.** Immer mit ihrer Warnung.
9. **cutouts auf der AWS-URL anfordern.** Der Dienst arbeitet nur auf den IPAC-Dateien.
10. **Nach einer leeren Abfrage schließen «es gibt keine Daten».** Probiere eine andere Collection, einen anderen Radius, ein anderes Band.

---

## 11. Gegen die Dokumentation von IRSA/AWS verifizierte Extras (14. Nov. 2026)

Aus der Erkundung des Teams ergänzt. **Entnommen der Dokumentation von IRSA/AWS: Das EDA nutzte SIA2 und HTTP Range, nicht TAP und nicht den S3-Mirror, daher sind diese beiden vom Team noch nicht getestet.** Teste sie mit einer echten Datei, bevor du dich auf sie verlässt.

- **Mirror in AWS (Massenlesen, ohne Konto):** `s3://nasa-irsa-spherex/{qr3,dr1}/level2/...`,
  Region `us-east-1`, anonymer Zugriff. Gleiche Verzeichnisstruktur wie IRSA. Teilweises Lesen, ohne
  die 70 MB herunterzuladen:
  ```python
  from astropy.io import fits
  with fits.open(s3_url, use_fsspec=True, fsspec_kwargs={"anon": True}) as h:
      sub = h["IMAGE"].section[y0:y1, x0:x1]
  ```
  Nur nützlich, wenn das Backend in `us-east-1` läuft. Für ein Objekt ist das cutout von IRSA einfacher (Fehler 9).
- **Schnelle TAP-Abfrage, nach Zeit geordnet und mit bereits zusammengesetzter cutout-URL** (schneller Weg des
  Tutorials `spherex-cutouts`: indizierter räumlicher Join über `spherex.plane.poly`):
  ```python
  from astroquery.ipac.irsa import Irsa
  from astropy.utils.data import conf; conf.remote_timeout = 120
  q = f"""SELECT 'https://irsa.ipac.caltech.edu/' || a.uri ||
    '?center={ra},{dec}d&size=0.1' AS uri, p.time_bounds_lower, p.energy_bandpassname
  FROM spherex.artifact a JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1=CONTAINS(POINT('ICRS',{ra},{dec}), p.poly)
  ORDER BY p.time_bounds_lower"""
  tab = Irsa.query_tap(q).to_table()
  ```
  Ergänze `AND p.energy_bandpassname='SPHEREx-D4'` für ein einzelnes Band.
- **λ am Pixel der Quelle mit astropy** (alternatives WCS `W` der Extension `WCS-WAVE`):
  ```python
  from astropy.wcs import WCS
  x, y = WCS(h["IMAGE"].header).world_to_pixel(coord)
  wcs_w = WCS(h["IMAGE"].header, fobj=h, key="W"); wcs_w.sip = None
  lam, dlam = wcs_w.pixel_to_world(x, y)   # λ central y ancho de banda
  ```
  Wenn es fehlschlägt: bilineare Interpolation zwischen den 4 nächstgelegenen Kontrollpunkten der Tabelle (~1 nm).
- **Robuster Download:** `ThreadPoolExecutor(max_workers=10)` mit Wiederholung bei `TimeoutError`,
  `HTTPError`, `IncompleteRead` und `RemoteDisconnected` (so macht es das offizielle Notebook). Ein cutout ohne
  Überlappung liefert **HTTP 500**: Behandle es als «keine Daten», nicht als Ausfall.
- **Sich bewegende Sterne erscheinen als Dipol** (positives/negatives Paar) in `diff_first`/`diff_prev`.
  Das ist erwartet und genau das, was der Nutzer sehen soll; es ist keine Variabilität. **Außer der Kern ist gesättigt oder maskiert** (OVERFLOW, TRANSIENT, SUR_ERROR): Dann erscheint das Paar, auch wenn sich das Objekt nicht bewegt (RW Aur «bewegt sich» 1,4 px, ohne sich zu bewegen). Man muss warnen, wenn das Objekt sättigt (`docs/09`).
- **Um Epochen zu subtrahieren, zuerst `reproject.reproject_interp` auf ein gemeinsames Raster:** Jede Epoche kommt
  mit einer anderen Rotation. Zeige die Subtraktion in S/N mit `VARIANCE`, damit die Residuen heller
  Sterne nicht wie Detektionen aussehen.


---

## 12. Im EDA gemessen (14. Nov.)

Zahlen aus `docs/09_EDA_HALLAZGOS.md` und `eda/resultados/`, um sie nicht erneut messen zu müssen:

- **IRSA antwortet nicht mit CORS** (weder SIA2 noch die cutouts): Alles läuft über das Backend. Nur die HiPS unter `/data/hips/SPHEREx/` hat es.
- **Cutout von 0,1°:** Median 7,3 s, p90 10,8 s, max. 29 s, ~3,9 MB **egal welcher Größe** (die PSF kommt komplett: ein kleineres ist nicht schneller). 503 vorübergehend; einer blieb nach 4 Wiederholungen bestehen. Mit höchstens 4 parallel.
- **Billiger Header:** Der Header von IMAGE wird mit einer HTTP-Range-Anfrage von ~35 KB geladen (~0,1 s effektiv bei 6 parallel).
- **Pixelskala:** 6,15″ (SIA2). Die schnellsten Objekte bewegen sich 1,1-1,8 px im gesamten verfügbaren Zeitraum (1,0-1,4 Jahre).
