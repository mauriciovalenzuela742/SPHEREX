---
name: coordenadas-astro
description: 天球坐标及其无误处理 - 赤经和赤纬、六十进制与十进制度之间的转换、小时与度之间的 15 倍系数、FITS 的 WCS 以及用 astropy 进行像素-天空转换、自行以及如何预测一颗恒星在另一个历元的位置、用 SIMBAD 解析名称，以及挑战的五个测试天区。在解析或验证用户输入的坐标、在格式之间转换、使用 WCS 或 world_to_pixel、计算另一日期的位置时激活；或在提到 RA、Dec、ICRS、J2000、六十进制、自行、视差、SIMBAD 或测试天区时激活。
---

<!-- i18n-header -->
> 🌐 **语言:** [English](../../../../en/.claude/skills/coordenadas-astro/SKILL.md) · [Español](../../../../es/.claude/skills/coordenadas-astro/SKILL.md) · **中文** · [Deutsch](../../../../de/.claude/skills/coordenadas-astro/SKILL.md) · [Italiano](../../../../it/.claude/skills/coordenadas-astro/SKILL.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `.claude/skills/coordenadas-astro/SKILL.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 不出错地处理天球坐标

---

## 1. 最常犯的错误

**赤经可以用小时或度表示，两者之间有一个 15 倍的系数。**

```
RA = 08h55m10.831s  →  8.9196753 horas  →  133.795129 grados
```

如果你把 `08h55m` 当作度，你会指向距离天体 112 度之外的位置。查询会返回完全有效、但属于错误天区的图像，而且**什么都不会失败**：没有错误，没有异常，只有一个悄无声息的错误结果。

赤纬始终以度表示（−90 到 +90）。`-7d14m42.53s` 是度、角分和角秒。

**永远不要手工解析坐标。** 使用 `astropy.coordinates.SkyCoord`，它几乎什么都能理解：

```python
from astropy.coordinates import SkyCoord
import astropy.units as u

SkyCoord("08h55m10.831s", "-07d14m42.53s", frame="icrs")
SkyCoord("08 55 10.831 -07 14 42.53", unit=(u.hourangle, u.deg))
SkyCoord(133.795129, -7.245147, unit="deg")
```

**注意 `unit=(u.hourangle, u.deg)`**：当 RA 以小时、Dec 以度给出时（六十进制格式的常见情形），这是正确的搭配。

### 验证用户输入的内容

接受这四种形式，并在做任何事情之前归一化为 ICRS 十进制度：

1. `133.795129 -7.245147`（十进制度）
2. `08h55m10.831s -07d14m42.53s`
3. `08:55:10.831 -07:14:42.53`
4. `WISE 0855`（名称 → SIMBAD）

当收到两个独立的数字时，区分 1 和 3 的实用规则：**如果带有 `h`、`:` 或空格作为内部分隔符，就是六十进制。** 如果有歧义，请询问用户，而不是猜测。Dec 中的负号很容易丢失：要明确地检查它。

有效范围：RA ∈ [0, 360)，Dec ∈ [−90, +90]。RA 在 360 处回绕；Dec 不回绕。

---

## 2. WCS：从像素到天空

WCS 在 FITS 头中，负责像素 ↔ 坐标的转换。

```python
from astropy.wcs import WCS
from astropy.io import fits

with fits.open(ruta) as hdul:
    w = WCS(hdul["IMAGE"].header)

x, y = w.world_to_pixel(coord)      # devuelve 0-based
coord = w.pixel_to_world(x, y)
```

三个陷阱：

1. **`world_to_pixel` 返回 0-based；FITS 头是 1-based。** IRSA 在 SPHEREx 文档中处理 PSF 时明确提示了这一点。如果你看到一像素的偏移，就是这个原因。
2. **在 MEF 中，每个扩展可能有自己的 WCS。** `IMAGE` 的 WCS 不一定适用于 PSF。
3. **裁切图的 WCS 不是原图的 WCS。** IRSA 的 cutout 服务会调整裁切图的 WCS，但保留像 `CRPIX1A`/`CRPIX2A` 这样指向原始图像的键。在用 PSF 做任何计算之前，请先阅读 skill `spherex-datos`。

两个位置之间的角距离：`coord1.separation(coord2)`。不要在 RA 和 Dec 上用勾股定理计算：在极点附近是错的，因为 RA 的一度不等于弧长的一度。系数是 `cos(dec)`。

---

## 3. 自行：它在另一个日期会在哪里

这个计算使得可以把 Gaia 叠加在某个具体历元的图像上，它既是挑战的一个要点，也是查看器正确性的证明。

```python
from astropy.time import Time

c = SkyCoord(ra=..., dec=..., unit="deg",
             pm_ra_cosdec=... * u.mas/u.yr,
             pm_dec=... * u.mas/u.yr,
             obstime=Time("2016.0", format="jyear"))   # época del catálogo
c_en_2026 = c.apply_space_motion(new_obstime=Time("2026-10-02"))
```

- **Gaia DR3 的参考历元是 J2016.0。** 不是 J2000。混淆它们会带来 16 年自行的误差。
- **WISE 0855−0714 不在 Gaia 中**（它太冷，在光学波段太暗）。对于它的叠加层和传播位置，请使用 CatWISE2020（IRSA 中的 `catwise_2020`），它带有自行；其参考历元约为 MJD 57170（约 2015.4）。请在表的模式中确认单位和历元。
- `pm_ra_cosdec` 已经包含 `cos(dec)` 系数。星表通常这样给出；如果你的数据源给的是“原始”的 `pmra`，请转换它。
- 量级尺度：100 mas/yr 是每年 0.1 角秒。对于像 SPHEREx 这样约 6 角秒的像素，要看到一个像素的位移，需要**很大的**自行或好几年的时间。这就是为什么挑战的测试天体是现在这些：它们是因为自行巨大而被选中的。

---

## 4. 解析名称

为了让工具可供任何人使用，必须接受“Barnard's Star”，而不只是数字。

```python
SkyCoord.from_name("Barnard's Star")          # usa el servicio Sesame del CDS
```

或使用 `astroquery.simbad`。对公共工具的注意事项：

- **始终带超时并处理失败。** 它们是外部服务，会宕机。
  *（2026 年 11 月 14 日核实：位于斯特拉斯堡的 CDS 服务当时宕机。CfA 的镜像
  `simbad.cfa.harvard.edu` 可以响应，并提供相同的数据。**两个都准备好，并从一个回退到另一个。**）*
- **缓存响应。** 五个测试天区解析一次后保存。
- **B 计划：** 一张包含五个测试天区和最常被请求天体的本地表
  （`data/campos_de_prueba.yml`），使演示永远不依赖第三方服务。

---

## 5. 五个测试天区

它们是题面所点名的。**它们起到验收标准的作用**：如果查看器在这五个上表现良好，它就完成了。

坐标（2026 年 11 月 14 日对照 SIMBAD 核实）、每个天区应当看到什么以及自行，都在
[`data/campos_de_prueba.yml`](../../../../../data/campos_de_prueba.yml) 中。

**该文件中有两个已核实的陷阱，在动代码之前最好了解：**

1. **题面给出的 WISE 0855 坐标属于 WISE 的历元（约 2010.4），不是今天的。**
   该天体每年移动 8.15 角秒：到 2026 年底，它距离那个坐标约 130 角秒。在 0.05 度或更小的视场下，**指向题面的坐标会让天体落在视场之外**，查看器看起来坏了，其实没坏。
2. **`eps Ind B`（大写）是褐矮星对；`eps Ind b`（小写）是一颗行星**，
   它在 402 角秒之外，位于恒星的位置。MAST 的解析器不区分大小写，会返回那颗行星。如果你的名称解析不区分大小写，你就会指向错误的天体。

**还有一个需要从一开始就具备的预期：** 在 6.15 角秒的像素尺度下，即使是天空中最快的天体，在 SPHEREx 的两次连续扫描之间（相隔 6 个月）也**移动不到一个像素**。EDA（`docs/09`）中测得，在整个可用时段（1.0-1.4 年）内它们移动 1.1-1.8 px。这意味着要使用可用的最大时间基线，而不是连续的历元，也使图像相减和缩放变得非常有价值。

| 天体 | 它证明什么 |
|---|---|
| **WISE 0855** | 自行非常高。**必选案例：总是要展示。** 在单次曝光中看起来很暗；它的运动（约 1.3 px）通过相减和按扫描叠加可见（待办，D2；CatWISE2020 叠加层已在分支 `v/v2-catwise` 完成，待 PR，V2）。题面的坐标：2010 历元，请使用传播后的 |
| **Barnard's Star** | 已知最大的自行。可以看到，但会饱和：运动只是定性的 |
| **Epsilon Indi B** | 褐矮星对。**运动在这里看得最清楚**（测得 −0.85/−0.71 px；与 SIMBAD 吻合） |
| **RW Aurigae** | 变星：亮度会变化。它会饱和，相减即使不动也会留下红/蓝一对：这不是变光的证据 |
| **R Draconis** | 大振幅的长周期变星。亮度未测量（`docs/09`） |

“它在移动”/“只是亮度在变”这一对，证明了查看器能区分这两种情况。在 pitch 中最好各展示一个。

---

## 6. 确认坐标无误之前的检查清单

- [ ] RA 是度还是小时？你转换了吗？
- [ ] Dec 的符号在解析后保留了吗？
- [ ] RA ∈ [0,360) 且 Dec ∈ [−90,90]？
- [ ] 坐标系是 ICRS 吗？（J2000 与 ICRS 在实际应用中一致；银道系则不然。）
- [ ] 如果有自行，星表的历元是什么？Gaia 是 J2016.0 吗？
- [ ] 如果用了 WCS，是 0-based 还是 1-based？
- [ ] **你对照外部来源核实了吗？** 把坐标粘贴到 SIMBAD 或 Aladin 中，看它是否落在应在的位置，只需三十秒，却能省下数小时。
