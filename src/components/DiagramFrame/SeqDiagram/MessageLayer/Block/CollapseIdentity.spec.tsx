import { codeAtom, rootContextAtom } from "@/store/Store";
import { act, fireEvent, render } from "@testing-library/react";
import { mock } from "bun:test";
import { createStore, Provider, useAtomValue } from "jotai";
import { describe, expect, it } from "vitest";

// Bun's module mocks are process-wide and another spec replaces Icons with a
// null component. Pin a clickable stand-in so this spec does not depend on
// test order.
mock.module("@/components/Icon/Icons", () => ({
  default: (props: { className?: string; onClick?: () => void }) => (
    <span className={props.className} onClick={props.onClick} />
  ),
}));

const { Block } = await import("./Block");

/**
 * A collapsed fragment or occurrence stays collapsed while other lines are
 * edited. Every parse creates new ANTLR contexts, so resetting on a context
 * change expanded it again on any edit; the reset now follows the element's
 * identity key (ADR 0009, G7).
 */
const RootBlock = () => {
  const root = useAtomValue(rootContextAtom);
  return <Block context={root?.block()} number="1" isRoot />;
};

const mount = (code: string) => {
  const store = createStore();
  store.set(codeAtom, code);
  const view = render(
    <Provider store={store}>
      <RootBlock />
    </Provider>,
  );
  const setCode = (next: string) => act(() => store.set(codeAtom, next));
  const click = (el: Element) => act(() => fireEvent.click(el));
  return { view, setCode, click };
};

const fragments = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".fragment"));

/** A fragment is collapsed when its sections sit inside a hidden body. */
const isFragmentCollapsed = (fragment: Element) => {
  const segment = fragment.querySelector(".segment");
  expect(segment).not.toBeNull();
  return segment!.closest(".hidden") !== null;
};

const collapseFragment = (click: (el: Element) => void, fragment: Element) => {
  const toggle = fragment.querySelector(".collapsible-header > :last-child");
  expect(toggle).not.toBeNull();
  click(toggle!);
  expect(isFragmentCollapsed(fragment)).toBe(true);
};

const occurrenceHeaders = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".occurrence-collapsible-header"));

/** The expand icon is the header's last child and shows only when collapsed. */
const isOccurrenceCollapsed = (header: Element) =>
  !header.lastElementChild!.classList.contains("hidden");

describe("collapse state across edits", () => {
  it("keeps a fragment collapsed when a statement is inserted above it", () => {
    const { view, setCode, click } = mount(
      "if(a) {\n  A.b()\n}\nif(c) {\n  A.d()\n}",
    );
    collapseFragment(click, fragments(view.container)[0]);

    setCode("if(z) {\n  A.y()\n}\nif(a) {\n  A.b()\n}\nif(c) {\n  A.d()\n}");

    const [z, a, c] = fragments(view.container);
    expect(isFragmentCollapsed(z)).toBe(false);
    expect(isFragmentCollapsed(a)).toBe(true);
    expect(isFragmentCollapsed(c)).toBe(false);
  });

  it("keeps an occurrence collapsed when a statement is inserted above it", () => {
    const { view, setCode, click } = mount("A.m() {\n  B.n()\n}");
    const [header] = occurrenceHeaders(view.container);
    click(header.querySelector(".collapse-button")!);
    expect(isOccurrenceCollapsed(header)).toBe(true);

    setCode("A.x()\nA.m() {\n  B.n()\n}");

    const headers = occurrenceHeaders(view.container);
    expect(headers).toHaveLength(1);
    expect(isOccurrenceCollapsed(headers[0])).toBe(true);
  });

  it("starts expanded when the element is replaced by one of another kind", () => {
    const { view, setCode, click } = mount("if(a) {\n  A.b()\n}");
    collapseFragment(click, fragments(view.container)[0]);

    setCode("loop(a) {\n  A.b()\n}");

    const [loop] = fragments(view.container);
    expect(isFragmentCollapsed(loop)).toBe(false);
  });
});
