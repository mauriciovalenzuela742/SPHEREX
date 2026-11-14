<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/01_ESTADO_DEL_ARTE.md) · [Español](../../es/docs/01_ESTADO_DEL_ARTE.md) · [中文](../../zh/docs/01_ESTADO_DEL_ARTE.md) · **Deutsch** · [Italiano](../../it/docs/01_ESTADO_DEL_ARTE.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/01_ESTADO_DEL_ARTE.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 01 — Stand der Technik

Was bei dem, was diese Challenge verlangt, bereits getan wurde, was funktioniert hat, was nicht, und wo Raum für
etwas Neues in 24 Stunden bleibt. Die vollständigen Referenzen, mit Links, stehen in
[`../biblio/README.md`](../biblio/README.md); hier stehen die Namen und das Argument.

---

## 1. Das Problem ist hundert Jahre alt und die Technik hat sich nicht geändert

Clyde Tombaugh entdeckte Pluto 1930 mit einem **Blinkkomparator**: zwei Fotoplatten
derselben Himmelsregion, zu verschiedenen Zeitpunkten aufgenommen, schnell abwechselnd gezeigt. Was ruhig ist, bewegt sich
nicht; was sich verschiebt, springt ins Auge. Das menschliche Auge ist außerordentlich gut darin, diesen
Sprung zu erkennen, selbst bei viel Hintergrundrauschen.

Ein Jahrhundert später ist die Technik dieselbe, nur der Träger hat sich geändert. Und sie ist weiterhin konkurrenzfähig: In
Bürgerwissenschaftsprojekten wie **Backyard Worlds: Planet 9** (Kuchner et al., 2017) haben Hunderttausende
Freiwillige Braune Zwerge und Objekte mit hoher Eigenbewegung gefunden, die die automatischen
Algorithmen des Surveys übersehen hatten, typischerweise weil sie in Regionen mit hoher Sterndichte lagen, nahe an hellen Quellen oder mit Artefakten, die einen Detektor verwirren, aber
einen Menschen nicht.

**Das ist die Rechtfertigung der Challenge**, und man sollte es im Pitch sagen: Ein Viewer wird nicht verlangt, weil er
einfacher wäre als ein automatischer Detektor, sondern weil das menschliche Auge im Maßstab einer Menge
Fälle löst, die der automatische Detektor nicht löst.

---

## 2. Was es schon gibt und was man kennen muss, bevor man eine Zeile schreibt

### WiseView — das ausdrückliche Vorbild der Challenge

<http://byw.tools/wiseview> · Caselden, Westin et al., ASCL:1806.004

Browser-Werkzeug, das WISE-Coadds über eine Zeitbasis von mehreren Jahren blinken lässt.
Die Nutzer geben Koordinaten ein und passen Stretch, Farbkarte und Blinkgeschwindigkeit an. Es entstand
als Behelfslösung von zwei Freiwilligen von Backyard Worlds, die ihre eigenen Kandidaten besser klassifizieren wollten,
und wurde schließlich zu dem Werkzeug, mit dem **Hunderte von Entdeckungen**
Brauner Zwerge gemacht wurden, durch Amateure und durch Profis.

Lektionen, die man ohne Scham kopieren sollte:

- **Ein Koordinatenfeld und sonst nichts** auf dem ersten Bildschirm.
- **Die Regler sind wichtig**: Stretch, Farbe und Blinkgeschwindigkeit verwandeln einen
  Fleck in eine Entdeckung. Sie sind keine Zierde.
- **Es hat eine API.** Es gibt Pakete von Dritten —`flipbooks` und `unWISE-verse`, vom Projekt Cool
  Neighbors— die auf der WiseView-API aufbauen, um Material zu erzeugen und zu Zooniverse hochzuladen.
  Ein Werkzeug mit abfragbarer URL wird zur Infrastruktur anderer Projekte. Das ist
  genau das, was der Spiegelstrich der Challenge zu Koordinaten in der URL verlangt.

Was WiseView **nicht** tut, und das ist unsere Lücke: Es hat keine Spektralachse. WISE hat vier Bänder;
SPHEREx hat 102.

### unWISE und die Coadds

Lang (2014), Meisner et al. (Fünf-Jahres-Coadds), unWISE-Katalog (Schlafly et al.).
WiseView zeigt keine einzelnen Belichtungen: Es zeigt **Coadds**, nach Epochen kombinierte Bilder. Das ist der
Grund, warum schwache Quellen zu sehen sind. Der Katalog **unTimely** (Meisner et al., 2022) brachte dies in die
Zeitdomäne: ein zeitlich aufgelöster Ganzhimmelskatalog aus den Coadds.

`[Implikation]` Vor dem Anzeigen zu kombinieren ist nicht optional, wenn man schwache Dinge sehen will. Bei SPHEREx
ist das natürliche Äquivalent, pro Detektor oder pro λ-Bereich zu summieren, was genau das ist, was die Challenge nahelegt.

### Himmels-Viewer im Browser

| Werkzeug | Wer | Was es beiträgt |
|---|---|---|
| **Aladin Lite v3** | CDS, Straßburg | HiPS-Viewer im Browser, einbettbar, mit Projektionen, Katalog-Overlays und FITS-Kacheln. **Wird von der Challenge selbst zitiert** |
| **Firefly** | IPAC/Caltech | Die Engine des Data Explorer von IRSA. Das offizielle Notebook zum HiPS-Cube von SPHEREx verwendet sie |
| **Legacy Survey viewer** | NOIRLab | Ein weiterer Himmels-Viewer, der die unWISE-Coadds bereitstellt |
| **ESASky** | ESA | Multimissions-Viewer, gutes Beispiel für UX zeitlicher Ebenen |
| **JS9** | SAO | DS9 im Browser: FITS-Manipulation auf Client-Seite |

**Aladin Lite ist die Standardentscheidung** und man sollte nicht darüber diskutieren: Es löst die Navigation durch den
Himmel, die Projektionen, die Gaia-Overlays und den Zoom, das sind Wochen an Arbeit. Das Format
**HiPS** (Fernique et al., 2015) ist das, was es verarbeitet, und erlaubt es, einen flachen Cube Ebene für Ebene zu animieren.

Die Tatsache, die das Argument abschließt: Der **Ganzhimmels-Cube von SPHEREx DR1 wird als HiPS veröffentlicht**
(siehe [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)). Es gibt einen direkten Weg vom NASA-Archiv zum
Browser ohne Backend.

---

## 3. Automatische Detektion bewegter Objekte

Es ist nicht das, was die Challenge verlangt, aber es ist das, wonach eine Jury mit Astronomen fragen wird. Man muss
in einem Satz antworten können, warum wir es nicht getan haben (oder wie wir es über dem Viewer getan haben).

### Shift-and-Stack: KBMOD

Whidden et al. (2019) und das Team von LINCC Frameworks. Die Idee: Ein sich langsam bewegendes Objekt ist
in einem einzelnen Bild unsichtbar, aber wenn man jedes Bild gemäß einer Kandidatengeschwindigkeit **verschiebt** und sie
dann **stapelt**, addiert sich das Objekt kohärent und das Rauschen nicht. KBMOD macht dies auf GPU und kann
in der Größenordnung von 10¹⁰ Kandidatentrajektorien pro Minute erkunden.

Reale Ergebnisse: Der Survey **DEEP** (DECam Ecliptic Exploration Project) identifizierte mit KBMOD
105 neue transneptunische Objekte; der New Horizons Subaru TNO Survey nutzte es, um von Tagen pro
Chip auf Stunden zu kommen. Es gibt außerdem aktuelle Arbeit zur Klassifikation der erzeugten Kandidaten mit maschinellem Lernen
(Smotherman et al., 2024), weil eine niedrige Schwelle Tausende falsch positive Ergebnisse pro CCD erzeugt.

`[Implikation]` Shift-and-Stack ist der Stand der Technik, um „zu finden, was man nicht einmal sieht“. Es ist auch
teuer, und SPHEREx hat eine Kadenz und eine spektrale Abtastung, die denen von DECam nicht ähneln.
**Für 24 Stunden ist es ehrlicher, es als künftige Arbeit zu erwähnen, als es zu versuchen.** Wenn man eine
Prise möchte, ist eine Bildsubtraktion zwischen zwei Epochen (die die Challenge ausdrücklich nahelegt) 5 % des
Aufwands und 60 % des visuellen Effekts.

### Verknüpfung von Detektionen: HelioLinC und die Familie

Der andere Ansatz: Quellen in jedem Bild detektieren und dann die Detektionen **verknüpfen**, die mit einer Bahn
kompatibel sind. Es ist der Weg, dem Rubin/LSST folgen wird. Billiger als Shift-and-Stack,
aber das Objekt muss in einzelnen Bildern sichtbar sein.

### Alert-Broker: ALeRCE

Das ist eigenes Terrain: **ALeRCE** (Förster et al., 2021) ist der chilenische Broker, der den Alert-Strom
von ZTF verarbeitet und sich auf LSST vorbereitet. Zwei Klassifikatoren:

- **Stamp classifier** (Carrasco-Davis et al.): ein Convolutional Network auf den Wissenschafts-, Referenz- und Differenzausschnitten
  der *ersten* Detektion, entworfen, um die Rotationsinvarianz auszunutzen.
  Klassifiziert mit einem einzigen Bild.
- **Light curve classifier** (Sánchez-Sáez et al.): balancierter Random Forest, in zwei Ebenen, auf
  Variabilitätsmerkmalen und Farben.

Sie haben in der Größenordnung von 10⁷ Objekten aus ~10⁸ Alerts klassifiziert.

`[Implikation — und es ist wichtig für dieses Team]` Das Labor hat Leute, die dies gebaut haben. Eine
Jury bemerkt das. Aber der differenzierende Beitrag ist nicht, einen Klassifikator in den Viewer zu stecken: Es ist die **Disziplin
der Echtzeitklassifikation** —Schwellen, falsch positive Ergebnisse, wie einem Menschen ein zweifelhafter
Kandidat präsentiert wird, wie das Label dieser Person erfasst wird. Diese auf die UI des
Viewers angewandte Disziplin ist etwas, das kein anderes Team des Hackathons haben wird. Siehe
[`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md).

---

## 4. Bürgerwissenschaft: was sie funktionieren lässt

Backyard Worlds, Cool Neighbors und Zooniverse haben Jahre an Lernerfahrung dazu, und die Challenge
zielt ausdrücklich auf dieses Publikum.

Was die Erfahrung zeigt:

- **Die Aufgabe muss eine einzige sein und in Sekunden entscheidbar.** „Bewegt sich hier etwas, ja oder nein?“
  Nicht „klassifizieren Sie diese Quelle“.
- **Man muss anfangen können, ohne sich zu registrieren oder etwas zu lesen.** Ein vorgeladenes Beispiel auf dem
  Startbildschirm ist mehr wert als ein Tutorial.
- **Nachvollziehbarkeit ist die Belohnung.** Dass die Freiwilligen auf etwas zeigen, es speichern und wieder
  zeigen können —mit einer URL— verwandelt Neugier in Entdeckung.
- **Entdeckungen werden mit den Namen der Freiwilligen veröffentlicht.** Das ist kein Detail: Es ist
  der Motor der Beteiligung.

`[Implikation]` Drei Produktentscheidungen ergeben sich daraus: vorgeladenes Beispiel beim Öffnen, Auflösung
von Namen („Barnard's Star“, nicht nur Zahlen) und **teilbare URL mit den Koordinaten**, die zudem
ein ausdrücklicher Spiegelstrich der Challenge ist.

---

## 5. Planet X: wo die Suche heute steht

Die Challenge heißt „Planet X and SPHEREx“, verlangt aber nicht, Planet X zu suchen. Man sollte trotzdem den
realen Stand kennen, um vor einer Jury keinen Unsinn zu sagen.

- Die moderne Hypothese stammt von **Batygin & Brown (2016)**, *Evidence for a Distant Giant Planet in the
  Solar System* (AJ 151, 22; arXiv:1601.05438): Die Bahnhäufung entfernter transneptunischer Objekte
  ließe sich durch einen Planeten von ≳10 Erdmassen auf einer fernen exzentrischen Bahn erklären.
- **Er wurde nicht gefunden.** Stand November 2026 ist er weiterhin unbestätigt.
- Der meistzitierte Kandidat ist der von **Phan et al.**, die die Infrarot-Surveys **IRAS** und
  **AKARI**, durch 23 Jahre getrennt, kreuzten und ein einziges kompatibles Objekt fanden. Veröffentlicht in PASA. Die
  Autoren selbst betonen, dass sie Planet Nine nicht entdeckt haben; es braucht Nachbeobachtung.
- Es gibt aktuelle gezielte optische Parallaxensuchen, die im abgedeckten Feld keine glaubwürdigen Kandidaten fanden, und Arbeit von 2026, die den Raum erlaubter Bahnen einengt.

`[Implikation]` Der ehrliche Rahmen für den Pitch: **Die Technik, die den Kandidaten von Phan fand, ist
genau die der Challenge** —zwei zeitlich getrennte Ganzhimmels-Infrarot-Surveys vergleichen und
nach dem suchen, was sich bewegt hat—. SPHEREx macht das alle sechs Monate, in 102 Bändern, und niemand hat es
mit bloßem Auge durchgesehen. Dieser Satz ist wahr, er ist überprüfbar, und er ist ein besserer Aufhänger als jedes Versprechen,
einen Planeten zu finden.

---

## 6. Videomodelle (TimeSformer, VideoMAE, X-CLIP): wo sie wirklich passen

Sie waren eine anfängliche Empfehlung aus dem Umfeld des Teams und verdienen eine klare Antwort.

Was sie sind: Architekturen zum **Verstehen natürlicher Videos**. **TimeSformer** (Bertasius et al., ICML 2021;
arXiv:2102.05095) und **ViViT** (Arnab et al., ICCV 2021; arXiv:2103.15691) wenden getrennte Attention
in Raum und Zeit auf Einzelbild-Patches an. **VideoMAE** (Tong et al.; arXiv:2203.12602) und
**VideoMAE V2** (arXiv:2303.16727) werden mit maskierten Autoencodern und sehr aggressiver Maskierung vortrainiert,
was sie dateneffizient macht. **X-CLIP** (Ni et al.; arXiv:2208.02816) erweitert CLIP
auf Video zur Erkennung mit Sprachbeschreibungen.

Warum sie **nicht** der Kern dieses Projekts sind:

1. **Die Challenge verlangt einen Viewer, keinen Klassifikator.** Wer detektiert, ist die Nutzerin bzw. der Nutzer. Ein Videomodell
   beantwortet die Aufgabenstellung nicht.
2. **Sie sind mit natürlichem Video vortrainiert** (Kinetics, Something-Something): Personen, Objekte,
   Handlungen. Die Statistik einer astronomischen Sequenz —fast leerer Hintergrund, Punktquellen, PSF,
   Artefakte, eine Verschiebung um wenige Pixel— ähnelt dem in nichts. Das Vortraining, das ihr ganzer
   Wert ist, überträgt sich nicht gut.
3. **Es gibt keine Labels.** In 24 Stunden ohne beschrifteten Datensatz zu trainieren oder feinzujustieren ist unrealistisch.
4. **Der Fall ist durch klassische Methoden bereits gut gelöst.** Shift-and-Stack und die Bildsubtraktion
   nutzen die Physik des Problems (eine lineare Trajektorie, ein statischer Hintergrund). Ein Video-Transformer
   müsste das von Grund auf lernen, mit weniger Daten.

Wo sie **doch** passen könnten, wenn Zeit übrig wäre, und es lohnt sich, es zu wissen, um der Jury zu antworten:

- Als **Vorsortierung von Kandidaten** auf bereits ausgerichteten Stapeln von Ausschnitten: ein kleiner Klassifikator,
  trainiert mit synthetischen Positiven (injizierte Quellen mit bekannter Bewegung) und realen Negativen.
  Hier ist die richtige Parallele nicht TimeSformer, sondern der **Stamp classifier von ALeRCE**: ein kleines Netz,
  auf Ausschnitten, mit von Hand gewählten Invarianzen. Billiger, besser erklärbar und mit Leuten aus dem
  Labor, die es kennen.
- Als **Embedding**, um „mehr Sequenzen wie diese“ zu suchen, was eine hübsche UI-Idee ist.

**Zusammenfassung für den Pitch, falls gefragt wird:** „Wir haben es evaluiert. Der Flaschenhals der Challenge ist nicht,
die Bewegung in einem Video zu erkennen, sondern die richtigen Daten heranzuholen, auszurichten und einer
Person vorzulegen. Wo KI hier etwas beiträgt, ist das Vorsortieren von Kandidaten mit kleinen Netzen auf Ausschnitten,
was der Broker ALeRCE tut, und das haben wir als Ausblick festgehalten.“ Diese Antwort ist stärker, als ein Modell
eingebaut zu haben, das nichts beiträgt.

---

## 7. Wo die Lücke liegt

Alles zusammengenommen, das, was es heute **nicht gibt** und in 24 Stunden machbar ist:

> Ein öffentlicher Viewer, in dem die Nutzerin bzw. der Nutzer eine Koordinate eingibt und **zwei Achsen gleichzeitig** sieht: wie sich diese
> Himmelsregion **in der Zeit** verändert (das Blinken von eh und je, das die Challenge verlangt) und wie sie
> **in jeder der 102 Wellenlängen** aussieht (die Achse, die WiseView nicht hat und die nur SPHEREx
> liefern kann), mit dem spontan erzeugten Spektrum dessen, worauf man zeigt.

Das ist zugleich:

- Die wörtliche Lesart der Aufgabenstellung (der Viewer mit dem kleinen Video).
- Die beiden anspruchsvollsten Spiegelstriche der *Potential Considerations* (die 102 Bänder und die spontanen Spektren).
- Etwas, das, soweit wir prüfen konnten, kein öffentliches Werkzeug heute für SPHEREx tut:
  der Data Explorer von IRSA ist für Astronomen, und WiseView stammt von einer anderen Mission und hat keine Spektralachse.

Die übrigen Spiegelstriche —Bildsubtraktion, einstellbares Sichtfeld, Overlays von Gaia und WISE, abfragbare
URL, Kontaminations-Flags— sind kostengünstige Extras, die nach Wert geordnet hinzukommen.
Die Reihenfolge steht in [`05_PLAN_24H.md`](05_PLAN_24H.md).

---

## 8. Ehrlichkeit zu diesem Dokument

Was hier steht, stützt sich auf Recherchen und auf die offizielle IRSA-Dokumentation, abgerufen am 14.
November 2026. Die Archivdaten (Endpunkte, Releases, Dateistruktur) sind
gegen die Dokumentation verifiziert. Die bibliografischen Referenzen haben ihren Verifikationsstatus
einzeln in [`../biblio/README.md`](../biblio/README.md) markiert: **Zitiere nicht von hier, ohne dort nachzusehen**.
Die Aussagen darüber, was nicht existiert („kein öffentliches Werkzeug tut heute…“), sind unsere
und durch das begrenzt, was wir gesucht haben; wenn jemand das Gegenteil findet, wird das Dokument korrigiert.
