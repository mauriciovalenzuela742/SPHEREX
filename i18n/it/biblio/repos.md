<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/biblio/repos.md) · [Español](../../es/biblio/repos.md) · [中文](../../zh/biblio/repos.md) · [Deutsch](../../de/biblio/repos.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `biblio/repos.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Repository e strumenti di codice

Ciò che esiste già e può farci risparmiare ore. Ordinato per quanto si applica direttamente alla sfida.

**Regola:** prima di scrivere qualcosa, guarda se è in questa lista. E prima di usare un repository di
terzi nel progetto, **verifica la sua licenza**.

---

## Direttamente applicabili

### `spxquery` — interrogazione e fotometria di SPHEREx
<https://spxquery.readthedocs.io> · `pip install spxquery` · v0.4.1

**Ciò che più somiglia a quello che bisogna costruire lato dati.** Pipeline in quattro fasi:
interrogazione TAP a IRSA, download con cutout (p. es. 200 px invece di 2040×2040), fotometria di apertura
con sottrazione della luce zodiacale, e curve di luce. Include controllo di qualità con soglia di rapporto segnale-rumore e
filtraggio per bit di `FLAGS`, e combinazione di osservazioni in cubi spettrali 3D («Drizzle3D»).

**Come usarlo:** anche se non lo si adotta come dipendenza, **leggere la sua architettura prima di progettare la
nostra**. Ha già risolto i problemi che incontreremo: riprendere i download, parallelismo,
cosa fare con le varianze rotte.

### `irsa-tutorials` — notebook ufficiali di IRSA
<https://github.com/Caltech-IPAC/irsa-tutorials> · <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

Notebook di SPHEREx: Data Overview, Spectral Image Cutouts, PSF Models, Source Discovery Tool,
Mosaic Cube, **HiPS All-Sky Cube**. Sono la strada più breve verso un esempio funzionante.
Quello dei cutout mostra inoltre come impacchettare più ritagli in un nuovo MEF.

### `aladin-lite` — il visore del cielo
<https://github.com/cds-astro/aladin-lite> · npm `aladin-lite` · LGPL-3.0-or-later secondo GitHub; **attenzione:** i metadati di npm e `scaffold/frontend/package-lock.json:1248` dicono `GPL-3` (non risolto: aprire il `LICENSE` del pacchetto 3.8.2)

Il visore HiPS del CDS. Lo suggerisce l'enunciato stesso.

### `astropy` / `astroquery` / `pyvo`
<https://github.com/astropy/astropy> · <https://github.com/astropy/astroquery> · <https://github.com/astropy/pyvo>

FITS, WCS, coordinate, stretching, accesso a SIA2/TAP e a SIMBAD/Gaia. **Base del backend.**
`astropy.visualization` risolve lo stretching delle immagini; non reimplementarlo.

---

## Precedente: l'ecosistema di WiseView

Non abbiamo trovato conferma del codice sorgente del WiseView originale, ma sì dei pacchetti costruiti
sulla sua API, che mostrano come si usa uno strumento così come infrastruttura.

### `flipbooks`
<https://github.com/coolneighbors/flipbooks>

Pacchetto Python che usa l'**API di WiseView** per estrarre lampeggi di coadd di unWISE.
Paternità attribuita a Noah Schapera, Austin Humphreys e Aaron Meisner.
**A cosa ci serve:** vedere come si parametrizza un lampeggio (dimensione, epoche, stretching) in un'API
che si è rivelata utilizzabile da terzi. Quello è il metro per il nostro URL interrogabile.

### `unWISE-verse`
<https://github.com/coolneighbors/unWISE-verse>

Scarica dati di obiettivi di WISE tramite l'API di WiseView, manipola le immagini e carica i
*subject set* su Zooniverse. **È il ciclo completo della scienza partecipata**: dall'archivio alla
piattaforma dove le persone classificano. Se avanza tempo, esportare su Zooniverse è una chiusura narrativa
molto forte per il pitch.

### `photutils`
<https://github.com/astropy/photutils>

Fotometria di apertura e rilevamento di sorgenti. Se serve lo «spettro al volo» o marcare sorgenti
sull'immagine, è già risolto qui.

---

## Rilevamento di oggetti in movimento (riferimento, non lo implementeremo)

### `kbmod`
<https://github.com/dirac-institute/kbmod>

Shift-and-stack su GPU, del DiRAC Institute (Univ. di Washington) e LINCC Frameworks.
Lo stato dell'arte per rilevare oggetti troppo deboli per vedersi in una singola immagine.
**Fuori portata per 24 ore** (vedi `../docs/01_ESTADO_DEL_ARTE.md` §3), ma bisogna saperlo
nominare se la giuria chiede del rilevamento automatico.

---

## Agenzia partner (CSA)

### `NEOSSAT_Tutorial`
<https://github.com/asc-csa/NEOSSAT_Tutorial>

Tutorial ufficiale in Python per visualizzare i dati di NEOSSat. È una risorsa elencata nella scheda
*Resources* della sfida: usarlo aggiunge punti nel criterio *Global Connection*.

---

## Prima di usarne uno qualsiasi

- [ ] **Licenza compatibile** con quella che pubblicheremo (prevista MIT). Aladin Lite è LGPL-3.0: collegarlo
      dal frontend va bene, ma non copiare il suo codice dentro il nostro.
- [ ] **Installabile senza litigare.** Se una dipendenza impiega più di 10 minuti a installarsi sui
      quattro computer, non entra. In un hackathon è un'ora persa.
- [ ] **Attribuzione** nel README, con link.
- [ ] **È vivo?** Guarda la data dell'ultimo commit e gli issue aperti.
- [ ] Tratta il codice di terzi come **dati non affidabili**: leggilo prima di eseguirlo, e non eseguire
      interpreti dall'interno di una directory scaricata.
