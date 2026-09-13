---
version: alpha
name: Haoo Blog
description: "深空靛蓝的个人博客：编辑部级排版、天空蓝单强调色、门面炫而阅读静"
colors:
  primary: "#14253A"
  secondary: "#55708C"
  accent: "#2E6FA8"
  on-accent: "#FFFFFF"
  neutral: "#F6F8F8"
  surface: "#FFFFFF"
  rule: "#D9E1E8"
colorsDark:
  primary: "#E8F1F6"
  secondary: "#7E93A3"
  accent: "#8FC8ED"
  on-accent: "#0B1220"
  neutral: "#0B1220"
  surface: "#101A28"
  rule: "#16273A"
typography:
  display-sans:
    fontFamily: Satoshi
    fontWeight: 700
    fontSize: 4.5rem
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  display-serif:
    fontFamily: Instrument Serif Italic
    fontWeight: 400
    fontSize: 4.5rem
    lineHeight: 1.05
  quote-serif:
    fontFamily: Instrument Serif Italic
    fontWeight: 400
    fontSize: 1.5rem
    lineHeight: 1.4
  h2:
    fontFamily: Satoshi
    fontWeight: 700
    fontSize: 2rem
  body-lg:
    fontFamily: Satoshi
    fontWeight: 500
    fontSize: 1.125rem
    lineHeight: 1.7
  body-md:
    fontFamily: Satoshi
    fontWeight: 500
    fontSize: 1rem
    lineHeight: 1.7
  meta:
    fontFamily: Satoshi
    fontWeight: 500
    fontSize: 0.875rem
    letterSpacing: "0.02em"
rounded:
  sm: 4px
  md: 8px
  pill: 999px
spacing:
  "3xs": 4px
  "2xs": 8px
  xs: 12px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  "2xl": 96px
components:
  page-background:
    backgroundColor: "{colors.neutral}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  divider:
    backgroundColor: "{colors.rule}"
    height: 1px
  nav-link:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.meta}"
    padding: "12px 8px"
  meta-text:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.meta}"
  article-row:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    padding: "16px 0"
  article-number:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.accent}"
    typography: "{typography.meta}"
  link-underline:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.accent}"
    typography: "{typography.body-md}"
---

# Design — Haoo Blog

## Overview

深空靛蓝的个人博客。气质关键词：**克制的大、编号的秩序、一句话的态度**。

门面（首页/导航/关于）允许滚动叙事与入场动效；文章页正文零干扰——**门面炫、阅读静**，这条分层原则高于一切单页审美。

YAML 中 `colors` 为亮色主题的规范值；`colorsDark` 是本项目的暗色主题扩展键（Google spec 尚未支持暗色模式，export 工具会忽略它——实现时以 `tokens.css` 双主题变量为唯一事实源，本文件的 `colorsDark` 是暗色语义的文档化快照）。

中文内容为主：英文展示字体负责气质，中文回退系统 CJK 字体，不为中文强行配网络字体。

## Colors

双主题，默认暗色起手，文章阅读可切亮色。**强调色在整页占比低于 5%**：编号、当前态、下划线、focus 环，仅此四处。

- **primary**（墨）：亮色模式下是深靛 `#14253A`（标题与正文）；暗色模式下翻转为浅色文字 `#E8F1F6`——它是"前景主色"角色，不是固定深色
- **accent**：亮色 `#2E6FA8` 深海蓝（对 neutral 底 4.98:1，AA）；暗色 `#8FC8ED` 天空蓝（对 neutral 底 10.4:1）
- **neutral / surface**：亮色为云白/纯白，暗色为近黑深靛/深靛面板
- **rule**（云线）：分割线专用，不做装饰
- 禁止暖橙 `#F0A36F` 作为强调色（AI 设计滥用色）
- 禁止紫色/蓝紫渐变背景，禁止渐变 Hero

## Typography

字体系统按档位分层：`display（展示）→ h2（章节）→ body（正文）→ meta（元信息）`。**display 是"给谁看"的档位名，不是"谁重要"的排序。**

Slogan「TECH, LIFE & HISTORY」是**一个整体，同级双声部**：四个词同为 display 档（4.5rem），只换音色，无主次之分——粗无衬线是"硬"，衬线斜体是"浪"，同级对比是编辑排版的经典手法。

- **display-sans**：Satoshi 700——TECH, LIFE 的声部
- **display-serif**：Instrument Serif Italic（斜体字面）——& HISTORY 的声部，**同级，不是配角**
- **quote-serif**：Instrument Serif Italic 的正文级音色（1.5rem），只用于文章内引语——与 display 严禁混用
- **Body**：Satoshi 500 + 系统 CJK 回退

中文正文行高 1.7–1.8，行宽 32–38 字符。两级字重起步（400/700），禁止 600。

## Layout

- 4pt 间距倍数；内容最大宽度 1120px；移动端 gutter 24px
- **打破对称**：首页大字左对齐，文章列表编号悬挂在左栏——不对称出现至少一次
- 首页宏结构：Index-first——大字 Hero → 一句话态度 → 编号文章列表 → 页脚，四段，没有第五段

## Motion

- 指数缓出 `cubic-bezier(0.16, 1, 0.3, 1)`；时长 180/240/320ms 三档
- 门面允许：Hero 依次入场（≤1.2s）、卡片堆叠滚动叙事（GSAP ScrollTrigger）
- 文章页正文：零入场动画
- `prefers-reduced-motion`：全部退化为 ≤150ms 透明度过渡

## Components

- **article-row 编号文章列表**：左栏两位数编号用 article-number（accent 色），标题单行截断，日期右对齐用 meta-text——首页与作品页共用
- **导航**：edge-aligned minimal——字标贴左、四链接贴右、无底边框常驻、无 CTA 按钮；滚动收拢为单行
- **主题切换**：明/月图标，圆形扩散过渡，持久化 `haoo-theme`
- 组件变体用 `-hover` 后缀独立成条，不嵌套

## Do's and Don'ts

**Don't：**

- Don't 堆字。首页总字数预算 ≤ 60 个中文字符——网站是设计，不是说明书；板块说明文字超过一句即删
- Don't 使用图标瓷砖卡片（圆角矩形 + 彩色方块图标 + 三行文案）
- Don't 全部居中；Don't 给正文段落加背景色卡片
- Don't 让强调色出现在装饰上——它只标记"可交互/当前态"
- Don't 在文章页放任何 Hero、大图轮播或动效

**Do：**

- Do 用留白和字号制造层级，两级字重解决 90% 的层次问题
- Do 让每个列表项都是一行，可扫读
- Do 在文案里保持人味："写数码、历史，和不肯将就的事。"
