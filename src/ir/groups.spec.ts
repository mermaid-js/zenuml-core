import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { buildGroupsModel } from "./groups";

describe("Groups IR", () => {
  const buildIR = (code: string) => buildGroupsModel(RootContext(code));

  it("should extract group with name and participants", () => {
    const code = "group g1 { A B } A->B.m";
    const groups = buildIR(code);
    
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("g1");
    expect(groups[0].participantNames).toEqual(["A", "B"]);
    expect(groups[0].id).toMatch(/^group:0:A,B$/);
  });

  it("should extract multiple groups", () => {
    const code = "group g1 { A } group g2 { B C }";
    const groups = buildIR(code);
    
    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe("g1");
    expect(groups[0].participantNames).toEqual(["A"]);
    expect(groups[1].name).toBe("g2");
    expect(groups[1].participantNames).toEqual(["B", "C"]);
  });

  it("should handle group with quoted name", () => {
    const code = 'group "My Group" { A B }';
    const groups = buildIR(code);
    
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("My Group");
    expect(groups[0].participantNames).toEqual(["A", "B"]);
  });

  it("should handle group without name", () => {
    const code = "group { A B }";
    const groups = buildIR(code);
    
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("");
    expect(groups[0].participantNames).toEqual(["A", "B"]);
  });

  it("should return empty array for code without groups", () => {
    const code = "A->B.m";
    const groups = buildIR(code);
    
    expect(groups).toEqual([]);
  });

  it("should return empty array for empty code", () => {
    const groups = buildIR("");
    expect(groups).toEqual([]);
  });
});
