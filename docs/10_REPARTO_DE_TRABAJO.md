# 10 — Qué le toca a cada uno después del EDA

El reparto lo fija el plan del equipo: [`README.md`](../README.md) §3 y [`05_PLAN_24H.md`](05_PLAN_24H.md)
(D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera). Este documento **no
reparte de nuevo**: baja a cada rol lo que el EDA ([`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)) mostró
con datos reales, con tareas concretas y cómo comprobarlas.

---

## Lo que el EDA cambia del plan

| El plan asumía | El EDA mostró | A quién afecta |
|---|---|---|
| Vía A: Aladin carga el cubo HiPS de DR1 de IRSA | **Sí carga** (`/data/hips/SPHEREx/spherex_allsky_cube`, CORS abierto; ya está en el visor desplegado). Pero es un mosaico de todas las épocas en PNG, a 12,9″/px: sirve de contexto y para las 102 bandas, no para el tiempo ni para medir flujos. La versión FITS que entrega SIA2 no sirve para recortes | **V2** |
| Verificar CORS en la hora 1 | **IRSA no responde con CORS** (SIA2 ni archivos): todo pasa por el backend. El CDS sí | D1, V2 |
| Medir un cutout decide Vercel Functions o contenedor | **7,3 s de mediana, 10,8 s p90, 29 s máximo**, ~3,9 MB, errores 503 a ratos | **C** (decide), D1 |
| Agrupar por banda | Además hay que **igualar la λ** entre épocas: dentro de un detector varía ~16 anchos de banda | D1, **D2** |
| Reproyectar a grilla común | Confirmado e imprescindible: el detector **gira ~180° entre barridos** | **D2** |
| `flagged_fraction` para «Contaminación» | `FLAGS != 0` marca el 72 % del recorte (bit SOURCE, que no es un error); los píxeles malos son ~4 % | **D2**, C, V1 |
| WISE 0855 es la demo principal | WISE 0855 es caso obligatorio y se muestra siempre, diciendo que en una sola exposición se ve débil (su movimiento se ve con la resta y con la suma por barrido). **eps Ind B** es donde el movimiento medido se ve más claro; Barnard se ve pero satura | C, N |
| El movimiento se ve en el blink | Es de **1–2 px en todo el período**: la resta (`diff_first`) es la vista que lo muestra | D2, V1, N |

## El flujo de datos, de punta a punta

```
 coordenada ─► [1 Buscar] ─► [2 Elegir épocas] ─► [3 Recortar + caché] ─► [4 Filtros y alineación]
               D1            D2 (λ igualada)       D1                      D2
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ▼
 [5 Restas y sumas] ─► [6 Imagen PNG] ─► API ─► [7 Visor]
   D2                    D2                      V1 blink y controles · V2 cielo, Gaia, espectro
```

**C (Mauricio)** verifica todo el camino y decide el despliegue; **N (Javiera)** lo cuenta.

---

## D1 · Vladimir — acceso a datos (cajas 1 y 3)

Base: `eda/01_inventario.py`, `eda/espectral.py` (`cabecera_imagen`, `pedir`).

- SIA2 a `spherex_dr1` y `spherex_qr3` **en paralelo** (1–3,5 s cada una). No se repiten archivos entre
  las dos; QR3 trae el barrido más reciente.
- Buscar con la **posición propagada** por movimiento propio: con la coordenada del enunciado,
  WISE 0855 queda fuera de un campo chico.
- Metadatos baratos: el header de IMAGE se baja con una petición **HTTP Range de ~35 KB** (fecha, WCS,
  detector). Con 6 en paralelo, ~0,1 s efectivo por archivo.
- Cutouts de 0,1° con reintentos y espera (hubo 503 que duraron 4 reintentos); 4 en paralelo como
  máximo. Un cutout más chico **no** es más rápido: la PSF viene entera.
- Caché por `(obs_id, detector, centro redondeado, size)` y precálculo de los 5 campos.
- **Listo cuando:** los 5 campos se sirven desde caché sin internet.

## D2 · Bryan — fotogramas: filtros, alineación y restas (cajas 2, 4, 5 y 6)

Base: `eda/02_longitud_de_onda.py`, `eda/03_recortes_y_figuras.py` (`elegir_lambda_igualada`,
`grilla_comun`, `BITS_MALOS`) y `eda/05_centroides.py`.

**Qué entra:** la lista de archivos de D1. **Qué sale:** fotogramas alineados + máscara + restas,
con `wavelength_um` y `flagged_fraction` por fotograma.

### Tareas, en orden

1. **Elegir épocas a λ igualada.** Un archivo por barrido, minimizando la dispersión de λ en el objeto
   (λ con la tabla `WCS-WAVE`, que es fija por detector). En WISE 0855 D5 baja de 0,47 µm a 0,035 µm.
2. **Máscara por bits.** El EDA invalida `TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, MISSING_DATA, HOT,
   COLD, NONLINEAR, PERSIST, OUTLIER`. Dudas: `HALO` (2,1 %) y `BLOOM` (0,8 %). **Nunca** `FLAGS != 0`.
   Los nombres de los bits vienen en el header de FLAGS (`MSKN`/`MSKM`/`MSKD`).
3. **Reproyección sin agrandar la máscara.** Imagen rellenada y máscara por separado (vecino más
   cercano para la máscara): con interpolación bilineal cada píxel malo contamina a sus vecinos y los
   huecos se agrandan a la vista.
4. **`IMAGE − ZODI`** y normalización entre épocas (hoy mediana y desviación estándar; probar escalar
   por el flujo de estrellas de campo).
5. **`diff_first` y `diff_prev`**, mapa divergente centrado en 0 y mismo rango para todas.
6. **Suma por barrido** con pesos `1/VARIANCE` (co-add): es lo que haría visible WISE 0855.
7. **Saturación.** Barnard y RW Aur saturan: el núcleo viene enmascarado (Barnard 44 de 49 píxeles) y
   la resta deja un par rojo/azul **aunque la estrella no se mueva** (RW Aur). Exponer un indicador
   de saturación para que V1 lo muestre.

### Cómo comprobarlo

| Prueba | Debe pasar |
|---|---|
| eps Ind B, D5, centroide última − primera | −0,92 / −0,57 px (oeste / norte) ± 0,2 px; el EDA midió −0,85 / −0,71 |
| Estrellas de campo no saturadas | Desplazamiento mediano < 0,2 px |
| Barnard, D2, resta | Par con el positivo hacia el **norte** (cualitativo: satura) |
| RW Aur, D3 | Marcada como saturada; si no, la resta engaña |
| `flagged_fraction` | ~4 % del recorte, no ~72 % |

## V1 · Antonia — visor del blink

Revisión de la maqueta contra los datos, punto por punto: [`diseno/REVISION_MAQUETA_V1.md`](diseno/REVISION_MAQUETA_V1.md).


- La **resta** es la vista que muestra el movimiento: el blink solo de 1–2 px apenas se nota. Hace
  falta zoom (el EDA usó recortes de 18×18 px ampliados).
- Mostrar siempre la **fecha y la λ** de cada fotograma: explican por qué cambia el brillo.
- Avisar cuando el objeto satura y mostrar la máscara como capa opcional.
- Estados de espera: un fotograma frío puede tardar 7–29 s.

## V2 · Juan Pablo — visor del cielo

> **Hecho en el PR #6 (fusionado el 14-nov):** deslizador de λ sobre los 102 planos (sin 50 y 51), marca
> del objeto y cuadro del recorte propagados a 2026, capa Gaia DR3 propagada (tope de 300 estrellas) y capa
> SIMBAD con rótulo al pasar y clic que elige posición. **Falta:** gráfico de bandas (con D2), clic →
> animación recortada, Spherix.

- **El cubo HiPS de IRSA carga en Aladin** y Mauricio ya lo dejó funcionando en `scaffold/frontend/src/sky/AladinView.tsx`
  (Aladin Lite 3.8.2, un plano por banda). Es un mosaico de todas las épocas, a 12,9″/px: contexto y
  102 bandas, no tiempo. El HiPS del CDS (QR2) queda como plan B.
- Para el **gráfico de bandas** el cubo no sirve (son PNG estirados, sin flujos); el espectro sale de
  los archivos de nivel 2 (la λ de cada uno ya se calcula en D2) o del Spectrophotometry Tool de IRSA.
- Overlay de Gaia propagado a la época: el EDA ya propaga con movimiento propio (`eda/comun.py`,
  `posicion_en`), y coincide con lo medido en eps Ind B.

## C · Mauricio — ciencia, verificación y despliegue

- **Dato para decidir dónde corre `/api`:** cutouts de 7,3 s de mediana y 29 s de máximo, 503 a ratos.
- Corregir en `data/campos_de_prueba.yml` la escala de píxel: **6,15″** (de SIA2), estaba 6,2 derivada.
- **`scaffold/frontend/src/content/campos.ts` tiene coordenadas J2000**, aunque su comentario dice
  «propagada». A 2026, WISE 0855 está a 212″ y Barnard a 270″ de esas coordenadas: con recortes de 0,1°
  (medio lado 180″) quedan **fuera del recorte**. Usar posiciones propagadas (el `/api/presets` de la
  rama de Bryan ya las entrega).
- Demo: los cinco objetos de prueba deben funcionar. WISE 0855 se muestra siempre (con la resta, y con la suma por barrido cuando exista; se dice que en una exposición suelta se ve débil); eps Ind B es donde el movimiento se ve más claro; Barnard se ve pero satura.
- Las pruebas de D2 de arriba son las de aceptación.

## N · Javiera — narrativa

- El mensaje honesto: «las estrellas más rápidas se mueven 1–2 píxeles en un año de SPHEREx; lo
  hacemos visible igualando el color, alineando y restando».
- Material listo: la presentación `docs/presentacion_eda/` y la figura `eda/figuras/01_lambda_vs_tiempo.png`.

---

## SpacePixels como verificación independiente (para D2 y C)

[SpacePixels](https://github.com/ppissias/SpacePixels) (BSD-2, Java 21, de escritorio) detecta
objetos en movimiento en **secuencias de FITS ya alineadas**, con blink, resta y «shift-and-stack».
Leído solo su README; **no se revisó el código ni se probó**.

- No se integra al visor (Java de escritorio).
- Sirve para comprobar la alineación: exportando los fotogramas alineados como FITS con WCS, debería
  marcar a eps Ind B como movedor y a las estrellas de campo como fijas.
- Su «shift-and-stack» es la idea para sumar WISE 0855 siguiendo su movimiento propio.
- Instalarlo es bajar software de un tercero: acordarlo en el equipo.
