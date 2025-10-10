import { cn } from "@/utils";

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
      {!rtl && fill && (
        <svg
          className="arrow stroke-2"
          height="10"
          width="10"
          viewBox="0 0 3 6"
        >
          <path
            d="M4.42834 2.657C4.68727 2.81236 4.68727 3.18764 4.42834 3.343L0.605799 5.63652C0.339189 5.79649 1.66376e-08 5.60444 2.97152e-08 5.29352L2.22651e-07 0.706476C2.35729e-07 0.395559 0.339189 0.203513 0.605799 0.363479L4.42834 2.657Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )}
      {!rtl && !fill && (
        <svg
          className="arrow stroke-2"
          height="10"
          width="10"
          viewBox="0 0 2 8.5"
        >
          <path
            d="M1 1L4.14331 4.29299C4.14704 4.2969 4.14699 4.30306 4.1432 4.30691L1 7.5"
            stroke="currentColor"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
      {rtl && fill && (
        <svg
          className="arrow stroke-2"
          height="10"
          width="10"
          viewBox="1 0 5 6"
        >
          <path
            d="M0.571662 2.657C0.312726 2.81236 0.312726 3.18764 0.571662 3.343L4.3942 5.63652C4.66081 5.79649 5 5.60444 5 5.29352L5 0.706476C5 0.395559 4.66081 0.203513 4.3942 0.363479L0.571662 2.657Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      )}
      {rtl && !fill && (
        <svg
          className="arrow stroke-2"
          height="10"
          width="10"
          viewBox="2 0 5 9"
        >
          <path
            d="M4.14844 1L1.00441 4.54711C1.00101 4.55094 1.00106 4.55671 1.00451 4.56049L4.14844 8"
            stroke="currentColor"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
};
