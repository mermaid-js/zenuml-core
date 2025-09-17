import { Provider, createStore } from "jotai";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { Interaction } from "./Interaction";
import { StylePanel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel";
import {
  codeAtom,
  rootContextAtom,
  messagesVMByStartAtom,
} from "@/store/Store";
import { offsetRangeOf } from "@/parser/helpers";

function renderInteractionWithStylePanel(code: string) {
  const store = createStore();
  store.set(codeAtom, code);

  const stat = store.get(rootContextAtom)?.block().stat()[0];
  if (!stat) throw new Error("expected statement context");
  const ctx = stat.message?.();
  if (!ctx) throw new Error("expected message context");
  const range = offsetRangeOf(ctx);
  const vm = range ? store.get(messagesVMByStartAtom)[range[0]] : undefined;
  if (!vm) throw new Error("expected message view model");

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
      <StylePanel />
      <Interaction context={stat} origin="" vm={vmWithArrow as any} />
    </Provider>,
  );

  return { ...utils };
}

describe("StylePanel start offset parity for Interaction", () => {
  test("parity holds for sync message A->B.m1", async () => {
    const spyWarn = vi.spyOn(console, "warn");
    const spyLog = vi.spyOn(console, "log");
    const { container } = renderInteractionWithStylePanel("A->B.m1");
    const messageEl = container.querySelector(
      "div.interaction.sync .message",
    ) as HTMLElement;
    expect(messageEl).toBeTruthy();
    fireEvent.click(messageEl);

    await waitFor(() => {
      expect(spyWarn).not.toHaveBeenCalledWith(
        expect.stringContaining("[stylepanel] start offset mismatch"),
        expect.anything(),
      );
    });

    const anyParity = spyLog.mock.calls.some((args) =>
      String(args[0]).includes("[stylepanel] start offset parity ✓"),
    );
    expect(anyParity).toBe(true);

    spyWarn.mockRestore();
    spyLog.mockRestore();
  });
});

