<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/docs/briefings/01_el_desafio_y_los_datos.md) · [Español](../../../es/docs/briefings/01_el_desafio_y_los_datos.md) · [中文](../../../zh/docs/briefings/01_el_desafio_y_los_datos.md) · [Deutsch](../../../de/docs/briefings/01_el_desafio_y_los_datos.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/briefings/01_el_desafio_y_los_datos.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Audio 1 di 2 — SPHEREx: la sfida e i dati

Materiale di preparazione per Juan Pablo, in vista del NASA Space Apps Challenge 2026, dove il suo team
di sei persone del laboratorio di astronomia affronterà la sfida **Planet X and SPHEREx**.

Questo è il primo di due audio. Questo copre **cosa chiede la sfida e con quali dati si lavora**.
Il secondo copre la strategia, il metodo di lavoro e il pitch.

Chiariamolo fin dall'inizio, perché è ciò che si fraintende di più: **il prodotto da consegnare non è un
modello di intelligenza artificiale. È uno strumento web.**

---

## 1. Cosa chiede la sfida, esattamente

L'enunciato dice: creare uno strumento web pubblico che mostri immagini del cielo della missione
SPHEREx, in modo che chiunque possa vedere facilmente come cambiano nel tempo. L'utente inserisce
le coordinate di un pezzo di cielo —ascensione retta e declinazione— e lo strumento mostra una
serie di immagini di quella zona, come un videino, in modo che sia facile individuare oggetti in movimento.

Difficoltà dichiarata: **Advanced**. Materie: astrofisica, pianeti e lune, software.

La sfida nomina cinque oggetti per provare lo strumento: la stella di Barnard, Epsilon Indi B
—una coppia di nane brune che orbitano attorno a una stella—, WISE 0855 —una nana bruna a moto
rapido, le cui coordinate l'enunciato fornisce esplicitamente— e due stelle variabili, RW Aurigae e
R Draconis.

Quei cinque oggetti sono, in pratica, il criterio di accettazione. Se lo strumento si comporta
bene con tutti e cinque, è finito.

**Va sottolineato ciò che la sfida non chiede.** Non chiede un rilevatore automatico. Non chiede un
classificatore. Non chiede una pipeline scientifica. Chi rileva è l'utente umano. Un modello di
classificazione video può aggiungersi come livello opzionale, ma se sostituisce il visore, il progetto
semplicemente non risponde all'enunciato.

---

## 2. Perché un visore e non un algoritmo: la logica della sfida

La tecnica ha quasi cent'anni. Clyde Tombaugh scoprì Plutone nel 1930 con un comparatore a
lampeggio: due lastre fotografiche della stessa zona di cielo riprese in date diverse,
alternate rapidamente. Ciò che è fermo non si muove; ciò che si sposta salta all'occhio.

Un secolo dopo la tecnica è la stessa, è cambiato solo il supporto. Ed è ancora competitiva.
L'enunciato stesso lo dice: la maggior parte delle comete e delle nane brune note le hanno
scoperte volontari guardando lampeggi, tramite progetti di scienza partecipata come
Backyard Worlds. Centinaia di migliaia di persone hanno trovato oggetti che gli algoritmi
automatici delle survey avevano lasciato passare, tipicamente in zone ad alta densità stellare, vicino
a sorgenti luminose, o con artefatti che confondono un rilevatore ma non una persona.

Questa è la giustificazione della sfida, ed è bene saperla dire in una frase: **non si chiede un visore
perché sia più facile di un rilevatore automatico, ma perché l'occhio umano su scala di folla
risolve casi che il rilevatore automatico non risolve.**

---

## 3. Il modello esplicito: WiseView

La sfida nomina uno strumento come modello: **WiseView**, su byw.tools. È uno strumento da
browser che fa lampeggiare immagini combinate del telescopio WISE su una base temporale di
vari anni. L'utente inserisce solo le coordinate e regola tre cose: lo stretching dell'immagine,
la mappa di colore e la velocità del lampeggio.

Nacque come arrangiamento di due volontari di Backyard Worlds che volevano classificare meglio i propri
candidati. Oggi ha permesso centinaia di scoperte di candidate nane brune, da parte di
dilettanti e di professionisti.

Tre lezioni da copiare senza vergogna:

Primo, **una casella di coordinate e nient'altro** nella prima schermata. Secondo, **i controlli
contano**: lo stretching, il colore e la velocità sono ciò che trasforma una macchia in una
scoperta, non sono orpelli; se per mancanza di tempo si tagliano, si taglia proprio ciò che
rende utile lo strumento. E terzo, **WiseView ha un'API**, e questo l'ha trasformata in infrastruttura:
esistono pacchetti di terze parti costruiti sopra per generare materiale e caricarlo su piattaforme di
scienza partecipata.

E la cosa più importante: **ciò che WiseView non fa.** Non ha asse spettrale. WISE ha quattro bande
larghe. SPHEREx ne ha 102. Lì sta il vuoto che il progetto riempie.

---

## 4. Cos'è SPHEREx

SPHEREx è una missione della NASA che dal maggio 2025 mappa l'intero cielo ogni sei mesi
nell'infrarosso vicino, tra 0,75 e 5 micrometri, suddivisi in **102 canali spettrali**. Questa
copertura spettrale la rende particolarmente sensibile a oggetti ricchi di idrogeno, acqua, anidride
carbonica, monossido di carbonio e altre molecole. Produrrà immagini di oltre un miliardo di
oggetti: nane brune, quasar, comete, asteroidi, stelle, supernove e galassie, che spesso
si sovrappongono o variano di luminosità.

Lo strumento ha sei detector, divisi da un dicroico in tre a onda corta e tre a onda lunga. Ogni banda copre un intervallo diverso: la banda 1 va da 0,75 a 1,09 micrometri, la 2 da
1,10 a 1,62, la 3 da 1,63 a 2,41, la 4 da 2,42 a 3,82, la 5 da 3,83 a 4,41 e la 6 da 4,42 a 5,00.
Le ultime due hanno una risoluzione spettrale molto maggiore delle prime.

---

## 5. Il dettaglio tecnico che decide il progetto: il filtro lineare variabile

Questa è la cosa più importante di tutto l'audio. Se c'è una sola cosa da ricordare, è questa.

SPHEREx **non ha filtri discreti**. Ha un filtro lineare variabile: la lunghezza d'onda cambia
in modo continuo lungo un asse del detector. Con le parole della documentazione dell'archivio:
SPHEREx ottiene spettri mediante esposizioni multiple, collocando una data sorgente in diverse
posizioni del campo visivo, dove viene misurata a diverse lunghezze d'onda, riorientando il satellite.

In altre parole: lo spettro di una sorgente si costruisce osservandola molte volte, ogni volta in
una parte diversa del detector, e quindi **ogni volta a una lunghezza d'onda diversa**.

La conseguenza è enorme per questa sfida, ed è bene averla chiara fin dalla prima ora. Se si
prendono tutte le immagini che coprono una posizione del cielo, le si ritaglia e le si passa in sequenza, **non
si ottiene un lampeggio pulito. Si ottiene una sequenza stroboscopica**, in cui la luminosità di ogni
sorgente salta perché ogni fotogramma è a un'altra lunghezza d'onda. Una stella rossa apparirà luminosa in
alcuni fotogrammi e debole in altri senza essersi mossa né aver cambiato.

Questo rovina esattamente ciò che la sfida vuole mostrare: cosa si muove e cosa varia davvero.

Ci sono tre vie d'uscita, in ordine di costo. La prima: **raggruppare per banda o per detector prima di fare
il lampeggio**, in modo che ogni fotogramma del video sia della stessa banda in epoche diverse. Questa
è, inoltre, la lettura letterale di uno dei suggerimenti dell'enunciato, che dice che può avere
senso sommare separatamente tutti i dati presi da ciascuno dei sei detector. La seconda:
raggruppare per lunghezza d'onda usando l'estensione che il file porta con la mappa da pixel a
lunghezza d'onda. Più corretta e più costosa. E la terza: normalizzare ogni fotogramma con percentili
robusti, che è una toppa visiva, non una soluzione fisica, ma in 24 ore può salvare la demo.

E se nemmeno così viene pulito, c'è una quarta via d'uscita, che è trasformarlo in una funzionalità: mostrare la
lunghezza d'onda di ogni fotogramma a schermo e spiegare che il lampeggio è informazione spettrale,
non rumore. È vero, e davanti a una giuria tecnica aggiunge invece di togliere.

**La prima cosa da fare con dati reali è misurare quanto cambia la lunghezza d'onda tra due
epoche dello stesso campo.** Prima di decidere qualsiasi cosa di architettura.

---

## 6. Dove vivono i dati

L'archivio è **IRSA**, l'Infrared Science Archive di IPAC al Caltech. Ci sono quattro percorsi di accesso
ed è bene conoscerli tutti.

**Directory navigabili.** I prodotti sono organizzati in cartelle che si possono percorrere con
un browser, utili per capire l'organizzazione e per i download di massa, ma non per cercare
per coordinata.

**Il protocollo SIA2**, che è lo standard dell'International Virtual Observatory Alliance per
l'accesso semplice alle immagini. È la via principale: si interroga per posizione nel cielo e restituisce la
lista delle immagini che la coprono, con l'URL di download di ciascuna.

**Il servizio di ritagli.** Questo è critico: ogni file di immagine spettrale pesa circa 70
megabyte. Scaricarli interi per mostrare un piccolo ritaglio è impraticabile in un hackathon e in uno
strumento pubblico. Il servizio di ritagli si invoca semplicemente aggiungendo all'URL del file il
centro in coordinate e la dimensione in gradi. Un avvertimento: **i ritagli funzionano solo sui
file ospitati presso IPAC**, non sulla copia che c'è su Amazon.

E **Python**: le librerie pyvo e astroquery incapsulano tutto questo, e l'archivio pubblica notebook
ufficiali di esempio. Esiste inoltre un pacchetto di terze parti, spxquery, che già automatizza l'interrogazione,
il download con ritaglio, la fotometria di apertura con sottrazione della luce zodiacale e le curve di luce.
Vale la pena guardarne l'architettura prima di scrivere qualcosa di proprio, anche se non lo si usa: ha già risolto i
problemi che il team incontrerà.

---

## 7. Cosa c'è dentro un file

Il prodotto principale è un FITS a estensioni multiple, di 2040 per 2040 pixel, con sei
estensioni. Conviene conoscerle perché varie sono opportunità dirette.

La prima è l'**immagine** calibrata, in unità di brillanza superficiale. La seconda sono i
**flag**, una mappa di bit per pixel con lo stato e l'elaborazione di ciascuno: questa estensione è
la risposta diretta a uno dei suggerimenti dell'enunciato, che chiede di mostrare metadati come gli
indicatori di contaminazione. Mostrarli nell'interfaccia costa poco ed è esattamente ciò che l'autore
della sfida ha chiesto. La terza è la **varianza**. La quarta è il modello di **luce zodiacale**, e qui
c'è un dettaglio che vale oro: **la luce zodiacale non è sottratta dall'immagine**. Sottrarla è
una riga di codice e migliora moltissimo il contrasto delle sorgenti deboli. La quinta estensione è
la funzione di dispersione del punto, e la sesta è la tabella che mappa pixel in lunghezza d'onda.

Due trappole note. Una: la tabella delle lunghezze d'onda usa una parte poco comune dello standard FITS
che, secondo l'archivio stesso, non tutti i lettori implementano ancora; se il lettore non la riconosce,
bisogna interpolare tra i punti di controllo più vicini, con una precisione di circa un
nanometro, sufficiente per visualizzare ma non per la scienza. E due: gli header FITS numerano i
pixel da uno, mentre Astropy li numera da zero. È la causa classica di
spostamenti di un pixel.

Un altro dettaglio da tollerare nel codice: **non tutte le osservazioni portano tutte e sei le
bande**. La qualità si valuta banda per banda e alcune non arrivano all'archivio.

---

## 8. Ciò che è appena successo e nessun altro sa: Data Release 1

Questo è importante ed è un'informazione fresca. La cronologia delle pubblicazioni è: luglio 2025, primo
Quick Release; ottobre 2025, il secondo; settembre 2026, il terzo; e **novembre 2026
—questo stesso mese— il Data Release 1**.

È molto probabile che nessun altro team dell'hackathon lo stia usando, ed è quasi certo che i tutorial
e gli esempi che circolano su internet puntino ancora alla versione di un anno fa, che non è più
nemmeno ricercabile tramite il protocollo di interrogazione.

E il Data Release 1 porta qualcosa che cambia l'architettura del progetto: **un cubo di tutto il cielo,
con un mosaico per ciascuno dei 102 canali, pubblicato in formato HiPS**.

HiPS è il formato di tessere gerarchiche del centro di dati astronomici di Strasburgo, ed è
precisamente il formato che **Aladin Lite consuma direttamente nel browser**. Aladin Lite è,
inoltre, lo strumento che la sfida stessa suggerisce di usare per mostrare dati astronomici.

Ciò che questo significa in pratica: **c'è una strada per mostrare le 102 bande di tutto il cielo
senza scrivere una riga di backend.** È la via rapida del progetto e la sua assicurazione: se il backend
ritarda o cade, quella parte continua a funzionare e c'è qualcosa da mostrare.

Conviene non confondere i due prodotti, perché rispondono a domande diverse. **Le immagini di
livello 2 danno l'asse del tempo**: molte epoche, risoluzione nativa, ed è da lì che esce il lampeggio.
**Il cubo di tutto il cielo dà l'asse della lunghezza d'onda**: 102 canali, risoluzione grossolana, ed è
da lì che escono il contesto e le 102 bande come immagine (PNG senza flussi: lo spettro esce dai file di livello 2). Il visore richiesto dalla sfida ha bisogno di entrambe le cose.

---

## 9. Strumenti che l'archivio ha già

Prima di costruire qualcosa, conviene vedere se IRSA l'ha già fatto. Ha un esploratore di dati con
interfaccia grafica, uno strumento di ritagli, uno di mosaici, uno di spettrofotometria tramite
fotometria forzata —che è la risposta dell'archivio al suggerimento di generare spettri al volo—,
uno di scoperta di sorgenti, e uno particolarmente interessante: **MOST**, lo strumento di
ricerca di oggetti in movimento che, data l'orbita di un oggetto del sistema solare, trova le
immagini di SPHEREx che hanno coperto la sua posizione prevista in ogni epoca. Con questo, una scheda
"segui questo asteroide" viene quasi gratis.

E c'è un dettaglio con gancio per una demo: l'archivio ha una **collezione dedicata alla cometa
interstellare 3I/ATLAS**. Un oggetto che si muove rapidamente, recente, e che il pubblico conosce. Per due
minuti di dimostrazione vale più di qualsiasi nana bruna.

---

## 10. Gli altri dati: gli overlay

L'enunciato suggerisce di permettere la sovrapposizione di dati di altri telescopi, e menziona Gaia e WISE.

Vale la pena capire che **Gaia non è solo un ornamento visivo: è il controllo di qualità del visore.**
Gaia fornisce posizioni, moti propri e parallassi con una precisione straordinaria. Se si disegna
sull'immagine la posizione che Gaia prevede per una stella alla data di quella specifica epoca, e
il marcatore cade proprio sul punto luminoso, resta dimostrato che il sistema di coordinate, le date
e il ritaglio sono tutti corretti.

È il modo più economico che esista per provare a una giuria che lo strumento è corretto e non solo
bello. E risponde, prima che la facciano, all'ovvia domanda: come so che questa immagine è della
coordinata che ho chiesto?

Un dettaglio da curare: Gaia Data Release 3 ha epoca di riferimento 2016, non 2000. Confonderle introduce
un errore di sedici anni di moto proprio.

---

## 11. I cinque oggetti di prova, e cosa dimostra ciascuno

**WISE 0855** è un caso obbligatorio, uno degli oggetti di prova dell'organizzazione, e si mostra
sempre: moto proprio altissimo, uno degli oggetti più freddi noti fuori dal sistema solare e
molto vicino. Dovrebbe brillare nelle bande lunghe ed essere quasi assente in quelle corte. Con onestà: in
una singola esposizione si vede debole; il suo moto si vede con la sottrazione della prima e dell'ultima immagine e,
quando esisterà, con la somma per passata (in sospeso, di D2) e con l'overlay di CatWISE2020 (fatto nel branch `v/v2-catwise` di V2, in attesa di PR; non è in Gaia). In eps Ind B il moto si vede più chiaramente.

**La stella di Barnard** ha il maggior moto proprio noto di qualsiasi stella. È il
caso di controllo: se in Barnard non si vede movimento, il problema è del visore, non dell'oggetto.

**Epsilon Indi B** è una coppia di nane brune. È il miglior campo per dimostrare il selettore di
banda, perché è un oggetto rosso e freddo. Attenzione a una trappola: la coppia è separata di circa 400
secondi d'arco dalla stella Epsilon Indi A, che è molto luminosa e può contaminare il campo.

**RW Aurigae** e **R Draconis** sono variabili: cambiano di luminosità senza muoversi. Sono il caso di controllo
opposto.

Ed ecco l'argomento più forte per il pitch: **la coppia "si muove" contro "cambia solo di
luminosità"** dimostra che lo strumento distingue le due cose. Nella dimostrazione conviene mostrare
una per tipo.

Le cinque coordinate sono state verificate in SIMBAD il 14 novembre, e da lì sono uscite due
trappole che vale la pena conoscere prima di arrivare.

La prima: **la coordinata che l'enunciato dà per WISE 0855 è dell'epoca di WISE, intorno al
2010, non quella di oggi.** Quell'oggetto si muove di otto secondi d'arco all'anno, quindi a fine 2026
è a circa centotrenta secondi d'arco da dove dice l'enunciato. Se si centra il visore lì con un campo piccolo,
l'oggetto resta fuori e sembra che lo strumento non funzioni.

La seconda: **Epsilon Indi B con la B maiuscola è la coppia di nane brune, che è ciò che chiede la
sfida; con la b minuscola è un pianeta**, che si trova a quattrocento secondi d'arco, nella posizione
della stella. Ci sono risolutori di nomi che non distinguono le maiuscole e restituiscono il pianeta.

E un'aspettativa che conviene avere calibrata fin dall'inizio: con una scala di pixel di circa
sei secondi d'arco, **anche gli oggetti più veloci del cielo si muovono meno di un pixel tra
due passate consecutive di SPHEREx**, che sono separate da sei mesi. Solo con la base temporale
completa della missione si arriva a uno o due pixel e mezzo. Questo significa confrontare la prima epoca
con l'ultima, non le consecutive; dà molto valore alla sottrazione di immagini, dove un pixel di
spostamento si vede chiarissimo; e obbliga a non promettere nel pitch che l'oggetto salti all'occhio
senza averlo visto prima.

Una coordinata sbagliata, in ogni caso, non fallisce: restituisce immagini perfettamente valide di un
pezzo di cielo sbagliato. È l'errore più silenzioso e più costoso che si possa commettere qui.

---

## 12. Cosa tenere in testa all'arrivo

Cinque cose.

Una: il prodotto da consegnare è un visore perché le persone rilevino, non un rilevatore automatico.

Due: il filtro lineare variabile fa sì che epoche diverse siano a lunghezze d'onda diverse, e
questo va misurato con dati reali nella prima ora.

Tre: il Data Release 1 è uscito questo mese e porta un cubo di tutto il cielo in formato HiPS, che Aladin Lite
può mostrare senza backend (l'HiPS in PNG di IRSA, che è un mosaico senza tempo e senza flussi). Quella è la via rapida e l'assicurazione del progetto.

Quattro: i ritagli dell'archivio sono ciò che rende tutto fattibile; vanno cronometrati presto,
perché se sono lenti, il piano cambia.

E cinque: le 102 bande sono l'angolo proprio. WiseView fa già il lampeggio in WISE. Ciò che nessuno ha ancora
fatto per il pubblico generale è il lampeggio **più** l'asse spettrale: che l'utente veda non
solo che qualcosa si muove, ma di cosa è fatto.
