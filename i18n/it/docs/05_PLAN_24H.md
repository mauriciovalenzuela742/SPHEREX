<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/05_PLAN_24H.md) · [Español](../../es/docs/05_PLAN_24H.md) · [中文](../../zh/docs/05_PLAN_24H.md) · [Deutsch](../../de/docs/05_PLAN_24H.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/05_PLAN_24H.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 05 — Piano delle 24 ore

Piano a blocchi, con criterio di taglio in ciascuno. **È scritto per poter tagliare.** Se un blocco
supera il suo tempo, si applica il taglio e si va avanti: in un hackathon il nemico non è la mancanza di
idee, è la mancanza di disciplina nell'abbandonarne una.

Orari di riferimento dell'evento locale di Santiago (inizio lavori sabato 10:00, **chiusura delle
consegne domenica 11:00**, confermato da JP il 14 nov e comunicato dal vivo dall'organizzazione; vedi
[`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)). Pitch: 2 minuti + 2 domande; l'orario non è
confermato. Se qualcosa cambia, si ricalcolano i blocchi, non l'ordine.

| Ruolo | Chi |
|---|---|
| D — Dati | Vladimir (D1 accesso) · Bryan (D2 fotogrammi) |
| V — Visore | Antonia (V1 blink) · Juan Pablo (V2 cielo) |
| C — Scienza e verifica | Mauricio (+ deploy) |
| N — Narrativa e consegna | Javiera |

*(Compilare all'ora 0. Che ognuno sappia cosa è suo evita metà degli attriti.)*

---

## Blocco 0 · Ora 0 – 1 · Tutti · **Allineare**

Il più redditizio di tutta la giornata e quello che più team saltano.

- Leggere insieme [`00_DESAFIO.md`](00_DESAFIO.md) ad alta voce. 10 minuti. Soprattutto le
  *Potential Considerations*: sono la rubrica.
- Ripartire i ruoli e scriverli in cima a questo file.
- **Confermare l'ora esatta della chiusura delle consegne.** Da lì escono T−6, T−4 e T−2.
- Creare il repository su GitHub, caricare il kit, dare accesso a tutti e sei.
- Avviare `scaffold/`: backend e frontend partono e si vedono. Non fa nulla; parte.
- Aprire [`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) e firmare la decisione di stack (o cambiarla).

**Taglio:** se all'ora 1 lo scheletro non parte, è un problema di ambiente e si affronta con tutti.
Nessuno avanza finché tutti e sei non riescono a far girare il progetto.

---

## Blocco 1 · Ora 1 – 3 · D1 + D2 + C · **L'ora della verità con i dati**

> **Risposto il 14 nov:** vedi [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) e
> [`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md). Quanto segue resta come riferimento del piano.

Il blocco che decide il progetto. È la checklist in fondo a
[`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md), punto per punto.

- Interrogazione SIA2 reale su WISE 0855, in `spherex_dr1` e in `spherex_qr3`. Quante righe?
- Quante **epoche distinte** ci sono per un campo tipico? Decide se il video ha 5 o 50 fotogrammi.
- Un cutout di `size=0.1`: **cronometrarlo**. Decide se servono cache, coda o entrambe.
- Aprire il MEF ritagliato. Confermare le 6 estensioni.
- **Leggere `WCS-WAVE` di due epoche dello stesso campo e misurare quanto cambia la lunghezza d'onda.**
  Questa è la domanda più importante della giornata (vedi [`02`](02_DATOS_SPHEREX.md) §2).
- Il cubo HiPS di DR1 si carica in Aladin Lite? IRSA risponde con CORS dal browser?

Nel frattempo, **V non aspetta**: monta il mock del contratto di
[`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) e lavora contro di esso. **N** inizia il README e apre il
modulo di consegna per vedere cosa chiede.

**Taglio:** all'ora 3 bisogna avere una risposta scritta a ogni domanda, anche se qualcuna è «non
siamo riusciti a scoprirlo». Se i cutout risultano impraticabili per lentezza, **il piano cambia qui**, non
all'ora 15.

---

## Blocco 2 · Ora 3 – 8 · **Il percorso critico**

Le due vie in parallelo, senza dipendenze tra loro.

**D — backend minimo che funziona da un capo all'altro**
`/api/epochs` e `/api/frames` per **una sola banda**, senza controlli, senza modalità, con cache su disco.
Hardcodato dove serve. **L'importante è che da una coordinata esca una sequenza di PNG.**

**V — visore minimo che funziona da un capo all'altro**
Casella di coordinate → chiamata → fotogrammi in un `<canvas>` → play/pausa. Brutto. Funzionale.
E Aladin Lite accanto che carica il cubo HiPS, che è la Via A.

**C** — riempie `data/campos_de_prueba.yml` con i cinque oggetti, verificati su SIMBAD, e scrive
cosa dovrebbe vedersi in ciascuno. Prepara il controllo con Gaia.

**N** — README, nome del progetto, la frase di una riga. La frase costa più di quanto sembri
ed è ciò che la giuria ricorda.

**Taglio — traguardo dell'ora 8:** *una coordinata scritta a mano produce un videino a schermo.*
Brutto, lento, una sola banda, non importa. **Se all'ora 8 non c'è il videino, tutto il resto si sospende**
e tutti e sei si mettono su quello.

---

## Blocco 3 · Ora 8 – 14 · **Farlo bene**

Adesso sì, in ordine di valore. L'ordine esce dalle voci della sfida e da quanto costa ciascuna.

| Priorità | Cosa | Chi | Perché |
|---|---|---|---|
| 1 | Selezione di banda / detector | D + V | È la voce delle 102 bande e risolve il problema della λ variabile |
| 2 | Controlli: stretching, colore, fps, campo visivo | V | WiseView dimostra che **senza questo non si vede niente**. Economico e decisivo |
| 3 | Sottrazione di immagini (`diff_first`, `diff_prev`) | D | Voce esplicita. Spettacolare a schermo. Economico |
| 4 | Risoluzione dei nomi (SIMBAD) | D + V | Rende lo strumento utilizzabile da chiunque |
| 5 | URL interrogabile e condivisibile | V | Voce esplicita. Mezz'ora di lavoro |
| 6 | Overlay di Gaia DR3 | V + C | Voce esplicita **e** la prova che il visore è corretto |
| 7 | Flag di contaminazione | D + V | Voce esplicita. Un campo che arriva già nel MEF |
| 8 | Spettro al volo | D | «Extra kudos». Il più costoso della lista. **Solo se 1–7 sono chiuse** |

**Taglio — T − 6 h: congelamento dello scope.** Ciò che non è iniziato, non si inizia. Ciò che è iniziato si
finisce o si toglie. Una funzionalità a metà toglie punti: la giuria clicca proprio lì.

---

## Blocco 4 · T − 6 h a T − 4 h · **Rifinire e verificare**

- **C esegue i cinque campi di prova, uno per uno, nell'applicazione in produzione.** Non in locale.
- Precaricare la cache dei cinque. La demo non si fa mai con un'interrogazione a freddo.
- Stati vuoti e di errore: cosa vede l'utente se non ci sono dati in quella coordinata? E se IRSA non risponde?
  **La giuria scriverà coordinate a caso.** Che non veda una schermata bianca.
- Che funzioni su un cellulare, anche solo a metà. Qualcuno della giuria lo aprirà sul telefono.
- Piè di pagina con l'attribuzione obbligatoria di SPHEREx ([`02`](02_DATOS_SPHEREX.md) §8).

---

## Blocco 5 · T − 4 h a T − 2 h · **Demo e consegna**

- **Registrare il video della demo.** Copione nella skill `demo-y-pitch`. Dura quanto richiede l'evento.
- Lasciare funzionante la **modalità degradata**: l'applicazione serve i cinque campi dalla cache senza
  internet. Il wifi di un hackathon cade; quello della sala dei pitch, di più.
- **Caricare la consegna completa**, inclusa la descrizione di come è stata usata l'IA, che quest'anno è
  obbligatoria. Checklist nella skill `entrega-nasa`.

**T − 2 h: consegnato.** Da qui in poi tutto il resto è un miglioramento opzionale su qualcosa di già consegnato.

---

## Blocco 6 · T − 2 h al pitch · **Provare**

- N prova il pitch **ad alta voce, cronometrato**, tre volte. A Santiago sono 2 minuti + 2 domande:
  2 minuti sono molto meno di quanto sembri.
- Gli altri cinque fanno da giuria e chiedono le cose scomode:
  - «Questo non lo fa già il Data Explorer di IRSA?»
  - «Come fai a sapere che l'immagine è di quella coordinata?»
  - «Cosa succede se inserisco una coordinata senza dati?»
  - «Perché non avete usato il machine learning?»

  Le risposte alla prima e all'ultima sono in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md);
  la seconda è l'overlay di Gaia; la terza è lo stato vuoto del Blocco 4.
- Lasciare aperti nel browser: l'applicazione in produzione, il video e il repository. Nient'altro.

---

## Cosa faremmo con 6 ore in più

Per la risposta a «e cosa viene dopo?», che la chiedono sempre:

- Marcare e salvare candidati con URL permanente, in stile Backyard Worlds.
- Sottrazione di immagini allineata per moto proprio previsto (Gaia) invece che per posizione fissa.
- Vaglio automatico dei candidati con una rete piccola su ritagli, in stile *stamp
  classifier* di ALeRCE. **Quello è il ruolo onesto dell'IA qui**, non un transformer video.
- Esportare la sequenza come GIF o come subject set di Zooniverse.
