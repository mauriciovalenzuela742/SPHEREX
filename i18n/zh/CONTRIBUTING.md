<!-- i18n-header -->
> 🌐 **语言:** [English](../en/CONTRIBUTING.md) · [Español](../es/CONTRIBUTING.md) · **中文** · [Deutsch](../de/CONTRIBUTING.md) · [Italiano](../it/CONTRIBUTING.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `CONTRIBUTING.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 我们如何在这个仓库中工作

六个人和他们的智能体,24 小时,一个必须始终能跑起来的 `main` 分支。
这份文档故意写得很短。

## 不可协商的

1. **没有人向 `main` 推送。** 无论是你还是你的智能体。一切都通过 PR 进入。
2. **PR 由一个人审查。** 不是智能体。看 diff 只需两分钟,却能节省数小时。
3. **分支的存活时间不超过 3 小时。** 如果一个分支超过了,说明任务太大了。
4. **API 契约要先在 `docs/03_ARQUITECTURA.md` 中修改**,通知团队,然后
   才去动代码。
5. **仓库中不要放 FITS 或下载的数据。** 它们放在 `data/cache/`。

## 分支

```
<inicial-del-rol>/<tema-corto>
```

`d/sia2-epochs`、`v/panel-blink`、`c/verificar-campos`、`n/readme`。

角色见 [`docs/04_METODOLOGIA.md`](docs/04_METODOLOGIA.md):**D** 数据、**V** 查看器、
**C** 科学与验证、**N** 叙事与提交。

## Worktree:每人一个文件夹

两个智能体在同一个文件夹上会在无提示的情况下互相覆盖,而且谁都不会告诉你。

```bash
git worktree add -b d/sia2-epochs ../spherex-d main
cd ../spherex-d
```

## 提交

祈使句,用西班牙语,一行,不拘形式:

```
añade endpoint /api/epochs
corrige conversión de RA en horas a grados
documenta la estructura del MEF
```

## PR 里要有什么

三行就够了:

```
Qué hace:
Cómo lo comprobé:
Qué NO comprobé:
```

**第三行是必填的。**「未验证的内容」可以避免有东西在没有人真正看过的情况下
进入演示。

## 请求审查之前

- [ ] 在干净环境中能运行:前端 `cd scaffold/frontend && npm ci && npm run build && npm run preview`;后端 `cd scaffold && docker compose up`。
- 如果 Vercel 在你的 PR 上显示 *Blocked*,这是预期的(只构建 Mauricio 的提交;见 README §2)。你不要自己去部署。
- [ ] 如果涉及坐标或图像,至少用 **`data/campos_de_prueba.yml` 中的一个天区**测试过。
- [ ] 没有破坏任何原本能运行的东西(如果改动了界面,用 `/chequeo-demo`)。
- [ ] 没有密钥,没有个人数据,没有 FITS。

## 如果你弄坏了 `main`

立刻大声说出来。不要悄悄修复:还有另外三个人在
基于它工作。回滚是免费的;三个人花半小时去调试一件你早就知道的事,则不是。
