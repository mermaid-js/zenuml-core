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

    const isInIframe = window.self !== window.top;

    // Strategy 1: Iframe context (e.g., Confluence)
    if (isInIframe) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // This is the crucial calculation.
          // It measures how many pixels of the diagram are hidden above the viewport.
          const hiddenTop = Math.max(0, entry.intersectionRect.top - entry.boundingClientRect.top);

          // When hiddenTop > 0, we are in "sticky mode".
          // The offset is the amount hidden, plus the desired sticky offset for the banner.
          // We use a 0.5px tolerance to avoid floating point issues where hiddenTop is a tiny non-zero number.
          const unclamped = hiddenTop > 0.5 ? hiddenTop + stickyOffset : 0;

          const max = (diagramEl?.clientHeight || 0) - PARTICIPANT_HEIGHT - 50;
          const next = Math.min(unclamped, max);
          setY(next);
        },
        { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
      );
      observer.observe(diagramEl);

      return () => {
        observer.disconnect();
      };
    }

    // Strategy 2: Standard page context
    const rootEl = scrollRoot || (diagramEl ? findScrollableAncestor(diagramEl) : null);

    const onTick = () => {
      const docEl = document.documentElement;
      const rootScrollTop = rootEl ? rootEl.scrollTop : docEl.scrollTop;
      const diagramTopAbs = getElementDistanceToTop(diagramEl);
      const rootTopAbs = rootEl ? getElementDistanceToTop(rootEl) : 0;

      const topNoOffset = rootScrollTop + externalShift;
      const base = diagramTopAbs - rootTopAbs + (participantTop || 0);
      const threshold = base + (stickyOffset || 0);
      const unclamped = topNoOffset - threshold;
      const max = (diagramEl?.clientHeight || 0) - PARTICIPANT_HEIGHT - 50;
      const next = Math.max(0, Math.min(unclamped, max));
      setY(next);
    };

    let raf = 0;
    let lastEvent = 0;
    const loop = () => {
      onTick();
      const now = performance.now();
      if (now - lastEvent < 150) {
        raf = requestAnimationFrame(loop);
      } else {
        setTimeout(() => onTick(), 0);
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

    schedule(); // Initial calculation

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scrollTarget.removeEventListener("scroll", schedule as any);
      if (rootEl) document.removeEventListener("scroll", schedule as any);
      ro.disconnect();
    };
  }, [scrollRoot, diagramEl, participantTop, stickyOffset, enabled, externalShift]);

  return y;
}

