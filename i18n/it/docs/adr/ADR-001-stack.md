<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/docs/adr/ADR-001-stack.md) · [Español](../../../es/docs/adr/ADR-001-stack.md) · [中文](../../../zh/docs/adr/ADR-001-stack.md) · [Deutsch](../../../de/docs/adr/ADR-001-stack.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/adr/ADR-001-stack.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# ADR-001 — Stack del progetto

- **Data:** 2026-11-14 (proposta pre-evento)
- **Stato:** **proposta**; aggiornata il 14 nov con i dati dell'EDA (vedi «Aggiornamento 14 nov 2026, pomeriggio»). **In attesa di firma di C (Mauricio).**
- **Decide:** C (Mauricio); in attesa di firma

## Contesto

Bisogna costruire uno strumento web pubblico in ~24 ore, con sei persone che programmano e i loro
agenti. I dati sono nell'archivio IRSA/IPAC e le librerie che sanno leggerli
(`astropy`, `pyvo`, `astroquery`) esistono **solo in Python**. L'enunciato suggerisce esplicitamente
Astropy e Aladin.

Vincoli:

- 24 ore e un'ora di chiusura delle consegne fissa.
- Sei persone in parallelo: il lavoro deve potersi separare.
- Deve restare un URL pubblico che la giuria possa aprire.
- Non c'è budget di infrastruttura né GPU utilizzabile per nulla di pesante.

## Opzioni considerate

| Opzione | A favore | Contro | Costo |
|---|---|---|---|
| **Python/FastAPI + React/Vite + Aladin Lite** | Separa backend e frontend, due persone in parallelo dall'ora 1; appare come uno strumento pubblico; Aladin risolve il cielo | Due deploy, CORS, un contratto da mantenere | Medio |
| Streamlit | Tutto in Python, si avvia in pochi minuti | Difficile da rifinire; non appare come strumento pubblico; il lampeggio fluido è costoso | Basso |
| Front statico + Aladin Lite, senza backend | Deploy banale, niente da mantenere | **Dipende dal fatto che IRSA risponda con CORS** (scartata il 14 nov: IRSA non dà CORS fuori dall'HiPS, `docs/09`); non si può ritagliare, normalizzare né sottrarre lato server | Basso, ma con un rischio che non controlliamo |

## Aggiornamento 14 nov 2026, pomeriggio — decisione di deploy (C, con i dati dell'EDA)

**Stato: proposta di C (Mauricio), in attesa del via libera del team al prossimo standup.**

### Dati che decidono (EDA, `eda/resultados/latencia_cutouts.json`, `docs/09_EDA_HALLAZGOS.md`)

- Un cutout di 0,1° impiega **7,3 s di mediana, 10,8 s p90, 29 s massimo** (~3,9 MB), con **503 a tratti**.
- 25 cutout con 4 thread: **52 s** di tempo reale. Un lampeggio completo «dal vivo» non rientra in un'attesa ragionevole.
- **IRSA non risponde con CORS** (né SIA2 né file): tutto ciò che non sia il cubo HiPS passa per un backend.
- SIA2 verso `spherex_dr1` e `spherex_qr3`: 1–3,5 s ciascuna; header via HTTP Range ~35 KB, ~0,1 s effettivi.

### Decisione

| Componente | Dove gira | Perché |
|---|---|---|
| Frontend | **Vercel** (progetto `spherex-planet-x`, team eMind, Hobby), produzione da `main` | Funziona già; l'organizzazione l'ha indicato |
| **I 5 campi di prova** (la demo) | **Precalcolati come statici** in `scaffold/frontend/public/precalc/<id>/` (JSON con la forma del contratto + PNG), generati dallo script di D1 e versionati | La demo **non** aspetta mai IRSA né dipende dal wifi. È anche la modalità offline |
| `/api/resolve`, `/api/epochs` | **Vercel Python Functions** nello stesso progetto (`api/`) | 1–3,5 s: ci stanno ampiamente. Stesso dominio, senza CORS |
| `/api/frames` per coordinate arbitrarie | **Vercel Python Functions, con budget di tempo**: scarica in parallelo (4) quanto riesce, restituisce ciò che è pronto e `pending` con il resto; il frontend richiede di nuovo e va mostrando fotogrammi man mano che arrivano | Evita l'attesa di 52 s senza montare un altro servizio |
| Piano B se le funzioni non bastano (tempo massimo, memoria di astropy/reproject, dimensione del pacchetto) | **Lo stesso FastAPI in un container** (Render o Fly, livello gratuito) dietro `/api` con un *rewrite* di Vercel | Cambiare posto non cambia il contratto |

Regole che ne derivano:

- **Cache:** le funzioni non hanno disco persistente (solo `/tmp` per istanza). Non si progetta nulla che
  dipenda dalla cache per la demo: per quello c'è il precalcolato.
- **Tempo massimo della funzione:** si fissa con `maxDuration` in `vercel.json`. Prima di dipendere da un valore,
  **verificare il massimo vigente del piano Hobby nella documentazione di Vercel** (D1, al primo deploy di `api/`).
- **Oggetti della demo:** i cinque oggetti di prova devono funzionare. WISE 0855 è un caso obbligatorio e si
  mostra sempre, dicendo che in una singola esposizione si vede debole (il suo moto si vede con la sottrazione e, quando
  esisterà, con la somma per passata di D2, in sospeso, e l'overlay di CatWISE2020 di V2, fatto nel branch `v/v2-catwise` e in attesa di PR). eps Ind B è dove il
  moto si vede più chiaramente; Barnard si vede ma satura. Centrare sempre sulla **posizione propagata**, non su quella J2000.
- **Deploy:** Vercel Hobby compila solo commit di Mauricio; la produzione esce dai suoi merge.
  Vedi README §2.

### Cosa fa ciascuno con questo

- **D1 (Vladimir):** script di precalcolo dei 5 campi → `public/precalc/`; `api/` con `resolve` ed `epochs`.
- **D2 (Bryan):** `frames` con budget di tempo e risposta parziale (`pending`).
- **V1 (Antonia):** il blink legge prima `precalc/<id>/` se il campo è di prova; altrimenti `/api/frames` con
  retry e fotogrammi che compaiono man mano.
- **C (Mauricio):** misurare il primo deploy di `api/` e attivare il piano B se non basta.

## Decisione

**Python 3.11 + FastAPI nel backend; React + Vite + TypeScript con Aladin Lite 3.8.2 nel frontend.**
Cache su disco. Frontend su Vercel (deciso il 14 nov). Il backend per coordinate arbitrarie: proposta di C dell'aggiornamento qui sopra (Vercel Python Functions con budget di tempo; piano B, lo stesso FastAPI in un container), con il tempo di cutout misurato: mediana 7,3 s, p90 10,8 s, max 29 s, ~3,9 MB indipendentemente dalla dimensione, 503 a tratti (`docs/09` §6). I 5 campi di prova si servono precalcolati come statici.

Il contratto dell'API, che è ciò che permette di lavorare in parallelo, è in
[`../03_ARQUITECTURA.md`](../03_ARQUITECTURA.md).

## Conseguenze

**Facile:** che D e V lavorino contemporaneamente senza pestarsi i piedi dalla prima ora; usare tutto l'ecosistema di
Astropy; fare cache e normalizzazione lato server, che è ciò che rende fattibile il lampeggio.

**Difficile:** bisogna mantenere un contratto e due deploy; il CORS tra frontend e backend va
configurato bene una volta.

**Se ci sbagliamo:** la Via A (Aladin Lite che carica direttamente il cubo HiPS di DR1) **non dipende
dal backend**. Se il backend cade o non arriva in tempo, quella parte continua a funzionare e c'è qualcosa da
mostrare. Quella è l'assicurazione di questa decisione.

## Quando si rivede

**Ora 3 dell'evento** (già misurato il 14 nov: vedi `docs/09`), con la checklist dei dati di [`../02_DATOS_SPHEREX.md`](../02_DATOS_SPHEREX.md).
Se i cutout risultano troppo lenti o IRSA non risponde con CORS, si rivede qui e non dopo.
