import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { scrollRootAtom } from "@/store/Store";

export default function useDocumentScroll() {
  const scrollRoot = useAtomValue(scrollRootAtom);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
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
    target.addEventListener("scroll", updateScroll, { signal: ab.signal });
    return () => {
      ab.abort();
    };
  }, [scrollRoot]);
  return [scrollTop, scrollLeft];
}
