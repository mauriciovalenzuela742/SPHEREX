<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/eda/README.md) · [Español](../../es/eda/README.md) · [中文](../../zh/eda/README.md) · **Deutsch** · [Italiano](../../it/eda/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `eda/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# eda/ — Erkundung der echten Daten von SPHEREx

Skripte, die mit echten Daten von IRSA die Checkliste der Stunde 1 beantworten
([`docs/02_DATOS_SPHEREX.md`](../docs/02_DATOS_SPHEREX.md) §9). **Die Schlussfolgerungen stehen in
[`docs/09_EDA_HALLAZGOS.md`](../docs/09_EDA_HALLAZGOS.md)**; der daraus entstehende Vorschlag zur Arbeitsverteilung
in [`docs/10_REPARTO_DE_TRABAJO.md`](../docs/10_REPARTO_DE_TRABAJO.md).

Das ist **kein Produktionscode**. Er dient dazu, die Daten zu verstehen. Das Backend wird in
`scaffold/backend/app/` geschrieben, nach dem Vertrag von `docs/03_ARQUITECTURA.md`; was von hier brauchbar ist, wird mit Tests dorthin
kopiert.

## Wie man es ausführt

```bash
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install astropy pyvo matplotlib numpy requests pyyaml reproject scipy
.venv/Scripts/python eda/01_inventario.py         # ~1 min   SIA2 en los 5 campos
.venv/Scripts/python eda/02_longitud_de_onda.py   # ~3 min   1 header por archivo (HTTP Range)
.venv/Scripts/python eda/03_recortes_y_figuras.py # ~1 min   cutouts reales + figuras
.venv/Scripts/python eda/04_infraestructura.py    # ~15 s    CORS, cubo DR1 (SIA2 y HiPS de IRSA), HiPS del CDS
.venv/Scripts/python eda/05_centroides.py         # ~10 s    movimiento medido vs SIMBAD
```

(Unter Linux/Mac: `.venv/bin/python`.)

## Was jedes tut

| Skript | Frage | Versionierte Ausgabe |
|---|---|---|
| `01_inventario.py` | Wie viele Dateien, Zeigungen, Detektoren und Durchgänge gibt es in jedem Feld? Überlappen sich DR1 und QR3? | `resultados/inventario.json` |
| `02_longitud_de_onda.py` | Bei welcher λ lag das Objekt in jeder Datei? Wie stark variiert sie zwischen Epochen? | `resultados/lambda_por_archivo.csv`, `resultados/lambda_resumen.json` |
| `03_recortes_y_figuras.py` | Wie lange braucht ein Cutout? Sieht man die Bewegung? Was passiert, wenn die λ nicht angeglichen wird? | `figuras/*.png`, `resultados/latencia_cutouts.json` |
| `05_centroides.py` | Stimmt die gemessene Verschiebung mit der von SIMBAD vorhergesagten überein? | `resultados/centroides.json` |
| `04_infraestructura.py` | Hat IRSA CORS? Lässt sich der DR1-Cube zuschneiden? Gibt es HiPS für Aladin? | `resultados/infraestructura.json` |

Hilfsmodule: `comun.py` (Pfade, Felder, Propagation der Eigenbewegung) und `espectral.py`
(die λ pro Pixel lesen, ohne das gesamte MEF herunterzuladen).

## Regeln

- Die FITS gehen nach `data/cache/eda/` (von git ignoriert). Niemals ins Repository.
- Die Skripte machen höchstens 6 gleichzeitige Anfragen an IRSA. Diese Zahl nicht erhöhen: Es ist ein
  öffentlicher Dienst und er hat uns bei geringer Last 503 geliefert.
