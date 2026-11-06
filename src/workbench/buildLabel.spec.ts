import { describe, expect, it } from "bun:test";
import { buildLabel } from "./buildLabel";

describe("buildLabel", () => {
  it.each([
    [
      "version and commit",
      { version: "4.13.1", gitHash: "a99203cf" },
      {
        text: "4.13.1 · a99203cf",
        href: "https://github.com/mermaid-js/zenuml-core/commit/a99203cf",
      },
    ],
    [
      "no git (Docker build)",
      { version: "4.13.1", gitHash: "" },
      { text: "4.13.1", href: undefined },
    ],
    [
      "no version",
      { version: "", gitHash: "a99203cf" },
      {
        text: "a99203cf",
        href: "https://github.com/mermaid-js/zenuml-core/commit/a99203cf",
      },
    ],
    [
      "nothing known",
      { version: "", gitHash: "" },
      { text: "", href: undefined },
    ],
  ])("%s", (_, info, expected) => {
    expect(buildLabel(info)).toEqual(expected);
  });

  it("links only a commit hash", () => {
    expect(buildLabel({ version: "4.13.1", gitHash: "a9/../x" }).href).toBe(
      undefined,
    );
  });
});
