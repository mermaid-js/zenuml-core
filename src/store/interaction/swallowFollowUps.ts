export type FollowUpEvent = "click" | "contextmenu";

/**
 * A consumed press must not act through its follow-up events either:
 * `preventDefault` on `pointerdown` does not cancel `click` or `contextmenu`.
 * Swallow them until the press ends.
 *
 * The `pointerup` / `pointercancel` listeners run in the capture phase on
 * `window`, so a handler that stops propagation further down the path cannot
 * leave the swallow listener installed.
 */
export const swallowFollowUps = (
  events: readonly FollowUpEvent[] = ["click", "contextmenu"],
) => {
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "click") cleanup();
  };
  const afterPointerUp = () => window.setTimeout(cleanup, 0);
  const cleanup = () => {
    for (const type of events) {
      document.removeEventListener(type, swallow, true);
    }
    window.removeEventListener("pointerup", afterPointerUp, true);
    window.removeEventListener("pointercancel", cleanup, true);
  };
  for (const type of events) {
    document.addEventListener(type, swallow, true);
  }
  window.addEventListener("pointerup", afterPointerUp, {
    capture: true,
    once: true,
  });
  window.addEventListener("pointercancel", cleanup, {
    capture: true,
    once: true,
  });
};
