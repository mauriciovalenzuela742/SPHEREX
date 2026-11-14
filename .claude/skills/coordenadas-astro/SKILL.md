---
name: coordenadas-astro
description: Coordenadas del cielo y su manejo sin equivocarse - ascensión recta y declinación, conversión entre sexagesimal y grados decimales, el factor 15 entre horas y grados, WCS de FITS y la conversión píxel-cielo con astropy, movimiento propio y cómo predecir dónde estará una estrella en otra época, resolución de nombres con SIMBAD, y los cinco campos de prueba del desafío. Actívala al parsear o validar coordenadas que entra un usuario, al convertir entre formatos, al trabajar con WCS o world_to_pixel, al calcular posiciones en otra fecha, o cuando se mencione RA, Dec, ICRS, J2000, sexagesimal, movimiento propio, paralaje, SIMBAD o los campos de prueba.
---

# Coordenadas del cielo sin meter la pata

---

## 1. El error que más veces se comete

**La ascensión recta se da en horas o en grados, y hay un factor 15 entre ambas.**

```
RA = 08h55m10.831s  →  8.9196753 horas  →  133.795129 grados
```

Si tratas `08h55m` como grados, apuntas a 112 grados de distancia del objeto. La consulta devuelve
imágenes perfectamente válidas de un trozo de cielo equivocado, y **nada falla**: no hay error, no
hay excepción, solo un resultado silenciosamente incorrecto.

La declinación sí está siempre en grados (−90 a +90). `-7d14m42.53s` son grados, arcominutos y
arcosegundos.

**Nunca parsees coordenadas a mano.** Usa `astropy.coordinates.SkyCoord`, que entiende casi todo:

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

SkyCoord("08h55m10.831s", "-07d14m42.53s", frame="icrs")
SkyCoord("08 55 10.831 -07 14 42.53", unit=(u.hourangle, u.deg))
SkyCoord(133.795129, -7.245147, unit="deg")
```

**Fíjate en `unit=(u.hourangle, u.deg)`**: es la pareja correcta cuando la RA viene en horas y la Dec
en grados, que es el caso habitual del formato sexagesimal.

### Validación de lo que entra el usuario

Acepta las cuatro formas y normaliza a grados decimales ICRS antes de hacer nada:

1. `133.795129 -7.245147` (grados decimales)
2. `08h55m10.831s -07d14m42.53s`
3. `08:55:10.831 -07:14:42.53`
4. `WISE 0855` (nombre → SIMBAD)

Regla práctica para distinguir 1 de 3 cuando llegan dos números sueltos: **si trae `h`, `:` o
espacios como separadores internos, es sexagesimal.** Si hay ambigüedad, pregúntale al usuario en vez
de adivinar. Un signo menos en la Dec se pierde con facilidad: compruébalo explícitamente.

Rangos válidos: RA ∈ [0, 360), Dec ∈ [−90, +90]. La RA envuelve en 360; la Dec no envuelve.

---

## 2. WCS: de píxel a cielo

El WCS está en el header FITS y traduce píxel ↔ coordenada.

```python
from astropy.wcs import WCS
from astropy.io import fits

with fits.open(ruta) as hdul:
    w = WCS(hdul["IMAGE"].header)

x, y = w.world_to_pixel(coord)      # devuelve 0-based
coord = w.pixel_to_world(x, y)
```

Tres trampas:

1. **`world_to_pixel` devuelve 0-based; los headers FITS son 1-based.** IRSA lo advierte
   explícitamente en la documentación de SPHEREx para el manejo de la PSF. Si ves desplazamientos de
   un píxel, es esto.
2. **En un MEF, cada extensión puede tener su propio WCS.** El de `IMAGE` no tiene por qué servir
   para la PSF.
3. **El WCS de un recorte no es el del original.** El servicio de cutouts de IRSA ajusta el WCS del
   recorte, pero mantiene claves como `CRPIX1A`/`CRPIX2A` que apuntan a la imagen original. Lee la
   skill `spherex-datos` antes de hacer cuentas con la PSF.

Distancia angular entre dos posiciones: `coord1.separation(coord2)`. No la calcules con Pitágoras
sobre RA y Dec: cerca de los polos está mal, porque un grado de RA no son un grado de arco.
El factor es `cos(dec)`.

---

## 3. Movimiento propio: dónde estará en otra fecha

Es el cálculo que permite superponer Gaia sobre una imagen de una época concreta, que es a la vez
una viñeta del desafío y la prueba de que el visor es correcto.

```python
from astropy.time import Time

c = SkyCoord(ra=..., dec=..., unit="deg",
             pm_ra_cosdec=... * u.mas/u.yr,
             pm_dec=... * u.mas/u.yr,
             obstime=Time("2016.0", format="jyear"))   # época del catálogo
c_en_2026 = c.apply_space_motion(new_obstime=Time("2026-10-02"))
```

- **Gaia DR3 tiene época de referencia J2016.0.** No J2000. Confundirlas mete un error de 16 años de
  movimiento propio.
- **WISE 0855−0714 no está en Gaia** (es demasiado fría y débil en el óptico). Para su overlay y su
  posición propagada usa CatWISE2020 (`catwise_2020` en IRSA), que trae movimientos propios; su época
  de referencia es ~MJD 57170 (~2015,4). Confirma unidades y época en el esquema de la tabla.
- `pm_ra_cosdec` ya incluye el factor `cos(dec)`. Los catálogos suelen darlo así; si tu fuente da
  `pmra` «crudo», conviértelo.
- Escala de magnitudes: 100 mas/yr son 0,1 arcsec por año. Con píxeles de ~6 arcsec como los de
  SPHEREx, hace falta **mucho** movimiento propio o varios años para ver un desplazamiento de un
  píxel. Por eso los objetos de prueba del desafío son los que son: están elegidos por tener
  movimiento propio enorme.

---

## 4. Resolver nombres

Para que la herramienta sea usable por cualquiera hay que aceptar «Barnard's Star», no solo números.

```python
SkyCoord.from_name("Barnard's Star")          # usa el servicio Sesame del CDS
```

o `astroquery.simbad`. Precauciones para una herramienta pública:

- **Siempre con tiempo límite y con manejo del fallo.** Son servicios externos y se caen.
  *(Comprobado el 14-nov-2026: el servicio del CDS en Estrasburgo estaba caído. El espejo del
  CfA, `simbad.cfa.harvard.edu`, sí respondía y sirve los mismos datos. **Ten los dos y cae del
  uno al otro.**)*
- **Cachea las respuestas.** Los cinco campos de prueba se resuelven una vez y se guardan.
- **Plan B:** una tabla local con los cinco campos de prueba y los objetos más pedidos
  (`data/campos_de_prueba.yml`), para que la demo nunca dependa de un servicio de terceros.

---

## 5. Los cinco campos de prueba

Son los que nombra el enunciado. **Funcionan como criterio de aceptación**: si el visor se comporta
bien en los cinco, está terminado.

Las coordenadas (verificadas el 14-nov-2026 contra SIMBAD), qué debería verse en cada uno y los
movimientos propios están en [`data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml).

**Dos trampas verificadas que están en ese archivo y conviene conocer antes de tocar código:**

1. **La coordenada que el enunciado da para WISE 0855 es de la época de WISE (~2010,4), no de
   hoy.** El objeto se mueve 8,15 arcsec por año: a finales de 2026 está a unos 130 arcsec de esa
   coordenada. Con un campo de 0,05 grados o menor, **apuntar a la coordenada del enunciado deja
   el objeto fuera del campo**, y el visor parece roto sin estarlo.
2. **`eps Ind B` (mayúscula) es el par de enanas marrones; `eps Ind b` (minúscula) es un
   planeta**, y está a 402 arcsec, en la posición de la estrella. El resolvedor de MAST, que no
   distingue mayúsculas, devuelve el planeta. Si tu resolución de nombres no distingue
   mayúsculas, apuntas al objeto equivocado.

**Y una expectativa que hay que tener desde el principio:** con una escala de píxel de 6,15
arcsec, incluso los objetos más rápidos del cielo se mueven **menos de un píxel entre dos barridos
consecutivos** de SPHEREx (separados 6 meses). Medido en el EDA (`docs/09`), en todo el período
disponible (1,0-1,4 años) se mueven 1,1-1,8 px. Eso significa usar la mayor base temporal disponible, no épocas
consecutivas, y le da mucho valor a la resta de imágenes y al zoom.

| Objeto | Qué demuestra |
|---|---|
| **WISE 0855** | Movimiento propio muy alto. **Caso obligatorio: se muestra siempre.** En una exposición suelta se ve débil; su movimiento (~1,3 px) se ve con la resta y con la suma por barrido (pendiente, D2; el overlay de CatWISE2020 está hecho en la rama `v/v2-catwise`, pendiente de PR, V2). Coordenadas del enunciado: de época 2010, usar la propagada |
| **Barnard's Star** | El mayor movimiento propio conocido. Se ve, pero satura: el movimiento es cualitativo |
| **Epsilon Indi B** | Par de enanas marrones. **Es donde el movimiento se ve más claro** (medido −0,85/−0,71 px; coincide con SIMBAD) |
| **RW Aurigae** | Variable: cambia de brillo. Satura y la resta deja un par rojo/azul aunque no se mueva: no es prueba de variabilidad |
| **R Draconis** | Variable de período largo y gran amplitud. Brillo sin medir (`docs/09`) |

La pareja «se mueve» / «solo cambia de brillo» es lo que demuestra que el visor distingue las dos
cosas. En el pitch conviene mostrar una de cada.

---

## 6. Lista de comprobación antes de dar una coordenada por buena

- [ ] ¿RA en grados o en horas? ¿Lo convertiste?
- [ ] ¿El signo de la Dec sobrevivió al parseo?
- [ ] ¿RA ∈ [0,360) y Dec ∈ [−90,90]?
- [ ] ¿El marco es ICRS? (J2000 e ICRS coinciden a efectos prácticos; galáctico no.)
- [ ] Si hay movimiento propio, ¿cuál es la época del catálogo? ¿Gaia es J2016.0?
- [ ] Si usaste WCS, ¿0-based o 1-based?
- [ ] **¿Verificaste contra una fuente externa?** Pegar la coordenada en SIMBAD o en Aladin y ver si
      cae donde debe cuesta treinta segundos y evita horas.
