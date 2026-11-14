<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/03_ARQUITECTURA.md) · [Español](../../es/docs/03_ARQUITECTURA.md) · [中文](../../zh/docs/03_ARQUITECTURA.md) · [Deutsch](../../de/docs/03_ARQUITECTURA.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/03_ARQUITECTURA.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 03 — Architettura

Proposta di architettura e, soprattutto, **il contratto dell'API**, che è ciò che permette a
frontend e backend di avanzare in parallelo dall'ora 1.

Questa è una proposta pre-evento. Si conferma o si corregge all'ora 1 con i dati reali
(vedi la checklist alla fine di [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)) e viene registrata in
[`adr/ADR-001-stack.md`](adr/ADR-001-stack.md).

---

## 1. Due vie, e bisogna averle entrambe

Il progetto ha un cammino rapido e uno completo. **La chiave è che quello rapido esiste davvero**,
grazie al fatto che il cubo di tutto il cielo di DR1 è pubblicato in formato HiPS.

### Via A — «il cielo in 102 colori», senza backend

Aladin Lite carica direttamente il cubo HiPS di SPHEREx DR1 servito da IRSA. L'utente naviga il
cielo e muove un cursore di lunghezza d'onda. **Zero backend.**

- **Cosa dà:** le 102 bande, contesto di tutto il cielo, overlay di Gaia e dei cataloghi del CDS.
- **Cosa non dà:** l'asse del tempo. Il cubo è un mosaico combinato, non una serie di epoche.
- **Costo:** ore, non giorni. Rischio tecnico basso.
- **Rischio risolto (14 nov):** l'HiPS di IRSA (`/data/hips/SPHEREx/spherex_allsky_cube`, PNG, 102 piani, il 50 e il 51 vuoti) si carica in Aladin Lite 3.8.2 con CORS aperto (`09_EDA_HALLAZGOS.md` §6). Il piano B del CDS (`alasky.cds.unistra.fr`) non si è potuto verificare: quel giorno restituiva 404.

### Via B — il blink temporale, con backend

È la sfida vera e propria. Il backend interroga SIA2 per posizione, richiede i cutout di ogni epoca,
li raggruppa per banda, li normalizza e restituisce una sequenza di fotogrammi ordinata nel tempo.

- **Cosa dà:** il video. Ciò che viene giudicato.
- **Costo:** è la parte più grossa del lavoro.
- **Collo di bottiglia:** la latenza dei cutout. Senza cache, la demo non sopravvive.

**Le due vie si montano sulla stessa schermata.** Aladin Lite dà il contesto e la navigazione; un pannello
accanto dà il blink temporale del ritaglio. L'utente capisce subito che sono due assi dello stesso dato.

---

## 2. Diagramma

```
                   ┌───────────────────────────────────────────────┐
  Usuario ───────► │  FRONTEND  (React + Vite + TS)                │
  "Barnard's Star" │                                               │
  o  RA/Dec        │  ┌─────────────────┐  ┌────────────────────┐  │
                   │  │  Aladin Lite v3 │  │  Panel de blink    │  │
                   │  │  contexto +     │  │  <canvas>          │  │
                   │  │  cubo HiPS +    │  │  play/pausa, fps,  │  │
                   │  │  overlay Gaia   │  │  estiramiento,     │  │
                   │  └────────┬────────┘  │  color, resta      │  │
                   │           │           └─────────┬──────────┘  │
                   └───────────┼─────────────────────┼─────────────┘
                   VÍA A       │                     │  VÍA B
                   (directo)   │                     │
                               ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────────────┐
                 │  IRSA  HiPS cube │   │  BACKEND (FastAPI)       │
                 │  (DR1, Norder5)  │   │                          │
                 └──────────────────┘   │  /resolve  /epochs       │
                                        │  /frames   /spectrum     │
                                        │            /health       │
                                        │        │                 │
                                        │        ▼                 │
                                        │  ┌──────────────┐        │
                                        │  │ caché disco  │        │
                                        │  └──────┬───────┘        │
                                        └─────────┼────────────────┘
                                                  ▼
                        ┌──────────────────────────────────────────┐
                        │  IRSA:  SIA2  +  servicio de cutouts     │
                        │  CDS:   SIMBAD (nombres), HiPS, Gaia     │
                        └──────────────────────────────────────────┘
```

---

## 3. Contratto dell'API

**Questa è l'unica cosa che il frontend può dare per certa.** Qualsiasi cambiamento si discute, si scrive
prima qui e si avvisa il team. Finché il backend non esiste, il frontend lavora contro un mock
che restituisce esattamente queste forme.

Tutte le coordinate sono in **gradi decimali**, ICRS. Tutte le dimensioni in **gradi**. Tutte le
date in **ISO 8601 UTC**.

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "irsa_reachable": true, "cache_entries": 128 }
```

> **Nota (14 nov):** lo scheletro del backend espone oggi `/health` (senza `/api`) e risponde `{ "ok": true }`. Se passa a `/api/health` lo decide D1.

### `GET /api/resolve?q=<texto>`

Risolve un nome in coordinate (tramite SIMBAD). Rende lo strumento utilizzabile da chiunque.

```json
{
  "query": "Barnard's Star",
  "resolved": true,
  "name": "V2500 Oph",
  "ra": 269.4521,
  "dec": 4.6933,
  "source": "SIMBAD"
}
```

Se non risolve: `{"query": "...", "resolved": false, "error": "not found"}` con HTTP 200.
**Un nome non trovato non è un errore del server.**

### `GET /api/epochs?ra=&dec=&size=&collections=`

Quali osservazioni esistono per quella posizione. È la query economica: **non scarica immagini**.
Serve perché l'interfaccia mostri subito «ci sono 14 epoche tra maggio 2025 e ottobre 2026»
mentre i fotogrammi vengono preparati.

`collections` di default: `spherex_dr1,spherex_qr3`.

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1,
  "n_epochs": 14,
  "time_range": ["2025-05-12T03:11:00Z", "2026-10-02T19:40:00Z"],
  "bands_available": [1, 2, 3, 4, 5, 6],
  "epochs": [
    {
      "id": "2025W19_2B_0073_2D3",
      "t": "2025-05-12T03:11:00Z",
      "band": 3,
      "detector": 3,
      "collection": "spherex_qr3",
      "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/...fits"
    }
  ]
}
```

### `GET /api/frames?ra=&dec=&size=&band=&stretch=&cmap=&mode=`

Il cuore. Restituisce i fotogrammi pronti da disegnare.

| Parametro | Valori | Predefinito |
|---|---|---|
| `band` | `1`–`6`, o `all` | `4` |
| `size` | gradi | `0.1` |
| `stretch` | `linear`, `sqrt`, `log`, `asinh`, `zscale` | `asinh` |
| `cmap` | `gray`, `viridis`, `magma`, `inferno` | `gray` |
| `mode` | `raw`, `zodi_subtracted`, `diff_first`, `diff_prev` | `zodi_subtracted` |

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1, "band": 4, "mode": "zodi_subtracted",
  "pixel_scale_arcsec": 6.15,
  "wcs": { "crval1": 133.7951, "crval2": -7.2452, "cdelt1": -0.0017, "cdelt2": 0.0017 },
  "n_frames": 9,
  "frames": [
    {
      "t": "2025-05-12T03:11:00Z",
      "epoch_id": "2025W19_2B_0073_2D3",
      "wavelength_um": 3.41,
      "bandwidth_um": 0.031,
      "png": "/static/cache/ab12cd/0001.png",
      "flagged_fraction": 0.04,
      "vmin": -0.8, "vmax": 12.3
    }
  ],
  "warnings": ["La época 2026W02_1A no trae banda 4 y se omitió."]
}
```

Decisioni del contratto, e perché:

- **Il backend restituisce PNG già renderizzati, non FITS.** Mandare FITS al browser obbliga a scrivere un
  lettore FITS, ad applicare lo stiramento e la mappa di colore in JavaScript: è il doppio del lavoro e
  il triplo dei bug. Il costo è che cambiare lo stiramento richiede di tornare al server; con la cache è
  economico, e si può aggiungere dopo uno stiramento fine nel client sul PNG.
- **`wavelength_um` per fotogramma è obbligatorio.** È il campo che impedisce l'errore descritto in
  [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2 e, mostrato a schermo, dimostra alla giuria che
  abbiamo capito lo strumento.
- **`warnings` è un array, non un errore.** Mancano bande di continuo; se questo rompe la richiesta,
  lo strumento non funziona.
- **`flagged_fraction`** copre il punto elenco dei *contamination flags* con un campo. (Misurato: con maschera per bit è ~4 % del ritaglio; contare `FLAGS != 0` darebbe ~72 %, perché il bit SOURCE non è un errore; `09_EDA_HALLAZGOS.md`.)

### `GET /api/spectrum?ra=&dec=&aperture=`

L'«extra kudos». Spettro di una posizione, al volo.

```json
{
  "ra": 133.7951, "dec": -7.2452, "aperture_arcsec": 12,
  "n_points": 87,
  "spectrum": [ { "wavelength_um": 0.78, "flux_mjy": 0.42, "err_mjy": 0.08, "band": 1 } ],
  "method": "aperture photometry, zodi-subtracted",
  "caveat": "Valores indicativos, no fotometría científica. Ver docs/02."
}
```

Il campo `caveat` **non è opzionale**. Presentare uno spettro approssimato come se fosse fotometria
calibrata davanti a una giuria con astronomi è il modo più rapido di perdere credibilità.

---

### Cambiamenti al contratto — 14 nov 2026 (lavagna del visualizzatore)

Additivi: nulla di quanto sopra cambia di forma, quindi il mock e il codice esistenti restano validi.

- **`from` e `to`** (ISO 8601 UTC, opzionali) in `/api/epochs` e `/api/frames`: il controllo «da – a»
  della lavagna. Senza di essi, tutte le epoche.
- **Animazione centrata su una stella** (clic sull'immagine): non c'è un nuovo endpoint. Il frontend chiama
  `/api/frames` con `ra`/`dec` della stella e un `size` piccolo (p. es. `0.02`).
- **Fumetto con il nome al passaggio su una stella:** `/api/resolve` accetta anche `ra`/`dec`
  (ricerca a cono in SIMBAD, raggio 10″) e restituisce l'oggetto più vicino con la stessa forma di risposta. **Nota (14 nov):** oggi il visualizzatore interroga SIMBAD direttamente dal browser (TAP, prima il CDS e il mirror di Harvard come riserva; `scaffold/frontend/src/sky/capas/simbad.ts`), non tramite `/api/resolve`.
- **Gamma:** si applica nel client sul PNG; non viaggia al server.
- **Precalcolato per Vercel:** i 5 campi di prova si pubblicano come file statici con esattamente
  queste stesse forme JSON, in `/precalc/<id>/epochs.json`, `/precalc/<id>/frames-b<band>.json` e i loro PNG.

## 4. URL dell'applicazione

La sfida chiede esplicitamente di poter interrogare lo strumento tramite URL. Il formato fa parte del
contratto:

```
https://<dominio>/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
https://<dominio>/?target=WISE+0855&size=0.2
```

Regole: `target` ha priorità su `ra`/`dec`; ogni parametro assente prende il valore predefinito;
**l'URL riflette sempre lo stato attuale del visualizzatore** (si aggiorna con `history.replaceState`), così
che copiare la barra degli indirizzi equivalga a condividere esattamente ciò che si sta vedendo. Questa è la
funzionalità che trasforma lo strumento in infrastruttura per altri progetti, come accadde con WiseView.

---

## 5. Cache

Senza cache non c'è demo. È il pezzo meno appariscente e il più importante.

- **Chiave:** hash di `(ra, dec, size, band, mode, stretch, cmap)` arrotondando le coordinate a ~1 arcsec.
- **Cosa si salva:** i PNG renderizzati e il JSON della risposta. Opzionalmente i cutout FITS.
- **Dove:** `data/cache/` su disco. Durante l'evento basta e avanza; Redis solo se serve condividere tra processi.
- **Preriscaldamento:** **i cinque campi di prova si preriscaldano all'avvio del server.** La demo
  davanti alla giuria usa quei cinque. Non si dimostra mai con una query a freddo.
- **TTL:** non serve far scadere nulla in 24 ore. Non si costruisce ciò che non serve.

---

## 6. Deploy

La sfida dice «public-facing web tool». Un URL che la giuria possa aprire vale più di qualsiasi
diapositiva.

- **Frontend:** build statica su qualsiasi CDN (Vercel, Netlify, GitHub Pages).
- **Backend:** container su un servizio con piano gratuito. **Attenzione a quelli che mettono a dormire il
  container per inattività**: se la giuria apre l'URL e aspetta 50 secondi, è perduta. Da qui
  il preriscaldamento e, se serve, un ping periodico.
- **Piano B obbligatorio:** video della demo registrato e una modalità dell'applicazione che funzioni con dati
  in cache senza toccare IRSA. **Il wifi di un hackathon cade.** Vedi [`07_RIESGOS.md`](07_RIESGOS.md).

---

## 7. Ciò che deliberatamente non faremo

Scritto in anticipo perché alle 4 di notte nessuno lo riapra:

- **Non scriveremo il nostro visualizzatore di cielo.** Aladin Lite esiste ed è citato dalla sfida.
- **Non implementeremo shift-and-stack.** Vedi [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §3.
- **Non addestreremo un modello video.** Idem, §6.
- **Non faremo fotometria di qualità scientifica.** Per quello c'è la Spectrophotometry Tool di IRSA.
- **Non monteremo account utente.** Se serve salvare un risultato, si salva come URL.
- **Non rielaboreremo nulla di livello 1.** Partiamo dal livello 2, che è ciò che è pubblicato.


---

## In attesa di accordo del team (14 nov)

Proposte che emergono dalla revisione della documentazione ([`REVISION_DOCUMENTACION_2026-11-14.md`](REVISION_DOCUMENTACION_2026-11-14.md)) e dai dati misurati nell'EDA. **Non cambiano il contratto vigente** qui sopra: si applicano solo quando il team lo concorda (README §5, regola 4).

1. **Nomi dei filtri di data.** Il contratto dice `from` e `to`; il prototipo del branch `d/prototipo-rango-fechas` usa `start` e `end`. Accordarsi su uno.
2. **Nuove rotte del prototipo.** `/api/grid` (visite per banda e colonna di data), `/api/frame` (un fotogramma per visita) e `/api/presets` (i 5 campi con la posizione propagata) esistono in quel branch e non figurano qui. `docs/10` cita già `/api/presets`.
3. **Richiedere λ uniformata e somma per passata.** `/api/frames` non ha modo di richiedere epoche a λ uniformata né la somma delle esposizioni per passata; l'EDA conclude che l'unità naturale del video è la passata (3-4 fotogrammi) e che bisogna uniformare λ (`09_EDA_HALLAZGOS.md` §2).
4. **Collezioni predefinite.** `collections=spherex_dr1,spherex_qr3` lascia quasi senza dati R Dra, che sta soprattutto nei `_deep` (1.233 + 733 file contro 422 + 126 normali; `09_EDA_HALLAZGOS.md` §1).
5. **Cache su disco rispetto a Vercel.** Vercel Functions non ha disco persistente; se `/api` gira lì, la cache (`data/cache/`) deve essere in memoria o su archiviazione esterna (ADR-001, aggiornamento 14 nov).
6. **Maschera di contaminazione.** Documentare nel contratto che `flagged_fraction` si calcola con maschera per bit e mai con `FLAGS != 0`.
