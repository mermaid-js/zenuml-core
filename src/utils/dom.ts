export function getElementDistanceToTop(element: HTMLElement) {
  var distanceToTop = 0;
  var currentElement: HTMLElement | null = element;

  while (currentElement) {
    distanceToTop += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  }

  return distanceToTop;
}
