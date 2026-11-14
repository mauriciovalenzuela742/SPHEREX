<!-- i18n-header -->
> 🌐 **Lingua:** [English](../en/CONTRIBUTING.md) · [Español](../es/CONTRIBUTING.md) · [中文](../zh/CONTRIBUTING.md) · [Deutsch](../de/CONTRIBUTING.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `CONTRIBUTING.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Come lavoriamo in questo repository

Sei persone e i loro agenti, 24 ore, un branch `main` che deve sempre avviarsi.
Questo documento è breve di proposito.

## Le regole non negoziabili

1. **Nessuno fa push su `main`.** Né tu, né il tuo agente. Tutto entra tramite PR.
2. **Una PR la rivede una persona.** Non un agente. Guardare il diff costa due minuti e fa risparmiare ore.
3. **I branch vivono meno di 3 ore.** Se un branch dura di più, il compito era troppo grande.
4. **Il contratto dell'API si cambia prima in `docs/03_ARQUITECTURA.md`**, si avvisa il team, e
   solo dopo si tocca il codice.
5. **Niente FITS né dati scaricati nel repository.** Vanno in `data/cache/`.

## Branch

```
<iniziale-del-ruolo>/<tema-breve>
```

`d/sia2-epochs`, `v/panel-blink`, `c/verificar-campos`, `n/readme`.

Ruoli in [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md): **D** dati, **V** visualizzatore,
**C** scienza e verifica, **N** narrativa e consegna.

## Worktree: una cartella per persona

Due agenti sulla stessa cartella si sovrascrivono senza avvisare e senza che nessuno dei due te lo dica.

```bash
git worktree add -b d/sia2-epochs ../spherex-d main
cd ../spherex-d
```

## Commit

Imperativo, in spagnolo, una riga, senza cerimonie:

```
añade endpoint /api/epochs
corrige conversión de RA en horas a grados
documenta la estructura del MEF
```

## Cosa contiene una PR

Bastano tre righe:

```
Qué hace:
Cómo lo comprobé:
Qué NO comprobé:
```

**La terza riga è obbligatoria.** «Cosa NON ho verificato» è ciò che evita che qualcosa entri nella demo senza
che nessuno l'abbia guardato davvero.

## Prima di chiedere la revisione

- [ ] Funziona da pulito: frontend `cd scaffold/frontend && npm ci && npm run build && npm run preview`; backend `cd scaffold && docker compose up`.
- Se Vercel mostra *Blocked* sulla tua PR, è previsto (vengono compilati solo i commit di Mauricio; vedi README §2). Non fare il deploy tu.
- [ ] Se tocca coordinate o immagini, provato con **almeno un campo di `data/campos_de_prueba.yml`**.
- [ ] Non hai rotto nulla che già funzionava (`/chequeo-demo` se hai toccato l'interfaccia).
- [ ] Senza segreti, senza dati personali, senza FITS.

## Se rompi `main`

Lo dici ad alta voce, subito. Non lo sistemi in silenzio: ci sono altre tre persone che lavorano
su quello. Fare il revert è gratis; mezz'ora di tre persone a fare debug di qualcosa che già sapevi, no.
