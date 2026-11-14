---
title: "Was uns die SPHEREx-Daten gesagt haben"
author: Team SPHEREx · NASA Space Apps 2026
date: 2026-11-14
place: Santiago
profile: night
lang: es
transition: fade
audience: Das Hackathon-Team (6 Personen). Eine Teilnehmerin ohne Astronomie-Erfahrung, ein Informatiker, die übrigen mit Astronomie.
message: Die schnellsten Sterne bewegen sich in einem SPHEREx-Jahr 1–2 Pixel; wir machen das sichtbar, indem wir die Wellenlänge angleichen, ausrichten und subtrahieren.
---

<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/docs/presentacion_eda/script.es.md) · [Español](../../../es/docs/presentacion_eda/script.es.md) · [中文](../../../zh/docs/presentacion_eda/script.es.md) · **Deutsch** · [Italiano](../../../it/docs/presentacion_eda/script.es.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/presentacion_eda/script.es.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

<!-- Todas las cifras salen de docs/09_EDA_HALLAZGOS.md y eda/resultados/. Las imágenes son recortes reales de
     IRSA, procesados por figures/make_figures.py. Los valores de animations.js se copiaron de su salida. -->

## Was uns die SPHEREx-Daten gesagt haben
@type cover
@class full
@anim portada
@subtitle EDA mit realen IRSA-Daten · 14. November 2026
> Das Bild rechts ist echt: der Braune Zwerg Epsilon Indi B auf fünf SPHEREx-Fotos von 2025 bis 2026. Am Ende des Vortrags werden wir sehen, dass sich genau das bewegt, was sich bewegen muss.
@why Das Titelbild zeigt bereits das reale Datum, das der Vortrag erklärt: das blink eines sich bewegenden Objekts.

## Die Idee der Aufgabe: Fotos desselben Himmels zu verschiedenen Zeitpunkten vergleichen
@kicker Die Idee
@class full
@anim idea
@steps 1
@source Schema, keine realen Daten. So wurde Pluto 1930 entdeckt und so arbeiten die Freiwilligen von Backyard Worlds.
> Zuerst das blink: zwei Fotos desselben Himmelsstücks, abwechselnd. Fast alles bleibt ruhig; ein Stern springt. Dann die Subtraktion: Was sich nicht ändert, verschwindet, und was sich bewegt hat, hinterlässt ein Paar, rot dort, wo es jetzt ist, und blau dort, wo es war.
@why Die Methode wird vor den realen Daten mit einem Schema erklärt, für alle, die das Problem nicht kennen. blink und Subtraktion sind die beiden Ansichten des Viewers.

## SPHEREx blickt im Infrarot, jenseits des Rots, mit 6 Detektoren
@kicker Das Instrument
@figure figures/bandas.svg
@source Bereiche pro Detektor: IRSA-Dokumentation (docs/02_DATOS_SPHEREX.md §1). Ein Mikrometer (µm) ist ein Tausendstel Millimeter.
> Das Auge sieht zwischen 0,4 und 0,75 Mikrometern. SPHEREx beginnt dort, wo das Rot endet, und reicht bis 5. Es teilt das in 6 Detektoren, D1 bis D6. Die kalten Braunen Zwerge leuchten vor allem in den langen Detektoren.
@why Es holt das Publikum ohne Astronomie ab: Infrarot ist «jenseits des Rots», und die sechs Detektoren sind die Einheit, mit der danach gearbeitet wird.

## Der Trick von SPHEREx: Die gemessene Farbe ändert sich entlang des Detektors
@kicker Der linear variable Filter
@class full
@anim lvf
@steps 5
@source Schema. Realer Bereich des Detektors 5 (3,82–4,44 µm) laut WCS-WAVE-Tabelle; die Punkte des Spektrums sind illustrativ.
> Jeder Streifen des Detektors misst eine andere Farbe. Das Raumfahrzeug richtet sich neu aus und der Stern fällt auf einen anderen Streifen: Er wird in einer anderen Farbe gemessen. Fügt man die Fotos zusammen, entsteht sein Spektrum. Aber das bedeutet, dass zwei Fotos desselben Sterns fast nie in derselben Farbe sind.
@why Es ist eine Transformation (der Detektor verschiebt sich und der Punkt wechselt die Farbe), und eine ruhende Abbildung erzählt sie nicht: Es erfüllt die vier Bedingungen für eine Animation.

## Für jeden Stern gibt es Hunderte von Fotos, in 3 oder 4 Durchgängen eines Jahres
@kicker Wie viele Daten es gibt
@figure figures/cobertura.svg
@source SIA2-Abfrage an spherex_dr1 und spherex_qr3 (eda/resultados/inventario.json). R Dra hat zusätzlich 1.966 Dateien in tiefen Feldern, nicht eingezeichnet.
> Jeder Punkt ist eine Datei. Man sieht die Durchgänge: SPHEREx passiert jede Zone alle sechs Monate und macht bei jedem Durchgang Dutzende Fotos über einige Wochen. Die Zeitbasis reicht von 1 bis 1,4 Jahren.
@why Kleine Vielfache auf derselben Zeitachse: Die fünf Felder lassen sich auf einen Blick vergleichen.

## Aber jedes Foto hat eine andere Farbe: Man muss die auswählen, die übereinstimmen
@kicker Erstes Problem
@figure figures/lambda_wise.svg
@source WISE 0855, Detektor 5: Farbe, in der das Objekt in jeder Datei lag, berechnet mit dem Header jeder Datei und der WCS-WAVE-Tabelle (eda/resultados/lambda_por_archivo.csv).
> Nehmen wir das erste Foto jedes Durchgangs, springt die Farbe um fast ein halbes Mikrometer: Die Helligkeit würde sich ändern, ohne dass etwas passiert. Aber jede Farbe wiederholt sich alle sechs Monate, also können wir Fotos derselben Farbe wählen: Die Variation sinkt auf 0,035 Mikrometer.
@why Der Akzent liegt auf der guten Auswahl; die schlechte steht in Rot und der Kontext in Grau.

## Der Detektor dreht sich zwischen den Durchgängen um 180°: Vor dem Vergleich muss man ausrichten
@kicker Zweites Problem
@class full
@anim giro
@steps 1
@source Zwei reale Ausschnitte von Barnard (D2) unausgerichtet. Winkel des Detektors am Himmel aus dem Header gelesen: −179,6° und +1,1°.
> Die beiden Fotos zeigen dasselbe Himmelsstück, aber das rechte ist umgedreht. Wenn man es um 180° dreht, stimmen dieselben Sterne überein. Im Code geschieht das, indem alles auf ein Gitter mit Norden oben reprojiziert wird.
@why Drehen ist eine Transformation: Es zu sehen überzeugt mehr als zwei Bilder mit einem Pfeil.

## Ausgerichtet und in derselben Farbe bewegt sich Epsilon Indi B genau so, wie es der Katalog vorhersagt
@kicker Das Ergebnis
@class full
@anim epsind
@steps 1
@source Zentroide im ersten und im letzten Foto (2025,31 und 2026,74), auf dasselbe Gitter reprojiziert (eda/resultados/centroides.json). Vorhersage: Eigenbewegung aus SIMBAD. Vergrößert: 18×18 Pixel zu 6,15″.
> Der Kreis ist der Ort, an dem der Katalog sagt, dass es zu jedem Datum sein sollte. Er rückt nach links und unten, was am Himmel Osten und Süden ist. Wir haben 0,85 und 0,71 Pixel gemessen; der Katalog sagt 0,92 und 0,57 voraus. Die umliegenden Sterne, die sich nicht bewegen, verschieben sich um weniger als 0,4.
@why Reale Daten vor der Regel, und die numerische Prüfung auf derselben Folie wie das Bild.

## Die Subtraktion macht die Bewegung zu einem rot-blauen Paar, aber ein gesättigter Stern täuscht
@kicker Die Subtraktion
@class full
@anim restas
@steps 2
@source Subtraktion letzte − erste, normalisiert. Als schlecht markierter Kern: Barnard 44 von 49 Pixeln, RW Aur 6–8, eps Ind B 0–1 (eda/resultados/centroides.json).
> Epsilon Indi B: Das rot-blaue Paar ist reale Bewegung. Barnard: bewegt sich ebenfalls, nach Norden, ist aber gesättigt und lässt sich nicht messen. RW Aur bewegt sich nicht und hinterlässt trotzdem ein Paar: Das ist der Effekt der Sättigung. Der Viewer muss anzeigen, wann ein Objekt sättigt.
@why Pro Schritt wird ein Panel enthüllt (Segmentierung), um die drei Fälle mit demselben Farbcode zu vergleichen.

## WISE 0855 ist auf einem einzelnen Foto kaum zu sehen: Um es zu zeigen, muss man summieren
@kicker Ein schwieriger Fall
@class full
@anim wise
@source Vier reale Ausschnitte von WISE 0855 im Detektor 5 bei derselben λ (4,15–4,18 µm). Der Kreis ist die vorhergesagte Position.
> Das Objekt, das die Aufgabenstellung vorschlägt, ist für eine einzelne Belichtung zu schwach. Die Lösung ist, die Fotos jedes Durchgangs zu summieren, was genau eine der Ideen ist, die die Aufgabe vorschlägt.
@why Eine ruhende Folie nach den animierten: Hier beginnt die Diskussion darüber, was in der Demo gezeigt wird.

## Jeder Ausschnitt braucht 7 Sekunden und der Browser kann ihn nicht anfordern: Alles läuft über ein Backend mit Cache
@kicker Für den Code
@figure figures/latencia.svg
@source 25 Ausschnitte von 0,1° (eda/resultados/latencia_cutouts.json): Median 7,3 s, Maximum 29 s, ~3,9 MB je Ausschnitt. IRSA antwortet nicht mit CORS (eda/resultados/infraestructura.json).
> Der Ausschnitt wiegt gleich viel, ob klein oder groß, weil er die gesamte Beschreibung des Sternbilds mitbringt. Es gab 503-Fehler. Und IRSA erlaubt einer Webseite nicht, direkt Daten anzufordern. Schlussfolgerung: Backend, Cache auf der Festplatte und die Felder der Demo vorwärmen.
@why Die vollständige Verteilung, nicht nur der Median: Man sieht den 29-s-Ausläufer, der eine Live-Demo zum Scheitern bringen würde.

## Die Qualitätsmaske: Das SOURCE-Bit ist kein Fehler
@kicker Filter
@figure figures/flags.svg
@source FLAGS-Bits in 25 Ausschnitten. Die Namen stehen im Header der FLAGS-Erweiterung selbst.
> Filtern wir «alles, was irgendein Bit hat», löschen wir 72 % des Bildes, denn SOURCE sagt nur, dass dort ein Stern ist. Die Bits, die wirklich ein schlechtes Pixel anzeigen, summieren sich auf etwa 4 %.
@why Der blaue Akzent markiert den Fall, der kein Fehler ist; in Rot die Bits, die ein Pixel ungültig machen.

## Sieben Teile von Anfang bis Ende, jedes mit seinem Verantwortlichen
@kicker Die Aufteilung
@class full
@anim flujo
@steps 1
@source Aufteilung aus dem Teamplan (README §3, docs/05_PLAN_24H.md); Aufgaben der EDA pro Rolle in docs/10_REPARTO_DE_TRABAJO.md.
> Zuerst der Weg der Daten, von der Koordinate zum Bild auf dem Bildschirm. Danach, wer welches Teil übernimmt, gemäß dem Plan, den wir bereits vereinbart haben: Die EDA lädt D2 mehr Arbeit auf, der die Auswahl nach λ, die Filter und die Subtraktionen erhält.
@why Die Aufteilung wird am Datenfluss abgelesen: Jede Person sieht, wo ihr Teil hinpasst und mit wem es verbunden ist.

## Was wir noch nicht wissen
@kicker Zur Diskussion
- **Wie sieht ein sich bewegendes Objekt im Cube aus?** Der HiPS-Cube, den Aladin lädt, mischt alle Epochen.
- **Wie stark verbessert sich WISE 0855 durch Summieren** der Fotos eines Durchgangs?
- **Was macht der Viewer mit gesättigten Sternen?** Warnen, die Maske zeigen oder den Detektor wechseln.
- **Die Helligkeit:** Wir haben die Veränderlichkeit von RW Aur und R Dra noch nicht gemessen.
@source docs/09_EDA_HALLAZGOS.md §7.
> Zum Merken: Die schnellsten Sterne bewegen sich in einem Jahr ein oder zwei Pixel; wir machen das sichtbar, indem wir die Farbe angleichen, ausrichten und subtrahieren.
@why Abschluss mit dem Offenen und der Botschaft, nicht mit einem «Danke».

## Quellen
@appendix
- Daten: IRSA/IPAC, SIA2-Sammlungen spherex_dr1 und spherex_qr3, abgefragt am 14. Nov. 2026.
- Eigenbewegungen: SIMBAD (CfA-Spiegel), in data/campos_de_prueba.yml.
- Skripte: eda/01_inventario.py bis eda/05_centroides.py; Abbildungen: docs/presentacion_eda/figures/make_figures.py.
- Attribution: This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
@why Wo jede Zahl lebt, um sie neu berechnen zu können.
