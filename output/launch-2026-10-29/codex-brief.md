# Task: Phase 0 上线准备（部署到 GitHub Pages）

## Context
- Repo: `/Users/haoo/Documents/Haoo-blog`，Astro 5 静态个人站（Haoo，Life, Tech & History），纸墨灰阶设计。设计规范在 `DESIGN-v2-draft.md`，路线图在 `ROADMAP.md`，先读这两个文件。
- 部署目标：GitHub Pages 用户站 `https://haoo-7.github.io/`（仓库 `Haoo-7/haoo-7.github.io`，根路径，不设 `base`）。建仓和推送由主会话做，你不做。
- 依赖已装好：`@astrojs/rss` ^4.0.19（已在 package.json），`sharp` 在 node_modules。沙箱无网络，不要 `npm install`。
- 主会话的 dev server 在 4322 端口运行，不要停它。
- Target files（已确认存在）：`astro.config.mjs`、`tsconfig.json`、`src/layouts/Base.astro`、`src/styles/cat.css`、`src/styles/pages.css`、`src/components/TailTip.astro`、`src/components/Footer.astro`、`src/components/Cat.astro`、`src/data/site.ts`、`public/fonts/README.md`、`DESIGN-v2-draft.md`。

## Task
1. **站点地址**：`astro.config.mjs` 的 `site` 改为 `https://haoo-7.github.io`。
2. **类型检查**：`tsconfig.json` 的 `exclude` 加 `"worker"` 和 `"output"`。现在 `npx astro check` 的 27 个错误全部来自 `worker/`（它有自己的 tsconfig，依赖不在根目录），前端是 0 错误。
3. **手机端横向溢出**：375px 宽时首页 `document.documentElement.scrollWidth` 是 406。主会话已实测，唯一原因是页脚的 `.tail-btn`（`src/styles/cat.css:35`，`right: -52px; width: 160px`）伸出视口 31px；把它隐藏后 scrollWidth 回到 375。照片容器 `.tray-crop` / `.desk-crop` / `.dusk-crop` 已经 `overflow: hidden`，不是原因。要求：
   - 桌面端尾巴的位置和拖拽交互不变；窄屏不再撑宽页面。
   - 不要在 `html` / `body` 上加 `overflow-x: hidden`（会破坏 sticky 和 Lenis）。优先在最近的合理容器上用 `overflow-x: clip`，或在 ≤767px 断点调整 `right`，选一个并在报告里说明理由。
   - 360 / 375 / 390 / 768 四个宽度都不能溢出。
4. **favicon**：从 `src/components/Cat.astro` 的猫提炼一个简化猫头，存 `public/favicon.svg`：墨色 `#121212` 剪影，16px 下要认得出是猫（两只耳朵加圆头，可以留两只纸色眼睛）。不要手绘新造型，从现有路径简化。用 node + sharp 一次性生成 `public/apple-touch-icon.png`（180×180，纸色 `#EFEEEA` 底，猫居中），生成脚本不留在仓库。`Base.astro` 里把 `<link rel="icon" href="data:," />` 换成 svg favicon 和 apple-touch-icon 两个 link。
5. **404 页**：`src/pages/404.astro`，用 `Base` 布局，传 `hello={false}`。英文、克制：一行 mono kicker（`Fig. 404`），Literata 大字标题，强调用 `<em>`（参照首页 "Say *hello.*" 的写法，例如 "Nothing *here.*"），一句说明，两个链接（回首页、`All writing →`）。不加新动画、不加插图、不做黑闪。复用现有 token 和类，新样式写进 `src/styles/pages.css`。
6. **RSS**：`src/pages/rss.xml.ts`，用 `@astrojs/rss`。非 draft 文章按 `pubDate` 倒序；item 的 title 用 `title`、description 用 `description`、link 为 `/writing/<slug>/`；channel title 用 `Haoo — Life, Tech & History`，description 用 `siteConfig.description`；`customData` 写 `<language>zh-CN</language>`。`Base.astro` 的 head 加 `<link rel="alternate" type="application/rss+xml" title="Haoo" href="/rss.xml" />`。
7. **sitemap**：`src/pages/sitemap.xml.ts`，手写 endpoint，不引入 `@astrojs/sitemap`。收录 `/`、`/work/`、`/writing/`、`/about/` 和每篇非 draft 文章（`lastmod` 用 `pubDate`）；不收 `/posts` 重定向页和 404。URL 从 `context.site` 生成，不硬编码域名。
8. **robots.txt**：`src/pages/robots.txt.ts`，允许全部，`Sitemap:` 指向 `new URL('sitemap.xml', site)`。
9. **删掉没人引用的素材**（主会话已确认在 main 的 `src/` 和 `astro.config.mjs` 里 0 引用，删前你再 grep 一次）：
   - `public/assets/` 下全部 13 个文件（含 11MB 的 `source-han-serif-cn.woff2`），删完目录为空就删目录。
   - `public/fonts/satoshi-bold.woff2`、`public/fonts/satoshi-medium.woff2`、`public/fonts/instrument-serif-italic.ttf`、`public/fonts/refresh/instrument-serif.woff2`、`public/fonts/refresh/instrument-serif-italic.woff2`。
   - `public/fonts/README.md` 改写成现在还在用的三款字体（Literata、Instrument Sans、IBM Plex Mono，文件在 `public/fonts/refresh/`）的来源和 SIL OFL 1.1 许可说明。
   - `public/` 下你另外发现没有被引用的文件，只在报告里列出，不要删。
10. **部署工作流**：新建 `.github/workflows/deploy.yml`，内容如下（版本号已由主会话查过最新 release）：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx astro check
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

11. **设计规范**：`DESIGN-v2-draft.md` 的 Components 一节补两条（404 页、favicon），标【Agent 推断】。

## Constraints
- 只允许修改或新建：`astro.config.mjs`、`tsconfig.json`、`src/layouts/Base.astro`、`src/styles/cat.css`、`src/styles/pages.css`、`src/components/Footer.astro` 和 `src/components/TailTip.astro`（这两个只为修溢出）、`src/pages/404.astro`、`src/pages/rss.xml.ts`、`src/pages/sitemap.xml.ts`、`src/pages/robots.txt.ts`、`public/favicon.svg`、`public/apple-touch-icon.png`、`public/fonts/README.md`、`.github/workflows/deploy.yml`、`DESIGN-v2-draft.md`；只允许删除第 9 条列出的文件。
- 禁止：`git commit` / `push` / 切换或新建分支；联网、`npm install`、新增依赖；改 `worker/`、`src/content/`、`output/`、`ROADMAP.md`、`package.json`、`package-lock.json`；改现有页面的视觉和动效（修溢出除外）。
- 注释沿用仓库风格：简短中文注释，只在不显而易见的地方写。

## Acceptance
- `npx astro check` 输出 0 errors。
- `npm run build` 成功；`dist/` 下有 `404.html`、`rss.xml`、`sitemap.xml`、`robots.txt`、`favicon.svg`、`apple-touch-icon.png`。
- `du -sh dist` 不超过 8M（现在 18M）。
- `grep -r "haoo.me" dist` 没有结果；`dist/rss.xml` 里两篇文章的链接是 `https://haoo-7.github.io/writing/<slug>/`；`dist/sitemap.xml` 不含 `/posts`。
- 溢出：360 / 375 / 390 / 768 宽度下首页 `scrollWidth === clientWidth`。如果本机跑不了浏览器，在报告里写明「未验证」，由主会话验证，不要为此装东西。

## Report
- 新增、修改、删除的文件清单。
- 每条验收命令的实际结果。
- 溢出的修法和理由。
- 另外发现的未引用文件。
- 未解决或没验证的项。
