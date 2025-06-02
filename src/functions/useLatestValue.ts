import { useEffect, useRef } from "react";

export function useLatestValue<T>(value: T) {
  const cache = useRef(value);

  useEffect(() => {
    cache.current = value;
  }, [value]);

  return cache;
}
