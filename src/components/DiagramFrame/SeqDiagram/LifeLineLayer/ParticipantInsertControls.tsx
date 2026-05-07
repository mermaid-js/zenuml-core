import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import {
  coordinatesAtom,
  enableParticipantInsertionAtom,
  modeAtom,
  onContentChangeAtom,
  RenderMode,
  rootContextAtom,
} from "@/store/Store";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { MARGIN } from "@/positioning/Constants";
import { useAtom, useAtomValue } from "jotai";
import { codeAtom } from "@/store/Store";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

interface AnchorCoordinates {
  // DOM-measured edges of the rendered participant box, relative to the
  // insert-controls layer.
  boxLeft(name: string): number;
  boxRight(name: string): number;
}

// Fixed offset from the leading/trailing participant edge to its prepend/
// append "+" button. Chosen so the leading/trailing buttons are at the same
// distance from the participant regardless of how many participants exist.
const EDGE_BUTTON_OFFSET = MARGIN / 2;

// Midpoint of the gap between two adjacent participants. Both DOM boxes have
// symmetric internal padding, so the box-edge midpoint equals the visible-
// content midpoint.
export const computeGapAnchor = (
  coordinates: AnchorCoordinates,
  leftName: string,
  rightName: string,
): number =>
  (coordinates.boxRight(leftName) + coordinates.boxLeft(rightName)) / 2;

export const computeAppendAnchor = (
  coordinates: AnchorCoordinates,
  participantNames: string[],
): number | null => {
  if (participantNames.length === 0) return null;
  const last = participantNames[participantNames.length - 1];
  return coordinates.boxRight(last) + EDGE_BUTTON_OFFSET;
};

export const computePrependAnchor = (
  coordinates: AnchorCoordinates,
  participantNames: string[],
): number | null => {
  if (participantNames.length === 0) return null;
  const first = participantNames[0];
  return coordinates.boxLeft(first) - EDGE_BUTTON_OFFSET;
};

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
  const enabled = useAtomValue(enableParticipantInsertionAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
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

  const participantNames = useMemo(
    () => participantModels.map((p) => p.name),
    [participantModels],
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [domEdges, setDomEdges] = useState<
    Record<string, { boxLeft: number; boxRight: number }>
  >({});

  useLayoutEffect(() => {
    if (!sentinelRef.current || participantNames.length === 0) return;
    const sentinelLeft = sentinelRef.current.getBoundingClientRect().left;
    const next: Record<string, { boxLeft: number; boxRight: number }> = {};
    for (const name of participantNames) {
      const el = document.querySelector(
        `[data-participant-id="${CSS.escape(name)}"]`,
      );
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[name] = {
        boxLeft: r.left - sentinelLeft,
        boxRight: r.right - sentinelLeft,
      };
    }
    setDomEdges(next);
  }, [participantNames, coordinates]);

  const anchorCoordinates: AnchorCoordinates = useMemo(
    () => ({
      // Layout edges are inset by MARGIN/2 to approximate the DOM box for the
      // first render before useLayoutEffect runs.
      boxLeft: (name: string) =>
        domEdges[name]?.boxLeft ?? coordinates.left(name) + MARGIN / 2,
      boxRight: (name: string) =>
        domEdges[name]?.boxRight ?? coordinates.right(name) - MARGIN / 2,
    }),
    [coordinates, domEdges],
  );

  const gapAnchors = useMemo(() => {
    if (participantModels.length < 2) return [];
    const anchors: number[] = [];
    for (let i = 0; i < participantModels.length - 1; i++) {
      anchors.push(
        computeGapAnchor(
          anchorCoordinates,
          participantModels[i].name,
          participantModels[i + 1].name,
        ),
      );
    }
    return anchors;
  }, [anchorCoordinates, participantModels]);

  const prependAnchor = useMemo(
    () => computePrependAnchor(anchorCoordinates, participantNames),
    [anchorCoordinates, participantNames],
  );

  const appendAnchor = useMemo(
    () => computeAppendAnchor(anchorCoordinates, participantNames),
    [anchorCoordinates, participantNames],
  );

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

  if (
    !enabled ||
    mode !== RenderMode.Dynamic ||
    participantModels.length === 0
  ) {
    return null;
  }

  const insertButtonClass = "absolute flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 text-xs leading-none opacity-0 transition-all group-hover:opacity-80 hover:!opacity-100 hover:border-sky-400 hover:text-sky-500 hover:shadow-sm focus-visible:opacity-100 focus-visible:border-sky-400 focus-visible:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";
  const insertButtonStyle = { top: BUTTON_INSET, left: BUTTON_INSET, width: BUTTON_SIZE, height: BUTTON_SIZE };

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
      />
      {prependAnchor !== null && (
        <div
          className="group absolute -translate-x-1/2"
          style={{
            left: prependAnchor,
            top: HIT_AREA_TOP,
            width: HIT_AREA_SIZE,
            height: HIT_AREA_SIZE,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            data-testid="participant-prepend-button"
            title="Add participant"
            aria-label="Add participant at the start"
            className={insertButtonClass}
            style={insertButtonStyle}
            onClick={() => handleInsert(0)}
          >
            +
          </button>
        </div>
      )}
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
            className={insertButtonClass}
            style={insertButtonStyle}
            onClick={() => handleInsert(index + 1)}
          >
            +
          </button>
        </div>
      ))}
      {appendAnchor !== null && (
        <div
          className="group absolute -translate-x-1/2"
          style={{
            left: appendAnchor,
            top: HIT_AREA_TOP,
            width: HIT_AREA_SIZE,
            height: HIT_AREA_SIZE,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            data-testid="participant-append-button"
            title="Add participant"
            aria-label="Add participant"
            className={insertButtonClass}
            style={insertButtonStyle}
            onClick={() => handleInsert(participantModels.length)}
          >
            +
          </button>
        </div>
      )}
    </>
  );
};
