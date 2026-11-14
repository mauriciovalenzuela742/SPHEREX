<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/02_DATOS_SPHEREX.md) · [Español](../../es/docs/02_DATOS_SPHEREX.md) · [中文](../../zh/docs/02_DATOS_SPHEREX.md) · [Deutsch](../../de/docs/02_DATOS_SPHEREX.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/02_DATOS_SPHEREX.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 02 — Dati di SPHEREx: dove sono e come si richiedono

Scheda tecnica. Tutto ciò che è qui è tratto dalla documentazione ufficiale di IRSA/IPAC consultata il
**14 novembre 2026**, tranne ciò che è segnato `[RAZONAMIENTO]`, che è una nostra deduzione e va
verificata rispetto ai dati.

Fonti principali:

- Pagina della missione: <https://irsa.ipac.caltech.edu/Missions/spherex.html>
- Guida di accesso: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access>
- Guida dei prodotti: <https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products>
- Cutout: <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html> e <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- Notebook: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

---

## 1. La missione in numeri

| Dato | Valore |
|---|---|
| Vita pianificata | 2025 – 2027 |
| Copertura | 100 % del cielo, una passata completa ogni ~6 mesi |
| Intervallo | 0,75 – 5,0 µm (infrarosso vicino) |
| Canali spettrali | 102 |
| Rivelatori | 6 array (3 a onda corta, 3 a onda lunga, separati da un dicroico) |
| Strumento | Spettrografo a immagine con **filtro lineare variabile (LVF)** a campo ampio |

Risoluzione spettrale per banda (questo definisce quale rivelatore serve per cosa):

| Banda / rivelatore | Lunghezza d'onda | R |
|---|---|---|
| 1 | 0,75 – 1,09 µm | 39 |
| 2 | 1,10 – 1,62 µm | 41 |
| 3 | 1,63 – 2,41 µm | 41 |
| 4 | 2,42 – 3,82 µm | 35 |
| 5 | 3,83 – 4,41 µm | 112 |
| 6 | 4,42 – 5,00 µm | 128 |

---

## 2. Il dettaglio che decide il progetto: come SPHEREx ottiene gli spettri

SPHEREx non ha filtri discreti. Ha un **filtro lineare variabile**: la lunghezza d'onda
cambia in modo continuo lungo un asse del rivelatore. Nelle parole della documentazione di IRSA:

> SPHEREx obtains spectra through multiple exposures, placing a given source at multiple positions
> in the field of view, where it is measured at multiple wavelengths by repointing the spacecraft.

Cioè: **lo spettro di una sorgente si costruisce osservandola molte volte, ogni volta in una parte
diversa del rivelatore, e quindi ogni volta a una lunghezza d'onda diversa.**

`[RAZONAMIENTO]` La conseguenza per questa sfida è grande ed è bene averla chiara fin
dall'ora 0. Se si prendono tutte le immagini di livello 2 che coprono una posizione del cielo, le si ritaglia e
le si passa in sequenza, **non si ottiene un blink pulito: si ottiene una sequenza in cui la luminosità di ogni
sorgente salta perché ogni fotogramma è a un'altra lunghezza d'onda.** Una stella rossa apparirà
luminosa in alcuni fotogrammi e debole in altri senza essere cambiata. Questo rovina proprio ciò che
la sfida vuole mostrare: ciò che si muove e ciò che varia davvero.

Le tre vie d'uscita possibili, in ordine di costo:

1. **Raggruppare per banda/rivelatore prima di fare il blink.** Ogni fotogramma del video è la stessa
   banda (p. es. rivelatore 4) in epoche diverse. All'interno di una banda la lunghezza d'onda varia ancora, ma molto meno. È la lettura letterale del punto della sfida: *«it may make sense to
   separately add together all the data taken by each of the six detector arrays»*.
2. **Raggruppare per lunghezza d'onda usando l'estensione `WCS-WAVE`**, che dà la λ centrale in ogni
   pixel. Più corretto e più costoso.
3. **Normalizzare ogni fotogramma** (percentili robusti sullo stesso ritaglio) perché il salto di
   livello non domini. È una pezza visiva, non una soluzione fisica, ma in 24 ore può essere ciò che
   salva la demo.

> **Verificato il 14 nov ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) §2):** raggruppare solo per rivelatore
> **non** uniforma la λ (all'interno di un rivelatore varia ~16 larghezze di banda). Bisogna scegliere epoche a λ
> uniformata; è economico perché la λ si ricava da `WCS-WAVE` con una richiesta HTTP Range di ~35 KB.

**Questo andava verificato con dati reali nell'ora 1 dell'evento**, non discusso. Scaricare i
cutout di uno stesso campo, leggere `WCS-WAVE` di ciascuno e vedere quanto varia la λ tra epoche.

---

## 3. Quali versioni dei dati esistono oggi

Cronologia delle pubblicazioni secondo la pagina della missione di IRSA:

| Data | Cosa è uscito |
|---|---|
| Luglio 2025 | Primi prodotti Quick Release (QR1) |
| Ottobre 2025 | QR2 (rielaborato) |
| 10 aprile 2026 | Correzione di un errore nell'header dell'estensione PSF di QR2 |
| Settembre 2026 | QR3 |
| **Novembre 2026** | **Data Release 1 (DR1)** |

**DR1 e QR3 insieme sostituiscono QR2.** QR2 resta scaricabile direttamente fino a febbraio 2027,
ma non è più ricercabile via SIA2.

> **DR1 è appena uscito, proprio questo mese.** È molto probabile che nessun altro team lo abbia usato e
> quasi certo che i tutorial e gli esempi che circolano su internet puntino ancora a QR2.
> Questa è al tempo stesso la maggiore opportunità e il maggior rischio del progetto. Vedi [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 4. Le quattro vie di accesso

IRSA serve i dati da due luoghi: in IPAC («on-premises») e su AWS S3. Ci sono quattro livelli di accesso.

### 4.1 Directory navigabili

Radice: <https://irsa.ipac.caltech.edu/ibe/data/spherex/>

Una sottodirectory per release: `dr1`, `qr3`, `qr2`. I MEF di livello 2 si trovano in:

```
level2/[Planning Period]/l2b-v[Version]-[Processing Date]/[Detector]/
```

Il cubo di tutto il cielo (solo DR1):

```
hips5_cube/hips_20261026/Norder5/Dir[Directory Number]/
```

Serve per `wget`/`curl` massivi e per capire l'organizzazione. **Non serve per cercare per
coordinate**: per questo c'è SIA2.

### 4.2 SIA2 (Simple Image Access v2, standard IVOA) — la via principale

Endpoint generico:

```
https://irsa.ipac.caltech.edu/SIA?
```

Bisogna aggiungere `COLLECTION`. Le cinque collezioni di SPHEREx:

| COLLECTION | Cosa contiene |
|---|---|
| `spherex_dr1` | MEF di immagine spettrale DR1, survey **ampia** (copertura uniforme di tutto il cielo) |
| `spherex_dr1_deep` | MEF DR1 dei campi **profondi** |
| `spherex_dr1_cube` | Cubo di tutto il cielo DR1 |
| `spherex_qr3` | MEF QR3, survey ampia |
| `spherex_qr3_deep` | MEF QR3, campi profondi |

**Per cercare tutte le immagini spettrali vigenti di una posizione bisogna interrogare
`spherex_dr1` e `spherex_qr3`** (e le `_deep` se si vogliono i campi profondi). QR2 non è ricercabile.

Esempio verificato nella documentazione di IRSA:

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RAGGIO` in gradi. Formati di risposta: `HTML` per guardare a occhio, VOTable per impostazione predefinita
per elaborare.

La tabella restituita contiene, tra le altre, due colonne che ci interessano:

- `access_url` — URL di download del file in IPAC. **È quello che si usa per richiedere un cutout.**
- `cloud_access` — informazioni per leggere lo stesso file da AWS S3.

Due avvertenze della documentazione ufficiale:

- I file di **calibrazione non sono in SIA2**; si scaricano dalle directory navigabili.
- I dati vengono acquisiti **settimanalmente**, e la disponibilità via SIA2 **ha un giorno di ritardo**
  rispetto alle directory, al Data Explorer e ad alcune query TAP.

### 4.3 Cutout — ciò che rende davvero praticabile il visore

Un MEF completo pesa **circa 70 MB**. Scaricare 15 epoche complete per mostrare un ritaglio di 0,1° è
impraticabile in un hackathon e in uno strumento pubblico.

Il servizio di cutout si invoca **aggiungendo parametri all'URL del file**:

```bash
curl -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC` in gradi decimali.
- `size` in gradi.
- Parametri completi: <https://irsa.ipac.caltech.edu/ibe/cutouts.html>

Limitazione importante: **i cutout funzionano solo sui file ospitati in IPAC**, non sulla
copia su AWS.

Il MEF ritagliato conserva le stesse estensioni. `IMAGE`, `FLAGS`, `VARIANCE` e `ZODI` vengono ritagliate;
`WCS-WAVE` si adatta al ritaglio; **l'estensione della PSF arriva non modificata**, con la PSF
dell'immagine originale intera.

### 4.4 Python

```bash
pip install pyvo astroquery astropy
```

`pyvo` e `astroquery` incapsulano SIA2. I notebook ufficiali di IRSA sono la via più breve:

| Notebook | A cosa serve |
|---|---|
| Data Overview | Trovare immagini che coprono una posizione e capire il MEF |
| Spectral Image Cutouts | Generare cutout e impacchettarli in un nuovo MEF |
| PSF Models | Come è organizzata la PSF |
| Source Discovery Tool | Scoprire ed estrarre sorgenti |
| Mosaic Cube | Analizzare un cubo del Mosaic Tool |
| HiPS All-Sky Cube | Esplorare il cubo HiPS in Firefly ed estrarre uno spettro rapido |

Indice: <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Esiste anche **`spxquery`** (v0.4.1), pacchetto di terzi su PyPI che automatizza query, download
con cutout, fotometria di apertura con sottrazione della luce zodiacale, combinazione in cubi 3D («Drizzle3D»)
e curve di luce: <https://spxquery.readthedocs.io>. È il pezzo che più somiglia a ciò che c'è da
costruire dal lato dei dati. **Conviene guardarlo prima di scrivere qualsiasi cosa**: anche se non lo si usa, la sua
architettura in quattro fasi e il suo controllo di qualità sono una buona mappa.

---

## 5. Cosa c'è dentro un file

Il prodotto principale è lo **Spectral Image MEF di livello 2**. Ce ne sono **6 per puntamento** (uno per
rivelatore), ~70 MB ciascuno, immagini di **2040 × 2040** pixel.

| HDU | Nome | Contenuto |
|---|---|---|
| 1 | `IMAGE` | Luminosità superficiale calibrata in MJy/sr. **Non ha la luce zodiacale sottratta** |
| 2 | `FLAGS` | Mappa di bit per pixel: stato ed elaborazione. Tabella 16 dell'Explanatory Supplement |
| 3 | `VARIANCE` | Varianza della luminosità, in (MJy/sr)² |
| 4 | `ZODI` | Modello di luce zodiacale, in MJy/sr. **Va sottratto da soli se lo si vuole** |
| 5 | `EPSF` (DR1/QR3) o `PSF` (QR2) | PSF effettive per zona del rivelatore |
| 6 | `WCS-WAVE` | Tabella che mappa pixel → lunghezza d'onda centrale e larghezza di banda |

Note che fanno risparmiare ore:

- **`FLAGS` è la risposta diretta al punto della sfida sulle «contamination flags».** Mostrarle
  nell'interfaccia è economico ed è esattamente ciò che l'autore della sfida ha chiesto.
- **La luce zodiacale non è sottratta.** Per un visore, sottrarre `ZODI` da `IMAGE` migliora molto il
  contrasto delle sorgenti deboli. È una riga di codice e un argomento di vendita.
- **`WCS-WAVE` usa una parte poco comune dello standard FITS** che, secondo IRSA, «non tutti
  i lettori hanno ancora implementato». Se il tuo client FITS non la riconosce: cerca i quattro punti di controllo più
  vicini e interpola bilinearmente, con precisione di ~1 nm. **Quella precisione è per la visualizzazione.**
  Per la scienza bisogna usare le estensioni `CWAVE` e `CBAND` del prodotto di calibrazione Spectral WCS.
- **Convenzione dei pixel.** Gli header FITS sono 1-based; Astropy restituisce 0-based. IRSA lo avverte
  esplicitamente per la gestione della PSF. È una fonte classica di spostamenti di un pixel.
- **Non tutte le osservazioni portano le 6 bande**: la qualità si valuta per banda e alcune non
  arrivano all'archivio. Il codice deve tollerare bande assenti.

### Nomi dei file

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

Esempio: `level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits`

Scomponendolo:

- `2025W18_2B` — **planning period**: il piano di volo caricato sulla navicella, copre ~3,5 giorni di operazione.
- `0001` — contatore di *large slew*.
- `1` — contatore di *small slew* (da 1 a 4; alcuni large slew ne portano meno di 4).
- `D1` — rivelatore 1.
- `v12-2025-164` — versione e data di elaborazione (anno + giorno dell'anno).

`[RAZONAMIENTO]` L'*observation ID* è quello che ordina il video nel tempo. Conviene non fidarsi del
nome e leggere la data dall'header, ma per ordinare in fretta serve.

### Il cubo di tutto il cielo (solo DR1)

DR1 porta un **All-Sky Cube**: mosaici di tutto il cielo interpolati spazialmente e spettralmente, uno
per ciascuno dei 102 canali. Esiste in **due versioni** (verificato il 14 nov, vedi
[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)):

1. **Quella fornita da SIA2** (`COLLECTION=spherex_dr1_cube`, directory `hips5_cube/hips_20261026/Norder5/`):
   tessere FITS di 512×512×102, ~320 MB ciascuna. Il servizio di ritagli le rifiuta (422/503) e
   Aladin non le usa. Non serve per il visore.
2. **L'HiPS per browser**, in `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`:
   tessere **PNG**, ordine 5, 102 piani (i 50 e 51 sono vuoti), pixel di 12,9″, CORS aperto.
   **Questa è quella che carica Aladin Lite 3.8.2** senza backend. È un mosaico di tutte le epoche (senza asse
   del tempo) e in PNG già stirato (senza flussi).

Il fatto che si possa mostrare in Aladin senza backend è la migliore notizia tecnica della sfida per la via A.
Vedi [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md).

Attenzione a non confondere i due prodotti, perché rispondono a domande diverse:

| | Immagini di livello 2 | Cubo di tutto il cielo |
|---|---|---|
| Asse che dà | **Tempo** (molte epoche) | **Lunghezza d'onda** (102 canali) |
| A cosa serve | Il blink, rilevare il movimento | Contesto e le 102 bande come immagine (PNG senza flussi: **non** serve per lo spettro) |
| Risoluzione | Nativa del rivelatore | Ordine 5 di HEALPix (grossolana) |
| Disponibile in | DR1, QR3 (e QR2 scaricabile) | **Solo DR1** |

**Il visore richiesto dalla sfida ha bisogno di entrambe le cose.** Il tempo viene dal livello 2; le 102 bande
come immagine, dal cubo. Lo spettro (flusso contro λ) esce dai file di livello 2 o dallo
Spectrophotometry Tool di IRSA, non dal cubo ([`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md)).

---

## 6. Strumenti di IRSA che già esistono

Prima di costruire qualcosa, guardare se IRSA l'ha già fatto. Tutti sono collegati dalla pagina della missione.

| Strumento | Cosa fa | Perché ci interessa |
|---|---|---|
| **SPHEREx Data Explorer** | Interfaccia web di ricerca, visualizzazione e download | È "il concorrente". Guardarlo per vedere cosa NON fare: è pensato per astronomi |
| **MOST** (Moving Object Search Tool) | Calcola l'orbita di un oggetto del sistema solare e trova le immagini di SPHEREx che hanno coperto la sua posizione prevista in ogni epoca | Direttamente rilevante per asteroidi e comete. Una scheda "segui questo asteroide" esce quasi gratis |
| **Spectrophotometry Tool** | Estrae spettri dalle immagini tramite fotometria forzata | È la risposta di IRSA allo «spectra on the fly» della sfida |
| **Mosaic Tool** | Mosaici multibanda su misura | |
| **Cutout Tool** | Ritagli dei MEF | Già descritto sopra |
| **Source Discovery Tool** | Identifica e caratterizza sorgenti in una regione senza bisogno di posizioni previe | Se si vogliono segnare sorgenti sull'immagine |
| **Cloud Data Access** | Gli stessi dati su AWS S3 | Per elaborazioni pesanti |
| **Comet 3I/ATLAS** | Collezione dedicata di immagini spettrali della cometa interstellare | Materiale pronto per una demo d'effetto |

`[RAZONAMIENTO]` La collezione di 3I/ATLAS merita un minuto di attenzione: è un oggetto che si muove
rapidamente, è recente, e il pubblico lo conosce. Per la demo di 2 minuti vale più di qualsiasi nana
bruna.

---

## 7. Dati di altre missioni (gli overlay)

La sfida suggerisce di permettere di sovrapporre dati di altri telescopi.

| Missione | Accesso | Cosa apporta |
|---|---|---|
| **Gaia DR3** | <https://archive.stsci.edu/missions-and-data/gaia>, o `astroquery.gaia`, o il catalogo HiPS del CDS in Aladin | Posizioni, moti propri e parallassi precisissimi. Permette di **prevedere dove dovrebbe trovarsi** una stella in ogni epoca e verificare che il visore sia corretto |
| **WISE / NEOWISE** | IRSA; unWISE in <https://unwise.me> | Il confronto ovvio: il blink in WISE è ciò che fa WiseView |
| **NEOSSat** (CSA) | <https://data.asc-csa.gc.ca/dataset/neossat>, tutorial in <https://github.com/asc-csa/NEOSSAT_Tutorial> | È una risorsa di un'agenzia partner. Usarla aggiunge punti nel criterio *Global Connection* |
| **SIMBAD / VizieR** (CDS) | <https://simbad.cds.unistra.fr> | Risolvere nomi («Barnard's Star») in coordinate. **Necessario perché lo strumento sia utilizzabile da chiunque** |

`[RAZONAMIENTO]` Gaia non è solo un abbellimento visivo: è il **controllo di qualità** del visore. Se si
disegna sull'immagine la posizione che Gaia prevede per la stella alla data di quell'epoca e
coincide con il punto luminoso, è dimostrato che il WCS, le date e il ritaglio sono a posto.
È il modo più economico di provare a una giuria che lo strumento è corretto, e non solo bello.

---

## 8. Attribuzione obbligatoria

IRSA richiede di includere questa nota in qualsiasi materiale pubblicato che usi dati di SPHEREx:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**Va nel piè di pagina dello strumento e nel README.** È un punto gratis di cura davanti a una giuria
della NASA e costa trenta secondi.

Paper canonici che IRSA chiede di citare: Bock et al. (2026) per la missione, Akeson et al. (2026) per
la pipeline, Crill et al. (2025) per il simulatore di cielo, Korngut et al. (2026) per strumento e
calibrazione. Dettagli in [`../biblio/README.md`](../biblio/README.md).

---

## 9. Checklist dell'ora 1 dell'evento

Questo è ciò che bisogna verificare con dati reali prima di decidere qualsiasi cosa:

- [x] Una query SIA2 a `spherex_dr1` su WISE 0855 restituisce righe. Annotare quante. **Sì: 258 file** (`docs/09` §1).
- [x] Lo stesso su `spherex_qr3`. Annotare quante e se si sovrappongono con le precedenti. **0 righe per WISE 0855; non si ripetono file tra le due** (`docs/09` §1).
- [x] Quante epoche distinte ci sono per un campo tipico? Questo decide se il "video" ha 5 o 50 fotogrammi. **3-4 passate per zona, base di 1,0-1,4 anni** (`docs/09` §1).
- [x] Un cutout di `size=0.1` si scarica in meno di N secondi. Misurarlo. **Decide se serve cache o coda.** *(Misurato: mediana 7,3 s, p90 10,8 s, max. 29 s, ~3,9 MB; serve la cache; `docs/09` §6.)*
- [ ] Aprire il MEF ritagliato e confermare le 6 estensioni. *(Non verificato nell'EDA.)*
- [x] Leggere `WCS-WAVE` di due epoche diverse dello stesso campo. **Quanto cambia la λ?** (sezione 2). **~16 larghezze di banda all'interno di un rivelatore** (`docs/09` §2).
- [x] L'HiPS del cubo DR1 si carica in Aladin Lite puntando alla directory di IRSA? Se sì, c'è una via rapida. **Sì, l'HiPS PNG di `/data/hips/SPHEREx/spherex_allsky_cube` (non la directory `ibe/`).**
- [x] IRSA risponde con CORS a una richiesta dal browser? Se no, **tutto passa per il backend**. **No: solo l'HiPS ha CORS; SIA2 e cutout passano per il backend** (`docs/09` §6).

*Risposto il 14 nov in [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md). Resta aperta solo la casella delle 6 estensioni.*
