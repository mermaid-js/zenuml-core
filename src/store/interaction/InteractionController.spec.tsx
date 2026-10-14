import {
  createMessageDragAtom,
  diagramElementAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InteractionController } from "./InteractionController";
import { enterMenuAtom, interactionAtom, openMenuAtom } from "./interactionAtom";

// ADR 0002, P3: one capture-phase `pointerdown` gate (B), one click-away and
// one Escape handler, all owned by the interaction state.

const DRAG = {
  source: "A",
  sourceX: 0,
  sourceY: 0,
  pointerX: 0,
  pointerY: 0,
  hoverTarget: null,
  insertIndex: 0,
  blockContext: null,
};

type Store = ReturnType<typeof createStore>;

const setup = (prepare?: (store: Store) => void) => {
  const store = createStore();
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableParticipantStyleEditingAtom, true);
  const onCollapse = vi.fn();
  const onSelect = vi.fn();
  const onCreate = vi.fn();
  const onContextMenu = vi.fn();
  const onSurface = vi.fn();
  const onPickerKey = vi.fn();
  const view = render(
    <Provider store={store}>
      <InteractionController />
      <div data-testid="diagram">
        <div data-cap="collapse" data-testid="collapse" onClick={onCollapse}>
          <span data-testid="collapse-icon" />
        </div>
        <div data-cap="select" data-testid="participant" onClick={onSelect} />
        <div
          data-cap="createMessage"
          data-testid="gap"
          onPointerDown={onCreate}
          onContextMenu={onContextMenu}
        />
        <div data-testid="background" />
        <div data-interaction-surface="gapMenu" data-testid="gap-menu">
          <button data-cap="createMessage" data-testid="gap-menu-item" />
        </div>
      </div>
      <div
        data-interaction-surface="participantEditor"
        data-testid="editor"
        onClick={onSurface}
      >
        <input data-testid="editor-input" />
        <div
          data-testid="picker"
          onKeyDown={(e) => {
            // A picker's Escape closes only the picker (D11).
            if (e.key === "Escape") e.stopPropagation();
            onPickerKey();
          }}
          tabIndex={0}
        />
      </div>
      <button data-testid="host-page" />
    </Provider>,
  );
  act(() => {
    store.set(diagramElementAtom, view.getByTestId("diagram"));
    prepare?.(store);
  });
  return {
    store,
    view,
    onCollapse,
    onSelect,
    onCreate,
    onContextMenu,
    onSurface,
    onPickerKey,
  };
};

const openEditor = (store: Store) => store.set(selectedAtom, ["A"]);

/** Dispatch a press and report whether the gate consumed it. */
const press = (el: Element, init: PointerEventInit = {}) => {
  let notCancelled = true;
  act(() => {
    notCancelled = fireEvent.pointerDown(el, { button: 0, ...init });
  });
  return { consumed: !notCancelled };
};

const release = (el: Element) => {
  act(() => {
    fireEvent.pointerUp(el);
    fireEvent.click(el);
  });
};

afterEach(() => {
  // End any press a test left open, so its click suppressor cannot leak.
  window.dispatchEvent(new Event("pointercancel"));
  cleanup();
  document.body.innerHTML = "";
});

describe("gate B: a press on a disallowed target only exits (R2)", () => {
  it("consumes a press on a collapse button while the participant editor is open", () => {
    const { store, view, onCollapse } = setup(openEditor);
    const icon = view.getByTestId("collapse-icon");
    const { consumed } = press(icon);
    release(icon);
    expect(consumed).toBe(true);
    expect(onCollapse).not.toHaveBeenCalled();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("lets the second press act", async () => {
    const { view, onCollapse } = setup(openEditor);
    const icon = view.getByTestId("collapse-icon");
    press(icon);
    release(icon);
    // The click suppressor ends one task after pointerup.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const { consumed } = press(icon);
    release(icon);
    expect(consumed).toBe(false);
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it("consumes a right-click on another gap while a gap menu is open", () => {
    const { store, view, onCreate, onContextMenu } = setup((s) =>
      s.set(enterMenuAtom, { kind: "gapMenu", id: "g1" }),
    );
    const gap = view.getByTestId("gap");
    const { consumed } = press(gap, { button: 2 });
    let contextMenuNotCancelled = true;
    act(() => {
      contextMenuNotCancelled = fireEvent.contextMenu(gap);
    });
    expect(consumed).toBe(true);
    expect(contextMenuNotCancelled).toBe(false);
    expect(onCreate).not.toHaveBeenCalled();
    expect(onContextMenu).not.toHaveBeenCalled();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("does not consume a press on an allowed target, but still exits", () => {
    const { store, view, onSelect } = setup(openEditor);
    const participant = view.getByTestId("participant");
    const { consumed } = press(participant);
    release(participant);
    expect(consumed).toBe(false);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("leaves the active surface usable", () => {
    const { store, view } = setup((s) =>
      s.set(enterMenuAtom, { kind: "gapMenu", id: "g1" }),
    );
    const { consumed } = press(view.getByTestId("gap-menu-item"));
    expect(consumed).toBe(false);
    expect(store.get(interactionAtom).kind).toBe("gapMenu");
  });

  it("leaves the participant editor's own surface usable", () => {
    const { store, view } = setup(openEditor);
    const { consumed } = press(view.getByTestId("editor-input"));
    expect(consumed).toBe(false);
    expect(store.get(selectedAtom)).toEqual(["A"]);
  });

  it("does nothing while idle", () => {
    const { view, onCollapse } = setup();
    const icon = view.getByTestId("collapse-icon");
    const { consumed } = press(icon);
    release(icon);
    expect(consumed).toBe(false);
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });
});

describe("central click-away", () => {
  it("closes the message menu on a press on the diagram background", () => {
    const { store, view } = setup((s) => {
      s.set(selectedMessageAtom, { start: 1, end: 2, token: 1 });
      s.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    });
    const { consumed } = press(view.getByTestId("background"));
    expect(consumed).toBe(false);
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("closes the participant editor on a press outside the diagram, without consuming it", () => {
    const { store, view } = setup(openEditor);
    const { consumed } = press(view.getByTestId("host-page"));
    expect(consumed).toBe(false);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("commits a focused draft in the closing surface before it exits", () => {
    const { view } = setup(openEditor);
    const input = view.getByTestId("editor-input") as HTMLInputElement;
    input.focus();
    const onBlur = vi.fn();
    input.addEventListener("blur", onBlur);
    press(view.getByTestId("host-page"));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("ignores presses while a drag runs", () => {
    const { store, view } = setup((s) => s.set(createMessageDragAtom, DRAG));
    press(view.getByTestId("background"));
    expect(store.get(createMessageDragAtom)).not.toBeNull();
  });
});

describe("central Escape", () => {
  const escape = (target: Element | Document = document) =>
    act(() => {
      fireEvent.keyDown(target, { key: "Escape" });
    });

  it("closes the message menu and clears the message selection", () => {
    const { store } = setup((s) => {
      s.set(selectedMessageAtom, { start: 1, end: 2, token: 1 });
      s.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    });
    escape();
    expect(store.get(interactionAtom).kind).toBe("idle");
    expect(store.get(selectedMessageAtom)).toBeNull();
  });

  it("clears a selected message whose menu is already closed", () => {
    const { store } = setup((s) =>
      s.set(selectedMessageAtom, { start: 1, end: 2, token: 1 }),
    );
    escape();
    expect(store.get(selectedMessageAtom)).toBeNull();
  });

  it("closes the participant editor", () => {
    const { store } = setup(openEditor);
    escape();
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("closes a gap menu", () => {
    const { store } = setup((s) =>
      s.set(enterMenuAtom, { kind: "gapMenu", id: "g1" }),
    );
    escape();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("cancels a create-message drag and its participant selection", () => {
    const { store } = setup((s) => {
      s.set(selectedAtom, ["A"]);
      s.set(createMessageDragAtom, DRAG);
    });
    escape();
    expect(store.get(createMessageDragAtom)).toBeNull();
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("cancels a pending or running reorder", () => {
    const { store } = setup((s) => {
      s.set(messageReorderPendingAtom, { key: "1-2", startX: 0, startY: 0 });
      s.set(messageReorderDragAtom, "1-2");
      s.set(messageReorderDropAtom, { key: "3-4", place: "after" });
    });
    escape();
    expect(store.get(messageReorderPendingAtom)).toBeNull();
    expect(store.get(messageReorderDragAtom)).toBeNull();
    expect(store.get(messageReorderDropAtom)).toBeNull();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("leaves the state alone when an inner handler stopped the Escape", () => {
    const { store, view, onPickerKey } = setup(openEditor);
    escape(view.getByTestId("picker"));
    expect(onPickerKey).toHaveBeenCalledTimes(1);
    expect(store.get(selectedAtom)).toEqual(["A"]);
  });
});

describe("a derived state replaces a stored menu in the model (R1)", () => {
  it("drops the message menu when the participant editor opens", () => {
    const { store } = setup((s) =>
      s.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 }),
    );
    act(() => store.set(selectedAtom, ["A"]));
    expect(store.get(openMenuAtom)).toBeNull();
    act(() => store.set(selectedAtom, []));
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("drops a gap menu when a create drag starts", () => {
    const { store } = setup((s) =>
      s.set(enterMenuAtom, { kind: "gapMenu", id: "g1" }),
    );
    act(() => store.set(createMessageDragAtom, DRAG));
    expect(store.get(openMenuAtom)).toBeNull();
    act(() => store.set(createMessageDragAtom, null));
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("drops the message menu when a reorder press starts", () => {
    const { store } = setup((s) =>
      s.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 }),
    );
    act(() =>
      store.set(messageReorderPendingAtom, {
        key: "1-2",
        startX: 0,
        startY: 0,
      }),
    );
    expect(store.get(openMenuAtom)).toBeNull();
  });
});
