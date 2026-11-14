---
name: coordenadas-astro
description: Himmelskoordinaten und ihr fehlerfreier Umgang - Rektaszension und Deklination, Umrechnung zwischen sexagesimal und Dezimalgrad, der Faktor 15 zwischen Stunden und Grad, FITS-WCS und die Pixel-Himmel-Umrechnung mit astropy, Eigenbewegung und wie man vorhersagt, wo ein Stern in einer anderen Epoche stehen wird, Namensauflösung mit SIMBAD und die fünf Testfelder der Aufgabenstellung. Aktiviere ihn beim Parsen oder Validieren von Koordinaten, die ein Nutzer eingibt, beim Umrechnen zwischen Formaten, bei der Arbeit mit WCS oder world_to_pixel, beim Berechnen von Positionen zu einem anderen Datum oder wenn RA, Dec, ICRS, J2000, sexagesimal, Eigenbewegung, Parallaxe, SIMBAD oder die Testfelder erwähnt werden.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../../en/.claude/skills/coordenadas-astro/SKILL.md) · [Español](../../../../es/.claude/skills/coordenadas-astro/SKILL.md) · [中文](../../../../zh/.claude/skills/coordenadas-astro/SKILL.md) · **Deutsch** · [Italiano](../../../../it/.claude/skills/coordenadas-astro/SKILL.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/skills/coordenadas-astro/SKILL.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Himmelskoordinaten, ohne danebenzugreifen

---

## 1. Der Fehler, der am häufigsten gemacht wird

**Die Rektaszension wird in Stunden oder in Grad angegeben, und zwischen beiden liegt ein Faktor 15.**

```
RA = 08h55m10.831s  →  8.9196753 horas  →  133.795129 grados
```

Wenn du `08h55m` als Grad behandelst, zeigst du 112 Grad vom Objekt entfernt hin. Die Abfrage liefert
vollkommen gültige Bilder eines falschen Himmelsstücks, und **nichts schlägt fehl**: Es gibt keinen Fehler, keine
Exception, nur ein stillschweigend falsches Ergebnis.

Die Deklination ist dagegen immer in Grad (−90 bis +90). `-7d14m42.53s` sind Grad, Bogenminuten und
Bogensekunden.

**Parse Koordinaten niemals von Hand.** Nutze `astropy.coordinates.SkyCoord`, das fast alles versteht:

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

SkyCoord("08h55m10.831s", "-07d14m42.53s", frame="icrs")
SkyCoord("08 55 10.831 -07 14 42.53", unit=(u.hourangle, u.deg))
SkyCoord(133.795129, -7.245147, unit="deg")
```

**Achte auf `unit=(u.hourangle, u.deg)`**: Das ist das richtige Paar, wenn die RA in Stunden und die Dec
in Grad kommt, was der übliche Fall beim sexagesimalen Format ist.

### Validierung dessen, was der Nutzer eingibt

Akzeptiere die vier Formen und normalisiere auf dezimale ICRS-Grade, bevor du irgendetwas tust:

1. `133.795129 -7.245147` (Dezimalgrad)
2. `08h55m10.831s -07d14m42.53s`
3. `08:55:10.831 -07:14:42.53`
4. `WISE 0855` (Name → SIMBAD)

Praktische Regel, um 1 von 3 zu unterscheiden, wenn zwei einzelne Zahlen ankommen: **Wenn es `h`, `:` oder
Leerzeichen als interne Trennzeichen enthält, ist es sexagesimal.** Bei Mehrdeutigkeit frage den Nutzer, statt
zu raten. Ein Minuszeichen bei der Dec geht leicht verloren: Prüfe es ausdrücklich.

Gültige Bereiche: RA ∈ [0, 360), Dec ∈ [−90, +90]. Die RA läuft bei 360 um; die Dec läuft nicht um.

---

## 2. WCS: vom Pixel zum Himmel

Das WCS steht im FITS-Header und übersetzt Pixel ↔ Koordinate.

```python
from astropy.wcs import WCS
from astropy.io import fits

with fits.open(ruta) as hdul:
    w = WCS(hdul["IMAGE"].header)

x, y = w.world_to_pixel(coord)      # devuelve 0-based
coord = w.pixel_to_world(x, y)
```

Drei Fallen:

1. **`world_to_pixel` liefert 0-basiert; FITS-Header sind 1-basiert.** IRSA weist in der SPHEREx-
   Dokumentation zum Umgang mit der PSF ausdrücklich darauf hin. Wenn du Verschiebungen um
   einen Pixel siehst, ist es das.
2. **In einem MEF kann jede Erweiterung ihr eigenes WCS haben.** Das von `IMAGE` muss nicht für die PSF
   taugen.
3. **Das WCS eines Ausschnitts ist nicht das des Originals.** Der cutout-Dienst von IRSA passt das WCS des
   Ausschnitts an, behält aber Schlüssel wie `CRPIX1A`/`CRPIX2A` bei, die auf das Originalbild zeigen. Lies den
   Skill `spherex-datos`, bevor du mit der PSF rechnest.

Winkelabstand zwischen zwei Positionen: `coord1.separation(coord2)`. Berechne ihn nicht mit Pythagoras
auf RA und Dec: In Polnähe ist das falsch, weil ein Grad RA nicht einem Grad Bogen entspricht.
Der Faktor ist `cos(dec)`.

---

## 3. Eigenbewegung: wo es zu einem anderen Datum stehen wird

Das ist die Berechnung, die es erlaubt, Gaia über ein Bild einer bestimmten Epoche zu legen, was zugleich
ein Stichpunkt der Aufgabenstellung und der Beweis ist, dass der Viewer korrekt ist.

```python
from astropy.time import Time

c = SkyCoord(ra=..., dec=..., unit="deg",
             pm_ra_cosdec=... * u.mas/u.yr,
             pm_dec=... * u.mas/u.yr,
             obstime=Time("2016.0", format="jyear"))   # época del catálogo
c_en_2026 = c.apply_space_motion(new_obstime=Time("2026-10-02"))
```

- **Gaia DR3 hat die Referenzepoche J2016.0.** Nicht J2000. Wer sie verwechselt, schleppt einen Fehler von 16 Jahren
  Eigenbewegung ein.
- **WISE 0855−0714 steht nicht in Gaia** (es ist zu kalt und im Optischen zu schwach). Für sein Overlay und seine
  propagierte Position nutze CatWISE2020 (`catwise_2020` bei IRSA), das Eigenbewegungen enthält; seine Referenzepoche
  ist ~MJD 57170 (~2015,4). Bestätige Einheiten und Epoche im Schema der Tabelle.
- `pm_ra_cosdec` enthält bereits den Faktor `cos(dec)`. Kataloge geben es meist so an; wenn deine Quelle
  `pmra` «roh» liefert, rechne es um.
- Größenordnung: 100 mas/yr sind 0,1 arcsec pro Jahr. Bei Pixeln von ~6 arcsec wie denen von
  SPHEREx braucht man **viel** Eigenbewegung oder mehrere Jahre, um eine Verschiebung von einem
  Pixel zu sehen. Deshalb sind die Testobjekte der Aufgabenstellung, wie sie sind: Sie wurden wegen ihrer
  enormen Eigenbewegung gewählt.

---

## 4. Namen auflösen

Damit das Werkzeug für jeden nutzbar ist, muss es «Barnard's Star» akzeptieren, nicht nur Zahlen.

```python
SkyCoord.from_name("Barnard's Star")          # usa el servicio Sesame del CDS
```

oder `astroquery.simbad`. Vorsichtsmaßnahmen für ein öffentliches Werkzeug:

- **Immer mit Timeout und mit Fehlerbehandlung.** Es sind externe Dienste, und sie fallen aus.
  *(Geprüft am 14. Nov. 2026: Der Dienst des CDS in Straßburg war ausgefallen. Der Spiegel des
  CfA, `simbad.cfa.harvard.edu`, antwortete und liefert dieselben Daten. **Halte beide bereit und weiche
  vom einen auf den anderen aus.**)*
- **Cache die Antworten.** Die fünf Testfelder werden einmal aufgelöst und gespeichert.
- **Plan B:** eine lokale Tabelle mit den fünf Testfeldern und den am häufigsten angefragten Objekten
  (`data/campos_de_prueba.yml`), damit die Demo nie von einem Drittdienst abhängt.

---

## 5. Die fünf Testfelder

Es sind die, die die Aufgabenstellung nennt. **Sie dienen als Abnahmekriterium**: Wenn sich der Viewer in allen fünf
gut verhält, ist er fertig.

Die Koordinaten (am 14. Nov. 2026 gegen SIMBAD verifiziert), was in jedem zu sehen sein sollte und die
Eigenbewegungen stehen in [`data/campos_de_prueba.yml`](../../../../../data/campos_de_prueba.yml).

**Zwei verifizierte Fallen, die in dieser Datei stehen und die man kennen sollte, bevor man Code anfasst:**

1. **Die Koordinate, die die Aufgabenstellung für WISE 0855 angibt, stammt aus der WISE-Epoche (~2010,4), nicht von
   heute.** Das Objekt bewegt sich 8,15 arcsec pro Jahr: Ende 2026 steht es etwa 130 arcsec von dieser
   Koordinate entfernt. Bei einem Feld von 0,05 Grad oder kleiner **lässt das Zielen auf die Koordinate der Aufgabenstellung
   das Objekt außerhalb des Feldes**, und der Viewer wirkt kaputt, ohne es zu sein.
2. **`eps Ind B` (Großbuchstabe) ist das Paar Brauner Zwerge; `eps Ind b` (Kleinbuchstabe) ist ein
   Planet**, und er steht 402 arcsec entfernt, an der Position des Sterns. Der Resolver von MAST, der Groß- und Kleinschreibung nicht
   unterscheidet, liefert den Planeten. Wenn deine Namensauflösung Groß- und Kleinschreibung nicht
   unterscheidet, zeigst du auf das falsche Objekt.

**Und eine Erwartung, die man von Anfang an haben muss:** Bei einer Pixelskala von 6,15
arcsec bewegen sich selbst die schnellsten Objekte am Himmel **weniger als einen Pixel zwischen zwei aufeinanderfolgenden
Durchgängen** von SPHEREx (6 Monate Abstand). Gemessen in der EDA (`docs/09`), bewegen sie sich im gesamten
verfügbaren Zeitraum (1,0-1,4 Jahre) 1,1-1,8 px. Das bedeutet, die größte verfügbare Zeitbasis zu nutzen, nicht aufeinanderfolgende
Epochen, und gibt der Bildsubtraktion und dem Zoom großen Wert.

| Objekt | Was es demonstriert |
|---|---|
| **WISE 0855** | Sehr hohe Eigenbewegung. **Pflichtfall: wird immer gezeigt.** In einer einzelnen Belichtung ist es schwach zu sehen; seine Bewegung (~1,3 px) sieht man mit der Subtraktion und mit der Summe pro Durchgang (ausstehend, D2; das CatWISE2020-Overlay ist im Branch `v/v2-catwise` gemacht, PR ausstehend, V2). Koordinaten der Aufgabenstellung: aus der Epoche 2010, die propagierte verwenden |
| **Barnard's Star** | Die größte bekannte Eigenbewegung. Man sieht sie, aber sie sättigt: Die Bewegung ist qualitativ |
| **Epsilon Indi B** | Paar Brauner Zwerge. **Hier sieht man die Bewegung am deutlichsten** (gemessen −0,85/−0,71 px; stimmt mit SIMBAD überein) |
| **RW Aurigae** | Veränderlicher: ändert die Helligkeit. Sie sättigt und die Subtraktion hinterlässt ein rot/blaues Paar, auch wenn sie sich nicht bewegt: kein Beweis für Veränderlichkeit |
| **R Draconis** | Langperiodischer Veränderlicher mit großer Amplitude. Helligkeit nicht gemessen (`docs/09`) |

Das Paar «bewegt sich» / «ändert nur die Helligkeit» zeigt, dass der Viewer beide
Dinge unterscheidet. Im Pitch empfiehlt es sich, je eines zu zeigen.

---

## 6. Checkliste, bevor man eine Koordinate für gut befindet

- [ ] RA in Grad oder in Stunden? Hast du umgerechnet?
- [ ] Hat das Vorzeichen der Dec das Parsen überlebt?
- [ ] RA ∈ [0,360) und Dec ∈ [−90,90]?
- [ ] Ist das Bezugssystem ICRS? (J2000 und ICRS stimmen praktisch überein; galaktisch nicht.)
- [ ] Wenn es Eigenbewegung gibt, welche Epoche hat der Katalog? Ist Gaia J2016.0?
- [ ] Wenn du WCS verwendet hast, 0-basiert oder 1-basiert?
- [ ] **Hast du gegen eine externe Quelle verifiziert?** Die Koordinate in SIMBAD oder Aladin einzufügen und zu sehen, ob sie
      dort landet, wo sie soll, kostet dreißig Sekunden und erspart Stunden.
