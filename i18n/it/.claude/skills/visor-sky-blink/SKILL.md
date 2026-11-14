---
name: visor-sky-blink
description: Come si costruisce il visore della sfida: Aladin Lite v3 con HiPS e il cubo di tutto il cielo di SPHEREx, il pannello di lampeggio (blink) di immagini per epoca, normalizzazione e stretching di immagini astronomiche (asinh, zscale, percentili), mappe di colore, sottrazione di immagini tra epoche, overlay di cataloghi come Gaia, e l'URL interrogabile con coordinate. Attivala quando lavori sul frontend del visore, quando decidi come mostrare immagini FITS nel browser, quando si menzionano Aladin, HiPS, blink, lampeggio, flipbook, stretching, stretch, zscale, colormap, canvas di immagini astronomiche, o quando progetti i controlli che l'utente manipola.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../../en/.claude/skills/visor-sky-blink/SKILL.md) · [Español](../../../../es/.claude/skills/visor-sky-blink/SKILL.md) · [中文](../../../../zh/.claude/skills/visor-sky-blink/SKILL.md) · [Deutsch](../../../../de/.claude/skills/visor-sky-blink/SKILL.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/skills/visor-sky-blink/SKILL.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Il visore: lampeggio e cielo nel browser

Quello che bisogna sapere per costruire la parte che la giuria guarda. Il documento con il contratto
dell'API è `docs/03_ARQUITECTURA.md`.

---

## 1. Due pezzi, non uno

| Pezzo | Cosa mostra | Come |
|---|---|---|
| **Contesto del cielo** | Dove siamo, cosa c'è intorno, le 102 bande | **Aladin Lite v3** su HiPS |
| **Pannello di lampeggio** | La stessa zona in epoche diverse, come un videino | `<canvas>` proprio su PNG del backend |

Stanno **fianco a fianco nella stessa schermata**. L'utente capisce subito che sono due assi dello stesso
dato: Aladin dà la lunghezza d'onda, il pannello dà il tempo.

---

## 2. Aladin Lite v3

Visore HiPS del CDS (Strasburgo). **L'enunciato stesso della sfida lo suggerisce.** Si può includere
tramite `<script>` o tramite npm.

Quello che risolve gratis e che non bisogna scrivere:

- Navigazione nel cielo, zoom e varie proiezioni (Aitoff, Mollweide, ortografica, Mercatore).
- Caricamento di HiPS da **qualsiasi server web**, incluso `localhost`, con `newImageSurvey` /
  `createImageSurvey`.
- **Tessere HiPS in FITS**, non solo JPEG.
- Overlay di cataloghi (Gaia, SIMBAD, VizieR) con un paio di righe.
- `getEmbedCode()` restituisce l'HTML del campo attuale — regalo per la voce dell'embed.
- `getViewDataURL()` esporta la vista in PNG/JPEG — utile per condividere e per la demo.

Documentazione: <https://aladin.cds.unistra.fr/AladinLite/doc/API>

### Il cubo HiPS di SPHEREx che funziona (verificato il 14 nov 2026)

- **URL:** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` (IRSA, DR1).
  CORS aperto. Si carica in Aladin Lite 3.8.2 (fissata in `package.json`) ed è in produzione.
- **Formato:** tessere **PNG**, ordine 5, pixel 12,9″, **102 piani** (uno per canale).
- **Regola dei piani:** `piano = 17·(banda − 1) + (canale − 1)`, con banda 1–6 e canale 1–17. Il canale
  centrale di ogni banda è `17·(b−1) + 8`. La λ esatta di ogni piano è in `properties`, chiave
  `data_cube_crval3_arr` (0,753–4,988 µm).
- **Piani vuoti:** il **50 e il 51** (taglio del dicroico tra D3 e D4). Quando si aggiunge il livello,
  Aladin lo lascia sul piano 50: bisogna impostare il piano dopo che il livello è pronto.
- **Suffisso delle tessere = piano:** con la banda 4 il browser richiede `Norder5/.../Npix11391_59.png`.
  Serve per verificare in `performance.getEntriesByType('resource')` quale piano si sta mostrando.
- **Come impostare un piano:** `ponerPlano` (in `planos.ts`) calcola la frequenza del centro del piano e
  chiama `setFrequency`; verificato nelle 6 bande (suffissi `_8 _25 _42 _59 _76 _93`).
  **Non usare `setSliceNumber`:** in 3.8.2 chiedere il 59 porta il 9. Per lo stesso motivo, il controllo dei cubi del
  menu dei livelli di Aladin (che usa `setSliceNumber`) probabilmente mostra un piano sbagliato (non
  verificato). Nemmeno `capa.getFrequency()` dà la λ reale: la λ esce da `properties` (`leerPlanos`).
- **Aladin richiede tessere solo se la scheda è visibile.** Con il pannello del browser nascosto non si vede
  nessuna tessera nuova: non è un guasto.
- **Cosa NON è:** un mosaico di **tutte le epoche** (non ha asse del tempo: non serve a mostrare
  movimento) e PNG già stirati (non hanno flussi: non serve per lo spettro). Il tempo e lo spettro
  escono dai file di livello 2 tramite il backend.
- **La versione FITS** dello stesso cubo che consegna SIA2 (`spherex_dr1_cube`) non serve né per Aladin né
  per i ritagli (~320 MB per tessera).
- **Piano B:** `CDS/P/SPHEREx/QR2/D1`…`D6` al CDS (versione precedente). Non verificato: alasky era
  fuori servizio il 14 nov.

### Come è montato nel codice (`scaffold/frontend/src/sky/`)

- `AladinView.tsx` crea Aladin e **non conosce il dettaglio dei livelli**: monta quelli di `capas/index.ts`
  (contratto `montar(aladin, ctx) → desmontar`; `ctx` porta ra, dec, size, epoca, on, onSelect) e li
  rimonta quando cambiano posizione, ritaglio o epoca. Props opzionali: `size`, `epoca` (anno giuliano,
  di default 2026,0), `onReady`, `onSelect`.
- **Aladin conserva UN solo listener per evento**: `aladin.on(e, fn)` sostituisce il precedente
  (`callbacksByEventName[g]=Q` in `dist/aladin.js`). Per questo i livelli si sottoscrivono con `ctx.on`
  (`eventos.ts`), che registra un dispatcher per evento. Non chiamare mai `aladin.on` da un livello.
- `planos.ts` (piano ↔ banda ↔ λ, `ponerPlano`), `LambdaSlider.tsx` (slider di λ),
  `propagacion.ts` (moto proprio, lineare, senza parallasse, in anni giuliani: J2000 = 2000,0,
  Gaia DR3 = 2016,0).
- Perché un livello si possa spegnere, dagli un nome: compare nel controllo dei livelli di Aladin.
- **CDS fuori servizio il 14 nov 2026:** `simbad.cds.unistra.fr` e `vizier.cds.unistra.fr` restituivano 404 senza
  CORS (per questo `A.catalogFromSimbad`, che chiama `simbad.cds.unistra.fr/cone`, quel giorno non funzionava). I
  mirror di Harvard rispondono con CORS: `vizier.cfa.harvard.edu/viz-bin/asu-tsv` (Gaia) e
  `simbad.cfa.harvard.edu/simbad/sim-tap/sync` (SIMBAD, lento: 2–18 s). I livelli provano entrambi.
- Gaia nei campi densi: con un tetto di 2000 stelle la mappa di Barnard restava coperta; si usano le 300
  più luminose.
- L'errore di console `ERR_BLOCKED_BY_CLIENT` / «Failed to fetch» da `tg.log` è il registro di utilizzo
  di Aladin: innocuo.

---

## 3. Il pannello di lampeggio

Questo sì va scritto. È semplice ed è ciò che si giudica.

**Non usare `<img>` che si sostituiscono.** Lampeggia male e si vede il salto di caricamento. Usa un `<canvas>`:
precarica tutti i fotogrammi in `Image` o `OffscreenCanvas`, e disegna quello che tocca con
`requestAnimationFrame`.

Controlli minimi, in ordine di importanza:

| Controllo | Perché | Intervallo utile |
|---|---|---|
| **Play / pausa** | Ovvio e necessario | |
| **Velocità (fps)** | WiseView dimostra che è decisiva. Lento si vede il movimento, veloce si vede la variabilità | 0,5 – 10 fps |
| **Passo-passo** | Per confermare ciò che si crede di vedere | ← → |
| **Stretching** | **Senza questo non si vede niente.** Sezione 4 | asinh di default |
| **Mappa di colore** | Grigio per rilevare, colore per presentare | gray, viridis, magma |
| **Banda** | L'asse che solo SPHEREx dà | 1–6 |
| **Campo visivo** | Voce esplicita della sfida | 0,02° – 0,5° |
| **Modalità** | raw / zodi sottratto / differenza | |

Su ogni fotogramma, sovrimpressi: **data e lunghezza d'onda**. La λ non è un ornamento: spiega perché
la luminosità cambia tra fotogrammi (vedi skill `spherex-datos`) e dimostra alla giuria che il team
capisce lo strumento.

---

## 4. Stretching: perché un'immagine astronomica non si vede

Un'immagine del cielo ha un enorme intervallo dinamico e la maggior parte dei pixel è fondo.
Mappata linearmente su 0–255 appare **nera con tre punti bianchi**. Questo sorprende ogni
sviluppatore web la prima volta.

Quello che bisogna applicare, in ordine:

1. **Clipping per percentili**, non per minimo e massimo. Un solo pixel caldo rovina la scala.
   `vmin, vmax = percentil(1), percentil(99.5)` è un punto di partenza ragionevole.
2. **Una funzione non lineare**: `asinh` è il miglior valore di default per immagini astronomiche (conserva
   il dettaglio debole senza saturare ciò che è luminoso). Anche `sqrt` e `log` vanno bene; `linear` quasi mai.
3. **`zscale`** è l'algoritmo classico di DS9 per scegliere automaticamente i limiti. È in
   `astropy.visualization.ZScaleInterval`. Per un utente non esperto di solito è l'opzione migliore.

`astropy.visualization` ha tutto questo risolto: `ZScaleInterval`, `PercentileInterval`,
`AsinhStretch`, `ImageNormalize`. **Non reimplementarlo.**

### La decisione che conta: chi fa lo stretching?

**Il backend.** Restituisce PNG già renderizzati. Mandare FITS al browser obbliga a scrivere un lettore di
FITS in JavaScript, applicare a mano lo stretching e la mappa di colore: il doppio del lavoro e il
triplo degli errori, in un hackathon.

Il costo è che cambiare lo stretching richiede di tornare al server. Con la cache è economico. Se avanza
tempo, si può aggiungere una regolazione fine di luminosità e contrasto sul client con filtri CSS sul
PNG, che copre l'80 % dell'uso.

### La chiave perché il lampeggio sia leggibile

**Tutti i fotogrammi di una sequenza si normalizzano con gli STESSI `vmin`/`vmax`.** Se ciascuno viene
stirato per conto suo, tutto lampeggia e non si distingue il movimento reale da un cambio di scala.
Calcola i limiti sull'intera pila e applicali a ogni fotogramma.

Eccezione: se la λ varia molto tra epoche, i livelli sono fisicamente diversi e la normalizzazione
comune può lasciare fotogrammi neri. È la tensione centrale del progetto. Soluzione pratica: raggruppare
prima per banda, e lasciare all'utente un interruttore «scala comune / scala per fotogramma».

---

## 5. Sottrazione di immagini

Voce esplicita della sfida e, in rapporto valore/sforzo, il meglio del progetto.

- `diff_first` — ogni fotogramma meno il primo. Ciò che non è cambiato va a zero; ciò che si è mosso
  appare come una **coppia di lobi, uno positivo e uno negativo**. Visivamente spettacolare.
- `diff_prev` — ogni fotogramma meno il precedente. Utile per la variabilità.

Per la differenza usa una mappa di colore **divergente** centrata sullo zero (blu-bianco-rosso), non una
scala sequenziale. Il segno è l'informazione.

Precauzione onesta: una sottrazione corretta richiede che le immagini siano ben allineate e con la stessa
PSF. Noi sottraiamo ritagli riproiettati su una griglia comune; è un'**approssimazione visiva**, non
fotometria differenziale. Dirlo nell'interfaccia.

---

## 6. Overlay di Gaia: il controllo di qualità che si vede

Disegnare sull'immagine le posizioni che Gaia DR3 prevede per le stelle alla data di quella
epoca (posizione di catalogo + moto proprio × tempo trascorso).

Serve a due cose:

1. **Soddisfa una voce della sfida.**
2. **Dimostra che il visore è corretto.** Se i marcatori cadono sulle sorgenti, il WCS, le
   date e il ritaglio sono a posto. È la risposta visiva a «come so che questa immagine è della
   coordinata che ho chiesto?».

In Aladin Lite si fa con un livello di catalogo. Per il pannello di lampeggio bisogna proiettare le
coordinate in pixel con il WCS del ritaglio.

**Epoca di riferimento:** Gaia DR3 dà posizioni al **2016,0**, non a J2000; SIMBAD dà J2000. Propagare
dall'epoca che corrisponde a ciascun catalogo. Con moti propri di vari ″/anno, un errore di
epoca sposta il segno di decine di secondi d'arco: al 2026, WISE 0855 è a 212″ e Barnard a 270″ dalla
sua posizione J2000.

---

## 7. L'URL fa parte del prodotto

La sfida lo chiede e sono mezz'ora di lavoro:

```
/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
/?target=WISE+0855&size=0.2
```

- `target` ha priorità su `ra`/`dec`.
- **L'URL si aggiorna con lo stato attuale** (`history.replaceState`), così copiare la barra degli
  indirizzi equivale a condividere esattamente ciò che si sta vedendo.
- Un pulsante «copia link» visibile.

Questo è ciò che ha trasformato WiseView in infrastruttura di altri progetti: terze parti hanno costruito
pacchetti sopra la sua API. Un visore condivisibile smette di essere una demo.

---

## 8. La prima cosa che vede l'utente

Il pubblico target della sfida è **chiunque**, non un astronomo.

- **Un esempio precaricato all'apertura.** Nessuno dovrebbe vedere una casella vuota. Che WISE 0855 sia già
  in lampeggio al caricamento della pagina.
- **Pulsanti dei cinque campi di prova.** Un clic, risultato immediato, cache calda.
- **Accettare nomi, non solo numeri.** «Barnard's Star» deve funzionare.
- **Accettare sessagesimale e gradi.** Vedi skill `coordenadas-astro`.
- **Stato vuoto utile.** Se non ci sono dati: dire quante epoche ci sono (zero), perché può essere, e
  offrire un campo vicino che ne abbia. La giuria scriverà coordinate a caso.
- **Stato di caricamento onesto.** «Richiesta di 14 epoche a IRSA… 6 pronte». Mai uno spinner muto: i
  cutout sono lenti.
