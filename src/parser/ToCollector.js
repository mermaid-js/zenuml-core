import { Participants } from "./Participants";
import antlr4 from "antlr4";
import { default as sequenceParserListener } from "../generated-parser/sequenceParserListener";
import { default as sequenceParser } from "../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const ProgContext = seqParser.ProgContext;

let participants = undefined;
let isBlind = false;
let groupId = undefined;
const ToCollector = new sequenceParserListener();

// Rules:
// 1. Later declaration win
// 2. Participant declaration overwrite cannot be overwritten by To or Starter
const onParticipant = function (ctx) {
  // if(!(ctx?.name())) return;
  if (isBlind) return;
  const type = ctx?.participantType()?.getFormattedText().replace("@", "");
  const participant =
    ctx?.name()?.getFormattedText() || "Missing `Participant`";
  const stereotype = ctx.stereotype()?.name()?.getFormattedText();
  const width =
    (ctx.width && ctx.width() && Number.parseInt(ctx.width().getText())) ||
    undefined;
  const labelCtx = ctx.label && ctx.label();
  const label = labelCtx?.name()?.getFormattedText();
  const explicit = true;
  const color = ctx.COLOR()?.getText();
  const comment = ctx.getComment();
  const nameCtx = ctx.name();
  let start, end;

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
    width,
    groupId,
    label,
    explicit,
    color,
    comment,
    position: [start, end],
  });
};
ToCollector.enterParticipant = onParticipant;

const onTo = function (ctx) {
  if (isBlind) return;
  let participant = ctx.getFormattedText();
  const participantInstance = participants.Get(participant);

  // Skip adding participant position if label is present
  if (participantInstance?.label) {
    participants.Add(participant, { isStarter: false });
  } else if (participantInstance?.assignee) {
    // If the participant has an assignee, calculate the position of the ctor and store it only.
    // Let's say the participant name is `"${assignee}:${type}"`, we need to get the position of ${type}
    // e.g. ret = new A() "ret:A".method()
    const start = ctx.start.start + participantInstance.assignee.length + 2;
    const position = [start, ctx.stop.stop];
    const assigneePosition = [
      ctx.start.start + 1,
      ctx.start.start + participantInstance.assignee.length + 1,
    ];
    participants.Add(participant, {
      isStarter: false,
      position: position,
      assigneePosition: assigneePosition,
    });
  } else {
    participants.Add(participant, {
      isStarter: false,
      position: [ctx.start.start, ctx.stop.stop + 1],
    });
  }
};

ToCollector.enterFrom = onTo;
ToCollector.enterTo = onTo;

ToCollector.enterStarter = function (ctx) {
  let participant = ctx.getFormattedText();
  participants.Add(participant, {
    isStarter: true,
    position: [ctx.start.start, ctx.stop.stop + 1],
  });
};

ToCollector.enterCreation = function (ctx) {
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

ToCollector.enterRef = function (ctx) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_id, ...newParticipants] = ctx.ID();
  newParticipants.forEach((participant) => {
    participants.Add(participant.getText(), {
      isStarter: false,
      start: participant.symbol.start,
      end: participant.symbol.stop + 1,
    });
  });
};

ToCollector.enterParameters = function () {
  isBlind = true;
};

ToCollector.exitParameters = function () {
  isBlind = false;
};

ToCollector.enterCondition = function () {
  isBlind = true;
};

ToCollector.exitCondition = function () {
  isBlind = false;
};

ToCollector.enterGroup = function (ctx) {
  // group { A } => groupId = undefined
  // group group1 { A } => groupId = "group1"
  groupId = ctx.name()?.getFormattedText();
};

ToCollector.exitGroup = function () {
  groupId = undefined;
};

ToCollector.enterRet = function (ctx) {
  if (ctx.asyncMessage()) {
    return;
  }
  participants.Add(ctx.From());
  participants.Add(ctx.ReturnTo());
};

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

ToCollector.getParticipants = function (context, withStarter) {
  participants = new Participants();
  if (withStarter && context instanceof ProgContext) {
    participants.Add(context.Starter(), { isStarter: true });
  }
  walker.walk(this, context);
  return participants;
};

export default ToCollector;
