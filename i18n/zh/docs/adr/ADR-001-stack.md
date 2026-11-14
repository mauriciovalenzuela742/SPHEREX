<!-- i18n-header -->
> 🌐 **语言:** [English](../../../en/docs/adr/ADR-001-stack.md) · [Español](../../../es/docs/adr/ADR-001-stack.md) · **中文** · [Deutsch](../../../de/docs/adr/ADR-001-stack.md) · [Italiano](../../../it/docs/adr/ADR-001-stack.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/adr/ADR-001-stack.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# ADR-001 — 项目技术栈

- **日期：** 2026-11-14（活动前提议）
- **状态：** **提议**；于 11月14日 根据 EDA 数据更新（见“2026年11月14日下午更新”）。**待 C（Mauricio）签字。**
- **决策人：** C（Mauricio）；待签字

## 背景

需要在约 24 小时内构建一个公开的网页工具，团队有六位编程人员及其智能体。数据在 IRSA/IPAC 档案库中，而能读取它们的库（`astropy`、`pyvo`、`astroquery`）**只存在于 Python 中**。题目明确建议使用 Astropy 和 Aladin。

约束：

- 24 小时，且提交截止时间固定。
- 六个人并行：工作必须可以拆分。
- 必须留下一个评审团能够打开的公开 URL。
- 没有基础设施预算，也没有可用于任何重型任务的 GPU。

## 考虑过的方案

| 方案 | 优点 | 缺点 | 成本 |
|---|---|---|---|
| **Python/FastAPI + React/Vite + Aladin Lite** | 分离后端和前端，两个人从第 1 小时起即可并行；看起来像一个公开工具；Aladin 解决了天空显示 | 两个部署、CORS、需要维护一份契约 | 中 |
| Streamlit | 全部用 Python，几分钟即可启动 | 难以打磨；看起来不像公开工具；流畅的闪烁很费劲 | 低 |
| 静态前端 + Aladin Lite，无后端 | 部署简单，无需维护 | **取决于 IRSA 是否以 CORS 响应**（11月14日 被否决：IRSA 在 HiPS 之外不提供 CORS，`docs/09`）；无法在服务器端裁切、归一化或做减法 | 低，但带有一个我们无法控制的风险 |

## 2026年11月14日下午更新 — 部署决策（C，基于 EDA 数据）

**状态：C（Mauricio）的提议，待团队在下一次 standup 中认可。**

### 起决定作用的数据（EDA，`eda/resultados/latencia_cutouts.json`，`docs/09_EDA_HALLAZGOS.md`）

- 一个 0.1° 的 cutout 耗时**中位数 7.3 s，p90 10.8 s，最长 29 s**（约 3.9 MB），**时而出现 503**。
- 4 个线程下 25 个 cutouts：墙钟时间 **52 s**。一次完整的“实时”闪烁不可能放进合理的等待时间里。
- **IRSA 不以 CORS 响应**（SIA2 和文件均如此）：除 HiPS 立方体之外的一切都要经过后端。
- 对 `spherex_dr1` 和 `spherex_qr3` 的 SIA2：每次 1–3.5 s；通过 HTTP Range 获取 header 约 35 KB，实际约 0.1 s。

### 决策

| 部分 | 运行位置 | 原因 |
|---|---|---|
| 前端 | **Vercel**（项目 `spherex-planet-x`，团队 eMind，Hobby），从 `main` 生产部署 | 已经可用；组织方指定了它 |
| **5 个测试天区**（演示） | **预先计算为静态文件**，放在 `scaffold/frontend/public/precalc/<id>/`（契约格式的 JSON + PNG），由 D1 的脚本生成并纳入版本管理 | 演示**绝不**等待 IRSA，也不依赖 wifi。这也是离线模式 |
| `/api/resolve`, `/api/epochs` | 同一项目（`api/`）中的 **Vercel Python Functions** | 1–3.5 s：绰绰有余。同域名，无 CORS |
| 用于任意坐标的 `/api/frames` | **带时间预算的 Vercel Python Functions**：并行（4）下载能下载的部分，返回已就绪的，并将其余标记为 `pending`；前端再次请求，并随着帧到达逐步显示 | 无需另建服务即可避免 52 s 的等待 |
| 若函数不够用（最大时长、astropy/reproject 的内存、包体积）则采用的 B 计划 | **同一个 FastAPI 放在容器中**（Render 或 Fly，免费层），位于 `/api` 之后，通过 Vercel 的 *rewrite* 转发 | 换位置不会改变契约 |

由此得出的规则：

- **缓存：** 函数没有持久磁盘（仅每个实例的 `/tmp`）。演示不设计任何依赖缓存的东西：预先计算的静态文件就是为此而设。
- **函数最大时长：** 用 `vercel.json` 中的 `maxDuration` 设定。在依赖某个值之前，**先在 Vercel 文档中核对 Hobby 计划当前的上限**（D1，在 `api/` 的首次部署时）。
- **演示天体：** 五个测试天体必须都能工作。WISE 0855 是必选案例，并且始终展示，同时说明它在单次曝光中显得很暗（它的运动通过减法体现，待有了 D2 的按扫描轮次求和后（待办），以及 V2 的 CatWISE2020 overlay（已在分支 `v/v2-catwise` 中完成，待 PR）后也能体现）。eps Ind B 是运动最清晰的地方；Barnard 能看到但会饱和。始终以**传播后的位置**为中心，而不是 J2000。
- **部署：** Vercel Hobby 只构建 Mauricio 的 commits；生产环境来自他的 merge。见 README §2。

### 每个人据此做什么

- **D1（Vladimir）：** 5 个天区的预计算脚本 → `public/precalc/`；带有 `resolve` 和 `epochs` 的 `api/`。
- **D2（Bryan）：** 带时间预算和部分响应（`pending`）的 `frames`。
- **V1（Antonia）：** 如果天区是测试天区，blink 先读取 `precalc/<id>/`；否则调用 `/api/frames`，带重试，帧逐步出现。
- **C（Mauricio）：** 测量 `api/` 的首次部署，若不够用则启用 B 计划。

## 决策

**后端用 Python 3.11 + FastAPI；前端用 React + Vite + TypeScript，配合 Aladin Lite 3.8.2。** 磁盘缓存。前端放在 Vercel（11月14日 已决定）。针对任意坐标的后端：采用上面更新中 C 的提议（带时间预算的 Vercel Python Functions；B 计划为同一个 FastAPI 放在容器中），并结合已测得的 cutout 耗时：中位数 7.3 s，p90 10.8 s，最长 29 s，无论尺寸约 3.9 MB，时而出现 503（`docs/09` §6）。5 个测试天区以预先计算的静态文件提供。

API 契约使并行工作成为可能，它位于 [`../03_ARQUITECTURA.md`](../03_ARQUITECTURA.md)。

## 后果

**容易的：** D 和 V 从第一个小时起同时工作而不互相干扰；使用 Astropy 的整个生态；在服务器端缓存和归一化，这使闪烁变得可行。

**困难的：** 必须维护一份契约和两个部署；前端与后端之间的 CORS 需要一次性配置好。

**如果我们错了：** 路线 A（Aladin Lite 直接加载 DR1 的 HiPS 立方体）**不依赖后端**。如果后端挂了或来不及，这一部分仍然可用，仍有东西可展示。这就是这项决策的保险。

## 何时复审

**活动第 3 小时**（已在 11月14日 测量：见 `docs/09`），配合 [`../02_DATOS_SPHEREX.md`](../02_DATOS_SPHEREX.md) 的数据检查清单。如果 cutouts 太慢，或 IRSA 不以 CORS 响应，就在这里复审，而不是之后。
