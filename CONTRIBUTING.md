# Cómo trabajamos en este repositorio

Cuatro personas y sus agentes, 24 horas, una rama `main` que tiene que levantar siempre.
Esto es corto a propósito.

## Lo no negociable

1. **Nadie empuja a `main`.** Ni tú, ni tu agente. Todo entra por PR.
2. **Un PR lo revisa una persona.** No un agente. Mirar el diff cuesta dos minutos y ahorra horas.
3. **Las ramas viven menos de 3 horas.** Si una rama lleva más, la tarea era demasiado grande.
4. **El contrato de la API se cambia primero en `docs/03_ARQUITECTURA.md`**, se avisa al equipo, y
   recién después se toca código.
5. **Nada de FITS ni de datos descargados en el repositorio.** Van a `data/cache/`.

## Ramas

```
<inicial-del-rol>/<tema-corto>
```

`d/sia2-epochs`, `v/panel-blink`, `c/verificar-campos`, `n/readme`.

Roles en [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md): **D** datos, **V** visor,
**C** ciencia y verificación, **N** narrativa y entrega.

## Worktrees: una carpeta por persona

Dos agentes sobre la misma carpeta se sobreescriben sin avisar y sin que ninguno te lo diga.

```bash
git worktree add ../spherex-d d/sia2-epochs
cd ../spherex-d
```

## Commits

Imperativo, en castellano, una línea, sin ceremonia:

```
añade endpoint /api/epochs
corrige conversión de RA en horas a grados
documenta la estructura del MEF
```

## Qué lleva un PR

Tres líneas bastan:

```
Qué hace:
Cómo lo comprobé:
Qué NO comprobé:
```

**La tercera línea es obligatoria.** «Qué no comprobé» es lo que evita que algo entre a la demo sin
que nadie lo haya mirado de verdad.

## Antes de pedir revisión

- [ ] Corre en limpio (`docker compose up` o el equivalente).
- [ ] Si toca coordenadas o imágenes, probado con **al menos un campo de `data/campos_de_prueba.yml`**.
- [ ] No rompiste nada que ya funcionaba (`/chequeo-demo` si tocaste la interfaz).
- [ ] Sin secretos, sin datos personales, sin FITS.

## Si rompes `main`

Lo dices en voz alta, de inmediato. No lo arreglas en silencio: hay otras tres personas trabajando
sobre eso. Revertir es gratis; media hora de tres personas depurando algo que ya sabías, no.
