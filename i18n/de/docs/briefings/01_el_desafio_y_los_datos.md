<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/docs/briefings/01_el_desafio_y_los_datos.md) · [Español](../../../es/docs/briefings/01_el_desafio_y_los_datos.md) · [中文](../../../zh/docs/briefings/01_el_desafio_y_los_datos.md) · **Deutsch** · [Italiano](../../../it/docs/briefings/01_el_desafio_y_los_datos.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/briefings/01_el_desafio_y_los_datos.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Audio 1 von 2 — SPHEREx: die Challenge und die Daten

Vorbereitungsmaterial für Juan Pablo auf dem Weg zur NASA Space Apps Challenge 2026, bei der sein Team
aus sechs Personen des Astronomielabors die Challenge **Planet X and SPHEREx** angehen wird.

Dies ist das erste von zwei Audios. Dieses behandelt, **was die Challenge verlangt und mit welchen Daten
gearbeitet wird**. Das zweite behandelt Strategie, Arbeitsmethode und Pitch.

Das soll von Anfang an klar sein, weil es am häufigsten missverstanden wird: **Das Liefergegenstand ist
kein Modell der künstlichen Intelligenz. Es ist ein Web-Tool.**

---

## 1. Was die Challenge genau verlangt

Die Aufgabenstellung sagt: ein öffentliches Web-Tool erstellen, das Himmelsbilder der SPHEREx-Mission
zeigt, sodass jeder leicht sehen kann, wie sie sich mit der Zeit verändern. Der Nutzer gibt
die Koordinaten eines Himmelsausschnitts ein —Rektaszension und Deklination— und das Tool zeigt eine
Serie von Bildern dieser Region, wie ein kleines Video, damit sich bewegende Objekte leicht erkennen lassen.

Angegebener Schwierigkeitsgrad: **Advanced**. Fachgebiete: Astrophysik, Planeten und Monde, Software.

Die Challenge nennt fünf Objekte zum Testen des Tools: Barnards Stern, Epsilon Indi B
—ein Paar Brauner Zwerge, die einen Stern umkreisen—, WISE 0855 —ein sich schnell bewegender Brauner Zwerg,
dessen Koordinaten die Aufgabenstellung ausdrücklich angibt— und zwei veränderliche Sterne, RW Aurigae und
R Draconis.

Diese fünf Objekte sind in der Praxis das Abnahmekriterium. Wenn sich das Tool mit allen fünf
gut verhält, ist es fertig.

**Es muss betont werden, was die Challenge nicht verlangt.** Sie verlangt keinen automatischen Detektor. Sie verlangt keinen
Klassifikator. Sie verlangt keine wissenschaftliche Pipeline. Wer detektiert, ist der menschliche Nutzer. Ein Modell zur
Videoklassifikation kann als optionale Schicht hinzukommen, aber wenn es den Viewer ersetzt, beantwortet das Projekt
schlicht die Aufgabenstellung nicht.

---

## 2. Warum ein Viewer und kein Algorithmus: die Logik der Challenge

Die Technik ist fast hundert Jahre alt. Clyde Tombaugh entdeckte 1930 Pluto mit einem Blinkkomparator:
zwei fotografische Platten derselben Himmelsregion, zu verschiedenen Zeitpunkten aufgenommen und
schnell abwechselnd gezeigt. Was ruhig ist, bewegt sich nicht; was sich verschiebt, springt ins Auge.

Ein Jahrhundert später ist die Technik dieselbe, nur der Träger hat sich geändert. Und sie ist weiterhin konkurrenzfähig.
Die Aufgabenstellung selbst sagt es: Die meisten bekannten Kometen und Braunen Zwerge wurden von
Freiwilligen beim Betrachten von Blinkbildern entdeckt, über Bürgerwissenschafts-Projekte wie
Backyard Worlds. Hunderttausende Menschen haben Objekte gefunden, die die automatischen
Algorithmen der Himmelsdurchmusterung übersehen hatten, typischerweise in Regionen hoher Sterndichte, in der Nähe
heller Quellen oder mit Artefakten, die einen Detektor verwirren, aber keinen Menschen.

Das ist die Begründung der Challenge, und man sollte sie in einem Satz sagen können: **Ein Viewer wird nicht verlangt,
weil er einfacher wäre als ein automatischer Detektor, sondern weil das menschliche Auge im Maßstab der Menge
Fälle löst, die der automatische Detektor nicht löst.**

---

## 3. Das ausdrückliche Vorbild: WiseView

Die Challenge nennt ein Werkzeug als Vorbild: **WiseView**, auf byw.tools. Es ist ein
Browser-Werkzeug, das kombinierte Bilder des WISE-Teleskops über eine Zeitbasis von
mehreren Jahren blinken lässt. Der Nutzer gibt nur Koordinaten ein und stellt drei Dinge ein: den Stretch des Bildes,
die Farbkarte und die Blinkgeschwindigkeit.

Es entstand als Notlösung zweier Freiwilliger von Backyard Worlds, die ihre eigenen Kandidaten besser klassifizieren wollten.
Heute hat es Hunderte von Entdeckungen von Kandidaten für Braune Zwerge ermöglicht, durch
Amateure und durch Profis.

Drei Lektionen, die man ohne Scham kopieren sollte:

Erstens, **ein Koordinatenfeld und sonst nichts** auf dem ersten Bildschirm. Zweitens, **die Steuerelemente
sind wichtig**: Stretch, Farbe und Geschwindigkeit machen aus einem Fleck eine Entdeckung, sie sind
keine Zierde; wenn sie aus Zeitmangel gestrichen werden, streicht man genau das, was das Tool nützlich macht. Und drittens, **WiseView hat eine API**, und das machte es zur Infrastruktur:
es gibt Pakete von Drittanbietern darauf, um Material zu erzeugen und auf Plattformen für
Bürgerwissenschaft hochzuladen.

Und am wichtigsten: **was WiseView nicht tut.** Es hat keine Spektralachse. WISE hat vier breite
Bänder. SPHEREx hat 102. Dort liegt die Lücke des Projekts.

---

## 4. Was SPHEREx ist

SPHEREx ist eine NASA-Mission, die seit Mai 2025 alle sechs Monate den gesamten Himmel im nahen
Infrarot kartiert, zwischen 0,75 und 5 Mikrometern, verteilt auf **102 Spektralkanäle**. Diese
spektrale Abdeckung macht sie besonders empfindlich für Objekte, die reich an Wasserstoff, Wasser, Kohlendioxid,
Kohlenmonoxid und anderen Molekülen sind. Sie wird Bilder von mehr als einer Milliarde
Objekten liefern: Braune Zwerge, Quasare, Kometen, Asteroiden, Sterne, Supernovae und Galaxien, die sich
oft überlappen oder ihre Helligkeit ändern.

Das Instrument hat sechs Detektoren, durch einen Dichroiten in drei Kurzwellige und drei
Langwellige aufgeteilt. Jedes Band deckt einen anderen Bereich ab: Band 1 reicht von 0,75 bis 1,09 Mikrometern, Band 2 von
1,10 bis 1,62, Band 3 von 1,63 bis 2,41, Band 4 von 2,42 bis 3,82, Band 5 von 3,83 bis 4,41 und Band 6 von 4,42 bis 5,00.
Die letzten beiden haben eine viel höhere spektrale Auflösung als die ersten.

---

## 5. Das technische Detail, das das Projekt entscheidet: der linear variable Filter

Das ist das Wichtigste des gesamten Audios. Wenn man sich nur eine einzige Sache merkt, dann diese.

SPHEREx hat **keine diskreten Filter**. Es hat einen linear variablen Filter: Die Wellenlänge ändert sich
kontinuierlich entlang einer Achse des Detektors. In den Worten der Archivdokumentation:
SPHEREx gewinnt Spektren durch mehrere Belichtungen, indem eine gegebene Quelle an verschiedenen
Positionen des Gesichtsfeldes platziert wird, wo sie bei verschiedenen Wellenlängen gemessen wird, durch Neuausrichtung des Raumfahrzeugs.

Anders gesagt: Das Spektrum einer Quelle entsteht, indem man sie viele Male beobachtet, jedes Mal an
einer anderen Stelle des Detektors, und daher **jedes Mal bei einer anderen Wellenlänge**.

Die Folge für diese Challenge ist enorm, und man sollte sie sich ab der ersten Stunde klarmachen. Wenn man
alle Bilder nimmt, die eine Himmelsposition abdecken, sie ausschneidet und nacheinander abspielt, **erhält man
kein sauberes Blinken. Man erhält eine stroboskopische Sequenz**, in der die Helligkeit jeder Quelle
springt, weil jedes Einzelbild bei einer anderen Wellenlänge liegt. Ein roter Stern erscheint in
manchen Einzelbildern hell und in anderen schwach, ohne sich bewegt oder verändert zu haben.

Das ruiniert genau das, was die Challenge zeigen will: was sich bewegt und was sich wirklich verändert.

Es gibt drei Auswege, nach Aufwand geordnet. Der erste: **vor dem Blinken nach Band oder nach Detektor
gruppieren**, sodass jedes Einzelbild des Videos dasselbe Band zu verschiedenen Epochen zeigt. Das
ist außerdem die wörtliche Lesart eines der Vorschläge der Aufgabenstellung, der sagt, es könne
sinnvoll sein, die von jedem der sechs Detektoren aufgenommenen Daten getrennt zu addieren. Der zweite:
nach Wellenlänge gruppieren, mithilfe der Extension, die die Datei mitbringt, mit der Zuordnung von Pixel zu
Wellenlänge. Korrekter und teurer. Und der dritte: jedes Einzelbild mit robusten Perzentilen zu normalisieren,
was ein visueller Behelf ist, keine physikalische Lösung, aber in 24 Stunden die Demo retten kann.

Und wenn es auch so nicht sauber wird, gibt es einen vierten Ausweg, nämlich es zu einer Funktion zu machen: die
Wellenlänge jedes Einzelbildes auf dem Bildschirm anzuzeigen und zu erklären, dass das Blinken spektrale Information ist,
kein Rauschen. Das ist wahr, und vor einer technischen Jury bringt es Punkte statt sie zu kosten.

**Das Erste, was man mit echten Daten tun muss, ist zu messen, wie stark sich die Wellenlänge zwischen zwei
Epochen desselben Feldes ändert.** Bevor irgendetwas an der Architektur entschieden wird.

---

## 6. Wo die Daten liegen

Das Archiv ist **IRSA**, das Infrared Science Archive von IPAC am Caltech. Es gibt vier Zugangswege,
und man sollte alle kennen.

**Durchsuchbare Verzeichnisse.** Die Produkte sind in Ordnern organisiert, die man mit
einem Browser durchgehen kann, nützlich, um die Organisation zu verstehen und für Massendownloads, aber nicht für die Suche
nach Koordinaten.

**Das SIA2-Protokoll**, der Standard der International Virtual Observatory Alliance für
einfachen Zugriff auf Bilder. Es ist der Hauptweg: Man fragt nach einer Himmelsposition und erhält die
Liste der Bilder, die sie abdecken, mit der Download-URL jedes einzelnen.

**Der Cutout-Dienst.** Das ist entscheidend: Jede spektrale Bilddatei wiegt etwa 70
Megabyte. Sie ganz herunterzuladen, um einen kleinen Ausschnitt zu zeigen, ist in einem Hackathon und in einem
öffentlichen Tool nicht machbar. Der Cutout-Dienst wird einfach aufgerufen, indem man an die URL der Datei
das Zentrum in Koordinaten und die Größe in Grad anhängt. Eine Warnung: **Cutouts funktionieren nur auf
den bei IPAC gehosteten Dateien**, nicht auf der Kopie bei Amazon.

Und **Python**: Die Bibliotheken pyvo und astroquery kapseln all dies, und das Archiv veröffentlicht
offizielle Beispiel-Notebooks. Außerdem gibt es ein Drittanbieter-Paket, spxquery, das bereits die Abfrage,
den Download mit Cutout, die Aperturphotometrie mit Abzug des Zodiakallichts und die Lichtkurven automatisiert.
Es lohnt sich, seine Architektur anzuschauen, bevor man etwas Eigenes schreibt, auch wenn man es nicht verwendet: Es hat bereits die
Probleme gelöst, auf die das Team stoßen wird.

---

## 7. Was in einer Datei steckt

Das Hauptprodukt ist ein Multi-Extension-FITS von 2040 mal 2040 Pixeln, mit sechs
Extensions. Man sollte sie kennen, weil mehrere direkte Chancen sind.

Die erste ist das kalibrierte **Bild**, in Einheiten der Oberflächenhelligkeit. Die zweite sind die
**Flags**, eine Bitmaske pro Pixel mit Status und Verarbeitung jedes Pixels: Diese Extension ist die
direkte Antwort auf einen der Vorschläge der Aufgabenstellung, der verlangt, Metadaten wie die
Kontaminationsindikatoren zu zeigen. Sie in der Oberfläche zu zeigen ist billig und genau das, was der Autor
der Challenge verlangt hat. Die dritte ist die **Varianz**. Die vierte ist das Modell des **Zodiakallichts**, und hier
gibt es ein Detail, das Gold wert ist: **Das Zodiakallicht ist nicht vom Bild abgezogen**. Es abzuziehen ist eine
Codezeile und verbessert den Kontrast schwacher Quellen enorm. Die fünfte Extension ist die
Punktspreizfunktion, und die sechste ist die Tabelle, die Pixel auf Wellenlänge abbildet.

Zwei bekannte Fallstricke. Erstens: Die Wellenlängentabelle nutzt einen seltenen Teil des FITS-Standards,
den laut Archiv selbst noch nicht alle Leser implementieren; wenn der Leser sie nicht erkennt,
muss man zwischen den nächstgelegenen Stützpunkten interpolieren, mit einer Genauigkeit von etwa einem
Nanometer, ausreichend zum Visualisieren, aber nicht für Wissenschaft. Und zweitens: Die FITS-Header nummerieren die
Pixel ab eins, während Astropy sie ab null nummeriert. Das ist die klassische Ursache für
Ein-Pixel-Verschiebungen.

Ein weiteres Detail, das im Code toleriert werden muss: **nicht alle Beobachtungen bringen alle sechs
Bänder mit**. Die Qualität wird Band für Band bewertet, und einige gelangen nicht ins Archiv.

---

## 8. Was gerade passiert ist und sonst niemand weiß: Data Release 1

Das ist wichtig und es ist frische Information. Die Chronologie der Veröffentlichungen ist: Juli 2025, erster
Quick Release; Oktober 2025, der zweite; September 2026, der dritte; und **November 2026
—dieser Monat— der Data Release 1**.

Sehr wahrscheinlich nutzt ihn kein anderes Team des Hackathons, und fast sicher verweisen die Tutorials
und Beispiele, die im Internet kursieren, noch auf die Version von vor einem Jahr, die nicht einmal
mehr über das Abfrageprotokoll durchsuchbar ist.

Und der Data Release 1 bringt etwas, das die Architektur des Projekts verändert: **einen Cube des gesamten Himmels,
mit einem Mosaik für jeden der 102 Kanäle, veröffentlicht im HiPS-Format**.

HiPS ist das hierarchische Kachelformat des Astronomischen Datenzentrums Straßburg, und es ist
genau das Format, das **Aladin Lite direkt im Browser konsumiert**. Aladin Lite ist
außerdem das Werkzeug, das die Aufgabenstellung selbst zur Darstellung astronomischer Daten vorschlägt.

Was das praktisch bedeutet: **Es gibt einen Weg, die 102 Bänder des gesamten Himmels zu zeigen,
ohne eine Zeile Backend zu schreiben.** Das ist der schnelle Weg des Projekts und seine Absicherung: Wenn das Backend
sich verspätet oder ausfällt, funktioniert dieser Teil weiter und es gibt etwas zu zeigen.

Man sollte die beiden Produkte nicht verwechseln, denn sie beantworten unterschiedliche Fragen. **Die Bilder von
Level 2 liefern die Zeitachse**: viele Epochen, native Auflösung, und daraus entsteht das Blinken. **Der Cube des gesamten Himmels liefert die Wellenlängenachse**: 102 Kanäle, grobe Auflösung, und daraus
kommt der Kontext und die 102 Bänder als Bild (PNG ohne Flüsse: das Spektrum kommt aus den Level-2-Dateien). Der Viewer, den die Challenge verlangt, braucht beides.

---

## 9. Werkzeuge, die das Archiv schon hat

Bevor man etwas baut, sollte man schauen, ob IRSA es schon getan hat. Es hat einen Data Explorer mit
grafischer Oberfläche, ein Cutout-Werkzeug, eines für Mosaike, eines für Spektrophotometrie durch
Forced Photometry —das ist die Antwort des Archivs auf den Vorschlag, Spektren on the fly zu erzeugen—,
eines zur Quellenentdeckung und ein besonders interessantes: **MOST**, das Werkzeug zur
Suche nach sich bewegenden Objekten, das bei gegebener Bahn eines Objekts des Sonnensystems die SPHEREx-Bilder
findet, die seine vorhergesagte Position in jeder Epoche abgedeckt haben. Damit ist ein Reiter
"verfolge diesen Asteroiden" fast geschenkt.

Und es gibt ein Detail mit Haken für eine Demo: Das Archiv hat eine **Sammlung, die dem interstellaren
Kometen 3I/ATLAS gewidmet ist**. Ein sich schnell bewegendes, aktuelles Objekt, das die Öffentlichkeit kennt. Für
zwei Minuten Demonstration ist er mehr wert als jeder Braune Zwerg.

---

## 10. Die anderen Daten: die Overlays

Die Aufgabenstellung schlägt vor, Daten anderer Teleskope zu überlagern, und nennt Gaia und WISE.

Es lohnt sich zu verstehen, dass **Gaia nicht nur visuelle Dekoration ist: Es ist die Qualitätskontrolle des Viewers.**
Gaia liefert Positionen, Eigenbewegungen und Parallaxen mit außerordentlicher Präzision. Wenn man
auf das Bild die Position zeichnet, die Gaia für einen Stern zum Datum dieser konkreten Epoche vorhersagt, und
die Markierung genau auf den hellen Punkt fällt, ist bewiesen, dass Koordinatensystem, Daten und
Ausschnitt alle stimmen.

Es ist der billigste Weg, einer Jury zu beweisen, dass das Tool korrekt ist und nicht nur schön. Und er beantwortet,
bevor sie gestellt wird, die offensichtliche Frage: Woher weiß ich, dass dieses Bild von der Koordinate stammt, die ich angefragt habe?

Ein Detail, auf das man achten muss: Gaia Data Release 3 hat die Referenzepoche 2016, nicht 2000. Sie zu verwechseln
führt einen Fehler von sechzehn Jahren Eigenbewegung ein.

---

## 11. Die fünf Testobjekte und was jedes zeigt

**WISE 0855** ist ein Pflichtfall, eines der Testobjekte der Organisation, und wird
immer gezeigt: extrem hohe Eigenbewegung, eines der kältesten bekannten Objekte außerhalb des Sonnensystems und
sehr nah. Es sollte in den langen Bändern leuchten und in den kurzen fast fehlen. Ehrlich gesagt: In
einer einzelnen Belichtung wirkt es schwach; seine Bewegung sieht man mit der Differenz des ersten und des letzten Bildes und,
sobald vorhanden, mit der Summe pro Durchgang (ausstehend, von D2) und mit dem Overlay von CatWISE2020 (fertig im Branch `v/v2-catwise` von V2, PR ausstehend; er ist nicht in Gaia). Bei eps Ind B ist die Bewegung deutlicher zu sehen.

**Barnards Stern** hat die größte bekannte Eigenbewegung aller Sterne. Er ist der
Kontrollfall: Wenn man bei Barnard keine Bewegung sieht, liegt das Problem im Viewer, nicht im Objekt.

**Epsilon Indi B** ist ein Paar Brauner Zwerge. Es ist das beste Feld, um den Bandwähler zu demonstrieren,
weil es ein rotes, kaltes Objekt ist. Vorsicht vor einem Fallstrick: Das Paar ist etwa 400
Bogensekunden vom Stern Epsilon Indi A getrennt, der sehr hell ist und das Feld kontaminieren kann.

**RW Aurigae** und **R Draconis** sind Veränderliche: Sie ändern die Helligkeit, ohne sich zu bewegen. Sie sind der entgegengesetzte
Kontrollfall.

Und hier liegt das stärkste Argument für den Pitch: **das Paar "bewegt sich" gegen "ändert nur die
Helligkeit"** zeigt, dass das Tool beides unterscheidet. In der Demonstration sollte man
je eines zeigen.

Die fünf Koordinaten wurden am 14. November in SIMBAD verifiziert, und daraus ergaben sich zwei
Fallstricke, die man vor der Ankunft kennen sollte.

Der erste: **Die Koordinate, die die Aufgabenstellung für WISE 0855 angibt, stammt aus der WISE-Epoche, um
2010, nicht aus der heutigen.** Dieses Objekt bewegt sich acht Bogensekunden pro Jahr, sodass es Ende 2026
etwa hundertdreißig Bogensekunden von dem Ort entfernt ist, den die Aufgabenstellung nennt. Wenn man den Viewer dort
mit einem kleinen Feld zentriert, liegt das Objekt außerhalb, und es sieht aus, als würde das Tool nicht funktionieren.

Der zweite: **Epsilon Indi B mit großem B ist das Paar Brauner Zwerge, was die Challenge verlangt; mit kleinem b ist es ein Planet**,
der vierhundert Bogensekunden entfernt ist, an der Position des Sterns. Es gibt Namensauflöser, die Groß- und Kleinschreibung nicht unterscheiden
und den Planeten zurückgeben.

Und eine Erwartung, die man von Anfang an kalibriert haben sollte: Bei einer Pixelskala von etwa
sechs Bogensekunden **bewegen sich selbst die schnellsten Objekte des Himmels weniger als ein Pixel zwischen
zwei aufeinanderfolgenden Durchgängen von SPHEREx**, die sechs Monate auseinanderliegen. Erst mit der gesamten
Zeitbasis der Mission erreicht man ein bis zweieinhalb Pixel. Das bedeutet, die erste Epoche
mit der letzten zu vergleichen, nicht die aufeinanderfolgenden; es gibt der Bilddifferenz großen Wert, wo ein Pixel
Verschiebung sehr deutlich zu sehen ist; und es zwingt dazu, im Pitch nicht zu versprechen, dass das Objekt ins Auge springt,
ohne es vorher gesehen zu haben.

Eine falsche Koordinate schlägt jedenfalls nicht fehl: Sie liefert vollkommen gültige Bilder eines
falschen Himmelsausschnitts. Das ist der stillste und teuerste Fehler, den man hier machen kann.

---

## 12. Was man bei der Ankunft im Kopf haben muss

Fünf Dinge.

Eins: Das Liefergegenstand ist ein Viewer, damit Personen detektieren, kein automatischer Detektor.

Zwei: Der linear variable Filter führt dazu, dass verschiedene Epochen bei verschiedenen Wellenlängen liegen, und
das muss man in der ersten Stunde mit echten Daten messen.

Drei: Data Release 1 erschien diesen Monat und bringt einen Cube des gesamten Himmels im HiPS-Format, den Aladin Lite
ohne Backend anzeigen kann (das HiPS in PNG von IRSA, das ein Mosaik ohne Zeit und ohne Flüsse ist). Das ist der schnelle und der sichere Weg des Projekts.

Vier: Die Cutouts des Archivs machen alles machbar; man muss sie früh zeitlich messen,
denn wenn sie langsam sind, ändert sich der Plan.

Und fünf: Die 102 Bänder sind der eigene Blickwinkel. WiseView macht das Blinken schon mit WISE. Was bisher niemand
für die breite Öffentlichkeit gemacht hat, ist das Blinken **plus** die Spektralachse: dass der Nutzer nicht
nur sieht, dass sich etwas bewegt, sondern woraus es besteht.
