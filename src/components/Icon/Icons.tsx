import { cn } from "@/utils";
import IconCollapseExpanded from "./icons/collapse-expanded.svg?react";
import IconCollapseUnexpanded from "./icons/collapse-unexpanded.svg?react";
import IconDebug from "./icons/debug.svg?react";
import IconPrivacy from "./icons/privacy.svg?react";
import IconAltFragment from "./icons/alt-fragment.svg?react";
import IconCriticalFragment from "./icons/critical-fragment.svg?react";
import IconLoopFragment from "./icons/loop-fragment.svg?react";
import IconOptFragment from "./icons/opt-fragment.svg?react";
import IconRefFragment from "./icons/ref-fragment.svg?react";
import IconParFragment from "./icons/par-fragment.svg?react";
import IconSectionFragment from "./icons/section-fragment.svg?react";
import IconTryCatchFragment from "./icons/try-catch-fragment.svg?react";

const icons = {
  "collapse-expanded": IconCollapseExpanded,
  "collapse-unexpanded": IconCollapseUnexpanded,
  debug: IconDebug,
  privacy: IconPrivacy,
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
  name: keyof typeof icons;
  className?: string;
  onClick?: () => void;
}) => {
  const Component = icons[props.name];

  if (!Component) return null;

  return (
    <span
      className={cn(
        "flex items-center justify-center w-5 h-4",
        props.className,
      )}
      onClick={props.onClick}
    >
      <Component />
    </span>
  );
};

export default Icon;
