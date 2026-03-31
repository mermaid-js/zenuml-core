import { Participants } from "@/parser";
import { LifeLine } from "./LifeLine";
import { useAtomValue } from "jotai";
import { coordinatesAtom } from "@/store/Store";

// Constants — match SVG renderer's group.ts stroke model
const LIFELINE_GROUP_OUTLINE_MARGIN = 2;
const GROUP_STROKE_WIDTH = 1.5;
const GROUP_SW2 = GROUP_STROKE_WIDTH / 2; // 0.75
const GROUP_STROKE_COLOR = "#666";
const GROUP_DASH_ARRAY = "4 3";

// The SVG renderer (group.ts) shifts the rect outward by sw2 on each side:
//   rectX = g.x - sw2,  rectW = g.width + sw
//   rectY = g.y - sw - 0.5,  rectH = g.height + sw + 0.5
// The HTML div is at (g.x, g.y) with dimensions (g.width, g.height) — approximately.
// To match the SVG stroke center, the overlay rect must be shifted outward by sw2.
const RECT_X = -GROUP_SW2;        // -0.75
const RECT_Y = -GROUP_SW2 + 0.25; // -0.50  (matches group.ts: rectY = g.y - sw - 0.5 vs div at g.y)

/**
 * SVG overlay that draws a dashed group border matching the native SVG renderer.
 * The SVG viewport is expanded by GROUP_STROKE_WIDTH in each direction via CSS,
 * and offset by RECT_X/RECT_Y. The rect fills 100% of this expanded viewport
 * so the centered stroke aligns exactly with group.ts output.
 */
const GroupOutline = () => (
  <svg
    data-group-overlay=""
    style={{
      position: "absolute",
      top: RECT_Y,
      left: RECT_X,
      width: `calc(100% + ${GROUP_STROKE_WIDTH}px)`,
      height: `calc(100% + ${GROUP_STROKE_WIDTH}px)`,
      pointerEvents: "none",
      overflow: "visible",
    }}
  >
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="none"
      stroke={GROUP_STROKE_COLOR}
      strokeWidth={GROUP_STROKE_WIDTH}
      strokeDasharray={GROUP_DASH_ARRAY}
    />
  </svg>
);

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
  return (
    <div
      className="lifeline-group-container absolute flex flex-col flex-grow h-full"
      style={{
        left: `${left}px`,
        width: `${right - left}px`,
      }}
    >
      {props.renderLifeLine && <GroupOutline />}
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
