import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://haoo.me",
  devToolbar: { enabled: false },
  redirects: {
    "/posts": "/writing/",
    "/posts/[...slug]": "/writing/[...slug]/",
  },
});
