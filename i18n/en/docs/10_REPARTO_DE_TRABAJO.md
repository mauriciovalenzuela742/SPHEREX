<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/10_REPARTO_DE_TRABAJO.md) · [中文](../../zh/docs/10_REPARTO_DE_TRABAJO.md) · [Deutsch](../../de/docs/10_REPARTO_DE_TRABAJO.md) · [Italiano](../../it/docs/10_REPARTO_DE_TRABAJO.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/10_REPARTO_DE_TRABAJO.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 10 — What each person gets after the EDA

The split is set by the team plan: [`README.md`](../README.md) §3 and [`05_PLAN_24H.md`](05_PLAN_24H.md)
(D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera). This document **does not
re-split**: it brings down to each role what the EDA ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)) showed
with real data, with concrete tasks and how to check them.

---

## What the EDA changes in the plan

| The plan assumed | The EDA showed | Who it affects |
|---|---|---|
| Path A: Aladin loads the IRSA DR1 HiPS cube | **It does load** (`/data/hips/SPHEREx/spherex_allsky_cube`, open CORS; already in the deployed viewer). But it is a mosaic of all epochs in PNG, at 12.9″/px: it serves as context and for the 102 bands, not for time nor for measuring fluxes. The FITS version that SIA2 delivers is no use for crops | **V2** |
| Verify CORS in hour 1 | **IRSA does not respond with CORS** (neither SIA2 nor files): everything goes through the backend. CDS does | D1, V2 |
| Measuring a cutout decides Vercel Functions or container | **7.3 s median, 10.8 s p90, 29 s maximum**, ~3.9 MB, 503 errors at times | **C** (decides), D1 |
| Group by band | In addition you have to **match λ** between epochs: within a detector it varies ~16 band widths | D1, **D2** |
| Reproject to a common grid | Confirmed and indispensable: the detector **rotates ~180° between sweeps** | **D2** |
| `flagged_fraction` for «Contamination» | `FLAGS != 0` marks 72 % of the crop (SOURCE bit, which is not an error); the bad pixels are ~4 % | **D2**, C, V1 |
| WISE 0855 is the main demo | WISE 0855 is a mandatory case and is always shown, saying that in a single exposure it looks faint (its motion is seen with the subtraction and with the per-sweep sum). **eps Ind B** is where the measured motion is seen most clearly; Barnard is seen but saturates | C, N |
| The motion is seen in the blink | It is **1–2 px over the whole period**: the subtraction (`diff_first`) is the view that shows it | D2, V1, N |

## The data flow, end to end

```
 coordenada ─► [1 Buscar] ─► [2 Elegir épocas] ─► [3 Recortar + caché] ─► [4 Filtros y alineación]
               D1            D2 (λ igualada)       D1                      D2
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ▼
 [5 Restas y sumas] ─► [6 Imagen PNG] ─► API ─► [7 Visor]
   D2                    D2                      V1 blink y controles · V2 cielo, Gaia, espectro
```

**C (Mauricio)** verifies the whole path and decides the deployment; **N (Javiera)** tells the story.

---

## D1 · Vladimir — data access (boxes 1 and 3)

Base: `eda/01_inventario.py`, `eda/espectral.py` (`cabecera_imagen`, `pedir`).

- SIA2 to `spherex_dr1` and `spherex_qr3` **in parallel** (1–3.5 s each). No files repeat between
  the two; QR3 carries the most recent sweep.
- Search with the **position propagated** by proper motion: with the statement's coordinate,
  WISE 0855 falls outside a small field.
- Cheap metadata: the IMAGE header is downloaded with an **HTTP Range request of ~35 KB** (date, WCS,
  detector). With 6 in parallel, ~0.1 s effective per file.
- 0.1° cutouts with retries and waiting (there were 503s that lasted 4 retries); 4 in parallel at
  most. A smaller cutout is **not** faster: the PSF comes whole.
- Cache by `(obs_id, detector, rounded center, size)` and precomputation of the 5 fields.
- **Done when:** the 5 fields are served from cache without internet.

## D2 · Bryan — frames: filters, alignment and subtractions (boxes 2, 4, 5 and 6)

Base: `eda/02_longitud_de_onda.py`, `eda/03_recortes_y_figuras.py` (`elegir_lambda_igualada`,
`grilla_comun`, `BITS_MALOS`) and `eda/05_centroides.py`.

**What goes in:** D1's list of files. **What comes out:** aligned frames + mask + subtractions,
with `wavelength_um` and `flagged_fraction` per frame.

### Tasks, in order

1. **Choose epochs at matched λ.** One file per sweep, minimizing the λ dispersion at the object
   (λ from the `WCS-WAVE` table, which is fixed per detector). On WISE 0855 D5 goes down from 0.47 µm to 0.035 µm.
2. **Mask by bits.** The EDA invalidates `TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, MISSING_DATA, HOT,
   COLD, NONLINEAR, PERSIST, OUTLIER`. Doubts: `HALO` (2.1 %) and `BLOOM` (0.8 %). **Never** `FLAGS != 0`.
   The bit names come in the FLAGS header (`MSKN`/`MSKM`/`MSKD`).
3. **Reprojection without enlarging the mask.** Filled image and mask separately (nearest
   neighbor for the mask): with bilinear interpolation each bad pixel contaminates its neighbors and the
   holes grow visibly.
4. **`IMAGE − ZODI`** and normalization between epochs (today median and standard deviation; try scaling
   by the flux of field stars).
5. **`diff_first` and `diff_prev`**, diverging map centered at 0 and same range for all.
6. **Per-sweep sum** with `1/VARIANCE` weights (co-add): it is what would make WISE 0855 visible.
7. **Saturation.** Barnard and RW Aur saturate: the core comes masked (Barnard 44 of 49 pixels) and
   the subtraction leaves a red/blue pair **even though the star does not move** (RW Aur). Expose a saturation
   indicator for V1 to show.

### How to check it

| Test | Must pass |
|---|---|
| eps Ind B, D5, centroid last − first | −0.92 / −0.57 px (west / north) ± 0.2 px; the EDA measured −0.85 / −0.71 |
| Non-saturated field stars | Median displacement < 0.2 px |
| Barnard, D2, subtraction | Pair with the positive toward the **north** (qualitative: it saturates) |
| RW Aur, D3 | Marked as saturated; if not, the subtraction misleads |
| `flagged_fraction` | ~4 % of the crop, not ~72 % |

## V1 · Antonia — blink viewer

Review of the mockup against the data, point by point: [`diseno/REVISION_MAQUETA_V1.md`](diseno/REVISION_MAQUETA_V1.md).


- The **subtraction** is the view that shows the motion: the blink alone of 1–2 px is barely noticeable. Zoom
  is needed (the EDA used 18×18 px crops enlarged).
- Always show the **date and λ** of each frame: they explain why the brightness changes.
- Warn when the object saturates and show the mask as an optional layer.
- Waiting states: a cold frame can take 7–29 s.

## V2 · Juan Pablo — sky viewer

> **Done in PR #6 (merged Nov 14):** λ slider over the 102 planes (without 50 and 51), object mark
> and crop box propagated to 2026, propagated Gaia DR3 layer (cap of 300 stars) and SIMBAD
> layer with a label on hover and a click that picks the position. **Done on the `v/v2-catwise` branch, PR pending:** CatWISE2020 layer, which marks WISE 0855 at 2.6″ from the position propagated from SIMBAD (according to V2). **Missing:** band chart (with D2), click →
> cropped animation, Spherix.

- **The IRSA HiPS cube loads in Aladin** and Mauricio already got it working in `scaffold/frontend/src/sky/AladinView.tsx`
  (Aladin Lite 3.8.2, one plane per band). It is a mosaic of all epochs, at 12.9″/px: context and
  102 bands, not time. The CDS HiPS (QR2) stays as plan B.
- For the **band chart** the cube is no use (they are stretched PNGs, without fluxes); the spectrum comes from
  the level 2 files (the λ of each one is already computed in D2) or from IRSA's Spectrophotometry Tool.
- Gaia overlay propagated to the epoch: the EDA already propagates with proper motion (`eda/comun.py`,
  `posicion_en`), and it matches what was measured in eps Ind B.

## C · Mauricio — science, verification and deployment

- **Data to decide where `/api` runs:** cutouts of 7.3 s median and 29 s maximum, 503 at times.
- Correct in `data/campos_de_prueba.yml` the pixel scale: **6.15″** (from SIA2), it was 6.2 derived.
- **`scaffold/frontend/src/content/campos.ts` has J2000 coordinates**, even though its comment says
  «propagated». In 2026, WISE 0855 is at 212″ and Barnard at 270″ from those coordinates: with 0.1° crops
  (half side 180″) they fall **outside the crop**. Use propagated positions (the `/api/presets` of
  Bryan's branch already delivers them).
- Demo: the five test objects must work. WISE 0855 is always shown (with the subtraction, and with D2's per-sweep sum when it exists, plus V2's CatWISE2020 overlay, done on the `v/v2-catwise` branch and PR pending; we say that in a single exposure it looks faint); eps Ind B is where the motion is seen most clearly; Barnard is seen but saturates.
- D2's tests above are the acceptance ones.

## N · Javiera — narrative

- The honest message: «the fastest stars move 1–2 pixels in a SPHEREx year; we
  make it visible by matching the color, aligning and subtracting».
- Material ready: the presentation `docs/presentacion_eda/` and the figure `eda/figuras/01_lambda_vs_tiempo.png`.

---

## SpacePixels as independent verification (for D2 and C)

[SpacePixels](https://github.com/ppissias/SpacePixels) (BSD-2, Java 21, desktop) detects
moving objects in **already-aligned FITS sequences**, with blink, subtraction and «shift-and-stack».
Only its README was read; **its code was not reviewed nor was it tested**.

- It is not integrated into the viewer (desktop Java).
- It serves to check the alignment: exporting the aligned frames as FITS with WCS, it should
  flag eps Ind B as a mover and the field stars as fixed.
- Its «shift-and-stack» is the idea for adding up WISE 0855 following its proper motion.
- Installing it means downloading third-party software: agree on it as a team.
