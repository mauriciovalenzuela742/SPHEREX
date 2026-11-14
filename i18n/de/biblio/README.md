<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/biblio/README.md) · [Español](../../es/biblio/README.md) · [中文](../../zh/biblio/README.md) · **Deutsch** · [Italiano](../../it/biblio/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `biblio/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# Bibliografie

Referenzen organisiert **danach, wofür sie dienen**, nicht in alphabetischer Reihenfolge. Jeder Eintrag sagt, was er
zu diesem konkreten Projekt beiträgt und in welchem Verifikationsstatus er ist.

## Wie man die Spalte «Status» liest

| Markierung | Bedeutung |
|---|---|
| ✅ | Kennung und Titel am 14. Nov. 2026 in einer Suche geprüft |
| 🟡 | Existiert und ist bekannt, aber **wir haben die genaue Kennung nicht geprüft**. Vor dem Zitieren verifizieren |
| 📄 | Offizielle Dokumentation, mit geöffneter und gelesener URL |

**Zitiere von hier niemals, ohne das zu verifizieren, was auf 🟡 steht.** Dass ein Paper existiert, beweist nicht, dass es sagt, was
ihm zugeschrieben wird; eine Jury mit NASA-Astronomen bemerkt das. Benutze `/verifica-cifra`.

Die Einträge im BibTeX-Format stehen in [`referencias.bib`](../../../biblio/referencias.bib). Die Code-Repositories
in [`repos.md`](repos.md). Die Lesekarten in [`fichas/`](../../../biblio/fichas/).

---

## 1. SPHEREx: die Mission und ihre Daten

Was man lesen muss, um das Instrument zu verstehen und keine Fehler mit den Daten zu machen.

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| **SPHEREx Explanatory Supplement** · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp_QR_v2.0.pdf> | Spezifikationsdokument der Datenprodukte | **Das Referenzdokument.** Tabelle 16 definiert die Bits von `FLAGS`, was der Punkt *contamination flags* verlangt | 📄 |
| **SPHEREx Archive at IRSA** · <https://caltech-ipac.github.io/spherex-archive-documentation/> | Leitfaden zu Zugriff und Produkten | SIA2-Sammlungen, Cutouts, Struktur des MEF. **Das Nützlichste am Tag 1** | 📄 |
| Bock et al. (2026), *The SPHEREx Satellite Mission*, ApJ · arXiv:2511.02985 | Kanonisches Paper der Mission | Es ist das, das IRSA zu zitieren verlangt. Beschreibt den geplanten Katalog der Objekte des Sonnensystems | ✅ |
| Akeson et al. (2026), *The SPHEREx Image and Spectrophotometry Processing Pipeline*, ApJS · arXiv:2511.15823 · doi:10.3847/1538-4365/ae8843 | Wie die von uns genutzten Daten erzeugt werden | Erklärt Level 2, die Kalibrierung und die Verfügbarkeitszeiten | ✅ |
| Crill et al. (2025), *The SPHEREx Sky Simulator* · arXiv:2505.24856 | Himmelssimulator von SPHEREx | Nützlich, wenn man verstehen muss, was in einem Feld zu sehen sein sollte | ✅ |
| Korngut et al. (2026), *Instrument & Calibration* | Instrument und Kalibrierung | Wird von IRSA als kanonisch zitiert. **Kennung nicht geprüft** | 🟡 |
| Doré et al. (2016), *Science Impacts of the SPHEREx All-Sky Survey* · arXiv:1606.07039 | Ursprünglicher wissenschaftlicher Fall | Kontext für den Pitch | ✅ (Kennung); 🟡 (Autorenschaft) |
| Lim et al. (2026), *SOLO: wide-field asteroid light curve monitoring system for SPHEREx* · arXiv:2602.08037 | Bodengestütztes System zur Unterstützung des SPHEREx-Katalogs der Objekte des Sonnensystems | **Sehr relevant**: erklärt, warum Lichtkurven nötig sind, um die Spektren von Asteroiden um die Rotation zu korrigieren | ✅ |

---

## 2. Das direkte Vorbild: WiseView, unWISE und Backyard Worlds

Das ist es, was die Challenge zu replizieren und zu übertreffen verlangt. **Wenn man nur einen Abschnitt liest, dann diesen.**

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| **WiseView** · Caselden, Westin et al. · ASCL:1806.004 · <http://byw.tools/wiseview> | Das Werkzeug, das die Challenge als Vorbild nennt | Blinken von WISE-Coadds im Browser, mit einstellbarem Stretch, Farbe und Geschwindigkeit. Hunderte Entdeckungen von Braunen Zwergen | ✅ |
| Lang (2014), *unWISE: unblurred coadds of the WISE imaging* · arXiv:1405.0308 | Die Coadds, die WiseView zeigt | **Vor dem Anzeigen kombinieren** macht schwache Quellen sichtbar | 🟡 |
| Meisner et al., *unWISE Coadds: The Five-year Data Set* · arXiv:1909.05444 | Erweiterte Coadds | Wie man aus einem Survey eine Zeitreihe aufbaut | ✅ (Kennung) |
| Schlafly et al. (2019), *The unWISE Catalog: Two Billion Infrared Sources* · arXiv:1901.03337 | Abgeleiteter Katalog | Größenordnung des Problems | ✅ (Kennung) |
| Meisner et al. (2022), *unTimely: a Full-sky, Time-Domain unWISE Catalog* · arXiv:2209.14327 | Zeitaufgelöster Katalog | **Der Schritt von «Bildern» zur «Zeitdomäne»**, was unser Problem ist | ✅ |
| Kuchner et al. (2017), *Backyard Worlds: Planet 9* | Das Bürgerwissenschafts-Projekt | Die soziale Begründung der Challenge. Freiwillige finden, was die Algorithmen des Surveys übersehen | 🟡 |
| **Cool Neighbors** (Zooniverse) · <https://www.zooniverse.org/projects/coolneighbors/backyard-worlds-cool-neighbors/> | Nachfolgeprojekt | Nutzt die API von WiseView, um sein Material zu erzeugen. **Beweis, dass ein Werkzeug mit abfragbarer URL zur Infrastruktur wird** | 📄 |

---

## 3. Visualisierung astronomischer Daten im Browser

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| Fernique et al. (2015), *Hierarchical progressive surveys (HiPS)* · arXiv:1505.02291 | Das HiPS-Format | Der Cube des gesamten Himmels von SPHEREx DR1 wird in HiPS veröffentlicht. Beschreibt außerdem, wie Aladin einen Cube Ebene für Ebene oder als Animation durchläuft | ✅ |
| Baumann et al. (2022), *Aladin Lite v3: Behind the Scenes of a Major Overhaul*, ADASS · 2022ASPC..532....7B | Der Viewer, den wir nutzen | Projektionen, FITS-Kacheln, Einbettung. Wird von der Challenge selbst zitiert | ✅ |
| **Aladin Lite — API** · <https://aladin.cds.unistra.fr/AladinLite/doc/API> | Referenzdokumentation | `createImageSurvey`, `getEmbedCode`, `getViewDataURL` | 📄 |
| **Firefly** (IPAC) · <https://github.com/Caltech-IPAC/firefly> | Die Engine des Data Explorer von IRSA | Das offizielle Notebook des HiPS-Cubes von SPHEREx nutzt sie | 📄 |
| **Astropy** · <https://docs.astropy.org> | FITS, WCS, Koordinaten, Visualisierung | `ZScaleInterval`, `AsinhStretch`, `ImageNormalize`, `SkyCoord`. **Implementiere nichts davon neu** | 📄 |

---

## 4. Erkennung sich bewegender Objekte (was wir NICHT implementieren werden, aber wissen müssen)

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| Whidden et al. (2019), *Enabling Deep All-Sky Searches of Outer Solar System Objects* · arXiv:1901.08549 | **KBMOD**: Shift-and-stack auf GPU | Der Stand der Technik, um zu finden, was in einem einzelnen Bild nicht zu sehen ist. ~10¹⁰ Trajektorien/Min. | ✅ |
| *Fast algorithms for slow moving asteroids* · arXiv:1901.02492 | Verwandte Arbeit | Einschränkungen zur Verteilung der Objekte des Kuipergürtels | ✅ (Kennung) |
| Smotherman et al. (2024), *Detecting Moving Objects With Machine Learning* · arXiv:2405.06148 | Aussortieren von KBMOD-Kandidaten | **Wo ML hier wirklich passt**: tausende Falsch-Positive filtern, nicht den Viewer ersetzen | ✅ (Kennung); 🟡 (Autorenschaft) |
| *DECam Ecliptic Exploration Project (DEEP) VI* · arXiv:2310.03678 | KBMOD auf einen echten Survey angewandt | 105 neue transneptunische Objekte; reale Rechenzeiten | ✅ |
| *Candidate Distant TNOs — New Horizons Subaru TNO Survey* · arXiv:2407.21142 | Eine weitere reale Verwendung von KBMOD | Schwellenwerte und Raten von Falsch-Positiven | ✅ (Kennung) |

---

## 5. Klassifikation in Echtzeit: ALeRCE (das eigene Terrain des Labors)

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| Förster et al. (2021), *The ALeRCE Alert Broker*, AJ · arXiv:2008.03303 | Der chilenische Alert-Broker von ZTF | **Vorteil des Teams.** Die Disziplin, in Echtzeit zu klassifizieren und einem Menschen zweifelhafte Kandidaten zu präsentieren, ist genau das, was einem Viewer fehlt | ✅ |
| Carrasco-Davis et al., *Stamp classifier* | CNN auf Ausschnitten von Wissenschaft/Referenz/Differenz, mit Rotationsinvarianz | **Das richtige «KI»-Modell für dieses Problem**, kein Video-Transformer: kleines Netz, auf Ausschnitten, mit von Hand gewählten Invarianzen | 🟡 |
| Sánchez-Sáez et al., *Light curve classifier* | Balancierter Random Forest auf zwei Ebenen über Variabilitätsmerkmale | Um echte Variabilität von Artefakten zu unterscheiden | 🟡 |
| *Temporal Stamp Classifier* · arXiv:2405.15073 | Version mit Zeitachse | Das Nächste an einem «Videomodell», das hier Sinn ergibt | ✅ (Kennung) |

---

## 6. Planet X: der reale Stand der Suche

| Ref | Was es ist | Warum es wichtig ist | Status |
|---|---|---|---|
| Batygin & Brown (2016), *Evidence for a Distant Giant Planet in the Solar System*, AJ 151, 22 · arXiv:1601.05438 · doi:10.3847/0004-6256/151/2/22 | Die moderne Hypothese von Planet Nine | Der Ursprung des Namens der Challenge | ✅ |
| Phan et al., Kandidat aus IRAS + AKARI, PASA | Ein einziges kompatibles Objekt in zwei infraroten Surveys im Abstand von 23 Jahren | **Die Technik ist genau die der Challenge.** Die Autoren betonen, dass sie Planet Nine nicht entdeckt haben | 🟡 (Kennung und Jahr ungeprüft) |
| *A targeted, parallax-based search for Planet Nine* · The Open Journal of Astrophysics · <https://astro.theoj.org/article/155004> | Gezielte optische Suche | Keine glaubwürdigen Kandidaten im abgedeckten Feld. Nützlich, um im Pitch nicht zu übertreiben | ✅ (Titel und Zeitschrift) |

**Für den Pitch:** Stand November 2026 wurde Planet Nine **nicht gefunden**. Niemals das Gegenteil behaupten.

---

## 7. Videomodelle (bewertet und als Kern verworfen)

Das vollständige Argument steht in [`../docs/01_ESTADO_DEL_ARTE.md`](../docs/01_ESTADO_DEL_ARTE.md) §6.
Sie werden aufgelistet, damit man der Jury präzise antworten kann.

| Ref | Was es ist | Status |
|---|---|---|
| Bertasius, Wang & Torresani (2021), *Is Space-Time Attention All You Need for Video Understanding?* (**TimeSformer**), ICML · arXiv:2102.05095 | In Raum und Zeit getrennte Attention über Patches von Einzelbildern | ✅ |
| Arnab et al. (2021), *ViViT: A Video Vision Transformer*, ICCV · arXiv:2103.15691 | Video-Transformer von Google Research | ✅ |
| Tong et al. (2022), *VideoMAE* · arXiv:2203.12602 | Maskierter Autoencoder für Video, dateneffizient | ✅ |
| *VideoMAE V2: Scaling Video Masked Autoencoders with Dual Masking* · arXiv:2303.16727 | Skalierte Version | ✅ |
| Ni et al. (2022), *Expanding Language-Image Pretrained Models for General Video Recognition* (**X-CLIP**) · arXiv:2208.02816 | Auf Video erweitertes CLIP | ✅ |

**Zusammenfassung, warum nicht:** Die Challenge verlangt einen Viewer, keinen Klassifikator; das Vortraining auf
natürlichem Video überträgt sich nicht auf astronomische Sequenzen; in 24 Stunden gibt es keine Labels; und die klassischen Methoden
nutzen die Physik des Problems. Wo ML etwas beitragen würde, ist das Aussortieren von Kandidaten, und
dafür ist das richtige Modell der *stamp classifier* von ALeRCE (Abschnitt 5), kein Video-Transformer.

---

## 8. Ressourcen der Partneragentur (CSA)

Sie zu nutzen bringt Punkte im Jurykriterium *Global Connection*.

| Ressource | URL |
|---|---|
| NEOSSat (Mission) | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> |
| NEOSSat — Python-Tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> |
| NEOSSat — Daten | <https://data.asc-csa.gc.ca/dataset/neossat> |
| Canadian Astronomy Data Centre | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> |

---

## Was noch zu suchen ist

Ehrlichkeit über die Grenzen dieser Durchsicht, durchgeführt am 14. Nov. 2026:

- Wir haben kein Paper von 2026 gefunden, das sich speziell der **Erkennung sich bewegender Objekte mit
  SPHEREx** widmet. Das Nächste ist der Katalog der Objekte des Sonnensystems, der im Missions-Paper beschrieben wird,
  und die Unterstützungsarbeit SOLO.
- Wir haben nicht bestätigt, ob der **Quellcode von WiseView** öffentlich ist. Die abgeleiteten Pakete
  (`flipbooks`, `unWISE-verse`) sind es. Siehe [`repos.md`](repos.md).
- **SIMBAD des CDS** antwortete am 14. Nov. nicht; die Koordinaten der Testfelder wurden gegen den Spiegel von Harvard (CfA)
  geprüft: siehe
  [`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml).
- Die mit 🟡 markierten Einträge brauchen jemanden, der die Quelle öffnet, bevor sie zitiert werden.
