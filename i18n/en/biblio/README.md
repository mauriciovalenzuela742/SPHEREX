<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/biblio/README.md) · [中文](../../zh/biblio/README.md) · [Deutsch](../../de/biblio/README.md) · [Italiano](../../it/biblio/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `biblio/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Bibliography

References organized **by what they are for**, not alphabetically. Each entry says what it
contributes to this specific project and what state of verification it is in.

## How to read the «status» column

| Mark | Means |
|---|---|
| ✅ | Identifier and title verified in a search on Nov 14, 2026 |
| 🟡 | Exists and is well known, but **we did not verify the exact identifier**. Verify before citing |
| 📄 | Official documentation, with the URL opened and read |

**Never cite from here without verifying whatever is marked 🟡.** That a paper exists does not prove it says what
is attributed to it; a jury with NASA astronomers will notice. Use `/verifica-cifra`.

The entries in BibTeX format are in [`referencias.bib`](../../../biblio/referencias.bib). The code repositories,
in [`repos.md`](repos.md). The reading notes, in [`fichas/`](../../../biblio/fichas/).

---

## 1. SPHEREx: the mission and its data

What to read to understand the instrument and not make mistakes with the data.

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| **SPHEREx Explanatory Supplement** · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp_QR_v2.0.pdf> | Specification document for the data products | **The reference document.** Table 16 defines the `FLAGS` bits, which is what the *contamination flags* bullet asks for | 📄 |
| **SPHEREx Archive at IRSA** · <https://caltech-ipac.github.io/spherex-archive-documentation/> | Access and products guide | SIA2 collections, cutouts, MEF structure. **The most useful thing on day 1** | 📄 |
| Bock et al. (2026), *The SPHEREx Satellite Mission*, ApJ · arXiv:2511.02985 | Canonical mission paper | It is the one IRSA asks to cite. It describes the planned catalog of solar system objects | ✅ |
| Akeson et al. (2026), *The SPHEREx Image and Spectrophotometry Processing Pipeline*, ApJS · arXiv:2511.15823 · doi:10.3847/1538-4365/ae8843 | How the data we use are produced | Explains level 2, calibration and availability times | ✅ |
| Crill et al. (2025), *The SPHEREx Sky Simulator* · arXiv:2505.24856 | SPHEREx sky simulator | Useful if you need to understand what should be seen in a field | ✅ |
| Korngut et al. (2026), *Instrument & Calibration* | Instrument and calibration | Cited by IRSA as canonical. **Identifier not verified** | 🟡 |
| Doré et al. (2016), *Science Impacts of the SPHEREx All-Sky Survey* · arXiv:1606.07039 | Original science case | Context for the pitch | ✅ (id); 🟡 (authorship) |
| Lim et al. (2026), *SOLO: wide-field asteroid light curve monitoring system for SPHEREx* · arXiv:2602.08037 | Ground-based system supporting SPHEREx's solar system object catalog | **Highly relevant**: explains why light curves are needed to correct asteroid spectra for rotation | ✅ |

---

## 2. The direct precedent: WiseView, unWISE and Backyard Worlds

This is what the challenge asks to replicate and surpass. **If you read only one section, make it this one.**

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| **WiseView** · Caselden, Westin et al. · ASCL:1806.004 · <http://byw.tools/wiseview> | The tool the challenge names as a model | Blink of WISE coadds in the browser, with adjustable stretch, color and speed. Hundreds of brown dwarf discoveries | ✅ |
| Lang (2014), *unWISE: unblurred coadds of the WISE imaging* · arXiv:1405.0308 | The coadds that WiseView shows | **Combining before displaying** is what makes faint sources visible | 🟡 |
| Meisner et al., *unWISE Coadds: The Five-year Data Set* · arXiv:1909.05444 | Extended coadds | How a time series is built from a survey | ✅ (id) |
| Schlafly et al. (2019), *The unWISE Catalog: Two Billion Infrared Sources* · arXiv:1901.03337 | Derived catalog | Scale of the problem | ✅ (id) |
| Meisner et al. (2022), *unTimely: a Full-sky, Time-Domain unWISE Catalog* · arXiv:2209.14327 | Time-resolved catalog | **The step from «images» to «time domain»**, which is our problem | ✅ |
| Kuchner et al. (2017), *Backyard Worlds: Planet 9* | The citizen science project | The social rationale for the challenge. Volunteers find what the survey's algorithms let slip | 🟡 |
| **Cool Neighbors** (Zooniverse) · <https://www.zooniverse.org/projects/coolneighbors/backyard-worlds-cool-neighbors/> | Successor project | Uses the WiseView API to generate its material. **Proof that a tool with a queryable URL becomes infrastructure** | 📄 |

---

## 3. Visualization of astronomical data in the browser

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| Fernique et al. (2015), *Hierarchical progressive surveys (HiPS)* · arXiv:1505.02291 | The HiPS format | The SPHEREx DR1 all-sky cube is published in HiPS. It also describes how Aladin walks through a cube plane by plane or as an animation | ✅ |
| Baumann et al. (2022), *Aladin Lite v3: Behind the Scenes of a Major Overhaul*, ADASS · 2022ASPC..532....7B | The viewer we use | Projections, FITS tiles, embedding. Cited by the challenge itself | ✅ |
| **Aladin Lite — API** · <https://aladin.cds.unistra.fr/AladinLite/doc/API> | Reference documentation | `createImageSurvey`, `getEmbedCode`, `getViewDataURL` | 📄 |
| **Firefly** (IPAC) · <https://github.com/Caltech-IPAC/firefly> | The engine of IRSA's Data Explorer | The official notebook for the SPHEREx HiPS cube uses it | 📄 |
| **Astropy** · <https://docs.astropy.org> | FITS, WCS, coordinates, visualization | `ZScaleInterval`, `AsinhStretch`, `ImageNormalize`, `SkyCoord`. **Do not reimplement any of this** | 📄 |

---

## 4. Detection of moving objects (what we will NOT implement, but need to know)

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| Whidden et al. (2019), *Enabling Deep All-Sky Searches of Outer Solar System Objects* · arXiv:1901.08549 | **KBMOD**: shift-and-stack on GPU | The state of the art for finding what can't be seen in a single image. ~10¹⁰ trajectories/min | ✅ |
| *Fast algorithms for slow moving asteroids* · arXiv:1901.02492 | Associated work | Constraints on the distribution of Kuiper belt objects | ✅ (id) |
| Smotherman et al. (2024), *Detecting Moving Objects With Machine Learning* · arXiv:2405.06148 | KBMOD candidate vetting | **Where ML really fits here**: filtering thousands of false positives, not replacing the viewer | ✅ (id); 🟡 (authorship) |
| *DECam Ecliptic Exploration Project (DEEP) VI* · arXiv:2310.03678 | KBMOD applied to a real survey | 105 new trans-Neptunian objects; real compute times | ✅ |
| *Candidate Distant TNOs — New Horizons Subaru TNO Survey* · arXiv:2407.21142 | Another real use of KBMOD | Thresholds and false-positive rates | ✅ (id) |

---

## 5. Real-time classification: ALeRCE (the lab's own turf)

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| Förster et al. (2021), *The ALeRCE Alert Broker*, AJ · arXiv:2008.03303 | The Chilean ZTF alert broker | **The team's advantage.** The discipline of classifying in real time and presenting doubtful candidates to a human is exactly what a viewer lacks | ✅ |
| Carrasco-Davis et al., *Stamp classifier* | CNN over science/reference/difference crops, with rotational invariance | **The right «AI» model for this problem**, not a video transformer: small network, over crops, with hand-chosen invariances | 🟡 |
| Sánchez-Sáez et al., *Light curve classifier* | Two-level balanced random forest over variability features | To distinguish real variability from artifact | 🟡 |
| *Temporal Stamp Classifier* · arXiv:2405.15073 | Version with a time axis | The closest to a «video model» that makes sense here | ✅ (id) |

---

## 6. Planet X: the real state of the search

| Ref | What it is | Why it matters | Status |
|---|---|---|---|
| Batygin & Brown (2016), *Evidence for a Distant Giant Planet in the Solar System*, AJ 151, 22 · arXiv:1601.05438 · doi:10.3847/0004-6256/151/2/22 | The modern Planet Nine hypothesis | The origin of the challenge's name | ✅ |
| Phan et al., candidate from IRAS + AKARI, PASA | A single compatible object in two infrared surveys 23 years apart | **The technique is exactly the challenge's.** The authors stress that they have not discovered Planet Nine | 🟡 (identifier and year not verified) |
| *A targeted, parallax-based search for Planet Nine* · The Open Journal of Astrophysics · <https://astro.theoj.org/article/155004> | Targeted optical search | No credible candidates in the covered field. Useful to avoid overstating in the pitch | ✅ (title and journal) |

**For the pitch:** as of November 2026 Planet Nine **has not been found**. Never claim otherwise.

---

## 7. Video models (evaluated and discarded as the core)

The full argument is in [`../docs/01_ESTADO_DEL_ARTE.md`](../docs/01_ESTADO_DEL_ARTE.md) §6.
They are listed so you can answer the jury precisely.

| Ref | What it is | Status |
|---|---|---|
| Bertasius, Wang & Torresani (2021), *Is Space-Time Attention All You Need for Video Understanding?* (**TimeSformer**), ICML · arXiv:2102.05095 | Separate attention over space and time on frame patches | ✅ |
| Arnab et al. (2021), *ViViT: A Video Vision Transformer*, ICCV · arXiv:2103.15691 | Video transformer from Google Research | ✅ |
| Tong et al. (2022), *VideoMAE* · arXiv:2203.12602 | Masked autoencoder for video, data-efficient | ✅ |
| *VideoMAE V2: Scaling Video Masked Autoencoders with Dual Masking* · arXiv:2303.16727 | Scaled-up version | ✅ |
| Ni et al. (2022), *Expanding Language-Image Pretrained Models for General Video Recognition* (**X-CLIP**) · arXiv:2208.02816 | CLIP extended to video | ✅ |

**Summary of why not:** the challenge asks for a viewer, not a classifier; pretraining on
natural video does not transfer to astronomical sequences; there are no labels in 24 hours; and classical methods
exploit the physics of the problem. Where ML would contribute is in candidate vetting, and for
that the right model is ALeRCE's *stamp classifier* (section 5), not a video transformer.

---

## 8. Partner agency resources (CSA)

Using them adds to the jury's *Global Connection* criterion.

| Resource | URL |
|---|---|
| NEOSSat (mission) | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> |
| NEOSSat — Python tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> |
| NEOSSat — data | <https://data.asc-csa.gc.ca/dataset/neossat> |
| Canadian Astronomy Data Centre | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> |

---

## What is still left to search

Honesty about the limits of this review, done on Nov 14, 2026:

- We did not find a 2026 paper dedicated specifically to **moving object detection with
  SPHEREx**. The closest are the solar system object catalog described in the mission paper
  and the supporting SOLO work.
- We did not confirm whether the **WiseView source code** is public. The derived packages (`flipbooks`,
  `unWISE-verse`) are. See [`repos.md`](repos.md).
- CDS's **SIMBAD** was not responding on Nov 14; the test fields' coordinates were verified
  against the Harvard (CfA) mirror: see
  [`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml).
- The entries marked 🟡 need someone to open the source before citing them.
