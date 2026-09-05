import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Importing the package entry must not touch the DOM.
 *
 * `import "@zenuml/core"` threw `ReferenceError: location is not defined` in
 * Node, which also made the package's own `renderToSvg` export unreachable
 * server-side — the CLI survives only because it imports internal paths
 * instead of the entry. Two module-scope reads caused it: the localStorage
 * atom keys in the store, and a debug flag in a participant component.
 *
 * This scans source rather than importing the bundle, so it needs no build
 * step. The build-level check is `node -e 'import("./dist/zenuml.esm.mjs")'`
 * after `bun run build:lib`.
 */
const FILES_ON_THE_ENTRY_PATH = [
  "src/store/Store.ts",
  "src/store/utils.ts",
  "src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx",
  "src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Interaction/Occurrence/Occurrence.tsx",
];

const BROWSER_GLOBAL = /\b(?:localStorage|sessionStorage|location)\b/;
const TOP_LEVEL_DECLARATION = /^(?:export\s+)?(?:const|let|var)\s/;

/**
 * Collect each top-level `const`/`let`/`var` initializer as one string, so a
 * declaration whose browser access sits on a later line is still examined.
 * Depth tracking is deliberately crude — it only has to keep multi-line
 * initializers together, not parse TypeScript.
 */
function topLevelDeclarations(
  source: string,
): { text: string; line: number }[] {
  const found: { text: string; line: number }[] = [];
  const lines = source.split("\n");
  let depth = 0;
  let current: { text: string; line: number } | null = null;

  lines.forEach((raw, index) => {
    const line = raw.replace(/\/\/.*$/, "");
    if (depth === 0 && !current && TOP_LEVEL_DECLARATION.test(line.trim())) {
      current = { text: line, line: index + 1 };
    } else if (current) {
      current.text += "\n" + line;
    }

    for (const ch of line) {
      if (ch === "(" || ch === "{" || ch === "[") depth++;
      else if (ch === ")" || ch === "}" || ch === "]") depth--;
    }

    if (current && depth <= 0) {
      found.push(current);
      current = null;
      depth = 0;
    }
  });

  return found;
}

describe("package entry stays importable without a DOM", () => {
  for (const relative of FILES_ON_THE_ENTRY_PATH) {
    it(`${relative} reads no browser global at module scope`, () => {
      const source = readFileSync(join(process.cwd(), relative), "utf-8");
      const offenders = topLevelDeclarations(source)
        .filter((d) => BROWSER_GLOBAL.test(d.text))
        // Deferred behind a function, or guarded by a typeof check: both are
        // safe, because neither runs while the module is being evaluated.
        .filter((d) => !/=>|function|typeof/.test(d.text))
        .map((d) => `${relative}:${d.line} ${d.text.trim().split("\n")[0]}`);

      expect(offenders).toEqual([]);
    });
  }
});
