# Despliegue

Tres proyectos de Vercel (equipo eMind, plan Hobby), todos desde `main`:

| Proyecto | Qué es | URL | Cómo se actualiza |
|---|---|---|---|
| `spherex-planet-x` | El visor (`scaffold/frontend`) | https://spherex-planet-x-tau.vercel.app | **Solo**, en cada merge a `main` (`vercel.json` de la raíz) |
| `spherex-api` | Backend oficial (`scaffold/backend`: D1 Vladimir + D2 Bryan) | https://spherex-api.vercel.app | `bash deploy/desplegar.sh api` |
| `spherex-prototipo-d2` | Prototipo de Bryan (`prototipos/rango_fechas`) | https://spherex-prototipo-d2.vercel.app | `bash deploy/desplegar.sh prototipo` |

El visor llama a los otros dos por *rewrites* del mismo dominio (sin CORS): `/api/*` → `spherex-api`,
`/proto-api/*` → `spherex-prototipo-d2` (Modo Misión).

**Si cambias `scaffold/backend` o `prototipos/rango_fechas`, después del merge hay que correr el script**
(o pedírselo a Mauricio): esos dos proyectos no se actualizan solos, porque son Python y viven en subcarpetas.

## Límite del plan gratuito (lección del 14-nov)

El plan Hobby permite **100 despliegues por día** para todo el equipo eMind. El 14-nov se agotaron (89 del
visor, 42 de ellos vistas previas *Blocked* de PRs que igual contaban). Desde entonces `vercel.json` tiene
`git.deploymentEnabled: { "main": true, "**": false }`: **solo `main` se despliega**; las ramas no.
Cada quien prueba en local (`npm run dev` / `npm run build && npm run preview` en `scaffold/frontend`).

## Despliegue de emergencia desde otra cuenta de Vercel (sin pagar)

Si eMind no puede desplegar (límite diario), cualquier integrante publica `main` desde **su propia cuenta
gratuita** de Vercel, que tiene su propio cupo. Los *rewrites* de `vercel.json` siguen apuntando al backend y
al prototipo de eMind, que ya están desplegados: no hace falta tocarlos.

```bash
git clone https://github.com/mauriciovalenzuela742/SPHEREX
cd SPHEREX                      # la raíz: ahí está vercel.json
npx vercel@latest login         # con tu cuenta (GitHub o correo)
npx vercel@latest deploy --prod --yes --name astrotrack
```

La CLI construye `scaffold/frontend` (lo dice `vercel.json`), sube solo el frontend (`.vercelignore`) e
imprime la URL de producción (`https://astrotrack-….vercel.app` o el alias). Esa URL se manda al equipo y se
pone en el README. Para actualizarla después: `git pull` y el mismo `deploy --prod`.

Notas:
- `index.py` de cada carpeta solo agrega la subcarpeta al `sys.path` (equivale a `uvicorn --app-dir`);
  no cambia el código del backend.
- Caché en `/tmp` (lo único escribible en Vercel): se pierde entre instancias; la demo no depende de ella.
- Si agregas una dependencia de Python al backend, agrégala también a `deploy/<cual>/requirements.txt`
  (ojo con los `import` dentro de funciones, como `pyvo` en `app/irsa/sia2.py`).
