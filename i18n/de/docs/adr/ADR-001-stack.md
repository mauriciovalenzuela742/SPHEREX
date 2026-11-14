<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/docs/adr/ADR-001-stack.md) · [Español](../../../es/docs/adr/ADR-001-stack.md) · [中文](../../../zh/docs/adr/ADR-001-stack.md) · **Deutsch** · [Italiano](../../../it/docs/adr/ADR-001-stack.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/adr/ADR-001-stack.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# ADR-001 — Stack des Projekts

- **Datum:** 2026-11-14 (Vorschlag vor dem Event)
- **Status:** **Vorschlag**; am 14. Nov. mit den Daten der EDA aktualisiert (siehe «Aktualisierung 14. Nov. 2026, nachmittags»). **Unterschrift von C (Mauricio) ausstehend.**
- **Entscheidet:** C (Mauricio); Unterschrift ausstehend

## Kontext

In ~24 Stunden muss ein öffentliches Web-Tool gebaut werden, mit sechs Personen, die programmieren, und ihren
Agenten. Die Daten liegen im Archiv IRSA/IPAC, und die Bibliotheken, die sie lesen können
(`astropy`, `pyvo`, `astroquery`), existieren **nur in Python**. Die Aufgabenstellung schlägt ausdrücklich
Astropy und Aladin vor.

Randbedingungen:

- 24 Stunden und eine feste Uhrzeit für den Abgabeschluss.
- Sechs Personen parallel: Die Arbeit muss sich trennen lassen.
- Es muss eine öffentliche URL bleiben, die die Jury öffnen kann.
- Es gibt kein Infrastrukturbudget und keine nutzbare GPU für irgendetwas Schweres.

## Betrachtete Optionen

| Option | Dafür | Dagegen | Aufwand |
|---|---|---|---|
| **Python/FastAPI + React/Vite + Aladin Lite** | Trennt Backend und Frontend, zwei Personen parallel ab Stunde 1; wirkt wie ein öffentliches Tool; Aladin löst den Himmel | Zwei Deployments, CORS, ein Vertrag, der zu pflegen ist | Mittel |
| Streamlit | Alles in Python, in Minuten hochgefahren | Schwer zu polieren; wirkt nicht wie ein öffentliches Tool; flüssiges Blinken ist aufwendig | Gering |
| Statisches Frontend + Aladin Lite, ohne Backend | Triviales Deployment, nichts zu pflegen | **Hängt davon ab, dass IRSA mit CORS antwortet** (am 14. Nov. verworfen: IRSA liefert kein CORS außerhalb des HiPS, `docs/09`); serverseitig kann man weder zuschneiden, normalisieren noch subtrahieren | Gering, aber mit einem Risiko, das wir nicht kontrollieren |

## Aktualisierung 14. Nov. 2026, nachmittags — Deployment-Entscheidung (C, mit den Daten der EDA)

**Status: Vorschlag von C (Mauricio), steht noch aus: Zustimmung des Teams im nächsten Standup.**

### Daten, die entscheiden (EDA, `eda/resultados/latencia_cutouts.json`, `docs/09_EDA_HALLAZGOS.md`)

- Ein Cutout von 0,1° braucht **7,3 s Median, 10,8 s p90, 29 s Maximum** (~3,9 MB), mit zeitweisen **503**.
- 25 Cutouts mit 4 Threads: **52 s** Wanduhrzeit. Ein vollständiger «Live»-Blink passt nicht in eine vernünftige Wartezeit.
- **IRSA antwortet nicht mit CORS** (weder SIA2 noch Dateien): Alles, was nicht der HiPS-Cube ist, läuft über ein Backend.
- SIA2 an `spherex_dr1` und `spherex_qr3`: je 1–3,5 s; Header per HTTP Range ~35 KB, ~0,1 s effektiv.

### Entscheidung

| Baustein | Wo er läuft | Warum |
|---|---|---|
| Frontend | **Vercel** (Projekt `spherex-planet-x`, Team eMind, Hobby), Produktion von `main` | Funktioniert bereits; die Organisation hat es vorgegeben |
| **Die 5 Testfelder** (die Demo) | **Vorberechnet als statische Dateien** in `scaffold/frontend/public/precalc/<id>/` (JSON in der Form des Vertrags + PNG), vom Skript von D1 erzeugt und versioniert | Die Demo wartet **nie** auf IRSA und hängt nicht vom WLAN ab. Es ist auch der Offline-Modus |
| `/api/resolve`, `/api/epochs` | **Vercel Python Functions** im selben Projekt (`api/`) | 1–3,5 s: passen locker. Gleiche Domain, kein CORS |
| `/api/frames` für beliebige Koordinaten | **Vercel Python Functions, mit Zeitbudget**: lädt parallel (4) so viel herunter, wie reicht, liefert das Fertige und `pending` mit dem Rest; das Frontend fragt erneut an und zeigt Einzelbilder nach und nach, wie sie eintreffen | Vermeidet die Wartezeit von 52 s, ohne einen weiteren Dienst aufzubauen |
| Plan B, falls die Funktionen nicht ausreichen (Maximalzeit, Speicher von astropy/reproject, Paketgröße) | **Dasselbe FastAPI in einem Container** (Render oder Fly, kostenlose Stufe) hinter `/api` mit einem Vercel-*Rewrite* | Ein Ortswechsel ändert den Vertrag nicht |

Regeln, die sich daraus ergeben:

- **Cache:** Die Funktionen haben keinen persistenten Speicher (nur `/tmp` pro Instanz). Es wird nichts entworfen, das für die Demo vom Cache
  abhängt: Dafür gibt es das Vorberechnete.
- **Maximale Funktionszeit:** wird mit `maxDuration` in `vercel.json` festgelegt. Bevor man sich auf einen Wert verlässt,
  **das aktuell gültige Maximum des Hobby-Plans in der Vercel-Dokumentation prüfen** (D1, beim ersten Deployment von `api/`).
- **Objekte der Demo:** Die fünf Testobjekte müssen funktionieren. WISE 0855 ist ein Pflichtfall und wird
  immer gezeigt, mit dem Hinweis, dass er in einer einzelnen Belichtung schwach wirkt (seine Bewegung sieht man mit der Differenz und, sobald
  vorhanden, mit der Summe pro Durchgang von D2, ausstehend, und dem Overlay von CatWISE2020 von V2, fertig im Branch `v/v2-catwise` und PR ausstehend). eps Ind B ist der Fall, in dem die
  Bewegung am deutlichsten zu sehen ist; Barnard sieht man, aber er sättigt. Immer auf die **propagierte Position** zentrieren, nicht auf die J2000.
- **Deployments:** Vercel Hobby baut nur Commits von Mauricio; die Produktion entsteht aus seinen Merges.
  Siehe README §2.

### Was jeder damit tut

- **D1 (Vladimir):** Skript zur Vorberechnung der 5 Felder → `public/precalc/`; `api/` mit `resolve` und `epochs`.
- **D2 (Bryan):** `frames` mit Zeitbudget und Teilantwort (`pending`).
- **V1 (Antonia):** Der Blink liest zuerst `precalc/<id>/`, wenn das Feld ein Testfeld ist; sonst `/api/frames` mit
  Wiederholung und Einzelbildern, die nach und nach erscheinen.
- **C (Mauricio):** das erste Deployment von `api/` messen und Plan B aktivieren, falls es nicht reicht.

## Entscheidung

**Python 3.11 + FastAPI im Backend; React + Vite + TypeScript mit Aladin Lite 3.8.2 im Frontend.**
Cache auf Platte. Frontend auf Vercel (am 14. Nov. entschieden). Das Backend für beliebige Koordinaten: Vorschlag von C aus der obigen Aktualisierung (Vercel Python Functions mit Zeitbudget; Plan B, dasselbe FastAPI in einem Container), mit der gemessenen Cutout-Zeit: Median 7,3 s, p90 10,8 s, max. 29 s, ~3,9 MB unabhängig von der Größe, zeitweise 503 (`docs/09` §6). Die 5 Testfelder werden vorberechnet als statische Dateien ausgeliefert.

Der API-Vertrag, der paralleles Arbeiten ermöglicht, steht in
[`../03_ARQUITECTURA.md`](../03_ARQUITECTURA.md).

## Konsequenzen

**Einfach:** dass D und V ab der ersten Stunde gleichzeitig arbeiten, ohne sich in die Quere zu kommen; das gesamte Ökosystem von
Astropy zu nutzen; serverseitig zu cachen und zu normalisieren, was das Blinken machbar macht.

**Schwierig:** Es müssen ein Vertrag und zwei Deployments gepflegt werden; CORS zwischen Frontend und Backend muss
einmal richtig konfiguriert werden.

**Wenn wir uns irren:** Weg A (Aladin Lite lädt den HiPS-Cube von DR1 direkt) **hängt nicht
vom Backend ab**. Wenn das Backend ausfällt oder nicht rechtzeitig fertig wird, funktioniert dieser Teil weiter und es gibt etwas zu
zeigen. Das ist die Absicherung dieser Entscheidung.

## Wann sie überprüft wird

**Stunde 3 des Events** (am 14. Nov. bereits gemessen: siehe `docs/09`), mit der Datencheckliste aus [`../02_DATOS_SPHEREX.md`](../02_DATOS_SPHEREX.md).
Wenn die Cutouts zu langsam sind oder IRSA nicht mit CORS antwortet, wird hier überprüft und nicht später.
