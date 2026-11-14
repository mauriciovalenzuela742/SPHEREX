<!-- i18n-header -->
> 🌐 **Lingua:** [English](../en/AGENTS.md) · [Español](../es/AGENTS.md) · [中文](../zh/AGENTS.md) · [Deutsch](../de/AGENTS.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `AGENTS.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# AGENTS.md — istruzioni per gli agenti in questo repository

Questo file è la **fonte unica**. `CLAUDE.md` e `GEMINI.md` rimandano qui e aggiungono solo ciò che
è specifico di ciascuno strumento. Se correggi qualcosa, correggilo qui.

---

## 1. Cosa stiamo costruendo

Uno **strumento web pubblico** per la sfida *Planet X and SPHEREx* del NASA Space Apps 2026.
L'utente inserisce RA/Dec; lo strumento mostra la sequenza temporale delle immagini di SPHEREx di
quella zona di cielo, come un breve video, in modo che si veda a occhio cosa si muove o cosa cambia di luminosità.

Il testo integrale della sfida è in `docs/00_DESAFIO.md`. **Leggilo prima di proporre un'architettura.**
Succede spesso che un agente dia per scontato che si tratti di un problema di classificazione con modelli video:
non lo è. Il prodotto che viene giudicato è il visualizzatore.

## 2. Regole non negoziabili

1. **Non inventare dati, endpoint, parametri né risultati.** Se non l'hai verificato, dillo: «non l'ho
   verificato» o «secondo la documentazione di IRSA, che non ho aperto». Un endpoint inventato costa
   un'ora di debug alle 3 di notte.
2. **Verifica l'artefatto, non il rapporto.** Prima di dire che qualcosa funziona: apri l'URL, guarda
   il FITS, conta le epoche, confronta la posizione con SIMBAD. Un `200 OK` non prova che l'immagine
   sia del pezzo di cielo giusto.
3. **Un risultato vuoto non prova che qualcosa non esista.** Se una query non restituisce nulla, prova
   un'altra collezione, un altro raggio, un'altra epoca, prima di concludere «non ci sono dati lì».
4. **Nessuna cifra senza fonte.** Ogni numero che arriva al README, al pitch o all'interfaccia deve
   poter essere aperto e verificato. Lascia il link o il file accanto.
5. **Non fare commit su `main`.** Lavora sul tuo branch. Vedi `CONTRIBUTING.md`.
6. **Non scaricare FITS nel repository.** Vanno in `data/cache/`, che è in `.gitignore`.
   Un MEF di SPHEREx pesa circa 70 MB.
7. **Non pubblicare nulla all'esterno** —deploy su un dominio pubblico, caricamenti sui social, invio di
   email, apertura di issue in repository altrui — senza che una persona lo approvi esplicitamente.
8. **Regole dell'evento:** l'hackathon è iniziato il 14 nov 2026 alle 10:00; prima non si scriveva codice che
   risolvesse la sfida. Vedi `docs/08_REGLAS_DEL_EVENTO.md`.

## 3. Stack deciso

| Livello | Scelta | Perché |
|---|---|---|
| Backend | Python 3.11 + FastAPI + uvicorn | `astropy`/`pyvo`/`astroquery` esistono solo in Python |
| Accesso ai dati | `pyvo` (SIA2) e HTTP diretto al servizio di cutout di IRSA | È la via documentata da IRSA |
| Immagine | `astropy.io.fits`, `astropy.wcs`, `astropy.visualization` | Standard della comunità |
| Frontend | React + Vite + TypeScript | Veloce da avviare, il team lo conosce |
| Cielo | Aladin Lite 3.8.2 (fissata) sul cubo HiPS di IRSA; Gaia e SIMBAD con mirror di Harvard | Risolve contesto del cielo e overlay senza doverli scrivere |
| Cache | Disco locale (`data/cache/`), Redis opzionale | I cutout sono lenti; senza cache la demo cade |
| Deploy | Frontend su Vercel (ha accesso solo Mauricio); backend da decidere (ADR-001) | Vedi `docs/03_ARQUITECTURA.md` |

Questa decisione è in `docs/adr/ADR-001-stack.md`. **Non cambiarla da solo.** Se pensi che sia
sbagliata, scrivi un nuovo ADR e proponilo al team.

## 4. Contratto dell'API

Frontend e backend si sviluppano in parallelo rispetto a un contratto fissato all'ora 1. Il contratto
vive in `docs/03_ARQUITECTURA.md` ed è l'unica cosa che entrambe le parti possono dare per certa.
**Se cambi il contratto, cambialo prima nel documento**, avvisa nel canale del team e solo
dopo tocca il codice. Un cambio silenzioso di contratto blocca un'altra persona senza che se ne accorga.

## 5. Come lavorare qui

**Prima di scrivere codice**

- Leggi il documento di `docs/` che copre la tua parte. Sono scritti perché tu non debba leggere
  tutta la documentazione di IRSA.
- Se il compito tocca dati di SPHEREx, la skill `spherex-datos` contiene endpoint, bande e struttura
  dei file già verificati rispetto alla documentazione ufficiale.

**Mentre lavori**

- Modifiche piccole e verificabili. Niente grandi riscritture a metà evento.
- Ogni funzione che tocca coordinate del cielo ha un test con un campo di `data/campos_de_prueba.yml`.
- Se qualcosa ti prende più di 30 minuti senza avanzare, **fermati e dillo**. In un hackathon il costo di
  insistere è più alto di quello di cambiare approccio.

**Alla fine**

- Di' cosa hai verificato e come. Non «funziona», ma: «ho aperto `/api/epochs?ra=...&dec=...`, ha restituito
  14 epoche tra 2025-05 e 2026-10, ho confrontato la prima con il Data Explorer di IRSA e coincide».
- Di' cosa **non** hai verificato. È altrettanto importante.

## 6. Come riferire

- Prima la conclusione, poi il dettaglio.
- Un problema si riporta con la sua soluzione o con l'opzione che raccomandi, non solo con l'errore.
- Niente gergo interno, niente hash di commit, niente percorsi lunghi, quando parli con qualcuno che non
  era nel dettaglio.
- Se hai sbagliato, dillo. Un prodotto sbagliato che arriva senza avviso è peggio che avvisare che qualcosa è fallito.

## 7. Glossario minimo

Perché un agente senza contesto astronomico non scriva cose assurde.

- **RA / Dec** — ascensione retta e declinazione, le coordinate del cielo. RA si dà in ore
  (`08h55m10.831s`) o in gradi (0–360); Dec in gradi (da −90 a +90). **Confondere ore e gradi è
  l'errore più comune**: tra le due c'è un fattore 15.
- **Epoca** — un'osservazione in un dato istante. Il «video» è la stessa zona di cielo in
  epoche diverse, ordinate nel tempo.
- **Puntamento / passata** — un puntamento è una posizione del telescopio (una posizione del cielo cade in 2
  file per puntamento: coppie D1+D4, D2+D5, D3+D6); una passata è un passaggio completo del cielo
  (1-6 settimane, ~6 mesi tra una passata e l'altra). **Una passata non è un'epoca**: per il video, l'unità è
  la passata (`docs/09`).
- **Moto proprio** — spostamento apparente di una stella nel cielo, in millisecondi
  d'arco all'anno (mas/yr). È ciò che fa muovere una stella vicina tra un'epoca e l'altra.
- **Parallasse** — oscillazione apparente dovuta al moto della Terra attorno al Sole. Periodo di un
  anno; è ciò che dà la distanza.
- **FITS** — formato standard dell'immagine astronomica. Un **MEF** è un FITS con più estensioni
  (immagine, varianza, flag, ecc.) nello stesso file.
- **WCS** — l'informazione dell'header FITS che traduce pixel ↔ coordinata del cielo.
- **Cutout** — ritaglio di una grande immagine attorno a una posizione.
- **HiPS** — formato di tasselli gerarchici del CDS che permette di navigare tutto il cielo nel
  browser. È ciò che consuma Aladin Lite.
- **LVF** — filtro lineare variabile. Il trucco ottico di SPHEREx: la lunghezza d'onda cambia lungo
  un asse del rivelatore, quindi *dove cade* una sorgente nell'immagine determina *a quale
  lunghezza d'onda* viene misurata. Conseguenza pratica: due immagini della stessa zona di
  cielo possono non essere confrontabili se sono state riprese a lunghezze d'onda diverse.
- **Nana bruna** — oggetto a metà tra pianeta e stella. Fredde, rosse, brillanti nell'infrarosso:
  esattamente ciò che SPHEREx vede bene e ciò che cercano i volontari di Backyard Worlds.

## 8. Dove sta la verità

| Domanda | Documento |
|---|---|
| Cosa chiede esattamente la sfida? | `docs/00_DESAFIO.md` |
| Cosa è stato fatto prima e cosa funziona? | `docs/01_ESTADO_DEL_ARTE.md` |
| Come richiedo dati di SPHEREx? | `docs/02_DATOS_SPHEREX.md` e skill `spherex-datos` |
| Com'è costruito il sistema? | `docs/03_ARQUITECTURA.md` |
| Chi fa cosa e come ci coordiniamo? | `docs/04_METODOLOGIA.md` |
| Cosa tocca adesso? | `docs/05_PLAN_24H.md` |
| Cosa premia la giuria? | `docs/06_JURADO_Y_PITCH.md` |
| Cosa può andare storto? | `docs/07_RIESGOS.md` |
| Cosa possiamo fare legalmente e quando? | `docs/08_REGLAS_DEL_EVENTO.md` |
| Cosa hanno mostrato i dati reali? | `docs/09_EDA_HALLAZGOS.md` |
| Chi fa cosa dopo l'EDA? | `docs/10_REPARTO_DE_TRABAJO.md` |
| Come è stato misurato e come si ripete? | `eda/README.md` |
| Com'è l'interfaccia? | `docs/diseno/` |
| Come si usa il kit? | `docs/KIT.md` |
| Paper e repository | `biblio/README.md` |

Se un documento contraddice questo file, **vale il documento** e correggi questo.
