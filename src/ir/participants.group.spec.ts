import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { buildParticipantsModel } from "@/ir/participants";
import { Participants } from "@/parser";
import sequenceParser from "@/generated-parser/sequenceParser";

describe("Participants IR covers group declarations", () => {
  const namesFromIR = (code: string) =>
    (buildParticipantsModel(RootContext(code)) || []).map((p) => p.name);

  it("group g { A B } => IR contains A and B", () => {
    const code = "group g { A B } A->B.m";
    const prog = RootContext(code) as any;
    const groups = (prog?.head()?.children || []).filter(
      (c: any) => c instanceof (sequenceParser as any).GroupContext,
    );
    expect(groups.length).toBeGreaterThan(0);
    const irNames = namesFromIR(code);
    const groupNames = Participants(groups[0]).Names();
    for (const n of groupNames) {
      expect(irNames.includes(n)).toBeTrue();
    }
  });

  it("multiple groups => IR contains all declared group names", () => {
    const code = "group g1 { A } group g2 { B C }";
    const prog = RootContext(code) as any;
    const groups = (prog?.head()?.children || []).filter(
      (c: any) => c instanceof (sequenceParser as any).GroupContext,
    );
    expect(groups.length).toBe(2);
    const irNames = namesFromIR(code);
    const declared = groups.flatMap((g: any) => Participants(g).Names());
    for (const n of declared) {
      expect(irNames.includes(n)).toBeTrue();
    }
  });
});

