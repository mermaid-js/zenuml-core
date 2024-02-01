export const getContextType = (context: any) => {
  const dict: Record<string, string> = {
    loop: "FragmentLoop",
    alt: "FragmentAlt",
    par: "FragmentPar",
    opt: "FragmentOpt",
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
