---
description: 在浏览器中走完整个演示,并报告哪里出了问题
---

<!-- i18n-header -->
> 🌐 **语言:** [English](../../../en/.claude/commands/chequeo-demo.md) · [Español](../../../es/.claude/commands/chequeo-demo.md) · **中文** · [Deutsch](../../../de/.claude/commands/chequeo-demo.md) · [Italiano](../../../it/.claude/commands/chequeo-demo.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `.claude/commands/chequeo-demo.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

像团队在评审团面前那样完整走一遍演示,并报告哪里出了问题。这一步要在**每次冻结之前和录制视频之前**运行。

脚本在 `.claude/skills/demo-y-pitch/SKILL.md`。如果命令参数中带有 URL,就用那个;否则使用已部署的应用(https://spherex-planet-x-tau.vercel.app),如果没有,则用本地版本(在 `scaffold/frontend` 中运行 `npm run dev`,http://localhost:5173)。注意:在播放器和帧仍为空壳期间,第 3 步按设计会失败,并不是回归。

用浏览器逐个走完脚本的十个步骤。在每一步记录:

- 它是否做到了应做的事?
- **耗时多久。** 要计时。一个耗时 15 秒的步骤会毁掉 2 分钟的演示。
- 控制台是否有错误,或有请求失败?

然后测试评审团会做、而脚本没有覆盖的事情:

- 一个没有数据的坐标。
- 一个输入错误的坐标。
- 在加载中途刷新页面。
- 在另一个标签页中打开同一个 URL。
- 手机窗口尺寸。

返回:

**会搞砸演示的问题** — 必须修复的内容,并给出失败的确切步骤。

**慢** — 耗时超过 3 秒的步骤,附实测时间。

**烦人但可以过关** — 今天可以忍受的问题。

**整个流程的总耗时** — 如果超过 2 分钟,就必须削减步骤,并说明削减哪些。

如果有任何失败,请准确说明你做了什么才走到那一步,以便能够复现。
