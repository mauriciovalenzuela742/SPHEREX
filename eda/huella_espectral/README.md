# Análisis exploratorio: huella espectral, limpieza de fondo y respuesta multiobjetivo en SPHEREx

Scripts y resultados reproducibles (en texto plano) para el hallazgo documentado en:
- [`../../docs/hallazgos/huella_espectral_wise0855.md`](../../docs/hallazgos/huella_espectral_wise0855.md) (español)
- [`../../docs/hallazgos/spectral_fingerprint_wise0855_en.md`](../../docs/hallazgos/spectral_fingerprint_wise0855_en.md) (inglés, para entrega)
- Figuras generadas en [`../../docs/hallazgos/img/`](../../docs/hallazgos/img/)

> **Política de binarios:** los archivos pesados (`.npz`, recortes FITS/calibrados y pilas 2D) **no se suben a git**; viven fuera del repositorio en `D:\dev\informes_v2\huella_espectral\`. Aquí se versionan únicamente el código, el entorno necesario y los JSON con las cifras verificadas.

---

## Entorno y carpeta de datos

- **Intérprete Python:** `D:\Users\juanp\OneDrive\Escritorio\Proyectos\hackaton_nasa_2026\spherex_kit\.venv\Scripts\python.exe` (Python 3.11 + `numpy`, `scipy`, `astropy`, `pyvo`, `matplotlib`).
- **Carpeta de datos por defecto:** `D:\dev\informes_v2\huella_espectral` (contiene `cajas/<id>/*.npz`, `pilas_<id>.npz`, `limpieza_wise0855.npz`, `fuentes_<id>.json`, `huella_<id>.json` e `ids_wise_0855.json`).

---

## Flujo completo de reproducción (en orden)

Conviene ejecutar desde `D:\dev\spherex-v2-huella\eda\huella_espectral\` pasando la carpeta de datos como primer argumento cuando corresponda:

```powershell
$PY = "D:\Users\juanp\OneDrive\Escritorio\Proyectos\hackaton_nasa_2026\spherex_kit\.venv\Scripts\python.exe"
$DATA = "D:\dev\informes_v2\huella_espectral"

# 1. Descarga de recortes calibrados SPHEREx nivel 2 (IRSA SIA2 + cutouts 23x23 px)
& $PY bajar.py

# 2. Apilado por pasada en grupos espectrales (corto B1-3, medio B4, largo B5-6) a rejilla 3,075"/px
& $PY paso1_apilar.py wise_0855
& $PY paso1_apilar.py eps_ind_b
& $PY paso1_apilar.py barnard
& $PY paso1_apilar.py rw_aur
& $PY paso1_apilar.py r_dra

# 3. Deteccion ciega por pasada + separacion cromatica conjunta en mezclas
& $PY paso2_detectar.py wise_0855
& $PY paso2_detectar.py eps_ind_b
& $PY paso2_detectar.py barnard
& $PY paso2_detectar.py rw_aur

# 4. Espectros forzados en 12 bines (0,75-5,0 um), distancia espectral D y emparejamiento
& $PY paso3_huella.py wise_0855
& $PY paso3_huella.py eps_ind_b
& $PY paso3_huella.py rw_aur

# 5. Verificacion aritmetica y busqueda ciega en WISE 0855
& $PY verificar_cifras.py $DATA
& $PY busqueda_ciega.py $DATA

# 6. Evaluacion unificada en los 5 objetivos oficiales del desafio
& $PY cinco_objetos.py $DATA

# 7. Limpieza ciega de estrellas de fondo en WISE 0855 (PSF estatica vs resta espectral directa)
& $PY limpieza_fondo.py $DATA

# 8. Analisis del fondo real del cielo (sin restar mediana, 1.918 exposiciones) y residuos PSF
& $PY analisis_fondo.py $DATA

# 9. Generacion de figuras 16:9 en ingles y espanol (fig1 a fig4 -> ../../docs/hallazgos/img/)
& $PY figuras_pitch.py $DATA ..\..\docs\hallazgos\img
```

---

## Inventario de archivos en esta carpeta

| Archivo | Rol | Salida principal |
|---|---|---|
| `comun_h.py` | Carga de recortes, agrupamiento de pasadas (`>30 d`), calibración y astrometría básica | Módulo auxiliar |
| `bajar.py` | Descarga de recortes `23×23` px desde IRSA por objeto | `cajas/<id>/*.npz` |
| `paso1_apilar.py` | Apila exposiciones por pasada y grupo espectral en rejilla común `41×41` | `pilas_<id>.npz` |
| `paso2_detectar.py` | Detección ciega + separación por desplazamiento cromático entre bandas (incluye tolerancia a grupos faltantes) | `fuentes_<id>.json` |
| `paso3_huella.py` | Fotometría PSF forzada en `12` tramos, métrica espectral $D$ y emparejamiento multipasada (`>=2` pasadas) | `huella_<id>.json` |
| `q1_forma.py`, `q2_movimiento.py`, `barnard_simple.py`, `resumen.py` | Exploraciones rápidas previas de constancia espectral, movimiento propio/paralaje y Barnard | `q1_resultados.json`, `q2_resultados.json`, `barnard_simple.json` |
| `verificar_cifras.py` | Recalcula fechas, pasadas, $D$, movimiento medido vs predicho y repetibilidad en WISE 0855 | [`cifras_verificadas.json`](cifras_verificadas.json) |
| `busqueda_ciega.py` | Compara emparejamiento mutuo por posición vs por huella espectral sin usar posición objetivo | [`busqueda_ciega_resultado.json`](busqueda_ciega_resultado.json) |
| `cinco_objetos.py` | Pipeline unificado en `wise_0855`, `eps_ind_b`, `barnard`, `rw_aur` y `r_dra` (`1.918` exposiciones) | [`cinco_objetos_resultado.json`](cinco_objetos_resultado.json) |
| `limpieza_fondo.py` | Limpieza por resta PSF de estáticas ciegas y por resta espectral directa $I_{\text{largo}} - \alpha\,I_{\text{corto}}$ | [`limpieza_fondo_resultado.json`](limpieza_fondo_resultado.json) + `limpieza_wise0855.npz` (fuera de git) |
| `analisis_fondo.py` | Espectro de fondo zodiacal/galáctico sin restar mediana, residuos 2D PSF y cobertura nebular | [`analisis_fondo_resultado.json`](analisis_fondo_resultado.json) |
| `figuras.py`, `figuras_pitch.py` | Figuras originales y figuras finales `16:9` en EN y ES (`fig1` a `fig4`) | `../../docs/hallazgos/img/huella_espectral_fig*.png` |
