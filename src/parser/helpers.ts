import { CodeRange } from "./CodeRange";
import sequenceParser from "@/generated-parser/sequenceParser";

// Safely get CodeRange from any parser context
export function codeRangeOf(ctx: any): CodeRange | null {
  try {
    if (!ctx || !ctx.start || !ctx.stop) return null;
    return CodeRange.from(ctx);
  } catch {
    return null;
  }
}

// Wrap getComment prototype method if available
export function commentOf(ctx: any): string | undefined {
  try {
    return typeof ctx?.getComment === "function" ? ctx.getComment() : undefined;
  } catch {
    return undefined;
  }
}

// Wrap SignatureText prototype method if available
export function signatureOf(ctx: any): string {
  try {
    if (typeof ctx?.SignatureText === "function") return ctx.SignatureText();
    if (typeof ctx?.getFormattedText === "function") return ctx.getFormattedText();
  } catch {
    // ignore
  }
  return "";
}

// Return label position in absolute character offsets [start, end]
// Keeps compatibility with current MessageLabel editing logic.
export function labelRangeOfMessage(
  context: any,
  kind: "sync" | "async" | "creation" | "return" | string,
): [number, number] {
  let start = -1;
  let stop = -1;

  try {
    switch (kind) {
      case "sync": {
        // signature()[0] is the first segment of dotted signature
        const signature = context?.messageBody?.()?.func?.()?.signature?.()?.[0];
        start = signature?.start?.start ?? -1;
        stop = signature?.stop?.stop ?? -1;
        break;
      }
      case "async": {
        const content = context?.content?.();
        start = content?.start?.start ?? -1;
        stop = content?.stop?.stop ?? -1;
        break;
      }
      case "creation": {
        const params = context?.creationBody?.()?.parameters?.();
        start = params?.start?.start ?? -1;
        stop = params?.stop?.stop ?? -1;
        break;
      }
      case "return": {
        // Mirror the component logic that handles multiple context variants
        if (context instanceof (sequenceParser as any).MessageContext) {
          const sig = context.messageBody?.()?.func?.()?.signature?.()?.[0];
          start = sig?.start?.start ?? -1;
          stop = sig?.stop?.stop ?? -1;
        } else if (context instanceof (sequenceParser as any).AtomExprContext) {
          const ret = context?.atom?.();
          start = ret?.start?.start ?? -1;
          stop = ret?.stop?.stop ?? -1;
        } else if (context instanceof (sequenceParser as any).ContentContext) {
          start = context?.start?.start ?? -1;
          stop = context?.stop?.stop ?? -1;
        } else if (context instanceof (sequenceParser as any).AssignmentContext) {
          const assignee = context?.assignee?.();
          start = assignee?.start?.start ?? -1;
          stop = assignee?.stop?.stop ?? -1;
        }
        break;
      }
      default:
        break;
    }
  } catch {
    // fall through with -1, -1
  }

  return [start, stop];
}

export default {
  codeRangeOf,
  labelRangeOfMessage,
  commentOf,
  signatureOf,
};

