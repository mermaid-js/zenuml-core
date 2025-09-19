import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { coordinatesAtom, framesModelAtom } from "@/store/Store";
import { buildFragmentPositioningVM, type FragmentPositioningVM, type FragmentData } from "@/vm/fragments";

export const useFragmentData = (fragmentData: FragmentData, origin: string) => {
  const [collapsed, setCollapsed] = useState(false);
  const coordinates = useAtomValue(coordinatesAtom);
  const framesModel = useAtomValue(framesModelAtom);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setCollapsed(false);
  }, [fragmentData]);

  // Build positioning VM using the new VM pattern with FragmentData
  const positioningVM: FragmentPositioningVM = buildFragmentPositioningVM(
    fragmentData,
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
