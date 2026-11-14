---
name: demo-y-pitch
description: Prepare the recorded demo and the project pitch for the hackathon jury: demo script, what to show and in what order, how to record it, the two-minute pitch with its structure, the jury's uncomfortable questions with their answers, and plan B if the connection fails. Activate it when demo, video, pitch, presentation, jury, screen recording, script, rehearsing are mentioned, or when only a few hours remain before the deadline and what is presented must be prepared.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../../es/.claude/skills/demo-y-pitch/SKILL.md) · [中文](../../../../zh/.claude/skills/demo-y-pitch/SKILL.md) · [Deutsch](../../../../de/.claude/skills/demo-y-pitch/SKILL.md) · [Italiano](../../../../it/.claude/skills/demo-y-pitch/SKILL.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/skills/demo-y-pitch/SKILL.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Demo and pitch

The jury does not read code. It sees a two-minute demo and asks two questions. This skill is so that
those two minutes are not improvised.

Full context of prizes and criteria: `docs/06_JURADO_Y_PITCH.md`.

---

## Non-negotiable rules

1. **The demo is recorded at T − 4 h**, even if the application keeps improving. If it improves
   afterwards, it is re-recorded. If there is no time, a video already exists.
2. **Never demo live against a cold query.** The five test fields are pre-warmed
   in the cache.
3. **The video is downloaded onto the disk of the computer that presents.** Not in the cloud. The wifi of
   the pitch room goes down.
4. **Show what exists.** No "could" and no "with more time we would". What is missing
   is named only once at the end, as what comes next.
5. **Do not promise to have discovered anything.** A jury with astronomers punishes it instantly.

---

## Demo script

Each step has a purpose. The order is not casual: the most impactful goes first, in case they cut it off.

| # | Action | What it demonstrates |
|---|---|---|
| 1 | Open the URL. A field is already blinking | That it really works, without configuring anything |
| 2 | Type **`WISE 0855`** (the name, not coordinates) | That it is for anyone, not for astronomers |
| 3 | Play and then **Difference mode** (first − last). **WISE 0855 is a mandatory case and is always shown**: say honestly that in a single exposure it looks weak and that the motion (~1.3 px over the whole period) is seen in the subtraction (and with the per-sweep sum when it exists). Complements: CatWISE2020 overlay (V2 Juan Pablo; WISE 0855 is not in Gaia, CatWISE carries its proper motion; **done on branch `v/v2-catwise`, PR pending**; skill `coordenadas-astro`) and per-sweep sum with 1/VARIANCE weights (D2 Bryan; **pending**; `docs/10`, `docs/09`). The challenge guide values overlaying Gaia and WISE; do not present them as part of the deployed viewer until they land in `main` | The challenge, fulfilled without exaggeration. It is the moment of the demo |
| 4 | Lower the fps and watch it again | That the controls matter and we know why |
| 5 | Change the band. The same region at another λ | The 102 bands. As far as we could verify, no public tool combines them with the temporal blink on a single screen |
| 6 | Turn on the Gaia overlay (on WISE 0855 there is no Gaia: use CatWISE2020; do it on Barnard or eps Ind B). The markers fall on the sources | *"That is how we know it is correct."* It answers the question before they ask it |
| 7 | Load **eps Ind B** in difference mode | It is where the motion is seen most clearly (−0.85/−0.71 px measured). Challenge bullet |
| 8 | Load **RW Aurigae**: it changes brightness without moving. Careful: it saturates and in the subtraction leaves a red/blue pair even if it does not move; its photometry was not measured, so it is not presented as proof of variability | That the viewer warns when an object saturates |
| 9 | Copy the URL and open it in another tab | Shareable and embeddable. Challenge bullet |
| 10 | If there is a spectrum: click on a source | The "extra kudos" |

If there is only time for three steps: **2, 3 and 5**. Name → it moves → another band.

---

## Recording the video

- **Duration:** whatever the event asks for. If it does not say, 30–60 seconds. A long video is not watched in full.
- **No voice-over audio** if in a hurry: short overlaid subtitles work just as well and there is no
  need to re-record because of a misspoken word.
- **Clean screen:** a single window, no personal tabs, no notifications, no visible
  usernames.
- **Slow cursor.** Fast mouse movements cannot be followed on video.
- **Two or three seconds still** at each key moment, especially when the object moves: the eye
  needs time to see it.
- **No minors** in image or voice, per the event rules.
- Save the file **on the local disk** and upload it wherever the submission asks.

---

## The two-minute pitch

**0:00 – 0:20 · Hook.** In 1930 Pluto was discovered by comparing two photos of the same piece of sky.
Today SPHEREx photographs the entire sky every six months in 102 colors of infrared, and nobody is
looking at it this way.

**0:20 – 1:10 · Live demo.** Half of the time. It is what is judged.

**1:10 – 1:35 · Why it matters.** Most of the known brown dwarfs and comets were
found by volunteers looking at blinks. That community exists and has no way to look at SPHEREx. The
most cited Planet Nine candidate came out of comparing two infrared surveys separated in time:
the same technique.

**1:35 – 2:00 · What we built.** Stack in one sentence, DR1 published this month, public URL, open
source, and one line on what comes next.

**Finishing at 1:50 with everything shown is better than rushing to 2:10.**

---

## The questions, with their answers

**"Doesn't IRSA's Data Explorer already do this?"** — Not for this audience. The Data Explorer is an
archive for astronomers. We resolve the name, group the epochs, normalize and
deliver the blink. It is the difference between an archive and a viewer; the same one that made
WiseView useful compared with the WISE archive.

**"How do I know the image is of that coordinate?"** — By the Gaia overlay. *(And it is shown.)*

**"Why didn't you use machine learning?"** — Because the challenge asks for a viewer for people and
the real bottleneck is fetching and aligning the data, not recognizing the motion. Where AI
contributes is in screening candidates with small networks on crops, as the ALeRCE broker does
with ZTF alerts, and we left it laid out.

**"What happens if I enter a coordinate with no data?"** — *(One is typed and the empty state is shown.)*

**"Does it scale to the whole sky?"** — In coverage yes: the query is by position against SIA2. What does not
scale without infrastructure is the cache; at scale it would be necessary to precompute crops, which is what
unWISE does for WiseView.

**"How correct are the spectra?"** — Indicative, aperture photometry with the zodiacal light
subtracted, and we say so in the interface itself. For science there is IRSA's Spectrophotometry Tool.

---

## Before going out to present

- [ ] Video downloaded onto the disk of the computer that presents.
- [ ] Application open, cache warm, the five fields tested **less than an hour ago**.
- [ ] Tabs: application, video, repository. **Nothing else.**
- [ ] Notifications muted. Presentation mode.
- [ ] Battery or charger.
- [ ] Someone on the team with the video on their phone too.
- [ ] Rehearsed out loud and timed, **three times**.
