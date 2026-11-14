<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/09_EDA_HALLAZGOS.md) · [中文](../../zh/docs/09_EDA_HALLAZGOS.md) · [Deutsch](../../de/docs/09_EDA_HALLAZGOS.md) · [Italiano](../../it/docs/09_EDA_HALLAZGOS.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/09_EDA_HALLAZGOS.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 09 — EDA: what the real data say (Nov 14, 2026)

Answers, with IRSA data, to the hour 1 checklist ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §9).
Every figure comes from a file in [`../eda/resultados/`](../../../eda/resultados/) or from a figure in
[`../eda/figuras/`](../../../eda/figuras/); the scripts that generate them are in [`../eda/`](../eda/README.md)
and can be run again.

---

## Summary in ten lines

1. **There is plenty of data.** Between 258 and 2,514 files per test field, 3–4 sweeps of the sky,
   **1.0 to 1.4 years of time baseline**. You must query **DR1 and QR3**: no files are repeated and
   QR3 brings the most recent sweep (except WISE 0855, which does not have QR3 yet).
2. **The motion is 1–2 pixels over the whole period**, not a jump. Pixel scale 6.15″
   (confirmed in SIA2), PSF of 7.5–8.7″. Barnard: 1.8 px; WISE 0855: 1.3 px; eps Ind B: 1.1 px.
3. **The motion can be measured, in stars that do not saturate.** In eps Ind B the centroid shifts
   −0.85 / −0.71 px (west / north) between 2025.31 and 2026.74; SIMBAD predicts −0.92 / −0.57 px. The
   bright stars (Barnard, RW Aur) **saturate**: their core comes flagged as bad and the subtraction
   shows a red/blue pair **even if they do not move** (RW Aur). For them only the qualitative holds.
4. **The object's λ changes across the whole width of the detector between files** (~16 band widths
   within one detector). A blink that does not match it mixes 16 different «colors».
5. **But matching it is easy:** in each field and detector there are dozens of pairs of epochs with the same
   λ (within half a band width). With «matched λ» selection the dispersion drops from 0.47 µm to
   0.005–0.04 µm.
6. **The λ is computed without downloading the file:** the `WCS-WAVE` table is fixed per detector and the
   IMAGE header is downloaded with an HTTP Range request (~35 KB). ~1,900 files in ~2.5 minutes.
7. **The orientation rotates ~180° between sweeps.** You must **reproject to a common grid** (north
   up) before blinking or subtracting. Without this, the subtraction compares different pieces of sky.
8. **A cutout takes 7 s median (p90 11 s, maximum 29 s) and weighs ~3.9 MB whatever its size**:
   almost all of it is the PSF extension, which comes whole. There were transient 503 errors. **Without a cache
   there is no demo.**
9. **IRSA does not respond with CORS**: the browser cannot request anything from it directly. **Everything goes through the
   backend**, SIA2 included.
10. **The DR1 cube has two versions.** The one SIA2 delivers (`spherex_dr1_cube`) is FITS of
    ~320 MB per tile that the cutout service rejects. **The HiPS version does load in Aladin**
    (`irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`: PNG tiles, 102 planes, open
    CORS), and it is already in the deployed viewer. They are PNGs for visualization: they give no fluxes for a spectrum.
    *Correction of Nov 14 in the afternoon: the first version of this document said the cube was not
    useful for Aladin, because only the SIA2 version had been tested.*

---

## 1. Inventory per field

Source: `eda/resultados/inventario.json`, SIA2 search with radius 0.01° at the position propagated
to 2025-11 (MJD 61000).

| Field | DR1 | DR1 deep | QR3 | QR3 deep | Pointings | Sweeps | First → last | Baseline |
|---|---|---|---|---|---|---|---|---|
| WISE 0855 | 258 | 0 | 0 | 0 | 129 | 3 | 2025.34 → 2026.37 | 1.02 a |
| Barnard | 240 | 0 | 124 | 0 | 185 | 3 | 2025.62 → 2026.73 | 1.10 a |
| eps Ind B | 347 | 0 | 120 | 0 | 245 | 4 | 2025.31 → 2026.75 | 1.44 a |
| RW Aur | 226 | 0 | 110 | 0 | 168 | 3 | 2025.67 → 2026.71 | 1.04 a |
| R Dra | 422 | 1,233 | 126 | 733 | 1,273 | continuous | 2025.31 → 2026.74 | 1.42 a |

What you need to know about this table:

- **Each pointing gives 2 files**, one short-wave and one long-wave, always in pairs
  **D1+D4, D2+D5, D3+D6** (the dichroic splits the light; the same piece of sky falls on both).
- **A sweep is not an epoch**: it lasts 1 to 6 weeks and brings 7–20 visits and ~50–60 pointings,
  each at another λ. For the video the natural unit is the **sweep** (3–4 frames), or the
  visit if you want more frames at the cost of mixing λ.
- **R Dra is in a deep field** (near the north ecliptic pole): almost
  continuous observation. It is the field for testing light curves, not the typical one.
- All the queried files have `L2DQAFLG = Pass` (level 2 quality control).

## 2. The wavelength (the linear variable filter)

Sources: `eda/resultados/lambda_resumen.json`, `lambda_por_archivo.csv`, figure `01_lambda_vs_tiempo.png`.

- Within one detector, the object's λ spans **the whole** detector range across
  the files: ~16 band widths. Example WISE 0855, D5: from 3.82 to 4.41 µm.
- In each sweep SPHEREx passes the object through the filter again, so **each λ repeats every
  ~6 months**. Pairs of epochs separated by more than 0.4 years with the same λ: between 18 and 196 per
  field and detector.
- Validation: the own interpolation of `WCS-WAVE` matches astropy's (`WAVE-TAB`) on the
  6 detectors to the fourth decimal.

Direct comparison on WISE 0855, D5 (figures `02_wise_0855_*.png`):

| Selection | λ of the 4 frames (µm) | Dispersion |
|---|---|---|
| Naive (first file of each sweep) | 4.295 · 3.821 · 4.047 · 3.835 | **0.474 µm** |
| At matched λ | 4.145 · 4.153 · 4.153 · 4.180 | **0.035 µm** |

## 3. Geometry: orientation and alignment

Measured on the 25 cutouts of `size=0.1` (59×59 px):

- Detector position angle: alternates between ~−160° and ~+19° (WISE 0855), ~−179° and ~+1°
  (Barnard), ~−28° and ~+154° (eps Ind B). Near the pole (R Dra), arbitrary angles.
- The cutout size varies by ±1 px between files (58 or 59).

**Consequence:** the backend reprojects each cutout to a common TAN grid, north up, at the
native scale (`reproject_interp` from the `reproject` library). Implemented in
`eda/03_recortes_y_figuras.py` (`grilla_comun`, `panel`).

## 4. What is seen in each field

Figures `eda/figuras/02_*.png`. 0.1° cutouts, `IMAGE − ZODI`, reprojected, asinh stretch.
The orange circle is the position propagated with the SIMBAD proper motion to the date of each file.

| Field | Band | Is the object seen? | Is the change seen? |
|---|---|---|---|
| Barnard | D2 (1.5 µm) | Yes, **saturated**: 30–44 of the 49 core pixels flagged as bad | Red pair above / blue below (toward the north, like its motion), but not measurable: the centroid does not exist with the core masked |
| eps Ind B | D5 (3.86 µm) | Yes, unsaturated | **Yes, and measured**: −0.85 / −0.71 px against −0.92 / −0.57 px predicted (see below) |
| RW Aur | D3 (1.94 µm) | Yes, saturated (6–8 bad pixels in the core) | **Red/blue pair even though it does not move**: it is the effect of saturation and the mask, not motion |
| R Dra | D4 | Yes | Brightness still to be measured |
| WISE 0855 | D5 and D6 | **Barely** in single exposures | Not in a single exposure |

**WISE 0855 is a mandatory case (the organization's test object) and is always shown, but in single exposures it looks faint**: it is too faint
per exposure. To see it you would have to add up the exposures of each sweep (the challenge bullet
«add together all the data taken by each of the six detector arrays»).

### Centroids: is the measured shift the one SIMBAD predicts?

Source: `eda/resultados/centroides.json` (`eda/05_centroides.py`). First and last epoch at matched λ,
reprojected to the same grid; bad pixels excluded. Positive x = west, positive y = north.

| Field | Measured (px) | Predicted (px) | Field stars (median, px) | Bad pixels in the core |
|---|---|---|---|---|
| eps Ind B | −0.85 / −0.71 | −0.92 / −0.57 | +0.05 / −0.37 (3 stars) | 1 and 0 of 49 |
| RW Aur | +0.73 / +1.22 | 0 / 0 | −0.01 / +0.07 (5 stars) | 6 and 8 of 49 |
| Barnard | cannot be done (empty core) | +0.14 / +1.81 | −0.14 / +0.04 (8 stars) | 44 and 44 of 49 |

Reading:

- **The alignment works:** the field stars shift by one or two tenths of a pixel (up to
  0.37 px in eps Ind B, with only 3 stars).
- **eps Ind B moves as much as it should**, within ~0.15 px on each axis. It is the quantitative proof
  that matched λ + reprojection + subtraction show real motion.
- **Saturated stars deceive.** The core of Barnard and of RW Aur comes flagged as bad
  (OVERFLOW, TRANSIENT, SUR_ERROR). Excluding it, what remains is an asymmetric ring and the
  centroid shifts: RW Aur «moves» 1.4 px without moving. In the subtraction the same red/blue pair appears
  that an object that does move leaves. **The viewer has to warn when the object saturates.**

## 5. Quality mask (`FLAGS`)

The bit names **come in the `FLAGS` header itself** (cards `MSKNnnnn` name,
`MSKMnnnn` mask, `MSKDnnnn` description): there is no need to look up table 16 of the supplement.

Frequency in the 25 cutouts:

| Bit | Name | % of pixels | Does it invalidate the pixel? |
|---|---|---|---|
| 21 | SOURCE | **72.4%** | **No**: it marks that there is a known source. It is what we want to see |
| 28 | HALO | 2.1% | Debatable: transient halo around bright sources |
| 0 | TRANSIENT | 1.6% | Yes |
| 2 | SUR_ERROR | 1.3% | Yes |
| 26 | BLOOM | 0.8% | Debatable |
| 19 | OUTLIER | 0.7% | Yes |
| 6 | NONFUNC | 0.4% | Yes |
| 17 | PERSIST | 0.3% | Yes |
| 1 | OVERFLOW | 0.2% | Yes |
| 11 | COLD | 0.1% | Yes |

**Trap:** `FLAGS != 0` marks 72% of the cutout because of SOURCE. A bitwise mask must be used. The one
the EDA uses (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`) masks ~4% of the
pixels, but when reprojecting with bilinear interpolation the NaNs grow and on screen they look
like white blocks (~15%). For the viewer it is better to **reproject the mask by nearest
neighbor and fill in** the bad pixels, and to show the mask as an optional layer.

## 6. Infrastructure

Source: `eda/resultados/infraestructura.json`, `latencia_cutouts.json`.

| Question | Answer | Consequence |
|---|---|---|
| Does IRSA respond with CORS? | **No** (neither SIA2 nor files) | Everything goes through our backend |
| SIA2 query | 1–3.5 s per collection | Can be done live, 4 collections in parallel |
| Header by HTTP Range | ~2 s, 35 KB; ~0.1 s effective with 6 in parallel | Metadata and λ of hundreds of files in seconds |
| Cutout `size=0.1` | Median 7.3 s, p90 10.8 s, max 29 s; ~3.9 MB; 25 in 52 s with 4 threads | Disk cache mandatory; pre-warm the demo fields |
| Is a smaller cutout faster? | No: 0.02° weighs the same (the PSF comes whole) | Always request 0.1°; more does not cost |
| Errors | Transient 503s; one persisted through 4 retries | Retries with waiting and an error state in the UI |
| DR1 cube via SIA2 (`spherex_dr1_cube`) | FITS 512×512×102, ~320 MB per tile, 12.9″ pixel; the cutout answered 422 «lacks WCS» (and 503 in a second test) | Not useful for cutouts or for on-the-fly spectra |
| **DR1 cube in HiPS** (`/data/hips/SPHEREx/spherex_allsky_cube`) | `properties` answers 200 with `Access-Control-Allow-Origin: *`; PNG, order 5, 102 planes (50 and 51 empty), 12.9″ pixel, published on Nov 1, 2026 | **Loads in Aladin** (the deployed viewer uses it). It is a mosaic of all epochs: no time axis, and in PNG, no fluxes |
| SPHEREx HiPS at the CDS | The MocServer lists `CDS/P/SPHEREx/QR2/D1`…`D6` (QR2, order 7); `alasky` returned 404 on Nov 14 even for DSS | Plan B if IRSA's fails; not verified |

## 7. What was not checked

- Brightness: no photometry was measured in any field (variability of RW Aur and R Dra not measured).
- Whether the CDS HiPS loads in Aladin Lite (server down at the time of the test). No longer needed: IRSA's loads.
- The `_deep` collections were not used in the λ analysis (only DR1 and QR3).
- How to measure the position of a saturated star (PSF fit to the wings, or use a detector where it does not saturate).
- Adding exposures of a sweep to see WISE 0855.
- The R Dra subtraction was not reviewed in detail. The centroids were measured only on the first and last epoch.
