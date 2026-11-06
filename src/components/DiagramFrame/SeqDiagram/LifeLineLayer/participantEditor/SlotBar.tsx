import type { RefObject } from "react";
import { cn } from "@/utils";
import type { usePopoverPresence } from "@/components/common/usePopoverPresence";
import type { ParticipantUpdates } from "@/utils/participantStyleTransform";
import { ARCHETYPES, PRESET_COLORS } from "./palette";
import { SplitSlot } from "./SplitSlot";
import { ColorPicker } from "./ColorPicker";
import { ArchetypeGlyph, TypePicker } from "./TypePicker";
import type { Anchor, Picker } from "./usePickerPlacement";

// Offsets from the participant box (D14), matching the Split-* canvas boards.
const ICON_SLOT = { dx: -14, dy: 6, size: 28 };
const COLOR_SLOT = { dx: -12, dy: 8, size: 24 };

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

type Presence = ReturnType<typeof usePopoverPresence>;

/** The participant editor's type and colour slots, each with its picker. */
export const SlotBar = ({
  anchor,
  participantName,
  currentType,
  currentColor,
  openPicker,
  typePresence,
  colorPresence,
  pickerPos,
  pickerRef,
  togglePicker,
  pick,
  closePicker,
  focusSlot,
  onPickerKeyDown,
}: {
  anchor: Anchor;
  participantName: string;
  currentType: string | null;
  currentColor: string | null;
  openPicker: Picker | null;
  typePresence: Presence;
  colorPresence: Presence;
  pickerPos: { top: number; left: number } | null;
  pickerRef: RefObject<HTMLDivElement | null>;
  togglePicker: (picker: Picker) => void;
  pick: (picker: Picker, updates: ParticipantUpdates) => void;
  closePicker: () => void;
  focusSlot: (picker: Picker) => void;
  onPickerKeyDown: (e: React.KeyboardEvent) => void;
}) => {
  const typeName = currentType
    ? (ARCHETYPES.find(
        ({ key }) => key.toLowerCase() === currentType.toLowerCase(),
      )?.label ?? `@${currentType}`)
    : null;
  const colorName = currentColor
    ? (PRESET_COLORS.find(({ hex }) => hex === currentColor)?.name ??
      currentColor)
    : null;

  return (
    <>
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
    </>
  );
};
