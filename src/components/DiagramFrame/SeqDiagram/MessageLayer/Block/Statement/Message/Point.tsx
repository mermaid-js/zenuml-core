import { cn } from "@/utils";
import { ArrowHead } from "./ArrowHead";

export const Point = (props: {
  fill: boolean;
  rtl: boolean;
  className: string;
  style?: React.CSSProperties;
}) => {
  const { fill, rtl, className, style } = props;
  return (
    <div
      className={cn(
        "point text-skin-message-arrow",
        props.fill ? "filled" : "open",
        {
          "right-to-left": props.rtl,
        },
        className,
      )}
      style={style}
    >
      <ArrowHead fill={fill} rtl={rtl} className="arrow stroke-2" />
    </div>
  );
};
