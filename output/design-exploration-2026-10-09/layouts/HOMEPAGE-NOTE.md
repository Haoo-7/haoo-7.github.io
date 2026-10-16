# 字符巨字首页深化

2026-10-10。用户确认「03 巨字精修：01 字符巨字」。交付 `homepage.html`，未覆盖正式入口或旧探索页面。

## 方向与内容

白 #FCFCFC、墨黑 #181818、蓝 #2456D6。Satoshi 姓名与思源宋体中文形成技术和人文的对照。前景是可交互字符姓名，背景是低对比 TECH / LIFE / HISTORY；蓝色留在句点、指针反馈、扫描带和入口，不退成纯黑白。

顺序为身份、作品、文章、社交。作品仅 Dayline Journal 与 Haoo Blog，未加入 wandeng。Dayline 使用 GitHub 仓库对应的真实本地发布截图，链接到 Haoo-7/Obsidian-Dayline；Blog 暂打开关于面板，没有编造公开仓库地址。文章链接到真实少数派原文，社交使用已核实的 Haoo-7、Bilibili、少数派与邮箱。原 `src/data/site.ts` 中旧 GitHub 账号未在本轮改动，迁入正式站点时需同步。

## 动效分镜

- 入场：字符散开后聚为姓名，背景排字、宋体口号与入口跟随，550ms 内结束。
- 主交互：鼠标经过姓名，局部字符避让并变蓝，离开恢复；查看作品按下有位移反馈，并直接定位作品区。
- 状态切换：关于面板从右边进入，Esc 与关闭按钮返回。
- 滚动：约首屏一屏距离内字符转实心、姓名缩进导航；三层背景按不同方向退出，回滚恢复。不劫持滚轮。
- 区块：Dayline 图片垂直揭开，Blog 图片水平揭开，文章文字横向依次到位，页脚随后进入；一次性出场。
- 减少动态：`?motion=reduce` 不缩放、不扫描、不做指针避让，直接呈现内容。未单独测试操作系统偏好切换。

## 素材

- Dayline 原图：`/Users/haoo/Desktop/Obsidian-Calendar-Sidebar/screenshots/dayline-showcase.png`；桌面导出 1600x1047 WebP，手机从原图裁出 630x800 月历。保留真实产品颜色，不套蓝色滤镜。
- Kindle 原图：旧站 `public/images/posts/kindle-paperwhite-3.webp`，导出 1000x499 WebP。
- AI 学习封面：imagegen relay，gpt-image-2.5，generate，1536x1024 high。实际查看后采用；900x600 WebP 约35KB。生成原图与重建提示简报在 `output/imagegen/`，精确原提示未在压缩上下文中保留。该图不是产品截图。
- Blog 缩略图：从本轮实际首页整页截图裁出文章区，1280x720 WebP，替换重复的旧版 Haoo 首屏。
- 字体仍为完整约11MB CN字库，正式实现需要分片或子集化。

## 验证与边界

证据集中在 `evidence/homepage/`。`default/` 检查1280、390、320首屏；`full/` 为已滚动加载图片后的整页；`mobile-works/` 检查直接定位及月历裁切；`about-open/` 检查面板；`detail/` 为200%局部。均无控制台错误、横向溢出或图片加载失败。

动效证据：`entry/`、`pointer-story/`、`sections/`、`about/` 的录屏与三帧。额外拼帧在 pointer-story/story-sheet.jpg 和 sections/sections-sheet.jpg。`motion-check/report.json` 检出入场、状态切换和滚动变化。初次 Canvas 聚合的最早阶段未被录屏捕获，不宣称该项视觉证据完整。

`character-preview.test.cjs` 覆盖旧字符模块和新首页模块的隐藏初始化、零尺寸保护、隐藏/显示、改变视口和减少动态；最后连续三次均6/6通过。JS语法检查通过。没有生产构建或正式路由接入。

独立视觉评审一轮8/10：字符主视觉、鼠标避让和排版成立；要求首屏身份可见、Blog 不重复巨字、补完整入场证据。详见 `HOMEPAGE-REVIEW.md`。

评审后做了四处局部调整：首屏身份改为人文社科学生；解除 opening 的 stacking context，避免缩进导航的姓名被导航底色盖住；Blog 改用文章区截图；删除重复作品总数与「这个网站也在持续生长」。最终这几处只做源码和资源检查，尚未重新做真实画面验收，评分没有提升。

内置浏览器拒绝 file 协议页，未通过临时服务器、其他浏览器或协议工具绕过。已有证据来自此前正常运行的截图工具；拒绝之后没有继续浏览该页面。正式页面迁入前还需补齐最终画面与入场验收，不把当前预览称为上线成品。
