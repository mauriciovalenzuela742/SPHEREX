<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/prototipos/rango_fechas/README.md) · [Español](../../../es/prototipos/rango_fechas/README.md) · [中文](../../../zh/prototipos/rango_fechas/README.md) · **Deutsch** · [Italiano](../../../it/prototipos/rango_fechas/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `prototipos/rango_fechas/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Prototyp: Was hat sich zwischen zwei Daten bewegt?

Isolierter Prototyp (berührt weder `scaffold/` noch den Vertrag aus `docs/03`). Für einen Himmelspunkt, ein Band und einen
**Datumsbereich** fordert er bei IRSA **nur die nötigen Ausschnitte** an (ein Bild pro Visite, optional die Summe
mehrerer Belichtungen der Visite), richtet sie mit Norden oben aus und zeigt:

- **blink** zwischen Visiten, mit Datum und Wellenlänge jedes Einzelbilds.
- **Subtraktion letzte − erste**: rot = Helligkeit, die hinzukommt, blau = Helligkeit, die da war. Ein rot/blaues Paar = Bewegung.
- **Farbkomposition**: erste in Rot, letzte in Cyan.
- Tabelle mit der Beobachtung, der Sammlung, der λ in der Mitte und dem % der Pixel mit Kontamination (FLAGS).

Außerdem ist `eda_spherex.ipynb` eine **explorative Analyse** der Daten: Inventar, Anatomie eines Ausschnitts,
Wirkung des linear variablen Filters, Sequenz und Subtraktionen sowie Prüfung der Bewegung gegen die Eigenbewegung.

## Wie man es ausführt

Vom Wurzelverzeichnis des Repos aus:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
# abrir http://localhost:8010
```

Notebook: `prototipos/rango_fechas/eda_spherex.ipynb` mit dem Kernel des `.venv` öffnen und `CAMPO` ändern.

Die Ausschnitte landen in `data/cache/prototipo/` (von git ignoriert). Nichts wird vollständig heruntergeladen.

## Explorer (`/explorar`)

http://localhost:8010/explorar öffnen.

- **Großes Bild** links (quadratisch, so groß wie möglich) und **Leiste rechts** mit den Filtern
  (Objekt, RA/Dec, von–bis, Bänder, Feld, Belichtungen pro Visite), dem sichtbaren Band, dem Modus
  (Bild · Subtraktion vs t₀ · Farbe), den Bilddaten und Miniaturen aller Bänder und Daten.
- **Zeitzeiger** unter dem Bild: Die Visiten liegen auf ihrem realen Datum. Schon beim Überfahren mit der Maus (oder Ziehen)
  wechselt das Datum; ←/→ Visiten, ↑/↓ Bänder, Leertaste spielt ab. Neben dem Datum sieht man Δt seit t₀ und die λ.
- **Fortschreitendes Laden:** zuerst die Visiten (`/api/grid`), dann die Bilder eines nach dem anderen, t₀ und t_letzte zuerst.
- **Schneller Leser über HTTP-Ranges** (Standard): fordert vom Originalarchiv nur die IMAGE-Zeilen des Ausschnitts und
  die WCS-WAVE-Tabelle am Ende an; ohne PSF. Barnard, 6 Bänder, 28 Bilder: **8,7 s** (t₀ und t_letzte aller 6 Bänder
  nach 3,7 s), gegenüber ~98 s mit dem Ausschnittsdienst. Er liest FLAGS nicht (die Kontamination erscheint als "—") und zieht den
  Median statt ZODI ab (gemessener Unterschied: 0,07-faches Rauschen). Wenn er fehlschlägt, nutzt er den Ausschnittsdienst.
- **Wenn IRSA nicht antwortet**, werden die in `data/cache/prototipo/sia/` gespeicherten Suchen mit einem Hinweis verwendet; wenn der
  Punkt nie abgefragt wurde, erscheint eine klare Meldung (HTTP 503).

Die Detektoren gehen in Paaren, die dieselbe Zone betrachten (1+4, 2+5, 3+6), und jedes Paar zieht an verschiedenen Tagen über einen Punkt:
Deshalb gibt es in den Miniaturen Spalten, in denen nur zwei Bänder ein Bild haben.

## API

| Route | Was sie tut | Kosten |
|---|---|---|
| `GET /api/presets` | Die 5 Testfelder mit der durch Eigenbewegung auf heute **propagierten** Position | nichts |
| `GET /api/epochs?ra&dec&band&start&end` | Verfügbare Visiten (SIA2, ohne Bilder) | ~2 s, ~0,2 MB |
| `GET /api/frames?ra&dec&band&start&end&size&max_visits&per_visit` | PNG-Einzelbilder + Subtraktion + Farbe | ~4 MB und ~5–12 s pro Ausschnitt beim 1. Mal; danach Cache |
| `GET /api/grid?ra&dec&bands=1,2,5&start&end` | Visiten pro Band und Datumsspalten (ohne Bilder) | ~2–5 s |
| `GET /api/frame?ra&dec&band&visit&start&end&size&per_visit&fast` | Ein Einzelbild als float32 in base64 (~19 KB) | ~0,6–1 s mit `fast=true` (Standard); ~11 s mit `fast=false` |

Die URL der Seite spiegelt die Abfrage wider (`?ra=…&dec=…&band=…`), sodass man sie teilen kann.

## Wie es geprüft wurde (14. Nov. 2026)

| Test | Ergebnis |
|---|---|
| Barnard, Band 2, 3 Bel./Visite | Gemessen werden 1,44–1,50 px nach **Norden** vs 1,66–1,81 px vorhergesagt (Fehler 1,3–2,3″) |
| WISE 0855, Band 5, 6 Bel./Visite | Gemessen werden 1,30–1,32 px nach **Westen** vs 1,31–1,34 px vorhergesagt (Fehler 0,6–1,2″) |
| RW Aur (Kontrolle ohne Bewegung), Band 3 | Gemessen wird ≤ 0,22 px (≈ 0), wie es sein soll |
| λ aus `WCS-WAVE` | 2,288 µm in einem Ausschnitt von Band 3 (1,63–2,41 µm): kohärent |
| Fluss eines Sterns vs Datum / vs λ | Springt ungeordnet nach Datum und wächst geordnet mit λ: der Effekt des linear variablen Filters |

## Befunde, die für das Projekt wichtig sind

1. **Man muss reprojizieren.** Jeder Ausschnitt stammt aus einer Ausrichtung mit anderer Orientierung; ohne Angleichung rotiert der blink.
2. **WISE 0855 ist in einer einzelnen Belichtung** (113 s) in Band 5 **nicht zu sehen**: Man muss 4–6 pro Visite summieren.
3. **Das Bit `SOURCE` von FLAGS erscheint in ~100 % der Pixel** eines bevölkerten Feldes. Es ist informativ; wenn es als
   Kontamination gezählt wird, wirkt alles unbrauchbar. Die Bitdefinitionen stehen im Header (`MSKNnnnn`).
4. **IRSA lieferte 503 bei 6 parallelen Ausschnitten.** Mit 3 und Wiederholungen mit Wartezeit funktioniert es.
5. **Der Ausschnitt wiegt ~4 MB, aber das nützliche Bild sind ~40 KB**: Der Rest ist die PSF (`EPSF`), die immer vollständig kommt.
6. **Die Epochen liegen bei verschiedenen λ** innerhalb desselben Bandes (z. B. 1,24–1,63 µm): Ein Teil der
   Helligkeitsänderung ist der Filter. Die Oberfläche weist darauf hin.

## Was NICHT geprüft ist

- Die Oberfläche wurde nicht in einem realen Browser mit Klicks getestet: Geprüft wurden die API und die Bilder, die sie liefert.
- eps Ind B und R Dra wurden nicht getestet.
- Die Verschiebungsmessung des Notebooks verwendet ein Fenster von 5 px für schwache Objekte und 15 px für helle;
  mit dem falschen Fenster liefert sie schlechte Ergebnisse (mit RW Aur geprüft). Es ist keine Astrometrie.
- Die Parallaxe wird nicht korrigiert (für Barnard sind es ~0,5″, weniger als 0,1 px).
- Die Antwortzeit in einem Deployment (Vercel oder anderes) wurde nicht gemessen.
- Die maskierten FLAGS-Bits (`TRANSIENT`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`,
  `OUTLIER`) sind eine vernünftige Wahl, keine offizielle IRSA-Empfehlung.

---

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
