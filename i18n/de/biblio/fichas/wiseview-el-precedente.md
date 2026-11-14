<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../../en/biblio/fichas/wiseview-el-precedente.md) · [Español](../../../es/biblio/fichas/wiseview-el-precedente.md) · [中文](../../../zh/biblio/fichas/wiseview-el-precedente.md) · **Deutsch** · [Italiano](../../../it/biblio/fichas/wiseview-el-precedente.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `biblio/fichas/wiseview-el-precedente.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Steckbrief: WiseView, der direkte Vorläufer

- **Referenz:** Caselden, Westin, Meisner, Kuchner, Colin (2018). *WiseView: Visualizing motion
  and variability of faint WISE sources.* Astrophysics Source Code Library, ascl:1806.004
- **Link:** <http://byw.tools/wiseview> · <https://ascl.net/1806.004>
- **Status:** verifiziert (ASCL und Backyard-Worlds-Blog, 14. Nov. 2026). Vollständige Autorenschaft noch zu bestätigen
- **Warum er an erster Stelle steht:** Es ist das Werkzeug, das die Aufgabenstellung der Challenge als Vorbild nennt

## Was er sagt, in drei Sätzen

WiseView ist ein Browser-Werkzeug, das WISE-Coadds über eine Zeitbasis von mehreren Jahren blinken lässt;
die Nutzerin bzw. der Nutzer gibt nur Koordinaten ein und passt Stretch, Farbkarte und Blinkgeschwindigkeit
interaktiv an. Es entstand als Behelfslösung von zwei Freiwilligen von Backyard Worlds,
die ihre eigenen Kandidaten besser klassifizieren und prüfen wollten, ob sie Eigenbewegung zeigen. Es hat
Hunderte von Entdeckungen von Kandidaten für Braune Zwerge ermöglicht, durch Amateure und durch Profis.

## Was uns daraus nützt

1. **Die Form der Oberfläche ist durch reale Nutzung validiert.** Ein Koordinatenfeld, ein Blinken,
   drei Regler. Es muss nichts erfunden werden: Es muss auf SPHEREx übertragen werden.
2. **Die Regler sind keine Zierde.** Stretch, Farbe und Geschwindigkeit verwandeln einen Fleck
   in eine Entdeckung. Wenn sie aus Zeitmangel gestrichen werden, streicht man das, was das Werkzeug nützlich macht.
3. **Er zeigt Coadds, keine einzelnen Belichtungen.** Das Kombinieren vor dem Anzeigen macht die schwachen
   Quellen sichtbar. Bei SPHEREx ist das Äquivalent, pro Detektor oder pro Wellenlängenbereich zu summieren,
   was genau das ist, was einer der Spiegelstriche der Challenge nahelegt.
4. **Eine API zu haben machte ihn zur Infrastruktur.** Es gibt Pakete von Dritten (`flipbooks`,
   `unWISE-verse`, vom Projekt Cool Neighbors), die auf der WiseView-API aufbauen, um
   Material zu erzeugen und zu Zooniverse hochzuladen. **Das ist die Messlatte für unsere abfragbare URL**, die ein weiterer
   ausdrücklicher Spiegelstrich der Challenge ist.

## Was uns NICHT nützt (und warum)

- **Er hat keine Spektralachse.** WISE hat vier breite Bänder; SPHEREx hat 102 Kanäle. Dort liegt
  unsere Lücke: dasselbe tun *plus* die Wellenlängenachse.
- **Die WISE-Daten haben nicht das Problem des Linear Variable Filter.** Bei WISE sind zwei Epochen derselben
  Position im selben Band. Bei SPHEREx nicht. Die Blinklogik zu kopieren, ohne das zu lösen,
  erzeugt eine stroboskopische Sequenz (siehe `../../docs/02_DATOS_SPHEREX.md` §2).
- **unWISE berechnet die Coadds vorab.** WiseView ist schnell, weil jemand die schwere Arbeit schon erledigt hat. Für
  uns entspricht das dem Vorwärmen des Caches: Wir werden nicht den ganzen Himmel vorab berechnen können.

## Zahlen, die wir zitieren können

| Zahl | Wert | Wo es steht |
|---|---|---|
| Ermöglichte Entdeckungen | „Hunderte von Kandidaten für Braune Zwerge“ | ASCL-Eintrag 1806.004 |
| Zeitbasis | mehrere Jahre WISE/NeoWISE | ASCL und Backyard-Worlds-Blog |

**Vorsicht:** WiseView nicht die Entdeckung von Planet Nine zuschreiben. Er wurde nicht gefunden.

## Fragen, die offen bleiben

- Ist der Code des ursprünglichen WiseView öffentlich? Das haben wir nicht bestätigt; die abgeleiteten Pakete sind es.
- Welche Parameter legt seine API genau offen? Es in `flipbooks` nachzusehen ist billiger, als es abzuleiten.
- Wie viele Epochen zeigt er standardmäßig, und warum diese Zahl? Das ist eine Designentscheidung, die
  wir selbst treffen müssen.
