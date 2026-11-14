<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/09_EDA_HALLAZGOS.md) · [Español](../../es/docs/09_EDA_HALLAZGOS.md) · [中文](../../zh/docs/09_EDA_HALLAZGOS.md) · [Deutsch](../../de/docs/09_EDA_HALLAZGOS.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/09_EDA_HALLAZGOS.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 09 — EDA: cosa dicono i dati reali (14 nov 2026)

Risposte, con dati di IRSA, alla checklist dell'ora 1 ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §9).
Ogni cifra proviene da un file di [`../eda/resultados/`](../../../eda/resultados/) o da una figura di
[`../eda/figuras/`](../../../eda/figuras/); gli script che le generano sono in [`../eda/`](../eda/README.md)
e si possono rieseguire.

---

## Riepilogo in dieci righe

1. **I dati abbondano.** Tra 258 e 2.514 file per campo di prova, 3–4 passate del cielo,
   **da 1,0 a 1,4 anni di base temporale**. Bisogna interrogare **DR1 e QR3**: non si ripetono file e
   QR3 porta la passata più recente (tranne WISE 0855, che non ha ancora QR3).
2. **Il movimento è di 1–2 pixel in tutto il periodo**, non un salto. Scala di pixel 6,15″
   (confermata in SIA2), PSF di 7,5–8,7″. Barnard: 1,8 px; WISE 0855: 1,3 px; eps Ind B: 1,1 px.
3. **Il movimento si misura, nelle stelle che non saturano.** In eps Ind B il centroide si sposta
   di −0,85 / −0,71 px (ovest / nord) tra 2025,31 e 2026,74; SIMBAD prevede −0,92 / −0,57 px. Le
   stelle luminose (Barnard, RW Aur) **saturano**: il loro nucleo è segnato come cattivo e la sottrazione
   mostra una coppia rosso/blu **anche se non si muovono** (RW Aur). Per loro vale solo il qualitativo.
4. **La λ dell'oggetto cambia su tutta la larghezza del rivelatore tra un file e l'altro** (~16 larghezze di banda
   all'interno di uno stesso rivelatore). Un blink che non la uniformi mescola 16 «colori» diversi.
5. **Ma uniformarla è facile:** in ogni campo e rivelatore ci sono decine di coppie di epoche con la stessa
   λ (entro mezza larghezza di banda). Con la selezione «a λ uniformata» la dispersione scende da 0,47 µm a
   0,005–0,04 µm.
6. **La λ si calcola senza scaricare il file:** la tabella `WCS-WAVE` è fissa per rivelatore e l'header
   di IMAGE si scarica con una richiesta HTTP Range (~35 KB). ~1.900 file in ~2,5 minuti.
7. **L'orientamento ruota di ~180° tra una passata e l'altra.** Bisogna **riproiettare su una griglia comune** (nord
   in alto) prima di fare blink o sottrazioni. Senza questo, la sottrazione confronta pezzi di cielo diversi.
8. **Un cutout impiega 7 s di mediana (p90 11 s, massimo 29 s) e pesa ~3,9 MB di qualunque dimensione sia**:
   quasi tutto è l'estensione PSF, che arriva intera. Ci sono stati errori 503 transitori. **Senza cache non
   c'è demo.**
9. **IRSA non risponde con CORS**: il browser non può chiederle nulla direttamente. **Tutto passa per il
   backend**, SIA2 incluso.
10. **Il cubo di DR1 ha due versioni.** Quella fornita da SIA2 (`spherex_dr1_cube`) sono FITS di
    ~320 MB per tessera che il servizio di ritagli rifiuta. **La versione HiPS si carica in Aladin**
    (`irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`: tessere PNG, 102 piani, CORS
    aperto), ed è già nel visore distribuito. Sono PNG per visualizzare: non danno flussi per uno spettro.
    *Correzione del 14 nov nel pomeriggio: la prima versione di questo documento diceva che il cubo non
    serviva per Aladin, perché era stata provata solo la versione di SIA2.*

---

## 1. Inventario per campo

Fonte: `eda/resultados/inventario.json`, ricerca SIA2 con raggio 0,01° nella posizione propagata
a 2025-11 (MJD 61000).

| Campo | DR1 | DR1 deep | QR3 | QR3 deep | Puntamenti | Passate | Prima → ultima | Base |
|---|---|---|---|---|---|---|---|---|
| WISE 0855 | 258 | 0 | 0 | 0 | 129 | 3 | 2025,34 → 2026,37 | 1,02 a |
| Barnard | 240 | 0 | 124 | 0 | 185 | 3 | 2025,62 → 2026,73 | 1,10 a |
| eps Ind B | 347 | 0 | 120 | 0 | 245 | 4 | 2025,31 → 2026,75 | 1,44 a |
| RW Aur | 226 | 0 | 110 | 0 | 168 | 3 | 2025,67 → 2026,71 | 1,04 a |
| R Dra | 422 | 1.233 | 126 | 733 | 1.273 | continuo | 2025,31 → 2026,74 | 1,42 a |

Cosa bisogna sapere di questa tabella:

- **Ogni puntamento dà 2 file**, uno a onda corta e uno a onda lunga, sempre in coppie
  **D1+D4, D2+D5, D3+D6** (il dicroico divide la luce; lo stesso pezzo di cielo cade in entrambi).
- **Una passata non è un'epoca**: dura da 1 a 6 settimane e porta 7–20 visite e ~50–60 puntamenti,
  ciascuno a un'altra λ. Per il video l'unità naturale è la **passata** (3–4 fotogrammi), o la
  visita se si vogliono più fotogrammi a costo di mescolare le λ.
- **R Dra è in un campo profondo** (vicino al polo nord eclittico): osservazione quasi
  continua. È il campo per provare le curve di luce, non quello tipico.
- Tutti i file consultati hanno `L2DQAFLG = Pass` (controllo di qualità di livello 2).

## 2. La lunghezza d'onda (il filtro lineare variabile)

Fonti: `eda/resultados/lambda_resumen.json`, `lambda_por_archivo.csv`, figura `01_lambda_vs_tiempo.png`.

- All'interno di uno stesso rivelatore, la λ dell'oggetto percorre **tutto** l'intervallo del rivelatore lungo
  i file: ~16 larghezze di banda. Esempio WISE 0855, D5: da 3,82 a 4,41 µm.
- A ogni passata SPHEREx fa di nuovo passare l'oggetto per il filtro, quindi **ogni λ si ripete ogni
  ~6 mesi**. Coppie di epoche separate più di 0,4 anni con la stessa λ: tra 18 e 196 per
  campo e rivelatore.
- Validazione: l'interpolazione propria di `WCS-WAVE` coincide con quella di astropy (`WAVE-TAB`) nei
  6 rivelatori fino alla quarta cifra decimale.

Confronto diretto in WISE 0855, D5 (figure `02_wise_0855_*.png`):

| Selezione | λ dei 4 fotogrammi (µm) | Dispersione |
|---|---|---|
| Ingenua (primo file di ogni passata) | 4,295 · 3,821 · 4,047 · 3,835 | **0,474 µm** |
| A λ uniformata | 4,145 · 4,153 · 4,153 · 4,180 | **0,035 µm** |

## 3. Geometria: orientamento e allineamento

Misurato nei 25 ritagli di `size=0.1` (59×59 px):

- Angolo di posizione del rivelatore: alterna tra ~−160° e ~+19° (WISE 0855), ~−179° e ~+1°
  (Barnard), ~−28° e ~+154° (eps Ind B). Vicino al polo (R Dra), angoli arbitrari.
- La dimensione del ritaglio varia di ±1 px tra i file (58 o 59).

**Conseguenza:** il backend riproietta ogni ritaglio su una griglia TAN comune, nord in alto, alla
scala nativa (`reproject_interp` della libreria `reproject`). Implementato in
`eda/03_recortes_y_figuras.py` (`grilla_comun`, `panel`).

## 4. Cosa si vede in ogni campo

Figure `eda/figuras/02_*.png`. Ritagli di 0,1°, `IMAGE − ZODI`, riproiettati, stiramento asinh.
Il cerchio arancione è la posizione propagata con il moto proprio di SIMBAD alla data di ogni file.

| Campo | Banda | L'oggetto si vede? | Il cambiamento si vede? |
|---|---|---|---|
| Barnard | D2 (1,5 µm) | Sì, **satura**: 30–44 dei 49 pixel del nucleo segnati come cattivi | Coppia rossa in alto / blu in basso (verso nord, come il suo movimento), ma non misurabile: il centroide non esiste con il nucleo mascherato |
| eps Ind B | D5 (3,86 µm) | Sì, senza saturare | **Sì, e misurato**: −0,85 / −0,71 px contro −0,92 / −0,57 px previsti (vedi sotto) |
| RW Aur | D3 (1,94 µm) | Sì, satura (6–8 pixel cattivi nel nucleo) | **Coppia rosso/blu anche se non si muove**: è l'effetto della saturazione e della maschera, non movimento |
| R Dra | D4 | Sì | Da misurare la luminosità |
| WISE 0855 | D5 e D6 | **A malapena** in esposizioni singole | No in una sola esposizione |

**WISE 0855 è un caso obbligatorio (oggetto di prova dell'organizzazione) e si mostra sempre, ma con esposizioni singole si vede debole**: è troppo debole per
esposizione. Per vederla bisognerebbe sommare le esposizioni di ogni passata (il punto della sfida
«add together all the data taken by each of the six detector arrays»).

### Centroidi: lo spostamento misurato è quello che prevede SIMBAD?

Fonte: `eda/resultados/centroides.json` (`eda/05_centroides.py`). Prima e ultima epoca a λ uniformata,
riproiettate sulla stessa griglia; pixel cattivi esclusi. x positivo = ovest, y positivo = nord.

| Campo | Misurato (px) | Previsto (px) | Stelle di campo (mediana, px) | Pixel cattivi nel nucleo |
|---|---|---|---|---|
| eps Ind B | −0,85 / −0,71 | −0,92 / −0,57 | +0,05 / −0,37 (3 stelle) | 1 e 0 di 49 |
| RW Aur | +0,73 / +1,22 | 0 / 0 | −0,01 / +0,07 (5 stelle) | 6 e 8 di 49 |
| Barnard | non si può (nucleo vuoto) | +0,14 / +1,81 | −0,14 / +0,04 (8 stelle) | 44 e 44 di 49 |

Lettura:

- **L'allineamento funziona:** le stelle di campo si spostano di uno o due decimi di pixel (fino a
  0,37 px in eps Ind B, con sole 3 stelle).
- **eps Ind B si muove quanto deve muoversi**, entro ~0,15 px su ciascun asse. È la prova
  quantitativa che λ uniformata + riproiezione + sottrazione mostrano movimento reale.
- **Le stelle che saturano ingannano.** Il nucleo di Barnard e di RW Aur è segnato come cattivo
  (OVERFLOW, TRANSIENT, SUR_ERROR). Escludendolo, ciò che resta è un anello asimmetrico e il
  centroide si sposta: RW Aur «si muove» di 1,4 px senza muoversi. Nella sottrazione compare la stessa coppia
  rosso/blu che lascia un oggetto che si muove davvero. **Il visore deve avvisare quando l'oggetto satura.**

## 5. Maschera di qualità (`FLAGS`)

I nomi dei bit **sono nell'header stesso** di `FLAGS` (schede `MSKNnnnn` nome,
`MSKMnnnn` maschera, `MSKDnnnn` descrizione): non serve cercare la tabella 16 del supplemento.

Frequenza nei 25 ritagli:

| Bit | Nome | % di pixel | Invalida il pixel? |
|---|---|---|---|
| 21 | SOURCE | **72,4 %** | **No**: segna che c'è una sorgente nota. È ciò che vogliamo vedere |
| 28 | HALO | 2,1 % | Discutibile: alone transitorio attorno a sorgenti luminose |
| 0 | TRANSIENT | 1,6 % | Sì |
| 2 | SUR_ERROR | 1,3 % | Sì |
| 26 | BLOOM | 0,8 % | Discutibile |
| 19 | OUTLIER | 0,7 % | Sì |
| 6 | NONFUNC | 0,4 % | Sì |
| 17 | PERSIST | 0,3 % | Sì |
| 1 | OVERFLOW | 0,2 % | Sì |
| 11 | COLD | 0,1 % | Sì |

**Trappola:** `FLAGS != 0` segna il 72 % del ritaglio a causa di SOURCE. Bisogna usare una maschera
per bit. Quella usata dall'EDA (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`) maschera ~4 % dei
pixel, ma riproiettando con interpolazione bilineare i NaN si ingrandiscono e sullo schermo si vedono
come blocchi bianchi (~15 %). Per il visore conviene **riproiettare la maschera per vicino più
prossimo e riempire** i pixel cattivi, e mostrare la maschera come layer opzionale.

## 6. Infrastruttura

Fonte: `eda/resultados/infraestructura.json`, `latencia_cutouts.json`.

| Domanda | Risposta | Conseguenza |
|---|---|---|
| IRSA risponde con CORS? | **No** (né SIA2 né i file) | Tutto passa per il nostro backend |
| Query SIA2 | 1–3,5 s per collezione | Si può fare dal vivo, 4 collezioni in parallelo |
| Header via HTTP Range | ~2 s, 35 KB; ~0,1 s effettivo con 6 in parallelo | Metadati e λ di centinaia di file in secondi |
| Cutout `size=0.1` | Mediana 7,3 s, p90 10,8 s, max. 29 s; ~3,9 MB; 25 in 52 s con 4 thread | Cache su disco obbligatoria; preriscaldare i campi della demo |
| Un cutout più piccolo è più veloce? | No: 0,02° pesa uguale (la PSF arriva intera) | Chiedere sempre 0,1°; di più non costa |
| Errori | 503 transitori; uno è persistito per 4 tentativi | Nuovi tentativi con attesa e stato di errore nella UI |
| Cubo DR1 via SIA2 (`spherex_dr1_cube`) | FITS 512×512×102, ~320 MB per tessera, pixel 12,9″; il cutout ha risposto 422 «lacks WCS» (e 503 in una seconda prova) | Non serve per ritagli né per spettri al volo |
| **Cubo DR1 in HiPS** (`/data/hips/SPHEREx/spherex_allsky_cube`) | `properties` risponde 200 con `Access-Control-Allow-Origin: *`; PNG, ordine 5, 102 piani (50 e 51 vuoti), pixel 12,9″, pubblicato il 1 nov 2026 | **Si carica in Aladin** (il visore distribuito lo usa). È un mosaico di tutte le epoche: senza asse del tempo, e in PNG, senza flussi |
| HiPS di SPHEREx al CDS | Il MocServer elenca `CDS/P/SPHEREx/QR2/D1`…`D6` (QR2, ordine 7); `alasky` ha restituito 404 il 14 nov persino per DSS | Piano B se quello di IRSA fallisce; non verificato |

## 7. Cosa non è stato verificato

- La luminosità: non è stata misurata fotometria in nessun campo (variabilità di RW Aur e R Dra non misurata).
- Se l'HiPS del CDS si carica in Aladin Lite (server fuori uso al momento della prova). Non è più necessario: quello di IRSA si carica.
- Le collezioni `_deep` non sono state usate nell'analisi della λ (solo DR1 e QR3).
- Come misurare la posizione di una stella satura (adattamento della PSF alle ali, o usare un rivelatore dove non saturi).
- Sommare le esposizioni di una passata per vedere WISE 0855.
- La sottrazione di R Dra non è stata rivista nel dettaglio. I centroidi sono stati misurati solo nella prima e nell'ultima epoca.
