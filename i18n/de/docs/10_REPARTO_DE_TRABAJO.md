<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/10_REPARTO_DE_TRABAJO.md) · [Español](../../es/docs/10_REPARTO_DE_TRABAJO.md) · [中文](../../zh/docs/10_REPARTO_DE_TRABAJO.md) · **Deutsch** · [Italiano](../../it/docs/10_REPARTO_DE_TRABAJO.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/10_REPARTO_DE_TRABAJO.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 10 — Was jeder nach der EDA zu tun hat

Die Aufteilung legt der Plan des Teams fest: [`README.md`](../README.md) §3 und [`05_PLAN_24H.md`](05_PLAN_24H.md)
(D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera). Dieses Dokument **verteilt nicht
neu**: Es bricht für jede Rolle herunter, was die EDA ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)) mit
echten Daten gezeigt hat, mit konkreten Aufgaben und der Art, sie zu prüfen.

---

## Was die EDA am Plan ändert

| Der Plan nahm an | Die EDA zeigte | Wen es betrifft |
|---|---|---|
| Weg A: Aladin lädt den HiPS-Cube von DR1 von IRSA | **Ja, er lädt** (`/data/hips/SPHEREx/spherex_allsky_cube`, CORS offen; ist bereits im deployten Viewer). Aber es ist ein Mosaik aller Epochen in PNG, mit 12,9″/px: dient als Kontext und für die 102 Bänder, nicht für die Zeit und nicht zum Messen von Flüssen. Die FITS-Version, die SIA2 liefert, taugt nicht für Cutouts | **V2** |
| CORS in Stunde 1 verifizieren | **IRSA antwortet nicht mit CORS** (weder SIA2 noch Dateien): alles läuft über das Backend. Das CDS schon | D1, V2 |
| Das Messen eines Cutouts entscheidet Vercel Functions oder Container | **7,3 s Median, 10,8 s p90, 29 s Maximum**, ~3,9 MB, zeitweise 503-Fehler | **C** (entscheidet), D1 |
| Nach Band gruppieren | Außerdem muss man die **λ** zwischen Epochen **angleichen**: Innerhalb eines Detektors variiert sie um ~16 Bandbreiten | D1, **D2** |
| Auf gemeinsames Gitter reprojizieren | Bestätigt und unverzichtbar: Der Detektor **dreht sich ~180° zwischen Durchgängen** | **D2** |
| `flagged_fraction` für «Contaminación» | `FLAGS != 0` markiert 72 % des Ausschnitts (Bit SOURCE, das kein Fehler ist); die schlechten Pixel sind ~4 % | **D2**, C, V1 |
| WISE 0855 ist die Haupt-Demo | WISE 0855 ist ein Pflichtfall und wird immer gezeigt, mit dem Hinweis, dass er in einer einzelnen Belichtung schwach wirkt (seine Bewegung sieht man mit der Differenz und mit der Summe pro Durchgang). **eps Ind B** ist der Fall, in dem die gemessene Bewegung am deutlichsten zu sehen ist; Barnard sieht man, aber er sättigt | C, N |
| Die Bewegung sieht man im Blink | Sie beträgt **1–2 px über den gesamten Zeitraum**: Die Differenz (`diff_first`) ist die Ansicht, die sie zeigt | D2, V1, N |

## Der Datenfluss, von Anfang bis Ende

```
 coordenada ─► [1 Buscar] ─► [2 Elegir épocas] ─► [3 Recortar + caché] ─► [4 Filtros y alineación]
               D1            D2 (λ igualada)       D1                      D2
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ▼
 [5 Restas y sumas] ─► [6 Imagen PNG] ─► API ─► [7 Visor]
   D2                    D2                      V1 blink y controles · V2 cielo, Gaia, espectro
```

**C (Mauricio)** verifiziert den gesamten Weg und entscheidet über das Deployment; **N (Javiera)** erzählt ihn.

---

## D1 · Vladimir — Datenzugriff (Kästen 1 und 3)

Basis: `eda/01_inventario.py`, `eda/espectral.py` (`cabecera_imagen`, `pedir`).

- SIA2 an `spherex_dr1` und `spherex_qr3` **parallel** (je 1–3,5 s). Zwischen
  beiden gibt es keine wiederholten Dateien; QR3 bringt den jüngsten Durchgang.
- Mit der durch Eigenbewegung **propagierten Position** suchen: Mit der Koordinate der Aufgabenstellung
  liegt WISE 0855 außerhalb eines kleinen Feldes.
- Billige Metadaten: Der Header von IMAGE wird mit einer **HTTP-Range-Anfrage von ~35 KB** geladen (Datum, WCS,
  Detektor). Mit 6 parallel, ~0,1 s effektiv pro Datei.
- Cutouts von 0,1° mit Wiederholungsversuchen und Wartezeit (es gab 503er, die 4 Wiederholungen dauerten); höchstens 4 parallel.
  Ein kleinerer Cutout ist **nicht** schneller: Die PSF kommt vollständig.
- Cache nach `(obs_id, detector, gerundetes Zentrum, size)` und Vorberechnung der 5 Felder.
- **Fertig, wenn:** die 5 Felder ohne Internet aus dem Cache ausgeliefert werden.

## D2 · Bryan — Einzelbilder: Filter, Ausrichtung und Differenzen (Kästen 2, 4, 5 und 6)

Basis: `eda/02_longitud_de_onda.py`, `eda/03_recortes_y_figuras.py` (`elegir_lambda_igualada`,
`grilla_comun`, `BITS_MALOS`) und `eda/05_centroides.py`.

**Was hereinkommt:** die Dateiliste von D1. **Was herauskommt:** ausgerichtete Einzelbilder + Maske + Differenzen,
mit `wavelength_um` und `flagged_fraction` pro Einzelbild.

### Aufgaben, der Reihe nach

1. **Epochen mit angeglichener λ wählen.** Eine Datei pro Durchgang, mit Minimierung der λ-Streuung im Objekt
   (λ mit der Tabelle `WCS-WAVE`, die pro Detektor fest ist). Bei WISE 0855 sinkt D5 von 0,47 µm auf 0,035 µm.
2. **Maske nach Bits.** Die EDA invalidiert `TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, MISSING_DATA, HOT,
   COLD, NONLINEAR, PERSIST, OUTLIER`. Zweifelsfälle: `HALO` (2,1 %) und `BLOOM` (0,8 %). **Niemals** `FLAGS != 0`.
   Die Namen der Bits stehen im Header von FLAGS (`MSKN`/`MSKM`/`MSKD`).
3. **Reprojektion ohne die Maske zu vergrößern.** Aufgefülltes Bild und Maske getrennt (nächster
   Nachbar für die Maske): Bei bilinearer Interpolation kontaminiert jeder schlechte Pixel seine Nachbarn und die
   Löcher werden optisch größer.
4. **`IMAGE − ZODI`** und Normalisierung zwischen Epochen (heute Median und Standardabweichung; versuchen, nach
   dem Fluss von Feldsternen zu skalieren).
5. **`diff_first` und `diff_prev`**, divergierende Karte auf 0 zentriert und gleicher Bereich für alle.
6. **Summe pro Durchgang** mit Gewichten `1/VARIANCE` (Co-add): Das würde WISE 0855 sichtbar machen.
7. **Sättigung.** Barnard und RW Aur sättigen: Der Kern ist maskiert (Barnard 44 von 49 Pixeln) und
   die Differenz hinterlässt ein rotes/blaues Paar, **auch wenn sich der Stern nicht bewegt** (RW Aur). Einen Sättigungsindikator
   bereitstellen, damit V1 ihn anzeigt.

### Wie man es prüft

| Test | Muss bestehen |
|---|---|
| eps Ind B, D5, Schwerpunkt letzter − erster | −0,92 / −0,57 px (West / Nord) ± 0,2 px; die EDA maß −0,85 / −0,71 |
| Nicht gesättigte Feldsterne | Mediane Verschiebung < 0,2 px |
| Barnard, D2, Differenz | Paar mit dem Positiven nach **Norden** (qualitativ: sättigt) |
| RW Aur, D3 | Als gesättigt markiert; wenn nicht, täuscht die Differenz |
| `flagged_fraction` | ~4 % des Ausschnitts, nicht ~72 % |

## V1 · Antonia — Viewer des Blinks

Prüfung des Entwurfs gegen die Daten, Punkt für Punkt: [`diseno/REVISION_MAQUETA_V1.md`](diseno/REVISION_MAQUETA_V1.md).


- Die **Differenz** ist die Ansicht, die die Bewegung zeigt: Der Blink allein von 1–2 px fällt kaum auf. Es braucht
  Zoom (die EDA nutzte auf 18×18 px vergrößerte Ausschnitte).
- Immer **Datum und λ** jedes Einzelbildes anzeigen: Sie erklären, warum sich die Helligkeit ändert.
- Warnen, wenn das Objekt sättigt, und die Maske als optionale Schicht zeigen.
- Wartezustände: Ein kaltes Einzelbild kann 7–29 s brauchen.

## V2 · Juan Pablo — Himmels-Viewer

> **Erledigt in PR #6 (am 14. Nov. gemerged):** λ-Schieberegler über die 102 Ebenen (ohne 50 und 51), Markierung
> des Objekts und Rahmen des Ausschnitts auf 2026 propagiert, Gaia-DR3-Schicht propagiert (Limit von 300 Sternen) und Schicht
> SIMBAD mit Beschriftung beim Überfahren und Klick, der die Position wählt. **Erledigt im Branch `v/v2-catwise`, PR ausstehend:** Schicht CatWISE2020, die WISE 0855 2,6″ von der aus SIMBAD propagierten Position markiert (laut V2). **Fehlt:** Bänder-Diagramm (mit D2), Klick →
> zugeschnittene Animation, Spherix.

- **Der HiPS-Cube von IRSA lädt in Aladin** und Mauricio hat ihn bereits funktionsfähig in `scaffold/frontend/src/sky/AladinView.tsx` hinterlegt
  (Aladin Lite 3.8.2, eine Ebene pro Band). Es ist ein Mosaik aller Epochen, mit 12,9″/px: Kontext und
  102 Bänder, keine Zeit. Das HiPS des CDS (QR2) bleibt als Plan B.
- Für das **Bänder-Diagramm** taugt der Cube nicht (es sind gestreckte PNGs, ohne Flüsse); das Spektrum kommt aus
  den Level-2-Dateien (die λ jeder einzelnen wird bereits in D2 berechnet) oder aus dem Spectrophotometry Tool von IRSA.
- Gaia-Overlay auf die Epoche propagiert: Die EDA propagiert bereits mit Eigenbewegung (`eda/comun.py`,
  `posicion_en`), und es stimmt mit dem bei eps Ind B Gemessenen überein.

## C · Mauricio — Wissenschaft, Verifikation und Deployment

- **Datum, um zu entscheiden, wo `/api` läuft:** Cutouts mit 7,3 s Median und 29 s Maximum, zeitweise 503.
- In `data/campos_de_prueba.yml` die Pixelskala korrigieren: **6,15″** (aus SIA2), es stand 6,2 abgeleitet.
- **`scaffold/frontend/src/content/campos.ts` enthält J2000-Koordinaten**, obwohl sein Kommentar
  «propagiert» sagt. Für 2026 steht WISE 0855 212″ und Barnard 270″ von diesen Koordinaten entfernt: Bei Ausschnitten von 0,1°
  (halbe Seite 180″) liegen sie **außerhalb des Ausschnitts**. Propagierte Positionen verwenden (das `/api/presets` des
  Branches von Bryan liefert sie bereits).
- Demo: Die fünf Testobjekte müssen funktionieren. WISE 0855 wird immer gezeigt (mit der Differenz und mit der Summe pro Durchgang von D2, sobald sie existiert, plus dem Overlay von CatWISE2020 von V2, fertig im Branch `v/v2-catwise` und PR ausstehend; es wird gesagt, dass er in einer einzelnen Belichtung schwach wirkt); eps Ind B ist der Fall, in dem die Bewegung am deutlichsten zu sehen ist; Barnard sieht man, aber er sättigt.
- Die oben genannten Tests von D2 sind die Abnahmetests.

## N · Javiera — Narrativ

- Die ehrliche Botschaft: «Die schnellsten Sterne bewegen sich 1–2 Pixel in einem Jahr SPHEREx; wir
  machen es sichtbar, indem wir die Farbe angleichen, ausrichten und subtrahieren».
- Fertiges Material: die Präsentation `docs/presentacion_eda/` und die Abbildung `eda/figuras/01_lambda_vs_tiempo.png`.

---

## SpacePixels als unabhängige Verifikation (für D2 und C)

[SpacePixels](https://github.com/ppissias/SpacePixels) (BSD-2, Java 21, Desktop) erkennt sich bewegende
Objekte in **bereits ausgerichteten FITS-Sequenzen**, mit Blink, Differenz und «Shift-and-stack».
Nur sein README wurde gelesen; **der Code wurde weder geprüft noch ausprobiert**.

- Es wird nicht in den Viewer integriert (Desktop-Java).
- Es dient zur Prüfung der Ausrichtung: Exportiert man die ausgerichteten Einzelbilder als FITS mit WCS, sollte es
  eps Ind B als beweglich und die Feldsterne als fest markieren.
- Sein «Shift-and-stack» ist die Idee, WISE 0855 entlang seiner Eigenbewegung zu summieren.
- Es zu installieren heißt, Software eines Dritten herunterzuladen: im Team abstimmen.
