<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/03_ARQUITECTURA.md) · [Español](../../es/docs/03_ARQUITECTURA.md) · [中文](../../zh/docs/03_ARQUITECTURA.md) · **Deutsch** · [Italiano](../../it/docs/03_ARQUITECTURA.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/03_ARQUITECTURA.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 03 — Architektur

Architekturvorschlag und vor allem **der Vertrag der API**, der es ermöglicht, dass
Frontend und Backend ab Stunde 1 parallel vorankommen.

Dies ist ein Vorschlag vor dem Event. Er wird in Stunde 1 mit den realen Daten bestätigt oder korrigiert
(siehe die Checkliste am Ende von [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)) und in
[`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) festgehalten.

---

## 1. Zwei Wege, und wir müssen beide haben

Das Projekt hat einen schnellen und einen vollständigen Weg. **Entscheidend ist, dass der schnelle wirklich existiert**,
weil der Ganzhimmels-Cube von DR1 im HiPS-Format veröffentlicht wird.

### Weg A — „der Himmel in 102 Farben“, ohne Backend

Aladin Lite lädt direkt den von IRSA bereitgestellten HiPS-Cube von SPHEREx DR1. Die Nutzerin bzw. der Nutzer navigiert durch den
Himmel und bewegt einen Wellenlängen-Schieberegler. **Null Backend.**

- **Was er liefert:** die 102 Bänder, Kontext des ganzen Himmels, Overlays von Gaia und von CDS-Katalogen.
- **Was er nicht liefert:** die Zeitachse. Der Cube ist ein kombiniertes Mosaik, keine Serie von Epochen.
- **Aufwand:** Stunden, nicht Tage. Geringes technisches Risiko.
- **Gelöstes Risiko (14. Nov.):** Der HiPS von IRSA (`/data/hips/SPHEREx/spherex_allsky_cube`, PNG, 102 Ebenen, 50 und 51 leer) lädt in Aladin Lite 3.8.2 mit offenem CORS (`09_EDA_HALLAZGOS.md` §6). Der Plan B über das CDS (`alasky.cds.unistra.fr`) konnte nicht geprüft werden: An diesem Tag lieferte er 404.

### Weg B — das zeitliche Blinken, mit Backend

Das ist die eigentliche Challenge. Das Backend fragt SIA2 nach Position ab, fordert Cutouts jeder Epoche an,
gruppiert sie nach Band, normalisiert sie und liefert eine zeitlich geordnete Sequenz von Einzelbildern.

- **Was er liefert:** das kleine Video. Was bewertet wird.
- **Aufwand:** der Großteil der Arbeit.
- **Flaschenhals:** die Latenz der Cutouts. Ohne Cache übersteht die Demo nicht.

**Beide Wege werden auf demselben Bildschirm zusammengebaut.** Aladin Lite liefert Kontext und Navigation; ein Panel
daneben liefert das zeitliche Blinken des Ausschnitts. Die Nutzer verstehen sofort, dass es zwei Achsen derselben Daten sind.

---

## 2. Diagramm

```
                   ┌───────────────────────────────────────────────┐
  Usuario ───────► │  FRONTEND  (React + Vite + TS)                │
  "Barnard's Star" │                                               │
  o  RA/Dec        │  ┌─────────────────┐  ┌────────────────────┐  │
                   │  │  Aladin Lite v3 │  │  Panel de blink    │  │
                   │  │  contexto +     │  │  <canvas>          │  │
                   │  │  cubo HiPS +    │  │  play/pausa, fps,  │  │
                   │  │  overlay Gaia   │  │  estiramiento,     │  │
                   │  └────────┬────────┘  │  color, resta      │  │
                   │           │           └─────────┬──────────┘  │
                   └───────────┼─────────────────────┼─────────────┘
                   VÍA A       │                     │  VÍA B
                   (directo)   │                     │
                               ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────────────┐
                 │  IRSA  HiPS cube │   │  BACKEND (FastAPI)       │
                 │  (DR1, Norder5)  │   │                          │
                 └──────────────────┘   │  /resolve  /epochs       │
                                        │  /frames   /spectrum     │
                                        │            /health       │
                                        │        │                 │
                                        │        ▼                 │
                                        │  ┌──────────────┐        │
                                        │  │ caché disco  │        │
                                        │  └──────┬───────┘        │
                                        └─────────┼────────────────┘
                                                  ▼
                        ┌──────────────────────────────────────────┐
                        │  IRSA:  SIA2  +  servicio de cutouts     │
                        │  CDS:   SIMBAD (nombres), HiPS, Gaia     │
                        └──────────────────────────────────────────┘
```

---

## 3. Vertrag der API

**Das ist das Einzige, was das Frontend als gegeben ansehen darf.** Jede Änderung wird diskutiert, zuerst
hier aufgeschrieben und dem Team mitgeteilt. Solange das Backend nicht existiert, arbeitet das Frontend gegen einen Mock,
der genau diese Formen liefert.

Alle Koordinaten sind in **Dezimalgrad**, ICRS. Alle Größen in **Grad**. Alle
Zeitangaben in **ISO 8601 UTC**.

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "irsa_reachable": true, "cache_entries": 128 }
```

> **Hinweis (14. Nov.):** Das Backend-Gerüst stellt heute `/health` (ohne `/api`) bereit und antwortet `{ "ok": true }`. Ob es zu `/api/health` wird, entscheidet D1.

### `GET /api/resolve?q=<texto>`

Löst einen Namen in Koordinaten auf (über SIMBAD). Macht das Werkzeug für jede Person nutzbar.

```json
{
  "query": "Barnard's Star",
  "resolved": true,
  "name": "V2500 Oph",
  "ra": 269.4521,
  "dec": 4.6933,
  "source": "SIMBAD"
}
```

Wenn nicht aufgelöst: `{"query": "...", "resolved": false, "error": "not found"}` mit HTTP 200.
**Ein nicht gefundener Name ist kein Serverfehler.**

### `GET /api/epochs?ra=&dec=&size=&collections=`

Welche Beobachtungen es für diese Position gibt. Es ist die billige Abfrage: **lädt keine Bilder herunter**.
Sie dient dazu, dass die Oberfläche sofort „es gibt 14 Epochen zwischen Mai 2025 und Oktober 2026“ anzeigt,
während die Einzelbilder vorbereitet werden.

`collections` standardmäßig: `spherex_dr1,spherex_qr3`.

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1,
  "n_epochs": 14,
  "time_range": ["2025-05-12T03:11:00Z", "2026-10-02T19:40:00Z"],
  "bands_available": [1, 2, 3, 4, 5, 6],
  "epochs": [
    {
      "id": "2025W19_2B_0073_2D3",
      "t": "2025-05-12T03:11:00Z",
      "band": 3,
      "detector": 3,
      "collection": "spherex_qr3",
      "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/...fits"
    }
  ]
}
```

### `GET /api/frames?ra=&dec=&size=&band=&stretch=&cmap=&mode=`

Das Herzstück. Liefert die zum Zeichnen fertigen Einzelbilder.

| Parameter | Werte | Standard |
|---|---|---|
| `band` | `1`–`6`, oder `all` | `4` |
| `size` | Grad | `0.1` |
| `stretch` | `linear`, `sqrt`, `log`, `asinh`, `zscale` | `asinh` |
| `cmap` | `gray`, `viridis`, `magma`, `inferno` | `gray` |
| `mode` | `raw`, `zodi_subtracted`, `diff_first`, `diff_prev` | `zodi_subtracted` |

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1, "band": 4, "mode": "zodi_subtracted",
  "pixel_scale_arcsec": 6.15,
  "wcs": { "crval1": 133.7951, "crval2": -7.2452, "cdelt1": -0.0017, "cdelt2": 0.0017 },
  "n_frames": 9,
  "frames": [
    {
      "t": "2025-05-12T03:11:00Z",
      "epoch_id": "2025W19_2B_0073_2D3",
      "wavelength_um": 3.41,
      "bandwidth_um": 0.031,
      "png": "/static/cache/ab12cd/0001.png",
      "flagged_fraction": 0.04,
      "vmin": -0.8, "vmax": 12.3
    }
  ],
  "warnings": ["La época 2026W02_1A no trae banda 4 y se omitió."]
}
```

Entscheidungen des Vertrags, und warum:

- **Das Backend liefert bereits gerenderte PNG, keine FITS.** FITS an den Browser zu schicken zwingt dazu, einen
  FITS-Reader zu schreiben und Stretch und Farbkarte in JavaScript anzuwenden: doppelt so viel Arbeit und
  dreimal so viele Bugs. Der Preis ist, dass eine Änderung des Stretch einen Rückgriff auf den Server erfordert; mit Cache ist das
  billig, und später kann ein feiner Stretch im Client auf dem PNG ergänzt werden.
- **`wavelength_um` pro Einzelbild ist Pflicht.** Es ist das Feld, das den in
  [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2 beschriebenen Fehler verhindert und, auf dem Bildschirm gezeigt, der Jury beweist, dass wir
  das Instrument verstehen.
- **`warnings` ist ein Array, kein Fehler.** Bänder fehlen ständig; wenn das die Anfrage zerstört,
  funktioniert das Werkzeug nicht.
- **`flagged_fraction`** deckt den Spiegelstrich der *contamination flags* mit einem Feld ab. (Gemessen: mit Bitmaske sind es ~4 % des Ausschnitts; `FLAGS != 0` zu zählen würde ~72 % ergeben, weil das Bit SOURCE kein Fehler ist; `09_EDA_HALLAZGOS.md`.)

### `GET /api/spectrum?ra=&dec=&aperture=`

Das „Extra Kudos“. Spektrum einer Position, spontan erzeugt.

```json
{
  "ra": 133.7951, "dec": -7.2452, "aperture_arcsec": 12,
  "n_points": 87,
  "spectrum": [ { "wavelength_um": 0.78, "flux_mjy": 0.42, "err_mjy": 0.08, "band": 1 } ],
  "method": "aperture photometry, zodi-subtracted",
  "caveat": "Valores indicativos, no fotometría científica. Ver docs/02."
}
```

Das Feld `caveat` ist **nicht optional**. Ein genähertes Spektrum vor einer Jury mit Astronomen als kalibrierte
Photometrie darzustellen, ist der schnellste Weg, Glaubwürdigkeit zu verlieren.

---

### Änderungen am Vertrag — 14. Nov. 2026 (Whiteboard des Viewers)

Additiv: nichts vom Vorherigen ändert seine Form, daher gelten der vorhandene Mock und Code weiter.

- **`from` und `to`** (ISO 8601 UTC, optional) in `/api/epochs` und `/api/frames`: der Regler „von – bis“
  des Whiteboards. Ohne sie alle Epochen.
- **Auf einen Stern zentrierte Animation** (Klick ins Bild): kein neuer Endpunkt. Das Frontend ruft
  `/api/frames` mit `ra`/`dec` des Sterns und einem kleinen `size` auf (z. B. `0.02`).
- **Blase mit dem Namen beim Überfahren eines Sterns:** `/api/resolve` akzeptiert auch `ra`/`dec`
  (Kegelsuche in SIMBAD, Radius 10″) und liefert das nächstgelegene Objekt in derselben Antwortform. **Hinweis (14. Nov.):** Heute fragt der Viewer SIMBAD direkt aus dem Browser ab (TAP, zuerst CDS und der Harvard-Spiegel als Rückfall; `scaffold/frontend/src/sky/capas/simbad.ts`), nicht über `/api/resolve`.
- **Gamma:** wird im Client auf das PNG angewendet; reist nicht zum Server.
- **Vorberechnet für Vercel:** Die 5 Testfelder werden als statische Dateien mit genau
  denselben JSON-Formen veröffentlicht, unter `/precalc/<id>/epochs.json`, `/precalc/<id>/frames-b<band>.json` und ihren PNG.

## 4. URL der Anwendung

Die Challenge verlangt ausdrücklich, das Werkzeug per URL abfragen zu können. Das Format ist Teil des
Vertrags:

```
https://<dominio>/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
https://<dominio>/?target=WISE+0855&size=0.2
```

Regeln: `target` hat Vorrang vor `ra`/`dec`; jeder fehlende Parameter nimmt den Standardwert an;
**die URL spiegelt immer den aktuellen Zustand des Viewers** (sie wird mit `history.replaceState` aktualisiert), damit
das Kopieren der Adressleiste genau das Teilen dessen bedeutet, was man gerade sieht. Das ist die
Funktion, die das Werkzeug zur Infrastruktur für andere Projekte macht, wie es bei WiseView geschah.

---

## 5. Cache

Ohne Cache keine Demo. Es ist das unscheinbarste und wichtigste Stück.

- **Schlüssel:** Hash von `(ra, dec, size, band, mode, stretch, cmap)`, Koordinaten auf ~1 arcsec gerundet.
- **Was gespeichert wird:** die gerenderten PNG und das JSON der Antwort. Optional die FITS-Cutouts.
- **Wo:** `data/cache/` auf der Platte. Im Event reicht das; Redis nur, wenn zwischen Prozessen geteilt werden muss.
- **Vorwärmen:** **Die fünf Testfelder werden beim Serverstart vorgewärmt.** Die Demo
  vor der Jury nutzt diese fünf. Es wird nie mit einer kalten Abfrage demonstriert.
- **TTL:** In 24 Stunden muss nichts ablaufen. Was nicht gebraucht wird, wird nicht gebaut.

---

## 6. Deployment

Die Challenge sagt „public-facing web tool“. Eine URL, die die Jury öffnen kann, ist mehr wert als jede
Folie.

- **Frontend:** statischer Build auf einem beliebigen CDN (Vercel, Netlify, GitHub Pages).
- **Backend:** Container bei einem Dienst mit kostenloser Stufe. **Vorsicht bei denen, die den
  Container bei Inaktivität schlafen legen**: Wenn die Jury die URL öffnet und 50 Sekunden wartet, ist sie verloren. Daher
  das Vorwärmen und, falls nötig, ein periodischer Ping.
- **Plan B verpflichtend:** aufgenommenes Video der Demo und ein Modus der Anwendung, der mit Daten
  im Cache funktioniert, ohne IRSA zu berühren. **Das WLAN eines Hackathons fällt aus.** Siehe [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 7. Was wir bewusst nicht tun werden

Vorab aufgeschrieben, damit es um 4 Uhr morgens niemand wieder aufmacht:

- **Wir werden keinen eigenen Himmels-Viewer schreiben.** Aladin Lite existiert und wird von der Challenge zitiert.
- **Wir werden kein Shift-and-Stack implementieren.** Siehe [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §3.
- **Wir werden kein Videomodell trainieren.** Ebenso, §6.
- **Wir werden keine Photometrie in wissenschaftlicher Qualität machen.** Dafür gibt es das Spectrophotometry Tool von IRSA.
- **Wir werden keine Benutzerkonten aufsetzen.** Wenn ein Befund gespeichert werden muss, wird er als URL gespeichert.
- **Wir werden nichts auf Level 1 neu verarbeiten.** Wir beginnen bei Level 2, das ist das Veröffentlichte.


---

## Ausstehende Einigung des Teams (14. Nov.)

Vorschläge, die aus der Dokumentationsprüfung ([`REVISION_DOCUMENTACION_2026-11-14.md`](REVISION_DOCUMENTACION_2026-11-14.md)) und aus den in der EDA gemessenen Daten hervorgehen. **Sie ändern den geltenden Vertrag** oben nicht: Sie werden nur angewendet, wenn sich das Team darauf einigt (README §5, Regel 4).

1. **Namen der Datumsfilter.** Der Vertrag sagt `from` und `to`; der Prototyp im Branch `d/prototipo-rango-fechas` verwendet `start` und `end`. Auf einen einigen.
2. **Neue Routen des Prototyps.** `/api/grid` (Besuche pro Band und Datumsspalte), `/api/frame` (ein Einzelbild pro Besuch) und `/api/presets` (die 5 Felder mit propagierter Position) existieren in diesem Branch und stehen hier nicht. `docs/10` zitiert `/api/presets` bereits.
3. **Angeglichene λ und Summe pro Durchgang anfordern.** `/api/frames` hat keine Möglichkeit, Epochen mit angeglichener λ oder die Summe der Belichtungen pro Durchgang anzufordern; die EDA schließt, dass die natürliche Einheit des Videos der Durchgang ist (3-4 Einzelbilder) und dass die λ angeglichen werden muss (`09_EDA_HALLAZGOS.md` §2).
4. **Standard-Collections.** `collections=spherex_dr1,spherex_qr3` lässt R Dra fast ohne Daten, das hauptsächlich in den `_deep` liegt (1.233 + 733 Dateien gegenüber 422 + 126 normalen; `09_EDA_HALLAZGOS.md` §1).
5. **Cache auf Platte gegenüber Vercel.** Vercel Functions hat keine persistente Platte; wenn `/api` dort läuft, muss der Cache (`data/cache/`) im Speicher oder in externem Speicher liegen (ADR-001, Aktualisierung 14. Nov.).
6. **Kontaminationsmaske.** Im Vertrag dokumentieren, dass `flagged_fraction` mit Bitmaske berechnet wird und nie mit `FLAGS != 0`.
