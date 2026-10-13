import { cleanup, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { participantPreviewAtom } from "@/store/Store";
import * as Color from "@/utils/Color";
import { participantTextColor } from "@/utils/Color";
import { ColorPicker } from "./ColorPicker";
import { PRESET_COLORS } from "./palette";

function setup(currentColor: string | null = "#1d4ed8") {
  const store = createStore();
  const onPick = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <Provider store={store}>
      <ColorPicker participantName="A" currentColor={currentColor} onPick={onPick} onClose={onClose} />
    </Provider>,
  );
  const hex = view.getByLabelText("Custom hex color") as HTMLInputElement;
  // happy-dom lacks native `input` support, so React's polyfill needs focusin first.
  fireEvent.focus(hex);
  return { store, onPick, onClose, view, hex };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ColorPicker", () => {
  it("is a 180px dialog with a 5-column grid of 10 swatches", () => {
    const { view } = setup();
    const dialog = view.getByRole("dialog", { name: "Participant colour" });
    expect(dialog.style.width).toBe("180px");
    const swatches = PRESET_COLORS.map((c) => view.getByRole("button", { name: c.name }));
    expect(swatches).toHaveLength(10);
    expect(swatches[0].parentElement!.style.gridTemplateColumns).toBe("repeat(5, 30px)");
  });

  it("derives each swatch text colour from participantTextColor", () => {
    const spy = vi.spyOn(Color, "participantTextColor");
    const { view } = setup();
    for (const c of PRESET_COLORS) {
      const btn = view.getByRole("button", { name: c.name });
      expect(btn.style.color).toBe(participantTextColor(c.hex));
      expect(btn.textContent).toBe("A");
    }
    expect(spy).toHaveBeenCalled();
  });

  it("marks only the current colour as pressed", () => {
    const { view } = setup("#1d4ed8");
    expect(view.getByRole("button", { name: "Deep blue" }).getAttribute("aria-pressed")).toBe("true");
    expect(view.getByRole("button", { name: "Rose" }).getAttribute("aria-pressed")).not.toBe("true");
  });

  it("hover sets the preview atom, leaving the grid clears it", () => {
    const { store, view } = setup();
    const rose = view.getByRole("button", { name: "Rose" });
    fireEvent.pointerEnter(rose);
    expect(store.get(participantPreviewAtom)).toEqual({ name: "A", color: "#fda4af" });
    fireEvent.pointerLeave(rose.parentElement!);
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("unmount clears the preview", () => {
    const { store, view } = setup();
    fireEvent.pointerEnter(view.getByRole("button", { name: "Rose" }));
    view.unmount();
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("click picks the colour and clears the preview", () => {
    const { store, onPick, view } = setup();
    const amber = view.getByRole("button", { name: "Amber" });
    fireEvent.pointerEnter(amber);
    fireEvent.click(amber);
    expect(onPick).toHaveBeenCalledWith("#fcd34d");
    expect(store.get(participantPreviewAtom)).toBeNull();
  });

  it("hex field shows the current colour without #", () => {
    expect(setup("#1d4ed8").hex.value).toBe("1d4ed8");
    cleanup();
    expect(setup(null).hex.value).toBe("");
  });

  it("valid hex commits lowercased on Enter and on blur", () => {
    const { hex, onPick } = setup();
    fireEvent.change(hex, { target: { value: "#ABCDEF" } });
    fireEvent.keyDown(hex, { key: "Enter" });
    expect(onPick).toHaveBeenLastCalledWith("#abcdef");
    fireEvent.change(hex, { target: { value: "123ABC" } });
    fireEvent.blur(hex);
    expect(onPick).toHaveBeenLastCalledWith("#123abc");
  });

  it("invalid hex resets to the current colour without picking", () => {
    const { hex, onPick } = setup();
    fireEvent.change(hex, { target: { value: "xyz" } });
    fireEvent.keyDown(hex, { key: "Enter" });
    expect(onPick).not.toHaveBeenCalled();
    expect(hex.value).toBe("1d4ed8");
  });

  it("same hex does not call onPick", () => {
    const { hex, onPick } = setup();
    fireEvent.change(hex, { target: { value: "#1D4ED8" } });
    fireEvent.blur(hex);
    expect(onPick).not.toHaveBeenCalled();
  });

  it("hex field keys do not reach document listeners", () => {
    const { hex } = setup();
    const doc = vi.fn();
    document.addEventListener("keydown", doc);
    fireEvent.keyDown(hex, { key: "a" });
    document.removeEventListener("keydown", doc);
    expect(doc).not.toHaveBeenCalled();
  });

  it("Escape closes the picker and does not propagate", () => {
    const { view, onClose } = setup();
    const doc = vi.fn();
    document.addEventListener("keydown", doc);
    fireEvent.keyDown(view.getByRole("button", { name: "Rose" }), { key: "Escape" });
    fireEvent.keyDown(view.getByLabelText("Custom hex color"), { key: "Escape" });
    document.removeEventListener("keydown", doc);
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(doc).not.toHaveBeenCalled();
  });
});
