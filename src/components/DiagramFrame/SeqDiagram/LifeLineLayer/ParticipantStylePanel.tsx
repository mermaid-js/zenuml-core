import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  onContentChangeAtom,
  participantPreviewAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
  textEditingAtom,
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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { ARCHETYPES, PRESET_COLORS } from "./participantEditor/palette";
import { SplitSlot } from "./participantEditor/SplitSlot";
import { ColorPicker } from "./participantEditor/ColorPicker";
import { ArchetypeGlyph, TypePicker } from "./participantEditor/TypePicker";

// Offsets from the participant box (D14), matching the Split-* canvas boards.
const ICON_SLOT = { dx: -14, dy: 6, size: 28 };
const COLOR_SLOT = { dx: -12, dy: 8, size: 24 };
const PILL_TOP = -32;
const NAME_ROW_GAP = 8;
// Pickers open below their slot: type picker right-aligned with the box,
// colour picker starting just left of the colour slot.
const PICKER_TOP = 42;
const TYPE_PICKER_WIDTH = 220;
const COLOR_PICKER_LEFT = -44;
const VIEWPORT_MARGIN = 8;

type Picker = "type" | "color";

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
  "h-6 box-border rounded-[5px] border border-solid px-1.5 text-[13px] text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export const ParticipantStylePanel = () => {
  const mode = useAtomValue(modeAtom);
  const enabled = useAtomValue(enableParticipantStyleEditingAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const [selected, setSelectedRaw] = useAtom(selectedAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const dragState = useAtomValue(createMessageDragAtom);
  const textEditing = useAtomValue(textEditingAtom);
  const themeClasses = Array.from(diagramElement?.classList ?? [])
    .filter((name) => name.startsWith("theme-"))
    .join(" ");
  const [isOpen, setIsOpen] = useState(false);
  // The selected participant's box, in viewport coordinates.
  const [anchor, setAnchor] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const participantName = selected[0] ?? null;

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
  const currentLabel = declaration?.label ?? "";

  // Text fields are committed on Enter/blur, so they keep local drafts that
  // resync whenever the participant or its declaration changes underneath.
  const [nameDraft, setNameDraft] = useState("");
  const [stereotypeDraft, setStereotypeDraft] = useState("");
  const [labelDraft, setLabelDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [styleError, setStyleError] = useState<string | null>(null);
  // Escape discards the drafts; the blur that follows must not commit them.
  const skipCommitRef = useRef(false);
  // Outside click on a participant: the panel may re-render the diagram and
  // detach the clicked node before its click event fires, so the reselection
  // is deferred to pointerup and cancelled by any later interaction.
  const interactionTokenRef = useRef(0);
  const cancelPendingRef = useRef<(() => void) | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const diagramElementRef = useRef(diagramElement);
  diagramElementRef.current = diagramElement;
  const cancelPending = () => {
    interactionTokenRef.current++;
    cancelPendingRef.current?.();
    cancelPendingRef.current = null;
  };
  const setSelected = (next: string[]) => {
    cancelPending();
    setSelectedRaw(next);
  };
  useEffect(() => () => cancelPendingRef.current?.(), []);
  // `participantName` is a dependency of every draft so that switching to
  // another participant whose value is identical (e.g. both unlabeled) still
  // resets the field.
  useEffect(() => {
    setNameDraft(participantName ?? "");
    setNameError(null);
    setStyleError(null);
    skipCommitRef.current = false;
  }, [participantName]);
  useEffect(
    () => setStereotypeDraft(currentStereotype),
    [participantName, currentStereotype],
  );
  useEffect(() => setLabelDraft(currentLabel), [participantName, currentLabel]);

  // Picker open state lives here so Escape in a picker closes only it (D11).
  const [openPicker, setOpenPicker] = useState<Picker | null>(null);
  const [stereotypeEditing, setStereotypeEditing] = useState(false);
  const [pickerPos, setPickerPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const nameRowRef = useRef<HTMLDivElement>(null);
  const [nameRowWidth, setNameRowWidth] = useState(0);
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
    if (selected.length === 1 && diagramElement && !dragState && !textEditing) {
      const el = diagramElement.querySelector(
        `[data-participant-id="${selected[0]}"]`,
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
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setAnchor(null);
    }
    // `code` re-anchors the editor after an edit moves the participant box.
  }, [selected, diagramElement, dragState, textEditing, code]);

  // Pickers open below their slot.
  useLayoutEffect(() => {
    if (!anchor || !openPicker) {
      setPickerPos(null);
      return;
    }
    setPickerPos({
      top: anchor.top + PICKER_TOP,
      left:
        openPicker === "type"
          ? anchor.right - TYPE_PICKER_WIDTH
          : anchor.right + COLOR_PICKER_LEFT,
    });
  }, [anchor, openPicker]);

  // A newly opened picker takes focus: its first pressed item, else its
  // first control.
  const focusedPickerRef = useRef<Picker | null>(null);
  useEffect(() => {
    if (!openPicker || !pickerPos) {
      if (!openPicker) focusedPickerRef.current = null;
      return;
    }
    if (focusedPickerRef.current === openPicker) return;
    focusedPickerRef.current = openPicker;
    const root = pickerRef.current;
    (
      root?.querySelector<HTMLElement>('button[aria-pressed="true"]') ??
      root?.querySelector<HTMLElement>("button")
    )?.focus();
  }, [openPicker, pickerPos]);

  // Clamp the open picker to the viewport after it renders.
  useLayoutEffect(() => {
    if (!pickerRef.current || !pickerPos || !anchor) return;
    const picker = pickerRef.current.getBoundingClientRect();
    let { top, left } = pickerPos;
    const margin = VIEWPORT_MARGIN;
    if (left + picker.width > window.innerWidth - margin) {
      left = window.innerWidth - picker.width - margin;
    }
    if (left < margin) left = margin;
    if (top + picker.height > window.innerHeight - margin) {
      top = anchor.top - picker.height - margin; // flip above participant
    }
    if (top !== pickerPos.top || left !== pickerPos.left) {
      setPickerPos({ top, left });
    }
  }, [pickerPos, anchor]);

  // The name row is centred under the box; measure it to clamp it on screen.
  // Its width changes with the label field (empty vs filled).
  useLayoutEffect(() => {
    const width = nameRowRef.current?.offsetWidth ?? 0;
    if (width !== nameRowWidth) setNameRowWidth(width);
  }, [anchor, labelDraft, nameRowWidth]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Commit a focused draft for the participant it belongs to before the
        // selection changes; the blur handler runs synchronously here. A draft
        // that fails validation is discarded: closing the panel resets every
        // draft and error from the committed declaration.
        const active = document.activeElement as HTMLElement | null;
        if (active && panelRef.current.contains(active)) active.blur();
        setIsOpen(false);
        setSelected([]);
        // A committed draft can re-render the diagram and replace the node
        // under the pointer, which drops the click that would select it.
        const target = e.target as Element | null;
        const hit = target
          ?.closest?.("[data-participant-id]")
          ?.getAttribute("data-participant-id");
        if (hit) {
          const token = ++interactionTokenRef.current;
          const onUp = () => {
            const current = interactionTokenRef.current === token;
            cancelPending();
            // A connected target still gets its own click, which toggles the
            // selection; setting it here would toggle it back off.
            if (
              current &&
              selectedRef.current.length === 0 &&
              !target?.isConnected &&
              diagramElementRef.current?.querySelector(
                `[data-participant-id="${hit}"]`,
              )
            ) {
              setSelectedRaw([hit]);
            }
          };
          const onKey = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") cancelPending();
          };
          document.addEventListener("pointerup", onUp, true);
          document.addEventListener("pointercancel", cancelPending, true);
          document.addEventListener("keydown", onKey, true);
          cancelPendingRef.current = () => {
            document.removeEventListener("pointerup", onUp, true);
            document.removeEventListener("pointercancel", cancelPending, true);
            document.removeEventListener("keydown", onKey, true);
          };
        }
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelected([]);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (
    !enabled ||
    mode !== RenderMode.Dynamic ||
    !isOpen ||
    textEditing ||
    !participantName ||
    !anchor
  ) {
    return null;
  }

  const close = () => {
    setIsOpen(false);
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

  const commitName = (): boolean => {
    if (skipCommitRef.current) return true;
    if (nameDraft.trim() === participantName) {
      setNameDraft(participantName);
      setNameError(null);
      return true;
    }
    const result = renameParticipantInDsl(
      code,
      rootContext,
      participantName,
      nameDraft,
    );
    if ("error" in result) {
      setNameError(result.error);
      return false;
    }
    setNameError(null);
    setNameDraft(result.name);
    updateCode(result.code);
    // The selection must use the parser's canonical identity.
    setSelected([result.name]);
    return true;
  };

  const commitStereotype = (): boolean => {
    if (skipCommitRef.current) return true;
    const next = stereotypeDraft.trim();
    if (next === currentStereotype) return true;
    return applyStyle({ stereotype: next || null });
  };

  const commitLabel = (): boolean => {
    if (skipCommitRef.current) return true;
    const next = labelDraft.trim();
    if (next === currentLabel) return true;
    return applyStyle({ label: next || null });
  };

  const onEnterBlur = (commit: () => boolean, reset: () => void) => ({
    onBlur: () => {
      commit();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        // Discard the draft and close; the blur on unmount must not commit.
        skipCommitRef.current = true;
        reset();
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

  const stereotypeHandlers = onEnterBlur(commitStereotype, () =>
    setStereotypeDraft(currentStereotype),
  );
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
          aria-label={`Edit participant ${participantName}`}
          className={cn(
            "participant-style-panel group fixed inset-0 pointer-events-none text-gray-700",
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
          {showStereotypeInput ? (
            <div
              className="absolute pointer-events-auto h-6 min-w-[104px] box-border flex items-center justify-center gap-0.5 px-2 rounded-full border border-solid border-gray-300 bg-white text-[12px] text-gray-900 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100"
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
              className="absolute pointer-events-auto h-6 min-w-[104px] box-border px-3 rounded-full border border-dashed border-slate-400 bg-white text-[12px] text-gray-600 cursor-pointer hover:border-sky-500 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              style={{
                left: centerX,
                top: anchor.top + PILL_TOP,
                transform: "translateX(-50%)",
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
            {openPicker === "type" && pickerPos && (
              <div
                ref={pickerRef}
                // Above the name row, which it overlaps (Split-2/3 boards).
                className="absolute z-10 pointer-events-auto"
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
                  className="block w-full h-full rounded-[4px] border-2 border-solid border-white box-border"
                  style={{ backgroundColor: currentColor }}
                />
              ) : (
                <SlotGlyph d="M7 17L17 7" />
              )}
            </SplitSlot>
            {openPicker === "color" && pickerPos && (
              <div
                ref={pickerRef}
                // Above the name row, which it overlaps (Split-2/3 boards).
                className="absolute z-10 pointer-events-auto"
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

          <div
            className="absolute flex flex-col items-start gap-2.5"
            style={{
              left: nameRowLeft,
              top: anchor.bottom + NAME_ROW_GAP,
            }}
          >
            <div
              ref={nameRowRef}
              data-testid="participant-name-row"
              className="pointer-events-auto h-8 box-border flex items-center gap-1.5 px-1 bg-white rounded-lg shadow-[0_4px_14px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.08)]"
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
                {...onEnterBlur(commitName, () =>
                  setNameDraft(participantName),
                )}
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
                {...onEnterBlur(commitLabel, () => setLabelDraft(currentLabel))}
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
                className="pointer-events-auto max-w-[320px] px-2.5 py-1.5 box-border bg-white rounded-md text-[12px] text-red-700 shadow-[0_4px_14px_rgba(15,23,42,0.12),0_0_0_1px_rgba(220,38,38,0.35)]"
              >
                {error}
              </div>
            )}

            <div className="invisible group-hover:visible group-focus-within:visible pointer-events-none px-2 py-[5px] bg-gray-800 rounded-md text-gray-50 text-[11px] font-mono whitespace-pre">
              <code data-testid="participant-dsl-preview">{dslLine}</code>
            </div>
          </div>
        </div>
      </div>
    </FloatingPortal>
  );
};
