import { TitleVM } from "@/vm/title";

export const DiagramTitle = (props: { vm: TitleVM }) => {
  const title = props.vm?.text || "";
  return (
    <div className="title text-skin-title text-base font-semibold">{title}</div>
  );
};
