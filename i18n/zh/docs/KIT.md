<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/KIT.md) · [Español](../../es/docs/KIT.md) · **中文** · [Deutsch](../../de/docs/KIT.md) · [Italiano](../../it/docs/KIT.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/KIT.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# SPHEREx Kit — NASA Space Apps Challenge 2026

团队针对挑战 **Planet X and SPHEREx**(难度:Advanced)的工作套件。
这是一个工具箱:文档、参考文献、约定和通用脚手架,
让六个人和他们的 AI 智能体在活动期间并行工作而互不干扰。

> **截至11月14日的状态(活动进行中):** 自11月14日起已有 EDA(`eda/`)和位于
> `scaffold/frontend/` 的查看器(见 [`09_EDA_HALLAZGOS.md`](09_EDA_HALLAZGOS.md))。活动之前没有
> 一行解决挑战的代码,因为活动规则
> 禁止在黑客松之前处理这些挑战。现有的是参考资料
> (公开的,来自 NASA 和文献)以及通用的 Web 脚手架——一个 FastAPI 的「hello world」
> 和一个 Vite/React 的——相当于配置好了编辑器。见 [`docs/08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)。

---

## 一句话说明挑战

构建**一个公开的网页工具**,任何人都可以输入一组天球坐标
(赤经和赤纬),并**以一段小视频**的形式看到该天区:SPHEREx 随时间推移的图像序列,
从而凭肉眼检测移动或亮度变化的东西。

NASA 明确指定的范本是 [WiseView](http://byw.tools/wiseview),[Backyard Worlds](https://backyardworlds.org) 的
志愿者用它发现了数百颗褐矮星。
挑战的完整文本见 [`docs/00_DESAFIO.md`](00_DESAFIO.md)。

**它不是什么:** 不是视频分类模型,不是自动检测器,
不是科学流水线。它是一个查看器。任何 ML 层都是可选的,并且叠加在其上,绝不
取代查看器。这一点在 [`docs/01_ESTADO_DEL_ARTE.md`](01_ESTADO_DEL_ARTE.md) 中有论证。

---

## 10 分钟上手

1. 阅读本 README 和 [`docs/00_DESAFIO.md`](00_DESAFIO.md)(5 分钟)。这是唯一必读的文本。
2. 没有背景知识?阅读 [`docs/briefings/`](../../../docs/briefings/) —— 这两份摘要连贯地涵盖了整个项目。
3. 在 [`docs/04_METODOLOGIA.md`](04_METODOLOGIA.md) 中查看你的角色,在 [`docs/05_PLAN_24H.md`](05_PLAN_24H.md) 中查看 24 小时计划。
4. 在仓库根目录打开 Claude Code。它会自动读取 `CLAUDE.md`;`.claude/skills/` 中的 skills
   会在适当时自动激活。
5. 如果你负责后端或数据:浏览 [`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md)。它是
   关于数据存放位置及请求方式的技术说明。这是最密集的文档,也是最能节省时间的一份。
6. 如果你负责前端:浏览 [`docs/03_ARQUITECTURA.md`](03_ARQUITECTURA.md) 和 skill `visor-sky-blink`。

---

## 套件地图

| 文件夹 | 包含什么 | 何时打开 |
|---|---|---|
| `docs/` | 挑战、技术现状、数据说明、架构、方法论、计划、评审团、风险 | 始终;它是事实来源 |
| `docs/briefings/` | 整个项目的两份叙述性摘要,供连贯阅读。也有音频版本 | 用 20 分钟了解背景 |
| `docs/adr/` | 架构决策,每个文件一项 | 当团队决定了某件难以撤销的事时 |
| `biblio/` | 带注释的参考文献、论文卡片、相关 GitHub 仓库 | 当你需要依据或一个经过验证的想法时 |
| `data/` | 带坐标的测试天区、参考星表。**不对 FITS 做版本管理** | 测试查看器时 |
| `.claude/skills/` | 八个 skill:五个自有的(SPHEREx 数据、查看器、坐标、演示/pitch、提交)和三个通用的(astropy、matplotlib、scikit-learn) | 由 Claude 自动加载 |
| `.claude/agents/` | 专门的子智能体(数据探索者、科学审查者、UI 审查者) | 当你委派一个范围明确的部分时 |
| `.claude/commands/` | `/standup`、`/traspaso`、`/chequeo-demo`、`/verifica-cifra`、`/riesgo` | 活动期间,手动使用 |
| `scaffold/` | 通用的后端 + 前端骨架、Docker、CI | 活动第 0 小时 |
| `AGENTS.md` | 给**任何**智能体的指令。唯一来源 | 由智能体阅读,而不是你 |
| `CLAUDE.md` / `GEMINI.md` | 指向 `AGENTS.md` 的指针 + 各工具特有的内容 | 同上 |

---

## 团队的四条规则

1. **交付物是用真实坐标运行起来的查看器。** 其余都是装饰。
   如果到第 20 小时屏幕上还没有那段小视频,就砍掉任何东西。
2. **没有看过的东西都不能当作既成事实。** 智能体说「已经能用了」是一个数据点,而不是事实:
   要打开 URL,看图像,与 SIMBAD 比较。空结果并不能证明某物不存在。
3. **没有来源就没有数字。** pitch 或 README 中所说的内容必须能够
   打开并核实。使用 `/verifica-cifra`。
4. **没有别人看过,谁都不要向 `main` 提交。** 六个人带着并行的智能体
   几分钟就能弄坏 `main`。见 [`CONTRIBUTING.md`](../CONTRIBUTING.md)。

---

## 状态

- **今天(11月14日,活动进行中):** 已发布到 GitHub(`mauriciovalenzuela742/SPHEREX`),PR #1 至 #6 已合并,查看器已部署在 Vercel(https://spherex-planet-x-tau.vercel.app)。
- **活动之前(截至11月13日):** 仅有文档、参考文献和通用脚手架,在本地。

计划采用的许可证:MIT(见 [`LICENSE`](../../../LICENSE))。SPHEREx 的数据是公开的,但需要
[`docs/02_DATOS_SPHEREX.md`](02_DATOS_SPHEREX.md) 中的致谢声明。

---

## 安装套件(给队友)

**最简单的方式:克隆仓库并在根目录打开 Claude Code。**
`CLAUDE.md`、`.claude/skills/` 中的 skills、子智能体和命令会自动加载。
无需安装任何东西。

```bash
git clone <url-del-repo>
cd spherex_kit
claude
```

检查:输入 `/standup`。如果该命令存在,套件就已加载。

使用 **Antigravity 或 Gemini** 的人阅读 `AGENTS.md` 和 `GEMINI.md`;它们指向同样的内容。

### 如果有人想在本仓库之外使用这些 skills

该套件也被打包为插件(`.claude-plugin/plugin.json` 和
`.claude-plugin/marketplace.json`),用于从另一个文件夹使用。这是可选的:在
仓库内不需要。

---

## 本套件的验证状态

编写于 **2026年11月14日**。哪些已核实、哪些未核实:

| | 状态 |
|---|---|
| 挑战文本和 *Resources* 列表 | ✅ 当天从官方页面读取 |
| IRSA 的 endpoint、SIA2 集合、MEF 结构、波段、HiPS 立方体 | ✅ 已对照 IRSA 官方文档 |
| 后端骨架 | ✅ 可运行:`/health` 返回 `200 {"ok": true}` |
| 前端骨架 | ✅ 在 CI 中构建并在生产环境(Vercel)运行 |
| 参考文献 | 🟡 部分。每一条都在 [`biblio/README.md`](../biblio/README.md) 中带有其状态 |
| 测试天区的坐标 | ✅ 五个都于11月14日在 SIMBAD(CfA 镜像)中核实。出现了两个陷阱:题目给出的 WISE 0855 坐标属于 2010 历元,以及 `eps Ind b` ≠ `eps Ind B` |
| SPHEREx 的像素比例(6.15"/px) | ✅ 11月14日在 SIA2 中确认(`s_pixel_scale`,`docs/09`)。亚像素运动取决于它(风险 R10) |
| Aladin Lite 是否能加载 DR1 的 HiPS 立方体 | ✅ 可以加载(Aladin Lite 3.8.2,来自 `/data/hips/SPHEREx/spherex_allsky_cube` 的 HiPS PNG,11月14日;`docs/09`) |

未核实的内容在每份文档中都会这样标明。**不要因为这里写了
就把它当作确定的。**
