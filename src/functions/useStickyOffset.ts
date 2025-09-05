import { useEffect, useState } from "react";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";
import { findScrollableAncestor, getElementDistanceToTop } from "@/utils/dom";
import { useAtomValue } from "jotai";
import { externalViewportShiftAtom } from "@/store/Store";

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
  const externalShift = useAtomValue(externalViewportShiftAtom);

  useEffect(() => {
    if (!enabled || !diagramEl) {
      setY(0);
      return;
    }

    const rootEl = scrollRoot || (diagramEl ? findScrollableAncestor(diagramEl) : null);

    const onTick = () => {
      const docEl = document.documentElement;
      const rootScrollTop = rootEl ? rootEl.scrollTop : docEl.scrollTop;
      const diagramTopAbs = getElementDistanceToTop(diagramEl);
      const rootTopAbs = rootEl ? getElementDistanceToTop(rootEl) : 0;

      // Threshold where sticking begins: participant hits root top + sticky header
      const topNoOffset = rootScrollTop + externalShift;
      const base = diagramTopAbs - rootTopAbs + (participantTop || 0);
      const threshold = base + (stickyOffset || 0);
      const unclamped = topNoOffset - threshold;
      const max = (diagramEl?.clientHeight || 0) - PARTICIPANT_HEIGHT - 50;
      const next = Math.max(0, Math.min(unclamped, max));
      
      // Force update every time to ensure state consistency
      setY(next);
    };

    let raf = 0;
    let lastEvent = 0;
    const loop = () => {
      onTick();
      const now = performance.now();
      if (now - lastEvent < 150) { // Extended timeout to 150ms
        raf = requestAnimationFrame(loop);
      } else {
        // Ensure final calculation when loop stops
        setTimeout(() => onTick(), 0); // Use setTimeout to ensure it runs after current frame
        raf = 0;
      }
    };
    const schedule = () => {
      lastEvent = performance.now();
      if (!raf) {
        raf = requestAnimationFrame(loop);
      }
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
      if (raf) cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", schedule as any);
      if (rootEl) document.removeEventListener("scroll", schedule as any);
      ro.disconnect();
    };
  }, [scrollRoot, diagramEl, participantTop, stickyOffset, enabled]);

  return y;
}
