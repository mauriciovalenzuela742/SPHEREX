---
name: coordenadas-astro
description: Coordinate del cielo e loro gestione senza sbagliare - ascensione retta e declinazione, conversione tra sessagesimale e gradi decimali, il fattore 15 tra ore e gradi, WCS di FITS e la conversione pixel-cielo con astropy, moto proprio e come prevedere dove sarà una stella in un'altra epoca, risoluzione dei nomi con SIMBAD, e i cinque campi di prova della sfida. Attivala quando si analizzano o validano coordinate inserite da un utente, quando si converte tra formati, quando si lavora con WCS o world_to_pixel, quando si calcolano posizioni in un'altra data, o quando si menzionano RA, Dec, ICRS, J2000, sessagesimale, moto proprio, parallasse, SIMBAD o i campi di prova.
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../../en/.claude/skills/coordenadas-astro/SKILL.md) · [Español](../../../../es/.claude/skills/coordenadas-astro/SKILL.md) · [中文](../../../../zh/.claude/skills/coordenadas-astro/SKILL.md) · [Deutsch](../../../../de/.claude/skills/coordenadas-astro/SKILL.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/skills/coordenadas-astro/SKILL.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Coordinate del cielo senza passi falsi

---

## 1. L'errore che si commette più spesso

**L'ascensione retta si dà in ore o in gradi, e c'è un fattore 15 tra le due.**

```
RA = 08h55m10.831s  →  8.9196753 horas  →  133.795129 grados
```

Se tratti `08h55m` come gradi, punti a 112 gradi di distanza dall'oggetto. La query restituisce
immagini perfettamente valide di un pezzo di cielo sbagliato, e **nulla fallisce**: non c'è errore, non
c'è eccezione, solo un risultato silenziosamente scorretto.

La declinazione è invece sempre in gradi (da −90 a +90). `-7d14m42.53s` sono gradi, primi d'arco e
secondi d'arco.

**Non analizzare mai le coordinate a mano.** Usa `astropy.coordinates.SkyCoord`, che capisce quasi tutto:

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

SkyCoord("08h55m10.831s", "-07d14m42.53s", frame="icrs")
SkyCoord("08 55 10.831 -07 14 42.53", unit=(u.hourangle, u.deg))
SkyCoord(133.795129, -7.245147, unit="deg")
```

**Fai attenzione a `unit=(u.hourangle, u.deg)`**: è la coppia corretta quando la RA arriva in ore e la Dec
in gradi, che è il caso abituale del formato sessagesimale.

### Validazione di ciò che inserisce l'utente

Accetta le quattro forme e normalizza in gradi decimali ICRS prima di fare qualsiasi cosa:

1. `133.795129 -7.245147` (gradi decimali)
2. `08h55m10.831s -07d14m42.53s`
3. `08:55:10.831 -07:14:42.53`
4. `WISE 0855` (nome → SIMBAD)

Regola pratica per distinguere 1 da 3 quando arrivano due numeri sciolti: **se contiene `h`, `:` o
spazi come separatori interni, è sessagesimale.** Se c'è ambiguità, chiedi all'utente invece di
indovinare. Un segno meno nella Dec si perde facilmente: verificalo esplicitamente.

Intervalli validi: RA ∈ [0, 360), Dec ∈ [−90, +90]. La RA si avvolge a 360; la Dec no.

---

## 2. WCS: da pixel a cielo

Il WCS è nell'header FITS e traduce pixel ↔ coordinata.

```python
from astropy.wcs import WCS
from astropy.io import fits

with fits.open(ruta) as hdul:
    w = WCS(hdul["IMAGE"].header)

x, y = w.world_to_pixel(coord)      # devuelve 0-based
coord = w.pixel_to_world(x, y)
```

Tre trappole:

1. **`world_to_pixel` restituisce 0-based; gli header FITS sono 1-based.** IRSA lo avverte
   esplicitamente nella documentazione di SPHEREx per la gestione della PSF. Se vedi spostamenti di
   un pixel, è questo.
2. **In un MEF, ogni estensione può avere il proprio WCS.** Quello di `IMAGE` non è detto che serva
   per la PSF.
3. **Il WCS di un ritaglio non è quello dell'originale.** Il servizio di cutout di IRSA adatta il WCS del
   ritaglio, ma mantiene chiavi come `CRPIX1A`/`CRPIX2A` che puntano all'immagine originale. Leggi la
   skill `spherex-datos` prima di fare conti con la PSF.

Distanza angolare tra due posizioni: `coord1.separation(coord2)`. Non calcolarla con Pitagora
su RA e Dec: vicino ai poli è sbagliata, perché un grado di RA non è un grado d'arco.
Il fattore è `cos(dec)`.

---

## 3. Moto proprio: dove sarà in un'altra data

È il calcolo che permette di sovrapporre Gaia a un'immagine di un'epoca concreta, che è al tempo stesso
un punto della sfida e la prova che il visore è corretto.

```python
from astropy.time import Time

c = SkyCoord(ra=..., dec=..., unit="deg",
             pm_ra_cosdec=... * u.mas/u.yr,
             pm_dec=... * u.mas/u.yr,
             obstime=Time("2016.0", format="jyear"))   # época del catálogo
c_en_2026 = c.apply_space_motion(new_obstime=Time("2026-10-02"))
```

- **Gaia DR3 ha come epoca di riferimento J2016.0.** Non J2000. Confonderle introduce un errore di 16 anni di
  moto proprio.
- **WISE 0855−0714 non è in Gaia** (è troppo fredda e debole nell'ottico). Per il suo overlay e la sua
  posizione propagata usa CatWISE2020 (`catwise_2020` in IRSA), che contiene moti propri; la sua epoca
  di riferimento è ~MJD 57170 (~2015,4). Conferma unità ed epoca nello schema della tabella.
- `pm_ra_cosdec` include già il fattore `cos(dec)`. I cataloghi di solito lo danno così; se la tua fonte dà
  `pmra` «grezzo», convertilo.
- Scala delle grandezze: 100 mas/yr sono 0,1 arcsec all'anno. Con pixel di ~6 arcsec come quelli di
  SPHEREx, serve **molto** moto proprio o diversi anni per vedere uno spostamento di un
  pixel. Per questo gli oggetti di prova della sfida sono quelli che sono: sono scelti perché hanno
  un moto proprio enorme.

---

## 4. Risolvere i nomi

Perché lo strumento sia utilizzabile da chiunque bisogna accettare «Barnard's Star», non solo numeri.

```python
SkyCoord.from_name("Barnard's Star")          # usa el servicio Sesame del CDS
```

oppure `astroquery.simbad`. Precauzioni per uno strumento pubblico:

- **Sempre con tempo limite e con gestione del fallimento.** Sono servizi esterni e vanno giù.
  *(Verificato il 14 nov 2026: il servizio del CDS a Strasburgo era fuori uso. Lo specchio del
  CfA, `simbad.cfa.harvard.edu`, rispondeva e serve gli stessi dati. **Tieni entrambi e passa
  dall'uno all'altro.**)*
- **Metti in cache le risposte.** I cinque campi di prova si risolvono una volta e si salvano.
- **Piano B:** una tabella locale con i cinque campi di prova e gli oggetti più richiesti
  (`data/campos_de_prueba.yml`), perché la demo non dipenda mai da un servizio di terzi.

---

## 5. I cinque campi di prova

Sono quelli che nomina l'enunciato. **Funzionano come criterio di accettazione**: se il visore si comporta
bene nei cinque, è finito.

Le coordinate (verificate il 14 nov 2026 rispetto a SIMBAD), cosa dovrebbe vedersi in ciascuno e i
moti propri sono in [`data/campos_de_prueba.yml`](../../../../../data/campos_de_prueba.yml).

**Due trappole verificate che sono in quel file e conviene conoscere prima di toccare il codice:**

1. **La coordinata che l'enunciato dà per WISE 0855 è dell'epoca di WISE (~2010,4), non di
   oggi.** L'oggetto si muove di 8,15 arcsec all'anno: a fine 2026 si trova a circa 130 arcsec da quella
   coordinata. Con un campo di 0,05 gradi o meno, **puntare alla coordinata dell'enunciato lascia
   l'oggetto fuori dal campo**, e il visore sembra rotto senza esserlo.
2. **`eps Ind B` (maiuscola) è la coppia di nane brune; `eps Ind b` (minuscola) è un
   pianeta**, e si trova a 402 arcsec, nella posizione della stella. Il risolutore di MAST, che non
   distingue le maiuscole, restituisce il pianeta. Se la tua risoluzione dei nomi non distingue
   le maiuscole, punti all'oggetto sbagliato.

**E un'aspettativa da avere fin dall'inizio:** con una scala di pixel di 6,15
arcsec, persino gli oggetti più veloci del cielo si muovono **meno di un pixel tra due passate
consecutive** di SPHEREx (distanziate di 6 mesi). Misurato nell'EDA (`docs/09`), in tutto il periodo
disponibile (1,0-1,4 anni) si muovono di 1,1-1,8 px. Questo significa usare la base temporale più ampia disponibile, non epoche
consecutive, e dà molto valore alla sottrazione di immagini e allo zoom.

| Oggetto | Cosa dimostra |
|---|---|
| **WISE 0855** | Moto proprio molto alto. **Caso obbligatorio: si mostra sempre.** In un'esposizione singola si vede debole; il suo movimento (~1,3 px) si vede con la sottrazione e con la somma per passata (in sospeso, D2; l'overlay di CatWISE2020 è fatto nel branch `v/v2-catwise`, PR in sospeso, V2). Coordinate dell'enunciato: dell'epoca 2010, usare quella propagata |
| **Barnard's Star** | Il maggior moto proprio conosciuto. Si vede, ma satura: il movimento è qualitativo |
| **Epsilon Indi B** | Coppia di nane brune. **È dove il movimento si vede più chiaramente** (misurato −0,85/−0,71 px; coincide con SIMBAD) |
| **RW Aurigae** | Variabile: cambia luminosità. Satura e la sottrazione lascia una coppia rosso/blu anche se non si muove: non è prova di variabilità |
| **R Draconis** | Variabile a lungo periodo e grande ampiezza. Luminosità non misurata (`docs/09`) |

La coppia «si muove» / «cambia solo luminosità» è ciò che dimostra che il visore distingue le due
cose. Nel pitch conviene mostrarne una per tipo.

---

## 6. Lista di controllo prima di dare una coordinata per buona

- [ ] RA in gradi o in ore? L'hai convertita?
- [ ] Il segno della Dec è sopravvissuto all'analisi?
- [ ] RA ∈ [0,360) e Dec ∈ [−90,90]?
- [ ] Il sistema di riferimento è ICRS? (J2000 e ICRS coincidono a fini pratici; galattico no.)
- [ ] Se c'è moto proprio, qual è l'epoca del catalogo? Gaia è J2016.0?
- [ ] Se hai usato il WCS, 0-based o 1-based?
- [ ] **Hai verificato rispetto a una fonte esterna?** Incollare la coordinata in SIMBAD o in Aladin e vedere se
      cade dove deve costa trenta secondi ed evita ore.
