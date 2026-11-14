<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/eda/README.md) · **Español** · [中文](../../zh/eda/README.md) · [Deutsch](../../de/eda/README.md) · [Italiano](../../it/eda/README.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `eda/README.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# eda/ — exploración de los datos reales de SPHEREx

Scripts que responden, con datos reales de IRSA, el checklist de la hora 1
([`docs/02_DATOS_SPHEREX.md`](../docs/02_DATOS_SPHEREX.md) §9). **Las conclusiones están en
[`docs/09_EDA_HALLAZGOS.md`](../docs/09_EDA_HALLAZGOS.md)**; la propuesta de reparto de trabajo que
sale de ellas, en [`docs/10_REPARTO_DE_TRABAJO.md`](../docs/10_REPARTO_DE_TRABAJO.md).

Esto **no es código de producción**. Es para entender los datos. El backend se escribe en
`scaffold/backend/app/` siguiendo el contrato de `docs/03_ARQUITECTURA.md`; lo que sirva de aquí se copia
allá con tests.

## Cómo correrlo

```bash
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install astropy pyvo matplotlib numpy requests pyyaml reproject scipy
.venv/Scripts/python eda/01_inventario.py         # ~1 min   SIA2 en los 5 campos
.venv/Scripts/python eda/02_longitud_de_onda.py   # ~3 min   1 header por archivo (HTTP Range)
.venv/Scripts/python eda/03_recortes_y_figuras.py # ~1 min   cutouts reales + figuras
.venv/Scripts/python eda/04_infraestructura.py    # ~15 s    CORS, cubo DR1 (SIA2 y HiPS de IRSA), HiPS del CDS
.venv/Scripts/python eda/05_centroides.py         # ~10 s    movimiento medido vs SIMBAD
```

(En Linux/Mac: `.venv/bin/python`.)

## Qué hace cada uno

| Script | Pregunta | Salida versionada |
|---|---|---|
| `01_inventario.py` | ¿Cuántos archivos, apuntados, detectores y pasadas hay en cada campo? ¿DR1 y QR3 se solapan? | `resultados/inventario.json` |
| `02_longitud_de_onda.py` | ¿En qué λ quedó el objeto en cada archivo? ¿Cuánto varía entre épocas? | `resultados/lambda_por_archivo.csv`, `resultados/lambda_resumen.json` |
| `03_recortes_y_figuras.py` | ¿Cuánto tarda un cutout? ¿Se ve el movimiento? ¿Qué pasa si no se iguala la λ? | `figuras/*.png`, `resultados/latencia_cutouts.json` |
| `05_centroides.py` | ¿El desplazamiento medido coincide con el que predice SIMBAD? | `resultados/centroides.json` |
| `04_infraestructura.py` | ¿IRSA tiene CORS? ¿El cubo DR1 se recorta? ¿Hay HiPS para Aladin? | `resultados/infraestructura.json` |

Módulos de apoyo: `comun.py` (rutas, campos, propagación de movimiento propio) y `espectral.py`
(leer la λ por píxel sin bajar el MEF entero).

## Reglas

- Los FITS van a `data/cache/eda/` (ignorado por git). Nunca al repositorio.
- Los scripts hacen como máximo 6 peticiones simultáneas a IRSA. No subir ese número: es un
  servicio público y nos devolvió 503 con carga baja.
