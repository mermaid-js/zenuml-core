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
