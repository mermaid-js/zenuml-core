import { Provider, createStore } from "jotai";
import { render } from "@testing-library/react";
import { Return } from "./Return";
import {
  codeAtom,
  treeIRAtom,
  coordinatesAtom,
  cursorAtom,
} from "@/store/Store";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { StatementKind } from "@/ir/tree-types";
import type { MessageVM } from "@/vm/messages";
import { _STARTER_ } from "@/constants";

function renderReturn(code: string, cursor?: number | null) {
  const store = createStore();
  store.set(codeAtom, code);
  if (cursor !== undefined) store.set(cursorAtom, cursor);

  // Get the return statement from the tree IR
  const treeIR = store.get(treeIRAtom);
  const statement = treeIR?.root.statements.find(s => s.kind === StatementKind.Return);
  if (!statement) {
    throw new Error("expected return statement");
  }

  // Build VM using TreeVMBuilder
  const coordinates = store.get(coordinatesAtom);
  const treeVMBuilder = createTreeVMBuilder();
  const vm = treeVMBuilder.buildStatementVM(statement, _STARTER_, coordinates);
  
  if (!vm) {
    throw new Error("expected return view model");
  }

  // Provide arrow data for VM to drive the component; keep simple values
  const vmWithArrow: MessageVM & {
    arrow: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
    };
  } = {
    ...vm,
    arrow: {
      translateX: 0,
      interactionWidth: 100,
      rightToLeft: false,
    },
  };

  const utils = render(
    <Provider store={store}>
      <Return origin={_STARTER_} vm={vmWithArrow as any} />
    </Provider>,
  );

  return { ...utils, vm: vmWithArrow, range: statement.range };
}

describe.skip("Return (bare return statement)", () => {
  test("uses VM metadata and exposes attributes", () => {
    const { container, vm } = renderReturn("return x");
    const root = container.querySelector("div.return");
    expect(root?.dataset?.from).toBe(vm.from);
    expect(root?.dataset?.to).toBe(vm.to);
    expect(root?.dataset?.signature).toBe(vm.signature);
  });

  test("highlights when cursor is inside vm.range", () => {
    const { range, unmount: cleanupBase } = renderReturn("return x");
    cleanupBase();
    const start = range?.[0] ?? 0;
    const insideCursor = start;
    const { container: highlighted, unmount: cleanupInside } = renderReturn(
      "return x",
      insideCursor,
    );
    const highlightedRoot = highlighted.querySelector("div.return");
    expect(highlightedRoot?.classList.contains("highlight")).toBe(true);
    cleanupInside();

    const outsideCursor = (range?.[1] ?? insideCursor) + 1;
    const { container: notHighlighted, unmount: cleanupOutside } = renderReturn(
      "return x",
      outsideCursor,
    );
    const notHighlightedRoot = notHighlighted.querySelector("div.return");
    expect(notHighlightedRoot?.classList.contains("highlight")).toBe(false);
    cleanupOutside();
  });
});

describe.skip("Return (async return form)", () => {
  test("uses async source/target and sets return type", () => {
    const { container, vm } = renderReturn("@return A->B: ok");
    
    expect(vm.type).toBe(StatementKind.Return);
    expect(vm.from).toBe("A");
    expect(vm.to).toBe("B");
    expect(vm.signature).toBe("ok");

    const root = container.querySelector("div.return");
    expect(root?.dataset?.from).toBe("A");
    expect(root?.dataset?.to).toBe("B");
    expect(root?.dataset?.signature).toBe("ok");
  });
});
