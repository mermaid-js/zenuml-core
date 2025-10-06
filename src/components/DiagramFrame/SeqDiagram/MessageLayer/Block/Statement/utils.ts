import { Coordinates } from "@/positioning/Coordinates";

export const getContextType = (context: any) => {
  const dict: Record<string, string> = {
    loop: "FragmentLoop",
    alt: "FragmentAlt",
    par: "FragmentPar",
    opt: "FragmentOpt",
    section: "FragmentSection",
    critical: "FragmentCritical",
    tcf: "FragmentTryCatchFinally",
    creation: "Creation",
    message: "Interaction",
    asyncMessage: "InteractionAsync",
    divider: "Divider",
    ret: "Return",
  };
  const key: string =
    Object.keys(dict).find((x) => context[x]() !== null) || "";
  return dict[key];
};

export const centerOf = (coordinates: Coordinates, entity: string) => {
  if (!entity) {
    console.warn("[@zenuml/core] centerOf: entity is undefined");
    return 0;
  }
  try {
    return coordinates.getPosition(entity) || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const distance = (coordinates: Coordinates, from: string, to: string) => {
  return centerOf(coordinates, from) - centerOf(coordinates, to);
};

export const distance2 = (coordinates: Coordinates, from: string, to: string) => {
  if (!from || !to) return 0;
  return centerOf(coordinates, to) - centerOf(coordinates, from);
};
