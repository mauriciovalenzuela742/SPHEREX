<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/06_JURADO_Y_PITCH.md) · [Español](../../es/docs/06_JURADO_Y_PITCH.md) · [中文](../../zh/docs/06_JURADO_Y_PITCH.md) · **Deutsch** · [Italiano](../../it/docs/06_JURADO_Y_PITCH.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/06_JURADO_Y_PITCH.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 06 — Jury, Preise und Pitch

---

## Wie bewertet wird

Der Trichter von Space Apps ist: Die Jury des lokalen Events wählt **Global Nominees** → Experten der NASA
und der Partneragenturen wählen **Global Finalists** und lobende Erwähnungen → ein Exekutivkomitee wählt die
**10 Global Winners**.

Das heißt: **Der erste Filter ist eine lokale Jury**, mit wenig Zeit pro Team und ohne den Code zu lesen.
Danach Leute von der NASA, die etwas von Astronomie verstehen. Das Projekt muss in beiden
Registern funktionieren: in zwei Minuten beeindrucken und einem Expertenblick standhalten.

Beim Event in Santiago ist das angekündigte Format **2 Minuten Pitch + 2 Fragen**.

## Die zehn globalen Preise, und welche unsere sind

| Preis | Unser? |
|---|---|
| **Best Use of Data** | **Ja, der wichtigste.** Es ist buchstäblich «Weltraumdaten zugänglich machen». Die Challenge verlangt genau das |
| **Best Use of Science** | **Ja.** Die Spektralachse gut zu zeigen und mit Gaia zu validieren ist sichtbare wissenschaftliche Methode |
| **Best Use of Technology** | Möglich, wenn der Viewer technisch auffällig ist (102 Bänder im Browser) |
| **Galactic Impact** | Möglich: Bürgerwissenschaft im großen Maßstab |
| **Best Use of Storytelling** | **Ja, wenn wir daran arbeiten.** Die Geschichte von Pluto und dem Blinkkomparator liegt bereit |
| **Most Inspirational** | Möglich, geht mit dem Vorigen einher |
| **Global Connection** | Möglich, wenn wir Ressourcen der Partneragentur (CSA/NEOSSat) nutzen und den Viewer als geteilte Infrastruktur denken |
| Best Mission Concept | Nein. Wir schlagen keine Mission vor |
| Art & Technology | Nein, außer der Viewer wird visuell bemerkenswert |
| Local Impact | Schwach, es sei denn, wir verbinden ihn mit chilenischer Astronomie |

**Auf zwei oder drei zielen, nicht auf zehn.** Best Use of Data und Best Use of Science sind die natürlichen; der für
Storytelling ist geschenkt, wenn N die Erzählung ab Stunde 0 bearbeitet.

---

## Die acht Punkte der Challenge sind das Bewertungsraster

Die *Potential Considerations* sind das, was der Autor der Challenge sehen will. Jede erfüllte ist
ein Punkt, den ein NASA-Juror erkennen wird.

| Punkt der Challenge | Wie wir ihn erfüllen | Aufwand |
|---|---|---|
| Einfach mit neuen Releases zu aktualisieren | SIA2-Sammlungen per Konfiguration, nicht fest verdrahtet | Gering |
| Die 102 Bänder kreativ zeigen | Bandwähler + HiPS-Cube | **Mittel, und es ist das Alleinstellungsmerkmal** |
| Bilder verschiedener Epochen addieren oder subtrahieren | `mode=diff_first` / `diff_prev` | Gering |
| Wählbares Gesichtsfeld | Parameter `size` | Sehr gering |
| Gaia oder WISE überlagern | Katalog-Overlay in Aladin Lite | Gering |
| Koordinaten in der URL | `?ra=&dec=&...`, das den Zustand widerspiegelt | Sehr gering |
| Metadaten wie Kontaminations-Flags zeigen | Extension `FLAGS` des MEF | Gering |
| Öffentliche Werkzeuge nutzen (Astropy, Aladin) | Sie sind der Stack | Null |

Sieben der acht sind von geringem oder sehr geringem Aufwand. **Man muss alle erfüllen.** In
[`05_PLAN_24H.md`](05_PLAN_24H.md) stehen sie in der Reihenfolge, in der sie angegangen werden.

---

## Der 2-Minuten-Pitch

Struktur. Die Zeiten sind ungefähr, aber die Reihenfolge ist nicht verhandelbar: **die Demo kommt vor der
Erklärung**, denn wenn man abgebrochen wird, haben sie wenigstens das Werkzeug gesehen.

**0:00 – 0:20 · Der Aufhänger**

> 1930 entdeckte Clyde Tombaugh Pluto, indem er zwei Fotos derselben Himmelsregion ansah und bemerkte, dass
> sich ein Punkt bewegt hatte. Heute fotografiert SPHEREx alle sechs Monate den gesamten Himmel in 102 Farben
> des Infrarots, und niemand schaut ihn sich so an.

**0:20 – 1:10 · Die Demo, live** *(die Hälfte der Zeit; das ist es, was bewertet wird)*

1. `WISE 0855` eintippen. Name, nicht Koordinaten: Das zeigt, dass es für jeden ist. Es ist ein Pflichtfall
   (eines der Testobjekte der Organisation) und wird immer gezeigt.
2. Play drücken und dann die Differenz erstes − letztes. **Der Braune Zwerg bewegt sich** (~1,3 px über den gesamten
   Zeitraum): ein rot/blaues Paar. Es wird ehrlich gesagt, dass er in einer einzelnen Belichtung schwach wirkt und dass
   die Summe pro Durchgang das verbessern wird. Danach **eps Ind B**, wo die Bewegung deutlicher zu sehen ist
   (−0,85/−0,71 px gemessen gegenüber −0,92/−0,57 vorhergesagt).
   Für WISE 0855 hat der Plan zwei Ergänzungen: das Overlay von CatWISE2020 (er ist nicht
   in Gaia und CatWISE bringt seine Eigenbewegung mit; Verantwortlicher V2 Juan Pablo; **fertig im Branch `v/v2-catwise`,
   PR ausstehend**: markiert WISE 0855 2,6″ von der aus SIMBAD propagierten Position) und die Summe pro Durchgang
   mit Gewichten 1/VARIANCE (Verantwortlicher D2 Bryan; `docs/10` und `docs/09`; **ausstehend**). Der Leitfaden der Challenge schätzt es, Gaia und WISE
   zu überlagern. Bis sie in `main` landen, werden sie nicht als Teil des deployten Viewers präsentiert.
3. Den Bandwähler bewegen. Dieselbe Himmelsregion bei einer anderen Wellenlänge.
4. Das Gaia-Overlay über Barnard oder eps Ind B einschalten (WISE 0855 ist nicht in Gaia: sein Overlay ist
   CatWISE2020). Die Punkte fallen dorthin, wo sie sollen. *«So wissen wir, dass es korrekt ist.»*
5. Die URL kopieren. *«Das ist teilbar und einbettbar.»*

**1:10 – 1:35 · Warum es wichtig ist**

> Die meisten bekannten Braunen Zwerge und Kometen wurden von Freiwilligen gefunden, die sich
> Blinkbilder angeschaut haben. Diese Community existiert und hat heute keine Möglichkeit, SPHEREx zu betrachten. Der meistzitierte Kandidat für
> Planet Nine entstand aus dem Vergleich zweier zeitlich getrennter Infrarot-Surveys: dieselbe
> Technik. Wir öffnen sie für jeden, mit der Spektralachse der 102 Bänder (soweit wir prüfen konnten, kombiniert kein öffentliches Werkzeug sie mit dem zeitlichen Blink auf einem einzigen Bildschirm).

**1:35 – 2:00 · Was wir gebaut haben und was als Nächstes kommt**

Stack in einem Satz, echte Daten von DR1 —in diesem Monat veröffentlicht—, öffentliche URL, offener Code.
Und eine Zeile dazu, was als Nächstes kommt.

### Regeln des Pitches

- **Niemals live gegen eine kalte Abfrage demonstrieren.** Die fünf Felder sind vorgewärmt.
- **Video bereit in einem anderen Tab.** Wenn das WLAN ausfällt, wird das Video ohne Entschuldigung abgespielt.
- **Man sagt nicht «könnte».** Man zeigt, was da ist. Was nicht da ist, wird als das genannt, was als Nächstes kommt.
- **Man verspricht nicht, etwas gefunden zu haben.** Eine Jury mit Astronomen bestraft das sofort.
- Wenn Zeit übrig bleibt, **gibt man sie zurück**. Mit allem Gezeigten um 1:50 aufzuhören ist besser, als um 2:10 zu hetzen.

---

## Die unbequemen Fragen, mit ihrer Antwort

**«Macht das nicht schon der Data Explorer von IRSA?»**
Nicht für dieses Publikum. Der Data Explorer ist ein Archiv für Astronomen: Man muss wissen, welche Sammlung man
anfordert, was ein MEF ist und wie man ein Bild streckt. Wir lösen den Namen auf, gruppieren die
Epochen, normalisieren und liefern das Blinken. Das ist der Unterschied zwischen einem Archiv und einem Viewer, und es ist
derselbe Unterschied, der WiseView gegenüber dem WISE-Archiv nützlich machte.

**«Woher weiß ich, dass das Bild von der Koordinate stammt, die ich angefragt habe?»**
Durch das Gaia-Overlay: Wir zeichnen die Positionen, die Gaia für dieses Datum vorhersagt, und sie fallen auf die
Quellen im Bild. *(Und es wird auf dem Bildschirm gezeigt.)*

**«Warum habt ihr kein maschinelles Lernen benutzt?»**
Weil die Challenge einen Viewer für Menschen verlangt, und weil der eigentliche Flaschenhals ist, die richtigen Daten zu holen und auszurichten,
nicht die Bewegung zu erkennen. Wo KI hier etwas beiträgt, ist das Aussortieren von
Kandidaten mit kleinen Netzen auf Ausschnitten —was der Broker ALeRCE mit den Alerts von ZTF macht—,
und wir lassen das als nächsten Schritt stehen. *(Ausgeführt in [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6.)*

**«Was passiert, wenn ich eine Koordinate ohne Daten eingebe?»**
*(Man tippt eine ein und zeigt den leeren Zustand, der sagt, wie viele Epochen es gibt, und ein nahes Feld vorschlägt.)*

**«Skaliert das auf den gesamten Himmel?»**
Die Abfrage erfolgt nach Position gegen SIA2, also ja in der Abdeckung. Was ohne
Infrastruktur nicht skaliert, ist der Cache: Heute wärmen wir Felder vor; im großen Maßstab müsste man Ausschnitte vorberechnen,
genau das, was unWISE für WiseView tut.

**«Wie korrekt sind die Spektren?»**
Sie sind indikativ, Aperturphotometrie mit abgezogenem Zodiakallicht, und wir sagen das in der
Oberfläche selbst. Für Wissenschaft gibt es das Spectrophotometry Tool von IRSA. *(Niemals sagen, dass sie von wissenschaftlicher Qualität sind.
Ehrlichkeit bringt hier mehr, als sie kostet.)*

---

## Das Verpflichtende der Abgabe

- **Beschreibung, wie KI eingesetzt wurde.** In diesem Jahr ist sie bei jeder Abgabe verpflichtend. Es ist keine Formalität:
  gut geschrieben ist sie ein Beleg für Methode. Vorlage im Skill `entrega-nasa`.
- **Quellenangabe von SPHEREx**, wörtlich, in der Fußzeile des Tools und im README
  ([`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8).
- **Keine Minderjährigen auf Fotos oder in Stimmen** in der Demo, laut den Regeln des Events.
- **Links, die von außen funktionieren.** Die URL des Projekts von einem Handy mit mobilen Daten testen, nicht
  vom WLAN des Saals.
