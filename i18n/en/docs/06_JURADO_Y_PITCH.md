<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/06_JURADO_Y_PITCH.md) · [中文](../../zh/docs/06_JURADO_Y_PITCH.md) · [Deutsch](../../de/docs/06_JURADO_Y_PITCH.md) · [Italiano](../../it/docs/06_JURADO_Y_PITCH.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/06_JURADO_Y_PITCH.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 06 — Jury, prizes and pitch

---

## How it is judged

The Space Apps funnel is: the local event jury picks **Global Nominees** → experts from NASA
and partner agencies pick **Global Finalists** and honorable mentions → an executive committee picks the
**10 Global Winners**.

That is: **the first filter is a local jury**, with little time per team and without reading the code.
After that, NASA people who do understand astronomy. The project has to work in both
registers: make an impact in two minutes and withstand an expert's scrutiny.

At the Santiago event the announced format is **2-minute pitch + 2 questions**.

## The ten global prizes, and which ones are ours

| Prize | Ours? |
|---|---|
| **Best Use of Data** | **Yes, the main one.** It is literally «making space data accessible». The challenge asks for exactly that |
| **Best Use of Science** | **Yes.** Showing the spectral axis well and validating with Gaia is visible scientific method |
| **Best Use of Technology** | Possible, if the viewer is technically striking (102 bands in the browser) |
| **Galactic Impact** | Possible: citizen science at scale |
| **Best Use of Storytelling** | **Yes, if we work on it.** The story of Pluto and the blink comparator is there for the taking |
| **Most Inspirational** | Possible, goes with the above |
| **Global Connection** | Possible if we use partner agency resources (CSA/NEOSSat) and think of the viewer as shared infrastructure |
| Best Mission Concept | No. We are not proposing a mission |
| Art & Technology | No, unless the viewer ends up visually remarkable |
| Local Impact | Weak, unless we connect it with Chilean astronomy |

**Aim for two or three, not ten.** Best Use of Data and Best Use of Science are the natural ones; the
storytelling one is free if N works on the narrative from hour 0.

---

## The challenge's eight bullets are the rubric

The *Potential Considerations* are what the challenge's author expects to see. Each one met is a
point that a NASA judge will recognize.

| Challenge bullet | How we meet it | Cost |
|---|---|---|
| Easy to update with new releases | SIA2 collections by configuration, not hard-wired | Low |
| Creatively show the 102 bands | Band selector + HiPS cube | **Medium, and it is the differentiator** |
| Add or subtract images from different epochs | `mode=diff_first` / `diff_prev` | Low |
| Selectable field of view | `size` parameter | Very low |
| Overlay Gaia or WISE | Catalog overlay in Aladin Lite | Low |
| Coordinates in the URL | `?ra=&dec=&...` reflecting the state | Very low |
| Show metadata such as contamination flags | `FLAGS` extension of the MEF | Low |
| Use public tools (Astropy, Aladin) | They are the stack | Zero |

Seven of the eight are low or very low cost. **We have to meet them all.** In
[`05_PLAN_24H.md`](05_PLAN_24H.md) they are in the order in which they are tackled.

---

## The 2-minute pitch

Structure. The timings are approximate but the order is not negotiable: **the demo comes before the
explanation**, because if they cut you off, at least they saw the tool.

**0:00 – 0:20 · The hook**

> In 1930, Clyde Tombaugh discovered Pluto by looking at two photos of the same piece of sky and noticing that
> a dot had moved. Today, SPHEREx photographs the entire sky every six months in 102 colors
> of infrared, and nobody is looking at it this way.

**0:20 – 1:10 · The demo, live** *(half the time; this is what gets judged)*

1. Type `WISE 0855`. A name, not coordinates: it shows it is for anyone. It is a mandatory case
   (one of the organizers' test objects) and it is always shown.
2. Hit play and then the first − last subtraction. **The brown dwarf moves** (~1.3 px over the whole
   period): a red/blue pair. We say honestly that in a single exposure it looks faint and that
   the per-sweep sum will improve it. Then, **eps Ind B**, where the motion is seen most clearly
   (−0.85/−0.71 px measured against −0.92/−0.57 predicted).
   For WISE 0855 the plan has two complements: the CatWISE2020 overlay (it is not
   in Gaia and CatWISE carries its proper motion; owner V2 Juan Pablo; **done on the `v/v2-catwise` branch,
   PR pending**: it marks WISE 0855 at 2.6″ from the position propagated from SIMBAD) and the per-sweep sum
   with 1/VARIANCE weights (owner D2 Bryan; `docs/10` and `docs/09`; **pending**). The challenge guide values
   overlaying Gaia and WISE. Until they get into `main`, they are not presented as part of the deployed viewer.
3. Move the band selector. The same region of the sky at another wavelength.
4. Turn on the Gaia overlay over Barnard or eps Ind B (WISE 0855 is not in Gaia: its overlay is
   CatWISE2020). The dots fall where they should. *«That's how we know it's correct.»*
5. Copy the URL. *«This is shareable and embeddable.»*

**1:10 – 1:35 · Why it matters**

> Most of the known brown dwarfs and comets were found by volunteers looking at
> image blinks. That community exists and today has no way to look at SPHEREx. The most cited
> Planet Nine candidate came from comparing two infrared surveys separated in time: the same
> technique. We open it to anyone, with the spectral axis of the 102 bands (as far as we could verify, no public tool combines it with the temporal blink on a single screen).

**1:35 – 2:00 · What we built and what comes next**

Stack in one sentence, real DR1 data —published this month—, public URL, open source.
And a line on what comes next.

### Pitch rules

- **Never demo live against a cold query.** The five fields go pre-warmed.
- **Video ready in another tab.** If the wifi fails, play the video without apologizing.
- **Don't say «could».** Show what there is. What isn't there is named as what comes next.
- **Never promise to have found anything.** A jury with astronomers punishes that instantly.
- If time is left, **give it back**. Finishing at 1:50 with everything shown is better than rushing at 2:10.

---

## The uncomfortable questions, with their answer

**«Doesn't IRSA's Data Explorer already do this?»**
Not for this audience. The Data Explorer is an archive for astronomers: you have to know which collection
to request, what a MEF is and how an image is stretched. We resolve the name, group the
epochs, normalize and deliver the blink. It is the difference between an archive and a viewer, and it is
the same difference that made WiseView useful compared to the WISE archive.

**«How do I know the image is of the coordinate I asked for?»**
Through the Gaia overlay: we draw the positions Gaia predicts for that date and they fall on the
sources in the image. *(And it is shown on screen.)*

**«Why didn't you use machine learning?»**
Because the challenge asks for a viewer for people, and because the real bottleneck is fetching and aligning
the right data, not recognizing the motion. Where AI contributes here is in candidate
vetting with small networks over crops —what the ALeRCE broker does with ZTF alerts—,
and we leave it posed as the next step. *(Developed in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6.)*

**«What happens if I enter a coordinate with no data?»**
*(One is typed and the empty state is shown, which says how many epochs there are and suggests a nearby field.)*

**«Does this scale to the whole sky?»**
The query is by position against SIA2, so yes in coverage. What does not scale without
infrastructure is the cache: today we pre-warm fields; at scale it would be necessary to precompute crops,
which is exactly what unWISE does for WiseView.

**«How correct are the spectra?»**
They are indicative, aperture photometry with the zodiacal light subtracted, and we say so in the interface
itself. For science there is IRSA's Spectrophotometry Tool. *(Never say they are of science
quality. Honesty here adds more than it subtracts.)*

---

## What is mandatory in the submission

- **Description of how AI was used.** This year it is mandatory in every submission. It is not a formality:
  written well, it is evidence of method. Template in the `entrega-nasa` skill.
- **SPHEREx attribution**, verbatim, in the tool's footer and in the README
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **No minors in photos or voices** in the demo, according to the event rules.
- **Links that work from outside.** Test the project URL from a phone on mobile data, not
  from the room's wifi.
