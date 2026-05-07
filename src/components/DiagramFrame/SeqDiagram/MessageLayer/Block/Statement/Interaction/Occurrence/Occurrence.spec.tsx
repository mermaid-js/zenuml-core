import { RootContext } from "@/parser";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableMessageInsertionAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { Occurrence } from "./Occurrence";

const setRect = (
  element: Element,
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  },
) => {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () =>
      ({
        x: rect.left,
        y: rect.top,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        toJSON: () => ({}),
      }) as DOMRect,
  });
};

const renderOccurrence = (code: string) => {
  const store = createStore();
  store.set(codeAtom, code);
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableMessageInsertionAtom, true);

  const root = RootContext(code);
  const message = root?.block()?.stat?.()[0]?.message?.();

  const view = render(
    <Provider store={store}>
      <div data-testid="diagram">
        <div className="block">
          <Occurrence context={message} participant="B" enableCreateDrag />
        </div>
      </div>
    </Provider>,
  );

  const diagram = view.getByTestId("diagram");
  const occurrence = view.container.querySelector(".occurrence");
  if (!occurrence) {
    throw new Error("Occurrence element not found");
  }

  setRect(diagram, { left: 10, top: 20, width: 320, height: 240 });
  setRect(occurrence, { left: 110, top: 40, width: 15, height: 60 });
  act(() => {
    store.set(diagramElementAtom, diagram);
  });

  return {
    store,
    message,
    occurrence,
    ...view,
  };
};

describe("Occurrence", () => {
  it("starts nested message drag from a sync occurrence bar without an existing block", () => {
    const { store, message, occurrence } = renderOccurrence(
      "A\nB\nC\nA->B.hello()",
    );

    act(() => {
      store.set(selectedMessageAtom, {
        start: 1,
        end: 2,
        token: 1,
      });
    });

    act(() => {
      fireEvent.pointerDown(occurrence, {
        clientX: 118,
        clientY: 70,
      });
    });

    const dragState = store.get(createMessageDragAtom);
    expect(dragState?.source).toBe("B");
    expect(dragState?.insertIndex).toBe(0);
    expect(dragState?.blockContext).toBeNull();
    expect(dragState?.hostContext).toBe(message);
    expect(dragState?.sourceX).toBe(107.5);
    expect(dragState?.sourceY).toBe(50);
    expect(store.get(selectedAtom)).toEqual(["B"]);
    expect(store.get(selectedMessageAtom)).toBeNull();
  });

  it("appends nested message drags after the existing child statements", () => {
    const { store, message, occurrence } = renderOccurrence(
      "A\nB\nC\nA->B.hello() {\n  B->C.work()\n}",
    );

    act(() => {
      fireEvent.pointerDown(occurrence, {
        clientX: 118,
        clientY: 70,
      });
    });

    const dragState = store.get(createMessageDragAtom);
    expect(dragState?.source).toBe("B");
    expect(dragState?.insertIndex).toBe(1);
    expect(dragState?.blockContext).toBe(message?.braceBlock?.()?.block?.());
    expect(dragState?.hostContext).toBe(message);
  });
});
