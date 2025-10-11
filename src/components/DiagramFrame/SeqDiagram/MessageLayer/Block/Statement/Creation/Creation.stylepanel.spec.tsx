import { Provider, createStore } from "jotai";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { Creation } from "./Creation";
import { StylePanel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel";
import {
  codeAtom,
  treeIRAtom,
  coordinatesAtom,
} from "@/store/Store";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { _STARTER_ } from "@/constants";
import { StatementKind } from "@/ir/tree-types";

function renderCreationWithStylePanel(code: string) {
  const store = createStore();
  store.set(codeAtom, code);

  // Get the creation statement from the tree IR
  const treeIR = store.get(treeIRAtom);
  const statement = treeIR?.root.statements.find(s => s.kind === StatementKind.Creation);
  if (!statement) {
    throw new Error("expected creation statement");
  }

  // Build VM using TreeVMBuilder
  const coordinates = store.get(coordinatesAtom);
  const treeVMBuilder = createTreeVMBuilder();
  const vm = treeVMBuilder.buildStatementVM(statement, _STARTER_, coordinates);
  
  if (!vm) {
    throw new Error("expected creation view model");
  }

  const utils = render(
    <Provider store={store}>
      <StylePanel />
      <Creation origin={_STARTER_} vm={vm as any} />
    </Provider>,
  );

  return { ...utils };
}

describe.skip("StylePanel start offset parity for Creation", () => {
  test("opens style panel with new payload for 'a = new A'", async () => {
    const { container, getByTestId } = renderCreationWithStylePanel("a = new A");
    const messageEl = container.querySelector(
      "div.creation .message",
    ) as HTMLElement;
    expect(messageEl).toBeTruthy();
    fireEvent.click(messageEl);
    await waitFor(() => {
      expect(getByTestId("style-panel-toolbar")).toBeTruthy();
    });
  });
});
