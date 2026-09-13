# Blog v2 重建交接简报

> 给执行模型的完整上下文。目标环境：**macOS 全新机器**，与旧仓库无路径耦合。决策已由好哥逐项拍板，**不要重新讨论已定项**，直接在此方向内产出具体设计。

## 一句话

在全新环境从零重建个人博客（旧站为 vibe coding 产物，前端不复用），目标：炫酷强排版主页 + 乔布斯式"科技×人文"气质，Slogan「TECH, LIFE & HISTORY」。

## 已定决策（照此执行）

1. **框架**：Astro 静态输出（ansyn.me 实证：Astro v5 全站 JS 仅 ~54KB 也能做出顶级炫酷主页）
2. **动效**：GSAP + ScrollTrigger（2024 起全部插件免费）+ Lenis 平滑滚动（动态 import 懒加载）
3. **画布层**：按需，Canvas 2D 优先；确需 shader 用 OGL（轻量 WebGL），不默认上 three.js
4. **转场**：View Transitions API 或手写幕布（ansyn.me 5KB 手写范式）
5. **后端**：复用旧站的 Cloudflare Worker + D1 评论服务——它独立部署在 Cloudflare 上，与机器无关；新前端只需配置 API base URL（如需源码，从旧仓库 `worker/` 目录带走）
6. **双主题常驻，亮色为默认主视角**（好哥明确偏好亮色页面）；暗色作为完整第二主题
7. **强调色**：蓝色系——亮色主题 accent #2E6FA8（深海蓝，对比度 4.98:1 过 AA）/ 暗色主题 accent #8FC8ED（天空蓝）；弃暖橙 #F0A36F（AI 设计滥用色）、弃荧光绿（jiejoe 的身份色，照抄即撞脸）
8. **字体已定稿**：Satoshi 700（display-sans，Fontshare ITF FFL 许可，fontsource 或 Fontshare 官网下载自托管）+ Instrument Serif Italic 400（display-serif，SIL OFL，Google Fonts/fontsource）；两族同级双声部（同尺寸换音色）；另有 quote-serif（1.5rem）仅供文章引语，禁止上首页
9. **设计规范**：按 Google design.md spec 格式书写（YAML front matter + 固定章节顺序 + `npx @google/design.md lint` 校验）；核心 token 见下方内联，完整草案见"带走清单"
10. **减字铁律**：首页中文总字数 ≤60 字符（AI 堆字是最大反模式）
11. **动静分区**：炫酷集中在首页/门面（橱窗），文章页保持安静（书房）

## 设计方向（概念层，具体方案由执行模型产出）

- **主参考 ansyn.me（亮色炫酷的完整实证）**：云白底 + 近黑大字排版 + Canvas 2D 文字特效 + 幕布转场 + 编号列表。亮色炫酷的要点：墨色大字与云白底拉满对比度，accent 蓝点亮，canvas 特效用墨/蓝而非荧光
- **从 jiejoe.com 只抄"型"不抄"色"不抄渲染架构**：满版堆叠大字、编号作品/文章列表、强滚动叙事（scrub 驱动）；它是 Vue SPA 暗底荧光绿，架构与配色都不跟
- **科技×人文的落点**：slogan 双声部——TECH/HISTORY 用 Satoshi 700（实心与描边交替），life 用 Instrument Serif Italic + accent 蓝，四个词同级一个整体，即"站在科技与人文十字路口"的视觉宣言；中文竖排年份 + 蓝色印章落款；编号列表可走编年逻辑
- **动效温度**：GSAP expo/power3 曲线（快进缓停的电影感），衬线词逐字符淡入（印刷感），不用终端机械感的硬切闪现

## 设计 token（亮色优先，来自已 lint 的草案）

```yaml
colors:
  primary: "#14253A"     # 墨（正文/大字）
  secondary: "#55708C"   # 雾蓝灰（辅助文字）
  accent: "#2E6FA8"      # 深海蓝（链接/强调/印章）
  neutral: "#F6F8F8"     # 云白（页面底）
colorsDark:
  paper: "#0B1220"
  ink: "#E8EEF4"
  accent: "#8FC8ED"
typography:
  display-sans: { font: "Satoshi", weight: 700, size: 4.5rem }
  display-serif: { font: "Instrument Serif", style: italic, weight: 400, size: 4.5rem }
  quote-serif: { font: "Instrument Serif", size: 1.5rem }
  body: { font: "Satoshi", size: 1rem }
  meta: { font: "Satoshi", size: 0.75rem, letter-spacing: 0.08em }
```

## 工具链（跨平台安装，非本机路径）

- **Hallmark**（反 AI 味设计 skill）：`npx skills add nutlope/hallmark`；study 模式可将参考站提成 DNA 卡，build 模式出 hero 方向稿
- **Impeccable**（打磨/审计 skill）：github.com/pbakaus/impeccable，按其 README 安装
- **设计规范 CLI**：`npx @google/design.md lint` 校验 DESIGN.md

## 需要从旧 Windows 仓库带走的文件（仅 3 项）

1. `DESIGN-v2-draft.md` —— 已过 lint 的完整设计规范草案（本仓库根目录，正文含 Do's and Don'ts 减字铁律）
2. `worker/` 目录 —— 评论后端源码（若 Cloudflare 上已部署则可选）
3. `public/fonts/` —— 已自托管字体文件与许可记录（也可按第 8 条重新下载）

其余一切（页面、组件、样式、测试）不迁移。

## 参考站拆解备忘

- **ansyn.me**：Astro v5.18.2 + vanilla TS；无 GSAP/three.js/WebGL，Canvas 2D 手写 hero 文字特效（rAF 驱动）；Lenis 动态 import；手写 5KB 幕布转场（sessionStorage 交接 + 开场问候）；双语 en/zh；全程尊重 prefers-reduced-motion；亮色 #fdfdfd
- **jiejoe.com**：Vue SPA 纯客户端渲染；暗底 + 荧光绿 #17f700 + 满版大字 + 编号列表 + 强动效——视觉设计师个人站，只取排版之型
