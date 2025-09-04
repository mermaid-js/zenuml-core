import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { scrollRootAtom } from "@/store/Store";

const DETECTOR_COUNT = 10;
const INTERSECTION_ERROR_MARGIN = 1;
const SCROLLBAR_WIDTH = 20;

function initializeDetectors(rootEl: HTMLElement | null) {
  let detectorContainer = document.getElementById(
    "zenuml-intersection-detector-container",
  );
  let detectors = Array.from(
    document.getElementsByClassName("zenuml-intersection-detector"),
  );

  if (detectorContainer && detectors.length === DETECTOR_COUNT) {
    return { detectorContainer, detectors };
  }

  detectorContainer = document.createElement("div");
  detectorContainer.id = "zenuml-intersection-detector-container";

  Object.assign(detectorContainer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    opacity: "0",
    pointerEvents: "none",
  });

  detectors = new Array(DETECTOR_COUNT).fill(0).map(() => {
    const detector = document.createElement("div");
    detector.className = "zenuml-intersection-detector";
    Object.assign(detector.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
    });
    detectorContainer?.appendChild(detector);
    return detector;
  });
  if (rootEl) {
    rootEl.appendChild(detectorContainer);
  } else {
    document.body.appendChild(detectorContainer);
  }

  return { detectorContainer, detectors };
}

export default function useIntersectionTop() {
  const [top, setTop] = useState(0);
  const ob = useRef<IntersectionObserver | null>(null);
  const scrollRoot = useAtomValue(scrollRootAtom);

  useEffect(() => {
    const rootEl = scrollRoot;
    const { detectorContainer, detectors } = initializeDetectors(rootEl);

    const scrollHeight = (rootEl?.scrollHeight || document.documentElement.scrollHeight) - SCROLLBAR_WIDTH;
    const scrollWidth = (rootEl?.scrollWidth || document.documentElement.scrollWidth) - SCROLLBAR_WIDTH;
    detectorContainer.style.height = scrollHeight + "px";
    detectorContainer.style.width = scrollWidth + "px";
    const detectorHeight = Math.ceil(
      (rootEl?.scrollHeight || document.documentElement.scrollHeight) / DETECTOR_COUNT,
    );
    const threshold = [...Array(detectorHeight + 1).keys()]
      .map((i) => i / detectorHeight)
      .filter((i) => i >= 0 && i <= 1);
    detectors.forEach((detector, index) => {
      (detector as HTMLElement).style.top = index * detectorHeight + "px";
      (detector as HTMLElement).style.height = detectorHeight + "px";
    });
    ob.current = new IntersectionObserver(
      ([entry]) => {
        const isTopIntersection =
          entry.intersectionRect.top - entry.boundingClientRect.top >
            INTERSECTION_ERROR_MARGIN || entry.target === detectors[0];
        if (isTopIntersection) {
          setTop(entry.intersectionRect.top);
        }
      },
      {
        threshold,
        root: rootEl || null,
      },
    );
    detectors.forEach((detector) => {
      if (ob.current) {
        ob.current.observe(detector);
      }
    });
    return () => {
      ob.current?.disconnect();
    };
  }, [scrollRoot]);
  return top;
}
