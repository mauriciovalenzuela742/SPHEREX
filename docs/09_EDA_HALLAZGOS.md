# 09 — EDA: lo que dicen los datos reales (14-nov-2026)

Respuestas, con datos de IRSA, al checklist de la hora 1 ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §9).
Cada cifra sale de un archivo de [`../eda/resultados/`](../eda/resultados/) o de una figura de
[`../eda/figuras/`](../eda/figuras/); los scripts que las generan están en [`../eda/`](../eda/README.md)
y se pueden volver a correr.

---

## Resumen en diez líneas

1. **Datos hay de sobra.** Entre 258 y 2.514 archivos por campo de prueba, 3–4 barridos del cielo,
   **1,0 a 1,4 años de base temporal**. Hay que consultar **DR1 y QR3**: no se repiten archivos y
   QR3 trae el barrido más reciente (salvo WISE 0855, que aún no tiene QR3).
2. **El movimiento es de 1–2 píxeles en todo el período**, no un salto. Escala de píxel 6,15″
   (confirmada en SIA2), PSF de 7,5–8,7″. Barnard: 1,8 px; WISE 0855: 1,3 px; eps Ind B: 1,1 px.
3. **El movimiento se mide, en estrellas que no saturan.** En eps Ind B el centroide se desplaza
   −0,85 / −0,71 px (oeste / norte) entre 2025,31 y 2026,74; SIMBAD predice −0,92 / −0,57 px. Las
   estrellas brillantes (Barnard, RW Aur) **saturan**: su núcleo viene marcado como malo y la resta
   muestra un par rojo/azul **aunque no se muevan** (RW Aur). En ellas solo vale lo cualitativo.
4. **La λ del objeto cambia en todo el ancho del detector entre archivos** (~16 anchos de banda
   dentro de un mismo detector). Un blink que no la iguale mezcla 16 «colores» distintos.
5. **Pero igualarla es fácil:** en cada campo y detector hay decenas de pares de épocas con la misma
   λ (dentro de medio ancho de banda). Con selección «a λ igualada» la dispersión baja de 0,47 µm a
   0,005–0,04 µm.
6. **La λ se calcula sin bajar el archivo:** la tabla `WCS-WAVE` es fija por detector y el header
   de IMAGE se baja con una petición HTTP Range (~35 KB). ~1.900 archivos en ~2,5 minutos.
7. **La orientación gira ~180° entre barridos.** Hay que **reproyectar a una grilla común** (norte
   arriba) antes de parpadear o restar. Sin esto, la resta compara trozos de cielo distintos.
8. **Un cutout tarda 7 s de mediana (p90 11 s, máximo 29 s) y pesa ~3,9 MB sea del tamaño que sea**:
   casi todo es la extensión de PSF, que viene entera. Hubo errores 503 transitorios. **Sin caché no
   hay demo.**
9. **IRSA no responde con CORS**: el navegador no puede pedirle nada directo. **Todo pasa por el
   backend**, incluido el SIA2.
10. **El cubo de DR1 tiene dos versiones.** La que entrega SIA2 (`spherex_dr1_cube`) son FITS de
    ~320 MB por tesela que el servicio de recortes rechaza. **La versión HiPS sí carga en Aladin**
    (`irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`: teselas PNG, 102 planos, CORS
    abierto), y ya está en el visor desplegado. Son PNG para visualizar: no dan flujos para un espectro.
    *Corrección del 14-nov por la tarde: la primera versión de este documento decía que el cubo no
    servía para Aladin, porque solo se había probado la versión de SIA2.*

---

## 1. Inventario por campo

Fuente: `eda/resultados/inventario.json`, búsqueda SIA2 con radio 0,01° en la posición propagada
a 2025-11 (MJD 61000).

| Campo | DR1 | DR1 deep | QR3 | QR3 deep | Apuntados | Barridos | Primera → última | Base |
|---|---|---|---|---|---|---|---|---|
| WISE 0855 | 258 | 0 | 0 | 0 | 129 | 3 | 2025,34 → 2026,37 | 1,02 a |
| Barnard | 240 | 0 | 124 | 0 | 185 | 3 | 2025,62 → 2026,73 | 1,10 a |
| eps Ind B | 347 | 0 | 120 | 0 | 245 | 4 | 2025,31 → 2026,75 | 1,44 a |
| RW Aur | 226 | 0 | 110 | 0 | 168 | 3 | 2025,67 → 2026,71 | 1,04 a |
| R Dra | 422 | 1.233 | 126 | 733 | 1.273 | continuo | 2025,31 → 2026,74 | 1,42 a |

Lo que hay que saber de esta tabla:

- **Cada apuntado da 2 archivos**, uno de onda corta y uno de onda larga, siempre en pares
  **D1+D4, D2+D5, D3+D6** (el dicroico divide la luz; el mismo trozo de cielo cae en los dos).
- **Un barrido no es una época**: dura de 1 a 6 semanas y trae 7–20 visitas y ~50–60 apuntados,
  cada uno en otra λ. Para el video la unidad natural es el **barrido** (3–4 fotogramas), o la
  visita si se quiere más fotogramas a costa de mezclar λ.
- **R Dra está en un campo profundo** (cerca del polo norte de la eclíptica): observación casi
  continua. Es el campo para probar curvas de luz, no el típico.
- Todos los archivos consultados tienen `L2DQAFLG = Pass` (control de calidad de nivel 2).

## 2. La longitud de onda (el filtro lineal variable)

Fuentes: `eda/resultados/lambda_resumen.json`, `lambda_por_archivo.csv`, figura `01_lambda_vs_tiempo.png`.

- Dentro de un mismo detector, la λ del objeto recorre **todo** el rango del detector a lo largo de
  los archivos: ~16 anchos de banda. Ejemplo WISE 0855, D5: de 3,82 a 4,41 µm.
- En cada barrido SPHEREx vuelve a pasar el objeto por el filtro, así que **cada λ se repite cada
  ~6 meses**. Pares de épocas separadas más de 0,4 años con la misma λ: entre 18 y 196 por
  campo y detector.
- Validación: la interpolación propia de `WCS-WAVE` coincide con la de astropy (`WAVE-TAB`) en los
  6 detectores hasta el cuarto decimal.

Comparación directa en WISE 0855, D5 (figuras `02_wise_0855_*.png`):

| Selección | λ de los 4 fotogramas (µm) | Dispersión |
|---|---|---|
| Ingenua (primer archivo de cada barrido) | 4,295 · 3,821 · 4,047 · 3,835 | **0,474 µm** |
| A λ igualada | 4,145 · 4,153 · 4,153 · 4,180 | **0,035 µm** |

## 3. Geometría: orientación y alineación

Medido en los 25 recortes de `size=0.1` (59×59 px):

- Ángulo de posición del detector: alterna entre ~−160° y ~+19° (WISE 0855), ~−179° y ~+1°
  (Barnard), ~−28° y ~+154° (eps Ind B). Cerca del polo (R Dra), ángulos arbitrarios.
- El tamaño del recorte varía en ±1 px entre archivos (58 o 59).

**Consecuencia:** el backend reproyecta cada recorte a una grilla TAN común, norte arriba, a la
escala nativa (`reproject_interp` de la librería `reproject`). Implementado en
`eda/03_recortes_y_figuras.py` (`grilla_comun`, `panel`).

## 4. Qué se ve en cada campo

Figuras `eda/figuras/02_*.png`. Recortes de 0,1°, `IMAGE − ZODI`, reproyectados, estiramiento asinh.
El círculo naranjo es la posición propagada con el movimiento propio de SIMBAD a la fecha de cada archivo.

| Campo | Banda | ¿Se ve el objeto? | ¿Se ve el cambio? |
|---|---|---|---|
| Barnard | D2 (1,5 µm) | Sí, **saturada**: 30–44 de los 49 píxeles del núcleo marcados como malos | Par rojo arriba / azul abajo (hacia el norte, como su movimiento), pero no medible: el centroide no existe con el núcleo enmascarado |
| eps Ind B | D5 (3,86 µm) | Sí, sin saturar | **Sí, y medido**: −0,85 / −0,71 px contra −0,92 / −0,57 px predichos (ver abajo) |
| RW Aur | D3 (1,94 µm) | Sí, saturada (6–8 píxeles malos en el núcleo) | **Par rojo/azul aunque no se mueve**: es el efecto de la saturación y la máscara, no movimiento |
| R Dra | D4 | Sí | Pendiente medir brillo |
| WISE 0855 | D5 y D6 | **Apenas** en exposiciones sueltas | No en una sola exposición |

**WISE 0855 es caso obligatorio (objeto de prueba de la organización) y se muestra siempre, pero con exposiciones sueltas se ve débil**: es demasiado débil por
exposición. Para verla habría que sumar las exposiciones de cada barrido (la viñeta del desafío
«add together all the data taken by each of the six detector arrays»).

### Centroides: ¿el desplazamiento medido es el que predice SIMBAD?

Fuente: `eda/resultados/centroides.json` (`eda/05_centroides.py`). Primera y última época a λ igualada,
reproyectadas a la misma grilla; píxeles malos excluidos. x positivo = oeste, y positivo = norte.

| Campo | Medido (px) | Predicho (px) | Estrellas de campo (mediana, px) | Píxeles malos en el núcleo |
|---|---|---|---|---|
| eps Ind B | −0,85 / −0,71 | −0,92 / −0,57 | +0,05 / −0,37 (3 estrellas) | 1 y 0 de 49 |
| RW Aur | +0,73 / +1,22 | 0 / 0 | −0,01 / +0,07 (5 estrellas) | 6 y 8 de 49 |
| Barnard | no se puede (núcleo vacío) | +0,14 / +1,81 | −0,14 / +0,04 (8 estrellas) | 44 y 44 de 49 |

Lectura:

- **La alineación funciona:** las estrellas de campo se desplazan una o dos décimas de píxel (hasta
  0,37 px en eps Ind B, con solo 3 estrellas).
- **eps Ind B se mueve lo que tiene que moverse**, dentro de ~0,15 px en cada eje. Es la prueba
  cuantitativa de que λ igualada + reproyección + resta muestran movimiento real.
- **Las estrellas que saturan engañan.** El núcleo de Barnard y de RW Aur viene marcado como malo
  (OVERFLOW, TRANSIENT, SUR_ERROR). Al excluirlo, lo que queda es un anillo asimétrico y el
  centroide se corre: RW Aur «se mueve» 1,4 px sin moverse. En la resta aparece el mismo par
  rojo/azul que deja un objeto que sí se mueve. **El visor tiene que avisar cuando el objeto satura.**

## 5. Máscara de calidad (`FLAGS`)

Los nombres de los bits **vienen en el propio header** de `FLAGS` (tarjetas `MSKNnnnn` nombre,
`MSKMnnnn` máscara, `MSKDnnnn` descripción): no hace falta buscar la tabla 16 del suplemento.

Frecuencia en los 25 recortes:

| Bit | Nombre | % de píxeles | ¿Invalida el píxel? |
|---|---|---|---|
| 21 | SOURCE | **72,4 %** | **No**: marca que hay una fuente conocida. Es lo que queremos ver |
| 28 | HALO | 2,1 % | Discutible: halo transitorio alrededor de fuentes brillantes |
| 0 | TRANSIENT | 1,6 % | Sí |
| 2 | SUR_ERROR | 1,3 % | Sí |
| 26 | BLOOM | 0,8 % | Discutible |
| 19 | OUTLIER | 0,7 % | Sí |
| 6 | NONFUNC | 0,4 % | Sí |
| 17 | PERSIST | 0,3 % | Sí |
| 1 | OVERFLOW | 0,2 % | Sí |
| 11 | COLD | 0,1 % | Sí |

**Trampa:** `FLAGS != 0` marca el 72 % del recorte por culpa de SOURCE. Hay que usar una máscara
por bits. La que usa el EDA (`BITS_MALOS` en `eda/03_recortes_y_figuras.py`) enmascara ~4 % de los
píxeles, pero al reproyectar con interpolación bilineal los NaN se agrandan y en pantalla se ven
como bloques blancos (~15 %). Para el visor conviene **reproyectar la máscara por vecino más
cercano y rellenar** los píxeles malos, y mostrar la máscara como capa opcional.

## 6. Infraestructura

Fuente: `eda/resultados/infraestructura.json`, `latencia_cutouts.json`.

| Pregunta | Respuesta | Consecuencia |
|---|---|---|
| ¿IRSA responde con CORS? | **No** (SIA2 ni archivos) | Todo pasa por nuestro backend |
| Consulta SIA2 | 1–3,5 s por colección | Se puede hacer en vivo, 4 colecciones en paralelo |
| Header por HTTP Range | ~2 s, 35 KB; ~0,1 s efectivo con 6 en paralelo | Metadatos y λ de cientos de archivos en segundos |
| Cutout `size=0.1` | Mediana 7,3 s, p90 10,8 s, máx. 29 s; ~3,9 MB; 25 en 52 s con 4 hilos | Caché en disco obligatoria; precalentar los campos de la demo |
| ¿Cutout más chico es más rápido? | No: 0,02° pesa lo mismo (la PSF viene entera) | Pedir 0,1° siempre; más no cuesta |
| Errores | 503 transitorios; uno persistió 4 reintentos | Reintentos con espera y estado de error en la UI |
| Cubo DR1 por SIA2 (`spherex_dr1_cube`) | FITS 512×512×102, ~320 MB por tesela, píxel 12,9″; el cutout respondió 422 «lacks WCS» (y 503 en una segunda prueba) | No sirve para recortes ni para espectros al vuelo |
| **Cubo DR1 en HiPS** (`/data/hips/SPHEREx/spherex_allsky_cube`) | `properties` responde 200 con `Access-Control-Allow-Origin: *`; PNG, orden 5, 102 planos (los 50 y 51 vacíos), píxel 12,9″, publicado el 1-nov-2026 | **Carga en Aladin** (el visor desplegado lo usa). Es un mosaico de todas las épocas: sin eje de tiempo, y en PNG, sin flujos |
| HiPS de SPHEREx en el CDS | El MocServer lista `CDS/P/SPHEREx/QR2/D1`…`D6` (QR2, orden 7); `alasky` devolvió 404 el 14-nov incluso para DSS | Plan B si falla el de IRSA; no verificado |

## 7. Qué no se comprobó

- El brillo: no se midió fotometría en ningún campo (variabilidad de RW Aur y R Dra sin medir).
- Si el HiPS del CDS carga en Aladin Lite (servidor caído al momento de la prueba). Ya no es necesario: el de IRSA carga.
- Las colecciones `_deep` no se usaron en el análisis de λ (solo DR1 y QR3).
- Cómo medir la posición de una estrella saturada (ajuste de PSF a las alas, o usar un detector donde no sature).
- Sumar exposiciones de un barrido para ver WISE 0855.
- La resta de R Dra no se revisó con detalle. Los centroides se midieron solo en la primera y la última época.
