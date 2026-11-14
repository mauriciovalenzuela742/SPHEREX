<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/deploy/README.md) · [Español](../../es/deploy/README.md) · [中文](../../zh/deploy/README.md) · **Deutsch** · [Italiano](../../it/deploy/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `deploy/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Deployment

Drei Vercel-Projekte (Team eMind, Hobby-Plan), alle von `main`:

| Projekt | Was es ist | URL | Wie es aktualisiert wird |
|---|---|---|---|
| `spherex-planet-x` | Der Viewer (`scaffold/frontend`) | https://spherex-planet-x-tau.vercel.app | **Automatisch**, bei jedem Merge in `main` (`vercel.json` im Stammverzeichnis) |
| `spherex-api` | Offizielles Backend (`scaffold/backend`: D1 Vladimir + D2 Bryan) | https://spherex-api.vercel.app | `bash deploy/desplegar.sh api` |
| `spherex-prototipo-d2` | Prototyp von Bryan (`prototipos/rango_fechas`) | https://spherex-prototipo-d2.vercel.app | `bash deploy/desplegar.sh prototipo` |

Der Viewer ruft die beiden anderen über *Rewrites* derselben Domain auf (ohne CORS): `/api/*` → `spherex-api`,
`/proto-api/*` → `spherex-prototipo-d2` (Modo Misión).

**Wenn du `scaffold/backend` oder `prototipos/rango_fechas` änderst, muss nach dem Merge das Skript ausgeführt werden**
(oder Mauricio darum gebeten werden): Diese beiden Projekte aktualisieren sich nicht von selbst, weil sie Python sind und in Unterordnern liegen.

Hinweise:
- Die `index.py` jedes Ordners fügt nur den Unterordner zum `sys.path` hinzu (entspricht `uvicorn --app-dir`);
  sie ändert den Backend-Code nicht.
- Cache in `/tmp` (das Einzige, was auf Vercel beschreibbar ist): geht zwischen Instanzen verloren; die Demo hängt nicht davon ab.
- Wenn du dem Backend eine Python-Abhängigkeit hinzufügst, füge sie auch zu `deploy/<cual>/requirements.txt` hinzu
  (Vorsicht bei `import`s innerhalb von Funktionen, wie `pyvo` in `app/irsa/sia2.py`).
