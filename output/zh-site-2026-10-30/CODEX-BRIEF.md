# Task: 给 Haoo Blog 加中文版（/zh/），英文版保持默认

## Context
- Repo：`/Users/haoo/Documents/Haoo-blog/.claude/worktrees/stoic-taussig-1a5718`，Git worktree，分支 `claude/zh-site`，工作区干净。Astro 5 静态站，部署到 GitHub Pages。
- 先读：`AGENTS.md`、`DESIGN-v2-draft.md`（视觉规范，只读）、`output/zh-site-2026-10-30/COPY-zh.md`（**中文文案定稿，唯一依据**）、`output/zh-site-2026-10-30/DESIGN-NOTE.md`（字体决定）。
- 涉及文件（都已存在）：`src/layouts/Base.astro`，`src/components/{Bar,Footer,Hello,Loader,Reader,TailTip,Tray,Cat}.astro`，`src/pages/{index,404}.astro`，`src/pages/{about,work,writing}/index.astro`，`src/pages/writing/[...slug].astro`，`src/pages/sitemap.xml.ts`，`src/data/{site,frames,projects,posts}.ts`，`src/scripts/{core,stamps,article,home}.ts`，`src/styles/{tokens,base,parts,pages,article,home}.css`，`public/fonts/README.md`。
- 字体源文件（gitignore，不进仓库）：`output/zh-site-2026-10-30/fonts/noto/SubsetOTF/SC/NotoSerifSC-Regular.otf`、`NotoSerifSC-Medium.otf`，OFL 授权文本在 `output/zh-site-2026-10-30/fonts/noto/LICENSE`。Python 用 `/opt/homebrew/bin/python3`，fontTools 和 brotli 已装在它的 user site。

## Task

### 1. 路由和结构
- 英文页面地址不变，是默认版本。中文版放 `/zh/`：`/zh/`、`/zh/work/`、`/zh/writing/`、`/zh/writing/<slug>/`、`/zh/about/`。不按浏览器语言自动跳转，不记住选择。
- 不要把每个页面复制一份。建议：页面主体抽到共享组件（例如 `src/views/*.astro`），接收 `lang: 'en' | 'zh'`；英文路由和 `src/pages/zh/` 下的路由都只是薄壳。语言工具和界面字典放 `src/i18n/`（例如 `ui.ts` 放两种语言的字符串，`lang.ts` 放 `pathFor(path, lang)`、对应页地址等）。
- 数据加中文字段，不另建数据文件：`frames.ts` 加 `lineZh`；`projects.ts` 加 `lineZh`、`problemZh`、`doesZh`、`stackZh`、`statusZh`；`site.ts` 的 `socialLinks` 加 `labelZh`（QQ 邮箱、Gmail、GitHub、少数派、B站、小红书、公众号）。
- 中文页里所有站内链接都指向 `/zh/` 下的对应页（包括关于页第二章里的 Work、Writing 链接、文章列表、下一篇、All work →、More about me → 等）。

### 2. 文案
- 中文版的全部文字以 `COPY-zh.md` 为准。表里写「留英文」的保持英文原样；写了中文的照抄，**不改措辞、不改标点**（首屏介绍、Work 说明、Writing 预告、History、关于页说明是用户亲手写的，尤其不能动；首屏介绍是一整句，没有灰色后半句，末尾没有句号，照原样）。
- 所有标题在中文版都保留英文（On the bench.、Written down.、One person, three frames.、Say hello.、关于页三章的 h2 等）。等宽小字、导航、按钮式链接、元信息、图注全部保留英文。
- 中文版文章页：去掉英文副标题 `.post-en`、元信息里的 In Chinese；`.next-en` 不显示。文章列表页：标题只放中文 `title`，不放 `.zh` 那一行，dek 用 `description`；页眉计数只留 `{n} pieces`；`postMeta` 不带 In Chinese。平台名在中文版显示为「少数派」「公众号」。
- 文案稿没写到的中文（照这里来，不自己发挥）：
  - meta description：首页用 COPY 里那句；Work「Haoo 做的小工具，每个都写了起因、能做什么和源码地址。」Writing「Haoo 写的随笔、数码评测和历史研究。」About「Haoo，暨南大学历史学系在读。关于我，以及怎么联系我。」`<title>` 和英文版相同。
  - 图片 alt：life.jpg「窗边书桌上放着一本平装书、一杯水和一副耳机」；tech.jpg「切割垫上放着一把装了一半的机械键盘和一块裸露的电路板」；history.jpg「一本摊开的线装书，旁边是卷起的碑帖拓片」；reader.jpg「晨光里的木书桌上放着一台阅读器、一支铅笔和一本摊开的笔记本」；dusk.jpg「傍晚的同一张书桌，阅读器进入待机，屏幕上显示时钟」；二维码「Haoo 公众号的二维码」。
  - aria-label / 读屏文字：跳到正文；Haoo，首页；主导航；阅读设置；缩小字号／放大字号；广州当地时间；下一张照片；其他平台（页脚链接列表）；其他平台的邮票（邮票版张）；链接票「{labelZh}，{handle}，在新标签页打开」；邮箱票「{labelZh}，{handle}，复制地址」；公众号票「公众号，显示二维码」／「公众号，隐藏二维码」；拉一下猫尾巴，回到顶部；目录；继续浏览；关闭注释；加载中（Loader 的 status）。
  - 复制失败提示（core.ts）中文：「没能复制，请手动选中上面的邮箱地址。」成功提示 `Copied: …` 保持英文。stamps.ts 的 `Scan with WeChat` 保持英文。
- 脚本里的字符串按 `document.documentElement.lang` 选语言，不要在 zh 页面里出现英文的读屏文字。
- 404 只有一个文件：保留英文，在说明下方加一行中文「这个页面不存在。它可能已经移走，或者地址输错了。」（`lang="zh-CN"`）和一个指向 `/zh/` 的等宽链接「中文首页 →」。

### 3. 语言切换和 head
- 顶栏（Bar）加等宽的「EN / 中」切换，放在时钟左边（文章页在 Aa 左边），跳到当前页的另一语言版本；当前语言用 `aria-current` 标出，两个链接带 `hreflang` 和 `lang`。手机端时钟会隐藏，切换必须保留且不能撑破顶栏。
- `<html lang>`：英文 `en`，中文 `zh-CN`。中文页里的英文片段（顶栏导航、`.kick`、按钮式链接、图注这类）在合适的容器上标 `lang="en"`，不要逐个 span 标。
- 每页加 `<link rel="alternate" hreflang="en">`、`hreflang="zh-CN"`、`hreflang="x-default"`（指英文），canonical 指向自己。`og:locale` 分别为 `en_US`、`zh_CN`。
- `sitemap.xml.ts` 加上全部中文地址。RSS 不动。

### 4. 中文字体（思源宋体，分片）
- 新建 `scripts/build-zh-font.py`（中文注释），从上面两个源文件生成 `public/fonts/zh/`：
  - 字符集 = GB2312 全部汉字 ∪ `src/` 下所有 `.md/.astro/.ts` 文件里出现的字符 ∪ 中文标点和全角符号。
  - 排序：站内出现过的字按出现频率排前面，其余 GB2312 字按码位接在后面；每片约 400 字；400 和 500 两个字重各一套 woff2。
  - 另出一个只含中文标点的小文件，用作 `ZhPunct`（`U+2014, U+2018-201D, U+2026, U+3000-303F, U+FF00-FFEF`）。
  - 生成 `public/fonts/zh/zh.css`：每片一条 `@font-face`，family 名 `"Noto Serif SC Web"`，`font-display: swap`，带 `unicode-range`。
  - 复制 OFL 授权文本到 `public/fonts/zh/OFL.txt`，在 `public/fonts/README.md` 补一节说明来源、授权和怎么重新生成（源文件要自己从 notofonts/noto-cjk 的 Serif2.003 release 下载）。
- `Base.astro` 用普通 `<link rel="stylesheet">` 引 `/fonts/zh/zh.css`（全站引用，unicode-range 保证只下需要的片）。
- `tokens.css`：
  - `--serif`（大字、文章标题、目录、下一篇）：`"Lit", "Noto Serif SC Web", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif`。
  - 新增 `--serif-read`（文章正文、TL;DR、阅读器屏幕）：`"Lit", "Songti SC", "Noto Serif SC Web", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif`，Mac 上用系统宋体，不下载分片。`article.css` 里 `--read` 改用它。
  - `:lang(zh)` 下两个衬线栈最前面加 `"ZhPunct"`，让 `“”‘’…—` 和全角标点走中文字体，不被 Literata 排成西文宽度。
- 中文文字不能继承负字距（检查 `.intro`、`.lede`、`.p-lede`、`.facts p`、`.chapter p`、`.entry`、`.d-line`、`.d-facts dd`、`.hello` 里的中文），需要时用 `:lang(zh)` 归零。
- 邮票上的中文名（少数派、B站、小红书、公众号、QQ 邮箱）不要斜体：给这些 `.stamp-nm` 标 `lang="zh-CN"`，CSS 用 `:lang(zh)` 设 `font-style: normal`。英文名照旧斜体。
- 阅读器屏幕（Reader）在中文版用中文 `title` 和 `description`，比英文长很多：`.s-title` 最多 3 行、`.s-dek` 最多 4 行，用 line-clamp 截断，不许溢出屏幕。

## Constraints
- 只允许修改：`src/**`（`src/content/posts/` 除外）、`public/fonts/**`、新建 `scripts/build-zh-font.py`；`astro.config.mjs` 只在确实需要时改。
- 禁止：改 `worker/`、`src/content/posts/`、`DESIGN-v2-draft.md`、`ROADMAP.md`、`AGENTS.md`、`CLAUDE.md`、`output/`（只读）；改英文版的任何可见文案（只多出语言切换）；改颜色、间距、动效等视觉变量；新增 npm 依赖；联网下载；`git commit`、`git push`。
- 沿用现有代码风格：中文注释、CSS 一条规则一行、2 空格缩进、TS 用单引号。

## Acceptance
- `npx astro check` 报 0 errors。
- `npx astro build` 成功。
- `ls dist/zh/index.html dist/zh/work/index.html dist/zh/writing/index.html dist/zh/about/index.html dist/zh/writing/kindle-paperwhite-3/index.html dist/zh/writing/ai-assisted-learning/index.html` 全部存在。
- `grep -o '<html lang="zh-CN"' dist/zh/index.html` 有输出；`grep -o 'hreflang="zh-CN"' dist/index.html` 有输出；`grep -c '/zh/' dist/sitemap.xml` 大于 0。
- `grep -rl "In Chinese" dist/zh` 无输出；`grep -rl "Probably not headed" dist` 无输出。
- `grep -o "这些小工具都是为了解决我自己碰到的问题做的。未完待续～" dist/zh/index.html` 和 `grep -o "我是 Haoo，历史学系在读，正在尝试用科技改变生活" dist/zh/index.html` 都有输出。
- `du -sh public/fonts/zh` 不超过 4M，`ls public/fonts/zh/OFL.txt` 存在。

## Report
- 改动和新增的文件列表；每条验收命令的实际输出；字体分片数量、总大小和 `zh.css` 大小；和本 brief 不一致的地方及原因；没做完或拿不准的项。
