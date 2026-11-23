import {
  codeAtom,
  enableWritingAnimationAtom,
  rootContextAtom,
  writingMotionAtom,
} from "@/store/Store";
import { act, render } from "@testing-library/react";
import { createStore, Provider, useAtomValue } from "jotai";
import { describe, expect, it } from "vitest";
import { Block } from "./Block";

/**
 * ADR 0009 gate G7: a statement keeps its DOM node when the text around it
 * changes. With `key={index}`, inserting a statement in the middle made React
 * reuse the node of the statement that used to sit at that index, so every
 * following row was re-rendered into its neighbour's node (the 2021 animation
 * played on the wrong row for this reason).
 */
const RootBlock = () => {
  const root = useAtomValue(rootContextAtom);
  return <Block context={root?.block()} number="1" isRoot />;
};

const mount = (code: string, motion = false) => {
  const store = createStore();
  store.set(codeAtom, code);
  store.set(enableWritingAnimationAtom, motion);
  store.set(writingMotionAtom, motion);
  const view = render(
    <Provider store={store}>
      <RootBlock />
    </Provider>,
  );
  const rows = () =>
    Array.from(view.container.querySelectorAll(".statement-container"));
  const setCode = (next: string) => act(() => store.set(codeAtom, next));
  return { view, rows, setCode };
};

describe("Block identity keys", () => {
  it("keeps the DOM nodes of the statements after a middle insert", () => {
    const { rows, setCode } = mount("A.first()\nA.second()\nA.third()");
    const before = rows();
    expect(before).toHaveLength(3);

    setCode("A.first()\nA.inserted()\nA.second()\nA.third()");
    const after = rows();
    expect(after).toHaveLength(4);

    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
    expect(after[3]).toBe(before[2]);
    expect(before).not.toContain(after[1]);
  });

  // ADR 0009, Decision 4: writing-time motion finds a statement by its key.
  it("marks each statement with its identity key only while motion is on", () => {
    const off = mount("A.first()\nA.second()");
    expect(off.rows().map((row) => row.getAttribute("data-identity"))).toEqual([
      null,
      null,
    ]);
    off.view.unmount();

    const on = mount("A.first()\nA.second()", true);
    const keys = on.rows().map((row) => row.getAttribute("data-identity"));
    expect(keys.every((key) => typeof key === "string" && key.length > 0)).toBe(
      true,
    );
    expect(new Set(keys).size).toBe(2);
    on.setCode("A.first()\nA.inserted()\nA.second()");
    const after = on.rows().map((row) => row.getAttribute("data-identity"));
    expect(after[0]).toBe(keys[0]);
    expect(after[2]).toBe(keys[1]);
  });

  it("keeps the DOM nodes of the statements after a middle delete", () => {
    const { rows, setCode } = mount("A.first()\nA.second()\nA.third()");
    const before = rows();

    setCode("A.first()\nA.third()");
    const after = rows();

    expect(after).toHaveLength(2);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[2]);
  });

  it("keeps the DOM nodes of nested statements after an insert above the fragment", () => {
    const { view, setCode } = mount(
      "A.first()\nif(x) {\n  A.inner1()\n  A.inner2()\n}",
    );
    const inner = () =>
      Array.from(
        view.container.querySelectorAll(".segment .statement-container"),
      );
    const before = inner();
    expect(before).toHaveLength(2);

    setCode("A.first()\nA.added()\nif(x) {\n  A.inner1()\n  A.inner2()\n}");
    const after = inner();

    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
  });

  it("keeps the DOM node of a later fragment section after a section insert", () => {
    const { view, setCode } = mount("if(x) {\n  A.a()\n} else {\n  A.c()\n}");
    const segments = () =>
      Array.from(view.container.querySelectorAll(".segment"));
    const before = segments();
    expect(before).toHaveLength(2);

    setCode("if(x) {\n  A.a()\n} else if(y) {\n  A.b()\n} else {\n  A.c()\n}");
    const after = segments();

    expect(after).toHaveLength(3);
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
  });
});
