import { Provider, createStore } from "jotai";
import { render } from "@testing-library/react";
import { Return } from "./Return";
import {
  codeAtom,
  rootContextAtom,
  messagesVMByStartAtom,
  cursorAtom,
} from "@/store/Store";
import { offsetRangeOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import { _STARTER_ } from "@/parser/OrderedParticipants";

function renderReturn(code: string, cursor?: number | null) {
  const store = createStore();
  store.set(codeAtom, code);
  if (cursor !== undefined) store.set(cursorAtom, cursor);

  const stat = store.get(rootContextAtom)?.block().stat()[0];
  if (!stat) throw new Error("expected statement context");
  const retCtx = stat.ret?.();
  if (!retCtx) throw new Error("expected return context");
  const range = offsetRangeOf(retCtx);
  const vm = range ? store.get(messagesVMByStartAtom)[range[0]] : undefined;
  if (!vm) throw new Error("expected return view model");

  // Provide arrow data for VM to drive the component; keep simple values
  const vmWithArrow: MessageVM & {
    arrow: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
      originLayers?: number;
      sourceLayers?: number;
      targetLayers?: number;
    };
  } = {
    ...vm,
    type: OwnableMessageType.ReturnMessage,
    arrow: {
      translateX: 0,
      interactionWidth: 15,
      rightToLeft: false,
      originLayers: 0,
      sourceLayers: 0,
      targetLayers: 0,
    },
  };

  const utils = render(
    <Provider store={store}>
      <Return origin="" vm={vmWithArrow} />
    </Provider>,
  );

  return { ...utils, vm: vmWithArrow, range };
}

describe("Return (bare return statement)", () => {
  test("uses VM metadata and exposes attributes", () => {
    const { container, vm } = renderReturn("return x");
    const root = container.querySelector("div.interaction.return");
    expect(root).toBeTruthy();
    expect(root?.dataset?.signature).toBe(vm.signature);
    // Bare return uses starter for both source and target
    expect(root?.dataset?.from).toBe(_STARTER_);
    expect(root?.dataset?.to).toBe(_STARTER_);
    expect(root?.dataset?.type).toBe("return");
  });

  test("highlights when cursor is inside vm.range", () => {
    const { range, unmount: cleanupBase } = renderReturn("return x");
    cleanupBase();
    const start = range?.[0] ?? 0;
    const insideCursor = start;
    const { container: highlighted, unmount: cleanupInside } = renderReturn(
      "return x",
      insideCursor,
    );
    const highlightedRoot = highlighted.querySelector("div.interaction.return");
    expect(highlightedRoot?.classList.contains("highlight")).toBe(true);
    cleanupInside();

    const outsideCursor = (range?.[1] ?? insideCursor) + 1;
    const { container: notHighlighted } = renderReturn(
      "return x",
      outsideCursor,
    );
    const notHighlightedRoot = notHighlighted.querySelector(
      "div.interaction.return",
    );
    expect(notHighlightedRoot?.classList.contains("highlight")).toBe(false);
  });
});

describe("Return (async return form)", () => {
  function renderAsyncReturn(code = "@return A->B: ok") {
    const store = createStore();
    store.set(codeAtom, code);

    const stat = store.get(rootContextAtom)?.block().stat()[0];
    if (!stat) throw new Error("expected statement context");
    const retCtx = stat.ret?.();
    if (!retCtx) throw new Error("expected return context");
    const asyncCtx = retCtx.asyncMessage?.();
    if (!asyncCtx) throw new Error("expected asyncMessage in return");
    const asyncRange = offsetRangeOf(asyncCtx);
    const vm = asyncRange
      ? store.get(messagesVMByStartAtom)[asyncRange[0]]
      : undefined;
    if (!vm) throw new Error("expected view model for async return");

    const vmWithArrow: MessageVM & {
      arrow: {
        translateX: number;
        interactionWidth: number;
        rightToLeft: boolean;
        originLayers?: number;
        sourceLayers?: number;
        targetLayers?: number;
      };
    } = {
      ...vm,
      type: OwnableMessageType.ReturnMessage,
      arrow: {
        translateX: 0,
        interactionWidth: 100,
        rightToLeft: false,
        originLayers: 0,
        sourceLayers: 0,
        targetLayers: 0,
      },
    };

    const utils = render(
      <Provider store={store}>
        <Return origin="" vm={vmWithArrow} />
      </Provider>,
    );

    return { ...utils, vm: vmWithArrow };
  }

  test("uses async source/target and sets return type", () => {
    const { container } = renderAsyncReturn();
    const root = container.querySelector("div.interaction.return");
    expect(root).toBeTruthy();
    expect(root?.dataset?.from).toBe("A");
    expect(root?.dataset?.to).toBe("B");
    expect(root?.dataset?.type).toBe("return");
  });
});
