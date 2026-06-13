/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

// ZenUML LSP server build (Node target). Side-car consumer of the Langium
// parser; fully self-contained — langium + chevrotain + vscode-languageserver
// are all INLINED so the published `dist/lsp/main.js` runs with zero runtime
// dependencies (none of these are deps of @zenuml/core). Never part of the
// library bundle. `ssr: false` is required so Rollup actually bundles the
// node_modules deps rather than treating them as externals.
export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    target: "node18",
    ssr: resolve(__dirname, "src/parser-langium/lsp/main.ts"),
    outDir: "dist/lsp",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: false,
    rollupOptions: {
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
