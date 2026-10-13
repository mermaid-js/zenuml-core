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

  it("filled: clear button shown on focus-within", () => {
    const { main, view } = setup({ kind: "color", clearLabel: "Remove colour" });
    fireEvent.focus(main);
    expect(view.getByRole("button", { name: "Remove colour" })).toBeTruthy();
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
});
