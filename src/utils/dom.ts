export function getElementDistanceToTop(element: HTMLElement) {
  let distanceToTop = 0;
  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    distanceToTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  }

  return distanceToTop;
}

export function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const overflow = style.overflow;
  const canScrollY = overflowY === 'auto' || overflowY === 'scroll';
  const canScroll = overflow === 'auto' || overflow === 'scroll' || canScrollY;
  return canScroll && el.scrollHeight > el.clientHeight;
}

export function findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    if (isScrollable(node)) return node;
    node = node.parentElement as HTMLElement;
  }
  return null;
}
