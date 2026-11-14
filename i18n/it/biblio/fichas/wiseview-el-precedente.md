<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/biblio/fichas/wiseview-el-precedente.md) · [Español](../../../es/biblio/fichas/wiseview-el-precedente.md) · [中文](../../../zh/biblio/fichas/wiseview-el-precedente.md) · [Deutsch](../../../de/biblio/fichas/wiseview-el-precedente.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `biblio/fichas/wiseview-el-precedente.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Scheda: WiseView, il precedente diretto

- **Riferimento:** Caselden, Westin, Meisner, Kuchner, Colin (2018). *WiseView: Visualizing motion
  and variability of faint WISE sources.* Astrophysics Source Code Library, ascl:1806.004
- **Link:** <http://byw.tools/wiseview> · <https://ascl.net/1806.004>
- **Stato:** verificato (ASCL e blog di Backyard Worlds, 14 nov 2026). Autori completi da confermare
- **Perché è al primo posto:** è lo strumento che il testo della sfida nomina come modello

## Cosa dice, in tre frasi

WiseView è uno strumento da browser che fa lampeggiare i coadd di WISE su una base temporale
di vari anni; l'utente inserisce soltanto le coordinate e regola in modo interattivo lo stiramento, la
mappa di colore e la velocità del lampeggio. Nacque come un rimedio improvvisato di due volontari di Backyard Worlds
che volevano classificare meglio i propri candidati e verificare se mostrassero moto proprio.
Ha permesso centinaia di scoperte di candidati nana bruna, da parte di dilettanti e di professionisti.

## Cosa ci serve da qui

1. **La forma dell'interfaccia è validata dall'uso reale.** Una casella di coordinate, un lampeggio,
   tre controlli. Non c'è nulla da inventare: bisogna portarlo su SPHEREx.
2. **I controlli non sono decorazioni.** Stiramento, colore e velocità sono ciò che trasforma una
   macchia in una scoperta. Se si tagliano per mancanza di tempo, si taglia ciò che rende utile lo strumento.
3. **Mostra coadd, non esposizioni singole.** Combinare prima di mostrare è ciò che rende visibili le
   sorgenti deboli. In SPHEREx l'equivalente è sommare per rivelatore o per intervallo di lunghezza d'onda,
   che è esattamente ciò che suggerisce uno dei punti elenco della sfida.
4. **Avere un'API l'ha trasformato in infrastruttura.** Esistono pacchetti di terzi (`flipbooks`,
   `unWISE-verse`, del progetto Cool Neighbors) costruiti sull'API di WiseView per generare
   materiale e caricarlo su Zooniverse. **Quella è l'asticella del nostro URL interrogabile**, che è un altro
   punto elenco esplicito della sfida.

## Cosa NON ci serve (e perché)

- **Non ha asse spettrale.** WISE ha quattro bande larghe; SPHEREx ha 102 canali. Lì c'è la nostra
  nicchia: fare lo stesso *più* l'asse della lunghezza d'onda.
- **I dati di WISE non hanno il problema del filtro lineare variabile.** In WISE, due epoche della
  stessa posizione sono della stessa banda. In SPHEREx no. Copiare la logica del lampeggio senza risolvere questo
  produce una sequenza stroboscopica (vedi `../../docs/02_DATOS_SPHEREX.md` §2).
- **unWISE precalcola i coadd.** WiseView è veloce perché qualcuno ha già fatto il lavoro pesante. Per
  noi, equivale a preriscaldare la cache: non potremo precalcolare tutto il cielo.

## Cifre che possiamo citare

| Cifra | Valore | Dove lo dice |
|---|---|---|
| Scoperte facilitate | «centinaia di candidati nana bruna» | Registro ASCL 1806.004 |
| Base temporale | vari anni di WISE/NeoWISE | ASCL e blog di Backyard Worlds |

**Attenzione:** non attribuire a WiseView la scoperta di Planet Nine. Non è stato trovato.

## Domande che lascia aperte

- Il codice del WiseView originale è pubblico? Non l'abbiamo confermato; lo sono i pacchetti derivati.
- Quali parametri espone esattamente la sua API? Guardarlo in `flipbooks` costa meno che dedurlo.
- Quante epoche mostra di default, e perché quel numero? È una decisione di design che toccherà
  prendere a noi.
