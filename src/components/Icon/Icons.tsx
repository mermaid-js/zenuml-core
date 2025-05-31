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
import IconAltFragment from "./icons/alt-fragment.svg?react";
import IconCriticalFragment from "./icons/critical-fragment.svg?react";
import IconLoopFragment from "./icons/loop-fragment.svg?react";
import IconOptFragment from "./icons/opt-fragment.svg?react";
import IconRefFragment from "./icons/ref-fragment.svg?react";
import IconParFragment from "./icons/par-fragment.svg?react";
import IconSectionFragment from "./icons/section-fragment.svg?react";
import IconTryCatchFragment from "./icons/try-catch-fragment.svg?react";

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
  "alt-fragment": IconAltFragment,
  "critical-fragment": IconCriticalFragment,
  "loop-fragment": IconLoopFragment,
  "opt-fragment": IconOptFragment,
  "ref-fragment": IconRefFragment,
  "par-fragment": IconParFragment,
  "section-fragment": IconSectionFragment,
  "try-catch-fragment": IconTryCatchFragment,
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
