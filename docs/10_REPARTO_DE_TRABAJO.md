# 10 — Reparto de trabajo después del EDA

Propuesta. Toma los roles de [`04_METODOLOGIA.md`](04_METODOLOGIA.md) (D datos, V visor,
C ciencia y verificación, N narrativa) y los aterriza en lo que el EDA
([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)) mostró que hay que construir. Los nombres los pone
el equipo.

---

## Lo que el EDA cambió del plan

| Antes del EDA | Después del EDA |
|---|---|
| Vía A: Aladin carga el cubo HiPS de IRSA, sin backend | El cubo de IRSA no es un HiPS para Aladin. Para contexto se usa el **HiPS de SPHEREx del CDS** (QR2, por detector), por verificar |
| El frontend podría llamar a IRSA | **No hay CORS**: todo pasa por el backend |
| «Agrupar por banda» bastaba | Hay que **igualar la λ** entre épocas, no solo el detector |
| Parpadear recortes | Hay que **reproyectar** a una grilla común antes: la orientación gira 180° entre barridos |
| WISE 0855 es la demo principal | **eps Ind B** es la demo de movimiento medido (coincide con SIMBAD); Barnard se ve pero satura; WISE 0855 necesita sumar exposiciones |
| El movimiento salta a la vista | Es de 1–2 px en todo el período: **la resta es la vista principal**, no un extra |
| Cutouts lentos, «medir» | 7 s de mediana, 3,9 MB, 503 a ratos: **caché y precalentado obligatorios** |

## El flujo de datos, de punta a punta

Cada caja es un trozo que se puede construir y probar por separado. La flecha es el contrato.

```
 coordenada ─► [1 Buscar] ─► lista de archivos ─► [2 Elegir épocas] ─► archivos elegidos
                SIA2 dr1+qr3     (+ λ por Range)        por detector y λ
                                                              │
        ┌─────────────────────────────────────────────────────┘
        ▼
 [3 Recortar + caché] ─► FITS recortados ─► [4 Filtros y alineación] ─► cubo alineado
   cutouts IRSA, reintentos                  IMAGE−ZODI, máscara FLAGS,      (épocas × y × x)
                                             reproyección a grilla común
                                                              │
        ┌─────────────────────────────────────────────────────┘
        ▼
 [5 Diferencias y suma] ─► fotogramas ─► [6 Render PNG] ─► API ─► [7 Visor]
   diff_first, diff_prev,                  estiramiento,              blink, resta, controles,
   suma por barrido                        mismo corte para todos     Aladin con HiPS del CDS
```

## Frentes

### D1 — Búsqueda y selección (cajas 1, 2)
Dueño de `backend/app/irsa/`. Base: `eda/01_inventario.py`, `eda/espectral.py`, `eda/02_longitud_de_onda.py`.
- SIA2 a `spherex_dr1` + `spherex_qr3` en paralelo, con la posición propagada si hay movimiento propio.
- λ por archivo con HTTP Range + tabla `WCS-WAVE` por detector (cacheada).
- Selección: un archivo por barrido a λ igualada (`elegir_lambda_igualada`), por detector.
- **Listo cuando:** `/api/epochs` en Barnard devuelve 3 épocas en D2 con λ dentro de 0,01 µm (el EDA obtuvo 0,005 µm).

### D2 — Recortes y caché (caja 3)
Dueño de `backend/app/cache/`.
- Cutouts de 0,1° con reintentos y espera; 4 en paralelo como máximo.
- Caché en disco por `(obs_id, detector, centro redondeado, size)`.
- Precalentar los 5 campos de prueba al arrancar.
- **Listo cuando:** los 5 campos se sirven desde caché sin internet (modo degradado).

### F — Filtros, alineación y diferencias (cajas 4, 5) — **JP**
Base: `eda/03_recortes_y_figuras.py` (`grilla_comun`, `panel`, `BITS_MALOS`). Ver la sección siguiente.

### V — Visor (cajas 6 lado cliente, 7)
Dueño de `frontend/src/`. Trabaja contra el mock del contrato de [`03`](03_ARQUITECTURA.md) desde ya.
- Blink, selector de detector/λ, vista de resta, controles de estiramiento y velocidad.
- Aladin Lite con el HiPS `CDS/P/SPHEREx/QR2/D<n>` (**probarlo primero**: hoy el CDS respondía 404).
- La λ y la fecha de cada fotograma siempre visibles: explican lo que el usuario ve.

### C — Verificación científica
Dueño de `data/campos_de_prueba.yml`, `tests/`.
- Corregir en el YAML la escala de píxel (6,15″ confirmada, estaba como 6,2 derivada).
- Cambiar la demo principal a eps Ind B (movimiento medido) y Barnard (movimiento visible); WISE 0855 cuando exista la suma por barrido.
- Avisar en la interfaz cuando el objeto satura (núcleo con OVERFLOW): ahí la resta muestra pares aunque nada se mueva.
- Overlay de Gaia: dónde debería estar cada estrella en la fecha de cada fotograma.

### N — Narrativa y entrega
- El mensaje cambia: «el movimiento de las estrellas más rápidas del cielo, en 1 año de SPHEREx,
  es de 1–2 píxeles; lo hacemos visible con la resta a λ igualada». Es honesto y es un argumento.
- La figura de λ vs tiempo (`eda/figuras/01_lambda_vs_tiempo.png`) explica el filtro lineal
  variable mejor que cualquier texto.

---

## Frente F en detalle: filtros y diferencias (JP)

**Qué entra:** recortes FITS de un mismo detector a λ igualada (los da D2; mientras tanto, los de
`data/cache/eda/fits/` que deja el EDA).
**Qué sale:** un cubo alineado `(épocas, y, x)` + máscara + las diferencias, listo para renderizar.

### Tareas, en orden

1. **Máscara por bits.** Decidir qué bits invalidan el píxel. El EDA usa `TRANSIENT, OVERFLOW,
   SUR_ERROR, NONFUNC, MISSING_DATA, HOT, COLD, NONLINEAR, PERSIST, OUTLIER`. Dudas abiertas:
   `HALO` (2,1 %) y `BLOOM` (0,8 %) — en eps Ind B la máscara tapa el centro del objeto, así que
   probablemente no hay que enmascararlos sobre el objetivo. **Nunca** usar `FLAGS != 0` (SOURCE
   está en el 72 % de los píxeles).
2. **Reproyección sin agrandar la máscara.** Hoy los NaN se agrandan al interpolar. Reproyectar la
   imagen rellenada y la máscara por separado (vecino más cercano para la máscara).
3. **Resta de luz zodiacal** (`IMAGE − ZODI`) ya está; comprobar que el fondo queda cerca de 0.
4. **Normalización entre épocas** antes de restar: hoy mediana y desviación estándar. Probar
   escalar por el flujo de estrellas de campo (más robusto si la λ no es idéntica).
5. **Diferencias:** `diff_first` (cada época − la primera) y `diff_prev` (cada una − la anterior).
   Mapa divergente centrado en 0, mismo rango para todas.
6. **Suma por barrido:** promediar con pesos `1/VARIANCE` las exposiciones del mismo barrido y λ
   parecida. Es lo que haría visible WISE 0855 y es la viñeta del desafío sobre sumar detectores.
7. **Estrellas saturadas.** Ya se sabe por qué RW Aur deja un par rojo/azul sin moverse: el núcleo
   saturado viene enmascarado y lo que queda es un anillo asimétrico (`eda/resultados/centroides.json`).
   Falta decidir qué hace el visor: avisar, mostrar la máscara encima, o elegir un detector donde no
   sature. Las estrellas de campo no saturadas ya se alinean a una o dos décimas de píxel.

### Cómo comprobarlo

| Prueba | Debe pasar |
|---|---|
| eps Ind B, D5, centroide última − primera | −0,92 / −0,57 px (oeste / norte) ± 0,2 px; el EDA midió −0,85 / −0,71 |
| Estrellas de campo no saturadas | Desplazamiento mediano < 0,2 px |
| Barnard, D2, resta última − primera | Par con el positivo hacia el **norte** (cualitativo: satura) |
| RW Aur, D3 | Hoy deja un par rojo/azul por saturación: la prueba pasa cuando el visor **lo marca como saturada** |
| Fracción enmascarada | ~4 % del recorte; en el objetivo, mostrar la máscara en vez de esconderla |

### SpacePixels como verificación independiente

[SpacePixels](https://github.com/ppissias/SpacePixels) (licencia BSD-2, Java 21, aplicación de
escritorio) detecta objetos que se mueven y cambios de brillo en **secuencias de FITS ya
alineadas**, con blink, resta, búsqueda de movedores débiles por «shift-and-stack» y fotometría de
variables. Leído solo su README; **no se revisó el código ni se probó**.

- **No se integra al visor**: es Java de escritorio y nuestro stack es Python + web.
- **Sí sirve para comprobar el frente F**: si exportamos el cubo alineado como una secuencia de FITS
  monocromos (uno por época, con WCS), SpacePixels debería detectar a Barnard como movedor y a
  RW Aur como estacionaria. Si no, el error está en nuestra alineación, no en los datos.
- Su **shift-and-stack** es la técnica para la tarea 6 aplicada a WISE 0855: sumar épocas
  desplazándolas según el movimiento propio esperado. Vale la pena mirar cómo lo implementa.
- Antes de instalarlo: descargar el ejecutable de *Releases* es bajar software de un tercero;
  acordarlo en el equipo.
