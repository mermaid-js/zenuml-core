/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    ssr: resolve(__dirname, "src/cli/zenuml.ts"),
    outDir: "dist/cli",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: process.env.RELEASE === "1",
    rollupOptions: {
      external: [
        "antlr4",
        "playwright-core",
        "@napi-rs/canvas",
      ],
      output: {
        entryFileNames: "zenuml.mjs",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
