/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";
import { execSync } from "child_process";
import { readFileSync } from "fs";

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

export default defineConfig({
  build: {
    target: "esnext",
    // https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: resolve(__dirname, "src/core.tsx"),
      // https://vitejs.dev/config/build-options.html#build-lib
      // the exposed global variable and is required when formats includes 'umd' or 'iife'.
      name: "ZenUML",
      fileName: "zenuml",
    },
    sourcemap: true,
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
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.VITE_VERSION": JSON.stringify(packageJson.version),
    "import.meta.env.VITE_APP_GIT_HASH": JSON.stringify(gitHash),
    "import.meta.env.VITE_APP_GIT_BRANCH": JSON.stringify(gitBranch),
  },
});
