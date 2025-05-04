import { cn } from "@/utils";
import { FC } from "react";
import IconClose from "./icons/close.svg?react";
import IconCollapseExpanded from "./icons/collapse-expanded.svg?react";
import IconCollapseUnexpanded from "./icons/collapse-unexpanded.svg?react";
import IconDebug from "./icons/debug.svg?react";
import IconMessageArrow from "./icons/message-arrow.svg?react";
import IconNonSelectedCycle from "./icons/non-selected-cycle.svg?react";
import IconNumbering from "./icons/numbering.svg?react";
import IconPrivacy from "./icons/privacy.svg?react";
import IconSelectedCycle from "./icons/selected-cycle.svg?react";
import IconTheme from "./icons/theme.svg?react";
import IconTip from "./icons/tip.svg?react";
import IconZoomIn from "./icons/zoom-in.svg?react";
import IconZoomOut from "./icons/zoom-out.svg?react";

const icons: { [key: string]: FC } = {
  close: IconClose,
  "collapse-expanded": IconCollapseExpanded,
  "collapse-unexpanded": IconCollapseUnexpanded,
  debug: IconDebug,
  "message-arrow": IconMessageArrow,
  "non-selected-cycle": IconNonSelectedCycle,
  numerical: IconNumbering,
  privacy: IconPrivacy,
  "selected-cycle": IconSelectedCycle,
  theme: IconTheme,
  tip: IconTip,
  "zoom-in": IconZoomIn,
  "zoom-out": IconZoomOut,
};

const Icon = (props: {
  name: string;
  className?: string;
  onClick?: () => void;
}) => {
  const Component = icons[props.name];

  if (!Component) return null;

  return (
    <span
      className={cn(
        "flex items-center justify-center w-4 h-4",
        props.className,
      )}
      onClick={props.onClick}
    >
      <Component />
    </span>
  );
};

export default Icon;
