---
title: "SPHEREx 数据告诉了我们什么"
author: SPHEREx 团队 · NASA Space Apps 2026
date: 2026-11-14
place: Santiago
profile: night
lang: es
transition: fade
audience: 黑客松团队（6 人）。一位没有天文基础的成员，一位程序员，其余有天文背景。
message: 最快的恒星在 SPHEREx 的一年里只移动 1–2 个像素；我们通过匹配波长、对齐和相减让它变得可见。
---

<!-- i18n-header -->
> 🌐 **语言:** [English](../../../en/docs/presentacion_eda/script.es.md) · [Español](../../../es/docs/presentacion_eda/script.es.md) · **中文** · [Deutsch](../../../de/docs/presentacion_eda/script.es.md) · [Italiano](../../../it/docs/presentacion_eda/script.es.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/presentacion_eda/script.es.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

<!-- Todas las cifras salen de docs/09_EDA_HALLAZGOS.md y eda/resultados/. Las imágenes son recortes reales de
     IRSA, procesados por figures/make_figures.py. Los valores de animations.js se copiaron de su salida. -->

## SPHEREx 数据告诉了我们什么
@type cover
@class full
@anim portada
@subtitle 基于 IRSA 真实数据的 EDA · 2026 年 11 月 14 日
> 右边的图像是真实的：褐矮星 Epsilon Indi B 在 2025 到 2026 年间的五张 SPHEREx 照片。在讲座结束时我们会看到，它恰好移动了它应该移动的量。
@why 封面就展示了讲座要解释的真实数据：一个移动天体的闪烁。

## 挑战的思路：比较同一片天空在不同日期的照片
@kicker 思路
@class full
@anim idea
@steps 1
@source 示意图，不是真实数据。1930 年冥王星就是这样被发现的，Backyard Worlds 的志愿者也是这样工作的。
> 先是闪烁：同一片天区的两张照片交替显示。几乎一切都静止；只有一颗恒星跳动。然后是相减：不变的东西消失，移动过的东西留下一对，红色在它现在的位置，蓝色在它之前的位置。
@why 在展示真实数据之前，先用示意图为不了解这个问题的人解释方法。闪烁和相减是查看器的两种视图。

## SPHEREx 在红外波段观测，在红色之外，有 6 个探测器
@kicker 仪器
@figure figures/bandas.svg
@source 各探测器的范围：IRSA 文档（docs/02_DATOS_SPHEREX.md §1）。一微米（µm）是千分之一毫米。
> 人眼能看到 0.4 到 0.75 微米之间。SPHEREx 从红色结束的地方开始，一直到 5。它把这个范围分成 6 个探测器，D1 到 D6。冷的褐矮星主要在长波探测器中发光。
@why 为没有天文基础的观众定位：红外就是“红色之外”，而六个探测器是之后工作的单位。

## SPHEREx 的诀窍：它测量的颜色沿着探测器变化
@kicker 线性可变滤光片
@class full
@anim lvf
@steps 5
@source 示意图。探测器 5 的真实范围（3.82–4.44 µm）来自 WCS-WAVE 表；光谱上的点仅为示意。
> 探测器的每一条带测量不同的颜色。飞船重新指向，恒星落在另一条带上：于是它被测量为另一种颜色。把这些照片合在一起，就构成了它的光谱。但这意味着同一颗恒星的两张照片几乎从不在同一种颜色上。
@why 这是一种变换（探测器移动，点的颜色改变），静止的图无法讲述它：满足动画的四个条件。

## 每颗恒星有数百张照片，分布在一年的 3 或 4 次扫描中
@kicker 有多少数据
@figure figures/cobertura.svg
@source 对 spherex_dr1 和 spherex_qr3 的 SIA2 查询（eda/resultados/inventario.json）。R Dra 在深场中另有 1,966 个文件，未画出。
> 每个点是一个文件。可以看到扫描：SPHEREx 每六个月经过每个区域一次，并且每次经过时在几周内拍摄几十张照片。时间基线从 1 到 1.4 年。
@why 在同一时间轴上的小多图：五个天区一眼就能比较。

## 但每张照片处于不同的颜色：必须挑选相匹配的
@kicker 第一个问题
@figure figures/lambda_wise.svg
@source WISE 0855，探测器 5：天体在每个文件中所处的颜色，用每个文件的头和 WCS-WAVE 表计算（eda/resultados/lambda_por_archivo.csv）。
> 如果取每次扫描的第一张照片，颜色会跳动近半微米：亮度会在没有任何事情发生的情况下改变。但每种颜色每六个月都会重复，所以我们可以挑选同一颜色的照片：变化降到 0.035 微米。
@why 强调色给好的选择；差的用红色，背景信息用灰色。

## 探测器在两次扫描之间旋转 180°：比较之前必须先对齐
@kicker 第二个问题
@class full
@anim giro
@steps 1
@source Barnard（D2）两个未对齐的真实裁切图。从头中读取的探测器在天空上的角度：−179.6° 和 +1.1°。
> 两张照片是同一片天区，但右边的那张是颠倒的。把它旋转 180° 后，同样的恒星就重合了。在代码中，这是通过把所有东西重投影到北向上的网格来完成的。
@why 旋转是一种变换：看着它旋转比两张带箭头的图像更有说服力。

## 对齐并处于同一颜色后，Epsilon Indi B 恰好移动了星表所预测的量
@kicker 结果
@class full
@anim epsind
@steps 1
@source 第一张和最后一张照片（2025.31 和 2026.74）中的质心，重投影到同一网格（eda/resultados/centroides.json）。预测：SIMBAD 的自行。放大：18×18 个 6.15″ 的像素。
> 圆圈是星表所说的它在每个日期应该在的位置。它向左下移动，在天空中是东和南。我们测得 0.85 和 0.71 个像素；星表预测 0.92 和 0.57。周围不动的恒星，位移不到 0.4。
@why 先给出真实数据，再给规则，并且数值检验与图像放在同一张幻灯片上。

## 相减把运动变成一对红和蓝，但饱和的恒星会骗人
@kicker 相减
@class full
@anim restas
@steps 2
@source 最后一张 − 第一张的相减，已归一化。核心被标记为坏像素：Barnard 49 个中的 44 个，RW Aur 6–8 个，eps Ind B 0–1 个（eda/resultados/centroides.json）。
> Epsilon Indi B：红蓝一对是真实的运动。Barnard：它也在移动，朝北，但它饱和了，无法测量。RW Aur 没有移动，却仍然留下一对：这是饱和的效应。查看器必须提示何时某个天体饱和。
@why 每一步揭示一个面板（分段），以便用同一种颜色编码比较这三种情况。

## WISE 0855 在单张照片中几乎看不到：要展示它必须叠加
@kicker 一个困难的案例
@class full
@anim wise
@source 探测器 5 中 WISE 0855 在同一 λ（4.15–4.18 µm）的四个真实裁切图。圆圈是预测的位置。
> 题面提出的这个天体对单次曝光来说太暗了。解决办法是把每次扫描的照片叠加起来，这恰好是挑战所建议的思路之一。
@why 在几张动画幻灯片之后放一张静止的：这里展开讨论演示中该展示什么。

## 每个裁切图需要 7 秒，而浏览器无法请求它：一切都经过带缓存的后端
@kicker 面向代码
@figure figures/latencia.svg
@source 25 个 0.1° 的裁切图（eda/resultados/latencia_cutouts.json）：中位数 7.3 s，最大 29 s，每个约 3.9 MB。IRSA 不返回 CORS（eda/resultados/infraestructura.json）。
> 裁切图无论大小都一样重，因为它把恒星图像的描述整个带来。出现过 503 错误。而且 IRSA 不允许网页直接向它请求数据。结论：后端、磁盘缓存，并预热演示用的天区。
@why 展示完整分布，而不只是中位数：可以看到 29 秒的长尾，它会让一次现场演示崩溃。

## 质量掩膜：SOURCE 位不是错误
@kicker 过滤器
@figure figures/flags.svg
@source 25 个裁切图中 FLAGS 的位。名称就在 FLAGS 扩展本身的头中。
> 如果我们过滤“任何带有某个位的东西”，会删掉图像的 72 %，因为 SOURCE 只是说那里有一颗恒星。真正表示像素坏的位加起来约为 4 %。
@why 蓝色强调标出不是错误的那一种；红色是使像素无效的位。

## 从头到尾七个部分，每个都有其负责人
@kicker 分工
@class full
@anim flujo
@steps 1
@source 团队计划的分工（README §3、docs/05_PLAN_24H.md）；EDA 按角色的任务见 docs/10_REPARTO_DE_TRABAJO.md。
> 首先是数据的路径，从坐标到屏幕上的图像。然后是谁负责每个部分，依据我们已经商定的计划：EDA 给 D2 增加了更多工作，D2 接手按 λ 选择、过滤器和相减。
@why 分工是在数据流上阅读的：每个人都能看到自己的部分在哪里、与谁相连。

## 我们仍然不知道的
@kicker 待讨论
- **移动的天体在立方体中是什么样子？** Aladin 加载的 HiPS 立方体混合了所有历元。
- **叠加之后 WISE 0855 能改善多少？** 即叠加一次扫描的照片。
- **查看器如何处理饱和的恒星？** 提醒、显示掩膜，或者换一个探测器。
- **亮度：** 我们仍然没有测量 RW Aur 和 R Dra 的变光。
@source docs/09_EDA_HALLAZGOS.md §7。
> 请记住：最快的恒星在一年里移动一到两个像素；我们通过匹配颜色、对齐和相减让它变得可见。
@why 以未解决的问题和核心信息收尾，而不是“谢谢”。

## 来源
@appendix
- 数据：IRSA/IPAC，SIA2 集合 spherex_dr1 和 spherex_qr3，查询于 2026 年 11 月 14 日。
- 自行：SIMBAD（CfA 镜像），位于 data/campos_de_prueba.yml。
- 脚本：eda/01_inventario.py 到 eda/05_centroides.py；图：docs/presentacion_eda/figures/make_figures.py。
- 署名：This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
@why 每个数字的出处，便于重新计算。
