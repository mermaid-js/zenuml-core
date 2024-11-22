import { resolve } from "path";
import { defineConfig } from "vite";
import createVuePlugin from "@vitejs/plugin-vue";
import { execSync } from "child_process";
import svgLoader from "vite-svg-loader";

process.env.VITE_APP_GIT_HASH = process.env.DOCKER
  ? ""
  : execSync("git rev-parse --short HEAD").toString().trim();
process.env.VITE_APP_GIT_BRANCH = process.env.DOCKER
  ? ""
  : execSync("git branch --show-current").toString().trim();

function getCypressHtmlFiles() {
  const cypressFolder = resolve(__dirname, "cy");
  const strings = execSync(`find ${cypressFolder} -name '*.html'`)
    .toString()
    .split("\n");
  // remove empty string
  strings.pop();
  return strings;
}

const cypressHtmlFiles = getCypressHtmlFiles();
console.log(cypressHtmlFiles);

export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? "/zenuml-core/" : "/",
  build: {
    rollupOptions: {
      input: ["index.html", "embed.html", ...cypressHtmlFiles],
    },
  },
  resolve: {
    alias: {
      vue: "@vue/compat",
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [
    createVuePlugin({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2,
          },
        },
      },
    }),
    svgLoader(),
  ],
  test: {
    // used by vitest: https://vitest.dev/guide/#configuring-vitest
    environment: "jsdom",
    reportOnFailure: true,
    globals: true,
    coverage: {
      provider: "v8", // or 'v8'
    },
    deps: {
      inline: ["@vue/test-utils"],
    },
  },
}));
