export function getElementDistanceToTop(element: HTMLElement) {
  let distanceToTop = 0;
  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    distanceToTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  }

  return distanceToTop;
}
