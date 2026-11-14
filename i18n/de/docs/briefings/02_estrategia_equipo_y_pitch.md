<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/docs/briefings/02_estrategia_equipo_y_pitch.md) · [Español](../../../es/docs/briefings/02_estrategia_equipo_y_pitch.md) · [中文](../../../zh/docs/briefings/02_estrategia_equipo_y_pitch.md) · **Deutsch** · [Italiano](../../../it/docs/briefings/02_estrategia_equipo_y_pitch.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/briefings/02_estrategia_equipo_y_pitch.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Audio 2 von 2 — SPHEREx: Strategie, Team und Pitch

Vorbereitungsmaterial für Juan Pablo auf dem Weg zum NASA Space Apps Challenge 2026, wo sein Team
von sechs Personen aus dem Astronomielabor die Challenge **Planet X and SPHEREx** angehen wird.

Dies ist das zweite von zwei Audios. Das erste behandelt, was die Challenge verlangt und mit welchen Daten gearbeitet wird.
Dieses behandelt **wie ihr euch organisiert, was ihr zuerst baut, was die Jury belohnt und wie ihr es präsentiert**.

Der Grundgedanke: Bei einem Hackathon gewinnt fast nie das Projekt mit dem meisten Code. Es gewinnt
das, das vollständig ankommt.

---

## 1. Die versteckte Rubrik: die acht Vorschläge der Aufgabenstellung

Die Challenge enthält einen Abschnitt mit „möglichen Überlegungen“ in acht Stichpunkten, die man
„berücksichtigen kann, aber nicht muss“. In der Praxis **sind sie die Rubrik**: Sie zeigen, was der Autor
der Challenge von einem guten Projekt erwartet und was ein NASA-Juror erkennen wird.

Die acht sind: Das Tool soll leicht zu aktualisieren sein, wenn neue Daten eintreffen; die 102
Infrarot-Bänder sollen kreativ dargestellt werden, mit ausdrücklichem Bonus, wenn Spektren on the fly erzeugt werden;
Bilder aus verschiedenen Epochen sollen addiert oder subtrahiert werden können; der Nutzer soll das Sichtfeld
wählen können; Daten anderer Teleskope wie Gaia oder WISE sollen sich überlagern lassen; **das Tool
soll sich mit den Koordinaten in der URL abfragen lassen**, damit es in andere Seiten eingebettet werden kann;
Metadaten wie die Kontaminationsindikatoren sollen angezeigt werden; und bereits vorhandene öffentliche Tools sollen genutzt werden,
wobei Astropy und Aladin ausdrücklich genannt werden.

Das Interessante: **Sieben der acht sind mit geringem oder sehr geringem Aufwand machbar.** Der einzige wirklich teure Punkt ist der der
102 Bänder, und genau der ist das Unterscheidungsmerkmal. Ihr müsst also alle erfüllen, und es gibt eine Reihenfolge
dafür.

---

## 2. Die Architektur: zwei Wege, und ihr braucht beide

Das Projekt hat einen schnellen und einen vollständigen Weg, und entscheidend ist, dass **der schnelle wirklich existiert**.

**Weg A** ist Aladin Lite, das direkt den Allsky-Cube des Data Release 1 lädt, der
im HiPS-Format veröffentlicht wird. Der Nutzer navigiert über den Himmel und bewegt einen Wellenlängen-Regler.
Null Backend. Er liefert die 102 Bänder, den Kontext des gesamten Himmels und die Katalog-Overlays. Was er nicht
liefert, ist die Zeitachse, weil der Cube ein kombiniertes Mosaik ist und keine Serie von Epochen. Aufwand:
Stunden, nicht Tage. Technisches Risiko gering.

**Weg B** ist das zeitliche Blinken, mit Backend. Der Server fragt das Archiv nach Position ab,
fordert Ausschnitte jeder Epoche an, gruppiert sie nach Band, normalisiert sie und liefert eine zeitlich
geordnete Sequenz zurück. Das ist die Challenge im eigentlichen Sinn und der Großteil der Arbeit. Der Engpass ist die
Latenz der Ausschnitte: Ohne Cache überlebt die Demo nicht.

**Beide Wege werden auf demselben Bildschirm montiert**, nebeneinander: Aladin liefert Kontext und Wellenlänge,
ein Panel daneben das zeitliche Blinken. Der Nutzer versteht sofort, dass es zwei Achsen
derselben Daten sind.

Und Weg A ist die Versicherung des Projekts: Wenn das Backend nicht rechtzeitig fertig wird, gibt es trotzdem etwas Echtes
zu zeigen.

Der beschlossene Stack: Python mit FastAPI im Backend, weil die Bibliotheken, die diese
Daten lesen können, nur in Python existieren; React mit Vite und Aladin Lite im Frontend; Cache auf Platte; und
Deployment des Frontends auf Vercel, das Backend steht noch offen (Vercel Functions oder ein Container, je nach gemessener Zeit eines Ausschnitts).

Eine Designentscheidung, die viel Arbeit spart: **Das Backend liefert bereits gerenderte PNG-Bilder,
keine FITS-Dateien.** FITS an den Browser zu schicken zwingt dazu, einen FITS-Reader in JavaScript zu schreiben und
Stretch und Farbkarte von Hand anzuwenden: doppelt so viel Arbeit und dreimal so viele Fehler. Der
Preis ist, dass eine Änderung des Stretchs eine Rückfrage an den Server erfordert, und mit Cache ist das billig.

Und ein Detail, das klein wirkt und es nicht ist: **Alle Einzelbilder einer Sequenz werden mit
denselben Grenzen normalisiert.** Wenn jedes für sich gestreckt wird, flackert alles, und man kann echte
Bewegung nicht von einer Skalenänderung unterscheiden.

---

## 3. Das Erste, was festgelegt werden muss: der API-Vertrag

Das ist es, was sechs Personen ab der ersten Stunde parallel vorankommen lässt.

In Stunde eins wird der Vertrag geschrieben: welche Endpoints es gibt, welche Parameter sie nehmen und was sie
genau zurückgeben. Solange das Backend nicht existiert, arbeitet das Frontend gegen einen Simulator, der genau
diese Formen zurückgibt. Niemand wartet auf jemanden.

Und die Regel, die das trägt: **Wer den Vertrag ändert, ändert ihn zuerst im Dokument**,
sagt dem Team Bescheid und fasst erst danach den Code an. Eine stille Vertragsänderung blockiert eine andere
Person, ohne dass sie es merkt, und das kostet um drei Uhr morgens Stunden.

Zwei Felder des Vertrags sind erwähnenswert. Erstens: Jedes Einzelbild liefert **seine Wellenlänge**
zurück, und das ist nicht optional: Es verhindert das Problem des linear variablen Filters und beweist, auf dem
Bildschirm gezeigt, der Jury, dass das Team das Instrument versteht. Und zweitens: Warnungen
werden als Liste übertragen, nicht als Fehler. Es fehlen ständig Bänder; wenn das die Anfrage zum Scheitern bringt, funktioniert das
Tool nicht.

---

## 4. Sechs Personen, ihre Agenten und das reale Risiko

Das Hauptrisiko eines Sechserteams mit KI-Assistenten ist nicht, dass die Ideen ausgehen. Es ist,
**sich gegenseitig in die Quere zu kommen**. Mehrere Agenten, die schnell im selben Repository schreiben, erzeugen Konflikte,
doppelten Code und einen kaputten Hauptbranch mitten in der Nacht.

Die vorgeschlagene Aufteilung sind vier Rollen, jede besitzt bestimmte Dateien. „Besitzen“ heißt, dass diese
Person entscheidet und die anderen anfragen; es heißt nicht, dass sie allein arbeitet.

**Daten**: fragt das Archiv ab, lädt Ausschnitte, liest die FITS, gruppiert nach Band, löst die
Koordinaten und die Wellenlängen auf. Das ist der kritische Pfad: Wenn das nicht funktioniert, gibt es kein Projekt.

**Viewer**: Aladin Lite, das Blink-Panel, die Steuerelemente, die abfragbare URL.

**Wissenschaft und Verifikation**: prüft, ob das Angezeigte korrekt ist. Dass der Ausschnitt vom Himmel
stammt, den er angibt, dass das Objekt dort ist, wo Gaia es vorhersagt, dass das Spektrum kein Artefakt ist. **Das ist die Person, die
ausdrücklich die Erlaubnis hat, „das ist falsch“ zu sagen, ohne die Korrektur vorschlagen zu müssen.**

**Narrativ und Abgabe**: das README, die Demo, der Pitch und das Formular. Und sie beginnt ab
Stunde null zu arbeiten, nicht erst am Ende. Der klassische Hackathon-Fehler ist, die Abgabe auf die letzten zwei
Stunden zu verschieben und festzustellen, dass die Hälfte des Formulars fehlt.

Ab Stunde zwölf, wenn der kritische Pfad frei ist, teilen sich Daten und Viewer die zusätzlichen
Stichpunkte. Aber Wissenschaft und Narrativ lösen sich nicht auf: Wenn niemand verifiziert und niemand die
Abgabe vorbereitet, wird das Projekt zu spät und mit Fehlern abgegeben.

Zum Code: kurze Branches, die weniger als drei Stunden leben, niemand pusht auf den Hauptbranch, und
jede Änderung prüft eine Person — kein Agent —, denn einen Diff anzusehen dauert zwei Minuten und erspart
Stunden. Und Worktrees: ein Ordner pro Person, denn zwei Agenten im selben Ordner
überschreiben sich ohne Vorwarnung, und keiner der beiden wird es sagen.

---

## 5. Wie man einen Agenten nutzt, ohne dass der Agent dich besiegt

Das unterscheidet ein Team, das Agenten nutzt, von einem, dem die Agenten über den Kopf wachsen. Es sind fünf
Gewohnheiten.

**Eine Sitzung pro Front.** Das Daten-Backend nicht mit dem Frontend in derselben Sitzung mischen: Der
Kontext wird verunreinigt, und der Assistent fängt an, dumme Fehler zu machen.

**Der Agent schlägt vor, die Person entscheidet.** Für alles, was mehr als zwei Dateien berührt: erst Plan,
dann Freigabe. Bei einem Hackathon ist die Versuchung riesig, ihn einfach laufen zu lassen, und es ist der schnellste
Weg, um fünf Uhr morgens bei zweitausend Zeilen zu landen, die niemand versteht.

**Das Artefakt prüfen, nicht den Bericht.** Dass der Agent „funktioniert jetzt“ sagt, ist ein Datenpunkt, keine Tatsache.
Man muss die URL öffnen, das Bild ansehen, die Epochen zählen. Das ist kein Misstrauen: Der Agent
kann den Bildschirm nicht sehen.

**Wenn etwas beim dritten Mal nicht klappt, den Ansatz wechseln, nicht den Prompt.** Wenn du drei Versuche lang
dasselbe korrigierst, liegt das Problem nicht darin, wie du es verlangt hast.

Und **niemals einen Agenten allein den Umfang entscheiden lassen.** Ein Agent baut, wenn man ihn lässt, alle acht
Stichpunkte der Challenge halb fertig, statt drei vollständig.

---

## 6. Der Plan in Blöcken und wo die Einschnitte liegen

Der Rhythmus sind Blöcke von neunzig Minuten, und am Ende jedes Blocks fünf Minuten im Stehen, ohne
Bildschirme, in denen jeder drei Dinge sagt: was funktionierend übrig blieb — nicht, was er getan hat, sondern was man
öffnen und ansehen kann —, was blockiert ist und durch wen, und was er in den nächsten neunzig Minuten tun wird.

Neunzig Minuten reichen, um etwas fertigzustellen, und sind kurz genug, damit ein falscher Weg nicht
eine halbe Nacht kostet.

**Stunde null dient dem Abstimmen.** Die Aufgabenstellung gemeinsam laut lesen, Rollen verteilen, die genaue Uhrzeit des
Abgabeschlusses bestätigen und das Grundgerüst auf allen sechs Rechnern hochziehen. Wenn das Grundgerüst
nicht läuft, kommt niemand weiter, bis es läuft.

**Die Stunden eins bis drei sind die Stunde der Wahrheit mit den Daten.** Echte Abfragen, wie viele Epochen
es pro Feld gibt, wie lange ein Ausschnitt gestoppt dauert, und die wichtigste Frage des Tages: wie stark
sich die Wellenlänge zwischen zwei Epochen desselben Feldes ändert. Wenn die Ausschnitte wegen
Langsamkeit nicht praktikabel sind, **ändert sich der Plan dort, nicht in Stunde fünfzehn**.

**Bis Stunde acht der kritische Pfad**, und der Meilenstein ist ganz konkret: *Eine von Hand eingetippte Koordinate
erzeugt ein kleines Video auf dem Bildschirm*. Hässlich, langsam, nur ein Band, egal. Wenn es in Stunde acht kein
kleines Video gibt, wird alles andere ausgesetzt, und alle sechs arbeiten daran.

**Von acht bis vierzehn: gut machen**, in der Reihenfolge des Werts: Bandauswahl, dann die
Steuerelemente, dann die Bildsubtraktion, dann Namensauflösung, dann die teilbare URL, dann das
Gaia-Overlay, dann die Flags, und nur wenn alles Vorherige abgeschlossen ist, die Spektren on the fly.

Und dann kommen **die drei Pflichthalte**, das Einzige, worüber nicht verhandelt wird.

Sechs Stunden vor Schluss: **Scope-Freeze**. Es wird nichts Neues begonnen. Was nicht
begonnen ist, wird nicht begonnen, und was begonnen ist, wird fertiggestellt oder entfernt, denn **eine halbfertige
Funktion zieht ab**: Die Jury klickt genau dort.

Vier Stunden vor Schluss: **die aufgezeichnete Demo**, auch wenn die Anwendung weiter verbessert wird. Wenn sie sich danach verbessert, wird
neu aufgenommen. Wenn die Zeit nicht reicht, gibt es schon ein Video.

Zwei Stunden vor Schluss: **abgegeben**. Formular vollständig, Links gesetzt, KI-Nutzungserklärung geschrieben.
Danach darf weiter bearbeitet werden, aber es ist bereits abgegeben.

---

## 7. Was schiefgehen kann

Zehn identifizierte Risiken; es lohnt sich, die ersten vier im Kopf zu haben.

**Dass die Ausschnitte aus dem Archiv zu langsam sind.** Das ist die Annahme, auf der alles ruht.
Sie wird in Stunde drei entschieden. Wenn sie zu langsam sind, ist Plan B aggressives Caching, Vorwärmen und die
Einzelbilder anzuzeigen, sobald sie ankommen; und Plan C ist, auf einem kuratierten Satz von etwa zehn
vorberechneten Feldern zu laufen und das offen zu sagen: Heute bedienen wir diese Felder, die Architektur skaliert.

**Dass die Epochen wegen des linear variablen Filters nicht vergleichbar sind.** Das ist das subtilste Risiko und das,
das am wahrscheinlichsten das Ergebnis ruiniert, ohne dass jemand versteht, warum. Das Alarmsignal ist
offensichtlich, wenn es auftritt: Das erste Blinken sieht aus wie ein Stroboskoplicht.

**Dass das WLAN ausfällt.** Hohe Wahrscheinlichkeit: Es passiert bei fast jedem Hackathon. Plan B ist
Pflicht, nicht optional: ein Degraded-Modus, der die fünf Felder aus dem Cache bedient, ohne das Netz zu berühren,
und das Demo-Video auf der Festplatte des präsentierenden Rechners heruntergeladen, nicht in der Cloud.

**Dass das Projekt zu spät oder unvollständig abgegeben wird.** Das ist die Ursache Nummer eins dafür, dass ein gutes Projekt
nichts gewinnt, und es gibt keinen Plan B. Deshalb gibt es die drei Pflichthalte.

Und noch eines, das man vorher aufschreiben sollte, um es nicht um vier Uhr morgens wieder aufzumachen: **Es wird
kein Modell trainiert.** Es gibt keine Zeit, keine Labels, und es ist nicht nötig.

---

## 8. Warum keine Videomodelle, und was man antwortet, wenn jemand fragt

Das sollte klar sein, denn jemand wird danach fragen, innerhalb oder außerhalb des Teams.

Die Architekturen zum Videoverstehen — TimeSformer, ViViT, VideoMAE, X-CLIP — sind Modelle, um
natürliches Video zu verstehen. Sie sind mit Personen, Objekten und Handlungen vortrainiert. Die Statistik einer
astronomischen Sequenz — fast leerer Hintergrund, Punktquellen, Artefakte, eine Verschiebung um wenige
Pixel — ähnelt dem überhaupt nicht, sodass das Vortraining, das ihren ganzen Wert ausmacht, nicht gut
übertragen wird. Außerdem gibt es keine Labels, und der Fall ist mit klassischen Methoden, die die
Physik des Problems ausnutzen, bereits gut gelöst: eine lineare Bahn über einem statischen Hintergrund.

Der Stand der Technik der automatischen Erkennung ist hier **Shift-and-Stack**: jedes Bild gemäß
einer Kandidatengeschwindigkeit verschieben und stapeln, sodass sich ein bewegtes Objekt kohärent aufsummiert und das
Rauschen nicht. Die Referenzimplementierung, KBMOD, läuft auf GPU und durchsucht in der Größenordnung von zehn Milliarden
Kandidatenbahnen pro Minute; damit identifizierte der DEEP-Survey 105 neue
Transneptun-Objekte. Das ist teuer und für 24 Stunden außer Reichweite. Es als künftige Arbeit zu erwähnen,
ist ehrlicher, als es zu versuchen.

**Und hier liegt der eigene Vorteil des Teams.** Das Labor von Francisco Förster hat ALeRCE gebaut,
den chilenischen Broker, der den Alertstrom von ZTF verarbeitet und sich auf LSST vorbereitet. Sein
Stamp-Klassifikator ist ein Convolutional Network, das auf den Science-, Referenz- und
Differenz-Ausschnitten der ersten Detektion arbeitet und darauf ausgelegt ist, die Rotationsinvarianz auszunutzen. Das — ein
kleines Netz auf Ausschnitten, mit von Hand gewählten Invarianzen — **ist das richtige KI-Modell
für dieses Problem**, kein Video-Transformer.

Aber der unterscheidende Beitrag ist nicht einmal, diesen Klassifikator in den Viewer einzubauen. Es ist die **Disziplin
der Echtzeit-Klassifikation**: Schwellenwerte, False Positives, wie man einer Person einen zweifelhaften
Kandidaten präsentiert, wie man das Label erfasst, das diese Person vergibt. Diese Disziplin, auf die
Oberfläche angewandt, hat kein anderes Team des Hackathons.

Die Antwort an die Jury, falls sie fragt, warum kein maschinelles Lernen verwendet wurde, lautet also: *Wir haben es
geprüft; der Engpass dieser Challenge ist nicht, Bewegung in einem Video zu erkennen, sondern die richtigen Daten zu holen
und auszurichten und sie einer Person vorzulegen; wo KI hier beiträgt, ist beim
Sichten von Kandidaten mit kleinen Netzen auf Ausschnitten, so wie es der Broker ALeRCE macht, und das haben wir
als Ausblick angelegt*. Diese Antwort ist stärker, als ein Modell eingebaut zu haben, das nichts beiträgt.

---

## 9. Die Jury: wie bewertet wird und worauf man zielt

Der Trichter ist: Die Jury des lokalen Events wählt globale Nominierte; danach wählen Experten der NASA und der
Partneragenturen Finalisten; und ein Exekutivkomitee wählt zehn globale Gewinner.

Das heißt: **Der erste Filter ist eine lokale Jury**, mit wenig Zeit pro Team und ohne den Code zu lesen.
Danach Leute, die etwas von Astronomie verstehen. Das Projekt muss in beiden Registern funktionieren:
in zwei Minuten beeindrucken und einem Expertenblick standhalten.

Von den zehn globalen Preisen gibt es zwei naheliegende für dieses Projekt: **beste Nutzung von Daten**, was
buchstäblich bedeutet, Weltraumdaten zugänglich zu machen, und **beste Nutzung von Wissenschaft**. Einen dritten gibt es geschenkt,
wenn man dafür arbeitet: **beste Nutzung von Storytelling**, denn die Geschichte von Pluto und der Blink-Komparator
liegt bereit, um sie zu nehmen. Auf zwei oder drei zielen, nicht auf zehn.

---

## 10. Der Zwei-Minuten-Pitch

Beim Event in Santiago ist das angekündigte Format zwei Minuten plus zwei Fragen. Zwei Minuten sind
viel weniger, als es scheint, und man muss es laut und mit Stoppuhr proben, dreimal.

Die Struktur, und über die Reihenfolge wird nicht verhandelt, denn **die Demo kommt vor der Erklärung**: Wenn sie
dich abbrechen, haben sie zumindest das Tool gesehen.

**Zwanzig Sekunden Aufhänger.** 1930 entdeckte Clyde Tombaugh Pluto, indem er zwei Fotos desselben
Himmelsausschnitts ansah und bemerkte, dass sich ein Punkt bewegt hatte. Heute fotografiert SPHEREx den gesamten Himmel alle
sechs Monate in 102 Infrarotfarben, und niemand schaut ihn sich so an.

**Fünfzig Sekunden Live-Demonstration**, die Hälfte der Zeit, und das ist es, was bewertet wird.
„WISE 0855“ eintippen — den Namen, nicht die Koordinaten, um zu zeigen, dass es für jeden gedacht ist —. Auf
Play drücken und die Subtraktion des ersten und des letzten Bildes zeigen: Der Braune Zwerg bewegt sich — ein rotes und blaues Paar, subtil, und
man sagt ehrlich, dass er in einer einzelnen Belichtung schwach zu sehen ist —. Auch eps Ind B zeigen, wo die Bewegung
deutlicher zu sehen ist. Den Bandwähler bewegen: dieselbe Region in einer anderen Wellenlänge.
Das Gaia-Overlay einschalten (WISE 0855 ist nicht in Gaia: dort ist das Overlay CatWISE2020; bei Barnard oder eps Ind B): Die Marker fallen auf die Quellen, *so wissen wir, dass es korrekt ist*.
Die URL kopieren: Das ist teilbar und einbettbar.

**Fünfundzwanzig Sekunden dazu, warum es wichtig ist.** Die meisten der bekannten Braunen Zwerge und Kometen
wurden von Freiwilligen gefunden, die Blinks angesehen haben. Diese Community existiert und hat heute keine Möglichkeit,
SPHEREx anzusehen. Der meistzitierte Planet-Nine-Kandidat entstand aus dem Vergleich zweier zeitlich
getrennter Infrarot-Surveys: dieselbe Technik.

**Und fünfundzwanzig Sekunden dazu, was wir gebaut haben und was als Nächstes kommt.**

Drei Regeln für den Pitch. Niemals live gegen eine kalte Abfrage demonstrieren: Die fünf Felder sind
vorgewärmt. Man sagt nicht „könnte“: Man zeigt, was da ist. Und **man verspricht nicht, etwas gefunden zu haben**:
Eine Jury mit Astronomen bestraft das sofort.

Zu Planet Nine der ehrliche Rahmen: Stand November 2026 **wurde er nicht gefunden**. Der meistzitierte Kandidat
ist der, der aus dem Abgleich der Infrarot-Surveys IRAS und AKARI hervorging, die dreiundzwanzig Jahre auseinanderliegen, und
die Autoren selbst betonen, dass sie nichts Definitives entdeckt haben. Aber der Satz, der wahr und
überprüfbar ist und ein besserer Aufhänger als jedes Versprechen, lautet: **Die Technik, die diesen
Kandidaten fand, ist genau die der Challenge, und SPHEREx macht sie alle sechs Monate, in 102 Bändern, und niemand
hat es mit bloßem Auge geprüft.**

---

## 11. Die unbequemen Fragen

Vier, mit ihrer Antwort.

**Macht das nicht schon der Datenexplorer von IRSA?** Nicht für dieses Publikum. Der Explorer ist ein
Archiv für Astronomen: Man muss wissen, welche Collection man anfragt, was ein Multi-Extension-FITS ist und wie ein Bild
gestreckt wird. Wir lösen den Namen auf, gruppieren die Epochen, normalisieren und liefern das
Blinken. Das ist der Unterschied zwischen einem Archiv und einem Viewer, und es ist derselbe Unterschied, der
WiseView gegenüber dem WISE-Archiv nützlich gemacht hat.

**Woher weiß ich, dass das Bild von dieser Koordinate stammt?** Durch das Gaia-Overlay. Und es wird auf dem Bildschirm gezeigt.

**Was passiert, wenn ich eine Koordinate ohne Daten eingebe?** Und man tippt eine ein und zeigt den Leerzustand, der
sagt, wie viele Epochen es gibt, und ein nahegelegenes Feld vorschlägt. Das muss gelöst sein: Die Jury wird
zufällige Koordinaten eintippen, und ein leerer Bildschirm ist ein schwerer Fehler.

**Wie korrekt sind die Spektren?** Sie sind indikativ, Aperturphotometrie mit abgezogenem
Zodiakallicht, und das sagen wir in der Oberfläche selbst. Für Wissenschaft gibt es das Spektrophotometrie-Tool
von IRSA. Sie niemals als wissenschaftliche Qualität präsentieren: Die Ehrlichkeit bringt hier
viel mehr, als sie kostet.

---

## 12. Das Obligatorische der Abgabe

Drei Dinge, die keine Formalität sind.

**Die Beschreibung, wie künstliche Intelligenz eingesetzt wurde, ist dieses Jahr verpflichtend** bei jeder
Abgabe. Gut geschrieben ist sie ein Beleg für Methode: was die Assistenten gefragt wurden, wie das
Ergebnis kontrolliert wurde, was mit ihnen nicht gemacht wurde — insbesondere, dass kein wissenschaftliches Datum von einem Modell erzeugt oder
ergänzt wurde —, und warum Vision-Modelle für die
Erkennung begründet verworfen wurden. Schlecht geschrieben ist sie eine vertane Chance.

**Die Attribution der SPHEREx-Daten**, wörtlich, in der Fußzeile des Tools und im README. Das ist ein
geschenkter Punkt an Sorgfalt vor einer NASA-Jury und kostet dreißig Sekunden.

Und **die Links, von außerhalb des Event-WLANs getestet**: das Video, die deployte Anwendung und das
Repository, geöffnet von einem Telefon mit mobilen Daten. Ein Link, der nur im lokalen Netz funktioniert,
ist ein kaputter Link.

---

## 13. Was man im Kopf haben muss, wenn man ankommt

Fünf Dinge.

Eins: Die acht Vorschläge der Aufgabenstellung sind die Rubrik, sieben sind billig, und man muss sie
alle in der Reihenfolge des Werts erfüllen.

Zwei: Der Meilenstein von Stunde acht ist ein kleines Video auf dem Bildschirm, so hässlich es auch sei. Alles andere ordnet sich unter.

Drei: Die drei Pflichthalte — Freeze bei sechs Stunden, Demo aufgenommen bei vier, abgegeben bei zwei — werden nicht
verhandelt, denn das Projekt, das gewinnt, ist das, das vollständig ankommt.

Vier: das Artefakt prüfen, nicht den Bericht. Das gilt für Agenten und es gilt für Personen.

Und fünf: Der Blickwinkel des Projekts passt in einen Satz. **Ein Viewer, in dem jeder eine Koordinate eingibt
und zwei Achsen gleichzeitig sieht: wie sich diese Himmelsregion mit der Zeit verändert, und wie sie in jeder der
102 Wellenlängen aussieht, mit dem Spektrum dessen, was man markiert, on the fly erzeugt.** Das ist die
wörtliche Lesart der Aufgabenstellung, es sind ihre zwei anspruchsvollsten Stichpunkte, und es ist etwas, das kein öffentliches Tool
heute leistet.
