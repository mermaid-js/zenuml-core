import { RootContext } from "@/parser";
import {
  activeTextEditorsAtom,
  codeAtom,
  createMessageDragAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  enableParticipantStyleEditingAtom,
  messageReorderPendingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { enterMenuAtom } from "@/store/interaction/interactionAtom";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { beforeEach, describe, expect, it } from "vitest";
import { Block } from "./Block";
import { InteractionController } from "@/store/interaction/InteractionController";

/**
 * Drag-to-reorder was the one editing surface in the rendering core gated by
 * NOTHING — no `enable*` flag, no respect for `RenderMode.Static`. A
 * render-only host (SVG export, a static embed) had its diagram silently
 * rewritten by an accidental drag. Gated by `enableMessageReorderAtom`
 * (default off, matching every other editing flag) and `RenderMode.Dynamic`.
 */
const CODE = "A\nB\nC\nA->B: first\nA->C: second";

const renderBlock = ({
  mode,
  enableMessageReorder,
}: {
  mode: RenderMode;
  enableMessageReorder: boolean;
}) => {
  const store = createStore();
  store.set(codeAtom, CODE);
  store.set(modeAtom, mode);
  store.set(enableMessageReorderAtom, enableMessageReorder);

  const root = RootContext(CODE);
  const statements = root?.block()?.stat?.() ?? [];

  const view = render(
    <Provider store={store}>
      <Block context={root?.block()} number="1" isRoot />
    </Provider>,
  );

  return { store, view, statements };
};

const dragFirstMessageOntoSecond = (view: ReturnType<typeof render>) => {
  const containers = view.container.querySelectorAll(".statement-container");
  expect(containers.length).toBeGreaterThanOrEqual(2);
  const [, second] = Array.from(containers);
  const handle = containers[0].querySelector(
    ".message-reorder-handle",
  ) as Element | null;
  const source = handle ?? containers[0].querySelector(".message");
  expect(source).toBeTruthy();

  // Dispatch directly on the handle (not on the container with a `target`
  // override) — happy-dom cannot reassign a PointerEvent's read-only
  // `target`, and forcing it here hangs the whole suite.
  act(() => {
    fireEvent.pointerDown(source!, { clientX: 0, clientY: 0 });
  });
  act(() => {
    fireEvent.pointerMove(window, { clientX: 0, clientY: 100 });
  });
  act(() => {
    fireEvent.pointerMove(second, { clientX: 0, clientY: 100 });
  });
  act(() => {
    fireEvent.pointerUp(window);
  });
};

describe("Block drag-to-reorder gating", () => {
  it("does not reorder when enableMessageReorder is off (current default)", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: false,
    });
    dragFirstMessageOntoSecond(view);
    expect(store.get(codeAtom)).toBe(CODE);
  });

  it("does not reorder in RenderMode.Static even when the flag is on", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Static,
      enableMessageReorder: true,
    });
    dragFirstMessageOntoSecond(view);
    expect(store.get(codeAtom)).toBe(CODE);
    expect(view.container.querySelector(".message-reorder-handle")).toBeNull();
  });

  it("reorders when explicitly enabled in RenderMode.Dynamic", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    dragFirstMessageOntoSecond(view);
    expect(store.get(codeAtom)).not.toBe(CODE);
  });
});

describe("Block drag-to-reorder interaction policy", () => {
  it("does not reorder while the participant editor is open", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    act(() => {
      store.set(enableParticipantStyleEditingAtom, true);
      store.set(selectedAtom, ["A"]);
    });
    expect(view.container.querySelector(".message-reorder-handle")).toBeNull();
    dragFirstMessageOntoSecond(view);
    expect(store.get(codeAtom)).toBe(CODE);
  });

  it("does not start a reorder while a create-message drag runs", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    const handle = view.container.querySelector(".message-reorder-handle");
    expect(handle).toBeTruthy();
    act(() => {
      store.set(createMessageDragAtom, {
        source: "A",
        sourceX: 0,
        sourceY: 0,
        pointerX: 0,
        pointerY: 0,
        hoverTarget: null,
        insertIndex: 0,
        blockContext: null,
      });
    });
    if (handle!.isConnected) {
      act(() => {
        fireEvent.pointerDown(handle!, { clientX: 0, clientY: 0 });
      });
    }
    expect(store.get(messageReorderPendingAtom)).toBeNull();
  });
});

describe("Block reorder while the message menu is open (P2)", () => {
  // An earlier spec's handle press arms MessageReorderHandle's one-shot
  // click suppressor (no click follows a synthetic press). Spend it.
  beforeEach(() => {
    document.body.click();
  });
  const selectFirstMessage = (
    store: ReturnType<typeof createStore>,
    view: ReturnType<typeof render>,
    openMenu: boolean,
  ) => {
    const first = view.container.querySelectorAll(".statement-container")[0];
    act(() => {
      fireEvent.click(first.querySelector(".message")!);
    });
    const selected = store.get(selectedMessageAtom);
    expect(selected).toBeTruthy();
    if (openMenu) {
      act(() => {
        store.set(enterMenuAtom, {
          kind: "messageMenu",
          start: selected!.start,
          end: selected!.end,
        });
      });
    }
  };

  const handles = (view: ReturnType<typeof render>) =>
    Array.from(view.container.querySelectorAll(".statement-container")).map(
      (row) => !!row.querySelector(".message-reorder-handle"),
    );

  it("offers the reorder handle only on the selected message", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    selectFirstMessage(store, view, true);
    expect(handles(view)).toEqual([true, false]);
  });

  it("keeps every reorder handle while the menu is closed", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    selectFirstMessage(store, view, false);
    expect(handles(view)).toEqual([true, true]);
  });
});

describe("Block insertion gaps", () => {
  const renderWithGaps = ({
    mode = RenderMode.Dynamic,
    enableGapHandles = true,
    enableMessageInsertion = true,
    isRoot = true,
    code = CODE,
  }: {
    mode?: RenderMode;
    enableGapHandles?: boolean;
    enableMessageInsertion?: boolean;
    isRoot?: boolean;
    code?: string;
  } = {}) => {
    const store = createStore();
    store.set(codeAtom, code);
    store.set(modeAtom, mode);
    store.set(enableMessageInsertionAtom, enableMessageInsertion);
    const root = RootContext(code);
    return render(
      <Provider store={store}>
        <Block
          context={root?.block()}
          enableGapHandles={enableGapHandles}
          isRoot={isRoot}
        />
      </Provider>,
    );
  };

  it("uses only header clearance before the first root statement", () => {
    const view = renderWithGaps();
    const gaps = view.container.querySelectorAll<HTMLElement>(
      '.block > [data-testid^="message-gap-"]',
    );
    expect(gaps).toHaveLength(3);
    expect(gaps[0].style.height).toBe("12px");
    expect(gaps[0].style.marginTop).toBe("");
    const firstHover = gaps[0].querySelector<HTMLElement>(
      '[data-testid="message-gap-hover-0"]',
    );
    expect(firstHover?.style.top).toBe("12px");
    expect(gaps[1].style.height).toBe("0px");
    expect(gaps[2].style.height).toBe("0px");
  });

  it("keeps the empty block gap at 48px", () => {
    const view = renderWithGaps({ code: "A\nB" });
    const gap = view.container.querySelector<HTMLElement>(
      '.block > [data-testid="message-gap-0"]',
    );
    expect(gap?.style.height).toBe("48px");
    expect(gap?.style.marginTop).toBe("");
  });

  it("leaves non-root gaps compact", () => {
    const view = renderWithGaps({ isRoot: false });
    const gaps = view.container.querySelectorAll<HTMLElement>(
      '.block > [data-testid^="message-gap-"]',
    );
    expect(gaps).toHaveLength(3);
    gaps.forEach((gap) => expect(gap.style.height).toBe("0px"));
  });

  it("does not render controls when gap handles are disabled or mode is static", () => {
    const disabled = renderWithGaps({ enableGapHandles: false });
    expect(
      disabled.container.querySelector('[data-testid^="message-gap-"]'),
    ).toBeNull();
    disabled.unmount();

    const staticView = renderWithGaps({ mode: RenderMode.Static });
    expect(
      staticView.container.querySelector('[data-testid^="message-gap-"]'),
    ).toBeNull();
    staticView.unmount();

    const featureOff = renderWithGaps({ enableMessageInsertion: false });
    expect(
      featureOff.container.querySelector('[data-testid^="message-gap-"]'),
    ).toBeNull();
  });
});

describe("Block reorder handle hover reveal (P4, hoverAffordance)", () => {
  beforeEach(() => {
    document.body.click();
  });

  // `data-hover-reveal="off"` switches off the CSS that shows a row's handle
  // while the row is hovered.
  const reveal = (view: ReturnType<typeof render>) =>
    Array.from(view.container.querySelectorAll(".statement-container")).map(
      (row) => row.getAttribute("data-hover-reveal") !== "off",
    );

  it("reveals every handle on hover when idle", () => {
    const { view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    expect(reveal(view)).toEqual([true, true]);
  });

  it("reveals only the moving message's handle while a reorder runs", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    const handle = view.container.querySelector(".message-reorder-handle")!;
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
    });
    expect(store.get(messageReorderPendingAtom)).not.toBeNull();
    expect(reveal(view)).toEqual([true, false]);
    act(() => {
      fireEvent.pointerUp(window);
    });
  });

  it("keeps the selected message's handle revealable while its menu is open", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    const first = view.container.querySelectorAll(".statement-container")[0];
    act(() => {
      fireEvent.click(first.querySelector(".message")!);
    });
    const selected = store.get(selectedMessageAtom)!;
    act(() => {
      store.set(enterMenuAtom, {
        kind: "messageMenu",
        start: selected.start,
        end: selected.end,
      });
    });
    expect(reveal(view)[0]).toBe(true);
  });

  it("ends a pending reorder when a text edit starts", () => {
    const { store, view } = renderBlock({
      mode: RenderMode.Dynamic,
      enableMessageReorder: true,
    });
    const handle = view.container.querySelector(".message-reorder-handle")!;
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
    });
    expect(store.get(messageReorderPendingAtom)).not.toBeNull();
    act(() => {
      store.set(activeTextEditorsAtom, new Set([Symbol("label")]));
    });
    expect(store.get(messageReorderPendingAtom)).toBeNull();
    act(() => {
      fireEvent.pointerUp(window);
    });
  });
});

describe("Block reorder and the central Escape (ADR 0002, P3)", () => {
  const renderWithController = () => {
    const store = createStore();
    store.set(codeAtom, CODE);
    store.set(modeAtom, RenderMode.Dynamic);
    store.set(enableMessageReorderAtom, true);
    const root = RootContext(CODE);
    const view = render(
      <Provider store={store}>
        <InteractionController />
        <Block context={root?.block()} number="1" isRoot />
      </Provider>,
    );
    return { store, view };
  };

  it("cancels a pending reorder on Escape", () => {
    const { store, view } = renderWithController();
    const handle = view.container.querySelector(".message-reorder-handle")!;
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
    });
    expect(store.get(messageReorderPendingAtom)).not.toBeNull();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(store.get(messageReorderPendingAtom)).toBeNull();
    act(() => {
      fireEvent.pointerUp(window);
    });
  });

  it("does not drop after Escape, even when the release comes before a re-render", () => {
    const { store, view } = renderWithController();
    const containers = view.container.querySelectorAll(".statement-container");
    const handle = containers[0].querySelector(".message-reorder-handle")!;
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0 });
    });
    act(() => {
      fireEvent.pointerMove(window, { clientX: 0, clientY: 100 });
    });
    act(() => {
      fireEvent.pointerMove(containers[1], { clientX: 0, clientY: 100 });
    });
    expect(
      view.container.querySelector('[data-reorder-state="dragging"]'),
    ).not.toBeNull();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.pointerUp(window);
    });
    expect(store.get(codeAtom)).toBe(CODE);
  });
});
