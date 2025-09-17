import { Provider, createStore } from "jotai";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { Return } from "./Return";
import { StylePanel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel";
import { codeAtom, rootContextAtom, messagesVMByStartAtom } from "@/store/Store";
import { offsetRangeOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";
import { OwnableMessageType } from "@/parser/OwnableMessage";

function renderReturnWithStylePanel(code: string) {
  const store = createStore();
  store.set(codeAtom, code);

  const stat = store.get(rootContextAtom)?.block().stat()[0];
  if (!stat) throw new Error("expected statement context");
  const retCtx = stat.ret?.();
  if (!retCtx) throw new Error("expected return context");
  const asyncCtx = retCtx.asyncMessage?.();
  const range = asyncCtx ? offsetRangeOf(asyncCtx) : offsetRangeOf(retCtx);
  const vm = range ? store.get(messagesVMByStartAtom)[range[0]] : undefined;
  if (!vm) throw new Error("expected return view model");

  const vmWithArrow: MessageVM & {
    arrow: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
    };
  } = {
    ...vm,
    type: OwnableMessageType.ReturnMessage,
    arrow: { translateX: 0, interactionWidth: 10, rightToLeft: false },
  };

  const utils = render(
    <Provider store={store}>
      <StylePanel />
      <Return context={stat} origin="" vm={vmWithArrow} />
    </Provider>,
  );

  return { ...utils };
}

describe("StylePanel start offset parity for Return", () => {
  test("opens style panel with new payload for '@return A->B: ok'", async () => {
    const { container, getByTestId } = renderReturnWithStylePanel("@return A->B: ok");
    const messageEl = container.querySelector(
      "div.interaction.return .message",
    ) as HTMLElement;
    expect(messageEl).toBeTruthy();
    fireEvent.click(messageEl);
    await waitFor(() => {
      expect(getByTestId("style-panel-toolbar")).toBeTruthy();
    });
  });
});
