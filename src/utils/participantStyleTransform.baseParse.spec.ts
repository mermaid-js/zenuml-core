import { describe, expect, it, mock } from "bun:test";
import * as actual from "@/parser";

// A unique original so the module mock, which bun shares across spec files,
// only ever throws for this one string.
const ORIGINAL = "A\nA->B: hi // base-parse-throws-sentinel";

// The parser can throw on malformed input. Make it throw only for the original
// code so the style transform meets an unparsable base but a parsable result.
const realParse = actual.parse;
mock.module("@/parser", () => ({
  ...actual,
  parse: (code: string) => {
    if (code === ORIGINAL) throw new Error("parser blew up");
    return realParse(code);
  },
}));

const { RootContext } = await import("@/parser");
const { setParticipantStyleChecked } = await import(
  "./participantStyleTransform"
);

describe("participantStyleTransform when the original code cannot be parsed", () => {
  it("still applies a style change that yields clean DSL", () => {
    expect(
      setParticipantStyleChecked(ORIGINAL, RootContext(ORIGINAL), "A", {
        type: "Actor",
      }),
    ).toEqual({ code: "@Actor A\nA->B: hi // base-parse-throws-sentinel" });
  });
});
