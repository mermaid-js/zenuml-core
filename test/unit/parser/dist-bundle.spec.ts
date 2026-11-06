import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { basename, resolve } from "node:path";

// Specs that import `src/parser` never touch the published `@zenuml/core/parser`
// entries: those only exist after the build, and consumers load them in Node.
// These tests build the real bundles and run them in a real Node child process.
const REPO_ROOT = resolve(import.meta.dir, "../../..");
// Inside node_modules so that the bundle's external `antlr4` still resolves.
// Worktrees can share one node_modules through a symlink, so each run needs its
// own directory: a shared one is deleted under any other run that is using it.
const OUT_DIR = resolve(
  REPO_ROOT,
  `node_modules/.cache/parser-bundle-test-${process.pid}`,
);
const BUILD_TIMEOUT_MS = 60_000;

const pkg = JSON.parse(
  readFileSync(resolve(REPO_ROOT, "package.json"), "utf8"),
);
const parserExport = pkg.exports["./parser"];
const bundlePath = (target: string) => resolve(OUT_DIR, basename(target));

// Report what the bundle does, as JSON, so that the assertions run in this file.
const REPORT = `
const valid = validate("A.m()");
const invalid = validate("A.m(");
const parsed = parse("A.m()");
console.log(JSON.stringify({
  runtime: process.versions.bun ? "bun" : "node",
  valid,
  invalid,
  parsedPass: parsed.pass,
  parsedText: parsed.rootContext.getText(),
  augmented: typeof parsed.rootContext.getFormattedText,
}));
`;

function runInNode(args: string[]) {
  const child = spawnSync("node", args, { cwd: REPO_ROOT, encoding: "utf8" });
  // Node echoes the whole minified line above a load error; keep the message.
  const error = child.stderr
    .split("\n")
    .filter((line) => /Error/.test(line) && line.length < 300)
    .join("\n");
  if (child.status !== 0) {
    throw new Error(`node exited with ${child.status}: ${error}`);
  }
  return JSON.parse(child.stdout);
}

const cases = [
  {
    name: "CJS (require condition)",
    run: () =>
      runInNode([
        "-e",
        `const { parse, validate } = require(${JSON.stringify(
          bundlePath(parserExport.require.default),
        )});${REPORT}`,
      ]),
  },
  {
    name: "ESM (import condition)",
    run: () =>
      runInNode([
        "--input-type=module",
        "-e",
        `import { parse, validate } from ${JSON.stringify(
          bundlePath(parserExport.import.default),
        )};${REPORT}`,
      ]),
  },
];

describe("@zenuml/core/parser bundles in Node", () => {
  beforeAll(() => {
    rmSync(OUT_DIR, { recursive: true, force: true });
    execFileSync("bun", ["run", "build:parser", "--outDir", OUT_DIR], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
  }, BUILD_TIMEOUT_MS);

  afterAll(() => {
    rmSync(OUT_DIR, { recursive: true, force: true });
  });

  for (const { name, run } of cases) {
    it(`${name} loads, then validate() and parse() work`, () => {
      const report = run();

      expect(report.runtime).toBe("node");
      expect(report.valid).toEqual({ pass: true, errorDetails: [] });
      expect(report.invalid.pass).toBe(false);
      expect(report.invalid.errorDetails[0]).toEqual({
        line: expect.any(Number),
        column: expect.any(Number),
        msg: expect.any(String),
      });
      expect(report.parsedPass).toBe(true);
      expect(report.parsedText).toContain("A.m()");
      // The import-time augmentation must reach antlr4's real prototype.
      expect(report.augmented).toBe("function");
    });
  }
});
