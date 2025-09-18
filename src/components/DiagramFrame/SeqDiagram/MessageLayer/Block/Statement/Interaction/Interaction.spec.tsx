import { Provider, createStore } from "jotai";
import { render } from "@testing-library/react";
import { Interaction } from "./Interaction";
import {
  codeAtom,
  rootContextAtom,
  messagesVMByStartAtom,
  cursorAtom,
} from "@/store/Store";
import { offsetRangeOf } from "@/parser/helpers";
import { _STARTER_ } from "@/parser/OrderedParticipants";

function renderInteraction(code: string, cursor?: number | null) {
  const store = createStore();
  store.set(codeAtom, code);
  if (cursor !== undefined) {
    store.set(cursorAtom, cursor);
  }

  const stat = store.get(rootContextAtom)?.block().stat()[0];
  if (!stat) {
    throw new Error("expected statement context");
  }
  const messageCtx = stat.message?.();
  if (!messageCtx) {
    throw new Error("expected message context");
  }
  const range = offsetRangeOf(messageCtx);
  const vm = range ? store.get(messagesVMByStartAtom)[range[0]] : undefined;
  if (!vm) {
    throw new Error("expected message view model");
  }

  // Add arrow data to VM for the component
  const vmWithArrow = {
    ...vm,
    arrow: {
      translateX: 0,
      interactionWidth: 100,
      rightToLeft: false,
      originLayers: 0,
      sourceLayers: 0,
      targetLayers: 1,
    },
  };

  const utils = render(
    <Provider store={store}>
      <Interaction context={stat} origin="" vm={vmWithArrow} />
    </Provider>,
  );

  return { ...utils, vm: vmWithArrow, range };
}

describe("Interaction (sync message)", () => {
  test.each<string>(["A->B.m1", "B.m2"])("uses VM metadata for %s", (code) => {
    const { container, vm } = renderInteraction(code);
    const root = container.querySelector("div.interaction");
    expect(root?.dataset?.source).toBe(vm.from ?? _STARTER_);
    expect(root?.dataset?.target).toBe(vm.to ?? "");
    expect(root?.dataset?.signature).toBe(vm.signature);
  });

  test("highlights current message when cursor is inside range", () => {
    const { range, unmount: cleanupBase } = renderInteraction("A->B.m1");
    cleanupBase();
    const start = range?.[0] ?? 0;
    const insideCursor = start;
    const { container: highlighted, unmount: cleanupInside } = renderInteraction(
      "A->B.m1",
      insideCursor,
    );
    const highlightedRoot = highlighted.querySelector("div.interaction");
    expect(highlightedRoot?.classList.contains("highlight")).toBe(true);
    cleanupInside();

    const outsideCursor = (range?.[1] ?? insideCursor) + 1;
    const { container: notHighlighted, unmount: cleanupOutside } = renderInteraction(
      "A->B.m1",
      outsideCursor,
    );
    const notHighlightedRoot =
      notHighlighted.querySelector("div.interaction");
    expect(notHighlightedRoot?.classList.contains("highlight")).toBe(false);
    cleanupOutside();
  });
});
