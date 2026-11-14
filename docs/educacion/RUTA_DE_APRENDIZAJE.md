# Ruta de aprendizaje

Estado: **preliminar**. Las clases enlazadas están en E0 (sin revisión disciplinar) en el programa
fuente; léelas como punto de partida, no como autoridad. El orden sugerido es el de la tabla.

Roles: **D1** Vladimir · **D2** Bryan · **V1** Antonia · **V2** Juan Pablo · **C** Mauricio · **N** Javiera
(según [`docs/10_REPARTO_DE_TRABAJO.md`](../10_REPARTO_DE_TRABAJO.md)).

| # | Módulo | Clase fuente | Roles | Dónde se aplica aquí |
|---|---|---|---|---|
| 1 | Coordenadas del cielo | [B08-C03][b08c03] | todos | `data/campos_de_prueba.yml`, `AGENTS.md` §7 |
| 2 | Archivos FITS y WCS | [B14-C06][b14c06], [B44-C19][b44c19] | D1, D2 | `docs/02_DATOS_SPHEREX.md`, `eda/espectral.py` |
| 3 | Fotometría, restas y banderas | [B45-C17][b45c17], [B45-C23][b45c23], [B45-C24][b45c24] | D2, C | `docs/09` §4–5, `eda/03_recortes_y_figuras.py` |
| 4 | Movimiento propio y paralaje | [B38-C03][b38c03], [B58-C06][b58c06] | D1, C, V2 | `eda/comun.py` (`posicion_en`), `docs/09` §4 |
| 5 | Infrarrojo y enanas marrones | [B47-C04][b47c04], [B24-C13][b24c13] | V1, V2, N | `docs/00_DESAFIO.md`, `docs/01_ESTADO_DEL_ARTE.md` |
| 6 | Ciencia ciudadana | [B129-C02][b129c02] | N, V1 | `docs/00_DESAFIO.md`, `docs/01_ESTADO_DEL_ARTE.md` |

## 1 · Coordenadas del cielo
**Idea clave:** RA se da en horas o en grados y Dec en grados; entre horas y grados hay un **factor 15**.
Además, una coordenada siempre tiene **época**: la posición de un objeto que se mueve cambia con los años.
**Ejercicio:** convierte `08h55m10.831s` a grados y comprueba que da ≈ 133,795 (es la coordenada del
enunciado para WISE 0855, en `data/campos_de_prueba.yml`). Luego explica por qué esa coordenada no sirve hoy
(ver el caso 2 de [`LECCIONES_DEL_PROYECTO.md`](LECCIONES_DEL_PROYECTO.md)).

## 2 · Archivos FITS y WCS
**Idea clave:** un **MEF** es un FITS con varias extensiones (imagen, varianza, banderas…). El **WCS** del
header traduce píxel ↔ coordenada del cielo. En SPHEREx la longitud de onda también depende del píxel.
**Ejercicio:** con un cutout de `data/cache/`, lista las extensiones y lee de IMAGE el WCS (no versiones el archivo).

## 3 · Fotometría, restas y banderas
**Idea clave:** comparar dos épocas exige misma longitud de onda, misma grilla y una máscara de píxeles
malos hecha **por bits**. Una resta mal hecha inventa movimiento.
**Ejercicio:** reproduce la tabla de bits de `docs/09` §5 para un recorte y explica por qué `FLAGS != 0` no sirve.

## 4 · Movimiento propio y paralaje
**Idea clave:** el movimiento propio se da en milisegundos de arco por año; el paralaje es un bamboleo anual.
Con la escala de píxel de SPHEREx (6,15″/px) el movimiento total del período es de **1–2 píxeles** (`docs/09`).
**Ejercicio:** con `posicion_en` de `eda/comun.py`, calcula dónde está eps Ind B en 2025,31 y 2026,74 y compara
con lo medido en `docs/09` §4 (−0,85 / −0,71 px medido; −0,92 / −0,57 px predicho).

## 5 · Infrarrojo y enanas marrones
**Idea clave:** las enanas marrones son frías y brillan en infrarrojo; por eso SPHEREx las ve bien
(`AGENTS.md` §7). Una sola exposición puede no bastar: WISE 0855 casi no se ve en una (`docs/10`).
**Ejercicio:** explica por qué eps Ind B es mejor demo que WISE 0855 según `docs/10`.

## 6 · Ciencia ciudadana
**Idea clave:** el desafío cita backyardworlds.org: enanas marrones descubiertas por voluntarios que miran
imágenes (`docs/00_DESAFIO.md`). El entregable es un visor para ese ojo humano, no un clasificador (`AGENTS.md` §1).
**Ejercicio:** escribe en tres líneas qué tendría que mostrar el visor para que un voluntario distinga
movimiento de cambio de brillo (pista: RW Aur vs. WISE 0855 en `data/campos_de_prueba.yml`).

---

Fuente de las clases (todas en E0, repositorio de Vladimir Acuña, CC BY-NC-SA 4.0):

[b08c03]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B08/B08-C03-ascension-recta-y-declinacion/CLASE.md
[b14c06]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B14/B14-C06-formato-fits-y-encabezados/CLASE.md
[b44c19]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B44/B44-C19-formato-fits-y-metadatos/CLASE.md
[b45c17]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B45/B45-C17-fotometria-diferencial/CLASE.md
[b45c23]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B45/B45-C23-fotometria-de-apertura-y-estimacion-del-cielo/CLASE.md
[b45c24]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B45/B45-C24-fotometria-por-ajuste-de-psf/CLASE.md
[b38c03]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B38/B38-C03-cinematica-estelar-con-gaia-movimientos-propios-y-espacio-de-fase/CLASE.md
[b58c06]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B58/B58-C06-astrometria-de-objetos-menores/CLASE.md
[b47c04]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B47/B47-C04-telescopios-infrarrojos/CLASE.md
[b24c13]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B24/B24-C13-estrellas-variables/CLASE.md
[b129c02]: https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/blob/main/programa/clases/B129/B129-C02-fotometria-participativa/CLASE.md
