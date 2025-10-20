import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "写作助手 - Writing Assistant",
    description: "帮助你将中文快速转换为优质英文，专为GitHub写作优化",
    permissions: ["storage"],
    host_permissions: [
      "*://github.com/*",
      "https://api.mymemory.translated.net/*",
    ],
  },
});
