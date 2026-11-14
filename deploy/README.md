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

Notas:
- `index.py` de cada carpeta solo agrega la subcarpeta al `sys.path` (equivale a `uvicorn --app-dir`);
  no cambia el código del backend.
- Caché en `/tmp` (lo único escribible en Vercel): se pierde entre instancias; la demo no depende de ella.
- Si agregas una dependencia de Python al backend, agrégala también a `deploy/<cual>/requirements.txt`
  (ojo con los `import` dentro de funciones, como `pyvo` en `app/irsa/sia2.py`).
