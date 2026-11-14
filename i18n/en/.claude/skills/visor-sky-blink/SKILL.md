---
name: visor-sky-blink
description: How the challenge viewer is built: Aladin Lite v3 with HiPS and the SPHEREx all-sky cube, the blink panel for images by epoch, normalization and stretching of astronomical images (asinh, zscale, percentiles), color maps, subtraction of images between epochs, catalog overlays such as Gaia, and the queryable URL with coordinates. Activate it when working on the viewer frontend, when deciding how to show FITS images in the browser, when Aladin, HiPS, blink, flipbook, stretch, zscale, colormap, canvas of astronomical images are mentioned, or when designing the controls the user manipulates.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../../es/.claude/skills/visor-sky-blink/SKILL.md) · [中文](../../../../zh/.claude/skills/visor-sky-blink/SKILL.md) · [Deutsch](../../../../de/.claude/skills/visor-sky-blink/SKILL.md) · [Italiano](../../../../it/.claude/skills/visor-sky-blink/SKILL.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/skills/visor-sky-blink/SKILL.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# The viewer: blink and sky in the browser

What you need to know to build the part the jury looks at. The document with the API contract is
`docs/03_ARQUITECTURA.md`.

---

## 1. Two pieces, not one

| Piece | What it shows | How |
|---|---|---|
| **Sky context** | Where we are, what is around, the 102 bands | **Aladin Lite v3** over HiPS |
| **Blink panel** | The same region at different epochs, like a little video | Custom `<canvas>` over PNGs from the backend |

They go **side by side on the same screen**. The user immediately understands that they are two axes of the same
data: Aladin gives the wavelength, the panel gives the time.

---

## 2. Aladin Lite v3

HiPS viewer from CDS (Strasbourg). **The challenge statement itself suggests it.** It can be included
via `<script>` or npm.

What it solves for free and you don't need to write:

- Sky navigation, zoom and several projections (Aitoff, Mollweide, orthographic, Mercator).
- Loading HiPS from **any web server**, including `localhost`, with `newImageSurvey` /
  `createImageSurvey`.
- **HiPS tiles in FITS**, not just JPEG.
- Catalog overlays (Gaia, SIMBAD, VizieR) in a couple of lines.
- `getEmbedCode()` returns the HTML of the current field — a gift for the embedding bullet.
- `getViewDataURL()` exports the view to PNG/JPEG — useful for sharing and for the demo.

Documentation: <https://aladin.cds.unistra.fr/AladinLite/doc/API>

### The SPHEREx HiPS cube that works (verified Nov 14, 2026)

- **URL:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` (IRSA, DR1).
  Open CORS. It loads in Aladin Lite 3.8.2 (pinned in `package.json`) and is in production.
- **Format:** **PNG** tiles, order 5, pixel 12.9″, **102 planes** (one per channel).
- **Plane rule:** `plano = 17·(banda − 1) + (canal − 1)`, with band 1–6 and channel 1–17. The central
  channel of each band is `17·(b−1) + 8`. The exact λ of each plane is in `properties`, key
  `data_cube_crval3_arr` (0.753–4.988 µm).
- **Empty planes:** **50 and 51** (dichroic cut between D3 and D4). When the layer is added,
  Aladin leaves it on plane 50: you have to set the plane after the layer is ready.
- **Tile suffix = plane:** with band 4 the browser requests `Norder5/.../Npix11391_59.png`.
  It is useful for checking in `performance.getEntriesByType('resource')` which plane is being shown.
- **How to set a plane:** `ponerPlano` (in `planos.ts`) computes the frequency of the plane's center and
  calls `setFrequency`; verified in all 6 bands (suffixes `_8 _25 _42 _59 _76 _93`).
  **Do not use `setSliceNumber`:** in 3.8.2 requesting 59 brings 9. By the same token, the cube control of the
  Aladin layers menu (which uses `setSliceNumber`) probably shows a wrong plane (not
  verified). `capa.getFrequency()` does not give the real λ either: λ comes from `properties` (`leerPlanos`).
- **Aladin only requests tiles if the tab is visible.** With the browser panel hidden, no
  new tile is seen: it is not a bug.
- **What it is NOT:** a mosaic of **all epochs** (it has no time axis: it is no use for showing
  motion) and already-stretched PNGs (they have no fluxes: no use for the spectrum). Time and spectrum
  come from the level 2 files via the backend.
- **The FITS version** of the same cube that SIA2 delivers (`spherex_dr1_cube`) is no use for Aladin nor
  for cutouts (~320 MB per tile).
- **Plan B:** `CDS/P/SPHEREx/QR2/D1`…`D6` at CDS (previous version). Not verified: alasky was
  down on Nov 14.

### How it is built in the code (`scaffold/frontend/src/sky/`)

- `AladinView.tsx` creates Aladin and **does not know the detail of the layers**: it mounts those in `capas/index.ts`
  (contract `montar(aladin, ctx) → desmontar`; `ctx` carries ra, dec, size, epoca, on, onSelect) and
  remounts them when position, crop or epoch change. Optional props: `size`, `epoca` (Julian year,
  default 2026.0), `onReady`, `onSelect`.
- **Aladin keeps ONE single listener per event**: `aladin.on(e, fn)` replaces the previous one
  (`callbacksByEventName[g]=Q` in `dist/aladin.js`). That is why the layers subscribe with `ctx.on`
  (`eventos.ts`), which registers one dispatcher per event. Never call `aladin.on` from a layer.
- `planos.ts` (plane ↔ band ↔ λ, `ponerPlano`), `LambdaSlider.tsx` (λ slider),
  `propagacion.ts` (proper motion, linear, no parallax, in Julian years: J2000 = 2000.0,
  Gaia DR3 = 2016.0).
- For a layer to be switchable off, give it a name: it appears in Aladin's layer control.
- **CDS down on Nov 14, 2026:** `simbad.cds.unistra.fr` and `vizier.cds.unistra.fr` returned 404 without
  CORS (which is why `A.catalogFromSimbad`, which calls `simbad.cds.unistra.fr/cone`, does not work that day). The
  Harvard mirrors do respond with CORS: `vizier.cfa.harvard.edu/viz-bin/asu-tsv` (Gaia) and
  `simbad.cfa.harvard.edu/simbad/sim-tap/sync` (SIMBAD, slow: 2–18 s). The layers try both.
- Gaia in dense fields: with a cap of 2000 stars Barnard's map was covered up; the 300
  brightest are used.
- The console error `ERR_BLOCKED_BY_CLIENT` / «Failed to fetch» from `tg.log` is Aladin's usage
  log: harmless.

---

## 3. The blink panel

This one you do have to write. It is simple and it is what gets judged.

**Do not use `<img>` elements that get replaced.** It flickers badly and the loading jump is visible. Use a `<canvas>`:
preload all the frames into `Image` or `OffscreenCanvas`, and draw the current one with
`requestAnimationFrame`.

Minimum controls, in order of importance:

| Control | Why | Useful range |
|---|---|---|
| **Play / pause** | Obvious and necessary | |
| **Speed (fps)** | WiseView shows it is decisive. Slow shows motion, fast shows variability | 0.5 – 10 fps |
| **Step by step** | To confirm what one thinks one sees | ← → |
| **Stretch** | **Without this nothing is seen.** Section 4 | asinh by default |
| **Color map** | Gray to detect, color to present | gray, viridis, magma |
| **Band** | The axis only SPHEREx gives | 1–6 |
| **Field of view** | Explicit bullet of the challenge | 0.02° – 0.5° |
| **Mode** | raw / zodi subtracted / difference | |

On each frame, overlaid: **date and wavelength**. λ is not decoration: it explains why
the brightness changes between frames (see skill `spherex-datos`) and shows the jury that the team
understands the instrument.

---

## 4. Stretch: why an astronomical image can't be seen

A sky image has an enormous dynamic range and most pixels are background.
Mapped linearly to 0–255 it looks **black with three white dots**. This surprises every
web developer the first time.

What to apply, in order:

1. **Clipping by percentiles**, not by minimum and maximum. A single hot pixel ruins the scale.
   `vmin, vmax = percentil(1), percentil(99.5)` is a reasonable starting point.
2. **A non-linear function**: `asinh` is the best default for astronomical imaging (it keeps
   the faint detail without saturating the bright). `sqrt` and `log` also work; `linear` almost never.
3. **`zscale`** is DS9's classic algorithm for choosing the limits automatically. It is in
   `astropy.visualization.ZScaleInterval`. For a non-expert user it is usually the best option.

`astropy.visualization` has all of this solved: `ZScaleInterval`, `PercentileInterval`,
`AsinhStretch`, `ImageNormalize`. **Do not reimplement it.**

### The decision that matters: who stretches?

**The backend.** It returns already-rendered PNGs. Sending FITS to the browser forces you to write a
FITS reader in JavaScript, apply the stretch and the color map by hand: double the work and triple the
errors, in a hackathon.

The cost is that changing the stretch requires going back to the server. With cache it is cheap. If time is left,
a fine adjustment of brightness and contrast can be added on the client with CSS filters over the
PNG, which covers 80 % of use.

### The key to making the blink legible

**All frames of a sequence are normalized with the SAME `vmin`/`vmax`.** If each one is
stretched on its own, everything flickers and you can't tell real motion from a change of scale.
Compute the limits over the whole stack and apply them to each frame.

Exception: if λ varies a lot between epochs, the levels are physically different and the
common normalization can leave black frames. It is the project's central tension. Practical solution: group
by band first, and give the user a «common scale / per-frame scale» switch.

---

## 5. Image subtraction

Explicit bullet of the challenge and, in terms of value/effort, the best thing in the project.

- `diff_first` — each frame minus the first. What did not change goes to zero; what moved
  appears as a **pair of lobes, one positive and one negative**. Visually spectacular.
- `diff_prev` — each frame minus the previous. Useful for variability.

For the difference use a **diverging** color map centered on zero (blue-white-red), not a
sequential scale. The sign is the information.

Honest caveat: a correct subtraction requires the images to be well aligned and to have the same
PSF. We subtract crops reprojected onto a common grid; it is a **visual approximation**, not
differential photometry. Say so in the interface.

---

## 6. Gaia overlay: the quality control you can see

Draw on the image the positions that Gaia DR3 predicts for the stars at the date of that
epoch (catalog position + proper motion × elapsed time).

It serves two purposes:

1. **It fulfills a bullet of the challenge.**
2. **It proves the viewer is correct.** If the markers land on the sources, the WCS, the
   dates and the crop are right. It is the visual answer to «how do I know this image is of the
   coordinate I asked for?».

In Aladin Lite it is done with a catalog layer. For the blink panel you have to project the
coordinates to pixels with the crop's WCS.

**Reference epoch:** Gaia DR3 gives positions at **2016.0**, not J2000; SIMBAD gives J2000. Propagate
from the epoch that corresponds to each catalog. With proper motions of several ″/year, an epoch
error moves the mark by tens of arcseconds: in 2026, WISE 0855 is at 212″ and Barnard at 270″ from
their J2000 position.

---

## 7. The URL is part of the product

The challenge asks for it and it is half an hour of work:

```
/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
/?target=WISE+0855&size=0.2
```

- `target` takes priority over `ra`/`dec`.
- **The URL is updated with the current state** (`history.replaceState`), so that copying the address
  bar is sharing exactly what is being seen.
- A visible «copy link» button.

This is what turned WiseView into infrastructure for other projects: third parties built
packages on top of its API. A shareable viewer stops being a demo.

---

## 8. The first thing the user sees

The challenge's target audience is **anyone**, not an astronomer.

- **A preloaded example on opening.** Nobody should see an empty box. Have WISE 0855 already
  blinking when the page loads.
- **Buttons for the five test fields.** One click, immediate result, warm cache.
- **Accept names, not just numbers.** «Barnard's Star» has to work.
- **Accept sexagesimal and degrees.** See skill `coordenadas-astro`.
- **A useful empty state.** If there is no data: say how many epochs there are (zero), why that may be, and
  offer a nearby field that does have some. The jury will type random coordinates.
- **Honest loading state.** «Requesting 14 epochs from IRSA… 6 ready». Never a mute spinner: cutouts
  take time.
