<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../../es/biblio/fichas/wiseview-el-precedente.md) · [中文](../../../zh/biblio/fichas/wiseview-el-precedente.md) · [Deutsch](../../../de/biblio/fichas/wiseview-el-precedente.md) · [Italiano](../../../it/biblio/fichas/wiseview-el-precedente.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `biblio/fichas/wiseview-el-precedente.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Sheet: WiseView, the direct precedent

- **Reference:** Caselden, Westin, Meisner, Kuchner, Colin (2018). *WiseView: Visualizing motion
  and variability of faint WISE sources.* Astrophysics Source Code Library, ascl:1806.004
- **Link:** <http://byw.tools/wiseview> · <https://ascl.net/1806.004>
- **Status:** verified (ASCL and Backyard Worlds blog, Nov 14, 2026). Full authorship to be confirmed
- **Why it comes first:** it is the tool that the challenge brief names as a model

## What it says, in three sentences

WiseView is a browser tool that blinks WISE coadds over a time baseline
of several years; the user only enters coordinates and interactively adjusts the stretch, the
color map and the blink speed. It was born as a makeshift tool by two Backyard Worlds volunteers
who wanted to classify their own candidates better and check whether they showed proper motion. It has
enabled hundreds of discoveries of brown dwarf candidates, by amateurs and professionals.

## What is useful to us here

1. **The shape of the interface is validated by real use.** A coordinate box, a blink,
   three controls. There is nothing to invent: it has to be ported to SPHEREx.
2. **The controls are not decorations.** Stretch, color and speed are what turn a smudge
   into a discovery. If they are cut for lack of time, what makes the tool useful is cut.
3. **It shows coadds, not single exposures.** Combining before displaying is what makes faint
   sources visible. In SPHEREx the equivalent is to add up by detector or by wavelength range,
   which is exactly what one of the challenge's bullets suggests.
4. **Having an API turned it into infrastructure.** There are third-party packages (`flipbooks`,
   `unWISE-verse`, from the Cool Neighbors project) built on the WiseView API to generate
   material and upload it to Zooniverse. **That is the bar for our queryable URL**, which is another
   explicit bullet of the challenge.

## What is NOT useful to us (and why)

- **It has no spectral axis.** WISE has four wide bands; SPHEREx has 102 channels. That is
  our gap: do the same thing *plus* the wavelength axis.
- **WISE data do not have the linear variable filter problem.** In WISE, two epochs of the
  same position are in the same band. In SPHEREx they are not. Copying the blink logic without solving that
  produces a strobe-like sequence (see `../../docs/02_DATOS_SPHEREX.md` §2).
- **unWISE precomputes the coadds.** WiseView is fast because someone already did the heavy work. For
  us, that amounts to pre-warming the cache: we will not be able to precompute the whole sky.

## Figures we can cite

| Figure | Value | Where it says so |
|---|---|---|
| Discoveries facilitated | "hundreds of brown dwarf candidates" | ASCL record 1806.004 |
| Time baseline | several years of WISE/NeoWISE | ASCL and Backyard Worlds blog |

**Careful:** do not attribute the discovery of Planet Nine to WiseView. It has not been found.

## Questions it leaves open

- Is the original WiseView code public? We did not confirm it; the derived packages are.
- What parameters does its API expose exactly? Looking at `flipbooks` is cheaper than deducing them.
- How many epochs does it show by default, and why that number? It is a design decision that we
  will have to make.
