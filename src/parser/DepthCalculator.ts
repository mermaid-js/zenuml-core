import sequenceParser from "@/generated-parser/sequenceParser";

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

export const depthOnParticipant4Stat = (
  context: any,
  participant: any,
): number => {
  if (!(context instanceof sequenceParser.StatContext)) {
    return 0;
  }

  const child = context?.children?.[0];
  if (!child) {
    return 0;
  }
  return depthOnParticipant(child, participant);
};
