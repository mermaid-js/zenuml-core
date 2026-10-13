import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { participantPreviewAtom } from "@/store/Store";
import { participantTextColor } from "@/utils/Color";
import { PRESET_COLORS } from "./palette";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const HEX_RE = /^#?([0-9a-f]{6})$/i;

type Props = {
  participantName: string;
  currentColor: string | null;
  onPick: (hex: string) => void;
  onClose: () => void;
};

export function ColorPicker({ participantName, currentColor, onPick, onClose }: Props) {
  const setPreview = useSetAtom(participantPreviewAtom);
  const current = currentColor?.replace(/^#/, "") ?? "";
  const [draft, setDraft] = useState(current);

  useEffect(() => setDraft(current), [current]);
  useEffect(() => () => setPreview(null), [setPreview]);

  const commit = (input: HTMLInputElement) => {
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
        if (e.key === "Escape") onClose();
      }}
      style={{
        width: 180,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        background: "#ffffff",
        borderRadius: 10,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        onPointerLeave={() => setPreview(null)}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 30px)",
          gap: 3,
          justifyItems: "center",
          alignItems: "center",
        }}
      >
        {PRESET_COLORS.map(({ hex, name }) => {
          const selected = hex === currentColor?.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              aria-label={name}
              aria-pressed={selected}
              onPointerEnter={() => setPreview({ name: participantName, color: hex })}
              onClick={() => {
                setPreview(null);
                onPick(hex);
              }}
              style={{
                width: 24,
                height: 24,
                boxSizing: "border-box",
                padding: 0,
                border: selected ? "2px solid #ffffff" : "1px solid rgba(0,0,0,0.12)",
                boxShadow: selected ? "0 0 0 2px #0ea5e9" : undefined,
                borderRadius: 5,
                background: hex,
                color: participantTextColor(hex),
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              A
            </button>
          );
        })}
      </div>
      <label style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span
          aria-hidden="true"
          style={{ position: "absolute", left: 9, fontSize: 12, color: "#6b7280", fontFamily: MONO }}
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
          style={{
            width: "100%",
            height: 28,
            boxSizing: "border-box",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "0 8px 0 22px",
            fontSize: 12,
            color: "#111827",
            background: "#ffffff",
            fontFamily: MONO,
          }}
        />
      </label>
    </div>
  );
}
