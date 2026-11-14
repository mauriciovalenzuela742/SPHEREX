# scaffold/ — esqueleto genérico

**Esqueleto inicial, genérico, sobre el que se construye el visor.** El `backend/` sigue siendo un "hola mundo" de FastAPI (`/health`). El `frontend/` ya no lo es: desde el 14-nov tiene landing, visor y la vía A (Aladin Lite + cubo HiPS de IRSA + Gaia + SIMBAD). Reglas del evento: [`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md).

## Para qué sirve

Que en la hora 0 del evento los seis puedan levantar el proyecto en cinco minutos y empezar a
trabajar, en vez de pelear con entornos. **Si esto no levanta en los seis computadores, nadie
avanza hasta que levante.**

## Qué hay

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

## Arrancar

```bash
make backend    # una terminal
make frontend   # otra terminal
```

(`make dev` solo imprime estas instrucciones.) O a mano:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Backend en <http://localhost:8000> (documentación en `/docs`), frontend en <http://localhost:5173>.

## Sobre `requirements-astro.txt`

`astropy`, `numpy`, `pyvo`, `astroquery`, `pillow` y `matplotlib` pesan y tardan en instalarse. El archivo trae también `PyYAML`. **Le faltan `reproject` y `scipy`**, que usa el EDA (`eda/comun.py`) y que D2 necesita para la grilla común; agregarlos es un cambio de dependencias pendiente de D2/C.
Están en un archivo aparte **solo para dejarlos descargados antes del evento**: preparar el entorno
es legítimo, usarlos para resolver el desafío antes del inicio no lo es.

```bash
pip install -r backend/requirements-astro.txt
```

## En la hora 0 del evento

1. Confirmar que `make backend` y `make frontend` funcionan en los seis computadores.
2. ~~Mover `scaffold/backend` y `scaffold/frontend` a la raíz~~ **Decidido (14-nov): se quedan en `scaffold/`** (`vercel.json` construye `scaffold/frontend`).
3. Fijar el contrato de la API de [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) y que V
   monte el mock para no esperar al backend.
