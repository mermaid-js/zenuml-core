import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { scrollRootAtom } from "@/store/Store";

export default function useDocumentScroll() {
  const scrollRoot = useAtomValue(scrollRootAtom);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // An internal tick to force rerender on outer (window) scroll when scrollRoot exists
  const [outerScrollTick, setOuterScrollTick] = useState(0);
  const updateScroll = () => {
    if (scrollRoot) {
      setScrollTop((scrollRoot as HTMLElement).scrollTop);
      setScrollLeft((scrollRoot as HTMLElement).scrollLeft);
    } else {
      setScrollTop(document.documentElement.scrollTop);
      setScrollLeft(document.documentElement.scrollLeft);
    }
  };
  useEffect(() => {
    updateScroll();
    const ab = new AbortController();
    const target: any = scrollRoot || document;
    // Listen to inner scrolls
    target.addEventListener("scroll", updateScroll, { signal: ab.signal });
    // Also listen to window scrolls when we have a custom scrollRoot so we can recompute
    // positions relative to viewport even if inner scrollTop remains unchanged.
    if (scrollRoot) {
      const onOuterScroll = () => setOuterScrollTick((t) => t + 1);
      document.addEventListener("scroll", onOuterScroll, { signal: ab.signal });
    }
    return () => {
      ab.abort();
    };
  }, [scrollRoot]);
  return [scrollTop, scrollLeft];
}
