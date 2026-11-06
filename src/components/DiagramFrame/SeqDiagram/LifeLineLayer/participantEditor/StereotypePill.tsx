import type { Anchor } from "./usePickerPlacement";

const PILL_TOP = -32;

/**
 * The «stereotype» pill above the participant box: an input while a
 * stereotype is set or being added, else an "Add stereotype" button.
 */
export const StereotypePill = ({
  anchor,
  editing,
  setEditing,
  currentStereotype,
  draft,
  onDraftChange,
  handlers,
}: {
  anchor: Anchor;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  currentStereotype: string;
  draft: string;
  onDraftChange: (value: string) => void;
  handlers: {
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };
}) => {
  const centerX = (anchor.left + anchor.right) / 2;
  const showInput = editing || !!currentStereotype;

  return showInput ? (
    <div
      className="absolute pointer-events-auto h-zu-control min-w-[104px] box-border flex items-center justify-center gap-0.5 px-2 rounded-full border border-solid border-gray-300 bg-white text-[12px] text-gray-900 focus-within:shadow-zu-focus"
      style={{
        left: centerX,
        top: anchor.top + PILL_TOP,
        transform: "translateX(-50%)",
      }}
    >
      <label htmlFor="zenuml-participant-stereotype" className="sr-only">
        Stereotype
      </label>
      <span className="text-gray-500" aria-hidden="true">
        «
      </span>
      <input
        id="zenuml-participant-stereotype"
        type="text"
        value={draft}
        size={Math.max(draft.length, 8)}
        autoFocus={editing && !currentStereotype}
        onChange={(e) => onDraftChange(e.target.value)}
        onBlur={() => {
          handlers.onBlur();
          setEditing(false);
        }}
        onKeyDown={(e) => {
          handlers.onKeyDown(e);
          // An erased stereotype turns back into the placeholder.
          if (e.key === "Enter" && !draft.trim()) {
            setEditing(false);
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
      onClick={() => setEditing(true)}
    >
      «stereotype»
    </button>
  );
};
