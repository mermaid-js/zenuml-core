import { Provider, createStore } from "jotai";
import { render } from "@testing-library/react";
import { Interaction } from "./Interaction";
import {
  codeAtom,
  treeIRAtom,
  coordinatesAtom,
  cursorAtom,
} from "@/store/Store";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { StatementKind } from "@/ir/tree-types";
import { _STARTER_ } from "@/constants";

function renderInteraction(code: string, cursor?: number | null) {
  const store = createStore();
  store.set(codeAtom, code);
  if (cursor !== undefined) {
    store.set(cursorAtom, cursor);
  }

  // Get the first statement from the tree IR
  const treeIR = store.get(treeIRAtom);
  const statement = treeIR?.root.statements[0];
  if (!statement || statement.kind !== StatementKind.Message) {
    throw new Error("expected message statement");
  }

  // Build VM using TreeVMBuilder
  const coordinates = store.get(coordinatesAtom);
  const treeVMBuilder = createTreeVMBuilder();
  const vm = treeVMBuilder.buildStatementVM(statement, _STARTER_, coordinates);
  
  if (!vm) {
    throw new Error("expected message view model");
  }

  const utils = render(
    <Provider store={store}>
      <Interaction origin={_STARTER_} vm={vm} />
    </Provider>,
  );

  return { ...utils, vm, range: statement.range };
}

describe.skip("Interaction (sync message)", () => {
  test.each<string>(["A->B.m1", "B.m2"])("uses VM metadata for %s", (code) => {
    const { container, vm } = renderInteraction(code);
    const root = container.querySelector("div.interaction");
    expect(root?.dataset?.from).toBe(vm.from ?? _STARTER_);
    expect(root?.dataset?.to).toBe(vm.to ?? "");
    expect(root?.dataset?.signature).toBe(vm.signature);
  });

  test("highlights current message when cursor is inside range", () => {
    const { range, unmount: cleanupBase } = renderInteraction("A->B.m1");
    cleanupBase();
    const start = range?.[0] ?? 0;
    const insideCursor = start;
    const { container: highlighted, unmount: cleanupInside } = renderInteraction(
      "A->B.m1",
      insideCursor,
    );
    const highlightedRoot = highlighted.querySelector("div.interaction");
    expect(highlightedRoot?.classList.contains("highlight")).toBe(true);
    cleanupInside();

    const outsideCursor = (range?.[1] ?? insideCursor) + 1;
    const { container: notHighlighted, unmount: cleanupOutside } = renderInteraction(
      "A->B.m1",
      outsideCursor,
    );
    const notHighlightedRoot =
      notHighlighted.querySelector("div.interaction");
    expect(notHighlightedRoot?.classList.contains("highlight")).toBe(false);
    cleanupOutside();
  });
});
