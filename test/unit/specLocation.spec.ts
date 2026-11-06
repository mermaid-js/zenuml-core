import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

// `bun run test` only scans `src` and `test/unit`. A unit spec anywhere else
// never runs in CI, so fail when one is added there.
const RUN_BY_BUN_TEST = [/^src\//, /^test\/unit\//];
// Playwright owns these folders; `scripts/` holds manual benchmark specs.
const RUN_ELSEWHERE = [/^tests\//, /^e2e\//, /^scripts\//];

describe("spec file locations", () => {
  it("has no unit spec that `bun run test` would skip", () => {
    const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
      .split("\n")
      .filter((f) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(f));

    const orphaned = files.filter(
      (f) => ![...RUN_BY_BUN_TEST, ...RUN_ELSEWHERE].some((re) => re.test(f)),
    );

    expect(orphaned).toEqual([]);
  });
});
