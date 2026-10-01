import { enableNumberingAtom } from "@/store/Store";
import { useAtomValue } from "jotai";

export const Numbering = (props: { number?: number | string }) => {
  const enableNumbering = useAtomValue(enableNumberingAtom);

  if (!enableNumbering || props.number == null || props.number === "")
    return null;
  return (
    <div className="message-number absolute text-xs leading-4 right-[calc(100%+4px)] top-0 px-1 bg-gray-500/10 rounded-sm whitespace-nowrap group-hover:hidden text-gray-500 font-normal">
      {props.number}
    </div>
  );
};
