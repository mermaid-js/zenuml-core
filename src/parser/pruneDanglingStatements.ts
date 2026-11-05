// The grammar accepts a few half-typed forms on purpose, so the editor keeps a
// parse tree while the user types: `A->`, `r =` and `@return`. They have no
// target, no call and no message, so nothing should be drawn for them.
// Removing them from the tree keeps the HTML and SVG renderers, numbering and
// participant collection in step. The tokens stay in the token stream, so
// source ranges and comments are not affected.

type Node = {
  children?: Node[] | null;
  constructor: { name: string };
  [member: string]: any;
};

function isDanglingStat(stat: Node): boolean {
  const async = stat.asyncMessage?.();
  if (async) {
    // `A->` and `A -` (the second alternative of asyncMessage with no `to`).
    return !async.to?.();
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
  const visit = (node: Node) => {
    const children = node.children;
    if (!children) return;
    if (node.constructor.name === "BlockContext") {
      const kept = children.filter(
        (child) =>
          child.constructor.name !== "StatContext" || !isDanglingStat(child),
      );
      if (kept.length !== children.length) node.children = kept;
    }
    for (const child of node.children!) {
      if (child.children) visit(child);
    }
  };
  visit(root);
}
