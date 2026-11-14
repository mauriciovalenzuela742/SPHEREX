---
name: coordenadas-astro
description: Sky coordinates and handling them without mistakes - right ascension and declination, conversion between sexagesimal and decimal degrees, the factor of 15 between hours and degrees, FITS WCS and pixel-to-sky conversion with astropy, proper motion and how to predict where a star will be at another epoch, name resolution with SIMBAD, and the challenge's five test fields. Activate it when parsing or validating coordinates entered by a user, when converting between formats, when working with WCS or world_to_pixel, when computing positions at another date, or when RA, Dec, ICRS, J2000, sexagesimal, proper motion, parallax, SIMBAD or the test fields are mentioned.
---

<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../../es/.claude/skills/coordenadas-astro/SKILL.md) · [中文](../../../../zh/.claude/skills/coordenadas-astro/SKILL.md) · [Deutsch](../../../../de/.claude/skills/coordenadas-astro/SKILL.md) · [Italiano](../../../../it/.claude/skills/coordenadas-astro/SKILL.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `.claude/skills/coordenadas-astro/SKILL.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Sky coordinates without messing up

---

## 1. The mistake made most often

**Right ascension is given in hours or in degrees, and there is a factor of 15 between the two.**

```
RA = 08h55m10.831s  →  8.9196753 horas  →  133.795129 grados
```

If you treat `08h55m` as degrees, you point 112 degrees away from the object. The query returns
perfectly valid images of the wrong patch of sky, and **nothing fails**: there is no error, no
exception, just a silently incorrect result.

Declination is always in degrees (−90 to +90). `-7d14m42.53s` are degrees, arcminutes and
arcseconds.

**Never parse coordinates by hand.** Use `astropy.coordinates.SkyCoord`, which understands almost everything:

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

SkyCoord("08h55m10.831s", "-07d14m42.53s", frame="icrs")
SkyCoord("08 55 10.831 -07 14 42.53", unit=(u.hourangle, u.deg))
SkyCoord(133.795129, -7.245147, unit="deg")
```

**Pay attention to `unit=(u.hourangle, u.deg)`**: it is the right pair when RA comes in hours and Dec
in degrees, which is the usual case for the sexagesimal format.

### Validating what the user enters

Accept the four forms and normalize to ICRS decimal degrees before doing anything:

1. `133.795129 -7.245147` (decimal degrees)
2. `08h55m10.831s -07d14m42.53s`
3. `08:55:10.831 -07:14:42.53`
4. `WISE 0855` (name → SIMBAD)

Rule of thumb for telling 1 from 3 when two loose numbers arrive: **if it has `h`, `:` or
spaces as internal separators, it is sexagesimal.** If there is ambiguity, ask the user instead of
guessing. A minus sign on the Dec is easily lost: check it explicitly.

Valid ranges: RA ∈ [0, 360), Dec ∈ [−90, +90]. RA wraps at 360; Dec does not wrap.

---

## 2. WCS: from pixel to sky

The WCS is in the FITS header and translates pixel ↔ coordinate.

```python
from astropy.wcs import WCS
from astropy.io import fits

with fits.open(ruta) as hdul:
    w = WCS(hdul["IMAGE"].header)

x, y = w.world_to_pixel(coord)      # devuelve 0-based
coord = w.pixel_to_world(x, y)
```

Three traps:

1. **`world_to_pixel` returns 0-based; FITS headers are 1-based.** IRSA warns about it
   explicitly in the SPHEREx documentation for PSF handling. If you see one-pixel
   shifts, this is it.
2. **In a MEF, each extension can have its own WCS.** The one from `IMAGE` need not work
   for the PSF.
3. **The WCS of a cutout is not that of the original.** IRSA's cutout service adjusts the cutout's WCS,
   but keeps keys such as `CRPIX1A`/`CRPIX2A` that point to the original image. Read the
   `spherex-datos` skill before doing calculations with the PSF.

Angular distance between two positions: `coord1.separation(coord2)`. Do not compute it with Pythagoras
on RA and Dec: near the poles it is wrong, because one degree of RA is not one degree of arc.
The factor is `cos(dec)`.

---

## 3. Proper motion: where it will be on another date

It is the calculation that allows overlaying Gaia on an image of a specific epoch, which is at once
a challenge bullet and the proof that the viewer is correct.

```python
from astropy.time import Time

c = SkyCoord(ra=..., dec=..., unit="deg",
             pm_ra_cosdec=... * u.mas/u.yr,
             pm_dec=... * u.mas/u.yr,
             obstime=Time("2016.0", format="jyear"))   # época del catálogo
c_en_2026 = c.apply_space_motion(new_obstime=Time("2026-10-02"))
```

- **Gaia DR3 has reference epoch J2016.0.** Not J2000. Confusing them introduces an error of 16 years of
  proper motion.
- **WISE 0855−0714 is not in Gaia** (it is too cold and faint in the optical). For its overlay and its
  propagated position use CatWISE2020 (`catwise_2020` at IRSA), which has proper motions; its reference epoch
  is ~MJD 57170 (~2015.4). Confirm units and epoch in the table schema.
- `pm_ra_cosdec` already includes the `cos(dec)` factor. Catalogs usually give it that way; if your source gives
  «raw» `pmra`, convert it.
- Magnitude scale: 100 mas/yr is 0.1 arcsec per year. With ~6 arcsec pixels like SPHEREx's,
  you need **a lot** of proper motion or several years to see a one-pixel shift. That is why the
  challenge's test objects are what they are: they were chosen for having enormous proper
  motion.

---

## 4. Resolving names

For the tool to be usable by anyone it has to accept «Barnard's Star», not just numbers.

```python
SkyCoord.from_name("Barnard's Star")          # usa el servicio Sesame del CDS
```

or `astroquery.simbad`. Precautions for a public tool:

- **Always with a time limit and failure handling.** They are external services and they go down.
  *(Checked on Nov 14, 2026: the CDS service in Strasbourg was down. The CfA mirror,
  `simbad.cfa.harvard.edu`, did respond and serves the same data. **Have both and fall from
  one to the other.**)*
- **Cache the responses.** The five test fields are resolved once and stored.
- **Plan B:** a local table with the five test fields and the most requested objects
  (`data/campos_de_prueba.yml`), so that the demo never depends on a third-party service.

---

## 5. The five test fields

They are the ones the statement names. **They work as an acceptance criterion**: if the viewer behaves
well on all five, it is finished.

The coordinates (verified on Nov 14, 2026 against SIMBAD), what should be seen in each one and the
proper motions are in [`data/campos_de_prueba.yml`](../../../../../data/campos_de_prueba.yml).

**Two verified traps that are in that file and are worth knowing before touching code:**

1. **The coordinate the statement gives for WISE 0855 is from the WISE epoch (~2010.4), not from
   today.** The object moves 8.15 arcsec per year: at the end of 2026 it is about 130 arcsec from that
   coordinate. With a field of 0.05 degrees or less, **pointing at the statement's coordinate leaves
   the object outside the field**, and the viewer looks broken without being so.
2. **`eps Ind B` (uppercase) is the pair of brown dwarfs; `eps Ind b` (lowercase) is a
   planet**, and it is at 402 arcsec, at the position of the star. MAST's resolver, which does not
   distinguish case, returns the planet. If your name resolution does not distinguish
   case, you point at the wrong object.

**And an expectation to have from the start:** with a pixel scale of 6.15
arcsec, even the fastest objects in the sky move **less than one pixel between two consecutive
sweeps** of SPHEREx (separated by 6 months). Measured in the EDA (`docs/09`), over the whole available period
(1.0-1.4 years) they move 1.1-1.8 px. That means using the largest available time baseline, not consecutive
epochs, and it gives great value to image subtraction and to zoom.

| Object | What it demonstrates |
|---|---|
| **WISE 0855** | Very high proper motion. **Mandatory case: always shown.** In a single exposure it looks faint; its motion (~1.3 px) is seen with the subtraction and with the per-sweep sum (pending, D2; the CatWISE2020 overlay is done on branch `v/v2-catwise`, pending PR, V2). Coordinates from the statement: epoch 2010, use the propagated one |
| **Barnard's Star** | The largest known proper motion. It is seen, but it saturates: the motion is qualitative |
| **Epsilon Indi B** | Pair of brown dwarfs. **It is where the motion is seen most clearly** (measured −0.85/−0.71 px; matches SIMBAD) |
| **RW Aurigae** | Variable: changes brightness. It saturates and the subtraction leaves a red/blue pair even if it does not move: it is not proof of variability |
| **R Draconis** | Long-period, large-amplitude variable. Brightness not measured (`docs/09`) |

The pair «it moves» / «it only changes brightness» is what shows that the viewer distinguishes the two
things. In the pitch it is worth showing one of each.

---

## 6. Checklist before accepting a coordinate as good

- [ ] RA in degrees or hours? Did you convert it?
- [ ] Did the sign of the Dec survive the parsing?
- [ ] RA ∈ [0,360) and Dec ∈ [−90,90]?
- [ ] Is the frame ICRS? (J2000 and ICRS coincide for practical purposes; galactic does not.)
- [ ] If there is proper motion, what is the catalog epoch? Is Gaia J2016.0?
- [ ] If you used WCS, 0-based or 1-based?
- [ ] **Did you verify against an external source?** Pasting the coordinate into SIMBAD or Aladin and seeing whether
      it lands where it should takes thirty seconds and saves hours.
