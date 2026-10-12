import { RootContext } from "@/parser";
import {
  codeAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  modeAtom,
  RenderMode,
} from "@/store/Store";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { Block } from "./Block";

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
  const message = containers[0].querySelector(".message") as Element;
  expect(message).toBeTruthy();

  // Dispatch directly on `.message` (not on the container with a `target`
  // override) — happy-dom cannot reassign a PointerEvent's read-only
  // `target`, and forcing it here hangs the whole suite.
  act(() => {
    fireEvent.pointerDown(message, { clientX: 0, clientY: 0 });
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
