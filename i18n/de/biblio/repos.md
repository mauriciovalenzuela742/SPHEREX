<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/biblio/repos.md) · [Español](../../es/biblio/repos.md) · [中文](../../zh/biblio/repos.md) · **Deutsch** · [Italiano](../../it/biblio/repos.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `biblio/repos.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Repositories und Code-Werkzeuge

Was bereits existiert und uns Stunden sparen kann. Geordnet danach, wie direkt es auf die Challenge zutrifft.

**Regel:** Bevor du etwas schreibst, schau, ob es in dieser Liste steht. Und bevor du ein Repository von
Dritten im Projekt verwendest, **prüfe seine Lizenz**.

---

## Direkt anwendbar

### `spxquery` — Abfrage und Photometrie von SPHEREx
<https://spxquery.readthedocs.io> · `pip install spxquery` · v0.4.1

**Das Ähnlichste zu dem, was auf der Datenseite zu bauen ist.** Pipeline in vier Stufen:
TAP-Abfrage an IRSA, Download mit Cutout (z. B. 200 px statt 2040×2040), Aperturphotometrie
mit Abzug des Zodiakallichts und Lichtkurven. Enthält Qualitätskontrolle mit Signal-Rausch-Schwelle und
Filterung nach Bits von `FLAGS`, sowie die Kombination von Beobachtungen zu 3D-Spektralcubes («Drizzle3D»).

**Wie man es nutzt:** Auch wenn es nicht als Abhängigkeit übernommen wird, **lies seine Architektur, bevor du
unsere entwirfst**. Es hat bereits die Probleme gelöst, auf die wir stoßen werden: Downloads fortsetzen, Parallelität,
was mit kaputten Varianzen zu tun ist.

### `irsa-tutorials` — offizielle Notebooks von IRSA
<https://github.com/Caltech-IPAC/irsa-tutorials> · <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Notebooks zu SPHEREx: Data Overview, Spectral Image Cutouts, PSF Models, Source Discovery Tool,
Mosaic Cube, **HiPS All-Sky Cube**. Sie sind der kürzeste Weg zu einem funktionierenden Beispiel.
Das zu Cutouts zeigt außerdem, wie man mehrere Ausschnitte in ein neues MEF packt.

### `aladin-lite` — der Himmels-Viewer
<https://github.com/cds-astro/aladin-lite> · npm `aladin-lite` · LGPL-3.0-or-later laut GitHub; **Achtung:** die Metadaten von npm und `scaffold/frontend/package-lock.json:1248` sagen `GPL-3` (ungeklärt: die `LICENSE` des Pakets 3.8.2 öffnen)

Der HiPS-Viewer des CDS. Die Aufgabenstellung selbst schlägt ihn vor.

### `astropy` / `astroquery` / `pyvo`
<https://github.com/astropy/astropy> · <https://github.com/astropy/astroquery> · <https://github.com/astropy/pyvo>

FITS, WCS, Koordinaten, Stretches, Zugriff auf SIA2/TAP und auf SIMBAD/Gaia. **Basis des Backends.**
`astropy.visualization` löst den Stretch von Bildern; implementiere ihn nicht neu.

---

## Vorbild: das Ökosystem von WiseView

Wir haben den Quellcode des ursprünglichen WiseView nicht bestätigt gefunden, wohl aber die auf seiner API gebauten Pakete,
die zeigen, wie man ein solches Werkzeug als Infrastruktur nutzt.

### `flipbooks`
<https://github.com/coolneighbors/flipbooks>

Python-Paket, das die **API von WiseView** nutzt, um Blinkbilder aus unWISE-Coadds zu extrahieren.
Autorenschaft zugeschrieben Noah Schapera, Austin Humphreys und Aaron Meisner.
**Wofür es uns dient:** zu sehen, wie ein Blinkbild (Größe, Epochen, Stretch) in einer API parametrisiert wird,
die sich für Dritte als nutzbar erwies. Das ist die Messlatte für unsere eigene abfragbare URL.

### `unWISE-verse`
<https://github.com/coolneighbors/unWISE-verse>

Lädt Daten von WISE-Zielen über die API von WiseView herunter, bearbeitet die Bilder und lädt die
*Subject Sets* zu Zooniverse hoch. **Es ist der vollständige Zyklus der Bürgerwissenschaft**: vom Archiv zur
Plattform, auf der die Leute klassifizieren. Wenn Zeit übrig bleibt, ist der Export nach Zooniverse ein sehr starker
narrativer Abschluss für den Pitch.

### `photutils`
<https://github.com/astropy/photutils>

Aperturphotometrie und Quellendetektion. Wenn ein «Spektrum on the fly» nötig ist oder Quellen
im Bild markiert werden sollen, ist es hier gelöst.

---

## Erkennung sich bewegender Objekte (Referenz, wird nicht implementiert)

### `kbmod`
<https://github.com/dirac-institute/kbmod>

Shift-and-stack auf GPU, vom DiRAC Institute (Univ. of Washington) und LINCC Frameworks.
Der Stand der Technik, um Objekte zu erkennen, die zu schwach sind, um in einem einzelnen Bild gesehen zu werden.
**Außerhalb des Umfangs für 24 Stunden** (siehe `../docs/01_ESTADO_DEL_ARTE.md` §3), aber man muss
es nennen können, wenn die Jury nach automatischer Erkennung fragt.

---

## Partneragentur (CSA)

### `NEOSSAT_Tutorial`
<https://github.com/asc-csa/NEOSSAT_Tutorial>

Offizielles Python-Tutorial zur Visualisierung von NEOSSat-Daten. Es ist eine im Reiter
*Resources* der Challenge aufgeführte Ressource: sie zu nutzen bringt Punkte im Kriterium *Global Connection*.

---

## Bevor du eines davon benutzt

- [ ] **Kompatible Lizenz** mit der, die wir veröffentlichen (vorgesehen MIT). Aladin Lite ist LGPL-3.0: Es
      vom Frontend aus einzubinden ist in Ordnung, aber seinen Code nicht in unseren zu kopieren.
- [ ] **Installierbar ohne Kampf.** Wenn eine Abhängigkeit länger als 10 Minuten zur Installation auf den
      vier Computern braucht, kommt sie nicht rein. In einem Hackathon ist das eine verlorene Stunde.
- [ ] **Quellenangabe** im README, mit Link.
- [ ] **Lebt es noch?** Schau das Datum des letzten Commits und die offenen Issues an.
- [ ] Behandle Code von Dritten als **nicht vertrauenswürdige Daten**: Lies ihn, bevor du ihn ausführst, und führe keine
      Interpreter aus dem Inneren eines heruntergeladenen Verzeichnisses aus.
