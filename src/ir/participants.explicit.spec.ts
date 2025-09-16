import { describe, it, expect } from "bun:test";
import { RootContext, Participants } from "@/parser";
import { buildParticipantsModel } from "@/ir/participants";
import sequenceParser from "@/generated-parser/sequenceParser";

function getParticipantContexts(root: any): any[] {
  const head = root?.head?.();
  if (!head) return [];
  const items = (head.children || []) as any[];
  return items.filter(
    (c) => c instanceof (sequenceParser as any).ParticipantContext,
  );
}

describe("Participants IR parity for explicit declarations", () => {
  it("simple declarations: A B", () => {
    const code = "A B";
    const root = RootContext(code);
    const ir = buildParticipantsModel(root);
    const byName = new Map(ir.map((p) => [p.name, p]));
    const contexts = getParticipantContexts(root);
    expect(contexts.length).toBe(2);
    for (const ctx of contexts) {
      const parserEntity = Participants(ctx).First();
      const irEntity = byName.get(parserEntity.name);
      expect(irEntity).toBeTruthy();
      expect(irEntity?.name).toBe(parserEntity.name);
    }
  });

  it("declaration with label: A as A1; B", () => {
    const code = "A as A1 B";
    const root = RootContext(code);
    const ir = buildParticipantsModel(root);
    const byName = new Map(ir.map((p) => [p.name, p]));
    const contexts = getParticipantContexts(root);
    for (const ctx of contexts) {
      const parserEntity = Participants(ctx).First();
      const irEntity = byName.get(parserEntity.name);
      expect(irEntity).toBeTruthy();
      // name parity
      expect(irEntity?.name).toBe(parserEntity.name);
      // label parity where applicable
      if (parserEntity.label) {
        expect(irEntity?.label).toBe(parserEntity.label);
      }
    }
  });
});

