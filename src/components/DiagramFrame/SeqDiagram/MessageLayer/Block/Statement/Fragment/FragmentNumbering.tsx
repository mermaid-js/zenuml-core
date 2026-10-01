import { enableNumberingAtom } from "@/store/Store";
import { useAtomValue } from "jotai";

/** Fragment numbers belong to the title; message numbers keep their own gutter. */
export const FragmentNumbering = (props: { number?: string }) => {
  const enableNumbering = useAtomValue(enableNumberingAtom);
  if (!enableNumbering || !props.number) return null;

  return (
    <span className="fragment-number shrink-0 whitespace-nowrap text-xs leading-4 text-gray-500 font-normal bg-gray-500/10 rounded-sm px-1 mr-1">
      {props.number}
    </span>
  );
};
