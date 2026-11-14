---
description: Passaggio di consegne di contesto perché un'altra persona o una nuova sessione riprenda questo lavoro
---

<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../../en/.claude/commands/traspaso.md) · [Español](../../../es/.claude/commands/traspaso.md) · [中文](../../../zh/.claude/commands/traspaso.md) · [Deutsch](../../../de/.claude/commands/traspaso.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `.claude/commands/traspaso.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

Scrivi un passaggio di consegne perché qualcuno che **non era in questa conversazione** possa riprendere
questo lavoro senza perdere tempo. Può essere un'altra persona del team o tu stesso in una nuova sessione.

Per prima cosa guarda lo stato reale: branch attuale, modifiche non committate, cosa gira e cosa no.

Restituisci questo formato:

**Cosa stavo facendo** — una frase. L'obiettivo, non i passi.

**Dove è rimasto** — branch, file toccati, se ci sono modifiche non committate. Cosa funziona oggi e cosa no.

**Cosa bisogna sapere per non ripetere errori** — ciò che è costato caro in questa sessione: cosa si è provato e non
ha funzionato, quale ipotesi è risultata falsa, quale endpoint ha restituito vuoto e perché. **Questa è la parte
preziosa del passaggio di consegne**; senza di essa, chi prosegue ripete le stesse tre ore.

**Il prossimo passo concreto** — cosa fare, in quale file, e come saprai che ha funzionato.

**Cosa NON bisogna fare** — strade già scartate, con il motivo in mezza riga.

**Cosa non è verificato** — ciò che sembra funzionare ma nessuno ha controllato.

Salvalo in `docs/traspasos/<data-ora>-<tema>.md` e dimmi il percorso. Se la cartella non esiste, creala.
