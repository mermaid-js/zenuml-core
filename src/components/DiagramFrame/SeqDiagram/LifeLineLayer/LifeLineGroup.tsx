import { Participants } from "@/parser";
import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom } from "@/store/Store";
// Constants
const LIFELINE_GROUP_OUTLINE_MARGIN = 2; // Small margin for group outline positioning

export const LifeLineGroup = (props: {
  context: any;
  renderParticipants: any;
  renderLifeLine: any;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const entities: any[] = Participants(props.context).Array();
  if (entities.length <= 0) return null;
  const left =
    coordinates.left(entities[0].name) + LIFELINE_GROUP_OUTLINE_MARGIN;
  const right =
    coordinates.right(entities[entities.length - 1].name) -
    LIFELINE_GROUP_OUTLINE_MARGIN;

  const name = props.context?.name()?.getFormattedText();
  // Merged the outer and middle divs while preserving all functionality
  return (
    <div
      className="lifeline-group-container absolute flex flex-col flex-grow h-full"
      style={{
        left: `${left}px`,
        width: `${right - left}px`,
      }}
    >
      {props.renderLifeLine && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="var(--color-outline-primary)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
      )}
      {props.renderParticipants && name && (
        <div className="z-10 absolute flex items-center justify-center w-full bg-skin-frame">
          <span className="font-semibold text-skin-lifeline-group-name">
            {name}
          </span>
        </div>
      )}

      <div className="lifeline-group relative flex-grow">
        {entities.map((entity) => (
          <LifeLine
            key={entity.name}
            entity={entity}
            groupLeft={left}
            renderLifeLine={props.renderLifeLine}
            renderParticipants={props.renderParticipants}
          />
        ))}
      </div>
    </div>
  );
};
