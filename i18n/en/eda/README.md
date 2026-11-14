<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/eda/README.md) · [中文](../../zh/eda/README.md) · [Deutsch](../../de/eda/README.md) · [Italiano](../../it/eda/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `eda/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# eda/ — exploration of the real SPHEREx data

Scripts that answer, with real IRSA data, the hour-1 checklist
([`docs/02_DATOS_SPHEREX.md`](../docs/02_DATOS_SPHEREX.md) §9). **The conclusions are in
[`docs/09_EDA_HALLAZGOS.md`](../docs/09_EDA_HALLAZGOS.md)**; the work split proposal that
comes out of them, in [`docs/10_REPARTO_DE_TRABAJO.md`](../docs/10_REPARTO_DE_TRABAJO.md).

This is **not production code**. It is for understanding the data. The backend is written in
`scaffold/backend/app/` following the contract in `docs/03_ARQUITECTURA.md`; whatever is useful from here is copied
over there with tests.

## How to run it

```bash
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install astropy pyvo matplotlib numpy requests pyyaml reproject scipy
.venv/Scripts/python eda/01_inventario.py         # ~1 min   SIA2 en los 5 campos
.venv/Scripts/python eda/02_longitud_de_onda.py   # ~3 min   1 header por archivo (HTTP Range)
.venv/Scripts/python eda/03_recortes_y_figuras.py # ~1 min   cutouts reales + figuras
.venv/Scripts/python eda/04_infraestructura.py    # ~15 s    CORS, cubo DR1 (SIA2 y HiPS de IRSA), HiPS del CDS
.venv/Scripts/python eda/05_centroides.py         # ~10 s    movimiento medido vs SIMBAD
```

(On Linux/Mac: `.venv/bin/python`.)

## What each one does

| Script | Question | Versioned output |
|---|---|---|
| `01_inventario.py` | How many files, pointings, detectors and passes are there in each field? Do DR1 and QR3 overlap? | `resultados/inventario.json` |
| `02_longitud_de_onda.py` | At what λ did the object land in each file? How much does it vary between epochs? | `resultados/lambda_por_archivo.csv`, `resultados/lambda_resumen.json` |
| `03_recortes_y_figuras.py` | How long does a cutout take? Is the motion seen? What happens if λ is not matched? | `figuras/*.png`, `resultados/latencia_cutouts.json` |
| `05_centroides.py` | Does the measured displacement match the one SIMBAD predicts? | `resultados/centroides.json` |
| `04_infraestructura.py` | Does IRSA have CORS? Is the DR1 cube cropped? Is there HiPS for Aladin? | `resultados/infraestructura.json` |

Support modules: `comun.py` (paths, fields, proper motion propagation) and `espectral.py`
(reading the λ per pixel without downloading the whole MEF).

## Rules

- The FITS go to `data/cache/eda/` (ignored by git). Never to the repository.
- The scripts make at most 6 simultaneous requests to IRSA. Do not raise that number: it is a
  public service and it returned 503 to us under low load.
