import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { execSync } from "child_process";
import svgr from "vite-plugin-svgr";
import { alias, versionDefines } from "./vite.shared";

// e2e fixtures are served via the Vite dev server (Playwright launches
// `bun run dev` — see playwright.config.ts), so they don't need to be part
// of the production site build. Set INCLUDE_E2E_HTML=1 to bundle them into
// a built site (rare; only needed if hosting the fixtures statically
// instead of running them via dev server).
function getE2eHtmlFiles() {
  const e2eFolder = resolve(__dirname, "e2e");
  const strings = execSync(`find ${e2eFolder} -name '*.html'`)
    .toString()
    .split("\n");
  // remove empty string
  strings.pop();
  return strings;
}

const includeE2eHtml = process.env.INCLUDE_E2E_HTML === "1";
const e2eHtmlFiles = includeE2eHtml ? getE2eHtmlFiles() : [];

export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? "/zenuml-core/" : "/",
  build: {
    target: "esnext",
    rollupOptions: {
      input: ["index.html", "embed.html", "renderer.html", ...e2eHtmlFiles],
    },
  },
  resolve: { alias },
  server: {
    allowedHosts: ["mmd-zenuml-core-app.zenuml.com"],
  },
  plugins: [svgr(), react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString()),
    ...versionDefines(),
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
