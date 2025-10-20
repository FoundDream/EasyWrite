import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "EasyWriter",
    description:
      "EasyWriter is a tool that helps you write in English more easily.",
    permissions: ["storage"],
    host_permissions: [
      "*://github.com/*",
      "https://api.mymemory.translated.net/*",
    ],
  },
});
