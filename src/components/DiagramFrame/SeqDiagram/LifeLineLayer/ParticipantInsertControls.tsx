import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  coordinatesAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
  rootContextAtom,
  selectedAtom,
} from "@/store/Store";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { codeAtom } from "@/store/Store";
import { useMemo } from "react";

const BUTTON_CENTER_Y = 40;
const BUTTON_SIZE = 22;
const BUTTON_TOP = BUTTON_CENTER_Y - BUTTON_SIZE / 2;

const generateName = (existingNames: Set<string>) => {
  for (let i = 1; ; i++) {
    const candidate = String.fromCharCode(64 + i);
    if (candidate.length === 1 && i <= 26 && !existingNames.has(candidate)) {
      return candidate;
    }
    if (i > 26) {
      const fallback = `P${i - 26}`;
      if (!existingNames.has(fallback)) return fallback;
    }
  }
};

export const ParticipantInsertControls = () => {
  const mode = useAtomValue(modeAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const selectedParticipants = useAtomValue(selectedAtom);
  const [code, setCode] = useAtom(codeAtom);

  const participantModels = useMemo(
    () =>
      OrderedParticipants(rootContext)
        .filter((participant) => participant.name !== _STARTER_),
    [rootContext],
  );

  const existingNames = useMemo(
    () => new Set(participantModels.map((p) => p.name)),
    [participantModels],
  );

  const GAP_MARGIN = 4;

  const gapAnchors = useMemo(() => {
    if (participantModels.length < 2) return [];
    const anchors: number[] = [];

    for (let i = 0; i < participantModels.length - 1; i++) {
      const rightEdge = coordinates.right(participantModels[i].name);
      const leftEdge = coordinates.left(participantModels[i + 1].name);
      anchors.push((rightEdge + leftEdge) / 2);
    }

    return anchors;
  }, [coordinates, participantModels]);

  const handleInsert = (insertIndex: number) => {
    if (!rootContext) return;
    const name = generateName(existingNames);
    const nextCode = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex,
      name,
      type: "default",
    });
    setCode(nextCode);
    onContentChange(nextCode);
  };

  if (mode !== RenderMode.Dynamic || participantModels.length === 0) {
    return null;
  }

  return (
    <>
      {gapAnchors.map((left, index) => (
        <button
          key={index}
          type="button"
          data-testid={`participant-insert-button-${index}`}
          title="Add participant"
          className={cn(
            "absolute -translate-x-1/2 flex items-center justify-center rounded-full border border-sky-300 bg-white text-sky-600 shadow-sm text-lg font-bold leading-none transition-opacity hover:bg-sky-50",
            selectedParticipants.length > 0
              ? "opacity-70 hover:opacity-100"
              : "opacity-40 hover:opacity-100",
          )}
          style={{
            left,
            top: BUTTON_TOP,
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            pointerEvents: "auto",
          }}
          onClick={() => handleInsert(index + 1)}
        >
          +
        </button>
      ))}
    </>
  );
};
