import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import svgr from "vite-plugin-svgr";

process.env.VITE_APP_GIT_HASH = process.env.DOCKER
  ? ""
  : execSync("git rev-parse --short HEAD").toString().trim();
process.env.VITE_APP_GIT_BRANCH = process.env.DOCKER
  ? ""
  : execSync("git branch --show-current").toString().trim();

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
);

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

export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? "/zenuml-core/" : "/",
  build: {
    rollupOptions: {
      input: ["index.html", "embed.html", "renderer.html", "test-compression.html", ...cypressHtmlFiles],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [svgr(), react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString()),
    "process.env.VITE_VERSION": JSON.stringify(packageJson.version),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  test: {
    // used by vitest: https://vitest.dev/guide/#configuring-vitest
    // need this to run vitest in webstorm ide. vitest has better integration than bun
    environment: "jsdom",
    reportOnFailure: true,
    globals: true,
    coverage: {
      provider: "v8", // or 'v8'
    },
    setupFiles: resolve(__dirname, "test/setup.ts"),
    exclude: [
      "node_modules/**",
      "tests/**", // Exclude Playwright tests
    ],
  },
}));
