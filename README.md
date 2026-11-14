# SPHEREx Kit — NASA Space Apps Challenge 2026

Kit de trabajo del equipo para el desafío **Planet X and SPHEREx** (dificultad: Advanced).
Es una caja de herramientas: documentación, bibliografía, convenciones y andamiaje genérico
para que cuatro personas y sus agentes de IA trabajen en paralelo sin pisarse durante el evento.

> **Qué NO hay aquí:** ni una línea de código que resuelva el desafío. Las reglas del evento
> prohíben trabajar en los challenges antes del hackatón. Lo que hay es material de referencia
> (público, de la NASA y de la literatura) y andamiaje web genérico —un "hola mundo" de FastAPI
> y uno de Vite/React— equivalente a tener el editor configurado. Ver [`docs/08_REGLAS_DEL_EVENTO.md`](docs/08_REGLAS_DEL_EVENTO.md).

---

## El desafío en una frase

Construir **una herramienta web pública** donde cualquiera escriba unas coordenadas del cielo
(ascensión recta y declinación) y vea esa zona del cielo **como un videíto**: la secuencia de
imágenes de SPHEREx a lo largo del tiempo, para detectar a ojo lo que se mueve o cambia de brillo.

El modelo declarado por la NASA es [WiseView](http://byw.tools/wiseview), la herramienta con la que
voluntarios de [Backyard Worlds](https://backyardworlds.org) han descubierto cientos de enanas marrones.
Texto completo del desafío en [`docs/00_DESAFIO.md`](docs/00_DESAFIO.md).

**Lo que esto NO es:** no es un modelo de clasificación de video, no es un detector automático,
no es un pipeline científico. Es un visor. Cualquier capa de ML es opcional y va encima, nunca
en lugar del visor. Esto está argumentado en [`docs/01_ESTADO_DEL_ARTE.md`](docs/01_ESTADO_DEL_ARTE.md).

---

## Arranque en 10 minutos

1. Lee este README y [`docs/00_DESAFIO.md`](docs/00_DESAFIO.md) (5 min). Es el único texto que es obligatorio.
2. ¿Vienes sin contexto? Lee [`docs/briefings/`](docs/briefings/) — los dos resúmenes cubren todo el proyecto de corrido.
3. Mira tu rol en [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md#roles) y el plan de las 24 h en [`docs/05_PLAN_24H.md`](docs/05_PLAN_24H.md).
4. Abre Claude Code en la raíz del repo. Lee automáticamente `CLAUDE.md`; las skills de `.claude/skills/`
   se activan solas cuando corresponde.
5. Si te toca backend o datos: hojea [`docs/02_DATOS_SPHEREX.md`](docs/02_DATOS_SPHEREX.md). Es la ficha técnica
   de dónde viven los datos y cómo se piden. Es el documento más denso y el que más tiempo ahorra.
6. Si te toca frontend: hojea [`docs/03_ARQUITECTURA.md`](docs/03_ARQUITECTURA.md) y la skill `visor-sky-blink`.

---

## Mapa del kit

| Carpeta | Qué contiene | Cuándo la abres |
|---|---|---|
| `docs/` | Desafío, estado del arte, ficha de datos, arquitectura, metodología, plan, jurado, riesgos | Siempre; es la fuente de verdad |
| `docs/briefings/` | Dos resúmenes narrativos de todo el proyecto, para leer de corrido. Existen también como audio | Para llegar con contexto en 20 minutos |
| `docs/adr/` | Decisiones de arquitectura, una por archivo | Cuando el equipo decide algo que cuesta revertir |
| `biblio/` | Bibliografía comentada, fichas de papers, repos de GitHub relevantes | Cuando necesitas respaldo o una idea probada |
| `data/` | Campos de prueba con coordenadas, catálogos de referencia. **Sin FITS versionados** | Al probar el visor |
| `.claude/skills/` | Cinco skills: datos SPHEREx, visor, coordenadas, demo/pitch, entrega | Las carga Claude solo |
| `.claude/agents/` | Subagentes especializados (explorador de datos, revisor científico, revisor de UI) | Cuando delegas una parte acotada |
| `.claude/commands/` | `/standup`, `/traspaso`, `/chequeo-demo`, `/verifica-cifra`, `/riesgo` | Durante el evento, a mano |
| `scaffold/` | Esqueleto genérico backend + frontend, Docker, CI | Hora 0 del evento |
| `AGENTS.md` | Instrucciones para **cualquier** agente. Fuente única | La leen los agentes, no tú |
| `CLAUDE.md` / `GEMINI.md` | Punteros a `AGENTS.md` + lo específico de cada herramienta | Igual |

---

## Las cuatro reglas del equipo

1. **El entregable es el visor funcionando con coordenadas reales.** Todo lo demás es adorno.
   Si a las 20 horas no hay un videíto en pantalla, se corta lo que sea.
2. **Nada se da por hecho sin mirarlo.** Que un agente diga "ya funciona" es un dato, no un hecho:
   se abre la URL, se mira la imagen, se compara con SIMBAD. Un resultado vacío no prueba que algo no exista.
3. **Ninguna cifra sin fuente.** Lo que se diga en el pitch o en el README tiene que poder
   abrirse y comprobarse. Usa `/verifica-cifra`.
4. **Nadie commitea a `main` sin que otro lo mire.** Cuatro personas con agentes en paralelo
   rompen `main` en minutos. Ver [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Estado

- **Hoy (pre-evento):** solo documentación, bibliografía y andamiaje genérico. Local, sin publicar.
- **Al empezar el evento:** se sube a GitHub, se corre `scaffold/`, se abre el ADR-001 con la decisión de stack.

Licencia prevista: MIT (ver [`LICENSE`](LICENSE)). Los datos de SPHEREx son públicos y requieren
la nota de agradecimiento que está en [`docs/02_DATOS_SPHEREX.md`](docs/02_DATOS_SPHEREX.md#atribución-obligatoria).

---

## Instalar el kit (para los compañeros)

**Lo más simple: clonar el repositorio y abrir Claude Code en la raíz.**
`CLAUDE.md`, las skills de `.claude/skills/`, los subagentes y los comandos se cargan solos.
No hay nada que instalar.

```bash
git clone <url-del-repo>
cd spherex_kit
claude
```

Comprobación: escribe `/standup`. Si el comando existe, el kit está cargado.

Quien use **Antigravity o Gemini** lee `AGENTS.md` y `GEMINI.md`; apuntan a lo mismo.

### Si alguien quiere las skills fuera de este repositorio

El kit también está empaquetado como plugin (`.claude-plugin/plugin.json` y
`.claude-plugin/marketplace.json`), para usarlo desde otra carpeta. Es opcional: dentro del
repositorio no hace falta.

---

## Estado de verificación de este kit

Escrito el **14 de noviembre de 2026**. Qué está comprobado y qué no:

| | Estado |
|---|---|
| Texto del desafío y lista de *Resources* | ✅ Leídos de la página oficial ese día |
| Endpoints de IRSA, colecciones SIA2, estructura del MEF, bandas, cubo HiPS | ✅ Contra la documentación oficial de IRSA |
| Esqueleto del backend | ✅ Corre: `/health` responde `200 {"ok": true}` |
| Esqueleto del frontend | ⚠️ No ejecutado (sin `npm install` aquí) |
| Bibliografía | 🟡 Parcial. Cada entrada lleva su estado en [`biblio/README.md`](biblio/README.md) |
| Coordenadas de los campos de prueba | ✅ Las cinco verificadas en SIMBAD (espejo CfA) el 14-nov. Aparecieron dos trampas: la coordenada del enunciado para WISE 0855 es de época 2010, y `eps Ind b` ≠ `eps Ind B` |
| Escala de píxel de SPHEREx (~6,2"/px) | ⚠️ Derivada, no citada. Confirmar en el Explanatory Supplement. De ella depende el cálculo de movimiento sub-píxel (riesgo R10) |
| Que Aladin Lite cargue el cubo HiPS de DR1 | ❌ Sin comprobar. Es el primer experimento del evento |

Lo que no está verificado está marcado así en cada documento. **No lo des por cierto porque esté
escrito aquí.**
