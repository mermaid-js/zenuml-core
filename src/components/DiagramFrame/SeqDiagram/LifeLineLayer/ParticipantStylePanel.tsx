import {
  codeAtom,
  diagramElementAtom,
  onContentChangeAtom,
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
import { ARCHETYPES, PRESET_COLORS } from "./participantEditor/palette";
import { SplitSlot } from "./participantEditor/SplitSlot";
import { ColorPicker } from "./participantEditor/ColorPicker";
import { ArchetypeGlyph, TypePicker } from "./participantEditor/TypePicker";
import {
  useParticipantDrafts,
  type DraftField,
} from "./participantEditor/useParticipantDrafts";
import {
  usePickerPlacement,
  VIEWPORT_MARGIN,
  type Anchor,
  type Picker,
} from "./participantEditor/usePickerPlacement";
import { useFollowPress } from "./participantEditor/useFollowPress";

// Offsets from the participant box (D14), matching the Split-* canvas boards.
const ICON_SLOT = { dx: -14, dy: 6, size: 28 };
const COLOR_SLOT = { dx: -12, dy: 8, size: 24 };
const PILL_TOP = -32;
const NAME_ROW_GAP = 8;

const SlotGlyph = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const rowInputClass =
  "h-zu-control box-border rounded-zu-md border border-solid px-1.5 text-[13px] text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:shadow-zu-focus";

export const ParticipantStylePanel = () => {
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
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
  const {
    nameDraft,
    setNameDraft,
    stereotypeDraft,
    setStereotypeDraft,
    labelDraft,
    setLabelDraft,
    nameError,
    setNameError,
    styleError,
    setStyleError,
    commitName: commitNameDraft,
    commitStereotype: commitStereotypeDraft,
    commitLabel: commitLabelDraft,
    discard,
  } = useParticipantDrafts(participantName, declaration);

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
  const {
    typePresence,
    colorPresence,
    pickerPos,
    pickerRef,
    attachNameRow,
    nameRowWidth,
  } = usePickerPlacement(anchor, openPicker);

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

  const updateCode = (next: string) => {
    if (next === code) return;
    setCode(next);
    onContentChange(next);
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
      setStyleError(result.error);
      return false;
    }
    setStyleError(null);
    updateCode(result.code);
    return true;
  };

  const commitName = (): boolean =>
    commitNameDraft(
      (draft) =>
        renameParticipantInDsl(code, rootContext, participantName, draft),
      (result) => {
        updateCode(result.code);
        // The selection must use the parser's canonical identity.
        setSelected([result.name]);
      },
    );

  const commitStereotype = (): boolean => commitStereotypeDraft(applyStyle);

  const commitLabel = (): boolean => commitLabelDraft(applyStyle);

  const onEnterBlur = (commit: () => boolean, field: DraftField) => ({
    onBlur: () => {
      commit();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        // Discard the draft and close; the blur on unmount must not commit.
        discard(field);
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
  const typeName = currentType
    ? (ARCHETYPES.find(
        ({ key }) => key.toLowerCase() === currentType.toLowerCase(),
      )?.label ?? `@${currentType}`)
    : null;
  const colorName = currentColor
    ? (PRESET_COLORS.find(({ hex }) => hex === currentColor)?.name ??
      currentColor)
    : null;
  const error = nameError ?? styleError;

  const centerX = (anchor.left + anchor.right) / 2;
  const nameRowLeft = Math.max(
    VIEWPORT_MARGIN,
    Math.min(
      centerX - nameRowWidth / 2,
      window.innerWidth - nameRowWidth - VIEWPORT_MARGIN,
    ),
  );

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

  const stereotypeHandlers = onEnterBlur(commitStereotype, "stereotype");
  const showStereotypeInput = stereotypeEditing || !!currentStereotype;

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
          {showStereotypeInput ? (
            <div
              className="absolute pointer-events-auto h-zu-control min-w-[104px] box-border flex items-center justify-center gap-0.5 px-2 rounded-full border border-solid border-gray-300 bg-white text-[12px] text-gray-900 focus-within:shadow-zu-focus"
              style={{
                left: centerX,
                top: anchor.top + PILL_TOP,
                transform: "translateX(-50%)",
              }}
            >
              <label
                htmlFor="zenuml-participant-stereotype"
                className="sr-only"
              >
                Stereotype
              </label>
              <span className="text-gray-500" aria-hidden="true">
                «
              </span>
              <input
                id="zenuml-participant-stereotype"
                type="text"
                value={stereotypeDraft}
                size={Math.max(stereotypeDraft.length, 8)}
                autoFocus={stereotypeEditing && !currentStereotype}
                onChange={(e) => {
                  setStereotypeDraft(e.target.value);
                  setStyleError(null);
                }}
                onBlur={() => {
                  stereotypeHandlers.onBlur();
                  setStereotypeEditing(false);
                }}
                onKeyDown={(e) => {
                  stereotypeHandlers.onKeyDown(e);
                  // An erased stereotype turns back into the placeholder.
                  if (e.key === "Enter" && !stereotypeDraft.trim()) {
                    setStereotypeEditing(false);
                  }
                }}
                className="h-5 box-border border-0 px-0.5 bg-transparent text-[12px] text-center text-gray-900 focus:outline-none"
              />
              <span className="text-gray-500" aria-hidden="true">
                »
              </span>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Add stereotype"
              className="zu-press zu-press-offset absolute -translate-x-1/2 pointer-events-auto h-zu-control min-w-[104px] box-border px-3 rounded-full border border-dashed border-slate-400 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-sky-500 hover:text-sky-700 focus-visible:outline-none focus-visible:shadow-zu-focus"
              style={{
                left: centerX,
                top: anchor.top + PILL_TOP,
              }}
              onClick={() => setStereotypeEditing(true)}
            >
              «stereotype»
            </button>
          )}

          <div data-editor-slot="type" onKeyDown={onPickerKeyDown}>
            <SplitSlot
              kind="icon"
              filled={!!currentType}
              label={typeName ? `Set icon (${typeName})` : "Set icon"}
              clearLabel="Remove type"
              expanded={openPicker === "type"}
              onOpen={() => togglePicker("type")}
              onClear={() => pick("type", { type: null })}
              className="absolute pointer-events-auto"
              style={{
                left: anchor.left + ICON_SLOT.dx,
                top: anchor.top + ICON_SLOT.dy,
              }}
            >
              {currentType ? (
                <ArchetypeGlyph typeKey={currentType} />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <circle cx="9" cy="9" r="1.5" />
                  <path d="M20 15l-4-4-8 9" />
                </svg>
              )}
            </SplitSlot>
            {typePresence.mounted && pickerPos && (
              <div
                ref={(el) => {
                  pickerRef.current = el;
                  typePresence.ref(el);
                }}
                // Above the name row, which it overlaps (Split-2/3 boards).
                className={cn(
                  "absolute z-10 pointer-events-auto",
                  typePresence.className,
                )}
                style={{ top: pickerPos.top, left: pickerPos.left }}
              >
                <TypePicker
                  participantName={participantName}
                  currentType={currentType}
                  onPick={(type) => pick("type", { type })}
                  onClose={() => {
                    closePicker();
                    focusSlot("type");
                  }}
                />
              </div>
            )}
          </div>

          <div data-editor-slot="color" onKeyDown={onPickerKeyDown}>
            <SplitSlot
              kind="color"
              filled={!!currentColor}
              label={`Set color (${colorName ?? "none"})`}
              clearLabel="Remove colour"
              expanded={openPicker === "color"}
              onOpen={() => togglePicker("color")}
              onClear={() => pick("color", { color: null })}
              className="absolute pointer-events-auto"
              // Anchored by its right edge so the clear half widens into
              // the box.
              style={{
                left: anchor.right + COLOR_SLOT.dx + COLOR_SLOT.size,
                top: anchor.top + COLOR_SLOT.dy,
                transform: "translateX(-100%)",
              }}
            >
              {currentColor ? (
                <span
                  className="block w-full h-full rounded-zu-sm border-2 border-solid border-white box-border"
                  style={{ backgroundColor: currentColor }}
                />
              ) : (
                <SlotGlyph d="M7 17L17 7" />
              )}
            </SplitSlot>
            {colorPresence.mounted && pickerPos && (
              <div
                ref={(el) => {
                  pickerRef.current = el;
                  colorPresence.ref(el);
                }}
                // Above the name row, which it overlaps (Split-2/3 boards).
                className={cn(
                  "absolute z-10 pointer-events-auto",
                  colorPresence.className,
                )}
                style={{ top: pickerPos.top, left: pickerPos.left }}
              >
                <ColorPicker
                  participantName={participantName}
                  currentColor={currentColor}
                  onPick={(color) => pick("color", { color })}
                  onClose={() => {
                    closePicker();
                    focusSlot("color");
                  }}
                />
              </div>
            )}
          </div>

          {/* Hidden while a picker is open: the picker covers this spot. */}
          {!openPicker && (
            <div
              className="absolute flex flex-col items-center gap-2.5"
              style={{
                // Centred on the (clamped) name row, so the tooltip and the
                // error block share its centre.
                left: nameRowLeft + nameRowWidth / 2,
                top: anchor.bottom + NAME_ROW_GAP,
                transform: "translateX(-50%)",
              }}
            >
              <div
                ref={(el) => {
                  attachNameRow(el);
                  presence.ref(el);
                }}
                data-testid="participant-name-row"
                className={cn(
                  "pointer-events-auto h-8 box-border flex items-center gap-1.5 px-1 bg-white rounded-zu-lg shadow-zu-pop-ring",
                  presence.className,
                )}
              >
                <label htmlFor="zenuml-participant-name" className="sr-only">
                  Name
                </label>
                <input
                  id="zenuml-participant-name"
                  type="text"
                  value={nameDraft}
                  onChange={(e) => {
                    setNameDraft(e.target.value);
                    setNameError(null);
                  }}
                  aria-invalid={nameError ? true : undefined}
                  {...onEnterBlur(commitName, "name")}
                  className={cn(
                    rowInputClass,
                    "w-[76px] font-semibold",
                    nameError
                      ? "border-red-600"
                      : "border-transparent hover:border-gray-200",
                  )}
                />
                <span className="text-[12px] text-gray-600">as</span>
                <label htmlFor="zenuml-participant-label" className="sr-only">
                  Display as
                </label>
                <input
                  id="zenuml-participant-label"
                  type="text"
                  value={labelDraft}
                  placeholder="Display name"
                  onChange={(e) => {
                    setLabelDraft(e.target.value);
                    setStyleError(null);
                  }}
                  {...onEnterBlur(commitLabel, "label")}
                  className={cn(
                    rowInputClass,
                    labelDraft
                      ? "w-[124px] border-gray-200"
                      : "w-[104px] border-dashed border-slate-300",
                  )}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="pointer-events-auto max-w-[320px] px-2.5 py-1.5 box-border bg-white rounded-zu-md text-[12px] text-red-700 shadow-zu-pop-error"
                >
                  {error}
                </div>
              )}

              <div className="invisible group-hover:visible group-focus-within:visible pointer-events-none px-2 py-[5px] bg-gray-800 rounded-zu-md text-gray-50 text-[11px] font-mono whitespace-pre">
                <code data-testid="participant-dsl-preview">{dslLine}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </FloatingPortal>
  );
};
