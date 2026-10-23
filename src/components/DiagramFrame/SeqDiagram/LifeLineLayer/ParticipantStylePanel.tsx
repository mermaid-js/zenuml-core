import { useCommitCode } from "@/store/useCommitCode";
import type { TrackedEdit } from "@/store/trackEvent";
import {
  codeAtom,
  diagramElementAtom,
  participantPreviewAtom,
  rootContextAtom,
  selectedAtom,
} from "@/store/Store";
import {
  formatParticipantDeclaration,
  readParticipantDeclaration,
  setParticipantStyleChecked,
  type ParticipantUpdates,
} from "@/utils/participantStyleTransform";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { renameParticipantInDsl } from "@/utils/participantRenameTransform";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { RootContext } from "@/parser";
import { cn } from "@/utils";
import { usePopoverPresence } from "@/components/common/usePopoverPresence";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { useActiveSurface } from "@/store/interaction/useCan";
import { NameRow } from "./participantEditor/NameRow";
import { SlotBar } from "./participantEditor/SlotBar";
import { StereotypePill } from "./participantEditor/StereotypePill";
import {
  useParticipantDrafts,
  type DraftField,
} from "./participantEditor/useParticipantDrafts";
import {
  usePickerPlacement,
  type Anchor,
  type Picker,
} from "./participantEditor/usePickerPlacement";
import { useFollowPress } from "./participantEditor/useFollowPress";

export const ParticipantStylePanel = () => {
  const code = useAtomValue(codeAtom);
  const commitCode = useCommitCode();
  const rootContext = useAtomValue(rootContextAtom);
  const [selected, setSelectedRaw] = useAtom(selectedAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const themeClasses = Array.from(diagramElement?.classList ?? [])
    .filter((name) => name.startsWith("theme-"))
    .join(" ");
  // The editor shows while its interaction state is current (ADR 0002): the
  // editor flag is on, one participant is selected and no drag runs. The
  // surface also hides in a static render and under a text edit.
  const surface = useActiveSurface();
  const openFor =
    surface?.kind === "participantEditor" ? surface.participant : null;
  const isOpen = openFor !== null;
  // P2: the editor stays mounted for its 120 ms exit animation.
  const presence = usePopoverPresence(isOpen);
  // The selected participant's box, in viewport coordinates.
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const liveParticipantName = selected[0] ?? null;
  const lastParticipantName = useRef<string | null>(null);
  if (liveParticipantName) lastParticipantName.current = liveParticipantName;
  // During the exit animation the selection may already be gone; the last
  // name keeps every piece where it was.
  const participantName =
    liveParticipantName ??
    (presence.mounted ? lastParticipantName.current : null);

  const ordered = participantName
    ? OrderedParticipants(rootContext).find((p) => p.name === participantName)
    : null;
  const declaration = participantName
    ? readParticipantDeclaration(rootContext, participantName)
    : null;
  const currentType = declaration?.type ?? ordered?.type ?? null;
  const currentColor =
    (declaration?.color ?? ordered?.color)?.toLowerCase() ?? null;
  const currentStereotype = declaration?.stereotype ?? "";

  // Called where the original resync effects were, so their place in the
  // effect order is kept.
  const drafts = useParticipantDrafts(participantName, declaration);

  // Picker open state lives here so Escape in a picker closes only it (D11).
  const [openPicker, setOpenPicker] = useState<Picker | null>(null);
  const [stereotypeEditing, setStereotypeEditing] = useState(false);
  const setPreview = useSetAtom(participantPreviewAtom);
  useEffect(() => {
    setOpenPicker(null);
    setStereotypeEditing(false);
  }, [participantName, isOpen]);
  // A hover preview never outlives the selection (D12).
  useEffect(() => {
    if (!isOpen) setPreview(null);
  }, [isOpen, setPreview]);

  useEffect(() => {
    if (openFor && diagramElement) {
      const el = diagramElement.querySelector(
        `[data-participant-id="${openFor}"]`,
      ) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setAnchor({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        });
      }
    } else if (!presence.mounted) {
      setAnchor(null);
    }
    // `code` re-anchors the editor after an edit moves the participant box;
    // `selected` after a reselect of the same name. The anchor outlives the
    // open state by one exit animation.
  }, [openFor, selected, diagramElement, code, presence.mounted]);

  // Called right after the anchor effect, where its picker effects were, so
  // the layout and passive effect order is unchanged.
  const placement = usePickerPlacement(anchor, openPicker);

  // Press-following (ADR 0002) runs last, where its exit listener and
  // pointerdown effect were. Its unmount cleanup moved here from the top;
  // it has no mount body, so its place among the effects does not matter.
  const { setSelected } = useFollowPress({
    diagramElement,
    isOpen,
    participantName,
    selected,
    setSelected: setSelectedRaw,
  });

  if (!presence.mounted || !participantName || !anchor) {
    return null;
  }

  const close = () => {
    setSelected([]);
  };

  const updateCode = (next: string, edit?: TrackedEdit) => {
    if (next === code) return;
    commitCode(next, edit);
  };

  // Changes apply immediately and the panel stays open, so several edits can
  // be made in one visit. An inferred participant gets its declaration line
  // written first, then the update is applied to that line.
  const applyStyle = (updates: ParticipantUpdates): boolean => {
    let workingCode = code;
    let workingRoot = rootContext;
    if (!declaration) {
      const insertIndex = OrderedParticipants(rootContext)
        .filter((p) => p.name !== _STARTER_)
        .findIndex((p) => p.name === participantName);
      workingCode = insertParticipantIntoDsl({
        code: workingCode,
        rootContext,
        insertIndex,
        name: participantName,
        type: "default",
        materializeExisting: true,
      });
      workingRoot = RootContext(workingCode);
    }
    const result = setParticipantStyleChecked(
      workingCode,
      workingRoot,
      participantName,
      updates,
    );
    if ("error" in result) {
      drafts.setStyleError(result.error);
      return false;
    }
    drafts.setStyleError(null);
    updateCode(result.code);
    return true;
  };

  const commitName = (): boolean =>
    drafts.commitName(
      (draft) =>
        renameParticipantInDsl(code, rootContext, participantName, draft),
      (result) => {
        updateCode(result.code, {
          action: "participant_renamed",
          label: "editor",
        });
        // The selection must use the parser's canonical identity.
        setSelected([result.name]);
      },
    );

  const commitStereotype = (): boolean => drafts.commitStereotype(applyStyle);

  const commitLabel = (): boolean => drafts.commitLabel(applyStyle);

  const onEnterBlur = (commit: () => boolean, field: DraftField) => ({
    onBlur: () => {
      commit();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        // Discard the draft and close; the blur on unmount must not commit.
        drafts.discard(field);
        close();
        return;
      }
      if (e.key === "Enter") {
        // A rejected draft keeps focus, its text and the error alert.
        e.preventDefault();
        commit();
      }
      // Keep other keys from reaching the canvas shortcuts.
      e.stopPropagation();
    },
  });

  const dslLine = formatParticipantDeclaration(
    declaration ?? { name: participantName },
  );
  const error = drafts.nameError ?? drafts.styleError;

  const togglePicker = (picker: Picker) =>
    setOpenPicker((open) => (open === picker ? null : picker));
  const closePicker = () => setOpenPicker(null);
  // Keyboard users keep their place: closing a picker by pick, clear or
  // Escape returns focus to the slot button that opened it.
  const focusSlot = (picker: Picker) =>
    panelRef.current
      ?.querySelector<HTMLElement>(
        `[data-editor-slot="${picker}"] button[aria-label^="Set "]`,
      )
      ?.focus();
  const pick = (picker: Picker, updates: ParticipantUpdates) => {
    setPreview(null);
    setOpenPicker(null);
    focusSlot(picker);
    applyStyle(updates);
  };
  // Escape anywhere in a slot or its picker closes only the picker (D11).
  const onPickerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && openPicker) {
      e.stopPropagation();
      closePicker();
      focusSlot(openPicker);
    }
  };

  return (
    <FloatingPortal>
      <div className="zenuml">
        {/* One root owns every piece so the click-away `contains()` check
            covers them all. It spans the viewport without catching pointer
            events; each piece opts back in. */}
        <div
          ref={panelRef}
          role="dialog"
          data-interaction-surface="participantEditor"
          aria-label={`Edit participant ${participantName}`}
          className={cn(
            "participant-style-panel group fixed inset-0 pointer-events-none text-gray-700",
            presence.state === "exit" && "[&_*]:!pointer-events-none",
            themeClasses,
          )}
          style={{ zIndex: 50 }}
          data-testid="participant-style-panel"
          onPointerDown={(e) => {
            // A press elsewhere in the editor closes an open picker.
            const target = e.target as Element;
            if (openPicker && !target.closest("[data-editor-slot]")) {
              closePicker();
            }
          }}
        >
          {/* Dims the whole diagram, selected box included. First child, so
              every editor piece stacks above it. Never catches pointer
              events: click-away and reselect still reach the diagram. */}
          <div
            aria-hidden="true"
            data-testid="participant-editor-mask"
            className={cn(
              "absolute inset-0 pointer-events-none bg-slate-900/[0.32]",
              presence.state === "exit" && "zu-fade-exit",
            )}
          />
          <StereotypePill
            anchor={anchor}
            editing={stereotypeEditing}
            setEditing={setStereotypeEditing}
            currentStereotype={currentStereotype}
            draft={drafts.stereotypeDraft}
            onDraftChange={(value) => {
              drafts.setStereotypeDraft(value);
              drafts.setStyleError(null);
            }}
            handlers={onEnterBlur(commitStereotype, "stereotype")}
          />

          <SlotBar
            anchor={anchor}
            participantName={participantName}
            currentType={currentType}
            currentColor={currentColor}
            openPicker={openPicker}
            typePresence={placement.typePresence}
            colorPresence={placement.colorPresence}
            pickerPos={placement.pickerPos}
            pickerRef={placement.pickerRef}
            togglePicker={togglePicker}
            pick={pick}
            closePicker={closePicker}
            focusSlot={focusSlot}
            onPickerKeyDown={onPickerKeyDown}
          />

          {/* Hidden while a picker is open: the picker covers this spot. */}
          {!openPicker && (
            <NameRow
              anchor={anchor}
              nameRowWidth={placement.nameRowWidth}
              rowRef={(el) => {
                placement.attachNameRow(el);
                presence.ref(el);
              }}
              rowClassName={presence.className}
              nameDraft={drafts.nameDraft}
              nameError={drafts.nameError}
              onNameChange={(value) => {
                drafts.setNameDraft(value);
                drafts.setNameError(null);
              }}
              nameHandlers={onEnterBlur(commitName, "name")}
              labelDraft={drafts.labelDraft}
              onLabelChange={(value) => {
                drafts.setLabelDraft(value);
                drafts.setStyleError(null);
              }}
              labelHandlers={onEnterBlur(commitLabel, "label")}
              error={error}
              dslLine={dslLine}
            />
          )}
        </div>
      </div>
    </FloatingPortal>
  );
};
