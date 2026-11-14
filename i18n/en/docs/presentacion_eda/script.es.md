---
title: "What the SPHEREx data told us"
author: Equipo SPHEREx · NASA Space Apps 2026
date: 2026-11-14
place: Santiago
profile: night
lang: es
transition: fade
audience: The hackathon team (6 people). One member with no astronomy experience, one computer scientist, the rest with astronomy.
message: The fastest stars move 1–2 pixels in a year of SPHEREx; we make it visible by matching the wavelength, aligning and subtracting.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/docs/presentacion_eda/script.es.md) · [中文](../../../zh/docs/presentacion_eda/script.es.md) · [Deutsch](../../../de/docs/presentacion_eda/script.es.md) · [Italiano](../../../it/docs/presentacion_eda/script.es.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/presentacion_eda/script.es.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

<!-- Todas las cifras salen de docs/09_EDA_HALLAZGOS.md y eda/resultados/. Las imágenes son recortes reales de
     IRSA, procesados por figures/make_figures.py. Los valores de animations.js se copiaron de su salida. -->

## What the SPHEREx data told us
@type cover
@class full
@anim portada
@subtitle EDA with real IRSA data · November 14, 2026
> The image on the right is real: the brown dwarf Epsilon Indi B in five SPHEREx photos, from 2025 to 2026. At the end of the talk we will see that exactly what has to move does move.
@why The cover already shows the real data that the talk explains: the blink of an object that moves.

## The idea of the challenge: compare photos of the same sky on different dates
@kicker The idea
@class full
@anim idea
@steps 1
@source Diagram, not real data. This is how Pluto was discovered in 1930 and how Backyard Worlds volunteers work.
> First the blink: two photos of the same patch of sky, alternated. Almost everything stays still; one star jumps. Then the subtraction: what does not change disappears and what moved leaves a pair, red where it is now and blue where it was.
@why The method is explained with a diagram before the real data, for those who do not know the problem. Blink and subtraction are the two views of the viewer.

## SPHEREx looks in the infrared, beyond red, with 6 detectors
@kicker The instrument
@figure figures/bandas.svg
@source Ranges per detector: IRSA documentation (docs/02_DATOS_SPHEREX.md §1). A micrometer (µm) is a thousandth of a millimeter.
> The eye sees between 0.4 and 0.75 micrometers. SPHEREx starts where red ends and reaches 5. It divides this into 6 detectors, D1 to D6. Cold brown dwarfs shine mostly in the long detectors.
@why Orients the audience with no astronomy background: infrared is «beyond red», and the six detectors are the unit used afterwards.

## The SPHEREx trick: the color it measures changes along the detector
@kicker The linear variable filter
@class full
@anim lvf
@steps 5
@source Diagram. Real range of detector 5 (3.82–4.44 µm) according to the WCS-WAVE table; the spectrum points are illustrative.
> Each strip of the detector measures a different color. The spacecraft points again and the star falls on another strip: it is measured in another color. Putting the photos together builds its spectrum. But that means two photos of the same star are almost never in the same color.
@why It is a transformation (the detector shifts and the point changes color) and a still figure cannot tell it: it meets the four conditions for animating.

## For each star there are hundreds of photos, in 3 or 4 sweeps over a year
@kicker How much data there is
@figure figures/cobertura.svg
@source SIA2 query to spherex_dr1 and spherex_qr3 (eda/resultados/inventario.json). R Dra also has 1,966 files in deep fields, not drawn.
> Each dot is a file. The sweeps can be seen: SPHEREx passes over each area every six months and, on each pass, takes dozens of photos over a few weeks. The time baseline runs from 1 to 1.4 years.
@why Small multiples on the same time axis: the five fields can be compared at a glance.

## But each photo is in a different color: we have to choose the ones that match
@kicker First problem
@figure figures/lambda_wise.svg
@source WISE 0855, detector 5: color in which the object landed in each file, computed with the header of each file and the WCS-WAVE table (eda/resultados/lambda_por_archivo.csv).
> If we take the first photo of each sweep, the color jumps by almost half a micrometer: the brightness would change without anything happening. But each color repeats every six months, so we can choose photos of the same color: the variation drops to 0.035 micrometers.
@why The accent goes to the good selection; the bad one is in red and what is context in gray.

## The detector rotates 180° between sweeps: before comparing we have to align
@kicker Second problem
@class full
@anim giro
@steps 1
@source Two real cutouts of Barnard (D2) unaligned. Detector angle on the sky read from the header: −179.6° and +1.1°.
> The two photos are of the same piece of sky, but the one on the right is upside down. When we rotate it 180°, the same stars coincide. In the code this is done by reprojecting everything to a grid with north up.
@why Rotating is a transformation: watching it rotate is more convincing than two images with an arrow.

## Aligned and at the same color, Epsilon Indi B moves exactly as the catalog predicts
@kicker The result
@class full
@anim epsind
@steps 1
@source Centroids in the first and last photo (2025.31 and 2026.74), reprojected to the same grid (eda/resultados/centroides.json). Prediction: SIMBAD proper motion. Enlarged: 18×18 pixels of 6.15″.
> The circle is where the catalog says it should be on each date. It shifts to the left and down, which on the sky is east and south. We measured 0.85 and 0.71 pixels; the catalog predicts 0.92 and 0.57. The surrounding stars, which do not move, shift by less than 0.4.
@why Real data before the rule, and the numerical check on the same slide as the image.

## The subtraction turns motion into a red and blue pair, but a saturated star deceives
@kicker The subtraction
@class full
@anim restas
@steps 2
@source Last − first subtraction, normalized. Core flagged as bad: Barnard 44 of 49 pixels, RW Aur 6–8, eps Ind B 0–1 (eda/resultados/centroides.json).
> Epsilon Indi B: the red-blue pair is real motion. Barnard: it also moves, toward the north, but it is saturated and cannot be measured. RW Aur does not move and still leaves a pair: it is the effect of saturation. The viewer has to warn when an object saturates.
@why One panel is revealed per step (segmentation) to compare the three cases with the same color code.

## WISE 0855 is barely visible in a single photo: to show it we have to add up
@kicker A hard case
@class full
@anim wise
@source Four real cutouts of WISE 0855 on detector 5 at the same λ (4.15–4.18 µm). The circle is the predicted position.
> The object the statement proposes is too faint for a single exposure. The solution is to add up the photos of each sweep, which is exactly one of the ideas the challenge suggests.
@why A still slide after the animated ones: here the discussion opens about what to show in the demo.

## Each cutout takes 7 seconds and the browser cannot request it: everything goes through a backend with a cache
@kicker For the code
@figure figures/latencia.svg
@source 25 cutouts of 0.1° (eda/resultados/latencia_cutouts.json): median 7.3 s, maximum 29 s, ~3.9 MB each. IRSA does not respond with CORS (eda/resultados/infraestructura.json).
> The cutout weighs the same whether small or large, because it brings the whole description of the star's image. There were 503 errors. And IRSA does not let a web page request data directly. Conclusion: backend, disk cache and pre-warming the demo fields.
@why The full distribution, not just the median: the 29 s tail that would bring down a live demo is visible.

## The quality mask: the SOURCE bit is not an error
@kicker Filters
@figure figures/flags.svg
@source FLAGS bits in 25 cutouts. The names come in the header of the FLAGS extension itself.
> If we filter «everything that has any bit», we erase 72% of the image, because SOURCE only says that there is a star there. The bits that truly indicate a bad pixel add up to about 4%.
@why The blue accent marks the case that is not an error; in red the bits that invalidate a pixel.

## Seven pieces end to end, each with its owner
@kicker The split
@class full
@anim flujo
@steps 1
@source Split from the team plan (README §3, docs/05_PLAN_24H.md); EDA tasks by role in docs/10_REPARTO_DE_TRABAJO.md.
> First the data path, from the coordinate to the image on screen. Then who takes each piece, according to the plan we already agreed: the EDA loads more work onto D2, who receives the λ selection, the filters and the subtractions.
@why The split is read over the data flow: each person sees where their piece fits and what it connects to.

## What we still do not know
@kicker For discussion
- **How does a moving object look in the cube?** The HiPS cube that Aladin loads mixes all the epochs.
- **How much does WISE 0855 improve when adding up** the photos of a sweep?
- **What does the viewer do with saturated stars?** Warn, show the mask or change detector.
- **Brightness:** we have not yet measured the variability of RW Aur or R Dra.
@source docs/09_EDA_HALLAZGOS.md §7.
> To remember: the fastest stars move one or two pixels in a year; we make it visible by matching the color, aligning and subtracting.
@why Closing with what is open and the message, not with a «thank you».

## Sources
@appendix
- Data: IRSA/IPAC, SIA2 collections spherex_dr1 and spherex_qr3, queried on Nov 14, 2026.
- Proper motions: SIMBAD (CfA mirror), in data/campos_de_prueba.yml.
- Scripts: eda/01_inventario.py to eda/05_centroides.py; figures: docs/presentacion_eda/figures/make_figures.py.
- Attribution: This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
@why Where each figure lives, so it can be recalculated.
