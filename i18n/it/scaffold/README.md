<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/scaffold/README.md) · [Español](../../es/scaffold/README.md) · [中文](../../zh/scaffold/README.md) · [Deutsch](../../de/scaffold/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `scaffold/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# scaffold/ — scheletro generico

**Scheletro iniziale, generico, su cui si costruisce il visualizzatore.** Il `backend/` resta un "hello world" di FastAPI (`/health`). Il `frontend/` non lo è più: dal 14 nov ha landing, visualizzatore e la via A (Aladin Lite + cubo HiPS di IRSA + Gaia + SIMBAD). Regole dell'evento: [`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md).

## A cosa serve

Perché all'ora 0 dell'evento tutti e sei possano avviare il progetto in cinque minuti e iniziare a
lavorare, invece di litigare con gli ambienti. **Se questo non parte su tutti e sei i computer, nessuno
avanza finché non parte.**

## Cosa c'è

```
scaffold/
├── backend/
│   ├── app/main.py          FastAPI con /health y CORS. Nada más
│   ├── tests/test_health.py Un test que comprueba que levanta
│   ├── requirements.txt     Solo lo del servidor
│   ├── requirements-astro.txt  Dependencias astronómicas (ver abajo)
│   └── Dockerfile
├── frontend/
│   ├── src/App.tsx          Landing y visor (ya no llama a /health)
│   ├── src/pages/           Landing y Visor
│   ├── src/sky/             Aladin Lite, planos del cubo, capas Gaia y SIMBAD
│   ├── src/state/           Estado ↔ URL
│   ├── src/content/         Textos y los 5 campos de prueba
│   ├── scripts/             comprobar_propagacion.mjs
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── Makefile
```

## Avviare

```bash
make backend    # una terminal
make frontend   # otra terminal
```

(`make dev` stampa soltanto queste istruzioni.) Oppure a mano:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Backend su <http://localhost:8000> (documentazione in `/docs`), frontend su <http://localhost:5173>.

## Su `requirements-astro.txt`

`astropy`, `numpy`, `pyvo`, `astroquery`, `pillow` e `matplotlib` sono pesanti e lenti da installare. Il file include anche `PyYAML`. **Mancano `reproject` e `scipy`**, che usa l'EDA (`eda/comun.py`) e di cui D2 ha bisogno per la griglia comune; aggiungerli è una modifica alle dipendenze in sospeso per D2/C.
Sono in un file a parte **solo per averli già scaricati prima dell'evento**: preparare l'ambiente
è legittimo, usarli per risolvere la sfida prima dell'inizio no.

```bash
pip install -r backend/requirements-astro.txt
```

## All'ora 0 dell'evento

1. Confermare che `make backend` e `make frontend` funzionino su tutti e sei i computer.
2. ~~Spostare `scaffold/backend` e `scaffold/frontend` nella radice~~ **Deciso (14 nov): restano in `scaffold/`** (`vercel.json` compila `scaffold/frontend`).
3. Fissare il contratto dell'API di [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) e far sì che V
   monti il mock per non aspettare il backend.
