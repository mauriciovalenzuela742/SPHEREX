<!-- i18n-header -->
> 🌐 **Language:** **English** · [Español](../../es/deploy/README.md) · [中文](../../zh/deploy/README.md) · [Deutsch](../../de/deploy/README.md) · [Italiano](../../it/deploy/README.md)
> 🕒 **Documentation date:** 2026-11-14 15:35 · **Source:** `deploy/README.md`
> ⚠️ Machine-translated draft, pending native-speaker review.
<!-- /i18n-header -->

# Deployment

Three Vercel projects (eMind team, Hobby plan), all from `main`:

| Project | What it is | URL | How it is updated |
|---|---|---|---|
| `spherex-planet-x` | The viewer (`scaffold/frontend`) | https://spherex-planet-x-tau.vercel.app | **On its own**, on every merge to `main` (`vercel.json` at the root) |
| `spherex-api` | Official backend (`scaffold/backend`: D1 Vladimir + D2 Bryan) | https://spherex-api.vercel.app | `bash deploy/desplegar.sh api` |
| `spherex-prototipo-d2` | Bryan's prototype (`prototipos/rango_fechas`) | https://spherex-prototipo-d2.vercel.app | `bash deploy/desplegar.sh prototipo` |

The viewer calls the other two through same-domain *rewrites* (no CORS): `/api/*` → `spherex-api`,
`/proto-api/*` → `spherex-prototipo-d2` (Mission Mode).

**If you change `scaffold/backend` or `prototipos/rango_fechas`, after the merge you must run the script**
(or ask Mauricio): those two projects do not update on their own, because they are Python and live in subfolders.

Notes:
- The `index.py` in each folder only adds the subfolder to `sys.path` (equivalent to `uvicorn --app-dir`);
  it does not change the backend code.
- Cache in `/tmp` (the only writable place on Vercel): it is lost between instances; the demo does not depend on it.
- If you add a Python dependency to the backend, also add it to `deploy/<cual>/requirements.txt`
  (beware of `import`s inside functions, like `pyvo` in `app/irsa/sia2.py`).
