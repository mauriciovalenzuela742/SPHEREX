<!-- i18n-header -->
> 🌐 **Sprache:** [English](../en/CONTRIBUTING.md) · [Español](../es/CONTRIBUTING.md) · [中文](../zh/CONTRIBUTING.md) · **Deutsch** · [Italiano](../it/CONTRIBUTING.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `CONTRIBUTING.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Wie wir in diesem Repository arbeiten

Sechs Personen und ihre Agents, 24 Stunden, ein `main`-Branch, der immer hochkommen muss.
Dies ist absichtlich kurz.

## Das Nicht-Verhandelbare

1. **Niemand pusht auf `main`.** Weder du noch dein Agent. Alles kommt per PR hinein.
2. **Einen PR prüft eine Person.** Kein Agent. Den Diff anzusehen kostet zwei Minuten und spart Stunden.
3. **Branches leben weniger als 3 Stunden.** Wenn ein Branch länger lebt, war die Aufgabe zu groß.
4. **Der Vertrag der API wird zuerst in `docs/03_ARQUITECTURA.md` geändert**, das Team wird informiert, und
   erst danach wird Code angefasst.
5. **Keine FITS und keine heruntergeladenen Daten im Repository.** Sie gehören nach `data/cache/`.

## Branches

```
<inicial-del-rol>/<tema-corto>
```

`d/sia2-epochs`, `v/panel-blink`, `c/verificar-campos`, `n/readme`.

Rollen in [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md): **D** Daten, **V** Viewer,
**C** Wissenschaft und Verifikation, **N** Narrativ und Abgabe.

## Worktrees: ein Ordner pro Person

Zwei Agents im selben Ordner überschreiben sich gegenseitig, ohne Warnung und ohne dass einer von beiden es dir sagt.

```bash
git worktree add -b d/sia2-epochs ../spherex-d main
cd ../spherex-d
```

## Commits

Im Imperativ, auf Spanisch, eine Zeile, ohne Zeremonie:

```
añade endpoint /api/epochs
corrige conversión de RA en horas a grados
documenta la estructura del MEF
```

## Was ein PR enthält

Drei Zeilen genügen:

```
Qué hace:
Cómo lo comprobé:
Qué NO comprobé:
```

**Die dritte Zeile ist Pflicht.** „Was ich NICHT geprüft habe“ verhindert, dass etwas in die Demo gelangt, ohne
dass es jemand wirklich angesehen hat.

## Bevor du ein Review anforderst

- [ ] Läuft sauber: Frontend `cd scaffold/frontend && npm ci && npm run build && npm run preview`; Backend `cd scaffold && docker compose up`.
- Wenn Vercel in deinem PR *Blocked* anzeigt, ist das erwartet (es werden nur Commits von Mauricio gebaut; siehe README §2). Deploye nicht selbst.
- [ ] Wenn es Koordinaten oder Bilder betrifft, getestet mit **mindestens einem Feld aus `data/campos_de_prueba.yml`**.
- [ ] Du hast nichts kaputt gemacht, was schon funktionierte (`/chequeo-demo`, wenn du die Oberfläche angefasst hast).
- [ ] Keine Secrets, keine personenbezogenen Daten, keine FITS.

## Wenn du `main` kaputt machst

Du sagst es laut und sofort. Du reparierst es nicht stillschweigend: Drei weitere Personen arbeiten
darauf. Zurücksetzen ist gratis; eine halbe Stunde von drei Personen, die etwas debuggen, das du schon wusstest, nicht.
