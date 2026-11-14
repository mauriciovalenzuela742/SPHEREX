<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/docs/07_RIESGOS.md) · **Español** · [中文](../../zh/docs/07_RIESGOS.md) · [Deutsch](../../de/docs/07_RIESGOS.md) · [Italiano](../../it/docs/07_RIESGOS.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `docs/07_RIESGOS.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# 07 — Riesgos

Riesgos identificados antes de empezar, con su señal de alarma y su plan B. Se actualiza durante el
evento con `/riesgo`.

Orden: por cuánto duele, no por probabilidad.

---

## R1 · Los cutouts de IRSA son demasiado lentos para una herramienta interactiva

> **Estado 14-nov: se materializó.** Mediana 7,3 s, p90 10,8 s, máximo 29 s, ~3,9 MB sin importar el
> tamaño, 503 a ratos (`docs/09` §6). Mitigación decidida: caché + 5 campos precalculados como estáticos
> (ADR-001, actualización 14-nov). Falta decidir dónde corre `/api` para coordenadas arbitrarias (C).

**Impacto: crítico.** Es el supuesto sobre el que descansa todo el proyecto.

Un MEF completo pesa ~70 MB; el servicio de cutouts existe precisamente para no bajarlos enteros,
pero no sabemos cuánto tarda **por época** ni qué pasa con 15 peticiones en paralelo.

- **Señal de alarma:** en el Bloque 1, un cutout de `size=0.1` tarda más de ~5 s, o IRSA limita las
  peticiones concurrentes.
- **Plan B:** caché agresiva + precalentado de los campos de prueba + pedir las épocas en paralelo
  con un tope + mostrar los fotogramas a medida que llegan en vez de esperar a todos.
- **Plan C:** la herramienta funciona sobre un conjunto curado de ~10 campos precalculados, y se
  presenta así, sin disimularlo: «hoy servimos estos campos; la arquitectura escala a todo el cielo».
  Es menos ambicioso y es honesto.
- **Cuándo se decide:** hora 3. No más tarde.

---

## R2 · Las épocas no son comparables entre sí por el filtro lineal variable

> **Estado 14-nov: resuelto en el EDA.** Se eligen épocas a λ igualada (dispersión 0,474 → 0,035 µm en
> WISE 0855 D5); ver `docs/09` §2. Mostrar la λ por fotograma sigue siendo parte del diseño.

**Impacto: alto.** Es el riesgo más sutil y el que más probablemente arruine el resultado sin que
nadie entienda por qué.

Por el diseño LVF de SPHEREx, cada observación de una posición del cielo cae en una parte distinta
del detector y por tanto mide una longitud de onda distinta. Un blink ingenuo da una secuencia donde
el brillo salta sin que nada haya cambiado. Explicado en [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2.

- **Señal de alarma:** el primer blink parpadea como una luz estroboscópica y las fuentes aparecen y
  desaparecen sin moverse.
- **Plan B:** agrupar por detector o por rango de λ, y normalizar cada fotograma por percentiles
  robustos.
- **Plan C:** si ni así queda limpio, **se convierte en una funcionalidad**: mostrar la longitud de
  onda de cada fotograma en pantalla y explicar que el parpadeo es información espectral, no ruido.
  Es verdad, y es un punto a favor ante un jurado técnico.
- **Cuándo se decide:** hora 3, midiendo el `WCS-WAVE` de dos épocas del mismo campo.

---

## R3 · DR1 acabó de salir y la documentación o los ejemplos no cuadran

> **Ojo con el plan B de más abajo (14-nov):** `spherex_qr3` sola deja a WISE 0855 sin datos (0 filas).
> Hay que consultar `spherex_dr1` **y** `spherex_qr3` juntas (`docs/09` §1).

**Impacto: medio-alto.** DR1 se publicó en noviembre de 2026, este mismo mes. Los tutoriales que
circulan apuntan mayormente a QR2, que ya no es buscable por SIA2.

- **Señal de alarma:** un ejemplo copiado de un notebook devuelve vacío o un error de colección.
- **Plan B:** usar `spherex_qr3`, que está desde septiembre y es más probable que esté asentado.
  QR2 sigue descargable por URL directa hasta febrero de 2027 aunque no sea buscable.
- **Regla práctica:** **ir siempre a la documentación de IRSA, no a un blog ni a un ejemplo
  antiguo.** Enlaces en [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## R4 · Se cae el wifi (en la sala, o justo en el pitch)

**Impacto: crítico si pasa en el pitch, molesto el resto del tiempo.** Probabilidad alta: pasa en
casi todos los hackatones.

- **Plan B obligatorio, no opcional:** modo degradado que sirve los cinco campos desde caché local
  sin tocar la red, y el vídeo de la demo descargado en el disco del computador que presenta.
- **Cuándo:** el vídeo, en T−4 h. El modo degradado, en el Bloque 4.
- Tener el repositorio clonado en **más de un computador**.

---

## R5 · El proyecto se entrega tarde o incompleto

**Impacto: crítico. Es la causa número uno de que un buen proyecto no gane nada.**

El formulario de entrega pide más de lo que uno recuerda, y este año incluye obligatoriamente la
descripción de cómo se usó la IA.

- **Plan B:** no hay plan B. Por eso existen las tres paradas obligatorias de
  [`04_METODOLOGIA.md`](04_METODOLOGIA.md): congelación en T−6, demo grabada en T−4, **entregado en T−2**.
- **N abre el formulario en la hora 1**, no en la hora 22, para ver qué pide.

---

## R6 · El equipo se dispersa en viñetas a medias

**Impacto: alto.** Ocho *Potential Considerations* y cuatro personas con agentes rápidos: la
tentación de empezarlas todas es enorme. Un jurado hace clic justo en la que quedó a medias.

- **Señal de alarma:** más de dos ramas abiertas por persona, o un `/standup` donde nadie puede
  mostrar algo que funcione.
- **Plan B:** el orden de prioridades del Bloque 3 de [`05_PLAN_24H.md`](05_PLAN_24H.md) no se
  negocia en caliente. Una funcionalidad terminada vale más que tres a medias.

---

## R7 · Dos agentes se pisan y rompen `main`

**Impacto: medio, pero cuesta horas a mitad de la noche.**

- **Plan B:** worktree por persona, ramas cortas, nadie empuja a `main`, un PR lo mira una persona.
  Ver [`04_METODOLOGIA.md`](04_METODOLOGIA.md).
- **Señal de alarma:** el primer conflicto de merge raro. Cuando aparezca, parar cinco minutos y
  revisar quién está tocando qué, en vez de resolverlo a la fuerza.

---

## R8 · Alguien afirma algo falso delante del jurado

**Impacto: alto y difícil de recuperar.** Un jurado con astrónomos de la NASA detecta al instante
una cifra inventada o un espectro presentado como si fuera fotometría calibrada.

- **Plan B:** todo número que llegue al pitch o al README pasa por `/verifica-cifra`. El campo
  `caveat` del endpoint de espectros no se quita. Nunca se dice que se descubrió nada.
- **Regla:** si no lo comprobaste, se dice «no lo comprobamos». Esa frase suma credibilidad, no la resta.

---

## R9 · La GPU y el equipo local no dan para lo que se prometió

**Impacto: bajo con la arquitectura elegida**, y vale la pena dejarlo escrito para que nadie proponga
entrenar nada. El equipo cuenta con una GPU de 4 GB; no hay margen para entrenar ni ajustar modelos
de video. La arquitectura de [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) no lo necesita en ningún punto.

- **Si alguien propone entrenar algo:** [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6 tiene el
  argumento completo para decir que no sin discutirlo de nuevo.

---

## R10 · El movimiento es sub-píxel y el parpadeo no impresiona

> **Estado 14-nov: medido.** Base real 1,0-1,4 años; desplazamiento total 1,1-1,8 px (`docs/09` §4).
> Se adopta el plan B de abajo (primera contra última + resta + zoom).

**Impacto: alto para la demo, medio para el proyecto.** Identificado el 14-nov-2026, antes del evento.

Con una escala de píxel de 6,15 arcsec (SIA2; `eda/03_recortes_y_figuras.py:42`), y SPHEREx barriendo el cielo entero cada 6 meses, el
desplazamiento entre dos barridos consecutivos es de **menos de un píxel incluso para los objetos
más rápidos del cielo**: 0,84 px para la estrella de Barnard, 0,66 px para WISE 0855, 0,38 px para
Epsilon Indi B. Medido el 14-nov: con todo el período disponible se llega a 1,1-1,8 px.

- **Señal de alarma:** el parpadeo funciona, los datos son correctos, y aun así «no se ve que se
  mueva». Es lo que va a pasar si se comparan épocas consecutivas.
- **Plan B:** comparar siempre la **primera época contra la última**, no las consecutivas; ofrecer
  zoom sobre el recorte en vez de mostrarlo a 1:1; y apoyarse en la **resta de imágenes**, donde un
  desplazamiento de un píxel se ve clarísimo como un par de lóbulos positivo y negativo, mientras
  que en un parpadeo se ve fatal.
- **Plan C:** mover el eje de la demo hacia la **variabilidad** (RW Aurigae, R Draconis), que sí es
  evidente, y hacia el **cometa 3I/ATLAS**, que se mueve muchísimo más que cualquier estrella.
- **Y una regla para el pitch:** no prometer que «el objeto salta a la vista» hasta haberlo visto.
- **Cuándo se decide:** decidido el 14-nov (base de 1,0-1,4 años; 1,1-1,8 px en total): se adopta el plan B.

---

## R11 · Vercel depende de una sola cuenta

**Qué puede fallar:** solo Mauricio tiene acceso al proyecto de Vercel (plan gratuito Hobby; agregar miembros exige pagar). Las vistas previas de los PR de los demás salen *Blocked* y solo él ve los logs.
- **Señal de alarma:** producción no se actualiza, o Mauricio no está disponible cerca del cierre.
- **Plan B:** cada quien prueba en local (`npm ci && npm run build && npm run preview`); video de demo grabado y modo estático con los 5 campos precalculados.
- **Cuándo se decide:** antes de la congelación de alcance (T−6 h). Responsable: C.

## R12 · El CDS de Estrasburgo cae (SIMBAD, VizieR)

**Qué puede fallar:** el 14-nov el CDS de Estrasburgo estaba caído; el overlay de Gaia y la burbuja de SIMBAD dependen de él.
- **Señal de alarma:** las capas Gaia/SIMBAD quedan vacías o tardan más que el tiempo de espera.
- **Plan B:** el código ya prueba primero el espejo de Harvard (`vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu`) y el CDS de respaldo; para la demo, precalcular los 5 campos.
- **Cuándo se decide:** en el ensayo de la demo. Responsable: V2.

## R13 · Una estrella saturada engaña la resta

**Qué puede fallar:** en objetos saturados (Barnard, RW Aur) el núcleo queda enmascarado y la resta deja un par rojo/azul aunque no se muevan (RW Aur «se mueve» 1,4 px sin moverse).
- **Señal de alarma:** un objeto de control (RW Aur) «se mueve» en la resta.
- **Plan B:** avisar en la interfaz cuando el objeto satura y no usar RW Aur como prueba de variabilidad ni de movimiento (`docs/09`).
- **Cuándo se decide:** antes de grabar la demo. Responsable: D2 y V1.

---

## Registro de riesgos nuevos

Usa `/riesgo` para añadir aquí. Formato: qué puede fallar, cómo lo notaríamos, qué haríamos, y
cuándo se decide.
