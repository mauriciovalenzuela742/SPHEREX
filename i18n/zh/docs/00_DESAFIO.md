<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/00_DESAFIO.md) · [Español](../../es/docs/00_DESAFIO.md) · **中文** · [Deutsch](../../de/docs/00_DESAFIO.md) · [Italiano](../../it/docs/00_DESAFIO.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/00_DESAFIO.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 00 — 挑战:Planet X and SPHEREx

来源:<https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/>
文本摘自官方页面,时间为 **2026年11月14日**,取自 *Details* 和 *Resources* 两个标签页。
英文部分为原文照录;用中文书写并标有 `[NOTA]` 的是我们自己的评注。

| 字段 | 值 |
|---|---|
| 活动 | 2026 NASA Space Apps Challenge |
| 难度 | **Advanced** |
| 学科 | Astrophysics · Planets & Moons · Software |

---

## 摘要

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

`[NOTA]` 这五个测试天体已展开说明,坐标于 2026年11月14日 在 SIMBAD 中核实,并说明了每个天体应当看到什么,见
[`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml)。**它们是事实上的验收标准**:
如果工具在这五个上表现良好,它就完成了。

`[NOTA — IMPORTANTE]` **题目为 WISE 0855 给出的坐标属于 WISE 的历元
(约 2010.4),并不是当前位置。** 已核实:该坐标与天体传播到 2010.4 的位置在 0.2 arcsec 以内相符,
而该天体每年移动 8.15 arcsec。到 2026 年底,它距那里约 130 arcsec。如果把查看器居中在题目给出的坐标上,
且视场为 0.05 度或更小,**天体就会落在视场之外**。这无疑是
主演示看起来无法工作的最可能原因。详细说明和传播后的位置见测试天区文件。

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

`[NOTA]` 「Astrophy」是页面上的笔误,应为 **Astropy**。

`[NOTA]` 这八条在实践中就是区分度的评分细则:它们是题目作者
期望用来区分一个好项目的东西。在 [`06_JURADO_Y_PITCH.md`](06_JURADO_Y_PITCH.md)
中它们被转化为产品决策,在 [`05_PLAN_24H.md`](05_PLAN_24H.md) 中被转化为工作顺序。

---

## Resources(*Resources* 标签页,原文)

> NASA does not endorse any non-U.S. Government entity and is not responsible for information
> contained on non-U.S. Government websites. For non-U.S. Government websites, participants must
> comply with any data use parameters of that specific website.

### NASA Data & Resources

| 资源 | URL | 官方描述 |
|---|---|---|
| NASA/IPAC Infrared Science Archive | <https://irsa.ipac.caltech.edu/Missions/spherex.html> | SPHEREx resources |
| SPHEREx Tutorial Notebooks | <https://caltech-ipac.github.io/irsa-tutorials/spherex/> | Example Jupyter notebooks for how to access the SPHEREx data via Python |
| WiseView | <http://byw.tools/wiseview> | A similar tool made for viewing data from an earlier NASA mission called WISE. It's been used by the public to make hundreds of discoveries. Feel free to use it as a model or as inspiration! |
| Gaia Mission Data | <https://archive.stsci.edu/missions-and-data/gaia> | Be sure to use the latest data release (Data Release 3) |

### Space Agency Partner Resources — CSA (Canadian Space Agency)

| 资源 | URL | 官方描述(摘要) |
|---|---|---|
| NEOSSat: Observing Asteroids, Space Debris and Exoplanets | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> | 首个专门用于探测和跟踪小行星、彗星、卫星和太空碎片的空间望远镜 |
| Canadian Astronomy Data Centre (CADC) | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> | 加拿大及国际望远镜和任务的天文观测档案 |
| NEOSSat Data Tutorial | <https://github.com/asc-csa/NEOSSAT_Tutorial> | 用于可视化 NEOSSat 数据的 Python 教程 |
| NEOSSat Dataset | <https://data.asc-csa.gc.ca/dataset/neossat> | NEOSSat 的观测数据 |

> For data and resources related to this challenge, refer to the Resources tab at the top of the
> page. More resources may be added before the hackathon begins.

`[NOTA]` 页面提醒说可能会添加资源。**活动开始时请重新查看 Resources 标签页**,
如果有变化,就更新本文件:它是团队的事实来源。

---

## 对挑战的解读(团队评注)

有三件事没有明说,但可以从文本中推断出来:

1. **交付物是一个查看器,不是一个检测器。**「Make it easy for anyone to quickly see」和「like a
   little video, making it easy to spot moving objects」。做检测的是人类用户。自动
   分类器可以加分,但如果它取代了查看器,项目就没有回应挑战。

2. **目标受众是任何人,而不是天文学家。** 挑战引用了 backyardworlds.org,一个拥有数十万志愿者的
   公民科学项目。这决定了设计:
   第一个屏幕必须在不懂赤经是什么的情况下也能使用。

3. **102 个波段是 SPHEREx 自己的切入点。** WiseView 已经存在,并在 WISE 上做 blink。
   迄今还没有人为大众做到的,是 blink **加上**光谱轴:
   让用户不仅看到某个东西在移动,还看到它是由什么构成的。「extra kudos if
   your tool can generate spectra on the fly」这一条是挑战中最明确的提示。
