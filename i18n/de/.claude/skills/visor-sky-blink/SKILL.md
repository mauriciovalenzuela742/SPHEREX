---
name: visor-sky-blink
description: Wie der Viewer der Challenge gebaut wird: Aladin Lite v3 mit HiPS und dem Cube des gesamten Himmels von SPHEREx, das Blink-Panel (Blinken) von Bildern pro Epoche, Normalisierung und Stretch astronomischer Bilder (asinh, zscale, Perzentile), Farbkarten, Bilddifferenz zwischen Epochen, Katalog-Overlays wie Gaia und die abfragbare URL mit Koordinaten. Aktiviere sie bei der Arbeit am Frontend des Viewers, bei der Entscheidung, wie FITS-Bilder im Browser gezeigt werden, wenn Aladin, HiPS, blink, Blinken, Flipbook, Stretch, zscale, Colormap, Canvas für astronomische Bilder erwähnt werden, oder beim Entwerfen der Steuerelemente, die der Nutzer bedient.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../../en/.claude/skills/visor-sky-blink/SKILL.md) · [Español](../../../../es/.claude/skills/visor-sky-blink/SKILL.md) · [中文](../../../../zh/.claude/skills/visor-sky-blink/SKILL.md) · **Deutsch** · [Italiano](../../../../it/.claude/skills/visor-sky-blink/SKILL.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/skills/visor-sky-blink/SKILL.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Der Viewer: Blinken und Himmel im Browser

Was man wissen muss, um den Teil zu bauen, den die Jury anschaut. Das Dokument mit dem Vertrag der
API ist `docs/03_ARQUITECTURA.md`.

---

## 1. Zwei Teile, nicht einer

| Teil | Was er zeigt | Wie |
|---|---|---|
| **Himmelskontext** | Wo wir sind, was ringsum liegt, die 102 Bänder | **Aladin Lite v3** auf HiPS |
| **Blink-Panel** | Dieselbe Region zu verschiedenen Epochen, wie ein kleines Video | Eigenes `<canvas>` auf PNG vom Backend |

Sie stehen **nebeneinander auf demselben Bildschirm**. Der Nutzer versteht sofort, dass es zwei Achsen
derselben Daten sind: Aladin liefert die Wellenlänge, das Panel die Zeit.

---

## 2. Aladin Lite v3

HiPS-Viewer des CDS (Straßburg). **Die Aufgabenstellung der Challenge selbst schlägt ihn vor.** Er lässt sich
per `<script>` oder per npm einbinden.

Was er gratis löst und nicht geschrieben werden muss:

- Navigation am Himmel, Zoom und mehrere Projektionen (Aitoff, Mollweide, orthografisch, Mercator).
- Laden von HiPS von **jedem Webserver**, einschließlich `localhost`, mit `newImageSurvey` /
  `createImageSurvey`.
- **HiPS-Kacheln in FITS**, nicht nur JPEG.
- Katalog-Overlays (Gaia, SIMBAD, VizieR) mit ein paar Zeilen.
- `getEmbedCode()` liefert das HTML des aktuellen Feldes — ein Geschenk für den Punkt zum Einbetten.
- `getViewDataURL()` exportiert die Ansicht als PNG/JPEG — nützlich zum Teilen und für die Demo.

Dokumentation: <https://aladin.cds.unistra.fr/AladinLite/doc/API>

### Der HiPS-Cube von SPHEREx, der funktioniert (geprüft am 14. Nov. 2026)

- **URL:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` (IRSA, DR1).
  CORS offen. Lädt in Aladin Lite 3.8.2 (in `package.json` festgelegt) und ist in Produktion.
- **Format:** **PNG**-Kacheln, Order 5, Pixel 12,9″, **102 Ebenen** (eine pro Kanal).
- **Ebenenregel:** `plano = 17·(banda − 1) + (canal − 1)`, mit Band 1–6 und Kanal 1–17. Der
  mittlere Kanal jedes Bandes ist `17·(b−1) + 8`. Die genaue λ jeder Ebene steht in `properties`, Schlüssel
  `data_cube_crval3_arr` (0,753–4,988 µm).
- **Leere Ebenen:** die **50 und die 51** (Dichroit-Schnitt zwischen D3 und D4). Wenn die Ebene hinzugefügt wird,
  lässt Aladin sie auf Ebene 50: Man muss die Ebene setzen, nachdem die Schicht bereit ist.
- **Suffix der Kacheln = Ebene:** Bei Band 4 fordert der Browser `Norder5/.../Npix11391_59.png` an.
  Damit lässt sich in `performance.getEntriesByType('resource')` prüfen, welche Ebene gerade angezeigt wird.
- **Wie man eine Ebene setzt:** `ponerPlano` (in `planos.ts`) berechnet die Frequenz der Ebenenmitte und
  ruft `setFrequency` auf; in den 6 Bändern geprüft (Suffixe `_8 _25 _42 _59 _76 _93`).
  **Benutze nicht `setSliceNumber`:** In 3.8.2 liefert die Anfrage von 59 die 9. Aus demselben Grund zeigt die Cube-Steuerung des
  Ebenenmenüs von Aladin (die `setSliceNumber` benutzt) wahrscheinlich eine falsche Ebene (nicht
  geprüft). `capa.getFrequency()` liefert ebenfalls nicht die echte λ: Die λ kommt aus `properties` (`leerPlanos`).
- **Aladin fordert Kacheln nur an, wenn der Tab sichtbar ist.** Bei verstecktem Browser-Tab ist keine
  neue Kachel zu sehen: Das ist kein Fehler.
- **Was er NICHT ist:** ein Mosaik **aller Epochen** (hat keine Zeitachse: taugt nicht, um
  Bewegung zu zeigen) und bereits gestreckte PNGs (haben keine Flüsse: taugt nicht für das Spektrum). Zeit und Spektrum
  kommen aus den Level-2-Dateien über das Backend.
- **Die FITS-Version** desselben Cubes, die SIA2 liefert (`spherex_dr1_cube`), taugt weder für Aladin noch
  für Cutouts (~320 MB pro Kachel).
- **Plan B:** `CDS/P/SPHEREx/QR2/D1`…`D6` im CDS (frühere Version). Nicht geprüft: alasky war
  am 14. Nov. ausgefallen.

### Wie es im Code aufgebaut ist (`scaffold/frontend/src/sky/`)

- `AladinView.tsx` erzeugt Aladin und **kennt die Details der Schichten nicht**: Es mountet die aus `capas/index.ts`
  (Vertrag `montar(aladin, ctx) → desmontar`; `ctx` bringt ra, dec, size, epoca, on, onSelect) und
  mountet sie neu, wenn sich Position, Ausschnitt oder Epoche ändern. Optionale Props: `size`, `epoca` (julianisches Jahr,
  Standard 2026,0), `onReady`, `onSelect`.
- **Aladin hält NUR EINEN Listener pro Ereignis**: `aladin.on(e, fn)` ersetzt den vorherigen
  (`callbacksByEventName[g]=Q` in `dist/aladin.js`). Deshalb abonnieren die Schichten mit `ctx.on`
  (`eventos.ts`), das einen Dispatcher pro Ereignis registriert. Rufe niemals `aladin.on` aus einer Schicht auf.
- `planos.ts` (Ebene ↔ Band ↔ λ, `ponerPlano`), `LambdaSlider.tsx` (λ-Schieberegler),
  `propagacion.ts` (Eigenbewegung, linear, ohne Parallaxe, in julianischen Jahren: J2000 = 2000,0,
  Gaia DR3 = 2016,0).
- Damit eine Schicht ausgeschaltet werden kann, gib ihr einen Namen: Er erscheint in der Schichtsteuerung von Aladin.
- **CDS ausgefallen am 14. Nov. 2026:** `simbad.cds.unistra.fr` und `vizier.cds.unistra.fr` lieferten 404 ohne
  CORS (deshalb taugt `A.catalogFromSimbad`, das `simbad.cds.unistra.fr/cone` aufruft, an diesem Tag nicht). Die
  Spiegel von Harvard antworten mit CORS: `vizier.cfa.harvard.edu/viz-bin/asu-tsv` (Gaia) und
  `simbad.cfa.harvard.edu/simbad/sim-tap/sync` (SIMBAD, langsam: 2–18 s). Die Schichten probieren beide.
- Gaia in dichten Feldern: Mit einem Limit von 2000 Sternen war die Karte von Barnard zugedeckt; es werden die 300
  hellsten verwendet.
- Der Konsolenfehler `ERR_BLOCKED_BY_CLIENT` / «Failed to fetch» von `tg.log` ist das Nutzungsprotokoll
  von Aladin: harmlos.

---

## 3. Das Blink-Panel

Das muss man schreiben. Es ist einfach und es ist das, was bewertet wird.

**Verwende keine `<img>`, die ersetzt werden.** Es flackert hässlich und der Ladesprung ist sichtbar. Benutze ein `<canvas>`:
lade alle Einzelbilder vorab in `Image` oder `OffscreenCanvas` und zeichne das jeweilige mit
`requestAnimationFrame`.

Minimale Steuerelemente, nach Wichtigkeit:

| Steuerelement | Warum | Nützlicher Bereich |
|---|---|---|
| **Play / Pause** | Offensichtlich und nötig | |
| **Geschwindigkeit (fps)** | WiseView zeigt, dass sie entscheidend ist. Langsam sieht man die Bewegung, schnell die Variabilität | 0,5 – 10 fps |
| **Schritt für Schritt** | Um zu bestätigen, was man zu sehen glaubt | ← → |
| **Stretch** | **Ohne das sieht man nichts.** Abschnitt 4 | asinh als Standard |
| **Farbkarte** | Grau zum Detektieren, Farbe zum Präsentieren | gray, viridis, magma |
| **Band** | Die Achse, die nur SPHEREx liefert | 1–6 |
| **Gesichtsfeld** | Ausdrücklicher Punkt der Challenge | 0,02° – 0,5° |
| **Modus** | raw / zodi abgezogen / Differenz | |

In jedem Einzelbild eingeblendet: **Datum und Wellenlänge**. Die λ ist keine Zierde: Sie erklärt, warum
sich die Helligkeit zwischen Einzelbildern ändert (siehe Skill `spherex-datos`) und zeigt der Jury, dass das Team
das Instrument versteht.

---

## 4. Stretch: warum man ein astronomisches Bild nicht sieht

Ein Himmelsbild hat einen enormen Dynamikumfang und die meisten Pixel sind Hintergrund.
Linear auf 0–255 abgebildet sieht es **schwarz mit drei weißen Punkten** aus. Das überrascht jeden
Webentwickler beim ersten Mal.

Was anzuwenden ist, der Reihe nach:

1. **Clipping nach Perzentilen**, nicht nach Minimum und Maximum. Ein einziger heißer Pixel ruiniert die Skala.
   `vmin, vmax = percentil(1), percentil(99.5)` ist ein vernünftiger Ausgangspunkt.
2. **Eine nichtlineare Funktion**: `asinh` ist der beste Standardwert für astronomische Bilder (erhält
   schwache Details, ohne Helles zu sättigen). `sqrt` und `log` taugen auch; `linear` fast nie.
3. **`zscale`** ist der klassische Algorithmus von DS9, um die Grenzen automatisch zu wählen. Er steht in
   `astropy.visualization.ZScaleInterval`. Für einen nicht erfahrenen Nutzer ist er meist die beste Option.

`astropy.visualization` hat all das gelöst: `ZScaleInterval`, `PercentileInterval`,
`AsinhStretch`, `ImageNormalize`. **Implementiere es nicht neu.**

### Die Entscheidung, auf die es ankommt: Wer streckt?

**Das Backend.** Es liefert bereits gerenderte PNGs. FITS an den Browser zu schicken zwingt dazu, einen FITS-Leser
in JavaScript zu schreiben, Stretch und Farbkarte von Hand anzuwenden: doppelte Arbeit und dreifache
Fehler, in einem Hackathon.

Der Preis ist, dass eine Änderung des Stretch einen Gang zum Server erfordert. Mit Cache ist das billig. Wenn Zeit übrig ist,
kann man im Client eine Feinjustierung von Helligkeit und Kontrast mit CSS-Filtern auf dem
PNG ergänzen, die 80 % der Nutzung abdeckt.

### Der Schlüssel dafür, dass das Blinken lesbar ist

**Alle Einzelbilder einer Sequenz werden mit DENSELBEN `vmin`/`vmax` normalisiert.** Wenn jedes
für sich gestreckt wird, flackert alles und man unterscheidet echte Bewegung nicht von einer Skalenänderung.
Berechne die Grenzen über den gesamten Stapel und wende sie auf jedes Einzelbild an.

Ausnahme: Wenn die λ zwischen Epochen stark variiert, sind die Pegel physikalisch verschieden und die
gemeinsame Normalisierung kann schwarze Einzelbilder hinterlassen. Das ist die zentrale Spannung des Projekts. Praktische Lösung: zuerst
nach Band gruppieren und dem Nutzer einen Schalter «gemeinsame Skala / Skala pro Einzelbild» geben.

---

## 5. Bilddifferenz

Ausdrücklicher Punkt der Challenge und, im Verhältnis Wert/Aufwand, das Beste am Projekt.

- `diff_first` — jedes Einzelbild minus das erste. Was sich nicht geändert hat, geht gegen null; was sich bewegt hat,
  erscheint als **Paar von Keulen, eine positive und eine negative**. Visuell spektakulär.
- `diff_prev` — jedes Einzelbild minus das vorherige. Nützlich für Variabilität.

Für die Differenz benutze eine **divergierende** Farbkarte, auf null zentriert (Blau-Weiß-Rot), keine
sequenzielle Skala. Das Vorzeichen ist die Information.

Ehrlicher Vorbehalt: Eine korrekte Differenz erfordert, dass die Bilder gut ausgerichtet sind und dieselbe
PSF haben. Wir subtrahieren Ausschnitte, die auf ein gemeinsames Gitter reprojiziert wurden; das ist eine **visuelle Näherung**, keine
differenzielle Photometrie. Das in der Oberfläche sagen.

---

## 6. Gaia-Overlay: die Qualitätskontrolle, die man sieht

Auf das Bild die Positionen zeichnen, die Gaia DR3 für die Sterne zum Datum dieser
Epoche vorhersagt (Katalogposition + Eigenbewegung × vergangene Zeit).

Es dient zwei Zwecken:

1. **Es erfüllt einen Punkt der Challenge.**
2. **Es zeigt, dass der Viewer korrekt ist.** Wenn die Markierungen auf den Quellen liegen, stimmen WCS, Daten
   und Ausschnitt. Es ist die visuelle Antwort auf «Woher weiß ich, dass dieses Bild von der
   Koordinate stammt, die ich angefragt habe?».

In Aladin Lite geschieht das mit einer Katalogschicht. Für das Blink-Panel müssen die
Koordinaten mit dem WCS des Ausschnitts auf Pixel projiziert werden.

**Referenzepoche:** Gaia DR3 gibt Positionen in **2016,0**, nicht in J2000; SIMBAD gibt J2000. Von der Epoche
propagieren, die zu jedem Katalog gehört. Bei Eigenbewegungen von mehreren ″/Jahr verschiebt ein Epochenfehler die Markierung
um Dutzende Bogensekunden: Für 2026 steht WISE 0855 212″ und Barnard 270″ von
ihrer J2000-Position entfernt.

---

## 7. Die URL ist Teil des Produkts

Die Challenge verlangt es und es ist eine halbe Stunde Arbeit:

```
/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
/?target=WISE+0855&size=0.2
```

- `target` hat Vorrang vor `ra`/`dec`.
- **Die URL wird mit dem aktuellen Zustand aktualisiert** (`history.replaceState`), sodass das Kopieren der Adressleiste
  genau das teilt, was man gerade sieht.
- Ein sichtbarer Button «Link kopieren».

Das ist es, was WiseView zur Infrastruktur anderer Projekte machte: Dritte bauten
Pakete auf seiner API. Ein teilbarer Viewer ist keine Demo mehr.

---

## 8. Das Erste, was der Nutzer sieht

Das Zielpublikum der Challenge ist **jeder**, nicht ein Astronom.

- **Ein vorgeladenes Beispiel beim Öffnen.** Niemand sollte ein leeres Feld sehen. WISE 0855 soll
  beim Laden der Seite schon blinken.
- **Buttons der fünf Testfelder.** Ein Klick, sofortiges Ergebnis, warmer Cache.
- **Namen akzeptieren, nicht nur Zahlen.** «Barnard's Star» muss funktionieren.
- **Sexagesimal und Grad akzeptieren.** Siehe Skill `coordenadas-astro`.
- **Nützlicher leerer Zustand.** Wenn es keine Daten gibt: sagen, wie viele Epochen es gibt (null), warum das sein kann, und
  ein nahes Feld anbieten, das welche hat. Die Jury wird zufällige Koordinaten eingeben.
- **Ehrlicher Ladezustand.** «Fordere 14 Epochen von IRSA an… 6 fertig». Niemals ein stummer Spinner: Die
  Cutouts brauchen Zeit.
