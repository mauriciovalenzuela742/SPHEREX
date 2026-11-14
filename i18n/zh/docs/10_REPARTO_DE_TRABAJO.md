<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/10_REPARTO_DE_TRABAJO.md) · [Español](../../es/docs/10_REPARTO_DE_TRABAJO.md) · **中文** · [Deutsch](../../de/docs/10_REPARTO_DE_TRABAJO.md) · [Italiano](../../it/docs/10_REPARTO_DE_TRABAJO.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/10_REPARTO_DE_TRABAJO.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 10 — EDA 之后每个人的任务

分工由团队计划确定：[`README.md`](../README.md) §3 和 [`05_PLAN_24H.md`](05_PLAN_24H.md)（D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera）。本文档**不重新分工**：它把 EDA（[`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)）用真实数据揭示的内容落实到各个角色，给出具体任务以及如何验证。

---

## EDA 对计划的改变

| 计划假设 | EDA 显示 | 影响谁 |
|---|---|---|
| 路线 A：Aladin 加载 IRSA 的 DR1 HiPS 立方体 | **确实能加载**（`/data/hips/SPHEREx/spherex_allsky_cube`，CORS 开放；已在已部署的查看器中）。但它是所有历元的 PNG 马赛克，分辨率 12.9″/px：可用作背景以及 102 个波段，不能用于时间，也不能测量流量。SIA2 提供的 FITS 版本不能用于裁切 | **V2** |
| 在第 1 小时验证 CORS | **IRSA 不以 CORS 响应**（SIA2 和文件均如此）：一切都经过后端。CDS 则支持 | D1, V2 |
| 测量一个 cutout 来决定用 Vercel Functions 还是容器 | **中位数 7.3 s，p90 10.8 s，最长 29 s**，约 3.9 MB，时而出现 503 错误 | **C**（决定），D1 |
| 按波段分组 | 此外还必须在历元之间**匹配 λ**：在一个探测器内部变化约 16 个波段宽度 | D1, **D2** |
| 重投影到公共网格 | 已确认且必不可少：探测器在各扫描轮次之间**旋转约 180°** | **D2** |
| 用 `flagged_fraction` 表示“污染” | `FLAGS != 0` 标记了裁切图的 72%（SOURCE 位，它不是错误）；坏像素约占 4% | **D2**, C, V1 |
| WISE 0855 是主要演示 | WISE 0855 是必选案例，且始终展示，同时说明它在单次曝光中显得很暗（其运动通过减法和按扫描轮次求和体现）。**eps Ind B** 是实测运动最清晰的地方；Barnard 能看到但会饱和 | C, N |
| 运动在 blink 中可见 | 整个时段只有 **1–2 px**：减法（`diff_first`）才是能显示它的视图 | D2, V1, N |

## 数据流，从头到尾

```
 coordenada ─► [1 Buscar] ─► [2 Elegir épocas] ─► [3 Recortar + caché] ─► [4 Filtros y alineación]
               D1            D2 (λ igualada)       D1                      D2
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ▼
 [5 Restas y sumas] ─► [6 Imagen PNG] ─► API ─► [7 Visor]
   D2                    D2                      V1 blink y controles · V2 cielo, Gaia, espectro
```

**C（Mauricio）** 验证整条路径并决定部署；**N（Javiera）** 负责讲述。

---

## D1 · Vladimir — 数据访问（框 1 和 3）

基础：`eda/01_inventario.py`、`eda/espectral.py`（`cabecera_imagen`、`pedir`）。

- **并行**对 `spherex_dr1` 和 `spherex_qr3` 做 SIA2（每次 1–3.5 s）。两者之间没有重复的文件；QR3 带有最新的扫描轮次。
- 使用经自行**传播后的位置**进行搜索：按题目中的坐标，WISE 0855 会落在小天区之外。
- 廉价的元数据：IMAGE 的 header 通过一次约 35 KB 的 **HTTP Range 请求**下载（日期、WCS、探测器）。6 个并行时，每个文件实际约 0.1 s。
- 0.1° 的 cutouts，带重试和等待（出现过持续 4 次重试的 503）；最多 4 个并行。更小的 cutout **并不**更快：PSF 是整个传来的。
- 按 `(obs_id, detector, 取整后的中心, size)` 缓存，并预先计算 5 个天区。
- **完成的标志：** 5 个天区在没有互联网的情况下从缓存提供。

## D2 · Bryan — 帧：过滤、对齐与减法（框 2、4、5 和 6）

基础：`eda/02_longitud_de_onda.py`、`eda/03_recortes_y_figuras.py`（`elegir_lambda_igualada`、`grilla_comun`、`BITS_MALOS`）和 `eda/05_centroides.py`。

**输入：** D1 的文件列表。**输出：** 对齐后的帧 + 掩膜 + 减法结果，每帧带有 `wavelength_um` 和 `flagged_fraction`。

### 任务，按顺序

1. **选择匹配 λ 的历元。** 每个扫描轮次一个文件，使天体处的 λ 离散度最小（λ 取自 `WCS-WAVE` 表，它对每个探测器是固定的）。在 WISE 0855 上，D5 从 0.47 µm 降到 0.035 µm。
2. **按位的掩膜。** EDA 使以下位无效：`TRANSIENT, OVERFLOW, SUR_ERROR, NONFUNC, MISSING_DATA, HOT, COLD, NONLINEAR, PERSIST, OUTLIER`。存疑：`HALO`（2.1%）和 `BLOOM`（0.8%）。**绝不**用 `FLAGS != 0`。位的名称在 FLAGS 的 header 中（`MSKN`/`MSKM`/`MSKD`）。
3. **重投影时不扩大掩膜。** 填充后的图像和掩膜分开处理（掩膜用最近邻）：使用双线性插值时，每个坏像素都会污染其邻居，空洞在视觉上被放大。
4. **`IMAGE − ZODI`** 以及历元之间的归一化（目前用中位数和标准差；尝试按场星的流量缩放）。
5. **`diff_first` 和 `diff_prev`**，以 0 为中心的发散色图，所有帧使用相同范围。
6. **按扫描轮次求和**，以 `1/VARIANCE` 为权重（co-add）：这是让 WISE 0855 变得可见的方法。
7. **饱和。** Barnard 和 RW Aur 会饱和：核心被掩膜（Barnard 为 49 个像素中的 44 个），并且即使恒星没有移动，减法也会留下一对红/蓝（RW Aur）。提供一个饱和指示，供 V1 显示。

### 如何验证

| 测试 | 应当通过 |
|---|---|
| eps Ind B，D5，质心 最后 − 最初 | −0.92 / −0.57 px（西 / 北）± 0.2 px；EDA 测得 −0.85 / −0.71 |
| 未饱和的场星 | 位移中位数 < 0.2 px |
| Barnard，D2，减法 | 一对，正值朝向**北**（定性：它会饱和） |
| RW Aur，D3 | 标记为饱和；否则减法会误导 |
| `flagged_fraction` | 约占裁切图的 4%，而不是约 72% |

## V1 · Antonia — blink 查看器

对照数据逐点审查样稿：[`diseno/REVISION_MAQUETA_V1.md`](diseno/REVISION_MAQUETA_V1.md)。


- **减法**是显示运动的视图：仅 1–2 px 的 blink 几乎察觉不到。需要缩放（EDA 使用了放大的 18×18 px 裁切图）。
- 始终显示每一帧的**日期和 λ**：它们解释了亮度为何变化。
- 当天体饱和时给出提示，并把掩膜作为可选图层显示。
- 等待状态：一个冷帧可能需要 7–29 s。

## V2 · Juan Pablo — 天空查看器

> **已在 PR #6 中完成（11月14日 合并）：** 覆盖 102 个平面的 λ 滑块（不含 50 和 51）、传播到 2026 年的天体标记和裁切框、传播后的 Gaia DR3 图层（上限 300 颗恒星）以及带悬停标签和点击选取位置的 SIMBAD 图层。**已在分支 `v/v2-catwise` 中完成，待 PR：** CatWISE2020 图层，它在从 SIMBAD 传播的位置 2.6″ 处标出 WISE 0855（据 V2）。**尚缺：** 波段图（与 D2 一起）、点击 →
> 裁切动画、Spherix。

- **IRSA 的 HiPS 立方体可以在 Aladin 中加载**，且 Mauricio 已在 `scaffold/frontend/src/sky/AladinView.tsx` 中让它运行（Aladin Lite 3.8.2，每个波段一个平面）。它是所有历元的马赛克，12.9″/px：背景和 102 个波段，不含时间。CDS 的 HiPS（QR2）作为 B 计划。
- 对于**波段图**，立方体不适用（它们是拉伸后的 PNG，没有流量）；光谱来自 2 级文件（每个文件的 λ 已在 D2 中计算）或来自 IRSA 的 Spectrophotometry Tool。
- 传播到该历元的 Gaia overlay：EDA 已经用自行进行传播（`eda/comun.py`，`posicion_en`），并且与 eps Ind B 上的实测一致。

## C · Mauricio — 科学、验证与部署

- **用于决定 `/api` 在哪里运行的数据：** cutouts 中位数 7.3 s，最长 29 s，时而出现 503。
- 在 `data/campos_de_prueba.yml` 中更正像素尺度：**6.15″**（来自 SIA2），原先写的是推导出的 6.2。
- **`scaffold/frontend/src/content/campos.ts` 中是 J2000 坐标**，尽管其注释写的是“已传播”。到 2026 年，WISE 0855 距这些坐标 212″，Barnard 距 270″：对于 0.1° 的裁切图（半边 180″），它们**落在裁切图之外**。请使用传播后的位置（Bryan 分支的 `/api/presets` 已经提供了它们）。
- 演示：五个测试天体必须都能工作。WISE 0855 始终展示（通过减法，待有了 D2 的按扫描轮次求和后也如此，再加上 V2 的 CatWISE2020 overlay，已在分支 `v/v2-catwise` 中完成并待 PR；并说明它在单次曝光中显得很暗）；eps Ind B 是运动最清晰的地方；Barnard 能看到但会饱和。
- 上面 D2 的测试就是验收测试。

## N · Javiera — 叙事

- 诚实的信息：“最快的恒星在 SPHEREx 的一年里只移动 1–2 个像素；我们通过匹配颜色、对齐和相减来让它变得可见。”
- 现成的材料：演示文稿 `docs/presentacion_eda/` 和图 `eda/figuras/01_lambda_vs_tiempo.png`。

---

## 将 SpacePixels 作为独立验证（供 D2 和 C 使用）

[SpacePixels](https://github.com/ppissias/SpacePixels)（BSD-2，Java 21，桌面端）在**已经对齐的 FITS 序列**中检测运动天体，带有 blink、减法和“shift-and-stack”。只读过它的 README；**没有审查代码，也没有试用**。

- 不集成到查看器中（桌面端 Java）。
- 可用于检查对齐：将对齐后的帧导出为带 WCS 的 FITS，它应当把 eps Ind B 标记为移动天体，把场星标记为固定。
- 它的“shift-and-stack”是沿着 WISE 0855 的自行对其求和的思路。
- 安装它就是下载第三方软件：需在团队内商定。
