import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import {
  readParticipantDeclaration,
  setParticipantStyleChecked,
  setParticipantStyleInDsl,
} from "./participantStyleTransform";

const apply = (code: string, name: string, updates: any) =>
  setParticipantStyleInDsl(code, RootContext(code), name, updates);

describe("participantStyleTransform", () => {
  it("sets and removes a type", () => {
    expect(apply("A\nA->B: hi", "A", { type: "Actor" })).toBe(
      "@Actor A\nA->B: hi",
    );
    expect(apply("@Actor A\nA->B: hi", "A", { type: null })).toBe(
      "A\nA->B: hi",
    );
  });

  it("sets and removes a color without touching other attributes", () => {
    expect(apply("@Actor A\nA->B: hi", "A", { color: "#ef4444" })).toBe(
      "@Actor A #ef4444\nA->B: hi",
    );
    expect(apply("@Actor A #ef4444\nA->B: hi", "A", { color: null })).toBe(
      "@Actor A\nA->B: hi",
    );
  });

  it("sets and removes a stereotype", () => {
    expect(apply("A\nA->B: hi", "A", { stereotype: "Service" })).toBe(
      "<<Service>> A\nA->B: hi",
    );
    expect(apply("<<Service>> A\nA->B: hi", "A", { stereotype: null })).toBe(
      "A\nA->B: hi",
    );
  });

  it("sets and removes a display label", () => {
    expect(apply("A\nA->B: hi", "A", { label: "Alice" })).toBe(
      "A as Alice\nA->B: hi",
    );
    expect(apply("A as Alice\nA->B: hi", "A", { label: null })).toBe(
      "A\nA->B: hi",
    );
  });

  it("quotes labels and stereotypes that contain spaces", () => {
    expect(apply("A\nA->B: hi", "A", { label: "Alice Smith" })).toBe(
      'A as "Alice Smith"\nA->B: hi',
    );
    expect(apply("A\nA->B: hi", "A", { stereotype: "Legacy System" })).toBe(
      '<<"Legacy System">> A\nA->B: hi',
    );
  });

  it("keeps existing quoted labels quoted when changing something else", () => {
    expect(
      apply('A as "Alice Smith"\nA->B: hi', "A", { color: "#3b82f6" }),
    ).toBe('A as "Alice Smith" #3b82f6\nA->B: hi');
  });

  it("writes every attribute in grammar order", () => {
    expect(
      apply("A\nA->B: hi", "A", {
        type: "Database",
        stereotype: "Service",
        label: "Alice Smith",
        color: "#3b82f6",
      }),
    ).toBe('@Database <<Service>> A as "Alice Smith" #3b82f6\nA->B: hi');
  });

  it("reads the declaration back", () => {
    const code = '@Database <<Service>> A as "Alice Smith" #3b82f6\nA->B: hi';
    expect(readParticipantDeclaration(RootContext(code), "A")).toEqual({
      name: "A",
      type: "Database",
      stereotype: "Service",
      emoji: undefined,
      width: undefined,
      label: "Alice Smith",
      color: "#3b82f6",
    });
    expect(readParticipantDeclaration(RootContext("A->B: hi"), "A")).toBe(null);
  });

  describe("values that are not plain identifiers", () => {
    const readBack = (code: string) =>
      readParticipantDeclaration(RootContext(code), "A");

    it.each(["if", "123", "Ünïcode—x"])("round-trips label %s", (label) => {
      const result = apply("A\nA->B: hi", "A", { label });
      expect(readBack(result)?.label).toBe(label);
    });

    it.each(["if", "123", "Ünïcode—x"])(
      "round-trips stereotype %s",
      (stereotype) => {
        const result = apply("A\nA->B: hi", "A", { stereotype });
        expect(readBack(result)?.stereotype).toBe(stereotype);
      },
    );

    it("keeps plain unicode identifiers unquoted", () => {
      expect(apply("A\nA->B: hi", "A", { label: "Ünï" })).toBe(
        "A as Ünï\nA->B: hi",
      );
    });
  });

  describe("setParticipantStyleChecked", () => {
    const checked = (code: string, name: string, updates: any) =>
      setParticipantStyleChecked(code, RootContext(code), name, updates);

    it("returns the new code when the declaration round-trips", () => {
      expect(checked("A\nA->B: hi", "A", { label: "if" })).toEqual({
        code: 'A as "if"\nA->B: hi',
      });
    });

    it("returns an error and no code when the value cannot round-trip", () => {
      const result = checked("A\nA->B: hi", "A", { label: "a\nb" });
      expect(result).toEqual({ error: "Not a valid display name" });
    });

    it("reports a stereotype failure with its own message", () => {
      expect(checked("A\nA->B: hi", "A", { stereotype: "a\nb" })).toEqual({
        error: "Not a valid stereotype",
      });
    });
  });
});

describe("participantStyleTransform keeps untouched attributes verbatim", () => {
  it('keeps `as "if"` when only the stereotype changes', () => {
    const code = 'A as "if"\nA->B: hi';
    const out = apply(code, "A", { stereotype: "Service" });
    const read = readParticipantDeclaration(RootContext(out), "A");
    expect(read?.stereotype).toBe("Service");
    expect(read?.label).toBe("if");
    expect(out).toContain('as "if"');
  });

  it("keeps a quoted keyword label across consecutive edits", () => {
    let code = 'A as "if"\nA->B: hi';
    code = apply(code, "A", { stereotype: "Service" });
    code = apply(code, "A", { color: "#ef4444" });
    code = apply(code, "A", { type: "Actor" });
    const read = readParticipantDeclaration(RootContext(code), "A");
    expect(read).toMatchObject({
      label: "if",
      stereotype: "Service",
      color: "#ef4444",
      type: "Actor",
    });
  });

  it("keeps label `const` when other attributes change, and can set it", () => {
    const out = apply('A as "const"\nA->B: hi', "A", { color: "#ef4444" });
    expect(readParticipantDeclaration(RootContext(out), "A")?.label).toBe(
      "const",
    );
    const set = setParticipantStyleChecked(
      "A\nA->B: hi",
      RootContext("A\nA->B: hi"),
      "A",
      { label: "const" },
    );
    expect("code" in set).toBe(true);
    if ("code" in set)
      expect(
        readParticipantDeclaration(RootContext(set.code), "A")?.label,
      ).toBe("const");
  });
});

describe("participantStyleTransform after rename-to-label", () => {
  it("keeps an untouched redundant label when another attribute changes", () => {
    const code = "Alice as Alice\nAlice->B: hi";
    const result = setParticipantStyleChecked(
      code,
      RootContext(code),
      "Alice",
      {
        color: "#ef4444",
      },
    );
    expect(result).toEqual({
      code: "Alice as Alice #ef4444\nAlice->B: hi",
    });
  });
});
