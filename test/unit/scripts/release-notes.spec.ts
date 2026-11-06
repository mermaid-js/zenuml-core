import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  addTryLinks,
  TRY_LINKS_MARKER,
} from "../../../scripts/release-notes/core.mjs";

const ROOT = join(import.meta.dir, "../../..");
const CHANGELOG = "### Patch Changes\n\n- A fix.";

describe("addTryLinks", () => {
  it("puts the try links above the changelog", () => {
    const body = addTryLinks(CHANGELOG, "4.13.1");
    expect(body.startsWith(TRY_LINKS_MARKER)).toBe(true);
    expect(body).toContain("https://core.zenuml.com");
    expect(body).toContain(
      "https://cdn.jsdelivr.net/npm/@zenuml/core@4.13.1/dist/zenuml.js",
    );
    expect(body.endsWith(CHANGELOG)).toBe(true);
  });

  it("adds them once", () => {
    const once = addTryLinks(CHANGELOG, "4.13.1");
    expect(addTryLinks(once, "4.13.1")).toBe(once);
  });

  it("works on an empty body", () => {
    expect(addTryLinks("", "4.13.1")).toContain("@zenuml/core@4.13.1");
  });

  it("refuses a bad version", () => {
    expect(() => addTryLinks(CHANGELOG, "latest")).toThrow();
  });
});

describe("the public test entry is linked", () => {
  it("as the npm homepage", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(pkg.homepage).toBe("https://core.zenuml.com");
  });

  it("in the first screen of the README", () => {
    const firstScreen = readFileSync(join(ROOT, "README.md"), "utf8")
      .split("\n")
      .slice(0, 25)
      .join("\n");
    expect(firstScreen).toContain("## Try it");
    expect(firstScreen).toContain("https://core.zenuml.com");
  });
});
