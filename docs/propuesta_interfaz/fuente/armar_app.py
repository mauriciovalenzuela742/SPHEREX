"""Arma ../maqueta/index.html: la plantilla de la maqueta con las imágenes reales incrustadas.

Uso: python armar_app.py   (las PNG las generan maqueta_imagenes.py y maqueta_bandas.py en ./img)
"""
import base64
import io
import json
from pathlib import Path

from PIL import Image

AQUI = Path(__file__).resolve().parent
s = (AQUI / "maqueta_plantilla.html").read_text(encoding="utf-8")
imgs = {}
for q in sorted((AQUI / "img").glob("*.png")):
    b = io.BytesIO()
    Image.open(q).convert("RGB").save(b, "JPEG", quality=86)
    imgs[q.stem] = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
(AQUI.parent / "maqueta" / "index.html").write_text(s.replace("{{IMGS}}", json.dumps(imgs)), encoding="utf-8")
print(len(imgs), "imágenes")
