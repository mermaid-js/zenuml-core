// src/parser/adapters/MemoizedAdapter.ts
import { SequenceASTNode } from "../types/astNode.types";
import { AdapterCache } from "./AdapterCache";

/**
 * Base adapter class with memoized property getters
 */
export abstract class MemoizedAdapter implements SequenceASTNode {
  private cache = AdapterCache.getInstance();
  protected abstract context: any;

  // Memoized getters
  get type(): string {
    return this.cache.getCachedProperty(this, "type", () => this.getType());
  }

  get range(): [number, number] {
    return this.cache.getCachedProperty(this, "range", () => this.getRange());
  }

  get text(): string {
    return this.cache.getCachedProperty(this, "text", () => this.getText());
  }

  get children(): SequenceASTNode[] {
    return this.cache.getCachedProperty(this, "children", () =>
      this.getChildren(),
    );
  }

  get parent(): SequenceASTNode | undefined {
    return this.cache.getCachedProperty(this, "parent", () => {
      const p = this.getParent();
      return p === null ? undefined : p;
    });
  }

  // Abstract methods that subclasses must implement
  abstract getType(): string;
  abstract getRange(): [number, number];
  abstract getText(): string;
  abstract getChildren(): SequenceASTNode[];
  abstract getParent(): SequenceASTNode | null;
  abstract getFormattedText(): string;
  abstract getComment(): string;

  // Type checking methods (also memoized)
  isProgram(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isProgram",
      () => this.type === "ProgramContext",
    );
  }

  isParticipant(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isParticipant",
      () => this.type === "ParticipantContext",
    );
  }

  isMessage(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isMessage",
      () => this.type === "MessageContext",
    );
  }

  isCreation(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isCreation",
      () => this.type === "CreationContext",
    );
  }

  isAsyncMessage(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isAsyncMessage",
      () => this.type === "AsyncMessageContext",
    );
  }

  isReturn(): boolean {
    return this.cache.getCachedProperty(
      this,
      "isReturn",
      () => this.type === "ReturnContext",
    );
  }

  isFragment(): boolean {
    return this.cache.getCachedProperty(this, "isFragment", () => {
      const fragmentTypes = [
        "AltContext",
        "OptContext",
        "LoopContext",
        "ParContext",
        "CriticalContext",
        "SectionContext",
        "TcfContext",
        "RefContext",
      ];
      return fragmentTypes.includes(this.type);
    });
  }

  // Helper method for finding ancestors
  findAncestor(
    predicate: (node: SequenceASTNode) => boolean,
  ): SequenceASTNode | null {
    let current = this.parent;
    while (current) {
      if (predicate(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}
