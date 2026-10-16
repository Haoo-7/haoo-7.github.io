# Skill covers

延续聊天「探索博客科技与人文融合设计」中已采用的 mono-color 配方和正式 Dayline 配图：3:2 横图、Cobalt #2148B8 主墨、Terracotta Orange #C65F38 少量强调、纸张颗粒、网点与克制套印质感。没有加载已不存在的 `/tmp/mono-color-skill-20261010`；配方以项目 `output/imagegen/mono-color/README.md`、正式配图和原聊天中的实际生成记录为依据。

使用本机 imagegen relay，模型 `gpt-image-2.5`，`quality high`，1536×1024。API 模式为 edit，以 `public/images/projects/dayline-journal.webp` 作纯风格参考，提示词明确要求制作全新主体、不复刻 Dayline 标志或日历。两张均首次生成成功，无模型切换、无重试。

- `agent-recap.png`：回复字符流汇入闭合花括号，再以两条基线表示回顾与下一步。
- `md2docx.png`：Markdown 标记逐渐形成有脚注分隔线、引证标记和版式秩序的论文页。画中稿件是抽象图形，不是真实用户论文。
- 完整提示词：`agent-recap-prompt.txt`、`md2docx-prompt.txt`。
- 网页文件：`public/images/skills/agent-recap.webp`、`public/images/skills/md2docx-historypaper.webp`，cwebp quality 88。

均已实际看图，整体材料和配色与正式 Dayline 一致，主体不同。标题和用途继续由网页呈现。预览沿用现有作品的桌面悬停、键盘聚焦及手机点击展开，不新增常驻大图。

浏览器检查覆盖 1440px、390px、320px：两张图均加载为 1536px 原图，桌面悬停与手机展开预览正常，无横向溢出和浏览器错误。桌面及手机截图在本目录，手机最终截图等待透明度过渡完成后取得。`git diff --check` 通过。没有运行与素材接入无关的生产构建或后端测试。
