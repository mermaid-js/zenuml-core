import { afterEach, describe, expect, it } from "vitest";
import { swallowFollowUps } from "./swallowFollowUps";

const dispatch = (type: string) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  document.body.dispatchEvent(event);
  return event;
};

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("swallowFollowUps", () => {
  let cleanup: (() => void) | undefined;
  afterEach(() => cleanup?.());

  it("cancels the follow-up click", () => {
    cleanup = swallowFollowUps();
    expect(dispatch("click").defaultPrevented).toBe(true);
  });

  it("cancels the follow-up contextmenu", () => {
    cleanup = swallowFollowUps();
    expect(dispatch("contextmenu").defaultPrevented).toBe(true);
  });

  it("stops other listeners from seeing the swallowed click", () => {
    let seen = false;
    const listener = () => (seen = true);
    document.body.addEventListener("click", listener);
    cleanup = swallowFollowUps();
    dispatch("click");
    document.body.removeEventListener("click", listener);
    expect(seen).toBe(false);
  });

  it("swallows only one click", () => {
    cleanup = swallowFollowUps();
    dispatch("click");
    expect(dispatch("click").defaultPrevented).toBe(false);
  });

  it("lets a click through a tick after pointerup", async () => {
    cleanup = swallowFollowUps();
    window.dispatchEvent(new Event("pointerup"));
    await tick();
    expect(dispatch("click").defaultPrevented).toBe(false);
    expect(dispatch("contextmenu").defaultPrevented).toBe(false);
  });

  it("cleans up on pointercancel", () => {
    cleanup = swallowFollowUps();
    window.dispatchEvent(new Event("pointercancel"));
    expect(dispatch("click").defaultPrevented).toBe(false);
  });

  it("cleans up on pointerup even when a handler stops it in the path", async () => {
    const stop = (event: Event) => event.stopPropagation();
    document.body.addEventListener("pointerup", stop);
    cleanup = swallowFollowUps();
    document.body.dispatchEvent(new Event("pointerup", { bubbles: true }));
    document.body.removeEventListener("pointerup", stop);
    await tick();
    expect(dispatch("click").defaultPrevented).toBe(false);
  });
});
