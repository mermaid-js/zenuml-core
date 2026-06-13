/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

// ZenUML LSP server as a browser Web Worker bundle (serverless). Self-contained
// (langium + chevrotain + vscode-languageserver/browser all inlined) so a
// browser editor host can run the language server with no backend:
//   new Worker(new URL('.../zenuml-server.worker.js', import.meta.url), { type: 'module' })
// `emptyOutDir: false` so it co-exists with the Node build (dist/lsp/main.js).
export default defineConfig({
  build: {
    target: "es2020",
    outDir: "dist/lsp",
    emptyOutDir: false,
    copyPublicDir: false,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "src/parser-langium/lsp/worker.ts"),
      formats: ["es"],
      fileName: () => "zenuml-server.worker.js",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
