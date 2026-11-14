<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/01_ESTADO_DEL_ARTE.md) · [中文](../../zh/docs/01_ESTADO_DEL_ARTE.md) · [Deutsch](../../de/docs/01_ESTADO_DEL_ARTE.md) · [Italiano](../../it/docs/01_ESTADO_DEL_ARTE.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/01_ESTADO_DEL_ARTE.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 01 — State of the art

What has already been done on what this challenge asks for, what worked, what did not, and where there is room for
something new in 24 hours. The full references, with links, are in
[`../biblio/README.md`](../biblio/README.md); here we give the names and the argument.

---

## 1. The problem is a hundred years old and the technique has not changed

Clyde Tombaugh discovered Pluto in 1930 with a **blink comparator**: two photographic plates
of the same region of the sky taken on different dates, quickly alternated. What is still does not
move; what shifts jumps out. The human eye is extraordinarily good at detecting
that jump, even with a lot of background noise.

A century later the technique is the same, only the medium changed. And it is still competitive: in
citizen science projects like **Backyard Worlds: Planet 9** (Kuchner et al., 2017), hundreds of
thousands of volunteers have found brown dwarfs and high proper motion objects that the survey's
automatic algorithms had missed, typically because they were in areas of high stellar
density, near bright sources, or with artifacts that confuse a detector but not
a person.

**This is the rationale for the challenge**, and it is worth saying in the pitch: a viewer is not asked for because
it is easier than an automatic detector, but because the human eye at crowd scale solves
cases that the automatic detector does not.

---

## 2. What already exists and must be known before writing a line

### WiseView — the challenge's explicit model

<http://byw.tools/wiseview> · Caselden, Westin et al., ASCL:1806.004

A browser tool that blinks WISE coadds over a time baseline of several years.
The user enters coordinates and adjusts stretch, color map and blink speed. It was born
as a makeshift tool by two Backyard Worlds volunteers who wanted to classify their own
candidates better, and ended up being the tool with which **hundreds of discoveries** of
brown dwarfs have been made, by amateurs and professionals alike.

Lessons to copy shamelessly:

- **A coordinate box and nothing else** on the first screen.
- **The controls matter**: stretch, color and blink speed are what turn a
  smudge into a discovery. They are not decorations.
- **It has an API.** There are third-party packages —`flipbooks` and `unWISE-verse`, from the Cool
  Neighbors project— built on top of the WiseView API to generate material and upload it to Zooniverse.
  A tool with a queryable URL becomes infrastructure for other projects. This is
  exactly what the challenge bullet about including coordinates in the URL asks for.

What WiseView does **not** do, and is our gap: it has no spectral axis. WISE has four bands;
SPHEREx has 102.

### unWISE and the coadds

Lang (2014), Meisner et al. (five-year coadds), unWISE catalog (Schlafly et al.).
WiseView does not show single exposures: it shows **coadds**, images combined by epoch. That is the
reason faint sources are visible. The **unTimely** catalog (Meisner et al., 2022) took this to the
time domain: an all-sky catalog resolved in time from the coadds.

`[Implication]` Combining before displaying is not optional if you want to see faint things. In SPHEREx
the natural equivalent is to add up by detector or by λ range, which is exactly what the challenge suggests.

### Sky viewers in the browser

| Tool | Who | What it offers |
|---|---|---|
| **Aladin Lite v3** | CDS, Strasbourg | HiPS viewer in the browser, embeddable, with projections, catalog overlays and FITS tiles. **Cited by the challenge itself** |
| **Firefly** | IPAC/Caltech | The engine of IRSA's Data Explorer. The official SPHEREx HiPS cube notebook uses it |
| **Legacy Survey viewer** | NOIRLab | Another sky viewer that serves the unWISE coadds |
| **ESASky** | ESA | Multi-mission viewer, a good example of temporal-layer UX |
| **JS9** | SAO | DS9 in the browser: client-side FITS manipulation |

**Aladin Lite is the default decision** and it is best not to argue it: it solves sky navigation,
projections, Gaia overlays and zoom, which are weeks of work. The
**HiPS** format (Fernique et al., 2015) is what it consumes, and it allows animating a cube plane by plane.

The fact that closes the argument: the **SPHEREx DR1 all-sky cube is published as HiPS**
(see [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)). There is a direct path from the NASA archive to the
browser without a backend.

---

## 3. Automatic detection of moving objects

It is not what the challenge asks for, but it is what a jury with astronomers will ask about. We must be able to
answer in one sentence why we did not do it (or how we did it on top of the viewer).

### Shift-and-stack: KBMOD

Whidden et al. (2019) and the LINCC Frameworks team. The idea: an object moving slowly is
invisible in a single image, but if you **shift** each image according to a candidate velocity and
then **stack** them, the object adds up coherently and the noise does not. KBMOD does this on GPU and can
explore on the order of 10¹⁰ candidate trajectories per minute.

Real results: the **DEEP** survey (DECam Ecliptic Exploration Project) identified 105 new
trans-Neptunian objects with KBMOD; the New Horizons Subaru TNO Survey used it to go from days per
chip to hours. There is also recent work on classifying with machine learning the
candidates it produces (Smotherman et al., 2024), because a low threshold generates thousands of false
positives per CCD.

`[Implication]` Shift-and-stack is the state of the art for "finding what cannot even be seen". It is also
expensive, and SPHEREx has a cadence and spectral sampling that are nothing like those of DECam.
**For 24 hours, mentioning it as future work is more honest than attempting it.** If you want a
pinch of it, an image subtraction between two epochs (which the challenge explicitly suggests) is 5 % of the
effort and 60 % of the visual effect.

### Linking detections: HelioLinC and family

The other approach: detect sources in each image and then **link** the detections that are
compatible with an orbit. It is the path Rubin/LSST will follow. Cheaper than shift-and-stack,
but it needs the object to be visible in individual images.

### Alert brokers: ALeRCE

This is home turf: **ALeRCE** (Förster et al., 2021) is the Chilean broker that processes the ZTF
alert stream and is preparing for LSST. Two classifiers:

- **Stamp classifier** (Carrasco-Davis et al.): a convolutional network on the science,
  reference and difference stamps of the *first* detection, designed to exploit rotational invariance.
  It classifies with a single image.
- **Light curve classifier** (Sánchez-Sáez et al.): balanced random forest, in two levels, on
  variability features and colors.

They have classified on the order of 10⁷ objects out of ~10⁸ alerts.

`[Implicación — and it matters for this team]` The lab has people who built this. A
jury notices. But the differentiating contribution is not putting a classifier in the viewer: it is the **discipline
of real-time classification** —thresholds, false positives, how a doubtful candidate is presented to a human,
how the label that person gives is collected. That discipline applied to the viewer's UI
is something no other team at the hackathon will have. See
[`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md).

---

## 4. Citizen science: what makes it work

Backyard Worlds, Cool Neighbors and Zooniverse have years of learning on this, and the challenge
explicitly points to that audience.

What experience shows:

- **The task must be a single one and decidable in seconds.** "Is anything moving here, yes or no?"
  Not "classify this source".
- **You must be able to start without registering or reading anything.** A preloaded example on the
  initial screen is worth more than a tutorial.
- **Traceability is the reward.** Letting the volunteer point at something, save it and show it again
  —with a URL— is what turns curiosity into discovery.
- **Discoveries are published with the volunteers' names.** It is no minor detail: it is
  the engine of participation.

`[Implication]` Three product decisions come out of this: a preloaded example on opening, name
resolution ("Barnard's Star", not just numbers) and a **shareable URL with the coordinates**, which is also
an explicit bullet of the challenge.

---

## 5. Planet X: where the search stands today

The challenge is called "Planet X and SPHEREx" but does not ask to search for Planet X. It is still worth knowing the
real state so as not to say something silly in front of a jury.

- The modern hypothesis is by **Batygin & Brown (2016)**, *Evidence for a Distant Giant Planet in the
  Solar System* (AJ 151, 22; arXiv:1601.05438): the orbital clustering of distant trans-Neptunian
  objects would be explained by a planet of ≳10 Earth masses in a distant eccentric orbit.
- **It has not been found.** As of November 2026 it remains unconfirmed.
- The most cited candidate is that of **Phan et al.**, who cross-matched the **IRAS** and
  **AKARI** infrared surveys, separated by 23 years, and found a single compatible object. Published in PASA. The
  authors themselves stress that they have not discovered Planet Nine; follow-up is needed.
- There are recent parallax-driven optical searches that found no credible candidates in the
  covered field, and 2026 work that narrows the allowed orbit space.

`[Implication]` The honest framing for the pitch: **the technique that found Phan's candidate is
exactly the challenge's** —comparing two all-sky infrared surveys separated in
time and looking for what moved—. SPHEREx does that every six months, in 102 bands, and nobody has
reviewed it by eye. That sentence is true, it is verifiable, and it is a better hook than any promise of
finding a planet.

---

## 6. Video models (TimeSformer, VideoMAE, X-CLIP): where they really fit

They were an initial recommendation from the team's environment and deserve a clear answer.

What they are: architectures for **understanding natural video**. **TimeSformer** (Bertasius et al., ICML 2021;
arXiv:2102.05095) and **ViViT** (Arnab et al., ICCV 2021; arXiv:2103.15691) apply divided attention
over space and time on frame patches. **VideoMAE** (Tong et al.; arXiv:2203.12602) and
**VideoMAE V2** (arXiv:2303.16727) pretrain with masked autoencoders and very
aggressive masking, which makes them data-efficient. **X-CLIP** (Ni et al.; arXiv:2208.02816) extends CLIP
to video for recognition with language descriptions.

Why they are **not** the core of this project:

1. **The challenge asks for a viewer, not a classifier.** The one who detects is the user. A video model
   does not answer the brief.
2. **They are pretrained on natural video** (Kinetics, Something-Something): people, objects,
   actions. The statistics of an astronomical sequence —near-empty background, point sources, PSF,
   artifacts, a shift of a few pixels— look nothing like that. The pretraining, which is
   all their value, does not transfer well.
3. **There are no labels.** Training or fine-tuning in 24 hours without a labeled set is not realistic.
4. **The case is already well solved by classical methods.** Shift-and-stack and image subtraction
   exploit the physics of the problem (a linear trajectory, a static background). A video transformer
   would have to learn that from scratch, with less data.

Where they **could** fit, if time were left over, and it is worth knowing in order to answer the jury:

- As **candidate screening** on already-aligned stacks of crops: a small classifier
  trained with synthetic positives (injected sources with known motion) and real negatives.
  Here the right parallel is not TimeSformer, it is **ALeRCE's stamp classifier**: a small network,
  on crops, with hand-chosen invariances. Cheaper, more explainable and with lab people
  who know it.
- As an **embedding** to search for "more sequences like this one", which is a nice UI idea.

**Summary for the pitch, if asked:** "We evaluated it. The challenge's bottleneck is not
recognizing motion in a video, it is fetching and aligning the right data and putting it in front of a
person. Where AI contributes here is in screening candidates with small networks on crops,
which is what the ALeRCE broker does, and we left it laid out." That answer is stronger than having
put in a model that adds nothing.

---

## 7. Where the gap is

Putting it all together, what **does not exist today** and fits in 24 hours:

> A public viewer where the user enters a coordinate and sees **two axes at once**: how that
> region of the sky changes **over time** (the classic blink, which is what the challenge asks for) and how it
> looks **at each of the 102 wavelengths** (the axis that WiseView does not have and that only SPHEREx
> can give), with the spectrum of whatever one points at generated on the fly.

That is at once:

- The literal reading of the brief (the viewer with the little video).
- The two most demanding bullets of *Potential Considerations* (the 102 bands and on-the-fly spectra).
- Something that, as far as we have been able to verify, no public tool does today for SPHEREx:
  IRSA's Data Explorer is for astronomers, and WiseView is from another mission and has no spectral axis.

The rest of the bullets —image subtraction, adjustable field of view, Gaia and WISE overlays, queryable
URL, contamination flags— are low-cost extras that get added in order of value.
The order is in [`05_PLAN_24H.md`](05_PLAN_24H.md).

---

## 8. Honesty about this document

What is written here relies on searches and on IRSA's official documentation consulted on
November 14, 2026. The archive data (endpoints, releases, file structure) is
verified against the documentation. The bibliographic references have their verification status
marked one by one in [`../biblio/README.md`](../biblio/README.md): **do not cite from here without looking
there**. The claims about what does not exist ("no public tool does today…") are ours
and are limited by what we searched; if someone finds the opposite, the document is corrected.
