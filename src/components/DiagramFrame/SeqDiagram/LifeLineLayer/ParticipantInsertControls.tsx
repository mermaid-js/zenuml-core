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
const BUTTON_SIZE = 16;
const HIT_AREA_SIZE = 36;
const HIT_AREA_TOP = BUTTON_CENTER_Y - HIT_AREA_SIZE / 2;
const BUTTON_INSET = (HIT_AREA_SIZE - BUTTON_SIZE) / 2;

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
        <div
          key={index}
          className="group absolute -translate-x-1/2"
          style={{
            left,
            top: HIT_AREA_TOP,
            width: HIT_AREA_SIZE,
            height: HIT_AREA_SIZE,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            data-testid={`participant-insert-button-${index}`}
            title={`Insert participant between ${participantModels[index].name} and ${participantModels[index + 1].name}`}
            aria-label={`Insert participant between ${participantModels[index].name} and ${participantModels[index + 1].name}`}
            className="absolute flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 text-xs leading-none opacity-0 transition-all group-hover:opacity-80 hover:!opacity-100 hover:border-sky-400 hover:text-sky-500 hover:shadow-sm focus-visible:opacity-100 focus-visible:border-sky-400 focus-visible:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            style={{
              top: BUTTON_INSET,
              left: BUTTON_INSET,
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
            }}
            onClick={() => handleInsert(index + 1)}
          >
            +
          </button>
        </div>
      ))}
    </>
  );
};
