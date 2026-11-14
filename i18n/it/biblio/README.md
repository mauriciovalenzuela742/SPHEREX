<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/biblio/README.md) · [Español](../../es/biblio/README.md) · [中文](../../zh/biblio/README.md) · [Deutsch](../../de/biblio/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `biblio/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Bibliografia

Riferimenti organizzati **per a cosa servono**, non in ordine alfabetico. Ogni voce dice cosa
apporta a questo progetto concreto e in che stato di verifica si trova.

## Come leggere la colonna «stato»

| Marca | Significa |
|---|---|
| ✅ | Identificatore e titolo verificati in una ricerca il 14 nov 2026 |
| 🟡 | Esiste ed è noto, ma **non abbiamo verificato l'identificatore esatto**. Verificare prima di citarlo |
| 📄 | Documentazione ufficiale, con URL aperto e letto |

**Non citare mai da qui senza verificare ciò che è in 🟡.** Che un paper esista non prova che dica ciò
che gli si attribuisce; una giuria con astronomi della NASA se ne accorge. Usa `/verifica-cifra`.

Le voci in formato BibTeX sono in [`referencias.bib`](../../../biblio/referencias.bib). I repository di
codice, in [`repos.md`](repos.md). Le schede di lettura, in [`fichas/`](../../../biblio/fichas/).

---

## 1. SPHEREx: la missione e i suoi dati

Ciò che bisogna leggere per capire lo strumento e non commettere errori con i dati.

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| **SPHEREx Explanatory Supplement** · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp_QR_v2.0.pdf> | Documento di specifica dei prodotti di dati | **Il documento di riferimento.** La tabella 16 definisce i bit di `FLAGS`, che è ciò che chiede la voce sui *contamination flags* | 📄 |
| **SPHEREx Archive at IRSA** · <https://caltech-ipac.github.io/spherex-archive-documentation/> | Guida all'accesso e ai prodotti | Collezioni SIA2, cutout, struttura del MEF. **Il più utile del giorno 1** | 📄 |
| Bock et al. (2026), *The SPHEREx Satellite Mission*, ApJ · arXiv:2511.02985 | Paper canonico della missione | È quello che IRSA chiede di citare. Descrive il catalogo previsto di oggetti del sistema solare | ✅ |
| Akeson et al. (2026), *The SPHEREx Image and Spectrophotometry Processing Pipeline*, ApJS · arXiv:2511.15823 · doi:10.3847/1538-4365/ae8843 | Come si producono i dati che usiamo | Spiega il livello 2, la calibrazione e i tempi di disponibilità | ✅ |
| Crill et al. (2025), *The SPHEREx Sky Simulator* · arXiv:2505.24856 | Simulatore del cielo di SPHEREx | Utile se serve capire cosa dovrebbe vedersi in un campo | ✅ |
| Korngut et al. (2026), *Instrument & Calibration* | Strumento e calibrazione | Lo cita IRSA come canonico. **Identificatore non verificato** | 🟡 |
| Doré et al. (2016), *Science Impacts of the SPHEREx All-Sky Survey* · arXiv:1606.07039 | Caso scientifico originale | Contesto per il pitch | ✅ (id); 🟡 (paternità) |
| Lim et al. (2026), *SOLO: wide-field asteroid light curve monitoring system for SPHEREx* · arXiv:2602.08037 | Sistema a terra di supporto al catalogo di oggetti del sistema solare di SPHEREx | **Molto rilevante**: spiega perché servono le curve di luce per correggere gli spettri degli asteroidi per la rotazione | ✅ |

---

## 2. Il precedente diretto: WiseView, unWISE e Backyard Worlds

Questo è ciò che la sfida chiede di replicare e superare. **Se si legge una sola sezione, che sia questa.**

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| **WiseView** · Caselden, Westin et al. · ASCL:1806.004 · <http://byw.tools/wiseview> | Lo strumento che la sfida nomina come modello | Lampeggio di coadd di WISE nel browser, con stretching, colore e velocità regolabili. Centinaia di scoperte di nane brune | ✅ |
| Lang (2014), *unWISE: unblurred coadds of the WISE imaging* · arXiv:1405.0308 | I coadd che WiseView mostra | **Combinare prima di mostrare** è ciò che rende visibili le sorgenti deboli | 🟡 |
| Meisner et al., *unWISE Coadds: The Five-year Data Set* · arXiv:1909.05444 | Coadd estesi | Come si costruisce una serie temporale a partire da una survey | ✅ (id) |
| Schlafly et al. (2019), *The unWISE Catalog: Two Billion Infrared Sources* · arXiv:1901.03337 | Catalogo derivato | Scala del problema | ✅ (id) |
| Meisner et al. (2022), *unTimely: a Full-sky, Time-Domain unWISE Catalog* · arXiv:2209.14327 | Catalogo risolto nel tempo | **Il passaggio da «immagini» a «dominio temporale»**, che è il nostro problema | ✅ |
| Kuchner et al. (2017), *Backyard Worlds: Planet 9* | Il progetto di scienza partecipata | La giustificazione sociale della sfida. I volontari trovano ciò che gli algoritmi della survey lasciano passare | 🟡 |
| **Cool Neighbors** (Zooniverse) · <https://www.zooniverse.org/projects/coolneighbors/backyard-worlds-cool-neighbors/> | Progetto successore | Usa l'API di WiseView per generare il proprio materiale. **Prova che uno strumento con URL interrogabile diventa infrastruttura** | 📄 |

---

## 3. Visualizzazione di dati astronomici nel browser

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| Fernique et al. (2015), *Hierarchical progressive surveys (HiPS)* · arXiv:1505.02291 | Il formato HiPS | Il cubo di tutto il cielo di SPHEREx DR1 è pubblicato in HiPS. Descrive inoltre come Aladin percorre un cubo piano per piano o come animazione | ✅ |
| Baumann et al. (2022), *Aladin Lite v3: Behind the Scenes of a Major Overhaul*, ADASS · 2022ASPC..532....7B | Il visore che usiamo | Proiezioni, tessere FITS, embed. Lo cita la sfida stessa | ✅ |
| **Aladin Lite — API** · <https://aladin.cds.unistra.fr/AladinLite/doc/API> | Documentazione di riferimento | `createImageSurvey`, `getEmbedCode`, `getViewDataURL` | 📄 |
| **Firefly** (IPAC) · <https://github.com/Caltech-IPAC/firefly> | Il motore del Data Explorer di IRSA | Il notebook ufficiale del cubo HiPS di SPHEREx lo usa | 📄 |
| **Astropy** · <https://docs.astropy.org> | FITS, WCS, coordinate, visualizzazione | `ZScaleInterval`, `AsinhStretch`, `ImageNormalize`, `SkyCoord`. **Non reimplementare nulla di questo** | 📄 |

---

## 4. Rilevamento di oggetti in movimento (ciò che NON implementeremo, ma bisogna conoscere)

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| Whidden et al. (2019), *Enabling Deep All-Sky Searches of Outer Solar System Objects* · arXiv:1901.08549 | **KBMOD**: shift-and-stack su GPU | Lo stato dell'arte per trovare ciò che non si vede in una singola immagine. ~10¹⁰ traiettorie/min | ✅ |
| *Fast algorithms for slow moving asteroids* · arXiv:1901.02492 | Lavoro associato | Vincoli sulla distribuzione degli oggetti della fascia di Kuiper | ✅ (id) |
| Smotherman et al. (2024), *Detecting Moving Objects With Machine Learning* · arXiv:2405.06148 | Vaglio dei candidati di KBMOD | **Dove il ML si inserisce davvero qui**: filtrare migliaia di falsi positivi, non sostituire il visore | ✅ (id); 🟡 (paternità) |
| *DECam Ecliptic Exploration Project (DEEP) VI* · arXiv:2310.03678 | KBMOD applicato a una survey reale | 105 nuovi oggetti transnettuniani; tempi di calcolo reali | ✅ |
| *Candidate Distant TNOs — New Horizons Subaru TNO Survey* · arXiv:2407.21142 | Un altro uso reale di KBMOD | Soglie e tassi di falsi positivi | ✅ (id) |

---

## 5. Classificazione in tempo reale: ALeRCE (il terreno proprio del laboratorio)

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| Förster et al. (2021), *The ALeRCE Alert Broker*, AJ · arXiv:2008.03303 | Il broker cileno di allerte di ZTF | **Vantaggio del team.** La disciplina di classificare in tempo reale e presentare candidati dubbi a un umano è proprio ciò che manca a un visore | ✅ |
| Carrasco-Davis et al., *Stamp classifier* | CNN su ritagli di scienza/riferimento/differenza, con invarianza rotazionale | **Il modello giusto di «IA» per questo problema**, non un transformer video: rete piccola, su ritagli, con invarianze scelte a mano | 🟡 |
| Sánchez-Sáez et al., *Light curve classifier* | Random forest bilanciato a due livelli su caratteristiche di variabilità | Per distinguere la variabilità reale da un artefatto | 🟡 |
| *Temporal Stamp Classifier* · arXiv:2405.15073 | Versione con asse temporale | Ciò che più si avvicina a un «modello video» che abbia senso qui | ✅ (id) |

---

## 6. Planet X: lo stato reale della ricerca

| Rif | Cos'è | Perché conta | Stato |
|---|---|---|---|
| Batygin & Brown (2016), *Evidence for a Distant Giant Planet in the Solar System*, AJ 151, 22 · arXiv:1601.05438 · doi:10.3847/0004-6256/151/2/22 | L'ipotesi moderna di Planet Nine | L'origine del nome della sfida | ✅ |
| Phan et al., candidato da IRAS + AKARI, PASA | Un unico oggetto compatibile in due survey infrarosse separate da 23 anni | **La tecnica è esattamente quella della sfida.** Gli autori sottolineano di non aver scoperto Planet Nine | 🟡 (identificatore e anno non verificati) |
| *A targeted, parallax-based search for Planet Nine* · The Open Journal of Astrophysics · <https://astro.theoj.org/article/155004> | Ricerca ottica mirata | Nessun candidato credibile nel campo coperto. Utile per non esagerare nel pitch | ✅ (titolo e rivista) |

**Per il pitch:** a novembre 2026 Planet Nine **non è stato trovato**. Non affermare mai il contrario.

---

## 7. Modelli video (valutati e scartati come nucleo)

L'argomentazione completa è in [`../docs/01_ESTADO_DEL_ARTE.md`](../docs/01_ESTADO_DEL_ARTE.md) §6.
Si elencano per poter rispondere alla giuria con precisione.

| Rif | Cos'è | Stato |
|---|---|---|
| Bertasius, Wang & Torresani (2021), *Is Space-Time Attention All You Need for Video Understanding?* (**TimeSformer**), ICML · arXiv:2102.05095 | Attenzione separata in spazio e tempo su patch di fotogrammi | ✅ |
| Arnab et al. (2021), *ViViT: A Video Vision Transformer*, ICCV · arXiv:2103.15691 | Transformer video di Google Research | ✅ |
| Tong et al. (2022), *VideoMAE* · arXiv:2203.12602 | Autoencoder mascherato per video, efficiente in termini di dati | ✅ |
| *VideoMAE V2: Scaling Video Masked Autoencoders with Dual Masking* · arXiv:2303.16727 | Versione scalata | ✅ |
| Ni et al. (2022), *Expanding Language-Image Pretrained Models for General Video Recognition* (**X-CLIP**) · arXiv:2208.02816 | CLIP esteso al video | ✅ |

**Riassunto del perché no:** la sfida chiede un visore, non un classificatore; il preaddestramento su video
naturali non si trasferisce a sequenze astronomiche; non ci sono etichette in 24 ore; e i metodi classici
sfruttano la fisica del problema. Dove il ML darebbe un contributo è nel vaglio dei candidati, e per
quello il modello giusto è lo *stamp classifier* di ALeRCE (sezione 5), non un transformer video.

---

## 8. Risorse dell'agenzia partner (CSA)

Usarle aggiunge punti nel criterio *Global Connection* della giuria.

| Risorsa | URL |
|---|---|
| NEOSSat (missione) | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> |
| NEOSSat — tutorial in Python | <https://github.com/asc-csa/NEOSSAT_Tutorial> |
| NEOSSat — dati | <https://data.asc-csa.gc.ca/dataset/neossat> |
| Canadian Astronomy Data Centre | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> |

---

## Cosa manca da cercare

Onestà sui limiti di questa revisione, fatta il 14 nov 2026:

- Non abbiamo trovato un paper del 2026 dedicato specificamente al **rilevamento di oggetti in movimento con
  SPHEREx**. Ciò che più si avvicina è il catalogo di oggetti del sistema solare descritto nel paper di missione
  e il lavoro di supporto SOLO.
- Non abbiamo confermato se il **codice sorgente di WiseView** sia pubblico. Lo sono invece i pacchetti
  derivati (`flipbooks`, `unWISE-verse`). Vedi [`repos.md`](repos.md).
- Il **SIMBAD del CDS** non rispondeva il 14 nov; le coordinate dei campi di prova sono state verificate
  sul mirror di Harvard (CfA): vedi
  [`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml).
- Le voci contrassegnate 🟡 richiedono che qualcuno apra la fonte prima di citarle.
