import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import { renameParticipantInDsl } from "./participantRenameTransform";

const rename = (code: string, from: string, to: string) =>
  renameParticipantInDsl(code, RootContext(code), from, to);

describe("renameParticipantInDsl", () => {
  it("renames an inferred participant in every message", () => {
    expect(rename("A->C: Ping\nC->A: Pong", "A", "Alice")).toBe(
      "Alice->C: Ping\nC->Alice: Pong",
    );
  });

  it("renames the declaration even when it carries a display label", () => {
    expect(
      rename('@Actor A as "Alice Smith" #ef4444\nA->C: Ping', "A", "Alice"),
    ).toBe('@Actor Alice as "Alice Smith" #ef4444\nAlice->C: Ping');
  });

  it("renames references inside fragments and method-call syntax", () => {
    expect(
      rename("A\nif (x) {\n  A.save() {\n    A->B: hi\n  }\n}", "A", "Z"),
    ).toBe("Z\nif (x) {\n  Z.save() {\n    Z->B: hi\n  }\n}");
  });

  it("quotes names that need it and leaves other participants alone", () => {
    expect(rename("A->AB: hi", "A", "Order Service")).toBe(
      '"Order Service"->AB: hi',
    );
  });

  it("is a no-op for an empty or unchanged name", () => {
    expect(rename("A->B: hi", "A", "  ")).toBe("A->B: hi");
    expect(rename("A->B: hi", "A", "A")).toBe("A->B: hi");
  });
});
