<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/docs/07_RIESGOS.md) · [Español](../../es/docs/07_RIESGOS.md) · [中文](../../zh/docs/07_RIESGOS.md) · **Deutsch** · [Italiano](../../it/docs/07_RIESGOS.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `docs/07_RIESGOS.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# 07 — Risiken

Vor dem Start identifizierte Risiken, mit ihrem Warnsignal und ihrem Plan B. Wird während des
Events mit `/riesgo` aktualisiert.

Reihenfolge: danach, wie sehr es wehtut, nicht nach Wahrscheinlichkeit.

---

## R1 · Die Cutouts von IRSA sind für ein interaktives Werkzeug zu langsam

> **Stand 14. Nov.: ist eingetreten.** Median 7,3 s, p90 10,8 s, Maximum 29 s, ~3,9 MB unabhängig von der
> Größe, zeitweise 503 (`docs/09` §6). Beschlossene Gegenmaßnahme: Cache + 5 vorberechnete Felder als statische Dateien
> (ADR-001, Aktualisierung 14. Nov.). Es fehlt noch die Entscheidung, wo `/api` für beliebige Koordinaten läuft (C).

**Auswirkung: kritisch.** Es ist die Annahme, auf der das ganze Projekt ruht.

Ein vollständiges MEF wiegt ~70 MB; der Cutout-Dienst existiert gerade, um sie nicht vollständig herunterzuladen,
aber wir wissen nicht, wie lange er **pro Epoche** braucht und was bei 15 parallelen Anfragen passiert.

- **Warnsignal:** In Block 1 braucht ein Cutout mit `size=0.1` mehr als ~5 s, oder IRSA begrenzt die
  gleichzeitigen Anfragen.
- **Plan B:** aggressiver Cache + Vorwärmen der Testfelder + die Epochen parallel anfragen,
  mit einer Obergrenze + die Einzelbilder anzeigen, sobald sie eintreffen, statt auf alle zu warten.
- **Plan C:** Das Werkzeug arbeitet auf einer kuratierten Menge von ~10 vorberechneten Feldern und wird
  so präsentiert, ohne es zu verschleiern: „heute bedienen wir diese Felder; die Architektur skaliert auf den ganzen Himmel“.
  Es ist weniger ehrgeizig und es ist ehrlich.
- **Wann entschieden wird:** Stunde 3. Nicht später.

---

## R2 · Die Epochen sind wegen des Linear Variable Filter nicht untereinander vergleichbar

> **Stand 14. Nov.: in der EDA gelöst.** Es werden Epochen mit angeglichener λ gewählt (Streuung 0,474 → 0,035 µm bei
> WISE 0855 D5); siehe `docs/09` §2. Die λ pro Einzelbild anzuzeigen bleibt Teil des Designs.

**Auswirkung: hoch.** Es ist das subtilste Risiko und das, das am ehesten das Ergebnis ruiniert, ohne dass
jemand versteht, warum.

Durch das LVF-Design von SPHEREx landet jede Beobachtung einer Himmelsposition auf einem anderen Teil
des Detektors und misst daher eine andere Wellenlänge. Ein naives Blinken ergibt eine Sequenz, in der
die Helligkeit springt, ohne dass sich etwas geändert hat. Erklärt in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2.

- **Warnsignal:** Das erste Blinken flackert wie ein Stroboskoplicht und die Quellen erscheinen und
  verschwinden, ohne sich zu bewegen.
- **Plan B:** nach Detektor oder nach λ-Bereich gruppieren und jedes Einzelbild mit robusten
  Perzentilen normalisieren.
- **Plan C:** Wenn es auch so nicht sauber wird, **wird es zu einer Funktion**: die Wellenlänge
  jedes Einzelbilds auf dem Bildschirm anzeigen und erklären, dass das Blinken spektrale Information ist, kein Rauschen.
  Das ist wahr, und es ist ein Pluspunkt vor einer technischen Jury.
- **Wann entschieden wird:** Stunde 3, durch Messen des `WCS-WAVE` zweier Epochen desselben Feldes.

---

## R3 · DR1 ist gerade erst erschienen und Dokumentation oder Beispiele passen nicht

> **Achtung beim Plan B weiter unten (14. Nov.):** `spherex_qr3` allein lässt WISE 0855 ohne Daten (0 Zeilen).
> Man muss `spherex_dr1` **und** `spherex_qr3` zusammen abfragen (`docs/09` §1).

**Auswirkung: mittel-hoch.** DR1 wurde im November 2026 veröffentlicht, in diesem Monat. Die im Umlauf befindlichen Tutorials
verweisen größtenteils auf QR2, das über SIA2 nicht mehr durchsuchbar ist.

- **Warnsignal:** Ein aus einem Notebook kopiertes Beispiel liefert leer oder einen Collection-Fehler.
- **Plan B:** `spherex_qr3` verwenden, das seit September vorliegt und mit höherer Wahrscheinlichkeit gefestigt ist.
  QR2 bleibt bis Februar 2027 per direkter URL herunterladbar, auch wenn es nicht durchsuchbar ist.
- **Praktische Regel:** **immer zur IRSA-Dokumentation gehen, nicht zu einem Blog oder einem
  alten Beispiel.** Links in [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md).

---

## R4 · Das WLAN fällt aus (im Raum oder genau im Pitch)

**Auswirkung: kritisch, wenn es im Pitch passiert, sonst lästig.** Wahrscheinlichkeit hoch: passiert auf
fast allen Hackathons.

- **Plan B verpflichtend, nicht optional:** degradierter Modus, der die fünf Felder aus dem lokalen Cache bedient,
  ohne das Netz zu berühren, und das Video der Demo heruntergeladen auf der Platte des Rechners, der präsentiert.
- **Wann:** das Video bei T−4 h. Der degradierte Modus in Block 4.
- Das Repository auf **mehr als einem Rechner** geklont haben.

---

## R5 · Das Projekt wird verspätet oder unvollständig abgegeben

**Auswirkung: kritisch. Es ist die Ursache Nummer eins dafür, dass ein gutes Projekt nichts gewinnt.**

Das Abgabeformular verlangt mehr, als man in Erinnerung hat, und enthält in diesem Jahr verpflichtend die
Beschreibung, wie KI eingesetzt wurde.

- **Plan B:** Es gibt keinen Plan B. Deshalb gibt es die drei verpflichtenden Haltepunkte aus
  [`04_METODOLOGIA.md`](04_METODOLOGIA.md): Freeze bei T−6, Demo aufgenommen bei T−4, **abgegeben bei T−2**.
- **N öffnet das Formular in Stunde 1**, nicht in Stunde 22, um zu sehen, was es verlangt.

---

## R6 · Das Team verzettelt sich in halb fertigen Spiegelstrichen

**Auswirkung: hoch.** Acht *Potential Considerations* und vier Personen mit schnellen Agents: Die
Versuchung, alle anzufangen, ist riesig. Eine Jury klickt genau auf den, der halb fertig geblieben ist.

- **Warnsignal:** mehr als zwei offene Branches pro Person, oder ein `/standup`, bei dem niemand
  etwas Funktionierendes zeigen kann.
- **Plan B:** Die Prioritätenreihenfolge von Block 3 in [`05_PLAN_24H.md`](05_PLAN_24H.md) wird nicht
  in der Hitze des Gefechts verhandelt. Eine fertige Funktion ist mehr wert als drei halbe.

---

## R7 · Zwei Agents behindern sich und zerstören `main`

**Auswirkung: mittel, aber es kostet mitten in der Nacht Stunden.**

- **Plan B:** Worktree pro Person, kurze Branches, niemand pusht auf `main`, einen PR prüft eine Person.
  Siehe [`04_METODOLOGIA.md`](04_METODOLOGIA.md).
- **Warnsignal:** der erste seltsame Merge-Konflikt. Wenn er auftritt, fünf Minuten anhalten und
  prüfen, wer woran arbeitet, statt ihn mit Gewalt zu lösen.

---

## R8 · Jemand behauptet vor der Jury etwas Falsches

**Auswirkung: hoch und schwer zu beheben.** Eine Jury mit NASA-Astronomen erkennt sofort
eine erfundene Zahl oder ein Spektrum, das als kalibrierte Photometrie dargestellt wird.

- **Plan B:** Jede Zahl, die in den Pitch oder die README gelangt, geht durch `/verifica-cifra`. Das Feld
  `caveat` des Spektren-Endpunkts wird nicht entfernt. Es wird nie gesagt, dass etwas entdeckt wurde.
- **Regel:** Wenn du es nicht geprüft hast, sagt man „wir haben es nicht geprüft“. Dieser Satz erhöht die Glaubwürdigkeit, er senkt sie nicht.

---

## R9 · Die GPU und der lokale Rechner reichen für das Versprochene nicht

**Auswirkung: gering bei der gewählten Architektur**, und es lohnt sich, es aufzuschreiben, damit niemand
vorschlägt, etwas zu trainieren. Das Team verfügt über eine GPU mit 4 GB; es gibt keinen Spielraum, um Videomodelle
zu trainieren oder feinabzustimmen. Die Architektur aus [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md) braucht das an keiner Stelle.

- **Wenn jemand vorschlägt, etwas zu trainieren:** [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §6 enthält das
  vollständige Argument, um Nein zu sagen, ohne es erneut zu diskutieren.

---

## R10 · Die Bewegung ist Sub-Pixel und das Blinken beeindruckt nicht

> **Stand 14. Nov.: gemessen.** Reale Zeitbasis 1,0-1,4 Jahre; Gesamtverschiebung 1,1-1,8 px (`docs/09` §4).
> Plan B unten wird übernommen (erste gegen letzte + Subtraktion + Zoom).

**Auswirkung: hoch für die Demo, mittel für das Projekt.** Identifiziert am 14. Nov. 2026, vor dem Event.

Bei einer Pixelskala von 6,15 arcsec (SIA2; `eda/03_recortes_y_figuras.py:42`) und einem SPHEREx, das alle 6 Monate den ganzen Himmel durchmustert, beträgt die
Verschiebung zwischen zwei aufeinanderfolgenden Durchgängen **weniger als ein Pixel, selbst bei den
schnellsten Objekten des Himmels**: 0,84 px für Barnards Stern, 0,66 px für WISE 0855, 0,38 px für
Epsilon Indi B. Gemessen am 14. Nov.: Mit dem gesamten verfügbaren Zeitraum kommt man auf 1,1-1,8 px.

- **Warnsignal:** Das Blinken funktioniert, die Daten sind korrekt, und dennoch „sieht man nicht, dass es sich
  bewegt“. Das wird passieren, wenn aufeinanderfolgende Epochen verglichen werden.
- **Plan B:** immer die **erste Epoche gegen die letzte** vergleichen, nicht die aufeinanderfolgenden; einen
  Zoom auf den Ausschnitt anbieten, statt ihn 1:1 zu zeigen; und sich auf die **Bildsubtraktion** stützen, bei der eine
  Verschiebung von einem Pixel als Paar aus positivem und negativem Lobus sehr deutlich sichtbar ist, während
  sie im Blinken schlecht zu sehen ist.
- **Plan C:** die Achse der Demo zur **Variabilität** verlagern (RW Aurigae, R Draconis), die tatsächlich
  offensichtlich ist, und zum **Kometen 3I/ATLAS**, der sich viel stärker bewegt als jeder Stern.
- **Und eine Regel für den Pitch:** nicht versprechen, dass „das Objekt ins Auge springt“, bevor man es gesehen hat.
- **Wann entschieden wird:** entschieden am 14. Nov. (Zeitbasis von 1,0-1,4 Jahren; 1,1-1,8 px insgesamt): Plan B wird übernommen.

---

## R11 · Vercel hängt an einem einzigen Konto

**Was ausfallen kann:** Nur Mauricio hat Zugriff auf das Vercel-Projekt (kostenloser Hobby-Plan; Mitglieder hinzuzufügen kostet Geld). Die Vorschauen der PR der anderen erscheinen als *Blocked* und nur er sieht die Logs.
- **Warnsignal:** Die Produktion wird nicht aktualisiert, oder Mauricio ist kurz vor dem Abschluss nicht verfügbar.
- **Plan B:** Jede Person testet lokal (`npm ci && npm run build && npm run preview`); aufgenommenes Demo-Video und statischer Modus mit den 5 vorberechneten Feldern.
- **Wann entschieden wird:** vor dem Scope-Freeze (T−6 h). Verantwortlich: C.

## R12 · Das CDS in Straßburg fällt aus (SIMBAD, VizieR)

**Was ausfallen kann:** Am 14. Nov. war das CDS in Straßburg ausgefallen; das Gaia-Overlay und die SIMBAD-Blase hängen davon ab.
- **Warnsignal:** Die Gaia-/SIMBAD-Ebenen bleiben leer oder brauchen länger als das Zeitlimit.
- **Plan B:** Der Code probiert bereits zuerst den Harvard-Spiegel (`vizier.cfa.harvard.edu`, `simbad.cfa.harvard.edu`) und das CDS als Rückfall; für die Demo die 5 Felder vorberechnen.
- **Wann entschieden wird:** bei der Probe der Demo. Verantwortlich: V2.

## R13 · Ein gesättigter Stern täuscht die Subtraktion

**Was ausfallen kann:** Bei gesättigten Objekten (Barnard, RW Aur) wird der Kern maskiert und die Subtraktion hinterlässt ein rot/blaues Paar, auch wenn sie sich nicht bewegen (RW Aur „bewegt sich“ 1,4 px, ohne sich zu bewegen).
- **Warnsignal:** Ein Kontrollobjekt (RW Aur) „bewegt sich“ in der Subtraktion.
- **Plan B:** In der Oberfläche warnen, wenn das Objekt sättigt, und RW Aur weder als Beweis für Variabilität noch für Bewegung verwenden (`docs/09`).
- **Wann entschieden wird:** vor dem Aufnehmen der Demo. Verantwortlich: D2 und V1.

---

## Register neuer Risiken

Nutze `/riesgo`, um hier etwas hinzuzufügen. Format: was ausfallen kann, wie wir es bemerken würden, was wir tun würden, und
wann entschieden wird.
