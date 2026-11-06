// The grammar accepts a few half-typed forms on purpose, so the editor keeps a
// parse tree while the user types: `A->`, `r =` and `@return`. They have no
// target, no call and no message, so no message is drawn for them. Removing
// them from the block keeps the HTML and SVG renderers and numbering in step.
// A dangling arrow keeps its source participant. The tokens stay in the token stream, so
// source ranges and comments are not affected.

import sequenceParser from "../generated-parser/sequenceParser";

// Class identity, not `constructor.name`: a minified bundle renames classes.
const BlockContext = sequenceParser.BlockContext;
const StatContext = sequenceParser.StatContext;

type Node = {
  children?: Node[] | null;
  [member: string]: any;
};

function isDanglingStat(stat: Node): boolean {
  const async = stat.asyncMessage?.();
  if (async) {
    // `A->` and `A -` (the second alternative of asyncMessage with no `to`).
    const to = async.to?.();
    if (!to) return true;
    // `A->""` and `A->"":` name no target and carry no label: the same
    // dangling arrow. `A->"": x` has a label, so it stays a message.
    const emptyName = !(
      to.name?.()?.getFormattedText() || to.getFormattedText()
    );
    return emptyName && !async.content?.()?.getFormattedText();
  }

  const ret = stat.ret?.();
  if (ret) {
    // A bare `@return`: the parser recovers with an empty asyncMessage. A
    // `@return A->` keeps its `from`, which `@return A->B.m` relies on.
    const inner = ret.asyncMessage?.();
    return (
      !!ret.ANNOTATION_RET?.() && !!inner && !inner.from?.() && !inner.to?.()
    );
  }

  const message = stat.message?.();
  if (message) {
    // `r =` with no call after it.
    const body = message.messageBody?.();
    return (
      !!body?.assignment?.() &&
      !body.fromTo?.() &&
      !body.func?.() &&
      !message.braceBlock?.()
    );
  }

  return false;
}

export function pruneDanglingStatements(root: Node): void {
  const visit = (node: Node): void => {
    const children = node.children;
    if (!children) return;
    if (node instanceof BlockContext) {
      let changed = false;
      const kept: Node[] = [];
      for (const child of children) {
        if (!(child instanceof StatContext) || !isDanglingStat(child)) {
          kept.push(child);
          continue;
        }
        changed = true;
        // `A->` still names a participant: keep its `from` node in the block
        // (not as a statement) so participant collection sees it, and draw
        // no message.
        const from = child.asyncMessage?.()?.from?.();
        if (from) {
          (from as Node).parentCtx = node;
          kept.push(from);
        }
      }
      if (changed) (node as Node).children = kept;
    }
    for (const child of (node as Node).children!) {
      if (child.children) visit(child);
    }
  };
  visit(root);
}
