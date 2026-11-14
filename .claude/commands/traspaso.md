---
description: Traspaso de contexto para que otra persona o una sesión nueva retome este trabajo
---

Escribe un traspaso para que alguien que **no estuvo en esta conversación** pueda retomar este
trabajo sin perder tiempo. Puede ser otra persona del equipo o tú mismo en una sesión nueva.

Primero mira el estado real: rama actual, cambios sin commitear, qué corre y qué no.

Devuelve este formato:

**Qué estaba haciendo** — una frase. El objetivo, no los pasos.

**Dónde quedó** — rama, archivos tocados, si hay cambios sin commitear. Qué funciona hoy y qué no.

**Lo que hay que saber para no repetir errores** — lo caro de esta sesión: qué se probó y no
funcionó, qué supuesto resultó falso, qué endpoint devolvió vacío y por qué. **Esta es la parte
valiosa del traspaso**; sin ella, el que sigue repite las mismas tres horas.

**El siguiente paso concreto** — qué hacer, en qué archivo, y cómo sabrás que funcionó.

**Lo que NO hay que hacer** — caminos ya descartados, con el motivo en media línea.

**Qué no está verificado** — lo que parece funcionar pero nadie comprobó.

Guárdalo en `docs/traspasos/<fecha-hora>-<tema>.md` y dime la ruta. Si la carpeta no existe, créala.
