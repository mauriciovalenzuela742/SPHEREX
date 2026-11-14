<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../../en/biblio/fichas/wiseview-el-precedente.md) · **Español** · [中文](../../../zh/biblio/fichas/wiseview-el-precedente.md) · [Deutsch](../../../de/biblio/fichas/wiseview-el-precedente.md) · [Italiano](../../../it/biblio/fichas/wiseview-el-precedente.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `biblio/fichas/wiseview-el-precedente.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# Ficha: WiseView, el precedente directo

- **Referencia:** Caselden, Westin, Meisner, Kuchner, Colin (2018). *WiseView: Visualizing motion
  and variability of faint WISE sources.* Astrophysics Source Code Library, ascl:1806.004
- **Enlace:** <http://byw.tools/wiseview> · <https://ascl.net/1806.004>
- **Estado:** verificado (ASCL y blog de Backyard Worlds, 14-nov-2026). Autoría completa por confirmar
- **Por qué está primero:** es la herramienta que el enunciado del desafío nombra como modelo

## Qué dice, en tres frases

WiseView es una herramienta de navegador que hace parpadear coadds de WISE sobre una base temporal
de varios años; el usuario solo entra coordenadas y ajusta de forma interactiva el estiramiento, el
mapa de color y la velocidad del parpadeo. Nació como un apaño de dos voluntarios de Backyard Worlds
que querían clasificar mejor sus propios candidatos y comprobar si mostraban movimiento propio. Ha
permitido cientos de descubrimientos de candidatos a enana marrón, por aficionados y por profesionales.

## Qué nos sirve de aquí

1. **La forma de la interfaz está validada por el uso real.** Una caja de coordenadas, un parpadeo,
   tres controles. No hay que inventar nada: hay que portarlo a SPHEREx.
2. **Los controles no son adornos.** Estiramiento, color y velocidad son lo que convierte un borrón
   en un descubrimiento. Si se recortan por falta de tiempo, se recorta lo que hace útil la herramienta.
3. **Muestra coadds, no exposiciones sueltas.** Combinar antes de mostrar es lo que hace visibles las
   fuentes débiles. En SPHEREx el equivalente es sumar por detector o por rango de longitud de onda,
   que es justo lo que sugiere una de las viñetas del desafío.
4. **Tener API la convirtió en infraestructura.** Hay paquetes de terceros (`flipbooks`,
   `unWISE-verse`, del proyecto Cool Neighbors) construidos sobre la API de WiseView para generar
   material y subirlo a Zooniverse. **Ese es el listón de nuestra URL consultable**, que es otra
   viñeta explícita del desafío.

## Qué NO nos sirve (y por qué)

- **No tiene eje espectral.** WISE tiene cuatro bandas anchas; SPHEREx tiene 102 canales. Ahí está
  nuestro hueco: hacer lo mismo *más* el eje de longitud de onda.
- **Los datos de WISE no tienen el problema del filtro lineal variable.** En WISE, dos épocas de la
  misma posición son de la misma banda. En SPHEREx no. Copiar la lógica de parpadeo sin resolver eso
  produce una secuencia estroboscópica (ver `../../docs/02_DATOS_SPHEREX.md` §2).
- **unWISE precomputa los coadds.** WiseView es rápido porque alguien ya hizo el trabajo pesado. Para
  nosotros, eso equivale a precalentar la caché: no vamos a poder precomputar todo el cielo.

## Cifras que podemos citar

| Cifra | Valor | Dónde lo dice |
|---|---|---|
| Descubrimientos facilitados | «cientos de candidatos a enana marrón» | Registro ASCL 1806.004 |
| Base temporal | varios años de WISE/NeoWISE | ASCL y blog de Backyard Worlds |

**Cuidado:** no atribuir a WiseView el descubrimiento de Planet Nine. No se ha encontrado.

## Preguntas que deja abiertas

- ¿Es público el código del WiseView original? No lo confirmamos; sí lo son los paquetes derivados.
- ¿Qué parámetros expone exactamente su API? Mirarlo en `flipbooks` sale más barato que deducirlo.
- ¿Cuántas épocas muestra por defecto, y por qué ese número? Es una decisión de diseño que a nosotros
  nos va a tocar tomar.
