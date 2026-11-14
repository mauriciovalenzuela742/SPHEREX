<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/00_DESAFIO.md) · [Español](../../es/docs/00_DESAFIO.md) · [中文](../../zh/docs/00_DESAFIO.md) · [Deutsch](../../de/docs/00_DESAFIO.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/00_DESAFIO.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 00 — La sfida: Planet X and SPHEREx

Fonte: <https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/>
Testo raccolto dalla pagina ufficiale il **14 novembre 2026**, schede *Details* e *Resources*.
Ciò che è in inglese è letterale; ciò che è in spagnolo e marcato `[NOTA]` è un nostro commento.

| Campo | Valore |
|---|---|
| Evento | 2026 NASA Space Apps Challenge |
| Difficoltà | **Advanced** |
| Materie | Astrophysics · Planets & Moons · Software |

---

## Riassunto

> Since 2025, NASA's SPHEREx mission has been mapping the entire sky every six months in 102 bands
> of near-infrared light, returning images of more than a billion objects. Comets, asteroids, stars,
> brown dwarfs, and even new planets reveal themselves by shifting position between images, but no
> one person can sift through all that data alone. Your challenge is to create a public-facing web
> tool to display images of the sky from SPHEREx mission, making it easy for anyone to quickly see
> how they change over time.

## Background

> Asteroids and comets orbit around the Sun. Nearby stars march across the sky as they orbit around
> the Galaxy. The Earth orbits the Sun too, causing objects near us to change their apparent
> positions. Watching for these motions help us discover new astronomical objects and also help
> measure the distances to these objects. For example, the dwarf planet Pluto was discovered when an
> astronomer compared two images of the sky taken at different times and recognized that one point
> of light had shifted between images.
>
> More recently, astronomers have mounted massive searches for nearby objects using this process
> with help from the public. Hundreds of thousands of volunteers have used this technique to
> discover asteroids, comets, stars and brown dwarfs—balls of gas too massive to be considered
> planets yet without enough mass to burn like stars. In fact, most of the known comets and brown
> dwarfs were discovered by volunteers in this manner through projects like backyardworlds.org.
>
> Since May 2025, NASA's new SPHEREx mission has been returning unique data that could yield new
> discoveries. SPHEREx is mapping the whole sky once every six months in 102 bands of near-infrared
> light, making it uniquely sensitive to objects that are rich in hydrogen, water, carbon dioxide,
> carbon monoxide, and many other molecules. There will be too much data for any one person or even
> computer code to completely comprehend. There will be images of more than a billion objects -
> including brown dwarfs, quasars, comets, asteroids, stars, supernovae and galaxies - which often
> overlap or vary in brightness. We need your creative new tools to make the most of this treasure
> trove and help as many people as possible pitch in to make discoveries.

## Objectives

> Your challenge is to create a public-facing web tool to display images of the sky from the SPHEREx
> mission, making it easy for anyone to quickly see how they change over time. Users will enter the
> coordinates of a patch of sky (Right Ascension and declination). Your tool will display a series
> of images of that patch like a little video, making it easy to spot moving objects.
>
> Test your tool on Barnard's Star, Epsilon Indi B (a pair of brown dwarfs orbiting a star),
> WISE 0855 (a fast-moving brown dwarf Right Ascension 08h55m10.831s, declination -7d14m42.53s),
> and variable stars RW Aurigae and R Draconis.

`[NOTA]` I cinque oggetti di prova sono sviluppati, con coordinate verificate in SIMBAD il
14 nov 2026 e con ciò che dovrebbe vedersi in ciascuno, in
[`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml). **Sono il criterio di accettazione de
facto**: se lo strumento si comporta bene nei cinque, è finito.

`[NOTA — IMPORTANTE]` **La coordinata che il testo dà per WISE 0855 è dell'epoca di WISE
(~2010,4), non la posizione attuale.** Verificato: quella coordinata coincide entro 0,2 arcsec con la
posizione dell'oggetto propagata al 2010,4, e l'oggetto si muove di 8,15 arcsec all'anno. A fine 2026
si trova a circa 130 arcsec da lì. Se si centra il visualizzatore sulla coordinata del testo con un campo di
0,05 gradi o meno, **l'oggetto resta fuori dal campo**. È, di gran lunga, il modo più probabile
perché la demo principale sembri non funzionare. Dettaglio e posizioni propagate nel file dei
campi di prova.

## Potential Considerations

> You may (but are not required to) consider the following:
>
> - New SPHEREx data is arriving fast! Make sure to design a tool that's easy to update with the
>   latest data releases.
> - Think creatively about how to display those 102 infrared bands so users can take advantage of
>   them to make new discoveries! For example, it may make sense to separately add together all the
>   data taken by each of the six detector arrays to improve the signal-to-noise in the images you
>   display. Extra kudos if your tool can generate spectra on the fly.
> - It may help users discover moving objects if they have the options to add together or subtract
>   images taken at different times.
> - Let users choose the field of view! Larger fields of view can make it possible to track
>   faster-moving sources, at the cost of longer data transfer times.
> - Users could benefit from having the option to overlay astronomical data from other telescopes,
>   such as the Gaia mission or the WISE mission.
> - If you make it possible to query your tool by including coordinates in the URL, users will be
>   able to easily embed it in other websites and projects.
> - It can be useful to display metadata, like contamination flags.
> - Consider looking for publicly available tools that may help in handling astronomical data, like
>   the Astrophy tools, and in displaying astronomical data, like the Aladin tool developed by the
>   Strasbourg Astronomical Data Center (CDS).

`[NOTA]` «Astrophy» è un refuso della pagina per **Astropy**.

`[NOTA]` Questi otto punti elenco sono, in pratica, la rubrica di differenziazione: sono ciò che l'autore
della sfida si aspetta che distingua un buon progetto. In [`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md)
sono tradotti in decisioni di prodotto, e in [`05_PLAN_24H.md`](05_PLAN_24H.md) in ordine di lavoro.

---

## Resources (scheda *Resources*, letterale)

> NASA does not endorse any non-U.S. Government entity and is not responsible for information
> contained on non-U.S. Government websites. For non-U.S. Government websites, participants must
> comply with any data use parameters of that specific website.

### NASA Data & Resources

| Risorsa | URL | Descrizione ufficiale |
|---|---|---|
| NASA/IPAC Infrared Science Archive | <https://irsa.ipac.caltech.edu/Missions/spherex.html> | SPHEREx resources |
| SPHEREx Tutorial Notebooks | <https://caltech-ipac.github.io/irsa-tutorials/spherex/> | Example Jupyter notebooks for how to access the SPHEREx data via Python |
| WiseView | <http://byw.tools/wiseview> | A similar tool made for viewing data from an earlier NASA mission called WISE. It's been used by the public to make hundreds of discoveries. Feel free to use it as a model or as inspiration! |
| Gaia Mission Data | <https://archive.stsci.edu/missions-and-data/gaia> | Be sure to use the latest data release (Data Release 3) |

### Space Agency Partner Resources — CSA (Canadian Space Agency)

| Risorsa | URL | Descrizione ufficiale (riassunta) |
|---|---|---|
| NEOSSat: Observing Asteroids, Space Debris and Exoplanets | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> | Il primo telescopio spaziale dedicato a rilevare e seguire asteroidi, comete, satelliti e detriti spaziali |
| Canadian Astronomy Data Centre (CADC) | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> | Archivio di osservazioni astronomiche di telescopi e missioni canadesi e internazionali |
| NEOSSat Data Tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> | Tutorial in Python per visualizzare i dati di NEOSSat |
| NEOSSat Dataset | <https://data.asc-csa.gc.ca/dataset/neossat> | Osservazioni di NEOSSat |

> For data and resources related to this challenge, refer to the Resources tab at the top of the
> page. More resources may be added before the hackathon begins.

`[NOTA]` La pagina avverte che possono essere aggiunte risorse. **Torna a guardare la scheda Resources
all'inizio dell'evento** e, se è cambiata, aggiorna questo file: è la fonte di verità del team.

---

## Lettura della sfida (commento del team)

Tre cose che non sono dette per esteso ma si deducono dal testo:

1. **Il prodotto è un visualizzatore, non un rilevatore.** «Make it easy for anyone to quickly see» e «like a
   little video, making it easy to spot moving objects». Chi rileva è l'utente umano. Un
   classificatore automatico può aggiungere valore, ma se sostituisce il visualizzatore, il progetto non risponde alla sfida.

2. **Il pubblico di riferimento è chiunque, non un astronomo.** La sfida cita backyardworlds.org, un
   progetto di scienza partecipata con centinaia di migliaia di volontari. Questo comanda sul design:
   la prima schermata deve funzionare senza sapere cos'è un'ascensione retta.

3. **Le 102 bande sono l'angolo proprio di SPHEREx.** WiseView esiste già e fa il blink su WISE.
   Ciò che nessuno ha ancora fatto per il grande pubblico è il blink **più** l'asse spettrale:
   che l'utente veda non solo che qualcosa si muove, ma di cosa è fatto. Il punto «extra kudos if
   your tool can generate spectra on the fly» è l'indizio più esplicito della sfida.
