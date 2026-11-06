import {
  activeTextEditorsAtom,
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableMessageInsertionAtom,
  modeAtom,
  RenderMode,
} from "@/store/Store";
import { act, cleanup, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it } from "vitest";
import { MessageCreateControls } from "./MessageCreateControls";

// ADR 0002, P4: the create-drag preview asks `useCan("createMessage")`
// instead of combining the mode and the text-edit overlay itself.

const DRAG = {
  source: "A",
  sourceX: 0,
  sourceY: 0,
  pointerX: 10,
  pointerY: 0,
  hoverTarget: null,
  insertIndex: 0,
  blockContext: null,
};

const setup = () => {
  const diagram = document.createElement("div");
  document.body.appendChild(diagram);
  const store = createStore();
  store.set(codeAtom, "A->B: hi");
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableMessageInsertionAtom, true);
  store.set(diagramElementAtom, diagram);
  const view = render(
    <Provider store={store}>
      <MessageCreateControls />
    </Provider>,
  );
  const preview = () => view.queryByTestId("message-create-preview-line");
  return { store, diagram, preview };
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("MessageCreateControls interaction policy", () => {
  it("draws the preview and marks the diagram while a create drag runs", () => {
    const { store, diagram, preview } = setup();
    act(() => {
      store.set(createMessageDragAtom, DRAG);
    });
    expect(preview()).not.toBeNull();
    expect(diagram.dataset.messageCreateDragging).toBe("true");
  });

  it("ends the drag when a text edit starts", () => {
    const { store, diagram, preview } = setup();
    act(() => {
      store.set(createMessageDragAtom, DRAG);
    });
    act(() => {
      store.set(activeTextEditorsAtom, new Set([Symbol("label")]));
    });
    expect(store.get(createMessageDragAtom)).toBeNull();
    expect(preview()).toBeNull();
    expect(diagram.dataset.messageCreateDragging).toBeUndefined();
  });

  it("draws nothing in a static render", () => {
    const { store, preview } = setup();
    act(() => {
      store.set(modeAtom, RenderMode.Static);
      store.set(createMessageDragAtom, DRAG);
    });
    expect(preview()).toBeNull();
  });
});
