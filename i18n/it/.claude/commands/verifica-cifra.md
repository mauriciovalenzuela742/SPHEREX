---
description: Verifica un'affermazione numerica o fattuale rispetto alla sua fonte prima che arrivi al pitch
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/.claude/commands/verifica-cifra.md) · [Español](../../../es/.claude/commands/verifica-cifra.md) · [中文](../../../zh/.claude/commands/verifica-cifra.md) · [Deutsch](../../../de/.claude/commands/verifica-cifra.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/commands/verifica-cifra.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

Verifica l'affermazione che arriva nell'argomento (o, se non c'è argomento, scorri il README e il
copione del pitch e verifica tutte quelle che trovi).

Per ogni affermazione:

1. **Identifica cosa si sta affermando esattamente.** Separa il numero dall'abbellimento: «elaboriamo migliaia
   di immagini» e «elaboriamo 1.400 immagini» non sono la stessa affermazione.
2. **Cerca la fonte.** Un file del repository, l'output di un comando, una pagina della
   documentazione di IRSA, un paper. **Aprila.** Che un link esista non prova che dica ciò che gli
   viene attribuito.
3. **Confronta.** La fonte dice questo, dice qualcosa di simile, o non lo dice?

Restituisci una tabella con: affermazione · stato · fonte · commento.

Stati possibili:

- **Verificata** — la fonte lo dice. Indica il link o il percorso esatto.
- **Approssimata** — la fonte dice qualcosa di vicino ma non uguale. **Proponi la formulazione corretta.**
- **Senza fonte** — non è stato trovato alcun riscontro. Va eliminata o va trovato il riscontro.
- **Falsa** — la fonte dice altro. Urgente.

Presta particolare attenzione a:

- Cifre della missione SPHEREx (bande, lunghezze d'onda, cadenza, dimensioni): si verificano sulla
  documentazione di IRSA, non a memoria.
- Affermazioni di novità («nessuno l'ha mai fatto», «il primo strumento che…»). Sono le più
  rischiose davanti a una giuria esperta. Se non si possono sostenere, si attenuano in «per quanto abbiamo
  potuto verificare».
- Qualsiasi cosa che suoni come aver scoperto qualcosa. **Questo non si afferma mai.**
- Risultati di fotometria presentati come qualità scientifica.

Alla fine, una riga: quante verificate, quante vanno corrette e qual è la più grave.
