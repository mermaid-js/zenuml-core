import { enableNumberingAtom } from "@/store/Store";
import { useAtomValue } from "jotai";

/**
 * Fragment numbers belong to the title; message numbers keep their own gutter.
 * `onFrame` is for the ref box, whose number sits on the frame rather than in
 * a header band, so it takes the plain number colour.
 */
export const FragmentNumbering = (props: { number?: string; onFrame?: boolean }) => {
  const enableNumbering = useAtomValue(enableNumberingAtom);
  if (!enableNumbering || !props.number) return null;

  return (
    <span
      className={`fragment-number shrink-0 whitespace-nowrap text-xs leading-4 ${props.onFrame ? "text-skin-number" : "text-skin-fragment-number"} font-normal bg-skin-number rounded-sm px-1 mr-1`}
    >
      {props.number}
    </span>
  );
};
