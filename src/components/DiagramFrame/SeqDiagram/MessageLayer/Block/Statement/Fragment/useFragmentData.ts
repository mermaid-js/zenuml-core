import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { coordinatesAtom, framesModelAtom, messagesModelAtom } from "@/store/Store";
import { buildFragmentPositioningVM, type FragmentPositioningVM, type FragmentData } from "@/vm/fragments";

export const useFragmentData = (fragmentData: FragmentData, origin: string) => {
  const [collapsed, setCollapsed] = useState(false);
  const coordinates = useAtomValue(coordinatesAtom);
  const framesModel = useAtomValue(framesModelAtom);
  const messages = useAtomValue(messagesModelAtom);

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
    messages,
  );

  return {
    collapsed,
    toggleCollapse,
    ...positioningVM,
  };
};
