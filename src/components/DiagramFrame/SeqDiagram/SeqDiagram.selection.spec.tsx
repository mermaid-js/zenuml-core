import { mock } from "bun:test";
import {
  codeAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it } from "vitest";

mock.module("@/components/Icon/Icons", () => ({
  default: () => null,
}));

const { SeqDiagram } = await import("./SeqDiagram");

// ADR 0002, P4: selection click-away has one owner. A press and its click on
// empty canvas clear the participant and the message selection; presses in
// the participant editor (a portal) keep them.

type Store = ReturnType<typeof createStore>;

const setup = (prepare?: (store: Store) => void) => {
  const store = createStore();
  store.set(codeAtom, "A\nB\nA->B: hi");
  store.set(modeAtom, RenderMode.Dynamic);
  prepare?.(store);
  const view = render(
    <Provider store={store}>
      <SeqDiagram />
    </Provider>,
  );
  const canvas = view.container.querySelector(
    ".message-layer",
  ) as HTMLElement;
  return { store, view, canvas };
};

// A real press: pointerdown, then the click it produces.
const press = (target: Element) => {
  act(() => {
    fireEvent.pointerDown(target);
    fireEvent.pointerUp(target);
    fireEvent.click(target);
  });
};

describe("SeqDiagram selection click-away", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("clears a participant highlight on a press on empty canvas", () => {
    const { store, canvas } = setup((s) => s.set(selectedAtom, ["A", "B"]));
    press(canvas);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("closes the participant editor on a press on empty canvas", () => {
    const { store, canvas } = setup((s) => {
      s.set(enableParticipantStyleEditingAtom, true);
      s.set(selectedAtom, ["A"]);
    });
    press(canvas);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("clears the message selection on a press on empty canvas", () => {
    const { store, canvas } = setup((s) =>
      s.set(selectedMessageAtom, { start: 4, end: 11, token: 1 }),
    );
    press(canvas);
    expect(store.get(selectedMessageAtom)).toBeNull();
  });

  it("keeps the selection on a press inside the participant editor", () => {
    const { store, view } = setup((s) => {
      s.set(enableParticipantStyleEditingAtom, true);
      s.set(selectedAtom, ["A"]);
    });
    const editor = view.getByTestId("participant-style-panel");
    press(editor);
    expect(store.get(selectedAtom)).toEqual(["A"]);
  });

  it("keeps a participant highlight on a press on another participant's box", () => {
    const { store, view } = setup((s) => s.set(selectedAtom, ["A"]));
    const b = view.container.querySelector(
      '[data-participant-id="B"]',
    ) as HTMLElement;
    press(b);
    // The participant's own click toggles B in; A stays.
    expect(store.get(selectedAtom)).toEqual(["A", "B"]);
  });
});
