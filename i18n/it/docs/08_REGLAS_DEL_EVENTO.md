<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/08_REGLAS_DEL_EVENTO.md) · [Español](../../es/docs/08_REGLAS_DEL_EVENTO.md) · [中文](../../zh/docs/08_REGLAS_DEL_EVENTO.md) · [Deutsch](../../de/docs/08_REGLAS_DEL_EVENTO.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/08_REGLAS_DEL_EVENTO.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 08 — Regole dell'evento e cosa possiamo fare prima

Questo documento esiste perché nessuno abbia dubbi su cosa sia legittimo preparare prima dell'hackathon
e cosa no. Le regole valgono per tutto il team e per i suoi agenti.

---

## La regola che conta

Il regolamento del NASA Space Apps dice, testualmente:

> Teams are not allowed to begin working on the challenges prior to the hackathon.

Non è consentito **iniziare a lavorare sulla sfida** prima dell'hackathon.

## Come la interpretiamo

La regola vieta di anticipare la soluzione, non vieta di saper leggere. Il nostro criterio, prudente:

### Sì, prima dell'evento

- **Leggere** l'enunciato, le *Resources* e la documentazione pubblica di NASA, IRSA e CDS.
- **Indagare lo stato dell'arte**: paper, repository pubblici, strumenti che esistono già.
- **Scrivere documentazione**: cosa sappiamo dello strumento, quali formati esistono, cosa è stato fatto prima.
- **Concordare come lavoreremo**: ruoli, branch, orari, criteri di taglio.
- **Preparare l'ambiente**: installare Python, Node, Docker; configurare gli editor e gli agenti.
- **Impalcatura generica**: un «hello world» di FastAPI e uno di Vite/React, un `docker-compose`, una CI
  che esegue linter e test. È l'equivalente di avere l'editor configurato; non risolve nulla della sfida.

### No, prima dell'evento

- **Scrivere codice che risolva la sfida**: client di IRSA, lettore di MEF, logica di ritaglio,
  normalizzazione, componente di blink, risoluzione del WCS.
- **Scaricare e pre-elaborare dati** di SPHEREx per il progetto.
- **Prototipare l'interfaccia** del visore, anche se «solo per provare».
- Qualsiasi cosa che, se la togliessimo, ci lascerebbe con meno progetto fatto.

### La prova pratica

> Questo sarebbe ancora utile se domani ci toccasse un'altra sfida?

Se la risposta è sì (metodologia, bibliografia, ambiente, convenzioni), è preparazione.
Se è no (un client SIA2, un componente di blink), è lavoro sulla sfida e aspetta.

## Cosa contiene questo kit, misurato rispetto a quella prova

| Cartella | Giudizio |
|---|---|
| `docs/00_DESAFIO.md` | Trascrizione di una pagina pubblica. Preparazione |
| `docs/01` – `docs/08` | Ricerca e metodologia. Preparazione |
| `biblio/` | Bibliografia pubblica. Preparazione |
| `data/campos_de_prueba.yml` | Coordinate pubbliche di oggetti nominati **nell'enunciato stesso**. Riferimento, non soluzione |
| `.claude/` | Configurazione di strumenti di lavoro. Preparazione |
| `scaffold/` | «Hello world» generico di FastAPI e Vite, senza nulla di SPHEREx. Ambiente |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING.md` | Convenzioni di team. Preparazione |

**Fino al 13 nov non c'era in questo repository una sola riga di codice che interroghi IRSA, legga un FITS
o disegni un fotogramma.** Dall'inizio ufficiale (14 nov, 10:00) il team lavora sulla sfida:
vedi `eda/` e `scaffold/frontend/src/sky/`, e [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md).

Se qualcuno del team ha dubbi su un caso concreto, la regola è: **si chiede all'organizzatore
dell'evento locale prima di farlo.** Perdere dieci minuti a chiedere costa meno di una
squalifica.

---

## Altre regole dell'evento che influiscono sul lavoro

- **Team:** massimo 6 persone. Una persona non può stare in due team, e ogni team
  lavora su una sola sfida.
- **Uso dell'IA:** è consentito e **ogni consegna deve includere una descrizione di come è stata usata**.
  Non è opzionale. Template nella skill `entrega-nasa`.
- **Minori di 18 anni:** non devono caricare foto di sé come avatar né comparire con foto, video o voce
  nella demo o nella consegna.
- **Consegna:** tramite la pagina del progetto su spaceappschallenge.org, secondo l'ora di chiusura
  dell'evento locale.
- **Dati di terzi:** la NASA avverte che non avalla siti non governativi e che bisogna
  rispettare le condizioni d'uso di ciascuno. In pratica: rispettare le licenze e le note di
  attribuzione di CDS, IRSA e CSA.

## Licenza e pubblicazione

Il piano è pubblicare il repository con licenza MIT all'inizio dell'evento. Due attenzioni:

- **Attribuzione di SPHEREx** letterale nel README e nel piè di pagina dello strumento
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Non versionare dati**: i FITS e i PNG di cache restano fuori dal repository.

## Regole comunicate durante l'evento (14 nov 2026)

Dette dal vivo dall'organizzazione; non le abbiamo verificate rispetto alla pagina ufficiale. Se differiscono da
`docs/00_DESAFIO.md` o dalla piattaforma, vale la piattaforma.

1. **Dati:** aperti della NASA e delle sue agenzie partner.
2. **Chiusura degli invii:** 11:00 del mattino (ora locale dell'evento).
3. **Cosa si carica:** nome e riassunto del progetto, link alla demo finale, dati della NASA e
   altre fonti usate, e come è stata usata l'IA.
4. **Criteri della giuria:** impatto, creatività, validità, rilevanza e presentazione.
5. **Deploy:** Vercel. Il frontend è già in produzione (https://spherex-planet-x-tau.vercel.app).
   Resta da decidere come gira il backend; l'ADR-001 è ancora da chiudere. Nulla viene messo in produzione senza l'approvazione di una
   persona del team.

---

## Prima di caricare questo su GitHub, verificare

> **Stato 14 nov:** il repository è già su GitHub (`mauriciovalenzuela742/SPHEREX`), con `LICENSE` e un `.gitignore` che copre `data/cache/`, `.env`, `node_modules/` e `__pycache__/`. Le caselle qui sotto non sono state spuntate perché nessuno le ha controllate una per una.

- [ ] Non ci sono chiavi, token né credenziali in nessun file.
- [ ] Non ci sono dati personali dei membri (email, telefoni, indirizzi).
- [ ] Non ci sono file di dati pesanti né FITS.
- [ ] Il `.gitignore` copre `data/cache/`, `.env`, `node_modules/`, `__pycache__/`.
- [ ] Il README dice con chiarezza cos'è questo e cosa non è.
