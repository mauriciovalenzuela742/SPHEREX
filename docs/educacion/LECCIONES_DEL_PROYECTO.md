# Lecciones del proyecto

Ocho errores y correcciones **reales** de este repositorio, contados como casos de estudio. Todos salen de
documentos del equipo y se pueden comprobar abriendo la fuente que cada caso cita. Formato fijo:
*qué se creyó → qué mostraron los datos → cómo se evita*.

> Estado: preliminar. Si una cifra cambia en su fuente, **manda la fuente** y se corrige aquí.

## 1 · Horas no son grados
- **Se creyó:** que RA `08h55m10.831s` se podía usar como si fueran grados.
- **Los datos:** RA en horas y RA en grados difieren en un **factor 15**; es el error más común (`AGENTS.md` §7).
- **Se evita:** convertir siempre a grados decimales ICRS en el borde de la API; el contrato usa solo grados (`docs/03` §3).
- **Aprende más:** módulo 1 de la [ruta](RUTA_DE_APRENDIZAJE.md).

## 2 · La coordenada del enunciado es de otra época
- **Se creyó:** que la coordenada que da el desafío para WISE 0855 apunta al objeto hoy.
- **Los datos:** es de la época de WISE (~2010,4) y el objeto se mueve **8,15″ por año**: a finales de 2026 está
  a unos **122–134″** de ahí. Con `size` de 0,05° o menos, el objeto queda **fuera** del campo
  (`data/campos_de_prueba.yml`, campo `wise_0855`).
- **Se evita:** buscar con la **posición propagada** por movimiento propio (`posicion_en` en `eda/comun.py`; D1 en `docs/10`).

## 3 · `eps Ind B` no es `eps Ind b`
- **Se creyó:** que el resolvedor de nombres devolvería el par de enanas marrones.
- **Los datos:** la mayúscula es el par de enanas marrones; la minúscula es un **planeta** a 402″ (6,7′). El
  resolvedor de MAST no distingue mayúsculas y devuelve el planeta (`data/campos_de_prueba.yml`, `eps_ind_b`).
- **Se evita:** verificar siempre el objeto devuelto contra SIMBAD, no solo que "resolvió".

## 4 · Las longitudes de onda no son comparables a ojo
- **Se creyó:** que dos imágenes de la misma zona se podían parpadear sin más.
- **Los datos:** SPHEREx usa un filtro lineal variable (LVF): la λ depende de *dónde* cae el objeto en el
  detector. Entre archivos cambia ~**16 anchos de banda** (WISE 0855, D5: de 3,82 a 4,41 µm). Eligiendo
  épocas "a λ igualada", la dispersión baja de 0,47 µm a 0,005–0,04 µm (`docs/09`, resumen puntos 4–5 y §2).
- **Se evita:** `wavelength_um` obligatorio en cada fotograma (`docs/03` §3) y selección de épocas a λ igualada (D2).

## 5 · `FLAGS != 0` marca el 72 % del recorte
- **Se creyó:** que cualquier bandera distinta de cero era un píxel malo.
- **Los datos:** el bit SOURCE (**72,4 %**) solo indica que hay una fuente conocida. Los píxeles realmente malos son
  ~**4 %**. Y al reproyectar con interpolación bilineal los huecos se agrandan hasta ~15 % en pantalla (`docs/09` §5).
- **Se evita:** máscara **por bits** (`BITS_MALOS` en `eda/03_recortes_y_figuras.py`) y reproyectar la máscara por vecino más cercano.

## 6 · El cubo HiPS sí carga en Aladin (corrección del EDA)
- **Se creyó:** que el cubo de DR1 no servía para Aladin.
- **Los datos:** había dos "cubos". El de SIA2 son FITS de ~320 MB por tesela y no sirve. El **HiPS** de IRSA
  (PNG, 102 planos, 12,9″/px, CORS abierto) sí carga. El error vino de probar **una sola vía**
  (corrección del 14-nov en `docs/09`).
- **Se evita:** antes de concluir "no funciona", probar otra vía, colección o formato (`AGENTS.md` §2, regla 3).

## 7 · "Propagada" en el comentario, J2000 en el código
- **Se creyó:** que `campos.ts` guardaba posiciones propagadas, porque su comentario lo decía.
- **Los datos:** son J2000. A 2026 los objetos están a **212″** (WISE 0855), **270″** (Barnard) y **122″** (eps Ind B).
  Con un recorte de 0,1° (medio lado 180″), WISE 0855 y Barnard quedan fuera (traspaso V2, 14-nov).
- **Se evita:** verificar el artefacto, no el comentario (`AGENTS.md` §2, regla 2); usar `/api/presets`, que entrega posiciones propagadas (está en la rama `d/prototipo-rango-fechas` de D2, aún sin fusionar).

## 8 · Una estrella saturada "se mueve" sin moverse
- **Se creyó:** que un par rojo/azul en la resta significaba movimiento.
- **Los datos:** en RW Aur (6 y 8 píxeles malos en el núcleo) el centroide "se mueve" 1,4 px sin moverse; en
  Barnard, 44 de 49 píxeles del núcleo son inválidos. Solo eps Ind B mide el movimiento esperado
  (−0,85 / −0,71 px medido; −0,92 / −0,57 px predicho) (`docs/09` §4).
- **Se evita:** el visor debe avisar cuando el objeto satura; en esas estrellas solo vale lo cualitativo.

---

### Lo que estas lecciones tienen en común
Los casos 2, 3 y 7 venían de **dar por bueno algo que nadie había abierto**: un enunciado, un resolvedor, un
comentario. El 6 venía de una prueba incompleta. La regla del proyecto es la misma en todos:
**verifica el artefacto, no el reporte** (`AGENTS.md` §2).
