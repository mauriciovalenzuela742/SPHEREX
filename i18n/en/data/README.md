<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/data/README.md) · [中文](../../zh/data/README.md) · [Deutsch](../../de/data/README.md) · [Italiano](../../it/data/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `data/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# data/

## What goes here

- `campos_de_prueba.yml` — the five objects from the brief, with coordinates and what should be seen in
  each. **Read the file header: the five coordinates are verified (Nov 14, SIMBAD via the Harvard mirror); the `campos_extra` are not.**
- Small reference tables (trimmed catalogs, target lists).

## What does NOT go here

**Nothing heavy and nothing downloaded.** Specifically:

- FITS files. A SPHEREx MEF weighs about 70 MB.
- Crops, rendered PNGs, caches.
- Data downloaded from IRSA, from the CDS or from anywhere else.

All of that goes to `data/cache/`, which is in `.gitignore`. If a data file shows up in a `git
status`, something was done wrong.

## data/cache/

Local working folder, not versioned. The backend creates it on startup.

Suggested structure:

```
data/cache/
├── fits/        # cutouts bajados de IRSA
├── png/         # fotogramas renderizados
└── meta/        # respuestas JSON cacheadas
```

**It is pre-warmed with the five test fields when the server starts.** The demo in front of the jury
is never done with a cold query.

## Security note

Everything that is downloaded is **untrusted content**. Keep it in its own folder, separate from the
code, and pass the paths as an argument to scripts instead of running an interpreter from
inside the data folder.
