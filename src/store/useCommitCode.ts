import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import {
  codeAtom,
  onContentChangeAtom,
  onEventEmitAtom,
  renderCodeAtom,
} from "./Store";
import { trackEvent, type TrackedEdit } from "./trackEvent";

/**
 * Commit an edit: store the new DSL code, then tell the host once.
 * Every in-diagram edit goes through this; do not call `setCode` and
 * `onContentChange` by hand.
 *
 * Pass `edit` when the commit completes a tracked user action; the host
 * then also gets one `onEventEmit("trackEvent", …)` (see `trackEvent.ts`).
 */
export const useCommitCode = (): ((
  next: string,
  edit?: TrackedEdit,
) => void) => {
  const setCode = useSetAtom(codeAtom);
  const setRenderCode = useSetAtom(renderCodeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const onEventEmit = useAtomValue(onEventEmitAtom);
  return useCallback(
    (next: string, edit?: TrackedEdit) => {
      setCode(next);
      // An in-diagram edit is raw text: the diagram draws it as is.
      setRenderCode(null);
      onContentChange(next);
      if (edit) trackEvent(onEventEmit, edit);
    },
    [setCode, setRenderCode, onContentChange, onEventEmit],
  );
};
