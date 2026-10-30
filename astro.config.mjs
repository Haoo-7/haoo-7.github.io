import { readdirSync } from "node:fs";
import { defineConfig } from "astro/config";

// 旧地址 /posts/* 跳到 /writing/*。静态输出里动态重定向要 getStaticPaths，所以按文章逐条列出
const slugs = readdirSync(new URL("./src/content/posts/", import.meta.url))
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => f.replace(/\.mdx?$/, ""));

export default defineConfig({
  output: "static",
  site: "https://haoo-7.github.io",
  devToolbar: { enabled: false },
  // 两种外壳共用中文文章，脚注的读屏标签也随正文使用中文
  markdown: { remarkRehype: { footnoteLabel: '注释', footnoteBackLabel: '返回正文' } },
  redirects: {
    "/posts": "/writing/",
    ...Object.fromEntries(slugs.map((s) => [`/posts/${s}`, `/writing/${s}/`])),
  },
});
