import { cn } from "@/utils";
import { VIEWPORT_MARGIN, type Anchor } from "./usePickerPlacement";

const NAME_ROW_GAP = 8;

const rowInputClass =
  "h-zu-control box-border rounded-zu-md border border-solid px-1.5 text-[13px] text-gray-900 bg-white placeholder:text-gray-500 focus:outline-none focus:shadow-zu-focus";

type FieldHandlers = {
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

/**
 * The name / "as" label row under the participant box, with the error alert
 * and the DSL preview tooltip below it.
 */
export const NameRow = ({
  anchor,
  nameRowWidth,
  rowRef,
  rowClassName,
  nameDraft,
  nameError,
  onNameChange,
  nameHandlers,
  labelDraft,
  onLabelChange,
  labelHandlers,
  error,
  dslLine,
}: {
  anchor: Anchor;
  nameRowWidth: number;
  rowRef: (el: HTMLDivElement | null) => void;
  rowClassName: string;
  nameDraft: string;
  nameError: string | null;
  onNameChange: (value: string) => void;
  nameHandlers: FieldHandlers;
  labelDraft: string;
  onLabelChange: (value: string) => void;
  labelHandlers: FieldHandlers;
  error: string | null;
  dslLine: string;
}) => {
  const centerX = (anchor.left + anchor.right) / 2;
  const nameRowLeft = Math.max(
    VIEWPORT_MARGIN,
    Math.min(
      centerX - nameRowWidth / 2,
      window.innerWidth - nameRowWidth - VIEWPORT_MARGIN,
    ),
  );

  return (
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
        ref={rowRef}
        data-testid="participant-name-row"
        className={cn(
          "pointer-events-auto h-8 box-border flex items-center gap-1.5 px-1 bg-white rounded-zu-lg shadow-zu-pop-ring",
          rowClassName,
        )}
      >
        <label htmlFor="zenuml-participant-name" className="sr-only">
          Name
        </label>
        <input
          id="zenuml-participant-name"
          type="text"
          value={nameDraft}
          onChange={(e) => onNameChange(e.target.value)}
          aria-invalid={nameError ? true : undefined}
          {...nameHandlers}
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
          onChange={(e) => onLabelChange(e.target.value)}
          {...labelHandlers}
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
  );
};
