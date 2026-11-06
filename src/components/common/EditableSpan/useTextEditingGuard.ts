import { useCallback, useRef } from "react";
import { useSetAtom } from "jotai";
import { activeTextEditorsAtom } from "@/store/Store";

export const useTextEditingGuard = () => {
  const token = useRef(Symbol("text editor"));
  const setEditors = useSetAtom(activeTextEditorsAtom);

  const onEditingChange = useCallback(
    (editing: boolean) => {
      setEditors((current) => {
        const next = new Set(current);
        if (editing) next.add(token.current);
        else next.delete(token.current);
        return next.size === current.size ? current : next;
      });
    },
    [setEditors],
  );

  return onEditingChange;
};
