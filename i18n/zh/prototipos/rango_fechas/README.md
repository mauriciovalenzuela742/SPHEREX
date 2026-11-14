<!-- i18n-header -->
> 🌐 **语言:** [English](../../../en/prototipos/rango_fechas/README.md) · [Español](../../../es/prototipos/rango_fechas/README.md) · **中文** · [Deutsch](../../../de/prototipos/rango_fechas/README.md) · [Italiano](../../../it/prototipos/rango_fechas/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `prototipos/rango_fechas/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 原型：两个日期之间什么东西移动了？

独立原型（不触碰 `scaffold/`，也不触碰 `docs/03` 的契约）。给定天空中的一个点、一个波段和一个
**日期范围**，它向 IRSA 请求**仅必要的裁切图**（每次访问一张图像，或可选地将一次访问的
若干曝光相加），将它们对齐为北向上，并显示：

- 访问之间的**闪烁**，带有每一帧的日期和波长。
- **最后一张 − 第一张的相减**：红色 = 出现的亮度，蓝色 = 原先存在的亮度。一对红/蓝 = 运动。
- **彩色合成**：第一张为红色，最后一张为青色。
- 表格：观测、集合、中心的 λ，以及受污染像素的百分比（FLAGS）。

此外，`eda_spherex.ipynb` 是对数据的**探索性分析**：清单、一个裁切图的剖析、
线性可变滤光片的效应、序列和相减，以及对照自行检验运动。

## 如何运行

从仓库根目录：

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r prototipos/rango_fechas/requirements.txt
.venv/bin/uvicorn --app-dir prototipos/rango_fechas servidor:app --port 8010
# abrir http://localhost:8010
```

Notebook：用 `.venv` 的内核打开 `prototipos/rango_fechas/eda_spherex.ipynb`，并修改 `CAMPO`。

裁切图保存在 `data/cache/prototipo/`（被 git 忽略）。不会整个下载任何东西。

## 浏览器（`/explorar`）

打开 http://localhost:8010/explorar。

- **大图**在左边（方形，在容纳范围内尽可能大），**右边的侧栏**包含过滤器
  （天体、RA/Dec、起止日期、波段、天区、每次访问的曝光数）、可见的波段、
  模式（图像 · 相对 t₀ 的相减 · 彩色）、图像数据，以及所有波段和日期的缩略图。
- 图像下方的**时间指针**：访问按其真实日期排列。只需移动鼠标（或拖动）
  就能改变日期；←/→ 切换访问，↑/↓ 切换波段，空格键播放。日期旁边可以看到自 t₀ 起的 Δt 和 λ。
- **渐进式加载：** 先是访问（`/api/grid`），然后图像逐张加载，先加载 t₀ 和 t_último。
- **通过 HTTP 范围的快速读取器**（默认）：只向原始档案文件请求裁切图对应的 IMAGE 行，
  以及末尾的 WCS-WAVE 表；不带 PSF。Barnard，6 个波段，28 张图像：**8.7 s**（6 个波段的 t₀ 和 t_último
  在 3.7 s 时就绪），而使用 cutout 服务约需 98 s。它不读取 FLAGS（污染显示为“—”），并且减去
  中位数而不是 ZODI（测得差异：0.07 倍噪声）。如果失败，则使用 cutout 服务。
- **如果 IRSA 不响应**，则使用保存在 `data/cache/prototipo/sia/` 中的搜索并给出提示；如果
  该点从未被查询过，则显示明确的消息（HTTP 503）。

探测器成对出现，观测同一片区域（1+4、2+5、3+6），每一对在不同的日子经过某个点：
所以在缩略图中会有一些列只有两个波段有图像。

## API

| 路由 | 作用 | 成本 |
|---|---|---|
| `GET /api/presets` | 5 个测试天区，位置为按自行**传播**到今天的 | 无 |
| `GET /api/epochs?ra&dec&band&start&end` | 可用的访问（SIA2，不含图像） | 约 2 s，约 0.2 MB |
| `GET /api/frames?ra&dec&band&start&end&size&max_visits&per_visit` | PNG 帧 + 相减 + 彩色 | 第 1 次每个裁切图约 4 MB、约 5–12 s；之后走缓存 |
| `GET /api/grid?ra&dec&bands=1,2,5&start&end` | 按波段的访问和日期列（不含图像） | 约 2–5 s |
| `GET /api/frame?ra&dec&band&visit&start&end&size&per_visit&fast` | 一帧，以 base64 编码的 float32（约 19 KB） | `fast=true`（默认）约 0.6–1 s；`fast=false` 约 11 s |

页面的 URL 反映了查询（`?ra=…&dec=…&band=…`），所以可以分享。

## 如何验证的（2026 年 11 月 14 日）

| 测试 | 结果 |
|---|---|
| Barnard，波段 2，每次访问 3 次曝光 | 测得向**北** 1.44–1.50 px，预测 1.66–1.81 px（误差 1.3–2.3″） |
| WISE 0855，波段 5，每次访问 6 次曝光 | 测得向**西** 1.30–1.32 px，预测 1.31–1.34 px（误差 0.6–1.2″） |
| RW Aur（无运动的对照），波段 3 | 测得 ≤ 0.22 px（≈ 0），符合预期 |
| 由 `WCS-WAVE` 得到的 λ | 波段 3（1.63–2.41 µm）的一个裁切图中为 2.288 µm：一致 |
| 一颗恒星的流量对日期 / 对 λ | 对日期无序跳变，对 λ 有序增长：这是线性可变滤光片的效应 |

## 对项目重要的发现

1. **必须重投影。** 每个裁切图来自取向不同的指向；不对齐的话，闪烁会旋转。
2. **WISE 0855 在单次曝光（113 s）中看不到**，波段 5：必须在每次访问中叠加 4–6 次。
3. **在星密集的天区，`FLAGS` 的 `SOURCE` 位在约 100 % 的像素中出现。** 它是信息性的；如果把它
   算作污染，一切看起来都没法用。位的定义在头中（`MSKNnnnn`）。
4. **IRSA 在 6 个裁切图并行时返回了 503。** 用 3 个并行并带等待的重试，就能工作。
5. **裁切图重约 4 MB，但有用的图像只有约 40 KB**：其余是 PSF（`EPSF`），它总是整个带来。
6. **各历元处于不同的 λ**，即使在同一个波段内（例如 1.24–1.63 µm）：亮度变化的一部分来自滤光片。界面会提示这一点。

## 未验证的内容

- 界面没有在真实浏览器中用点击测试过：只验证了 API 及其返回的图像。
- eps Ind B 和 R Dra 没有测试。
- notebook 的位移测量对暗弱天体使用 5 px 的窗口，对明亮天体使用 15 px 的窗口；
  窗口选错会得到很差的结果（用 RW Aur 验证过）。它不是天体测量。
- 没有校正视差（对 Barnard 约 0.5″，不到 0.1 px）。
- 在部署环境（Vercel 或其他）中的响应时间没有测量。
- 被遮盖的 FLAGS 位（`TRANSIENT`、`SUR_ERROR`、`NONFUNC`、`MISSING_DATA`、`HOT`、`COLD`、
  `OUTLIER`）是合理的选择，不是 IRSA 的官方建议。

---

This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of
Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the
California Institute of Technology, and is funded by the National Aeronautics and Space Administration.
