# Phase 0 上线准备 — 记录

2026-10-29。brief 见同目录 `codex-brief.md`。

## 委派

- Codex `gpt-6.1-sol` / `xhigh`（已在 `~/.codex/sessions` 核对），thread `01a185b2-0e00-7880-b576-cf442c219106`。
- 用量：input 1,343,209（cached 1,236,608），output 14,272（reasoning 4,168）。
- Codex 自报：check 0 errors、build 成功、六个产物都在；浏览器验证在沙箱里跑不起来，留给主会话。`du -sh dist` 8.7M 是磁盘块口径，文件实际合计 7.21 MiB。

## 主会话复验

- `npx astro check`：0 errors / 0 warnings / 0 hints（34 files）。
- `npm run build`：7 页；`dist/` 有 404.html、rss.xml、sitemap.xml、robots.txt、favicon.svg、apple-touch-icon.png；`haoo.me` 0 处。
- 横向溢出：`/`、`/work/`、`/writing/`、`/about/`、文章页、404 在 360 / 375 / 390 / 768 下 `scrollWidth === clientWidth`。修之前 375 宽首页是 406。
- 尾巴尖在 375 宽仍完整露在页脚线下（描边 right 352 < 375），`.end { overflow-x: clip }` 只裁掉空的按钮框。

## 主会话改动

- 404 标题去掉 Codex 加的 `font-size: 96px; letter-spacing: 0` 和手机端 56px，回到 `.p-h1` 的 token（和其他内页一致）。
- favicon 在 `prefers-color-scheme: dark` 下垫纸色底：16px 渲染时墨猫在暗色标签栏上只剩两只眼睛。

## 未处理

- 未引用但保留：`public/images/projects/*.webp`、`public/images/skills/*.webp`（4 张）。
- 建仓 `Haoo-7/haoo-7.github.io` 和推送，等用户点头。
