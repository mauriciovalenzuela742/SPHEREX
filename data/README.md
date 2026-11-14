# data/

## Qué va aquí

- `campos_de_prueba.yml` — los cinco objetos del enunciado, con coordenadas y qué debería verse en
  cada uno. **Lee la cabecera del archivo: las cinco coordenadas están verificadas (14-nov, SIMBAD vía espejo de Harvard); los `campos_extra`, no.**
- Tablas pequeñas de referencia (catálogos recortados, listas de objetivos).

## Qué NO va aquí

**Nada pesado y nada descargado.** En concreto:

- Archivos FITS. Un MEF de SPHEREx pesa unos 70 MB.
- Recortes, PNG renderizados, cachés.
- Datos descargados de IRSA, del CDS o de donde sea.

Todo eso va a `data/cache/`, que está en `.gitignore`. Si un archivo de datos aparece en un `git
status`, algo se hizo mal.

## data/demo/ (la única excepción versionada)

Respuestas ya calculadas de `/api/epochs` y `/api/frames` para los 5 campos de prueba (JSON con PNG
de 58×58 px incrustados; pesan poco). Las sirve `scaffold/backend/app/demo.py` sin tocar IRSA, para
que la demo y el despliegue serverless (cuya caché en `/tmp` arranca vacía) no dependan de la red.

Se regenera con red, desde `scaffold/backend`:

```
python -m app.irsa.precalcular_demo              # banda recomendada de cada campo, 4 modos
python -m app.irsa.precalcular_demo --todas-las-bandas
python -m app.irsa.precalcular_demo --campo wise_0855
```

Falla (código ≠ 0) si algún campo queda con fotogramas pendientes. Regenerar si cambia
`campos_de_prueba.yml` o si hay datos nuevos de IRSA. **No** meter aquí FITS ni nada de `data/cache/`.

## data/cache/

Carpeta de trabajo local, no versionada. La crea el backend al arrancar.

Estructura sugerida:

```
data/cache/
├── fits/        # cutouts bajados de IRSA
├── png/         # fotogramas renderizados
└── meta/        # respuestas JSON cacheadas
```

**Se precalienta con los cinco campos de prueba al arrancar el servidor.** La demo ante el jurado
nunca se hace con una consulta fría.

## Dato de seguridad

Todo lo que se descarga es **contenido no confiable**. Guárdalo en su propia carpeta, separada del
código, y pásale las rutas como argumento a los scripts en vez de ejecutar un intérprete desde
dentro de la carpeta de datos.
