<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/04_METODOLOGIA.md) · [Español](../../es/docs/04_METODOLOGIA.md) · [中文](../../zh/docs/04_METODOLOGIA.md) · **Deutsch** · [Italiano](../../it/docs/04_METODOLOGIA.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/04_METODOLOGIA.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 04 — Methodik: vier Personen, vier Agenten, 24 Stunden

Das Hauptrisiko eines Vierer-Teams mit Agenten ist nicht, keine Ideen mehr zu haben: Es ist, **sich gegenseitig in die Quere zu kommen**.
Vier Agenten, die schnell im selben Repository schreiben, erzeugen Konflikte, doppelten Code und
einen kaputten `main`-Branch um drei Uhr morgens. Dieses Dokument ist die Vereinbarung, damit das nicht passiert.

---

## Rollen

Vier Rollen, jede Verantwortliche für einige Dateien. (In diesem Sechser-Team wird D in D1 Zugriff und D2
Einzelbilder aufgeteilt, und V in V1 blink und V2 Himmel; siehe [`README.md`](../README.md) §3.) **Verantwortlich** bedeutet: Diese Person entscheidet, die anderen
bitten. Es bedeutet nicht, dass sie allein arbeitet.

### D — Daten (Backend / IRSA)
Verantwortlich für `scaffold/backend/app/irsa/`, `scaffold/backend/app/cache/`.
Fragt SIA2 ab, lädt cutouts herunter, liest die MEF, gruppiert nach Band, löst das WCS und die Wellenlängen auf.
Es ist der kritische Pfad: **Wenn das nicht funktioniert, gibt es kein Projekt.**
Passendes Profil: wer am sichersten mit wissenschaftlichem Python und beobachtender Astronomie umgeht.

### V — Viewer (Frontend)
Verantwortlich für `scaffold/frontend/src/`.
Aladin Lite, das blink-Panel, die Steuerung (Streckung, Farbe, fps), die abfragbare URL.
Passendes Profil: wer am sichersten mit modernem Web umgeht.

### C — Wissenschaft und Verifikation
Verantwortlich für `data/campos_de_prueba.yml`, `tests/`, `docs/`.
Prüft, dass das Gezeigte korrekt ist: dass der Ausschnitt vom genannten Himmel stammt, dass das Objekt
dort steht, wo Gaia es vorhersagt, dass das Spektrum kein Artefakt ist. **Es ist die Person, die sagen darf,
«das ist falsch», ohne die Korrektur vorschlagen zu müssen.**
Passendes Profil: wer das beste astronomische Urteilsvermögen hat. In diesem Team natürlicherweise von der Physikseite.

### N — Narrativ und Abgabe
Verantwortlich für `README.md`, die Demo, den Pitch und das Abgabeformular.
Beginnt **ab Stunde 0** zu arbeiten, nicht am Ende. Der klassische Fehler bei Hackathons ist, die
Abgabe auf die letzten zwei Stunden zu verschieben und zu entdecken, dass die Hälfte des Formulars fehlt.
Passendes Profil: wer am besten öffentlich spricht, denn es ist auch die Person, die präsentiert.

> **Die Rollen sind keine Käfige.** Ab Stunde 12, wenn der kritische Pfad freigegeben ist, teilen D und
> V die zusätzlichen Stichpunkte unter sich auf. Aber C und N **lösen sich nicht auf**: Wenn niemand verifiziert und niemand
> die Abgabe vorbereitet, wird das Projekt zu spät und mit Fehlern abgegeben.

---

## Wie der Code koordiniert wird

**Trunk-based mit kurzen Branches.** `main` startet immer.

```bash
git switch -c d/sia2-epochs      # inicial del rol + tema
# ... trabajo ...
git push -u origin d/sia2-epochs
# PR. Lo mira otro. Se mergea.
```

Regeln:

1. **Niemand pusht direkt auf `main`.** Weder du noch dein Agent.
2. **Branches leben weniger als 3 Stunden.** Wenn ein Branch länger läuft, war die Aufgabe zu groß.
3. **Einen PR prüft eine Person, kein Agent.** Den Diff anzusehen dauert zwei Minuten und erspart Stunden.
4. **Der Vertrag der API wird zuerst in `docs/03_ARQUITECTURA.md` geändert** und angekündigt, bevor man Code
   anfasst. Eine stille Vertragsänderung blockiert jemand anderen, ohne dass er es merkt.
5. **Kein FITS im Repository.** `data/cache/` steht in `.gitignore`.

### Worktrees: ein Ordner pro Person

Wenn zwei Personen (oder zwei Agenten) im selben Ordner arbeiten, überschreiben sie sich ohne Warnung. Mit
`git worktree` hat jeder seine Kopie auf demselben Repository:

```bash
git worktree add ../spherex-d d/sia2-epochs
cd ../spherex-d
```

Das ist der Unterschied zwischen vier zusammenarbeitenden Agenten und vier Agenten, die um dieselben Dateien streiten.

---

## Der 90-Minuten-Zyklus

Der Hackathon ist in Blöcke von 90 Minuten unterteilt. Am Ende jedes Blocks gibt es **fünf Minuten im Stehen**,
alle, mit dem Befehl `/standup`:

1. **Was funktioniert jetzt** — nicht «was ich getan habe», sondern was man öffnen und ansehen kann.
2. **Was ist blockiert und durch wen.**
3. **Was ich in den nächsten 90 mache.**

Fünf Minuten. Ohne Bildschirme. Wenn jemand mehr braucht, wird separat gesprochen.

Warum 90: Es reicht, um etwas fertigzustellen, und ist kurz genug, damit ein falscher Weg nicht die halbe Nacht kostet.

---

## Wie man hier einen Agenten einsetzt

Das trennt ein Team, das Agenten nutzt, von einem, dem die Agenten über den Kopf wachsen.

**Eine Sitzung pro Front.** Vermische nicht das Daten-Backend mit dem Frontend in derselben Claude-Code-
Sitzung. Der Kontext wird verunreinigt und der Agent beginnt, dumme Fehler zu machen. Wenn du das
Thema wechselst, neue Sitzung, mit `/traspaso`, wenn du den Kontext mitnehmen musst.

**Der Agent schlägt vor, die Person entscheidet.** Für alles, was mehr als zwei Dateien berührt: erst Plan,
dann Genehmigung. Bei einem Hackathon ist die Versuchung enorm, ihn einfach laufen zu lassen, und es ist der
schnellste Weg, um 5 Uhr morgens bei 2.000 Zeilen zu landen, die niemand versteht.

**Verifiziere das Artefakt, nicht den Bericht.** Dass der Agent «es funktioniert jetzt» sagt, ist ein Datum, keine Tatsache.
Öffne die URL. Sieh dir das Bild an. Zähle die Epochen. Das ist kein Misstrauen: Der Agent kann den Bildschirm
nicht sehen.

**Wenn etwas beim dritten Mal nicht klappt, wechsle den Ansatz, nicht den Prompt.** Wenn du drei Versuche damit
verbracht hast, dasselbe zu korrigieren, liegt das Problem nicht darin, wie du es verlangt hast.

**Lass niemals einen Agenten allein den Umfang entscheiden.** Den Umfang setzt das Team mit dem Plan aus
[`05_PLAN_24H.md`](05_PLAN_24H.md). Ein Agent baut, wenn du ihn lässt, alle Stichpunkte der Aufgabenstellung
halb statt drei vollständig.

**Nutze die Subagents für das, was den Kontext verschmutzt.** In der IRSA-Dokumentation suchen, 20 SIA2-Abfragen
testen, die UI prüfen: Das geht an `explorador-datos`, `revisor-cientifico` oder
`revisor-interfaz`, die die Schlussfolgerung ohne das Füllmaterial zurückgeben.

---

## Aufteilung zwischen Claude Code und Antigravity

Wenn im Team beide Werkzeuge nebeneinander existieren, erfolgt die Standardaufteilung **nach Dateien**, nie nach
Thema:

| Werkzeug | Dateien |
|---|---|
| Claude Code | `backend/`, `tests/`, `docs/` |
| Antigravity | `frontend/` |

Zwei Agenten, die dieselbe Datei bearbeiten, überschreiben sich ohne Warnung, und keiner von beiden wird es dir sagen.

---

## Definition von «fertig»

Eine Aufgabe ist fertig, wenn:

- [ ] Sie mit **mindestens einem realen Feld** aus `data/campos_de_prueba.yml` funktioniert.
- [ ] Eine andere Person sie geöffnet und funktionieren gesehen hat.
- [ ] Was nicht abgedeckt wurde, laut ausgesprochen ist (fehlende Bänder, ungetestete Fälle).
- [ ] Sie nichts kaputt gemacht hat, was schon funktionierte (`/chequeo-demo`).

Sie ist nicht fertig, weil ein Agent sagt, dass sie es ist.

---

## Die drei obligatorischen Halte

Das sind die einzigen Dinge, über die nicht verhandelt wird, was auch immer mit dem Code passiert:

| Moment | Was passiert |
|---|---|
| **T − 6 h** | **Scope-Freeze.** Es wird nichts Neues begonnen. Es wird nur korrigiert und poliert, was existiert |
| **T − 4 h** | **Demo aufgenommen.** Das Video muss fertig sein, auch wenn die Anwendung weiter besser wird. Wenn sie danach besser wird, wird neu aufgenommen. Wenn die Zeit nicht reicht, gibt es schon ein Video |
| **T − 2 h** | **Abgabe hochgeladen.** Formular vollständig, Links gesetzt, Erklärung zur KI-Nutzung geschrieben. Wenn Zeit bleibt, wird editiert; aber **es ist bereits abgegeben** |

`T` ist die Uhrzeit des Abgabeschlusses der lokalen Veranstaltung. Bei der Veranstaltung in Santiago hat JP am 14. Nov.
(live von der Organisation mitgeteilt) bestätigt, dass es **11:00 am Sonntag, dem 15.** ist ([`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)).
Das ist die Zahl, die alles andere ordnet.

Das Projekt, das gewinnt, ist nicht das mit dem meisten Code. Es ist das, das vollständig ankommt.
