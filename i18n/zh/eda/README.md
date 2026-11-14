<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/eda/README.md) · [Español](../../es/eda/README.md) · **中文** · [Deutsch](../../de/eda/README.md) · [Italiano](../../it/eda/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `eda/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# eda/ — 对 SPHEREx 真实数据的探索

这些脚本使用 IRSA 的真实数据回答第 1 小时的检查清单（[`docs/02_DATOS_SPHEREX.md`](../docs/02_DATOS_SPHEREX.md) §9）。**结论见 [`docs/09_EDA_HALLAZGOS.md`](../docs/09_EDA_HALLAZGOS.md)**；由此得出的工作分工建议见 [`docs/10_REPARTO_DE_TRABAJO.md`](../docs/10_REPARTO_DE_TRABAJO.md)。

这**不是生产代码**。它用于理解数据。后端按照 `docs/03_ARQUITECTURA.md` 的契约写在 `scaffold/backend/app/` 中；这里有用的部分会连同测试一起复制过去。

## 如何运行

```bash
py -3.11 -m venv .venv
.venv/Scripts/python -m pip install astropy pyvo matplotlib numpy requests pyyaml reproject scipy
.venv/Scripts/python eda/01_inventario.py         # ~1 min   SIA2 en los 5 campos
.venv/Scripts/python eda/02_longitud_de_onda.py   # ~3 min   1 header por archivo (HTTP Range)
.venv/Scripts/python eda/03_recortes_y_figuras.py # ~1 min   cutouts reales + figuras
.venv/Scripts/python eda/04_infraestructura.py    # ~15 s    CORS, cubo DR1 (SIA2 y HiPS de IRSA), HiPS del CDS
.venv/Scripts/python eda/05_centroides.py         # ~10 s    movimiento medido vs SIMBAD
```

（在 Linux/Mac 上：`.venv/bin/python`。）

## 每个脚本的作用

| 脚本 | 问题 | 纳入版本管理的输出 |
|---|---|---|
| `01_inventario.py` | 每个天区有多少文件、指向、探测器和扫描轮次？DR1 和 QR3 是否重叠？ | `resultados/inventario.json` |
| `02_longitud_de_onda.py` | 目标在每个文件中落在什么 λ 上？各历元之间变化多大？ | `resultados/lambda_por_archivo.csv`, `resultados/lambda_resumen.json` |
| `03_recortes_y_figuras.py` | 一个 cutout 需要多久？能看到运动吗？如果不匹配 λ 会怎样？ | `figuras/*.png`, `resultados/latencia_cutouts.json` |
| `05_centroides.py` | 测得的位移是否与 SIMBAD 预测的一致？ | `resultados/centroides.json` |
| `04_infraestructura.py` | IRSA 有 CORS 吗？DR1 立方体可以裁切吗？是否有适用于 Aladin 的 HiPS？ | `resultados/infraestructura.json` |

辅助模块：`comun.py`（路径、天区、自行传播）和 `espectral.py`（无需下载整个 MEF 即可读取每个像素的 λ）。

## 规则

- FITS 文件存放在 `data/cache/eda/`（被 git 忽略）。绝不放入仓库。
- 脚本对 IRSA 最多同时发出 6 个请求。不要提高这个数字：它是公共服务，在低负载下就曾向我们返回 503。
