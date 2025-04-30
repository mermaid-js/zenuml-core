import { Coordinates } from "@/positioning/Coordinates";
import store, { coordinatesAtom } from "@/store/Store";

let coordinates: Coordinates = store.get(coordinatesAtom);
store.sub(coordinatesAtom, () => {
  coordinates = store.get(coordinatesAtom);
});

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

export const centerOf = (entity: string) => {
  if (!entity) {
    console.error("[@zenuml/core] centerOf: entity is undefined");
    return 0;
  }
  try {
    return coordinates.getPosition(entity) || 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
};

export const distance = (from: string, to: string) => {
  return centerOf(from) - centerOf(to);
};

export const distance2 = (from: string, to: string) => {
  if (!from || !to) return 0;
  return centerOf(to) - centerOf(from);
};
