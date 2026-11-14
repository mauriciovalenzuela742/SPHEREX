<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/KIT.md) · [Español](../../es/docs/KIT.md) · [中文](../../zh/docs/KIT.md) · [Deutsch](../../de/docs/KIT.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/KIT.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# SPHEREx Kit — NASA Space Apps Challenge 2026

Kit di lavoro del team per la sfida **Planet X and SPHEREx** (difficoltà: Advanced).
È una cassetta degli attrezzi: documentazione, bibliografia, convenzioni e impalcatura generica
perché sei persone e i loro agenti di IA lavorino in parallelo senza pestarsi i piedi durante l'evento.

> **Stato al 14 nov (evento in corso):** dal 14 nov ci sono l'EDA (`eda/`) e un visualizzatore in
> `scaffold/frontend/` (vedi [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)). Prima dell'evento non c'era
> nemmeno una riga di codice che risolvesse la sfida, perché le regole dell'evento
> vietano di lavorare sulle challenge prima dell'hackathon. Ciò che c'è è materiale di riferimento
> (pubblico, della NASA e della letteratura) e impalcatura web generica —un "hello world" di FastAPI
> e uno di Vite/React— equivalente ad avere l'editor configurato. Vedi [`docs/08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md).

---

## La sfida in una frase

Costruire **uno strumento web pubblico** in cui chiunque scriva delle coordinate del cielo
(ascensione retta e declinazione) e veda quella zona di cielo **come un breve video**: la sequenza di
immagini di SPHEREx nel tempo, per individuare a occhio ciò che si muove o cambia di luminosità.

Il modello dichiarato dalla NASA è [WiseView](http://byw.tools/wiseview), lo strumento con cui
i volontari di [Backyard Worlds](https://backyardworlds.org) hanno scoperto centinaia di nane brune.
Testo completo della sfida in [`docs/00_DESAFIO.md`](00_DESAFIO.md).

**Cosa questo NON è:** non è un modello di classificazione video, non è un rilevatore automatico,
non è una pipeline scientifica. È un visualizzatore. Qualsiasi livello di ML è opzionale e va sopra, mai
al posto del visualizzatore. Questo è argomentato in [`docs/01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md).

---

## Avvio in 10 minuti

1. Leggi questo README e [`docs/00_DESAFIO.md`](00_DESAFIO.md) (5 min). È l'unico testo obbligatorio.
2. Arrivi senza contesto? Leggi [`docs/briefings/`](../../../docs/briefings/) — i due riassunti coprono tutto il progetto di seguito.
3. Guarda il tuo ruolo in [`docs/04_METODOLOGIA.md`](04_METODOLOGIA.md) e il piano delle 24 h in [`docs/05_PLAN_24H.md`](05_PLAN_24H.md).
4. Apri Claude Code nella radice del repo. Legge automaticamente `CLAUDE.md`; le skill di `.claude/skills/`
   si attivano da sole quando serve.
5. Se ti tocca il backend o i dati: sfoglia [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md). È la scheda tecnica
   di dove vivono i dati e come si richiedono. È il documento più denso e quello che fa risparmiare più tempo.
6. Se ti tocca il frontend: sfoglia [`docs/03_ARQUITECTURA.md`](03_ARQUITECTURA.md) e la skill `visor-sky-blink`.

---

## Mappa del kit

| Cartella | Cosa contiene | Quando la apri |
|---|---|---|
| `docs/` | Sfida, stato dell'arte, scheda dei dati, architettura, metodologia, piano, giuria, rischi | Sempre; è la fonte di verità |
| `docs/briefings/` | Due riassunti narrativi di tutto il progetto, da leggere di seguito. Esistono anche come audio | Per arrivare con contesto in 20 minuti |
| `docs/adr/` | Decisioni di architettura, una per file | Quando il team decide qualcosa che costa tornare indietro |
| `biblio/` | Bibliografia commentata, schede di paper, repo di GitHub rilevanti | Quando ti serve un sostegno o un'idea collaudata |
| `data/` | Campi di prova con coordinate, cataloghi di riferimento. **Nessun FITS versionato** | Quando provi il visualizzatore |
| `.claude/skills/` | Otto skill: cinque proprie (dati SPHEREx, visualizzatore, coordinate, demo/pitch, consegna) e tre generiche (astropy, matplotlib, scikit-learn) | Le carica Claude da solo |
| `.claude/agents/` | Subagent specializzati (esploratore di dati, revisore scientifico, revisore di UI) | Quando deleghi una parte circoscritta |
| `.claude/commands/` | `/standup`, `/traspaso`, `/chequeo-demo`, `/verifica-cifra`, `/riesgo` | Durante l'evento, a mano |
| `scaffold/` | Scheletro generico backend + frontend, Docker, CI | Ora 0 dell'evento |
| `AGENTS.md` | Istruzioni per **qualsiasi** agente. Fonte unica | Le leggono gli agenti, non tu |
| `CLAUDE.md` / `GEMINI.md` | Puntatori a `AGENTS.md` + ciò che è specifico di ciascuno strumento | Idem |

---

## Le quattro regole del team

1. **Il prodotto è il visualizzatore che funziona con coordinate reali.** Tutto il resto è decorazione.
   Se alle 20 ore non c'è un video sullo schermo, si taglia qualunque cosa.
2. **Niente si dà per scontato senza guardarlo.** Che un agente dica "ora funziona" è un dato, non un fatto:
   si apre l'URL, si guarda l'immagine, si confronta con SIMBAD. Un risultato vuoto non prova che qualcosa non esista.
3. **Nessuna cifra senza fonte.** Ciò che si dice nel pitch o nel README deve poter essere
   aperto e verificato. Usa `/verifica-cifra`.
4. **Nessuno fa commit su `main` senza che un altro lo guardi.** Quattro persone con agenti in parallelo
   rompono `main` in pochi minuti. Vedi [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Stato

- **Oggi (14 nov, evento in corso):** pubblicato su GitHub (`mauriciovalenzuela742/SPHEREX`), con le PR #1–#6 unite e il visualizzatore distribuito su Vercel (https://spherex-planet-x-tau.vercel.app).
- **Prima dell'evento (fino al 13 nov):** solo documentazione, bibliografia e impalcatura generica, in locale.

Licenza prevista: MIT (vedi [`LICENSE`](../../../LICENSE)). I dati di SPHEREx sono pubblici e richiedono
la nota di ringraziamento che si trova in [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## Installare il kit (per i compagni)

**Il più semplice: clonare il repository e aprire Claude Code nella radice.**
`CLAUDE.md`, le skill di `.claude/skills/`, i subagent e i comandi si caricano da soli.
Non c'è nulla da installare.

```bash
git clone <url-del-repo>
cd spherex_kit
claude
```

Verifica: scrivi `/standup`. Se il comando esiste, il kit è caricato.

Chi usa **Antigravity o Gemini** legge `AGENTS.md` e `GEMINI.md`; puntano alla stessa cosa.

### Se qualcuno vuole le skill fuori da questo repository

Il kit è anche impacchettato come plugin (`.claude-plugin/plugin.json` e
`.claude-plugin/marketplace.json`), per usarlo da un'altra cartella. È opzionale: dentro il
repository non serve.

---

## Stato di verifica di questo kit

Scritto il **14 novembre 2026**. Cosa è verificato e cosa no:

| | Stato |
|---|---|
| Testo della sfida ed elenco delle *Resources* | ✅ Letti dalla pagina ufficiale quel giorno |
| Endpoint di IRSA, collezioni SIA2, struttura del MEF, bande, cubo HiPS | ✅ Rispetto alla documentazione ufficiale di IRSA |
| Scheletro del backend | ✅ Funziona: `/health` risponde `200 {"ok": true}` |
| Scheletro del frontend | ✅ Si compila in CI e gira in produzione (Vercel) |
| Bibliografia | 🟡 Parziale. Ogni voce riporta il proprio stato in [`biblio/README.md`](../biblio/README.md) |
| Coordinate dei campi di prova | ✅ Le cinque verificate in SIMBAD (mirror CfA) il 14 nov. Sono emerse due trappole: la coordinata del testo per WISE 0855 è dell'epoca 2010, e `eps Ind b` ≠ `eps Ind B` |
| Scala di pixel di SPHEREx (6,15"/px) | ✅ Confermata in SIA2 il 14 nov (`s_pixel_scale`, `docs/09`). Da essa dipende il moto sub-pixel (rischio R10) |
| Che Aladin Lite carichi il cubo HiPS di DR1 | ✅ Sì, carica (Aladin Lite 3.8.2, HiPS PNG di `/data/hips/SPHEREx/spherex_allsky_cube`, 14 nov; `docs/09`) |

Ciò che non è verificato è segnato come tale in ogni documento. **Non darlo per certo perché sia
scritto qui.**
