---
name: entrega-nasa
description: Checklist and templates for submitting the project on the NASA Space Apps Challenge platform - what the form asks for, the project summary, the mandatory description of how artificial intelligence was used, the links to demo and repository, the attribution of NASA data, and the rules on minors and content. Activate it when submitting, submission, uploading the project, submission form, submission deadline, AI-use declaration are mentioned, or when only a few hours remain and the submission has to be closed.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../../es/.claude/skills/entrega-nasa/SKILL.md) · [中文](../../../../zh/.claude/skills/entrega-nasa/SKILL.md) · [Deutsch](../../../../de/.claude/skills/entrega-nasa/SKILL.md) · [Italiano](../../../../it/.claude/skills/entrega-nasa/SKILL.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/skills/entrega-nasa/SKILL.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Submission on the platform

**The number one reason a good project wins nothing is submitting late or incomplete.**
This skill exists so that does not happen.

**Rule:** the submission is uploaded at **T − 2 h**, not at T. You can keep editing afterwards, but it is
already submitted.

**N opens the form in hour 1 of the event**, not in hour 22, to see what it really asks.
What is here is what we know; the platform rules.

---

## What the submission asks for (what we know)

- Project name and short summary.
- Project description: what it does, how they did it, what data they used.
- **Description of how AI was used in the project. Mandatory this year.**
- Link to the demo (video or deployed application).
- Link to the code repository.
- Resources and data used, with their sources.

It is submitted from the team's project page on spaceappschallenge.org, according to the local event's
closing time: **Sunday Nov 15, 11:00** (confirmed by JP on Nov 14). Submit at 09:00 (T − 2 h).

---

## Templates

### Short summary

> *(One or two sentences. What the jury reads first and sometimes the only thing.)*
>
> `<Nombre>` is a public web tool that shows any piece of sky as SPHEREx sees it over time,
> like a little video, so that anyone can detect objects that move or change brightness.
> It adds the spectral axis: the mission's 102 infrared bands
> *(include "with spectra generated on the fly" only if `/api/spectrum` makes it into the demo)*.

### Description

Four blocks, in this order:

1. **The problem.** Why it is needed: SPHEREx maps the entire sky every six months in 102
   bands and nobody is looking at it for what moves. The blink technique discovered
   Pluto and still discovers brown dwarfs and comets thanks to volunteers.
2. **What we built.** The viewer, the controls, the overlays, the shareable URL. What **exists**,
   not what was planned.
3. **How we built it.** The real data used (release, collections, IRSA services), the
   stack, and the problems that had to be solved — **in particular the linear variable filter one**,
   which is what shows that we understood the instrument and did not just download images.
4. **What comes next.** Honestly: what we did not get to and why.

### AI-use declaration

It is not a formality. Well written, it is evidence of method. Badly written ("we used ChatGPT to code")
it wastes an opportunity.

> **How we used artificial intelligence in this project**
>
> We used programming assistants based on language models (Claude Code and Antigravity) as a
> development tool during the 24 hours of the event, with an explicit method:
>
> - **What we asked of them:** writing integration code with the IRSA archive, interface components,
>   tests and documentation, from an API contract and conventions that the team fixed
>   at the start and that are versioned in the repository (`AGENTS.md`).
> - **How we controlled the result:** every change went through human review before being integrated.
>   We worked with the rule of verifying the artifact and not the report: no feature was considered
>   finished because an assistant said so, but after opening it and checking it against real data
>   and against external catalogs.
> - **What we did NOT do:** we did not use models to generate, invent or complete scientific data.
>   All the images, wavelengths and metadata the tool shows come from the
>   files published by the SPHEREx mission through IRSA.
> - **Why we did not use vision or video models for detection:** we evaluated it and
>   discarded it with reasons. The challenge asks for a viewer so that people detect; the real
>   bottleneck is data access and alignment. We documented in the repository
>   where a model would contribute —candidate screening with small networks on crops, in the style
>   of the ALeRCE broker— as next work.
>
> *(Adjust to what really happened. If something else was used, say so. If Spherix uses an LLM in production, declare it here with the model and what data it receives.)*

### Data and resources used

List with links: SPHEREx's mission page at IRSA, the specific release (DR1 / QR3) and the
SIA2 collections, the IRSA services used (cutouts, HiPS cube, MOST…), Aladin Lite 3.8.2, the SPHEREx DR1
HiPS cube (IRSA), Gaia DR3 (VizieR, Harvard/CfA mirror), SIMBAD (CDS and Harvard mirror), Astropy. If any resource from the partner agency (CSA/NEOSSat) was used,
name it: **it counts toward the *Global Connection* criterion**.

### Mandatory attribution

In the README and in the tool's footer, verbatim:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## Final checklist

**Content**

- [ ] Project name and short summary.
- [ ] Description with the four blocks.
- [ ] **AI-use declaration.** Mandatory.
- [ ] List of data and resources with links.
- [ ] SPHEREx attribution, verbatim.

**Links — tested from outside the event wifi**

- [ ] Demo video. **Opened from a mobile phone on mobile data.**
- [ ] Deployed application. Same.
- [ ] **Public** repository, accessible without being logged in.
- [ ] The repository README explains what it is, how to run it and what data it uses.

**Rules**

- [ ] No photos, video or voices of minors.
- [ ] No keys, tokens or credentials in the repository.
- [ ] No personal data of the members.
- [ ] License declared.

**Last**

- [ ] Someone other than the person who wrote it reads the entire submission from start to finish.
- [ ] **Submitted before T − 2 h.**
