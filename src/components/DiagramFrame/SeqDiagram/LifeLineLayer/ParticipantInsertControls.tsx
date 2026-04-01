import { useOutsideClick } from "@/functions/useOutsideClick";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { coordinatesAtom, modeAtom, onContentChangeAtom, RenderMode, rootContextAtom } from "@/store/Store";
import type { ParticipantInsertType } from "@/utils/participantInsertTransform";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { cn } from "@/utils";
import { useAtom, useAtomValue } from "jotai";
import { codeAtom } from "@/store/Store";
import { useMemo, useRef, useState } from "react";

const PARTICIPANT_TYPES: ParticipantInsertType[] = [
  "default",
  "Actor",
  "Boundary",
  "Control",
  "Entity",
  "Database",
  "Queue",
];

const BUTTON_TOP = 74;
const PANEL_TOP = 108;

export const ParticipantInsertControls = () => {
  const mode = useAtomValue(modeAtom);
  const coordinates = useAtomValue(coordinatesAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const [code, setCode] = useAtom(codeAtom);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeGap, setActiveGap] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<ParticipantInsertType>("default");

  const participantModels = useMemo(
    () =>
      OrderedParticipants(rootContext)
        .filter((participant) => participant.name !== _STARTER_),
    [rootContext],
  );

  const gapAnchors = useMemo(() => {
    if (participantModels.length === 0) {
      return [];
    }
    const centers = participantModels.map((participant) =>
      coordinates.getPosition(participant.name)
    );
    const leftEdge = Math.max(12, coordinates.left(participantModels[0].name) - 32);
    const anchors = [leftEdge];
    for (let index = 0; index < centers.length - 1; index += 1) {
      anchors.push((centers[index] + centers[index + 1]) / 2);
    }
    anchors.push(coordinates.right(participantModels[participantModels.length - 1].name) + 32);
    return anchors;
  }, [coordinates, participantModels]);

  const submit = () => {
    const nextName = name.trim();
    if (!nextName || !rootContext) {
      return;
    }
    const nextCode = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex: activeGap ?? participantModels.length,
      name: nextName,
      type,
    });
    setCode(nextCode);
    onContentChange(nextCode);
    setActiveGap(null);
    setName("");
    setType("default");
  };

  useOutsideClick(panelRef.current, () => {
    setActiveGap(null);
  });

  if (mode !== RenderMode.Dynamic || participantModels.length === 0) {
    return null;
  }

  return (
    <>
      {gapAnchors.map((left, index) => (
        <div
          key={index}
          data-testid={`participant-insert-gap-${index}`}
          className="group absolute -translate-x-1/2 w-8 h-12"
          style={{ left, top: BUTTON_TOP - 8, pointerEvents: "auto" }}
          onMouseEnter={() => {
            if (activeGap == null) {
              setName("");
              setType("default");
            }
          }}
        >
          <button
            type="button"
            data-testid={`participant-insert-button-${index}`}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 h-8 w-8 rounded-full border border-sky-300 bg-white text-sky-600 shadow-sm transition-opacity",
              "hover:bg-sky-50",
              activeGap === index
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
            style={{ top: BUTTON_TOP }}
            onClick={() => {
              setActiveGap(index);
              setName("");
              setType("default");
            }}
          >
            +
          </button>
        </div>
      ))}
      {activeGap != null && gapAnchors[activeGap] != null && (
        <div
          ref={panelRef}
          className="absolute z-40 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          style={{
            left: gapAnchors[activeGap],
            top: PANEL_TOP,
            transform: "translateX(-50%)",
            pointerEvents: "auto",
          }}
        >
          <label className="mb-2 block text-xs font-medium text-slate-600">
            Participant Name
          </label>
          <input
            data-testid="participant-insert-name"
            className="mb-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-400"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
          <label className="mb-2 block text-xs font-medium text-slate-600">
            Type
          </label>
          <select
            data-testid="participant-insert-type"
            className="mb-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-sky-400"
            value={type}
            onChange={(event) =>
              setType(event.target.value as ParticipantInsertType)
            }
          >
            {PARTICIPANT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option === "default" ? "Default" : option}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              onClick={() => setActiveGap(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="participant-insert-submit"
              className="rounded-md bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
              onClick={submit}
            >
              Insert
            </button>
          </div>
        </div>
      )}
    </>
  );
};
