import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { participantPreviewAtom } from "@/store/Store";
import { cn } from "@/utils";
import { participantTextColor } from "@/utils/Color";
import { PRESET_COLORS } from "./palette";

const HEX_RE = /^#?([0-9a-f]{6})$/i;

type Props = {
  participantName: string;
  currentColor: string | null;
  onPick: (hex: string) => void;
  onClose: () => void;
};

export function ColorPicker({
  participantName,
  currentColor,
  onPick,
  onClose,
}: Props) {
  const setPreview = useSetAtom(participantPreviewAtom);
  const current = currentColor?.replace(/^#/, "") ?? "";
  const [draft, setDraft] = useState(current);
  // Escape discards the draft; the blur caused by returning focus to the
  // slot must not commit it.
  const discardRef = useRef(false);

  useEffect(() => setDraft(current), [current]);
  useEffect(() => () => setPreview(null), [setPreview]);

  const commit = (input: HTMLInputElement) => {
    if (discardRef.current) return;
    const reset = () => {
      input.value = current;
      setDraft(current);
    };
    const m = HEX_RE.exec(input.value.trim());
    if (!m) return reset();
    const hex = `#${m[1].toLowerCase()}`;
    if (hex === currentColor?.toLowerCase()) return reset();
    onPick(hex);
  };

  return (
    <div
      role="dialog"
      aria-label="Participant colour"
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          discardRef.current = true;
          onClose();
        }
      }}
      // Width and grid columns stay inline: they are the Task 5 picker
      // contract and ColorPicker.spec reads them from `.style`.
      style={{ width: 180 }}
      className="box-border flex flex-col gap-2 p-2.5 bg-white rounded-zu-panel shadow-zu-pop-ring"
    >
      <div
        onPointerLeave={() => setPreview(null)}
        style={{ gridTemplateColumns: "repeat(5, 30px)" }}
        className="grid gap-[3px] justify-items-center items-center"
      >
        {PRESET_COLORS.map(({ hex, name }) => {
          const selected = hex === currentColor?.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              aria-label={name}
              aria-pressed={selected}
              onPointerEnter={() =>
                setPreview({ name: participantName, color: hex })
              }
              onClick={() => {
                setPreview(null);
                onPick(hex);
              }}
              // Fill and letter colour are computed per swatch at render.
              style={{ background: hex, color: participantTextColor(hex) }}
              className={cn(
                "w-6 h-6 box-border p-0 rounded-zu-md text-[14px] font-normal leading-none [font-family:inherit] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                selected
                  ? "border-2 border-solid border-white shadow-zu-selected"
                  : "border border-solid border-black/[0.12]",
              )}
            >
              A
            </button>
          );
        })}
      </div>
      <label className="relative flex items-center">
        <span
          aria-hidden="true"
          className="absolute left-[9px] text-[12px] text-gray-500 font-mono"
        >
          #
        </span>
        <input
          type="text"
          aria-label="Custom hex color"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(e.currentTarget);
            }
          }}
          className="w-full h-7 box-border border border-solid border-gray-200 rounded-zu-md pl-[22px] pr-2 text-[12px] text-gray-900 bg-white font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </label>
    </div>
  );
}
