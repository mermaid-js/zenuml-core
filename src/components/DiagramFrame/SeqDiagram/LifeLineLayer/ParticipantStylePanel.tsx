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
import {
  formatParticipantDeclaration,
  readParticipantDeclaration,
  setParticipantStyleInDsl,
  type ParticipantUpdates,
} from "@/utils/participantStyleTransform";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import {
  normalizeParticipantName,
  renameParticipantInDsl,
} from "@/utils/participantRenameTransform";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { RootContext } from "@/parser";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { AsyncIcon } from "../../Tutorial/AsyncIcon";
import { listIconKeys } from "../../Tutorial/LazyIcons";

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

// The UML archetypes get a one-click chip; every other icon key (cloud
// providers etc.) is reachable through the search box below the chips.
const ARCHETYPES: { key: string | null; label: string }[] = [
  { key: null, label: "Default" },
  { key: "Actor", label: "Actor" },
  { key: "Boundary", label: "Boundary" },
  { key: "Control", label: "Control" },
  { key: "Entity", label: "Entity" },
  { key: "Database", label: "Database" },
  { key: "Queue", label: "Queue" },
];

const MAX_SEARCH_RESULTS = 8;
const PANEL_WIDTH = 320;

const normalizeKey = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

const isLightColor = (hex: string) => {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
};

const normalizeHex = (text: string) => {
  const match = text.trim().match(/^#?([0-9a-f]{6})$/i);
  return match ? `#${match[1].toLowerCase()}` : null;
};

const Stroke = ({ d, className }: { d: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className ?? "w-4 h-4"}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ArchetypeGlyph = ({ typeKey }: { typeKey: string | null }) => {
  if (!typeKey) {
    return (
      <span className="block w-5 h-3.5 rounded-[3px] border-[1.5px] border-current" />
    );
  }
  if (typeKey === "Queue") {
    return (
      <Stroke
        className="w-5 h-5"
        d="M6 7h12M6 17h12M6 7a2.5 5 0 0 0 0 10M18 7a2.5 5 0 1 0 0 10a2.5 5 0 1 0 0-10"
      />
    );
  }
  return (
    <AsyncIcon
      iconKey={typeKey.toLowerCase()}
      className="w-5 h-5 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
    />
  );
};

const fieldClass =
  "w-full h-8 box-border rounded-md border border-gray-200 bg-white px-2.5 text-[13px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-gray-600";

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
  const [hexDraft, setHexDraft] = useState("");
  useEffect(() => setNameDraft(participantName ?? ""), [participantName]);
  useEffect(() => setStereotypeDraft(currentStereotype), [currentStereotype]);
  useEffect(() => setLabelDraft(currentLabel), [currentLabel]);
  useEffect(() => setHexDraft(currentColor?.slice(1) ?? ""), [currentColor]);

  const [query, setQuery] = useState("");
  const [iconKeys, setIconKeys] = useState<string[] | null>(null);
  const [activeResult, setActiveResult] = useState(0);
  const ensureIconKeys = () => {
    if (iconKeys) return;
    void listIconKeys().then(setIconKeys);
  };
  const normalizedQuery = normalizeKey(query);
  const results =
    normalizedQuery && iconKeys
      ? iconKeys
          .filter((key) => key.includes(normalizedQuery))
          .sort((a, b) => a.length - b.length)
          .slice(0, MAX_SEARCH_RESULTS)
      : [];

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
    // `code` re-anchors the panel after an edit moves the participant box.
  }, [selected, diagramElement, dragState, textEditing, code]);

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
  const applyStyle = (updates: ParticipantUpdates) => {
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
    updateCode(
      setParticipantStyleInDsl(
        workingCode,
        workingRoot,
        participantName,
        updates,
      ),
    );
  };

  const commitName = () => {
    const next = normalizeParticipantName(nameDraft);
    if (!next || next === participantName) {
      setNameDraft(participantName);
      return;
    }
    const nextCode = renameParticipantInDsl(
      code,
      rootContext,
      participantName,
      next,
    );
    if (nextCode === code) return;
    updateCode(nextCode);
    // The identifier is stored unquoted in the participant model.
    setSelected([next.replace(/^"|"$/g, "")]);
  };

  const commitStereotype = () => {
    const next = stereotypeDraft.trim();
    if (next === currentStereotype) return;
    applyStyle({ stereotype: next || null });
  };

  const commitLabel = () => {
    const next = labelDraft.trim();
    if (next === currentLabel) return;
    applyStyle({ label: next || null });
  };

  const commitHex = () => {
    const next = normalizeHex(hexDraft);
    if (!next) {
      setHexDraft(currentColor?.slice(1) ?? "");
      return;
    }
    if (next !== currentColor) applyStyle({ color: next });
  };

  const pickIcon = (key: string) => {
    setQuery("");
    setActiveResult(0);
    applyStyle({ type: key });
  };

  const onEnterBlur = (commit: () => void) => ({
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
      }
      // Keep Escape inside the field from also closing the panel.
      e.stopPropagation();
    },
  });

  const activeArchetype = ARCHETYPES.find(
    ({ key }) =>
      (key?.toLowerCase() ?? null) === (currentType?.toLowerCase() ?? null),
  );
  const typeSummary = activeArchetype
    ? activeArchetype.label
    : currentType
      ? `@${currentType}`
      : "Default";
  const colorSummary =
    PRESET_COLORS.find(({ hex }) => hex === currentColor)?.name ??
    currentColor ??
    "None";
  const dslLine = formatParticipantDeclaration(
    declaration ?? { name: participantName },
  );

  return (
    <FloatingPortal>
      <div className="zenuml">
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`Edit participant ${participantName}`}
          className={cn(
            "participant-style-panel bg-white rounded-[10px] text-gray-700 font-sans overflow-hidden flex flex-col shadow-[0_10px_30px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.06)]",
            themeClasses,
          )}
          style={{
            position: "fixed",
            zIndex: 50,
            width: PANEL_WIDTH,
            top: panelPos.top,
            left: panelPos.left,
          }}
          data-testid="participant-style-panel"
        >
          <div className="flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 border-b border-gray-100">
            <label htmlFor="zenuml-participant-name" className={labelClass}>
              Name
            </label>
            <input
              id="zenuml-participant-name"
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              {...onEnterBlur(commitName)}
              className="flex-1 min-w-0 h-[30px] box-border rounded-md border border-transparent px-2 text-[15px] font-semibold text-gray-900 bg-white hover:border-gray-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              title="Close"
              aria-label="Close"
              onClick={close}
            >
              <Stroke d="M6 6l12 12M18 6L6 18" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 px-3.5 pt-3 pb-3.5">
            <section className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Type</span>
                <span className="text-[11px] text-gray-600 font-mono">
                  {typeSummary}
                </span>
              </div>
              <div className="flex gap-1">
                {ARCHETYPES.map(({ key, label }) => {
                  const isActive =
                    activeArchetype?.key === key && !!activeArchetype;
                  return (
                    <button
                      key={label}
                      type="button"
                      className={cn(
                        "w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                        isActive
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100",
                      )}
                      title={isActive ? `${label} (current)` : label}
                      aria-label={`Set type to ${label}`}
                      aria-pressed={isActive}
                      onClick={() => applyStyle({ type: key })}
                    >
                      <ArchetypeGlyph typeKey={key} />
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <Stroke
                    className="w-3.5 h-3.5"
                    d="M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM20 20l-4.5-4.5"
                  />
                </span>
                <input
                  type="search"
                  role="combobox"
                  aria-label="Search icons"
                  aria-expanded={results.length > 0}
                  aria-controls="zenuml-participant-icon-results"
                  aria-autocomplete="list"
                  placeholder="Search 500+ cloud icons (AWS, Azure, GCP)…"
                  value={query}
                  onFocus={ensureIconKeys}
                  onChange={(e) => {
                    ensureIconKeys();
                    setQuery(e.target.value);
                    setActiveResult(0);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveResult((i) =>
                        Math.min(i + 1, results.length - 1),
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveResult((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && results[activeResult]) {
                      e.preventDefault();
                      pickIcon(results[activeResult]);
                    } else if (e.key === "Escape") {
                      setQuery("");
                    }
                  }}
                  className={cn(fieldClass, "pl-[30px] text-[12px]")}
                />
                {results.length > 0 && (
                  <ul
                    id="zenuml-participant-icon-results"
                    role="listbox"
                    aria-label="Matching icons"
                    className="absolute left-0 right-0 top-full mt-1 z-10 list-none m-0 p-1 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col gap-0.5"
                  >
                    {results.map((key, index) => {
                      const isActive = index === activeResult;
                      return (
                        <li
                          key={key}
                          role="option"
                          aria-selected={isActive}
                          className={cn(
                            "flex items-center gap-2.5 h-[34px] px-2 rounded-md text-[12px] cursor-pointer",
                            isActive
                              ? "bg-sky-50 text-sky-900"
                              : "text-gray-900 hover:bg-gray-100",
                          )}
                          onPointerEnter={() => setActiveResult(index)}
                          onPointerDown={(e) => e.preventDefault()}
                          onClick={() => pickIcon(key)}
                        >
                          <AsyncIcon
                            iconKey={key}
                            className="w-[18px] h-[18px] shrink-0 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                          />
                          <span className="flex-1 min-w-0 truncate font-mono">
                            @{key}
                          </span>
                        </li>
                      );
                    })}
                    <li className="flex items-center justify-between h-[26px] px-2 text-[10px] text-gray-600">
                      <span>
                        {iconKeys
                          ? `${iconKeys.filter((k) => k.includes(normalizedQuery)).length} matches`
                          : "Loading…"}
                      </span>
                      <span>↑↓ move · Enter apply</span>
                    </li>
                  </ul>
                )}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="zenuml-participant-stereotype"
                  className={labelClass}
                >
                  Stereotype
                </label>
                <div className="relative">
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    «
                  </span>
                  <input
                    id="zenuml-participant-stereotype"
                    type="text"
                    value={stereotypeDraft}
                    placeholder="Service"
                    onChange={(e) => setStereotypeDraft(e.target.value)}
                    {...onEnterBlur(commitStereotype)}
                    className={cn(fieldClass, "px-5")}
                  />
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    »
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="zenuml-participant-label"
                  className={labelClass}
                >
                  Display as
                </label>
                <input
                  id="zenuml-participant-label"
                  type="text"
                  value={labelDraft}
                  placeholder="Same as name"
                  onChange={(e) => setLabelDraft(e.target.value)}
                  {...onEnterBlur(commitLabel)}
                  className={fieldClass}
                />
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Color</span>
                <span className="text-[11px] text-gray-600 font-mono">
                  {colorSummary}
                </span>
              </div>
              <div className="flex items-center gap-[5px]">
                <button
                  type="button"
                  className={cn(
                    "relative w-[22px] h-[22px] rounded-full border border-gray-300 bg-white overflow-hidden hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                    !currentColor && "ring-2 ring-sky-500 ring-offset-1",
                  )}
                  title={currentColor ? "No color" : "No color (current)"}
                  aria-label="Remove color"
                  aria-pressed={!currentColor}
                  onClick={() => applyStyle({ color: null })}
                >
                  <span className="absolute left-1/2 top-[-3px] h-[28px] w-[1.5px] -translate-x-1/2 rotate-45 bg-red-500" />
                </button>
                {PRESET_COLORS.map(({ hex, name }) => {
                  const isActive = currentColor === hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      className={cn(
                        "w-[22px] h-[22px] rounded-full border flex items-center justify-center hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                        isActive
                          ? "border-transparent ring-2 ring-sky-500 ring-offset-1"
                          : hex === "#ffffff"
                            ? "border-gray-300"
                            : "border-black/10",
                      )}
                      style={{ backgroundColor: hex }}
                      title={isActive ? `${name} (current)` : name}
                      aria-label={`Set color to ${name}`}
                      aria-pressed={isActive}
                      onClick={() => applyStyle({ color: hex })}
                    >
                      {isActive && (
                        <Stroke
                          className={cn(
                            "w-3 h-3 [&]:stroke-[2.4]",
                            isLightColor(hex) ? "text-gray-800" : "text-white",
                          )}
                          d="M5 12l4 4 10-10"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="relative w-[132px]">
                <span
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-500 font-mono pointer-events-none"
                  aria-hidden="true"
                >
                  #
                </span>
                <input
                  type="text"
                  aria-label="Custom hex color"
                  value={hexDraft}
                  placeholder="3b82f6"
                  maxLength={7}
                  spellCheck={false}
                  onChange={(e) => setHexDraft(e.target.value)}
                  {...onEnterBlur(commitHex)}
                  className={cn(
                    fieldClass,
                    "h-[30px] pl-[22px] text-[12px] font-mono",
                  )}
                />
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-1 px-3.5 pt-2.5 pb-3 bg-slate-50 border-t border-gray-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
              DSL
            </span>
            <code
              className="text-[11px] leading-relaxed text-gray-900 font-mono whitespace-pre-wrap break-all"
              data-testid="participant-dsl-preview"
            >
              {dslLine}
            </code>
            <span className="text-[10px] text-gray-600">
              Changes apply as you edit · Esc closes
            </span>
          </div>
        </div>
      </div>
    </FloatingPortal>
  );
};
