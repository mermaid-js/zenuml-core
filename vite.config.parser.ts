/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";

// Headless parser build: bundles the DOM-free ANTLR parser layer into a
// Node-safe ESM + CJS module published at the `@zenuml/core/parser` subpath.
// The main `.` entry (`src/core.tsx`) pulls in the React/DOM renderer and
// cannot be imported server-side; this entry can.
// The entry is `src/parser/public.ts` (not `index.js`) so the published bundle
// exports ONLY `validate`/`parse` — matching `types/parser/index.d.ts` — instead
// of also leaking `index.js`'s in-repo ANTLR helpers into the public contract.
// `antlr4` stays external so consumers resolve it from their own node_modules.
export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, "src/parser/public.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs"),
    },
    outDir: "dist/parser",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: process.env.RELEASE === "1",
    rollupOptions: {
      external: ["antlr4"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
