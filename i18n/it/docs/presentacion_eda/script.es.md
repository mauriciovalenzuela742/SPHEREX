---
title: "Cosa ci hanno detto i dati di SPHEREx"
author: Team SPHEREx · NASA Space Apps 2026
date: 2026-11-14
place: Santiago
profile: night
lang: es
transition: fade
audience: Il team dell'hackathon (6 persone). Una componente senza esperienza in astronomia, un informatico, gli altri con astronomia.
message: Le stelle più veloci si muovono di 1–2 pixel in un anno di SPHEREx; lo rendiamo visibile uniformando la lunghezza d'onda, allineando e sottraendo.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/docs/presentacion_eda/script.es.md) · [Español](../../../es/docs/presentacion_eda/script.es.md) · [中文](../../../zh/docs/presentacion_eda/script.es.md) · [Deutsch](../../../de/docs/presentacion_eda/script.es.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/presentacion_eda/script.es.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

<!-- Todas las cifras salen de docs/09_EDA_HALLAZGOS.md y eda/resultados/. Las imágenes son recortes reales de
     IRSA, procesados por figures/make_figures.py. Los valores de animations.js se copiaron de su salida. -->

## Cosa ci hanno detto i dati di SPHEREx
@type cover
@class full
@anim portada
@subtitle EDA con dati reali di IRSA · 14 novembre 2026
> L'immagine a destra è reale: la nana bruna Epsilon Indi B in cinque foto di SPHEREx, dal 2025 al 2026. Alla fine dell'intervento vedremo che si muove proprio quanto deve muoversi.
@why La copertina mostra già il dato reale che l'intervento spiega: il blink di un oggetto che si muove.

## L'idea della sfida: confrontare foto dello stesso cielo in date diverse
@kicker L'idea
@class full
@anim idea
@steps 1
@source Schema, non dati reali. Così fu scoperto Plutone nel 1930 e così lavorano i volontari di Backyard Worlds.
> Prima il blink: due foto dello stesso pezzo di cielo, alternate. Quasi tutto resta fermo; una stella salta. Poi la sottrazione: ciò che non cambia sparisce e ciò che si è mosso lascia una coppia, rossa dove è ora e blu dove era.
@why Il metodo si spiega con uno schema prima dei dati reali, per chi non conosce il problema. Blink e sottrazione sono le due viste del visore.

## SPHEREx guarda nell'infrarosso, oltre il rosso, con 6 rivelatori
@kicker Lo strumento
@figure figures/bandas.svg
@source Intervalli per rivelatore: documentazione di IRSA (docs/02_DATOS_SPHEREX.md §1). Un micrometro (µm) è un millesimo di millimetro.
> L'occhio vede tra 0,4 e 0,75 micrometri. SPHEREx comincia dove finisce il rosso e arriva a 5. Lo divide in 6 rivelatori, da D1 a D6. Le nane brune, fredde, brillano soprattutto nei rivelatori lunghi.
@why Colloca il pubblico senza astronomia: infrarosso è «oltre il rosso», e i sei rivelatori sono l'unità con cui si lavora dopo.

## Il trucco di SPHEREx: il colore che misura cambia lungo il rivelatore
@kicker Il filtro lineare variabile
@class full
@anim lvf
@steps 5
@source Schema. Intervallo reale del rivelatore 5 (3,82–4,44 µm) secondo la tabella WCS-WAVE; i punti dello spettro sono illustrativi.
> Ogni striscia del rivelatore misura un colore diverso. La navicella punta di nuovo e la stella cade in un'altra striscia: viene misurata in un altro colore. Mettendo insieme le foto si costruisce il suo spettro. Ma questo significa che due foto della stessa stella quasi mai sono nello stesso colore.
@why È una trasformazione (il rivelatore si sposta e il punto cambia colore) e una figura statica non la racconta: soddisfa le quattro condizioni per animare.

## Per ogni stella ci sono centinaia di foto, in 3 o 4 passate di un anno
@kicker Quanti dati ci sono
@figure figures/cobertura.svg
@source Query SIA2 a spherex_dr1 e spherex_qr3 (eda/resultados/inventario.json). R Dra ha inoltre 1.966 file in campi profondi, non disegnati.
> Ogni punto è un file. Si vedono le passate: SPHEREx passa per ogni zona ogni sei mesi e, a ogni passaggio, scatta decine di foto nell'arco di alcune settimane. La base temporale va da 1 a 1,4 anni.
@why Piccoli multipli sullo stesso asse del tempo: i cinque campi si confrontano a colpo d'occhio.

## Ma ogni foto è in un altro colore: bisogna scegliere quelle che coincidono
@kicker Primo problema
@figure figures/lambda_wise.svg
@source WISE 0855, rivelatore 5: colore in cui è finito l'oggetto in ciascun file, calcolato con l'header di ogni file e la tabella WCS-WAVE (eda/resultados/lambda_por_archivo.csv).
> Se prendiamo la prima foto di ogni passata, il colore salta di quasi mezzo micrometro: la luminosità cambierebbe senza che accada nulla. Ma ogni colore si ripete ogni sei mesi, quindi possiamo scegliere foto dello stesso colore: la variazione scende a 0,035 micrometri.
@why L'accento va alla selezione buona; quella cattiva va in rosso e ciò che è contesto in grigio.

## Il rivelatore ruota di 180° tra una passata e l'altra: prima di confrontare bisogna allineare
@kicker Secondo problema
@class full
@anim giro
@steps 1
@source Due ritagli reali di Barnard (D2) non allineati. Angolo del rivelatore sul cielo letto dall'header: −179,6° e +1,1°.
> Le due foto sono dello stesso pezzo di cielo, ma quella di destra è capovolta. Ruotandola di 180°, le stesse stelle coincidono. Nel codice questo si fa riproiettando tutto su una griglia con il nord in alto.
@why Ruotare è una trasformazione: vederla ruotare convince più di due immagini con una freccia.

## Allineate e allo stesso colore, Epsilon Indi B si muove proprio quanto prevede il catalogo
@kicker Il risultato
@class full
@anim epsind
@steps 1
@source Centroidi nella prima e nell'ultima foto (2025,31 e 2026,74), riproiettate sulla stessa griglia (eda/resultados/centroides.json). Previsione: moto proprio di SIMBAD. Ingrandito: 18×18 pixel da 6,15″.
> Il cerchio è dove il catalogo dice che dovrebbe trovarsi in ogni data. Si sposta verso sinistra e in basso, che nel cielo è est e sud. Abbiamo misurato 0,85 e 0,71 pixel; il catalogo prevede 0,92 e 0,57. Le stelle intorno, che non si muovono, si spostano meno di 0,4.
@why Dati reali prima della regola, e la verifica numerica nella stessa diapositiva dell'immagine.

## La sottrazione trasforma il movimento in una coppia rossa e blu, ma una stella satura inganna
@kicker La sottrazione
@class full
@anim restas
@steps 2
@source Sottrazione ultima − prima, normalizzata. Nucleo segnato come cattivo: Barnard 44 di 49 pixel, RW Aur 6–8, eps Ind B 0–1 (eda/resultados/centroides.json).
> Epsilon Indi B: la coppia rosso-blu è movimento reale. Barnard: si muove anch'essa, verso nord, ma è satura e non si può misurare. RW Aur non si muove e lascia comunque una coppia: è l'effetto della saturazione. Il visore deve avvisare quando un oggetto satura.
@why Si rivela un pannello per passo (segmentazione) per confrontare i tre casi con lo stesso codice colore.

## WISE 0855 quasi non si vede in una sola foto: per mostrarla bisogna sommare
@kicker Un caso difficile
@class full
@anim wise
@source Quattro ritagli reali di WISE 0855 nel rivelatore 5 alla stessa λ (4,15–4,18 µm). Il cerchio è la posizione prevista.
> L'oggetto che propone l'enunciato è troppo debole per una singola esposizione. La soluzione è sommare le foto di ogni passata, che è proprio una delle idee suggerite dalla sfida.
@why Una diapositiva ferma dopo quelle animate: qui si apre la discussione su cosa mostrare nella demo.

## Ogni ritaglio impiega 7 secondi e il browser non può richiederlo: tutto passa per un backend con cache
@kicker Per il codice
@figure figures/latencia.svg
@source 25 ritagli da 0,1° (eda/resultados/latencia_cutouts.json): mediana 7,3 s, massimo 29 s, ~3,9 MB ciascuno. IRSA non risponde con CORS (eda/resultados/infraestructura.json).
> Il ritaglio pesa uguale che sia piccolo o grande, perché porta intera la descrizione dell'immagine della stella. Ci sono stati errori 503. E IRSA non lascia che una pagina web le chieda dati direttamente. Conclusione: backend, cache su disco e preriscaldare i campi della demo.
@why La distribuzione completa, non solo la mediana: si vede la coda di 29 s che farebbe cadere una demo dal vivo.

## La maschera di qualità: il bit SOURCE non è un errore
@kicker Filtri
@figure figures/flags.svg
@source Bit di FLAGS in 25 ritagli. I nomi sono nell'header stesso dell'estensione FLAGS.
> Se filtriamo «tutto ciò che ha un qualche bit», cancelliamo il 72 % dell'immagine, perché SOURCE dice solo che lì c'è una stella. I bit che indicano davvero un pixel cattivo sommano circa il 4 %.
@why L'accento blu segna il caso che non è un errore; in rosso i bit che invalidano un pixel.

## Sette pezzi da un capo all'altro, ciascuno con il suo responsabile
@kicker La ripartizione
@class full
@anim flujo
@steps 1
@source Ripartizione del piano del team (README §3, docs/05_PLAN_24H.md); compiti dell'EDA per ruolo in docs/10_REPARTO_DE_TRABAJO.md.
> Prima il percorso dei dati, dalla coordinata all'immagine sullo schermo. Poi chi prende ogni pezzo, secondo il piano già concordato: l'EDA carica più lavoro su D2, che riceve la selezione per λ, i filtri e le sottrazioni.
@why La ripartizione si legge sul flusso dei dati: ciascuno vede dove si inserisce il suo pezzo e con chi si collega.

## Ciò che ancora non sappiamo
@kicker Da discutere
- **Come appare nel cubo un oggetto che si muove?** Il cubo HiPS che carica Aladin mescola tutte le epoche.
- **Quanto migliora WISE 0855 sommando** le foto di una passata?
- **Cosa fa il visore con le stelle sature?** Avvisare, mostrare la maschera o cambiare rivelatore.
- **La luminosità:** non abbiamo ancora misurato la variabilità di RW Aur né di R Dra.
@source docs/09_EDA_HALLAZGOS.md §7.
> Da ricordare: le stelle più veloci si muovono di uno o due pixel in un anno; lo rendiamo visibile uniformando il colore, allineando e sottraendo.
@why Chiusura con ciò che è aperto e il messaggio, non con un «grazie».

## Fonti
@appendix
- Dati: IRSA/IPAC, collezioni SIA2 spherex_dr1 e spherex_qr3, consultate il 14 nov 2026.
- Moti propri: SIMBAD (specchio CfA), in data/campos_de_prueba.yml.
- Script: eda/01_inventario.py a eda/05_centroides.py; figure: docs/presentacion_eda/figures/make_figures.py.
- Attribuzione: This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
@why Dove vive ogni cifra, per ricalcolarla.
