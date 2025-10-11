import { cn } from "@/utils";
import { getStyle } from "@/utils/messageStyling";
import type { DividerVM } from "@/vm/divider";

export const Divider = (props: {
  className?: string;
  vm?: DividerVM;
}) => {
  // Use VM data exclusively (fail early if missing)
  const width = props.vm?.width || 0;
  const translateX = props.vm?.translateX || 0;
  const messageStyle = {
    style: getStyle(props.vm?.styling?.styles || []),
    note: props.vm?.note || "",
  };

  return (
    <div
      className={cn("divider flex items-center", props.className)}
      data-origin={props.vm.origin}
      style={{
        width: width + "px",
        transform: "translateX(" + translateX + "px)",
      }}
    >
      <div className="left bg-skin-divider flex-1 h-px"></div>
      <div
        style={messageStyle.style.textStyle}
        className={cn("name text-center px-2", messageStyle.style.classNames)}
      >
        {messageStyle.note}
      </div>
      <div className="right bg-skin-divider flex-1 h-px"></div>
    </div>
  );
};
