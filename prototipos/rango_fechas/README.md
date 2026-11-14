# Prototipo: ¿qué se movió entre dos fechas?

Prototipo aislado (no toca `scaffold/` ni el contrato de `docs/03`). Dado un punto del cielo, una banda y un
**rango de fechas**, pide a IRSA **solo los recortes necesarios** (una imagen por visita, opcionalmente la suma de
varias exposiciones de la visita), los alinea norte-arriba y muestra:

- **Parpadeo** entre visitas, con fecha y longitud de onda de cada fotograma.
- **Resta última − primera**: rojo = brillo que aparece, azul = brillo que estaba. Un par rojo/azul = movimiento.
- **Composición en color**: primera en rojo, última en cian.
- Tabla con la observación, la colección, la λ en el centro y el % de píxeles con contaminación (FLAGS).

Además, `eda_spherex.ipynb` es un **análisis exploratorio** de los datos: inventario, anatomía de un recorte,
efecto del filtro lineal variable, secuencia y restas, y comprobación del movimiento contra el movimiento propio.

## Cómo correrlo

Desde la raíz del repo:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
# abrir http://localhost:8010
```

Notebook: abrir `prototipos/rango_fechas/eda_spherex.ipynb` con el kernel del `.venv` y cambiar `CAMPO`.

Los recortes quedan en `data/cache/prototipo/` (ignorado por git). Nada se descarga entero.

## Explorador (`/explorar`)

Abrir http://localhost:8010/explorar.

- **Imagen grande** a la izquierda (cuadrada, lo más grande que quepa) y **barra a la derecha** con los filtros
  (objeto, RA/Dec, desde–hasta, bandas, campo, exposiciones por visita), la banda visible, el modo
  (imagen · resta vs t₀ · color), los datos de la imagen y miniaturas de todas las bandas y fechas.
- **Puntero de tiempo** bajo la imagen: las visitas están en su fecha real. Con solo pasar el mouse (o arrastrar)
  cambia la fecha; ←/→ visitas, ↑/↓ bandas, espacio reproduce. Junto a la fecha se ve Δt desde t₀ y la λ.
- **Carga progresiva:** primero las visitas (`/api/grid`), luego las imágenes de a una, t₀ y t_último primero.
- **Lector rápido por rangos HTTP** (por defecto): pide al archivo original solo las filas de IMAGE del recorte y
  la tabla WCS-WAVE de la cola; sin PSF. Barnard, 6 bandas, 28 imágenes: **8,7 s** (t₀ y t_último de las 6 bandas
  a los 3,7 s), frente a ~98 s con el servicio de recortes. No lee FLAGS (la contaminación sale "—") y resta la
  mediana en vez de ZODI (diferencia medida: 0,07 veces el ruido). Si falla, usa el servicio de recortes.
- **Si IRSA no responde**, se usan las búsquedas guardadas en `data/cache/prototipo/sia/` con un aviso; si el
  punto nunca se consultó, un mensaje claro (HTTP 503).

Los detectores van en pares que miran la misma zona (1+4, 2+5, 3+6) y cada par pasa por un punto en días
distintos: por eso en las miniaturas hay columnas donde solo dos bandas tienen imagen.

## API

| Ruta | Qué hace | Costo |
|---|---|---|
| `GET /api/presets` | Los 5 campos de prueba con la posición **propagada** por movimiento propio a hoy | nada |
| `GET /api/epochs?ra&dec&band&start&end` | Visitas disponibles (SIA2, sin imágenes) | ~2 s, ~0,2 MB |
| `GET /api/frames?ra&dec&band&start&end&size&max_visits&per_visit` | Fotogramas PNG + resta + color | ~4 MB y ~5–12 s por recorte la 1.ª vez; caché después |
| `GET /api/grid?ra&dec&bands=1,2,5&start&end` | Visitas por banda y columnas de fecha (sin imágenes) | ~2–5 s |
| `GET /api/frame?ra&dec&band&visit&start&end&size&per_visit&fast` | Un fotograma como float32 en base64 (~19 KB) | ~0,6–1 s con `fast=true` (defecto); ~11 s con `fast=false` |

La URL de la página refleja la consulta (`?ra=…&dec=…&band=…`), así que se puede compartir.

## Cómo se comprobó (14-nov-2026)

| Prueba | Resultado |
|---|---|
| Barnard, banda 2, 3 exp./visita | Se mide 1,44–1,50 px al **norte** vs 1,66–1,81 px predichos (error 1,3–2,3″) |
| WISE 0855, banda 5, 6 exp./visita | Se mide 1,30–1,32 px al **oeste** vs 1,31–1,34 px predichos (error 0,6–1,2″) |
| RW Aur (control sin movimiento), banda 3 | Se mide ≤ 0,22 px (≈ 0), como debe |
| λ desde `WCS-WAVE` | 2,288 µm en un recorte de banda 3 (1,63–2,41 µm): coherente |
| Flujo de una estrella vs fecha / vs λ | Salta sin orden por fecha y crece ordenado con λ: el efecto del filtro lineal variable |

## Hallazgos que importan para el proyecto

1. **Hay que reproyectar.** Cada recorte viene de un apuntado con otra orientación; sin alinear, el parpadeo rota.
2. **WISE 0855 no se ve en una exposición suelta** (113 s) en banda 5: hay que sumar 4–6 por visita.
3. **El bit `SOURCE` de FLAGS sale en ~100 % de los píxeles** de un campo poblado. Es informativo; si se cuenta
   como contaminación, todo parece inservible. Las definiciones de bits vienen en la cabecera (`MSKNnnnn`).
4. **IRSA devolvió 503 con 6 recortes en paralelo.** Con 3 y reintentos con espera, funciona.
5. **El recorte pesa ~4 MB pero la imagen útil son ~40 KB**: el resto es la PSF (`EPSF`), que viene entera siempre.
6. **Las épocas están a λ distintas** dentro de una misma banda (p. ej. 1,24–1,63 µm): parte del cambio de
   brillo es el filtro. La interfaz lo avisa.

## Qué NO está comprobado

- La interfaz no se probó en un navegador real con clics: se comprobaron la API y las imágenes que devuelve.
- eps Ind B y R Dra no se probaron.
- La medición de desplazamiento del notebook usa una ventana de 5 px para objetos débiles y 15 px para brillantes;
  con la ventana equivocada da resultados malos (comprobado con RW Aur). No es astrometría.
- No se corrige la paralaje (para Barnard son ~0,5″, menos de 0,1 px).
- El tiempo de respuesta en un despliegue (Vercel u otro) no se midió.
- Los bits de FLAGS que se enmascaran (`TRANSIENT`, `SUR_ERROR`, `NONFUNC`, `MISSING_DATA`, `HOT`, `COLD`,
  `OUTLIER`) son una elección razonable, no una recomendación oficial de IRSA.

---

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
