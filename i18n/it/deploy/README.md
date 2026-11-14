<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/deploy/README.md) · [Español](../../es/deploy/README.md) · [中文](../../zh/deploy/README.md) · [Deutsch](../../de/deploy/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `deploy/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# Deploy

Tre progetti Vercel (team eMind, piano Hobby), tutti da `main`:

| Progetto | Cos'è | URL | Come si aggiorna |
|---|---|---|---|
| `spherex-planet-x` | Il visualizzatore (`scaffold/frontend`) | https://spherex-planet-x-tau.vercel.app | **Da solo**, a ogni merge su `main` (`vercel.json` della radice) |
| `spherex-api` | Backend ufficiale (`scaffold/backend`: D1 Vladimir + D2 Bryan) | https://spherex-api.vercel.app | `bash deploy/desplegar.sh api` |
| `spherex-prototipo-d2` | Prototipo di Bryan (`prototipos/rango_fechas`) | https://spherex-prototipo-d2.vercel.app | `bash deploy/desplegar.sh prototipo` |

Il visualizzatore chiama gli altri due tramite *rewrite* dello stesso dominio (senza CORS): `/api/*` → `spherex-api`,
`/proto-api/*` → `spherex-prototipo-d2` (Modo Misión).

**Se modifichi `scaffold/backend` o `prototipos/rango_fechas`, dopo il merge bisogna eseguire lo script**
(o chiederlo a Mauricio): quei due progetti non si aggiornano da soli, perché sono Python e vivono in sottocartelle.

Note:
- L'`index.py` di ciascuna cartella aggiunge soltanto la sottocartella a `sys.path` (equivale a `uvicorn --app-dir`);
  non cambia il codice del backend.
- Cache in `/tmp` (l'unico percorso scrivibile su Vercel): si perde tra le istanze; la demo non ne dipende.
- Se aggiungi una dipendenza Python al backend, aggiungila anche a `deploy/<quale>/requirements.txt`
  (attenzione agli `import` dentro le funzioni, come `pyvo` in `app/irsa/sia2.py`).
