<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/prototipos/rango_fechas/README.md) · [Español](../../../es/prototipos/rango_fechas/README.md) · [中文](../../../zh/prototipos/rango_fechas/README.md) · [Deutsch](../../../de/prototipos/rango_fechas/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `prototipos/rango_fechas/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Prototipo: cosa si è mosso tra due date?

Prototipo isolato (non tocca `scaffold/` né il contratto di `docs/03`). Dato un punto del cielo, una banda e un
**intervallo di date**, chiede a IRSA **solo i ritagli necessari** (un'immagine per visita, opzionalmente la somma di
più esposizioni della visita), li allinea con il nord in alto e mostra:

- **Blink** tra le visite, con data e lunghezza d'onda di ogni fotogramma.
- **Sottrazione ultima − prima**: rosso = luminosità che compare, blu = luminosità che c'era. Una coppia rosso/blu = movimento.
- **Composizione a colori**: prima in rosso, ultima in ciano.
- Tabella con l'osservazione, la collezione, la λ al centro e la % di pixel con contaminazione (FLAGS).

Inoltre, `eda_spherex.ipynb` è un'**analisi esplorativa** dei dati: inventario, anatomia di un ritaglio,
effetto del filtro lineare variabile, sequenza e sottrazioni, e verifica del movimento rispetto al moto proprio.

## Come eseguirlo

Dalla radice del repo:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
# abrir http://localhost:8010
```

Notebook: aprire `prototipos/rango_fechas/eda_spherex.ipynb` con il kernel del `.venv` e cambiare `CAMPO`.

I ritagli restano in `data/cache/prototipo/` (ignorato da git). Non si scarica nulla per intero.

## Esploratore (`/explorar`)

Aprire http://localhost:8010/explorar.

- **Immagine grande** a sinistra (quadrata, la più grande che ci stia) e **barra a destra** con i filtri
  (oggetto, RA/Dec, dal–al, bande, campo, esposizioni per visita), la banda visibile, la modalità
  (immagine · sottrazione vs t₀ · colore), i dati dell'immagine e miniature di tutte le bande e date.
- **Puntatore del tempo** sotto l'immagine: le visite sono alla loro data reale. Basta passare il mouse (o trascinare)
  per cambiare la data; ←/→ visite, ↑/↓ bande, spazio riproduce. Accanto alla data si vedono Δt da t₀ e la λ.
- **Caricamento progressivo:** prima le visite (`/api/grid`), poi le immagini una alla volta, t₀ e t_ultimo per primi.
- **Lettore rapido tramite intervalli HTTP** (predefinito): chiede all'archivio originale solo le righe di IMAGE del ritaglio e
  la tabella WCS-WAVE della coda; senza PSF. Barnard, 6 bande, 28 immagini: **8,7 s** (t₀ e t_ultimo delle 6 bande
  a 3,7 s), contro ~98 s con il servizio di ritagli. Non legge FLAGS (la contaminazione risulta "—") e sottrae la
  mediana invece di ZODI (differenza misurata: 0,07 volte il rumore). Se fallisce, usa il servizio di ritagli.
- **Se IRSA non risponde**, si usano le ricerche salvate in `data/cache/prototipo/sia/` con un avviso; se il
  punto non è mai stato consultato, un messaggio chiaro (HTTP 503).

I rivelatori vanno in coppie che guardano la stessa zona (1+4, 2+5, 3+6) e ogni coppia passa per un punto in giorni
diversi: per questo nelle miniature ci sono colonne in cui solo due bande hanno immagine.

## API

| Percorso | Cosa fa | Costo |
|---|---|---|
| `GET /api/presets` | I 5 campi di prova con la posizione **propagata** per moto proprio a oggi | niente |
| `GET /api/epochs?ra&dec&band&start&end` | Visite disponibili (SIA2, senza immagini) | ~2 s, ~0,2 MB |
| `GET /api/frames?ra&dec&band&start&end&size&max_visits&per_visit` | Fotogrammi PNG + sottrazione + colore | ~4 MB e ~5–12 s per ritaglio la 1.ª volta; cache dopo |
| `GET /api/grid?ra&dec&bands=1,2,5&start&end` | Visite per banda e colonne di data (senza immagini) | ~2–5 s |
| `GET /api/frame?ra&dec&band&visit&start&end&size&per_visit&fast` | Un fotogramma come float32 in base64 (~19 KB) | ~0,6–1 s con `fast=true` (predefinito); ~11 s con `fast=false` |

L'URL della pagina riflette la query (`?ra=…&dec=…&band=…`), quindi si può condividere.

## Come è stato verificato (14 nov 2026)

| Prova | Risultato |
|---|---|
| Barnard, banda 2, 3 esp./visita | Si misura 1,44–1,50 px a **nord** vs 1,66–1,81 px previsti (errore 1,3–2,3″) |
| WISE 0855, banda 5, 6 esp./visita | Si misura 1,30–1,32 px a **ovest** vs 1,31–1,34 px previsti (errore 0,6–1,2″) |
| RW Aur (controllo senza movimento), banda 3 | Si misura ≤ 0,22 px (≈ 0), come deve |
| λ da `WCS-WAVE` | 2,288 µm in un ritaglio di banda 3 (1,63–2,41 µm): coerente |
| Flusso di una stella vs data / vs λ | Salta senza ordine per data e cresce ordinatamente con λ: l'effetto del filtro lineare variabile |

## Risultati che contano per il progetto

1. **Bisogna riproiettare.** Ogni ritaglio proviene da un puntamento con un altro orientamento; senza allineare, il blink ruota.
2. **WISE 0855 non si vede in una singola esposizione** (113 s) in banda 5: bisogna sommarne 4–6 per visita.
3. **Il bit `SOURCE` di FLAGS risulta in ~100 % dei pixel** di un campo popolato. È informativo; se lo si conta
   come contaminazione, tutto sembra inutilizzabile. Le definizioni dei bit sono nell'intestazione (`MSKNnnnn`).
4. **IRSA ha restituito 503 con 6 ritagli in parallelo.** Con 3 e nuovi tentativi con attesa, funziona.
5. **Il ritaglio pesa ~4 MB ma l'immagine utile sono ~40 KB**: il resto è la PSF (`EPSF`), che arriva sempre intera.
6. **Le epoche sono a λ diverse** all'interno di una stessa banda (p. es. 1,24–1,63 µm): parte del cambio di
   luminosità è il filtro. L'interfaccia lo segnala.

## Cosa NON è verificato

- L'interfaccia non è stata provata in un browser reale con clic: sono stati verificati l'API e le immagini che restituisce.
- eps Ind B e R Dra non sono stati provati.
- La misura dello spostamento del notebook usa una finestra di 5 px per oggetti deboli e 15 px per luminosi;
  con la finestra sbagliata dà risultati scadenti (verificato con RW Aur). Non è astrometria.
- Non si corregge la parallasse (per Barnard sono ~0,5″, meno di 0,1 px).
- Il tempo di risposta in un deploy (Vercel o altro) non è stato misurato.
- I bit di FLAGS che si mascherano (`TRANSIENT`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`,
  `OUTLIER`) sono una scelta ragionevole, non una raccomandazione ufficiale di IRSA.

---

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
