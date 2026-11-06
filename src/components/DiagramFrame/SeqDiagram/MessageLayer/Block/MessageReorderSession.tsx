import { useMessageReorderDrag } from "./useMessageReorderDrag";

/** Renders nothing; mounts the reorder session once, from the root `Block`. */
export const MessageReorderSession = () => {
  useMessageReorderDrag();
  return null;
};
