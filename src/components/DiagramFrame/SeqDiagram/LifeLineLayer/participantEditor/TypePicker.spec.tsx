import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { participantPreviewAtom } from "@/store/Store";
import { TypePicker } from "./TypePicker";

vi.mock("../../../Tutorial/LazyIcons", () => ({
  listIconKeys: async () => ["lambda", "awslambda", "lambdaedge", "s3", "ec2"],
}));
vi.mock("../../../Tutorial/AsyncIcon", () => ({
  AsyncIcon: ({ iconKey }: { iconKey: string }) => (
    <span data-icon={iconKey} />
  ),
}));

function setup(props: Partial<React.ComponentProps<typeof TypePicker>> = {}) {
  const store = createStore();
  const onPick = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <Provider store={store}>
      <TypePicker
        participantName="A"
        currentType={null}
        onPick={onPick}
        onClose={onClose}
        {...props}
      />
    </Provider>,
  );
  return { store, onPick, onClose, view };
}

const search = async (
  view: ReturnType<typeof render>,
  text: string,
): Promise<HTMLInputElement> => {
  const input = view.getByRole("combobox") as HTMLInputElement;
  // happy-dom lacks a native `input` event path for React's onChange: the
  // input must really be focused and a key event must follow the change.
  act(() => input.focus());
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyUp(input, { key: text.slice(-1) });
  await waitFor(() => view.getAllByRole("option"));
  return input;
};

afterEach(cleanup);

describe("TypePicker", () => {
  it("renders a labelled dialog with 6 archetype chips and no Default/None", () => {
    const { view } = setup();
    expect(view.getByRole("dialog").getAttribute("aria-label")).toBe(
      "Participant type",
    );
    const chips = view
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-pressed"));
    expect(chips).toHaveLength(6);
    expect(view.queryByText(/default|none/i)).toBeNull();
    expect(view.queryByLabelText(/default|none/i)).toBeNull();
  });

  it("marks the chip matching currentType (case-insensitive) as pressed", () => {
    const { view } = setup({ currentType: "database" });
    const pressed = view
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(1);
    expect(pressed[0].getAttribute("aria-label")).toBe("Database");
  });

  it("clicking a chip calls onPick with its key and clears the preview", () => {
    const { view, onPick, store } = setup();
    const chip = view.getByRole("button", { name: "Queue" });
    fireEvent.pointerEnter(chip);
    fireEvent.click(chip);
    expect(onPick).toHaveBeenCalledWith("Queue");
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("hovering a chip sets the preview; leaving the picker clears it", () => {
    const { view, store } = setup();
    fireEvent.pointerEnter(view.getByRole("button", { name: "Actor" }));
    expect(store.get(participantPreviewAtom)).toEqual({
      name: "A",
      type: "Actor",
    });
    fireEvent.pointerLeave(view.getByRole("dialog"));
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("unmounting clears the preview", () => {
    const { view, store } = setup();
    fireEvent.pointerEnter(view.getByRole("button", { name: "Entity" }));
    expect(store.get(participantPreviewAtom)).not.toBeNull();
    view.unmount();
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("search lists matches; hovering a result previews it; ArrowDown+Enter picks", async () => {
    const { view, onPick, store } = setup();
    const input = await search(view, "lambda");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(view.getByRole("listbox")).toBeTruthy();
    const options = view.getAllByRole("option");
    const second = options[1];
    fireEvent.pointerEnter(second);
    const key = second.textContent!.replace(/^@/, "");
    expect(store.get(participantPreviewAtom)).toEqual({ name: "A", type: key });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0][0]).toBe(key);
  });

  it("Escape with a query clears it and does not close", async () => {
    const { view, onClose } = setup();
    const input = await search(view, "lambda");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escape with an empty query closes the picker and stops at the picker", () => {
    const { view, onClose } = setup();
    const docListener = vi.fn();
    document.addEventListener("keydown", docListener);
    try {
      fireEvent.keyDown(view.getByRole("combobox"), { key: "Escape" });
    } finally {
      document.removeEventListener("keydown", docListener);
    }
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(docListener).not.toHaveBeenCalled();
  });

  it("other keys in the search box do not reach document listeners", () => {
    const { view } = setup();
    const docListener = vi.fn();
    document.addEventListener("keydown", docListener);
    try {
      fireEvent.keyDown(view.getByRole("combobox"), { key: "a" });
    } finally {
      document.removeEventListener("keydown", docListener);
    }
    expect(docListener).not.toHaveBeenCalled();
  });
});
