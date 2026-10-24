import { MouseEvent, KeyboardEvent } from "react";
import { swallowFollowUps } from "@/store/interaction/swallowFollowUps";

/** The only pointer target that can start a message reorder. */
export const MessageReorderHandle = () => (
  <button
    type="button"
    className="message-reorder-handle hide-export"
    data-cap="reorder"
    aria-label="Drag to reorder message"
    title="Drag to reorder message"
    onPointerDownCapture={() => {
      // A browser can retarget the click after a drag to the message under
      // the release point. Consume that click before it opens the toolbar.
      swallowFollowUps(["click"]);
    }}
    onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
    onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.stopPropagation();
      }
    }}
  >
    <span className="message-reorder-handle-visual" aria-hidden="true">
      <svg width="32" height="14" viewBox="0 0 32 14" aria-hidden="true">
        {[4.5, 9.5].flatMap((cy) =>
          [10, 16, 22].map((cx) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" />
          )),
        )}
      </svg>
    </span>
  </button>
);
