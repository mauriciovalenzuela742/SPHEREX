<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/docs/00_DESAFIO.md) · **Español** · [中文](../../zh/docs/00_DESAFIO.md) · [Deutsch](../../de/docs/00_DESAFIO.md) · [Italiano](../../it/docs/00_DESAFIO.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `docs/00_DESAFIO.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# 00 — El desafío: Planet X and SPHEREx

Fuente: <https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/>
Texto recogido de la página oficial el **14 de noviembre de 2026**, pestañas *Details* y *Resources*.
Lo que está en inglés es literal; lo que está en castellano y marcado `[NOTA]` es comentario nuestro.

| Campo | Valor |
|---|---|
| Evento | 2026 NASA Space Apps Challenge |
| Dificultad | **Advanced** |
| Materias | Astrophysics · Planets & Moons · Software |

---

## Resumen

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

`[NOTA]` Los cinco objetos de prueba están desarrollados, con coordenadas verificadas en SIMBAD el
14-nov-2026 y qué debería verse en cada uno, en
[`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml). **Son el criterio de aceptación de
facto**: si la herramienta se comporta bien en los cinco, está terminada.

`[NOTA — IMPORTANTE]` **La coordenada que el enunciado da para WISE 0855 es de la época de WISE
(~2010,4), no la posición actual.** Verificado: esa coordenada coincide dentro de 0,2 arcsec con la
posición del objeto propagada a 2010,4, y el objeto se mueve 8,15 arcsec al año. A finales de 2026
está a unos 130 arcsec de ahí. Si se centra el visor en la coordenada del enunciado con un campo de
0,05 grados o menor, **el objeto queda fuera del campo**. Es, con diferencia, la forma más probable
de que la demo principal parezca no funcionar. Detalle y posiciones propagadas en el archivo de
campos de prueba.

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

`[NOTA]` «Astrophy» es una errata de la página por **Astropy**.

`[NOTA]` Estas ocho viñetas son, en la práctica, la rúbrica de diferenciación: son lo que el autor
del desafío espera que distinga a un buen proyecto. En [`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md)
están traducidas a decisiones de producto, y en [`05_PLAN_24H.md`](05_PLAN_24H.md) a orden de trabajo.

---

## Resources (pestaña *Resources*, literal)

> NASA does not endorse any non-U.S. Government entity and is not responsible for information
> contained on non-U.S. Government websites. For non-U.S. Government websites, participants must
> comply with any data use parameters of that specific website.

### NASA Data & Resources

| Recurso | URL | Descripción oficial |
|---|---|---|
| NASA/IPAC Infrared Science Archive | <https://irsa.ipac.caltech.edu/Missions/spherex.html> | SPHEREx resources |
| SPHEREx Tutorial Notebooks | <https://caltech-ipac.github.io/irsa-tutorials/spherex/> | Example Jupyter notebooks for how to access the SPHEREx data via Python |
| WiseView | <http://byw.tools/wiseview> | A similar tool made for viewing data from an earlier NASA mission called WISE. It's been used by the public to make hundreds of discoveries. Feel free to use it as a model or as inspiration! |
| Gaia Mission Data | <https://archive.stsci.edu/missions-and-data/gaia> | Be sure to use the latest data release (Data Release 3) |

### Space Agency Partner Resources — CSA (Canadian Space Agency)

| Recurso | URL | Descripción oficial (resumida) |
|---|---|---|
| NEOSSat: Observing Asteroids, Space Debris and Exoplanets | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> | El primer telescopio espacial dedicado a detectar y seguir asteroides, cometas, satélites y basura espacial |
| Canadian Astronomy Data Centre (CADC) | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> | Archivo de observaciones astronómicas de telescopios y misiones canadienses e internacionales |
| NEOSSat Data Tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> | Tutorial en Python para visualizar datos de NEOSSat |
| NEOSSat Dataset | <https://data.asc-csa.gc.ca/dataset/neossat> | Observaciones de NEOSSat |

> For data and resources related to this challenge, refer to the Resources tab at the top of the
> page. More resources may be added before the hackathon begins.

`[NOTA]` La página advierte que pueden añadirse recursos. **Vuelve a mirar la pestaña Resources al
empezar el evento** y, si cambió, actualiza este archivo: es la fuente de verdad del equipo.

---

## Lectura del desafío (comentario del equipo)

Tres cosas que no están dichas con todas sus letras pero se deducen del texto:

1. **El entregable es un visor, no un detector.** «Make it easy for anyone to quickly see» y «like a
   little video, making it easy to spot moving objects». El que detecta es el usuario humano. Un
   clasificador automático puede sumar, pero si reemplaza al visor, el proyecto no responde al desafío.

2. **El público objetivo es cualquiera, no un astrónomo.** El desafío cita backyardworlds.org, un
   proyecto de ciencia ciudadana con cientos de miles de voluntarios. Eso manda sobre el diseño:
   la primera pantalla tiene que funcionar sin saber qué es una ascensión recta.

3. **Las 102 bandas son el ángulo propio de SPHEREx.** WiseView ya existe y hace el blink en WISE.
   Lo que nadie ha hecho todavía para el público general es el blink **más** el eje espectral:
   que el usuario vea no solo que algo se mueve, sino de qué está hecho. La viñeta «extra kudos if
   your tool can generate spectra on the fly» es la pista más explícita del desafío.
