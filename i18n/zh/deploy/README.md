<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/deploy/README.md) · [Español](../../es/deploy/README.md) · **中文** · [Deutsch](../../de/deploy/README.md) · [Italiano](../../it/deploy/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `deploy/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 部署

三个 Vercel 项目(eMind 团队,Hobby 计划),全部来自 `main`:

| 项目 | 是什么 | URL | 如何更新 |
|---|---|---|---|
| `spherex-planet-x` | 查看器(`scaffold/frontend`) | https://spherex-planet-x-tau.vercel.app | 每次合并到 `main` 时**自动**更新(根目录的 `vercel.json`) |
| `spherex-api` | 官方后端(`scaffold/backend`:D1 Vladimir + D2 Bryan) | https://spherex-api.vercel.app | `bash deploy/desplegar.sh api` |
| `spherex-prototipo-d2` | Bryan 的原型(`prototipos/rango_fechas`) | https://spherex-prototipo-d2.vercel.app | `bash deploy/desplegar.sh prototipo` |

查看器通过同一域名的 *rewrites*(无 CORS)调用另外两个:`/api/*` → `spherex-api`,
`/proto-api/*` → `spherex-prototipo-d2`(任务模式)。

**如果你修改了 `scaffold/backend` 或 `prototipos/rango_fechas`,合并之后必须运行该脚本**
(或者请 Mauricio 来做):这两个项目不会自动更新,因为它们是 Python,并且位于子文件夹中。

说明:
- 每个文件夹的 `index.py` 只是把子文件夹加入 `sys.path`(等同于 `uvicorn --app-dir`);
  不会改变后端代码。
- 缓存位于 `/tmp`(Vercel 上唯一可写的位置):在实例之间会丢失;演示不依赖它。
- 如果你给后端添加了 Python 依赖,也要把它添加到 `deploy/<cual>/requirements.txt`
  (注意函数内部的 `import`,例如 `app/irsa/sia2.py` 中的 `pyvo`)。
