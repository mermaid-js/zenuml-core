/** Converts an ANTLR parse tree to a JSON-safe plain object for `--parse`. */

interface AstNode {
  type: string;
  ruleName?: string;
  text?: string;
  children?: AstNode[];
}

/** Get rule names from the parser embedded in a context node. */
function getRuleNames(ctx: any): string[] | undefined {
  return ctx?.parser?.ruleNames;
}

/** A Langium-facade Ctx node (no ANTLR `.parser`/`.symbol`, carries `_doc`). */
function isFacadeNode(node: any): boolean {
  return (
    !!node &&
    node.symbol === undefined &&
    !node.parser &&
    !!node._doc &&
    typeof node.constructor?.name === "string" &&
    node.constructor.name.endsWith("Context")
  );
}

/** Facade class name -> ANTLR rule name, e.g. ProgContext -> prog. */
function facadeRuleName(className: string): string {
  const base = className.endsWith("Context")
    ? className.slice(0, -"Context".length)
    : className;
  return base.charAt(0).toLowerCase() + base.slice(1);
}

/**
 * Serialize a Langium-facade node to the same shape as the ANTLR path:
 * `{type:"rule", ruleName, children}` with terminal leaves the node owns
 * directly (those not inside any child rule span) interleaved in source order.
 */
function serializeFacadeNode(node: any): AstNode {
  const result: AstNode = {
    type: "rule",
    ruleName: facadeRuleName(node.constructor.name),
  };

  const ruleChildren: any[] = node.children ?? [];
  const childSpans = ruleChildren.map((c) => ({
    c,
    start: c.start?.start ?? null,
    end: c.stop?.stop ?? null, // inclusive
  }));

  const items: Array<{ off: number; node: AstNode }> = [];
  for (const cs of childSpans) {
    if (cs.start !== null) {
      items.push({ off: cs.start, node: serializeParseTree(cs.c) });
    }
  }

  const nodeStart: number | undefined = node.start?.start;
  const nodeStop: number | null | undefined = node.stop?.stop; // inclusive
  if (nodeStart !== undefined && nodeStop !== null && nodeStop !== undefined) {
    for (const leaf of node._doc.leaves as Array<{
      offset: number;
      hidden: boolean;
      text: string;
    }>) {
      if (leaf.offset < nodeStart) continue;
      if (leaf.offset > nodeStop) break;
      if (leaf.hidden) continue;
      const covered = childSpans.some(
        (cs) =>
          cs.start !== null &&
          cs.end !== null &&
          leaf.offset >= cs.start &&
          leaf.offset <= cs.end,
      );
      if (covered) continue;
      items.push({
        off: leaf.offset,
        node: { type: "terminal", text: leaf.text },
      });
    }
  }

  items.sort((a, b) => a.off - b.off);
  if (items.length > 0) {
    result.children = items.map((it) => it.node);
  }
  return result;
}

/** Serialize an ANTLR (or Langium-facade) parse tree node to a JSON-safe object. */
export function serializeParseTree(node: any): AstNode {
  if (!node) return { type: "null" };

  // Terminal node (leaf token)
  if (node.symbol !== undefined) {
    return {
      type: "terminal",
      text: node.getText(),
    };
  }

  // Langium-facade rule node
  if (isFacadeNode(node)) {
    return serializeFacadeNode(node);
  }

  // ANTLR parser rule context node
  const ruleNames = getRuleNames(node);
  const ruleName =
    ruleNames && node.ruleIndex !== undefined
      ? ruleNames[node.ruleIndex]
      : undefined;

  const result: AstNode = {
    type: "rule",
  };
  if (ruleName) {
    result.ruleName = ruleName;
  }

  const children = node.children;
  if (children && children.length > 0) {
    result.children = children.map((child: any) => serializeParseTree(child));
  }

  return result;
}
