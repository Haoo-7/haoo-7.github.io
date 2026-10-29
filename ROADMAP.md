# Roadmap — Haoo Blog

2026-10-29 定。约束：零预算（不买域名、不备案）；读者国内为主、海外也有；写稿在 Obsidian。

## Phase 0：上线（2026-10-29 完成）

托管选 GitHub Pages，地址 `https://haoo-7.github.io/`。理由：免费、不用域名、不用备案，国内能打开（偏慢）。Cloudflare 的 `pages.dev` / `workers.dev` 在国内部分地区被墙，没有自己的域名时不可用；EdgeOne 想要国内加速必须有备案域名。

- [x] 合入阅读页 Aa 面板（0a44044）
- [x] 修手机端横向溢出（页脚尾巴按钮）
- [x] favicon、404 页、RSS、sitemap、robots.txt
- [x] 删掉没人引用的字体和旧素材（含 11MB 思源宋体）
- [x] `astro check` 排除 `worker/`；GitHub Actions：check 和 build 通过才部署
- [x] 建公开仓库 `Haoo-7/haoo-7.github.io`，推 main，开 Pages（首次部署 run 40832080276 成功）

暂缓：分享图（微信不读 og:image，收益低）；访问统计（要你自己注册账号）。

## Phase 1：写作管线

- Obsidian → `src/content/posts/` 导入脚本：转 WebP、封面去色、补 frontmatter、检查 `externalPublications`。
- 轻量内容 Notes（短想法、链接、摘句），首页 Lately 改为从 Notes 读。
- 历史类文章的文末书目格式。

## Phase 2：互动

- 先解决 API 在国内的可达性：`workers.dev` 国内不通，需要免费域名或换方案后再部署 worker。
- 部署 worker：D1 + 三个 migration、Turnstile、Resend、Access。
- 评论先做方向 A「读完了 + 留言列表」；文章页显示阅读量。

## Phase 3：长期、可选

- Library：KOReader 划线生成书架页。
- /now：最近在做、在听（worker 已有歌单接口）。
- Work 构建时拉 GitHub star 和最近提交。
- 精选文章英文版（schema 已有 `titleEn` / `dekEn`）。
- 文章超过十几篇后加 Pagefind 搜索。
- 暗色主题（待定）。

## 贯穿全程

Playwright 截图对比（首页、文章页）、Lighthouse 预算、死链检查；过一遍 `DESIGN-v2-draft.md` 里的「Agent 推断」条目。
