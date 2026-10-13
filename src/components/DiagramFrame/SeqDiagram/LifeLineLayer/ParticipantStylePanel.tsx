import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
  textEditingAtom,
} from "@/store/Store";
import { setParticipantStyleInDsl } from "@/utils/participantStyleTransform";
import {
  insertParticipantIntoDsl,
  type ParticipantInsertType,
} from "@/utils/participantInsertTransform";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { AsyncIcon } from "../../Tutorial/AsyncIcon";

const PRESET_COLORS: { hex: string; name: string }[] = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#94a3b8", name: "Gray" },
  { hex: "#ffffff", name: "White" },
];

// `null` key is the plain participant box (no `@Type` annotation).
const PARTICIPANT_TYPES: { key: string | null; label: string }[] = [
  { key: null, label: "Default" },
  { key: "Actor", label: "Actor" },
  { key: "Boundary", label: "Boundary" },
  { key: "Control", label: "Control" },
  { key: "Entity", label: "Entity" },
  { key: "Database", label: "Database" },
  { key: "Queue", label: "Queue" },
];

const isLightColor = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
};

const TypeGlyph = ({ typeKey }: { typeKey: string | null }) => {
  if (!typeKey) {
    return (
      <span className="block w-5 h-3.5 rounded-[3px] border-[1.5px] border-current" />
    );
  }
  if (typeKey === "Queue") {
    return (
      <svg viewBox="0 0 24 16" className="w-6 h-4" aria-hidden="true">
        <rect
          x="1.5"
          y="3"
          width="21"
          height="10"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M17.5 3a5 5 0 0 0 0 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <AsyncIcon
      iconKey={typeKey.toLowerCase()}
      className="w-6 h-6 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
    />
  );
};

const CheckMark = ({ light }: { light: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    className={`w-3 h-3 ${light ? "text-gray-800" : "text-white"}`}
    aria-hidden="true"
  >
    <path
      d="M3.5 8.5l3 3 6-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ParticipantStylePanel = () => {
  const mode = useAtomValue(modeAtom);
  const enabled = useAtomValue(enableParticipantStyleEditingAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const [selected, setSelected] = useAtom(selectedAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const dragState = useAtomValue(createMessageDragAtom);
  const textEditing = useAtomValue(textEditingAtom);
  const themeClasses = Array.from(diagramElement?.classList ?? [])
    .filter((name) => name.startsWith("theme-"))
    .join(" ");
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const participantName = selected[0] ?? null;

  const currentParticipant = participantName
    ? OrderedParticipants(rootContext).find((p) => p.name === participantName)
    : null;
  const currentColor = currentParticipant?.color?.toLowerCase() ?? null;
  const currentType = currentParticipant?.type ?? null;

  useEffect(() => {
    if (selected.length === 1 && diagramElement && !dragState && !textEditing) {
      const el = diagramElement.querySelector(
        `[data-participant-id="${selected[0]}"]`,
      ) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setPanelPos({ top: rect.bottom + 6, left: rect.left });
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setPanelPos(null);
    }
  }, [selected, diagramElement, dragState, textEditing]);

  // Clamp panel position to stay within viewport after it renders
  useEffect(() => {
    if (!isOpen || !panelRef.current || !panelPos) return;
    const panel = panelRef.current.getBoundingClientRect();
    let { top, left } = panelPos;
    const margin = 8;
    if (left + panel.width > window.innerWidth - margin) {
      left = window.innerWidth - panel.width - margin;
    }
    if (left < margin) left = margin;
    if (top + panel.height > window.innerHeight - margin) {
      top = panelPos.top - panel.height - 12; // flip above participant
    }
    if (top !== panelPos.top || left !== panelPos.left) {
      setPanelPos({ top, left });
    }
  }, [isOpen, panelPos]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelected([]);
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
  }, [isOpen, setSelected]);

  if (
    !enabled ||
    mode !== RenderMode.Dynamic ||
    !isOpen ||
    textEditing ||
    !participantName ||
    !panelPos
  ) {
    return null;
  }

  const applyStyle = (updates: {
    color?: string | null;
    type?: string | null;
  }) => {
    let workingCode = code;

    // If participant has no explicit declaration, insert one first
    const participants = OrderedParticipants(rootContext).filter(
      (p) => p.name !== _STARTER_,
    );
    const hasExplicitDecl = (rootContext?.head?.()?.participant?.() ?? []).some(
      (ctx: any) => ctx?.name()?.getFormattedText() === participantName,
    );
    if (!hasExplicitDecl) {
      const insertIndex = participants.findIndex(
        (p) => p.name === participantName,
      );
      workingCode = insertParticipantIntoDsl({
        code: workingCode,
        rootContext,
        insertIndex,
        name: participantName,
        type: (updates.type ?? "default") as ParticipantInsertType,
        color: updates.color,
        materializeExisting: true,
      });
      setCode(workingCode);
      onContentChange(workingCode);
      setIsOpen(false);
      setSelected([]);
      return;
    }

    const newCode = setParticipantStyleInDsl(
      workingCode,
      rootContext,
      participantName,
      updates,
    );
    if (newCode === workingCode) return;
    setCode(newCode);
    onContentChange(newCode);
    setIsOpen(false);
    setSelected([]);
  };

  const close = () => {
    setIsOpen(false);
    setSelected([]);
  };

  const activeColorName =
    PRESET_COLORS.find(({ hex }) => hex.toLowerCase() === currentColor)?.name ??
    currentColor;
  const activeTypeLabel =
    PARTICIPANT_TYPES.find(
      ({ key }) => key?.toLowerCase() === currentType?.toLowerCase(),
    )?.label ?? "Default";

  const sectionLabel =
    "text-[10px] uppercase tracking-wider text-gray-500 font-semibold";

  return (
    <FloatingPortal>
      <div className="zenuml">
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`Edit participant ${participantName}`}
          className={`bg-white rounded-xl shadow-xl ring-1 ring-black/5 w-[236px] text-gray-700 font-sans overflow-hidden ${themeClasses}`}
          style={{
            position: "fixed",
            zIndex: 50,
            top: panelPos.top,
            left: panelPos.left,
          }}
          data-testid="participant-style-panel"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <span
              className="w-3 h-3 shrink-0 rounded-full border border-gray-300"
              style={{ backgroundColor: currentColor ?? "transparent" }}
              aria-hidden="true"
            />
            <span
              className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-900"
              title={participantName}
            >
              {participantName}
            </span>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {activeTypeLabel}
            </span>
            <button
              type="button"
              className="shrink-0 -mr-1 w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              title="Close"
              aria-label="Close"
              onClick={close}
            >
              <svg viewBox="0 0 16 16" className="w-3 h-3" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="px-3 pt-2.5 pb-3 flex flex-col gap-3">
            <section className="flex flex-col gap-1.5">
              <div className={sectionLabel}>Type</div>
              <div className="grid grid-cols-4 gap-1">
                {PARTICIPANT_TYPES.map(({ key, label }) => {
                  const isActive =
                    (currentType?.toLowerCase() ?? null) ===
                    (key?.toLowerCase() ?? null);
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`flex flex-col items-center justify-center gap-1 h-[52px] rounded-lg border text-[10px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                        isActive
                          ? "border-sky-400 bg-sky-50 text-sky-700"
                          : "border-transparent text-gray-600 hover:bg-gray-100"
                      }`}
                      title={isActive ? `${label} (current)` : label}
                      aria-label={`Set type to ${label}`}
                      aria-pressed={isActive}
                      onClick={() => applyStyle({ type: key })}
                    >
                      <span className="h-6 flex items-center justify-center">
                        <TypeGlyph typeKey={key} />
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className={sectionLabel}>Color</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {activeColorName ?? "None"}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                <button
                  type="button"
                  className={`relative w-6 h-6 rounded-full border border-gray-300 bg-white overflow-hidden hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                    currentColor ? "" : "ring-2 ring-sky-400 ring-offset-1"
                  }`}
                  title={currentColor ? "No color" : "No color (current)"}
                  aria-label="Remove color"
                  aria-pressed={!currentColor}
                  onClick={() => applyStyle({ color: null })}
                >
                  <span className="absolute left-1/2 top-[-2px] h-[28px] w-[1.5px] -translate-x-1/2 rotate-45 bg-red-400" />
                </button>
                {PRESET_COLORS.map(({ hex, name }) => {
                  const isActive = currentColor === hex.toLowerCase();
                  return (
                    <button
                      key={hex}
                      type="button"
                      className={`w-6 h-6 rounded-full border flex items-center justify-center hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                        isActive
                          ? "border-transparent ring-2 ring-sky-400 ring-offset-1"
                          : "border-black/10"
                      }`}
                      style={{ backgroundColor: hex }}
                      title={isActive ? `${name} (current)` : name}
                      aria-label={`Set color to ${name}`}
                      aria-pressed={isActive}
                      onClick={() => applyStyle({ color: hex })}
                    >
                      {isActive && <CheckMark light={isLightColor(hex)} />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </FloatingPortal>
  );
};
