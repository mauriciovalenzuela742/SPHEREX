---
name: visor-sky-blink
description: 如何构建挑战的查看器：带有 HiPS 和 SPHEREx 全天立方体的 Aladin Lite v3、按历元的图像闪烁（blink）面板、天文图像的归一化与拉伸（asinh、zscale、百分位数）、色图、历元之间的图像减法、诸如 Gaia 的星表 overlay，以及带坐标的可查询 URL。在处理查看器前端、决定如何在浏览器中显示 FITS 图像、提到 Aladin、HiPS、blink、闪烁、flipbook、拉伸、stretch、zscale、colormap、天文图像的 canvas，或设计用户操作的控件时启用。
---

<!-- i18n-header -->
> 🌐 **语言:** [English](../../../../en/.claude/skills/visor-sky-blink/SKILL.md) · [Español](../../../../es/.claude/skills/visor-sky-blink/SKILL.md) · **中文** · [Deutsch](../../../../de/.claude/skills/visor-sky-blink/SKILL.md) · [Italiano](../../../../it/.claude/skills/visor-sky-blink/SKILL.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `.claude/skills/visor-sky-blink/SKILL.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 查看器：浏览器中的闪烁与天空

构建评审团所看部分需要了解的内容。包含 API 契约的文档是 `docs/03_ARQUITECTURA.md`。

---

## 1. 两个部分，而不是一个

| 部分 | 显示什么 | 如何实现 |
|---|---|---|
| **天空背景** | 我们在哪里、周围有什么、102 个波段 | 基于 HiPS 的 **Aladin Lite v3** |
| **闪烁面板** | 同一片区域在不同历元，如同一段小视频 | 基于后端 PNG 的自定义 `<canvas>` |

它们**在同一屏幕上并排显示**。用户立刻就能明白这是同一份数据的两个轴：Aladin 给出波长，面板给出时间。

---

## 2. Aladin Lite v3

CDS（斯特拉斯堡）的 HiPS 查看器。**挑战题目本身就建议使用它。** 可以通过 `<script>` 或 npm 引入。

它免费解决了、无需自己编写的内容：

- 天空导航、缩放和多种投影（Aitoff、Mollweide、正射、Mercator）。
- 从**任何 web 服务器**（包括 `localhost`）加载 HiPS，使用 `newImageSurvey` / `createImageSurvey`。
- **FITS 格式的 HiPS 瓦片**，而不仅是 JPEG。
- 用几行代码实现星表 overlay（Gaia、SIMBAD、VizieR）。
- `getEmbedCode()` 返回当前视场的 HTML —— 是“嵌入”这条要点的馈赠。
- `getViewDataURL()` 将视图导出为 PNG/JPEG —— 对分享和演示有用。

文档：<https://aladin.cds.unistra.fr/AladinLite/doc/API>

### 可用的 SPHEREx HiPS 立方体（已于 2026年11月14日 验证）

- **URL：** `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube`（IRSA，DR1）。
  CORS 开放。可在 Aladin Lite 3.8.2（固定在 `package.json` 中）中加载，且已在生产环境。
- **格式：** **PNG** 瓦片，阶数 5，像素 12.9″，**102 个平面**（每个通道一个）。
- **平面规则：** `plano = 17·(banda − 1) + (canal − 1)`，波段 1–6，通道 1–17。每个波段的中心通道是 `17·(b−1) + 8`。每个平面的确切 λ 在 `properties` 中，键 `data_cube_crval3_arr`（0.753–4.988 µm）。
- **空平面：** **50 和 51**（D3 与 D4 之间的二向色镜截止）。添加图层时，Aladin 会把它留在平面 50：必须在图层就绪之后再为其设置平面。
- **瓦片后缀 = 平面：** 对于波段 4，浏览器会请求 `Norder5/.../Npix11391_59.png`。可以用来在 `performance.getEntriesByType('resource')` 中检查当前显示的是哪个平面。
- **如何设置平面：** `ponerPlano`（在 `planos.ts` 中）计算平面中心的频率并调用 `setFrequency`；已在 6 个波段上验证（后缀 `_8 _25 _42 _59 _76 _93`）。
  **不要使用 `setSliceNumber`：** 在 3.8.2 中请求 59 会得到 9。出于同样的原因，Aladin 图层菜单中的立方体控件（使用 `setSliceNumber`）很可能显示错误的平面（未验证）。`capa.getFrequency()` 也不给出真实的 λ：λ 来自 `properties`（`leerPlanos`）。
- **Aladin 只在标签页可见时才请求瓦片。** 浏览器面板被隐藏时看不到任何新的瓦片：这不是故障。
- **它不是什么：** 它是**所有历元**的马赛克（没有时间轴：不能用来显示运动），并且是已经拉伸过的 PNG（没有流量：不能用于光谱）。时间和光谱来自后端处理的 2 级文件。
- **同一立方体的 FITS 版本**，即 SIA2 提供的 `spherex_dr1_cube`，既不适用于 Aladin，也不适用于裁切（每个瓦片约 320 MB）。
- **B 计划：** CDS 上的 `CDS/P/SPHEREx/QR2/D1`…`D6`（先前的版本）。未验证：11月14日 alasky 处于宕机状态。

### 代码中的结构（`scaffold/frontend/src/sky/`）

- `AladinView.tsx` 创建 Aladin，并且**不了解图层的细节**：它挂载 `capas/index.ts` 中的图层（契约 `montar(aladin, ctx) → desmontar`；`ctx` 带有 ra、dec、size、epoca、on、onSelect），并在位置、裁切或历元变化时重新挂载它们。可选 props：`size`、`epoca`（儒略年，默认 2026.0）、`onReady`、`onSelect`。
- **Aladin 对每个事件只保存一个监听器**：`aladin.on(e, fn)` 会替换之前的那个（`dist/aladin.js` 中的 `callbacksByEventName[g]=Q`）。因此图层通过 `ctx.on`（`eventos.ts`）订阅，它为每个事件注册一个分发器。绝不要在图层中调用 `aladin.on`。
- `planos.ts`（平面 ↔ 波段 ↔ λ，`ponerPlano`）、`LambdaSlider.tsx`（λ 滑块）、`propagacion.ts`（自行，线性，无视差，以儒略年计：J2000 = 2000.0，Gaia DR3 = 2016.0）。
- 要让某个图层可以被关闭，请给它一个名称：它会出现在 Aladin 的图层控件中。
- **CDS 在 2026年11月14日 宕机：** `simbad.cds.unistra.fr` 和 `vizier.cds.unistra.fr` 返回 404 且无 CORS（因此调用 `simbad.cds.unistra.fr/cone` 的 `A.catalogFromSimbad` 那天不可用）。哈佛的镜像则以 CORS 响应：`vizier.cfa.harvard.edu/viz-bin/asu-tsv`（Gaia）和 `simbad.cfa.harvard.edu/simbad/sim-tap/sync`（SIMBAD，较慢：2–18 s）。图层会两个都尝试。
- 稠密天区的 Gaia：设置 2000 颗恒星上限时，Barnard 的图会被遮住；改用最亮的 300 颗。
- 来自 `tg.log` 的控制台错误 `ERR_BLOCKED_BY_CLIENT` / “Failed to fetch” 是 Aladin 的使用日志：无害。

---

## 3. 闪烁面板

这个确实需要自己写。它很简单，而且是被评判的部分。

**不要使用被替换的 `<img>`。** 闪烁得很难看，并且能看到加载的跳变。使用 `<canvas>`：把所有帧预加载到 `Image` 或 `OffscreenCanvas` 中，并用 `requestAnimationFrame` 绘制轮到的那一帧。

最低限度的控件，按重要性排序：

| 控件 | 原因 | 有用范围 |
|---|---|---|
| **播放 / 暂停** | 显而易见且必要 | |
| **速度（fps）** | WiseView 证明了它是决定性的。慢时看到运动，快时看到变光 | 0.5 – 10 fps |
| **逐帧** | 用于确认自己以为看到的东西 | ← → |
| **拉伸** | **没有这个就什么也看不见。** 第 4 节 | 默认 asinh |
| **色图** | 灰度用于检测，彩色用于展示 | gray、viridis、magma |
| **波段** | 只有 SPHEREx 提供的轴 | 1–6 |
| **视场** | 挑战的明确要点 | 0.02° – 0.5° |
| **模式** | raw / 扣除 zodi / 差分 | |

在每一帧上叠加显示：**日期和波长**。λ 不是装饰：它解释了亮度为何在各帧之间变化（见 skill `spherex-datos`），并向评审团证明团队了解这台仪器。

---

## 4. 拉伸：为什么天文图像看不见

天空图像的动态范围极大，而大多数像素是背景。线性映射到 0–255 时，看起来是**一片黑色，上面有三个白点**。每个 Web 开发者第一次都会对此感到惊讶。

需要按顺序应用的内容：

1. **按百分位数裁剪**，而不是按最小值和最大值。一个热像素就会毁掉整个刻度。
   `vmin, vmax = percentil(1), percentil(99.5)` 是一个合理的起点。
2. **一个非线性函数**：`asinh` 是天文图像的最佳默认值（既保留暗弱细节，又不会让明亮部分饱和）。`sqrt` 和 `log` 也可用；`linear` 几乎不用。
3. **`zscale`** 是 DS9 中经典的自动选择上下限的算法。它在 `astropy.visualization.ZScaleInterval` 中。对于非专业用户，它通常是最佳选择。

`astropy.visualization` 已解决了这一切：`ZScaleInterval`、`PercentileInterval`、`AsinhStretch`、`ImageNormalize`。**不要重新实现。**

### 关键决定：谁来拉伸？

**后端。** 它返回已渲染好的 PNG。把 FITS 发送到浏览器，就必须用 JavaScript 编写 FITS 读取器，并手动应用拉伸和色图：在黑客松中，工作量翻倍，错误翻三倍。

代价是更改拉伸需要回到服务器。有了缓存就很便宜。如果还有时间，可以在客户端通过作用于 PNG 的 CSS 滤镜增加亮度和对比度的微调，这涵盖了 80% 的使用。

### 让闪烁清晰可读的关键

**一个序列的所有帧都用相同的 `vmin`/`vmax` 归一化。** 如果每一帧各自拉伸，一切都会闪烁，真正的运动与刻度变化无法区分。在整个堆栈上计算上下限，并应用到每一帧。

例外：如果 λ 在各历元之间变化很大，各水平在物理上就不同，通用归一化可能使某些帧变黑。这是项目的核心矛盾。实用的解决办法：先按波段分组，并给用户一个“通用刻度 / 每帧刻度”的开关。

---

## 5. 图像减法

挑战的明确要点，并且就价值/投入比而言，是项目中最好的。

- `diff_first` — 每一帧减去第一帧。没有变化的归零；移动了的则表现为**一对瓣，一个正一个负**。视觉效果惊艳。
- `diff_prev` — 每一帧减去前一帧。对变光有用。

对差分使用以零为中心的**发散**色图（蓝-白-红），而不是顺序色阶。符号就是信息。

诚实的提醒：正确的减法要求图像良好对齐且具有相同的 PSF。我们是对重投影到公共网格的裁切图做减法；这是**视觉上的近似**，而不是差分测光。要在界面中说明这一点。

---

## 6. Gaia 的 overlay：看得见的质量控制

在图像上绘制 Gaia DR3 预测的恒星在该历元日期的位置（星表位置 + 自行 × 经过的时间）。

它有两个作用：

1. **满足挑战的一条要点。**
2. **证明查看器是正确的。** 如果标记落在源上，说明 WCS、日期和裁切都没问题。这是对“我怎么知道这张图像就是我请求的那个坐标的？”的视觉回答。

在 Aladin Lite 中通过星表图层实现。对于闪烁面板，需要用裁切图的 WCS 将坐标投影为像素。

**参考历元：** Gaia DR3 给出的位置在 **2016.0**，而不是 J2000；SIMBAD 给出 J2000。要从每个星表对应的历元开始传播。当自行达到每年几角秒时，历元的错误会使标记移动几十角秒：到 2026 年，WISE 0855 距其 J2000 位置 212″，Barnard 距其 270″。

---

## 7. URL 是产品的一部分

挑战要求如此，而且只需半小时的工作：

```
/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
/?target=WISE+0855&size=0.2
```

- `target` 的优先级高于 `ra`/`dec`。
- **URL 随当前状态更新**（`history.replaceState`），这样复制地址栏就等于完全分享当前所看到的内容。
- 一个可见的“复制链接”按钮。

这正是让 WiseView 成为其他项目基础设施的原因：第三方在其 API 之上构建了软件包。可分享的查看器就不再只是演示。

---

## 8. 用户首先看到的

挑战的目标受众是**任何人**，而不是天文学家。

- **打开时预加载一个示例。** 任何人都不应看到空白输入框。让 WISE 0855 在页面加载时就已经在闪烁。
- **五个测试天区的按钮。** 一次点击，立即出结果，缓存是热的。
- **接受名称，而不仅是数字。** “Barnard's Star” 必须能用。
- **接受六十进制和度。** 见 skill `coordenadas-astro`。
- **有用的空状态。** 如果没有数据：说明有多少个历元（零）、可能的原因，并提供一个附近有数据的天区。评审团会随机输入坐标。
- **诚实的加载状态。** “正在向 IRSA 请求 14 个历元… 6 个已就绪”。绝不要一个无声的转圈：cutouts 很慢。
