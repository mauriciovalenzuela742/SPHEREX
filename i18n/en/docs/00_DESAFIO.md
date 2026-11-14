<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/docs/00_DESAFIO.md) · [中文](../../zh/docs/00_DESAFIO.md) · [Deutsch](../../de/docs/00_DESAFIO.md) · [Italiano](../../it/docs/00_DESAFIO.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/00_DESAFIO.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# 00 — The challenge: Planet X and SPHEREx

Source: <https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/>
Text collected from the official page on **November 14, 2026**, *Details* and *Resources* tabs.
What is in English is verbatim; what is in Spanish and marked `[NOTA]` is our commentary.

| Field | Value |
|---|---|
| Event | 2026 NASA Space Apps Challenge |
| Difficulty | **Advanced** |
| Subjects | Astrophysics · Planets & Moons · Software |

---

## Summary

> Since 2025, NASA's SPHEREx mission has been mapping the entire sky every six months in 102 bands
> of near-infrared light, returning images of more than a billion objects. Comets, asteroids, stars,
> brown dwarfs, and even new planets reveal themselves by shifting position between images, but no
> one person can sift through all that data alone. Your challenge is to create a public-facing web
> tool to display images of the sky from SPHEREx mission, making it easy for anyone to quickly see
> how they change over time.

## Background

> Asteroids and comets orbit around the Sun. Nearby stars march across the sky as they orbit around
> the Galaxy. The Earth orbits the Sun too, causing objects near us to change their apparent
> positions. Watching for these motions help us discover new astronomical objects and also help
> measure the distances to these objects. For example, the dwarf planet Pluto was discovered when an
> astronomer compared two images of the sky taken at different times and recognized that one point
> of light had shifted between images.
>
> More recently, astronomers have mounted massive searches for nearby objects using this process
> with help from the public. Hundreds of thousands of volunteers have used this technique to
> discover asteroids, comets, stars and brown dwarfs—balls of gas too massive to be considered
> planets yet without enough mass to burn like stars. In fact, most of the known comets and brown
> dwarfs were discovered by volunteers in this manner through projects like backyardworlds.org.
>
> Since May 2025, NASA's new SPHEREx mission has been returning unique data that could yield new
> discoveries. SPHEREx is mapping the whole sky once every six months in 102 bands of near-infrared
> light, making it uniquely sensitive to objects that are rich in hydrogen, water, carbon dioxide,
> carbon monoxide, and many other molecules. There will be too much data for any one person or even
> computer code to completely comprehend. There will be images of more than a billion objects -
> including brown dwarfs, quasars, comets, asteroids, stars, supernovae and galaxies - which often
> overlap or vary in brightness. We need your creative new tools to make the most of this treasure
> trove and help as many people as possible pitch in to make discoveries.

## Objectives

> Your challenge is to create a public-facing web tool to display images of the sky from the SPHEREx
> mission, making it easy for anyone to quickly see how they change over time. Users will enter the
> coordinates of a patch of sky (Right Ascension and declination). Your tool will display a series
> of images of that patch like a little video, making it easy to spot moving objects.
>
> Test your tool on Barnard's Star, Epsilon Indi B (a pair of brown dwarfs orbiting a star),
> WISE 0855 (a fast-moving brown dwarf Right Ascension 08h55m10.831s, declination -7d14m42.53s),
> and variable stars RW Aurigae and R Draconis.

`[NOTA]` The five test objects are developed, with coordinates verified in SIMBAD on
Nov 14, 2026 and what should be seen in each, in
[`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml). **They are the de facto
acceptance criterion**: if the tool behaves well on all five, it is finished.

`[NOTA — IMPORTANTE]` **The coordinate that the brief gives for WISE 0855 is from the WISE epoch
(~2010.4), not the current position.** Verified: that coordinate matches within 0.2 arcsec the
object's position propagated to 2010.4, and the object moves 8.15 arcsec per year. By late 2026
it is some 130 arcsec from there. If the viewer is centered on the brief's coordinate with a field of
0.05 degrees or smaller, **the object falls outside the field**. It is, by far, the most likely way
for the main demo to appear not to work. Details and propagated positions in the test fields
file.

## Potential Considerations

> You may (but are not required to) consider the following:
>
> - New SPHEREx data is arriving fast! Make sure to design a tool that's easy to update with the
>   latest data releases.
> - Think creatively about how to display those 102 infrared bands so users can take advantage of
>   them to make new discoveries! For example, it may make sense to separately add together all the
>   data taken by each of the six detector arrays to improve the signal-to-noise in the images you
>   display. Extra kudos if your tool can generate spectra on the fly.
> - It may help users discover moving objects if they have the options to add together or subtract
>   images taken at different times.
> - Let users choose the field of view! Larger fields of view can make it possible to track
>   faster-moving sources, at the cost of longer data transfer times.
> - Users could benefit from having the option to overlay astronomical data from other telescopes,
>   such as the Gaia mission or the WISE mission.
> - If you make it possible to query your tool by including coordinates in the URL, users will be
>   able to easily embed it in other websites and projects.
> - It can be useful to display metadata, like contamination flags.
> - Consider looking for publicly available tools that may help in handling astronomical data, like
>   the Astrophy tools, and in displaying astronomical data, like the Aladin tool developed by the
>   Strasbourg Astronomical Data Center (CDS).

`[NOTA]` "Astrophy" is a typo on the page for **Astropy**.

`[NOTA]` In practice these eight bullets are the differentiation rubric: they are what the challenge
author expects to set a good project apart. In [`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md)
they are translated into product decisions, and in [`05_PLAN_24H.md`](05_PLAN_24H.md) into work order.

---

## Resources (*Resources* tab, verbatim)

> NASA does not endorse any non-U.S. Government entity and is not responsible for information
> contained on non-U.S. Government websites. For non-U.S. Government websites, participants must
> comply with any data use parameters of that specific website.

### NASA Data & Resources

| Resource | URL | Official description |
|---|---|---|
| NASA/IPAC Infrared Science Archive | <https://irsa.ipac.caltech.edu/Missions/spherex.html> | SPHEREx resources |
| SPHEREx Tutorial Notebooks | <https://caltech-ipac.github.io/irsa-tutorials/spherex/> | Example Jupyter notebooks for how to access the SPHEREx data via Python |
| WiseView | <http://byw.tools/wiseview> | A similar tool made for viewing data from an earlier NASA mission called WISE. It's been used by the public to make hundreds of discoveries. Feel free to use it as a model or as inspiration! |
| Gaia Mission Data | <https://archive.stsci.edu/missions-and-data/gaia> | Be sure to use the latest data release (Data Release 3) |

### Space Agency Partner Resources — CSA (Canadian Space Agency)

| Resource | URL | Official description (abridged) |
|---|---|---|
| NEOSSat: Observing Asteroids, Space Debris and Exoplanets | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> | The first space telescope dedicated to detecting and tracking asteroids, comets, satellites and space debris |
| Canadian Astronomy Data Centre (CADC) | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> | Archive of astronomical observations from Canadian and international telescopes and missions |
| NEOSSat Data Tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> | Python tutorial for visualizing NEOSSat data |
| NEOSSat Dataset | <https://data.asc-csa.gc.ca/dataset/neossat> | NEOSSat observations |

> For data and resources related to this challenge, refer to the Resources tab at the top of the
> page. More resources may be added before the hackathon begins.

`[NOTA]` The page warns that resources may be added. **Look at the Resources tab again when the
event starts** and, if it changed, update this file: it is the team's source of truth.

---

## Reading of the challenge (team commentary)

Three things that are not spelled out in full but can be deduced from the text:

1. **The deliverable is a viewer, not a detector.** "Make it easy for anyone to quickly see" and "like a
   little video, making it easy to spot moving objects". The one who detects is the human user. An
   automatic classifier can add to it, but if it replaces the viewer, the project does not answer the challenge.

2. **The target audience is anyone, not an astronomer.** The challenge cites backyardworlds.org, a
   citizen science project with hundreds of thousands of volunteers. That governs the design:
   the first screen has to work without knowing what a right ascension is.

3. **The 102 bands are SPHEREx's own angle.** WiseView already exists and does the blink in WISE.
   What nobody has done yet for the general public is the blink **plus** the spectral axis:
   so that the user sees not only that something moves, but what it is made of. The bullet "extra kudos if
   your tool can generate spectra on the fly" is the challenge's most explicit hint.
