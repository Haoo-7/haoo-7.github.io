# Task: 把 Say hello 的社交链接换成邮票版张（Hello.astro）

## Context
- Repo: /Users/haoo/Documents/Haoo-blog/.claude/worktrees/hungry-payne-f47dc4（Astro 5 个人博客，分支 feat/social-links）。视觉是纸与墨：只用灰阶，蓝色 `--blue` 只给链接和焦点。设计变量在 `src/styles/tokens.css`。
- 已确认的小样（视觉和交互都以它为准，只读）：`output/social-links-2026-10-28/r3/explore/index.html`、`assets/stamps.css`、`assets/stamps.js`；截图在 `output/social-links-2026-10-28/r3/shots/states/`、`r3/shots/phone/`、`r3/evidence/`。
- 素材已放好：`public/images/stamps/{front,back,sheet,mark}.webp`、`public/images/stamps/wechat-qr.png`、`public/images/stamps/icons/{gmail,qq,github,sspai,bilibili,xiaohongshu,wechat}.svg`。
- 目标文件（均已存在）：`src/data/site.ts`、`src/components/Hello.astro`、`src/components/Footer.astro`、`src/styles/parts.css`。新建：`src/scripts/stamps.ts`。
- 相关但不改：`src/scripts/core.ts`（全局绑定所有 `[data-copy]` 按钮，要求按钮里有 `.ok`；全局刷新所有 `[data-time]` 为广州时间）、`src/pages/work/index.astro`（按 `label === 'GitHub'` 查找）。

## Task
1. `site.ts`：`SocialLink` 加字段 `kind: 'link' | 'mail' | 'qr'`、`icon`（icons 下的文件名）、`short`（印在票底的短账号）、`primary?: boolean`。七条按顺序：Gmail(mail, re11.zhou@gmail.com)、QQ Mail(mail, re11.zhou@qq.com)、GitHub(link, https://github.com/Haoo-7, Haoo-7, primary)、sspai(link, https://sspai.com/u/6veuyub4/updates, Haoo_7, primary)、Bilibili(link, https://space.bilibili.com/438365760, Haoo_117c, primary)、Xiaohongshu(link, https://www.xiaohongshu.com/user/profile/65464d64000000000d005c9b, Haoo, primary)、WeChat(qr, 公众号)。`siteConfig.email` 不变；work 页的 GitHub 查找必须继续可用。
2. `Hello.astro`：右栏的 `ul.elsewhere` 换成小样里的版张（`.sheet` + 4 列 `.grid`，7 张票 + 第 8 格广州时间邮戳，上下边纸文字，底边是 `aria-live="polite"` 的状态行）。左栏邮箱、Copy address、more 链接保持现状。
   - link 票：真实 `<a href target="_blank" rel="me noopener">`，点击时给票加 `.used`（盖戳）和版张一次 `.thud`，不要 preventDefault。
   - mail 票：`<button>`，点击盖戳、复制地址，状态行显示 `Copied · <地址>`，失败显示 `Couldn’t copy · <地址>`，约 2.4 秒后恢复。不要用 `data-copy` 属性（会被 core.ts 的绑定抢走）。
   - qr 票：`<button aria-pressed>`，3D 翻面露二维码，再点或 Esc 翻回；二维码去色。
   - 时钟格用 `data-time`，交给 core.ts 刷新，不另写计时器。
   - 每张票有可读的 `aria-label`；图标 `alt=""`，小红书的名字用 `.sr-only`（图标本身是字标）。
3. `parts.css`：把小样的 stamps.css 并进来，类名加前缀避免和全站冲突（现有 `.mail`、`.copy`、`.card`、`.side`、`.front` 等名字不能被污染，例如统一用 `.stamp-*` / `.sheet-*`）。颜色、字体、缓动用 tokens 里的变量。删掉不再使用的 `.elsewhere` 规则。
   - `.hello-body` 在 ≥1280 改成左栏自适应、右栏放版张（约 800px 宽，票宽 144px）；1024–1279 用 `--sw` 的 clamp 让版张放得下；<1024 单列，版张占满宽，<768 改 2 列，并用小样手机版的做法（纸纹 + `::before` 双线框，不拉伸 sheet.webp）。
   - `prefers-reduced-motion: reduce` 时关掉翻面、盖戳和 thud 的过渡。
4. `Footer.astro`：`end-links` 只列 `primary` 的四条，结构不变。
5. `src/scripts/stamps.ts`：从 Hello.astro 的 `<script>` 引入，用 core.ts 导出的 `$`、`$$`、`reduce`。

## Constraints
- 只允许修改上面列出的四个文件，并新建 `src/scripts/stamps.ts`。
- 禁止：改 package.json 或装依赖、联网、git commit/push、改 `public/` 和 `output/` 下的任何文件、改 core.ts 和其他页面。
- 不用 `!important`；不加浏览器默认样式的按钮外观（沿用 base.css 对 button 的重置）。

## Acceptance
- `npx astro check` 应 0 error。
- `npm run dev` 后 `/` 和 `/about/` 的 Say hello 显示版张，`/writing/` 页脚只有四条链接；GitHub 票是新标签打开的真实链接，点后盖戳；QQ 邮箱票复制成功并在状态行提示；公众号票翻面、Esc 翻回。
- 1440、1024、390 三个宽度都没有横向溢出。

## Report
- 返回改动文件、`astro check` 输出、未解决项和关键 diff 摘要。
