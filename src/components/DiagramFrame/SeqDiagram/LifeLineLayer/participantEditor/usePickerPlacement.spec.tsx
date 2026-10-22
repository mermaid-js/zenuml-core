import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  usePickerPlacement,
  type Anchor,
  type Picker,
} from "./usePickerPlacement";

type Props = { anchor: Anchor | null; openPicker: Picker | null };

const ANCHOR: Anchor = { top: 100, left: 300, right: 400, bottom: 140 };

const setup = (initialProps: Props) =>
  renderHook(
    ({ anchor, openPicker }: Props) => usePickerPlacement(anchor, openPicker),
    { initialProps },
  );

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
};

// A picker root whose rendered size is `width` x `height`.
const pickerOfSize = (width: number, height: number) => {
  const el = document.createElement("div");
  el.getBoundingClientRect = () =>
    ({
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
    }) as DOMRect;
  return el;
};

afterEach(() => {
  setViewport(originalInnerWidth, originalInnerHeight);
  document.body.innerHTML = "";
});

describe("usePickerPlacement", () => {
  it("has no position while no picker is open", () => {
    const { result } = setup({ anchor: ANCHOR, openPicker: null });
    expect(result.current.pickerPos).toBeNull();
    expect(result.current.typePresence.mounted).toBe(false);
    expect(result.current.colorPresence.mounted).toBe(false);
  });

  it("has no position without an anchor", () => {
    const { result } = setup({ anchor: null, openPicker: "type" });
    expect(result.current.pickerPos).toBeNull();
  });

  it("opens the type picker below the box, right-aligned with it", () => {
    setViewport(1200, 800);
    const { result } = setup({ anchor: ANCHOR, openPicker: "type" });
    expect(result.current.typePresence.mounted).toBe(true);
    expect(result.current.pickerPos).toEqual({ top: 142, left: 180 });
  });

  it("opens the colour picker just left of the colour slot", () => {
    setViewport(1200, 800);
    const { result } = setup({ anchor: ANCHOR, openPicker: "color" });
    expect(result.current.colorPresence.mounted).toBe(true);
    expect(result.current.pickerPos).toEqual({ top: 142, left: 356 });
  });

  it("drops the position once the picker closes and unmounts", () => {
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: "type" });
    rerender({ anchor: ANCHOR, openPicker: null });
    // jsdom resolves no exit duration, so the picker unmounts at once.
    expect(result.current.typePresence.mounted).toBe(false);
    expect(result.current.pickerPos).toBeNull();
  });

  it("clamps an overflowing picker into the viewport", () => {
    setViewport(500, 800);
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: null });
    result.current.pickerRef.current = pickerOfSize(220, 100);
    rerender({ anchor: ANCHOR, openPicker: "color" });
    // 356 + 220 overflows 500 - 8: pulled back to 500 - 220 - 8.
    expect(result.current.pickerPos).toEqual({ top: 142, left: 272 });
  });

  it("keeps the picker off the left edge", () => {
    setViewport(1200, 800);
    const anchor = { top: 100, left: 0, right: 60, bottom: 140 };
    const { result, rerender } = setup({ anchor, openPicker: null });
    result.current.pickerRef.current = pickerOfSize(220, 100);
    rerender({ anchor, openPicker: "type" });
    expect(result.current.pickerPos).toEqual({ top: 142, left: 8 });
  });

  it("flips the picker above the participant when it overflows the bottom", () => {
    setViewport(1200, 300);
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: null });
    result.current.pickerRef.current = pickerOfSize(220, 200);
    rerender({ anchor: ANCHOR, openPicker: "type" });
    // 142 + 200 > 300 - 8: flip to 100 - 200 - 8.
    expect(result.current.pickerPos).toEqual({ top: -108, left: 180 });
  });

  it("focuses the pressed item of a newly opened picker, else its first button", () => {
    setViewport(1200, 800);
    const root = pickerOfSize(220, 100);
    root.innerHTML =
      '<button id="first"></button><button id="pressed" aria-pressed="true"></button>';
    document.body.appendChild(root);
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: null });
    result.current.pickerRef.current = root;
    rerender({ anchor: ANCHOR, openPicker: "type" });
    expect(document.activeElement?.id).toBe("pressed");

    root.querySelector("#pressed")!.removeAttribute("aria-pressed");
    rerender({ anchor: ANCHOR, openPicker: "color" });
    expect(document.activeElement?.id).toBe("first");
  });

  it("does not steal focus back while the same picker stays open", () => {
    setViewport(1200, 800);
    const root = pickerOfSize(220, 100);
    root.innerHTML = '<button id="first"></button>';
    document.body.appendChild(root);
    const elsewhere = document.createElement("input");
    document.body.appendChild(elsewhere);
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: null });
    result.current.pickerRef.current = root;
    rerender({ anchor: ANCHOR, openPicker: "type" });
    expect(document.activeElement?.id).toBe("first");
    elsewhere.focus();
    // A moved anchor repositions the picker without refocusing it.
    rerender({ anchor: { ...ANCHOR, top: 120 }, openPicker: "type" });
    expect(document.activeElement).toBe(elsewhere);
  });

  it("measures the name row once it attaches", () => {
    const { result } = setup({ anchor: ANCHOR, openPicker: null });
    expect(result.current.nameRowWidth).toBe(0);
    const row = document.createElement("div");
    Object.defineProperty(row, "offsetWidth", {
      configurable: true,
      value: 236,
    });
    act(() => result.current.attachNameRow(row));
    expect(result.current.nameRowWidth).toBe(236);
  });

  it("keeps a stable attachNameRow across renders", () => {
    const { result, rerender } = setup({ anchor: ANCHOR, openPicker: null });
    const first = result.current.attachNameRow;
    rerender({ anchor: ANCHOR, openPicker: "type" });
    expect(result.current.attachNameRow).toBe(first);
  });
});
