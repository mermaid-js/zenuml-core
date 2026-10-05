/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";
import { execSync } from "child_process";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import type { Plugin } from "vite";
import { packageFontFiles } from "./src/svg/fonts/packageFontFiles";

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, "package.json"), "utf-8"),
);

const gitHash = process.env.DOCKER
  ? ""
  : execSync("git rev-parse --short HEAD").toString().trim();
const gitBranch = process.env.DOCKER
  ? ""
  : execSync("git branch --show-current").toString().trim();

const isReleaseBuild = process.env.RELEASE === "1";
const shouldAnalyzeBundle = process.env.ANALYZE === "1";

// Merge all cloud-provider icon SVGs into a single chunk instead of 500+
function manualChunks(id: string) {
  if (
    id.includes("AWS-Asset-Package") ||
    id.includes("Architecture-Service-Icons") ||
    id.includes("google-cloud-icons") ||
    id.includes("Azure_Public_Service_Icons") ||
    id.includes("HLD-Architecture") ||
    id.includes("CloudIcons")
  ) {
    return "cloud-icons";
  }
}

// Ship the font files as package assets (`@zenuml/core/fonts/*`) so consumers
// whose Content-Security-Policy refuses data: fonts can serve them from their
// own origin. Written straight to dist/fonts/: the build has two outputs (esm,
// umd), and the files are the same for both.
function packageFonts(): Plugin {
  return {
    name: "zenuml-package-fonts",
    apply: "build",
    closeBundle() {
      const dir = resolve(__dirname, "dist/fonts");
      mkdirSync(dir, { recursive: true });
      for (const { fileName, source } of packageFontFiles()) {
        writeFileSync(resolve(dir, fileName), source);
      }
    },
  };
}

export default defineConfig({
  build: {
    target: "esnext",
    // Don't rake the demo site's public/ (fonts, vendor/, demo html, CNAME) into
    // the published package — matches cli/parser/lsp configs. build:site uses
    // vite.config.ts, which is unaffected and still ships public assets.
    copyPublicDir: false,
    // https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: resolve(__dirname, "src/core.tsx"),
      // https://vitejs.dev/config/build-options.html#build-lib
      // the exposed global variable and is required when formats includes 'umd' or 'iife'.
      name: "ZenUML",
      fileName: "zenuml",
    },
    sourcemap: isReleaseBuild,
    rollupOptions: {
      output: [
        {
          format: "esm",
          entryFileNames: `zenuml.esm.mjs`,
          manualChunks,
        },
        {
          name: "zenuml",
          format: "umd",
          entryFileNames: `zenuml.js`,
        },
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [
    svgr(),
    react(),
    cssInjectedByJsPlugin(),
    packageFonts(),
    ...(shouldAnalyzeBundle
      ? [
          visualizer({
            filename: "dist/stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.VITE_VERSION": JSON.stringify(packageJson.version),
    "import.meta.env.VITE_APP_GIT_HASH": JSON.stringify(gitHash),
    "import.meta.env.VITE_APP_GIT_BRANCH": JSON.stringify(gitBranch),
  },
});
