import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { exitDurationMs, usePopoverPresence } from "./usePopoverPresence";

const originalGetComputedStyle = window.getComputedStyle;

function stubSnapDuration(value: string) {
  window.getComputedStyle = ((el: Element) => {
    const real = originalGetComputedStyle(el);
    return new Proxy(real, {
      get(target, prop) {
        if (prop === "getPropertyValue") {
          return (name: string) =>
            name === "--zu-dur-snap" ? value : target.getPropertyValue(name);
        }
        const v = Reflect.get(target, prop);
        return typeof v === "function" ? v.bind(target) : v;
      },
    });
  }) as typeof window.getComputedStyle;
}

afterEach(() => {
  window.getComputedStyle = originalGetComputedStyle;
});

describe("usePopoverPresence", () => {
  it("mounts with the enter class while open", () => {
    const { result } = renderHook(({ open }) => usePopoverPresence(open), {
      initialProps: { open: true },
    });
    expect(result.current.mounted).toBe(true);
    expect(result.current.state).toBe("enter");
    expect(result.current.className).toBe("zu-pop-enter");
  });

  it("unmounts at once when no exit duration resolves (jsdom, reduced motion)", () => {
    const { result, rerender } = renderHook(
      ({ open }) => usePopoverPresence(open),
      { initialProps: { open: true } },
    );
    const node = document.createElement("div");
    result.current.ref(node);
    rerender({ open: false });
    expect(result.current.mounted).toBe(false);
  });

  it("keeps the popover mounted with the exit class until animationend", () => {
    stubSnapDuration("120ms");
    const { result, rerender } = renderHook(
      ({ open }) => usePopoverPresence(open),
      { initialProps: { open: true } },
    );
    const node = document.createElement("div");
    document.body.append(node);
    result.current.ref(node);
    rerender({ open: false });
    expect(result.current.mounted).toBe(true);
    expect(result.current.state).toBe("exit");
    expect(result.current.className).toBe("zu-pop-exit");
    act(() => {
      node.dispatchEvent(new Event("animationend"));
    });
    expect(result.current.mounted).toBe(false);
    node.remove();
  });

  it("falls back to a timer when animationend never fires", async () => {
    // Real timers: bun's vitest shim has no fake timers. 10 ms + 50 ms backup.
    stubSnapDuration("0.01s");
    const { result, rerender } = renderHook(
      ({ open }) => usePopoverPresence(open),
      { initialProps: { open: true } },
    );
    const node = document.createElement("div");
    result.current.ref(node);
    rerender({ open: false });
    expect(result.current.mounted).toBe(true);
    await waitFor(() => expect(result.current.mounted).toBe(false), {
      timeout: 1000,
    });
  });

  it("re-enters cleanly when reopened during the exit", () => {
    stubSnapDuration("120ms");
    const { result, rerender } = renderHook(
      ({ open }) => usePopoverPresence(open),
      { initialProps: { open: true } },
    );
    const node = document.createElement("div");
    result.current.ref(node);
    rerender({ open: false });
    expect(result.current.state).toBe("exit");
    rerender({ open: true });
    expect(result.current.mounted).toBe(true);
    expect(result.current.state).toBe("enter");
  });

  it("parses ms and s values, and treats unknown as 0", () => {
    const node = document.createElement("div");
    stubSnapDuration("120ms");
    expect(exitDurationMs(node)).toBe(120);
    stubSnapDuration("0.12s");
    expect(exitDurationMs(node)).toBeCloseTo(120);
    stubSnapDuration("");
    expect(exitDurationMs(node)).toBe(0);
  });
});
