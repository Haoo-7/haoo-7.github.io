---
version: beta
name: Haoo Blog
description: "Refresh：纸与墨的个人站，墨水屏刷新是唯一的动作语言，蓝色只给链接"
colors:
  primary: "#121212"
  secondary: "#5E5E5A"
  dim: "#858480"
  accent: "#2E6FA8"
  on-accent: "#EFEEEA"
  neutral: "#EFEEEA"
  surface: "#DCDBD6"
  rule: "#C9C8C3"
typography:
  display:
    fontFamily: Literata
    fontWeight: 400
    fontSize: clamp(60px, 8.33vw, 120px)
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  display-em:
    fontFamily: Literata Italic
    fontWeight: 300
  h2:
    fontFamily: Literata
    fontWeight: 400
    fontSize: clamp(52px, 7.22vw, 104px)
    lineHeight: 1
    letterSpacing: "-0.03em"
  lede:
    fontFamily: Instrument Sans
    fontWeight: 400
    fontSize: 19px
    lineHeight: 1.5
  body-zh:
    fontFamily: Literata, Songti SC, Noto Serif CJK SC
    fontWeight: 400
    fontSize: 19px
    lineHeight: 1.95
  meta:
    fontFamily: IBM Plex Mono
    fontWeight: 400
    fontSize: 13px
    letterSpacing: "0.04em"
    textTransform: uppercase
rounded:
  none: 0
spacing:
  page-x: clamp(20px, 5.56vw, 80px)
  section-top: 150px
  measure: 720px
components:
  page-background:
    backgroundColor: "{colors.neutral}"
  divider:
    backgroundColor: "{colors.rule}"
    height: 1px
  section-rule:
    backgroundColor: "{colors.primary}"
    height: 1px
  nav-link:
    textColor: "{colors.primary}"
    typography: "{typography.meta}"
  meta-text:
    textColor: "{colors.secondary}"
    typography: "{typography.meta}"
  link-underline:
    textColor: "{colors.accent}"
  row-hover:
    backgroundColor: "rgba(18, 18, 18, .045)"
---

# Design — Haoo Blog

条目后的标注：【用户确认】是用户选过或评审过的；【Agent 推断】是实现时补的，等用户看过再定。

## Overview

一个历史系学生、理科气质的个人站，slogan「Life, Tech & History」。整站像一台放在书桌上的墨水屏阅读器：纸色底、黑白照片、等宽小字编号，换图和换页时像墨水屏那样黑一下、白一下再显出来。【用户确认，10-25 选定 01 Refresh】

- 外壳英文，文章正文中文。【用户确认】
- 首页是完整的七屏单页，不拆；顶栏 Work / Writing / About 跳独立页面，联系放在 About 末尾。【用户确认，10-26】
- 门面有动效，文章页零入场动画：门面热闹、阅读安静。【沿用旧规范，Agent 推断仍成立】

## Colors

只有灰阶。蓝色 `#2E6FA8` 只用于链接、邮箱和焦点环，不做装饰；只有文章里的内容图和封面保留原色。【用户确认】

- **primary** `#121212` 墨：标题、正文、区块顶线
- **secondary** `#5E5E5A`：说明文字、元信息（对纸色 5.9:1）
- **dim** `#858480`：首页三个词未选中的状态，只用于大字（不用于小字，对比度不够）
- **rule** `#C9C8C3`：细分隔线
- **surface** `#DCDBD6`：墨水屏屏幕底色、图片加载前的底
- 禁止暖橙、满版高饱和色块、渐变背景。【用户确认，见偏好记录】

## Typography

- **Literata**：大字、标题和英文正文；强调用斜体细体 `<em>`（300），例如 "Say *hello.*"。【用户确认】
- **Instrument Sans**：说明段落、档案正文、TL;DR。【用户确认】
- **IBM Plex Mono** 大写 13px：元信息、`Fig. 0n` 编号、按钮式链接（"All writing →"）。【用户确认】
- 中文正文落系统宋体（Songti SC / Noto Serif CJK），不加载 11MB 的思源宋体 woff2。19px / 1.95，行宽约 36 个汉字（720px）。【Agent 推断】
- 中文标题 `text-wrap: balance`，不能断开的词用 `.keep` 包住。【Agent 推断】

## Layout

- 页面最宽 1440，左右留白 `clamp(20px, 5.56vw, 80px)`；右栏宽度 39.6875%（508/1280）。断点 1279 / 1023 / 767。【Agent 推断】
- 照片上的叠加物（托盘格子、阅读器屏幕、待机屏）按设计稿坐标用百分比贴在图上，字号用 `cqw` 跟图缩放；窄屏靠放大裁切只留主体。【Agent 推断】
- 无卡片、无圆角、无阴影；分区靠 1px 墨线（区块开头）和细灰线（条目之间）。【用户确认】
- 各页构图：
  - `/`：Hero 三帧 → Work 托盘 → Writing 阅读器 → About 拆三帧 → Lately → Say hello。【用户确认】
  - `/writing/[slug]/`：左栏粘性目录，正文一栏，文末原刊链接和下一篇。【Agent 推断】
  - `/writing/`：按年份分组的列表，右侧粘性阅读器跟着当前那篇局部刷新。【Agent 推断】
  - `/work/`：左侧粘性托盘，右侧逐份项目档案，滚到哪份就框出哪格。【Agent 推断】
  - `/about/`：三段文字配粘性的一帧照片，读到哪段刷新成哪张 → Say hello。【Agent 推断】

## Motion

- 墨水屏刷新：全刷 0.62s（黑→白→半黑→白→显出），局部刷 0.4s（黑→白→显出），都用 `steps(1)`；内容在 190ms 全黑时替换。【用户确认】
- 首页：三帧自动轮播 4.2s，滚出首屏停；About 一帧拆三帧，钉住 1400px 由滚动 1:1 驱动，只在 ≥1024px 启用。【用户确认】
- 标题按行从遮罩里升起，说明文字淡入，各一次。【用户确认】
- 页面之间：跨文档 View Transitions，顶栏不动，内容分两三下换页（`steps()` 淡出淡入）。【Agent 推断】
- 文章页零入场动画，只有顶栏下 1px 阅读进度线。【Agent 推断】
- 平滑滚动用 Lenis（lerp .12）接 GSAP 时钟。`prefers-reduced-motion` 下关掉闪屏、钉住、平滑滚动和入场动画，直接显示终态。【Agent 推断】

## Components

- **Bar 顶栏**：字标 / 三链接（当前页 `aria-current` 墨色下划线）/ 广州时钟；滚过 80px 托一层半透明纸色；手机端隐藏时钟。
- **Tray 托盘**、**Reader 阅读器**、**Hello 黄昏待机屏**：首页和内页共用的三张照片组件。
- **Footer**：没有自带 Say hello 的页面显示 Say hello、邮箱和三个外链；所有页面都有字标、tagline、Back to top。
- **列表行**：悬停或聚焦时铺一层 `row-hover` 浅灰并给标题加下划线，整行可点。
- **脚注**：正文里是蓝色等宽上标，点开浮出注释（手机端贴底），Esc 或点别处关闭；文末保留完整列表。
- **图注**：`Fig. n` 等宽编号 + Instrument Sans 说明，自动计数。

## Do's and Don'ts

**Don't：**

- Don't 用卡片、圆角、阴影、图标瓷砖。
- Don't 让蓝色出现在链接和焦点以外的地方。
- Don't 让编辑部感太重：少用报刊式栏线和满屏小字。【用户确认，10-23 否掉的三稿】
- Don't 在文章页放 Hero、轮播或入场动画。

**Do：**

- Do 用大字、留白和两种墨色做层级。
- Do 让动作都回到墨水屏刷新这一种语言。
- Do 在文案里保持人味，取材于本人而不是文章列表。【用户确认】

## 待迁移 / 已废弃

旧版「深空靛蓝」规范（Satoshi + Instrument Serif、天空蓝强调色、暗色主题与明暗切换、编号文章列表、首页四段 Index-first）已被 Refresh 取代，不再使用。旧版里仍成立的两条已并入上文：「门面热闹、阅读安静」和「中文回退系统字体」。暗色主题目前没有，要不要做等用户决定。
