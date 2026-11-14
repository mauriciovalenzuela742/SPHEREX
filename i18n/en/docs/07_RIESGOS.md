<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/07_RIESGOS.md) · [中文](../../zh/docs/07_RIESGOS.md) · [Deutsch](../../de/docs/07_RIESGOS.md) · [Italiano](../../it/docs/07_RIESGOS.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/07_RIESGOS.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 07 — Risks

Risks identified before starting, with their alarm signal and their plan B. It is updated during the
event with `/riesgo`.

Order: by how much it hurts, not by probability.

---

## R1 · IRSA cutouts are too slow for an interactive tool

> **Status Nov 14: it materialized.** Median 7.3 s, p90 10.8 s, maximum 29 s, ~3.9 MB regardless of
> size, 503 at times (`docs/09` §6). Mitigation decided: cache + 5 precomputed fields as static files
> (ADR-001, Nov 14 update). It remains to decide where `/api` runs for arbitrary coordinates (C).

**Impact: critical.** It is the assumption on which the whole project rests.

A full MEF weighs ~70 MB; the cutout service exists precisely so as not to download them whole,
but we do not know how long it takes **per epoch** nor what happens with 15 parallel requests.

- **Alarm signal:** in Block 1, a `size=0.1` cutout takes more than ~5 s, or IRSA limits
  concurrent requests.
- **Plan B:** aggressive cache + pre-warming of the test fields + requesting epochs in parallel
  with a cap + showing the frames as they arrive instead of waiting for all of them.
- **Plan C:** the tool works on a curated set of ~10 precomputed fields, and is
  presented that way, without hiding it: "today we serve these fields; the architecture scales to the whole sky".
  It is less ambitious and it is honest.
- **When it is decided:** hour 3. No later.

---

## R2 · Epochs are not comparable to each other because of the linear variable filter

> **Status Nov 14: resolved in the EDA.** Epochs are chosen at matched λ (dispersion 0.474 → 0.035 µm in
> WISE 0855 D5); see `docs/09` §2. Showing the λ per frame remains part of the design.

**Impact: high.** It is the subtlest risk and the one most likely to ruin the result without
anyone understanding why.

Due to SPHEREx's LVF design, each observation of a sky position falls on a different part of the
detector and therefore measures a different wavelength. A naive blink gives a sequence where
the brightness jumps although nothing has changed. Explained in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2.

- **Alarm signal:** the first blink flickers like a strobe light and sources appear and
  disappear without moving.
- **Plan B:** group by detector or by λ range, and normalize each frame by robust
  percentiles.
- **Plan C:** if even that does not come out clean, **it becomes a feature**: show the wavelength
  of each frame on screen and explain that the flicker is spectral information, not noise.
  It is true, and it is a point in our favor in front of a technical jury.
- **When it is decided:** hour 3, by measuring the `WCS-WAVE` of two epochs of the same field.

---

## R3 · DR1 just came out and the documentation or examples do not match

> **Watch out for the plan B below (Nov 14):** `spherex_qr3` alone leaves WISE 0855 with no data (0 rows).
> You must query `spherex_dr1` **and** `spherex_qr3` together (`docs/09` §1).

**Impact: medium-high.** DR1 was published in November 2026, this very month. The tutorials
in circulation mostly point to QR2, which is no longer searchable via SIA2.

- **Alarm signal:** an example copied from a notebook returns empty or a collection error.
- **Plan B:** use `spherex_qr3`, which has been there since September and is more likely to be settled.
  QR2 remains downloadable by direct URL until February 2027 even though it is not searchable.
- **Rule of thumb:** **always go to IRSA's documentation, not to a blog or an old
  example.** Links in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## R4 · The wifi goes down (in the room, or right at the pitch)

**Impact: critical if it happens at the pitch, annoying the rest of the time.** High probability: it happens at
almost every hackathon.

- **Mandatory plan B, not optional:** degraded mode that serves the five fields from local cache
  without touching the network, and the demo video downloaded onto the disk of the computer that presents.
- **When:** the video, at T−4 h. The degraded mode, in Block 4.
- Have the repository cloned on **more than one computer**.

---

## R5 · The project is submitted late or incomplete

**Impact: critical. It is the number one reason a good project wins nothing.**

The submission form asks for more than one remembers, and this year it mandatorily includes the
description of how AI was used.

- **Plan B:** there is no plan B. That is why the three mandatory stops of
  [`04_METODOLOGIA.md`](04_METODOLOGIA.md) exist: freeze at T−6, demo recorded at T−4, **submitted at T−2**.
- **N opens the form in hour 1**, not in hour 22, to see what it asks.

---

## R6 · The team scatters across half-done bullets

**Impact: high.** Eight *Potential Considerations* and four people with fast agents: the
temptation to start them all is huge. A jury clicks on exactly the one that was left half-done.

- **Alarm signal:** more than two open branches per person, or a `/standup` where nobody can
  show something that works.
- **Plan B:** the priority order of Block 3 of [`05_PLAN_24H.md`](05_PLAN_24H.md) is not
  negotiated in the heat of the moment. One finished feature is worth more than three half-done.

---

## R7 · Two agents step on each other and break `main`

**Impact: medium, but it costs hours in the middle of the night.**

- **Plan B:** worktree per person, short branches, nobody pushes to `main`, a PR is reviewed by one person.
  See [`04_METODOLOGIA.md`](04_METODOLOGIA.md).
- **Alarm signal:** the first weird merge conflict. When it appears, stop for five minutes and
  review who is touching what, instead of resolving it by force.

---

## R8 · Someone states something false in front of the jury

**Impact: high and hard to recover from.** A jury with NASA astronomers instantly detects
an invented figure or a spectrum presented as if it were calibrated photometry.

- **Plan B:** every number that reaches the pitch or the README goes through `/verifica-cifra`. The
  `caveat` field of the spectrum endpoint is not removed. We never say that anything was discovered.
- **Rule:** if you did not check it, say "we did not check it". That phrase adds credibility, it does not subtract it.

---

## R9 · The GPU and the local machine are not enough for what was promised

**Impact: low with the chosen architecture**, and it is worth writing down so that nobody proposes
training anything. The team has a 4 GB GPU; there is no room to train or fine-tune video
models. The architecture in [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) does not need it at any point.

- **If someone proposes training something:** [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6 has the
  full argument to say no without discussing it again.

---

## R10 · The motion is sub-pixel and the blink does not impress

> **Status Nov 14: measured.** Real baseline 1.0-1.4 years; total displacement 1.1-1.8 px (`docs/09` §4).
> The plan B below is adopted (first against last + subtraction + zoom).

**Impact: high for the demo, medium for the project.** Identified on Nov 14, 2026, before the event.

With a pixel scale of 6.15 arcsec (SIA2; `eda/03_recortes_y_figuras.py:42`), and SPHEREx sweeping the whole sky every 6 months, the
displacement between two consecutive sweeps is **less than one pixel even for the fastest
objects in the sky**: 0.84 px for Barnard's Star, 0.66 px for WISE 0855, 0.38 px for
Epsilon Indi B. Measured on Nov 14: with the whole available period you get to 1.1-1.8 px.

- **Alarm signal:** the blink works, the data are correct, and even so "you cannot see it
  move". That is what will happen if consecutive epochs are compared.
- **Plan B:** always compare the **first epoch against the last**, not consecutive ones; offer
  zoom on the crop instead of showing it at 1:1; and lean on **image subtraction**, where a
  one-pixel shift is seen very clearly as a pair of positive and negative lobes, whereas
  in a blink it looks terrible.
- **Plan C:** move the axis of the demo toward **variability** (RW Aurigae, R Draconis), which is
  evident, and toward **comet 3I/ATLAS**, which moves far more than any star.
- **And a rule for the pitch:** do not promise that "the object jumps out" until you have seen it.
- **When it is decided:** decided on Nov 14 (baseline of 1.0-1.4 years; 1.1-1.8 px in total): plan B is adopted.

---

## R11 · Vercel depends on a single account

**What can fail:** only Mauricio has access to the Vercel project (free Hobby plan; adding members requires paying). The other people's PR previews come out *Blocked* and only he sees the logs.
- **Alarm signal:** production is not updated, or Mauricio is unavailable near the deadline.
- **Plan B:** everyone tests locally (`npm ci && npm run build && npm run preview`); recorded demo video and static mode with the 5 precomputed fields.
- **When it is decided:** before the scope freeze (T−6 h). Owner: C.

## R12 · The Strasbourg CDS goes down (SIMBAD, VizieR)

**What can fail:** on Nov 14 the Strasbourg CDS was down; the Gaia overlay and the SIMBAD bubble depend on it.
- **Alarm signal:** the Gaia/SIMBAD layers stay empty or take longer than the timeout.
- **Plan B:** the code already tries the Harvard mirror first (`vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu`) and the CDS as a fallback; for the demo, precompute the 5 fields.
- **When it is decided:** at the demo rehearsal. Owner: V2.

## R13 · A saturated star fools the subtraction

**What can fail:** on saturated objects (Barnard, RW Aur) the core ends up masked and the subtraction leaves a red/blue pair even though they do not move (RW Aur "moves" 1.4 px without moving).
- **Alarm signal:** a control object (RW Aur) "moves" in the subtraction.
- **Plan B:** warn in the interface when the object saturates and do not use RW Aur as a test of variability or of motion (`docs/09`).
- **When it is decided:** before recording the demo. Owner: D2 and V1.

---

## Log of new risks

Use `/riesgo` to add here. Format: what can fail, how we would notice, what we would do, and
when it is decided.
