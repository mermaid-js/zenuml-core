import { GroupContext, ParticipantContext, RootContext } from "@/parser";
import { fragmentOf } from "@/parser/fragmentOf";
import { describe, expect, it } from "vitest";
import { createIdentityTracker, headerLabel } from "./identityKeys";

const stats = (block: any): any[] => block?.stat?.() ?? [];

/** Parses `code` and returns its root statements and their identity keys. */
const step = (
  tracker: ReturnType<typeof createIdentityTracker>,
  code: string,
) => {
  const root = RootContext(code);
  const keys = tracker.update(root);
  const top = stats(root?.block());
  return { root, keys, top, ids: top.map((s) => keys.get(s)) };
};

describe("identity keys", () => {
  it("gives every statement a distinct key", () => {
    const { ids } = step(createIdentityTracker(), "A.a()\nA.b()\nA.c()");
    expect(new Set(ids).size).toBe(3);
    expect(ids.every(Boolean)).toBe(true);
  });

  it("keeps the keys of the statements before and after a middle insert", () => {
    const tracker = createIdentityTracker();
    const before = step(tracker, "A.a()\nA.b()\nA.c()").ids;
    const after = step(tracker, "A.a()\nA.x()\nA.b()\nA.c()").ids;
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
    expect(after[3]).toBe(before[2]);
    expect(before).not.toContain(after[1]);
  });

  it("keeps the key of a statement whose label is edited in place", () => {
    const tracker = createIdentityTracker();
    const before = step(tracker, "A.a()\nA.b()\nA.c()").ids;
    const after = step(tracker, "A.a()\nA.bee()\nA.c()").ids;
    expect(after).toEqual(before);
  });

  it("gives a new key to a statement that disappears for one parse and returns (parser flicker)", () => {
    // The tracker compares with the previous parse only. The other statements
    // keep their keys; the returning one is a new element.
    const tracker = createIdentityTracker();
    const first = step(tracker, "A.a()\nA.b()\nA.c()").ids;
    const gap = step(tracker, "A.a()\nA.c()").ids;
    const back = step(tracker, "A.a()\nA.b()\nA.c()").ids;
    expect(gap).toEqual([first[0], first[2]]);
    expect(back[0]).toBe(first[0]);
    expect(back[2]).toBe(first[2]);
    expect(back[1]).not.toBe(first[1]);
  });

  it("keeps the fragment and its siblings when a statement inside it is edited", () => {
    const tracker = createIdentityTracker();
    const before = step(tracker, "A.a()\nif(x) {\n  A.in()\n}\nA.c()");
    const after = step(
      tracker,
      "A.a()\nif(x) {\n  A.inner()\n  A.more()\n}\nA.c()",
    );
    expect(after.ids).toEqual(before.ids);

    const inner = (s: ReturnType<typeof step>) =>
      stats(fragmentOf(s.top[1])!.sections[0].block).map((x) => s.keys.get(x));
    expect(inner(after)[0]).toBe(inner(before)[0]);
    expect(inner(before)).not.toContain(inner(after)[1]);
  });

  it("keeps the keys of fragment sections when a section is inserted", () => {
    const tracker = createIdentityTracker();
    const sectionIds = (s: ReturnType<typeof step>) =>
      fragmentOf(s.top[0])!.sections.map((x) => s.keys.get(x.context));
    const before = step(tracker, "if(x) {\n  A.a()\n} else {\n  A.c()\n}");
    const after = step(
      tracker,
      "if(x) {\n  A.a()\n} else if(y) {\n  A.b()\n} else {\n  A.c()\n}",
    );
    const [ifBefore, elseBefore] = sectionIds(before);
    const [ifAfter, elseIfAfter, elseAfter] = sectionIds(after);
    expect(ifAfter).toBe(ifBefore);
    expect(elseAfter).toBe(elseBefore);
    expect([ifBefore, elseBefore]).not.toContain(elseIfAfter);
  });

  it("keeps message children keys inside a brace block", () => {
    const tracker = createIdentityTracker();
    const childIds = (s: ReturnType<typeof step>) =>
      stats(s.top[0].message().braceBlock().block()).map((x) => s.keys.get(x));
    const before = step(tracker, "A.m() {\n  B.a()\n  B.c()\n}");
    const after = step(tracker, "A.m() {\n  B.a()\n  B.b()\n  B.c()\n}");
    expect(after.ids).toEqual(before.ids);
    const [a0, c0] = childIds(before);
    const [a1, , c1] = childIds(after);
    expect([a1, c1]).toEqual([a0, c0]);
  });

  it("keeps header participant and group keys, and follows a rename by prefix", () => {
    const tracker = createIdentityTracker();
    const head = (code: string) => {
      const root = RootContext(code);
      const keys = tracker.update(root);
      return (root.head().children as any[])
        .filter(
          (c) => c instanceof GroupContext || c instanceof ParticipantContext,
        )
        .map((c) => keys.get(c));
    };
    const before = head("Ali\ngroup G { B }\nC\nA.m()");
    const after = head("Alice\ngroup G { B }\nC\nA.m()");
    expect(before).toHaveLength(3);
    expect(after).toEqual(before);
  });

  it("starts over after an empty diagram", () => {
    const tracker = createIdentityTracker();
    const first = step(tracker, "A.a()").ids;
    expect(tracker.update(null).get(first)).toBeUndefined();
    const again = step(tracker, "A.a()").ids;
    expect(again[0]).not.toBe(first[0]);
  });

  it("returns the same keys for the same root", () => {
    const tracker = createIdentityTracker();
    const root = RootContext("A.a()");
    expect(tracker.update(root)).toBe(tracker.update(root));
  });

  it("returns no key for a context from another parse", () => {
    const tracker = createIdentityTracker();
    step(tracker, "A.a()");
    const other = stats(RootContext("A.a()")?.block())[0];
    expect(tracker.update(RootContext("A.b()")).get(other)).toBeUndefined();
  });
});

describe("headerLabel", () => {
  const first = (code: string) => stats(RootContext(code)?.block())[0];

  it("is the statement text without its nested block", () => {
    expect(headerLabel(first("A.m(x) {\n  B.n()\n}"))).toBe("A.m(x)");
    expect(
      headerLabel(first("if(ready) {\n  B.n()\n} else {\n  C.o()\n}")),
    ).toBe("if(ready)");
  });

  it("is the whole statement when it has no block", () => {
    expect(headerLabel(first("A->B:   hello   there"))).toBe(
      "A->B: hello there",
    );
  });
});
