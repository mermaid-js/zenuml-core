import { codeAtom, treeIRAtom, coordinatesAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { InteractionAsync } from "./Interaction-async";
import { createStore } from "jotai";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { _STARTER_ } from "@/constants";
import { StatementKind } from "@/ir/tree-types";

const store = createStore();

function renderCode(code: string) {
  store.set(codeAtom, code);
  
  // Get the first async statement from the tree IR
  const treeIR = store.get(treeIRAtom);
  const statement = treeIR?.root.statements.find(s => s.kind === StatementKind.Async);
  if (!statement) {
    throw new Error("expected async statement");
  }

  // Build VM using TreeVMBuilder
  const coordinates = store.get(coordinatesAtom);
  const treeVMBuilder = createTreeVMBuilder();
  const vm = treeVMBuilder.buildStatementVM(statement, _STARTER_, coordinates);

  return render(
    <InteractionAsync
      origin={_STARTER_}
      vm={vm}
    />,
  );
}

describe.skip("Async Call", () => {
  test("code A->B:m", () => {
    const { container } = renderCode("A->B:m");
    expect(container.querySelector(".interaction.async")).toBeTruthy();
  });

  test("code A->A:m", () => {
    const { container } = renderCode("A->A:m");
    expect(container.querySelector(".interaction.async")).toBeTruthy();
  });
});
