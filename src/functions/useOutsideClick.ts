import { useDocumentEvent } from "./useDocumentEvent";

export const useOutsideClick = (
  target: HTMLElement | null,
  handler: (event: MouseEvent) => void,
) => {
  useDocumentEvent(
    "click",
    (event) => {
      if (!target) return;
      if (!target.contains(event.target as Node)) {
        handler(event);
      }
    },
    {
      capture: true,
    },
  );
};
