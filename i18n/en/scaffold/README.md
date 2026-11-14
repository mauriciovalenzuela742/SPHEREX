<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/scaffold/README.md) · [中文](../../zh/scaffold/README.md) · [Deutsch](../../de/scaffold/README.md) · [Italiano](../../it/scaffold/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `scaffold/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# scaffold/ — generic skeleton

**Initial, generic skeleton on which the viewer is built.** The `backend/` is still a FastAPI "hello world" (`/health`). The `frontend/` no longer is: since Nov 14 it has a landing page, a viewer and path A (Aladin Lite + IRSA HiPS cube + Gaia + SIMBAD). Event rules: [`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md).

## What it is for

So that in hour 0 of the event all six can bring the project up in five minutes and start
working, instead of fighting with environments. **If this does not come up on all six computers, nobody
moves forward until it does.**

## What is there

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

## Getting started

```bash
make backend    # una terminal
make frontend   # otra terminal
```

(`make dev` only prints these instructions.) Or by hand:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Backend at <http://localhost:8000> (documentation at `/docs`), frontend at <http://localhost:5173>.

## About `requirements-astro.txt`

`astropy`, `numpy`, `pyvo`, `astroquery`, `pillow` and `matplotlib` are heavy and slow to install. The file also carries `PyYAML`. **`reproject` and `scipy` are missing**, which the EDA uses (`eda/comun.py`) and which D2 needs for the common grid; adding them is a dependency change pending from D2/C.
They are in a separate file **only to have them downloaded before the event**: preparing the environment
is legitimate, using them to solve the challenge before the start is not.

```bash
pip install -r backend/requirements-astro.txt
```

## In hour 0 of the event

1. Confirm that `make backend` and `make frontend` work on all six computers.
2. ~~Move `scaffold/backend` and `scaffold/frontend` to the root~~ **Decided (Nov 14): they stay in `scaffold/`** (`vercel.json` builds `scaffold/frontend`).
3. Fix the API contract from [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) and have V
   set up the mock so as not to wait for the backend.
