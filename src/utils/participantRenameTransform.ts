import sequenceParser from "@/generated-parser/sequenceParser";
import { Participants } from "@/parser";
import {
  parseNotWorse,
  safeParse,
  sameDeclaration,
  squash,
} from "./dslRoundTrip";
import { readParticipantDeclaration } from "./participantStyleTransform";

type Range = [number, number];

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

  const oldParticipants = (() => {
    try {
      return Participants(rootContext);
    } catch {
      return null;
    }
  })();
  if (!oldParticipants) return { error: "Not a valid participant name" };
  const oldNames = oldParticipants.Names() as string[];
  const oldSet = new Set(oldNames);

  // Name-token ranges, not `GetPositions`: those point at the `as` label when
  // a participant has one, while a rename rewrites the identifier itself.
  const positions: Range[] = [
    ...(oldParticipants.GetNamePositions(oldName) ?? []),
  ].sort((a, b) => b[0] - a[0]);
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
