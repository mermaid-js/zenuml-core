export const getContextType = (context: any) => {
  let dict: Record<string, string> = {
    loop: "FragmentLoop",
    alt: "FragmentAlt",
    par: "FragmentPar",
    opt: "FragmentOpt",
    tcf: "FragmentTryCatchFinally",
    creation: "Creation",
    message: "Interaction",
    asyncMessage: "InteractionAsync",
    divider: "Divider",
    ret: "Return"
  };
  let key: string = Object.keys(dict).find(x => context[x]() !== null) || '';
  return dict[key];
};

export const getAssignment = (statement: any) => {
  return statement?.message()?.Assignment()?.getText()
}

export const getIsSelfInteraction = (statement: any) => {
  return getAssignment(statement) && statement?.message()?.Owner() && statement.message().Owner() !== (statement?.message()?.ProvidedFrom() || statement?.Origin())
}
