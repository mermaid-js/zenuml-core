import { useDocumentEvent } from "./useDocumentEvent";

export const useOutsideClick = (
  target: HTMLElement | null,
  handler: (event: MouseEvent) => void,
) => {
  useDocumentEvent("click", (event) => {
    console.log(target, event.target);
    if (!target) return;
    if (!target.contains(event.target as Node)) {
      handler(event);
    }
  });
};
