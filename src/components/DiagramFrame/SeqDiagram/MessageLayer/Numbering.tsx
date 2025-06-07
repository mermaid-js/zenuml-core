import { enableNumberingAtom } from "@/store/Store";
import { useAtomValue } from "jotai";

export const Numbering = (props: { number?: number | string }) => {
  const enableNumbering = useAtomValue(enableNumberingAtom);

  if (!enableNumbering) return null;
  return (
    <div className="absolute text-xs right-[100%] top-0 pr-1 group-hover:hidden text-gray-500 font-thin">
      {props.number}
    </div>
  );
};
