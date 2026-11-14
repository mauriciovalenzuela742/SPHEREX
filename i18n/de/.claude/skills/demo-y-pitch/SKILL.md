---
name: demo-y-pitch
description: Die aufgezeichnete Demo und den Pitch des Projekts vor der Hackathon-Jury vorbereiten: Skript der Demo, was in welcher Reihenfolge gezeigt wird, wie sie aufgenommen wird, der Zwei-Minuten-Pitch mit seiner Struktur, die unbequemen Fragen der Jury mit ihren Antworten und der Plan B, falls die Verbindung ausfällt. Aktiviere sie, wenn Demo, Video, Pitch, Präsentation, Jury, Bildschirmaufnahme, Skript oder Proben erwähnt werden, oder wenn nur noch wenige Stunden bis zum Abschluss bleiben und vorbereitet werden muss, was präsentiert wird.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../../en/.claude/skills/demo-y-pitch/SKILL.md) · [Español](../../../../es/.claude/skills/demo-y-pitch/SKILL.md) · [中文](../../../../zh/.claude/skills/demo-y-pitch/SKILL.md) · **Deutsch** · [Italiano](../../../../it/.claude/skills/demo-y-pitch/SKILL.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `.claude/skills/demo-y-pitch/SKILL.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Demo und Pitch

Die Jury liest keinen Code. Sie sieht eine Zwei-Minuten-Demo und stellt zwei Fragen. Diese Skill soll dafür sorgen, dass
diese zwei Minuten nicht improvisiert werden.

Vollständiger Kontext zu Preisen und Kriterien: `docs/06_JURADO_Y_PITCH.md`.

---

## Regeln, über die nicht verhandelt wird

1. **Die Demo wird bei T − 4 h aufgenommen**, auch wenn die Anwendung weiter besser wird. Wenn sie danach besser wird,
   wird neu aufgenommen. Wenn die Zeit nicht reicht, gibt es schon ein Video.
2. **Nie live gegen eine kalte Abfrage demonstrieren.** Die fünf Testfelder sind im Cache
   vorgewärmt.
3. **Das Video liegt heruntergeladen auf der Platte des Rechners, der präsentiert.** Nicht in der Cloud. Das WLAN des
   Pitch-Raums fällt aus.
4. **Es wird gezeigt, was da ist.** Kein „könnte“ und kein „mit mehr Zeit würden wir“. Was fehlt, wird
   ein einziges Mal am Ende als das Nächste genannt.
5. **Es wird nicht versprochen, etwas entdeckt zu haben.** Eine Jury mit Astronomen bestraft das sofort.

---

## Skript der Demo

Jeder Schritt hat einen Zweck. Die Reihenfolge ist kein Zufall: Das Eindrucksvollste kommt zuerst, falls abgebrochen wird.

| # | Aktion | Was es zeigt |
|---|---|---|
| 1 | Die URL öffnen. Es blinkt bereits ein Feld | Dass es wirklich funktioniert, ohne etwas zu konfigurieren |
| 2 | **`WISE 0855`** eingeben (den Namen, nicht Koordinaten) | Dass es für jede Person ist, nicht nur für Astronomen |
| 3 | Play und dann **Differenzmodus** (erste − letzte). **WISE 0855 ist ein Pflichtfall und wird immer gezeigt**: ehrlich sagen, dass es in einer einzelnen Belichtung schwach zu sehen ist und dass die Bewegung (~1,3 px über den gesamten Zeitraum) in der Subtraktion sichtbar wird (und mit der Summe pro Durchgang, sobald es sie gibt). Ergänzungen: Overlay CatWISE2020 (V2 Juan Pablo; WISE 0855 ist nicht in Gaia, CatWISE liefert seine Eigenbewegung; **erledigt im Branch `v/v2-catwise`, PR ausstehend**; Skill `coordenadas-astro`) und Summe pro Durchgang mit Gewichten 1/VARIANCE (D2 Bryan; **ausstehend**; `docs/10`, `docs/09`). Der Leitfaden der Challenge wertet das Überlagern von Gaia und WISE; sie nicht als Teil des deployten Viewers präsentieren, bis sie in `main` sind | Die Challenge, erfüllt ohne Übertreibung. Das ist der Moment der Demo |
| 4 | Die fps senken und es noch einmal ansehen | Dass die Regler wichtig sind und wir wissen, warum |
| 5 | Das Band wechseln. Dieselbe Region bei anderer λ | Die 102 Bänder. Soweit wir prüfen konnten, kombiniert kein öffentliches Werkzeug sie mit dem zeitlichen Blink auf einem Bildschirm |
| 6 | Das Gaia-Overlay einschalten (bei WISE 0855 gibt es kein Gaia: CatWISE2020 verwenden; es an Barnard oder eps Ind B zeigen). Die Marker landen auf den Quellen | *„So wissen wir, dass es korrekt ist.“* Beantwortet die Frage, bevor sie gestellt wird |
| 7 | **eps Ind B** im Differenzmodus laden | Hier ist die Bewegung am deutlichsten (−0,85/−0,71 px gemessen). Spiegelstrich der Challenge |
| 8 | **RW Aurigae** laden: ändert die Helligkeit, ohne sich zu bewegen. Achtung: sättigt und hinterlässt in der Subtraktion ein rot/blaues Paar, auch wenn es sich nicht bewegt; seine Photometrie wurde nicht gemessen, daher wird es nicht als Beweis für Variabilität präsentiert | Dass der Viewer warnt, wenn ein Objekt sättigt |
| 9 | Die URL kopieren und in einem anderen Tab öffnen | Teilbar und einbettbar. Spiegelstrich der Challenge |
| 10 | Falls es ein Spektrum gibt: auf eine Quelle klicken | Das „Extra Kudos“ |

Wenn nur Zeit für drei Schritte bleibt: **2, 3 und 5**. Name → es bewegt sich → anderes Band.

---

## Das Video aufnehmen

- **Dauer:** die, die das Event verlangt. Wenn es nichts sagt, 30–60 Sekunden. Ein langes Video wird nicht ganz angesehen.
- **Ohne gesprochenen Ton**, wenn es eilt: kurze eingeblendete Untertitel funktionieren genauso, und man
  muss nicht wegen eines falsch gesprochenen Wortes neu aufnehmen.
- **Sauberer Bildschirm:** ein einziges Fenster, keine privaten Tabs, keine Benachrichtigungen, keine sichtbaren
  Benutzernamen.
- **Langsamer Cursor.** Schnelle Mausbewegungen kann man im Video nicht verfolgen.
- **Zwei oder drei Sekunden Stillstand** bei jedem Schlüsselmoment, vor allem wenn sich das Objekt bewegt: Das Auge
  braucht Zeit, es zu sehen.
- **Keine Minderjährigen** in Bild oder Ton, wegen der Regeln des Events.
- Die Datei **auf der lokalen Platte** speichern und dorthin hochladen, wohin die Abgabe es verlangt.

---

## Der Zwei-Minuten-Pitch

**0:00 – 0:20 · Aufhänger.** 1930 wurde Pluto entdeckt, indem zwei Fotos desselben Himmelsstücks verglichen wurden.
Heute fotografiert SPHEREx alle sechs Monate den ganzen Himmel in 102 Infrarotfarben, und niemand
sieht ihn sich so an.

**0:20 – 1:10 · Live-Demo.** Die Hälfte der Zeit. Das ist es, was bewertet wird.

**1:10 – 1:35 · Warum es wichtig ist.** Die meisten bekannten Braunen Zwerge und Kometen wurden von
Freiwilligen entdeckt, die auf Blinkbilder schauten. Diese Community existiert und hat keine Möglichkeit, SPHEREx anzusehen. Der
meistzitierte Kandidat für Planet Nine entstand aus dem Vergleich zweier zeitlich getrennter Infrarot-Surveys:
dieselbe Technik.

**1:35 – 2:00 · Was wir gebaut haben.** Stack in einem Satz, DR1 in diesem Monat veröffentlicht, öffentliche URL, offener
Code und eine Zeile dazu, was als Nächstes kommt.

**Um 1:50 fertig zu sein, mit allem gezeigt, ist besser, als sich um 2:10 zu verhaspeln.**

---

## Die Fragen, mit ihrer Antwort

**„Macht das nicht schon der Data Explorer von IRSA?“** — Nicht für dieses Publikum. Der Data Explorer ist ein
Archiv für Astronomen. Wir lösen den Namen auf, gruppieren die Epochen, normalisieren und
liefern das Blinken. Das ist der Unterschied zwischen einem Archiv und einem Viewer; derselbe, der
WiseView gegenüber dem WISE-Archiv nützlich gemacht hat.

**„Woher weiß ich, dass das Bild von dieser Koordinate ist?“** — Durch das Gaia-Overlay. *(Und es wird gezeigt.)*

**„Warum habt ihr kein maschinelles Lernen benutzt?“** — Weil die Challenge einen Viewer für Menschen verlangt und
der eigentliche Flaschenhals darin liegt, die Daten heranzuholen und auszurichten, nicht die Bewegung zu erkennen. Wo KI
etwas beiträgt, ist das Vorsortieren von Kandidaten mit kleinen Netzen auf Ausschnitten, wie es der Broker ALeRCE
mit den ZTF-Alerts macht, und das haben wir als Ausblick festgehalten.

**„Was passiert, wenn ich eine Koordinate ohne Daten eingebe?“** — *(Man gibt eine ein und zeigt den Leerzustand.)*

**„Skaliert es auf den ganzen Himmel?“** — Bei der Abdeckung ja: Die Abfrage erfolgt nach Position gegen SIA2. Was ohne
Infrastruktur nicht skaliert, ist der Cache; im großen Maßstab müssten Ausschnitte vorab berechnet werden, was
unWISE für WiseView tut.

**„Wie korrekt sind die Spektren?“** — Indikativ, Apertur-Photometrie mit abgezogenem Zodiakallicht,
und das sagen wir in der Oberfläche selbst. Für Wissenschaft gibt es das Spectrophotometry Tool von IRSA.

---

## Bevor du zum Präsentieren hinausgehst

- [ ] Video heruntergeladen auf der Platte des präsentierenden Rechners.
- [ ] Anwendung geöffnet, Cache warm, die fünf Felder **vor weniger als einer Stunde** getestet.
- [ ] Tabs: Anwendung, Video, Repository. **Sonst nichts.**
- [ ] Benachrichtigungen stummgeschaltet. Präsentationsmodus.
- [ ] Akku oder Ladegerät.
- [ ] Jemand aus dem Team hat das Video auch auf dem Handy.
- [ ] Laut geprobt und gestoppt, **dreimal**.
