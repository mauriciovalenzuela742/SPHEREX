<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/scaffold/README.md) · [Español](../../es/scaffold/README.md) · [中文](../../zh/scaffold/README.md) · **Deutsch** · [Italiano](../../it/scaffold/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `scaffold/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# scaffold/ — generisches Gerüst

**Generisches Ausgangsgerüst, auf dem der Viewer aufgebaut wird.** Das `backend/` ist weiterhin ein FastAPI-„Hello World“ (`/health`). Das `frontend/` ist es nicht mehr: Seit dem 14. Nov. hat es Landing, Viewer und Weg A (Aladin Lite + HiPS-Cube von IRSA + Gaia + SIMBAD). Regeln des Events: [`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md).

## Wofür es dient

Damit in Stunde 0 des Events alle sechs das Projekt in fünf Minuten hochfahren und mit der Arbeit
beginnen können, statt mit Umgebungen zu kämpfen. **Wenn das nicht auf allen sechs Rechnern hochkommt, kommt
niemand voran, bis es hochkommt.**

## Was es gibt

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

## Starten

```bash
make backend    # una terminal
make frontend   # otra terminal
```

(`make dev` gibt nur diese Anweisungen aus.) Oder von Hand:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Backend unter <http://localhost:8000> (Dokumentation unter `/docs`), Frontend unter <http://localhost:5173>.

## Zu `requirements-astro.txt`

`astropy`, `numpy`, `pyvo`, `astroquery`, `pillow` und `matplotlib` sind schwer und brauchen lange zur Installation. Die Datei enthält auch `PyYAML`. **Es fehlen `reproject` und `scipy`**, die die EDA (`eda/comun.py`) verwendet und die D2 für das gemeinsame Gitter braucht; sie hinzuzufügen ist eine ausstehende Abhängigkeitsänderung von D2/C.
Sie stehen in einer separaten Datei, **nur um sie vor dem Event herunterzuladen**: die Umgebung vorzubereiten
ist legitim, sie zur Lösung der Challenge vor dem Start zu verwenden nicht.

```bash
pip install -r backend/requirements-astro.txt
```

## In Stunde 0 des Events

1. Bestätigen, dass `make backend` und `make frontend` auf allen sechs Rechnern funktionieren.
2. ~~`scaffold/backend` und `scaffold/frontend` ins Stammverzeichnis verschieben~~ **Entschieden (14. Nov.): Sie bleiben in `scaffold/`** (`vercel.json` baut `scaffold/frontend`).
3. Den Vertrag der API aus [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) festlegen und V den Mock
   aufsetzen lassen, um nicht auf das Backend zu warten.
