---
description: Recorre la demo completa en el navegador y reporta qué se rompe
---

<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../../en/.claude/commands/chequeo-demo.md) · **Español** · [中文](../../../zh/.claude/commands/chequeo-demo.md) · [Deutsch](../../../de/.claude/commands/chequeo-demo.md) · [Italiano](../../../it/.claude/commands/chequeo-demo.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `.claude/commands/chequeo-demo.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

Recorre la demo entera como la hará el equipo ante el jurado y reporta qué se rompe. Esto se corre
**antes de cada congelación y antes de grabar el vídeo**.

El guion está en `.claude/skills/demo-y-pitch/SKILL.md`. Si el argumento del comando trae una URL,
usa esa; si no, usa la aplicación desplegada (https://spherex-planet-x-tau.vercel.app), y si no hay, la local (`npm run dev` en `scaffold/frontend`, http://localhost:5173). Ojo: mientras el reproductor y los fotogramas sean huecos, el paso 3 falla por diseño y no por una regresión.

Recorre los diez pasos del guion, uno por uno, con el navegador. En cada paso anota:

- ¿Hizo lo que tenía que hacer?
- **Cuánto tardó.** Cronométralo. Un paso que tarda 15 segundos mata una demo de 2 minutos.
- ¿Hubo errores en consola o peticiones fallidas?

Después prueba lo que el jurado va a hacer y el guion no cubre:

- Una coordenada sin datos.
- Una coordenada mal escrita.
- Recargar a mitad de la carga.
- La misma URL abierta en otra pestaña.
- Tamaño de ventana de móvil.

Devuelve:

**Rompe la demo** — lo que hay que arreglar sí o sí, con el paso exacto en que falla.

**Lento** — pasos que tardan más de 3 segundos, con el tiempo medido.

**Molesto pero pasable** — se puede vivir con ello hoy.

**Tiempo total del recorrido** — si pasa de 2 minutos, hay que recortar pasos y decir cuáles.

Si algo falló, di exactamente qué hiciste para llegar ahí, para que se pueda reproducir.
