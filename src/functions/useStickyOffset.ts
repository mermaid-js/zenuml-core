import { useEffect, useState } from "react";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import { getElementDistanceToTop } from "@/utils/dom";

type Params = {
  scrollRoot: HTMLElement | null;
  diagramEl: HTMLElement | null;
  participantTop: number; // offsetTop within the diagram
  stickyOffset: number; // header offset
  enabled: boolean;
};

export default function useStickyOffset({
  scrollRoot,
  diagramEl,
  participantTop,
  stickyOffset,
  enabled,
}: Params) {
  const [y, setY] = useState(0);

  useEffect(() => {
    if (!enabled || !diagramEl) {
      setY(0);
      return;
    }

    const rootEl = scrollRoot;

    const onTick = () => {
      const docEl = document.documentElement;
      const rootScrollTop = rootEl ? rootEl.scrollTop : docEl.scrollTop;
      const rootViewportShift = rootEl
        ? Math.max(0, -rootEl.getBoundingClientRect().top)
        : 0;
      const diagramTopAbs = getElementDistanceToTop(diagramEl);
      const rootTopAbs = rootEl ? getElementDistanceToTop(rootEl) : 0;

      const top = rootScrollTop + rootViewportShift + (stickyOffset || 0);
      const base = diagramTopAbs - rootTopAbs + (participantTop || 0);
      const unclamped = top - base;
      const max = (diagramEl?.clientHeight || 0) - PARTICIPANT_HEIGHT - 50;
      const next = Math.max(0, Math.min(unclamped, max));
      if (next !== y) setY(next);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onTick);
    };

    const scrollTarget: any = rootEl || document;
    scrollTarget.addEventListener("scroll", schedule, { passive: true });
    if (rootEl) {
      document.addEventListener("scroll", schedule, { passive: true });
    }

    const ro = new ResizeObserver(schedule);
    ro.observe(diagramEl);
    if (rootEl) ro.observe(rootEl);

    schedule();
    return () => {
      cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", schedule as any);
      if (rootEl) document.removeEventListener("scroll", schedule as any);
      ro.disconnect();
    };
  }, [scrollRoot, diagramEl, participantTop, stickyOffset, enabled]);

  return y;
}

