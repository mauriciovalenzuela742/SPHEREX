<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/biblio/README.md) · [Español](../../es/biblio/README.md) · **中文** · [Deutsch](../../de/biblio/README.md) · [Italiano](../../it/biblio/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `biblio/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 文献

参考资料按**用途**组织，而不是按字母顺序。每个条目都说明它对这个具体项目有何贡献，以及其验证状态。

## 如何阅读“状态”列

| 标记 | 含义 |
|---|---|
| ✅ | 标识符和标题已在 2026年11月14日 的搜索中核实 |
| 🟡 | 存在且广为人知，但**我们没有核实确切的标识符**。引用前须核实 |
| 📄 | 官方文档，URL 已打开并阅读 |

**对于标 🟡 的内容，未经核实切勿从这里引用。** 一篇论文存在，并不能证明它说了被归于它的话；有 NASA 天文学家的评审团会注意到这一点。使用 `/verifica-cifra`。

BibTeX 格式的条目在 [`referencias.bib`](../../../biblio/referencias.bib)。代码仓库在 [`repos.md`](repos.md)。阅读卡片在 [`fichas/`](../../../biblio/fichas/)。

---

## 1. SPHEREx：任务及其数据

为了理解仪器、避免在数据上犯错而必须阅读的内容。

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| **SPHEREx Explanatory Supplement** · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp_QR_v2.0.pdf> | 数据产品的规格文档 | **参考文档。** 表 16 定义了 `FLAGS` 的位，这正是 *contamination flags* 一条要点所要求的 | 📄 |
| **SPHEREx Archive at IRSA** · <https://caltech-ipac.github.io/spherex-archive-documentation/> | 访问与产品指南 | SIA2 集合、cutouts、MEF 结构。**第 1 天最有用的资料** | 📄 |
| Bock et al. (2026), *The SPHEREx Satellite Mission*, ApJ · arXiv:2511.02985 | 任务的权威论文 | IRSA 要求引用的就是它。描述了预期的太阳系天体星表 | ✅ |
| Akeson et al. (2026), *The SPHEREx Image and Spectrophotometry Processing Pipeline*, ApJS · arXiv:2511.15823 · doi:10.3847/1538-4365/ae8843 | 我们所用数据是如何生成的 | 解释了 2 级产品、校准和可用时间 | ✅ |
| Crill et al. (2025), *The SPHEREx Sky Simulator* · arXiv:2505.24856 | SPHEREx 的天空模拟器 | 当需要理解某个天区应当看到什么时有用 | ✅ |
| Korngut et al. (2026), *Instrument & Calibration* | 仪器与校准 | IRSA 将其引为权威文献。**标识符未核实** | 🟡 |
| Doré et al. (2016), *Science Impacts of the SPHEREx All-Sky Survey* · arXiv:1606.07039 | 最初的科学论证 | pitch 的背景 | ✅（id）；🟡（作者） |
| Lim et al. (2026), *SOLO: wide-field asteroid light curve monitoring system for SPHEREx* · arXiv:2602.08037 | 支持 SPHEREx 太阳系天体星表的地面系统 | **非常相关**：解释了为何需要光变曲线来校正小行星光谱的自转影响 | ✅ |

---

## 2. 直接的先例：WiseView、unWISE 与 Backyard Worlds

这是挑战要求复现并超越的东西。**如果只读一节，就读这一节。**

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| **WiseView** · Caselden, Westin et al. · ASCL:1806.004 · <http://byw.tools/wiseview> | 挑战点名作为范例的工具 | 在浏览器中对 WISE 的 coadds 做闪烁，拉伸、颜色和速度可调。数百个褐矮星的发现 | ✅ |
| Lang (2014), *unWISE: unblurred coadds of the WISE imaging* · arXiv:1405.0308 | WiseView 显示的 coadds | **显示之前先合并**，才使暗弱的源变得可见 | 🟡 |
| Meisner et al., *unWISE Coadds: The Five-year Data Set* · arXiv:1909.05444 | 扩展的 coadds | 如何从一次巡天构建时间序列 | ✅（id） |
| Schlafly et al. (2019), *The unWISE Catalog: Two Billion Infrared Sources* · arXiv:1901.03337 | 衍生星表 | 问题的规模 | ✅（id） |
| Meisner et al. (2022), *unTimely: a Full-sky, Time-Domain unWISE Catalog* · arXiv:2209.14327 | 时间分辨的星表 | **从“图像”到“时域”的一步**，这正是我们的问题 | ✅ |
| Kuchner et al. (2017), *Backyard Worlds: Planet 9* | 公民科学项目 | 挑战的社会性理由。志愿者找到了巡天算法遗漏的东西 | 🟡 |
| **Cool Neighbors**（Zooniverse）· <https://www.zooniverse.org/projects/coolneighbors/backyard-worlds-cool-neighbors/> | 后继项目 | 使用 WiseView 的 API 生成其素材。**证明带可查询 URL 的工具会变成基础设施** | 📄 |

---

## 3. 在浏览器中可视化天文数据

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| Fernique et al. (2015), *Hierarchical progressive surveys (HiPS)* · arXiv:1505.02291 | HiPS 格式 | SPHEREx DR1 的全天立方体以 HiPS 发布。它还描述了 Aladin 如何逐平面或以动画方式遍历立方体 | ✅ |
| Baumann et al. (2022), *Aladin Lite v3: Behind the Scenes of a Major Overhaul*, ADASS · 2022ASPC..532....7B | 我们使用的查看器 | 投影、FITS 瓦片、嵌入。挑战本身引用了它 | ✅ |
| **Aladin Lite — API** · <https://aladin.cds.unistra.fr/AladinLite/doc/API> | 参考文档 | `createImageSurvey`、`getEmbedCode`、`getViewDataURL` | 📄 |
| **Firefly**（IPAC）· <https://github.com/Caltech-IPAC/firefly> | IRSA 的 Data Explorer 的引擎 | SPHEREx HiPS 立方体的官方 notebook 使用它 | 📄 |
| **Astropy** · <https://docs.astropy.org> | FITS、WCS、坐标、可视化 | `ZScaleInterval`、`AsinhStretch`、`ImageNormalize`、`SkyCoord`。**这些都不要重新实现** | 📄 |

---

## 4. 运动天体检测（我们不会实现，但必须了解）

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| Whidden et al. (2019), *Enabling Deep All-Sky Searches of Outer Solar System Objects* · arXiv:1901.08549 | **KBMOD**：GPU 上的 shift-and-stack | 找到单幅图像中看不见之物的最先进技术。约 10¹⁰ 条轨迹/分钟 | ✅ |
| *Fast algorithms for slow moving asteroids* · arXiv:1901.02492 | 相关工作 | 对柯伊伯带天体分布的约束 | ✅（id） |
| Smotherman et al. (2024), *Detecting Moving Objects With Machine Learning* · arXiv:2405.06148 | KBMOD 候选体的筛选 | **ML 在这里真正适用的位置**：过滤成千上万的假阳性，而不是取代查看器 | ✅（id）；🟡（作者） |
| *DECam Ecliptic Exploration Project (DEEP) VI* · arXiv:2310.03678 | KBMOD 应用于一次真实巡天 | 105 个新的跨海王星天体；真实的计算时间 | ✅ |
| *Candidate Distant TNOs — New Horizons Subaru TNO Survey* · arXiv:2407.21142 | KBMOD 的另一项真实应用 | 阈值和假阳性率 | ✅（id） |

---

## 5. 实时分类：ALeRCE（实验室自己的领域）

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| Förster et al. (2021), *The ALeRCE Alert Broker*, AJ · arXiv:2008.03303 | 智利的 ZTF 警报 broker | **团队的优势。** 实时分类并把可疑候选体呈现给人，正是查看器所缺少的纪律 | ✅ |
| Carrasco-Davis et al., *Stamp classifier* | 针对科学/参考/差分裁切图的 CNN，具有旋转不变性 | **这个问题的正确“AI”模型**，而不是视频 transformer：小型网络，作用于裁切图，带有手工选定的不变性 | 🟡 |
| Sánchez-Sáez et al., *Light curve classifier* | 基于变光特征的两级平衡随机森林 | 用于区分真实变光与伪影 | 🟡 |
| *Temporal Stamp Classifier* · arXiv:2405.15073 | 带时间轴的版本 | 在这里最接近有意义的“视频模型”的东西 | ✅（id） |

---

## 6. Planet X：搜寻的真实现状

| 引用 | 是什么 | 为什么重要 | 状态 |
|---|---|---|---|
| Batygin & Brown (2016), *Evidence for a Distant Giant Planet in the Solar System*, AJ 151, 22 · arXiv:1601.05438 · doi:10.3847/0004-6256/151/2/22 | Planet Nine 的现代假说 | 挑战名称的来源 | ✅ |
| Phan et al.，基于 IRAS + AKARI 的候选体，PASA | 在相隔 23 年的两次红外巡天中唯一一个相符的天体 | **该技术与挑战完全相同。** 作者强调他们并未发现 Planet Nine | 🟡（标识符和年份未核实） |
| *A targeted, parallax-based search for Planet Nine* · The Open Journal of Astrophysics · <https://astro.theoj.org/article/155004> | 有针对性的光学搜寻 | 在所覆盖的天区中没有可信的候选体。有助于避免在 pitch 中夸大 | ✅（标题和期刊） |

**关于 pitch：** 截至 2026年11月，Planet Nine **尚未被发现**。永远不要声称相反的说法。

---

## 7. 视频模型（已评估，并被排除作为核心）

完整论证在 [`../docs/01_ESTADO_DEL_ARTE.md`](../docs/01_ESTADO_DEL_ARTE.md) §6。列出它们是为了能够准确地回答评审团。

| 引用 | 是什么 | 状态 |
|---|---|---|
| Bertasius, Wang & Torresani (2021), *Is Space-Time Attention All You Need for Video Understanding?*（**TimeSformer**），ICML · arXiv:2102.05095 | 对帧的图块在空间和时间上分别做注意力 | ✅ |
| Arnab et al. (2021), *ViViT: A Video Vision Transformer*, ICCV · arXiv:2103.15691 | Google Research 的视频 transformer | ✅ |
| Tong et al. (2022), *VideoMAE* · arXiv:2203.12602 | 面向视频的掩码自编码器，数据高效 | ✅ |
| *VideoMAE V2: Scaling Video Masked Autoencoders with Dual Masking* · arXiv:2303.16727 | 放大版 | ✅ |
| Ni et al. (2022), *Expanding Language-Image Pretrained Models for General Video Recognition*（**X-CLIP**）· arXiv:2208.02816 | 扩展到视频的 CLIP | ✅ |

**为什么不用的总结：** 挑战要求的是查看器，而不是分类器；在自然视频上的预训练无法迁移到天文序列；24 小时内没有标签；而经典方法利用了问题的物理性质。ML 真正有贡献的地方是候选体的筛选，而为此正确的模型是 ALeRCE 的 *stamp classifier*（第 5 节），而不是视频 transformer。

---

## 8. 合作机构（CSA）的资源

使用它们能在评审团的 *Global Connection* 标准上加分。

| 资源 | URL |
|---|---|
| NEOSSat（任务） | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> |
| NEOSSat — Python 教程 | <https://github.com/asc-csa/NEOSSAT_Tutorial> |
| NEOSSat — 数据 | <https://data.asc-csa.gc.ca/dataset/neossat> |
| Canadian Astronomy Data Centre | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> |

---

## 还缺少哪些检索

对本次综述局限性的诚实说明，综述完成于 2026年11月14日：

- 我们没有找到 2026 年专门针对**用 SPHEREx 检测运动天体**的论文。最接近的是任务论文中描述的太阳系天体星表，以及辅助工作 SOLO。
- 我们没有确认 **WiseView 的源代码**是否公开。其衍生包（`flipbooks`、`unWISE-verse`）是公开的。见 [`repos.md`](repos.md)。
- **CDS 的 SIMBAD** 在 11月14日 没有响应；测试天区的坐标是对照哈佛的镜像（CfA）核实的：见 [`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml)。
- 标 🟡 的条目需要有人在引用之前打开原始来源。
