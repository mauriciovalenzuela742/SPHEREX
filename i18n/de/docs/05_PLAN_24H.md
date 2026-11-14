<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/05_PLAN_24H.md) · [Español](../../es/docs/05_PLAN_24H.md) · [中文](../../zh/docs/05_PLAN_24H.md) · **Deutsch** · [Italiano](../../it/docs/05_PLAN_24H.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/05_PLAN_24H.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 05 — Plan der 24 Stunden

Plan in Blöcken, mit Abbruchkriterium in jedem. **Er ist so geschrieben, dass man kürzen kann.** Wenn ein Block
seine Zeit überschreitet, wird das Abbruchkriterium angewandt und es geht weiter: In einem Hackathon ist der Feind nicht der Mangel an
Ideen, sondern der Mangel an Disziplin, eine aufzugeben.

Referenzzeiten des lokalen Events in Santiago (Arbeitsbeginn Samstag 10:00, **Abgabeschluss
Sonntag 11:00**, von JP am 14. Nov. bestätigt und live von der Organisation mitgeteilt; siehe
[`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)). Pitch: 2 Minuten + 2 Fragen; seine Uhrzeit ist nicht
bestätigt. Wenn sich etwas ändert, werden die Blöcke neu berechnet, nicht die Reihenfolge.

| Rolle | Wer |
|---|---|
| D — Daten | Vladimir (D1 Zugriff) · Bryan (D2 Einzelbilder) |
| V — Viewer | Antonia (V1 Blink) · Juan Pablo (V2 Himmel) |
| C — Wissenschaft und Verifikation | Mauricio (+ Deployment) |
| N — Narrativ und Abgabe | Javiera |

*(In Stunde 0 ausfüllen. Wenn jeder weiß, was seins ist, vermeidet das die Hälfte der Reibereien.)*

---

## Block 0 · Stunde 0 – 1 · Alle · **Abstimmen**

Das Rentabelste des ganzen Tages und das, was die meisten Teams überspringen.

- Gemeinsam [`00_DESAFIO.md`](00_DESAFIO.md) laut lesen. 10 Minuten. Vor allem die
  *Potential Considerations*: Sie sind das Bewertungsraster.
- Rollen verteilen und oben in dieser Datei eintragen.
- **Die genaue Uhrzeit des Abgabeschlusses bestätigen.** Daraus ergeben sich T−6, T−4 und T−2.
- Das Repository auf GitHub anlegen, das Kit hochladen, allen sechs Zugriff geben.
- `scaffold/` hochfahren: Backend und Frontend starten und sind zu sehen. Es tut nichts; es startet.
- [`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) öffnen und die Stack-Entscheidung unterschreiben (oder ändern).

**Abbruch:** Wenn das Grundgerüst in Stunde 1 nicht startet, ist es ein Umgebungsproblem und wird mit allen angegangen.
Niemand macht weiter, bis alle sechs das Projekt ausführen können.

---

## Block 1 · Stunde 1 – 3 · D1 + D2 + C · **Die Stunde der Wahrheit mit den Daten**

> **Beantwortet am 14. Nov.:** siehe [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) und
> [`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md). Das Folgende bleibt als Referenz des Plans.

Der Block, der das Projekt entscheidet. Es ist die Checkliste vom Ende von
[`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md), Punkt für Punkt.

- Echte SIA2-Abfrage auf WISE 0855, in `spherex_dr1` und in `spherex_qr3`. Wie viele Zeilen?
- Wie viele **verschiedene Epochen** gibt es für ein typisches Feld? Das entscheidet, ob das Video 5 oder 50 Einzelbilder hat.
- Einen Cutout mit `size=0.1`: **zeitlich messen**. Entscheidet, ob Cache, Warteschlange oder beides nötig ist.
- Das zugeschnittene MEF öffnen. Die 6 Extensions bestätigen.
- **`WCS-WAVE` von zwei Epochen desselben Feldes lesen und messen, wie stark sich die Wellenlänge ändert.**
  Das ist die wichtigste Frage des Tages (siehe [`02`](02_DATOS_SPHEREX.md) §2).
- Lädt der HiPS-Cube von DR1 in Aladin Lite? Antwortet IRSA mit CORS vom Browser aus?

In der Zwischenzeit **wartet V nicht**: Es baut den Mock des Vertrags aus
[`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) und arbeitet dagegen. **N** beginnt das README und öffnet das
Abgabeformular, um zu sehen, was es verlangt.

**Abbruch:** In Stunde 3 muss es eine schriftliche Antwort auf jede Frage geben, auch wenn eine «wir
konnten es nicht herausfinden» lautet. Wenn sich die Cutouts wegen Langsamkeit als nicht machbar erweisen, **ändert sich der Plan hier**, nicht
in Stunde 15.

---

## Block 2 · Stunde 3 – 8 · **Der kritische Pfad**

Die beiden Wege parallel, ohne Abhängigkeiten zwischen ihnen.

**D — minimales Backend, das von Anfang bis Ende funktioniert**
`/api/epochs` und `/api/frames` für **ein einziges Band**, ohne Steuerelemente, ohne Modi, mit Cache auf Platte.
Fest verdrahtet, wo nötig. **Wichtig ist, dass aus einer Koordinate eine Sequenz von PNGs herauskommt.**

**V — minimaler Viewer, der von Anfang bis Ende funktioniert**
Koordinatenfeld → Aufruf → Einzelbilder in einem `<canvas>` → Play/Pause. Hässlich. Funktional.
Und daneben Aladin Lite, das den HiPS-Cube lädt, das ist Weg A.

**C** — füllt `data/campos_de_prueba.yml` mit den fünf Objekten, gegen SIMBAD verifiziert, und schreibt auf,
was in jedem zu sehen sein sollte. Bereitet die Prüfung mit Gaia vor.

**N** — README, Projektname, der Ein-Zeilen-Satz. Der Satz kostet mehr, als es scheint,
und ist das, woran sich die Jury erinnert.

**Abbruch — Meilenstein von Stunde 8:** *Eine von Hand eingegebene Koordinate erzeugt ein kleines Video auf dem Bildschirm.*
Hässlich, langsam, ein einziges Band, egal. **Wenn es in Stunde 8 kein kleines Video gibt, wird alles andere ausgesetzt**
und alle sechs setzen sich daran.

---

## Block 3 · Stunde 8 – 14 · **Dass es gut wird**

Jetzt ja, nach Wert geordnet. Die Reihenfolge ergibt sich aus den Punkten der Challenge und aus dem, was jeder kostet.

| Priorität | Was | Wer | Warum |
|---|---|---|---|
| 1 | Auswahl von Band / Detektor | D + V | Es ist der Punkt der 102 Bänder und löst das Problem der variablen λ |
| 2 | Steuerelemente: Stretch, Farbe, fps, Gesichtsfeld | V | WiseView zeigt, dass man **ohne das nichts sieht**. Billig und entscheidend |
| 3 | Bilddifferenz (`diff_first`, `diff_prev`) | D | Ausdrücklicher Punkt. Spektakulär auf dem Bildschirm. Billig |
| 4 | Namensauflösung (SIMBAD) | D + V | Macht das Werkzeug für jeden nutzbar |
| 5 | Abfragbare und teilbare URL | V | Ausdrücklicher Punkt. Eine halbe Stunde Arbeit |
| 6 | Gaia-DR3-Overlay | V + C | Ausdrücklicher Punkt **und** der Beweis, dass der Viewer korrekt ist |
| 7 | Kontaminations-Flags | D + V | Ausdrücklicher Punkt. Ein Feld, das bereits im MEF steckt |
| 8 | Spektrum on the fly | D | «Extra kudos». Das teuerste der Liste. **Nur wenn 1–7 abgeschlossen sind** |

**Abbruch — T − 6 h: Scope-Freeze.** Was nicht begonnen ist, wird nicht begonnen. Was begonnen ist, wird
abgeschlossen oder entfernt. Eine halbfertige Funktion kostet Punkte: Die Jury klickt genau dort.

---

## Block 4 · T − 6 h bis T − 4 h · **Polieren und verifizieren**

- **C lässt die fünf Testfelder einzeln in der deployten Anwendung laufen.** Nicht lokal.
- Den Cache der fünf vorwärmen. Die Demo wird nie mit einer kalten Abfrage gemacht.
- Leere und Fehlerzustände: Was sieht der Nutzer, wenn es an dieser Koordinate keine Daten gibt? Wenn IRSA nicht antwortet?
  **Die Jury wird zufällige Koordinaten eingeben.** Sie soll keinen leeren Bildschirm sehen.
- Dass es auf einem Handy funktioniert, und sei es nur halb. Jemand aus der Jury wird es auf dem Telefon öffnen.
- Fußzeile mit der verpflichtenden Quellenangabe von SPHEREx ([`02`](02_DATOS_SPHEREX.md) §8).

---

## Block 5 · T − 4 h bis T − 2 h · **Demo und Abgabe**

- **Das Demo-Video aufnehmen.** Skript im Skill `demo-y-pitch`. Dauert so lange, wie das Event verlangt.
- Den **degradierten Modus** funktionsfähig lassen: Die Anwendung liefert die fünf Felder aus dem Cache ohne
  Internet. Das WLAN eines Hackathons fällt aus; das des Pitch-Raums erst recht.
- **Die vollständige Abgabe hochladen**, einschließlich der Beschreibung, wie KI eingesetzt wurde, die in diesem Jahr
  verpflichtend ist. Checkliste im Skill `entrega-nasa`.

**T − 2 h: abgegeben.** Ab hier ist alles andere optionale Verbesserung an etwas bereits Abgegebenem.

---

## Block 6 · T − 2 h bis zum Pitch · **Proben**

- N probt den Pitch **laut, mit Stoppuhr**, dreimal. In Santiago sind es 2 Minuten + 2 Fragen:
  2 Minuten sind viel weniger, als es scheint.
- Die anderen fünf spielen die Jury und fragen das Unbequeme:
  - «Macht das nicht schon der Data Explorer von IRSA?»
  - «Woher weißt du, dass das Bild von dieser Koordinate stammt?»
  - «Was passiert, wenn ich eine Koordinate ohne Daten eingebe?»
  - «Warum habt ihr kein maschinelles Lernen benutzt?»

  Die Antworten auf die erste und die letzte stehen in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md);
  die zweite ist das Gaia-Overlay; die dritte ist der leere Zustand aus Block 4.
- Im Browser offen lassen: die deployte Anwendung, das Video und das Repository. Sonst nichts.

---

## Was wir mit 6 Stunden mehr tun würden

Für die Antwort auf «und was kommt als Nächstes?», die immer gefragt wird:

- Kandidaten mit permanenter URL markieren und speichern, im Stil von Backyard Worlds.
- Bilddifferenz, ausgerichtet nach vorhergesagter Eigenbewegung (Gaia) statt nach fester Position.
- Automatisches Aussortieren von Kandidaten mit einem kleinen Netz auf Ausschnitten, im Stil des *stamp
  classifier* von ALeRCE. **Das ist die ehrliche Rolle der KI hier**, kein Video-Transformer.
- Die Sequenz als GIF oder als Subject Set von Zooniverse exportieren.
