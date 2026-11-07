import { afterEach, describe, expect, it } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertVersion,
  buildWebsite,
  findPinnedVersions,
  PLACEHOLDER,
  substituteVersion,
} from "../../../scripts/build-website/core.mjs";

const ROOT = join(import.meta.dir, "../../..");
const WEBSITE = join(ROOT, "website");

describe("assertVersion", () => {
  it.each(["4.13.1", "5.0.0-beta.1"])("accepts %s", (version) => {
    expect(() => assertVersion(version)).not.toThrow();
  });

  it.each(["", "4.13", "v4.13.1", "latest", "4.13.1 <script>"])(
    "rejects %j",
    (version) => {
      expect(() => assertVersion(version)).toThrow();
    },
  );
});

describe("substituteVersion", () => {
  it("replaces every placeholder", () => {
    const text = `v${PLACEHOLDER} and @zenuml/core@${PLACEHOLDER}/dist`;
    expect(substituteVersion(text, "4.13.1")).toBe(
      "v4.13.1 and @zenuml/core@4.13.1/dist",
    );
  });
});

describe("findPinnedVersions", () => {
  it.each([
    [
      "https://cdn.jsdelivr.net/npm/@zenuml/core@4.1.0/dist/zenuml.js",
      ["@zenuml/core@4.1.0"],
    ],
    [`@zenuml/core@${PLACEHOLDER}`, []],
    ["npm install @zenuml/core", []],
    ["@zenuml/core@latest", []],
  ])("%j", (text, expected) => {
    expect(findPinnedVersions(text)).toEqual(expected);
  });
});

describe("the website source", () => {
  const textFiles = (dir: string): string[] =>
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => /\.(html|txt|xml|css)$/.test(file))
      .map((file) => join(dir, file));

  it("pins no @zenuml/core version", () => {
    const pinned = textFiles(WEBSITE).flatMap((file) =>
      findPinnedVersions(readFileSync(file, "utf8")),
    );
    expect(pinned).toEqual([]);
  });

  it("names its version only through the placeholder", () => {
    const index = readFileSync(join(WEBSITE, "index.html"), "utf8");
    expect(index).not.toContain("4.1.0");
    expect(index).toContain(`@zenuml/core@${PLACEHOLDER}/dist/zenuml.js`);
    expect(index).toContain(
      `@zenuml/core@${PLACEHOLDER}/dist/parser/index.mjs/+esm`,
    );
  });
});

describe("buildWebsite", () => {
  let dir: string;
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function setUp(files: Record<string, string | Buffer>) {
    dir = mkdtempSync(join(tmpdir(), "build-website-"));
    const source = join(dir, "website");
    for (const [name, content] of Object.entries(files)) {
      mkdirSync(join(source, name, ".."), { recursive: true });
      writeFileSync(join(source, name), content);
    }
    return { source, output: join(dir, "out") };
  }

  it("writes the version into text files and copies the rest unchanged", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x7b, 0x7b]);
    const { source, output } = setUp({
      "index.html": `<script src="@zenuml/core@${PLACEHOLDER}/dist/zenuml.js">`,
      "about/index.html": `v${PLACEHOLDER}`,
      "llms.txt": `Current version: ${PLACEHOLDER}.`,
      "assets/logo.png": png,
    });

    const result = buildWebsite({ source, output, version: "4.13.1" });

    expect(readFileSync(join(output, "index.html"), "utf8")).toBe(
      '<script src="@zenuml/core@4.13.1/dist/zenuml.js">',
    );
    expect(readFileSync(join(output, "about/index.html"), "utf8")).toBe(
      "v4.13.1",
    );
    expect(readFileSync(join(output, "llms.txt"), "utf8")).toBe(
      "Current version: 4.13.1.",
    );
    expect(readFileSync(join(output, "assets/logo.png"))).toEqual(png);
    expect(result.substituted).toBe(3);
  });

  it("removes files left from an earlier build", () => {
    const { source, output } = setUp({ "index.html": PLACEHOLDER });
    mkdirSync(output, { recursive: true });
    writeFileSync(join(output, "old.html"), "stale");

    buildWebsite({ source, output, version: "4.13.1" });

    expect(readdirSync(output)).toEqual(["index.html"]);
  });

  it("refuses a source that pins a version", () => {
    const { source, output } = setUp({
      "index.html":
        "https://cdn.jsdelivr.net/npm/@zenuml/core@4.1.0/dist/zenuml.js",
    });
    expect(() => buildWebsite({ source, output, version: "4.13.1" })).toThrow(
      "@zenuml/core@4.1.0",
    );
  });

  it("refuses a source with no placeholder", () => {
    const { source, output } = setUp({ "index.html": "<p>static</p>" });
    expect(() => buildWebsite({ source, output, version: "4.13.1" })).toThrow(
      PLACEHOLDER,
    );
  });

  it("refuses a bad version", () => {
    const { source, output } = setUp({ "index.html": PLACEHOLDER });
    expect(() => buildWebsite({ source, output, version: "latest" })).toThrow();
  });
});
