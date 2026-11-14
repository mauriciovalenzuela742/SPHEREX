# WISE 0855: movimiento medido en SPHEREx (14-nov-2026)

Respaldo de `docs/hallazgos/2026-11-14_wise0855_movimiento.md`.

- `raw/b{5,6}_v{0..4}.json`: recortes de 30×30 px (6,15″/px, norte arriba, este a la izquierda) de las 5 visitas
  de las bandas D5 y D6, cada uno con hasta 10 exposiciones combinadas. Se bajaron del prototipo desplegado:
  `https://spherex-planet-x-tau.vercel.app/proto-api/frame?ra=133.759765&dec=-7.242186&band=5&visit=0&size=0.05&per_visit=10`
  (cambiando `band` y `visit`). Los datos van en `data` como float32 little-endian en base64.
- `analiza.py`: ajuste gaussiano de la posición en cada recorte. `python analiza.py raw/b5_v*.json`
- `pm.py`: recta de la posición contra el tiempo y movimiento propio. `python pm.py`
- `refs.py`: estrellas de referencia del recorte. `imgs.py`: genera las imágenes de `docs/hallazgos/img/`.

Requiere numpy y scipy. Se corre desde esta carpeta.
