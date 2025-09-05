import { useEffect, useState } from "react";
import { PARTICIPANT_HEIGHT } from "@/positioning/Constants";

type Params = {
  diagramEl: HTMLElement | null;
  participantTop: number; // offsetTop within the diagram
  stickyOffset: number; // header offset
  enabled: boolean;
};

export default function useStickyOffset({
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

    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      // For standard pages, we use CSS position:sticky, so this hook does nothing.
      return;
    }

    // Strategy: Iframe context (e.g., Confluence)
    // This logic only runs when inside an iframe.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const hiddenTop = Math.max(0, entry.intersectionRect.top - entry.boundingClientRect.top);
        // We use a 0.5px tolerance to avoid floating point issues.
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
  }, [diagramEl, participantTop, stickyOffset, enabled]);

  return y;
}

