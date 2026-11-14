# 04 — Metodología: cuatro personas, cuatro agentes, 24 horas

El riesgo principal de un equipo de cuatro con agentes no es quedarse sin ideas: es **pisarse**.
Cuatro agentes escribiendo rápido sobre el mismo repositorio producen conflictos, código duplicado y
una rama `main` rota a las tres de la mañana. Este documento es el acuerdo para que eso no pase.

---

## Roles

Cuatro roles, cada uno dueño de unos archivos. (En este equipo de seis, D se parte en D1 acceso y D2
fotogramas, y V en V1 blink y V2 cielo; ver [`README.md`](../README.md) §3.) **Dueño** significa: esa persona decide, los demás
piden. No significa que trabaje sola.

### D — Datos (backend / IRSA)
Dueño de `scaffold/backend/app/irsa/`, `scaffold/backend/app/cache/`.
Consulta SIA2, baja cutouts, lee los MEF, agrupa por banda, resuelve el WCS y las longitudes de onda.
Es el camino crítico: **si esto no funciona, no hay proyecto.**
Perfil que calza: quien tenga más soltura con Python científico y con astronomía observacional.

### V — Visor (frontend)
Dueño de `scaffold/frontend/src/`.
Aladin Lite, el panel de blink, los controles (estiramiento, color, fps), la URL consultable.
Perfil que calza: quien tenga más soltura con web moderna.

### C — Ciencia y verificación
Dueño de `data/campos_de_prueba.yml`, `tests/`, `docs/`.
Comprueba que lo que se muestra es correcto: que el recorte es del cielo que dice, que el objeto
está donde Gaia predice, que el espectro no es un artefacto. **Es quien tiene permiso para decir
«esto está mal» sin tener que proponer el arreglo.**
Perfil que calza: quien tenga más criterio astronómico. En este equipo, naturalmente del lado de física.

### N — Narrativa y entrega
Dueño de `README.md`, la demo, el pitch y el formulario de entrega.
Empieza a trabajar **desde la hora 0**, no al final. El error clásico de los hackatones es dejar la
entrega para las últimas dos horas y descubrir que falta la mitad del formulario.
Perfil que calza: quien hable mejor en público, porque además es quien presenta.

> **Los roles no son jaulas.** A partir de la hora 12, cuando el camino crítico está destrabado, D y
> V se reparten las viñetas extra. Pero C y N **no se disuelven**: si nadie verifica y nadie prepara
> la entrega, el proyecto se entrega tarde y con errores.

---

## Cómo se coordina el código

**Trunk-based con ramas cortas.** `main` siempre levanta.

```bash
git switch -c d/sia2-epochs      # inicial del rol + tema
# ... trabajo ...
git push -u origin d/sia2-epochs
# PR. Lo mira otro. Se mergea.
```

Reglas:

1. **Nadie empuja a `main` directamente.** Ni tú ni tu agente.
2. **Las ramas viven menos de 3 horas.** Si una rama lleva más, es que la tarea era demasiado grande.
3. **Un PR lo revisa una persona, no un agente.** Mirar el diff toma dos minutos y evita horas.
4. **El contrato de la API se cambia primero en `docs/03_ARQUITECTURA.md`** y se avisa, antes de tocar
   código. Un cambio silencioso de contrato bloquea a otro sin que se entere.
5. **Nada de FITS en el repositorio.** `data/cache/` está en `.gitignore`.

### Worktrees: una carpeta por persona

Si dos personas (o dos agentes) trabajan en la misma carpeta, se sobreescriben sin aviso. Con
`git worktree` cada quien tiene su copia sobre el mismo repositorio:

```bash
git worktree add ../spherex-d d/sia2-epochs
cd ../spherex-d
```

Es la diferencia entre cuatro agentes colaborando y cuatro agentes peleando por los mismos archivos.

---

## El ciclo de 90 minutos

El hackatón se divide en bloques de 90 minutos. Al final de cada bloque, **cinco minutos de pie**,
todos, con el comando `/standup`:

1. **Qué quedó funcionando** — no «qué hice», sino qué se puede abrir y mirar.
2. **Qué está bloqueado y por quién.**
3. **Qué hago en los próximos 90.**

Cinco minutos. Sin pantallas. Si alguien necesita más, se habla aparte.

Por qué 90: es suficiente para terminar algo y corto para que un camino equivocado no cueste media noche.

---

## Cómo se usa un agente aquí

Esto es lo que separa a un equipo que usa agentes de uno al que los agentes le ganan.

**Una sesión por frente.** No mezcles el backend de datos con el frontend en una misma sesión de
Claude Code. El contexto se contamina y el agente empieza a cometer errores tontos. Si cambias de
tema, sesión nueva, con `/traspaso` si hace falta llevarte el contexto.

**El agente propone, la persona decide.** Para cualquier cosa que toque más de dos archivos: plan
primero, aprobación después. En un hackatón la tentación de dejarlo correr es enorme y es la forma
más rápida de terminar con 2.000 líneas que nadie entiende a las 5 de la mañana.

**Verifica el artefacto, no el reporte.** Que el agente diga «ya funciona» es un dato, no un hecho.
Abre la URL. Mira la imagen. Cuenta las épocas. Esto no es desconfianza: es que el agente no puede
ver la pantalla.

**Cuando algo no sale a la tercera, cambia de enfoque, no de prompt.** Si llevas tres intentos
corrigiendo lo mismo, el problema no es cómo se lo pediste.

**Nunca dejes que un agente decida solo el alcance.** El alcance lo pone el equipo con el plan de
[`05_PLAN_24H.md`](05_PLAN_24H.md). Un agente, si le dejas, construye todas las viñetas del desafío
a medias en vez de tres completas.

**Usa los subagentes para lo que ensucia el contexto.** Buscar en la documentación de IRSA, probar
20 consultas SIA2, revisar la UI: eso va a `explorador-datos`, `revisor-cientifico` o
`revisor-interfaz`, que devuelven la conclusión sin la paja.

---

## Reparto entre Claude Code y Antigravity

Si en el equipo conviven las dos herramientas, el reparto por defecto es **por archivos**, nunca por
tema:

| Herramienta | Archivos |
|---|---|
| Claude Code | `backend/`, `tests/`, `docs/` |
| Antigravity | `frontend/` |

Dos agentes editando el mismo archivo se sobreescriben sin aviso, y ninguno de los dos te lo dirá.

---

## Definición de «terminado»

Una tarea está terminada cuando:

- [ ] Funciona con **al menos un campo real** de `data/campos_de_prueba.yml`.
- [ ] Otra persona la abrió y la vio funcionar.
- [ ] Lo que no quedó cubierto está dicho en voz alta (bandas que faltan, casos no probados).
- [ ] No rompió nada que ya funcionaba (`/chequeo-demo`).

No está terminada porque un agente dijo que lo está.

---

## Las tres paradas obligatorias

Son las únicas cosas que no se negocian, pase lo que pase con el código:

| Momento | Qué pasa |
|---|---|
| **T − 6 h** | **Congelación de alcance.** No se empieza nada nuevo. Solo se arregla y se pule lo que existe |
| **T − 4 h** | **Demo grabada.** El vídeo tiene que estar listo aunque la aplicación siga mejorando. Si después mejora, se regraba. Si no da tiempo, ya hay vídeo |
| **T − 2 h** | **Entrega subida.** Formulario completo, enlaces puestos, declaración de uso de IA escrita. Si queda tiempo, se edita; pero **ya está entregado** |

`T` es la hora de cierre de entregas del evento local. En el evento de Santiago, la organización
comunicó en vivo (14-nov) que es a las **11:00 del domingo** ([`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)).
Es el número que ordena todo lo demás.

El proyecto que gana no es el que tiene más código. Es el que llega entero.
