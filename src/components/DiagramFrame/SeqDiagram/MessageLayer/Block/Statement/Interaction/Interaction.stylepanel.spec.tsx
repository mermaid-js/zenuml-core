import { Provider, createStore } from "jotai";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { Interaction } from "./Interaction";
import { StylePanel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel";
import {
  codeAtom,
  treeIRAtom,
  coordinatesAtom,
} from "@/store/Store";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { StatementKind } from "@/ir/tree-types";
import { _STARTER_ } from "@/constants";

function renderInteractionWithStylePanel(code: string) {
  const store = createStore();
  store.set(codeAtom, code);

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
      <StylePanel />
      <Interaction origin={_STARTER_} vm={vm as any} />
    </Provider>,
  );

  return { ...utils };
}

describe.skip("StylePanel start offset parity for Interaction", () => {
  test("opens style panel with new payload for sync message A->B.m1", async () => {
    const { container, getByTestId } = renderInteractionWithStylePanel("A->B.m1");
    const messageEl = container.querySelector(
      "div.interaction.sync .message",
    ) as HTMLElement;
    expect(messageEl).toBeTruthy();
    fireEvent.click(messageEl);
    await waitFor(() => {
      expect(getByTestId("style-panel-toolbar")).toBeTruthy();
    });
  });
});
