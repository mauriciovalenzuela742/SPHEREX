<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/eda/README.md) · [Español](../../es/eda/README.md) · [中文](../../zh/eda/README.md) · [Deutsch](../../de/eda/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `eda/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# eda/ — esplorazione dei dati reali di SPHEREx

Script che rispondono, con dati reali di IRSA, alla checklist dell'ora 1
([`docs/02_DATOS_SPHEREX.md`](../docs/02_DATOS_SPHEREX.md) §9). **Le conclusioni sono in
[`docs/09_EDA_HALLAZGOS.md`](../docs/09_EDA_HALLAZGOS.md)**; la proposta di ripartizione del lavoro che
ne deriva, in [`docs/10_REPARTO_DE_TRABAJO.md`](../docs/10_REPARTO_DE_TRABAJO.md).

Questo **non è codice di produzione**. Serve a capire i dati. Il backend si scrive in
`scaffold/backend/app/` seguendo il contratto di `docs/03_ARQUITECTURA.md`; ciò che serve da qui si copia
là con i test.

## Come eseguirlo

```bash
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install astropy pyvo matplotlib numpy requests pyyaml reproject scipy
.venv/Scripts/python eda/01_inventario.py         # ~1 min   SIA2 en los 5 campos
.venv/Scripts/python eda/02_longitud_de_onda.py   # ~3 min   1 header por archivo (HTTP Range)
.venv/Scripts/python eda/03_recortes_y_figuras.py # ~1 min   cutouts reales + figuras
.venv/Scripts/python eda/04_infraestructura.py    # ~15 s    CORS, cubo DR1 (SIA2 y HiPS de IRSA), HiPS del CDS
.venv/Scripts/python eda/05_centroides.py         # ~10 s    movimiento medido vs SIMBAD
```

(Su Linux/Mac: `.venv/bin/python`.)

## Cosa fa ciascuno

| Script | Domanda | Output versionato |
|---|---|---|
| `01_inventario.py` | Quanti file, puntamenti, detector e passate ci sono in ogni campo? DR1 e QR3 si sovrappongono? | `resultados/inventario.json` |
| `02_longitud_de_onda.py` | A quale λ si è trovato l'oggetto in ogni file? Quanto varia tra epoche? | `resultados/lambda_por_archivo.csv`, `resultados/lambda_resumen.json` |
| `03_recortes_y_figuras.py` | Quanto impiega un cutout? Si vede il movimento? Cosa succede se non si uniforma la λ? | `figuras/*.png`, `resultados/latencia_cutouts.json` |
| `05_centroides.py` | Lo spostamento misurato coincide con quello previsto da SIMBAD? | `resultados/centroides.json` |
| `04_infraestructura.py` | IRSA ha CORS? Il cubo DR1 si ritaglia? C'è un HiPS per Aladin? | `resultados/infraestructura.json` |

Moduli di supporto: `comun.py` (percorsi, campi, propagazione del moto proprio) e `espectral.py`
(leggere la λ per pixel senza scaricare l'intero MEF).

## Regole

- I FITS vanno in `data/cache/eda/` (ignorato da git). Mai nel repository.
- Gli script fanno al massimo 6 richieste simultanee a IRSA. Non aumentare questo numero: è un
  servizio pubblico e ci ha restituito 503 con carico basso.
