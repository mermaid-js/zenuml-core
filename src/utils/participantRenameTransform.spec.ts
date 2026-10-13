import { describe, expect, it } from "vitest";
import { Participants, RootContext } from "@/parser";
import { renameParticipantInDsl } from "./participantRenameTransform";

const rename = (code: string, from: string, to: string) =>
  renameParticipantInDsl(code, RootContext(code), from, to);

const renamed = (code: string, from: string, to: string) => {
  const result = rename(code, from, to);
  if ("error" in result) throw new Error(result.error);
  return result;
};

describe("renameParticipantInDsl", () => {
  it("renames an inferred participant in every message", () => {
    expect(renamed("A->C: Ping\nC->A: Pong", "A", "Alice")).toEqual({
      code: "Alice->C: Ping\nC->Alice: Pong",
      name: "Alice",
    });
  });

  it("renames the declaration even when it carries a display label", () => {
    expect(
      renamed('@Actor A as "Alice Smith" #ef4444\nA->C: Ping', "A", "Alice")
        .code,
    ).toBe('@Actor Alice as "Alice Smith" #ef4444\nAlice->C: Ping');
  });

  it("renames references inside fragments and method-call syntax", () => {
    expect(
      renamed("A\nif (x) {\n  A.save() {\n    A->B: hi\n  }\n}", "A", "Z").code,
    ).toBe("Z\nif (x) {\n  Z.save() {\n    Z->B: hi\n  }\n}");
  });

  it("quotes names that need it and leaves other participants alone", () => {
    expect(renamed("A->AB: hi", "A", "Order Service")).toEqual({
      code: '"Order Service"->AB: hi',
      name: "Order Service",
    });
  });

  it("rejects an empty name and keeps an unchanged name as a no-op", () => {
    expect(rename("A->B: hi", "A", "  ")).toEqual({
      error: "Name is required",
    });
    expect(rename("A->B: hi", "A", '""')).toEqual({
      error: "Name is required",
    });
    expect(rename("A->B: hi", "A", "A")).toEqual({
      code: "A->B: hi",
      name: "A",
    });
  });

  it("quotes reserved words so the diagram keeps both participants", () => {
    const result = renamed("A->B: Ping", "A", "if");
    expect(result.code).toBe('"if"->B: Ping');
    expect(Participants(RootContext(result.code)).Names()).toEqual([
      result.name,
      "B",
    ]);
  });

  it("quotes names that start with a digit", () => {
    const result = renamed("A->B: Ping", "A", "123");
    expect(result.code).toBe('"123"->B: Ping');
    expect(Participants(RootContext(result.code)).Names()).toEqual([
      result.name,
      "B",
    ]);
  });

  it("refuses to merge into an existing participant", () => {
    const code = "@Actor A\n@Database B\nA->B: Ping";
    expect(rename(code, "A", "B")).toEqual({ error: '"B" already exists' });
  });

  it("does not rewrite names inside nested parameter expressions", () => {
    expect(renamed("A.m(f(1), A.foo())", "A", "Z").code).toBe(
      "Z.m(f(1), A.foo())",
    );
  });

  it("collects no participants from nested parameter expressions", () => {
    expect(Participants(RootContext("Z.m(f(1), A.foo())")).Names()).toEqual([
      "Z",
    ]);
  });

  it("does not rewrite names inside nested conditions", () => {
    const code = "A->B: hi\nif (f(1) && A.foo()) {\n  A->B: again\n}";
    expect(renamed(code, "A", "Z").code).toBe(
      "Z->B: hi\nif (f(1) && A.foo()) {\n  Z->B: again\n}",
    );
  });

  it("returns the parser's canonical name for names with a comma", () => {
    const result = renamed("A->B: Ping", "A", "First, Last");
    expect(result.name).toBe("First,Last");
    expect(Participants(RootContext(result.code)).Names()).toContain(
      result.name,
    );
  });

  it("rejects assigned participants", () => {
    const code = "x = new A()\nx.f()";
    expect(rename(code, "x:A", "y")).toEqual({
      error: "Rename assigned participants in the code editor",
    });
  });
});
