<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/biblio/repos.md) · [中文](../../zh/biblio/repos.md) · [Deutsch](../../de/biblio/repos.md) · [Italiano](../../it/biblio/repos.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `biblio/repos.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Repositories and code tools

What already exists and can save us hours. Ordered by how directly it applies to the challenge.

**Rule:** before writing something, check whether it is on this list. And before using a third-party
repository in the project, **check its license**.

---

## Directly applicable

### `spxquery` — SPHEREx query and photometry
<https://spxquery.readthedocs.io> · `pip install spxquery` · v0.4.1

**The closest thing to what has to be built on the data side.** Four-stage pipeline:
TAP query to IRSA, download with cutout (e.g. 200 px instead of 2040×2040), aperture photometry
with zodiacal light subtraction, and light curves. It includes quality control with a signal-to-noise threshold
and filtering by `FLAGS` bits, and combination of observations into 3D spectral cubes («Drizzle3D»).

**How to use it:** even if it is not adopted as a dependency, **read its architecture before designing
ours**. It already solved the problems we are going to run into: resuming downloads, parallelism,
what to do with broken variances.

### `irsa-tutorials` — official IRSA notebooks
<https://github.com/Caltech-IPAC/irsa-tutorials> · <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

SPHEREx notebooks: Data Overview, Spectral Image Cutouts, PSF Models, Source Discovery Tool,
Mosaic Cube, **HiPS All-Sky Cube**. They are the shortest path to a working example.
The cutouts one also shows how to package several crops into a new MEF.

### `aladin-lite` — the sky viewer
<https://github.com/cds-astro/aladin-lite> · npm `aladin-lite` · LGPL-3.0-or-later according to GitHub; **beware:** the npm metadata and `scaffold/frontend/package-lock.json:1248` say `GPL-3` (unresolved: open the `LICENSE` of the 3.8.2 package)

CDS's HiPS viewer. The statement itself suggests it.

### `astropy` / `astroquery` / `pyvo`
<https://github.com/astropy/astropy> · <https://github.com/astropy/astroquery> · <https://github.com/astropy/pyvo>

FITS, WCS, coordinates, stretches, access to SIA2/TAP and to SIMBAD/Gaia. **Base of the backend.**
`astropy.visualization` solves image stretching; do not reimplement it.

---

## Precedent: the WiseView ecosystem

We did not find the original WiseView's source code confirmed, but we did find the packages built
on its API, which show how such a tool is used as infrastructure.

### `flipbooks`
<https://github.com/coolneighbors/flipbooks>

Python package that uses the **WiseView API** to extract blinks from unWISE coadds.
Authorship credited to Noah Schapera, Austin Humphreys and Aaron Meisner.
**What it is useful for:** seeing how a blink is parameterized (size, epochs, stretch) in an API
that turned out to be usable by third parties. That is the bar for our own queryable URL.

### `unWISE-verse`
<https://github.com/coolneighbors/unWISE-verse>

Downloads WISE target data via the WiseView API, manipulates the images and uploads the
*subject sets* to Zooniverse. **It is the complete citizen science cycle**: from the archive to the
platform where people classify. If time is left, exporting to Zooniverse is a very strong narrative
close for the pitch.

### `photutils`
<https://github.com/astropy/photutils>

Aperture photometry and source detection. If an «on-the-fly spectrum» or marking sources
on the image is needed, it is solved here.

---

## Moving object detection (reference, will not be implemented)

### `kbmod`
<https://github.com/dirac-institute/kbmod>

GPU shift-and-stack, from the DiRAC Institute (Univ. of Washington) and LINCC Frameworks.
The state of the art for detecting objects too faint to be seen in a single image.
**Out of scope for 24 hours** (see `../docs/01_ESTADO_DEL_ARTE.md` §3), but you need to know how to
name it if the jury asks about automatic detection.

---

## Partner agency (CSA)

### `NEOSSAT_Tutorial`
<https://github.com/asc-csa/NEOSSAT_Tutorial>

Official Python tutorial for visualizing NEOSSat data. It is a resource listed on the challenge's
*Resources* tab: using it adds to the *Global Connection* criterion.

---

## Before using any of these

- [ ] **License compatible** with the one we publish (planned MIT). Aladin Lite is LGPL-3.0: linking it
      from the frontend is fine, but do not copy its code into ours.
- [ ] **Installable without a fight.** If a dependency takes more than 10 minutes to install on the
      four computers, it does not go in. In a hackathon that is an hour lost.
- [ ] **Attribution** in the README, with a link.
- [ ] **Is it alive?** Look at the date of the last commit and the open issues.
- [ ] Treat third-party code as **untrusted data**: read it before running it, and do not run interpreters from inside a downloaded directory.
