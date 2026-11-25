/**
 * After a press is consumed, swallow its follow-up `click` and `contextmenu`
 * until the press ends: `preventDefault` on `pointerdown` cancels neither.
 *
 * Used by the interaction controller when it consumes a press (ADR 0002) and
 * by the message reorder handle, where a browser can retarget the click that
 * follows a drag to the message under the release point.
 *
 * Every listener is capture phase, so a handler that stops propagation
 * earlier in the path cannot leave the swallow installed. The swallow ends on
 * the first swallowed `click`, a tick after `pointerup`, or on
 * `pointercancel`. Returns the cleanup.
 */
export const swallowFollowUps = (): (() => void) => {
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
  return cleanup;
};
