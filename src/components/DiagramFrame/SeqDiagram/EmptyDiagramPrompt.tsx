import { useCommitCode } from "@/store/useCommitCode";
import { codeAtom, modeAtom, RenderMode } from "@/store/Store";
import { useAtomValue } from "jotai";

export const EmptyDiagramPrompt = () => {
  const mode = useAtomValue(modeAtom);
  const code = useAtomValue(codeAtom);
  const commitCode = useCommitCode();

  if (mode !== RenderMode.Dynamic) return null;

  const handleClick = () => {
    const nextCode = code.trim() ? `${code.trim()}\nA` : "A";
    commitCode(nextCode);
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 120 }}
    >
      <button
        type="button"
        data-testid="empty-diagram-prompt"
        onClick={handleClick}
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-8 py-6 text-slate-400 transition-colors hover:border-sky-400 hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-sm">Click to add your first participant</span>
      </button>
    </div>
  );
};
