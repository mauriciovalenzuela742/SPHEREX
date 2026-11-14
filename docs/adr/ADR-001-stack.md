# ADR-001 — Stack del proyecto

- **Fecha:** 2026-11-14 (propuesta pre-evento)
- **Estado:** **propuesta** — se confirma o se corrige en la hora 1 del evento
- **Decide:** por firmar en la hora 0

## Contexto

Hay que construir una herramienta web pública en ~24 horas, con cuatro personas que programan y sus
agentes. Los datos están en el archivo IRSA/IPAC y las bibliotecas que saben leerlos
(`astropy`, `pyvo`, `astroquery`) existen **solo en Python**. El enunciado sugiere explícitamente
Astropy y Aladin.

Restricciones:

- 24 horas y una hora de cierre de entregas fija.
- Cuatro personas en paralelo: el trabajo tiene que poder separarse.
- Tiene que quedar una URL pública que el jurado pueda abrir.
- No hay presupuesto de infraestructura ni GPU utilizable para nada pesado.

## Opciones consideradas

| Opción | A favor | En contra | Costo |
|---|---|---|---|
| **Python/FastAPI + React/Vite + Aladin Lite** | Separa backend y frontend, dos personas en paralelo desde la hora 1; se ve como una herramienta pública; Aladin resuelve el cielo | Dos despliegues, CORS, un contrato que mantener | Medio |
| Streamlit | Todo en Python, se levanta en minutos | Difícil de pulir; no se ve como herramienta pública; el parpadeo fluido cuesta | Bajo |
| Front estático + Aladin Lite, sin backend | Despliegue trivial, nada que mantener | **Depende de que IRSA responda con CORS** (descartada el 14-nov: IRSA no da CORS fuera del HiPS, `docs/09`); no se puede recortar, normalizar ni restar del lado del servidor | Bajo, pero con un riesgo que no controlamos |

## Actualización 14-nov-2026 (equipo, en el evento)

- **Frontend: Vercel** (decidido por el equipo; también lo indicó la organización). Producción desde
  `main`, preview por PR. Responsable: C (Mauricio).
- **Los 5 campos de prueba se sirven precalculados como estáticos** desde Vercel: la demo no depende de IRSA.
- **`/api` para coordenadas arbitrarias:** pendiente hasta medir un cutout en el Bloque 1.
  Vercel Python Functions si cabe en el tiempo límite de la función (sin disco persistente: caché en
  memoria o almacenamiento externo); si no, contenedor con el mismo FastAPI detrás de `/api`.

## Decisión

**Python 3.11 + FastAPI en el backend; React + Vite + TypeScript con Aladin Lite v3 en el frontend.**
Caché en disco. Frontend estático en un CDN, backend en un contenedor.

El contrato de la API, que es lo que permite trabajar en paralelo, está en
[`../03_ARQUITECTURA.md`](../03_ARQUITECTURA.md).

## Consecuencias

**Fácil:** que D y V trabajen a la vez sin pisarse desde la primera hora; usar todo el ecosistema de
Astropy; cachear y normalizar del lado del servidor, que es lo que hace viable el parpadeo.

**Difícil:** hay que mantener un contrato y dos despliegues; CORS entre frontend y backend hay que
configurarlo bien una vez.

**Si nos equivocamos:** la Vía A (Aladin Lite cargando el cubo HiPS de DR1 directamente) **no depende
del backend**. Si el backend se cae o no llega a tiempo, esa parte sigue funcionando y hay algo que
mostrar. Ese es el seguro de esta decisión.

## Cuándo se revisa

**Hora 3 del evento**, con el checklist de datos de [`../02_DATOS_SPHEREX.md`](../02_DATOS_SPHEREX.md).
Si los cutouts resultan demasiado lentos o IRSA no responde con CORS, se revisa aquí y no después.
