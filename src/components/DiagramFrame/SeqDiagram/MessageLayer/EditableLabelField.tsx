import {
  codeAtom,
  modeAtom,
  pendingEditableRangeAtom,
  RenderMode,
  selectedMessageAtom,
} from "@/store/Store";
import { useCommitCode } from "@/store/useCommitCode";
import type { TrackedEdit } from "@/store/trackEvent";
import { useTextEditingGuard } from "@/components/common/EditableSpan/useTextEditingGuard";
import { cn } from "@/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { formatText } from "@/utils/StringUtil";
import { EditableSpan } from "@/components/common/EditableSpan";
import { resolveEmojiInText } from "@/emoji/resolveEmoji";
import { resolveAutoEditToken } from "@/utils/pendingEditableRange";

/** The range the saved text now occupies in the new code (both ends inclusive). */
export type SavedRange = { start: number; end: number };

/**
 * An `afterSave` that selects the text that was just edited, so the message
 * it belongs to stays highlighted. Message labels use it; fragment conditions
 * do not.
 */
export const useReselectSavedMessage = () => {
  const setSelectedMessage = useSetAtom(selectedMessageAtom);
  return useCallback(
    ({ start, end }: SavedRange) =>
      setSelectedMessage({ start, end, token: Date.now() }),
    [setSelectedMessage],
  );
};

const MESSAGE_LABEL_EDITED: TrackedEdit = { action: "message_label_edited" };

interface EditableLabelFieldProps {
  text: string;
  /** `[start, end]` of the label in the code; `end` is inclusive. */
  position: readonly [number | undefined, number | undefined];
  normalizeText?: (text: string) => string;
  /** Runs after the new code is committed. */
  afterSave?: (saved: SavedRange) => void;
  /**
   * Which render modes allow editing. Each label keeps the rule it had before
   * they shared this component, so this does not change what is editable:
   * - `"interactive"` (default): every mode except Static.
   * - `"dynamic"`: Dynamic mode only.
   */
  editableIn?: "interactive" | "dynamic";
  className?: string;
  title?: string;
  /** The usage event a save reports to the host. */
  trackAs?: TrackedEdit;
}

export const EditableLabelField = ({
  text,
  position,
  normalizeText,
  afterSave,
  editableIn = "interactive",
  className,
  title = "Click to edit",
  trackAs = MESSAGE_LABEL_EDITED,
}: EditableLabelFieldProps) => {
  const mode = useAtomValue(modeAtom);
  const updateTextEditing = useTextEditingGuard();
  const code = useAtomValue(codeAtom);
  const commitCode = useCommitCode();
  const pendingEditableRange = useAtomValue(pendingEditableRangeAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const isEditable =
    editableIn === "dynamic"
      ? mode === RenderMode.Dynamic
      : mode !== RenderMode.Static;
  const formattedText = resolveEmojiInText(formatText(text ?? ""));
  const shouldAutoEdit = resolveAutoEditToken(
    pendingEditableRange,
    position[0],
    position[1],
  );

  const handleSave = (newText: string) => {
    // If text is empty or same as what was displayed, bail out
    if (newText === "" || newText === formattedText) {
      return;
    }

    // Apply parent-provided normalizer
    const normalizedText = normalizeText?.(newText) ?? newText;

    const [start, end] = position;
    if (start == null || end == null || start === -1 || end === -1) {
      console.warn("labelPosition is not set");
      return;
    }

    commitCode(
      code.slice(0, start) + normalizedText + code.slice(end + 1),
      trackAs,
    );
    afterSave?.({ start, end: start + normalizedText.length - 1 });
    if (shouldAutoEdit) {
      setPendingEditableRange(null);
    }
  };

  return (
    <EditableSpan
      text={formattedText}
      isEditable={isEditable}
      className={cn(className)}
      onSave={handleSave}
      title={title}
      autoEditToken={shouldAutoEdit}
      onEditingChange={(editing) => {
        updateTextEditing(editing);
        if (!editing && shouldAutoEdit) setPendingEditableRange(null);
      }}
    />
  );
};
