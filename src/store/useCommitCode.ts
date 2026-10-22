import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { codeAtom, onContentChangeAtom } from "./Store";

/**
 * Commit an edit: store the new DSL code, then tell the host once.
 * Every in-diagram edit goes through this; do not call `setCode` and
 * `onContentChange` by hand.
 */
export const useCommitCode = (): ((next: string) => void) => {
  const setCode = useSetAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  return useCallback(
    (next: string) => {
      setCode(next);
      onContentChange(next);
    },
    [setCode, onContentChange],
  );
};
