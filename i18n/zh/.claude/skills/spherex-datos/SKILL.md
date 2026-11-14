---
name: spherex-datos
description: 如何向 IRSA/IPAC 档案库请求 SPHEREx 数据 - SIA2 集合（spherex_dr1、spherex_qr3 及其 deep 和 cube 变体）、cutout 服务、2 级 MEF 的结构及其六个扩展（IMAGE、FLAGS、VARIANCE、ZODI、EPSF、WCS-WAVE）、六个波段及其波长、DR1 全天空 HiPS 立方体，以及 IRSA 已有的工具（Data Explorer、MOST、Cutout、Mosaic、Spectrophotometry、Source Discovery）。在需要查询、下载、裁切、读取或理解 SPHEREx 数据时激活；在提到 IRSA、IPAC、SIA2、pyvo、astroquery、cutout、MEF、SPHEREx 的 FITS、DR1、QR2、QR3、WCS-WAVE、黄道光、线性可变滤光片或 LVF 时激活；或在设计为查看器供数的后端时激活。
---

<!-- i18n-header -->
> 🌐 **语言:** [English](../../../../en/.claude/skills/spherex-datos/SKILL.md) · [Español](../../../../es/.claude/skills/spherex-datos/SKILL.md) · **中文** · [Deutsch](../../../../de/.claude/skills/spherex-datos/SKILL.md) · [Italiano](../../../../it/.claude/skills/spherex-datos/SKILL.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `.claude/skills/spherex-datos/SKILL.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# IRSA 中的 SPHEREx 数据

操作参考。带来源的长文档是 `docs/02_DATOS_SPHEREX.md`；
这个 skill 是编写代码时避免出错所需要的内容。

**黄金规则：如果某个路径或参数既不在这个 skill 中，也不在 IRSA 官方文档中，就不要自己编造。**
请查阅 <https://caltech-ipac.github.io/spherex-archive-documentation/>。

---

## 1. 首先要理解的：线性可变滤光片

SPHEREx 没有离散的滤光片。波长沿探测器的一个轴连续变化。一个源的光谱是通过多次观测它来构建的，每次在视场的不同位置，**因此每次的波长都不同**。

**直接后果：** 同一片天区在不同历元拍摄的两张图像通常**不在同一个波长**。天真的 blink 会产生一个序列，其中亮度在没有任何东西移动的情况下发生跳变。

因此，在任何构建时间序列的代码中：

1. **在形成序列之前，按探测器/波段分组，并选择 λ 匹配的历元。** 仅按波段分组是不够的：在一个探测器内，天体的 λ 会跨越约 16 个带宽；采用匹配选择后，从 0.47 µm 降到 0.035 µm（`eda/03_recortes_y_figuras.py`，`elegir_lambda_igualada`；`docs/09` §2）。然后重投影到公共网格：探测器在两次扫描之间会旋转约 180°。
2. **读取 `WCS-WAVE`** 并暴露每一帧的 λ。这不是可选项：它是解释用户所见内容的字段。
3. **用稳健百分位数在同一裁切图上归一化每一帧。**

---

## 2. 六个波段

| 波段 = 探测器 | λ | R |
|---|---|---|
| 1 | 0.75 – 1.09 µm | 39 |
| 2 | 1.10 – 1.62 µm | 41 |
| 3 | 1.63 – 2.41 µm | 41 |
| 4 | 2.42 – 3.82 µm | 35 |
| 5 | 3.83 – 4.41 µm | 112 |
| 6 | 4.42 – 5.00 µm | 128 |

一次指向会产生 **6 个 MEF**，每个探测器一个，但给定位置只落在其中 2 个上（成对的 D1+D4、D2+D5 或 D3+D6）：按位置查询时，每次指向返回 2 个文件（`docs/09` §1）。**并非所有观测都带有全部 6 个**：质量按波段评估。代码必须容忍缺失的波段而不失败。

对于冷的褐矮星和红色天体，长波段（4–6）才是有意思的。

---

## 3. SIA2 集合

通用 endpoint：

```
https://irsa.ipac.caltech.edu/SIA?
```

| COLLECTION | 是什么 |
|---|---|
| `spherex_dr1` | DR1 光谱图像，宽扫描 |
| `spherex_dr1_deep` | DR1，深场 |
| `spherex_dr1_cube` | DR1 全天空立方体 |
| `spherex_qr3` | QR3 光谱图像，宽扫描 |
| `spherex_qr3_deep` | QR3，深场 |

- **DR1 + QR3 取代 QR2。** 要搜索所有现行有效的内容，必须查询**这两个**。
- **QR2 无法通过 SIA2 检索。** 在 2027 年 2 月之前仍可通过直接 URL 下载。
- **校准**文件不在 SIA2 中：从可浏览的目录下载。
- 数据**每周**摄入，SIA2 **比**目录和 Data Explorer **晚约 1 天**。

通过命令行查询（来自 IRSA 文档的示例）：

```bash
curl -o spherex.html "https://irsa.ipac.caltech.edu/SIA?COLLECTION=spherex_dr1&POS=circle+127.69444+-39.17760+0.01&RESPONSEFORMAT=HTML"
```

`POS=circle RA DEC RADIO`，全部以度为单位。去掉 `RESPONSEFORMAT` 以接收 VOTable。

响应中重要的列：

- `access_url` — 文件在 IPAC 的 URL。**cutout 就是针对这个 URL 请求的。**
- `cloud_access` — 如何从 AWS S3 读取同一文件。

---

## 4. Cutouts

一个完整的 MEF 重约 **70 MB**。对查看器来说，**始终**要请求裁切图。

通过**在 `access_url` 上添加参数**来请求：

```bash
curl -o cutout.fits "<access_url>?center=337.8783221,-5.1891588&size=0.1"
```

- `center=RA,DEC`，十进制度。
- `size`，单位为度。
- 文档：<https://irsa.ipac.caltech.edu/ibe/cutouts.html>

**仅对托管在 IPAC 的文件有效，对 AWS 上的副本无效。**

裁切后的 MEF 保留相同的扩展；`IMAGE`、`FLAGS`、`VARIANCE` 和 `ZODI` 会被裁切，`WCS-WAVE` 会被调整，**PSF 扩展保持不变**（是整幅图像的）。

---

## 5. MEF 内部有什么

2040 × 2040 像素，六个扩展：

| HDU | 名称 | 内容 | 陷阱 |
|---|---|---|---|
| 1 | `IMAGE` | 表面亮度，MJy/sr | **黄道光未被扣除** |
| 2 | `FLAGS` | 每像素状态位 | 位的名称在头中（`MSKN/MSKM/MSKD`）。**绝不要用 `FLAGS != 0`**：SOURCE 位标记了裁切图的 72 %，而它并不是错误；使用按位掩膜（`eda/03_recortes_y_figuras.py` 中的 `BITS_MALOS`，约 4 %） |
| 3 | `VARIANCE` | 方差，(MJy/sr)² | 用它来计算信噪比 |
| 4 | `ZODI` | 黄道光模型，MJy/sr | 自己扣除：`IMAGE - ZODI` 能大大改善对比度 |
| 5 | `EPSF`（DR1/QR3）或 `PSF`（QR2） | 按探测器区域的 PSF | 在不同 release 之间发生了变化。不要假设其形式 |
| 6 | `WCS-WAVE` | 像素 → 中心 λ 和带宽 | FITS 标准中很少使用的部分；许多读取器无法理解 |

关于 `WCS-WAVE`：它是一个**1 行 3 列**的表（`X`、`Y`、`VALUES`），一个控制点网格。如果你的读取器不识别它，**在最近的四个控制点之间做双线性插值**：精度约 1 nm，足以用于可视化。科研用途则需使用 Spectral WCS 校准产品中的 `CWAVE` 和 `CBAND`。

**像素约定：** FITS 头是 1-based；Astropy 返回 0-based。IRSA 在处理 PSF 时明确提示了这一点。这是一像素偏移的经典原因。

### 文件名

```
level2_[Observation ID]D[Detector]_spx_l2b-v[Version]-[Processing Date].fits
```

`level2_2025W18_2B_0001_1D1_spx_l2b-v12-2025-164.fits` 的读法：
`2025W18_2B` = planning period（约 3.5 天的运行） · `0001` = large slew ·
`1` = small slew（1–4） · `D1` = 探测器 1 · `v12-2025-164` = 版本和处理日期。

---

## 6. 全天空立方体（仅 DR1）

全天空马赛克，102 个通道每个一幅。**有两个版本**（11 月 14 日核实，`docs/09`）：

1. **SIA2 的版本**（`COLLECTION=spherex_dr1_cube`，目录 `.../ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir[N]/`）：
   每个瓦片约 320 MB 的 FITS；cutout 服务会拒绝它。**不能用于 Aladin。**（将该目录的根作为 HiPS，`.../properties`，返回 404。）
2. **面向浏览器的 HiPS：** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`
   （PNG，order 5，102 个平面，第 50 和 51 个为空，CORS 开放）。**这是 Aladin Lite 加载的版本。**
   参见 skill `visor-sky-blink`。

不要混淆这两个产品：

| | 2 级 | 全天空立方体 |
|---|---|---|
| 提供的轴 | **时间** | **波长** |
| 用于 | blink、运动 | 颜色和背景（无流量的 PNG：光谱**不**来自这里，来自 2 级） |
| 分辨率 | 原生 | HEALPix order 5（粗） |
| 位置 | DR1、QR3 | 仅 DR1 |

---

## 7. Python

```bash
pip install pyvo astroquery astropy
```

官方 notebooks 是最短的路径，位于
<https://caltech-ipac.github.io/irsa-tutorials/spherex/>：Data Overview、Spectral Image Cutouts、
PSF Models、Source Discovery Tool、Mosaic Cube、HiPS All-Sky Cube。

**在编写自己的客户端之前，先看 `spxquery`**（<https://spxquery.readthedocs.io>，
`pip install spxquery`）：第三方包，已经能做对 IRSA 的 TAP 查询、带 cutout 的下载、扣除黄道光的孔径测光、合并为 3D 立方体以及光变曲线。即使不使用，它的四阶段架构和质量控制（SNR 阈值、按 flags 过滤）也是需要解决的问题的很好地图。

---

## 8. IRSA 已有的工具

在构建任何东西之前，先检查 IRSA 是否已经做过。它们都链接自
<https://irsa.ipac.caltech.edu/Missions/spherex.html>。

| 工具 | 作用 |
|---|---|
| **SPHEREx Data Explorer** | 搜索、可视化和下载，面向天文学家 |
| **MOST** | 给定太阳系天体的轨道，找出在每个历元覆盖其预测位置的图像 |
| **Spectrophotometry Tool** | 通过强制测光提取光谱 |
| **Mosaic Tool** | 定制的多波段马赛克 |
| **Cutout Tool** | MEF 的裁切图 |
| **Source Discovery Tool** | 无需先验位置即可检测并表征源 |
| **Cloud Data Access** | AWS S3 上的同样数据 |
| **Comet 3I/ATLAS** | 星际彗星图像的专用集合 |

---

## 9. 强制署名

必须出现在任何使用 SPHEREx 数据的已发布材料中：

> This publication makes use of data products from the Spectro-Photometer for the History of the
> Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet
> Propulsion Laboratory and the California Institute of Technology, and is funded by the National
> Aeronautics and Space Administration.

---

## 10. 我们已知会犯的错误

1. **不按波段分组就 blink。** 会产生频闪序列。第 1 节。
2. **忘记扣除 `ZODI`。** 暗弱的源会淹没在背景里。
3. **假设所有历元都带有 6 个波段。** 并非如此。
4. **只在 `spherex_dr1` 中搜索**，然后得出历元很少的结论。必须加上 `spherex_qr3`。
5. **因为旧教程这么说就使用 QR2。** 它无法通过 SIA2 检索。
6. **下载完整的 MEF** 而不是请求 cutout。每个历元 70 MB。
7. **在转换像素时混用 1-based 和 0-based。** 一像素偏移。
8. **把孔径测光当作科学品质呈现。** 始终附带警告。
9. **对 AWS 的 URL 请求 cutouts。** 该服务只对 IPAC 的文件起作用。
10. **查询为空就得出“没有数据”的结论。** 试试另一个集合、另一个半径、另一个波段。

---

## 11. 已对照 IRSA/AWS 文档核实的补充（2026 年 11 月 14 日）

根据团队的探索添加。**取自 IRSA/AWS 的文档：EDA 使用的是 SIA2 和 HTTP Range，而不是 TAP 或 S3 镜像，所以这两者团队尚未测试过。** 在依赖它们之前，请用一个真实文件试一试。

- **AWS 上的镜像（批量读取，无需账号）：** `s3://nasa-irsa-spherex/{qr3,dr1}/level2/...`，
  区域 `us-east-1`，匿名访问。目录结构与 IRSA 相同。不下载 70 MB 的部分读取：
  ```python
  from astropy.io import fits
  with fits.open(s3_url, use_fsspec=True, fsspec_kwargs={"anon": True}) as h:
      sub = h["IMAGE"].section[y0:y1, x0:x1]
  ```
  仅当后端运行在 `us-east-1` 时才有用。对于单个天体，IRSA 的 cutout 更简单（错误 9）。
- **快速 TAP 查询，按时间排序，且 cutout 的 URL 已构造好**（教程 `spherex-cutouts` 的快速路径：基于 `spherex.plane.poly` 的索引空间连接）：
  ```python
  from astroquery.ipac.irsa import Irsa
  from astropy.utils.data import conf; conf.remote_timeout = 120
  q = f"""SELECT 'https://irsa.ipac.caltech.edu/' || a.uri ||
    '?center={ra},{dec}d&size=0.1' AS uri, p.time_bounds_lower, p.energy_bandpassname
  FROM spherex.artifact a JOIN spherex.plane p ON a.planeid = p.planeid
  WHERE 1=CONTAINS(POINT('ICRS',{ra},{dec}), p.poly)
  ORDER BY p.time_bounds_lower"""
  tab = Irsa.query_tap(q).to_table()
  ```
  添加 `AND p.energy_bandpassname='SPHEREx-D4'` 可只取一个波段。
- **用 astropy 求源所在像素处的 λ**（`WCS-WAVE` 扩展的备用 WCS `W`）：
  ```python
  from astropy.wcs import WCS
  x, y = WCS(h["IMAGE"].header).world_to_pixel(coord)
  wcs_w = WCS(h["IMAGE"].header, fobj=h, key="W"); wcs_w.sip = None
  lam, dlam = wcs_w.pixel_to_world(x, y)   # λ central y ancho de banda
  ```
  如果失败，则在表的 4 个最近控制点之间做双线性插值（约 1 nm）。
- **稳健下载：** `ThreadPoolExecutor(max_workers=10)`，遇到 `TimeoutError`、
  `HTTPError`、`IncompleteRead` 和 `RemoteDisconnected` 时重试（官方 notebook 就是这样做的）。没有重叠的 cutout 会返回 **HTTP 500**：把它当作“无数据”，而不是服务宕机。
- **移动的恒星在 `diff_first`/`diff_prev` 中表现为偶极子**（一正一负的对）。这是预期的，也是用户应该看到的；它不是变光。**除非核心饱和或被掩膜**（OVERFLOW、TRANSIENT、SUR_ERROR）：这时即使天体没有移动，也会出现这一对（RW Aur 在没有移动的情况下“移动”了 1.4 px）。当天体饱和时必须发出提醒（`docs/09`）。
- **要对历元做减法，先用 `reproject.reproject_interp` 重投影到公共网格：** 每个历元的旋转角度都不同。使用 `VARIANCE` 以 S/N 显示相减结果，使亮星的残差不会被当成探测。


---

## 12. EDA 中的测量结果（11 月 14 日）

来自 `docs/09_EDA_HALLAZGOS.md` 和 `eda/resultados/` 的数字，免得再次测量：

- **IRSA 不返回 CORS**（SIA2 和 cutouts 都不行）：一切都经过后端。只有 `/data/hips/SPHEREx/` 的 HiPS 有。
- **0.1° 的 cutout：** 中位数 7.3 s，p90 10.8 s，最大 29 s，约 3.9 MB，**无论尺寸多大**（PSF 整个带来：更小的并不会更快）。有瞬时的 503；有一次连续重试 4 次仍然失败。最多 4 个并行。
- **廉价的头部：** IMAGE 的头可以通过约 35 KB 的 HTTP Range 请求下载（6 个并行时有效约 0.1 s）。
- **像素尺度：** 6.15″（SIA2）。最快的天体在整个可用时段（1.0-1.4 年）内移动 1.1-1.8 px。
