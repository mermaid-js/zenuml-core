export function waitUntil(
  condition: () => boolean,
  callback: () => void,
): void {
  if (condition()) {
    callback();
  } else {
    setTimeout(() => waitUntil(condition, callback), 100);
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), wait) as unknown as number;
  };
}
