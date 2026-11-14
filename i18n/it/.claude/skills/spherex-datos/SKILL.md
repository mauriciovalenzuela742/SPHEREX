---
name: spherex-datos
description: Come richiedere dati di SPHEREx all'archivio IRSA/IPAC - collezioni SIA2 (spherex_dr1, spherex_qr3 e varianti deep e cube), servizio di cutout, struttura del MEF di livello 2 e le sue sei estensioni (IMAGE, FLAGS, VARIANCE, ZODI, EPSF, WCS-WAVE), le sei bande e le loro lunghezze d'onda, il cubo HiPS di tutto il cielo di DR1, e gli strumenti di IRSA che già esistono (Data Explorer, MOST, Cutout, Mosaic, Spectrophotometry, Source Discovery). Attivala quando bisogna interrogare, scaricare, ritagliare, leggere o capire dati di SPHEREx; quando si menzionano IRSA, IPAC, SIA2, pyvo, astroquery, cutout, MEF, FITS di SPHEREx, DR1, QR2, QR3, WCS-WAVE, luce zodiacale, filtro lineare variabile o LVF; o nel progettare il backend che alimenta il visore.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../../en/.claude/skills/spherex-datos/SKILL.md) · [Español](../../../../es/.claude/skills/spherex-datos/SKILL.md) · [中文](../../../../zh/.claude/skills/spherex-datos/SKILL.md) · [Deutsch](../../../../de/.claude/skills/spherex-datos/SKILL.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/skills/spherex-datos/SKILL.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Dati di SPHEREx in IRSA

Riferimento operativo. Il documento lungo, con le fonti, è `docs/02_DATOS_SPHEREX.md`;
questa skill è ciò che serve per scrivere codice senza sbagliare.

**Regola d'oro: se un percorso o un parametro non è in questa skill né nella documentazione ufficiale di
IRSA, non inventarlo.** Consulta <https://caltech-ipac.github.io/spherex-archive-documentation/>.

---

## 1. La prima cosa da capire: il filtro lineare variabile

SPHEREx non ha filtri discreti. La lunghezza d'onda varia in modo continuo lungo un asse
del rivelatore. Lo spettro di una sorgente si costruisce osservandola molte volte, ogni volta in una
posizione diversa del campo, e **quindi ogni volta a una lunghezza d'onda diversa**.

**Conseguenza diretta:** due immagini della stessa zona del cielo prese in epoche diverse
normalmente **non sono alla stessa lunghezza d'onda**. Un blink ingenuo produce una sequenza in cui
la luminosità salta senza che nulla si sia mosso.

Per questo, in qualsiasi codice che costruisca una sequenza temporale:

1. **Raggruppa per rivelatore/banda e scegli le epoche a λ uniformata** prima di formare la sequenza. Raggruppare per banda non basta: all'interno di un rivelatore la λ dell'oggetto percorre ~16 larghezze di banda; con selezione uniformata scende da 0,47 a 0,035 µm (`eda/03_recortes_y_figuras.py`, `elegir_lambda_igualada`; `docs/09` §2). Poi riproietta su una griglia comune: il rivelatore ruota di ~180° tra una passata e l'altra.
2. **Leggi `WCS-WAVE`** ed esponi la λ di ogni fotogramma. Non è opzionale: è il campo che spiega ciò che
   l'utente sta vedendo.
3. **Normalizza ogni fotogramma** con percentili robusti sullo stesso ritaglio.

---

## 2. Le sei bande

| Banda = rivelatore | λ | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

Un puntamento genera **6 MEF**, uno per rivelatore, ma una data posizione cade solo in 2 di essi (coppie D1+D4, D2+D5 o D3+D6): una query per posizione restituisce 2 file per puntamento (`docs/09` §1). **Non tutte le osservazioni portano tutte e 6**: la qualità
si valuta per banda. Il codice deve tollerare bande assenti senza fallire.

Per nane brune fredde e oggetti rossi, le bande lunghe (4–6) sono quelle interessanti.

---

## 3. Collezioni SIA2

Endpoint generico:

```
https://irsa.ipac.caltech.edu/SIA?
```

| COLLECTION | Cos'è |
|---|---|
| `spherex_dr1` | Immagini spettrali DR1, survey ampia |
| `spherex_dr1_deep` | DR1, campi profondi |
| `spherex_dr1_cube` | Cubo di tutto il cielo DR1 |
| `spherex_qr3` | Immagini spettrali QR3, survey ampia |
| `spherex_qr3_deep` | QR3, campi profondi |

- **DR1 + QR3 sostituiscono QR2.** Per cercare tutto ciò che è vigente bisogna interrogare **entrambe**.
- **QR2 non è ricercabile** via SIA2. Resta scaricabile tramite URL diretto fino a febbraio 2027.
- I file di **calibrazione non sono in SIA2**: si scaricano dalle directory navigabili.
- I dati vengono acquisiti **settimanalmente** e SIA2 **è ~1 giorno indietro** rispetto alle directory e al
  Data Explorer.

Query da riga di comando (esempio dalla documentazione di IRSA):

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RAGGIO`, tutto in gradi. Togli `RESPONSEFORMAT` per ricevere VOTable.

Colonne della risposta che contano:

- `access_url` — URL del file in IPAC. **È su questo URL che si richiede il cutout.**
- `cloud_access` — come leggere lo stesso file da AWS S3.

---

## 4. Cutout

Un MEF completo pesa **~70 MB**. Per un visore bisogna richiedere ritagli **sempre**.

Si richiedono **aggiungendo parametri alla `access_url`**:

```bash
curl -o cutout.fits "<access_url>?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in gradi decimali.
- `size` in gradi.
- Documentazione: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

**Funziona solo sui file ospitati in IPAC, non sulla copia di AWS.**

Il MEF ritagliato conserva le stesse estensioni; `IMAGE`, `FLAGS`, `VARIANCE` e `ZODI` vengono ritagliate,
`WCS-WAVE` viene adattata, e **l'estensione della PSF arriva non modificata** (è quella dell'immagine intera).

---

## 5. Cosa c'è dentro il MEF

2040 × 2040 pixel, sei estensioni:

| HDU | Nome | Contenuto | Trappola |
|---|---|---|---|
| 1 | `IMAGE` | Luminosità superficiale, MJy/sr | **La luce zodiacale NON è sottratta** |
| 2 | `FLAGS` | Bit di stato per pixel | I nomi dei bit sono nell'header (`MSKN/MSKM/MSKD`). **Mai `FLAGS != 0`**: il bit SOURCE segna il 72 % del ritaglio e non è un errore; usare una maschera per bit (`BITS_MALOS` in `eda/03_recortes_y_figuras.py`, ~4 %) |
| 3 | `VARIANCE` | Varianza, (MJy/sr)² | Usala per il rapporto segnale-rumore |
| 4 | `ZODI` | Modello di luce zodiacale, MJy/sr | Sottraila tu: `IMAGE - ZODI` migliora molto il contrasto |
| 5 | `EPSF` (DR1/QR3) o `PSF` (QR2) | PSF per zona del rivelatore | È cambiata tra le release. Non dare per scontata la forma |
| 6 | `WCS-WAVE` | Pixel → λ centrale e larghezza di banda | Parte poco usata dello standard FITS; molti lettori non la capiscono |

Su `WCS-WAVE`: è una tabella di **1 riga e 3 colonne** (`X`, `Y`, `VALUES`), una griglia di punti
di controllo. Se il tuo lettore non la riconosce, **interpola bilinearmente tra i quattro punti di controllo
più vicini**: precisione ~1 nm, sufficiente per la visualizzazione. Per la scienza bisogna usare `CWAVE` e
`CBAND` del prodotto di calibrazione Spectral WCS.

**Convenzione dei pixel:** gli header FITS sono 1-based; Astropy restituisce 0-based. IRSA lo avverte
esplicitamente nel lavorare con la PSF. È la causa classica di spostamenti di un pixel.

### Nomi dei file

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits` si legge così:
`2025W18_2B` = planning period (~3,5 giorni di operazione) · `0001` = large slew ·
`1` = small slew (1–4) · `D1` = rivelatore 1 · `v12-2025-164` = versione e data di elaborazione.

---

## 6. Il cubo di tutto il cielo (solo DR1)

Mosaici di tutto il cielo, uno per ciascuno dei 102 canali. **Ci sono due versioni** (verificato il 14 nov, `docs/09`):

1. **Quella di SIA2** (`COLLECTION=spherex_dr1_cube`, directory `.../ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir[N]/`):
   FITS di ~320 MB per tessera; il servizio di ritagli la rifiuta. **Non serve per Aladin.** (La radice
   di quella directory come HiPS, `.../properties`, dà 404.)
2. **L'HiPS per browser:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
   (PNG, ordine 5, 102 piani, 50 e 51 vuoti, CORS aperto). **Questa è quella che carica Aladin Lite.**
   Vedi la skill `visor-sky-blink`.

Non confondere i due prodotti:

| | Livello 2 | Cubo di tutto il cielo |
|---|---|---|
| Asse che apporta | **Tempo** | **Lunghezza d'onda** |
| Per | Il blink, il movimento | Il colore e il contesto (PNG senza flussi: lo spettro **non** esce da qui, esce dal livello 2) |
| Risoluzione | Nativa | HEALPix ordine 5 (grossolana) |
| Dove | DR1, QR3 | Solo DR1 |

---

## 7. Python

```bash
pip install pyvo astroquery astropy
```

I notebook ufficiali sono la via più breve e sono in
<https://caltech-ipac.github.io/irsa-tutorials/spherex/>: Data Overview, Spectral Image Cutouts,
PSF Models, Source Discovery Tool, Mosaic Cube, HiPS All-Sky Cube.

**Prima di scrivere un client proprio, guarda `spxquery`** (<https://spxquery.readthedocs.io>,
`pip install spxquery`): pacchetto di terzi che già fa query TAP a IRSA, download con cutout,
fotometria di apertura con sottrazione zodiacale, combinazione in cubi 3D e curve di luce. Anche se non
lo si usa, la sua architettura in quattro fasi e il suo controllo di qualità (soglia di SNR, filtraggio per flag)
sono una buona mappa di ciò che bisogna risolvere.

---

## 8. Strumenti di IRSA che già esistono

Prima di costruire qualcosa, verifica se IRSA l'ha già fatto. Tutti sono collegati da
<https://irsa.ipac.caltech.edu/Missions/spherex.html>.

| Strumento | Cosa fa |
|---|---|
| **SPHEREx Data Explorer** | Ricerca, visualizzazione e download, per astronomi |
| **MOST** | Data l'orbita di un oggetto del sistema solare, trova le immagini che hanno coperto la sua posizione prevista in ogni epoca |
| **Spectrophotometry Tool** | Estrae spettri tramite fotometria forzata |
| **Mosaic Tool** | Mosaici multibanda su misura |
| **Cutout Tool** | Ritagli dei MEF |
| **Source Discovery Tool** | Rileva e caratterizza sorgenti senza posizioni previe |
| **Cloud Data Access** | Gli stessi dati su AWS S3 |
| **Comet 3I/ATLAS** | Collezione dedicata di immagini della cometa interstellare |

---

## 9. Attribuzione obbligatoria

Deve comparire in qualsiasi materiale pubblicato che usi dati di SPHEREx:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## 10. Errori che sappiamo già che si commettono

1. **Fare blink senza raggruppare per banda.** Produce una sequenza stroboscopica. Sezione 1.
2. **Dimenticare di sottrarre `ZODI`.** Le sorgenti deboli si perdono nel fondo.
3. **Supporre che tutte le epoche portino le 6 bande.** Non è così.
4. **Cercare solo in `spherex_dr1`** e concludere che ci siano poche epoche. Bisogna sommare `spherex_qr3`.
5. **Usare QR2 perché è ciò che diceva un vecchio tutorial.** Non è ricercabile via SIA2.
6. **Scaricare il MEF completo** invece di richiedere il cutout. 70 MB per epoca.
7. **Mescolare 1-based e 0-based** nel convertire i pixel. Spostamenti di un pixel.
8. **Presentare la fotometria di apertura come qualità scientifica.** Sempre con la sua avvertenza.
9. **Richiedere cutout sull'URL di AWS.** Il servizio opera solo sui file di IPAC.
10. **Concludere «non ci sono dati» dopo una query vuota.** Prova un'altra collezione, un altro raggio, un'altra banda.

---

## 11. Extra verificati rispetto alla documentazione di IRSA/AWS (14 nov 2026)

Aggiunti dall'esplorazione del team. **Presi dalla documentazione di IRSA/AWS: l'EDA ha usato SIA2 e HTTP Range, non TAP né lo specchio S3, quindi questi due non sono ancora stati provati dal team.** Provali con un file reale prima di dipenderne.

- **Specchio su AWS (lettura massiva, senza account):** `s3://nasa-irsa-spherex/{qr3,dr1}/level2/...`,
  regione `us-east-1`, accesso anonimo. Stessa struttura di directory di IRSA. Lettura parziale senza
  scaricare i 70 MB:
  ```python
  from astropy.io import fits
  with fits.open(s3_url, use_fsspec=True, fsspec_kwargs={"anon": True}) as h:
      sub = h["IMAGE"].section[y0:y1, x0:x1]
  ```
  Utile solo se il backend gira in `us-east-1`. Per un oggetto, il cutout di IRSA è più semplice (errore 9).
- **Query TAP rapida, ordinata per tempo e con l'URL del cutout già costruito** (via rapida del
  tutorial `spherex-cutouts`: join spaziale indicizzato su `spherex.plane.poly`):
  ```python
  from astroquery.ipac.irsa import Irsa
  from astropy.utils.data import conf; conf.remote_timeout = 120
  q = f"""SELECT 'https://irsa.ipac.caltech.edu/' || a.uri ||
    '?center={ra},{dec}d&size=0.1' AS uri, p.time_bounds_lower, p.energy_bandpassname
  FROM spherex.artifact a JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1=CONTAINS(POINT('ICRS',{ra},{dec}), p.poly)
  ORDER BY p.time_bounds_lower"""
  tab = Irsa.query_tap(q).to_table()
  ```
  Aggiungi `AND p.energy_bandpassname='SPHEREx-D4'` per una sola banda.
- **λ nel pixel della sorgente con astropy** (WCS alternativo `W` dell'estensione `WCS-WAVE`):
  ```python
  from astropy.wcs import WCS
  x, y = WCS(h["IMAGE"].header).world_to_pixel(coord)
  wcs_w = WCS(h["IMAGE"].header, fobj=h, key="W"); wcs_w.sip = None
  lam, dlam = wcs_w.pixel_to_world(x, y)   # λ central y ancho de banda
  ```
  Se fallisce, interpolazione bilineare tra i 4 punti di controllo più vicini della tabella (~1 nm).
- **Download robusto:** `ThreadPoolExecutor(max_workers=10)` con nuovo tentativo su `TimeoutError`,
  `HTTPError`, `IncompleteRead` e `RemoteDisconnected` (così fa il notebook ufficiale). Un cutout senza
  sovrapposizione restituisce **HTTP 500**: trattalo come «senza dati», non come caduta.
- **Le stelle che si muovono escono come dipolo** (coppia positivo/negativo) in `diff_first`/`diff_prev`.
  È previsto ed è ciò che l'utente deve vedere; non è variabilità. **Salvo che il nucleo sia saturo o mascherato** (OVERFLOW, TRANSIENT, SUR_ERROR): allora la coppia compare anche se l'oggetto non si muove (RW Aur «si muove» di 1,4 px senza muoversi). Bisogna avvisare quando l'oggetto satura (`docs/09`).
- **Per sottrarre epoche, prima `reproject.reproject_interp` su una griglia comune:** ogni epoca arriva
  con un'altra rotazione. Mostra la sottrazione in S/N usando `VARIANCE` perché i residui di stelle
  luminose non sembrino rilevamenti.


---

## 12. Misurato nell'EDA (14 nov)

Cifre di `docs/09_EDA_HALLAZGOS.md` e `eda/resultados/`, per non rimisurarle:

- **IRSA non risponde con CORS** (né SIA2 né i cutout): tutto passa per il backend. Solo l'HiPS di `/data/hips/SPHEREx/` ce l'ha.
- **Cutout da 0,1°:** mediana 7,3 s, p90 10,8 s, max. 29 s, ~3,9 MB **di qualunque dimensione sia** (la PSF arriva intera: uno più piccolo non è più veloce). 503 transitori; uno è persistito per 4 tentativi. Con al massimo 4 in parallelo.
- **Header economico:** l'header di IMAGE si scarica con una richiesta HTTP Range di ~35 KB (~0,1 s effettivo con 6 in parallelo).
- **Scala di pixel:** 6,15″ (SIA2). Gli oggetti più veloci si muovono di 1,1-1,8 px in tutto il periodo disponibile (1,0-1,4 anni).
