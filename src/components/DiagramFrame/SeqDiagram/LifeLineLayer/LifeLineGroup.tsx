import { Participants } from "@/parser";
import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom } from "@/store/Store";
import { cn } from "@/utils";

// Constants
const LIFELINE_GROUP_OUTLINE_MARGIN = 2; // Small margin for group outline positioning

export const LifeLineGroup = (props: {
  context: any;
  renderParticipants: any;
  renderLifeLine: any;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);
  const entities: any[] = Participants(props.context).Array();
  const left =
    coordinates.left(entities[0].name) + LIFELINE_GROUP_OUTLINE_MARGIN;
  const right =
    coordinates.right(entities[entities.length - 1].name) -
    LIFELINE_GROUP_OUTLINE_MARGIN;
  const name = props.context?.name()?.getFormattedText();

  if (!entities.length) return null;
  // Merged the outer and middle divs while preserving all functionality
  return (
    <div
      className={cn(
        "lifeline-group-container absolute flex flex-col flex-grow h-full",
        { "outline-dashed outline-skin-primary": props.renderLifeLine },
      )}
      style={{
        left: `${left}px`,
        width: `${right - left}px`,
      }}
    >
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
