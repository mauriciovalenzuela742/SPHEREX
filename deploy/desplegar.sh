#!/usr/bin/env bash
# Despliega en Vercel el backend oficial o el prototipo D2, desde lo que está en `main`.
# Uso (desde la raíz del repo, con `vercel login` hecho y acceso al equipo eMind):
#   bash deploy/desplegar.sh api        # scaffold/backend        → https://spherex-api.vercel.app
#   bash deploy/desplegar.sh prototipo  # prototipos/rango_fechas → https://spherex-prototipo-d2.vercel.app
# El frontend NO se despliega aquí: Vercel lo publica solo en cada merge a main.
set -euo pipefail
cual="${1:?usa: api | prototipo}"
case "$cual" in
  api)       nombre=spherex-api;          rutas="scaffold/backend/app data/campos_de_prueba.yml data/demo" ;;
  prototipo) nombre=spherex-prototipo-d2; rutas="prototipos/rango_fechas data/campos_de_prueba.yml" ;;
  *) echo "usa: api | prototipo" >&2; exit 1 ;;
esac
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git archive main $rutas | tar -x -C "$tmp"
find "$tmp" -name '*.ipynb' -delete
cp "deploy/$cual/index.py" "deploy/$cual/vercel.json" "deploy/$cual/requirements.txt" "$tmp/"
(cd "$tmp" && vercel deploy --prod --yes --scope e-mind --name "$nombre")
