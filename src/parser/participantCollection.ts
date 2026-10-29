/**
 * Participant-collection handlers shared by both parse-tree walkers:
 *  - the ANTLR listener in `ToCollector.ts` (production renderer);
 *  - the Langium facade visitor in `parser-langium/facade/visitors.ts` (LSP).
 *
 * The Langium facade exposes the same duck-typed API as the ANTLR contexts
 * (`name()`, `getFormattedText()`, `start.start`, `Owner()`, `Assignee()` ...),
 * so every handler body runs unchanged on both trees. Each walker keeps only
 * its own traversal (and blind-mode handling) and calls these functions with
 * its `CollectState`.
 *
 * Rules:
 * 1. Later declaration wins
 * 2. A participant declaration overwrite cannot be overwritten by To or Starter
 */
import { Participants, type Position } from "./Participants";
import { stereotypeName } from "./stereotypeName";

// Parse-tree contexts reach the handlers as ANTLR-generated classes (or their
// Langium facade twins) whose prototype augmentations (Owner, From, getComment,
// ...) are not visible to TypeScript (see AntlrTypes.AugmentedContext), so they
// are typed loosely at this boundary.
type Ctx = any;

const rangeOf = (ctx: Ctx): Position | undefined =>
  ctx?.start && ctx?.stop ? [ctx.start.start, ctx.stop.stop + 1] : undefined;

export interface CollectState {
  participants: Participants;
  groupId: string | undefined;
}

export function createCollectState(): CollectState {
  return { participants: new Participants(), groupId: undefined };
}

export function onParticipant(ctx: Ctx, state: CollectState): void {
  const type = ctx?.participantType()?.getFormattedText().replace("@", "");
  const participant =
    ctx?.name()?.getFormattedText() || "Missing `Participant`";
  const stereotype = stereotypeName(ctx.stereotype());
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

  state.participants.Add(participant, {
    isStarter: false,
    type,
    stereotype,
    emoji,
    width,
    groupId: state.groupId,
    label,
    explicit,
    color,
    comment,
    // `start`/`end` stay undefined when neither a label nor a name node exists.
    position: [start, end] as unknown as Position,
    namePosition: rangeOf(nameCtx),
  });
}

/** Handles both the `from` and the `to` rule contexts. */
export function onTo(ctx: Ctx, state: CollectState): void {
  const participant =
    ctx.name?.()?.getFormattedText() || ctx.getFormattedText();
  const emoji = ctx.emoji?.()?.name?.()?.getFormattedText();
  const participantInstance = state.participants.Get(participant);
  const namePosition = rangeOf(ctx.name?.() ?? ctx);

  // Skip adding participant position if label is present
  if (participantInstance?.label) {
    state.participants.Add(participant, {
      isStarter: false,
      emoji,
      namePosition,
    });
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
    state.participants.Add(participant, {
      isStarter: false,
      emoji,
      position,
      namePosition,
      assigneePosition,
    });
  } else {
    state.participants.Add(participant, {
      isStarter: false,
      emoji,
      position: [ctx.start.start, ctx.stop.stop + 1],
      namePosition,
    });
  }
}

/** `ctx` is the `starter` rule context. */
export function onStarter(ctx: Ctx, state: CollectState): void {
  state.participants.Add(ctx.getFormattedText(), {
    isStarter: true,
    position: [ctx.start.start, ctx.stop.stop + 1],
    namePosition: [ctx.start.start, ctx.stop.stop + 1],
  });
}

export function onCreation(ctx: Ctx, state: CollectState): void {
  const participant = ctx.Owner();
  const ctor = ctx?.creationBody()?.construct();
  const assignee = ctx.Assignee();
  const participantInstance = state.participants.Get(participant);
  // The constructor is a name occurrence only without an assignee: with one,
  // the participant is `assignee:Type` and the constructor spells just `Type`,
  // so an identifier rename must not rewrite it.
  const namePosition = assignee ? undefined : rangeOf(ctor);
  // Skip adding participant constructor position if label is present
  if (ctor && !participantInstance?.label) {
    const assigneePosition = ctx.AssigneePosition();
    state.participants.Add(participant, {
      isStarter: false,
      position: [ctor.start.start, ctor.stop.stop + 1],
      namePosition,
      assignee: assignee,
      assigneePosition: assigneePosition,
    });
  } else {
    state.participants.Add(participant, { isStarter: false, namePosition });
  }
}

export function onRef(ctx: Ctx, state: CollectState): void {
  ctx.Participants().forEach((participant: Ctx) => {
    state.participants.Add(participant.getText(), {
      isStarter: false,
      position: [participant.start.start, participant.stop.stop + 1],
      namePosition: [participant.start.start, participant.stop.stop + 1],
    });
  });
}

export function onRet(ctx: Ctx, state: CollectState): void {
  if (ctx.asyncMessage()) {
    // The walker visits the asyncMessage later.
    return;
  }
  const returnFrom = ctx.From();
  if (returnFrom) state.participants.Add(returnFrom);
  const returnTo = ctx.ReturnTo();
  if (returnTo) state.participants.Add(returnTo);
}
