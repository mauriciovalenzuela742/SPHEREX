<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/data/README.md) · [Español](../../es/data/README.md) · **中文** · [Deutsch](../../de/data/README.md) · [Italiano](../../it/data/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `data/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# data/

## 这里放什么

- `campos_de_prueba.yml` — 题目中的五个天体,附坐标以及每个天体应当看到什么。
  **请阅读该文件的头部:五个坐标都已核实(11月14日,通过 Harvard 镜像的 SIMBAD);而 `campos_extra` 则没有。**
- 小型参考表(裁剪后的星表、目标列表)。

## 这里不放什么

**任何大的东西和任何下载的东西。** 具体来说:

- FITS 文件。一个 SPHEREx 的 MEF 约 70 MB。
- 裁切图、渲染好的 PNG、缓存。
- 从 IRSA、CDS 或任何地方下载的数据。

所有这些都放在 `data/cache/`,该目录在 `.gitignore` 中。如果某个数据文件出现在 `git
status` 里,说明哪里做错了。

## data/cache/

本地工作文件夹,不做版本管理。由后端在启动时创建。

建议的结构:

```
data/cache/
├── fits/        # cutouts bajados de IRSA
├── png/         # fotogramas renderizados
└── meta/        # respuestas JSON cacheadas
```

**服务器启动时,用五个测试天区预热它。** 面向评审团的演示
绝不使用冷查询。

## 安全提示

所有下载的东西都是**不可信的内容**。把它保存在它自己的文件夹中,与
代码分开,并以参数形式把路径传给脚本,而不是从
数据文件夹内部运行解释器。
