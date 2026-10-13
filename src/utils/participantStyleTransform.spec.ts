import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import {
  readParticipantDeclaration,
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
});
