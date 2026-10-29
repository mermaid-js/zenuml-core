import { describe, expect, it } from "vitest";
import { parse, RootContext as AntlrRootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";
import {
  LangiumToCollector,
  RootContext as LangiumRootContext,
} from "@/parser-langium/compat";
import { parseZen } from "@/parser-langium/services";

// `<<a b>>` — a stereotype made of several words — must parse on both engines
// and read back as the words joined by single spaces (quotes stripped), the
// same text `<<"a b">>` yields. See GitHub issue #653.
const engines = [
  {
    engine: "ANTLR",
    root: (code: string) => AntlrRootContext(code),
    collect: (code: string) =>
      ToCollector.getParticipants(AntlrRootContext(code)),
  },
  {
    engine: "Langium",
    root: (code: string) => LangiumRootContext(code),
    collect: (code: string) =>
      LangiumToCollector.getParticipants(LangiumRootContext(code)),
  },
];

describe.each(engines)(
  "multi-word stereotype ($engine)",
  ({ root, collect }) => {
    it.each([
      ["<<a>> A", "a"],
      ["<< a >> A", "a"],
      ["<<a b>> A", "a b"],
      ["<< a b >> A", "a b"],
      ["<<  a   b  >> A", "a b"],
      ["<<a b c>> A", "a b c"],
      ['<<"a b">> A', "a b"],
      ["@Actor <<a b>> A", "a b"],
      ["<<a b>> [lock] A", "a b"],
    ])("%s => stereotype %s", (code, stereotype) => {
      const participants = collect(code);
      expect(participants.Get("A")?.stereotype).toBe(stereotype);
    });

    it("keeps the participants of the following messages", () => {
      const participants = collect("<< a b >> A\nA->B: hi");
      expect(participants.Names()).toEqual(["A", "B"]);
      expect(participants.Get("A")?.stereotype).toBe("a b");
      expect(participants.Get("B")?.stereotype).toBeUndefined();
    });

    it("exposes every word as a NameContext (dual arity)", () => {
      const participant: any = root("<< a b >> A").head().participant(0);
      const stereotype = participant.stereotype();
      expect(stereotype.name().map((n: any) => n.getFormattedText())).toEqual([
        "a",
        "b",
      ]);
      expect(stereotype.name(0).getFormattedText()).toBe("a");
      expect(stereotype.name(1).getFormattedText()).toBe("b");
      expect(stereotype.name(2)).toBeNull();
      expect(stereotype.getFormattedText()).toBe("<< a b >>");
    });
  },
);

// The unclosed tolerance stays single-word: `<<a b` is stereotype `a` plus
// participant `b` on ANTLR (Langium's pre-existing divergence on this
// live-typing edge is documented in docs/langium-migration/10-ast-mapping.md).
it("ANTLR still tolerates an unclosed single-word stereotype", () => {
  const participants = ToCollector.getParticipants(AntlrRootContext("<<a b"));
  expect(participants.Get("b")?.stereotype).toBe("a");
});

describe("multi-word stereotype — syntax errors", () => {
  it("ANTLR reports no error", () => {
    const { pass, errorDetails } = parse("<< a b >> A\nA->B: hi");
    expect(errorDetails).toEqual([]);
    expect(pass).toBe(true);
  });

  it("Langium reports no error", () => {
    const result = parseZen("<< a b >> A\nA->B: hi");
    expect(result.lexerErrors).toHaveLength(0);
    expect(result.parserErrors).toHaveLength(0);
    const participant: any = (result.value as any).headElements[0];
    expect(participant.stereotype.names).toEqual(["a", "b"]);
  });
});
