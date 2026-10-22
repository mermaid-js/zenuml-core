import { describe, expect, it, vi } from "vitest";
import { RootContext } from "@/parser";
import { setParticipantStyleChecked } from "./participantStyleTransform";

const ORIGINAL = "A\nA->B: hi";

// The parser can throw on malformed input. Make it throw only for the original
// code so the style transform meets an unparsable base but a parsable result.
vi.mock("@/parser", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/parser")>();
  return {
    ...actual,
    parse: (code: string) => {
      if (code === "A\nA->B: hi") throw new Error("parser blew up");
      return actual.parse(code);
    },
  };
});

describe("participantStyleTransform when the original code cannot be parsed", () => {
  it("still applies a style change that yields clean DSL", () => {
    expect(
      setParticipantStyleChecked(ORIGINAL, RootContext(ORIGINAL), "A", {
        type: "Actor",
      }),
    ).toEqual({ code: "@Actor A\nA->B: hi" });
  });
});
