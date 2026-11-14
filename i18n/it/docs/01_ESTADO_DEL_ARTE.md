<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/01_ESTADO_DEL_ARTE.md) · [Español](../../es/docs/01_ESTADO_DEL_ARTE.md) · [中文](../../zh/docs/01_ESTADO_DEL_ARTE.md) · [Deutsch](../../de/docs/01_ESTADO_DEL_ARTE.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/01_ESTADO_DEL_ARTE.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 01 — Stato dell'arte

Cosa è stato già fatto in ciò che questa sfida chiede, cosa ha funzionato, cosa no, e dove resta spazio per
qualcosa di nuovo in 24 ore. I riferimenti completi, con i link, sono in
[`../biblio/README.md`](../biblio/README.md); qui ci sono i nomi e l'argomentazione.

---

## 1. Il problema ha cent'anni e la tecnica non è cambiata

Clyde Tombaugh scoprì Plutone nel 1930 con un **comparatore a lampeggio**: due lastre fotografiche
della stessa zona di cielo riprese in date diverse, alternate rapidamente. Ciò che è fermo non si
muove; ciò che si sposta salta all'occhio. L'occhio umano è straordinariamente bravo a rilevare
quel salto, anche con molto rumore di fondo.

Un secolo dopo la tecnica è la stessa, è cambiato solo il supporto. Ed è ancora competitiva: in
progetti di scienza partecipata come **Backyard Worlds: Planet 9** (Kuchner et al., 2017), centinaia
di migliaia di volontari hanno trovato nane brune e oggetti ad alto moto proprio che gli
algoritmi automatici del survey si erano lasciati sfuggire, tipicamente perché si trovavano in zone di alta
densità stellare, vicino a sorgenti brillanti o con artefatti che confondono un rilevatore ma non
una persona.

**Questa è la giustificazione della sfida**, ed è bene dirlo nel pitch: non si chiede un visualizzatore perché
sia più facile di un rilevatore automatico, ma perché l'occhio umano su scala di moltitudine risolve
casi che il rilevatore automatico non risolve.

---

## 2. Ciò che esiste già e va conosciuto prima di scrivere una riga

### WiseView — il modello esplicito della sfida

<http://byw.tools/wiseview> · Caselden, Westin et al., ASCL:1806.004

Strumento da browser che fa lampeggiare i coadd di WISE su una base temporale di vari anni.
L'utente inserisce le coordinate e regola stiramento, mappa di colore e velocità di lampeggio. Nacque
come un rimedio improvvisato di due volontari di Backyard Worlds che volevano classificare meglio i propri
candidati, e finì per essere lo strumento con cui si sono fatte **centinaia di scoperte**
di nane brune, da parte di dilettanti e di professionisti.

Lezioni da copiare senza vergogna:

- **Una casella di coordinate e nient'altro** nella prima schermata.
- **I controlli contano**: stiramento, colore e velocità di lampeggio sono ciò che trasforma una
  macchia in una scoperta. Non sono decorazioni.
- **Ha un'API.** Esistono pacchetti di terzi —`flipbooks` e `unWISE-verse`, del progetto Cool
  Neighbors— costruiti sopra l'API di WiseView per generare materiale e caricarlo su Zooniverse.
  Uno strumento con URL interrogabile diventa infrastruttura di altri progetti. Questo è
  esattamente ciò che chiede il punto elenco della sfida sull'includere le coordinate nell'URL.

Ciò che WiseView **non** fa, ed è la nostra nicchia: non ha asse spettrale. WISE ha quattro bande;
SPHEREx ne ha 102.

### unWISE e i coadd

Lang (2014), Meisner et al. (coadd di cinque anni), catalogo unWISE (Schlafly et al.).
WiseView non mostra esposizioni singole: mostra **coadd**, immagini combinate per epoche. È la
ragione per cui si vedono sorgenti deboli. Il catalogo **unTimely** (Meisner et al., 2022) ha portato questo nel
dominio temporale: un catalogo di tutto il cielo risolto nel tempo a partire dai coadd.

`[Implicazione]` Combinare prima di mostrare non è opzionale se si vogliono vedere cose deboli. In SPHEREx
l'equivalente naturale è sommare per rivelatore o per intervallo di λ, che è proprio ciò che suggerisce la sfida.

### Visualizzatori di cielo nel browser

| Strumento | Chi | Cosa offre |
|---|---|---|
| **Aladin Lite v3** | CDS, Strasburgo | Visualizzatore HiPS nel browser, incorporabile, con proiezioni, overlay di cataloghi e tasselli FITS. **Lo cita la sfida stessa** |
| **Firefly** | IPAC/Caltech | Il motore del Data Explorer di IRSA. Il notebook ufficiale del cubo HiPS di SPHEREx lo usa |
| **Legacy Survey viewer** | NOIRLab | Un altro visualizzatore di cielo che serve i coadd di unWISE |
| **ESASky** | ESA | Visualizzatore multimissione, buon esempio di UX di livelli temporali |
| **JS9** | SAO | DS9 nel browser: manipolazione di FITS lato client |

**Aladin Lite è la decisione predefinita** ed è bene non discuterla: risolve la navigazione nel
cielo, le proiezioni, gli overlay di Gaia e lo zoom, che sono settimane di lavoro. Il formato
**HiPS** (Fernique et al., 2015) è ciò che consuma, e permette di animare un cubo piano per piano.

Il dato che chiude l'argomento: il **cubo di tutto il cielo di SPHEREx DR1 è pubblicato come HiPS**
(vedi [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)). C'è un cammino diretto dall'archivio della NASA al
browser senza backend.

---

## 3. Rilevamento automatico di oggetti in movimento

Non è ciò che chiede la sfida, ma è ciò che una giuria con astronomi chiederà. Bisogna poter
rispondere in una frase perché non l'abbiamo fatto (o come l'abbiamo fatto sopra il visualizzatore).

### Shift-and-stack: KBMOD

Whidden et al. (2019) e il team di LINCC Frameworks. L'idea: un oggetto che si muove lentamente è
invisibile in una sola immagine, ma se si **spostano** le immagini secondo una velocità candidata e
poi le si **impila**, l'oggetto si somma coerentemente e il rumore no. KBMOD fa questo su GPU e può
esplorare dell'ordine di 10¹⁰ traiettorie candidate al minuto.

Risultati reali: il survey **DEEP** (DECam Ecliptic Exploration Project) ha identificato con KBMOD
105 nuovi oggetti transnettuniani; il New Horizons Subaru TNO Survey lo ha usato per passare da giorni per
chip a ore. Esiste inoltre un lavoro recente di classificazione con apprendimento automatico dei
candidati che produce (Smotherman et al., 2024), perché una soglia bassa genera migliaia di falsi
positivi per CCD.

`[Implicazione]` Lo shift-and-stack è lo stato dell'arte per "trovare ciò che nemmeno si vede". È anche
costoso, e SPHEREx ha una cadenza e un campionamento spettrale che non somigliano a quelli di DECam.
**Per 24 ore, menzionarlo come lavoro futuro è più onesto che provarci.** Se si vuole un
assaggio, una sottrazione di immagini tra due epoche (che la sfida suggerisce esplicitamente) è il 5 % dello
sforzo e il 60 % dell'effetto visivo.

### Collegamento di rilevamenti: HelioLinC e famiglia

L'altro approccio: rilevare sorgenti in ogni immagine e poi **collegare** i rilevamenti che sono
compatibili con un'orbita. È il cammino che seguirà Rubin/LSST. Più economico dello shift-and-stack,
ma richiede che l'oggetto si veda nelle singole immagini.

### Broker di alert: ALeRCE

Questo è terreno nostro: **ALeRCE** (Förster et al., 2021) è il broker cileno che elabora il flusso
di alert di ZTF e si prepara per LSST. Due classificatori:

- **Stamp classifier** (Carrasco-Davis et al.): una rete convoluzionale sui ritagli di scienza,
  riferimento e differenza del *primo* rilevamento, progettata per sfruttare l'invarianza rotazionale.
  Classifica con una sola immagine.
- **Light curve classifier** (Sánchez-Sáez et al.): random forest bilanciato, a due livelli, su
  caratteristiche di variabilità e colori.

Hanno classificato dell'ordine di 10⁷ oggetti a partire da ~10⁸ alert.

`[Implicazione — ed è importante per questo team]` Il laboratorio ha persone che hanno costruito questo. Una
giuria lo nota. Ma il contributo differenziale non è mettere un classificatore nel visualizzatore: è la **disciplina
di classificazione in tempo reale** —soglie, falsi positivi, come si presenta a un umano un
candidato dubbio, come si raccoglie l'etichetta che dà quella persona. Quella disciplina applicata alla UI del
visualizzatore è qualcosa che nessun altro team dell'hackathon avrà. Vedi
[`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md).

---

## 4. Scienza partecipata: cosa la fa funzionare

Backyard Worlds, Cool Neighbors e Zooniverse hanno anni di apprendimento su questo, e la sfida
punta esplicitamente a quel pubblico.

Ciò che l'esperienza mostra:

- **Il compito deve essere uno solo e decidibile in secondi.** «Si muove qualcosa qui, sì o no?»
  Non «classifica questa sorgente».
- **Bisogna poter iniziare senza registrarsi né leggere nulla.** Un esempio precaricato nella schermata
  iniziale vale più di un tutorial.
- **La tracciabilità è il premio.** Che il volontario possa segnalare qualcosa, salvarlo e tornare a
  mostrarlo —con un URL— è ciò che trasforma la curiosità in scoperta.
- **Le scoperte si pubblicano con i nomi dei volontari.** Non è un dettaglio minore: è
  il motore della partecipazione.

`[Implicazione]` Da qui escono tre decisioni di prodotto: esempio precaricato all'apertura, risoluzione
dei nomi («Barnard's Star», non solo numeri) e **URL condivisibile con le coordinate**, che inoltre
è un punto elenco esplicito della sfida.

---

## 5. Planet X: a che punto è la ricerca oggi

La sfida si chiama «Planet X and SPHEREx» ma non chiede di cercare Planet X. Conviene comunque conoscere
lo stato reale per non dire una sciocchezza davanti a una giuria.

- L'ipotesi moderna è di **Batygin & Brown (2016)**, *Evidence for a Distant Giant Planet in the
  Solar System* (AJ 151, 22; arXiv:1601.05438): il raggruppamento orbitale di oggetti transnettuniani
  distanti si spiegherebbe con un pianeta di ≳10 masse terrestri su un'orbita eccentrica lontana.
- **Non è stato trovato.** A novembre 2026 resta non confermato.
- Il candidato più citato è quello di **Phan et al.**, che ha incrociato i survey infrarossi **IRAS** e
  **AKARI**, separati da 23 anni, e ha trovato un unico oggetto compatibile. Pubblicato su PASA. Gli
  stessi autori sottolineano di non aver scoperto Planet Nine; serve un follow-up.
- Esistono ricerche ottiche mirate per parallasse recenti che non hanno trovato candidati credibili nel
  campo coperto, e un lavoro del 2026 che restringe lo spazio delle orbite ammesse.

`[Implicazione]` La cornice onesta per il pitch: **la tecnica che ha trovato il candidato di Phan è
esattamente quella della sfida** —confrontare due survey infrarossi di tutto il cielo separati nel
tempo e cercare ciò che si è mosso—. SPHEREx fa questo ogni sei mesi, in 102 bande, e nessuno lo ha
esaminato a occhio. Quella frase è vera, è verificabile, ed è un aggancio migliore di qualsiasi promessa di
trovare un pianeta.

---

## 6. Modelli video (TimeSformer, VideoMAE, X-CLIP): dove si inseriscono davvero

Erano un suggerimento iniziale dell'ambiente del team e meritano una risposta chiara.

Cosa sono: architetture per **comprendere il video naturale**. **TimeSformer** (Bertasius et al., ICML 2021;
arXiv:2102.05095) e **ViViT** (Arnab et al., ICCV 2021; arXiv:2103.15691) applicano attenzione separata
in spazio e tempo su patch di fotogrammi. **VideoMAE** (Tong et al.; arXiv:2203.12602) e
**VideoMAE V2** (arXiv:2303.16727) si preaddestrano con autoencoder mascherati e mascheramento molto
aggressivo, il che li rende efficienti in dati. **X-CLIP** (Ni et al.; arXiv:2208.02816) estende CLIP
al video per il riconoscimento con descrizioni in linguaggio.

Perché **non** sono il nucleo di questo progetto:

1. **La sfida chiede un visualizzatore, non un classificatore.** Chi rileva è l'utente. Un modello video
   non risponde al testo.
2. **Sono preaddestrati con video naturale** (Kinetics, Something-Something): persone, oggetti,
   azioni. La statistica di una sequenza astronomica —sfondo quasi vuoto, sorgenti puntiformi, PSF,
   artefatti, uno spostamento di pochi pixel— non somiglia affatto. Il preaddestramento, che è
   tutto il loro valore, non si trasferisce bene.
3. **Non ci sono etichette.** Addestrare o mettere a punto in 24 ore senza un insieme etichettato non è realistico.
4. **Il caso è già ben risolto con metodi classici.** Lo shift-and-stack e la sottrazione di immagini
   sfruttano la fisica del problema (una traiettoria lineare, uno sfondo statico). Un transformer video
   dovrebbe imparare questo da zero, con meno dati.

Dove **sì** potrebbero inserirsi, se avanzasse tempo, ed è bene saperlo per rispondere alla giuria:

- Come **screening di candidati** su pile di ritagli già allineati: un piccolo classificatore
  addestrato con positivi sintetici (sorgenti iniettate con moto noto) e negativi reali.
  Qui il parallelo corretto non è TimeSformer, è lo **stamp classifier di ALeRCE**: una piccola rete,
  su ritagli, con invarianze scelte a mano. Più economica, più spiegabile e con persone del
  laboratorio che la conoscono.
- Come **embedding** per cercare «più sequenze simili a questa», che è una bella idea di UI.

**Riassunto per il pitch, se chiedono:** «L'abbiamo valutato. Il collo di bottiglia della sfida non è
riconoscere il movimento in un video, è portare e allineare i dati giusti e metterli davanti a una
persona. Dove l'IA contribuisce qui è nello screening dei candidati con piccole reti sui ritagli,
che è ciò che fa il broker ALeRCE, e lo lasciamo impostato.» Quella risposta è più forte che aver
inserito un modello che non contribuisce.

---

## 7. Dov'è la lacuna

Mettendo tutto insieme, ciò che **oggi non esiste** e sta in 24 ore:

> Un visualizzatore pubblico in cui l'utente inserisce una coordinata e vede **due assi insieme**: come cambia quella
> zona di cielo **nel tempo** (il blink di sempre, che è ciò che chiede la sfida) e come si
> vede **in ciascuna delle 102 lunghezze d'onda** (l'asse che WiseView non ha e che solo SPHEREx
> può dare), con lo spettro di ciò che si indica generato al volo.

Questo è al tempo stesso:

- La lettura letterale del testo (il visualizzatore con il video).
- I due punti più esigenti di *Potential Considerations* (le 102 bande e gli spettri al volo).
- Qualcosa che, per quanto abbiamo potuto verificare, nessuno strumento pubblico fa oggi per SPHEREx:
  il Data Explorer di IRSA è per astronomi, e WiseView è di un'altra missione e senza asse spettrale.

Gli altri punti —sottrazione di immagini, campo visivo regolabile, overlay di Gaia e WISE, URL
interrogabile, flag di contaminazione— sono extra a basso costo che si aggiungono in ordine di valore.
L'ordine è in [`05_PLAN_24H.md`](05_PLAN_24H.md).

---

## 8. Onestà su questo documento

Ciò che è scritto qui si appoggia a ricerche e alla documentazione ufficiale di IRSA consultata il 14
novembre 2026. I dati d'archivio (endpoint, release, struttura dei file) sono
verificati rispetto alla documentazione. I riferimenti bibliografici hanno il loro stato di verifica
segnato uno a uno in [`../biblio/README.md`](../biblio/README.md): **non citare da qui senza guardare
là**. Le affermazioni su cosa non esiste («nessuno strumento pubblico fa oggi…») sono nostre
e sono limitate da ciò che abbiamo cercato; se qualcuno trova il contrario, si corregge il documento.
