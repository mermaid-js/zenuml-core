import Icon from "@/components/Icon/Icons";
import styles from "./index.module.css";
import { cn } from "@/utils";

export const Privacy = (props: { className: string }) => {
  return (
    <div className={props.className}>
      <div
        className={cn(
          styles.tooltip,
          styles.bottom,
          "privacy whitespace-normal flex items-center",
        )}
        data-tooltip="We (the vendor) do not have access to your data. The diagram is generated in this browser."
      >
        <Icon name="privacy" className="fill-current h-6 w-6 m-auto" />
      </div>
    </div>
  );
};
