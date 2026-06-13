/**
 * Collect the set of participant names referenced anywhere in a parsed ZenUML
 * document — explicit head declarations plus every message endpoint (from / to)
 * and creation target. Used by completion (suggest known names) and hover.
 *
 * Names are plain strings in the AST (`Name returns string`), so this is a
 * straight tree walk with no cross-reference resolution.
 */
import { AstUtils, type AstNode } from "langium";
import {
  isCreation,
  isFrom,
  isGroup,
  isParticipant,
  isTo,
} from "../generated/ast.js";

export function collectParticipantNames(root: AstNode | undefined): string[] {
  if (!root) return [];
  const names = new Set<string>();
  for (const node of AstUtils.streamAllContents(root)) {
    if (isParticipant(node) && node.name) names.add(node.name);
    else if (isGroup(node) && node.name) names.add(node.name);
    else if (isFrom(node) && node.name) names.add(node.name);
    else if (isTo(node) && node.name) names.add(node.name);
    else if (isCreation(node)) {
      const ctor = node.body?.construct;
      if (ctor) names.add(ctor);
    }
  }
  return [...names].sort();
}
