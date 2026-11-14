<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/03_ARQUITECTURA.md) · [Español](../../es/docs/03_ARQUITECTURA.md) · **中文** · [Deutsch](../../de/docs/03_ARQUITECTURA.md) · [Italiano](../../it/docs/03_ARQUITECTURA.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/03_ARQUITECTURA.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 03 — 架构

架构方案,以及最重要的 **API 契约**,正是它使前端和后端能够从第 1 小时起并行推进。

这是活动前的方案。它将在第 1 小时用真实数据加以确认或修正
(见 [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) 末尾的检查清单),并记录在
[`adr/ADR-001-stack.md`](adr/ADR-001-stack.md) 中。

---

## 1. 两条路径,而且两条都要有

本项目有一条快速路径和一条完整路径。**关键在于快速路径是真实存在的**,
这得益于 DR1 全天区立方体以 HiPS 格式发布。

### A 路径 — 「102 种颜色的天空」,无后端

Aladin Lite 直接加载 IRSA 提供的 SPHEREx DR1 HiPS 立方体。用户浏览天空并拖动波长滑块。**零后端。**

- **提供什么:** 102 个波段、全天区背景、Gaia 和 CDS 星表的叠加层。
- **不提供什么:** 时间轴。立方体是合并后的马赛克,不是一系列历元。
- **成本:** 数小时,而非数天。技术风险低。
- **已解决的风险(11月14日):** IRSA 的 HiPS(`/data/hips/SPHEREx/spherex_allsky_cube`,PNG,102 个平面,第 50 和 51 个为空)在 Aladin Lite 3.8.2 中以开放 CORS 加载(`09_EDA_HALLAZGOS.md` §6)。CDS 的 B 计划(`alasky.cds.unistra.fr`)无法验证:当天返回 404。

### B 路径 — 时间 blink,带后端

这就是挑战本身。后端按位置查询 SIA2,请求每个历元的 cutout,
按波段分组、归一化,并返回按时间排序的帧序列。

- **提供什么:** 那段小视频。被评判的就是它。
- **成本:** 工作的主体。
- **瓶颈:** cutout 的延迟。没有缓存,演示撑不下来。

**两条路径装在同一个屏幕上。** Aladin Lite 提供背景和导航;旁边的面板
提供裁切区域的时间 blink。用户很快就能理解,这是同一份数据的两个维度。

---

## 2. 示意图

```
                   ┌───────────────────────────────────────────────┐
  Usuario ───────► │  FRONTEND  (React + Vite + TS)                │
  "Barnard's Star" │                                               │
  o  RA/Dec        │  ┌─────────────────┐  ┌────────────────────┐  │
                   │  │  Aladin Lite v3 │  │  Panel de blink    │  │
                   │  │  contexto +     │  │  <canvas>          │  │
                   │  │  cubo HiPS +    │  │  play/pausa, fps,  │  │
                   │  │  overlay Gaia   │  │  estiramiento,     │  │
                   │  └────────┬────────┘  │  color, resta      │  │
                   │           │           └─────────┬──────────┘  │
                   └───────────┼─────────────────────┼─────────────┘
                   VÍA A       │                     │  VÍA B
                   (directo)   │                     │
                               ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────────────┐
                 │  IRSA  HiPS cube │   │  BACKEND (FastAPI)       │
                 │  (DR1, Norder5)  │   │                          │
                 └──────────────────┘   │  /resolve  /epochs       │
                                        │  /frames   /spectrum     │
                                        │            /health       │
                                        │        │                 │
                                        │        ▼                 │
                                        │  ┌──────────────┐        │
                                        │  │ caché disco  │        │
                                        │  └──────┬───────┘        │
                                        └─────────┼────────────────┘
                                                  ▼
                        ┌──────────────────────────────────────────┐
                        │  IRSA:  SIA2  +  servicio de cutouts     │
                        │  CDS:   SIMBAD (nombres), HiPS, Gaia     │
                        └──────────────────────────────────────────┘
```

---

## 3. API 契约

**这是前端唯一可以视为确定的东西。** 任何改动都要讨论,先写在这里,
再通知团队。在后端尚不存在时,前端针对一个 mock 工作,该 mock 返回的正是这些形式。

所有坐标均为**十进制度**,ICRS。所有尺寸均为**度**。所有
日期均为 **ISO 8601 UTC**。

### `GET /api/health`

```json
{ "ok": true, "version": "0.1.0", "irsa_reachable": true, "cache_entries": 128 }
```

> **注(11月14日):** 后端骨架目前暴露的是 `/health`(没有 `/api`),并返回 `{ "ok": true }`。是否改为 `/api/health` 由 D1 决定。

### `GET /api/resolve?q=<texto>`

将名称解析为坐标(通过 SIMBAD)。这使工具对任何人都可用。

```json
{
  "query": "Barnard's Star",
  "resolved": true,
  "name": "V2500 Oph",
  "ra": 269.4521,
  "dec": 4.6933,
  "source": "SIMBAD"
}
```

若无法解析:`{"query": "...", "resolved": false, "error": "not found"}`,HTTP 200。
**找不到名称不是服务器错误。**

### `GET /api/epochs?ra=&dec=&size=&collections=`

该位置存在哪些观测。这是廉价的查询:**不下载图像**。
它用于让界面在帧准备期间立即显示「在 2025年5月至 2026年10月之间有 14 个历元」。

`collections` 的默认值:`spherex_dr1,spherex_qr3`。

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1,
  "n_epochs": 14,
  "time_range": ["2025-05-12T03:11:00Z", "2026-10-02T19:40:00Z"],
  "bands_available": [1, 2, 3, 4, 5, 6],
  "epochs": [
    {
      "id": "2025W19_2B_0073_2D3",
      "t": "2025-05-12T03:11:00Z",
      "band": 3,
      "detector": 3,
      "collection": "spherex_qr3",
      "access_url": "https://irsa.ipac.caltech.edu/ibe/data/spherex/...fits"
    }
  ]
}
```

### `GET /api/frames?ra=&dec=&size=&band=&stretch=&cmap=&mode=`

核心。返回可直接绘制的帧。

| 参数 | 取值 | 默认值 |
|---|---|---|
| `band` | `1`–`6`,或 `all` | `4` |
| `size` | 度 | `0.1` |
| `stretch` | `linear`, `sqrt`, `log`, `asinh`, `zscale` | `asinh` |
| `cmap` | `gray`, `viridis`, `magma`, `inferno` | `gray` |
| `mode` | `raw`, `zodi_subtracted`, `diff_first`, `diff_prev` | `zodi_subtracted` |

```json
{
  "ra": 133.7951, "dec": -7.2452, "size": 0.1, "band": 4, "mode": "zodi_subtracted",
  "pixel_scale_arcsec": 6.15,
  "wcs": { "crval1": 133.7951, "crval2": -7.2452, "cdelt1": -0.0017, "cdelt2": 0.0017 },
  "n_frames": 9,
  "frames": [
    {
      "t": "2025-05-12T03:11:00Z",
      "epoch_id": "2025W19_2B_0073_2D3",
      "wavelength_um": 3.41,
      "bandwidth_um": 0.031,
      "png": "/static/cache/ab12cd/0001.png",
      "flagged_fraction": 0.04,
      "vmin": -0.8, "vmax": 12.3
    }
  ],
  "warnings": ["La época 2026W02_1A no trae banda 4 y se omitió."]
}
```

契约的各项决定及其原因:

- **后端返回已渲染好的 PNG,而不是 FITS。** 把 FITS 发给浏览器,就得写一个
  FITS 读取器,并在 JavaScript 中应用拉伸和色彩映射:工作量翻倍,
  bug 翻三倍。代价是更改拉伸需要回到服务器;有缓存时
  这很便宜,之后还可以在客户端对 PNG 添加精细拉伸。
- **每帧的 `wavelength_um` 是必填的。** 这个字段能避免
  [`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §2 中描述的错误,并且在屏幕上显示出来,向评审团证明
  我们理解这台仪器。
- **`warnings` 是数组,不是错误。** 波段经常缺失;如果这会使请求失败,
  工具就无法工作。
- **`flagged_fraction`** 用一个字段覆盖了 *contamination flags* 那一条。(已测量:按位掩膜时约占裁切图的 4 %;若数 `FLAGS != 0` 则约为 72 %,因为 SOURCE 位并不是错误;`09_EDA_HALLAZGOS.md`。)

### `GET /api/spectrum?ra=&dec=&aperture=`

「额外加分项」。某一位置的光谱,即时生成。

```json
{
  "ra": 133.7951, "dec": -7.2452, "aperture_arcsec": 12,
  "n_points": 87,
  "spectrum": [ { "wavelength_um": 0.78, "flux_mjy": 0.42, "err_mjy": 0.08, "band": 1 } ],
  "method": "aperture photometry, zodi-subtracted",
  "caveat": "Valores indicativos, no fotometría científica. Ver docs/02."
}
```

`caveat` 字段**不是可选的**。在有天文学家的评审团面前,把近似光谱
当作经过校准的测光来展示,是最快丧失可信度的方式。

---

### 契约变更 — 2026年11月14日(查看器白板)

均为增量:此前的内容在形式上都没有改变,因此现有的 mock 和代码仍然有效。

- `/api/epochs` 和 `/api/frames` 中的 **`from` 和 `to`**(ISO 8601 UTC,可选):白板的
  「从 – 到」控件。不提供时,取所有历元。
- **以某颗恒星为中心的动画**(点击图像):没有新的端点。前端用该恒星的 `ra`/`dec` 和一个较小的 `size`(例如 `0.02`)
  调用 `/api/frames`。
- **鼠标悬停在恒星上时显示名称气泡:** `/api/resolve` 也接受 `ra`/`dec`
  (在 SIMBAD 中做锥形检索,半径 10″),并以同样的响应形式返回最近的天体。**注(11月14日):** 目前查看器直接从浏览器查询 SIMBAD(TAP,先用 CDS,以 Harvard 镜像作后备;`scaffold/frontend/src/sky/capas/simbad.ts`),而不是通过 `/api/resolve`。
- **Gamma:** 在客户端对 PNG 应用;不会发送到服务器。
- **为 Vercel 预先计算:** 5 个测试天区以静态文件发布,采用与此处完全相同的 JSON 形式,位于 `/precalc/<id>/epochs.json`、`/precalc/<id>/frames-b<band>.json` 及其 PNG。

## 4. 应用的 URL

挑战明确要求能够通过 URL 查询该工具。其格式是契约的一部分:

```
https://<dominio>/?ra=133.7951&dec=-7.2452&size=0.1&band=4&fps=4&stretch=asinh&mode=zodi_subtracted
https://<dominio>/?target=WISE+0855&size=0.2
```

规则:`target` 的优先级高于 `ra`/`dec`;任何缺失的参数取默认值;
**URL 始终反映查看器的当前状态**(通过 `history.replaceState` 更新),这样
复制地址栏就等于分享正在看的内容。这个功能使该工具成为其他项目的基础设施,就像 WiseView 那样。

---

## 5. 缓存

没有缓存就没有演示。这是最不起眼、也最重要的部分。

- **键:** `(ra, dec, size, band, mode, stretch, cmap)` 的哈希,坐标四舍五入到约 1 arcsec。
- **保存什么:** 渲染好的 PNG 和响应的 JSON。可选地保存 FITS cutout。
- **保存在哪:** 磁盘上的 `data/cache/`。对本次活动绰绰有余;只有在需要跨进程共享时才用 Redis。
- **预热:** **五个测试天区在服务器启动时预热。** 面向评审团的演示
  使用这五个。绝不用冷查询来演示。
- **TTL:** 24 小时内无需让任何东西过期。不构建不需要的东西。

---

## 6. 部署

挑战写的是「public-facing web tool」。评审团能打开的一个 URL 胜过任何
幻灯片。

- **前端:** 在任何 CDN 上的静态构建(Vercel、Netlify、GitHub Pages)。
- **后端:** 在有免费套餐的服务中运行的容器。**当心那些因不活跃而让
  容器休眠的服务**:如果评审团打开 URL 后要等 50 秒,就完了。因此需要
  预热,必要时还要定期 ping。
- **必须有 B 计划:** 录制好的演示视频,以及应用中一个无需访问 IRSA、
  用缓存数据即可工作的模式。**黑客松的 wifi 会断。** 见 [`07_RIESGOS.md`](07_RIESGOS.md)。

---

## 7. 我们有意不做的事

提前写下来,免得凌晨 4 点有人再重新讨论:

- **我们不写自己的天空查看器。** Aladin Lite 已经存在,而且挑战中提到了它。
- **我们不实现 shift-and-stack。** 见 [`01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) §3。
- **我们不训练视频模型。** 同上,§6。
- **我们不做科学级质量的测光。** 为此有 IRSA 的 Spectrophotometry Tool。
- **我们不搭建用户账户。** 如果需要保存一个发现,就把它保存为 URL。
- **我们不重新处理任何 1 级数据。** 我们从 2 级开始,那才是已发布的。


---

## 待团队商定(11月14日)

这些提议来自文档审查([`REVISION_DOCUMENTACION_2026-11-14.md`](REVISION_DOCUMENTACION_2026-11-14.md))和 EDA 中测量的数据。它们**不改变上文现行的契约**:只有在团队同意后才应用(README §5,规则 4)。

1. **日期过滤器的名称。** 契约写的是 `from` 和 `to`;分支 `d/prototipo-rango-fechas` 的原型使用 `start` 和 `end`。需商定一种。
2. **原型的新路由。** `/api/grid`(按波段和日期列的访问)、`/api/frame`(每次访问一帧)和 `/api/presets`(5 个带传播位置的天区)存在于该分支中,但此处没有列出。`docs/10` 已引用 `/api/presets`。
3. **请求匹配波长和按扫描轮次求和。** `/api/frames` 没有办法请求匹配波长的历元,也无法请求按扫描轮次的曝光求和;EDA 的结论是视频的自然单位是扫描轮次(3-4 帧),并且必须使波长匹配(`09_EDA_HALLAZGOS.md` §2)。
4. **默认集合。** `collections=spherex_dr1,spherex_qr3` 使 R Dra 几乎没有数据,它主要位于 `_deep` 中(1,233 + 733 个文件,对比 422 + 126 个常规文件;`09_EDA_HALLAZGOS.md` §1)。
5. **磁盘缓存与 Vercel。** Vercel Functions 没有持久化磁盘;如果 `/api` 在那里运行,缓存(`data/cache/`)就必须放在内存或外部存储中(ADR-001,11月14日更新)。
6. **污染掩膜。** 在契约中记录:`flagged_fraction` 用按位掩膜计算,绝不用 `FLAGS != 0`。
