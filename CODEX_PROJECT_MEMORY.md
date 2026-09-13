# Haoo Blog v2 项目记忆（greenfield 重建）

## 项目概况

- 新仓库：`Haoo-blog`，本地 `/Users/haoo/Documents/Haoo-blog`，GitHub 目标 `Haoo-7/Haoo-blog`（公有，待建远端）。
- 旧仓库 `/Users/haoo/Documents/Codex/2026-07-19/git-github/haoo-blog` 封存为只读参照，不再改动。
- 目标：Astro 静态输出重建个人博客，炫酷强排版首页 + 乔布斯式"科技×人文"气质，Slogan「TECH, LIFE & HISTORY」。
- 已定方向见 `REBUILD-BRIEF.md`，设计 token 见 `DESIGN-v2-draft.md`，不要重新讨论已定项。

## 已定决策（来自 REBUILD-BRIEF，不要推翻）

- Astro 静态输出；GSAP + ScrollTrigger + Lenis（动态 import）；Canvas 2D 优先，确需 shader 用 OGL，不默认 three.js。
- View Transitions API 或手写幕布转场。
- 双主题常驻，亮色默认；accent 亮色 #2E6FA8 / 暗色 #8FC8ED；弃暖橙、弃荧光绿。
- 字体：Satoshi 700 display-sans + Instrument Serif Italic 400 display-serif（同级双声部）+ quote-serif 仅文章引语。
- 设计规范按 Google design.md spec 格式，`npx @google/design.md lint` 校验。
- 首页中文 ≤60 字符；动静分区：首页炫、文章页静。
- 最小内容集：两篇真实文章 + 联系方式 + 基础站点信息；records/留言板等以后再做。

## 后端真相（2026-09-13 已核实，用户曾记错为已部署）

- 评论 Worker + D1 只跑通过本地，从未上线。
- 证据：旧仓库 `wrangler.jsonc` 远端 `database_id` 仍是全零占位符；项目记忆多处写"尚未部署到线上"；本机 `wrangler whoami` 未登录，无法查询远端。
- 结论：v1 按纯静态站起步，不接评论后端；后端重建部署是后续事项，需用户提供 Cloudflare 登录/API token 后再做。

## 已带走的种子文件（2026-09-13 从旧仓库复制）

- `REBUILD-BRIEF.md`、`DESIGN-v2-draft.md`（根目录）。
- `worker/` 全目录（含 migrations、src、tsconfig；另含旧 AGENTS.md，v2 启动时可删或重写）。
- `public/fonts/`（satoshi-medium/bold woff2、instrument-serif-italic.ttf、README 许可记录）。
- `src/content/posts/ai-assisted-learning.md`、`kindle-paperwhite-3.md`（两篇真实文章，frontmatter 已是 externalPublications 新结构）。
- `src/data/site.ts`（站点名、导航、邮箱、微信、社交链接）。

## 待办

- 建 GitHub 公有仓库 `Haoo-7/Haoo-blog` 并推初始提交。
- 在 Codex 新建项目指向 `/Users/haoo/Documents/Haoo-blog`（本会话无法代建，需用户在 Codex App 内操作）。
- v2 脚手架：Astro v5 + TypeScript + GSAP/ScrollTrigger + Lenis + design.md lint。
- 文章正文图片 `public/images/posts/` 尚未迁移（两篇共 42 张 WebP + 2 张封面）；脚手架完成后按需迁入。
- 后续事项：评论后端重建部署、records/留言板、正式域名与 PUBLIC_SITE_URL。
