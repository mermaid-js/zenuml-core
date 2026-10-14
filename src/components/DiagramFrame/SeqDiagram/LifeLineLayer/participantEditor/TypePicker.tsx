import { participantPreviewAtom } from "@/store/Store";
import { cn } from "@/utils";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { AsyncIcon } from "../../../Tutorial/AsyncIcon";
import { listIconKeys } from "../../../Tutorial/LazyIcons";
import { ARCHETYPES } from "./palette";

const MAX_SEARCH_RESULTS = 8;

const normalizeKey = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

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

export const ArchetypeGlyph = ({ typeKey }: { typeKey: string }) => {
  return (
    <AsyncIcon
      iconKey={typeKey.toLowerCase()}
      className="w-5 h-5 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
    />
  );
};

export type TypePickerProps = {
  participantName: string;
  currentType: string | null;
  onPick: (key: string) => void;
  onClose: () => void;
};

export const TypePicker = ({
  participantName,
  currentType,
  onPick,
  onClose,
}: TypePickerProps) => {
  const setPreview = useSetAtom(participantPreviewAtom);
  const [query, setQuery] = useState("");
  const [iconKeys, setIconKeys] = useState<string[] | null>(null);
  const [activeResult, setActiveResult] = useState(0);

  // Hover preview never outlives the picker.
  useEffect(() => () => setPreview(null), [setPreview]);

  const preview = (type: string) => setPreview({ name: participantName, type });
  const pick = (key: string) => {
    setPreview(null);
    onPick(key);
  };

  const ensureIconKeys = () => {
    if (iconKeys) return;
    void listIconKeys().then(setIconKeys);
  };
  const normalizedQuery = normalizeKey(query);
  const matches =
    normalizedQuery && iconKeys
      ? iconKeys.filter((key) => key.includes(normalizedQuery))
      : [];
  const results = [...matches]
    .sort((a, b) => a.length - b.length)
    .slice(0, MAX_SEARCH_RESULTS);

  const current = currentType?.toLowerCase() ?? null;

  return (
    <div
      role="dialog"
      aria-label="Participant type"
      className="w-[220px] box-border p-2.5 rounded-[10px] bg-white border border-gray-200 shadow-lg flex flex-col gap-2"
      onPointerLeave={() => setPreview(null)}
    >
      <div className="flex gap-[3px]">
        {ARCHETYPES.map(({ key, label }) => {
          const isActive = key.toLowerCase() === current;
          return (
            <button
              key={key}
              type="button"
              className={cn(
                "w-[30px] h-[30px] flex items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                isActive
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100",
              )}
              title={label}
              aria-label={label}
              aria-pressed={isActive}
              onPointerEnter={() => preview(key)}
              onClick={() => pick(key)}
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
          placeholder="Search 500+ cloud icons…"
          value={query}
          onFocus={ensureIconKeys}
          onChange={(e) => {
            ensureIconKeys();
            setQuery(e.target.value);
            setActiveResult(0);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              if (query) setQuery("");
              else onClose();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveResult((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveResult((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeResult]) {
              e.preventDefault();
              pick(results[activeResult]);
            }
          }}
          className="w-full h-7 box-border rounded-md border border-gray-200 bg-white pl-[30px] pr-2 text-[12px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                    "flex items-center gap-2 h-[26px] px-2 rounded-md text-[12px] cursor-pointer",
                    isActive
                      ? "bg-sky-50 text-sky-900"
                      : "text-gray-900 hover:bg-gray-100",
                  )}
                  onPointerEnter={() => {
                    setActiveResult(index);
                    preview(key);
                  }}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => pick(key)}
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
            <li className="flex items-center justify-between h-[22px] px-2 text-[10px] text-gray-600">
              <span>{`${matches.length} matches`}</span>
              <span>↑↓ move · Enter apply</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
