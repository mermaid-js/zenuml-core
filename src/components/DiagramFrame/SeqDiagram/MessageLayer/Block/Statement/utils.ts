import sequenceParser from "@/generated-parser/sequenceParser";

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

export const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return ctx.Owner() === participant;
    }
    return false;
  }).length;
};
