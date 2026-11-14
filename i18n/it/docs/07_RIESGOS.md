<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/07_RIESGOS.md) · [Español](../../es/docs/07_RIESGOS.md) · [中文](../../zh/docs/07_RIESGOS.md) · [Deutsch](../../de/docs/07_RIESGOS.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/07_RIESGOS.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 07 — Rischi

Rischi identificati prima di iniziare, con il loro segnale d'allarme e il loro piano B. Si aggiorna durante
l'evento con `/riesgo`.

Ordine: per quanto fanno male, non per probabilità.

---

## R1 · I cutout di IRSA sono troppo lenti per uno strumento interattivo

> **Stato 14 nov: si è materializzato.** Mediana 7,3 s, p90 10,8 s, massimo 29 s, ~3,9 MB a prescindere dalla
> dimensione, 503 a tratti (`docs/09` §6). Mitigazione decisa: cache + 5 campi precalcolati come statici
> (ADR-001, aggiornamento 14 nov). Resta da decidere dove gira `/api` per coordinate arbitrarie (C).

**Impatto: critico.** È l'assunto su cui poggia tutto il progetto.

Un MEF completo pesa ~70 MB; il servizio di cutout esiste proprio per non scaricarli interi,
ma non sappiamo quanto impiega **per epoca** né cosa succede con 15 richieste in parallelo.

- **Segnale d'allarme:** nel Blocco 1, un cutout di `size=0.1` impiega più di ~5 s, o IRSA limita le
  richieste concorrenti.
- **Piano B:** cache aggressiva + preriscaldamento dei campi di prova + richiedere le epoche in parallelo
  con un tetto + mostrare i fotogrammi man mano che arrivano invece di aspettarli tutti.
- **Piano C:** lo strumento funziona su un insieme curato di ~10 campi precalcolati, e si
  presenta così, senza nasconderlo: «oggi serviamo questi campi; l'architettura scala a tutto il cielo».
  È meno ambizioso ed è onesto.
- **Quando si decide:** ora 3. Non più tardi.

---

## R2 · Le epoche non sono confrontabili tra loro a causa del filtro lineare variabile

> **Stato 14 nov: risolto nell'EDA.** Si scelgono epoche a λ uniformata (dispersione 0,474 → 0,035 µm in
> WISE 0855 D5); vedi `docs/09` §2. Mostrare la λ per fotogramma resta parte del design.

**Impatto: alto.** È il rischio più sottile e quello che più probabilmente rovinerà il risultato senza che
nessuno capisca perché.

Per il design LVF di SPHEREx, ogni osservazione di una posizione del cielo cade in una parte diversa
del rivelatore e quindi misura una lunghezza d'onda diversa. Un blink ingenuo dà una sequenza in cui
la luminosità salta senza che nulla sia cambiato. Spiegato in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2.

- **Segnale d'allarme:** il primo blink lampeggia come una luce stroboscopica e le sorgenti compaiono e
  scompaiono senza muoversi.
- **Piano B:** raggruppare per rivelatore o per intervallo di λ, e normalizzare ogni fotogramma con percentili
  robusti.
- **Piano C:** se nemmeno così viene pulito, **diventa una funzionalità**: mostrare la lunghezza
  d'onda di ogni fotogramma a schermo e spiegare che il lampeggio è informazione spettrale, non rumore.
  È vero, ed è un punto a favore davanti a una giuria tecnica.
- **Quando si decide:** ora 3, misurando il `WCS-WAVE` di due epoche dello stesso campo.

---

## R3 · DR1 è appena uscita e la documentazione o gli esempi non quadrano

> **Attenzione al piano B qui sotto (14 nov):** `spherex_qr3` da sola lascia WISE 0855 senza dati (0 righe).
> Bisogna interrogare `spherex_dr1` **e** `spherex_qr3` insieme (`docs/09` §1).

**Impatto: medio-alto.** DR1 è stata pubblicata a novembre 2026, questo stesso mese. I tutorial che
circolano puntano per lo più a QR2, che non è più ricercabile tramite SIA2.

- **Segnale d'allarme:** un esempio copiato da un notebook restituisce vuoto o un errore di collezione.
- **Piano B:** usare `spherex_qr3`, che c'è da settembre ed è più probabile che sia assestata.
  QR2 resta scaricabile tramite URL diretto fino a febbraio 2027 anche se non è ricercabile.
- **Regola pratica:** **andare sempre alla documentazione di IRSA, non a un blog né a un esempio
  vecchio.** Link in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## R4 · Cade il wifi (nella sala, o proprio durante il pitch)

**Impatto: critico se succede durante il pitch, fastidioso il resto del tempo.** Probabilità alta: succede in
quasi tutti gli hackathon.

- **Piano B obbligatorio, non opzionale:** modalità degradata che serve i cinque campi dalla cache locale
  senza toccare la rete, e il video della demo scaricato sul disco del computer che presenta.
- **Quando:** il video, a T−4 h. La modalità degradata, nel Blocco 4.
- Avere il repository clonato su **più di un computer**.

---

## R5 · Il progetto viene consegnato in ritardo o incompleto

**Impatto: critico. È la causa numero uno per cui un buon progetto non vince nulla.**

Il modulo di consegna chiede più di quanto si ricordi, e quest'anno include obbligatoriamente la
descrizione di come è stata usata l'IA.

- **Piano B:** non c'è piano B. Per questo esistono le tre soste obbligatorie di
  [`04_METODOLOGIA.md`](04_METODOLOGIA.md): congelamento a T−6, demo registrata a T−4, **consegnato a T−2**.
- **N apre il modulo all'ora 1**, non all'ora 22, per vedere cosa chiede.

---

## R6 · Il team si disperde in punti elenco a metà

**Impatto: alto.** Otto *Potential Considerations* e quattro persone con agenti veloci: la
tentazione di iniziarle tutte è enorme. Una giuria clicca proprio su quella rimasta a metà.

- **Segnale d'allarme:** più di due branch aperti per persona, o un `/standup` in cui nessuno può
  mostrare qualcosa che funzioni.
- **Piano B:** l'ordine di priorità del Blocco 3 di [`05_PLAN_24H.md`](05_PLAN_24H.md) non si
  negozia a caldo. Una funzionalità finita vale più di tre a metà.

---

## R7 · Due agenti si pestano i piedi e rompono `main`

**Impatto: medio, ma costa ore a metà notte.**

- **Piano B:** worktree per persona, branch brevi, nessuno fa push su `main`, una PR la guarda una persona.
  Vedi [`04_METODOLOGIA.md`](04_METODOLOGIA.md).
- **Segnale d'allarme:** il primo conflitto di merge strano. Quando compare, fermarsi cinque minuti e
  rivedere chi sta toccando cosa, invece di risolverlo a forza.

---

## R8 · Qualcuno afferma qualcosa di falso davanti alla giuria

**Impatto: alto e difficile da recuperare.** Una giuria con astronomi della NASA individua all'istante
una cifra inventata o uno spettro presentato come se fosse fotometria calibrata.

- **Piano B:** ogni numero che arriva al pitch o al README passa per `/verifica-cifra`. Il campo
  `caveat` dell'endpoint degli spettri non si toglie. Non si dice mai che si è scoperto qualcosa.
- **Regola:** se non l'hai verificato, si dice «non l'abbiamo verificato». Quella frase aggiunge credibilità, non la toglie.

---

## R9 · La GPU e l'attrezzatura locale non bastano per ciò che è stato promesso

**Impatto: basso con l'architettura scelta**, e vale la pena lasciarlo scritto perché nessuno proponga
di addestrare nulla. Il team dispone di una GPU da 4 GB; non c'è margine per addestrare né mettere a punto modelli
video. L'architettura di [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) non ne ha bisogno in nessun punto.

- **Se qualcuno propone di addestrare qualcosa:** [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6 contiene
  l'argomento completo per dire di no senza discuterne di nuovo.

---

## R10 · Il movimento è sub-pixel e il lampeggio non impressiona

> **Stato 14 nov: misurato.** Base reale 1,0-1,4 anni; spostamento totale 1,1-1,8 px (`docs/09` §4).
> Si adotta il piano B qui sotto (prima contro ultima + sottrazione + zoom).

**Impatto: alto per la demo, medio per il progetto.** Identificato il 14 nov 2026, prima dell'evento.

Con una scala di pixel di 6,15 arcsec (SIA2; `eda/03_recortes_y_figuras.py:42`), e con SPHEREx che scansiona tutto il cielo ogni 6 mesi, lo
spostamento tra due passate consecutive è di **meno di un pixel anche per gli oggetti
più veloci del cielo**: 0,84 px per la stella di Barnard, 0,66 px per WISE 0855, 0,38 px per
Epsilon Indi B. Misurato il 14 nov: con tutto il periodo disponibile si arriva a 1,1-1,8 px.

- **Segnale d'allarme:** il lampeggio funziona, i dati sono corretti, e nonostante ciò «non si vede che si
  muova». È ciò che accadrà se si confrontano epoche consecutive.
- **Piano B:** confrontare sempre la **prima epoca contro l'ultima**, non le consecutive; offrire
  zoom sul ritaglio invece di mostrarlo a 1:1; e appoggiarsi alla **sottrazione di immagini**, dove uno
  spostamento di un pixel si vede chiarissimo come una coppia di lobi positivo e negativo, mentre
  in un lampeggio si vede malissimo.
- **Piano C:** spostare l'asse della demo verso la **variabilità** (RW Aurigae, R Draconis), che è
  evidente, e verso la **cometa 3I/ATLAS**, che si muove molto più di qualsiasi stella.
- **E una regola per il pitch:** non promettere che «l'oggetto salta all'occhio» finché non lo si è visto.
- **Quando si decide:** deciso il 14 nov (base di 1,0-1,4 anni; 1,1-1,8 px in totale): si adotta il piano B.

---

## R11 · Vercel dipende da un solo account

**Cosa può fallire:** solo Mauricio ha accesso al progetto Vercel (piano gratuito Hobby; aggiungere membri richiede di pagare). Le anteprime delle PR degli altri risultano *Blocked* e solo lui vede i log.
- **Segnale d'allarme:** la produzione non si aggiorna, o Mauricio non è disponibile vicino alla chiusura.
- **Piano B:** ognuno prova in locale (`npm ci && npm run build && npm run preview`); video della demo registrato e modalità statica con i 5 campi precalcolati.
- **Quando si decide:** prima del congelamento dello scope (T−6 h). Responsabile: C.

## R12 · Il CDS di Strasburgo cade (SIMBAD, VizieR)

**Cosa può fallire:** il 14 nov il CDS di Strasburgo era fuori servizio; l'overlay di Gaia e il fumetto di SIMBAD dipendono da esso.
- **Segnale d'allarme:** i livelli Gaia/SIMBAD restano vuoti o impiegano più del tempo di attesa.
- **Piano B:** il codice prova già per primo il mirror di Harvard (`vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu`) e il CDS come riserva; per la demo, precalcolare i 5 campi.
- **Quando si decide:** nella prova della demo. Responsabile: V2.

## R13 · Una stella satura inganna la sottrazione

**Cosa può fallire:** negli oggetti saturi (Barnard, RW Aur) il nucleo resta mascherato e la sottrazione lascia una coppia rosso/blu anche se non si muovono (RW Aur «si muove» di 1,4 px senza muoversi).
- **Segnale d'allarme:** un oggetto di controllo (RW Aur) «si muove» nella sottrazione.
- **Piano B:** avvisare nell'interfaccia quando l'oggetto satura e non usare RW Aur come prova di variabilità né di movimento (`docs/09`).
- **Quando si decide:** prima di registrare la demo. Responsabili: D2 e V1.

---

## Registro dei nuovi rischi

Usa `/riesgo` per aggiungere qui. Formato: cosa può fallire, come ce ne accorgeremmo, cosa faremmo, e
quando si decide.
