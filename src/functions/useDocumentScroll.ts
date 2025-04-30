import { useEffect, useState } from "react";

export default function useDocumentScroll() {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const updateScroll = () => {
    setScrollTop(document.documentElement.scrollTop);
    setScrollLeft(document.documentElement.scrollLeft);
  };
  useEffect(() => {
    updateScroll();
    const ab = new AbortController();
    document.addEventListener("scroll", updateScroll, { signal: ab.signal });
    return () => {
      ab.abort();
    };
  }, []);
  return [scrollTop, scrollLeft];
}
