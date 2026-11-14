<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/06_JURADO_Y_PITCH.md) · [Español](../../es/docs/06_JURADO_Y_PITCH.md) · [中文](../../zh/docs/06_JURADO_Y_PITCH.md) · [Deutsch](../../de/docs/06_JURADO_Y_PITCH.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/06_JURADO_Y_PITCH.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 06 — Giuria, premi e pitch

---

## Come si giudica

L'imbuto dello Space Apps è: la giuria dell'evento locale sceglie i **Global Nominees** → esperti della NASA
e delle agenzie partner scelgono i **Global Finalists** e le menzioni d'onore → un comitato esecutivo sceglie i
**10 Global Winners**.

Cioè: **il primo filtro è una giuria locale**, con poco tempo per team e senza leggere il codice.
Poi, gente della NASA che di astronomia ne capisce. Il progetto deve funzionare in entrambi i
registri: colpire in due minuti e resistere a uno sguardo esperto.

All'evento di Santiago il formato annunciato è **2 minuti di pitch + 2 domande**.

## I dieci premi globali, e quali sono i nostri

| Premio | Nostro? |
|---|---|
| **Best Use of Data** | **Sì, il principale.** È letteralmente «rendere accessibili i dati spaziali». La sfida chiede esattamente questo |
| **Best Use of Science** | **Sì.** Mostrare bene l'asse spettrale e validare con Gaia è metodo scientifico visibile |
| **Best Use of Technology** | Possibile, se il visore è tecnicamente appariscente (102 bande nel browser) |
| **Galactic Impact** | Possibile: scienza partecipata su scala |
| **Best Use of Storytelling** | **Sì, se lo lavoriamo.** La storia di Plutone e del comparatore a lampeggio è lì da prendere |
| **Most Inspirational** | Possibile, va con il precedente |
| **Global Connection** | Possibile se usiamo risorse dell'agenzia partner (CSA/NEOSSat) e pensiamo il visore come infrastruttura condivisa |
| Best Mission Concept | No. Non proponiamo una missione |
| Art & Technology | No, a meno che il visore non risulti visivamente notevole |
| Local Impact | Debole, a meno che non lo colleghiamo con l'astronomia cilena |

**Puntare a due o tre, non a dieci.** Best Use of Data e Best Use of Science sono i naturali; quello di
storytelling è gratis se N lavora sulla narrativa dall'ora 0.

---

## Le otto voci della sfida sono la rubrica

Le *Potential Considerations* sono ciò che l'autore della sfida si aspetta di vedere. Ognuna soddisfatta è
un punto che un giudice della NASA riconoscerà.

| Voce della sfida | Come la soddisfiamo | Costo |
|---|---|---|
| Facile da aggiornare con nuovi release | Collezioni SIA2 per configurazione, non cablate | Basso |
| Mostrare in modo creativo le 102 bande | Selettore di banda + cubo HiPS | **Medio, ed è il differenziale** |
| Sommare o sottrarre immagini di epoche diverse | `mode=diff_first` / `diff_prev` | Basso |
| Campo visivo selezionabile | Parametro `size` | Molto basso |
| Sovrapporre Gaia o WISE | Overlay di catalogo in Aladin Lite | Basso |
| Coordinate nell'URL | `?ra=&dec=&...` che riflette lo stato | Molto basso |
| Mostrare metadati come i flag di contaminazione | Estensione `FLAGS` del MEF | Basso |
| Usare strumenti pubblici (Astropy, Aladin) | Sono lo stack | Zero |

Sette su otto sono a costo basso o molto basso. **Bisogna soddisfarle tutte.** In
[`05_PLAN_24H.md`](05_PLAN_24H.md) sono nell'ordine in cui si affrontano.

---

## Il pitch di 2 minuti

Struttura. I tempi sono approssimativi ma l'ordine non si negozia: **la demo viene prima della
spiegazione**, perché se ti interrompono, almeno hanno visto lo strumento.

**0:00 – 0:20 · L'aggancio**

> Nel 1930, Clyde Tombaugh scoprì Plutone guardando due foto dello stesso pezzo di cielo e notando che
> un punto si era mosso. Oggi, SPHEREx fotografa l'intero cielo ogni sei mesi in 102 colori
> di infrarosso, e nessuno lo sta guardando così.

**0:20 – 1:10 · La demo, dal vivo** *(metà del tempo; questo è ciò che si giudica)*

1. Scrivere `WISE 0855`. Nome, non coordinate: dimostra che è per chiunque. È un caso obbligatorio
   (uno degli oggetti di prova dell'organizzazione) e si mostra sempre.
2. Dargli play e poi la sottrazione prima − ultima. **La nana bruna si muove** (~1,3 px in tutto il
   periodo): una coppia rosso/blu. Si dice con onestà che in una singola esposizione si vede debole e che
   la somma per passata lo migliorerà. Poi, **eps Ind B**, dove il moto si vede più chiaramente
   (−0,85/−0,71 px misurato contro −0,92/−0,57 previsto).
   Per WISE 0855 il piano ha due complementi: l'overlay di CatWISE2020 (non è
   in Gaia e CatWISE porta il suo moto proprio; responsabile V2 Juan Pablo; **fatto nel branch `v/v2-catwise`,
   in attesa di PR**: marca WISE 0855 a 2,6″ dalla posizione propagata da SIMBAD) e la somma per passata
   con pesi 1/VARIANCE (responsabile D2 Bryan; `docs/10` e `docs/09`; **in sospeso**). La guida della sfida apprezza
   la sovrapposizione di Gaia e WISE. Finché non entrano in `main`, non si presentano come parte del visore in produzione.
3. Muovere il selettore di banda. La stessa zona di cielo a un'altra lunghezza d'onda.
4. Attivare l'overlay di Gaia su Barnard o eps Ind B (WISE 0855 non è in Gaia: il suo overlay è
   CatWISE2020). I punti cadono dove devono. *«Così sappiamo che è corretto.»*
5. Copiare l'URL. *«Questo è condivisibile e incorporabile.»*

**1:10 – 1:35 · Perché conta**

> La maggior parte delle nane brune e delle comete note le hanno trovate volontari guardando
> lampeggi di immagini. Quella comunità esiste e oggi non ha modo di guardare SPHEREx. Il candidato a
> Planet Nine più citato è uscito dal confronto di due survey infrarosse separate nel tempo: la stessa
> tecnica. Noi la apriamo a chiunque, con l'asse spettrale delle 102 bande (per quanto abbiamo potuto verificare, nessuno strumento pubblico lo combina con il blink temporale in un'unica schermata).

**1:35 – 2:00 · Cosa abbiamo costruito e cosa viene dopo**

Stack in una frase, dati reali di DR1 —pubblicato questo mese—, URL pubblico, codice aperto.
E una riga su cosa viene dopo.

### Regole del pitch

- **Non si dimostra mai dal vivo contro un'interrogazione a freddo.** I cinque campi sono precaricati.
- **Video pronto in un'altra scheda.** Se il wifi cade, si mette il video senza chiedere scusa.
- **Non si dice «potrebbe».** Si mostra ciò che c'è. Ciò che non c'è, si nomina come ciò che viene dopo.
- **Non si promette di aver trovato nulla.** Una giuria con astronomi punisce questo all'istante.
- Se avanza tempo, **lo si restituisce**. Finire a 1:50 con tutto mostrato è meglio che arrancare fino a 2:10.

---

## Le domande scomode, con la loro risposta

**«Questo non lo fa già il Data Explorer di IRSA?»**
Non per questo pubblico. Il Data Explorer è un archivio per astronomi: bisogna sapere quale collezione
richiedere, cos'è un MEF e come si stira un'immagine. Noi risolviamo il nome, raggruppiamo le
epoche, normalizziamo e consegniamo il lampeggio. È la differenza tra un archivio e un visore, ed è
la stessa differenza che ha reso utile WiseView rispetto all'archivio di WISE.

**«Come faccio a sapere che l'immagine è della coordinata che ho chiesto?»**
Dall'overlay di Gaia: disegniamo le posizioni che Gaia prevede per quella data e cadono sulle
sorgenti dell'immagine. *(E si mostra a schermo.)*

**«Perché non avete usato il machine learning?»**
Perché la sfida chiede un visore per le persone, e perché il vero collo di bottiglia è portare e allineare
i dati giusti, non riconoscere il movimento. Dove l'IA contribuisce qui è nel vaglio dei
candidati con reti piccole su ritagli —ciò che fa il broker ALeRCE con le allerte di ZTF—,
e lo lasciamo impostato come passo successivo. *(Sviluppato in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6.)*

**«Cosa succede se inserisco una coordinata senza dati?»**
*(Se ne scrive una e si mostra lo stato vuoto, che dice quante epoche ci sono e suggerisce un campo vicino.)*

**«Questo scala a tutto il cielo?»**
L'interrogazione è per posizione contro SIA2, quindi sì in copertura. Ciò che non scala senza
infrastruttura è la cache: oggi precarichiamo campi; su larga scala servirebbe precalcolare ritagli,
che è esattamente ciò che fa unWISE per WiseView.

**«Quanto sono corretti gli spettri?»**
Sono indicativi, fotometria di apertura con la luce zodiacale sottratta, e lo diciamo nell'interfaccia stessa.
Per la scienza c'è lo Spectrophotometry Tool di IRSA. *(Non dire mai che sono di qualità
scientifica. L'onestà qui aggiunge più di quanto tolga.)*

---

## L'obbligatorio della consegna

- **Descrizione di come è stata usata l'IA.** Quest'anno è obbligatoria in ogni consegna. Non è una formalità:
  scritta bene, è evidenza di metodo. Template nella skill `entrega-nasa`.
- **Attribuzione di SPHEREx**, letterale, nel piè di pagina dello strumento e nel README
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Nessun minore in foto né voci** nella demo, secondo le regole dell'evento.
- **Link che funzionino dall'esterno.** Provare l'URL del progetto da un cellulare con i dati, non
  dal wifi della sala.
