<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/docs/briefings/02_estrategia_equipo_y_pitch.md) · [Español](../../../es/docs/briefings/02_estrategia_equipo_y_pitch.md) · [中文](../../../zh/docs/briefings/02_estrategia_equipo_y_pitch.md) · [Deutsch](../../../de/docs/briefings/02_estrategia_equipo_y_pitch.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/briefings/02_estrategia_equipo_y_pitch.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Audio 2 di 2 — SPHEREx: strategia, team e pitch

Materiale di preparazione per Juan Pablo, in vista del NASA Space Apps Challenge 2026, dove il suo team
di sei persone del laboratorio di astronomia affronterà la sfida **Planet X and SPHEREx**.

Questo è il secondo di due audio. Il primo copre cosa chiede la sfida e con quali dati si lavora.
Questo copre **come organizzarsi, cosa costruire per primo, cosa premia la giuria e come presentarlo**.

L'idea di fondo: in un hackathon, il progetto che vince quasi mai è quello con più codice. È quello
che arriva intero.

---

## 1. La rubrica nascosta: gli otto suggerimenti dell'enunciato

La sfida contiene una sezione di "considerazioni potenziali" con otto punti che dice che si
"può, ma non si è obbligati" a considerare. In pratica **sono la rubrica**: sono ciò che l'autore
della sfida si aspetta distingua un buon progetto, e ciò che un giudice della NASA riconoscerà.

Gli otto sono: che lo strumento sia facile da aggiornare quando arrivano nuovi dati; mostrare in
modo creativo le 102 bande di infrarosso, con bonus esplicito se si generano spettri al volo;
permettere di sommare o sottrarre immagini prese in epoche diverse; lasciare all'utente la scelta del campo di
vista; permettere di sovrapporre dati di altri telescopi come Gaia o WISE; **poter interrogare lo
strumento includendo le coordinate nell'URL**, così da poterlo incorporare in altri siti;
mostrare metadati come gli indicatori di contaminazione; e usare strumenti pubblici che già
esistono, nominando esplicitamente Astropy e Aladin.

La cosa interessante: **sette degli otto hanno costo basso o molto basso.** L'unico davvero caro è quello
delle 102 bande, che è proprio quello differenziante. Quindi bisogna soddisfarli tutti, e c'è un ordine
per farlo.

---

## 2. L'architettura: due vie, e bisogna averle entrambe

Il progetto ha una strada rapida e una completa, e la chiave è che **quella rapida esiste davvero**.

**La via A** è Aladin Lite che carica direttamente il cubo di tutto il cielo del Data Release 1, che
è pubblicato in formato HiPS. L'utente naviga il cielo e muove un cursore di lunghezza d'onda.
Zero backend. Dà le 102 bande, il contesto di tutto il cielo e gli overlay di cataloghi. Ciò che non
dà è l'asse del tempo, perché il cubo è un mosaico combinato, non una serie di epoche. Costo:
ore, non giorni. Rischio tecnico basso.

**La via B** è il blink temporale, con backend. Il server interroga l'archivio per posizione,
richiede ritagli di ogni epoca, li raggruppa per banda, li normalizza e restituisce una sequenza ordinata
nel tempo. È la sfida vera e propria ed è il grosso del lavoro. Il suo collo di bottiglia è la
latenza dei ritagli: senza cache, la dimostrazione non sopravvive.

**Le due vie si montano sulla stessa schermata**, affiancate: Aladin dà il contesto e la lunghezza d'onda, un pannello accanto dà il blink temporale. L'utente capisce subito che sono due assi
dello stesso dato.

E la via A è l'assicurazione del progetto: se il backend non arriva in tempo, resta comunque qualcosa di reale da
mostrare.

Lo stack deciso: Python con FastAPI nel backend, perché le librerie che sanno leggere questi
dati esistono solo in Python; React con Vite e Aladin Lite nel frontend; cache su disco; e
deploy del frontend su Vercel, con il backend da decidere (Vercel Functions o un container, in base al tempo misurato di un ritaglio).

Una decisione di progetto che fa risparmiare molto lavoro: **il backend restituisce immagini PNG già renderizzate,
non file FITS.** Mandare FITS al browser obbliga a scrivere un lettore FITS in JavaScript e ad
applicare lo stiramento e la mappa di colore a mano: il doppio del lavoro e il triplo degli errori. Il
costo è che cambiare lo stiramento richiede di tornare al server, e con la cache è economico.

E un dettaglio che sembra minore e non lo è: **tutti i fotogrammi di una sequenza si normalizzano con
gli stessi limiti.** Se ciascuno si stira per conto suo, tutto lampeggia e non si distingue il
movimento reale da un cambio di scala.

---

## 3. La prima cosa da fissare: il contratto dell'API

Questo è ciò che permette a sei persone di avanzare in parallelo fin dalla prima ora.

Nell'ora uno si scrive il contratto: quali endpoint ci sono, quali parametri prendono e cosa restituiscono
esattamente. Finché il backend non esiste, il frontend lavora contro un simulatore che restituisce
quelle stesse forme. Nessuno aspetta nessuno.

E la regola che lo sostiene: **se qualcuno cambia il contratto, lo cambia prima nel documento**,
avvisa il team, e solo dopo tocca il codice. Un cambio silenzioso di contratto blocca un'altra
persona senza che se ne accorga, e questo alle tre di notte costa ore.

Due campi del contratto che vale la pena menzionare. Uno: ogni fotogramma restituisce **la sua lunghezza
d'onda**, e non è opzionale: è ciò che impedisce il problema del filtro lineare variabile e, mostrato
a schermo, dimostra alla giuria che il team capisce lo strumento. E due: gli avvisi
viaggiano come una lista, non come un errore. Mancano bande di continuo; se questo rompe la richiesta, lo
strumento non funziona.

---

## 4. Sei persone, i loro agenti, e il rischio reale

Il rischio principale di un team di sei con assistenti di IA non è restare senza idee. È
**pestarsi i piedi**. Più agenti che scrivono in fretta sullo stesso repository producono conflitti,
codice duplicato e un branch principale rotto di notte.

La ripartizione proposta sono quattro ruoli, ciascuno responsabile di alcuni file. Responsabile significa che quella
persona decide e gli altri chiedono; non significa che lavori da sola.

**Dati**: interroga l'archivio, scarica ritagli, legge i FITS, raggruppa per banda, risolve le
coordinate e le lunghezze d'onda. È il percorso critico: se questo non funziona, non c'è progetto.

**Visore**: Aladin Lite, il pannello di blink, i controlli, l'URL interrogabile.

**Scienza e verifica**: verifica che ciò che si mostra sia corretto. Che il ritaglio sia del cielo
che dice, che l'oggetto sia dove Gaia prevede, che lo spettro non sia un artefatto. **È chi
ha il permesso esplicito di dire "questo è sbagliato" senza dover proporre la correzione.**

**Narrativa e consegna**: il README, la demo, il pitch e il modulo. E comincia a lavorare dall'ora
zero, non alla fine. L'errore classico degli hackathon è lasciare la consegna alle ultime due
ore e scoprire che manca metà del modulo.

A partire dall'ora dodici, quando il percorso critico è sbloccato, dati e visore si spartiscono i
punti extra. Ma scienza e narrativa non si dissolvono: se nessuno verifica e nessuno prepara la
consegna, il progetto viene consegnato in ritardo e con errori.

Sul codice: branch brevi che vivono meno di tre ore, nessuno fa push sul branch principale, e
ogni modifica la rivede una persona —non un agente—, perché guardare un diff richiede due minuti e evita
ore. E worktree: una cartella per persona, perché due agenti sulla stessa cartella si
sovrascrivono senza avvisare e nessuno dei due lo dirà.

---

## 5. Come si usa un agente senza che l'agente ti batta

Questo è ciò che separa un team che usa gli agenti da uno che gli agenti battono. Sono cinque
abitudini.

**Una sessione per fronte.** Non mescolare il backend dei dati con il frontend nella stessa sessione: il
contesto si contamina e l'assistente comincia a commettere errori sciocchi.

**L'agente propone, la persona decide.** Per qualsiasi cosa che tocchi più di due file: piano
prima, approvazione dopo. In un hackathon la tentazione di lasciarlo correre è enorme, ed è il modo
più rapido di ritrovarsi con duemila righe che nessuno capisce alle cinque del mattino.

**Verificare l'artefatto, non il rapporto.** Che l'agente dica "ora funziona" è un dato, non un fatto.
Bisogna aprire l'URL, guardare l'immagine, contare le epoche. Non è sfiducia: è che l'agente non
può vedere lo schermo.

**Quando qualcosa non riesce al terzo tentativo, cambiare approccio, non prompt.** Se hai fatto tre tentativi
correggendo la stessa cosa, il problema non è come l'hai chiesto.

E **non lasciare mai che un agente decida da solo l'ambito.** Un agente, se lo lasci fare, costruisce gli otto
punti della sfida a metà invece di tre completi.

---

## 6. Il piano a blocchi, e dove sono i tagli

Il ritmo è a blocchi di novanta minuti, e alla fine di ciascuno, cinque minuti in piedi, senza
schermi, in cui ognuno dice tre cose: cosa è rimasto funzionante —non cosa ha fatto, ma cosa si può
aprire e guardare—, cosa è bloccato e da chi, e cosa farà nei prossimi novanta minuti.

Novanta minuti sono sufficienti per finire qualcosa e abbastanza brevi perché una strada sbagliata non costi
mezza notte.

**L'ora zero serve ad allinearsi.** Leggere insieme l'enunciato ad alta voce, ripartire i ruoli, confermare l'ora
esatta di chiusura delle consegne, e avviare lo scheletro sui sei computer. Se lo scheletro
non parte, nessuno avanza finché non parte.

**Le ore da uno a tre sono l'ora della verità con i dati.** Query reali, quante epoche
ci sono per campo, quanto impiega un ritaglio cronometrato, e la domanda più importante della giornata: quanto
cambia la lunghezza d'onda tra due epoche dello stesso campo. Se i ritagli risultano impraticabili per
lentezza, **il piano cambia lì, non all'ora quindici**.

**Fino all'ora otto, il percorso critico**, e il traguardo è molto concreto: *una coordinata scritta a mano
produce un videino sullo schermo*. Brutto, lento, una sola banda, non importa. Se all'ora otto non c'è
il videino, tutto il resto si sospende e i sei si mettono su quello.

**Dall'otto alla quattordici, che sia buono**, per ordine di valore: selettore di banda, poi i
controlli, poi la sottrazione di immagini, poi risolvere i nomi, poi l'URL condivisibile, poi
l'overlay di Gaia, poi i flag, e solo se tutto il precedente è chiuso, gli spettri al volo.

E poi arrivano **le tre soste obbligatorie**, che sono l'unica cosa che non si negozia.

A sei ore dalla chiusura: **congelamento dell'ambito**. Non si comincia nulla di nuovo. Ciò che non sia
cominciato non si comincia, e ciò che è cominciato si finisce o si toglie, perché **una funzionalità a metà
penalizza**: la giuria fa clic proprio lì.

A quattro ore: **la demo registrata**, anche se l'applicazione continua a migliorare. Se poi migliora, si
registra di nuovo. Se non c'è tempo, il video c'è già.

A due ore: **consegnato**. Modulo completo, link inseriti, dichiarazione d'uso dell'IA scritta.
Dopo si può continuare a modificare, ma è già consegnato.

---

## 7. Cosa può andare storto

Dieci rischi identificati; vale la pena tenere presenti i primi quattro.

**Che i ritagli dell'archivio siano troppo lenti.** È l'ipotesi su cui poggia tutto.
Si decide all'ora tre. Se lo sono, il piano B è cache aggressiva, preriscaldamento e mostrare i
fotogrammi man mano che arrivano; e il piano C è funzionare su un insieme curato di una decina di
campi precalcolati, dicendolo senza giri di parole: oggi serviamo questi campi, l'architettura scala.

**Che le epoche non siano confrontabili a causa del filtro lineare variabile.** È il rischio più sottile e
quello che più probabilmente rovinerà il risultato senza che nessuno capisca perché. Il segnale d'allarme
è ovvio quando compare: il primo blink sembra una luce stroboscopica.

**Che cada il wifi.** Probabilità alta: succede in quasi tutti gli hackathon. Il piano B è
obbligatorio, non opzionale: una modalità degradata che serve i cinque campi dalla cache senza toccare la rete,
e il video della demo scaricato sul disco del computer che presenta, non nel cloud.

**Che il progetto venga consegnato in ritardo o incompleto.** È la causa numero uno per cui un buon progetto
non vince nulla, e non ha piano B. Per questo esistono le tre soste.

E uno in più che conviene avere scritto in anticipo per non riaprirlo alle quattro del mattino: **non
si addestrerà nessun modello.** Non c'è tempo, non ci sono etichette e non serve.

---

## 8. Perché non modelli video, e cosa rispondere se lo chiedono

Conviene avere questo chiaro perché qualcuno lo chiederà, dentro o fuori dal team.

Le architetture di comprensione video —TimeSformer, ViViT, VideoMAE, X-CLIP— sono modelli per
capire video naturali. Sono preaddestrate con persone, oggetti e azioni. La statistica di una
sequenza astronomica —sfondo quasi vuoto, sorgenti puntiformi, artefatti, uno spostamento di pochi
pixel— non somiglia affatto a quella, quindi il preaddestramento, che è tutto il loro valore, non si trasferisce
bene. Inoltre non ci sono etichette, e il caso è già ben risolto da metodi classici che sfruttano
la fisica del problema: una traiettoria lineare su uno sfondo statico.

Lo stato dell'arte del rilevamento automatico qui è **shift-and-stack**: spostare ogni immagine secondo
una velocità candidata e impilarle, in modo che un oggetto che si muove si sommi coerentemente e il
rumore no. L'implementazione di riferimento, KBMOD, gira su GPU ed esplora dell'ordine di diecimila
milioni di traiettorie candidate al minuto; con essa, la survey DEEP ha identificato 105 oggetti
transnettuniani nuovi. È costoso ed è fuori portata per 24 ore. Menzionarlo come lavoro
futuro è più onesto che tentarlo.

**E qui c'è il vantaggio proprio del team.** Il laboratorio di Francisco Förster ha costruito ALeRCE,
il broker cileno che elabora il flusso di allerte di ZTF e si prepara per LSST. Il suo classificatore di
stamp è una rete convoluzionale che lavora sui ritagli di scienza, riferimento e
differenza del primo rilevamento, progettata per sfruttare l'invarianza rotazionale. Quello —una rete
piccola su ritagli, con invarianze scelte a mano— **è il modello di intelligenza
artificiale corretto per questo problema**, non un transformer video.

Ma il contributo differenziante non è nemmeno inserire quel classificatore nel visore. È la **disciplina
della classificazione in tempo reale**: soglie, falsi positivi, come si presenta a una persona un
candidato dubbio, come si raccoglie l'etichetta che quella persona dà. Quella disciplina applicata
all'interfaccia è qualcosa che nessun altro team dell'hackathon avrà.

Quindi la risposta alla giuria, se chiedono perché non abbiamo usato l'apprendimento automatico, è: *l'abbiamo
valutato; il collo di bottiglia di questa sfida non è riconoscere il movimento in un video, è portare
e allineare i dati giusti e metterli davanti a una persona; dove l'IA apporta qui è nello
screening dei candidati con piccole reti su ritagli, che è ciò che fa il broker ALeRCE, e
lo lasciamo impostato*. Quella risposta è più forte che aver inserito un modello che non apporta nulla.

---

## 9. La giuria: come si giudica e a cosa puntare

L'imbuto è: la giuria dell'evento locale sceglie i nominati globali; poi esperti della NASA e delle
agenzie partner scelgono i finalisti; e un comitato esecutivo sceglie dieci vincitori globali.

Cioè: **il primo filtro è una giuria locale**, con poco tempo per team e senza leggere il codice.
Poi, persone che di astronomia se ne intendono. Il progetto deve funzionare nei due registri:
colpire in due minuti e resistere a uno sguardo esperto.

Dei dieci premi globali, due sono naturali per questo progetto: **miglior uso dei dati**, che è
letteralmente rendere accessibili i dati spaziali, e **miglior uso della scienza**. Un terzo gratis se
ci si lavora: **miglior uso dello storytelling**, perché la storia di Plutone e del comparatore a blink
è lì da prendere. Puntare a due o tre, non a dieci.

---

## 10. Il pitch di due minuti

All'evento di Santiago il formato annunciato è due minuti più due domande. Due minuti sono
molto meno di quanto sembri, e bisogna provarlo ad alta voce e cronometrato, tre volte.

La struttura, e l'ordine non si negozia perché **la demo viene prima della spiegazione**: se ti
interrompono, almeno hanno visto lo strumento.

**Venti secondi di aggancio.** Nel 1930, Clyde Tombaugh scoprì Plutone guardando due foto dello stesso
pezzo di cielo e notando che un punto si era mosso. Oggi SPHEREx fotografa l'intero cielo ogni
sei mesi in 102 colori di infrarosso, e nessuno lo sta guardando così.

**Cinquanta secondi di dimostrazione dal vivo**, che è metà del tempo ed è ciò che si giudica.
Scrivere "WISE 0855" —il nome, non le coordinate, per dimostrare che è per chiunque—. Premere
play e mostrare la sottrazione della prima e dell'ultima immagine: la nana bruna si muove —una coppia rossa e blu, sottile, e
si dice con onestà che in un'esposizione singola si vede debole—. Mostrare anche eps Ind B, dove il movimento si vede
più chiaro. Muovere il selettore di banda: la stessa zona a un'altra lunghezza d'onda.
Attivare l'overlay di Gaia (WISE 0855 non è in Gaia: lì l'overlay è CatWISE2020; su Barnard o eps Ind B): i marcatori cadono sulle sorgenti, *così sappiamo che è corretto*.
Copiare l'URL: questo è condivisibile e incorporabile.

**Venticinque secondi su perché è importante.** La maggior parte delle nane brune e delle comete
conosciute le hanno trovate volontari guardando blink. Quella comunità esiste e oggi non ha modo di
guardare SPHEREx. Il candidato a Planet Nine più citato è uscito dal confronto di due survey infrarosse
separate nel tempo: la stessa tecnica.

**E venticinque secondi su cosa abbiamo costruito e cosa segue.**

Tre regole del pitch. Mai dimostrare dal vivo contro una query a freddo: i cinque campi sono
preriscaldati. Non si dice "potrebbe": si mostra ciò che c'è. E **non si promette di aver trovato nulla**:
una giuria con astronomi lo punisce all'istante.

Su Planet Nine, la cornice onesta: a novembre 2026 **non è stato trovato**. Il candidato più
citato è quello uscito dall'incrocio delle survey infrarosse IRAS e AKARI, separate da ventitré anni, e
gli stessi autori sottolineano di non aver scoperto nulla di definitivo. Ma la frase che è
vera, verificabile, e un aggancio migliore di qualsiasi promessa, è questa: **la tecnica che ha trovato quel
candidato è esattamente quella della sfida, e SPHEREx la fa ogni sei mesi, in 102 bande, e nessuno
l'ha controllata a occhio.**

---

## 11. Le domande scomode

Quattro, con la loro risposta.

**Questo non lo fa già l'esploratore di dati di IRSA?** Non per questo pubblico. L'esploratore è un
archivio per astronomi: bisogna sapere quale collezione richiedere, cos'è un FITS multiestensione e come si
stira un'immagine. Noi risolviamo il nome, raggruppiamo le epoche, normalizziamo e consegniamo il
blink. È la differenza tra un archivio e un visore, ed è la stessa differenza che ha reso utile
WiseView rispetto all'archivio di WISE.

**Come so che l'immagine è di quella coordinata?** Dall'overlay di Gaia. E si mostra sullo schermo.

**Cosa succede se inserisco una coordinata senza dati?** E se ne scrive una, e si mostra lo stato vuoto, che
dice quante epoche ci sono e suggerisce un campo vicino. Bisogna avere questo risolto: la giuria scriverà
coordinate a caso, e una schermata bianca è un errore grave.

**Quanto sono corretti gli spettri?** Sono indicativi, fotometria di apertura con la luce
zodiacale sottratta, e lo diciamo nell'interfaccia stessa. Per la scienza c'è lo strumento di
spettrofotometria di IRSA. Mai presentarli come qualità scientifica: l'onestà qui aggiunge
molto più di quanto tolga.

---

## 12. Gli obblighi della consegna

Tre cose che non sono burocrazia.

**La descrizione di come è stata usata l'intelligenza artificiale è obbligatoria quest'anno** in ogni
consegna. Scritta bene, è evidenza di metodo: cosa si è chiesto agli assistenti, come si è controllato il
risultato, cosa non si è fatto con loro —in particolare, che nessun dato scientifico è stato generato né
completato da un modello—, e perché si sono scartati in modo motivato i modelli di visione per il
rilevamento. Scritta male, è un'occasione sprecata.

**L'attribuzione dei dati di SPHEREx**, letterale, nel piè di pagina dello strumento e nel README. È
un punto gratis di cura davanti a una giuria della NASA e costa trenta secondi.

E **i link provati da fuori dal wifi dell'evento**: il video, l'applicazione distribuita e il
repository, aperti da un telefono con dati mobili. Un link che funziona solo nella rete
locale è un link rotto.

---

## 13. Cosa bisogna avere in testa arrivando

Cinque cose.

Una: gli otto suggerimenti dell'enunciato sono la rubrica, sette sono economici, e bisogna soddisfarli
tutti in ordine di valore.

Due: il traguardo dell'ora otto è un videino sullo schermo, per brutto che sia. Tutto il resto vi si subordina.

Tre: le tre soste —congelamento a sei ore, demo registrata a quattro, consegnato a due— non si
negoziano, perché il progetto che vince è quello che arriva intero.

Quattro: verificare l'artefatto, non il rapporto. Vale per gli agenti e vale per le persone.

E cinque: l'angolo del progetto sta in una frase. **Un visore dove chiunque inserisce una coordinata
e vede due assi contemporaneamente: come cambia quella zona del cielo nel tempo, e come appare in ciascuna delle
102 lunghezze d'onda, con lo spettro di ciò che indica generato al volo.** Questa è la lettura
letterale dell'enunciato, sono i suoi due punti più esigenti, ed è qualcosa che nessuno strumento pubblico
fa oggi.
