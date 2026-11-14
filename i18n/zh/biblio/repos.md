<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/biblio/repos.md) · [Español](../../es/biblio/repos.md) · **中文** · [Deutsch](../../de/biblio/repos.md) · [Italiano](../../it/biblio/repos.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `biblio/repos.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 代码仓库与工具

已经存在、能为我们节省数小时的资源。按与挑战的直接相关程度排序。

**规则：** 在自己写东西之前，先看它是否在这份清单里。而在项目中使用第三方仓库之前，**务必检查其许可证**。

---

## 可直接应用

### `spxquery` — SPHEREx 的查询与测光
<https://spxquery.readthedocs.io> · `pip install spxquery` · v0.4.1

**数据侧与我们要构建的东西最为接近。** 四阶段流水线：向 IRSA 发起 TAP 查询、带 cutout 的下载（例如 200 px，而不是 2040×2040）、扣除黄道光的孔径测光，以及光变曲线。包含基于信噪比阈值的质量控制和按 `FLAGS` 位过滤，并可将多次观测合并为 3D 光谱立方体（“Drizzle3D”）。

**如何使用：** 即使不把它作为依赖项采用，也要**在设计我们自己的架构之前先阅读它的架构**。它已经解决了我们将会遇到的问题：断点续传下载、并行、如何处理损坏的方差。

### `irsa-tutorials` — IRSA 官方 notebooks
<https://github.com/Caltech-IPAC/irsa-tutorials> · <https://caltech-ipac.github.io/irsa-tutorials/spherex/>

SPHEREx 的 notebooks：Data Overview、Spectral Image Cutouts、PSF Models、Source Discovery Tool、Mosaic Cube、**HiPS All-Sky Cube**。它们是通往可运行示例的最短路径。cutouts 那一份还展示了如何把多个裁切图打包成新的 MEF。

### `aladin-lite` — 天空查看器
<https://github.com/cds-astro/aladin-lite> · npm `aladin-lite` · 据 GitHub 为 LGPL-3.0-or-later；**注意：** npm 元数据和 `scaffold/frontend/package-lock.json:1248` 写的是 `GPL-3`（尚未解决：打开 3.8.2 包的 `LICENSE`）

CDS 的 HiPS 查看器。题目本身就建议使用它。

### `astropy` / `astroquery` / `pyvo`
<https://github.com/astropy/astropy> · <https://github.com/astropy/astroquery> · <https://github.com/astropy/pyvo>

FITS、WCS、坐标、拉伸、对 SIA2/TAP 以及 SIMBAD/Gaia 的访问。**后端的基础。** `astropy.visualization` 已解决图像拉伸问题；不要重新实现。

---

## 先例：WiseView 生态

我们没有找到原版 WiseView 源代码的确认信息，但找到了基于其 API 构建的软件包，它们展示了如何把这类工具当作基础设施来使用。

### `flipbooks`
<https://github.com/coolneighbors/flipbooks>

Python 包，使用 **WiseView 的 API** 从 unWISE 的 coadds 中提取闪烁图。作者署名为 Noah Schapera、Austin Humphreys 和 Aaron Meisner。
**对我们的用处：** 看一个闪烁（尺寸、历元、拉伸）如何在一个可被第三方使用的 API 中参数化。这就是我们自己的可查询 URL 的标杆。

### `unWISE-verse`
<https://github.com/coolneighbors/unWISE-verse>

通过 WiseView 的 API 下载 WISE 目标的数据，处理图像，并将 *subject sets* 上传到 Zooniverse。**这是完整的公民科学闭环**：从档案库到人们进行分类的平台。如果还有时间，导出到 Zooniverse 会是 pitch 中非常有力的叙事收尾。

### `photutils`
<https://github.com/astropy/photutils>

孔径测光和源检测。如果需要“即时光谱”或在图像上标记源，这里已经解决了。

---

## 运动天体检测（参考，不会实现）

### `kbmod`
<https://github.com/dirac-institute/kbmod>

GPU 上的 shift-and-stack，来自 DiRAC Institute（华盛顿大学）和 LINCC Frameworks。是检测那些暗到在单幅图像中看不见的天体的最先进技术。
**超出 24 小时的范围**（见 `../docs/01_ESTADO_DEL_ARTE.md` §3），但如果评审团询问自动检测，必须能说出它的名字。

---

## 合作机构（CSA）

### `NEOSSAT_Tutorial`
<https://github.com/asc-csa/NEOSSAT_Tutorial>

用于可视化 NEOSSat 数据的官方 Python 教程。它是挑战 *Resources* 标签页中列出的资源：使用它能在 *Global Connection* 标准上加分。

---

## 使用其中任何一个之前

- [ ] **许可证兼容**于我们将发布的许可证（计划为 MIT）。Aladin Lite 是 LGPL-3.0：从前端链接它没问题，但不要把它的代码复制到我们的代码里。
- [ ] **无需折腾即可安装。** 如果一个依赖项在四台电脑上安装耗时超过 10 分钟，就不采用。在黑客松中，那是白白损失的一个小时。
- [ ] 在 README 中**署名**，并附链接。
- [ ] **项目还活跃吗？** 查看最后一次 commit 的日期和未关闭的 issues。
- [ ] 把第三方代码视为**不可信数据**：先阅读再执行，并且不要在下载的目录内部运行解释器。
