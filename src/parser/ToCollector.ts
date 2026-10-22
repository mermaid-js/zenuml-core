import { Participants, type Position } from "./Participants";
import antlr4 from "antlr4";
import { default as sequenceParserListener } from "../generated-parser/sequenceParserListener";

// Parse-tree contexts reach the listener callbacks as ANTLR-generated classes
// whose prototype augmentations (Owner, From, getComment, ...) are not visible
// to TypeScript (see AntlrTypes.AugmentedContext), so they are typed loosely
// at this boundary.
type Ctx = any;

let participants: Participants = undefined as unknown as Participants;
// Depth counter: parameters and conditions nest, and an inner exit must not
// re-enable collection while the outer one is still open.
let isBlind = 0;
let groupId: string | undefined = undefined;
const ToCollector = new sequenceParserListener() as any as {
  [callback: string]: (ctx: Ctx) => void;
} & {
  getParticipants(context: unknown): Participants;
};

// Rules:
// 1. Later declaration win
// 2. Participant declaration overwrite cannot be overwritten by To or Starter
const onParticipant = function (ctx: Ctx) {
  // if(!(ctx?.name())) return;
  if (isBlind) return;
  const type = ctx?.participantType()?.getFormattedText().replace("@", "");
  const participant =
    ctx?.name()?.getFormattedText() || "Missing `Participant`";
  const stereotype = ctx.stereotype()?.name()?.getFormattedText();
  const emoji = ctx.emoji?.()?.name?.()?.getFormattedText();
  const width =
    (ctx.width && ctx.width() && Number.parseInt(ctx.width().getText())) ||
    undefined;
  const labelCtx = ctx.label && ctx.label();
  const label = labelCtx?.name()?.getFormattedText();
  const explicit = true;
  const color = ctx.COLOR()?.getText();
  const comment = ctx.getComment();
  const nameCtx = ctx.name();
  let start: number | undefined, end: number | undefined;

  // When label is present, it means we edit label in diagram and update its code regardless of the occurrence of the participant name
  if (labelCtx) {
    const labelNameCtx = labelCtx.name();
    if (labelNameCtx) {
      start = labelNameCtx.start.start;
      end = labelNameCtx.stop.stop + 1;
    }
  } else if (nameCtx) {
    start = nameCtx.start.start;
    end = nameCtx.stop.stop + 1;
  }

  participants.Add(participant, {
    isStarter: false,
    type,
    stereotype,
    emoji,
    width,
    groupId,
    label,
    explicit,
    color,
    comment,
    // `start`/`end` stay undefined when neither a label nor a name node exists.
    position: [start, end] as unknown as Position,
  });
};
ToCollector.enterParticipant = onParticipant;

const onTo = function (ctx: Ctx) {
  if (isBlind) return;
  const participant =
    ctx.name?.()?.getFormattedText() || ctx.getFormattedText();
  const emoji = ctx.emoji?.()?.name?.()?.getFormattedText();
  const participantInstance = participants.Get(participant);

  // Skip adding participant position if label is present
  if (participantInstance?.label) {
    participants.Add(participant, { isStarter: false, emoji });
  } else if (participantInstance?.assignee) {
    // If the participant has an assignee, calculate the position of the ctor and store it only.
    // Let's say the participant name is `"${assignee}:${type}"`, we need to get the position of ${type}
    // e.g. ret = new A() "ret:A".method()
    const start = ctx.start.start + participantInstance.assignee.length + 2;
    const position: Position = [start, ctx.stop.stop];
    const assigneePosition: Position = [
      ctx.start.start + 1,
      ctx.start.start + participantInstance.assignee.length + 1,
    ];
    participants.Add(participant, {
      isStarter: false,
      emoji,
      position: position,
      assigneePosition: assigneePosition,
    });
  } else {
    participants.Add(participant, {
      isStarter: false,
      emoji,
      position: [ctx.start.start, ctx.stop.stop + 1],
    });
  }
};

ToCollector.enterFrom = onTo;
ToCollector.enterTo = onTo;

ToCollector.enterStarter = function (ctx: Ctx) {
  const participant = ctx.getFormattedText();
  participants.Add(participant, {
    isStarter: true,
    position: [ctx.start.start, ctx.stop.stop + 1],
  });
};

ToCollector.enterCreation = function (ctx: Ctx) {
  if (isBlind) return;
  const participant = ctx.Owner();
  const ctor = ctx?.creationBody()?.construct();
  const participantInstance = participants.Get(participant);
  // Skip adding participant constructor position if label is present
  if (ctor && !participantInstance?.label) {
    const assignee = ctx.Assignee();
    const assigneePosition = ctx.AssigneePosition();
    participants.Add(participant, {
      isStarter: false,
      position: [ctor.start.start, ctor.stop.stop + 1],
      assignee: assignee,
      assigneePosition: assigneePosition,
    });
  } else {
    participants.Add(participant, {
      isStarter: false,
    });
  }
};

ToCollector.enterRef = function (ctx: Ctx) {
  ctx.Participants().forEach((participant: Ctx) => {
    participants.Add(participant.getText(), {
      isStarter: false,
      position: [participant.start.start, participant.stop.stop + 1],
    });
  });
};

ToCollector.enterParameters = function () {
  isBlind++;
};

ToCollector.exitParameters = function () {
  isBlind--;
};

ToCollector.enterCondition = function () {
  isBlind++;
};

ToCollector.exitCondition = function () {
  isBlind--;
};

ToCollector.enterGroup = function (ctx: Ctx) {
  // group { A } => groupId = undefined
  // group group1 { A } => groupId = "group1"
  groupId = ctx.name()?.getFormattedText();
};

ToCollector.exitGroup = function () {
  groupId = undefined;
};

ToCollector.enterRet = function (ctx: Ctx) {
  if (ctx.asyncMessage()) {
    // it will visit the asyncMessage later
    return;
  }
  const returnFrom = ctx.From();
  if (returnFrom) participants.Add(returnFrom);
  const returnTo = ctx.ReturnTo();
  if (returnTo) participants.Add(returnTo);
};

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

// The walk is a pure function of the (immutable) parse tree and consumers only
// read the returned Participants, so results are cached per context node.
const participantsCache = new WeakMap<object, Participants>();

ToCollector.getParticipants = function (context: unknown) {
  if (!context) return new Participants();
  const cached = participantsCache.get(context as object);
  if (cached) return cached;
  participants = new Participants();
  isBlind = 0;
  walker.walk(this as any, context as any);
  participantsCache.set(context as object, participants);
  return participants;
};

export default ToCollector;
