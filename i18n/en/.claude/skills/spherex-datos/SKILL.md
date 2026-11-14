---
name: spherex-datos
description: How to request SPHEREx data from the IRSA/IPAC archive - SIA2 collections (spherex_dr1, spherex_qr3 and the deep and cube variants), the cutout service, the structure of the level 2 MEF and its six extensions (IMAGE, FLAGS, VARIANCE, ZODI, EPSF, WCS-WAVE), the six bands and their wavelengths, the DR1 all-sky HiPS cube, and the IRSA tools that already exist (Data Explorer, MOST, Cutout, Mosaic, Spectrophotometry, Source Discovery). Activate it when you need to query, download, crop, read or understand SPHEREx data; when IRSA, IPAC, SIA2, pyvo, astroquery, cutout, MEF, SPHEREx FITS, DR1, QR2, QR3, WCS-WAVE, zodiacal light, linear variable filter or LVF are mentioned; or when designing the backend that feeds the viewer.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../../es/.claude/skills/spherex-datos/SKILL.md) · [中文](../../../../zh/.claude/skills/spherex-datos/SKILL.md) · [Deutsch](../../../../de/.claude/skills/spherex-datos/SKILL.md) · [Italiano](../../../../it/.claude/skills/spherex-datos/SKILL.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/skills/spherex-datos/SKILL.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# SPHEREx data at IRSA

Operational reference. The long document, with sources, is `docs/02_DATOS_SPHEREX.md`;
this skill is what you need to write code without getting it wrong.

**Golden rule: if a path or a parameter is not in this skill or in the official IRSA
documentation, do not make it up.** Consult <https://caltech-ipac.github.io/spherex-archive-documentation/>.

---

## 1. The first thing to understand: the linear variable filter

SPHEREx has no discrete filters. The wavelength varies continuously along one axis
of the detector. The spectrum of a source is built by observing it many times, each time at a
different position in the field, and **therefore each time at a different wavelength**.

**Direct consequence:** two images of the same area of the sky taken at different epochs
normally **are not at the same wavelength**. A naive blink produces a sequence where
the brightness jumps without anything having moved.

So, in any code that builds a temporal sequence:

1. **Group by detector/band and choose the epochs at matched λ** before forming the sequence. Grouping by band is not enough: within a detector the object's λ spans ~16 band widths; with matched selection it drops from 0.47 to 0.035 µm (`eda/03_recortes_y_figuras.py`, `elegir_lambda_igualada`; `docs/09` §2). Then reproject to a common grid: the detector rotates ~180° between sweeps.
2. **Read `WCS-WAVE`** and expose the λ of each frame. It is not optional: it is the field that explains what
   the user is seeing.
3. **Normalize each frame** with robust percentiles over the same cutout.

---

## 2. The six bands

| Band = detector | λ | R |
|---|---|---|
| 1 | 0.75 – 1.09 µm | 39 |
| 2 | 1.10 – 1.62 µm | 41 |
| 3 | 1.63 – 2.41 µm | 41 |
| 4 | 2.42 – 3.82 µm | 35 |
| 5 | 3.83 – 4.41 µm | 112 |
| 6 | 4.42 – 5.00 µm | 128 |

One pointing generates **6 MEFs**, one per detector, but a given position falls on only 2 of them (pairs D1+D4, D2+D5 or D3+D6): a position query returns 2 files per pointing (`docs/09` §1). **Not all observations come with all 6**: quality
is evaluated per band. The code has to tolerate missing bands without failing.

For cold brown dwarfs and red objects, the long bands (4–6) are the interesting ones.

---

## 3. SIA2 collections

Generic endpoint:

```
https://irsa.ipac.caltech.edu/SIA?
```

| COLLECTION | What it is |
|---|---|
| `spherex_dr1` | DR1 spectral images, wide sweep |
| `spherex_dr1_deep` | DR1, deep fields |
| `spherex_dr1_cube` | DR1 all-sky cube |
| `spherex_qr3` | QR3 spectral images, wide sweep |
| `spherex_qr3_deep` | QR3, deep fields |

- **DR1 + QR3 replace QR2.** To search everything current you must query **both**.
- **QR2 is not searchable** via SIA2. It remains downloadable by direct URL until February 2027.
- The **calibration** files are **not in SIA2**: they are downloaded from the browsable directories.
- The data is ingested **weekly** and SIA2 **lags ~1 day** behind the directories and the
  Data Explorer.

Command-line query (example from the IRSA documentation):

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIUS`, all in degrees. Remove `RESPONSEFORMAT` to receive VOTable.

Response columns that matter:

- `access_url` — URL of the file at IPAC. **The cutout is requested on this URL.**
- `cloud_access` — how to read the same file from AWS S3.

---

## 4. Cutouts

A full MEF weighs **~70 MB**. For a viewer you must request crops **always**.

They are requested by **adding parameters to the `access_url`**:

```bash
curl -o cutout.fits "<access_url>?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in decimal degrees.
- `size` in degrees.
- Documentation: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

**It only works on files hosted at IPAC, not on the AWS copy.**

The cropped MEF keeps the same extensions; `IMAGE`, `FLAGS`, `VARIANCE` and `ZODI` are cropped,
`WCS-WAVE` is adjusted, and **the PSF extension comes unmodified** (it is that of the whole image).

---

## 5. What is inside the MEF

2040 × 2040 pixels, six extensions:

| HDU | Name | Contents | Trap |
|---|---|---|---|
| 1 | `IMAGE` | Surface brightness, MJy/sr | **Zodiacal light is NOT subtracted** |
| 2 | `FLAGS` | Per-pixel status bits | The bit names come in the header (`MSKN/MSKM/MSKD`). **Never `FLAGS != 0`**: the SOURCE bit marks 72% of the cutout and is not an error; use a bitwise mask (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`, ~4%) |
| 3 | `VARIANCE` | Variance, (MJy/sr)² | Use it for the signal-to-noise ratio |
| 4 | `ZODI` | Zodiacal light model, MJy/sr | Subtract it yourself: `IMAGE - ZODI` greatly improves the contrast |
| 5 | `EPSF` (DR1/QR3) or `PSF` (QR2) | PSF per detector zone | It changed between releases. Do not assume the shape |
| 6 | `WCS-WAVE` | Pixel → central λ and bandwidth | Rarely used part of the FITS standard; many readers do not understand it |

About `WCS-WAVE`: it is a table of **1 row and 3 columns** (`X`, `Y`, `VALUES`), a grid of control
points. If your reader does not recognize it, **interpolate bilinearly between the four nearest
control points**: ~1 nm precision, enough for visualization. For science you must use `CWAVE` and
`CBAND` from the Spectral WCS calibration product.

**Pixel convention:** FITS headers are 1-based; Astropy returns 0-based. IRSA warns about it
explicitly when working with the PSF. It is the classic cause of one-pixel shifts.

### File names

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits` reads as:
`2025W18_2B` = planning period (~3.5 days of operation) · `0001` = large slew ·
`1` = small slew (1–4) · `D1` = detector 1 · `v12-2025-164` = version and processing date.

---

## 6. The all-sky cube (DR1 only)

All-sky mosaics, one for each of the 102 channels. **There are two versions** (checked on Nov 14, `docs/09`):

1. **The SIA2 one** (`COLLECTION=spherex_dr1_cube`, directory `.../ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir[N]/`):
   FITS of ~320 MB per tile; the cutout service rejects it. **Not useful for Aladin.** (The root
   of that directory as HiPS, `.../properties`, gives 404.)
2. **The HiPS for browsers:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
   (PNG, order 5, 102 planes, 50 and 51 empty, open CORS). **This is the one Aladin Lite loads.**
   See the `visor-sky-blink` skill.

Do not confuse the two products:

| | Level 2 | All-sky cube |
|---|---|---|
| Axis it provides | **Time** | **Wavelength** |
| For | The blink, the motion | Color and context (PNG without fluxes: the spectrum does **not** come from here, it comes from level 2) |
| Resolution | Native | HEALPix order 5 (coarse) |
| Where | DR1, QR3 | DR1 only |

---

## 7. Python

```bash
pip install pyvo astroquery astropy
```

The official notebooks are the shortest path and are at
<https://caltech-ipac.github.io/irsa-tutorials/spherex/>: Data Overview, Spectral Image Cutouts,
PSF Models, Source Discovery Tool, Mosaic Cube, HiPS All-Sky Cube.

**Before writing your own client, look at `spxquery`** (<https://spxquery.readthedocs.io>,
`pip install spxquery`): a third-party package that already does TAP queries to IRSA, download with cutout,
aperture photometry with zodiacal subtraction, combination into 3D cubes and light curves. Even if it is not
used, its four-stage architecture and its quality control (SNR threshold, filtering by flags)
are a good map of what has to be solved.

---

## 8. IRSA tools that already exist

Before building something, check whether IRSA already did it. All of them are linked from
<https://irsa.ipac.caltech.edu/Missions/spherex.html>.

| Tool | What it does |
|---|---|
| **SPHEREx Data Explorer** | Search, visualization and download, for astronomers |
| **MOST** | Given the orbit of a solar system object, finds the images that covered its predicted position at each epoch |
| **Spectrophotometry Tool** | Extracts spectra by forced photometry |
| **Mosaic Tool** | Custom multi-band mosaics |
| **Cutout Tool** | MEF cutouts |
| **Source Discovery Tool** | Detects and characterizes sources without prior positions |
| **Cloud Data Access** | The same data on AWS S3 |
| **Comet 3I/ATLAS** | Dedicated collection of images of the interstellar comet |

---

## 9. Mandatory attribution

It must appear in any published material that uses SPHEREx data:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## 10. Mistakes we already know get made

1. **Blinking without grouping by band.** Produces a strobing sequence. Section 1.
2. **Forgetting to subtract `ZODI`.** Faint sources get lost in the background.
3. **Assuming all epochs come with the 6 bands.** They do not.
4. **Searching only `spherex_dr1`** and concluding there are few epochs. You must add `spherex_qr3`.
5. **Using QR2 because that is what an old tutorial said.** It is not searchable via SIA2.
6. **Downloading the full MEF** instead of requesting a cutout. 70 MB per epoch.
7. **Mixing 1-based and 0-based** when converting pixels. One-pixel shifts.
8. **Presenting aperture photometry as science quality.** Always with its warning.
9. **Requesting cutouts on the AWS URL.** The service only operates on the IPAC files.
10. **Concluding «there is no data» after an empty query.** Try another collection, another radius, another band.

---

## 11. Extras verified against the IRSA/AWS documentation (Nov 14, 2026)

Added from the team's exploration. **Taken from the IRSA/AWS documentation: the EDA used SIA2 and HTTP Range, not TAP or the S3 mirror, so those two have not been tested by the team yet.** Test them with a real file before depending on them.

- **AWS mirror (bulk reading, no account):** `s3://nasa-irsa-spherex/{qr3,dr1}/level2/...`,
  region `us-east-1`, anonymous access. Same directory structure as IRSA. Partial reading without
  downloading the 70 MB:
  ```python
  from astropy.io import fits
  with fits.open(s3_url, use_fsspec=True, fsspec_kwargs={"anon": True}) as h:
      sub = h["IMAGE"].section[y0:y1, x0:x1]
  ```
  Only useful if the backend runs in `us-east-1`. For a single object, the IRSA cutout is simpler (mistake 9).
- **Fast TAP query, ordered by time and with the cutout URL already built** (fast path of the
  `spherex-cutouts` tutorial: indexed spatial join over `spherex.plane.poly`):
  ```python
  from astroquery.ipac.irsa import Irsa
  from astropy.utils.data import conf; conf.remote_timeout = 120
  q = f"""SELECT 'https://irsa.ipac.caltech.edu/' || a.uri ||
    '?center={ra},{dec}d&size=0.1' AS uri, p.time_bounds_lower, p.energy_bandpassname
  FROM spherex.artifact a JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1=CONTAINS(POINT('ICRS',{ra},{dec}), p.poly)
  ORDER BY p.time_bounds_lower"""
  tab = Irsa.query_tap(q).to_table()
  ```
  Add `AND p.energy_bandpassname='SPHEREx-D4'` for a single band.
- **λ at the source pixel with astropy** (alternate WCS `W` of the `WCS-WAVE` extension):
  ```python
  from astropy.wcs import WCS
  x, y = WCS(h["IMAGE"].header).world_to_pixel(coord)
  wcs_w = WCS(h["IMAGE"].header, fobj=h, key="W"); wcs_w.sip = None
  lam, dlam = wcs_w.pixel_to_world(x, y)   # λ central y ancho de banda
  ```
  If it fails, bilinear interpolation between the 4 nearest control points of the table (~1 nm).
- **Robust download:** `ThreadPoolExecutor(max_workers=10)` with retry on `TimeoutError`,
  `HTTPError`, `IncompleteRead` and `RemoteDisconnected` (this is how the official notebook does it). A cutout with no
  overlap returns **HTTP 500**: treat it as «no data», not as an outage.
- **Moving stars show up as a dipole** (positive/negative pair) in `diff_first`/`diff_prev`.
  It is expected and it is what the user should see; it is not variability. **Unless the core is saturated or masked** (OVERFLOW, TRANSIENT, SUR_ERROR): then the pair appears even if the object does not move (RW Aur «moves» 1.4 px without moving). You must warn when the object saturates (`docs/09`).
- **To subtract epochs, first `reproject.reproject_interp` to a common grid:** each epoch comes
  with another rotation. Show the subtraction in S/N using `VARIANCE` so that residuals of bright
  stars do not look like detections.


---

## 12. Measured in the EDA (Nov 14)

Figures from `docs/09_EDA_HALLAZGOS.md` and `eda/resultados/`, so as not to measure them again:

- **IRSA does not respond with CORS** (neither SIA2 nor the cutouts): everything goes through the backend. Only the HiPS under `/data/hips/SPHEREx/` has it.
- **0.1° cutout:** median 7.3 s, p90 10.8 s, max 29 s, ~3.9 MB **whatever the size** (the PSF comes whole: a smaller one is not faster). Transient 503s; one persisted through 4 retries. With at most 4 in parallel.
- **Cheap header:** the IMAGE header downloads with an HTTP Range request of ~35 KB (~0.1 s effective with 6 in parallel).
- **Pixel scale:** 6.15″ (SIA2). The fastest objects move 1.1-1.8 px over the whole available period (1.0-1.4 years).
