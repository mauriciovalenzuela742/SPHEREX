<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/docs/briefings/01_el_desafio_y_los_datos.md) · [中文](../../../zh/docs/briefings/01_el_desafio_y_los_datos.md) · [Deutsch](../../../de/docs/briefings/01_el_desafio_y_los_datos.md) · [Italiano](../../../it/docs/briefings/01_el_desafio_y_los_datos.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `docs/briefings/01_el_desafio_y_los_datos.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Audio 1 of 2 — SPHEREx: the challenge and the data

Preparation material for Juan Pablo, on the way to the NASA Space Apps Challenge 2026, where his team
of six people from the astronomy lab will take on the **Planet X and SPHEREx** challenge.

This is the first of two audios. This one covers **what the challenge asks for and what data you work with**.
The second covers strategy, working method and the pitch.

Let it be clear from the start, because it is what is most often misunderstood: **the deliverable is not an
artificial intelligence model. It is a web tool.**

---

## 1. What the challenge asks for, exactly

The statement says: create a public web tool that shows images of the sky from the SPHEREx mission, so
that anyone can easily see how they change over time. The user enters the coordinates of a piece of sky
—right ascension and declination— and the tool shows a series of images of that region, like a little video, so
that it is easy to spot moving objects.

Declared difficulty: **Advanced**. Subjects: astrophysics, planets and moons, software.

The challenge names five objects to test the tool: Barnard's star, Epsilon Indi B
—a pair of brown dwarfs orbiting a star—, WISE 0855 —a fast-moving brown dwarf, whose coordinates the statement gives explicitly— and two variable stars, RW Aurigae and
R Draconis.

Those five objects are, in practice, the acceptance criterion. If the tool behaves
well with all five, it is done.

**It must be stressed what the challenge does not ask for.** It does not ask for an automatic detector. It does not ask for a
classifier. It does not ask for a scientific pipeline. The one who detects is the human user. A video
classification model can be added as an optional layer, but if it replaces the viewer, the project
simply does not answer the statement.

---

## 2. Why a viewer and not an algorithm: the logic of the challenge

The technique is almost a hundred years old. Clyde Tombaugh discovered Pluto in 1930 with a blink
comparator: two photographic plates of the same region of the sky taken on different dates,
alternated quickly. What is still does not move; what shifts, jumps out at you.

A century later the technique is the same, only the medium has changed. And it is still competitive.
The statement itself says it: most of the known comets and brown dwarfs were discovered by
volunteers looking at blinks, through citizen science projects such as
Backyard Worlds. Hundreds of thousands of people have found objects that the survey's automatic
algorithms had let slip, typically in areas of high stellar density, near bright
sources, or with artifacts that confuse a detector but not a person.

That is the rationale for the challenge, and it is worth being able to say it in one sentence: **a viewer is not requested
because it is easier than an automatic detector, but because the human eye at crowd scale
solves cases that the automatic detector does not.**

---

## 3. The explicit model: WiseView

The challenge names a tool as a model: **WiseView**, at byw.tools. It is a browser tool that blinks combined images from the WISE telescope over a time baseline of
several years. The user only enters coordinates and adjusts three things: the stretch of the image,
the color map and the blink speed.

It was born as a makeshift tool by two Backyard Worlds volunteers who wanted to better classify their own
candidates. Today it has enabled hundreds of discoveries of brown dwarf candidates, by
amateurs and professionals alike.

Three lessons to copy without shame:

First, **a coordinate box and nothing else** on the first screen. Second, **the controls
matter**: stretch, color and speed are what turn a smudge into a
discovery, they are not decoration; if they are cut for lack of time, you cut precisely what
makes the tool useful. And third, **WiseView has an API**, and that turned it into infrastructure:
there are third-party packages built on top of it to generate material and upload it to citizen science
platforms.

And most importantly: **what WiseView does not do.** It has no spectral axis. WISE has four broad
bands. SPHEREx has 102. That is the project's gap.

---

## 4. What SPHEREx is

SPHEREx is a NASA mission that since May 2025 maps the entire sky every six months
in the near infrared, between 0.75 and 5 micrometers, split into **102 spectral channels**. That spectral
coverage makes it especially sensitive to objects rich in hydrogen, water, carbon dioxide,
carbon monoxide and other molecules. It will produce images of more than a billion
objects: brown dwarfs, quasars, comets, asteroids, stars, supernovae and galaxies, which often
overlap or vary in brightness.

The instrument has six detectors, divided by a dichroic into three short-wave and three
long-wave. Each band covers a different range: band 1 goes from 0.75 to 1.09 micrometers, band 2 from
1.10 to 1.62, band 3 from 1.63 to 2.41, band 4 from 2.42 to 3.82, band 5 from 3.83 to 4.41, and band 6 from 4.42 to 5.00.
The last two have much higher spectral resolution than the first ones.

---

## 5. The technical detail that decides the project: the linear variable filter

This is the most important thing in the whole audio. If there is only one thing to remember, it is this.

SPHEREx **has no discrete filters**. It has a linear variable filter: the wavelength changes
continuously along one axis of the detector. In the words of the archive's documentation:
SPHEREx obtains spectra through multiple exposures, placing a given source at different
positions of the field of view, where it is measured at different wavelengths, by repointing the spacecraft.

In other words: the spectrum of a source is built by observing it many times, each time in a
different part of the detector, and therefore **each time at a different wavelength**.

The consequence is enormous for this challenge, and it is worth having it clear from the first hour. If you
take all the images that cover a position of the sky, crop them and run them in sequence, **you do not
get a clean blink. You get a strobe-like sequence**, where the brightness of each source
jumps because each frame is at a different wavelength. A red star will appear bright in
some frames and faint in others without having moved or changed.

That ruins exactly what the challenge wants to show: what moves and what truly varies.

There are three ways out, in order of cost. The first: **group by band or by detector before blinking**,
so that each frame of the video is of the same band at different epochs. This
is, moreover, the literal reading of one of the statement's suggestions, which says that it may make
sense to add up separately all the data taken by each of the six detectors. The second:
group by wavelength using the extension the file carries with the pixel-to-wavelength
map. More correct and more expensive. And the third: normalize each frame with robust percentiles,
which is a visual patch, not a physical solution, but in 24 hours it can save the demo.

And if even that does not come out clean, there is a fourth way out, which is to turn it into a feature: show the
wavelength of each frame on screen and explain that the blink is spectral information,
not noise. It is true, and in front of a technical jury it adds rather than subtracts.

**The first thing to do with real data is to measure how much the wavelength changes between two
epochs of the same field.** Before deciding anything about architecture.

---

## 6. Where the data live

The archive is **IRSA**, the Infrared Science Archive at IPAC in Caltech. There are four access paths,
and it is worth knowing them all.

**Browsable directories.** The products are organized in folders that can be walked with
a browser, useful for understanding the organization and for bulk downloads, but not for searching
by coordinate.

**The SIA2 protocol**, which is the International Virtual Observatory Alliance standard for
simple image access. It is the main route: you query by position on the sky and it returns the
list of images that cover it, with the download URL of each one.

**The cutout service.** This is critical: each spectral image file weighs about 70
megabytes. Downloading them whole to show a small crop is unworkable in a hackathon and in a
public tool. The cutout service is invoked simply by appending to the file's URL the
center in coordinates and the size in degrees. A warning: **cutouts only work on
files hosted at IPAC**, not on the copy that is on Amazon.

And **Python**: the pyvo and astroquery libraries wrap all of this, and the archive publishes official
example notebooks. There is also a third-party package, spxquery, that already automates the query,
the download with cutout, aperture photometry with zodiacal light subtraction and light curves.
It is worth looking at its architecture before writing anything of your own, even if you do not use it: it already solved the
problems the team is going to run into.

---

## 7. What is inside a file

The main product is a multi-extension FITS, 2040 by 2040 pixels, with six
extensions. It is worth knowing them because several are direct opportunities.

The first is the calibrated **image**, in surface brightness units. The second is the
**flags**, a per-pixel bit map with the status and processing of each one: this extension is
the direct answer to one of the statement's suggestions, which asks to show metadata such as
contamination indicators. Showing them in the interface is cheap and is exactly what the author
of the challenge asked for. The third is the **variance**. The fourth is the **zodiacal light** model, and here
there is a detail worth gold: **the zodiacal light is not subtracted from the image**. Subtracting it is
one line of code and greatly improves the contrast of faint sources. The fifth extension is the
point spread function, and the sixth is the table that maps pixel to wavelength.

Two known traps. One: the wavelength table uses an uncommon part of the FITS standard
that, according to the archive itself, not all readers implement yet; if the reader does not recognize it,
you have to interpolate between the nearest control points, with a precision of about one
nanometer, enough for visualization but not for science. And two: FITS headers number the
pixels from one, whereas Astropy numbers them from zero. It is the classic cause of
one-pixel offsets.

One more detail that the code must tolerate: **not all observations carry all six
bands**. Quality is evaluated band by band and some do not reach the archive.

---

## 8. What just happened and nobody else knows: Data Release 1

This is important and it is fresh information. The release chronology is: July 2025, first
Quick Release; October 2025, the second; September 2026, the third; and **November 2026
—this very month— Data Release 1**.

It is very likely that no other team at the hackathon is using it, and almost certain that the tutorials
and examples circulating on the internet still point to the version from a year ago, which is no longer
even searchable through the query protocol.

And Data Release 1 brings something that changes the project's architecture: **an all-sky cube,
with one mosaic for each of the 102 channels, published in HiPS format**.

HiPS is the hierarchical tile format of the Strasbourg astronomical data center, and it is
precisely the format that **Aladin Lite consumes directly in the browser**. Aladin Lite is,
moreover, the tool the statement itself suggests using to display astronomical data.

What this means in practice: **there is a way to show the 102 bands of the whole sky
without writing a single line of backend.** It is the project's fast route and its safety net: if the backend
falls behind or goes down, that part keeps working and there is something to show.

It is worth not confusing the two products, because they answer different questions. **Level 2 images
give the time axis**: many epochs, native resolution, and it is where the blink comes from. **The all-sky cube
gives the wavelength axis**: 102 channels, coarse resolution, and it is where the context and the 102 bands as an image come from (PNG without fluxes: the spectrum comes from the level 2 files). The viewer the challenge asks for needs both.

---

## 9. Tools the archive already has

Before building something, it is worth checking whether IRSA already did it. It has a data explorer with
a graphical interface, a cutout tool, a mosaic tool, a spectrophotometry tool using
forced photometry —which is the archive's answer to the suggestion of generating spectra on the fly—,
a source discovery tool, and an especially interesting one: **MOST**, the moving-object
search tool, which, given the orbit of a solar system object, finds the SPHEREx
images that covered its predicted position at each epoch. With that, a «follow this asteroid» tab
comes almost for free.

And there is a hook for a demo: the archive has a **collection dedicated to the interstellar
comet 3I/ATLAS**. A fast-moving, recent object that the public knows. For two
minutes of demonstration it is worth more than any brown dwarf.

---

## 10. The other data: the overlays

The statement suggests allowing the overlay of data from other telescopes, and mentions Gaia and WISE.

It is worth understanding that **Gaia is not just visual decoration: it is the viewer's quality control.**
Gaia gives positions, proper motions and parallaxes with extraordinary precision. If you draw
over the image the position that Gaia predicts for a star at the date of that specific epoch, and
the marker lands right on the bright dot, it is proven that the coordinate system, the dates and the crop
are all right.

It is the cheapest way there is to prove to a jury that the tool is correct and not just
pretty. And it answers, before they ask it, the obvious question: how do I know this image is of the
coordinate I asked for?

One detail to watch: Gaia Data Release 3 has reference epoch 2016, not 2000. Confusing them introduces
an error of sixteen years of proper motion.

---

## 11. The five test objects, and what each one demonstrates

**WISE 0855** is a mandatory case, one of the organizers' test objects, and it is always shown: very high proper
motion, one of the coldest objects known outside the solar system and
very close. It should shine in the long bands and be almost absent in the short ones. Honestly: in
a single exposure it looks faint; its motion is seen with the subtraction of the first and last image and,
when it exists, with the per-sweep sum (pending, by D2) and with the CatWISE2020 overlay (done on the `v/v2-catwise` branch of V2, PR pending; it is not in Gaia). In eps Ind B the motion is seen more clearly.

**Barnard's star** has the largest proper motion known of any star. It is the
control case: if no motion is seen in Barnard, the problem is the viewer's, not the object's.

**Epsilon Indi B** is a pair of brown dwarfs. It is the best field to demonstrate the band
selector, because it is a red, cold object. Beware of a trap: the pair is separated by about 400
arcseconds from the star Epsilon Indi A, which is very bright and can contaminate the field.

**RW Aurigae** and **R Draconis** are variables: they change brightness without moving. They are the opposite
control case.

And there lies the strongest argument for the pitch: **the pair "it moves" versus "it just changes
brightness"** demonstrates that the tool distinguishes the two things. In the demonstration it is worth showing
one of each.

The five coordinates were verified in SIMBAD on November 14, and two
traps came out of that that are worth knowing before arriving.

The first: **the coordinate that the statement gives for WISE 0855 is from the WISE epoch, around
2010, not today's.** That object moves eight arcseconds a year, so at the end of 2026
it is about one hundred and thirty arcseconds from where the statement says. If you center the viewer there
with a small field, the object falls outside and it looks like the tool does not work.

The second: **Epsilon Indi B with a capital B is the pair of brown dwarfs, which is what the
challenge asks for; with a lowercase b it is a planet**, which is four hundred arcseconds away, at the position
of the star. There are name resolvers that do not distinguish case and return the planet.

And an expectation worth calibrating from the start: with a pixel scale of about
six arcseconds, **even the fastest objects in the sky move less than one pixel between
two consecutive SPHEREx sweeps**, which are six months apart. Only with the full time baseline
of the mission do you reach one or two and a half pixels. That means comparing the first epoch
against the last, not the consecutive ones; it gives great value to image subtraction, where one pixel of
displacement is seen very clearly; and it means we must not promise in the pitch that the object jumps out
without having seen it first.

A wrong coordinate, in any case, does not fail: it returns perfectly valid images of a
piece of the wrong sky. It is the quietest and most expensive error that can be made here.

---

## 12. What to carry in your head on arrival

Five things.

One: the deliverable is a viewer for people to detect, not an automatic detector.

Two: the linear variable filter means different epochs are at different wavelengths, and
that must be measured with real data in the first hour.

Three: Data Release 1 came out this month and brings an all-sky cube in HiPS format, which Aladin Lite
can show without a backend (IRSA's PNG HiPS, which is a mosaic without time and without fluxes). That is the project's fast route and safety net.

Four: the archive's cutouts are what makes everything viable; they must be timed early,
because if they are slow, the plan changes.

And five: the 102 bands are our own angle. WiseView already does the blink on WISE. What nobody has done yet
for the general public is the blink **plus** the spectral axis: letting the user see not
only that something moves, but what it is made of.
