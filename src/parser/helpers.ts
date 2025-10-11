import { CodeRange } from "./CodeRange";
import sequenceParser from "@/generated-parser/sequenceParser";
import { Participants } from "@/parser";

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

// Safe wrapper around ParserRuleContext#getFormattedText
export function formattedTextOf(ctx: any): string {
  try {
    return typeof ctx?.getFormattedText === "function"
      ? ctx.getFormattedText()
      : "";
  } catch {
    return "";
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

// Generic offset range for a parser context: [startInclusive, endExclusive]
export function offsetRangeOf(ctx: any): [number, number] | null {
  try {
    const s = ctx?.start;
    const e = ctx?.stop;
    if (!s || !e) return null;
    const start = s.start;
    const stop = e.stop;
    if (typeof start !== "number" || typeof stop !== "number") return null;
    return [start, stop + 1];
  } catch {
    return null;
  }
}

// Safe label range for ref(...) fragment title (first name inside the ref)
// Returns [-1, -1] when name is missing or synthesized by error recovery
export function labelRangeOfRef(context: any): [number, number] | null {
  try {
    // Try to resolve the first name context under the ref
    let nameCtx: any = null;
    if (typeof context?.Content === "function") {
      // Likely a RefContext
      nameCtx = context.Content();
    }
    // Do not try to auto-detect other shapes here; helper is strict
    if (!nameCtx && Array.isArray(context?.name?.())) {
      nameCtx = context.name()[0];
    }
    if (!nameCtx) return null;
    const s = nameCtx.start;
    const e = nameCtx.stop;
    if (!s || !e) return null;
    // Ensure the token type corresponds to a valid Name (ID/CSTRING/USTRING)
    const validNameTypes = [
      (sequenceParser as any).ID,
      (sequenceParser as any).CSTRING,
      (sequenceParser as any).USTRING,
    ];
    if (typeof s.type === "number" && !validNameTypes.includes(s.type)) return null;
    // Guard synthesized tokens from error recovery
    if (typeof s.tokenIndex === "number" && s.tokenIndex < 0) return null;
    if (typeof e.tokenIndex === "number" && e.tokenIndex < 0) return null;
    const start = s.start ?? -1;
    const stop = e.stop ?? -1;
    if (start == null || stop == null) return null;
    return [start, stop];
  } catch {
    return null;
  }
}

// Label range for a fragment/par expression condition (e.g., [ x == y ])
// Accepts contexts that have start/stop or a parent with parExpr().condition().
export function labelRangeOfCondition(context: any): [number, number] | null {
  try {
    // Prefer parExpr().condition() if available (if/else, section, critical)
    let cond: any = null;
    if (typeof context?.parExpr === "function") {
      const pe = context.parExpr();
      cond = typeof pe?.condition === "function" ? pe.condition() : null;
    }
    // If the argument itself is a ParExprContext or ConditionContext
    if (!cond && typeof context?.condition === "function") {
      cond = context.condition();
    }
    if (!cond && context?.start && context?.stop) {
      // Assume the provided context is already the condition (e.g., ConditionContext)
      cond = context;
    }
    const s = cond?.start;
    const e = cond?.stop;
    if (!s || !e) return null;
    // Guard synthesized tokens
    if (typeof s.tokenIndex === "number" && s.tokenIndex < 0) return null;
    if (typeof e.tokenIndex === "number" && e.tokenIndex < 0) return null;
    const start = s.start ?? -1;
    const stop = e.stop ?? -1;
    if (start == null || stop == null) return null;
    return [start, stop];
  } catch {
    return null;
  }
}

export default {
  labelRangeOfMessage,
  labelRangeOfRef,
  labelRangeOfCondition,
};

// Group utilities
// Returns the declared participant names within a group context using parser utilities.
// Kept here to avoid parser coupling in UI components.
export function participantNamesInGroup(ctx: any): string[] {
  try {
    const names = Participants(ctx)?.Names?.();
    return Array.isArray(names) ? names : [];
  } catch {
    return [];
  }
}

// Type guards for parser contexts (kept here to avoid direct parser imports in components)
export function isGroupContext(node: any): boolean {
  return node instanceof (sequenceParser as any).GroupContext;
}

export function isParticipantContext(node: any): boolean {
  return node instanceof (sequenceParser as any).ParticipantContext;
}

export function participantNameOf(ctx: any): string | undefined {
  try {
    return ctx?.name?.()?.getFormattedText?.();
  } catch {
    return undefined;
  }
}
