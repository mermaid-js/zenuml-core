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
} from "@/store/Store";
import { setParticipantStyleInDsl } from "@/utils/participantStyleTransform";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";

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

const PARTICIPANT_TYPES = [
  { key: "Actor", label: "Actor", icon: "👤" },
  { key: "Boundary", label: "Boundary", icon: "⬡" },
  { key: "Control", label: "Control", icon: "⟳" },
  { key: "Entity", label: "Entity", icon: "□" },
  { key: "Database", label: "Database", icon: "🗄" },
  { key: "Queue", label: "Queue", icon: "≡" },
];

export const ParticipantStylePanel = () => {
  const mode = useAtomValue(modeAtom);
  const enabled = useAtomValue(enableParticipantStyleEditingAtom);
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const [selected, setSelected] = useAtom(selectedAtom);
  const diagramElement = useAtomValue(diagramElementAtom);
  const dragState = useAtomValue(createMessageDragAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const participantName = selected[0] ?? null;

  const currentParticipant = participantName
    ? OrderedParticipants(rootContext).find((p) => p.name === participantName)
    : null;
  const currentColor = currentParticipant?.color?.toLowerCase() ?? null;
  const currentType = currentParticipant?.type ?? null;

  useEffect(() => {
    if (selected.length === 1 && diagramElement && !dragState) {
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
  }, [selected, diagramElement, dragState]);

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
    !participantName ||
    !panelPos
  ) {
    return null;
  }

  const applyStyle = (updates: { color?: string | null; type?: string | null }) => {
    let workingCode = code;
    const workingContext = rootContext;

    // If participant has no explicit declaration, insert one first
    const participants = OrderedParticipants(rootContext).filter(
      (p) => p.name !== _STARTER_,
    );
    const hasExplicitDecl =
      (rootContext?.head?.()?.participant?.() ?? []).some(
        (ctx: any) => ctx?.name()?.getFormattedText() === participantName,
      );
    if (!hasExplicitDecl) {
      const insertIndex = participants.findIndex((p) => p.name === participantName);
      workingCode = insertParticipantIntoDsl({
        code: workingCode,
        rootContext: workingContext,
        insertIndex,
        name: participantName,
        type: "default",
      });
      const newCode = setParticipantStyleInDsl(workingCode, workingContext, participantName, updates);
      const finalCode = newCode !== workingCode ? newCode : workingCode;
      setCode(finalCode);
      onContentChange(finalCode);
      setIsOpen(false);
      setSelected([]);
      return;
    }

    const newCode = setParticipantStyleInDsl(workingCode, workingContext, participantName, updates);
    if (newCode === workingCode) return;
    setCode(newCode);
    onContentChange(newCode);
    setIsOpen(false);
    setSelected([]);
  };

  return (
    <FloatingPortal>
    <div
      ref={panelRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2"
      style={{ position: "fixed", zIndex: 50, minWidth: 180, top: panelPos.top, left: panelPos.left }}
      data-testid="participant-style-panel"
    >
      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-1">Color</div>
      <div className="flex flex-wrap gap-1 px-1">
        {PRESET_COLORS.map(({ hex, name }) => {
          const isActive = currentColor === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              className={`w-5 h-5 rounded-full border hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                isActive ? "border-sky-500 ring-2 ring-sky-400 ring-offset-1" : "border-gray-300"
              }`}
              style={{ backgroundColor: hex }}
              title={isActive ? `${name} (current)` : name}
              aria-label={`Set color to ${name}`}
              aria-pressed={isActive}
              onClick={() => applyStyle({ color: hex })}
            />
          );
        })}
        <button
          type="button"
          className="w-5 h-5 rounded-full border border-dashed border-gray-400 text-gray-400 text-[9px] hover:scale-110 transition-transform flex items-center justify-center"
          title="Remove color"
          aria-label="Remove color"
          onClick={() => applyStyle({ color: null })}
        >
          ✕
        </button>
      </div>

      <div className="w-full h-px bg-gray-100" />

      <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold px-1">Type</div>
      <div className="flex flex-wrap gap-1 px-1">
        {PARTICIPANT_TYPES.map(({ key, label, icon }) => {
          const isActive = currentType?.toLowerCase() === key.toLowerCase();
          return (
            <button
              key={key}
              type="button"
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded border text-[10px] min-w-[36px] hover:bg-gray-100 ${
                isActive
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-gray-200 text-gray-700"
              }`}
              title={isActive ? `${label} (current)` : `Set type to ${label}`}
              aria-label={`Set type to ${label}`}
              aria-pressed={isActive}
              onClick={() => applyStyle({ type: key })}
            >
              <span className="text-sm leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded border border-dashed border-gray-300 text-gray-400 hover:bg-gray-100 text-[10px] min-w-[36px]"
          title="Remove type"
          aria-label="Remove type"
          onClick={() => applyStyle({ type: null })}
        >
          <span className="text-sm leading-none">□</span>
          <span>None</span>
        </button>
      </div>
    </div>
    </FloatingPortal>
  );
};
