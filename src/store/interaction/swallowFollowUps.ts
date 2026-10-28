/**
 * A consumed press must not act through its follow-up events either:
 * `preventDefault` on `pointerdown` does not cancel `click` or `contextmenu`.
 * Swallow them until the press ends.
 */
export const swallowFollowUps = () => {
  const swallow = (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "click") cleanup();
  };
  const afterPointerUp = () => window.setTimeout(cleanup, 0);
  const cleanup = () => {
    document.removeEventListener("click", swallow, true);
    document.removeEventListener("contextmenu", swallow, true);
    window.removeEventListener("pointerup", afterPointerUp, true);
    window.removeEventListener("pointercancel", cleanup, true);
  };
  document.addEventListener("click", swallow, true);
  document.addEventListener("contextmenu", swallow, true);
  window.addEventListener("pointerup", afterPointerUp, {
    capture: true,
    once: true,
  });
  window.addEventListener("pointercancel", cleanup, {
    capture: true,
    once: true,
  });
};
