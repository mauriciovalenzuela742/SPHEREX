# ADR-001 — Stack del proyecto

- **Fecha:** 2026-11-14 (propuesta pre-evento)
- **Estado:** **propuesta**; actualizada el 14-nov con los datos del EDA (ver «Actualización 14-nov-2026, tarde»). **Pendiente de firma de C (Mauricio).**
- **Decide:** C (Mauricio); pendiente de firma

## Contexto

Hay que construir una herramienta web pública en ~24 horas, con seis personas que programan y sus
agentes. Los datos están en el archivo IRSA/IPAC y las bibliotecas que saben leerlos
(`astropy`, `pyvo`, `astroquery`) existen **solo en Python**. El enunciado sugiere explícitamente
Astropy y Aladin.

Restricciones:

- 24 horas y una hora de cierre de entregas fija.
- Seis personas en paralelo: el trabajo tiene que poder separarse.
- Tiene que quedar una URL pública que el jurado pueda abrir.
- No hay presupuesto de infraestructura ni GPU utilizable para nada pesado.

## Opciones consideradas

| Opción | A favor | En contra | Costo |
|---|---|---|---|
| **Python/FastAPI + React/Vite + Aladin Lite** | Separa backend y frontend, dos personas en paralelo desde la hora 1; se ve como una herramienta pública; Aladin resuelve el cielo | Dos despliegues, CORS, un contrato que mantener | Medio |
| Streamlit | Todo en Python, se levanta en minutos | Difícil de pulir; no se ve como herramienta pública; el parpadeo fluido cuesta | Bajo |
| Front estático + Aladin Lite, sin backend | Despliegue trivial, nada que mantener | **Depende de que IRSA responda con CORS** (descartada el 14-nov: IRSA no da CORS fuera del HiPS, `docs/09`); no se puede recortar, normalizar ni restar del lado del servidor | Bajo, pero con un riesgo que no controlamos |

## Actualización 14-nov-2026, tarde — decisión de despliegue (C, con los datos del EDA)

**Estado: propuesta de C (Mauricio), pendiente de visto bueno del equipo en el próximo standup.**

### Datos que deciden (EDA, `eda/resultados/latencia_cutouts.json`, `docs/09_EDA_HALLAZGOS.md`)

- Un cutout de 0,1° tarda **7,3 s de mediana, 10,8 s p90, 29 s máximo** (~3,9 MB), con **503 a ratos**.
- 25 cutouts con 4 hilos: **52 s** de pared. Un parpadeo completo «en vivo» no cabe en una espera razonable.
- **IRSA no responde con CORS** (ni SIA2 ni archivos): todo lo que no sea el cubo HiPS pasa por un backend.
- SIA2 a `spherex_dr1` y `spherex_qr3`: 1–3,5 s cada una; header por HTTP Range ~35 KB, ~0,1 s efectivo.

### Decisión

| Pieza | Dónde corre | Por qué |
|---|---|---|
| Frontend | **Vercel** (proyecto `spherex-planet-x`, equipo eMind, Hobby), producción desde `main` | Ya funciona; la organización lo indicó |
| **Los 5 campos de prueba** (la demo) | **Precalculados como estáticos** en `scaffold/frontend/public/precalc/<id>/` (JSON con la forma del contrato + PNG), generados por el script de D1 y versionados | La demo **nunca** espera a IRSA ni depende del wifi. Es también el modo offline |
| `/api/resolve`, `/api/epochs` | **Vercel Python Functions** en el mismo proyecto (`api/`) | 1–3,5 s: caben de sobra. Mismo dominio, sin CORS |
| `/api/frames` para coordenadas arbitrarias | **Vercel Python Functions, con presupuesto de tiempo**: baja en paralelo (4) lo que alcance, devuelve lo listo y `pending` con el resto; el frontend vuelve a pedir y va mostrando fotogramas a medida que llegan | Evita la espera de 52 s sin montar otro servicio |
| Plan B si las funciones no alcanzan (tiempo máximo, memoria de astropy/reproject, tamaño del paquete) | **El mismo FastAPI en un contenedor** (Render o Fly, capa gratuita) detrás de `/api` con un *rewrite* de Vercel | Cambiar de lugar no cambia el contrato |

Reglas que salen de esto:

- **Caché:** las funciones no tienen disco persistente (solo `/tmp` por instancia). No se diseña nada que
  dependa de la caché para la demo: para eso está el precalculado.
- **Tiempo máximo de función:** se fija con `maxDuration` en `vercel.json`. Antes de depender de un valor,
  **comprobar el máximo vigente del plan Hobby en la documentación de Vercel** (D1, en el primer despliegue de `api/`).
- **Objetos de la demo:** los cinco objetos de prueba deben funcionar. WISE 0855 es caso obligatorio y se
  muestra siempre, diciendo que en una exposición suelta se ve débil (su movimiento se ve con la resta y, cuando
  exista, con la suma por barrido de D2, pendiente, y el overlay de CatWISE2020 de V2, hecho en la rama `v/v2-catwise` y pendiente de PR). eps Ind B es donde el
  movimiento se ve más claro; Barnard se ve pero satura. Centrar siempre en la **posición propagada**, no en la J2000.
- **Despliegues:** Vercel Hobby solo construye commits de Mauricio; producción sale de sus merges.
  Ver README §2.

### Qué hace cada uno con esto

- **D1 (Vladimir):** script de precalculado de los 5 campos → `public/precalc/`; `api/` con `resolve` y `epochs`.
- **D2 (Bryan):** `frames` con presupuesto de tiempo y respuesta parcial (`pending`).
- **V1 (Antonia):** el blink lee primero `precalc/<id>/` si el campo es de prueba; si no, `/api/frames` con
  reintento y fotogramas que van apareciendo.
- **C (Mauricio):** medir el primer despliegue de `api/` y activar el plan B si no alcanza.

## Decisión

**Python 3.11 + FastAPI en el backend; React + Vite + TypeScript con Aladin Lite 3.8.2 en el frontend.**
Caché en disco. Frontend en Vercel (decidido el 14-nov). El backend para coordenadas arbitrarias: propuesta de C de la actualización de arriba (Vercel Python Functions con presupuesto de tiempo; plan B, el mismo FastAPI en un contenedor), con el tiempo de cutout medido: mediana 7,3 s, p90 10,8 s, máx. 29 s, ~3,9 MB sin importar el tamaño, 503 a ratos (`docs/09` §6). Los 5 campos de prueba se sirven precalculados como estáticos.

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

**Hora 3 del evento** (ya medido el 14-nov: ver `docs/09`), con el checklist de datos de [`../02_DATOS_SPHEREX.md`](../02_DATOS_SPHEREX.md).
Si los cutouts resultan demasiado lentos o IRSA no responde con CORS, se revisa aquí y no después.
