import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { diagramFrameElementAtom } from "@/store/Store";

type Params = {
  participantTop: number; // offsetTop within the diagram
  stickyOffset: number; // header offset
};

export default function useStickyOffset({
  participantTop,
  stickyOffset,
}: Params) {
  const diagramFrameEl = useAtomValue(diagramFrameElementAtom);
  const [y, setY] = useState(0);

  useEffect(() => {

    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      // For standard pages, we use CSS position:sticky, so this hook does nothing.
      return;
    }

    if (!diagramFrameEl) {
      // Element not ready yet, will retry when diagramFrameEl changes
      return;
    }

    // Strategy: Iframe context (e.g., Confluence)
    // Observe the diagram frame element to detect scroll changes
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Calculate how much of the diagram frame is hidden above viewport
        const frameOutOfViewPort = Math.max(0, entry.intersectionRect.top - entry.boundingClientRect.top);
        
        // Check if this specific participant should be sticky
        // Participant should stick when the scroll has reached its position
        if (frameOutOfViewPort >= participantTop) {
          // This participant's position has been scrolled past - apply sticky
          // Account for the distance from frame edge to participant position
          const FRAME_PADDING_TO_PARTICIPANT = 40; // Distance from DiagramFrame edge to participant top
          const offset = frameOutOfViewPort - participantTop + stickyOffset - FRAME_PADDING_TO_PARTICIPANT;
          setY(Math.max(0, offset));
        } else {
          // This participant hasn't been reached yet
          setY(0);
        }
      },
      { 
        threshold: Array.from({ length: 101 }, (_, i) => i / 200)
      }
    );
    
    observer.observe(diagramFrameEl);

    return () => {
      observer.disconnect();
    };
  }, [diagramFrameEl, participantTop, stickyOffset]);

  return y;
}
