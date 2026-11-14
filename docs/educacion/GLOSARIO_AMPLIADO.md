# Glosario ampliado

Continúa el glosario de [`AGENTS.md`](../../AGENTS.md) §7 (RA/Dec, época, movimiento propio, paralaje,
FITS/MEF, WCS, cutout, HiPS, LVF, enana marrón). Aquí solo van los términos **adicionales** que usan
`docs/09` y `docs/10`. Definiciones breves, preliminares y sin revisión disciplinar.

| Término | Qué es, en este proyecto |
|---|---|
| **ICRS / J2000** | Sistema de referencia de las coordenadas (ICRS) y época a la que están dadas (J2000.0). Las del catálogo SIMBAD están en J2000: hay que propagarlas a la fecha de observación |
| **Barrido (pasada)** | Una vuelta completa del cielo de la misión. Cada campo tiene 3–4 barridos (`docs/09`) |
| **SIA2** | Servicio estándar de búsqueda de imágenes por posición. IRSA lo usa para listar los archivos de SPHEREx |
| **PSF** | Respuesta del instrumento a una fuente puntual: cómo se "ensancha" una estrella. En SPHEREx es de 7,5–8,7″ y la extensión PSF hace pesar cada cutout ~3,9 MB (`docs/09`) |
| **Escala de píxel** | Tamaño angular de un píxel. En SPHEREx: 6,15″/px (`docs/09`) |
| **Bit de bandera** | Cada bit de `FLAGS` marca una condición del píxel (SOURCE, TRANSIENT, OVERFLOW…). Los nombres vienen en el header de FLAGS |
| **Saturación** | El detector se llena en una estrella muy brillante y el núcleo queda inválido. Falsea restas y centroides |
| **Reproyección** | Remuestrear una imagen a una grilla común (norte arriba). Imprescindible: el detector gira ~180° entre barridos |
| **Resta (`diff_first`, `diff_prev`)** | Diferencia entre épocas. Con 1–2 px de movimiento total, es la vista que lo muestra |
| **Co-add** | Suma de varias exposiciones, con pesos 1/varianza. Hace visible lo que una sola exposición no muestra (WISE 0855) |
| **Blink** | Alternar rápidamente imágenes de la misma zona en distintas épocas para ver lo que se mueve o cambia |
| **Zodi** | Luz zodiacal: fondo de luz solar dispersada por polvo del sistema solar. Se resta de la imagen (`IMAGE − ZODI`, `docs/10`) |

Glosarios completos del programa educativo (8.702 términos, sin revisar):
<https://github.com/vladimiracunadev-create/astronomy-astrophysics-space-sciences-aerospace-engineering-learning-program/tree/main/glosario>
