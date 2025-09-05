import { ASTNodeType, SequenceASTNode } from '@/parser/types/astNode.types';

interface ICollector<R> {
  visitNode(node: SequenceASTNode): void
  traverseNode?(node: SequenceASTNode): void
  postVisitNode?(node: SequenceASTNode): void
  reset(): void;
  result(): R;
}

export abstract class BaseCollector<R> implements ICollector<R> {
  protected shouldSkip = false;
  protected nodeHandlers = new Map<ASTNodeType, (node: SequenceASTNode) => void>();

  constructor() {
    this.registerNodeHandlers();
  }


  visitNode(node: SequenceASTNode): void {
    if (this.shouldStartSkip(node)) {
      this.shouldSkip = true
    }

    const handler = this.nodeHandlers.get(node.getType() as ASTNodeType);
    if (handler) {
      handler(node);
    } else {
      throw new Error(`Unable to handle ${node.getType()}`);
    }

    if (this.shouldStartSkip(node)) {
      this.shouldSkip = true
    }
  }

  protected registerNodeHandler(nodeType: ASTNodeType, handler: (node: SequenceASTNode) => void): void {
    this.nodeHandlers.set(nodeType, handler);
  }

  postVisitNode(node: SequenceASTNode): void  {
    if(this.shouldEndSkip(node)) {
      this.shouldSkip = false
    }
  }

  protected abstract registerNodeHandlers(): void;

  protected shouldStartSkip(_: SequenceASTNode): boolean {
    return false
  }

  protected shouldEndSkip(_: SequenceASTNode): boolean {
    return false
  }

  abstract traverseNode?(node: SequenceASTNode): void

  abstract reset(): void;

  abstract result(): R
}
