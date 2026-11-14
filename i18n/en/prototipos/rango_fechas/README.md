<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/prototipos/rango_fechas/README.md) · [中文](../../../zh/prototipos/rango_fechas/README.md) · [Deutsch](../../../de/prototipos/rango_fechas/README.md) · [Italiano](../../../it/prototipos/rango_fechas/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `prototipos/rango_fechas/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Prototype: what moved between two dates?

Isolated prototype (does not touch `scaffold/` or the `docs/03` contract). Given a point in the sky, a band and a
**date range**, it requests from IRSA **only the necessary cutouts** (one image per visit, optionally the sum of
several exposures of the visit), aligns them north-up and shows:

- **Blink** between visits, with the date and wavelength of each frame.
- **Last − first subtraction**: red = brightness that appears, blue = brightness that was there. A red/blue pair = motion.
- **Color composite**: first in red, last in cyan.
- Table with the observation, the collection, the λ at the center and the % of pixels with contamination (FLAGS).

In addition, `eda_spherex.ipynb` is an **exploratory analysis** of the data: inventory, anatomy of a cutout,
effect of the linear variable filter, sequence and subtractions, and a check of the motion against proper motion.

## How to run it

From the repo root:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
# abrir http://localhost:8010
```

Notebook: open `prototipos/rango_fechas/eda_spherex.ipynb` with the `.venv` kernel and change `CAMPO`.

The cutouts are left in `data/cache/prototipo/` (ignored by git). Nothing is downloaded whole.

## Explorer (`/explorar`)

Open http://localhost:8010/explorar.

- **Large image** on the left (square, as large as fits) and **sidebar on the right** with the filters
  (object, RA/Dec, from–to, bands, field, exposures per visit), the visible band, the mode
  (image · subtraction vs t₀ · color), the image data and thumbnails of all bands and dates.
- **Time pointer** under the image: the visits are at their real date. Just moving the mouse (or dragging)
  changes the date; ←/→ visits, ↑/↓ bands, space plays. Next to the date you see Δt since t₀ and the λ.
- **Progressive loading:** first the visits (`/api/grid`), then the images one at a time, t₀ and t_last first.
- **Fast reader by HTTP ranges** (default): requests from the original file only the IMAGE rows of the cutout and
  the WCS-WAVE table from the tail; no PSF. Barnard, 6 bands, 28 images: **8.7 s** (t₀ and t_last of the 6 bands
  at 3.7 s), versus ~98 s with the cutout service. It does not read FLAGS (contamination shows "—") and subtracts the
  median instead of ZODI (measured difference: 0.07 times the noise). If it fails, it uses the cutout service.
- **If IRSA does not respond**, the searches saved in `data/cache/prototipo/sia/` are used with a notice; if the
  point was never queried, a clear message (HTTP 503).

The detectors come in pairs that look at the same area (1+4, 2+5, 3+6) and each pair passes over a point on different
days: that is why in the thumbnails there are columns where only two bands have an image.

## API

| Route | What it does | Cost |
|---|---|---|
| `GET /api/presets` | The 5 test fields with the position **propagated** by proper motion to today | nothing |
| `GET /api/epochs?ra&dec&band&start&end` | Available visits (SIA2, no images) | ~2 s, ~0.2 MB |
| `GET /api/frames?ra&dec&band&start&end&size&max_visits&per_visit` | PNG frames + subtraction + color | ~4 MB and ~5–12 s per cutout the 1st time; cached afterwards |
| `GET /api/grid?ra&dec&bands=1,2,5&start&end` | Visits per band and date columns (no images) | ~2–5 s |
| `GET /api/frame?ra&dec&band&visit&start&end&size&per_visit&fast` | One frame as float32 in base64 (~19 KB) | ~0.6–1 s with `fast=true` (default); ~11 s with `fast=false` |

The page URL reflects the query (`?ra=…&dec=…&band=…`), so it can be shared.

## How it was checked (Nov 14, 2026)

| Test | Result |
|---|---|
| Barnard, band 2, 3 exp./visit | 1.44–1.50 px **north** is measured vs 1.66–1.81 px predicted (error 1.3–2.3″) |
| WISE 0855, band 5, 6 exp./visit | 1.30–1.32 px **west** is measured vs 1.31–1.34 px predicted (error 0.6–1.2″) |
| RW Aur (no-motion control), band 3 | ≤ 0.22 px is measured (≈ 0), as it should be |
| λ from `WCS-WAVE` | 2.288 µm in a band 3 cutout (1.63–2.41 µm): consistent |
| Flux of a star vs date / vs λ | Jumps with no order by date and grows in order with λ: the effect of the linear variable filter |

## Findings that matter for the project

1. **You have to reproject.** Each cutout comes from a pointing with another orientation; without aligning, the blink rotates.
2. **WISE 0855 is not seen in a single exposure** (113 s) in band 5: you have to add 4–6 per visit.
3. **The `SOURCE` bit of FLAGS appears in ~100% of the pixels** of a populated field. It is informative; if it is counted
   as contamination, everything looks unusable. The bit definitions come in the header (`MSKNnnnn`).
4. **IRSA returned 503 with 6 cutouts in parallel.** With 3 and retries with waiting, it works.
5. **The cutout weighs ~4 MB but the useful image is ~40 KB**: the rest is the PSF (`EPSF`), which always comes whole.
6. **The epochs are at different λ** within the same band (e.g. 1.24–1.63 µm): part of the brightness
   change is the filter. The interface warns about it.

## What is NOT checked

- The interface was not tested in a real browser with clicks: the API and the images it returns were checked.
- eps Ind B and R Dra were not tested.
- The notebook's displacement measurement uses a 5 px window for faint objects and 15 px for bright ones;
  with the wrong window it gives bad results (checked with RW Aur). It is not astrometry.
- Parallax is not corrected (for Barnard it is ~0.5″, less than 0.1 px).
- The response time in a deployment (Vercel or other) was not measured.
- The FLAGS bits that are masked (`TRANSIENT`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`,
  `OUTLIER`) are a reasonable choice, not an official IRSA recommendation.

---

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
