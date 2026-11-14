<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/03_ARQUITECTURA.md) · [中文](../../zh/docs/03_ARQUITECTURA.md) · [Deutsch](../../de/docs/03_ARQUITECTURA.md) · [Italiano](../../it/docs/03_ARQUITECTURA.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/03_ARQUITECTURA.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 03 — Architecture

Architecture proposal and, above all, **the API contract**, which is what lets the
frontend and backend move in parallel from hour 1.

This is a pre-event proposal. It is confirmed or corrected in hour 1 with the real data
(see the checklist at the end of [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)) and is recorded in
[`adr/ADR-001-stack.md`](adr/ADR-001-stack.md).

---

## 1. Two paths, and we must have both

The project has a fast path and a complete one. **The key is that the fast one really exists**,
thanks to the fact that the DR1 all-sky cube is published in HiPS format.

### Path A — "the sky in 102 colors", no backend

Aladin Lite loads the SPHEREx DR1 HiPS cube served by IRSA directly. The user navigates the
sky and moves a wavelength slider. **Zero backend.**

- **What it gives:** the 102 bands, all-sky context, Gaia overlays and CDS catalogs.
- **What it does not give:** the time axis. The cube is a combined mosaic, not a series of epochs.
- **Cost:** hours, not days. Low technical risk.
- **Risk resolved (Nov 14):** the IRSA HiPS (`/data/hips/SPHEREx/spherex_allsky_cube`, PNG, 102 planes, 50 and 51 empty) loads in Aladin Lite 3.8.2 with open CORS (`09_EDA_HALLAZGOS.md` §6). The CDS plan B (`alasky.cds.unistra.fr`) could not be checked: that day it returned 404.

### Path B — the temporal blink, with backend

This is the challenge proper. The backend queries SIA2 by position, requests cutouts of each epoch,
groups them by band, normalizes them and returns a time-ordered sequence of frames.

- **What it gives:** the little video. What is judged.
- **Cost:** it is the bulk of the work.
- **Bottleneck:** cutout latency. Without a cache, the demo does not survive.

**Both paths are mounted on the same screen.** Aladin Lite gives the context and navigation; a panel
alongside gives the temporal blink of the crop. The user immediately understands that these are two axes of the same data.

---

## 2. Diagram

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

## 3. API contract

**This is the only thing the frontend can take as certain.** Any change is discussed, written
here first and the team is notified. While the backend does not exist, the frontend works against a mock
that returns exactly these shapes.

All coordinates are in **decimal degrees**, ICRS. All sizes in **degrees**. All
dates in **ISO 8601 UTC**.

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "irsa_reachable": true, "cache_entries": 128 }
```

> **Note (Nov 14):** the backend skeleton currently exposes `/health` (without `/api`) and responds `{ "ok": true }`. Whether it becomes `/api/health` is up to D1.

### `GET /api/resolve?q=<text>`

Resolves a name to coordinates (via SIMBAD). It makes the tool usable by anyone.

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

If it does not resolve: `{"query": "...", "resolved": false, "error": "not found"}` with HTTP 200.
**A name not found is not a server error.**

### `GET /api/epochs?ra=&dec=&size=&collections=`

Which observations exist for that position. It is the cheap query: **it downloads no images**.
It lets the interface immediately show "there are 14 epochs between May 2025 and October 2026"
while the frames are being prepared.

Default `collections`: `spherex_dr1,spherex_qr3`.

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

The heart. Returns the frames ready to paint.

| Parameter | Values | Default |
|---|---|---|
| `band` | `1`–`6`, or `all` | `4` |
| `size` | degrees | `0.1` |
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

Contract decisions, and why:

- **The backend returns already-rendered PNGs, not FITS.** Sending FITS to the browser forces us to write a
  FITS reader and apply the stretch and the color map in JavaScript: twice the work and
  three times the bugs. The cost is that changing the stretch requires going back to the server; with a cache it is
  cheap, and a fine stretch can be added later on the client over the PNG.
- **`wavelength_um` per frame is mandatory.** It is the field that prevents the error described in
  [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2 and, shown on screen, it shows the jury that we
  understand the instrument.
- **`warnings` is an array, not an error.** Bands are missing constantly; if that breaks the request,
  the tool does not work.
- **`flagged_fraction`** covers the *contamination flags* bullet with one field. (Measured: with a bitwise mask it is ~4 % of the crop; counting `FLAGS != 0` would give ~72 %, because the SOURCE bit is not an error; `09_EDA_HALLAZGOS.md`.)

### `GET /api/spectrum?ra=&dec=&aperture=`

The "extra kudos". Spectrum of a position, on the fly.

```json
{
  "ra": 133.7951, "dec": -7.2452, "aperture_arcsec": 12,
  "n_points": 87,
  "spectrum": [ { "wavelength_um": 0.78, "flux_mjy": 0.42, "err_mjy": 0.08, "band": 1 } ],
  "method": "aperture photometry, zodi-subtracted",
  "caveat": "Valores indicativos, no fotometría científica. Ver docs/02."
}
```

The `caveat` field is **not optional**. Presenting an approximate spectrum as if it were calibrated
photometry in front of a jury with astronomers is the fastest way to lose credibility.

---

### Contract changes — Nov 14, 2026 (viewer whiteboard)

Additive: nothing above changes shape, so the existing mock and code remain valid.

- **`from` and `to`** (ISO 8601 UTC, optional) in `/api/epochs` and `/api/frames`: the whiteboard's "from – to"
  control. Without them, all epochs.
- **Animation centered on a star** (click on the image): there is no new endpoint. The frontend calls
  `/api/frames` with the star's `ra`/`dec` and a small `size` (e.g. `0.02`).
- **Bubble with the name when hovering over a star:** `/api/resolve` also accepts `ra`/`dec`
  (cone search in SIMBAD, radius 10″) and returns the closest object with the same response shape. **Note (Nov 14):** today the viewer queries SIMBAD directly from the browser (TAP, CDS first and the Harvard mirror as a fallback; `scaffold/frontend/src/sky/capas/simbad.ts`), not through `/api/resolve`.
- **Gamma:** applied on the client over the PNG; it does not travel to the server.
- **Precomputed for Vercel:** the 5 test fields are published as static files with exactly
  these same JSON shapes, at `/precalc/<id>/epochs.json`, `/precalc/<id>/frames-b<band>.json` and their PNGs.

## 4. Application URL

The challenge explicitly asks for the tool to be queryable by URL. The format is part of the
contract:

```
https://<dominio>/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
https://<dominio>/?target=WISE+0855&size=0.2
```

Rules: `target` takes priority over `ra`/`dec`; any missing parameter takes the default value;
**the URL always reflects the viewer's current state** (it is updated with `history.replaceState`), so
that copying the address bar is sharing exactly what is being viewed. That is the
feature that turns the tool into infrastructure for other projects, as happened with WiseView.

---

## 5. Cache

Without a cache there is no demo. It is the least showy piece and the most important.

- **Key:** hash of `(ra, dec, size, band, mode, stretch, cmap)` rounding coordinates to ~1 arcsec.
- **What is stored:** the rendered PNGs and the response JSON. Optionally the FITS cutouts.
- **Where:** `data/cache/` on disk. At the event it is more than enough; Redis only if sharing between processes is needed.
- **Pre-warming:** **the five test fields are pre-warmed when the server starts.** The demo
  in front of the jury uses those five. We never demo with a cold query.
- **TTL:** nothing needs to expire within 24 hours. We do not build what we do not need.

---

## 6. Deployment

The challenge says "public-facing web tool". A URL the jury can open is worth more than any
slide.

- **Frontend:** static build on any CDN (Vercel, Netlify, GitHub Pages).
- **Backend:** container on a service with a free tier. **Beware of those that put the
  container to sleep after inactivity**: if the jury opens the URL and waits 50 seconds, we are lost. Hence
  the pre-warming and, if needed, a periodic ping.
- **Mandatory plan B:** a recorded demo video and an application mode that works with cached data
  without touching IRSA. **Hackathon wifi goes down.** See [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 7. What we deliberately will not do

Written in advance so that at 4 in the morning nobody reopens it:

- **We will not write our own sky viewer.** Aladin Lite exists and the challenge cites it.
- **We will not implement shift-and-stack.** See [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §3.
- **We will not train a video model.** Same, §6.
- **We will not do science-grade photometry.** IRSA's Spectrophotometry Tool exists for that.
- **We will not set up user accounts.** If a finding needs saving, it is saved as a URL.
- **We will not reprocess any level 1.** We start from level 2, which is what is published.


---

## Pending team agreement (Nov 14)

Proposals arising from the documentation review ([`REVISION_DOCUMENTACION_2026-11-14.md`](REVISION_DOCUMENTACION_2026-11-14.md)) and from the data measured in the EDA. **They do not change the current contract** above: they apply only when the team agrees (README §5, rule 4).

1. **Date filter names.** The contract says `from` and `to`; the prototype on branch `d/prototipo-rango-fechas` uses `start` and `end`. Agree on one.
2. **New prototype routes.** `/api/grid` (visits per band and date column), `/api/frame` (one frame per visit) and `/api/presets` (the 5 fields with the propagated position) exist on that branch and are not listed here. `docs/10` already cites `/api/presets`.
3. **Requesting matched λ and per-sweep sum.** `/api/frames` has no way to request epochs at matched λ or the sum of exposures per sweep; the EDA concludes that the natural unit of the video is the sweep (3-4 frames) and that λ must be matched (`09_EDA_HALLAZGOS.md` §2).
4. **Default collections.** `collections=spherex_dr1,spherex_qr3` leaves R Dra almost without data, since it is mostly in the `_deep` ones (1,233 + 733 files vs 422 + 126 regular; `09_EDA_HALLAZGOS.md` §1).
5. **Disk cache vs Vercel.** Vercel Functions has no persistent disk; if `/api` runs there, the cache (`data/cache/`) must be in memory or external storage (ADR-001, Nov 14 update).
6. **Contamination mask.** Document in the contract that `flagged_fraction` is computed with a bitwise mask and never with `FLAGS != 0`.
