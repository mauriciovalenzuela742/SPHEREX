---
name: demo-y-pitch
description: Preparare la demo registrata e il pitch del progetto davanti alla giuria dell'hackathon: copione della demo, cosa mostrare e in quale ordine, come registrarla, il pitch di due minuti con la sua struttura, le domande scomode della giuria con le relative risposte, e il piano B se cade la connessione. Attivala quando si menzionano demo, video, pitch, presentazione, giuria, registrare lo schermo, copione, provare, o quando mancano poche ore alla chiusura e bisogna preparare ciò che si presenta.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../../en/.claude/skills/demo-y-pitch/SKILL.md) · [Español](../../../../es/.claude/skills/demo-y-pitch/SKILL.md) · [中文](../../../../zh/.claude/skills/demo-y-pitch/SKILL.md) · [Deutsch](../../../../de/.claude/skills/demo-y-pitch/SKILL.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/skills/demo-y-pitch/SKILL.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Demo e pitch

La giuria non legge codice. Vede una demo di due minuti e fa due domande. Questa skill serve a far sì che
quei due minuti non vengano improvvisati.

Contesto completo di premi e criteri: `docs/06_JURADO_Y_PITCH.md`.

---

## Regole che non si negoziano

1. **La demo si registra a T − 4 h**, anche se l'applicazione continua a migliorare. Se poi migliora, si
   registra di nuovo. Se non c'è tempo, il video c'è già.
2. **Non si dimostra mai dal vivo contro una query a freddo.** I cinque campi di prova sono
   preriscaldati nella cache.
3. **Il video è scaricato sul disco del computer che presenta.** Non nel cloud. Il wifi della
   sala dei pitch cade.
4. **Si mostra ciò che c'è.** Niente «potrebbe» né «con più tempo faremmo». Ciò che manca si
   nomina una sola volta alla fine, come ciò che segue.
5. **Non si promette di aver scoperto nulla.** Una giuria con astronomi lo punisce all'istante.

---

## Copione della demo

Ogni passo ha uno scopo. L'ordine non è casuale: ciò che colpisce di più va per primo, nel caso tagliassero.

| # | Azione | Cosa dimostra |
|---|---|---|
| 1 | Aprire l'URL. C'è già un campo che lampeggia | Che funziona davvero, senza configurare nulla |
| 2 | Scrivere **`WISE 0855`** (il nome, non le coordinate) | Che è per chiunque, non per astronomi |
| 3 | Play e poi **Modo diferencia** (prima − ultima). **WISE 0855 è un caso obbligatorio e si mostra sempre**: dire con onestà che in un'esposizione singola si vede debole e che il movimento (~1,3 px in tutto il periodo) si vede nella sottrazione (e con la somma per passata quando esisterà). Complementi: overlay CatWISE2020 (V2 Juan Pablo; WISE 0855 non è in Gaia, CatWISE porta il suo moto proprio; **fatto nel branch `v/v2-catwise`, in attesa di PR**; skill `coordenadas-astro`) e somma per passata con pesi 1/VARIANCE (D2 Bryan; **in sospeso**; `docs/10`, `docs/09`). La guida della sfida valorizza la sovrapposizione di Gaia e WISE; non presentarli come parte del visualizzatore distribuito finché non entrano in `main` | La sfida, soddisfatta senza esagerare. È il momento della demo |
| 4 | Abbassare gli fps e rivederlo | Che i controlli contano e sappiamo perché |
| 5 | Cambiare la banda. La stessa zona a un'altra λ | Le 102 bande. Per quanto abbiamo potuto verificare, nessuno strumento pubblico le combina con il blink temporale in un'unica schermata |
| 6 | Attivare l'overlay di Gaia (su WISE 0855 non c'è Gaia: usare CatWISE2020; farlo su Barnard o eps Ind B). I marcatori cadono sulle sorgenti | *«Così sappiamo che è corretto.»* Risponde alla domanda prima che la facciano |
| 7 | Caricare **eps Ind B** in modo differenza | È dove il movimento si vede più chiaramente (−0,85/−0,71 px misurato). Punto elenco della sfida |
| 8 | Caricare **RW Aurigae**: cambia di luminosità senza muoversi. Attenzione: satura e nella sottrazione lascia una coppia rosso/blu anche se non si muove; la sua fotometria non è stata misurata, quindi non si presenta come prova di variabilità | Che il visualizzatore avvisa quando un oggetto satura |
| 9 | Copiare l'URL e aprirlo in un'altra scheda | Condivisibile e incorporabile. Punto elenco della sfida |
| 10 | Se c'è lo spettro: cliccare su una sorgente | L'«extra kudos» |

Se c'è tempo solo per tre passi: **2, 3 e 5**. Nome → si muove → un'altra banda.

---

## Registrare il video

- **Durata:** quella richiesta dall'evento. Se non lo dice, 30–60 secondi. Un video lungo non si guarda per intero.
- **Senza audio di commento** se c'è fretta: i sottotitoli brevi sovrapposti funzionano altrettanto e non
  bisogna ri-registrare per una parola detta male.
- **Schermo pulito:** una sola finestra, senza schede personali, senza notifiche, senza nomi
  utente visibili.
- **Cursore lento.** I movimenti rapidi del mouse non si seguono in video.
- **Due o tre secondi fermi** in ogni momento chiave, soprattutto quando l'oggetto si muove: bisogna
  dare all'occhio il tempo di vederlo.
- **Niente minori** in immagine né in voce, per le regole dell'evento.
- Salvare il file **sul disco locale** e caricarlo dove chiede la consegna.

---

## Il pitch di due minuti

**0:00 – 0:20 · Aggancio.** Nel 1930 Plutone fu scoperto confrontando due foto dello stesso pezzo di cielo.
Oggi SPHEREx fotografa tutto il cielo ogni sei mesi in 102 colori di infrarosso, e nessuno lo sta
guardando così.

**0:20 – 1:10 · Demo dal vivo.** Metà del tempo. È ciò che viene giudicato.

**1:10 – 1:35 · Perché conta.** La maggior parte delle nane brune e delle comete note le
trovarono volontari guardando lampeggi. Quella comunità esiste e non ha modo di guardare SPHEREx. Il
candidato a Planet Nine più citato è uscito dal confronto di due survey infrarossi separati nel tempo:
la stessa tecnica.

**1:35 – 2:00 · Cosa abbiamo costruito.** Stack in una frase, DR1 pubblicato questo mese, URL pubblico, codice
aperto, e una riga su cosa segue.

**Finire a 1:50 con tutto mostrato è meglio che affannarsi a 2:10.**

---

## Le domande, con la loro risposta

**«Questo non lo fa già il Data Explorer di IRSA?»** — Non per questo pubblico. Il Data Explorer è un
archivio per astronomi. Noi risolviamo il nome, raggruppiamo le epoche, normalizziamo e
consegniamo il lampeggio. È la differenza tra un archivio e un visualizzatore; la stessa che ha reso utile
WiseView rispetto all'archivio di WISE.

**«Come faccio a sapere che l'immagine è di quella coordinata?»** — Dall'overlay di Gaia. *(E lo si mostra.)*

**«Perché non avete usato l'apprendimento automatico?»** — Perché la sfida chiede un visualizzatore per persone e
il vero collo di bottiglia è portare e allineare i dati, non riconoscere il movimento. Dove l'IA
contribuisce è nello screening dei candidati con piccole reti sui ritagli, come fa il broker ALeRCE
con gli alert di ZTF, e lo lasciamo impostato.

**«Cosa succede se metto una coordinata senza dati?»** — *(Se ne scrive una e si mostra lo stato vuoto.)*

**«Scala a tutto il cielo?»** — In copertura sì: la query è per posizione contro SIA2. Ciò che non
scala senza infrastruttura è la cache; su larga scala servirebbe precalcolare i ritagli, che è ciò che fa
unWISE per WiseView.

**«Quanto sono corretti gli spettri?»** — Indicativi, fotometria d'apertura con la zodiacale
sottratta, e lo diciamo nell'interfaccia stessa. Per la scienza c'è la Spectrophotometry Tool di IRSA.

---

## Prima di uscire a presentare

- [ ] Video scaricato sul disco del computer che presenta.
- [ ] Applicazione aperta, cache calda, i cinque campi provati **meno di un'ora fa**.
- [ ] Schede: applicazione, video, repository. **Nient'altro.**
- [ ] Notifiche silenziate. Modalità presentazione.
- [ ] Batteria o caricabatterie.
- [ ] Qualcuno del team con il video anche sul telefono.
- [ ] Provato ad alta voce e cronometrato, **tre volte**.
