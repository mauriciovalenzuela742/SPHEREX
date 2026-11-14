<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/02_DATOS_SPHEREX.md) · [中文](../../zh/docs/02_DATOS_SPHEREX.md) · [Deutsch](../../de/docs/02_DATOS_SPHEREX.md) · [Italiano](../../it/docs/02_DATOS_SPHEREX.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/02_DATOS_SPHEREX.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 02 — SPHEREx data: where it is and how to request it

Technical sheet. Everything here is taken from the official IRSA/IPAC documentation consulted on
**November 14, 2026**, except what is marked `[RAZONAMIENTO]`, which is our own deduction and must be
checked against the data.

Main sources:

- Mission page: <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- Access guide: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access>
- Products guide: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products>
- Cutouts: <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html> and <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- Notebooks: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

---

## 1. The mission in numbers

| Item | Value |
|---|---|
| Planned lifetime | 2025 – 2027 |
| Coverage | 100% of the sky, one full sweep every ~6 months |
| Range | 0.75 – 5.0 µm (near infrared) |
| Spectral channels | 102 |
| Detectors | 6 arrays (3 short-wave, 3 long-wave, separated by a dichroic) |
| Instrument | Imaging spectrograph with a wide-field **linear variable filter (LVF)** |

Spectral resolution per band (this defines which detector is good for what):

| Band / detector | Wavelength | R |
|---|---|---|
| 1 | 0.75 – 1.09 µm | 39 |
| 2 | 1.10 – 1.62 µm | 41 |
| 3 | 1.63 – 2.41 µm | 41 |
| 4 | 2.42 – 3.82 µm | 35 |
| 5 | 3.83 – 4.41 µm | 112 |
| 6 | 4.42 – 5.00 µm | 128 |

---

## 2. The detail that decides the project: how SPHEREx obtains spectra

SPHEREx has no discrete filters. It has a **linear variable filter**: the wavelength
changes continuously along one axis of the detector. In the words of the IRSA documentation:

> SPHEREx obtains spectra through multiple exposures, placing a given source at multiple positions
> in the field of view, where it is measured at multiple wavelengths by repointing the spacecraft.

That is: **the spectrum of a source is built by observing it many times, each time in a
different part of the detector, and therefore each time at a different wavelength.**

`[RAZONAMIENTO]` The consequence for this challenge is large and should be clear from
hour 0. If you take all the level 2 images that cover a position in the sky, crop them and
play them in sequence, **you do not get a clean blink: you get a sequence where the brightness of each
source jumps because each frame is at another wavelength.** A red star will appear
bright in some frames and faint in others without having changed. That ruins precisely what
the challenge wants to show: what moves and what truly varies.

The three possible ways out, in order of cost:

1. **Group by band/detector before doing the blink.** Each frame of the video is the same
   band (e.g. detector 4) at different epochs. Within a band the wavelength still
   varies, but much less. It is the literal reading of the challenge bullet: *«it may make sense to
   separately add together all the data taken by each of the six detector arrays»*.
2. **Group by wavelength using the `WCS-WAVE` extension**, which gives the central λ at each
   pixel. More correct and more expensive.
3. **Normalize each frame** (robust percentiles over the same cutout) so that the level jump
   does not dominate. It is a visual patch, not a physical solution, but in 24 hours it may be what
   saves the demo.

> **Checked on Nov 14 ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) §2):** grouping only by detector
> does **not** match the λ (within a detector it varies ~16 band widths). Epochs have to be chosen at
> matched λ; it is cheap because the λ comes from `WCS-WAVE` with an HTTP Range request of ~35 KB.

**This had to be checked with real data in hour 1 of the event**, not discussed. Download the
cutouts of the same field, read `WCS-WAVE` from each one and see how much λ varies between epochs.

---

## 3. Which versions of the data exist today

Release chronology according to the IRSA mission page:

| Date | What was released |
|---|---|
| July 2025 | First Quick Release products (QR1) |
| October 2025 | QR2 (reprocessed) |
| April 10, 2026 | Fix for an error in the header of the QR2 PSF extension |
| September 2026 | QR3 |
| **November 2026** | **Data Release 1 (DR1)** |

**DR1 and QR3 together replace QR2.** QR2 can still be downloaded directly until February 2027,
but it is no longer searchable via SIA2.

> **DR1 has just been released, this very month.** It is very likely that no other team has used it and
> almost certain that the tutorials and examples circulating on the internet still point to QR2.
> This is at once the biggest opportunity and the biggest risk of the project. See [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 4. The four access paths

IRSA serves the data from two places: at IPAC ("on-premises") and on AWS S3. There are four access layers.

### 4.1 Browsable directories

Root: <https://irsa.ipac.caltech.edu/ibe/data/spherex/>

One subdirectory per release: `dr1`, `qr3`, `qr2`. The level 2 MEFs live in:

```
level2/[Planning Period]/l2b-v[Version]-[Processing Date]/[Detector]/
```

The all-sky cube (DR1 only):

```
hips5_cube/hips_20261026/Norder5/Dir[Directory Number]/
```

Useful for bulk `wget`/`curl` and for understanding the organization. **Not useful for searching by
coordinate**: that is what SIA2 is for.

### 4.2 SIA2 (Simple Image Access v2, IVOA standard) — the main path

Generic endpoint:

```
https://irsa.ipac.caltech.edu/SIA?
```

`COLLECTION` must be added. The five SPHEREx collections:

| COLLECTION | What it contains |
|---|---|
| `spherex_dr1` | DR1 spectral image MEF, **wide** sweep (uniform coverage of the whole sky) |
| `spherex_dr1_deep` | DR1 MEF of the **deep** fields |
| `spherex_dr1_cube` | DR1 all-sky cube |
| `spherex_qr3` | QR3 MEF, wide sweep |
| `spherex_qr3_deep` | QR3 MEF, deep fields |

**To search for all the current spectral images at a position you must query
`spherex_dr1` and `spherex_qr3`** (and the `_deep` ones if you want the deep fields). QR2 is not searchable.

Example verified in the IRSA documentation:

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIUS` in degrees. Response formats: `HTML` for looking by eye, VOTable by default
for processing.

The table it returns includes, among others, two columns that matter to us:

- `access_url` — download URL of the file at IPAC. **It is the one used to request a cutout.**
- `cloud_access` — information for reading the same file from AWS S3.

Two warnings from the official documentation:

- The **calibration** files are **not in SIA2**; they are downloaded from the browsable directories.
- The data is ingested **weekly**, and availability via SIA2 **lags by one day**
  relative to the directories, the Data Explorer and some TAP queries.

### 4.3 Cutouts — what really makes the viewer viable

A full MEF weighs **about 70 MB**. Downloading 15 full epochs to show a 0.1° crop is
unviable at a hackathon and in a public tool.

The cutout service is invoked by **adding parameters to the file URL**:

```bash
curl -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in decimal degrees.
- `size` in degrees.
- Full parameters: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

Important limitation: **cutouts only work on files hosted at IPAC**, not on
the AWS copy.

The cropped MEF keeps the same extensions. `IMAGE`, `FLAGS`, `VARIANCE` and `ZODI` are cropped;
`WCS-WAVE` is adjusted to the crop; **the PSF extension comes unmodified**, with the PSF of the
entire original image.

### 4.4 Python

```bash
pip install pyvo astroquery astropy
```

`pyvo` and `astroquery` wrap SIA2. The official IRSA notebooks are the shortest path:

| Notebook | What it is for |
|---|---|
| Data Overview | Finding images that cover a position and understanding the MEF |
| Spectral Image Cutouts | Generating cutouts and packaging them into a new MEF |
| PSF Models | How the PSF is organized |
| Source Discovery Tool | Discovering and extracting sources |
| Mosaic Cube | Analyzing a cube from the Mosaic Tool |
| HiPS All-Sky Cube | Exploring the HiPS cube in Firefly and extracting a quick spectrum |

Index: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

There is also **`spxquery`** (v0.4.1), a third-party package on PyPI that automates querying, download
with cutout, aperture photometry with zodiacal light subtraction, combination into 3D cubes ("Drizzle3D")
and light curves: <https://spxquery.readthedocs.io>. It is the piece that most resembles what has to be
built on the data side. **It is worth looking at before writing anything**: even if it is not used, its
four-stage architecture and its quality control are a good map.

---

## 5. What is inside a file

The main product is the **level 2 Spectral Image MEF**. There are **6 per pointing** (one per
detector), ~70 MB each, images of **2040 × 2040** pixels.

| HDU | Name | Contents |
|---|---|---|
| 1 | `IMAGE` | Calibrated surface brightness in MJy/sr. **Zodiacal light is not subtracted** |
| 2 | `FLAGS` | Per-pixel bit map: status and processing. Table 16 of the Explanatory Supplement |
| 3 | `VARIANCE` | Brightness variance, in (MJy/sr)² |
| 4 | `ZODI` | Zodiacal light model, in MJy/sr. **You have to subtract it yourself if you want it** |
| 5 | `EPSF` (DR1/QR3) or `PSF` (QR2) | Effective PSFs per detector zone |
| 6 | `WCS-WAVE` | Table mapping pixel → central wavelength and bandwidth |

Notes that save hours:

- **`FLAGS` is the direct answer to the challenge bullet about «contamination flags».** Showing them
  in the interface is cheap and is exactly what the challenge author asked for.
- **Zodiacal light is not subtracted.** For a viewer, subtracting `ZODI` from `IMAGE` greatly improves the
  contrast of faint sources. It is one line of code and a selling point.
- **`WCS-WAVE` uses an uncommon part of the FITS standard** that, according to IRSA, «not
  all readers have implemented yet». If your FITS client does not recognize it: find the four nearest
  control points and interpolate bilinearly, with ~1 nm precision. **That precision is for visualization.**
  For science you must use the `CWAVE` and `CBAND` extensions of the Spectral WCS calibration product.
- **Pixel convention.** FITS headers are 1-based; Astropy returns 0-based. IRSA warns about it
  explicitly for PSF handling. It is a classic source of one-pixel shifts.
- **Not all observations come with all 6 bands**: quality is evaluated per band and some
  do not reach the archive. The code has to tolerate missing bands.

### File names

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

Example: `level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits`

Breaking it down:

- `2025W18_2B` — **planning period**: the flight plan uploaded to the spacecraft, covering ~3.5 days of operation.
- `0001` — *large slew* counter.
- `1` — *small slew* counter (1 to 4; some large slews come with fewer than 4).
- `D1` — detector 1.
- `v12-2025-164` — version and processing date (year + day of year).

`[RAZONAMIENTO]` The *observation ID* is what orders the video in time. It is better not to trust the
name and to read the date from the header, but for quick ordering it works.

### The all-sky cube (DR1 only)

DR1 comes with an **All-Sky Cube**: all-sky mosaics interpolated spatially and spectrally, one
for each of the 102 channels. It exists in **two versions** (checked on Nov 14, see
[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)):

1. **The one SIA2 delivers** (`COLLECTION=spherex_dr1_cube`, directory `hips5_cube/hips_20261026/Norder5/`):
   FITS tiles of 512×512×102, ~320 MB each. The cutout service rejects them (422/503) and
   Aladin does not use them. It is not useful for the viewer.
2. **The HiPS for browsers**, at `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`:
   **PNG** tiles, order 5, 102 planes (50 and 51 come empty), 12.9″ pixel, open CORS.
   **This is the one Aladin Lite 3.8.2 loads** without a backend. It is a mosaic of all epochs (no time
   axis) and in already-stretched PNG (no fluxes).

That it can be shown in Aladin without a backend is the best technical news of the challenge for path A.
See [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md).

Be careful not to confuse the two products, because they answer different questions:

| | Level 2 images | All-sky cube |
|---|---|---|
| Axis it gives | **Time** (many epochs) | **Wavelength** (102 channels) |
| What it is for | The blink, detecting motion | Context and the 102 bands as an image (PNG without fluxes: **not** useful for the spectrum) |
| Resolution | Native to the detector | HEALPix order 5 (coarse) |
| Available in | DR1, QR3 (and QR2 downloadable) | **DR1 only** |

**The viewer the challenge asks for needs both.** Time comes from level 2; the 102 bands
as an image, from the cube. The spectrum (flux versus λ) comes from the level 2 files or from IRSA's
Spectrophotometry Tool, not from the cube ([`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md)).

---

## 6. IRSA tools that already exist

Before building something, check whether IRSA already did it. All of them are linked from the mission page.

| Tool | What it does | Why it matters to us |
|---|---|---|
| **SPHEREx Data Explorer** | Web interface for search, visualization and download | It is "the competitor". Look at it to see what NOT to do: it is designed for astronomers |
| **MOST** (Moving Object Search Tool) | Computes the orbit of a solar system object and finds the SPHEREx images that covered its predicted position at each epoch | Directly relevant for asteroids and comets. A "follow this asteroid" tab comes almost free |
| **Spectrophotometry Tool** | Extracts spectra from images by forced photometry | It is IRSA's answer to the challenge's «spectra on the fly» |
| **Mosaic Tool** | Custom multi-band mosaics | |
| **Cutout Tool** | MEF cutouts | Already described above |
| **Source Discovery Tool** | Identifies and characterizes sources in a region without needing prior positions | If you want to mark sources on the image |
| **Cloud Data Access** | The same data on AWS S3 | For heavy processing |
| **Comet 3I/ATLAS** | Dedicated collection of spectral images of the interstellar comet | Ready-made material for a demo with a hook |

`[RAZONAMIENTO]` The 3I/ATLAS collection deserves a minute of attention: it is an object that moves
fast, is recent, and the public knows it. For the 2-minute demo it is worth more than any brown
dwarf.

---

## 7. Data from other missions (the overlays)

The challenge suggests allowing overlays of data from other telescopes.

| Mission | Access | What it provides |
|---|---|---|
| **Gaia DR3** | <https://archive.stsci.edu/missions-and-data/gaia>, or `astroquery.gaia`, or the CDS HiPS catalog in Aladin | Very precise positions, proper motions and parallaxes. It lets you **predict where a star should be** at each epoch and check that the viewer gets it right |
| **WISE / NEOWISE** | IRSA; unWISE at <https://unwise.me> | The obvious comparison: the blink in WISE is what WiseView does |
| **NEOSSat** (CSA) | <https://data.asc-csa.gc.ca/dataset/neossat>, tutorial at <https://github.com/asc-csa/NEOSSAT_Tutorial> | It is a partner-agency resource. Using it adds to the *Global Connection* criterion |
| **SIMBAD / VizieR** (CDS) | <https://simbad.cds.unistra.fr> | Resolve names («Barnard's Star») to coordinates. **Necessary for the tool to be usable by anyone** |

`[RAZONAMIENTO]` Gaia is not just a visual ornament: it is the viewer's **quality control**. If you
draw on the image the position that Gaia predicts for the star at the date of that epoch and it
coincides with the bright point, it is demonstrated that the WCS, the dates and the cutout are right.
It is the cheapest way to prove to a jury that the tool is correct, and not just pretty.

---

## 8. Mandatory attribution

IRSA requires including this note in any published material that uses SPHEREx data:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**It goes in the footer of the tool and in the README.** It is a free point of polish with a NASA jury
and costs thirty seconds.

Canonical papers that IRSA asks to cite: Bock et al. (2026) for the mission, Akeson et al. (2026) for
the pipeline, Crill et al. (2025) for the sky simulator, Korngut et al. (2026) for instrument and
calibration. Details in [`../biblio/README.md`](../biblio/README.md).

---

## 9. Event hour 1 checklist

This is what must be checked with real data before deciding anything:

- [x] A SIA2 query to `spherex_dr1` over WISE 0855 returns rows. Note how many. **Yes: 258 files** (`docs/09` §1).
- [x] The same over `spherex_qr3`. Note how many and whether they overlap with the previous ones. **0 rows for WISE 0855; no files are repeated between the two** (`docs/09` §1).
- [x] How many distinct epochs are there for a typical field? This decides whether the "video" has 5 or 50 frames. **3-4 sweeps per area, baseline of 1.0-1.4 years** (`docs/09` §1).
- [x] A `size=0.1` cutout downloads in less than N seconds. Measure it. **Decides whether a cache or queue is needed.** *(Measured: median 7.3 s, p90 10.8 s, max 29 s, ~3.9 MB; a cache is needed; `docs/09` §6.)*
- [ ] Open the cropped MEF and confirm the 6 extensions. *(Not verified in the EDA.)*
- [x] Read `WCS-WAVE` from two different epochs of the same field. **How much does the λ change?** (section 2). **~16 band widths within a detector** (`docs/09` §2).
- [x] Does the DR1 HiPS cube load in Aladin Lite pointing at the IRSA directory? If so, there is a fast path. **Yes, the PNG HiPS at `/data/hips/SPHEREx/spherex_allsky_cube` (not the `ibe/` directory).**
- [x] Does IRSA respond with CORS to a request from the browser? If not, **everything goes through the backend**. **No: only the HiPS has CORS; SIA2 and cutouts go through the backend** (`docs/09` §6).

*Answered on Nov 14 in [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md). Only the 6-extensions box remains open.*
