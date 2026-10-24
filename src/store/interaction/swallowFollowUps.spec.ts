import { afterEach, describe, expect, it } from "vitest";
import { swallowFollowUps } from "./swallowFollowUps";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const dispatch = (type: string) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true });
  document.body.dispatchEvent(event);
  return event;
};

const release = async (type: "pointerup" | "pointercancel") => {
  window.dispatchEvent(new Event(type));
  await tick();
};

describe("swallowFollowUps", () => {
  afterEach(async () => {
    // Make sure no listener leaks into the next test.
    await release("pointercancel");
  });

  it("cancels the follow-up click while the press is held", () => {
    swallowFollowUps();
    expect(dispatch("click").defaultPrevented).toBe(true);
  });

  it("swallows contextmenu by default", () => {
    swallowFollowUps();
    expect(dispatch("contextmenu").defaultPrevented).toBe(true);
  });

  it("leaves contextmenu alone when only click is requested", () => {
    swallowFollowUps(["click"]);
    expect(dispatch("contextmenu").defaultPrevented).toBe(false);
    expect(dispatch("click").defaultPrevented).toBe(true);
  });

  it("lets clicks through after pointerup plus a tick", async () => {
    swallowFollowUps();
    await release("pointerup");
    expect(dispatch("click").defaultPrevented).toBe(false);
    expect(dispatch("contextmenu").defaultPrevented).toBe(false);
  });

  it("cleans up on pointercancel", async () => {
    swallowFollowUps();
    await release("pointercancel");
    expect(dispatch("click").defaultPrevented).toBe(false);
    expect(dispatch("contextmenu").defaultPrevented).toBe(false);
  });

  it("only swallows one click", () => {
    swallowFollowUps();
    expect(dispatch("click").defaultPrevented).toBe(true);
    expect(dispatch("click").defaultPrevented).toBe(false);
  });

  it("cleans up even when a bubble-phase handler stops pointerup", async () => {
    const stop = (event: Event) => event.stopPropagation();
    document.body.addEventListener("pointerup", stop);
    try {
      swallowFollowUps();
      document.body.dispatchEvent(new Event("pointerup", { bubbles: true }));
      await tick();
      expect(dispatch("click").defaultPrevented).toBe(false);
    } finally {
      document.body.removeEventListener("pointerup", stop);
    }
  });
});
