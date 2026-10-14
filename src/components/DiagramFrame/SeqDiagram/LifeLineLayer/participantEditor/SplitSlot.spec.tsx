import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitSlot } from "./SplitSlot";

function setup(props: Partial<React.ComponentProps<typeof SplitSlot>> = {}) {
  const onOpen = vi.fn();
  const onClear = vi.fn();
  const view = render(
    <SplitSlot
      kind="icon"
      filled
      label="Set icon (Database)"
      clearLabel="Remove type"
      onOpen={onOpen}
      onClear={onClear}
      {...props}
    >
      <span>ico</span>
    </SplitSlot>,
  );
  return { onOpen, onClear, view, main: view.getByRole("button", { name: /Set icon/ }) };
}

afterEach(cleanup);

describe("SplitSlot", () => {
  it("empty: renders one dashed button and no clear button", () => {
    const { main, view } = setup({ filled: false });
    expect(view.getAllByRole("button")).toHaveLength(1);
    expect(main.className).toContain("border-dashed");
    fireEvent.mouseEnter(main.parentElement!);
    expect(view.queryByRole("button", { name: "Remove type" })).toBeNull();
  });

  it("filled: clear button hidden until hover", () => {
    const { main, view } = setup();
    expect(view.queryByRole("button", { name: "Remove type" })).toBeNull();
    fireEvent.mouseEnter(main.parentElement!);
    const clear = view.getByRole("button", { name: "Remove type" });
    expect(clear.getAttribute("title")).toBe("Remove type ⌫");
    fireEvent.mouseLeave(main.parentElement!);
    expect(view.queryByRole("button", { name: "Remove type" })).toBeNull();
  });

  it("filled: clear button shown on keyboard focus-within", () => {
    // jsdom does not implement :focus-visible; pretend focus came from the keyboard.
    const orig = Element.prototype.matches;
    Element.prototype.matches = function (this: Element, sel: string) {
      return sel === ":focus-visible" ? true : orig.call(this, sel);
    };
    try {
      const { main, view } = setup({ kind: "color", clearLabel: "Remove colour" });
      fireEvent.focus(main);
      expect(view.getByRole("button", { name: "Remove colour" })).toBeTruthy();
    } finally {
      Element.prototype.matches = orig;
    }
  });

  it.each(["Delete", "Backspace"])("%s on focused main calls onClear", (key) => {
    const { main, onClear, onOpen } = setup();
    fireEvent.keyDown(main, { key });
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("empty: Delete does nothing", () => {
    const { main, onClear } = setup({ filled: false });
    fireEvent.keyDown(main, { key: "Delete" });
    expect(onClear).not.toHaveBeenCalled();
  });

  it("click main calls onOpen, not onClear", () => {
    const { main, onOpen, onClear } = setup();
    fireEvent.click(main);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClear).not.toHaveBeenCalled();
  });

  it("click x calls onClear, not onOpen", () => {
    const { main, view, onOpen, onClear } = setup();
    fireEvent.mouseEnter(main.parentElement!);
    fireEvent.click(view.getByRole("button", { name: "Remove type" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("sets aria-expanded from expanded", () => {
    const { main } = setup({ expanded: true });
    expect(main.getAttribute("aria-expanded")).toBe("true");
  });

  it("filled + hovered: one wrapper forms the pill, halves have no own border/rounding", () => {
    for (const kind of ["icon", "color"] as const) {
      const { main, view } = setup({ kind, clearLabel: "Remove type" });
      const wrapper = main.parentElement!;
      fireEvent.mouseEnter(wrapper);
      const cls = wrapper.className.split(/\s+/);
      expect(cls).toContain("rounded-md");
      expect(cls).toContain("overflow-hidden");
      expect(cls).toContain("border");
      expect(cls).toContain("border-gray-300");
      const clear = view.getByRole("button", { name: "Remove type" });
      for (const b of [main, clear]) {
        const own = b.className.split(/\s+/);
        expect(own.filter((c) => /^rounded/.test(c) && c !== "rounded-none")).toEqual([]);
        expect(own).not.toContain("border");
        expect(own).not.toContain("border-gray-300");
      }
      expect(clear.className).toContain("bg-red-100");
      expect(clear.className).toContain("hover:bg-red-200");
      cleanup();
    }
  });

  it("not hovered: wrapper does not carry the pill border", () => {
    const { main } = setup();
    expect(main.parentElement!.className.split(/\s+/)).not.toContain("border");
    expect(main.className).toContain("rounded-md");
  });

  it("expanded adds ring-1 ring-sky-500 to main; collapsed does not", () => {
    const a = setup({ expanded: true });
    expect(a.main.className).toContain("ring-1");
    expect(a.main.className).toContain("ring-sky-500");
    cleanup();
    const b = setup({ expanded: false });
    expect(b.main.className.split(/\s+/)).not.toContain("ring-1");
    expect(b.main.className.split(/\s+/)).not.toContain("ring-sky-500");
  });

  it("split: both inner buttons are rounded-none (beats global button radius)", () => {
    const { main, view } = setup();
    fireEvent.mouseEnter(main.parentElement!);
    const clear = view.getByRole("button", { name: "Remove type" });
    expect(main.className.split(/\s+/)).toContain("rounded-none");
    expect(clear.className.split(/\s+/)).toContain("rounded-none");
  });

  it("expanded + split: the whole pill is outlined, not one half", () => {
    const a = setup({ expanded: true });
    const wrap = a.main.parentElement!;
    fireEvent.mouseEnter(wrap);
    const mainCls = a.main.className.split(/\s+/);
    expect(mainCls).not.toContain("ring-1");
    expect(mainCls).not.toContain("ring-inset");
    const wrapCls = wrap.className.split(/\s+/);
    expect(wrapCls).toContain("border-sky-500");
    expect(wrapCls).not.toContain("border-gray-300");
  });

  it("split but not expanded: pill keeps the grey border", () => {
    const { main } = setup();
    fireEvent.mouseEnter(main.parentElement!);
    expect(main.parentElement!.className.split(/\s+/)).toContain("border-gray-300");
  });

  it("split: child span fills the half edge to edge", () => {
    const { main } = setup({ kind: "color" });
    expect(main.className).not.toContain("[&>span]:rounded-none");
    fireEvent.mouseEnter(main.parentElement!);
    expect(main.className).toContain("[&>span]:rounded-none");
    expect(main.className).toContain("[&>span]:border-0");
  });

  it("mouse (non focus-visible) focus does not split; keyboard focus does", () => {
    const orig = Element.prototype.matches;
    let visible = false;
    Element.prototype.matches = function (this: Element, sel: string) {
      return sel === ":focus-visible" ? visible : orig.call(this, sel);
    };
    try {
      const { main, view } = setup({ kind: "color", clearLabel: "Remove colour" });
      fireEvent.focus(main);
      expect(view.queryByRole("button", { name: "Remove colour" })).toBeNull();
      fireEvent.blur(main);
      visible = true;
      fireEvent.focus(main);
      expect(view.getByRole("button", { name: "Remove colour" })).toBeTruthy();
    } finally {
      Element.prototype.matches = orig;
    }
  });

  it("split: ring is on the wrapper, inner buttons drop their own focus ring", () => {
    const { main, view } = setup();
    expect(main.className).toContain("focus-visible:ring-2");
    expect(main.parentElement!.className).not.toContain("has-[:focus-visible]:ring-2");
    fireEvent.mouseEnter(main.parentElement!);
    const wrapper = main.parentElement!.className.split(/\s+/);
    expect(wrapper).toContain("has-[:focus-visible]:ring-2");
    expect(wrapper).toContain("has-[:focus-visible]:ring-sky-300");
    const clear = view.getByRole("button", { name: "Remove type" });
    for (const b of [main, clear]) {
      expect(b.className).not.toContain("focus-visible:ring-2");
    }
  });
  it("any focus (incl. mouse-path :focus) drops the native outline on both halves", () => {
    // Host pages style `button:focus { outline: ... }`; the wrapper's
    // overflow-hidden would clip that outline into a partial ring.
    const { main, view } = setup();
    expect(main.className).toContain("focus:outline-none");
    fireEvent.mouseEnter(main.parentElement!);
    const clear = view.getByRole("button", { name: "Remove type" });
    expect(clear.className).toContain("focus:outline-none");
  });
});
