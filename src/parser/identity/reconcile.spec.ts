import { describe, expect, it } from "vitest";
import { reconcileByName, reconcileList, type Signed } from "./reconcile";

const m = (label: string): Signed => ({ kind: "message", label });
const alt = (label: string): Signed => ({ kind: "alt", label });
const p = (label: string): Signed => ({ kind: "participant", label });

/** For each new element, the index of the old element it pairs with, or "new". */
const mapping = (olds: Signed[], news: Signed[], fn = reconcileList) => {
  const { pairs } = fn(olds, news);
  return news.map((n) => {
    const pair = pairs.find(([, x]) => x === n);
    return pair ? olds.indexOf(pair[0]) : "new";
  });
};

describe("reconcileList", () => {
  it("keeps the elements before and after a middle insert", () => {
    const olds = [m("A.a()"), m("A.b()"), m("A.c()")];
    const news = [m("A.a()"), m("A.x()"), m("A.b()"), m("A.c()")];
    expect(mapping(olds, news)).toEqual([0, "new", 1, 2]);
  });

  it("keeps the elements before and after a middle delete", () => {
    const olds = [m("A.a()"), m("A.b()"), m("A.c()")];
    const news = [m("A.a()"), m("A.c()")];
    const { gone } = reconcileList(olds, news);
    expect(mapping(olds, news)).toEqual([0, 2]);
    expect(gone).toEqual([olds[1]]);
  });

  it("treats a label edited in place as the same element when the kind stays", () => {
    const olds = [m("A.a()"), m("A.b()"), m("A.c()")];
    const news = [m("A.a()"), m("A.bee()"), m("A.c()")];
    expect(mapping(olds, news)).toEqual([0, 1, 2]);
  });

  it("treats a kind change as a new element", () => {
    const olds = [m("A.a()"), m("A.b()"), m("A.c()")];
    const news = [m("A.a()"), alt("if(x)"), m("A.c()")];
    const { gone } = reconcileList(olds, news);
    expect(mapping(olds, news)).toEqual([0, "new", 2]);
    expect(gone).toEqual([olds[1]]);
  });

  it("pairs the middle by kind, first unpaired old element first", () => {
    const olds = [m("A.a()"), alt("if(x)"), m("A.b()")];
    const news = [m("A.z()"), alt("if(y)"), m("A.w()")];
    expect(mapping(olds, news)).toEqual([0, 1, 2]);
  });

  it("returns every element as new or gone for empty sides", () => {
    expect(reconcileList([], [m("A.a()")]).born).toHaveLength(1);
    expect(reconcileList([m("A.a()")], []).gone).toHaveLength(1);
  });
});

describe("reconcileByName", () => {
  it("pairs participants by name in any order", () => {
    const olds = [p("A"), p("B"), p("C")];
    const news = [p("C"), p("A"), p("B")];
    expect(mapping(olds, news, reconcileByName)).toEqual([2, 0, 1]);
  });

  it("pairs a rename while typing by name prefix", () => {
    const olds = [p("A"), p("Ali")];
    const news = [p("A"), p("Alice")];
    expect(mapping(olds, news, reconcileByName)).toEqual([0, 1]);
  });

  it("gives a duplicate name its own pairing, never the same old twice", () => {
    const olds = [p("A")];
    const news = [p("A"), p("A")];
    expect(mapping(olds, news, reconcileByName)).toEqual([0, "new"]);
  });

  it("does not pair unrelated names", () => {
    const olds = [p("Bob")];
    const news = [p("Carol")];
    expect(mapping(olds, news, reconcileByName)).toEqual(["new"]);
  });
});
