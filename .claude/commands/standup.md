---
description: Sincronización de 5 minutos del equipo - qué funciona, qué está bloqueado, qué sigue
---

Prepara el reporte de sincronización de este frente. Se lee en voz alta en menos de un minuto.

1. Mira el estado real del trabajo: `git log --oneline -15`, `git status`, las ramas abiertas
   (`git branch -a`) y los PR si los hay. No te fíes de lo que se dijo antes en la conversación.
2. Si hay algo desplegado o corriendo, compruébalo de verdad antes de decir que funciona.

Devuelve exactamente este formato, sin adornos:

**Funciona** — lo que se puede abrir y mirar ahora mismo. Una línea por cosa. Si no se puede abrir
y mirar, no va aquí.

**Bloqueado** — qué está detenido, por qué, y **de quién depende destrabarlo**. Si nada está
bloqueado, escribe «nada».

**Próximos 90 minutos** — una sola cosa. Si son tres, es que no está decidido.

**Riesgo nuevo** — solo si apareció uno. Si no, omite esta línea.

Reglas de redacción: sin hashes de commit, sin rutas largas, sin jerga. Esto lo escuchan tres
personas que no estaban mirando tu pantalla. Primero la conclusión.

Al final, en una línea aparte: si algo que creíamos terminado resultó no estarlo, dilo. Es más útil
que cualquier avance.
