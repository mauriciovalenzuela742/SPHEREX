---
description: Percorre l'intera demo nel browser e riporta cosa si rompe
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/.claude/commands/chequeo-demo.md) · [Español](../../../es/.claude/commands/chequeo-demo.md) · [中文](../../../zh/.claude/commands/chequeo-demo.md) · [Deutsch](../../../de/.claude/commands/chequeo-demo.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/commands/chequeo-demo.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

Percorri l'intera demo come la farà il team davanti alla giuria e riporta cosa si rompe. Questo si esegue
**prima di ogni congelamento e prima di registrare il video**.

Il copione è in `.claude/skills/demo-y-pitch/SKILL.md`. Se l'argomento del comando contiene un URL,
usa quello; altrimenti usa l'applicazione distribuita (https://spherex-planet-x-tau.vercel.app), e se non c'è, quella locale (`npm run dev` in `scaffold/frontend`, http://localhost:5173). Attenzione: finché il riproduttore e i fotogrammi sono vuoti, il passo 3 fallisce per progetto e non per una regressione.

Percorri i dieci passi del copione, uno per uno, con il browser. A ogni passo annota:

- Ha fatto ciò che doveva fare?
- **Quanto ci ha messo.** Cronometralo. Un passo che dura 15 secondi uccide una demo di 2 minuti.
- Ci sono stati errori in console o richieste fallite?

Poi prova ciò che la giuria farà e il copione non copre:

- Una coordinata senza dati.
- Una coordinata scritta male.
- Ricaricare a metà del caricamento.
- Lo stesso URL aperto in un'altra scheda.
- Dimensione della finestra mobile.

Restituisci:

**Rompe la demo** — ciò che va corretto in ogni caso, con il passo esatto in cui fallisce.

**Lento** — passi che durano più di 3 secondi, con il tempo misurato.

**Fastidioso ma accettabile** — ci si può convivere oggi.

**Tempo totale del percorso** — se supera i 2 minuti, bisogna tagliare passi e dire quali.

Se qualcosa è fallito, di' esattamente cosa hai fatto per arrivarci, in modo che si possa riprodurre.
