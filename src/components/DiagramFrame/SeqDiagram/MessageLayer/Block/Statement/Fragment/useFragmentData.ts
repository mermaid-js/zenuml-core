import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { coordinatesAtom, framesModelAtom } from "@/store/Store";
import { buildFragmentPositioningVM, type FragmentPositioningVM } from "@/vm/fragments";

export const useFragmentData = (context: any, origin: string) => {
  const [collapsed, setCollapsed] = useState(false);
  const coordinates = useAtomValue(coordinatesAtom);
  const framesModel = useAtomValue(framesModelAtom);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setCollapsed(false);
  }, [context]);

  // Build positioning VM using the new VM pattern
  const positioningVM: FragmentPositioningVM = buildFragmentPositioningVM(
    context,
    origin,
    coordinates,
    framesModel,
  );

  return {
    collapsed,
    toggleCollapse,
    ...positioningVM,
  };
};
