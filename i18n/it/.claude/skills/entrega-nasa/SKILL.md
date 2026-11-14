---
name: entrega-nasa
description: Checklist e modelli per consegnare il progetto sulla piattaforma del NASA Space Apps Challenge - cosa chiede il modulo, il riassunto del progetto, la descrizione obbligatoria di come è stata usata l'intelligenza artificiale, i link a demo e repository, l'attribuzione dei dati della NASA, e le regole sui minorenni e sui contenuti. Attivala quando si menzionano consegnare, submission, caricare il progetto, modulo di consegna, chiusura delle consegne, dichiarazione di uso dell'IA, o quando mancano poche ore e bisogna chiudere la consegna.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../../en/.claude/skills/entrega-nasa/SKILL.md) · [Español](../../../../es/.claude/skills/entrega-nasa/SKILL.md) · [中文](../../../../zh/.claude/skills/entrega-nasa/SKILL.md) · [Deutsch](../../../../de/.claude/skills/entrega-nasa/SKILL.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/skills/entrega-nasa/SKILL.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Consegna sulla piattaforma

**La causa numero uno per cui un buon progetto non vince nulla è consegnare in ritardo o in modo incompleto.**
Questa skill esiste perché ciò non accada.

**Regola:** la consegna si carica a **T − 2 h**, non a T. Dopo si può continuare a modificare, ma è
già consegnato.

**N apre il modulo all'ora 1 dell'evento**, non all'ora 22, per vedere cosa chiede davvero.
Quello che c'è qui è ciò che sappiamo; la piattaforma ha l'ultima parola.

---

## Cosa chiede la consegna (ciò che sappiamo)

- Nome del progetto e breve riassunto.
- Descrizione del progetto: cosa fa, come l'avete fatto, quali dati avete usato.
- **Descrizione di come è stata usata l'IA nel progetto. Obbligatoria quest'anno.**
- Link alla demo (video o applicazione distribuita).
- Link al repository del codice.
- Risorse e dati usati, con le loro fonti.

Si consegna dalla pagina del progetto del team su spaceappschallenge.org, secondo l'orario di chiusura
dell'evento locale: **domenica 15 nov, 11:00** (confermato da JP il 14 nov). Consegnare alle 09:00 (T − 2 h).

---

## Modelli

### Riassunto breve

> *(Una o due frasi. Ciò che la giuria legge per primo e a volte l'unica cosa.)*
>
> `<Nome>` è uno strumento web pubblico che mostra qualsiasi pezzo di cielo così come lo vede
> SPHEREx nel tempo, come un breve video, perché chiunque possa individuare oggetti che si
> muovono o che cambiano di luminosità. Aggiunge l'asse spettrale: le 102 bande infrarosse della missione
> *(includere «con spettri generati al volo» solo se `/api/spectrum` arriva alla demo)*.

### Descrizione

Quattro blocchi, in quest'ordine:

1. **Il problema.** Perché serve: SPHEREx cartografa tutto il cielo ogni sei mesi in 102
   bande e nessuno lo sta guardando alla ricerca di ciò che si muove. La tecnica del lampeggio scoprì
   Plutone e continua a scoprire nane brune e comete grazie ai volontari.
2. **Cosa abbiamo costruito.** Il visualizzatore, i controlli, gli overlay, l'URL condivisibile. Ciò che **c'è**,
   non ciò che era pianificato.
3. **Come l'abbiamo costruito.** I dati reali usati (release, collezioni, servizi di IRSA), lo
   stack, e i problemi che si sono dovuti risolvere — **in particolare quello del filtro lineare variabile**,
   che è ciò che dimostra che abbiamo capito lo strumento e non ci siamo limitati a scaricare immagini.
4. **Cosa segue.** Onestamente: ciò che non siamo riusciti a fare e perché.

### Dichiarazione di uso dell'IA

Non è una formalità. Scritta bene, è evidenza di metodo. Scritta male («abbiamo usato ChatGPT per programmare»)
spreca un'opportunità.

> **Come abbiamo usato l'intelligenza artificiale in questo progetto**
>
> Abbiamo usato assistenti di programmazione basati su modelli linguistici (Claude Code e Antigravity) come
> strumento di sviluppo durante le 24 ore dell'evento, con un metodo esplicito:
>
> - **Cosa abbiamo chiesto loro:** scrivere codice di integrazione con l'archivio IRSA, componenti di interfaccia,
>   test e documentazione, a partire da un contratto di API e da alcune convenzioni che il team ha fissato
>   all'inizio e che sono versionate nel repository (`AGENTS.md`).
> - **Come abbiamo controllato il risultato:** ogni modifica è passata per una revisione umana prima di essere integrata.
>   Abbiamo lavorato con la regola di verificare l'artefatto e non il rapporto: nessuna funzionalità è stata data
>   per conclusa perché lo dicesse un assistente, ma dopo averla aperta e verificata rispetto a dati reali
>   e a cataloghi esterni.
> - **Cosa NON abbiamo fatto:** non abbiamo usato modelli per generare, inventare né completare dati scientifici.
>   Tutte le immagini, lunghezze d'onda e metadati che lo strumento mostra provengono dai
>   file pubblicati dalla missione SPHEREx tramite IRSA.
> - **Perché non abbiamo usato modelli di visione o di video per il rilevamento:** lo abbiamo valutato e lo abbiamo
>   scartato in modo ragionato. La sfida chiede un visualizzatore perché le persone individuino; il vero collo di
>   bottiglia è l'accesso e l'allineamento dei dati. Abbiamo documentato nel repository
>   dove un modello sì contribuirebbe —screening di candidati con piccole reti sui ritagli, sullo stile
>   del broker ALeRCE— come lavoro successivo.
>
> *(Adattare a ciò che è realmente accaduto. Se si è usato altro, lo si dice. Se Spherix usa un LLM in produzione, dichiararlo qui con il modello e i dati che riceve.)*

### Dati e risorse usati

Elencare con link: la pagina della missione SPHEREx su IRSA, la release concreta (DR1 / QR3) e le
collezioni SIA2, i servizi di IRSA usati (cutout, cubo HiPS, MOST…), Aladin Lite 3.8.2, il cubo
HiPS di SPHEREx DR1 (IRSA), Gaia DR3 (VizieR, mirror di Harvard/CfA), SIMBAD (CDS e mirror di Harvard), Astropy. Se si è usata qualche risorsa dell'agenzia partner (CSA/NEOSSat),
nominarla: **conta per il criterio *Global Connection***.

### Attribuzione obbligatoria

Nel README e nel piè di pagina dello strumento, alla lettera:

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## Checklist finale

**Contenuto**

- [ ] Nome del progetto e breve riassunto.
- [ ] Descrizione con i quattro blocchi.
- [ ] **Dichiarazione di uso dell'IA.** Obbligatoria.
- [ ] Elenco di dati e risorse con link.
- [ ] Attribuzione di SPHEREx, alla lettera.

**Link — provati da fuori dal wifi dell'evento**

- [ ] Video della demo. **Aperto da un cellulare con dati mobili.**
- [ ] Applicazione distribuita. Idem.
- [ ] Repository **pubblico** e accessibile senza aver effettuato l'accesso.
- [ ] Il README del repository spiega cos'è, come si esegue e quali dati usa.

**Regole**

- [ ] Senza foto, video né voci di minorenni.
- [ ] Senza chiavi, token né credenziali nel repository.
- [ ] Senza dati personali dei partecipanti.
- [ ] Licenza dichiarata.

**Per ultimo**

- [ ] Qualcuno diverso da chi l'ha scritta legge l'intera consegna dall'inizio alla fine.
- [ ] **Consegnato prima di T − 2 h.**
