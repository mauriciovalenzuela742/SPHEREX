<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/02_DATOS_SPHEREX.md) · [Español](../../es/docs/02_DATOS_SPHEREX.md) · **中文** · [Deutsch](../../de/docs/02_DATOS_SPHEREX.md) · [Italiano](../../it/docs/02_DATOS_SPHEREX.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/02_DATOS_SPHEREX.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 02 — SPHEREx 数据：在哪里、如何请求

技术说明。此处所有内容均取自 IRSA/IPAC 的官方文档，查阅日期为 **2026 年 11 月 14 日**，但标有 `[RAZONAMIENTO]` 的除外，那是我们自己的推断，需要用数据核实。

主要来源：

- 任务页面：<https://irsa.ipac.caltech.edu/Missions/spherex.html>
- 访问指南：<https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access>
- 产品指南：<https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products>
- Cutouts：<https://irsa.ipac.caltech.edu/data/SPHEREx/docs/cutout_tool.html> 和 <https://irsa.ipac.caltech.edu/ibe/cutouts.html>
- Notebooks：<https://caltech-ipac.github.io/irsa-tutorials/spherex/>

---

## 1. 数字中的任务

| 数据 | 值 |
|---|---|
| 计划寿命 | 2025 – 2027 |
| 覆盖 | 100 % 的天空，每约 6 个月完成一次完整扫描 |
| 范围 | 0.75 – 5.0 µm（近红外） |
| 光谱通道 | 102 |
| 探测器 | 6 个阵列（3 个短波、3 个长波，由二向色镜分开） |
| 仪器 | 带有宽视场**线性可变滤光片（LVF）**的成像光谱仪 |

每个波段的光谱分辨率（这决定了哪个探测器适用于什么）：

| 波段 / 探测器 | 波长 | R |
|---|---|---|
| 1 | 0.75 – 1.09 µm | 39 |
| 2 | 1.10 – 1.62 µm | 41 |
| 3 | 1.63 – 2.41 µm | 41 |
| 4 | 2.42 – 3.82 µm | 35 |
| 5 | 3.83 – 4.41 µm | 112 |
| 6 | 4.42 – 5.00 µm | 128 |

---

## 2. 决定项目的细节：SPHEREx 如何获得光谱

SPHEREx 没有离散的滤光片。它有一个**线性可变滤光片**：波长沿探测器的一个轴连续变化。用 IRSA 文档的话说：

> SPHEREx obtains spectra through multiple exposures, placing a given source at multiple positions
> in the field of view, where it is measured at multiple wavelengths by repointing the spacecraft.

也就是说：**一个源的光谱是通过多次观测它来构建的，每次落在探测器的不同位置，因此每次的波长都不同。**

`[RAZONAMIENTO]` 这对本挑战的影响很大，从第 0 小时起就应该清楚。如果取出覆盖天空某个位置的所有 2 级图像，将它们裁切并依次播放，**得到的不是干净的 blink，而是一个序列，其中每个源的亮度会跳变，因为每一帧都处于不同的波长。** 一颗红色恒星会在某些帧里很亮、在另一些帧里很暗，而它本身并没有变化。这恰恰破坏了挑战想要展示的东西：真正移动的和真正变化的东西。

三种可能的解决办法，按成本排序：

1. **在做 blink 之前按波段/探测器分组。** 视频中的每一帧是同一个波段（例如探测器 4）在不同历元的图像。在一个波段内波长仍然会变化，但小得多。这是对挑战要点的字面解读：*«it may make sense to
   separately add together all the data taken by each of the six detector arrays»*。
2. **使用 `WCS-WAVE` 扩展按波长分组**，它给出每个像素的中心 λ。更正确，也更昂贵。
3. **归一化每一帧**（在同一裁切图上使用稳健百分位数），使电平跳变不占主导。这是视觉上的补丁，而不是物理上的解决方案，但在 24 小时内它可能是拯救演示的东西。

> **已于 11 月 14 日核实（[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) §2）：** 仅按探测器分组**并不能**使 λ 匹配（在一个探测器内变化约 16 个带宽）。必须选择 λ 匹配的历元；这很便宜，因为 λ 可由 `WCS-WAVE` 通过约 35 KB 的 HTTP Range 请求得到。

**这需要在赛事第 1 小时用真实数据核实**，而不是讨论。下载同一天区的 cutouts，读取每个的 `WCS-WAVE`，看看各历元之间 λ 变化多少。

---

## 3. 目前有哪些数据版本

根据 IRSA 任务页面的发布时间线：

| 日期 | 发布内容 |
|---|---|
| 2025 年 7 月 | 首批 Quick Release（QR1）产品 |
| 2025 年 10 月 | QR2（重新处理） |
| 2026 年 4 月 10 日 | 修正 QR2 的 PSF 扩展头中的错误 |
| 2026 年 9 月 | QR3 |
| **2026 年 11 月** | **Data Release 1（DR1）** |

**DR1 和 QR3 共同取代 QR2。** QR2 在 2027 年 2 月之前仍可直接下载，但已无法通过 SIA2 检索。

> **DR1 刚刚发布，就在本月。** 很可能没有其他团队用过它，而且几乎可以肯定，网上流传的教程和示例仍然指向 QR2。这既是项目最大的机遇，也是最大的风险。见 [`07_RIESGOS.md`](07_RIESGOS.md)。

---

## 4. 四种访问途径

IRSA 从两个地方提供数据：IPAC（“on-premises”）和 AWS S3。共有四层访问方式。

### 4.1 可浏览的目录

根目录：<https://irsa.ipac.caltech.edu/ibe/data/spherex/>

每个 release 一个子目录：`dr1`、`qr3`、`qr2`。2 级 MEF 位于：

```
level2/[Planning Period]/l2b-v[Version]-[Processing Date]/[Detector]/
```

全天空立方体（仅 DR1）：

```
hips5_cube/hips_20261026/Norder5/Dir[Directory Number]/
```

适合批量 `wget`/`curl` 以及了解组织结构。**不能按坐标搜索**：那是 SIA2 的用途。

### 4.2 SIA2（Simple Image Access v2，IVOA 标准）— 主要途径

通用 endpoint：

```
https://irsa.ipac.caltech.edu/SIA?
```

必须添加 `COLLECTION`。SPHEREx 的五个集合：

| COLLECTION | 包含内容 |
|---|---|
| `spherex_dr1` | DR1 光谱图像 MEF，**宽**扫描（全天空均匀覆盖） |
| `spherex_dr1_deep` | **深场**的 DR1 MEF |
| `spherex_dr1_cube` | DR1 全天空立方体 |
| `spherex_qr3` | QR3 MEF，宽扫描 |
| `spherex_qr3_deep` | QR3 MEF，深场 |

**要搜索某个位置所有现行有效的光谱图像，必须查询 `spherex_dr1` 和 `spherex_qr3`**（若需要深场则还有 `_deep`）。QR2 无法检索。

IRSA 文档中已验证的示例：

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO`，单位为度。响应格式：`HTML` 用于肉眼查看，默认的 VOTable 用于处理。

返回的表中，有两列对我们很重要：

- `access_url` — 档案文件在 IPAC 的下载 URL。**请求 cutout 时使用的就是它。**
- `cloud_access` — 从 AWS S3 读取同一文件的信息。

官方文档的两条警告：

- **校准**文件不在 SIA2 中；需从可浏览目录下载。
- 数据**每周**摄入一次，通过 SIA2 的可用性**比**目录、Data Explorer 和某些 TAP 查询**晚一天**。

### 4.3 Cutouts — 真正让查看器可行的东西

一个完整的 MEF 大约重 **70 MB**。为了显示 0.1° 的裁切图而下载 15 个完整历元，在黑客松和公共工具中都不可行。

cutout 服务通过**在文件的 URL 上添加参数**来调用：

```bash
curl -o cutout.fits "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W21_2A/l2b-v27-2026-268/1/level2_2026W21_2A_0001_2D1_spx_l2b-v27-2026-268.fits?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC`，十进制度。
- `size`，单位为度。
- 完整参数：<https://irsa.ipac.caltech.edu/ibe/cutouts.html>

重要限制：**cutouts 仅适用于托管在 IPAC 的文件**，不适用于 AWS 上的副本。

裁切后的 MEF 保留相同的扩展。`IMAGE`、`FLAGS`、`VARIANCE` 和 `ZODI` 会被裁切；`WCS-WAVE` 会随裁切调整；**PSF 扩展保持不变**，仍是整幅原始图像的 PSF。

### 4.4 Python

```bash
pip install pyvo astroquery astropy
```

`pyvo` 和 `astroquery` 封装了 SIA2。IRSA 官方 notebooks 是最短的路径：

| Notebook | 用途 |
|---|---|
| Data Overview | 找到覆盖某位置的图像并理解 MEF |
| Spectral Image Cutouts | 生成 cutouts 并将它们打包成新的 MEF |
| PSF Models | PSF 的组织方式 |
| Source Discovery Tool | 发现并提取源 |
| Mosaic Cube | 分析 Mosaic Tool 的立方体 |
| HiPS All-Sky Cube | 在 Firefly 中浏览 HiPS 立方体并快速提取光谱 |

索引：<https://caltech-ipac.github.io/irsa-tutorials/spherex/>

此外还有 **`spxquery`**（v0.4.1），PyPI 上的第三方包，可自动完成查询、带 cutout 的下载、扣除黄道光的孔径测光、合并为 3D 立方体（“Drizzle3D”）以及光变曲线：<https://spxquery.readthedocs.io>。它是与数据侧需要构建的东西最相似的部分。**写任何东西之前建议先看一下**：即使不使用，它的四阶段架构和质量控制也是很好的地图。

---

## 5. 文件内部有什么

主要产品是 **2 级 Spectral Image MEF**。**每次指向有 6 个**（每个探测器一个），每个约 70 MB，图像为 **2040 × 2040** 像素。

| HDU | 名称 | 内容 |
|---|---|---|
| 1 | `IMAGE` | 校准后的表面亮度，单位 MJy/sr。**未扣除黄道光** |
| 2 | `FLAGS` | 每像素位图：状态和处理情况。Explanatory Supplement 的表 16 |
| 3 | `VARIANCE` | 亮度方差，单位 (MJy/sr)² |
| 4 | `ZODI` | 黄道光模型，单位 MJy/sr。**如果需要，必须自己扣除** |
| 5 | `EPSF`（DR1/QR3）或 `PSF`（QR2） | 按探测器区域划分的有效 PSF |
| 6 | `WCS-WAVE` | 将像素映射到中心波长和带宽的表 |

能节省数小时的说明：

- **`FLAGS` 是对挑战中关于“contamination flags”这一要点的直接回应。** 在界面中显示它们成本很低，也正是挑战作者所要求的。
- **黄道光未被扣除。** 对查看器来说，从 `IMAGE` 中减去 `ZODI` 能大大改善暗弱源的对比度。这只需一行代码，还是一个卖点。
- **`WCS-WAVE` 使用了 FITS 标准中不常见的一部分**，据 IRSA 称，“并非所有读取器都已实现”。如果你的 FITS 客户端不识别它：找出最近的四个控制点并做双线性插值，精度约 1 nm。**该精度仅用于可视化。** 科研用途则需使用 Spectral WCS 校准产品中的 `CWAVE` 和 `CBAND` 扩展。
- **像素约定。** FITS 头是 1-based；Astropy 返回 0-based。IRSA 在处理 PSF 时明确提示了这一点。这是一像素偏移的经典来源。
- **并非所有观测都带有 6 个波段**：质量按波段评估，有些波段不会进入档案库。代码必须容忍缺失的波段。

### 文件名

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

示例：`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits`

拆解：

- `2025W18_2B` — **planning period**：上传到飞船的飞行计划，涵盖约 3.5 天的运行。
- `0001` — *large slew* 计数器。
- `1` — *small slew* 计数器（1 到 4；有些 large slew 不足 4 个）。
- `D1` — 探测器 1。
- `v12-2025-164` — 版本和处理日期（年 + 一年中的第几天）。

`[RAZONAMIENTO]` 为视频按时间排序的是 *observation ID*。最好不要信任文件名而去读取头中的日期，但为了快速排序它够用。

### 全天空立方体（仅 DR1）

DR1 带有一个 **All-Sky Cube**：在空间和光谱上插值的全天空马赛克，102 个通道每个一幅。它有**两个版本**（11 月 14 日核实，见 [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)）：

1. **SIA2 提供的版本**（`COLLECTION=spherex_dr1_cube`，目录 `hips5_cube/hips_20261026/Norder5/`）：
   512×512×102 的 FITS 瓦片，每个约 320 MB。cutout 服务会拒绝它们（422/503），Aladin 也不使用它们。对查看器没用。
2. **面向浏览器的 HiPS**，位于 `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`：
   **PNG** 瓦片，order 5，102 个平面（第 50 和 51 个为空），像素 12.9″，CORS 开放。
   **这是 Aladin Lite 3.8.2 无需后端即可加载的版本。** 它是所有历元的马赛克（没有时间轴），并且是已拉伸的 PNG（没有流量）。

能在没有后端的情况下在 Aladin 中显示，是路径 A 在这次挑战中最好的技术消息。见 [`03_ARQUITECTURA.md`](03_ARQUITECTURA.md)。

注意不要混淆这两个产品，因为它们回答的是不同的问题：

| | 2 级图像 | 全天空立方体 |
|---|---|---|
| 提供的轴 | **时间**（许多历元） | **波长**（102 个通道） |
| 用途 | blink，检测运动 | 背景以及作为图像的 102 个波段（无流量的 PNG：**不**能用于光谱） |
| 分辨率 | 探测器原生 | HEALPix order 5（粗） |
| 可用于 | DR1、QR3（以及可下载的 QR2） | **仅 DR1** |

**挑战所要求的查看器两者都需要。** 时间来自 2 级；作为图像的 102 个波段来自立方体。光谱（流量对 λ）来自 2 级文件或 IRSA 的 Spectrophotometry Tool，而不是来自立方体（[`10_REPARTO_DE_TRABAJO.md`](10_REPARTO_DE_TRABAJO.md)）。

---

## 6. IRSA 已有的工具

在构建任何东西之前，先看看 IRSA 是否已经做过。它们都从任务页面链接。

| 工具 | 作用 | 对我们为何重要 |
|---|---|---|
| **SPHEREx Data Explorer** | 用于搜索、可视化和下载的网页界面 | 它就是“竞争对手”。看看它是为了知道不该做什么：它是为天文学家设计的 |
| **MOST**（Moving Object Search Tool） | 计算太阳系天体的轨道，并找出在每个历元覆盖其预测位置的 SPHEREx 图像 | 与小行星和彗星直接相关。一个“追踪这颗小行星”的标签页几乎是白送的 |
| **Spectrophotometry Tool** | 通过强制测光从图像中提取光谱 | 是 IRSA 对挑战中“spectra on the fly”的回答 |
| **Mosaic Tool** | 定制的多波段马赛克 | |
| **Cutout Tool** | MEF 的裁切图 | 上文已描述 |
| **Source Discovery Tool** | 在无需先验位置的情况下识别并表征一个区域中的源 | 如果想在图像上标出源 |
| **Cloud Data Access** | AWS S3 上的同样数据 | 用于重度处理 |
| **Comet 3I/ATLAS** | 星际彗星的光谱图像专用集合 | 现成的、有噱头的演示素材 |

`[RAZONAMIENTO]` 3I/ATLAS 集合值得花一分钟关注：它是一个移动很快的天体，很新，而且公众熟悉它。对于两分钟演示，它比任何褐矮星都更有价值。

---

## 7. 其他任务的数据（叠加层）

挑战建议允许叠加其他望远镜的数据。

| 任务 | 访问方式 | 提供什么 |
|---|---|---|
| **Gaia DR3** | <https://archive.stsci.edu/missions-and-data/gaia>，或 `astroquery.gaia`，或 Aladin 中 CDS 的 HiPS 星表 | 极其精确的位置、自行和视差。可以**预测一颗恒星在每个历元应该在哪里**，并检验查看器是否正确 |
| **WISE / NEOWISE** | IRSA；unWISE 在 <https://unwise.me> | 显而易见的对比：WISE 上的 blink 就是 WiseView 所做的 |
| **NEOSSat**（CSA） | <https://data.asc-csa.gc.ca/dataset/neossat>，教程在 <https://github.com/asc-csa/NEOSSAT_Tutorial> | 合作机构的资源。使用它可在 *Global Connection* 标准上加分 |
| **SIMBAD / VizieR**（CDS） | <https://simbad.cds.unistra.fr> | 将名称（“Barnard's Star”）解析为坐标。**让任何人都能使用该工具所必需的** |

`[RAZONAMIENTO]` Gaia 不仅仅是视觉装饰：它是查看器的**质量控制**。如果在图像上绘出 Gaia 对该恒星在该历元日期所预测的位置，并且它与亮点吻合，就证明了 WCS、日期和裁切图都是对的。这是向评审证明工具正确（而不仅仅是好看）最便宜的方式。

---

## 8. 强制署名

IRSA 要求在任何使用 SPHEREx 数据的已发布材料中包含这段说明：

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

**放在工具的页脚和 README 中。** 这是在 NASA 评审面前白拿的严谨分，只需三十秒。

IRSA 要求引用的经典论文：Bock et al.（2026）关于任务，Akeson et al.（2026）关于流水线，Crill et al.（2025）关于天空模拟器，Korngut et al.（2026）关于仪器和校准。详情见 [`../biblio/README.md`](../biblio/README.md)。

---

## 9. 赛事第 1 小时的检查清单

这是在决定任何事情之前需要用真实数据核实的内容：

- [x] 对 WISE 0855 的 `spherex_dr1` 进行 SIA2 查询会返回行。记录有多少。**有：258 个文件**（`docs/09` §1）。
- [x] 对 `spherex_qr3` 同样查询。记录有多少，以及是否与前者重叠。**WISE 0855 为 0 行；两者之间没有重复文件**（`docs/09` §1）。
- [x] 一个典型天区有多少个不同的历元？这决定了“视频”是 5 帧还是 50 帧。**每个区域 3-4 次扫描，时间基线 1.0-1.4 年**（`docs/09` §1）。
- [x] 一个 `size=0.1` 的 cutout 在不到 N 秒内下载完成。测量它。**这决定了是否需要缓存或队列。** *（实测：中位数 7.3 s，p90 10.8 s，最大 29 s，约 3.9 MB；需要缓存；`docs/09` §6。）*
- [ ] 打开裁切后的 MEF 并确认 6 个扩展。*（EDA 中未验证。）*
- [x] 读取同一天区两个不同历元的 `WCS-WAVE`。**λ 变化多少？**（第 2 节）。**在一个探测器内约 16 个带宽**（`docs/09` §2）。
- [x] DR1 的 HiPS 立方体指向 IRSA 目录时能否在 Aladin Lite 中加载？如果可以，就有快速路径。**可以，是 `/data/hips/SPHEREx/spherex_allsky_cube` 的 HiPS PNG（不是 `ibe/` 目录）。**
- [x] IRSA 对来自浏览器的请求是否返回 CORS？如果不返回，**一切都要经过后端**。**否：只有 HiPS 有 CORS；SIA2 和 cutouts 通过后端**（`docs/09` §6）。

*已于 11 月 14 日在 [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md) 中回答。仅剩 6 个扩展那一项仍然开放。*
