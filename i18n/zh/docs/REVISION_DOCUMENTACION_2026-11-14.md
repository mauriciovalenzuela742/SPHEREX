<!-- i18n-header -->
> 🌐 **语言:** [English](../../en/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Español](../../es/docs/REVISION_DOCUMENTACION_2026-11-14.md) · **中文** · [Deutsch](../../de/docs/REVISION_DOCUMENTACION_2026-11-14.md) · [Italiano](../../it/docs/REVISION_DOCUMENTACION_2026-11-14.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `docs/REVISION_DOCUMENTACION_2026-11-14.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 文档审查 · 2026年11月14日

分支 `n/docs-al-dia`,基于 `equipo/main`(8202409,PR #1 至 #6 已合并)。审查由三位读者并行完成(每人负责一组文档),并在此汇总。表中每条发现都引用了文档的文件和行号,以及与之矛盾的数据。对于已修正的文档,行号均经人工核对;当某位读者给出的行号对不上时,采用实际行号。

> **时效说明:** 本分支已纳入 `equipo/main` 直至 `b115fc0`(PR #7「领域按今日位置呈现以及 `/api` 的部署决定」和 PR #8「Spherix」)。与 `data/campos_de_prueba.yml` 和 `ADR-001` 的冲突已按 `main` 为准解决。另有一个新分支 `v/v2-catwise`,包含查看器的 CatWISE2020 图层;PR #9(Bryan,`d/prototipo-rango-fechas`)仍未关闭。

## (a) 五行摘要

1. 文档在四个方面落后了:**截止时间**(多份文档写 13:00;组织方说的是 11:00)、**天空立方体**(混淆了 DR1 的两种不同产品)、**已完成的事项**(查看器、Vercel、PR #6 仍写作「待办」)以及**团队规模**(是六人,不是四人)。
2. 最紧迫的事:截止时间是**周日 15 日 11:00**(JP 已确认)。WISE 0855 是必选案例,始终展示,但必须如实说明,在单次曝光中它看起来很弱,其运动要靠相减才能看出;eps Ind B 是运动最清楚的地方。
3. 在代码(而非文档)中有两处与文字矛盾:查看器页脚没有 IRSA 要求的**逐字**署名文本,并且 `campos.ts` 以及 `url.ts` 的默认值使用 J2000 坐标,尽管注释写着「已传播」。
4. 共修正了 45 个文件(每个一次提交),分两轮完成;第二轮在 JP 的批准下也应用了各项提议。在 `docs/03` 中只应用了已测量的事实。未触及代码、CI 和权限。
5. 在 7 个远程分支中,只有 `d/prototipo-rango-fechas` 有未合并的工作;其路由使用 `start`/`end`,而 API 契约写的是 `from`/`to`。其余 6 个已经并入 `main`。

## (b) 按文档列出的发现

严重程度:**B** = 阻塞某人 · **C** = 令人困惑 · **K** = 外观问题。
状态:**已修正**(本分支中的提交) · **提议**(由负责人或团队决定) · **代码**(此处不改动)。
按 README §3 的负责人:D1 Vladimir · D2 Bryan · V1 Antonia · V2 Juan Pablo · C Mauricio · N Javiera。

| # | 文档:行号 | 原文所述 | 当前实际情况 | 证据 | 负责人 | 严重度 | 状态 |
|---|---|---|---|---|---|---|---|
| 1 | `docs/05_PLAN_24H.md:7-8` | 周日 13:00 截止,14:00 路演 | 截止为 **11:00**(现场通知)。13:00 来自 11月13日的会议,未经确认 | `docs/08_REGLAS_DEL_EVENTO.md:94`; `README.md:33`; `docs/reuniones/2026-11-13_resumen.txt`(「时间未确认」) | C | B | 已修正 |
| 2 | `docs/04_METODOLOGIA.md:160` | 「周日 13:00 宣布……请确认」 | 11:00,已确认 | 同 #1 | C | B | 已修正 |
| 3 | `docs/02_DATOS_SPHEREX.md:258-267`(及 `:111-114`) | 立方体是位于 `hips5_cube/hips_20261026/Norder5/` 的 HiPS,可通过 SIA2 检索,Aladin 可直接显示 | 这是**两种**产品。SIA2 的是每个图块约 320 MB 的 FITS,裁切服务会拒绝它。在 Aladin 中加载的是 `/data/hips/SPHEREx/spherex_allsky_cube`(PNG,102 个平面,第 50 和 51 个为空,CORS 开放) | `docs/09_EDA_HALLAZGOS.md:35-38,176-177`; `scaffold/frontend/src/sky/planos.ts:11-13`; 对 `.../ibe/.../hips5_cube/hips_20261026/properties` 的 `curl` 返回 404(C 组读者测试) | C | B | 已修正(段落和表格;`:111-114` 的路径保留为 SIA2 目录的参考,上文已澄清) |
| 4 | `.claude/skills/spherex-datos/SKILL.md:144-155`(§6) | 与 #3 相同的错误:「Aladin 可以直接显示」,路径 `ibe/...` | 同 #3。此外 skill `visor-sky-blink` §2 说得是对的:两个 skill 互相矛盾 | 同 #3; `.claude/skills/visor-sky-blink/SKILL.md:42-90` | V2 / C | B | 已修正 |
| 5 | `docs/02_DATOS_SPHEREX.md:271-278` · `docs/briefings/01_el_desafio_y_los_datos.md:226-228,321-323` · `spherex-datos/SKILL.md:159-164` | 光谱和颜色来自立方体 | 立方体是已拉伸的 PNG,不含流量:不能用于光谱;光谱来自 2 级数据或 Spectrophotometry Tool | `docs/09:37-38,177`; `docs/10_REPARTO_DE_TRABAJO.md:106-107` | C / N | C | 已在 `docs/02` 和 skill 中修正;briefing 01 作为提议保留(它是音频文本) |
| 6 | `docs/02_DATOS_SPHEREX.md:61-72`(§2)及 skill `spherex-datos` §1 | 「在一个波段内波长变化小得多」;按波段分组就够了 | 目标的波长在一个探测器内跨越约 16 个波段宽度;必须选择匹配波长的历元(离散度 0.474 → 0.035 µm)并重投影(探测器旋转约 180°) | `docs/09:22-27,72-85`; `eda/resultados/lambda_resumen.json` | C / D2 | C | 已在 `docs/02` 中修正(注释)。对 `spherex-datos` §1 和 `revisor-cientifico.md:25-27` 的**提议**(把「匹配波长」和「重投影」加入审查者的问题) |
| 7 | `docs/02_DATOS_SPHEREX.md:340-353` | 第 1 小时的检查清单,8 个复选框均未勾选 | 几乎全部已在 `docs/09` 中有答案;「确认 6 个扩展」未验证 | `docs/09:10-40,168-178`; `eda/README.md:3` | C | C | 部分:`docs/05` 已指向 `docs/09`。**提议**:在 `docs/02` 中勾选复选框并附上数字及来源 |
| 8 | `docs/07_RIESGOS.md` R1(`:10`)、R2、R3、R10 | R1「不知道要多久」;R2「测量 WCS-WAVE」;R3「B 计划:只用 `spherex_qr3`」;R10 比例 6.2 且「在第 3 小时决定」 | R1 已验证(中位数 7.3 s,最大 29 s)。R2 已解决。R3:仅用 QR3 会使 WISE 0855 没有数据(0 行)。R10 已测量:1.1-1.8 px,比例 6.15″ | `docs/09:15-19,30-32,49-55`; `eda/resultados/latencia_cutouts.json`; `eda/03_recortes_y_figuras.py:42` | C | C | 已修正(状态注释 + 6.15) |
| 9 | `docs/07_RIESGOS.md:154-157` | 没有登记新风险 | 缺少:Vercel 只有一个访问入口、CDS 宕机、使相减产生误导的饱和恒星、IRSA 的 503 | `README.md:74-86`; `scaffold/frontend/src/sky/capas/simbad.ts:8,36-37`; `docs/09:132-136,175` | C | C | **提议**(使用 `/riesgo`;由 C 决定) |
| 10 | `docs/06_JURADO_Y_PITCH.md:70-74` · `docs/briefings/01` 和 `02` · `.claude/skills/demo-y-pitch/SKILL.md:35-47` · `coordenadas-astro/SKILL.md:164-168` · `data/campos_de_prueba.yml:50` | 脚本中 WISE 0855「在移动。完。」;RW Aur 作为变星对照;Gaia 叠加在 WISE 0855 上 | **JP 的决定(11月14日):WISE 0855 是必选案例,是组织方的测试目标之一,始终展示。** 必须如实说明,在单次曝光中它看起来很弱(113 s),其运动(整个时段约 1.3 px)可通过第一帧 − 最后一帧的相减看出,并在具备后通过按扫描轮次求和看出。eps Ind B 是运动最清楚的地方。**方案补充:** CatWISE2020 叠加层(WISE 0855 不在 Gaia 中;CatWISE 提供其自行;`README.md:50` 和 §3,skill `coordenadas-astro:104-107`;负责人 V2 Juan Pablo):**已在分支 `v/v2-catwise` 完成(据 V2,标记 WISE 0855 距离从 SIMBAD 传播得到的位置 2.6″),等待 PR**;以及按扫描轮次以 1/VARIANCE 权重求和(`docs/10:75`、`docs/09:186`;负责人 D2 Bryan):**待办**。挑战指南重视叠加 Gaia 和 WISE。RW Aur 饱和,会留下一对不动的红/蓝点。WISE 0855 不在 Gaia 中(其叠加层为 CatWISE2020) | `docs/09:104-114,133-136`; `README.md:50`; `prototipos/rango_fechas/README.md` | N / C | C | 已在 `docs/06`、`demo-y-pitch`、`coordenadas-astro`、`campos_de_prueba.yml`(注释)、briefing 01 和 02、`docs/09`、`docs/10`、README 中修正。**已生成的 NotebookLM 音频已过时** |
| 11 | `scaffold/frontend/src/content/textos.ts:25-26` · `README.md`(§许可) · `docs/presentacion_eda/script.es.md:136` | `docs/05:113`、`docs/06:136`、`docs/08:84` 以及 skill `entrega-nasa` 要求**逐字**署名 | 查看器页脚是西班牙语的意译;README 只链接到 `docs/02`;逐字文本仅存在于 `docs/02_DATOS_SPHEREX.md:324-328` | `grep "This publication makes use" README.md` = 0 条结果; `textos.ts:25` | N / V1 | B(对提交而言) | **代码**:修改 `textos.ts`,把文本粘贴到 README 和 `script.es.md:136` |
| 12 | `scaffold/frontend/src/content/campos.ts:1-13` 和 `src/state/url.ts:12` · `README.md:9`(示例链接) | 注释「使用已传播的位置」,但数值为 J2000:到 2026 年,WISE 0855 距中心 212″,Barnard 距中心 270″,落在 0.1° 裁切图之外 | **已由 PR #7(Mauricio)在代码中解决:** `campos.ts` 现在说明 `ra`/`dec` 为 J2000,并通过 `posicionActual()` 居中;默认 URL 以 eps Ind B 为起点。仅剩 README 的示例链接(J2000 的 Barnard,落在裁切图之外):由 N 修正 | `docs/10:115-118`; `b115fc0` 中的 `campos.ts:1-13,33`; `url.ts:12` | C / N | C | 已解决(PR #7)。仅剩 `README.md:9` 的链接待处理 |
| 13 | `docs/10_REPARTO_DE_TRABAJO.md:99-109` | V2 部分把立方体描述为「每个波段一个平面」,并把传播后的 Gaia 写成待做 | 已在 PR #6 中合并:波长滑块、传播后的标记和方框、Gaia DR3(上限 300)、带标签和点击的 SIMBAD 图层。仍缺:波段图、点击 → 动画、Spherix | 提交 `8eace4e`、`9043243`、`21a8edb`、`c76f61d`、`3cd51aa`、`e515ac5`; `scaffold/frontend/src/sky/` | V2 | C | 已修正 |
| 14 | `docs/traspasos/2026-11-14-1530-v2-visor-cielo.md:61-89` | 步骤 1 至 5 待做;「每个 PR 都有预览」;「CDS 以 CORS 响应」 | 这些步骤已在 PR #6 中完成。预览只为 Mauricio 的提交构建。CDS 宕机,代码首先尝试 Harvard 镜像 | `git log`; `README.md:81-85`; `capas/gaia.ts:25-26`; `capas/simbad.ts:36-37` | V2 | C | 已修正(「已被取代」横幅和两条注释) |
| 15 | `docs/KIT.md:5,52,76-77,80,116-121` | 「四个人」;「五个 skill」;「当前:本地,未发布」;锚点 `#atribución-obligatoria`;前端「未运行」,比例「推导得出」,HiPS 立方体「未检查」 | 六个人;八个 skill;已随 PR #1-#6 发布,查看器已上线;真实锚点为 `#8-atribución-obligatoria`;前端在 CI 和 Vercel 上运行;比例 6.15″;HiPS 确实能加载 | `README.md:7-12,160`; `git ls-files .claude/skills`; `docs/02_DATOS_SPHEREX.md:322`; `docs/09:15,177` | N / C | C | 已修正 |
| 16 | `docs/08_REGLAS_DEL_EVENTO.md:55-58,98-100` | 「在正式开始之前没有一行代码……」;「后端待定;ADR 待审」 | 到 11月13日为止是对的。今天已有 `eda/` 和一个查看器;前端已在 Vercel 上(后端仍待定) | `eda/01_inventario.py`…`05_centroides.py`; `scaffold/frontend/src/sky/`; `README.md:74-93` | C | C | 已修正。**提议**(次要):把列表「上传到 GitHub 之前」(`:104-110`)标记为已完成 |
| 17 | `README.md:17-18` · `AGENTS.md` 规则 8 · `scaffold/README.md:3-5,52` | 「正式开始前没有代码」,好像仍然有效 | 活动已于 11月14日 10:00 开始 | `README.md:33` | N / C | C | 已在 README 和 AGENTS 中修正。对 `scaffold/README.md` 的**提议**(位于 `scaffold/` 之下,未改动):标题改为「初始骨架;前端已有落地页、查看器和 A 路径」 |
| 18 | `README.md:259`(§9,区块 0) | 「Mauricio:在 Vercel 创建项目」未勾选 | 已完成:https://spherex-planet-x-tau.vercel.app | `README.md:7`; `vercel.json` | N | K | 已修正 |
| 19 | `CONTRIBUTING.md:3,31,60` · `CLAUDE.md:44` · `scaffold/README.md:9,58` · `docs/05_PLAN_24H.md`(6 处提及) · `docs/04_METODOLOGIA.md`(标题和 §角色) | 「四个人」;`git worktree add ../spherex-d d/sia2-epochs` 没有 `-b`;在根目录执行「`docker compose up`」 | 六个人;新分支需要 `-b … main`;`docker-compose.yml` 位于 `scaffold/`,并且只启动 `/health` | `README.md:160,223`; `git worktree add -h`; 根目录的 `ls` | C / N | K / C | 已在 CONTRIBUTING、CLAUDE 和 docs/05 中修正;在 docs/04 中只加了关于角色的说明(标题和分工:**提议**,由团队决定)。`scaffold/README.md`:提议 |
| 20 | `CLAUDE.md:46-48` | `settings.json`「批准对 IRSA 和 CDS 域名的 `curl`」 | `settings.json` 没有 `Bash(curl:*)`;它有 `WebFetch(domain:…)`,并且不包含 Harvard 镜像 | `.claude/settings.json:10-38` | C | C | 已修正(该句)。**对 Mauricio 的提议**:为 `vizier.cfa.harvard.edu`、`simbad.cfa.harvard.edu` 和 Vercel 的 URL 添加 `WebFetch`,以及 `npm run dev/preview`;这是安全问题,未添加 |
| 21 | `GEMINI.md:10` | `git switch -c <tu-nombre>/<tema>` | 约定是 `<角色首字母>/<主题>`(`d/`、`v/`、`c/`、`n/`) | `CONTRIBUTING.md:17-21`; `git branch -r` | C | C | 已修正 |
| 22 | `AGENTS.md:46,48` | 「Aladin Lite v3(HiPS,CDS)」;「静态前端 + 容器中的后端」 | Aladin Lite 3.8.2,基于 IRSA 的立方体;CDS 宕机,改用 Harvard 镜像;后端待定 | `scaffold/frontend/package.json:14`; `ADR-001:29-36` | C | K | 已修正 |
| 23 | `docs/adr/ADR-001-stack.md:27,58-62` | 无后端方案「取决于 IRSA 是否以 CORS 响应」;在第 3 小时复核 | IRSA 在 HiPS 之外不提供 CORS:已有证据地排除 | `docs/09:33-34,170`; `eda/resultados/infraestructura.json` | C | K | 已修正 |
| 24 | `docs/adr/ADR-001-stack.md` | 状态「提议」「待签署」;「决定」一节与 11月14日的更新冲突 | **已由 PR #7 在实质上解决:** ADR 现在有「更新 11月14日下午」,包含 `/api` 的部署决定和延迟数据(中位数 7.3 s,最大 29 s)。它仍然是 **C 的提议,有待团队认可和签署**;已照此写明。Vercel Hobby 的时间限制仍未验证(ADR 本身要求核实) | `README.md:38-39` | C | C | 文本已修正;**待 C 签署** |
| 25 | `docs/03_ARQUITECTURA.md`(契约) | 多个要点 | (1) `:25-27` A 路径的 CORS 风险已解决;(2) `:156` 比例 6.2 → 6.15;(3) `:166` `flagged_fraction` 0.004 对比实际约 4 %;(4) `:120` 默认集合使 R Dra 几乎没有数据(它主要在 `_deep` 中:1,233 + 733 个文件,对比 422 + 126);(5) `:141-172` `/api/frames` 无法请求匹配波长或按扫描轮次求和;(6) `/api/presets` 被 `docs/10:117` 引用,却不在契约中;(7) `:75-76,96-99,214-215` SIMBAD 直接从浏览器查询,而不是通过 `/api/resolve`;(8) `:243` 磁盘缓存与 Vercel Functions 冲突;(9) `:93` 骨架暴露的是 `/health`,不是 `/api/health` | `docs/09:55,158-160`; `capas/simbad.ts:5-9`; `scaffold/backend/app/main.py:29-32` | 团队(D1、D2、C) | C | **提议**:未改动(契约需要团队同意) |
| 26 | `docs/03_ARQUITECTURA.md` 与分支 `d/prototipo-rango-fechas`(**Bryan 的 PR #9,未关闭且未合并**) | 契约:过滤器 `from`/`to` | 原型使用 `start`/`end`、`visit`、`per_visit`,以及新路由 `/api/grid`、`/api/frame`、`/api/presets` | `prototipos/rango_fechas/README.md`(API 表)、`servidor.py` | D2 / D1 | C | 已记入 `docs/03` 的「待团队商定(11月14日)」一节;合并 PR #9 之前先商定名称 |
| 27 | `data/campos_de_prueba.yml:48,162-171,187-189` | 「它就是主要演示」;比例「6,2 arcsec [DERIVADO]」;「在第 1 小时验证」 | 保留 WISE 0855 作为必选案例的位置,并补充说明在单次曝光中它看起来很弱。比例 6.15″ 和 1.0-1.4 年的基线已测量。在 18 个月、6.15 下得到 1.99 / 2.53 / 1.14 px | `eda/03_recortes_y_figuras.py:42`; `docs/10:114` | C | K | 仅在注释和文字说明中修正(未更改坐标和自行) |
| 28 | `data/README.md:6` · `biblio/README.md:144-146` | 坐标「未验证」 | 五个坐标已于 11月14日对照 SIMBAD(Harvard 镜像)验证 | `data/campos_de_prueba.yml:7-13` | C | C | 已修正 |
| 29 | `eda/README.md:8-9,19` | 后端在 `backend/app/`;`04_infraestructura` 测试「CORS、DR1 立方体、CDS 的 HiPS」 | `scaffold/backend/app/`;该脚本也测试 IRSA 的 HiPS | `eda/04_infraestructura.py:46-47` | D1 / C | K | 已修正 |
| 30 | `docs/briefings/README.md:5` · `briefings/02:190` | 「九份文档」;「九个风险」 | 11 份编号文档(00-10);10 个风险(R1-R10) | `ls docs`; `grep "^## R" docs/07_RIESGOS.md` | N | K | 已修正;此外加了一条提示:briefing 早于 EDA |
| 31 | `docs/briefings/01:19,312-316` · `02:3,56-58,91-97,157-158,168` | 「四个人」「四个角色」「容器中的后端」 | 六个人;后端待定 | `README.md:160`; `ADR-001:29-36` | N | K | **提议**:它们是音频脚本;若修正则需重新生成音频 |
| 32 | `.claude/skills/entrega-nasa/SKILL.md:42,88-91` | 「即时生成的光谱」;资源「CDS 的 HiPS」 | 波段图在查看器中还是空缺(`Visor.tsx:88`);没有使用任何 CDS 的 HiPS | `scaffold/frontend/src/pages/Visor.tsx:88`; `planos.ts:13-14` | N | C | 已修正资源列表。**提议**:把「即时光谱」设为有条件的 |
| 33 | `.claude/skills/coordenadas-astro/SKILL.md:156-160` | 比例约 6.2 和「1-2.5 像素」 | 6.15″;实测 1.1-1.8 px | `docs/09:15-19` | C | K | 已修正 |
| 34 | `docs/KIT.md`、`README.md:245-246`、`.github/workflows/ci.yml:26,41` | 「活动开始时,去掉 `|| true`」;CI 使用 `npm install` | `ruff check scaffold/backend` 干净通过;Vercel 使用 `npm ci` | C 组读者的执行; `vercel.json:3` | C | K | **提议**(修改 CI 需由一个人批准) |
| 35 | `scaffold/README.md:15-37,46-62` | `App.tsx`「调用 /health」;`make dev` 启动全部;`requirements-astro.txt` 含 astropy…… | `App.tsx` 是落地页/查看器,并不调用 `/health`;`make dev` 只打印帮助;`requirements-astro.txt` 缺少 EDA 使用的 `reproject` 和 `scipy` | `scaffold/Makefile:19-22`; `scaffold/backend/requirements-astro.txt:4-10`; `eda/comun.py:16` | D2 / C | C(对 D2 使用 `import reproject` 时为 B) | **提议**(位于 `scaffold/` 之下) |
| 36 | `.claude/skills/spherex-datos/SKILL.md` §1、§3-§4、§11 和 `visor-sky-blink` | 缺少已测量的数据:IRSA 无 CORS、cutout 延迟、一个位置在每次指向中落入 2 个文件(而不是 6 个)、`FLAGS != 0` 标记了 72 %、相减产生的红/蓝对在饱和目标上也会出现 | 在 EDA 中测量 | `docs/09:30-34,59-60,133-136,140-162`; `eda/resultados/*.json` | C / D1 / D2 | C | **提议**(建议文本在工作笔记中) |
| 37 | `docs/06_JURADO_Y_PITCH.md:81` · `demo-y-pitch/SKILL.md:39,70` · `entrega-nasa/SKILL.md:41` | 「102 个波段:没有其他公共工具提供的东西」 | IRSA 自己发布了 102 个平面的立方体;`/verifica-cifra` 禁止在没有依据的情况下说「没有人做过」 | `.claude/commands/verifica-cifra.md:30-32`; `docs/09:177` | N | C | **提议**:「据我们所能验证的,没有任何公共工具在同一屏幕上将时间 blink 与 102 个波段结合起来」 |
| 38 | `docs/diseno/REVISION_MAQUETA_V1.md:20,24,36` | 「缺少带署名的页脚」;「每个区域 3 或 4 个扫描轮次」 | 已有页脚(文本不是逐字的,见 #11);R Dra 几乎是连续观测,WISE 0855 终止于 2026.37 | `App.tsx:44`; `docs/09:51,55,63-64` | V1 / C | K | **提议** |
| 39 | `biblio/repos.md:32,97-98` | Aladin Lite 是 LGPL-3.0 | GitHub 说 LGPL-3.0;`package-lock.json:1248` 和 npm 说 GPL-3。未解决 | `scaffold/frontend/package-lock.json:1248` | C | C | **提议**:打开 3.8.2 包内的 `LICENSE` 并决定(项目以 MIT 发布) |
| 40 | `docs/presentacion_eda/script.es.md:45` · `docs/02:36` · `docs/09:72` | 探测器 5 的范围:3.82-4.44 / 3.83-4.41 / 3.82-4.41 µm | 三个不同的数字 | `eda/resultados/lambda_resumen.json` | C | K | **提议**:测量一次 `WCS-WAVE` 表并统一 |

**按严重程度统计**(表中的行,每行取其最高严重度):**阻塞:6**(第 1、2、3、4、11 和 12 行)· **令人困惑:23** · **外观:11**。共 40 行。

> 统计说明:该表做了归并。三位读者共提交约 90 条原始发现(13 + 40 + 40,另有关于 `docs/03` 的意见);各组之间重复的(13:00 截止、「四个人」、比例 6.2)已合并,无法证实的已舍弃。

### 与读者报告不符的核查

- **`docs/04` 的行号。** A 组读者引用了 288 至 433 行,但 `docs/04_METODOLOGIA.md` 只有 162 行。实际行号在表中(`:160`、`:15`、`:21`)。内容本身是正确的。
- **「visor-sky-blink:61 说立方体是所有历元的马赛克」(C 组的 C-11)。** 已舍弃:原句是「**它不是什么:** 所有历元的马赛克(它没有时间轴……)」,这是正确的。只是读起来有歧义。
- **署名、R10 和延迟数字:** 已对照 `textos.ts:25`、`docs/08:94` 和 `docs/09` 核对。

## (c) `equipo` 的远程分支

| 分支 | 最后提交 | 领先 / 落后 `main` | 内容 | 影响哪些文档 |
|---|---|---|---|---|
| `c/correccion-cubo-hips` | 11月14日 | 0 / 16 | EDA 修正:HiPS 立方体确实能加载;J2000 提示 | 已合并(PR #4)。无待办 |
| `c/eda-datos` | 11月14日 | 0 / 20 | EDA 与模型图审查 | 已合并(PR #2) |
| `c/vercel-shell` | 11月14日 | 0 / 28 | Vercel 上的视觉骨架 | 已合并(PR #3) |
| `n/plan-readme` | 11月14日 | 0 / 30 | 计划中的白板和 Vercel | 已合并(PR #1) |
| `n/readme-vercel` | 11月14日 | 0 / 14 | 如何用免费套餐部署 | 已合并(PR #5) |
| `v/v2-cielo` | 11月14日 | 0 / 3 | V2 天空查看器 | **已合并**(PR #6,`8202409`)。委托书认为它仍未关闭 |
| `d/prototipo-rango-fechas` | 11月14日 | **4 / 33** | 位于 `prototipos/rango_fechas/` 的独立原型(服务器、波段 × 日期浏览器、波段报告)以及 `data/data.ipynb`(4,249 行) | 见第 26 和 10 行。(1) 使用 `start`/`end` 以及与契约 `docs/03`(`from`/`to`)不同的新路由。(2) 其自身 README 说 WISE 0855 在单次曝光中看不到,这支持第 10 行。(3) 没有与 `main` 矛盾的文档:未触及 `docs/` 或 `README.md`。(4) 该分支基于 `4411f5f`,早于 PR #1 至 #6:发起 PR 之前须在 `main` 上重建。(5) `data/data.ipynb` 约有 4,200 行:检查其中是否包含下载的数据(仓库规则:git 中不放数据) |

## 第二轮之后的最终状态(经 JP 批准)

JP 在 11月14日的决定:(1) 截止时间是周日 15 日 11:00,已确认;(2) WISE 0855 是必选案例,始终展示(见第 10 行)。因此上面标为「提议」的行都变成了已修正,以下所列除外。

**第二轮中已修正**(第 5、6、7、8、9、10、13、16、17、19、20(文档方面)、23、24、25、26、27、31、32、34(文档方面)、35、36、37、38、39、40(部分)行):`docs/02` 的检查清单、`docs/07` 中的 R11-R13、`ADR-001`(文本已更新;**尚未签署:待 C 签署**)、`docs/03`(见下)、`scaffold/README.md`、skill `spherex-datos`(匹配波长、每次指向 2 个文件、按位的 FLAGS、含测量结果的 §12)、审查者、`chequeo-demo`、`AGENTS.md`(指向/扫描轮次)、`CLAUDE.md`、`GEMINI.md`、`docs/08`、`REVISION_MAQUETA_V1.md`、`biblio/repos.md`(许可差异已记录,**未解决**)、`script.es.md` 和 README(逐字署名文本)、`entrega-nasa`、briefing 01 和 02。

**在 `docs/03` 中改了什么**(仅限已测量的事实):像素比例 6.15;A 路径的 CORS 风险标记为已解决;关于 `/health` 与 `/api/health` 的说明;示例 `flagged_fraction` 为 0.04 并附说明;SIMBAD 目前从浏览器查询的说明。设计方面的改动(`from`/`to` 对 `start`/`end`、`/api/grid`、`/api/frame`、`/api/presets`、匹配波长与按扫描轮次求和、默认集合、缓存与 Vercel、污染掩膜)作为末尾的「待团队商定(11月14日)」一节保留,未更改现行契约。

**音频。** 已根据 briefing 生成的 NotebookLM 音频在以下方面已过时:立方体不提供光谱、团队是六人、后端待定,以及 WISE 0855 的呈现方式。

### 待办的代码改动(未触及)

| 内容 | 位置 | 负责人 |
|---|---|---|
| 在查看器页脚放入 IRSA 的逐字署名 | `scaffold/frontend/src/content/textos.ts:25-26` | N / V1 |
| ~~把 `campos.ts` 改为传播后的位置~~ | 已由 PR #7 解决(`campos.ts` 说明 J2000,并通过 `posicionActual()` 居中) | — |
| 修正 README 的示例链接(J2000 的 Barnard,在裁切图之外;`url.ts` 已以 eps Ind B 为起点) | `README.md:9` | N |
| 去掉 linter 的 `\|\| true`,并在 CI 中使用 `npm ci` | `.github/workflows/ci.yml:26,41` | C |
| 对 Harvard 镜像和 Vercel 的 URL 的 `WebFetch` 权限;`npm run dev/preview` | `.claude/settings.json` | C(安全) |
| 添加 `reproject` 和 `scipy` | `scaffold/backend/requirements-astro.txt` | D2 / C |
| 查看器中的「相减」按钮(`diff_first`) | `scaffold/frontend/src/pages/Visor.tsx` | V1 / D2 |
| 去掉 `propagacion.ts` 中的 `TODO`(该检查已存在于 `scripts/comprobar_propagacion.mjs`) | `scaffold/frontend/src/sky/propagacion.ts:10-11` | V2 |

### 文档中未完成的事项

- `ADR-001` 的签署(属于 C),以及解决 Aladin Lite 的许可(打开 3.8.2 包的 `LICENSE`)。
- 重新生成 briefing 的音频。
- 探测器 5 的范围(3.82-4.44 / 3.83-4.41 / 3.82-4.41 µm):统一之前须测量 `WCS-WAVE` 表。
- `docs/02` 中的复选框「确认 6 个扩展」,EDA 未验证。
- AGENTS 和查看器 skill 中的数值示例(「14 个历元」),它们仅作示意;以及 `visor-sky-blink` §8 中关于以 J2000 预加载 WISE 0855 的说明(取决于 `campos.ts`/`url.ts` 的代码改动)。

## 未审查的内容

- 对照真实后端逐行审查 `docs/03_ARQUITECTURA.md`(后端不存在:只有 `/health`)。
- `biblio/` 中的文献引用(arXiv、DOI)。
- 通用 skill `astropy`、`matplotlib`、`scikit-learn`(第三方的)。
- `docs/reuniones/`(历史)以及 `docs/diseno/` 和 `docs/presentacion_eda/` 中的 PNG/PDF(仅文本)。
- NotebookLM 音频是否在 11月14日生成。
- notebook 和 `prototipos/rango_fechas/*.py` 的内部内容。
- Vercel Hobby 的时间限制和 Aladin Lite 的许可(标为「未验证」)。
- 全部 `src/` 和 `scaffold/`:按委托要求未编辑。

## 各负责人剩余的事项

- **C Mauricio:** 签署 ADR-001(以及延迟数据)、yml 的取值(6.15 和「主要演示」)、`docs/03`(见第 25 行)、新风险(第 9 行)、`settings.json` 的权限、Aladin 许可、CI(`|| true`、`npm ci`)、`docs/02` 检查清单。
- **N Javiera:** 演示和路演的顺序(第 10 行)、「没有其他工具」(37)、README 和页脚中的逐字署名(11)、briefing 和音频(31)。
- **V1 Antonia / V2 Juan Pablo:** `textos.ts`(11)、J2000 的 `campos.ts` 和 `url.ts`(12)、`REVISION_MAQUETA_V1.md`(38)。
- **D1 Vladimir / D2 Bryan:** `from`/`to` 对 `start`/`end`(26)、`/api/health` 对 `/health`、带 `reproject` 和 `scipy` 的 `requirements-astro.txt`(35)。
