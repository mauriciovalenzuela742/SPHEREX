<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/scaffold/README.md) · [Español](../../es/scaffold/README.md) · **中文** · [Deutsch](../../de/scaffold/README.md) · [Italiano](../../it/scaffold/README.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `scaffold/README.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# scaffold/ — 通用骨架

**初始的通用骨架,查看器就构建在它之上。** `backend/` 仍然是 FastAPI 的「hello world」(`/health`)。`frontend/` 则不再是:自11月14日起它有了落地页、查看器和 A 路径(Aladin Lite + IRSA 的 HiPS 立方体 + Gaia + SIMBAD)。活动规则:[`../docs/08_REGLAS_DEL_EVENTO.md`](../docs/08_REGLAS_DEL_EVENTO.md)。

## 它的用途

让六个人在活动的第 0 小时就能在五分钟内把项目跑起来并开始
工作,而不是与环境较劲。**如果这个在六台电脑上跑不起来,
在它跑起来之前谁都无法推进。**

## 里面有什么

```
scaffold/
├── backend/
│   ├── app/main.py          FastAPI con /health y CORS. Nada más
│   ├── tests/test_health.py Un test que comprueba que levanta
│   ├── requirements.txt     Solo lo del servidor
│   ├── requirements-astro.txt  Dependencias astronómicas (ver abajo)
│   └── Dockerfile
├── frontend/
│   ├── src/App.tsx          Landing y visor (ya no llama a /health)
│   ├── src/pages/           Landing y Visor
│   ├── src/sky/             Aladin Lite, planos del cubo, capas Gaia y SIMBAD
│   ├── src/state/           Estado ↔ URL
│   ├── src/content/         Textos y los 5 campos de prueba
│   ├── scripts/             comprobar_propagacion.mjs
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── Makefile
```

## 启动

```bash
make backend    # una terminal
make frontend   # otra terminal
```

(`make dev` 只打印这些说明。)或者手动:

```bash
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

后端在 <http://localhost:8000>(文档在 `/docs`),前端在 <http://localhost:5173>。

## 关于 `requirements-astro.txt`

`astropy`、`numpy`、`pyvo`、`astroquery`、`pillow` 和 `matplotlib` 体积大、安装慢。该文件还包含 `PyYAML`。**它缺少 `reproject` 和 `scipy`**,EDA(`eda/comun.py`)使用它们,D2 做公共网格也需要它们;添加它们是一项等待 D2/C 处理的依赖变更。
把它们放在单独的文件中,**只是为了在活动之前先下载好**:准备环境
是合法的,但在开始之前就用它们来解决挑战则不是。

```bash
pip install -r backend/requirements-astro.txt
```

## 在活动的第 0 小时

1. 确认 `make backend` 和 `make frontend` 在六台电脑上都能运行。
2. ~~把 `scaffold/backend` 和 `scaffold/frontend` 移到根目录~~ **已决定(11月14日):保留在 `scaffold/`**(`vercel.json` 构建 `scaffold/frontend`)。
3. 确定 [`../docs/03_ARQUITECTURA.md`](../docs/03_ARQUITECTURA.md) 中的 API 契约,并让 V
   搭建 mock,以免等待后端。
