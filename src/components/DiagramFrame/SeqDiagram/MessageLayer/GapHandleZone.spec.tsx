import { RootContext } from "@/parser";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  enableParticipantStyleEditingAtom,
  messageReorderDragAtom,
  messageReorderPendingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
} from "@/store/Store";
import {
  enterMenuAtom,
  interactionAtom,
} from "@/store/interaction/interactionAtom";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { Block } from "./Block/Block";

const CODE = "A\nB\nC\nA->B: first\nA->C: second";

const renderGaps = (
  setup?: (store: ReturnType<typeof createStore>) => void,
) => {
  const store = createStore();
  store.set(codeAtom, CODE);
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableMessageInsertionAtom, true);
  store.set(enableDividerInsertionAtom, true);
  store.set(enableParticipantStyleEditingAtom, true);
  store.set(diagramElementAtom, document.body);
  setup?.(store);
  const root = RootContext(CODE);
  const view = render(
    <Provider store={store}>
      <Block context={root?.block()} enableGapHandles isRoot />
    </Provider>,
  );
  return { store, view };
};

const hoverFirstGap = (view: ReturnType<typeof render>) => {
  const zone = view.getByTestId("message-gap-hover-1");
  act(() => {
    fireEvent.pointerEnter(zone, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(zone, { clientX: 0, clientY: 0 });
  });
  return zone;
};

const createHandle = (view: ReturnType<typeof render>) =>
  view.container.querySelector('[data-testid^="message-create-handle-1-"]');

describe("GapHandleZone interaction policy", () => {
  it("offers a create handle on hover when idle", () => {
    const { view } = renderGaps();
    hoverFirstGap(view);
    expect(createHandle(view)).toBeTruthy();
  });

  it("does not offer a create handle while the participant editor is open", () => {
    const { view } = renderGaps((store) => store.set(selectedAtom, ["A"]));
    hoverFirstGap(view);
    expect(createHandle(view)).toBeNull();
  });

  it("does not open the divider menu while the participant editor is open", () => {
    const { view } = renderGaps((store) => store.set(selectedAtom, ["A"]));
    const zone = hoverFirstGap(view);
    act(() => {
      fireEvent.contextMenu(zone);
    });
    expect(view.queryByTestId("gap-insert-menu-1")).toBeNull();
  });

  it("does not offer a create handle while a message reorder drag runs", () => {
    const { view } = renderGaps((store) =>
      store.set(messageReorderDragAtom, "1-2"),
    );
    hoverFirstGap(view);
    expect(createHandle(view)).toBeNull();
  });

  it("starts a create drag from the handle when idle", () => {
    const { store, view } = renderGaps();
    hoverFirstGap(view);
    act(() => {
      fireEvent.pointerDown(createHandle(view)!, { button: 0 });
    });
    expect(store.get(createMessageDragAtom)?.source).toBeTruthy();
  });

  it("does not start a create drag while a reorder press is pending", () => {
    const { store, view } = renderGaps();
    hoverFirstGap(view);
    const handle = createHandle(view);
    expect(handle).toBeTruthy();
    act(() => {
      store.set(messageReorderPendingAtom, {
        key: "1-2",
        startX: 0,
        startY: 0,
      });
    });
    if (handle?.isConnected) {
      act(() => {
        fireEvent.pointerDown(handle, { button: 0 });
      });
    }
    expect(store.get(createMessageDragAtom)).toBeNull();
  });
});

describe("GapHandleZone open menus (P2)", () => {
  const openGapMenu = (view: ReturnType<typeof render>, index: number) => {
    const zone = view.getByTestId(`message-gap-hover-${index}`);
    act(() => {
      fireEvent.contextMenu(zone);
    });
    return zone;
  };

  it("enters gapMenu when the divider menu opens and exits on Escape", () => {
    const { store, view } = renderGaps();
    const zone = openGapMenu(view, 1);
    expect(view.getByTestId("gap-insert-menu-1")).toBeTruthy();
    expect(store.get(interactionAtom).kind).toBe("gapMenu");
    act(() => {
      fireEvent.keyDown(zone, { key: "Escape" });
    });
    expect(!!view.queryByTestId("gap-insert-menu-1")).toBe(false);
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("does not offer another gap's create handle while a gap menu is open", () => {
    const { view } = renderGaps();
    openGapMenu(view, 1);
    const other = view.getByTestId("message-gap-hover-0");
    act(() => {
      fireEvent.pointerEnter(other, { clientX: 0, clientY: 0 });
      fireEvent.pointerMove(other, { clientX: 0, clientY: 0 });
    });
    expect(
      !!view.container.querySelector(
        '[data-testid^="message-create-handle-0-"]',
      ),
    ).toBe(false);
  });

  it("a right-click on another gap closes the open menu and opens that gap's", () => {
    const { store, view } = renderGaps();
    openGapMenu(view, 1);
    // Browser order: pointerdown (closes the open menu), then contextmenu.
    act(() => {
      fireEvent.pointerDown(view.getByTestId("message-gap-hover-0"));
    });
    openGapMenu(view, 0);
    expect(!!view.queryByTestId("gap-insert-menu-1")).toBe(false);
    expect(!!view.queryByTestId("gap-insert-menu-0")).toBe(true);
    expect(store.get(interactionAtom).kind).toBe("gapMenu");
  });

  it("does not open a second gap menu without the closing press", () => {
    const { view } = renderGaps();
    openGapMenu(view, 1);
    openGapMenu(view, 0);
    expect(!!view.queryByTestId("gap-insert-menu-0")).toBe(false);
    expect(!!view.queryByTestId("gap-insert-menu-1")).toBe(true);
  });

  it("still inserts a divider from the open menu", () => {
    const { store, view } = renderGaps();
    openGapMenu(view, 1);
    act(() => {
      fireEvent.click(view.getByTestId("divider-insert-1"));
    });
    expect(store.get(codeAtom)).toContain("==");
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("offers no create handle and no divider menu while the message menu is open", () => {
    const { store, view } = renderGaps();
    act(() => {
      store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    });
    const zone = hoverFirstGap(view);
    expect(!!createHandle(view)).toBe(false);
    act(() => {
      fireEvent.contextMenu(zone);
    });
    expect(!!view.queryByTestId("gap-insert-menu-1")).toBe(false);
  });
});
