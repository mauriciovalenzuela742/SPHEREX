<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/08_REGLAS_DEL_EVENTO.md) · [Español](../../es/docs/08_REGLAS_DEL_EVENTO.md) · **中文** · [Deutsch](../../de/docs/08_REGLAS_DEL_EVENTO.md) · [Italiano](../../it/docs/08_REGLAS_DEL_EVENTO.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/08_REGLAS_DEL_EVENTO.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 08 — 活动规则，以及我们在此之前可以做什么

本文档的目的，是让所有人都清楚在黑客松之前哪些准备是合规的，哪些不是。这些规则适用于整个团队及其智能体。

---

## 重要的规则

NASA Space Apps 的规则原文如下：

> Teams are not allowed to begin working on the challenges prior to the hackathon.

在黑客松之前，不允许**开始处理挑战**。

## 我们如何解读

这条规则禁止的是提前做出解决方案，而不是禁止阅读。我们的标准比较保守：

### 活动前可以做

- **阅读**题目、*Resources* 以及 NASA、IRSA 和 CDS 的公开文档。
- **调研技术现状**：论文、公开仓库、已有的工具。
- **撰写文档**：我们对仪器了解什么、有哪些格式、以前做过什么。
- **约定如何工作**：角色、分支、时间安排、截止标准。
- **准备环境**：安装 Python、Node、Docker；配置编辑器和智能体。
- **通用脚手架**：一个 FastAPI 的“hello world”和一个 Vite/React 的“hello world”、一个 `docker-compose`、一个运行 linter 和测试的 CI。这相当于把编辑器配置好；它不解决挑战中的任何问题。

### 活动前不可以做

- **编写解决挑战的代码**：IRSA 客户端、MEF 读取器、裁切逻辑、归一化、blink 组件、WCS 解析。
- **为项目下载并预处理** SPHEREx 数据。
- **制作查看器界面的原型**，哪怕“只是试一试”。
- 任何一旦去掉就会让我们完成的项目变少的东西。

### 实践检验

> 如果明天我们被分到另一个挑战，这个还会有用吗？

如果答案是肯定的（方法论、文献、环境、约定），那就是准备工作。如果是否定的（一个 SIA2 客户端、一个 blink 组件），那就是针对挑战的工作，需要等待。

## 按这一检验衡量，本套件包含什么

| 目录 | 判断 |
|---|---|
| `docs/00_DESAFIO.md` | 一个公开页面的转录。准备工作 |
| `docs/01` – `docs/08` | 调研与方法论。准备工作 |
| `biblio/` | 公开文献。准备工作 |
| `data/campos_de_prueba.yml` | **题目本身**中点名天体的公开坐标。参考，而非解决方案 |
| `.claude/` | 工作工具的配置。准备工作 |
| `scaffold/` | 通用的 FastAPI 和 Vite“hello world”，不含任何 SPHEREx 内容。环境 |
| `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONTRIBUTING.md` | 团队约定。准备工作 |

**截至 11月13日，本仓库中没有一行代码查询 IRSA、读取 FITS 或绘制帧。** 自正式开始（11月14日 10:00）起，团队开始处理挑战：见 `eda/`、`scaffold/frontend/src/sky/` 以及 [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md)。

如果团队中有人对某个具体情况有疑问，规则是：**在做之前先询问本地活动的组织者。** 花十分钟询问，比被取消资格要划算。

---

## 其他影响工作的活动规则

- **团队：** 最多 6 人。一个人不能同时属于两个团队，每个团队只处理一个挑战。
- **AI 使用：** 允许使用，并且**每次提交都必须包含对其使用方式的说明**。这不是可选项。模板在 skill `entrega-nasa` 中。
- **未满 18 岁者：** 不得上传自己的照片作为头像，也不得在演示或提交材料中以照片、视频或声音出现。
- **提交：** 通过 spaceappschallenge.org 上的项目页面，按本地活动的截止时间。
- **第三方数据：** NASA 声明不为非政府网站背书，并且必须遵守各网站的使用条款。实际做法是：遵守 CDS、IRSA 和 CSA 的许可证与署名说明。

## 许可证与发布

计划在活动开始时以 MIT 许可证发布本仓库。两点注意：

- 在 README 和工具页脚中**逐字署名 SPHEREx**（[`02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) §8）。
- **不对数据做版本管理**：FITS 和缓存的 PNG 不放入仓库。

## 活动中宣布的规则（2026年11月14日）

由组织方现场口头宣布；我们没有对照官方页面核实。如果与 `docs/00_DESAFIO.md` 或平台不一致，以平台为准。

1. **数据：** NASA 及其合作机构的开放数据。
2. **提交截止：** 上午 11:00（活动当地时间）。
3. **提交内容：** 项目名称和摘要、最终演示的链接、所用的 NASA 数据和其他来源，以及如何使用了 AI。
4. **评审团标准：** 影响力、创造力、有效性、相关性和展示。
5. **部署：** Vercel。前端已经部署（https://spherex-planet-x-tau.vercel.app）。后端如何运行尚待决定；ADR-001 仍待定稿。未经团队中一个人的批准，不部署任何东西。

---

## 上传到 GitHub 之前，检查

> **11月14日 状态：** 仓库已经在 GitHub 上（`mauriciovalenzuela742/SPHEREX`），带有 `LICENSE` 和一个涵盖 `data/cache/`、`.env`、`node_modules/` 和 `__pycache__/` 的 `.gitignore`。下面的复选框没有勾选，因为没有人逐一检查过。

- [ ] 任何文件中都没有密钥、token 或凭据。
- [ ] 没有成员的个人数据（邮箱、电话、地址）。
- [ ] 没有大型数据文件或 FITS。
- [ ] `.gitignore` 涵盖 `data/cache/`、`.env`、`node_modules/`、`__pycache__/`。
- [ ] README 清楚说明了这是什么、不是什么。
