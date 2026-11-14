<!-- i18n-header -->
> 🌐 **语言:** [English](../../../en/biblio/fichas/wiseview-el-precedente.md) · [Español](../../../es/biblio/fichas/wiseview-el-precedente.md) · **中文** · [Deutsch](../../../de/biblio/fichas/wiseview-el-precedente.md) · [Italiano](../../../it/biblio/fichas/wiseview-el-precedente.md)
> 🕒 **文档日期:** 2026-11-14 15:35 · **来源:** `biblio/fichas/wiseview-el-precedente.md`
> ⚠️ 机器翻译草稿，尚待母语人士审校。
<!-- /i18n-header -->

# 卡片:WiseView,直接的先例

- **参考文献:** Caselden, Westin, Meisner, Kuchner, Colin (2018). *WiseView: Visualizing motion
  and variability of faint WISE sources.* Astrophysics Source Code Library, ascl:1806.004
- **链接:** <http://byw.tools/wiseview> · <https://ascl.net/1806.004>
- **状态:** 已核实(ASCL 和 Backyard Worlds 博客,2026年11月14日)。完整作者名单待确认
- **为什么排在第一位:** 它是挑战题目中指名的范本工具

## 三句话概括

WiseView 是一个浏览器工具,它在数年的时间基线上对 WISE 的 coadd 做闪烁;用户只需输入坐标,
并交互式地调整拉伸、色彩映射和闪烁速度。它起初是两位 Backyard Worlds 志愿者的权宜之作,
他们想更好地对自己的候选体分类,并检验它们是否显示出自行。它
促成了数百项褐矮星候选体的发现,发现者既有业余爱好者也有专业人士。

## 这里对我们有用的

1. **界面的形态已被真实使用验证。** 一个坐标框、一个闪烁、
   三个控件。无需发明任何东西:只需把它移植到 SPHEREx。
2. **控件不是装饰。** 拉伸、颜色和速度能把一团模糊
   变成一项发现。如果因为时间不够而砍掉它们,砍掉的就是让工具有用的东西。
3. **它展示的是 coadd,而不是单次曝光。** 先合并再展示,才能让
   暗弱的源可见。在 SPHEREx 中对应的做法是按探测器或波长范围求和,
   而这正是挑战中某一条所建议的。
4. **拥有 API 使它成为基础设施。** 有第三方软件包(`flipbooks`、
   `unWISE-verse`,来自 Cool Neighbors 项目)构建在 WiseView 的 API 之上,用来生成
   素材并上传到 Zooniverse。**这就是我们的可查询 URL 要达到的标准**,它是挑战中
   另一条明确的要求。

## 对我们没用的(以及原因)

- **它没有光谱轴。** WISE 有四个宽波段;SPHEREx 有 102 个通道。我们的空白
  就在这里:做同样的事,*再加上*波长轴。
- **WISE 的数据没有线性可变滤光片的问题。** 在 WISE 中,同一位置的两个历元
  属于同一个波段。在 SPHEREx 中不是。照搬闪烁逻辑而不解决这一点,
  会产生一个频闪序列(见 `../../docs/02_DATOS_SPHEREX.md` §2)。
- **unWISE 预先计算了 coadd。** WiseView 之所以快,是因为有人已经完成了繁重的工作。对
  我们来说,这相当于预热缓存:我们无法预先计算整个天空。

## 我们可以引用的数字

| 数字 | 值 | 出处 |
|---|---|---|
| 所促成的发现 | 「数百个褐矮星候选体」 | ASCL 条目 1806.004 |
| 时间基线 | WISE/NeoWISE 的数年 | ASCL 和 Backyard Worlds 博客 |

**注意:** 不要把发现 Planet Nine 归功于 WiseView。它尚未被发现。

## 遗留的问题

- 原版 WiseView 的代码是否公开?我们没有确认;但衍生的软件包是公开的。
- 它的 API 究竟暴露了哪些参数?查看 `flipbooks` 比自己推断更省事。
- 它默认显示多少个历元,为什么是这个数字?这是一个设计决策,
  需要我们自己来做。
