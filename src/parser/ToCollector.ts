import { Participants } from "./Participants";
import antlr4 from "antlr4";
import { default as sequenceParserListener } from "../generated-parser/sequenceParserListener";
import {
  createCollectState,
  onCreation,
  onParticipant,
  onRef,
  onRet,
  onStarter,
  onTo,
  type CollectState,
} from "./participantCollection";

// Parse-tree contexts reach the listener callbacks as ANTLR-generated classes
// whose prototype augmentations (Owner, From, getComment, ...) are not visible
// to TypeScript (see AntlrTypes.AugmentedContext), so they are typed loosely
// at this boundary.
type Ctx = any;

type Listener = { [callback: string]: (ctx: Ctx) => void };

// The handler bodies live in ./participantCollection (shared with the Langium
// visitor). This module only wires them to the ANTLR listener and owns the
// blind-depth counter. State is per walk, so the walk is re-entrant.
function createListener(state: CollectState): Listener {
  const listener = new sequenceParserListener() as any as Listener;
  // Depth counter: parameters and conditions nest, and an inner exit must not
  // re-enable collection while the outer one is still open.
  let isBlind = 0;

  listener.enterParticipant = (ctx) => {
    if (isBlind) return;
    onParticipant(ctx, state);
  };
  const to = (ctx: Ctx) => {
    if (isBlind) return;
    onTo(ctx, state);
  };
  listener.enterFrom = to;
  listener.enterTo = to;
  listener.enterStarter = (ctx) => onStarter(ctx, state);
  listener.enterCreation = (ctx) => {
    if (isBlind) return;
    onCreation(ctx, state);
  };
  listener.enterRef = (ctx) => onRef(ctx, state);
  listener.enterParameters = () => {
    isBlind++;
  };
  listener.exitParameters = () => {
    isBlind--;
  };
  listener.enterCondition = () => {
    isBlind++;
  };
  listener.exitCondition = () => {
    isBlind--;
  };
  listener.enterGroup = (ctx) => {
    // group { A } => groupId = undefined
    // group group1 { A } => groupId = "group1"
    state.groupId = ctx.name()?.getFormattedText();
  };
  listener.exitGroup = () => {
    state.groupId = undefined;
  };
  listener.enterRet = (ctx) => onRet(ctx, state);
  return listener;
}

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

// The walk is a pure function of the (immutable) parse tree and consumers only
// read the returned Participants, so results are cached per context node.
const participantsCache = new WeakMap<object, Participants>();

const ToCollector = {
  getParticipants(context: unknown): Participants {
    if (!context) return new Participants();
    const cached = participantsCache.get(context as object);
    if (cached) return cached;
    const state = createCollectState();
    walker.walk(createListener(state) as any, context as any);
    participantsCache.set(context as object, state.participants);
    return state.participants;
  },
};

export default ToCollector;
