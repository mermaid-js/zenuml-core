/* eslint-env node */
import { resolve } from "path";
import { defineConfig } from "vite";
import { alias } from "./vite.shared";

// Headless parser build: bundles the DOM-free ANTLR parser layer into a
// Node-safe ESM + CJS module published at the `@zenuml/core/parser` subpath.
// The main `.` entry (`src/core.tsx`) pulls in the React/DOM renderer and
// cannot be imported server-side; this entry can.
// The entry is `src/parser/public.ts` (not `index.ts`) so the published bundle
// exports ONLY `validate`/`parse` — matching `types/parser/index.d.ts` — instead
// of also leaking `index.js`'s in-repo ANTLR helpers into the public contract.
// `antlr4` stays external so consumers resolve it from their own node_modules.
// antlr4 is ESM-only, so `require("antlr4")` in the CJS bundle returns its module
// namespace (`{ __esModule, default }`), and Rollup's default interop would read
// the API off that namespace instead of `.default`. `interop: "auto"` honors
// `__esModule`. The CJS entry needs a Node with `require(esm)` on by default,
// which is why `engines.node` starts at 22.12; older versions can throw
// ERR_REQUIRE_ESM.
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
      output: { interop: "auto" },
    },
  },
  resolve: { alias },
});
