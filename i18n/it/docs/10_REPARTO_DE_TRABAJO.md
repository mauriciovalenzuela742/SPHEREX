<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/10_REPARTO_DE_TRABAJO.md) · [Español](../../es/docs/10_REPARTO_DE_TRABAJO.md) · [中文](../../zh/docs/10_REPARTO_DE_TRABAJO.md) · [Deutsch](../../de/docs/10_REPARTO_DE_TRABAJO.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/10_REPARTO_DE_TRABAJO.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 10 — Cosa tocca a ciascuno dopo l'EDA

La ripartizione la fissa il piano del team: [`README.md`](../README.md) §3 e [`05_PLAN_24H.md`](05_PLAN_24H.md)
(D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera). Questo documento **non
ripartisce di nuovo**: porta a ciascun ruolo ciò che l'EDA ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)) ha mostrato
con dati reali, con compiti concreti e come verificarli.

---

## Cosa cambia l'EDA nel piano

| Il piano assumeva | L'EDA ha mostrato | Chi riguarda |
|---|---|---|
| Via A: Aladin carica il cubo HiPS di DR1 di IRSA | **Sì, si carica** (`/data/hips/SPHEREx/spherex_allsky_cube`, CORS aperto; è già nel visore in produzione). Ma è un mosaico di tutte le epoche in PNG, a 12,9″/px: serve come contesto e per le 102 bande, non per il tempo né per misurare flussi. La versione FITS che consegna SIA2 non serve per i ritagli | **V2** |
| Verificare il CORS nell'ora 1 | **IRSA non risponde con CORS** (né SIA2 né file): tutto passa dal backend. Il CDS sì | D1, V2 |
| Misurare un cutout decide Vercel Functions o container | **7,3 s di mediana, 10,8 s p90, 29 s massimo**, ~3,9 MB, errori 503 a tratti | **C** (decide), D1 |
| Raggruppare per banda | Inoltre bisogna **uniformare la λ** tra epoche: all'interno di un detector varia ~16 larghezze di banda | D1, **D2** |
| Riproiettare su una griglia comune | Confermato e imprescindibile: il detector **ruota ~180° tra le passate** | **D2** |
| `flagged_fraction` per «Contaminazione» | `FLAGS != 0` marca il 72 % del ritaglio (bit SOURCE, che non è un errore); i pixel cattivi sono ~4 % | **D2**, C, V1 |
| WISE 0855 è la demo principale | WISE 0855 è un caso obbligatorio e si mostra sempre, dicendo che in una singola esposizione si vede debole (il suo moto si vede con la sottrazione e con la somma per passata). **eps Ind B** è dove il moto misurato si vede più chiaramente; Barnard si vede ma satura | C, N |
| Il moto si vede nel blink | È di **1–2 px in tutto il periodo**: la sottrazione (`diff_first`) è la vista che lo mostra | D2, V1, N |

## Il flusso dei dati, da un capo all'altro

```
 coordenada ─► [1 Buscar] ─► [2 Elegir épocas] ─► [3 Recortar + caché] ─► [4 Filtros y alineación]
               D1            D2 (λ igualada)       D1                      D2
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ▼
 [5 Restas y sumas] ─► [6 Imagen PNG] ─► API ─► [7 Visor]
   D2                    D2                      V1 blink y controles · V2 cielo, Gaia, espectro
```

**C (Mauricio)** verifica tutto il percorso e decide il deploy; **N (Javiera)** lo racconta.

---

## D1 · Vladimir — accesso ai dati (caselle 1 e 3)

Base: `eda/01_inventario.py`, `eda/espectral.py` (`cabecera_imagen`, `pedir`).

- SIA2 verso `spherex_dr1` e `spherex_qr3` **in parallelo** (1–3,5 s ciascuna). Non si ripetono file tra
  le due; QR3 porta la passata più recente.
- Cercare con la **posizione propagata** per moto proprio: con la coordinata dell'enunciato,
  WISE 0855 resta fuori da un campo piccolo.
- Metadati economici: l'header di IMAGE si scarica con una richiesta **HTTP Range di ~35 KB** (data, WCS,
  detector). Con 6 in parallelo, ~0,1 s effettivi per file.
- Cutout di 0,1° con retry e attesa (ci sono stati 503 che sono durati 4 retry); 4 in parallelo al
  massimo. Un cutout più piccolo **non** è più veloce: la PSF arriva intera.
- Cache per `(obs_id, detector, centro arrotondato, size)` e precalcolo dei 5 campi.
- **Pronto quando:** i 5 campi si servono dalla cache senza internet.

## D2 · Bryan — fotogrammi: filtri, allineamento e sottrazioni (caselle 2, 4, 5 e 6)

Base: `eda/02_longitud_de_onda.py`, `eda/03_recortes_y_figuras.py` (`elegir_lambda_igualada`,
`grilla_comun`, `BITS_MALOS`) e `eda/05_centroides.py`.

**Cosa entra:** la lista di file di D1. **Cosa esce:** fotogrammi allineati + maschera + sottrazioni,
con `wavelength_um` e `flagged_fraction` per fotogramma.

### Compiti, in ordine

1. **Scegliere epoche a λ uniformata.** Un file per passata, minimizzando la dispersione di λ sull'oggetto
   (λ con la tabella `WCS-WAVE`, che è fissa per detector). In WISE 0855 D5 scende da 0,47 µm a 0,035 µm.
2. **Maschera per bit.** L'EDA invalida `TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, MISSING_DATA, HOT,
   COLD, NONLINEAR, PERSIST, OUTLIER`. Dubbi: `HALO` (2,1 %) e `BLOOM` (0,8 %). **Mai** `FLAGS != 0`.
   I nomi dei bit stanno nell'header di FLAGS (`MSKN`/`MSKM`/`MSKD`).
3. **Riproiezione senza ingrandire la maschera.** Immagine riempita e maschera separatamente (vicino più
   prossimo per la maschera): con l'interpolazione bilineare ogni pixel cattivo contamina i vicini e i
   buchi si ingrandiscono a vista.
4. **`IMAGE − ZODI`** e normalizzazione tra epoche (oggi mediana e deviazione standard; provare a scalare
   per il flusso delle stelle di campo).
5. **`diff_first` e `diff_prev`**, mappa divergente centrata su 0 e stesso intervallo per tutte.
6. **Somma per passata** con pesi `1/VARIANCE` (co-add): è ciò che renderebbe visibile WISE 0855.
7. **Saturazione.** Barnard e RW Aur saturano: il nucleo arriva mascherato (Barnard 44 pixel su 49) e
   la sottrazione lascia una coppia rosso/blu **anche se la stella non si muove** (RW Aur). Esporre un indicatore
   di saturazione perché V1 lo mostri.

### Come verificarlo

| Prova | Deve passare |
|---|---|
| eps Ind B, D5, centroide ultima − prima | −0,92 / −0,57 px (ovest / nord) ± 0,2 px; l'EDA ha misurato −0,85 / −0,71 |
| Stelle di campo non sature | Spostamento mediano < 0,2 px |
| Barnard, D2, sottrazione | Coppia con il positivo verso il **nord** (qualitativo: satura) |
| RW Aur, D3 | Marcata come satura; altrimenti la sottrazione inganna |
| `flagged_fraction` | ~4 % del ritaglio, non ~72 % |

## V1 · Antonia — visore del blink

Revisione del mockup rispetto ai dati, punto per punto: [`diseno/REVISION_MAQUETA_V1.md`](diseno/REVISION_MAQUETA_V1.md).


- La **sottrazione** è la vista che mostra il movimento: il solo blink di 1–2 px si nota appena. Serve
  zoom (l'EDA ha usato ritagli di 18×18 px ingranditi).
- Mostrare sempre la **data e la λ** di ogni fotogramma: spiegano perché cambia la luminosità.
- Avvisare quando l'oggetto satura e mostrare la maschera come livello opzionale.
- Stati di attesa: un fotogramma a freddo può impiegare 7–29 s.

## V2 · Juan Pablo — visore del cielo

> **Fatto nella PR #6 (unita il 14 nov):** slider di λ sui 102 piani (senza 50 e 51), marcatore
> dell'oggetto e riquadro del ritaglio propagati al 2026, livello Gaia DR3 propagato (tetto di 300 stelle) e livello
> SIMBAD con etichetta al passaggio e clic che sceglie la posizione. **Fatto nel branch `v/v2-catwise`, in attesa di PR:** livello CatWISE2020, che marca WISE 0855 a 2,6″ dalla posizione propagata da SIMBAD (secondo V2). **Manca:** grafico delle bande (con D2), clic →
> animazione ritagliata, Spherix.

- **Il cubo HiPS di IRSA si carica in Aladin** e Mauricio lo ha già reso funzionante in `scaffold/frontend/src/sky/AladinView.tsx`
  (Aladin Lite 3.8.2, un piano per banda). È un mosaico di tutte le epoche, a 12,9″/px: contesto e
  102 bande, non tempo. L'HiPS del CDS (QR2) resta come piano B.
- Per il **grafico delle bande** il cubo non serve (sono PNG stirati, senza flussi); lo spettro esce dai
  file di livello 2 (la λ di ciascuno si calcola già in D2) o dallo Spectrophotometry Tool di IRSA.
- Overlay di Gaia propagato all'epoca: l'EDA già propaga con il moto proprio (`eda/comun.py`,
  `posicion_en`), e coincide con quanto misurato in eps Ind B.

## C · Mauricio — scienza, verifica e deploy

- **Dato per decidere dove gira `/api`:** cutout di 7,3 s di mediana e 29 s di massimo, 503 a tratti.
- Correggere in `data/campos_de_prueba.yml` la scala di pixel: **6,15″** (da SIA2), era 6,2 derivata.
- **`scaffold/frontend/src/content/campos.ts` ha coordinate J2000**, benché il suo commento dica
  «propagata». Al 2026, WISE 0855 è a 212″ e Barnard a 270″ da quelle coordinate: con ritagli di 0,1°
  (mezzo lato 180″) restano **fuori dal ritaglio**. Usare posizioni propagate (il `/api/presets` del
  branch di Bryan le fornisce già).
- Demo: i cinque oggetti di prova devono funzionare. WISE 0855 si mostra sempre (con la sottrazione, e con la somma per passata di D2 quando esisterà, più l'overlay di CatWISE2020 di V2, fatto nel branch `v/v2-catwise` e in attesa di PR; si dice che in una singola esposizione si vede debole); eps Ind B è dove il moto si vede più chiaramente; Barnard si vede ma satura.
- Le prove di D2 qui sopra sono quelle di accettazione.

## N · Javiera — narrativa

- Il messaggio onesto: «le stelle più veloci si muovono di 1–2 pixel in un anno di SPHEREx;
  lo rendiamo visibile uniformando il colore, allineando e sottraendo».
- Materiale pronto: la presentazione `docs/presentacion_eda/` e la figura `eda/figuras/01_lambda_vs_tiempo.png`.

---

## SpacePixels come verifica indipendente (per D2 e C)

[SpacePixels](https://github.com/ppissias/SpacePixels) (BSD-2, Java 21, desktop) rileva
oggetti in movimento in **sequenze di FITS già allineate**, con blink, sottrazione e «shift-and-stack».
Letto solo il suo README; **non si è rivisto il codice né provato**.

- Non si integra nel visore (Java desktop).
- Serve a verificare l'allineamento: esportando i fotogrammi allineati come FITS con WCS, dovrebbe
  marcare eps Ind B come oggetto in movimento e le stelle di campo come fisse.
- Il suo «shift-and-stack» è l'idea per sommare WISE 0855 seguendo il suo moto proprio.
- Installarlo significa scaricare software di terzi: concordarlo nel team.
