---
description: Sincronizzazione di 5 minuti del team - cosa funziona, cosa è bloccato, cosa segue
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/.claude/commands/standup.md) · [Español](../../../es/.claude/commands/standup.md) · [中文](../../../zh/.claude/commands/standup.md) · [Deutsch](../../../de/.claude/commands/standup.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/commands/standup.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

Prepara il rapporto di sincronizzazione di questo fronte. Si legge ad alta voce in meno di un minuto.

1. Guarda lo stato reale del lavoro: `git log --oneline -15`, `git status`, i branch aperti
   (`git branch -a`) e i PR se ci sono. Non fidarti di ciò che è stato detto prima nella conversazione.
2. Se c'è qualcosa distribuito o in esecuzione, verificalo davvero prima di dire che funziona.

Restituisci esattamente questo formato, senza fronzoli:

**Funziona** — ciò che si può aprire e guardare adesso. Una riga per cosa. Se non si può aprire
e guardare, non va qui.

**Bloccato** — cosa è fermo, perché, e **da chi dipende sbloccarlo**. Se nulla è
bloccato, scrivi «niente».

**Prossimi 90 minuti** — una cosa sola. Se sono tre, significa che non è deciso.

**Nuovo rischio** — solo se ne è apparso uno. Altrimenti, ometti questa riga.

Regole di redazione: niente hash di commit, niente percorsi lunghi, niente gergo. Questo lo ascoltano tre
persone che non stavano guardando il tuo schermo. Prima la conclusione.

Alla fine, in una riga a parte: se qualcosa che credevamo finito si è rivelato non esserlo, dillo. È più utile
di qualsiasi avanzamento.
