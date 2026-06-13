/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

// ZenUML LSP server build (Node SSR target). This is the side-car consumer of
// the Langium parser; it intentionally bundles langium + chevrotain (a Node
// process, not the browser library). vscode-languageserver is kept external so
// the editor host can dedupe it. Never part of the @zenuml/core library bundle.
export default defineConfig({
  build: {
    target: "node18",
    ssr: resolve(__dirname, "src/parser-langium/lsp/main.ts"),
    outDir: "dist/lsp",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: process.env.RELEASE === "1",
    rollupOptions: {
      external: [
        "vscode-languageserver",
        "vscode-languageserver/node.js",
        "vscode-languageserver-textdocument",
      ],
      output: {
        entryFileNames: "main.js",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
