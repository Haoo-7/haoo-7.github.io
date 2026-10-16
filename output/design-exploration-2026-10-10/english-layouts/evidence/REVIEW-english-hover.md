# English Hover / Dock Review

评审日期：2026-10-10 CST；收尾已按要求复核最终替换截图。模式：全新隔离视觉评审，严格按 oil-ui-pro 的 reviewer-manual 与 review-modes 执行。未读实现源码、未修改源码。只新增本报告。

## 结论

**8/10，建议进入完整英文首页。** 姓名星座、字符巨字、可逆字标交接，以及目录的黑白反转和一次字符化，都已经有可辨认的实际画面。现在不缺方向，也不需要重开版式选择。浮图压 CTA、320px 箭头拥挤与顶栏颗粒字标已经用最终替换截图确认修复；保留分数的原因是当前入场证据仍没有拍到聚集过程，以及完整首页的真实入口尚未完成。

这是个人博客与作品入口。评审标尺是：先认出作者，再能预知栏目内容，最后用短促、稳定的反馈进入内容。字符姓名是用户确定的主视觉，不因它是文字而扣“缺少造型”的分。首屏没有模板式左右分栏、卡片堆叠、渐变或伪高级小字；黑白纸面、蓝色句点与 Life、橙色 History 的分工成立。本次没有取得完整同类标杆截图，不伪造并排比较结论。

## 硬性要求

| 要求 | 观察结果与边界 |
| --- | --- |
| 01 姓名星座与字符巨字 Haoo | 成立。1280 与 390 的默认画面能明确识别 Haoo，兴趣词围绕姓名而不是另起一套界面。移动端字符细到主要读作纹理，但整体字形仍清楚。 |
| 巨字收进固定顶栏、可反向恢复 | 成立。[06-dock](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-dock/record.mp4) 和 [06-mobile-dock](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-mobile-dock/record.mp4) 的连续帧可见巨字压实、缩小、留在顶栏，再回到 Hero。视觉上是连续交接；是否同一个 DOM 对象不由截图证明。 |
| 悬停时黑白反转 | 成立。WORK 的背景变黑，标题、编号、箭头和副标题转白。黑色是整行反馈，不是另套卡片。 |
| 标题短暂字符化，随后清晰 | 成立。[WORK 中帧](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-desktop-hover/motion-mid.jpg) 可见字符字形，[末帧](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-desktop-hover/motion-end.jpg) 恢复实心白字，持续停留没有继续乱闪。 |
| 键盘聚焦等价反馈 | 主 Agent 交接称当前真实浏览器测试已覆盖并通过；本评审没有亲自进行键盘操作，不把鼠标帧冒充键盘证据。 |
| 触屏原位展开 | 最新 [390 展开长图](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-open-state/work-390x844.png) 和 [320 展开长图](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-open-state/work-320x740.png) 显示 WORK 内两项真实内容和图片。主 Agent 报告 hasTouch 的 tap 已通过。06-mobile-open 的早期录屏没有拍到展开，不能拿那段作为 tap 成功的视觉证据，也不能据它断言当前触屏坏了。 |

## 本轮观察

### 1. 浮图越过自己的内容区，压到 Hero 入口

- 位置：桌面 WORK 悬停状态，浮图右上角与 Hero 的 `Work, writing & more` 左端。
- 证据：[06-desktop-hover/motion-end.jpg](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-desktop-hover/motion-end.jpg)。原送审帧的 Dayline 图片上沿进入 CTA 高度，右上角侵入入口文字左端；该文件现已由修复后截图替换。
- 影响：图和入口发生不必要的叠压；所谓“按需预览”开始抢邻区的操作空间。
- 调整：预览位置除视口边缘外还要避开 Hero CTA 与顶栏；靠边时优先换到指针另一侧，再收窄或下移，不缩小真实内容文字。
- 检查：Hero 尚未完全收走时悬停 WORK，指针经过行右端与 CTA 下方，确认倾斜图的实际四角不盖入口、标题或箭头。
- 状态：已复核最终替换截图。浮图下移，顶部与 CTA 留有清晰间距，未盖 WORK 标题或箭头。该项关闭。

### 2. 窄屏 WRITING 没给箭头留出完整呼吸空间

- 位置：390 与 320 的 WRITING 目录行末端。
- 证据：两张最新展开长图中，WRITING 的 G 与向下箭头距离明显小于 WORK、ABOUT；320 尤为紧。未观察到文字裁切，不将它夸大成阻断。
- 影响：箭头像挤在字尾的标点，栏目名与操作符号的层级不够清楚。大字本来有力量，不该靠吃掉操作空间保住字号。
- 调整：箭头保留固定轨道与间距；最长标题只能使用剩余宽度。在 320 的断点略降最长标题字号，不把所有文字一并缩小。
- 检查：320、390 的展开与折叠状态，标题不换形、箭头不位移、G 与箭头不贴边；黑白反转时同样检查。
- 状态：已复核 [最终 320 默认长图](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-default/page-320x740.png)。WRITING 适度缩小，G 与固定箭头之间留有明确空隙，未裁切。该项关闭；原展开长图保留的是修复前证据。

### 3. 默认首屏只露分隔线，尚未露出下半页的内容名

- 位置：Hero 下缘。
- 证据：[1280 默认长图](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-default/page-1280x900.png) 的 Hero 分隔线约在 y=900；[390 默认长图](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-default/page-390x844.png) 的 WORK 标题在实际 844px 首屏以下。用户知道“还有”，还不知道下面是什么。
- 影响：首屏的作者表达强，向真实作品的交接略晚。它没有成为模板，但还有一段可以压短的底部留白。
- 调整：完整首页阶段再统一安排 Hero 与第一条目录的关系，可让 WORK 标题露出一部分；保留当前姓名与兴趣词的比重，不为露内容破坏用户选定的构图。
- 检查：1280×900 与 390×844 都能看见下一节的内容提示，不与底部身份文案和 CTA 碰撞。
- 状态：主 Agent 明确将其留待完整首页的整页叙事；本轮字标与悬停验收不因此被阻断。

## 动效与证据

主操作反馈已有 WORK 字符化、反转、浮图出现与移动的连续状态；滚动驱动叙事已有姓名从字符巨字到实心顶栏字标的明显变化，而且可反向恢复。这一处确实让人有理由往回滚。去掉动效，仍剩字符姓名、人文斜体主题词与巨字目录的记忆点，方向不是靠动画掩盖空内容。

首次进入的证据属于“工具没拍到”：`evidence-06-motion/report.json` 检测到 load 动效，但数值不能证明字符聚集的节奏和完成度；新增 `evidence/06-entry/` 的 start、mid、end 三帧均为聚集完成状态，没有可比较的入场变化。当前三帧只能证明稳定首屏，不证明出场节奏。补齐前总分不超过 8，不断言页面没做出场，也不要求为取证缺口重开设计。

手机展开的当前静态结果合格，但早期 06-mobile-open 不应再作为成功操作录屏引用。建议由主 Agent 将当前 tap 的开始、展开过程、稳定结束三帧与自动化结果一并保留；这只补证据，不要求新开一轮视觉评审。

`06-switch-hover` 的原送审末帧曾出现顶栏颗粒字标。已复核 [最终末帧](/Users/haoo/Documents/Haoo-blog/output/design-exploration-2026-10-10/english-layouts/evidence/06-switch-hover/motion-end.jpg)：顶栏恢复清晰实心 `Haoo.`，ABOUT 保持清晰白字与黑底。该项关闭。主 Agent 最终交接为真实浏览器回归连续 3 次通过，本评审没有代跑测试，不将此交接写成自己执行的结果。

## 精修与下一档

200% 的目录线、编号、实心字与箭头未见明显裁切或基线错误。项目展开后使用真实界面，正文在 320 能正常换行。没有必须删除的填缝废话；`A personal corner of the internet` 可在完整首页内容足够后考虑删除，它不是当前问题的根因。

**8/10。** 距离 9 分还差：当前版本的首次进入与实际触屏展开动态证据齐全；完整首页中真实作品、文章和社交入口都从真实入口走通。已采纳的布局细节已经收口，后一个阶段尚未开始，不能把此原型评审冒充完整首页验收。

建议进入完整英文首页，不重开风格与版式选择。保留 01 的姓名星座、字符巨字和这一轮的短促反馈，集中把真实内容、入口与整页节奏做完整。
