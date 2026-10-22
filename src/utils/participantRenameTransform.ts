import antlr4 from "antlr4";
import sequenceParser from "@/generated-parser/sequenceParser";
import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { Participants } from "@/parser";
import {
  parseNotWorse,
  safeParse,
  sameDeclaration,
  squash,
} from "./dslRoundTrip";
import { readParticipantDeclaration } from "./participantStyleTransform";

type Range = [number, number];

// `Participants.GetPositions` records the `as` label instead of the identifier
// when a participant has one, because inline renaming on the canvas edits the
// displayed text. Renaming the identifier itself needs every occurrence of the
// name token, so this walks the tree with the same hooks `ToCollector` uses
// but always records the name.
const collectNamePositions = (rootContext: any, name: string): Range[] => {
  const positions: Range[] = [];
  let blind = 0;
  const push = (ctx: any) => {
    if (ctx?.start && ctx?.stop)
      positions.push([ctx.start.start, ctx.stop.stop + 1]);
  };
  const matches = (ctx: any) =>
    (ctx?.name?.()?.getFormattedText?.() ?? ctx?.getFormattedText?.()) === name;

  const listener: any = new (sequenceParserListener as any)();
  listener.enterParticipant = (ctx: any) => {
    if (blind > 0) return;
    if (ctx?.name?.()?.getFormattedText?.() === name) push(ctx.name());
  };
  const onEndpoint = (ctx: any) => {
    if (blind > 0) return;
    if (matches(ctx)) push(ctx.name?.() ?? ctx);
  };
  listener.enterFrom = onEndpoint;
  listener.enterTo = onEndpoint;
  listener.enterStarter = (ctx: any) => {
    if (blind > 0) return;
    if (ctx?.getFormattedText?.() === name) push(ctx);
  };
  listener.enterCreation = (ctx: any) => {
    if (blind > 0) return;
    const ctor = ctx?.creationBody?.()?.construct?.();
    if (ctor && ctx?.Owner?.() === name && !ctx?.Assignee?.()) push(ctor);
  };
  listener.enterRef = (ctx: any) => {
    if (blind > 0) return;
    ctx?.Participants?.()?.forEach((participant: any) => {
      if (participant?.getText?.() === name) push(participant);
    });
  };
  listener.enterParameters = () => {
    blind++;
  };
  listener.exitParameters = () => {
    blind--;
  };
  listener.enterCondition = () => {
    blind++;
  };
  listener.exitCondition = () => {
    blind--;
  };

  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, rootContext);
  return positions;
};

// Identifier and string tokens are interchangeable: quoting a name must not
// count as a structural change.
const NAME_TOKENS = new Set<number>([
  (sequenceParser as any).ID,
  (sequenceParser as any).CSTRING,
  (sequenceParser as any).USTRING,
]);

/**
 * Serialises the parse tree by rule and token type, ignoring token text. A
 * rename that turns a name into a keyword (`title`, `if`...) changes the shape.
 */
export const treeShape = (ctx: any): string => {
  if (!ctx) return "";
  if (ctx.symbol) {
    const type = ctx.symbol.type;
    return NAME_TOKENS.has(type) ? "N" : `t${type}`;
  }
  const children: any[] = ctx.children ?? [];
  return `(${ctx.ruleIndex ?? ctx.constructor?.name}${children
    .map(treeShape)
    .join(",")})`;
};

const PLAIN_NAME = /^[\p{L}_][\p{L}\p{Nd}_]*$/u;

export type RenameResult = { code: string; name: string } | { error: string };

// Names Participants() would produce for `code`, or null when the parse throws.
// `parse` is the silent, reentrant entry point, so rejected candidates do not
// print ANTLR errors to the console.
const analyse = (code: string) => {
  const parsed = safeParse(code);
  if (!parsed) return null;
  try {
    return {
      ...parsed,
      names: Participants(parsed.rootContext).Names() as string[],
    };
  } catch {
    return null;
  }
};

const apply = (code: string, positions: Range[], text: string) => {
  let result = code;
  for (const [start, end] of positions) {
    result = result.slice(0, start) + text + result.slice(end);
  }
  return result;
};

/**
 * Rename a participant identifier everywhere it is referenced. The new name is
 * validated by re-parsing: it must replace the old participant one-for-one and
 * must not merge into another participant. The returned `name` is the
 * canonical identity the parser assigns, which can differ from the typed text.
 */
export const renameParticipantInDsl = (
  code: string,
  rootContext: any,
  oldName: string,
  newName: string,
): RenameResult => {
  const text = newName.trim().replace(/\s+/g, " ").replace(/"/g, "").trim();
  if (!text) return { error: "Name is required" };
  if (oldName.includes(":")) {
    return { error: "Rename assigned participants in the code editor" };
  }

  const oldNames = (() => {
    try {
      return Participants(rootContext).Names() as string[];
    } catch {
      return null;
    }
  })();
  if (!oldNames) return { error: "Not a valid participant name" };
  const oldSet = new Set(oldNames);

  const positions = collectNamePositions(rootContext, oldName).sort(
    (a, b) => b[0] - a[0],
  );
  if (positions.length === 0) return { error: "Not a valid participant name" };

  const candidates = PLAIN_NAME.test(text)
    ? [text, `"${text}"`]
    : [`"${text}"`];
  let collided = false;
  const base = safeParse(code);
  const oldShape = treeShape(rootContext);
  const oldDeclaration = readParticipantDeclaration(rootContext, oldName);
  for (const candidate of candidates) {
    const nextCode = apply(code, positions, candidate);
    const next = analyse(nextCode);
    if (!next) continue;
    const added = next.names.filter((n) => !oldSet.has(n));
    if (
      next.names.length === oldNames.length &&
      !next.names.includes(oldName) &&
      added.length === 1
    ) {
      const parseOk = parseNotWorse(base, next);
      const nameOk = squash(added[0]) === squash(text);
      let declOk = true;
      if (oldDeclaration) {
        const newDeclaration = readParticipantDeclaration(
          next.rootContext,
          added[0],
        );
        declOk =
          !!newDeclaration && sameDeclaration(oldDeclaration, newDeclaration);
      }
      const shapeOk = treeShape(next.rootContext) === oldShape;
      if (parseOk && nameOk && declOk && shapeOk) {
        return { code: nextCode, name: added[0] };
      }
    }
    if (next.names.length < oldNames.length) collided = true;
  }

  const stripped = text.replace(/\s+/g, "");
  if (text === oldName || stripped === oldName) {
    return { code, name: oldName };
  }
  if (collided || oldSet.has(text) || oldSet.has(stripped)) {
    return { error: `"${text}" already exists` };
  }
  return { error: "Not a valid participant name" };
};
