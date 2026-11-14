# scaffold/ — esqueleto genérico

**Aquí no hay nada del desafío.** Ni una línea que consulte IRSA, lea un FITS o pinte un fotograma.
Es un "hola mundo" de FastAPI y uno de Vite/React, más Docker y un Makefile: el equivalente a tener
el editor configurado. Ver [`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md).

## Para qué sirve

Que en la hora 0 del evento los cuatro puedan levantar el proyecto en cinco minutos y empezar a
trabajar, en vez de pelear con entornos. **Si esto no levanta en los cuatro computadores, nadie
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
│   ├── src/App.tsx          Una página que llama a /health
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── Makefile
```

## Arrancar

```bash
make dev
```

O a mano:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Backend en <http://localhost:8000> (documentación en `/docs`), frontend en <http://localhost:5173>.

## Sobre `requirements-astro.txt`

`astropy`, `numpy`, `pyvo`, `astroquery`, `pillow` y `matplotlib` pesan y tardan en instalarse.
Están en un archivo aparte **solo para dejarlos descargados antes del evento**: preparar el entorno
es legítimo, usarlos para resolver el desafío antes del inicio no lo es.

```bash
pip install -r backend/requirements-astro.txt
```

## En la hora 0 del evento

1. Confirmar que `make dev` funciona en los cuatro computadores.
2. Mover `scaffold/backend` y `scaffold/frontend` a la raíz como `backend/` y `frontend/`, o decidir
   que se quedan donde están. Lo que sea, pero **decidido y dicho**.
3. Fijar el contrato de la API de [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) y que V
   monte el mock para no esperar al backend.
