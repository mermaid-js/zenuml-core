import { Participants } from "./Participants";
import antlr4 from "antlr4";
import { default as sequenceParserListener } from "../generated-parser/sequenceParserListener";

let participants = undefined;
let isBlind = false;
let groupId = undefined;
const ToCollector = new sequenceParserListener();

// Rules:
// 1. Later declaration win
// 2. Participant declaration overwrite cannot be overwritten by To or Starter
const onParticipant = function (ctx) {
  if (isBlind) return;
  const typeCtx = ctx?.participantType();
  const type = typeCtx?.getFormattedText().replace("@", "");
  const nameCtx = ctx?.name();
  const participant = nameCtx?.getFormattedText() || "Missing `Participant`";
  const stereotypeCtx = ctx.stereotype()?.name();
  const stereotype = stereotypeCtx?.getFormattedText();
  const widthCtx = ctx.width && ctx.width();
  const width = widthCtx && Number.parseInt(widthCtx.getText());
  const labelCtx = ctx.label && ctx.label();
  const label = labelCtx?.name()?.getFormattedText();
  const explicit = true;
  const color = ctx.COLOR()?.getText();
  const comment = ctx.getComment();

  const declaration = {
    name: {
      rawText: nameCtx?.getText() || "Missing `Participant`",
      position: nameCtx
        ? [nameCtx.start.start, nameCtx.stop.stop + 1]
        : undefined,
    },
  };

  if (typeCtx) {
    declaration.participantType = {
      rawText: typeCtx.getText(),
      position: [typeCtx.start.start, typeCtx.stop.stop + 1],
    };
  }

  if (stereotypeCtx) {
    declaration.stereotype = {
      rawText: stereotypeCtx.getText(),
      position: [stereotypeCtx.start.start, stereotypeCtx.stop.stop + 1],
    };
  }

  if (widthCtx) {
    declaration.width = {
      rawText: widthCtx.getText(),
      position: [widthCtx.start.start, widthCtx.stop.stop + 1],
    };
  }

  if (labelCtx) {
    const labelNameCtx = labelCtx.name();
    if (labelNameCtx) {
      declaration.label = {
        rawText: labelNameCtx.getText(),
        position: [labelNameCtx.start.start, labelNameCtx.stop.stop + 1],
      };
    }
  }

  if (color) {
    declaration.color = {
      rawText: color,
      position: [ctx.COLOR().symbol.start, ctx.COLOR().symbol.stop + 1],
    };
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
    declaration,
    position: declaration.label
      ? declaration.label.position
      : declaration.name.position,
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
  ctx.Participants().forEach((participant) => {
    participants.Add(participant.getText(), {
      isStarter: false,
      position: [participant.start.start, participant.stop.stop + 1],
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
    // it will visit the asyncMessage later
    return;
  }
  const returnFrom = ctx.From();
  returnFrom && participants.Add(returnFrom);
  const returnTo = ctx.ReturnTo();
  returnTo && participants.Add(returnTo);
};

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

ToCollector.getParticipants = function (context) {
  participants = new Participants();
  walker.walk(this, context);
  return participants;
};

export default ToCollector;
