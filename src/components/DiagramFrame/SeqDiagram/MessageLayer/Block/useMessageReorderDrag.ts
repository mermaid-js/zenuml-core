import { useEffect, useRef } from "react";
import { useAtom, useAtomValue, useStore } from "jotai";
import {
  codeAtom,
  diagramElementAtom,
  enableMessageReorderAtom,
  messageReorderDragAtom,
  messageReorderDropAtom,
  messageReorderPendingAtom,
  onContentChangeAtom,
} from "@/store/Store";
import { reorderMessageInDsl } from "@/utils/messageReorderTransform";
import { useCan } from "@/store/interaction/useCan";
import { parseStatementKey } from "@/positioning/vertical/StatementIdentifier";

const DRAG_THRESHOLD = 4;

/**
 * The statement row under the pointer and which half of it the pointer is in.
 * Touch implicitly captures pointer events on the handle, so `event.target`
 * stays on that handle even while the finger crosses another message; touch
 * therefore hit-tests with `elementFromPoint` and must land inside the diagram.
 */
export const rowUnderPointer = (
  event: PointerEvent,
  diagramElement: HTMLElement | null | undefined,
): { key: string; place: "before" | "after" } | null => {
  const hit =
    event.pointerType === "touch"
      ? document.elementFromPoint(event.clientX, event.clientY)
      : (event.target as Element | null);
  const target =
    event.pointerType === "touch" && !diagramElement?.contains(hit)
      ? null
      : hit;
  const row = target?.closest?.(
    ".statement-container[data-statement-key]",
  ) as HTMLElement | null;
  const key = row?.getAttribute("data-statement-key");
  if (!row || !key) {
    return null;
  }
  const rect = row.getBoundingClientRect();
  return {
    key,
    place: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
  };
};

/**
 * The message drag-to-reorder session. Call it once, from the root `Block`;
 * it owns the body cursor, the window pointer listeners and the DSL rewrite.
 */
export const useMessageReorderDrag = () => {
  const store = useStore();
  const [code, setCode] = useAtom(codeAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const [dragKey, setDragKey] = useAtom(messageReorderDragAtom);
  const dragKeyRef = useRef<string | null>(null);
  const [pendingDrag, setPendingDrag] = useAtom(messageReorderPendingAtom);
  const [dropState, setDropState] = useAtom(messageReorderDropAtom);
  const enableMessageReorder = useAtomValue(enableMessageReorderAtom);
  const canReorder = useCan("reorder");
  // Unlike every other editing surface, this drag used to run with no
  // `enable*` flag and no respect for `RenderMode.Static` — a render-only
  // host (SVG export, a static embed) could have its diagram silently
  // rewritten by an accidental drag. `reorder` also covers the mode, text
  // editing and any other interaction that owns the diagram (ADR 0002).
  const reorderEnabled = enableMessageReorder && canReorder;

  // A reorder that loses its capability (a text edit started) ends. While a
  // reorder runs, `reorder` is allowed unless a text edit overlays it.
  useEffect(() => {
    if (canReorder) return;
    setPendingDrag(null);
    setDragKey(null);
    setDropState(null);
  }, [canReorder, setDragKey, setDropState, setPendingDrag]);

  useEffect(() => {
    dragKeyRef.current = dragKey;
  }, [dragKey]);

  useEffect(() => {
    if (!pendingDrag && !dragKey) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";

    return () => {
      document.body.style.cursor = previousCursor;
    };
  }, [dragKey, pendingDrag]);

  useEffect(() => {
    if (!reorderEnabled) {
      return;
    }
    if (!pendingDrag || dragKey) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const deltaX = Math.abs(event.clientX - pendingDrag.startX);
      const deltaY = Math.abs(event.clientY - pendingDrag.startY);
      if (Math.max(deltaX, deltaY) < DRAG_THRESHOLD) {
        return;
      }
      if (event.pointerType === "touch") {
        const row = rowUnderPointer(event, diagramElement);
        if (row && row.key !== pendingDrag.key) {
          setDropState(row);
        }
      }
      setDragKey(pendingDrag.key);
      setPendingDrag(null);
    };

    const onPointerUp = () => {
      setPendingDrag(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    diagramElement,
    dragKey,
    pendingDrag,
    reorderEnabled,
    setDragKey,
    setDropState,
    setPendingDrag,
  ]);

  useEffect(() => {
    if (!dragKey) {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      const row = rowUnderPointer(event, diagramElement);
      if (!row || row.key === dragKey) {
        setDropState(null);
      } else if (event.pointerType === "touch") {
        setDropState(row);
      }
    };
    const onPointerUp = () => {
      // Read the store, not this render: Escape can cancel the drag after
      // this listener was installed and before React re-renders.
      const sourceKey = store.get(messageReorderDragAtom)
        ? dragKeyRef.current
        : null;
      if (
        !reorderEnabled ||
        !sourceKey ||
        !dropState ||
        dropState.key === sourceKey
      ) {
        setDragKey(null);
        setDropState(null);
        return;
      }
      const nextCode = reorderMessageInDsl({
        code,
        sourceRange: parseStatementKey(sourceKey),
        targetRange: parseStatementKey(dropState.key),
        place: dropState.place,
      });
      setCode(nextCode);
      onContentChange(nextCode);
      setDragKey(null);
      setDropState(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    code,
    diagramElement,
    dragKey,
    dropState,
    onContentChange,
    reorderEnabled,
    setCode,
    setDragKey,
    setDropState,
    store,
  ]);

  // Escape cancels through the interaction state (ADR 0002, P3). A pointer
  // cancel ends this drag's own press, so it stays here.
  useEffect(() => {
    if (!pendingDrag && !dragKey) return;
    const cancel = () => {
      setPendingDrag(null);
      setDragKey(null);
      setDropState(null);
    };
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointercancel", cancel);
    };
  }, [dragKey, pendingDrag, setDragKey, setDropState, setPendingDrag]);
};
