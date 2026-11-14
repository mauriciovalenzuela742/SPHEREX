<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/05_PLAN_24H.md) · [中文](../../zh/docs/05_PLAN_24H.md) · [Deutsch](../../de/docs/05_PLAN_24H.md) · [Italiano](../../it/docs/05_PLAN_24H.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/05_PLAN_24H.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 05 — The 24-hour plan

Plan by blocks, with a cut criterion in each. **It is written so that it can be cut.** If a block
overruns its time, the cut is applied and we move on: in a hackathon the enemy is not a lack of
ideas, it is a lack of discipline to abandon one.

Reference schedule for the local Santiago event (work start Saturday 10:00, **submission deadline
Sunday 11:00**, confirmed by JP on Nov 14 and announced live by the organizers; see
[`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)). Pitch: 2 minutes + 2 questions; its time is not
confirmed. If anything changes, the blocks are recalculated, not the order.

| Role | Who |
|---|---|
| D — Data | Vladimir (D1 access) · Bryan (D2 frames) |
| V — Viewer | Antonia (V1 blink) · Juan Pablo (V2 sky) |
| C — Science and verification | Mauricio (+ deployment) |
| N — Narrative and submission | Javiera |

*(Fill in at hour 0. Having everyone know what is theirs avoids half of the friction.)*

---

## Block 0 · Hour 0 – 1 · Everyone · **Align**

The most profitable thing of the whole day and what most teams skip.

- Read [`00_DESAFIO.md`](00_DESAFIO.md) aloud together. 10 minutes. Especially the
  *Potential Considerations*: they are the rubric.
- Split roles and write them at the top of this file.
- **Confirm the exact time of the submission deadline.** T−6, T−4 and T−2 come from it.
- Create the repository on GitHub, upload the kit, give access to all six.
- Bring up `scaffold/`: backend and frontend start and are visible. It does nothing; it comes up.
- Open [`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) and sign the stack decision (or change it).

**Cut:** if at hour 1 the skeleton does not come up, it is an environment problem and everyone tackles it.
Nobody moves on until all six can run the project.

---

## Block 1 · Hour 1 – 3 · D1 + D2 + C · **The moment of truth with the data**

> **Answered on Nov 14:** see [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) and
> [`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md). What follows stays as a reference of the plan.

The block that decides the project. It is the checklist at the end of
[`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md), point by point.

- Real SIA2 query on WISE 0855, in `spherex_dr1` and in `spherex_qr3`. How many rows?
- How many **distinct epochs** are there for a typical field? It decides whether the video has 5 or 50 frames.
- One cutout of `size=0.1`: **time it**. It decides whether a cache, a queue or both are needed.
- Open the cropped MEF. Confirm the 6 extensions.
- **Read `WCS-WAVE` of two epochs of the same field and measure how much the wavelength changes.**
  This is the most important question of the day (see [`02`](02_DATOS_SPHEREX.md) §2).
- Does the DR1 HiPS cube load in Aladin Lite? Does IRSA respond with CORS from the browser?

Meanwhile, **V does not wait**: it sets up the mock of the contract in
[`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) and works against it. **N** starts the README and opens the
submission form to see what it asks for.

**Cut:** at hour 3 there must be a written answer to each question, even if some is «we
couldn't find out». If the cutouts turn out to be unworkable because of slowness, **the plan changes here**, not
at hour 15.

---

## Block 2 · Hour 3 – 8 · **The critical path**

The two paths in parallel, with no dependencies between them.

**D — minimal backend that works end to end**
`/api/epochs` and `/api/frames` for **a single band**, without controls, without modes, with disk cache.
Hard-coded where necessary. **The important thing is that a sequence of PNGs comes out of a coordinate.**

**V — minimal viewer that works end to end**
Coordinate box → call → frames in a `<canvas>` → play/pause. Ugly. Functional.
And Aladin Lite next to it loading the HiPS cube, which is Path A.

**C** — fills `data/campos_de_prueba.yml` with the five objects, verified against SIMBAD, and writes
what should be seen in each. Prepares the check with Gaia.

**N** — README, project name, the one-line sentence. The sentence costs more than it seems
and is what the jury remembers.

**Cut — hour 8 milestone:** *a hand-typed coordinate produces a little video on screen.*
Ugly, slow, a single band, no matter. **If at hour 8 there is no little video, everything else is suspended**
and all six work on it.

---

## Block 3 · Hour 8 – 14 · **Make it good**

Now yes, in order of value. The order comes from the challenge's bullets and from what each costs.

| Priority | What | Who | Why |
|---|---|---|---|
| 1 | Band / detector selection | D + V | It is the 102-bands bullet and fixes the variable-λ problem |
| 2 | Controls: stretch, color, fps, field of view | V | WiseView shows that **without this nothing is seen**. Cheap and decisive |
| 3 | Image subtraction (`diff_first`, `diff_prev`) | D | Explicit bullet. Spectacular on screen. Cheap |
| 4 | Name resolution (SIMBAD) | D + V | Makes the tool usable by anyone |
| 5 | Queryable and shareable URL | V | Explicit bullet. Half an hour of work |
| 6 | Gaia DR3 overlay | V + C | Explicit bullet **and** the proof that the viewer is correct |
| 7 | Contamination flags | D + V | Explicit bullet. A field that already comes in the MEF |
| 8 | On-the-fly spectrum | D | «Extra kudos». The most expensive on the list. **Only if 1–7 are closed** |

**Cut — T − 6 h: scope freeze.** What has not been started is not started. What has been started is
finished or removed. A half-done feature subtracts: the jury clicks right there.

---

## Block 4 · T − 6 h to T − 4 h · **Polish and verify**

- **C runs the five test fields, one by one, in the deployed application.** Not locally.
- Pre-warm the cache for the five. The demo is never done with a cold query.
- Empty and error states: what does the user see if there is no data at that coordinate? If IRSA doesn't respond?
  **The jury will type random coordinates.** Make sure they don't see a blank screen.
- Make it work on a phone, even if only partly. Someone on the jury will open it on their phone.
- Footer with the mandatory SPHEREx attribution ([`02`](02_DATOS_SPHEREX.md) §8).

---

## Block 5 · T − 4 h to T − 2 h · **Demo and submission**

- **Record the demo video.** Script in the `demo-y-pitch` skill. It lasts what the event asks for.
- Leave the **degraded mode** working: the application serves the five fields from cache without
  internet. A hackathon's wifi goes down; the pitch room's, even more.
- **Upload the complete submission**, including the description of how AI was used, which this year is
  mandatory. Checklist in the `entrega-nasa` skill.

**T − 2 h: submitted.** From here on everything else is an optional improvement over something already submitted.

---

## Block 6 · T − 2 h to the pitch · **Rehearse**

- N rehearses the pitch **aloud, timed**, three times. In Santiago it is 2 minutes + 2 questions:
  2 minutes is much less than it seems.
- The other five play the jury and ask the uncomfortable questions:
  - «Doesn't IRSA's Data Explorer already do this?»
  - «How do you know the image is of that coordinate?»
  - «What happens if I enter a coordinate with no data?»
  - «Why didn't you use machine learning?»

  The answers to the first and the last are in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md);
  the second is the Gaia overlay; the third is the empty state from Block 4.
- Leave open in the browser: the deployed application, the video and the repository. Nothing else.

---

## What we would do with 6 more hours

For the answer to «and what's next?», which they always ask:

- Mark and save candidates with a permanent URL, Backyard Worlds style.
- Image subtraction aligned by predicted proper motion (Gaia) instead of by fixed position.
- Automatic candidate vetting with a small network over crops, in the style of ALeRCE's *stamp
  classifier*. **That is the honest role of AI here**, not a video transformer.
- Export the sequence as a GIF or as a Zooniverse subject set.
