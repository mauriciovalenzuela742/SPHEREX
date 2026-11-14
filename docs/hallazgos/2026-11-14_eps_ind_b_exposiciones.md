# eps Ind B y WISE 0855: cuántas exposiciones por visita hacen falta para ver el movimiento

**Fecha:** 14-nov-2026 · **Quién:** C (Mauricio) · **Pedido:** `docs/pedidos/2026-11-14_v2_antonia_y_bryan.md` §3

## Qué se probó

Primera contra última visita en la banda **D5**, recorte de 0,05°, centradas en la posición propagada a hoy
(`posicionActual`, `content/campos.ts`), con el `/api/frame` del prototipo D2 (lector rápido por rangos).
Desplazamiento = centroide del objeto en la última menos en la primera (pesos positivos, r = 3 px alrededor del
pico cercano al centro). Píxel = 6,15″; x crece hacia el oeste (las imágenes tienen N↑ E←).

| Objeto | Base | Esperado (mov. propio) | `per_visit = 1` | `per_visit = 4` | `per_visit = 10` |
|---|---|---|---|---|---|
| eps Ind B | 1,43 años (abr-2025 → sep/oct-2026) | 0,93 px E · 0,57 px S | 1,70 px O · 3,27 px S (**ruido**) | 0,84 px E · 0,84 px S ✓ | 0,79 px E · 0,74 px S ✓ |
| WISE 0855 | 1,01 años (may-2025 → may-2026) | 1,33 px O · 0,11 px N | 0,01 px O · 0,69 px S (**no se ve**) | — | 0,95 px O · 0,25 px N ✓ |

Tiempo de bajada (primera + última, en paralelo): **1–3 s** con `per_visit = 10` gracias al lector por rangos
(los 61,8 s del pedido eran con todas las visitas en `/frames`).

## Lo que se vio (vista previa del Modo Misión, render de `explorador/render.ts`)

- **eps Ind B, D5 ×10:** resta limpia, sin puntitos sueltos; azul arriba-derecha y rojo abajo-izquierda →
  **sureste**, como predice su movimiento propio.
- **WISE 0855, D5 ×10:** pareja limpia en el centro: azul a la izquierda (este) y rojo a la derecha (oeste).
  Sale ~25 % corta respecto de lo esperado, igual que en `2026-11-14_wise0855_movimiento.md`.
- **RW Aur, D2 ×1:** mancha casi toda roja con un borde azul fino; RW Aur se mueve 0,02″/año: no es movimiento.

## Decisión para el Modo Misión

- WISE 0855 y eps Ind B usan **`porVisita: 10`** en D5, con sus fotos precalculadas en
  `scaffold/frontend/public/precalc/mision/` (`scripts/precalcular_mision.ts`).
- eps Ind B deja de ser el nivel de la duda (con 10 exposiciones no hay puntitos sueltos): pregunta la dirección.
- El nivel de la duda pasa a RW Aur; R Dra queda oculto.
